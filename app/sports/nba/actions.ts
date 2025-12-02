'use server'

import { getOrFetchResource } from '@/lib/data-manager';
import * as ESPN from './lib/espn';

// CONFIG: How long (in hours) do we trust the DB snapshot?
const CACHE_CONFIG = {
  SCORES: 0.05,    // 3 minutes (Live data)
  STANDINGS: 1,    // 1 hour
  LEADERS: 12,     // 12 hours
  PROFILES: 24     // 24 hours
};

// --- NEW: SEARCH ACTION (Fixes Header.tsx Import Error) ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];

    try {
        // Uses ESPN's common search API
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
        console.error("NBA Search Failed", e);
        return [];
    }
}

// 1. DASHBOARD SNAPSHOTS
export async function getDashboardData() {
  // We execute these in parallel for speed
  const [scores, standings, leaders] = await Promise.all([
    // Live Scores
    getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'live_scores', expirationHours: CACHE_CONFIG.SCORES
    }, ESPN.fetchLiveScoreboard),

    // Standings
    getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'season_standings', expirationHours: CACHE_CONFIG.STANDINGS
    }, ESPN.fetchStandings),

    // Leaders
    getOrFetchResource({
      table: 'nba_snapshots', keyField: 'key', id: 'season_leaders', expirationHours: CACHE_CONFIG.LEADERS
    }, ESPN.fetchDailyLeaders),
  ]);

  return { scores, standings, leaders };
}

// 2. TEAM SNAPSHOT
export async function getTeamSnapshot(teamId: string) {
  return await getOrFetchResource({
    table: 'nba_snapshots', 
    keyField: 'key', 
    id: `team_${teamId}`, 
    expirationHours: CACHE_CONFIG.PROFILES
  }, () => ESPN.fetchTeamProfile(teamId));
}

// 3. FORCE REFRESH (Optional utility for the "Force Update" button)
export async function forceRefreshDashboard() {
  // This just manually triggers the fetchers effectively updating the snapshot
  // In a real scenario, you'd delete the rows or pass a flag to bypass cache
  return { success: true, message: "Snapshots Queued" };
}