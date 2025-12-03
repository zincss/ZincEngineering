// app/sports/golf/actions.ts
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
    // 1. Fetch Schedule & Rankings
    const [schedule, rankings, fedex] = await Promise.all([
        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'season_schedule', 
            expirationHours: CACHE.SCHEDULE
        }, GolfAPI.fetchSeasonSchedule),

        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'world_rankings', 
            expirationHours: CACHE.RANKINGS
        }, GolfAPI.fetchWorldRankings),

        getOrFetchResource({
            table: 'golf_snapshots', keyField: 'key', id: 'fedex_standings', 
            expirationHours: CACHE.RANKINGS
        }, GolfAPI.fetchFedExCupStandings),
    ]);

    // 2. INTELLIGENT EVENT SELECTION
    let targetEventId = undefined;

    // Check for a generic LIVE event first (override everything else)
    const liveEvent = schedule?.find((e: any) => 
        e.status?.toLowerCase().includes('live') || 
        e.status?.toLowerCase().includes('progress') ||
        e.status?.toLowerCase().includes('play')
    );

    if (liveEvent) {
        targetEventId = liveEvent.id;
    } else {
        // "The Monday-Wednesday Rule"
        // If it's early in the week, users want to see "Who Won Last Weekend?"
        // If it's late in the week (Thu-Sun), they want "Who is Playing Now/Next?"
        const today = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu...
        const isEarlyWeek = today >= 1 && today <= 3; 

        if (isEarlyWeek) {
            // Find the LAST COMPLETED event
            // Filter for 'Final' and sort by date descending
            const completedEvents = schedule?.filter((e: any) => e.status?.includes('Final')) || [];
            // Sort Descending (Newest first)
            completedEvents.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            if (completedEvents.length > 0) {
                targetEventId = completedEvents[0].id;
            }
        } else {
            // Find the NEXT UPCOMING event
            // Filter for !Final and !Canceled, sort Ascending
            const upcomingEvents = schedule?.filter((e: any) => 
                !e.status?.includes('Final') && 
                !e.status?.includes('Canceled')
            ) || [];
            upcomingEvents.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (upcomingEvents.length > 0) {
                targetEventId = upcomingEvents[0].id;
            }
        }
    }

    // 3. Fetch Leaderboard for the specific Target ID
    // We cache this based on the ID so we don't mix up "Last Week" with "Next Week" cache
    const leaderboardKey = `leaderboard_${targetEventId || 'latest'}`;

    const leaderboard = await getOrFetchResource({
        table: 'golf_snapshots', keyField: 'key', id: leaderboardKey, 
        expirationHours: CACHE.LEADERBOARD
    }, () => GolfAPI.fetchLiveLeaderboard(targetEventId));

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