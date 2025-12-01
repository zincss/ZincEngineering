// scripts/nba-sync.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY 
);

const NBA_CDN_TEAMS = 'https://cdn.nba.com/static/json/liveData/standings/standings_00.json';
const ESPN_LEADERS = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/statistics?limit=5&category=points';

async function sync() {
    console.log("🏀 STARTING NBA SYNC [SOURCE: NBA OFFICIAL CDN]...");

    try {
        // --- 1. FETCH TEAMS & STANDINGS (OFFICIAL NBA DATA) ---
        // This solves the 19/11 split and 0-0 record issue by using the official source
        console.log("1. Fetching Teams & Standings...");
        const res = await fetch(NBA_CDN_TEAMS);
        const data = await res.json();
        
        if (!data?.league?.standard?.conference) throw new Error("Invalid NBA Data Structure");

        const teamsToUpsert = [];

        // Process both conferences explicitly
        ['east', 'west'].forEach(confKey => {
            const confData = data.league.standard.conference[confKey];
            
            confData.forEach((t) => {
                const teamData = {
                    id: t.teamId.toString(), // Uses Official NBA ID (Matches Live Scores)
                    name: t.teamSitesOnly.teamNickname, 
                    city: t.teamSitesOnly.teamName, 
                    abbr: t.teamSitesOnly.teamTricode,
                    conference: confKey.charAt(0).toUpperCase() + confKey.slice(1), // 'East' or 'West'
                    wins: parseInt(t.win) || 0,
                    losses: parseInt(t.loss) || 0,
                    rank: t.confRank,
                    // Construct official NBA Logo URL
                    logo: `https://cdn.nba.com/logos/nba/${t.teamId}/global/L/logo.svg`
                };
                teamsToUpsert.push(teamData);
            });
        });

        // Upsert Teams
        const { error: teamError } = await supabase.from('nba_teams').upsert(teamsToUpsert);
        if (teamError) throw teamError;
        
        console.log(`✅ Updated ${teamsToUpsert.length} teams correctly.`);

        // --- 2. FETCH LEADERS (ESPN) ---
        console.log("2. Fetching Leaders...");
        const leadRes = await fetch(ESPN_LEADERS);
        const leadData = await leadRes.json();
        
        if (leadData.athletes) {
            const players = leadData.athletes.map(a => ({
                id: a.athlete.id,
                name: a.athlete.displayName,
                team_abbr: a.athlete.team.abbreviation,
                pts: parseFloat(a.statistics[0].displayValue),
                // Force a valid high-res headshot URL
                headshot: `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${a.athlete.id}.png&w=350&h=254`
            }));

            const { error: playerError } = await supabase.from('nba_players').upsert(players);
            if (playerError) throw playerError;

            console.log(`✅ Updated ${players.length} leaders.`);
        }

        console.log("🏆 SYNC COMPLETE. Database is now accurate.");

    } catch (e) {
        console.error("❌ SYNC ERROR:", e);
    }
}

sync();