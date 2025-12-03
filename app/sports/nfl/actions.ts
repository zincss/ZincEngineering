// app/sports/nfl/actions.ts
'use server'

import { getOrFetchResource } from '@/lib/data-manager';
import * as ESPN from './lib/espn';

// CONFIG: Cache times in hours
const CACHE_CONFIG = {
  SCORES: 0.05,    // 3 minutes
  STANDINGS: 1,    // 1 hour
  LEADERS: 6,      // 6 hours
  PROFILES: 24     // 24 hours
};

export async function getDashboardData() {
  const [scores, standings, leaders] = await Promise.all([
    getOrFetchResource({
      table: 'nfl_snapshots', keyField: 'key', id: 'live_scores', expirationHours: CACHE_CONFIG.SCORES
    }, ESPN.fetchLiveScoreboard),

    // UPDATED ID to 'season_standings_v3' to force cache refresh
    getOrFetchResource({
      table: 'nfl_snapshots', keyField: 'key', id: 'season_standings_v3', expirationHours: CACHE_CONFIG.STANDINGS
    }, ESPN.fetchStandings),

    // UPDATED ID to 'season_leaders_v2' to force cache refresh
    getOrFetchResource({
      table: 'nfl_snapshots', keyField: 'key', id: 'season_leaders_v2', expirationHours: CACHE_CONFIG.LEADERS
    }, ESPN.fetchDailyLeaders),
  ]);

  return { scores, standings, leaders };
}

export async function getTeamSnapshot(teamId: string) {
  return await getOrFetchResource({
    table: 'nfl_snapshots', keyField: 'key', id: `team_${teamId}`, expirationHours: CACHE_CONFIG.PROFILES
  }, () => ESPN.fetchTeamProfile(teamId));
}

export async function getPlayerProfile(playerId: string) {
    // UPDATED to 'player_full_v1' to force fresh rich data
    return await getOrFetchResource({
        table: 'nfl_snapshots', keyField: 'key', id: `player_full_v1_${playerId}`, expirationHours: CACHE_CONFIG.PROFILES
    }, () => ESPN.fetchPlayerFullProfile(playerId));
}

export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];
    try {
        const res = await fetch(`https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&query=${encodeURIComponent(query)}&limit=5&mode=prefix&type=player&sport=football&league=nfl`);
        const data = await res.json();
        return (data.items || []).map((item: any) => ({
            id: item.id,
            name: item.displayName,
            team: item.team?.abbreviation || 'FA',
            url: `/sports/nfl/player/${item.id}`,
            image: item.images?.[0]?.url || null
        }));
    } catch (e) { return []; }
}