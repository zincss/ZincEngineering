'use server'

import { NBA_TEAMS } from './data';

// --- CONFIG ---
const ESPN_BASE = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba';
const ESPN_CORE = 'https://sports.core.api.espn.com/v2/sports/basketball/nba';
const ESPN_SEARCH = 'https://site.web.api.espn.com/apis/common/v3/search';
const SEASON_DISPLAY = '2024-25';

// --- HELPER: FETCH ---
const fetchJson = async (url: string, revalidate = 60) => {
    try {
        const res = await fetch(url, { 
            next: { revalidate },
            headers: {
                // Mimic a browser to be safe, though ESPN is generally permissible
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error(`Fetch Error (${url}):`, e);
        return null;
    }
};

// --- 1. SEARCH PLAYERS (Vercel Safe) ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];
    const url = `${ESPN_SEARCH}?region=us&lang=en&query=${encodeURIComponent(query)}&limit=5&mode=prefix&type=player&sport=basketball&league=nba`;
    const data = await fetchJson(url, 3600);
    if (!data || !data.items) return [];

    return data.items.map((item: any) => {
        // FIX: Get team ID from search payload and map to full name for better search results.
        const teamIdFromSearch = item.team?.id;
        const teamConfig = NBA_TEAMS.find(t => t.espnId === teamIdFromSearch);
        
        return {
            id: item.id,
            name: item.displayName,
            // Use full name if found, fallback to abbreviation
            team: teamConfig?.name || item.team?.abbreviation || 'Free Agent',
            sport: 'NBA',
            url: `/sports/nba/player/${item.id}`,
            image: item.images?.[0]?.url || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${item.id}.png&w=350&h=254`
        };
    });
}

// --- 2. GET PLAYER PROFILE (FIXED 404 & 'FREE AGENT') ---
export async function getPlayerProfile(playerId: string) {
    try {
        const profileUrl = `${ESPN_BASE}/athletes/${playerId}`;
        const data = await fetchJson(profileUrl, 60);

        // 404 PREVENTION: If primary athlete data is missing, fail gracefully.
        if (!data || !data.athlete) {
            return null;
        }
        
        const ath = data.athlete;
        const team = ath.team || {};
        
        // Get Stat Summary
        const summary = ath.statsSummary?.statistics || [];
        const getStat = (name: string) => summary.find((s: any) => s.name === name)?.displayValue || '0.0';

        // --- FIX: Team Name Resolution ---
        // 1. Get the ESPN team ID from the primary profile data
        const teamId = team.id;
        // 2. Find the full team config from our static data
        const teamConfig = NBA_TEAMS.find(t => t.espnId === teamId);
        
        // 3. Set final name/ID for the return object
        const finalTeamName = teamConfig?.name || team.displayName || 'Free Agent';
        const finalTeamId = team.id;


        // Fetch Game Log (can fail, but profile must still return)
        let games: any[] = [];
        try {
            const logUrl = `${ESPN_BASE}/athletes/${playerId}/gamelog`;
            const logData = await fetchJson(logUrl, 60);

            // 4. Map Game Logs (FIX: Robust Stat Key Lookup)
            games = (logData?.events || []).slice(0, 5).map((e: any) => {
                 const stat = (key: string) => e.stats?.find((s:any) => s.name === key)?.displayValue || '0';
                 return {
                     date: new Date(e.gameDate).toLocaleDateString('en-US', {month:'short', day:'numeric'}),
                     opponent: e.opponent?.abbreviation || 'OPP',
                     result: e.gameResult || '-',
                     pts: stat('points'),
                     reb: stat('rebs') || stat('rebs'), // Try both keys
                     ast: stat('assists') || stat('asts'), // Try both keys
                     min: stat('minutes')
                 };
            });
        } catch(e) { /* Game log fetch failed, proceed with empty array */ }

        // Final Return: Contains the basic profile even if game log is missing, preventing 404.
        return {
            id: playerId,
            name: ath.displayName,
            team: finalTeamName,
            teamId: finalTeamId,
            number: ath.jersey,
            pos: ath.position?.abbreviation || 'N/A',
            height: ath.displayHeight,
            weight: ath.displayWeight,
            age: ath.age,
            born: ath.birthPlace?.city ? `${ath.birthPlace.city}, ${ath.birthPlace.state || ath.birthPlace.country}` : 'Unknown',
            image: ath.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${playerId}.png&w=350&h=254`,
            draft: ath.draft?.displayText || 'Undrafted',
            school: ath.college?.name || 'N/A',
            exp: ath.experience?.years ? `${ath.experience.years} Years` : 'Rookie',
            country: ath.citizenship,
            status: ath.status?.name || 'Active',
            seasonLabel: SEASON_DISPLAY,
            desc: `${ath.displayName} is a ${ath.position?.name?.toLowerCase()} for the ${finalTeamName}.`,
            stats: {
                ppg: getStat('ppg'),
                rpg: getStat('rpg'),
                apg: getStat('apg'),
                spg: getStat('spg') || '0.0', 
                bpg: getStat('bpg') || '0.0',
                topg: '0.0'
            },
            gameLog: games
        };

    } catch(e) { 
        console.error(`Final Profile Generation Error for ID ${playerId}`, e);
        return null; // Must return null if a fundamental error occurred.
    }
}

// --- 3. GET LEAGUE LEADERS ---
export async function getLeagueLeaders() {
    // ... no change needed in this function for the user's issue.
    try {
        const stars = ['LeBron James', 'Luka Doncic', 'Nikola Jokic', 'Shai Gilgeous-Alexander', 'Giannis Antetokounmpo'];
        const leaders = await Promise.all(stars.map(async (name) => {
             const [hit] = await searchPlayers(name);
             if(!hit) return null;
             // We need stats for the card
             const profile = await getPlayerProfile(hit.id);
             return {
                 id: hit.id,
                 name: hit.name,
                 team: hit.team,
                 image: hit.image,
                 stats: profile?.stats || { ppg: '-', rpg: '-', apg: '-' },
                 elo: '99.9', // Placeholder as ESPN doesn't give ELO
                 tier: 'ELITE'
             };
        }));

        return { 
            seasonLabel: `${SEASON_DISPLAY} SEASON`, 
            players: leaders.filter(Boolean) 
        };

    } catch (e) {
        return { seasonLabel: "DATA UNAVAILABLE", players: [] };
    }
}

// --- 4. STANDINGS (Keep Existing - It works) ---
export async function getStandings() {
    const data = await fetchJson(`${ESPN_BASE}/standings`, 60);
    
    if (!data || !data.children) return { east: [], west: [] };

    const east = data.children.find((c: any) => c.name === 'Eastern Conference' || c.abbreviation === 'EST');
    const west = data.children.find((c: any) => c.name === 'Western Conference' || c.abbreviation === 'WST');

    const formatTeam = (t: any) => {
        const getStat = (target: string) => t.stats?.find((s: any) => s.name === target || s.id === target || s.type === target || s.shortDisplayName === target)?.value;
        
        return {
            id: t.team.id,
            name: t.team.abbreviation || t.team.displayName,
            logo: t.team.logos?.[0]?.href,
            wins: getStat('wins') || 0,
            losses: getStat('losses') || 0,
            pct: getStat('winPercent') || 0,
            diff: getStat('avgPointDifferential') || 0,
            seed: getStat('playoffSeed'),
        };
    };

    const sortTeams = (a: any, b: any) => a.seed - b.seed;

    return {
        east: (east?.standings?.entries?.map(formatTeam) || []).sort(sortTeams),
        west: (west?.standings?.entries?.map(formatTeam) || []).sort(sortTeams)
    };
}

// --- 5. LIVE SCORES (Keep Existing - It works) ---
export async function getLiveScores() {
    const data = await fetchJson(`${ESPN_BASE}/scoreboard`, 30);
    if (!data?.events) return [];
    return data.events.map((e: any) => {
        const h = e.competitions[0].competitors.find((c:any)=>c.homeAway==='home');
        const a = e.competitions[0].competitors.find((c:any)=>c.homeAway==='away');
        return {
            id: e.id, name: e.name, shortName: e.shortName, status: e.status.type.shortDetail, isLive: e.status.type.state === 'in',
            home: { name: h.team.abbreviation, score: h.score, logo: h.team.logo },
            away: { name: a.team.abbreviation, score: a.score, logo: a.team.logo }
        };
    });
}

// --- 6. TEAM DATA ---
export async function getTeamData(espnId: string) {
    const [t, r, s] = await Promise.all([
        fetchJson(`${ESPN_BASE}/teams/${espnId}`),
        fetchJson(`${ESPN_BASE}/teams/${espnId}/roster`),
        fetchJson(`${ESPN_BASE}/teams/${espnId}/schedule`)
    ]);
    if (!t?.team) return null;
    return {
        id: t.team.id, name: t.team.displayName, logo: t.team.logos?.[0]?.href, color: t.team.color, record: t.team.record?.items?.[0]?.summary,
        roster: (r?.athletes || []).map((p: any) => ({
            id: p.id, name: p.fullName, pos: p.position.abbreviation, number: p.jersey, image: p.headshot?.href, height: p.displayHeight
        })),
        schedule: (s?.events || []).map((e: any) => ({
            id: e.id, date: e.date, shortName: e.shortName,
            result: e.competitions[0].competitors.find((c: any) => c.team.id === espnId)?.score?.value ? 'F' : 'S'
        })).reverse()
    };
}