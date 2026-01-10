'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to verify admin access
async function verifyAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, error: 'Unauthorized' };

  const { data: requester } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (requester?.role !== 'admin' && requester?.role !== 'owner') {
      return { authorized: false, error: 'Forbidden' };
  }
  return { authorized: true, supabase };
}

// Fetch all profiles (Admin only)
export async function getAdminData() {
  const { authorized, error, supabase } = await verifyAdmin();
  if (!authorized || !supabase) return { error };

  // Fetch all profiles
  const { data: profiles, error: dbError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (dbError) return { error: dbError.message };

  // Calculate System Stats
  const totalUsers = profiles.length;
  const totalEconomy = profiles.reduce((sum, p) => sum + (p.credits || 0), 0);
  const averageWealth = Math.floor(totalEconomy / totalUsers) || 0;

  return {
    profiles,
    stats: {
        totalUsers,
        totalEconomy,
        averageWealth
    }
  };
}

// Update User Credits
export async function updateUserCredits(userId: string, amount: number) {
  const { authorized, error, supabase } = await verifyAdmin();
  if (!authorized || !supabase) return { error };

  const { error: dbError } = await supabase
    .from('profiles')
    .update({ credits: amount })
    .eq('id', userId);

  if (dbError) return { error: dbError.message };
  
  revalidatePath('/admin');
  return { success: true };
}

// Update User Role
export async function updateUserRole(userId: string, role: string) {
    const { authorized, error, supabase } = await verifyAdmin();
    if (!authorized || !supabase) return { error };
  
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', userId);
  
    if (dbError) return { error: dbError.message };
    
    revalidatePath('/admin');
    return { success: true };
}

// --- SYSTEM OPERATIONS ---

// 1. Global Stimulus (Add funds to EVERYONE)
// Note: This might timeout on massive tables, ideally run as a background job or batch.
// For now, straightforward SQL update.
export async function distributeStimulus(amount: number) {
    const { authorized, error, supabase } = await verifyAdmin();
    if (!authorized || !supabase) return { error };

    // RPC call would be better, but we'll try a raw SQL query or iterating if RPC not available.
    // Since I can't create RPCs easily here, I'll use a direct update if possible, 
    // but supabase.from('profiles').update({ credits: credits + amount }) isn't standard JS.
    // We'll use a custom RPC or just manual loop for small userbases, 
    // OR assuming we can execute raw SQL which Supabase JS client doesn't expose directly to client.
    
    // SAFE FALLBACK: Fetch all, calculate, update. Slow but works for < 1000 users.
    const { data: profiles } = await supabase.from('profiles').select('id, credits');
    if (!profiles) return { error: 'No profiles found' };

    const updates = profiles.map(p => ({
        id: p.id,
        credits: (p.credits || 0) + amount
    }));

    const { error: upsertError } = await supabase.from('profiles').upsert(updates);
    
    if (upsertError) return { error: upsertError.message };

    revalidatePath('/admin');
    return { success: true, count: profiles.length };
}

// 2. Economy Reset (Set everyone to a fixed amount)
export async function resetEconomy(baseAmount: number = 1000) {
    const { authorized, error, supabase } = await verifyAdmin();
    if (!authorized || !supabase) return { error };

    const { error: dbError } = await supabase
        .from('profiles')
        .update({ credits: baseAmount })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Safety: update all rows that aren't system/null

    if (dbError) return { error: dbError.message };

    revalidatePath('/admin');
    return { success: true };
}

// 3. System Purge (Cache Clear)
export async function clearSystemCache() {
    const { authorized, error } = await verifyAdmin();
    if (!authorized) return { error };

    revalidatePath('/', 'layout'); // Hard revalidate everything
    return { success: true };
}
