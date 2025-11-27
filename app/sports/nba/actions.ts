'use server'

import { NBA_TEAMS } from './data';

// --- ENDPOINTS ---
const NBA_API = 'https://stats.nba.com/stats';
const ESPN_CORE = 'https://site.api.espn.com/apis/v2/sports/basketball/nba';
const ESPN_SITE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const ESPN_WEB = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba';

const SEASON = '2025-26'; 

// --- HEADERS ---
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); 
        const res = await fetch(url, { headers, next: { revalidate }, signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
};

const mapNbaResult = (data: any, setIndex = 0) => {
    if (!data || !data.resultSets || !data.resultSets[setIndex]) return [];
    const headers = data.resultSets[setIndex].headers;
    return data.resultSets[setIndex].rowSet.map((row: any[]) => {
        const obj: any = {};
        headers.forEach((h: string, i: number) => { obj[h] = row[i]; });
        return obj;
    });
};

// --- 1. GET LEAGUE LEADERS ---
export async function getLeagueLeaders() {
    const params = new URLSearchParams({
        MeasureType: 'Base', PerMode: 'PerGame', LeagueID: '00', Season: SEASON,
        SeasonType: 'Regular Season', Month: '0', TeamID: '0', Outcome: '', Location: '',
        SeasonSegment: '', DateFrom: '', DateTo: '', OpponentTeamID: '0', VsConference: '',
        VsDivision: '', GameSegment: '', Period: '0', ShotClockRange: '', LastNGames: '0'
    });

    const url = `${NBA_API}/leaguedashplayerstats?${params.toString()}`;
    const data = await fetchJson(url, NBA_HEADERS, 0);

    if (!data) return { seasonLabel: "API ERROR", players: [] };

    const allPlayers = mapNbaResult(data);
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

    return { seasonLabel: `${SEASON} LIVE`, players };
}

// --- 2. GET PLAYER PROFILE (FIXED STATS + ENHANCED BIO) ---
export async function getPlayerProfile(playerId: string) {
    // PATH A: NBA.COM (Accurate Stats via LeagueDash)
    try {
        // 1. Fetch Bio Info
        const infoUrl = `${NBA_API}/commonplayerinfo?PlayerID=${playerId}`;
        const infoData = await fetchJson(infoUrl, NBA_HEADERS);
        
        if (infoData) {
            const i = mapNbaResult(infoData, 0)[0];
            
            // 2. FETCH STATS - USING THE ROBUST ENDPOINT (Same as ELO Board)
            // We fetch the whole league list (cached/fast) and find this specific player.
            // This avoids the 'playerprofilev2' 403 block.
            const statsParams = new URLSearchParams({
                MeasureType: 'Base', PerMode: 'PerGame', LeagueID: '00', Season: SEASON,
                SeasonType: 'Regular Season', Month: '0', TeamID: '0', Outcome: '', Location: '',
                SeasonSegment: '', DateFrom: '', DateTo: '', OpponentTeamID: '0', VsConference: '',
                VsDivision: '', GameSegment: '', Period: '0', ShotClockRange: '', LastNGames: '0'
            });
            const statsUrl = `${NBA_API}/leaguedashplayerstats?${statsParams.toString()}`;
            const statsData = await fetchJson(statsUrl, NBA_HEADERS, 0);
            
            const allStats = mapNbaResult(statsData);
            const pStats = allStats.find((p: any) => p.PLAYER_ID.toString() === playerId) || {};

            // 3. Fetch Game Log
            const logUrl = `${NBA_API}/playergamelog?PlayerID=${playerId}&Season=${SEASON}&SeasonType=Regular+Season`;
            const logData = await fetchJson(logUrl, NBA_HEADERS);
            const logs = mapNbaResult(logData, 0).slice(0, 5).map((g: any) => ({
                date: g.GAME_DATE, opponent: g.MATCHUP.split(' ')[2], result: g.WL,
                pts: g.PTS, reb: g.REB, ast: g.AST, min: g.MIN
            }));

            // 4. Generate Bio
            const draftStr = i.DRAFT_YEAR && i.DRAFT_YEAR !== 'Undrafted' 
                ? `Selected ${i.DRAFT_NUMBER} overall in the ${i.DRAFT_YEAR} Draft (Round ${i.DRAFT_ROUND}).` 
                : 'Entered the league as an Undrafted Free Agent.';
            
            const schoolStr = i.SCHOOL && i.SCHOOL !== ' ' 
                ? `Alumni of ${i.SCHOOL}.` 
                : `Originates from ${i.COUNTRY}.`;

            const expStr = i.SEASON_EXP > 0 
                ? `Veteran presence with ${i.SEASON_EXP} years of league experience.` 
                : 'Currently in their rookie campaign.';

            const bioText = `${i.DISPLAY_FIRST_LAST} operates as a ${i.POSITION} for the ${i.TEAM_CITY} ${i.TEAM_NAME}. Standing ${i.HEIGHT} and weighing ${i.WEIGHT} lbs, this ${i.COUNTRY} native is a key asset to the rotation. ${draftStr} ${schoolStr} ${expStr}`;

            return {
                id: playerId, name: i.DISPLAY_FIRST_LAST, team: i.TEAM_NAME, teamId: i.TEAM_ID,
                number: i.JERSEY, pos: i.POSITION, height: i.HEIGHT, weight: i.WEIGHT,
                age: ((new Date().getTime() - new Date(i.BIRTHDATE).getTime()) / 31557600000).toFixed(0),
                born: i.BIRTHDATE, image: `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`,
                
                draft: i.DRAFT_YEAR === 'Undrafted' ? 'UNDRAFTED' : `${i.DRAFT_YEAR} / R${i.DRAFT_ROUND} / P${i.DRAFT_NUMBER}`,
                school: i.SCHOOL || i.COUNTRY,
                exp: i.SEASON_EXP,
                country: i.COUNTRY,
                
                status: 'Active', seasonLabel: SEASON, 
                desc: bioText,
                stats: {
                    ppg: (pStats.PTS || 0).toFixed(1),
                    rpg: (pStats.REB || 0).toFixed(1),
                    apg: (pStats.AST || 0).toFixed(1),
                    spg: (pStats.STL || 0).toFixed(1),
                    bpg: (pStats.BLK || 0).toFixed(1),
                    topg: (pStats.TOV || 0).toFixed(1)
                },
                gameLog: logs
            };
        }
    } catch(e) {}

    // PATH B: ESPN Fallback
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
                school: p.college?.name || 'N/A',
                exp: p.experience?.years || 0, 
                country: p.citizenship || 'N/A',
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

// --- 3. STANDINGS (ESPN) ---
export async function getStandings() {
    const data = await fetchJson(`${ESPN_CORE}/standings`, {}, 60);
    if (!data || !data.children) return { east: [], west: [] };

    const east = data.children.find((c: any) => c.name === 'Eastern Conference' || c.abbreviation === 'EST');
    const west = data.children.find((c: any) => c.name === 'Western Conference' || c.abbreviation === 'WST');

    const formatTeam = (t: any) => {
        const getStat = (target: string) => t.stats?.find((s: any) => s.name === target || s.id === target || s.type === target || s.shortDisplayName === target)?.value || 0;
        return {
            id: t.team.id, name: t.team.abbreviation, logo: t.team.logos?.[0]?.href,
            wins: getStat('wins'), losses: getStat('losses'), pct: getStat('winPercent'),
            diff: Number(getStat('avgPointDifferential') ?? getStat('pointDifferential') ?? 0).toFixed(1),
            seed: getStat('playoffSeed')
        };
    };

    return {
        east: (east?.standings?.entries?.map(formatTeam) || []).sort((a: any, b: any) => a.seed - b.seed),
        west: (west?.standings?.entries?.map(formatTeam) || []).sort((a: any, b: any) => a.seed - b.seed)
    };
}

// --- 4. LIVE SCORES ---
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

// --- 5. SEARCH ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];
    const url = `${NBA_API}/commonallplayers?IsOnlyCurrentSeason=1&LeagueID=00&Season=${SEASON}`;
    const data = await fetchJson(url, NBA_HEADERS);
    if (!data) return [];
    return mapNbaResult(data).filter((p: any) => p.DISPLAY_FIRST_LAST.toLowerCase().includes(query.toLowerCase())).slice(0, 10).map((p: any) => ({
        id: p.PERSON_ID.toString(), name: p.DISPLAY_FIRST_LAST, team: p.TEAM_NAME || 'NBA',
        image: `https://cdn.nba.com/headshots/nba/latest/1040x760/${p.PERSON_ID}.png`, pos: '', number: ''
    }));
}

// --- 6. TEAM DATA ---
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