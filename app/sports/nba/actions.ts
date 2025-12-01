'use server'

// --- CONFIGURATION ---
const SEASON = '2025-26'; // Current Season Context
const NBA_CDN = 'https://cdn.nba.com/static/json/liveData';
const NBA_STATS_API = 'https://stats.nba.com/stats';

// Valid headers to bypass NBA Stats strict firewall
const HEADERS = {
    'Host': 'stats.nba.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Connection': 'keep-alive',
    'x-nba-stats-origin': 'stats',
    'x-nba-stats-token': 'true'
};

// --- STATIC TEAM DATA (Colors aren't in the API) ---
const TEAM_COLORS: Record<string, string> = {
    'ATL': '#E03A3E', 'BOS': '#007A33', 'BKN': '#000000', 'CHA': '#1D1160', 
    'CHI': '#CE1141', 'CLE': '#860038', 'DAL': '#00538C', 'DEN': '#FEC524', 
    'DET': '#C8102E', 'GSW': '#1D428A', 'HOU': '#CE1141', 'IND': '#002D62', 
    'LAC': '#C8102E', 'LAL': '#552583', 'MEM': '#5D76A9', 'MIA': '#98002E', 
    'MIL': '#00471B', 'MIN': '#0C2340', 'NOP': '#0C2340', 'NYK': '#006BB6', 
    'OKC': '#007AC1', 'ORL': '#0077C0', 'PHI': '#006BB6', 'PHX': '#1D1160', 
    'POR': '#E03A3E', 'SAC': '#5A2D81', 'SAS': '#C4CED4', 'TOR': '#CE1141', 
    'UTA': '#002B5C', 'WAS': '#002B5C'
};

// --- HELPER: FETCHERS ---

// 1. Fetch from NBA CDN (Live Data - Fast, Open)
const fetchCdn = async (endpoint: string) => {
    try {
        const res = await fetch(`${NBA_CDN}${endpoint}`, { next: { revalidate: 30 } });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) { return null; }
};

// 2. Fetch from NBA Stats (Historical/Deep Data - Protected)
const fetchStats = async (endpoint: string, params: Record<string, string>) => {
    try {
        const url = new URL(`${NBA_STATS_API}/${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        const res = await fetch(url.toString(), { 
            headers: HEADERS,
            next: { revalidate: 3600 } // Cache for 1 hour to be safe
        });
        
        if (!res.ok) return null;
        const data = await res.json();
        
        // NBA Stats API returns "resultSets" with "headers" and "rowSet".
        // We map this to a usable array of objects.
        if (data.resultSets && data.resultSets.length > 0) {
            const headers = data.resultSets[0].headers;
            const rows = data.resultSets[0].rowSet;
            return rows.map((row: any) => {
                const obj: any = {};
                headers.forEach((h: string, i: number) => {
                    obj[h] = row[i];
                });
                return obj;
            });
        }
        return [];
    } catch (e) { 
        console.error(`NBA Stats Error (${endpoint}):`, e);
        return []; 
    }
};

// --- ACTION 1: LIVE SCORES ---
export async function getLiveScores() {
    const data = await fetchCdn('/scoreboard/todaysScoreboard_00.json');
    
    if (!data || !data.scoreboard || !data.scoreboard.games) return [];

    return data.scoreboard.games.map((g: any) => ({
        id: g.gameId,
        status: g.gameStatus === 2 ? 'LIVE' : g.gameStatusText.replace(' pm', ' PM').replace(' am', ' AM'),
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
        // FIX: Safe access for arena
        arena: g.arena?.arenaName || 'TBD',
        seasonLabel: `${SEASON} SEASON`
    }));
}

// --- ACTION 2: GAME SUMMARY ---
export async function getGameSummary(gameId: string) {
    const data = await fetchCdn(`/boxscore/boxscore_${gameId}.json`);
    if (!data || !data.game) return null;

    const g = data.game;

    // Helper to find top performer
    const getLeader = (teamId: number) => {
        const players = g.homeTeam.teamId === teamId ? g.homeTeam.players : g.awayTeam.players;
        if (!players || players.length === 0) return null;
        return players.sort((a: any, b: any) => b.statistics.points - a.statistics.points)[0];
    };

    const hLeader = getLeader(g.homeTeam.teamId);
    const aLeader = getLeader(g.awayTeam.teamId);

    return {
        id: g.gameId,
        matchup: `${g.awayTeam.teamTricode} @ ${g.homeTeam.teamTricode}`,
        // FIX: Safe access for arena
        venue: g.arena?.arenaName || 'TBD',
        status: g.gameStatusText,
        home: {
            id: g.homeTeam.teamId,
            displayName: g.homeTeam.teamName,
            abbreviation: g.homeTeam.teamTricode,
            score: g.homeTeam.score,
            logo: `https://cdn.nba.com/logos/nba/${g.homeTeam.teamId}/global/L/logo.svg`,
            linescores: [], 
        },
        away: {
            id: g.awayTeam.teamId,
            displayName: g.awayTeam.teamName,
            abbreviation: g.awayTeam.teamTricode,
            score: g.awayTeam.score,
            logo: `https://cdn.nba.com/logos/nba/${g.awayTeam.teamId}/global/L/logo.svg`,
            linescores: [],
        },
        leaders: [
            {
                label: 'SCORING',
                homeLeader: hLeader ? { displayName: hLeader.name, headshot: { href: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${hLeader.personId}.png` } } : null,
                homeValue: hLeader ? hLeader.statistics.points : '-',
                awayLeader: aLeader ? { displayName: aLeader.name, headshot: { href: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${aLeader.personId}.png` } } : null,
                awayValue: aLeader ? aLeader.statistics.points : '-'
            }
        ]
    };
}

// --- ACTION 3: STANDINGS ---
export async function getStandings() {
    const rows = await fetchStats('leaguestandingsv3', {
        'LeagueID': '00',
        'Season': SEASON,
        'SeasonType': 'Regular Season'
    });

    // FIX: Explicit typing to prevent 'never[]' error
    const result: { east: any[], west: any[] } = { east: [], west: [] };
    
    if (rows && rows.length > 0) {
        rows.forEach((t: any) => {
            const team = {
                id: t.TeamID.toString(),
                rank: t.PlayoffRank || t.ConferenceRank,
                name: `${t.TeamCity} ${t.TeamName}`,
                abbr: t.TeamSlug,
                logo: `https://cdn.nba.com/logos/nba/${t.TeamID}/global/L/logo.svg`,
                w: t.WINS,
                l: t.LOSSES,
                pct: t.WinPCT.toFixed(3),
                gb: t.ConferenceGamesBack.toString().replace('0.0', '-'),
                streak: t.strCurrentStreak
            };

            if (t.Conference === 'East') result.east.push(team);
            else result.west.push(team);
        });
    }
    
    // Sort by Rank
    result.east.sort((a, b) => a.rank - b.rank);
    result.west.sort((a, b) => a.rank - b.rank);

    return result;
}

// --- ACTION 4: LEAGUE LEADERS ---
export async function getLeagueLeaders() {
    const rows = await fetchStats('leagueleaders', {
        'LeagueID': '00',
        'PerMode': 'PerGame',
        'Scope': 'S',
        'Season': SEASON,
        'SeasonType': 'Regular Season',
        'StatCategory': 'PTS'
    });

    if (!rows || rows.length === 0) return [];

    return rows.slice(0, 4).map((p: any) => ({
        category: 'PTS',
        player: p.PLAYER,
        team: p.TEAM,
        value: p.PTS.toFixed(1),
        image: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${p.PLAYER_ID}.png`
    }));
}

// --- ACTION 5: SEARCH ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];
    
    const rows = await fetchStats('playerindex', {
        'LeagueID': '00',
        'Season': SEASON,
        'ActivePlayers': '1' 
    });

    if (!rows) return [];

    const lowerQ = query.toLowerCase();
    
    return rows
        .filter((p: any) => 
            p.PLAYER_FIRST_NAME.toLowerCase().includes(lowerQ) || 
            p.PLAYER_LAST_NAME.toLowerCase().includes(lowerQ)
        )
        .slice(0, 5)
        .map((p: any) => ({
            id: p.PERSON_ID.toString(),
            name: `${p.PLAYER_FIRST_NAME} ${p.PLAYER_LAST_NAME}`,
            team: p.TEAM_ABBREVIATION,
            sport: 'NBA',
            url: `/sports/nba/player/${p.PERSON_ID}`,
            image: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${p.PERSON_ID}.png`
        }));
}

// --- ACTION 6: TEAM DATA ---
export async function getTeamData(id: string) {
    const infoRows = await fetchStats('teaminfocommon', {
        'LeagueID': '00',
        'Season': SEASON,
        'TeamID': id,
        'SeasonType': 'Regular Season'
    });
    
    const rosterRows = await fetchStats('commonteamroster', {
        'LeagueID': '00',
        'Season': SEASON,
        'TeamID': id
    });

    if (!infoRows || infoRows.length === 0) return null;
    const info = infoRows[0];

    const roster = rosterRows ? rosterRows.map((p: any) => ({
        id: p.PLAYER_ID.toString(),
        name: p.PLAYER,
        number: p.NUM,
        pos: p.POSITION,
        height: p.HEIGHT,
        headshot: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${p.PLAYER_ID}.png`
    })) : [];

    return {
        id: id,
        name: `${info.TEAM_CITY} ${info.TEAM_NAME}`,
        abbr: info.TEAM_ABBREVIATION,
        color: TEAM_COLORS[info.TEAM_ABBREVIATION] || '#000000',
        logo: `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`,
        record: `${info.W}-${info.L}`,
        standing: `${info.CONF_RANK} in ${info.TEAM_CONFERENCE}`,
        roster: roster,
        nextGame: null 
    };
}

// --- ACTION 7: PLAYER PROFILE ---
export async function getPlayerProfile(id: string) {
    const rows = await fetchStats('commonplayerinfo', {
        'PlayerID': id,
        'LeagueID': '00'
    });

    if (!rows || rows.length === 0) return null;
    const p = rows[0];

    // MOCKING the stats array structure for the UI to consume safely
    // In a production environment, you would call 'playerprofilev2' and parse the result sets
    const displayStats = [
        { name: 'PTS', displayValue: p.PTS || '-' },
        { name: 'AST', displayValue: p.AST || '-' },
        { name: 'REB', displayValue: p.REB || '-' }
    ];

    return {
        id: p.PERSON_ID.toString(),
        name: p.DISPLAY_FIRST_LAST,
        team: `${p.TEAM_CITY} ${p.TEAM_NAME}`,
        number: p.JERSEY,
        pos: p.POSITION,
        height: p.HEIGHT,
        weight: p.WEIGHT,
        experience: p.SEASON_EXP,
        headshot: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${p.PERSON_ID}.png`,
        stats: displayStats
    };
}