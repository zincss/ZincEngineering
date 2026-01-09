'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import * as ESPN from './services/espn';

const BASE_API = 'https://site.api.espn.com/apis/site/v2/sports';

export async function updateSportsPrefs(prefs: any) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('profiles')
        .update({ sports_prefs: prefs })
        .eq('id', user.id);

    if (error) return { error: 'Failed to sync preferences' };
    return { success: true };
}

export async function getSportsPrefs() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('sports_prefs')
        .eq('id', user.id)
        .single();

    if (error) return { team: null, players: [] };
    return data?.sports_prefs || { team: null, players: [] };
}

export async function getAllTeams(league: 'nfl' | 'nba') {
    try {
        const sport = league === 'nfl' ? 'football' : 'basketball';
        const url = `${BASE_API}/${sport}/${league}/teams?limit=100`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        const teamList = data.sports?.[0]?.leagues?.[0]?.teams || [];
        return teamList.map((t: any) => t.team);
    } catch (e) {
        return [];
    }
}

export async function searchNexusAthletes(league: 'nfl' | 'nba', query: string) {
    if (!query || query.length < 3) return [];
    try {
        const sport = league === 'nfl' ? 'football' : 'basketball';
        const url = `https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&query=${encodeURIComponent(query)}&limit=10&mode=prefix&type=player&sport=${sport}&league=${league}`;
        const res = await fetch(url, { next: { revalidate: 300 } });
        const data = await res.json();
        
        return (data.items || []).map((item: any) => ({
            id: item.id,
            displayName: item.displayName,
            image: `https://a.espncdn.com/i/headshots/${league}/players/full/${item.id}.png`,
            team: item.team?.abbreviation || 'FA'
        }));
    } catch (e) {
        return [];
    }
}

export async function getNexusTeamStats(league: 'nfl' | 'nba', teamId: string) {
    try {
        const data = await ESPN.getTeam(league, teamId);
        const lastGame = data?.recentGames?.[0];
        if (!lastGame) return null;
        return {
            score: lastGame.score,
            opponent: lastGame.opponent,
            result: lastGame.result 
        };
    } catch (e) {
        return null;
    }
}

export async function getNexusPlayerStats(league: 'nfl' | 'nba', playerId: string) {
    try {
        const profile = await ESPN.getPlayer(league, playerId);
        const pos = profile?.pos?.toUpperCase() || '';
        
        const logs = await ESPN.getPlayerLogs(league, playerId);
        const lastGame = logs?.[0];
        
        if (!lastGame || !lastGame.stats || !lastGame.labels) {
            if (!profile || !profile.stats?.[0]) return null;
            return {
                s1: { v: profile.stats[0].displayValue, l: profile.stats[0].name.substring(0, 3).toUpperCase() },
                s2: { v: profile.stats[1]?.displayValue || '0', l: profile.stats[1]?.name.substring(0, 3).toUpperCase() || 'DAT' }
            };
        }

        const stats = lastGame.stats;
        const labels = lastGame.labels.map((l: string) => l.toUpperCase());

        const getStat = (name: string) => {
            const idx = labels.indexOf(name.toUpperCase());
            return idx !== -1 ? stats[idx] : null;
        };

        if (league === 'nba') {
            const pts = getStat('PTS') || '0';
            const ast = getStat('AST') || '0';
            const reb = getStat('REB') || '0';
            const isBig = pos.includes('CENTER') || pos.includes('POWER FORWARD');
            
            return {
                s1: { v: pts, l: 'PTS' },
                s2: isBig ? { v: reb, l: 'REB' } : { v: ast, l: 'AST' }
            };
        } else {
            // NFL position-smart mapping
            if (pos.includes('QUARTERBACK')) {
                return {
                    s1: { v: getStat('YDS') || getStat('PYDS') || '0', l: 'YDS' },
                    s2: { v: getStat('TD') || getStat('PTD') || '0', l: 'TD' }
                };
            }
            if (pos.includes('RUNNING BACK') || pos.includes('RECEIVER') || pos.includes('TIGHT END')) {
                const yds = getStat('YDS') || getStat('RYDS') || getStat('RECY') || '0';
                const tds = getStat('TD') || getStat('RTD') || getStat('RETD') || '0';
                return { s1: { v: yds, l: 'YDS' }, s2: { v: tds, l: 'TD' } };
            }
            return {
                s1: { v: getStat('TOT') || getStat('TKL') || '0', l: 'TKL' },
                s2: { v: getStat('SCK') || getStat('SACK') || '0', l: 'SCK' }
            };
        }
    } catch (e) {
        return null;
    }
}