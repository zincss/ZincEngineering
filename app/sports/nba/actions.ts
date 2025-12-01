'use server'

import { createClient } from '@supabase/supabase-js';

// Public Client for Reading
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const NBA_CDN = 'https://cdn.nba.com/static/json/liveData';

// --- 1. LIVE SCORES (Source: NBA CDN) ---
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

// --- 2. GAME SUMMARY (Source: NBA CDN) ---
// This was missing! It powers the GameTicker details.
export async function getGameSummary(gameId: string) {
    try {
        const res = await fetch(`${NBA_CDN}/boxscore/boxscore_${gameId}.json`, { next: { revalidate: 30 } });
        const data = await res.json();
        
        if (!data?.game) return null;
        const g = data.game;

        const getLeader = (teamId: number) => {
            const players = g.homeTeam.teamId === teamId ? g.homeTeam.players : g.awayTeam.players;
            if (!players) return null;
            return players.sort((a: any, b: any) => b.statistics.points - a.statistics.points)[0];
        };

        const hLeader = getLeader(g.homeTeam.teamId);
        const aLeader = getLeader(g.awayTeam.teamId);

        return {
            id: g.gameId,
            matchup: `${g.awayTeam.teamTricode} @ ${g.homeTeam.teamTricode}`,
            venue: g.arena?.arenaName || 'NBA Arena',
            status: g.gameStatusText,
            home: { 
                id: g.homeTeam.teamId,
                displayName: g.homeTeam.teamName,
                abbreviation: g.homeTeam.teamTricode,
                score: g.homeTeam.score,
                logo: `https://cdn.nba.com/logos/nba/${g.homeTeam.teamId}/global/L/logo.svg`,
                linescores: [] 
            },
            away: { 
                id: g.awayTeam.teamId,
                displayName: g.awayTeam.teamName,
                abbreviation: g.awayTeam.teamTricode,
                score: g.awayTeam.score,
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
    } catch { return null; }
}

// --- 3. STANDINGS (Source: Supabase DB) ---
export async function getStandings() {
    const { data } = await supabase.from('nba_teams').select('*').order('rank');
    const result: { east: any[], west: any[] } = { east: [], west: [] };

    if (data) {
        data.forEach((t: any) => {
            const team = {
                id: t.id,
                rank: t.rank,
                name: t.name,
                logo: t.logo,
                w: t.wins,
                l: t.losses,
                pct: (t.wins / (t.wins + t.losses || 1)).toFixed(3),
                gb: '-', 
                streak: '-'
            };
            if (t.conf === 'East') result.east.push(team);
            else result.west.push(team);
        });
    }
    
    // Ensure sorted by rank if DB didn't return them perfect
    result.east.sort((a, b) => a.rank - b.rank);
    result.west.sort((a, b) => a.rank - b.rank);

    return result;
}

// --- 4. LEADERS (Source: Supabase DB) ---
export async function getLeagueLeaders() {
    // Get top 5 by points
    const { data } = await supabase.from('nba_players').select('*').order('pts', { ascending: false }).limit(5);
    
    return (data || []).map((p: any) => ({
        category: 'PTS',
        player: p.name,
        team: 'NBA', // You can join with teams table if you want full team names
        value: p.pts.toString(),
        image: p.headshot
    }));
}

// --- 5. ALL TEAMS (Source: Supabase DB) ---
export async function getAllTeams() {
    const { data } = await supabase.from('nba_teams').select('*').order('name');
    return (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        logo: t.logo
    }));
}

// --- 6. SEARCH PLAYERS (Source: Supabase DB) ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 2) return [];
    
    const { data } = await supabase
        .from('nba_players')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);
        
    return (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        team: 'NBA',
        sport: 'NBA',
        url: `/sports/nba/player/${p.id}`,
        image: p.headshot
    }));
}

// --- 7. TEAM DATA (Source: Supabase DB) ---
export async function getTeamData(id: string) {
    const { data: team } = await supabase.from('nba_teams').select('*').eq('id', id).single();
    if (!team) return null;

    const { data: roster } = await supabase.from('nba_players').select('*').eq('team_id', id);

    return {
        id: team.id,
        name: team.name, // "Atlanta Hawks"
        abbr: team.abbr,
        color: team.color || '#000000',
        logo: team.logo,
        record: `${team.wins}-${team.losses}`,
        standing: 'Active',
        roster: (roster || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            number: p.jersey,
            pos: p.position,
            height: p.height,
            image: p.headshot
        })),
        nextGame: null
    };
}

// --- 8. PLAYER PROFILE (Source: Supabase DB) ---
export async function getPlayerProfile(id: string) {
    const { data: player } = await supabase.from('nba_players').select('*').eq('id', id).single();
    if (!player) return null;

    // Optional: Fetch Team Name to display nicely
    const { data: team } = await supabase.from('nba_teams').select('name').eq('id', player.team_id || '').single();

    return {
        id: player.id,
        name: player.name,
        team: team?.name || 'NBA',
        number: player.jersey,
        pos: player.position,
        height: player.height,
        weight: player.weight,
        headshot: player.headshot,
        stats: [
            { name: 'PTS', displayValue: player.stats?.pts?.toString() || '-' },
            { name: 'AST', displayValue: player.stats?.ast?.toString() || '-' },
            { name: 'REB', displayValue: player.stats?.reb?.toString() || '-' }
        ]
    };
}