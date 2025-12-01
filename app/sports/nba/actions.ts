'use server'

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const NBA_CDN = 'https://cdn.nba.com/static/json/liveData';
const DEFAULT_HEADSHOT = 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png';

// --- 1. LIVE SCORES ---
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
            isLive: g.gameStatus === 2,
            home: {
                name: g.homeTeam.teamTricode,
                score: g.homeTeam.score,
                logo: `https://cdn.nba.com/logos/nba/${g.homeTeam.teamId}/global/L/logo.svg`,
                record: `${g.homeTeam.wins}-${g.homeTeam.losses}`
            },
            away: {
                name: g.awayTeam.teamTricode,
                score: g.awayTeam.score,
                logo: `https://cdn.nba.com/logos/nba/${g.awayTeam.teamId}/global/L/logo.svg`,
                record: `${g.awayTeam.wins}-${g.awayTeam.losses}`
            },
            arena: g.arena?.arenaName || 'NBA Arena',
            seasonLabel: '2025-26 SEASON'
        }));
    } catch { return []; }
}

// --- 2. STANDINGS (FIXED) ---
export async function getStandings() {
    // Fetch all teams; we will sort and rank them manually to ensure accuracy
    const { data } = await supabase.from('nba_teams').select('*');
    const result: { east: any[], west: any[] } = { east: [], west: [] };

    if (data) {
        // Helper: Calculate Winning Percentage
        const getPct = (w: number, l: number) => {
            const total = w + l;
            return total === 0 ? 0 : w / total;
        };

        // 1. Separate Teams by Conference (Case-insensitive check)
        const eastTeams = data.filter((t: any) => t.conference?.toLowerCase().includes('east'));
        const westTeams = data.filter((t: any) => t.conference?.toLowerCase().includes('west'));

        // 2. Sort Function (Win % Descending, then Wins Descending)
        const sortTeams = (teams: any[]) => {
            return teams.sort((a, b) => {
                const pctA = getPct(a.wins, a.losses);
                const pctB = getPct(b.wins, b.losses);
                if (pctA !== pctB) return pctB - pctA; 
                return b.wins - a.wins;
            });
        };

        const sortedEast = sortTeams(eastTeams);
        const sortedWest = sortTeams(westTeams);

        // 3. Map Data & Calculate Games Back (GB)
        const processConference = (teams: any[]) => {
            const leader = teams[0];
            return teams.map((t: any, index: number) => {
                // GB Formula: ((LeaderWins - TeamWins) + (TeamLosses - LeaderLosses)) / 2
                const gb = leader 
                    ? ((leader.wins - t.wins) + (t.losses - leader.losses)) / 2 
                    : 0;

                return {
                    id: t.id,
                    rank: index + 1, // Dynamic Rank based on sorted position
                    name: `${t.city} ${t.name}`,
                    logo: t.logo,
                    w: t.wins,
                    l: t.losses,
                    pct: getPct(t.wins, t.losses).toFixed(3),
                    gb: index === 0 ? '-' : gb.toFixed(1), // Leader gets '-'
                    streak: t.streak || '-'
                };
            });
        };

        result.east = processConference(sortedEast);
        result.west = processConference(sortedWest);
    }
    
    return result;
}

// --- 3. LEADERS (FIXED) ---
export async function getLeagueLeaders() {
    const { data } = await supabase.from('nba_players').select('*').order('pts', { ascending: false }).limit(5);
    
    return (data || []).map((p: any) => ({
        category: 'PTS',
        player: p.name,
        team: p.team_abbr || 'NBA',
        value: p.pts.toString(),
        // FIX: Construct a fresh ESPN image URL using the player ID.
        // This bypasses potentially broken or expired URLs stored in the DB.
        image: `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png&w=350&h=254`
    }));
}

// --- 4. ALL TEAMS ---
export async function getAllTeams() {
    const { data } = await supabase.from('nba_teams').select('*').order('name');
    return (data || []).map((t: any) => ({
        id: t.id,
        name: `${t.city} ${t.name}`,
        logo: t.logo
    }));
}

// ... Stubs for missing functions
export async function getGameSummary(id: string) { return null; }
export async function searchPlayers(query: string) { return []; }
export async function getTeamData(id: string) { return null; }
export async function getPlayerProfile(id: string) { return null; }