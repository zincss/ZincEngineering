// app/sports/nba/actions.ts
'use server'

import { getOrFetchResource } from '@/lib/data-manager';
import * as ESPN from '@/app/sports/services/espn';
import { revalidatePath } from 'next/cache';

const CACHE_CONFIG = {
  SCORES: 0.05,    
  STANDINGS: 1,    
  LEADERS: 6,      
  PROFILES: 24     
};

export async function getDashboardData() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');

  const [scores, standings, leaders] = await Promise.all([
    // Fetch today and tomorrow concurrently
    Promise.all([
        getOrFetchResource({
            table: 'nba_snapshots', keyField: 'key', id: `live_scores_v3_${formatDate(today)}`, expirationHours: CACHE_CONFIG.SCORES
        }, () => ESPN.getScoreboard('nba')),
        getOrFetchResource({
            table: 'nba_snapshots', keyField: 'key', id: `live_scores_v3_${formatDate(tomorrow)}`, expirationHours: CACHE_CONFIG.SCORES
        }, () => ESPN.getScoreboard('nba', formatDate(tomorrow)))
    ]).then(([t1, t2]) => [...(t1 || []), ...(t2 || [])]),

    getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'season_standings_v15', expirationHours: CACHE_CONFIG.STANDINGS
    }, () => ESPN.getStandings('nba')),

    getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'season_leaders_v15', expirationHours: CACHE_CONFIG.LEADERS
    }, () => ESPN.getLeaders('nba')),
  ]);

  return { scores, standings, leaders };
}

export async function getLiveScores() {
    return await getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'live_scores_v2', expirationHours: CACHE_CONFIG.SCORES
    }, () => ESPN.getScoreboard('nba'));
}

export async function getPlayerProfile(playerId: string) {
    return await getOrFetchResource({
        table: 'nba_snapshots', keyField: 'key', id: `player_bio_v11_${playerId}`, expirationHours: CACHE_CONFIG.PROFILES
    }, () => ESPN.getPlayer('nba', playerId));
}

export async function getPlayerGameLog(playerId: string) {
    return await ESPN.getPlayerLogs('nba', playerId);
}

export async function searchPlayers(query: string) {
    return await ESPN.searchAthletes('nba', query);
}

export async function getGameSummary(gameId: string) {
    // Basic implementation or stub
    return null; 
}

export async function getTeamSnapshot(teamId: string) {
    return await getOrFetchResource({
        table: 'nba_snapshots', keyField: 'key', id: `team_v2_${teamId}`, expirationHours: CACHE_CONFIG.PROFILES
    }, () => ESPN.getTeam('nba', teamId));
}