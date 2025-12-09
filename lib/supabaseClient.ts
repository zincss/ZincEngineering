import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase Keys are missing! Check your .env.local file.");
}

// Configured to use defaults (localStorage) which is much more stable on mobile
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // REMOVED: storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});