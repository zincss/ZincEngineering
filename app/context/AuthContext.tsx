'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
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
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
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
            // Don't throw, allows retry on next pass
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;

      // Handle explicit Sign Out
      if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          lastFetchedUserId.current = null;
          setLoading(false);
          return;
      }
      
      if (currentUser) {
          setUser(currentUser);
          
          // CRITICAL FIX: Retry fetch if profile is null (Ghost Profile Fix)
          // This ensures that even if the first fetch failed, we try again.
          if (lastFetchedUserId.current !== currentUser.id || !profile) {
             await fetchProfile(currentUser.id);
          }
      } else {
          setUser(null);
          setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures we only attach the listener once

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const signIn = () => {
    window.location.href = '/login'; 
  };

  const signOut = async () => {
    try {
        setLoading(true);
        await supabase.auth.signOut();
    } catch (err) {
        console.error("Error during sign out:", err);
    } finally {
        // FORCE CLEAR: Manually wipe storage to prevent "infinite loop" logout issues
        if (typeof window !== 'undefined') {
            const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
            if (projectId) window.localStorage.removeItem(`sb-${projectId}-auth-token`);
            // Fallback: Clear all if ID is missing or unknown
            else window.localStorage.clear();
        }

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