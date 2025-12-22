'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Session, AuthChangeEvent, AuthError, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ... (Keep your Profile and AuthContextType definitions the same) ...
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

// [UPDATE] Add initialUser prop here
export const AuthProvider = ({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode; 
  initialUser: User | null;
}) => {
  const [supabase] = useState(() => createClient());
  
  // [UPDATE] Initialize state with the user passed from the server
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
        .select('username, credits, role, created_at') 
        .eq('id', userId)
        .single();
        
        if (data) {
            setProfile(data as Profile);
        }
    } catch (error) {
        console.error("Profile fetch error:", error);
    } finally {
        isFetchingRef.current = false;
    }
  }, [supabase]);

  // [UPDATE] Immediate profile fetch if initialUser exists
  useEffect(() => {
    if (initialUser) {
      fetchProfile(initialUser.id);
    }
  }, [initialUser, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                 if (mounted) {
                   // Only update if different to prevent re-renders
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

  // ... (Keep real-time sync, signIn, signOut, return logic exactly the same) ...
  // Re-paste the rest of your logic here (Realtime sync, signIn, signOut)
  
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