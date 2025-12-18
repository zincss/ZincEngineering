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
  refreshProfile: () => Promise<void>; // CHANGED: Now returns a Promise
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
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
             if (lastFetchedUserId.current !== currentUser.id) {
                await fetchProfile(currentUser.id);
             }
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
  }, []);

  // CHANGED: Now async
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