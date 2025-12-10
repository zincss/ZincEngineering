'use server';

import { createClient } from '@/utils/supabase/server'; // Adjust based on your actual server client path
import { cookies } from 'next/headers';

export async function processHotseatTransaction(amount: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Use the existing RPC function we saw in your poker code
  const { data, error } = await supabase.rpc('add_credits', { 
    amount: amount 
  });

  if (error) {
    console.error('Transaction failed:', error);
    return { error: error.message };
  }

  return { success: true, newBalance: data };
}