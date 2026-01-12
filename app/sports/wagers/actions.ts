'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { getGameResult, getLiveBoxScore } from '../services/espn';

export interface WagerLeg {
  match_id: string;
  league: string;
  match_name: string;
  type: 'moneyline' | 'spread' | 'total';
  selection: string;
  odds: number;
}

async function settleUserWagers(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) return;
  
  const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);

  // 1. Get pending wagers
  const { data: wagers } = await supabase
    .from('sports_wagers')
    .select('*, wager_legs(*)')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (!wagers || wagers.length === 0) return;

  for (const wager of wagers) {
    let anyLegLost = false;
    let anyLegPending = false;
    let legsUpdated = false;

    for (const leg of wager.wager_legs) {
      if (leg.status !== 'pending') {
        if (leg.status === 'lost') anyLegLost = true;
        continue;
      }

      // Extract real game ID (format: "gameId-type-selection-prefix")
      const realGameId = leg.match_id.split('-')[0];
      const league = leg.league || 'nba';

      const result = await getGameResult(league as any, realGameId);

      if (!result || !result.completed) {
        anyLegPending = true;
        continue;
      }

      let legStatus = 'pending';
      const selection = leg.selection.trim();
      
      // Check for Player Prop (Name in brackets or match_name indicates player)
      const playerMatch = leg.match_name.match(/\[(.*?)\]/);
      const isPlayerProp = !!playerMatch;

      if (isPlayerProp) {
          const playerName = playerMatch[1];
          const statsMap = await getLiveBoxScore(league as any, realGameId);
          const stats = statsMap ? statsMap[playerName] : null;

          if (!stats) {
              // Player not found in final boxscore -> Void?
              legStatus = 'void';
          } else {
              const parts = selection.split(' '); // "O 79.5" or "YES"
              const val = parseFloat(parts[1] || parts[0]); // 79.5 or NaN
              const isOver = selection.startsWith('O') || selection === 'YES';
              
              let actual = 0;
              // Infer stat category based on available stats and priority
              if (stats.YDS) actual = parseInt(stats.YDS);
              else if (stats.PTS) actual = parseInt(stats.PTS);
              else if (stats.REB) actual = parseInt(stats.REB);
              else if (stats.AST) actual = parseInt(stats.AST);
              else if (stats.TD) actual = parseInt(stats.TD);
              
              // Specific logic for YES/NO (usually TD)
              if (selection === 'YES') {
                  legStatus = actual > 0 ? 'won' : 'lost';
              } else if (selection === 'NO') {
                  legStatus = actual === 0 ? 'won' : 'lost';
              } else if (!isNaN(val)) {
                  if (isOver) legStatus = actual > val ? 'won' : 'lost';
                  else legStatus = actual < val ? 'won' : 'lost';
              } else {
                  legStatus = 'void';
              }
          }

      } else if (leg.type === 'moneyline') {
        const winner = result.home.winner ? 'home' : 'away';
        if (selection.toLowerCase() === 'home' || selection.toLowerCase() === 'away') {
             if (selection.toLowerCase() === winner) legStatus = 'won';
             else legStatus = 'lost';
        } else {
            legStatus = 'lost';
        }
      } else if (leg.type === 'spread') {
        const [side, lineStr] = selection.split(':');
        const line = parseFloat(lineStr);

        if (!side || isNaN(line)) {
            anyLegPending = true; 
            continue;
        }

        const homeScore = result.home.score;
        const awayScore = result.away.score;

        let scoreDiff = 0;
        if (side === 'home') {
            scoreDiff = homeScore - awayScore;
        } else if (side === 'away') {
            scoreDiff = awayScore - homeScore;
        } else {
            anyLegPending = true;
            continue;
        }

        if (scoreDiff + line > 0) legStatus = 'won';
        else if (scoreDiff + line < 0) legStatus = 'lost';
        else legStatus = 'void';

      } else if (leg.type === 'total') {
        // Handle "over:210.5" or fallback
        let side = '';
        let line = NaN;

        if (selection.includes(':')) {
            const parts = selection.split(':');
            side = parts[0];
            line = parseFloat(parts[1]);
        }

        if (!isNaN(line)) {
            const totalScore = result.home.score + result.away.score;
            if (side === 'over') {
                if (totalScore > line) legStatus = 'won';
                else if (totalScore < line) legStatus = 'lost';
                else legStatus = 'void';
            } else if (side === 'under') {
                if (totalScore < line) legStatus = 'won';
                else if (totalScore > line) legStatus = 'lost';
                else legStatus = 'void';
            }
        } else {
             anyLegPending = true; // wait or void?
        }
      }

      if (legStatus !== 'pending') {
        await supabase.from('wager_legs').update({ status: legStatus }).eq('id', leg.id);
        if (legStatus === 'lost') anyLegLost = true;
        legsUpdated = true;
      } else {
        anyLegPending = true;
      }
    }

    // Update Wager Status
    let newStatus = 'pending';
    if (anyLegLost) {
      newStatus = 'lost';
    } else if (!anyLegPending) {
      newStatus = 'won';
    }

    if (newStatus !== 'pending') {
      await supabase.from('sports_wagers').update({ status: newStatus }).eq('id', wager.id);
      
      if (newStatus === 'won') {
        const payout = Math.floor(wager.amount * wager.odds);
        await supabase.from('sports_wagers').update({ payout }).eq('id', wager.id);
        
        // Credit User
        const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single();
        if (profile) {
          await supabase.from('profiles').update({ credits: profile.credits + payout }).eq('id', userId);
        }
      }
    }
  }
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

  // Attempt settlement of pending wagers
  try {
    await settleUserWagers(user.id);
  } catch (e) {
    console.error("Settlement failed", e);
  }

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
