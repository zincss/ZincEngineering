'use server'

import { getOrFetchResource } from '@/lib/data-manager';
import * as GolfAPI from './lib/golf-api';

const CACHE = {
    LEADERBOARD: 0.08, // 5 min
    RANKINGS: 24,      // 24 hours
    SCHEDULE: 12,      // 12 hours
    PROFILE: 12        // 12 hours
};

export async function getGolfDashboard() {
    const [leaderboard, rankings, fedex, schedule] = await Promise.all([
        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'live_leaderboard', 
            expirationHours: CACHE.LEADERBOARD
        }, GolfAPI.fetchLiveLeaderboard),

        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'world_rankings', 
            expirationHours: CACHE.RANKINGS
        }, GolfAPI.fetchWorldRankings),

        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'fedex_standings', 
            expirationHours: CACHE.RANKINGS
        }, GolfAPI.fetchFedExCupStandings),

        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'season_schedule', 
            expirationHours: CACHE.SCHEDULE
        }, GolfAPI.fetchSeasonSchedule)
    ]);

    return { leaderboard, rankings, fedex, schedule };
}

export async function searchPlayers(query: string) {
    return await GolfAPI.searchGolfers(query);
}

export async function getGolferProfile(id: string) {
    return await getOrFetchResource({
        table: 'golf_snapshots', keyField: 'key', id: `golfer_profile_${id}`, 
        expirationHours: CACHE.PROFILE
    }, () => GolfAPI.fetchGolferProfile(id));
}

export async function forceRefreshGolf() {
    return { success: true, message: "Golf Snapshots Queued for Refresh" };
}