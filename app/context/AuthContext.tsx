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
            // Don't nullify profile on temporary network errors if we already have one
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
                    // Only fetch if we haven't already for this user
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
      // 'INITIAL_SESSION' is often redundant if we manually checked getSession, 
      // but 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED' are critical.
      
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          lastFetchedUserId.current = null;
          setLoading(false);
          return;
      }

      // If session exists and it's a new user or token refresh
      if (currentUser) {
          setUser(currentUser);
          
          // Refresh profile on sign-in or if we haven't fetched it yet
          if (event === 'SIGNED_IN' || lastFetchedUserId.current !== currentUser.id) {
              await fetchProfile(currentUser.id);
          }
      }
      
      setLoading(false);
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = () => {
    if (user) fetchProfile(user.id);
  };

  const signIn = () => {
    // Ideally use router.push instead of window.location for SPA feel
    window.location.href = '/login'; 
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    lastFetchedUserId.current = null;
    setLoading(false);
    window.location.href = '/';
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