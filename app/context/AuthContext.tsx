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
  
  // Use a ref to track the current user ID without closure staleness
  const mountedUser = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
        const { data } = await supabase
        .from('profiles')
        .select('username, credits, role, created_at') 
        .eq('id', userId)
        .single();
        
        if (data) {
            setProfile(data as Profile);
        }
    } catch (error) {
        console.error("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (mounted) {
                if (session?.user) {
                    setUser(session.user);
                    mountedUser.current = session.user.id;
                    await fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    mountedUser.current = null;
                }
            }
        } catch (error) {
            console.error("Session init error:", error);
        } finally {
            if (mounted) setLoading(false);
        }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only act on specific events to avoid unnecessary re-renders/fetches
      const currentUserId = session?.user?.id ?? null;

      // If the user ID hasn't changed, we don't need to do a full reload/fetch
      // This prevents "flicker" on token refreshes
      if (currentUserId === mountedUser.current) {
          if (event === 'TOKEN_REFRESHED' && session?.user) {
              setUser(session.user); // Update user object just in case, but don't toggle loading
          }
          return;
      }

      // If we are here, the user actually changed (Login or Logout)
      if (mounted) setLoading(true);
      
      setUser(session?.user ?? null);
      mountedUser.current = currentUserId;

      if (session?.user) {
          await fetchProfile(session.user.id);
      } else {
          setProfile(null);
      }
      
      if (mounted) setLoading(false);
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
    window.location.href = '/login';
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    mountedUser.current = null;
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