// scripts/nba-sync.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY 
);

async function sync() {
    console.log("🏀 STARTING NBA SYNC...");

    try {
        // 1. FETCH TEAMS (ESPN)
        console.log("1. Fetching Teams...");
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams?limit=30');
        const data = await res.json();
        
        if (data.sports) {
            const teamEntries = data.sports[0].leagues[0].teams;
            const teams = teamEntries.map(entry => {
                const t = entry.team;
                const record = t.record?.items?.[0]?.summary || "0-0";
                const [w, l] = record.split('-').map(n => parseInt(n) || 0);
                
                // Map conference manually based on known ID or Abbr
                // ID 1-15: Various. Let's use a known map or default.
                // Actually, we can infer from group ID if available, but simpler:
                // Just push them and let frontend sort? No, frontend needs 'conference' column.
                // We'll default to 'East' if unknown, but typically ESPN group info handles this.
                // Let's just use a simple list for accuracy.
                const westAbbrs = ['DAL','DEN','GSW','HOU','LAC','LAL','MEM','MIN','NOP','OKC','PHX','POR','SAC','SAS','UTA'];
                const conf = westAbbrs.includes(t.abbreviation) ? 'West' : 'East';

                return {
                    id: t.id,
                    name: t.name, 
                    city: t.location, 
                    abbr: t.abbreviation,
                    wins: w,
                    losses: l,
                    conference: conf, // CORRECT COLUMN NAME
                    rank: 0, 
                    logo: t.logos?.[0]?.href || ''
                };
            });
            
            // Sort to assign rank
            teams.sort((a, b) => b.wins - a.wins);
            teams.forEach((t, i) => t.rank = i + 1);

            await supabase.from('nba_teams').upsert(teams);
            console.log(`✅ Updated ${teams.length} teams.`);
        }

        // 2. FETCH LEADERS
        console.log("2. Fetching Leaders...");
        const leadRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/statistics?limit=5&category=points');
        const leadData = await leadRes.json();
        
        if (leadData.athletes) {
            const players = leadData.athletes.map(a => ({
                id: a.athlete.id,
                name: a.athlete.displayName,
                team_abbr: a.athlete.team.abbreviation,
                pts: parseFloat(a.statistics[0].displayValue),
                headshot: a.athlete.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${a.athlete.id}.png`
            }));

            await supabase.from('nba_players').upsert(players);
            console.log(`✅ Updated ${players.length} leaders.`);
        }

        console.log("🏆 SYNC COMPLETE.");

    } catch (e) {
        console.error("SYNC ERROR:", e);
    }
}

sync();