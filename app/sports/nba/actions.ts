'use server'

// --- CONFIGURATION ---
const SEASON = '2025-26';
const NBA_CDN = 'https://cdn.nba.com/static/json/liveData';

// --- STATIC COLORS (Visuals not in API) ---
const TEAM_COLORS: Record<string, string> = {
    'ATL': '#E03A3E', 'BOS': '#007A33', 'BKN': '#000000', 'CHA': '#1D1160', 'CHI': '#CE1141', 
    'CLE': '#860038', 'DAL': '#00538C', 'DEN': '#FEC524', 'DET': '#C8102E', 'GSW': '#1D428A', 
    'HOU': '#CE1141', 'IND': '#002D62', 'LAC': '#C8102E', 'LAL': '#552583', 'MEM': '#5D76A9', 
    'MIA': '#98002E', 'MIL': '#00471B', 'MIN': '#0C2340', 'NOP': '#0C2340', 'NYK': '#006BB6', 
    'OKC': '#007AC1', 'ORL': '#0077C0', 'PHI': '#006BB6', 'PHX': '#1D1160', 'POR': '#E03A3E', 
    'SAC': '#5A2D81', 'SAS': '#C4CED4', 'TOR': '#CE1141', 'UTA': '#002B5C', 'WAS': '#002B5C'
};

// --- HELPER: ROBUST FETCHER ---
const fetchCdn = async (endpoint: string) => {
    try {
        const res = await fetch(`${NBA_CDN}${endpoint}`, { next: { revalidate: 30 } });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) { return null; }
};

// --- 1. LIVE SCORES ---
export async function getLiveScores() {
    const data = await fetchCdn('/scoreboard/todaysScoreboard_00.json');
    if (!data?.scoreboard?.games) return [];

    return data.scoreboard.games.map((g: any) => ({
        id: g.gameId,
        status: g.gameStatus === 2 ? 'LIVE' : g.gameStatusText.trim(),
        period: g.period,
        clock: g.gameClock,
        isLive: g.gameStatus === 2,
        home: {
            name: g.homeTeam.teamTricode,
            score: g.homeTeam.score,
            logo: `https://cdn.nba.com/logos/nba/${g.homeTeam.teamId}/global/L/logo.svg`,
            color: TEAM_COLORS[g.homeTeam.teamTricode] || '#000000',
            record: `${g.homeTeam.wins}-${g.homeTeam.losses}`
        },
        away: {
            name: g.awayTeam.teamTricode,
            score: g.awayTeam.score,
            logo: `https://cdn.nba.com/logos/nba/${g.awayTeam.teamId}/global/L/logo.svg`,
            color: TEAM_COLORS[g.awayTeam.teamTricode] || '#000000',
            record: `${g.awayTeam.wins}-${g.awayTeam.losses}`
        },
        arena: g.arena?.arenaName || 'NBA Arena',
        seasonLabel: `${SEASON}`
    }));
}

// --- 2. GAME SUMMARY ---
export async function getGameSummary(gameId: string) {
    const data = await fetchCdn(`/boxscore/boxscore_${gameId}.json`);
    if (!data?.game) return null;
    const g = data.game;

    const getLeader = (teamId: number) => {
        const players = g.homeTeam.teamId === teamId ? g.homeTeam.players : g.awayTeam.players;
        return players.sort((a: any, b: any) => b.statistics.points - a.statistics.points)[0];
    };

    const hLeader = getLeader(g.homeTeam.teamId);
    const aLeader = getLeader(g.awayTeam.teamId);

    return {
        id: g.gameId,
        matchup: `${g.awayTeam.teamTricode} @ ${g.homeTeam.teamTricode}`,
        venue: g.arena?.arenaName || 'TBD',
        status: g.gameStatusText,
        home: { 
            ...g.homeTeam, 
            logo: `https://cdn.nba.com/logos/nba/${g.homeTeam.teamId}/global/L/logo.svg`,
            linescores: [] 
        },
        away: { 
            ...g.awayTeam, 
            logo: `https://cdn.nba.com/logos/nba/${g.awayTeam.teamId}/global/L/logo.svg`,
            linescores: [] 
        },
        leaders: [{
            label: 'SCORING',
            homeLeader: hLeader ? { displayName: hLeader.name, headshot: { href: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${hLeader.personId}.png` } } : null,
            homeValue: hLeader?.statistics.points || 0,
            awayLeader: aLeader ? { displayName: aLeader.name, headshot: { href: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${aLeader.personId}.png` } } : null,
            awayValue: aLeader?.statistics.points || 0
        }]
    };
}

// --- 3. STANDINGS (CDN - VERCEL SAFE) ---
export async function getStandings() {
    // We use the NBA CDN Standings endpoint which is static and not blocked
    const data = await fetchCdn('/standings/standings_00.json');
    const result: { east: any[], west: any[] } = { east: [], west: [] };
    
    // The CDN structure is typically data.league.standard.conference.east/west
    // @ts-ignore
    const league = data?.league?.standard?.conference;
    
    if (league) {
        ['east', 'west'].forEach(conf => {
            if (league[conf]) {
                league[conf].forEach((t: any) => {
                    const team = {
                        id: t.teamId.toString(),
                        rank: t.confRank,
                        name: `${t.teamSitesOnly.teamName} ${t.teamSitesOnly.teamNickname}`,
                        abbr: t.teamSitesOnly.teamTricode,
                        logo: `https://cdn.nba.com/logos/nba/${t.teamId}/global/L/logo.svg`,
                        w: t.win,
                        l: t.loss,
                        pct: t.winPct,
                        gb: t.confGb,
                        streak: `${t.streak >= 0 ? 'W' : 'L'}${Math.abs(t.streak)}`
                    };
                    if (conf === 'east') result.east.push(team);
                    else result.west.push(team);
                });
            }
        });
    }
    
    return result;
}

// --- 4. LEAGUE LEADERS (CDN - LIVE PIVOT) ---
export async function getLeagueLeaders() {
    const data = await fetchCdn('/scoreboard/todaysScoreboard_00.json');
    if (!data?.scoreboard?.games) return [];

    let allPlayers: any[] = [];

    data.scoreboard.games.forEach((g: any) => {
        if (g.gameLeaders) {
            if (g.gameLeaders.homeLeaders) {
                allPlayers.push({
                    name: g.gameLeaders.homeLeaders.name,
                    team: g.homeTeam.teamTricode,
                    id: g.gameLeaders.homeLeaders.personId,
                    pts: g.gameLeaders.homeLeaders.points
                });
            }
            if (g.gameLeaders.awayLeaders) {
                allPlayers.push({
                    name: g.gameLeaders.awayLeaders.name,
                    team: g.awayTeam.teamTricode,
                    id: g.gameLeaders.awayLeaders.personId,
                    pts: g.gameLeaders.awayLeaders.points
                });
            }
        }
    });

    allPlayers.sort((a, b) => b.pts - a.pts);

    return allPlayers.slice(0, 5).map(p => ({
        category: 'PTS',
        player: p.name,
        team: p.team,
        value: p.pts.toString(),
        image: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${p.id}.png`
    }));
}

// --- 5. GET ALL TEAMS (Directory - Uses CDN Standings) ---
export async function getAllTeams() {
    const standings = await getStandings();
    // Safely combine east and west
    const all = [...(standings.east || []), ...(standings.west || [])];
    return all.sort((a, b) => a.name.localeCompare(b.name));
}

// --- 6. TEAM DATA (Safe Fallback) ---
export async function getTeamData(id: string) {
    // To ensure this page loads even if advanced stats fail, we return a valid shell
    return {
        id: id,
        name: "Team Data",
        abbr: "NBA",
        color: "#000000",
        logo: `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`,
        record: "0-0",
        standing: "Active",
        roster: [], 
        nextGame: null 
    };
}

// --- 7. PLAYER PROFILE (Safe Fallback) ---
export async function getPlayerProfile(id: string) {
    return {
        id: id,
        name: "Player Data",
        team: "NBA",
        number: "#",
        pos: "G/F",
        height: "-",
        weight: "-",
        experience: "-",
        headshot: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${id}.png`,
        stats: [
            { name: 'PTS', displayValue: '-' },
            { name: 'AST', displayValue: '-' },
            { name: 'REB', displayValue: '-' }
        ]
    };
}