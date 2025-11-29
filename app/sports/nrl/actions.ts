'use server'

import { NRL_TEAMS } from './data';

// --- CONFIG ---
const TSDB_KEY = '3'; // Public test key
const TSDB_BASE = 'https://www.thesportsdb.com/api/v1/json';

// --- 1. SEARCH PLAYERS (STRICT MATCHING) ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];

    const cleanQuery = query.toLowerCase().trim();

    try {
        let results: any[] = [];

        // STRATEGY A: TheSportsDB (Best for Active/Famous Players)
        const tsdbRes = await fetch(`${TSDB_BASE}/${TSDB_KEY}/searchplayers.php?p=${encodeURIComponent(query)}`);
        const tsdbData = await tsdbRes.json();

        if (tsdbData.player) {
            results = tsdbData.player
                .filter((p: any) => p.strSport === 'Rugby League' || p.strLeague === 'NRL')
                .map((p: any) => ({
                    id: p.idPlayer || p.strPlayer.replace(/\s+/g, '_').toLowerCase(),
                    name: p.strPlayer,
                    team: p.strTeam || 'NRL',
                    sport: 'NRL',
                    url: `/sports/nrl/player/${p.strPlayer.replace(/\s+/g, '_').toLowerCase()}`,
                    image: p.strCutout || p.strThumb
                }));
        }

        // STRATEGY B: Wikipedia Fallback (If TSDB fails)
        if (results.length < 3) {
            const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " rugby league player")}&format=json&origin=*`);
            const wikiData = await wikiRes.json();

            if (wikiData.query?.search) {
                const wikiHits = wikiData.query.search
                    .filter((hit: any) => {
                        const title = hit.title.toLowerCase();
                        // 1. MUST NOT be a list, season, or team page
                        if (title.includes('list of') || title.includes('season') || title.includes('cup') || title.includes('team')) return false;
                        return true;
                    })
                    .map((hit: any) => {
                        const name = hit.title.replace(/ \(rugby league.*?\)/i, '');
                        return {
                            id: name.replace(/\s+/g, '_').toLowerCase(),
                            name: name,
                            team: 'NRL Archive',
                            sport: 'NRL',
                            url: `/sports/nrl/player/${name.replace(/\s+/g, '_').toLowerCase()}`,
                            image: null
                        };
                    });

                // Merge unique hits
                const existingIds = new Set(results.map(r => r.name.toLowerCase()));
                wikiHits.forEach((hit: any) => {
                    if (!existingIds.has(hit.name.toLowerCase())) {
                        results.push(hit);
                    }
                });
            }
        }

        // --- THE FIX: STRICT FILTER ---
        // Remove anything that doesn't actually contain the search query
        return results
            .filter(player => player.name.toLowerCase().includes(cleanQuery))
            .sort((a, b) => {
                // Priority: Starts With > Contains
                const aStarts = a.name.toLowerCase().startsWith(cleanQuery);
                const bStarts = b.name.toLowerCase().startsWith(cleanQuery);
                if (aStarts && !bStarts) return -1;
                if (bStarts && !aStarts) return 1;
                return 0;
            })
            .slice(0, 5);

    } catch (e) {
        console.error("NRL Search Failed", e);
        return [];
    }
}

// --- 2. PLAYER PROFILE ---
export async function getPlayerProfile(playerId: string) {
    try {
        const searchTerm = playerId.replace(/_/g, ' ');
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`);
        const wikiData = await wikiRes.json();
        
        if (wikiData.title) {
            return {
                id: playerId,
                name: wikiData.title.replace(/ \(rugby league.*?\)/i, ''),
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

// --- 3. LIVE SCOREBOARD ---
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

// --- 4. STANDINGS ---
export async function getStandings() {
    const data = await fetchJson('https://site.api.espn.com/apis/site/v2/sports/rugby/nrl/standings');
    
    const ESPN_TEAM_IDS: Record<string, string> = {
        'broncos': '2407', 'raiders': '2408', 'bulldogs': '2409', 'sharks': '2410',
        'titans': '2411', 'sea-eagles': '2412', 'storm': '2413', 'knights': '2414',
        'cowboys': '2415', 'eels': '2416', 'panthers': '2417', 'rabbitohs': '2418',
        'dragons': '2419', 'roosters': '2420', 'warriors': '2421', 'tigers': '2422',
        'dolphins': '2722'
    };
    
    if (!data || !data.children) {
        return NRL_TEAMS.map((team, i) => ({
            id: team.id, localId: team.id, name: team.name, logo: team.logo,
            rank: i + 1, wins: 0, losses: 0, points: 0, diff: 0,
        }));
    }

    const group = data.children[0]?.standings?.entries;
    return group.map((t: any) => {
        const getStat = (n: string) => t.stats?.find((s: any) => s.name === n)?.value || 0;
        const espnId = t.team.id;
        const defaultTeam = { id: 'unknown', logo: t.team.logos?.[0]?.href };
        const teamConfig = NRL_TEAMS.find(local => ESPN_TEAM_IDS[local.id] === espnId) || defaultTeam;

        return {
            id: t.team.id, localId: teamConfig.id, name: t.team.displayName, logo: t.team.logos?.[0]?.href,
            rank: getStat('rank') || t.seed, wins: getStat('wins'), losses: getStat('losses'),
            points: getStat('points'), diff: getStat('pointDifferential'),
        };
    });
}

// --- 5. LEAGUE LEADERS ---
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

const fetchJson = async (url: string, revalidate = 60) => {
    try {
        const res = await fetch(url, { next: { revalidate } });
        return res.ok ? await res.json() : null;
    } catch (e) { return null; }
};