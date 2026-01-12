'use server';

import * as ESPN from '@/app/sports/services/espn';

export async function getLiveMatchCenterData() {
    const [matches, golf] = await Promise.all([
        ESPN.getLiveMatches(),
        ESPN.getLiveGolf()
    ]);

    return {
        matches,
        golf
    };
}

export async function getMatchDetails(league: string, gameId: string) {
    return await ESPN.getMatchDetails(league as any, gameId);
}
