'use server'

import { NBA_TEAMS } from './data';

// --- ENDPOINTS ---
const NBA_API = 'https://stats.nba.com/stats';
const ESPN_CORE = 'https://site.api.espn.com/apis/v2/sports/basketball/nba';
const ESPN_SITE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const ESPN_WEB = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba';

const SEASON_NBA = '2025-26'; 
const SEASON_ESPN = '2026';

// --- HEADERS (For NBA.com) ---
// These trick the API locally, but Vercel IPs are often flagged regardless.
const NBA_HEADERS = {
    'Referer': 'https://www.nba.com/',
    'Connection': 'keep-alive',
    'Origin': 'https://www.nba.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'x-nba-stats-origin': 'stats',
    'x-nba-stats-token': 'true'
};

// --- HELPER: FETCH ---
const fetchJson = async (url: string, headers: any = {}, revalidate = 60) => {
    try {
        // Short timeout to fail fast if NBA blocks Vercel
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500); 
        
        const res = await fetch(url, { headers, next: { revalidate }, signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
};

// --- HELPER: NBA MAPPER ---
const mapNbaResult = (data: any, setIndex = 0) => {
    if (!data || !data.resultSets || !data.resultSets[setIndex]) return [];
    const headers = data.resultSets[setIndex].headers;
    return data.resultSets[setIndex].rowSet.map((row: any[]) => {
        const obj: any = {};
        headers.forEach((h: string, i: number) => { obj[h] = row[i]; });
        return obj;
    });
};

// --- 1. GET LEAGUE LEADERS (DUAL-ENGINE) ---
export async function getLeagueLeaders() {
    // --- ENGINE A: NBA.COM (Works Locally / High Precision) ---
    try {
        const params = new URLSearchParams({
            MeasureType: 'Base', PerMode: 'PerGame', LeagueID: '00', Season: SEASON_NBA,
            SeasonType: 'Regular Season', Month: '0', TeamID: '0', Outcome: '', Location: '',
            SeasonSegment: '', DateFrom: '', DateTo: '', OpponentTeamID: '0', VsConference: '',
            VsDivision: '', GameSegment: '', Period: '0', ShotClockRange: '', LastNGames: '0'
        });

        const url = `${NBA_API}/leaguedashplayerstats?${params.toString()}`;
        const nbaData = await fetchJson(url, NBA_HEADERS, 0); // No cache for live

        if (nbaData) {
            const allPlayers = mapNbaResult(nbaData);
            const sorted = allPlayers.sort((a: any, b: any) => b.PTS - a.PTS).slice(0, 50);

            const players = sorted.map((p: any) => ({
                id: p.PLAYER_ID.toString(),
                name: p.PLAYER_NAME,
                team: p.TEAM_ABBREVIATION,
                image: `https://cdn.nba.com/headshots/nba/latest/1040x760/${p.PLAYER_ID}.png`,
                stats: {
                    ppg: p.PTS.toFixed(1),
                    rpg: p.REB.toFixed(1),
                    apg: p.AST.toFixed(1),
                    spg: p.STL.toFixed(1),
                    bpg: p.BLK.toFixed(1),
                    topg: p.TOV.toFixed(1)
                },
                elo: (p.PTS + p.REB * 1.2 + p.AST * 1.5 + p.STL * 2 + p.BLK * 2 - p.TOV).toFixed(1),
                tier: p.PTS >= 30 ? 'MVP' : p.PTS >= 25 ? 'ELITE' : 'STAR'
            }));

            return { seasonLabel: `${SEASON_NBA} LIVE`, players };
        }
    } catch (e) { console.log('NBA Primary Failed, switching to backup...'); }

    // --- ENGINE B: ESPN FALLBACK (Works on Vercel) ---
    try {
        const espnUrl = `${ESPN_WEB}/statistics/byathlete?sort=offensive.avgPoints%3Adesc&limit=50&isqualified=true&season=${SEASON_ESPN}`;
        const espnData = await fetchJson(espnUrl, {}, 60);

        if (espnData && espnData.athletes) {
            const players = espnData.athletes.map((a: any) => {
                const s = a.statistics;
                const getStat = (n: string) => s.find((x: any) => x.name === n)?.value || 0;
                
                const ppg = getStat('offensive.avgPoints');
                const rpg = getStat('defensive.avgRebounds') + getStat('offensive.avgRebounds');
                const apg = getStat('offensive.avgAssists');
                
                return {
                    id: a.athlete.id,
                    name: a.athlete.displayName,
                    team: a.athlete.team?.abbreviation || 'NBA',
                    image: a.athlete.headshot?.href,
                    stats: {
                        ppg: ppg.toFixed(1),
                        rpg: rpg.toFixed(1),
                        apg: apg.toFixed(1),
                        spg: getStat('defensive.avgSteals').toFixed(1),
                        bpg: getStat('defensive.avgBlocks').toFixed(1),
                        topg: getStat('general.avgTurnovers').toFixed(1)
                    },
                    elo: (ppg + rpg * 1.2 + apg * 1.5).toFixed(1),
                    tier: ppg >= 30 ? 'MVP FAVORITE' : 'ALL-STAR'
                };
            });
            return { seasonLabel: `${SEASON_NBA} (CLOUD)`, players };
        }
    } catch (e) { console.error('ESPN Backup Failed', e); }

    return { seasonLabel: "DATA UNAVAILABLE", players: [] };
}

// --- 2. GET STANDINGS (ESPN) ---
export async function getStandings() {
    const data = await fetchJson(`${ESPN_CORE}/standings`, {}, 60);
    
    if (!data || !data.children) return { east: [], west: [] };

    const east = data.children.find((c: any) => c.name === 'Eastern Conference' || c.abbreviation === 'EST');
    const west = data.children.find((c: any) => c.name === 'Western Conference' || c.abbreviation === 'WST');

    const formatTeam = (t: any) => {
        const getStat = (target: string) => {
            return t.stats?.find((s: any) => 
                s.name === target || 
                s.id === target || 
                s.type === target || 
                s.shortDisplayName === target
            )?.value;
        };

        const rawDiff = getStat('avgPointDifferential') ?? getStat('pointDifferential') ?? getStat('diff') ?? 0;
        
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

    const sortTeams = (a: any, b: any) => a.seed - b.seed;

    return {
        east: (east?.standings?.entries?.map(formatTeam) || []).sort(sortTeams),
        west: (west?.standings?.entries?.map(formatTeam) || []).sort(sortTeams)
    };
}

// --- 3. GET PLAYER PROFILE (HYBRID) ---
export async function getPlayerProfile(playerId: string) {
    // Attempt A: NBA.com (High Fidelity)
    try {
        const info = await fetchJson(`${NBA_API}/commonplayerinfo?PlayerID=${playerId}`, NBA_HEADERS);
        
        if (info) {
            const i = mapNbaResult(info, 0)[0];
            
            // Re-use the robust league-wide stats logic to avoid profile blocking
            const statsParams = new URLSearchParams({
                MeasureType: 'Base', PerMode: 'PerGame', LeagueID: '00', Season: SEASON_NBA,
                SeasonType: 'Regular Season', Month: '0', TeamID: '0', Outcome: '', Location: '',
                SeasonSegment: '', DateFrom: '', DateTo: '', OpponentTeamID: '0', VsConference: '',
                VsDivision: '', GameSegment: '', Period: '0', ShotClockRange: '', LastNGames: '0'
            });
            
            const statsData = await fetchJson(`${NBA_API}/leaguedashplayerstats?${statsParams}`, NBA_HEADERS, 0);
            const allStats = mapNbaResult(statsData);
            const pStats = allStats.find((p: any) => p.PLAYER_ID.toString() === playerId) || {};

            const log = await fetchJson(`${NBA_API}/playergamelog?PlayerID=${playerId}&Season=${SEASON_NBA}&SeasonType=Regular+Season`, NBA_HEADERS);
            const games = mapNbaResult(log, 0).slice(0, 5).map((g: any) => ({
                date: g.GAME_DATE, opponent: g.MATCHUP.split(' ')[2], result: g.WL,
                pts: g.PTS, reb: g.REB, ast: g.AST, min: g.MIN
            }));

            // Generate Narrative
            const bioText = `${i.DISPLAY_FIRST_LAST} operates as a ${i.POSITION} for the ${i.TEAM_CITY} ${i.TEAM_NAME}. Standing ${i.HEIGHT} and weighing ${i.WEIGHT} lbs, this ${i.COUNTRY} native is a key asset to the rotation.`;

            return {
                id: playerId, name: i.DISPLAY_FIRST_LAST, team: i.TEAM_NAME, teamId: i.TEAM_ID,
                number: i.JERSEY, pos: i.POSITION, height: i.HEIGHT, weight: i.WEIGHT,
                age: ((new Date().getTime() - new Date(i.BIRTHDATE).getTime()) / 31557600000).toFixed(0),
                born: i.BIRTHDATE, image: `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`,
                draft: i.DRAFT_YEAR === 'Undrafted' ? 'UNDRAFTED' : `${i.DRAFT_YEAR} / R${i.DRAFT_ROUND} / P${i.DRAFT_NUMBER}`,
                school: i.SCHOOL || i.COUNTRY, exp: i.SEASON_EXP, country: i.COUNTRY,
                status: 'Active', seasonLabel: SEASON_NBA, desc: bioText,
                stats: {
                    ppg: (pStats.PTS || 0).toFixed(1),
                    rpg: (pStats.REB || 0).toFixed(1),
                    apg: (pStats.AST || 0).toFixed(1),
                    spg: (pStats.STL || 0).toFixed(1),
                    bpg: (pStats.BLK || 0).toFixed(1),
                    topg: (pStats.TOV || 0).toFixed(1)
                },
                gameLog: games
            };
        }
    } catch(e) {}

    // Attempt B: ESPN Fallback
    try {
        const data = await fetchJson(`${ESPN_WEB}/athletes/${playerId}/overview`);
        if (data?.athlete) {
            const p = data.athlete;
            const seasons = data.statistics?.regularSeason?.seasons || [];
            const latestSeason = seasons.sort((a: any, b: any) => b.year - a.year)[0];
            const labels = data.statistics?.names || [];
            
            const getVal = (k: string) => {
                const i = labels.indexOf(k);
                return (i > -1 && latestSeason) ? parseFloat(latestSeason.stats[i]).toFixed(1) : '0.0';
            };

            return {
                id: p.id, name: p.fullName, team: p.team?.displayName || 'Free Agent',
                image: p.headshot?.href, seasonLabel: latestSeason ? latestSeason.year : 'N/A',
                draft: p.draft?.year ? `${p.draft.year} / R${p.draft.round} / P${p.draft.selection}` : 'N/A',
                school: p.college?.name || 'N/A', exp: p.experience?.years || 0, country: p.citizenship || 'N/A',
                desc: `Tactical profile for ${p.fullName}. Professional basketball player for the ${p.team?.displayName || 'NBA'}. Awaiting full biometric sync from primary database.`,
                stats: {
                    ppg: getVal('PTS'), rpg: getVal('REB'), apg: getVal('AST'),
                    spg: getVal('STL'), bpg: getVal('BLK'), topg: getVal('TO')
                },
                gameLog: [] 
            };
        }
    } catch(e) {}

    return null;
}

// --- 4. LIVE SCORES (ESPN) ---
export async function getLiveScores() {
    const data = await fetchJson(`${ESPN_SITE}/scoreboard`, {}, 30);
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

// --- 5. SEARCH (NBA) ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];
    const url = `${NBA_API}/commonallplayers?IsOnlyCurrentSeason=1&LeagueID=00&Season=${SEASON_NBA}`;
    const data = await fetchJson(url, NBA_HEADERS);
    if (!data) return [];
    return mapNbaResult(data).filter((p: any) => p.DISPLAY_FIRST_LAST.toLowerCase().includes(query.toLowerCase())).slice(0, 10).map((p: any) => ({
        id: p.PERSON_ID.toString(), name: p.DISPLAY_FIRST_LAST, team: p.TEAM_NAME || 'NBA',
        image: `https://cdn.nba.com/headshots/nba/latest/1040x760/${p.PERSON_ID}.png`, pos: '', number: ''
    }));
}

// --- 6. TEAM DATA (ESPN) ---
export async function getTeamData(espnId: string) {
    const [t, r, s] = await Promise.all([
        fetchJson(`${ESPN_SITE}/teams/${espnId}`),
        fetchJson(`${ESPN_SITE}/teams/${espnId}/roster`),
        fetchJson(`${ESPN_SITE}/teams/${espnId}/schedule`)
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