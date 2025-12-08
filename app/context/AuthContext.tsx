'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

type Profile = {
  username: string;
  credits: number;
  role: 'user' | 'admin';
  created_at: string; // <--- ADDED THIS
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

  const fetchProfile = async (userId: string) => {
    try {
        const { data } = await supabase
        .from('profiles')
        // ADDED 'created_at' to the select string below
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
    // 1. Check active session on load
    const initSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
            await fetchProfile(session.user.id);
        }
        
        setLoading(false);
    };

    initSession();

    // 2. Listen for changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.id !== user?.id) {
          setLoading(true);
      }

      setUser(session?.user ?? null);
      
      if (session?.user) {
          await fetchProfile(session.user.id);
      } else {
          setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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