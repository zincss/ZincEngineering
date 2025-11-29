'use server'

import { NRL_TEAMS } from './data';

// --- ENDPOINTS ---
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/rugby/nrl';
const SEASON = '2025'; 

// Internal ID -> ESPN ID Mapping
const ESPN_TEAM_IDS: Record<string, string> = {
    'broncos': '2407', 'raiders': '2408', 'bulldogs': '2409', 'sharks': '2410',
    'titans': '2411', 'sea-eagles': '2412', 'storm': '2413', 'knights': '2414',
    'cowboys': '2415', 'eels': '2416', 'panthers': '2417', 'rabbitohs': '2418',
    'dragons': '2419', 'roosters': '2420', 'warriors': '2421', 'tigers': '2422',
    'dolphins': '2722'
};

// --- HELPER: FETCH ---
const fetchJson = async (url: string, revalidate = 60) => {
    try {
        const res = await fetch(url, { next: { revalidate } });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
};

// --- 1. LIVE SCOREBOARD ---
export async function getLiveScores() {
    return [
        {
            id: 'rd1-game1',
            status: 'MAR 2 - 11:00 AM', 
            isLive: false,
            home: { name: 'Raiders', score: 'v', logo: 'https://www.nrl.com/client/dist/logos/raiders-badge.svg' },
            away: { name: 'Warriors', score: 's', logo: 'https://www.nrl.com/client/dist/logos/warriors-badge.svg' },
            venue: 'Allegiant Stadium, Las Vegas'
        },
        {
            id: 'rd1-game2',
            status: 'MAR 2 - 3:30 PM',
            isLive: false,
            home: { name: 'Panthers', score: 'v', logo: 'https://www.nrl.com/client/dist/logos/panthers-badge.svg' },
            away: { name: 'Sharks', score: 's', logo: 'https://www.nrl.com/client/dist/logos/sharks-badge.svg' },
            venue: 'Allegiant Stadium, Las Vegas'
        },
        {
            id: 'rd1-game3',
            status: 'MAR 6 - 8:00 PM',
            isLive: false,
            home: { name: 'Roosters', score: 'v', logo: 'https://www.nrl.com/client/dist/logos/roosters-badge.svg' },
            away: { name: 'Broncos', score: 's', logo: 'https://www.nrl.com/client/dist/logos/broncos-badge.svg' },
            venue: 'Allianz Stadium, Sydney'
        }
    ];
}

// --- 2. STANDINGS ---
export async function getStandings() {
    const data = await fetchJson(`${ESPN_BASE}/standings`);
    
    if (!data || !data.children) {
        const sortedTeams = [...NRL_TEAMS].sort((a, b) => a.name.localeCompare(b.name));
        return sortedTeams.map((team, i) => ({
            id: team.id,
            localId: team.id,
            name: team.name,
            logo: team.logo,
            rank: i + 1,
            wins: 0, losses: 0, points: 0, diff: 0,
        }));
    }

    const group = data.children[0]?.standings?.entries;
    if (!group) return [];

    return group.map((t: any) => {
        const getStat = (n: string) => t.stats?.find((s: any) => s.name === n)?.value || 0;
        const espnId = t.team.id;
        const defaultTeam = { id: 'unknown', logo: t.team.logos?.[0]?.href };
        const teamConfig = NRL_TEAMS.find(local => ESPN_TEAM_IDS[local.id] === espnId) || defaultTeam;

        return {
            id: t.team.id,
            localId: teamConfig.id,
            name: t.team.displayName,
            logo: t.team.logos?.[0]?.href,
            rank: getStat('rank') || t.seed,
            wins: getStat('wins'),
            losses: getStat('losses'),
            points: getStat('points'),
            diff: getStat('pointDifferential'),
        };
    });
}

// --- 3. LEAGUE LEADERS ---
export async function getLeagueLeaders() {
    return {
        seasonLabel: "2025 PRE-SEASON WATCH",
        players: [
            { id: 'jahream_bula', name: 'Jahream Bula', team: 'Wests Tigers', image: NRL_TEAMS.find(t=>t.id==='tigers')?.logo, stats: { ppg: '-', tries: '0', assists: '0', goals: '0' }, elo: 'RISING STAR', tier: 'ROOKIE TO WATCH' },
            { id: 'nathan_cleary', name: 'Nathan Cleary', team: 'Penrith Panthers', image: NRL_TEAMS.find(t=>t.id==='panthers')?.logo, stats: { ppg: '-', tries: '0', assists: '0', goals: '0' }, elo: '99.9', tier: 'REIGNING PREMIER' },
            { id: 'kalyn_ponga', name: 'Kalyn Ponga', team: 'Newcastle Knights', image: NRL_TEAMS.find(t=>t.id==='knights')?.logo, stats: { ppg: '-', tries: '0', assists: '0', goals: '0' }, elo: '98.5', tier: 'DALLY M MEDALIST' }
        ]
    };
}

// --- 4. PLAYER PROFILE ---
export async function getPlayerProfile(playerId: string) {
    try {
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${playerId}`);
        const wikiData = await wikiRes.json();
        
        if (wikiData.title) {
            return {
                id: playerId,
                name: wikiData.title.replace(/ \(rugby league\)/i, ''),
                team: "NRL", 
                pos: "First Grade",
                image: wikiData.thumbnail?.source,
                desc: wikiData.extract,
                stats: { apps: '0', tries: '0', goals: '0', winRate: '-' },
                bio: { height: '-', weight: '-', age: '-', debut: '-' }
            };
        }
    } catch (e) {}
    return null;
}

// --- 5. SEARCH PLAYERS (SMARTER WIKI SEARCH) ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 3) return [];

    try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " rugby league")}&format=json&origin=*`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (!data.query || !data.query.search) return [];

        const results = data.query.search.map((result: any) => {
            const cleanName = result.title.replace(/ \(rugby league\)/i, '').replace(/ \(rugby league player\)/i, '');
            const slug = result.title.replace(/ /g, '_');
            return {
                id: slug,
                name: cleanName,
                team: 'NRL Archive',
                sport: 'NRL',
                url: `/sports/nrl/player/${slug}`,
            };
        });

        // Filter out junk results that don't match query at all
        const lowerQ = query.toLowerCase();
        return results.filter((r: any) => r.name.toLowerCase().includes(lowerQ)).slice(0, 5);

    } catch (e) {
        return [];
    }
}

// --- 6. TEAM DATA ---
export async function getTeamData(teamId: string) {
    const team = NRL_TEAMS.find(t => t.id === teamId);
    if (!team) return null;

    return {
        id: team.id,
        name: team.name,
        logo: team.logo,
        color: team.color,
        record: '0-0',
        standing: 'PRE-SEASON',
        roster: []
    };
}