'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';

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
  
  // Use a ref to track if we are currently syncing to avoid race conditions
  const isFetchingRef = useRef(false);

  // --- CORE FETCH LOGIC (With Retry) ---
  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    if (isFetchingRef.current && retryCount === 0) return; // Only block initial calls, allow retries
    isFetchingRef.current = true;

    try {
        // 1. Force a session check before fetching data
        // This ensures the client library refreshes the token if needed
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
           // If we can't get a session, we are definitely logged out.
           throw new Error("No active session");
        }

        // 2. Fetch Profile
        const { data, error } = await supabase
        .from('profiles')
        .select('username, credits, role, created_at') 
        .eq('id', userId)
        .single();
        
        if (error) {
            // RLS Policy Violation (PGRST116 = 0 rows, 406 = Not Acceptable)
            // This usually means the token is technically valid but lacks permissions 
            // OR the user genuinely has no profile.
            console.warn(`Profile sync failed (Attempt ${retryCount + 1}):`, error.message);

            // RETRY LOGIC: If we failed, wait 1s and try ONCE more.
            // This fixes the "Token Refreshed but Request fired too early" bug.
            if (retryCount < 1) {
                setTimeout(() => {
                    isFetchingRef.current = false; // Reset lock
                    fetchProfile(userId, retryCount + 1);
                }, 1000);
                return;
            }
        }

        if (data) {
            setProfile(data as Profile);
        }
    } catch (error) {
        console.error("Critical Sync Error:", error);
        // If we really can't get a session, clear state
        setUser(null);
        setProfile(null);
    } finally {
        if (retryCount === 0) isFetchingRef.current = false;
    }
  }, [supabase]);

  // --- 1. AUTH STATE LISTENER ---
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
             setUser(session.user);
             await fetchProfile(session.user.id);
        } else {
             setLoading(false);
        }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;

      // Handle events
      if (event === 'SIGNED_OUT' || !currentUser) {
          setUser(null);
          setProfile(null);
          setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          // If the token refreshed, we MUST refetch the profile to ensure we have data
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

    const handleReconnection = () => {
        // When tab focuses, fetch immediately
        if (user) fetchProfile(user.id);
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

  const signIn = () => {
    window.location.href = '/login'; 
  };

  const signOut = async () => {
    try {
        setLoading(true);
        await supabase.auth.signOut();
    } finally {
        // Clear everything
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