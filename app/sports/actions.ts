'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import * as ESPN from './services/espn';

export async function toggleFavoritePlayer(playerId: string, league: string, playerName: string, headshotUrl: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    // Check if exists
    const { data: existing } = await supabase
        .from('favorite_players')
        .select('id')
        .eq('user_id', user.id)
        .eq('player_id', playerId)
        .single();

    if (existing) {
        await supabase.from('favorite_players').delete().eq('id', existing.id);
    } else {
        await supabase.from('favorite_players').insert({
            user_id: user.id,
            player_id: playerId,
            league,
            player_name: playerName,
            headshot_url: headshotUrl
        });
    }

    revalidatePath(`/sports/${league}/player/${playerId}`);
    return { success: true, isFavorited: !existing };
}

export async function getIsPlayerFavorited(playerId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('favorite_players')
        .select('id')
        .eq('user_id', user.id)
        .eq('player_id', playerId)
        .single();

    return !!data;
}

// --- NEXUS PREFERENCES ---

export async function getSportsPrefs() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase.from('profiles').select('sports_prefs').eq('id', user.id).single();
    return data?.sports_prefs || null;
}

export async function updateSportsPrefs(prefs: any) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    await supabase.from('profiles').update({ sports_prefs: prefs }).eq('id', user.id);
    revalidatePath('/sports');
    return { success: true };
}

export async function getAllTeams(league: 'nba' | 'nfl') {
    const sport = league === 'nfl' ? 'football' : 'basketball';
    try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams?limit=100`);
        const data = await res.json();
        return data.sports?.[0]?.leagues?.[0]?.teams?.map((t: any) => t.team) || [];
    } catch (e) { return []; }
}

export async function searchNexusAthletes(league: 'nba' | 'nfl', query: string) {
    return await ESPN.searchAthletes(league, query);
}

export async function getNexusTeamStats(league: 'nba' | 'nfl', teamId: string) {
    const team = await ESPN.getTeam(league, teamId);
    if (!team || !team.recentGames?.[0]) return null;
    const last = team.recentGames[0];
    return {
        opponent: last.opponent,
        score: last.score,
        result: last.result
    };
}

export async function getNexusPlayerStats(league: 'nba' | 'nfl', playerId: string) {
    const logs = await ESPN.getPlayerLogs(league, playerId);
    if (!logs || !logs[0]) return null;
    const last = logs[0];
    const labels = last.labels || [];
    
    if (league === 'nba') {
        return {
            s1: { l: 'PTS', v: last.stats[13] || '-' },
            s2: { l: 'REB', v: last.stats[7] || '-' }
        };
    } else {
        return {
            s1: { l: 'YDS', v: last.stats[2] || '-' },
            s2: { l: 'TD', v: last.stats[3] || '-' }
        };
    }
}
