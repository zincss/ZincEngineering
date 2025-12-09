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
  
  // Ref to track user state without triggering effect re-runs
  const userRef = useRef<User | null>(null);
  // Track profile fetch to prevent loops
  const lastFetchedUserId = useRef<string | null>(null);

  // Keep the ref synced with state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

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
            const { data: { session } } = await supabase.auth.getSession();
            
            if (mounted) {
                if (session?.user) {
                    setUser(session.user);
                    // Fetch profile if we haven't already for this user
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
          if (typeof window !== 'undefined') {
             sessionStorage.clear();
             // Optional: Clear only supabase keys if needed, but signOut() usually handles this
             // localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}-auth-token`);
          }
          return;
      }

      // Handle token refreshes or new sign-ins
      if (currentUser) {
          setUser(currentUser);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || lastFetchedUserId.current !== currentUser.id) {
              await fetchProfile(currentUser.id);
          }
      } else if (event === 'TOKEN_REFRESHED' && !currentUser) {
          setUser(null);
          setProfile(null);
      }
      
      setLoading(false);
    });

    // 3. Visibility Change Handler
    const handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible') {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                setUser(null);
                setProfile(null);
            } else if (session.user.id !== userRef.current?.id) {
                // Use userRef.current here to avoid stale closure issues
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
  }, []); // DEPENDENCY ARRAY IS NOW EMPTY

  const refreshProfile = () => {
    if (user) fetchProfile(user.id);
  };

  const signIn = () => {
    window.location.href = '/login'; 
  };

  const signOut = async () => {
    try {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Sign out error:", error);
    } catch (err) {
        console.error("Unexpected error during sign out:", err);
    } finally {
        setUser(null);
        setProfile(null);
        lastFetchedUserId.current = null;
        
        if (typeof window !== 'undefined') {
            sessionStorage.clear();
            // REMOVED: localStorage.clear(); -> This was too aggressive
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