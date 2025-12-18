'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { calculateWinnings, Bet } from './utils';
import { revalidatePath } from 'next/cache';

export async function spinRoulette(bets: Bet[]) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // 1. Calculate Total Bet
  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);

  // 2. Fetch User Profile & Check Balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (!profile || profile.credits < totalBet) {
    return { error: 'Insufficient Funds' };
  }

  // 3. Generate Result (Server-side RNG)
  const result = Math.floor(Math.random() * 37); // 0-36

  // 4. Calculate Winnings
  const winnings = calculateWinnings(result, bets);
  const netChange = winnings - totalBet;

  // 5. Update Database
  // ideally use an rpc, but standard update works for this scale
  const newBalance = profile.credits + netChange;
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits: newBalance })
    .eq('id', user.id);

  if (updateError) return { error: 'Transaction Failed' };

  revalidatePath('/play/roulette');
  
  return { 
    success: true, 
    result, 
    winnings, 
    newBalance 
  };
}