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

import { sendUserDigest } from '@/scripts/send-weekly-digest';

// 3. System Purge (Cache Clear)
export async function clearSystemCache() {
    const { authorized, error } = await verifyAdmin();
    if (!authorized) return { error };

    revalidatePath('/', 'layout'); // Hard revalidate everything
    return { success: true };
}

// 4. Send Test Digest
export async function sendTestDigest() {
    const { authorized, error, supabase } = await verifyAdmin();
    if (!authorized || !supabase) return { error };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Session lost' };

    const result = await sendUserDigest(user.id);
    return result;
}

// 5. System Updates (Broadcast Message)
export async function getSystemMessage() {
    const { authorized, error, supabase } = await verifyAdmin();
    if (!authorized || !supabase) return { error };

    const { data, error: dbError } = await supabase
        .from('system_updates')
        .select('*')
        .limit(1)
        .single();
    
    if (dbError && dbError.code !== 'PGRST116') return { error: dbError.message }; // PGRST116 is 'Row not found' which is fine, we return null

    return { data };
}

export async function updateSystemMessage(message: string, link: string) {
    const { authorized, error, supabase } = await verifyAdmin();
    if (!authorized || !supabase) return { error };

    // We assume a single row architecture for simplicity.
    // First, check if one exists.
    const { data: existing, error: fetchError } = await supabase.from('system_updates').select('id').limit(1).maybeSingle();

    if (fetchError) {
        console.error("Error fetching system update:", fetchError);
        return { error: fetchError.message };
    }

    let result;
    if (existing) {
        console.log("Updating existing message ID:", existing.id);
        result = await supabase
            .from('system_updates')
            .update({ 
                message, 
                link, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', existing.id);
    } else {
        console.log("Inserting new system message");
        result = await supabase
            .from('system_updates')
            .insert({ 
                message, 
                link, 
                active: true 
            });
    }

    if (result.error) {
        console.error("Database update error:", result.error);
        return { error: result.error.message };
    }

    console.log("System message updated successfully");
    revalidatePath('/', 'layout'); // Update home page
    revalidatePath('/admin');
    return { success: true };
}
