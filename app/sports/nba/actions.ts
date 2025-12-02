// app/sports/nba/actions.ts
'use server'

import { getOrFetchResource } from '@/lib/data-manager';
import * as ESPN from './lib/espn';

// CONFIG: How long (in hours) do we trust the DB snapshot?
const CACHE_CONFIG = {
  SCORES: 0.05,    
  STANDINGS: 1,    
  LEADERS: 12,     
  PROFILES: 24     
};

export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];
    try {
        const res = await fetch(`https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&query=${encodeURIComponent(query)}&limit=5&mode=prefix&type=player&sport=basketball&league=nba`);
        const data = await res.json();

        return (data.items || []).map((item: any) => ({
            id: item.id,
            name: item.displayName,
            team: item.team?.abbreviation || 'NBA',
            sport: 'NBA',
            url: `/sports/nba/player/${item.id}`,
            image: item.images?.[0]?.url || null
        }));
    } catch (e) {
        return [];
    }
}

export async function getDashboardData() {
  const [scores, standings, leaders] = await Promise.all([
    getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'live_scores', expirationHours: CACHE_CONFIG.SCORES
    }, ESPN.fetchLiveScoreboard),

    getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'season_standings', expirationHours: CACHE_CONFIG.STANDINGS
    }, ESPN.fetchStandings),

    getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'season_leaders', expirationHours: CACHE_CONFIG.LEADERS
    }, ESPN.fetchDailyLeaders),
  ]);

  return { scores, standings, leaders };
}

export async function getLiveScores() {
    return await getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'live_scores', expirationHours: CACHE_CONFIG.SCORES
    }, ESPN.fetchLiveScoreboard);
}

export async function getTeamSnapshot(teamId: string) {
  return await getOrFetchResource({
    table: 'nba_snapshots', keyField: 'key', id: `team_${teamId}`, expirationHours: CACHE_CONFIG.PROFILES
  }, () => ESPN.fetchTeamProfile(teamId));
}

// FIX: Changed ID to 'player_v3_' to bust old cache and force fresh data fetch
export async function getPlayerProfile(playerId: string) {
    return await getOrFetchResource({
        table: 'nba_snapshots',
        keyField: 'key',
        id: `player_v3_${playerId}`, // <--- CHANGED THIS TO V3
        expirationHours: CACHE_CONFIG.PROFILES
    }, () => ESPN.fetchPlayerProfile(playerId));
}

export async function getPlayerGameLog(playerId: string) {
    return await ESPN.fetchPlayerGameLog(playerId);
}

export async function getGameSummary(gameId: string) {
    return await ESPN.fetchGameSummary(gameId);
}

export async function forceRefreshDashboard() {
  return { success: true, message: "Snapshots Queued" };
}