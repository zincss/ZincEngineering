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

  // --- CORE FETCH LOGIC (WITH RETRY) ---
  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    // Allow retries even if 'isFetching' was true previously
    if (isFetchingRef.current && retryCount === 0) return;
    isFetchingRef.current = true;

    try {
        // 1. Force a session refresh to ensure the cookie is read
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
           throw new Error("No active session");
        }

        // 2. Fetch Profile
        const { data, error } = await supabase
        .from('profiles')
        .select('username, credits, role, created_at') 
        .eq('id', userId)
        .single();
        
        if (error) {
            console.warn(`Profile sync failed (Attempt ${retryCount + 1}):`, error.message);

            // --- RETRY LOGIC ---
            // If it failed, it might be the race condition. Wait 1s and try ONCE more.
            if (retryCount < 2) {
                console.log("Retrying profile fetch...");
                setTimeout(() => {
                    isFetchingRef.current = false; 
                    fetchProfile(userId, retryCount + 1);
                }, 1000 * (retryCount + 1)); // Backoff: 1s, then 2s
                return;
            }
        }

        if (data) {
            setProfile(data as Profile);
        }
    } catch (error) {
        console.error("Critical Sync Error:", error);
    } finally {
        if (retryCount === 0) isFetchingRef.current = false;
    }
  }, [supabase]);

  // --- 1. AUTH STATE LISTENER ---
  useEffect(() => {
    let mounted = true;

    // Check immediately on mount
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

      if (event === 'SIGNED_OUT' || !currentUser) {
          setUser(null);
          setProfile(null);
          setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          setUser(currentUser);
          await fetchProfile(currentUser.id);
          setLoading(false);
      }
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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}`},
            (payload) => { if (payload.new) setProfile(payload.new as Profile); }
        )
        .subscribe();

    const handleReconnection = () => {
        // When tab focuses, wait 500ms for the middleware to do its job, then fetch
        setTimeout(() => {
             if (user) fetchProfile(user.id);
        }, 500);
    };
    
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

  const signIn = () => { window.location.href = '/login'; };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin: profile?.role === 'admin', signIn, signOut, refreshProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);