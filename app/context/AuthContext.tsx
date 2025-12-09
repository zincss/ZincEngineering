'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client'; // CHANGED: Import from utils (SSR/Cookie compatible)
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
  // Instantiate the client inside the component
  const supabase = createClient();
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track profile fetch to prevent loops
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
            // Don't return here, allow the app to run with just user auth if profile fails
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

    const initializeAuth = async () => {
      try {
        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            // Only fetch profile if strictly necessary
            if (lastFetchedUserId.current !== session.user.id) {
               await fetchProfile(session.user.id);
            }
          } else {
            // No session found
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

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log(`Auth event: ${event}`); // Debugging help

      if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          lastFetchedUserId.current = null;
          setLoading(false);
          return;
      }

      const currentUser = session?.user ?? null;
      
      if (currentUser) {
          setUser(currentUser);
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
             // Only fetch profile on explicit sign-in or distinct user change
             if (lastFetchedUserId.current !== currentUser.id) {
                await fetchProfile(currentUser.id);
             }
          }
      } else {
          // Fallback if session is missing but event wasn't SIGNED_OUT
          setUser(null);
          setProfile(null);
      }
      
      setLoading(false);
    });

    // REMOVED: The manual 'visibilitychange' listener. 
    // Supabase SDK handles auto-refresh and recovery internally. 
    // Manually checking often triggers false logouts on mobile.

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = () => {
    if (user) fetchProfile(user.id);
  };

  const signIn = () => {
    // Ideally use router.push, but window.location is safer for full reset if needed
    window.location.href = '/login'; 
  };

  const signOut = async () => {
    try {
        setLoading(true);
        await supabase.auth.signOut();
    } catch (err) {
        console.error("Error during sign out:", err);
    } finally {
        // Clear state immediately to give UI feedback
        setUser(null);
        setProfile(null);
        lastFetchedUserId.current = null;
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