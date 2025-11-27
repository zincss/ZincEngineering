'use server'

import { NBA_TEAMS } from './data';

// --- ESPN API ENDPOINTS ---
const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const CORE_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba';
const WEB_API = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba';

// --- HELPERS ---
const fetchJson = async (url: string, revalidate = 60) => {
    try {
        const res = await fetch(url, { next: { revalidate } });
        if (!res.ok) {
            // console.error(`Fetch error ${res.status}: ${url}`);
            return null;
        }
        return await res.json();
    } catch (e) {
        // console.error(`Fetch failed: ${url}`, e);
        return null;
    }
};

// --- 1. LIVE SCORES ---
export async function getLiveScores() {
    const data = await fetchJson(`${BASE_URL}/scoreboard`, 30);
    if (!data || !data.events) return [];

    return data.events.map((e: any) => {
        const comp = e.competitions[0];
        const home = comp.competitors.find((c: any) => c.homeAway === 'home');
        const away = comp.competitors.find((c: any) => c.homeAway === 'away');

        return {
            id: e.id,
            name: e.name,
            shortName: e.shortName,
            status: e.status.type.shortDetail,
            isLive: e.status.type.state === 'in',
            home: {
                name: home.team.abbreviation,
                score: home.score,
                logo: home.team.logo
            },
            away: {
                name: away.team.abbreviation,
                score: away.score,
                logo: away.team.logo
            }
        };
    });
}

// --- 2. GET TEAM DATA (ROSTER, SCHEDULE & LOGS) ---
export async function getTeamData(espnId: string) {
    // Fetch Team Info + Next Game
    const teamData = await fetchJson(`${BASE_URL}/teams/${espnId}`, 3600);
    // Fetch Roster
    const rosterData = await fetchJson(`${BASE_URL}/teams/${espnId}/roster`, 3600);
    // Fetch Schedule (Past & Future)
    const scheduleData = await fetchJson(`${BASE_URL}/teams/${espnId}/schedule`, 3600);
    
    if (!teamData || !teamData.team) return null;

    const t = teamData.team;
    const nextEvent = t.nextEvent?.[0];

    // Format Roster
    const roster = (rosterData?.athletes || []).map((p: any) => ({
        id: p.id,
        name: p.fullName,
        pos: p.position.abbreviation,
        number: p.jersey,
        image: p.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png`,
        height: p.displayHeight,
        weight: p.displayWeight,
        age: p.age,
        college: p.college?.name || 'N/A'
    }));

    // Format Schedule / Results
    const schedule = (scheduleData?.events || []).map((e: any) => {
        const game = e.competitions[0];
        const opponent = game.competitors.find((c: any) => c.team.id !== espnId);
        const teamResult = game.competitors.find((c: any) => c.team.id === espnId);
        
        return {
            id: e.id,
            date: e.date,
            shortName: e.shortName,
            opponent: {
                name: opponent?.team?.abbreviation || 'TBD',
                logo: opponent?.team?.logos?.[0]?.href,
                score: opponent?.score?.value
            },
            result: teamResult?.score && opponent?.score ? (parseInt(teamResult.score.value) > parseInt(opponent.score.value) ? 'W' : 'L') : null,
            score: teamResult?.score?.value,
            status: e.status?.type?.description || 'Scheduled'
        };
    }).reverse(); // Most recent first

    return {
        id: t.id,
        name: t.displayName,
        logo: t.logos?.[0]?.href,
        color: t.color,
        record: t.record?.items?.[0]?.summary || '0-0',
        standing: t.standingSummary,
        roster,
        schedule
    };
}

// --- 3. GET PLAYER PROFILE (WITH GAMELOG & ROBUST STATS) ---
export async function getPlayerProfile(playerId: string) {
    const bioData = await fetchJson(`${WEB_API}/athletes/${playerId}`, 3600);
    if (!bioData || !bioData.athlete) return null;
    
    const p = bioData.athlete;

    const logData = await fetchJson(`${WEB_API}/athletes/${playerId}/gamelog`, 3600);
    const events = logData?.seasonTypes?.[0]?.categories?.[0]?.events || [];
    
    const gameLog = events.map((e: any) => {
        const stats = e.stats || [];
        return {
            date: e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) : '-',
            opponent: e.opponent?.abbreviation || 'OPP',
            result: e.gameResult || '-',
            min: stats[0] || '-',
            pts: stats[13] || '0',
            reb: stats[7] || '0',
            ast: stats[8] || '0',
            stl: stats[10] || '0',
            blk: stats[9] || '0',
            to:  stats[12] || '0'
        };
    });

    let seasonAvg = { ppg: '0.0', rpg: '0.0', apg: '0.0', spg: '0.0', bpg: '0.0', topg: '0.0', games: 0 };

    if (gameLog.length > 0) {
        let totalPts = 0, totalReb = 0, totalAst = 0, totalStl = 0, totalBlk = 0, totalTo = 0;
        const gamesPlayed = gameLog.length;
        
        gameLog.forEach((g: any) => {
            totalPts += parseFloat(g.pts) || 0;
            totalReb += parseFloat(g.reb) || 0;
            totalAst += parseFloat(g.ast) || 0;
            totalStl += parseFloat(g.stl) || 0;
            totalBlk += parseFloat(g.blk) || 0;
            totalTo  += parseFloat(g.to)  || 0;
        });

        seasonAvg = {
            ppg: (totalPts / gamesPlayed).toFixed(1),
            rpg: (totalReb / gamesPlayed).toFixed(1),
            apg: (totalAst / gamesPlayed).toFixed(1),
            spg: (totalStl / gamesPlayed).toFixed(1),
            bpg: (totalBlk / gamesPlayed).toFixed(1),
            topg: (totalTo / gamesPlayed).toFixed(1),
            games: gamesPlayed
        };
    }

    const bornText = p.birthPlace?.city 
        ? `${p.birthPlace.city}, ${p.birthPlace.state || p.birthPlace.country}` 
        : p.displayDOB || 'Unknown';

    return {
        id: p.id,
        name: p.fullName,
        team: p.team?.displayName || 'Free Agent',
        teamId: p.team?.id,
        number: p.jersey,
        pos: p.position?.displayName,
        height: p.displayHeight,
        weight: p.displayWeight,
        born: bornText,
        age: p.age,
        image: p.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png`,
        status: p.status?.name,
        stats: seasonAvg,
        gameLog: gameLog.slice(0, 10), // Only show last 10 in table
        desc: `Professional basketball player for the ${p.team?.displayName}.`
    };
}

// --- 4. GET STANDINGS ---
export async function getStandings() {
    const data = await fetchJson(`${CORE_URL}/standings`, 3600);
    
    if (!data || !data.children) return { east: [], west: [] };

    const east = data.children.find((c: any) => c.name === 'Eastern Conference' || c.abbreviation === 'EST');
    const west = data.children.find((c: any) => c.name === 'Western Conference' || c.abbreviation === 'WST');

    const formatTeam = (t: any) => {
        const getStat = (target: string) => {
            const stat = t.stats?.find((s: any) => s.name === target || s.id === target || s.type === target || s.shortDisplayName === target);
            return stat?.value;
        };

        const rawDiff = getStat('avgPointDifferential') ?? getStat('pointDifferential') ?? getStat('diff') ?? getStat('avgScoreDifferential') ?? 0;
        
        return {
            id: t.team.id,
            name: t.team.abbreviation || t.team.displayName,
            logo: t.team.logos?.[0]?.href,
            wins: getStat('wins') || 0,
            losses: getStat('losses') || 0,
            pct: getStat('winPercent') || 0,
            diff: Number(rawDiff).toFixed(1),
            seed: getStat('playoffSeed'),
        };
    };

    const sortTeams = (a: any, b: any) => {
        if (a.seed && b.seed) return a.seed - b.seed;
        return b.pct - a.pct;
    };

    return {
        east: (east?.standings?.entries?.map(formatTeam) || []).sort(sortTeams),
        west: (west?.standings?.entries?.map(formatTeam) || []).sort(sortTeams)
    };
}

// --- 5. GET LEAGUE LEADERS (ZINC ELO CANDIDATES) ---
export async function getLeagueLeaders() {
    // Reduced Candidate List to prevent API Timeouts (Top 8 Safe Picks)
    const CANDIDATES = [
        '3112335', // Jokic
        '3945274', // Luka
        '3032977', // Giannis
        '4278078', // Shai
        '4065648', // Tatum
        '3059318', // Embiid
        '4432809', // Ant Edwards
        '3202'     // KD
    ];

    // Use Promise.allSettled so one failure doesn't break the whole app
    const results = await Promise.allSettled(
        CANDIDATES.map(id => getPlayerProfile(id))
    );

    // Filter only successful requests
    const profiles = results
        .filter(r => r.status === 'fulfilled')
        // @ts-ignore
        .map(r => r.value)
        .filter(p => p !== null);

    return profiles;
}