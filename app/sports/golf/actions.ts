// app/sports/golf/actions.ts
'use server';

import { getOrFetchResource } from '@/lib/data-manager';
import * as GolfAPI from './lib/golf-api';

const CACHE_CONFIG = {
  SCHEDULE: 12,       
  RANKINGS: 24,       
  STATS: 24,          
  LIVE: 0.1           
};

export async function getDashboardData() {
    console.log("⛳ [GOLF] Fetching Dashboard Data (v6 - Force Refresh)...");
    
    const [rankings, schedule, stats, live] = await Promise.all([
        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'rankings_v5', expirationHours: CACHE_CONFIG.RANKINGS
        }, GolfAPI.fetchRankings),

        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'schedule_v5', expirationHours: CACHE_CONFIG.SCHEDULE
        }, GolfAPI.fetchSchedule),

        // CACHE BUSTER: _v6 to clear the "empty" result from cache
        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'season_stats_v6', expirationHours: CACHE_CONFIG.STATS
        }, GolfAPI.fetchSeasonStats),

        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'live_leaderboard_v5', expirationHours: CACHE_CONFIG.LIVE
        }, GolfAPI.fetchLiveLeaderboard),
    ]);

    return {
        owgr: rankings?.owgr || [],
        fedex: rankings?.fedex || [],
        schedule: schedule || [],
        stats: stats || [],
        live: live
    };
}

export async function getGolferProfile(id: string) {
    return await getOrFetchResource({
        table: 'golf_snapshots', keyField: 'key', id: `player_profile_v5_${id}`, expirationHours: 24
    }, () => GolfAPI.fetchGolferProfile(id));
}

export async function searchGolfersAction(query: string) {
    return await GolfAPI.searchGolfers(query);
}