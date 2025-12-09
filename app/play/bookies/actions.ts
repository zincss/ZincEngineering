'use server'

import { createClient } from '@/utils/supabase/client';
import { getDashboardData as getNBA } from '@/app/sports/nba/actions';
import { getDashboardData as getNFL } from '@/app/sports/nfl/actions';
import { calculateOdds } from './utils';
import { revalidatePath } from 'next/cache';

export async function getBookieBoard() {
  const [nba, nfl] = await Promise.all([getNBA(), getNFL()]);
  
  // FIX 1: Explicitly type the array to avoid "implicit any" error
  const games: any[] = [];

  // Helper to find team win % from standings
  const findPct = (sport: 'NBA' | 'NFL', teamAbbr: string) => {
    const data = sport === 'NBA' ? nba.standings : nfl.standings;
    
    // FIX 2: Check if data exists before trying to get values
    // If fetches failed or are empty, return default 0.5 (50%)
    if (!data) return 0.5;

    // Search both conferences
    const conferences = Object.values(data);
    for (const conf of conferences) {
      // FIX 3: Cast conf to array to satisfy TS
      const team = (conf as any[])?.find((t: any) => t.abbr === teamAbbr);
      if (team) return parseFloat(team.stats.pct);
    }
    return 0.5; // Default
  };

  // Process NBA Games
  if (nba.scores) {
      nba.scores.forEach((game: any) => {
        if (game.status === 'Scheduled' || game.status === 'Pre-Game') {
          const hPct = findPct('NBA', game.home.code);
          const aPct = findPct('NBA', game.away.code);
          const odds = calculateOdds(hPct, aPct);
          
          games.push({ ...game, sport: 'NBA', odds });
        }
      });
  }

  // Process NFL Games
  if (nfl.scores) {
      nfl.scores.forEach((game: any) => {
        if (game.status === 'Scheduled' || game.status === 'Pre-Game') {
          const hPct = findPct('NFL', game.home.code);
          const aPct = findPct('NFL', game.away.code);
          const odds = calculateOdds(hPct, aPct);

          games.push({ ...game, sport: 'NFL', odds });
        }
      });
  }

  return games;
}

export async function placeWager(game: any, selection: 'HOME' | 'AWAY', amount: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // 1. Check Balance
  const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
  if (!profile || profile.credits < amount) return { error: 'Insufficient Funds' };

  // 2. Determine Odds & Team
  const selectedTeam = selection === 'HOME' ? game.home.code : game.away.code;
  const odds = selection === 'HOME' ? game.odds.home : game.odds.away;
  const potentialPayout = Math.floor(amount * odds);

  // 3. Transaction: Deduct Credits & Create Wager
  // Note: Ensure you have created the 'place_bet_transaction' RPC function in Supabase
  // or handle the two steps (deduct + insert) manually here if you haven't.
  const { error } = await supabase.rpc('place_bet_transaction', {
    p_user_id: user.id,
    p_amount: amount,
    p_sport: game.sport,
    p_game_id: game.id,
    p_matchup: `${game.home.code} vs ${game.away.code}`,
    p_selected_team: selectedTeam,
    p_odds: odds,
    p_payout: potentialPayout
  });

  if (error) {
      console.error(error);
      return { error: error.message };
  }
  
  revalidatePath('/play/bookies');
  return { success: true };
}