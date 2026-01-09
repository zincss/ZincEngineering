// app/sports/nfl/actions.ts
'use server'

import { getOrFetchResource } from '@/lib/data-manager';
import * as ESPN from '@/app/sports/services/espn';

const CACHE_CONFIG = {
  SCORES: 0.05,    
  STANDINGS: 1,    
  LEADERS: 6,      
  PROFILES: 24     
};

export async function getDashboardData() {
  const [scores, standings, leaders] = await Promise.all([
    getOrFetchResource({
      table: 'nfl_snapshots', keyField: 'key', id: 'live_scores_v3', expirationHours: CACHE_CONFIG.SCORES
    }, () => ESPN.getScoreboard('nfl')),

    getOrFetchResource({
      table: 'nfl_snapshots', keyField: 'key', id: 'season_standings_v15', expirationHours: CACHE_CONFIG.STANDINGS
    }, () => ESPN.getStandings('nfl')),

    getOrFetchResource({
      table: 'nfl_snapshots', keyField: 'key', id: 'season_leaders_v15', expirationHours: CACHE_CONFIG.LEADERS
    }, () => ESPN.getLeaders('nfl')),
  ]);

  return { scores, standings, leaders };
}

export async function getPlayerProfile(playerId: string) {
    return await getOrFetchResource({
        table: 'nfl_snapshots', keyField: 'key', id: `player_bio_v11_${playerId}`, expirationHours: CACHE_CONFIG.PROFILES
    }, () => ESPN.getPlayer('nfl', playerId));
}

export async function getPlayerGameLog(playerId: string) {
    return await ESPN.getPlayerLogs('nfl', playerId);
}

export async function searchPlayers(query: string) {
    return await ESPN.searchAthletes('nfl', query);
}

export async function getTeamSnapshot(teamId: string) {
    return await getOrFetchResource({
        table: 'nfl_snapshots', keyField: 'key', id: `team_v2_${teamId}`, expirationHours: CACHE_CONFIG.PROFILES
    }, () => ESPN.getTeam('nfl', teamId));
}