'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

type Profile = {
  username: string;
  credits: number;
  role: 'user' | 'admin';
  created_at: string;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  signIn: () => void;
  signOut: () => void;
  refreshProfile: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track if we have already fetched the profile for a specific user to prevent loops
  const lastFetchedUserId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
        .from('profiles')
        .select('username, credits, role, created_at') 
        .eq('id', userId)
        .single();
        
        if (error) {
            console.warn("Profile fetch warning:", error.message);
            return;
        }

        if (data) {
            setProfile(data as Profile);
            lastFetchedUserId.current = userId;
        }
    } catch (error) {
        console.error("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Check active session immediately
    const initializeAuth = async () => {
        try {
            // Also helps clear any lingering localStorage confusion if migrating
            if (typeof window !== 'undefined') {
                // Optional: Force clear localStorage if you want to ensure no old keys remain
                // localStorage.removeItem('sb-<your-project-ref>-auth-token'); 
            }

            const { data: { session } } = await supabase.auth.getSession();
            
            if (mounted) {
                if (session?.user) {
                    setUser(session.user);
                    if (lastFetchedUserId.current !== session.user.id) {
                         await fetchProfile(session.user.id);
                    }
                } else {
                    setUser(null);
                    setProfile(null);
                }
            }
        } catch (err) {
            console.error("Auth init error:", err);
        } finally {
            if (mounted) setLoading(false);
        }
    };

    initializeAuth();

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          lastFetchedUserId.current = null;
          setLoading(false);
          // Clear any client-side caches if necessary
          if (typeof window !== 'undefined') sessionStorage.clear();
          return;
      }

      // Handle token refreshes or new sign-ins
      if (currentUser) {
          setUser(currentUser);
          
          // Re-fetch profile on sign-in or if we detect a change/staleness
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || lastFetchedUserId.current !== currentUser.id) {
              await fetchProfile(currentUser.id);
          }
      } else if (event === 'TOKEN_REFRESHED' && !currentUser) {
          // If refresh failed or returned null, ensure we log out
          setUser(null);
          setProfile(null);
      }
      
      setLoading(false);
    });

    // 3. Re-validate session when user returns to the tab (fixes "after awhile" issues)
    const handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible') {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                // Session died while in background
                setUser(null);
                setProfile(null);
            } else if (session.user.id !== user?.id) {
                // User changed? unlikely but possible in multi-tab
                setUser(session.user);
                fetchProfile(session.user.id);
            }
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        mounted = false;
        subscription.unsubscribe();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]); // Re-bind visibility check if user changes to ensure closures are fresh

  const refreshProfile = () => {
    if (user) fetchProfile(user.id);
  };

  const signIn = () => {
    window.location.href = '/login'; 
  };

  const signOut = async () => {
    try {
        setLoading(true);
        // Attempt to sign out from Supabase
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Sign out error:", error);
    } catch (err) {
        console.error("Unexpected error during sign out:", err);
    } finally {
        // ALWAYS clear state and redirect, even if Supabase errors
        setUser(null);
        setProfile(null);
        lastFetchedUserId.current = null;
        
        // Aggressive cleanup for security
        if (typeof window !== 'undefined') {
            sessionStorage.clear();
            localStorage.clear(); 
        }
        
        setLoading(false);
        window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isAdmin: profile?.role === 'admin', 
      signIn, 
      signOut, 
      refreshProfile, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);