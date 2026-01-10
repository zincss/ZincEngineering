'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface WagerLeg {
  match_id: string;
  league: string;
  match_name: string;
  type: 'moneyline' | 'spread' | 'total';
  selection: string;
  odds: number;
}

export async function placeWager(amount: number, legs: WagerLeg[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // 1. Get user profile and credits
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) throw new Error('Could not find profile');
  if (profile.credits < amount) throw new Error('Insufficient credits');

  // 2. Calculate total odds
  const totalOdds = legs.reduce((acc, leg) => acc * leg.odds, 1);

  // 3. Create Wager
  const { data: wager, error: wagerError } = await supabase
    .from('sports_wagers')
    .insert({
      user_id: user.id,
      amount,
      odds: totalOdds,
      is_parlay: legs.length > 1,
      status: 'pending'
    })
    .select()
    .single();

  if (wagerError || !wager) throw new Error('Failed to create wager');

  // 4. Create Wager Legs
  const { error: legsError } = await supabase
    .from('wager_legs')
    .insert(
      legs.map(leg => ({
        wager_id: wager.id,
        ...leg
      }))
    );

  if (legsError) {
    // Ideally we should rollback here, but Supabase doesn't easily support transactions in client SDK without RPC
    console.error("Failed to create legs", legsError);
    // Attempt to delete the wager if legs fail
    await supabase.from('sports_wagers').delete().eq('id', wager.id);
    throw new Error('Failed to create wager legs');
  }

  // 5. Deduct credits
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits: profile.credits - amount })
    .eq('id', user.id);

  if (updateError) throw new Error('Failed to update credits');

  revalidatePath('/sports/nba');
  revalidatePath('/sports/nfl');
  return { success: true, wagerId: wager.id };
}

export async function getUserWagers() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('sports_wagers')
    .select('*, wager_legs(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching wagers", error);
    return [];
  }

  return data;
}

export async function searchUsers(query: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', `${query}%`)
    .limit(5);

  if (error) return [];
  return data.map(d => d.username);
}

export async function transferCredits(recipientUsername: string, amount: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 1. Get sender profile
  const { data: sender } = await supabase
    .from('profiles')
    .select('credits, username')
    .eq('id', user.id)
    .single();

  if (!sender || sender.credits < amount) throw new Error('Insufficient credits');
  if (sender.username === recipientUsername) throw new Error('Cannot transfer to self');

  // 2. Get recipient profile
  const { data: recipient } = await supabase
    .from('profiles')
    .select('id, credits')
    .eq('username', recipientUsername)
    .single();

  if (!recipient) throw new Error('Recipient not found');

  // 3. Perform transfer (Ideally atomic)
  // Deduct
  const { error: deductError } = await supabase
    .from('profiles')
    .update({ credits: sender.credits - amount })
    .eq('id', user.id);

  if (deductError) throw new Error('Transfer failed at deduction');

  // Add
  const { error: addError } = await supabase
    .from('profiles')
    .update({ credits: recipient.credits + amount })
    .eq('id', recipient.id);

  if (addError) {
    // Rollback sender
    await supabase.from('profiles').update({ credits: sender.credits }).eq('id', user.id);
    throw new Error('Transfer failed at addition');
  }

  // 4. Log Transaction
  await supabase.from('credit_transactions').insert([
    { 
        sender_id: user.id, 
        recipient_id: recipient.id, 
        amount, 
        type: 'transfer',
        metadata: { sender: sender.username, recipient: recipientUsername }
    }
  ]);

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getTransactions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return data;
}
