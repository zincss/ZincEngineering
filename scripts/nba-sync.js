// scripts/nba-sync.js
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with SERVICE KEY (allows writing to DB)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY 
);

const HEADERS = {
    'Referer': 'https://www.nba.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function sync() {
    console.log("🏀 STARTING NBA SYNC...");

    try {
        // 1. FETCH STANDINGS (Use ESPN's Public API - Reliable)
        console.log("1. Fetching Standings...");
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings', { headers: HEADERS });
        const data = await res.json();
        
        const teams = [];
        data.children.forEach(conf => {
            conf.standings.entries.forEach(t => {
                teams.push({
                    id: t.team.id,
                    name: t.team.displayName,
                    abbr: t.team.abbreviation,
                    wins: parseInt(t.stats.find(s => s.name === 'wins')?.value || 0),
                    losses: parseInt(t.stats.find(s => s.name === 'losses')?.value || 0),
                    conf: conf.name === 'Eastern Conference' ? 'East' : 'West',
                    rank: parseInt(t.stats.find(s => s.name === 'playoffSeed')?.value || 0),
                    logo: t.team.logos[0].href
                });
            });
        });

        // 2. WRITE TO SUPABASE
        const { error } = await supabase.from('nba_teams').upsert(teams);
        if (error) throw error;
        console.log(`✅ Updated ${teams.length} teams.`);

        // 3. FETCH LEADERS (Top 5 Scorers)
        console.log("2. Fetching Leaders...");
        const leadRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/statistics?limit=5&category=points', { headers: HEADERS });
        const leadData = await leadRes.json();
        
        const players = leadData.athletes.map(a => ({
            id: a.athlete.id,
            name: a.athlete.displayName,
            team_abbr: a.athlete.team.abbreviation, // Using abbr to link
            pts: parseFloat(a.statistics[0].displayValue),
            headshot: a.athlete.headshot.href
        }));

        const { error: pError } = await supabase.from('nba_players').upsert(players);
        if (pError) throw pError;
        console.log(`✅ Updated ${players.length} leaders.`);

    } catch (e) {
        console.error("SYNC FAILED:", e);
        process.exit(1);
    }
}

sync();