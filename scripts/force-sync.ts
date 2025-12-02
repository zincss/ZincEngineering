'use server'

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// The "Golden" Endpoint: Returns the official season leaders for each category
const ESPN_LEADERS_API = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/leaders';
const ESPN_STANDINGS_API = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings';

// --- SHARED TYPES ---
export interface SyncResult {
    success: boolean;
    count?: number;
    error?: string;
    message?: string;
    step?: string;
}

// --- MASTER SYNC ---
export async function syncAll(): Promise<SyncResult> {
    console.log("🏀 STARTING MASTER SYNC...");
    
    // 1. Teams
    const teams = await syncTeams();
    if (!teams.success) console.error("Team Sync Error:", teams.error);

    // 2. Stats
    const stats = await syncPlayerStats();
    if (!stats.success) return { success: false, step: 'STATS', error: stats.error };

    return { success: true, message: `DATABASE UPDATED: ${stats.count} Leaders Saved` };
}

// --- 1. SYNC TEAMS ---
export async function syncTeams(): Promise<SyncResult> {
  try {
    const res = await fetch(ESPN_STANDINGS_API, { cache: 'no-store' });
    const data = await res.json();
    const teamsToUpsert: any[] = [];

    data.children?.forEach((conf: any) => {
      const confName = conf.name.toLowerCase().includes('east') ? 'east' : 'west';
      conf.standings?.entries?.forEach((entry: any) => {
        const t = entry.team;
        teamsToUpsert.push({
          id: t.id,
          name: t.name,
          city: t.location,
          abbr: t.abbreviation,
          conference: confName,
          wins: entry.stats?.find((s: any) => s.name === 'wins')?.value || 0,
          losses: entry.stats?.find((s: any) => s.name === 'losses')?.value || 0,
          logo: t.logos?.[0]?.href,
          color: '#000000'
        });
      });
    });

    await supabase.from('nba_teams').upsert(teamsToUpsert);
    return { success: true, count: teamsToUpsert.length };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- 2. SYNC STATS (LEADERS FIX) ---
export async function syncPlayerStats(): Promise<SyncResult> {
    try {
        // Fetch the official leaders list (Limit 50 per category)
        const res = await fetch(`${ESPN_LEADERS_API}?limit=50`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`ESPN API Failed: ${res.status}`);
        
        const data = await res.json();
        
        if (!data.categories) throw new Error("API returned no categories. Season might be inactive.");

        // Map ESPN category names to our DB columns
        const categoryMap: Record<string, string> = {
            'pointsPerGame': 'pts',
            'assistsPerGame': 'ast',
            'reboundsPerGame': 'reb',
            'blocksPerGame': 'blk',
            'stealsPerGame': 'stl'
        };

        let totalUpdates = 0;

        for (const cat of data.categories) {
            const dbCol = categoryMap[cat.name];
            if (!dbCol) continue; // Skip categories we don't track (like turnovers)

            console.log(`Processing ${cat.displayName} (${cat.leaders.length} leaders)...`);

            const updates = cat.leaders.map((leader: any) => ({
                id: leader.athlete.id,
                // Force Update Name/Team to ensure they exist
                name: leader.athlete.displayName,
                team_abbr: leader.athlete.team?.abbreviation || 'NBA',
                headshot: leader.athlete.headshot?.href,
                // Save the stat!
                [dbCol]: parseFloat(leader.value)
            }));

            // Upsert: Updates existing players or creates new ones
            const { error } = await supabase.from('nba_players').upsert(updates, { onConflict: 'id' });
            
            if (!error) totalUpdates += updates.length;
            else console.error(`DB Error (${dbCol}):`, error.message);
        }

        return { success: true, count: totalUpdates };

    } catch (e: any) {
        console.error("Stats Sync Critical Failure:", e);
        return { success: false, error: e.message };
    }
}

// Stub
export async function syncRosters(): Promise<SyncResult> { 
    return { success: true, count: 0 }; 
}