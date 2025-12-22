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
            
            // --- GHOST KILLER LOGIC ---
            // If the database rejects us (406) or we have a JWT error, 
            // the session is likely desynced. We must logout to clear the "Ghost".
            if (error.code === 'PGRST301' || error.message.includes('JWT') || error.code === '406') {
                console.error("Stale session detected. Force signing out.");
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                if (typeof window !== 'undefined') localStorage.clear();
                return;
            }
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

    // Check active session immediately on mount
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
             setUser(session.user);
             await fetchProfile(session.user.id);
        }
        setLoading(false);
    };
    checkSession();

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
      
      // HANDLE REFRESH AND INITIAL LOGIN
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && currentUser)) {
          setUser(currentUser);
          // Always try to fetch profile if we have a user but no profile
          // OR if the token just refreshed (to ensure data is current)
          await fetchProfile(currentUser.id);
      }
      
      setLoading(false);
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // --- 2. MULTI-DEVICE REALTIME SYNC ---
  useEffect(() => {
    if (!user) return;

    const channel = supabase
        .channel(`profile-sync-${user.id}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`,
            },
            (payload) => {
                if (payload.new) {
                    setProfile(payload.new as Profile);
                }
            }
        )
        .subscribe();

    // Aggressive re-validation on focus
    const handleReconnection = async () => {
        // Force session refresh first
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            // If session is dead on reconnect, kill the ghost
            await signOut(); 
        } else {
            // Session valid, fetch data
            await fetchProfile(user.id);
        }
    };
    
    window.addEventListener('focus', handleReconnection);
    window.addEventListener('online', handleReconnection);

    return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('focus', handleReconnection);
        window.removeEventListener('online', handleReconnection);
    };
  }, [user, supabase, fetchProfile]); // Added signOut to dependencies if needed, or define logic inside

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
        console.error("SignOut Error:", err);
    } finally {
        if (typeof window !== 'undefined') {
            localStorage.clear();
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