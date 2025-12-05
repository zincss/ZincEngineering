'use server';

import * as API from './lib/api';

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