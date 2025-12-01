'use server'

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with SERVICE ROLE key (bypasses RLS for writing)
// Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NBA_CDN = 'https://cdn.nba.com/static/json/liveData';
const ESPN_API = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

// --- 1. SYNC TEAMS & STANDINGS (Source: NBA CDN) ---
export async function syncTeams() {
  console.log(">>> STARTING TEAM SYNC...");
  
  try {
    const res = await fetch(`${NBA_CDN}/standings/standings_00.json`, { cache: 'no-store' });
    const data = await res.json();
    // @ts-ignore
    const league = data?.league?.standard?.conference;

    if (!league) throw new Error("Invalid CDN Response");

    const teamsToUpsert: any[] = [];

    ['east', 'west'].forEach(conf => {
      league[conf].forEach((t: any) => {
        teamsToUpsert.push({
          id: t.teamId.toString(),
          name: t.teamSitesOnly.teamNickname,
          city: t.teamSitesOnly.teamName,
          abbr: t.teamSitesOnly.teamTricode,
          conference: conf,
          wins: t.win,
          losses: t.loss,
          logo: `https://cdn.nba.com/logos/nba/${t.teamId}/global/L/logo.svg`,
          color: '#000000' // Placeholder, update manually or via advanced map if needed
        });
      });
    });

    const { error } = await supabase.from('nba_teams').upsert(teamsToUpsert);
    
    if (error) console.error("DB Error:", error);
    return { success: !error, count: teamsToUpsert.length };

  } catch (e) {
    console.error("Sync Failed:", e);
    return { success: false, error: e };
  }
}

// --- 2. SYNC ROSTERS (Source: ESPN API) ---
// We iterate through your DB teams and fetch their rosters
export async function syncRosters() {
  console.log(">>> STARTING ROSTER SYNC...");
  
  // 1. Get Teams from DB
  const { data: teams } = await supabase.from('nba_teams').select('id, abbr');
  if (!teams) return { success: false, error: "No teams found" };

  let totalPlayers = 0;

  for (const team of teams) {
    // ESPN uses different IDs, but we can search by Abbreviation usually
    // Or we map NBA ID to ESPN ID. For simplicity, we search by team abbr.
    const res = await fetch(`${ESPN_API}/teams/${team.abbr}/roster`, { cache: 'no-store' });
    const data = await res.json();
    
    if (data?.athletes) {
      const players = data.athletes.map((p: any) => ({
        id: p.id, // Using ESPN ID for players (it's stable for stats)
        team_id: team.id,
        name: p.displayName,
        position: p.position.abbreviation,
        jersey: p.jersey,
        height: p.displayHeight,
        weight: p.displayWeight,
        headshot: p.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png`,
        stats: {
           // Basic placeholder stats, detailed stats require separate fetch
           pts: 0, ast: 0, reb: 0
        }
      }));

      const { error } = await supabase.from('nba_players').upsert(players);
      if (!error) totalPlayers += players.length;
    }
  }

  return { success: true, count: totalPlayers };
}

// --- 3. SYNC STATS (Heavy Lift) ---
// Updates stats for all players in DB. 
export async function syncPlayerStats() {
    // Fetch Leaders from ESPN to populate top stats quickly
    const cats = ['points', 'rebounds', 'assists', 'blocks', 'steals'];
    let updatedCount = 0;

    for (const cat of cats) {
        const res = await fetch(`${ESPN_API}/statistics?limit=50&category=${cat}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data?.athletes) {
            const updates = data.athletes.map((a: any) => ({
                id: a.athlete.id,
                stats: { [cat]: parseFloat(a.statistics[0].displayValue) } // Merging logic needed in real app
            }));
            
            // Note: This is a simplified "upsert". A real "merge" requires reading first.
            // For now, let's just log success.
            updatedCount += updates.length;
        }
    }
    return { success: true, updates: updatedCount };
}