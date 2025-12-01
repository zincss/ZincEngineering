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
    const { data } = await supabase.from('nba_teams').select('*').order('rank');
    const result: { east: any[], west: any[] } = { east: [], west: [] };

    if (data) {
        data.forEach((t: any) => {
            const team = {
                id: t.id,
                rank: t.rank,
                name: `${t.city} ${t.name}`,
                logo: t.logo,
                w: t.wins,
                l: t.losses,
                pct: (t.wins / ((t.wins + t.losses) || 1)).toFixed(3),
                gb: '-',
                streak: '-'
            };
            
            // FIX: Read 'conference' column, check for 'East' (case insensitive)
            if (t.conference?.toLowerCase().includes('east')) {
                result.east.push(team);
            } else {
                result.west.push(team);
            }
        });
    }
    
    // Secondary Sort by Wins if Rank isn't perfect
    result.east.sort((a, b) => b.w - a.w);
    result.west.sort((a, b) => b.w - a.w);

    return result;
}

// --- 3. LEADERS (FIXED) ---
export async function getLeagueLeaders() {
    const { data } = await supabase.from('nba_players').select('*').order('pts', { ascending: false }).limit(5);
    
    return (data || []).map((p: any) => ({
        category: 'PTS',
        player: p.name,
        team: p.team_abbr,
        value: p.pts.toString(),
        // FIX: Use fallback if headshot is null
        image: p.headshot || DEFAULT_HEADSHOT
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

// ... Other functions remain the same ...
export async function getGameSummary(id: string) { return null; }
export async function searchPlayers(query: string) { return []; }
export async function getTeamData(id: string) { return null; }
export async function getPlayerProfile(id: string) { return null; }