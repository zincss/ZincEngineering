'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Session, AuthChangeEvent, AuthError, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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
  // [CRITICAL FIX 1] Initialize client once to prevent re-renders triggering infinite loops
  const [supabase] = useState(() => createClient());
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
        const { data, error } = await supabase
        .from('profiles')
        .select('username, credits, role, created_at') 
        .eq('id', userId)
        .single();
        
        if (data) {
            setProfile(data as Profile);
        } else if (error) {
            console.warn("Profile sync warning:", error.message);
        }
    } catch (error) {
        console.error("Profile fetch error:", error);
    } finally {
        isFetchingRef.current = false;
    }
  }, [supabase]);

  // --- 1. AUTH STATE LISTENER ---
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
        try {
            // [CRITICAL FIX 2] Use getSession first for speed/persistence
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                 if (mounted) {
                   setUser(session.user);
                   await fetchProfile(session.user.id);
                 }
                 
                 // [TS ERROR FIX] Explicitly type the response here
                 supabase.auth.getUser().then(({ data, error }: { data: { user: User | null }; error: AuthError | null }) => {
                    if (error || !data.user) {
                        console.warn("Token invalid, session might be stale");
                        // Optional: Force logout if strictly required
                        // if (mounted) setUser(null); 
                    }
                 });
            }
        } catch (e) {
            console.error("Session check failed", e);
        } finally {
            if (mounted) setLoading(false);
        }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
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
            (payload: RealtimePostgresChangesPayload<Profile>) => { 
                if (payload.new) {
                    setProfile(payload.new as Profile); 
                }
            }
        )
        .subscribe();

    const handleReconnection = () => {
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