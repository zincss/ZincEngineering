'use server';

import { 
    fetchRankings, 
    fetchSchedule, 
    fetchSeasonStats, 
    fetchLiveLeaderboard, 
    fetchGolferProfile, 
    searchGolfers 
} from './lib/golf-api';

export async function getGolfDashboard() {
    console.log("⛳ [GOLF] Fetching Dashboard Data...");
    
    try {
        const [rankings, schedule, stats, live] = await Promise.all([
            fetchRankings().catch(e => { console.error("Rankings Error", e); return { owgr: [], fedex: [] }; }),
            fetchSchedule().catch(e => { console.error("Schedule Error", e); return []; }),
            fetchSeasonStats().catch(e => { console.error("Stats Error", e); return []; }),
            fetchLiveLeaderboard().catch(e => { console.error("Live Error", e); return null; })
        ]);

        return {
            success: true,
            owgr: rankings?.owgr || [],
            fedex: rankings?.fedex || [],
            schedule: schedule || [],
            stats: stats || [],
            live: live || null
        };
    } catch (e) {
        console.error("🔥 [GOLF] CRITICAL FAILURE:", e);
        return { success: false };
    }
}

export async function getGolferProfile(id: string) {
    return await fetchGolferProfile(id);
}

export async function searchGolfersAction(query: string) {
    return await searchGolfers(query);
}