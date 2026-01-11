'use server';

import { getOrFetchResource } from '@/lib/data-manager';
import * as API from './lib/api';
import * as ESPN from '@/app/sports/services/espn';

const CACHE_CONFIG = {
  SCORES: 0.05,    
  STANDINGS: 1,    
  LEADERS: 6,      
  PROFILES: 24     
};

export async function getGolfDashboard() {
    const [live, rankings, schedule, stats] = await Promise.all([
        API.fetchLiveTournament(),
        API.fetchRankings(),
        API.fetchSchedule(),
        API.fetchStatLeaders()
    ]);

    return {
        live,
        rankings,
        schedule,
        stats
    };
}

export async function getPlayerProfile(playerId: string) {
    return await getOrFetchResource({
        table: 'golf_snapshots', keyField: 'key', id: `player_bio_v1_${playerId}`, expirationHours: CACHE_CONFIG.PROFILES
    }, () => ESPN.getPlayer('golf', playerId));
}

export async function getPlayerGameLog(playerId: string) {
    return await ESPN.getPlayerLogs('golf', playerId);
}

export async function searchPlayers(query: string) {
    return await ESPN.searchAthletes('golf', query);
}