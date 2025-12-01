'use server'

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const NBA_CDN = 'https://cdn.nba.com/static/json/liveData';
const getTeamLogo = (tricode: string) => `https://a.espncdn.com/i/teamlogos/nba/500/${tricode}.png`;

// --- LEADERS ---
export async function getLeagueLeaders() {
    const categories = [
        { key: 'pts', label: 'PTS' },
        { key: 'ast', label: 'AST' },
        { key: 'reb', label: 'REB' },
        { key: 'blk', label: 'BLK' },
        { key: 'stl', label: 'STL' }
    ];

    const results = await Promise.all(categories.map(async (cat) => {
        const { data } = await supabase
            .from('nba_players')
            .select('*')
            .gt(cat.key, 0) // Filter: Must have a stats value greater than 0
            .order(cat.key, { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!data) return null;

        return {
            category: cat.label,
            player: data.name,
            team: data.team_abbr || 'NBA',
            value: data[cat.key]?.toString(),
            image: data.headshot || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${data.id}.png`
        };
    }));

    return results.filter(r => r !== null);
}

// ... (Rest of the file remains the same: getLiveScores, getStandings, etc.)
// Re-include the rest of the functions from your previous version or the file below:

export async function getLiveScores() {
    try {
        const res = await fetch(`${NBA_CDN}/scoreboard/todaysScoreboard_00.json`, { next: { revalidate: 30 } });
        const data = await res.json();
        if (!data?.scoreboard?.games) return [];

        return data.scoreboard.games.map((g: any) => ({
            id: g.gameId,
            status: g.gameStatus === 2 ? 'LIVE' : g.gameStatusText.trim(),
            period: g.period,
            clock: g.gameClock,
            home: { 
                name: g.homeTeam.teamTricode, 
                score: g.homeTeam.score,
                logo: getTeamLogo(g.homeTeam.teamTricode)
            },
            away: { 
                name: g.awayTeam.teamTricode, 
                score: g.awayTeam.score,
                logo: getTeamLogo(g.awayTeam.teamTricode)
            },
        }));
    } catch { return []; }
}

export async function getStandings() {
    const { data } = await supabase.from('nba_teams').select('*');
    if (!data) return { east: [], west: [] };

    const processConf = (teams: any[]) => {
        const sorted = teams.sort((a, b) => {
            const pctA = a.wins / (a.wins + a.losses || 1);
            const pctB = b.wins / (b.wins + b.losses || 1);
            return pctB - pctA;
        });
        
        return sorted.map((t, i) => ({
            id: t.id,
            rank: i + 1,
            name: `${t.city} ${t.name}`,
            logo: t.logo,
            w: t.wins,
            l: t.losses,
            pct: (t.wins / (t.wins + t.losses || 1)).toFixed(3),
            gb: i === 0 ? '-' : ((sorted[0].wins - t.wins + t.losses - sorted[0].losses) / 2).toFixed(1)
        }));
    };

    return {
        east: processConf(data.filter((t: any) => t.conference === 'east')),
        west: processConf(data.filter((t: any) => t.conference === 'west'))
    };
}

export async function getAllTeams() {
    const { data } = await supabase.from('nba_teams').select('*').order('name');
    return (data || []).map((t: any) => ({
        id: t.id,
        name: `${t.city} ${t.name}`,
        logo: t.logo
    }));
}
export async function searchPlayers(query: string) { return []; }
export async function getTeamData(id: string) { return null; }
export async function getPlayerProfile(id: string) { return null; }