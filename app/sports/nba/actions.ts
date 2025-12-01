'use server'

import { createClient } from '@supabase/supabase-js';

// Read-only client for the frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const NBA_CDN = 'https://cdn.nba.com/static/json/liveData';

// --- TRIGGER UPDATE LOGIC ---
async function checkAndTriggerSync() {
    try {
        // 1. Check the timestamp of the last updated team
        const { data } = await supabase.from('nba_teams').select('created_at').limit(1).single();
        
        const lastUpdate = data ? new Date(data.created_at).getTime() : 0;
        const now = Date.now();
        const fourHours = 4 * 60 * 60 * 1000;

        // 2. If data is older than 4 hours, trigger the GitHub Action
        if (now - lastUpdate > fourHours) {
            console.log("⚠️ NBA Data Stale. Triggering Refresh...");
            
            // Fire request to GitHub API
            await fetch(`https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/dispatches`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${process.env.GH_PAT}`,
                    'User-Agent': 'Zinc-NBA-Trigger'
                },
                body: JSON.stringify({ event_type: 'nba_sync' })
            });
        }
    } catch (e) {
        console.error("Trigger Failed:", e);
    }
}

// --- 1. LIVE SCORES (CDN - Always Live) ---
export async function getLiveScores() {
    // Fire the sync check in the background (don't await it)
    checkAndTriggerSync();

    try {
        const res = await fetch(`${NBA_CDN}/scoreboard/todaysScoreboard_00.json`, { next: { revalidate: 30 } });
        const data = await res.json();
        if (!data?.scoreboard?.games) return [];

        return data.scoreboard.games.map((g: any) => ({
            id: g.gameId,
            status: g.gameStatusText.trim(),
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
            seasonLabel: '2025-26 SEASON'
        }));
    } catch { return []; }
}

// --- 2. STANDINGS (From Supabase) ---
export async function getStandings() {
    const { data } = await supabase.from('nba_teams').select('*').order('rank');
    const result: { east: any[], west: any[] } = { east: [], west: [] };

    if (data) {
        data.forEach((t: any) => {
            const team = {
                id: t.id,
                rank: t.rank,
                name: t.name, // "Lakers"
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
    return result;
}

// --- 3. LEADERS (From Supabase) ---
export async function getLeagueLeaders() {
    const { data } = await supabase.from('nba_players').select('*').order('pts', { ascending: false }).limit(5);
    
    return (data || []).map((p: any) => ({
        category: 'PTS',
        player: p.name,
        team: p.team_abbr,
        value: p.pts.toString(),
        image: p.headshot
    }));
}

// --- 4. ALL TEAMS ---
export async function getAllTeams() {
    const { data } = await supabase.from('nba_teams').select('*').order('name');
    return (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        logo: t.logo
    }));
}

export async function searchPlayers(query: string) { return []; }
export async function getTeamData(id: string) { return null; }