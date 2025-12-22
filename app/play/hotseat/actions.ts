'use server';

import { createClient } from '@/utils/supabase/server';

export async function processHotseatTransaction(amount: number) {
  // [FIX] No arguments needed, createClient handles cookies internally
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase.rpc('add_credits', { 
    amount: amount 
  });

  if (error) {
    console.error('Transaction failed:', error);
    return { error: error.message };
  }

  return { success: true, newBalance: data };
}