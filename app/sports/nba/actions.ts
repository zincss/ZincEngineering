'use server'

import { NBA_TEAMS } from './data';

// --- ESPN API ENDPOINTS ---
const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const CORE_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba';
const WEB_API = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba';

// --- SEED DATA (FAILSAFE) ---
// Used if API fails completely, ensuring UI never breaks.
const FALLBACK_PLAYERS = [
    { id: '3112335', name: 'Nikola Jokic', team: 'Denver Nuggets', stats: { ppg: '26.4', rpg: '12.4', apg: '9.0', games: 79 }, seasonLabel: '2023-24 (OFFLINE)' },
    { id: '3945274', name: 'Luka Doncic', team: 'Dallas Mavericks', stats: { ppg: '33.9', rpg: '9.2', apg: '9.8', games: 70 }, seasonLabel: '2023-24 (OFFLINE)' },
    { id: '3032977', name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', stats: { ppg: '30.4', rpg: '11.5', apg: '6.5', games: 73 }, seasonLabel: '2023-24 (OFFLINE)' },
    { id: '4278078', name: 'Shai Gilgeous-Alexander', team: 'Oklahoma City Thunder', stats: { ppg: '30.1', rpg: '5.5', apg: '6.2', games: 75 }, seasonLabel: '2023-24 (OFFLINE)' },
    { id: '4065648', name: 'Jayson Tatum', team: 'Boston Celtics', stats: { ppg: '26.9', rpg: '8.1', apg: '4.9', games: 74 }, seasonLabel: '2023-24 (OFFLINE)' }
];

// --- HELPERS ---
const fetchJson = async (url: string, revalidate = 3600) => {
    try {
        const res = await fetch(url, { next: { revalidate } });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error(`Fetch failed: ${url}`);
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

// --- 2. GET TEAM DATA ---
export async function getTeamData(espnId: string) {
    const teamData = await fetchJson(`${BASE_URL}/teams/${espnId}`, 3600);
    const rosterData = await fetchJson(`${BASE_URL}/teams/${espnId}/roster`, 3600);
    const scheduleData = await fetchJson(`${BASE_URL}/teams/${espnId}/schedule`, 3600);
    
    if (!teamData || !teamData.team) return null;

    const t = teamData.team;

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
    }).reverse();

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

// --- 3. GET PLAYER PROFILE (SMART FETCH) ---
export async function getPlayerProfile(playerId: string) {
    // 1. Fetch Overview (Contains full career history)
    const data = await fetchJson(`${WEB_API}/athletes/${playerId}/overview`, 3600);
    if (!data || !data.athlete) return null;
    
    const p = data.athlete;
    
    // 2. Extract Stats History
    let statsBlock = data.statistics?.regularSeason?.seasons || 
                     data.currentTeamStatistics?.statistics?.regularSeason?.seasons || [];
    
    let labels = data.statistics?.names || 
                 data.currentTeamStatistics?.names || [];

    // 3. Find Latest Valid Season
    // We sort by year descending and find the first one with > 0 games
    statsBlock.sort((a: any, b: any) => b.year - a.year);

    let validSeason = null;
    const gpIndex = labels.indexOf('GP');

    for (const season of statsBlock) {
        // Filter out future years or empty data
        const games = gpIndex > -1 ? parseFloat(season.stats[gpIndex]) : 0;
        if (games > 0) {
            validSeason = season;
            break;
        }
    }

    // If no data found, use dummy empty data (shouldn't happen for stars)
    if (!validSeason) return null;

    // 4. Map Stats
    const getVal = (key: string) => {
        const idx = labels.indexOf(key);
        return idx > -1 ? parseFloat(validSeason.stats[idx]) : 0;
    };

    const stats = {
        games: getVal('GP'),
        ppg: getVal('PTS').toFixed(1),
        rpg: getVal('REB').toFixed(1),
        apg: getVal('AST').toFixed(1),
        spg: getVal('STL').toFixed(1),
        bpg: getVal('BLK').toFixed(1),
        topg: getVal('TO').toFixed(1)
    };

    // Format Label (2025 -> "2024-25")
    const seasonLabel = `${validSeason.year-1}-${validSeason.year.toString().slice(2)}`;

    return {
        id: p.id,
        name: p.fullName,
        team: p.team?.displayName || 'Free Agent',
        teamId: p.team?.id,
        number: p.jersey,
        pos: p.position?.displayName,
        height: p.displayHeight,
        weight: p.displayWeight,
        age: p.age,
        image: p.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png`,
        status: p.status?.name,
        stats: stats,
        gameLog: [], 
        seasonLabel: seasonLabel,
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

// --- 5. GET LEAGUE LEADERS (FAILSAFE ENGINE) ---
export async function getLeagueLeaders() {
    const CANDIDATES = [
        '3112335', // Jokic
        '3945274', // Luka
        '3032977', // Giannis
        '4278078', // Shai
        '4065648', // Tatum
        '3059318', // Embiid
        '4432809', // Ant Edwards
        '3202',    // KD
        '6583',    // AD
        '4433247', // Wemby
        '3934672', // Brunson
        '4395628', // Haliburton
        '3136193', // Booker
        '3908809', // Fox
        '4277905', // Trae
        '3917376', // Jaylen Brown
        '3155942', // Sabonis
        '4066261', // Bam Adebayo
        '4277886', // Zion
        '3975',    // Curry
        '4683018'  // Holmgren
    ];

    try {
        const results = await Promise.allSettled(
            CANDIDATES.map(id => getPlayerProfile(id))
        );

        const profiles = results
            .filter(r => r.status === 'fulfilled')
            // @ts-ignore
            .map(r => r.value)
            .filter(p => p !== null);

        // If API fails to return enough players, use fallback data
        if (profiles.length < 3) {
            // Map fallback data to match profile structure
            return {
                seasonLabel: "OFFLINE MODE",
                players: FALLBACK_PLAYERS.map(p => ({
                    ...p,
                    image: `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png`,
                    elo: '0.0' // Will be calculated by UI
                }))
            };
        }

        return {
            seasonLabel: "LIVE RANKINGS",
            players: profiles
        };

    } catch (error) {
        console.error("Error fetching leaders:", error);
        return {
            seasonLabel: "ERROR MODE",
            players: []
        };
    }
}

// --- 6. ROSTER-BASED SEARCH ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];

    const allRosterPromises = NBA_TEAMS.map(team => 
        fetchJson(`${BASE_URL}/teams/${team.espnId}/roster`, 86400)
    );
    
    const results = await Promise.allSettled(allRosterPromises);

    const allPlayers: any[] = [];
    const seenIds = new Set();

    results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value && result.value.athletes) {
            result.value.athletes.forEach((p: any) => {
                if (!seenIds.has(p.id)) {
                    seenIds.add(p.id);
                    allPlayers.push({
                        id: p.id,
                        name: p.fullName,
                        team: p.items?.[0]?.description || 'NBA',
                        image: p.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png`,
                        pos: p.position?.abbreviation,
                        number: p.jersey
                    });
                }
            });
        }
    });

    const lowerQuery = query.toLowerCase();
    return allPlayers
        .filter(p => p.name.toLowerCase().includes(lowerQuery))
        .slice(0, 10);
}