import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role (Admin) access to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ESPN_TEAMS = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings';
const ESPN_STATS = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete';

// Browser headers to prevent ESPN blocking requests
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.espn.com/'
};

// --- 1. SYNC TEAMS ---
async function syncTeams() {
    try {
        const res = await fetch(ESPN_TEAMS, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) throw new Error(`Teams API Error: ${res.status}`);
        
        const data = await res.json();
        const teams: any[] = [];

        data.children?.forEach((conf: any) => {
            const confName = conf.name.toLowerCase().includes('east') ? 'east' : 'west';
            conf.standings?.entries?.forEach((entry: any) => {
                const t = entry.team;
                teams.push({
                    id: t.id,
                    name: t.name,
                    city: t.location,
                    abbr: t.abbreviation,
                    conference: confName,
                    wins: entry.stats?.find((s: any) => s.name === 'wins')?.value || 0,
                    losses: entry.stats?.find((s: any) => s.name === 'losses')?.value || 0,
                    logo: t.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nba/500/${t.abbreviation}.png`,
                    color: '#000000'
                });
            });
        });

        if (teams.length > 0) {
            const { error } = await supabase.from('nba_teams').upsert(teams);
            if (error) console.error("Team DB Error:", error);
        }
        return teams.length;
    } catch (e) {
        console.error("Team Sync Failed:", e);
        return 0;
    }
}

// --- 2. SYNC STATS (MASS IMPORT) ---
async function syncStats() {
    // We fetch top 50 for EVERY category to ensure we capture all relevant players
    const categories = [
        { col: 'pts', sort: 'offensive.avgPoints:desc', match: ['points', 'avgPoints'] },
        { col: 'ast', sort: 'offensive.avgAssists:desc', match: ['assists', 'avgAssists'] },
        { col: 'reb', sort: 'general.avgRebounds:desc', match: ['rebounds', 'avgRebounds'] },
        { col: 'blk', sort: 'defensive.avgBlocks:desc', match: ['blocks', 'avgBlocks'] },
        { col: 'stl', sort: 'defensive.avgSteals:desc', match: ['steals', 'avgSteals'] }
    ];

    let totalUpserts = 0;

    for (const cat of categories) {
        try {
            const params = new URLSearchParams({
                region: 'us',
                lang: 'en',
                contentorigin: 'espn',
                isqualified: 'false', // Fetch everyone
                page: '1',
                limit: '50', 
                sort: cat.sort
            });

            const res = await fetch(`${ESPN_STATS}?${params.toString()}`, { headers: HEADERS, cache: 'no-store' });
            if (!res.ok) continue;

            const data = await res.json();

            if (data?.athletes) {
                const updates = data.athletes
                    .map((item: any) => {
                        // Robust Stat Finder
                        const statObj = item.statistics?.find((s: any) => cat.match.includes(s.name)) 
                                      || item.statistics?.[0];
                        
                        const value = parseFloat(statObj?.value || statObj?.displayValue || '0');

                        // SKIP players with 0 stats to prevent "ghost" leader entries
                        if (value <= 0) return null;

                        return {
                            id: item.athlete.id,
                            name: item.athlete.displayName,
                            team_abbr: item.athlete.team?.abbreviation || 'NBA',
                            headshot: item.athlete.headshot?.href,
                            [cat.col]: value
                        };
                    })
                    .filter((u: any) => u !== null); // Filter out the nulls

                if (updates.length > 0) {
                    const { error } = await supabase.from('nba_players').upsert(updates, { onConflict: 'id' });
                    if (!error) totalUpserts += updates.length;
                    else console.error(`DB Error (${cat.col}):`, error.message);
                }
            }
        } catch (e) {
            console.error(`Failed to sync ${cat.col}`, e);
        }
    }
    return totalUpserts;
}

// --- API ENTRY POINT ---
export async function GET() {
    console.log("🏀 STARTING AUTOMATED SNAPSHOT...");
    const teamCount = await syncTeams();
    const playerCount = await syncStats();
    
    return NextResponse.json({ 
        success: true, 
        timestamp: new Date().toISOString(),
        teamsUpdated: teamCount,
        playersUpdated: playerCount 
    });
}