'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
  
  // Use a ref to prevent "flash" fetching if data is already fresh
  const isFetchingRef = useRef(false);

  // --- CORE FETCH LOGIC ---
  const fetchProfile = useCallback(async (userId: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
        const { data, error } = await supabase
        .from('profiles')
        .select('username, credits, role, created_at') 
        .eq('id', userId)
        .single();
        
        if (error) {
            console.warn("Sync warning:", error.message);
            // If fetch fails (e.g. 406 Not Acceptable), it often means auth token is stale.
            // We do NOT log out here to avoid loops, but we leave profile null to trigger retry.
        }

        if (data) {
            setProfile(data as Profile);
        }
    } catch (error) {
        console.error("Critical Sync Error:", error);
    } finally {
        isFetchingRef.current = false;
    }
  }, [supabase]);

  // --- 1. AUTH STATE LISTENER ---
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;

      // IMMEDIATE RESET ON SIGNOUT
      if (event === 'SIGNED_OUT' || !currentUser) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
      }
      
      // USER DETECTED
      if (currentUser) {
          setUser(currentUser);
          // Only fetch if we don't have a profile OR the user ID changed
          if (!profile || profile.username === undefined) {
             await fetchProfile(currentUser.id);
          }
      }
      
      setLoading(false);
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, profile]);

  // --- 2. MULTI-DEVICE REALTIME SYNC (The "Ghost" Killer) ---
  useEffect(() => {
    if (!user) return;

    // A. Realtime Database Subscription
    // This listens for ANY change to your profile (credits spent on phone, etc.)
    // and updates this browser instantly.
    const channel = supabase
        .channel(`profile-sync-${user.id}`)
        .on(
            'postgres_changes',
            {
                event: '*', // Listen to INSERT, UPDATE, and DELETE
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`,
            },
            (payload) => {
                // Instantly update state with new data from DB
                if (payload.new) {
                    setProfile(payload.new as Profile);
                }
            }
        )
        .subscribe();

    // B. Window Focus / Network Recovery Logic
    // If you switch tabs or come back from sleep mode, force a soft refresh.
    const handleReconnection = () => fetchProfile(user.id);
    
    window.addEventListener('focus', handleReconnection);
    window.addEventListener('online', handleReconnection);

    return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('focus', handleReconnection);
        window.removeEventListener('online', handleReconnection);
    };
  }, [user, supabase, fetchProfile]);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const signIn = () => {
    // Redirect to login
    window.location.href = '/login'; 
  };

  const signOut = async () => {
    try {
        setLoading(true);
        await supabase.auth.signOut();
    } catch (err) {
        console.error("SignOut Error:", err);
    } finally {
        // AGGRESSIVE CLEANUP: Remove local storage items to prevent
        // "stuck" sessions between multiple Google accounts/browsers.
        if (typeof window !== 'undefined') {
            localStorage.clear(); // Safest bet for "ghost" issues
        }
        setUser(null);
        setProfile(null);
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