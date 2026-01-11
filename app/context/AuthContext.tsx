'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Session, AuthChangeEvent, AuthError, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Profile = {
  username: string;
  credits: number;
  role: 'user' | 'admin' | 'owner';
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

export const AuthProvider = ({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode; 
  initialUser: User | null;
}) => {
  const [supabase] = useState(() => createClient());
  
  // Initialize state with the server value
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!initialUser);
  
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
        const { data, error } = await supabase
        .from('profiles')
        .select('username, credits, role, created_at, weekly_digest_opt_in') 
        .eq('id', userId)
        .single();
        
        if (data) {
            setProfile(data as Profile);
        } else if (error) {
            console.error("Profile fetch error:", error);
        }
    } catch (error) {
        console.error("Unexpected profile fetch error:", error);
    } finally {
        isFetchingRef.current = false;
    }
  }, [supabase]);

  // [FIX] Sync local state with Server Prop
  // This ensures that when the server redirects and passes a new user, 
  // the client updates immediately without needing a refresh.
  useEffect(() => {
    setUser(initialUser);
    
    if (initialUser) {
      fetchProfile(initialUser.id);
    } else {
      setProfile(null);
    }
    
    // Stop loading once we have a definitive state from the server
    setLoading(false);
  }, [initialUser, fetchProfile]);

  // Initial client-side session check (fallback)
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                 if (mounted) {
                   if (session.user.id !== user?.id) {
                     setUser(session.user);
                     await fetchProfile(session.user.id);
                   }
                 }
            }
        } catch (e) {
            console.error("Session check failed", e);
        } finally {
            if (mounted) setLoading(false);
        }
    };
    
    // Only run this check if we didn't get a user from the server
    if (!initialUser) {
      checkSession();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;

      if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(currentUser);
          if (currentUser) await fetchProfile(currentUser.id);
          setLoading(false);
      }
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, initialUser, user?.id]);

  // --- MULTI-DEVICE REALTIME SYNC ---
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
    <AuthContext.Provider value={{ user, profile, isAdmin: profile?.role === 'admin' || profile?.role === 'owner', signIn, signOut, refreshProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);