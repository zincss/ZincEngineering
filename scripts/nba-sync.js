// scripts/nba-sync.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY 
);

// OFFICIAL ENDPOINTS
const NBA_STANDINGS_API = 'https://stats.nba.com/stats/leaguestandingsv3?LeagueID=00&Season=2025-26&SeasonType=Regular+Season';
const NBA_LEADERS_API = 'https://stats.nba.com/stats/leagueleaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2025-26&SeasonType=Regular+Season&StatCategory=PTS';

// HEADERS (Required to bypass NBA firewall)
const NBA_HEADERS = {
    'Referer': 'https://www.nba.com/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'x-nba-stats-origin': 'stats',
    'x-nba-stats-token': 'true'
};

const TEAM_ABBR_MAP = {
    'Celtics': 'BOS', 'Nets': 'BKN', 'Knicks': 'NYK', '76ers': 'PHI', 'Raptors': 'TOR',
    'Bulls': 'CHI', 'Cavaliers': 'CLE', 'Pistons': 'DET', 'Pacers': 'IND', 'Bucks': 'MIL',
    'Hawks': 'ATL', 'Hornets': 'CHA', 'Heat': 'MIA', 'Magic': 'ORL', 'Wizards': 'WAS',
    'Nuggets': 'DEN', 'Timberwolves': 'MIN', 'Thunder': 'OKC', 'Trail Blazers': 'POR', 'Jazz': 'UTA',
    'Warriors': 'GSW', 'Clippers': 'LAC', 'Lakers': 'LAL', 'Suns': 'PHX', 'Kings': 'SAC',
    'Mavericks': 'DAL', 'Rockets': 'HOU', 'Grizzlies': 'MEM', 'Pelicans': 'NOP', 'Spurs': 'SAS'
};

async function sync() {
    console.log("🏀 STARTING NBA SYNC [SOURCE: STATS.NBA.COM]...");

    try {
        // --- STEP 0: CLEANUP ---
        // Clears old data to prevent duplicates (fix for 19 vs 11 teams issue)
        console.log("0. Cleaning up old database records...");
        await supabase.from('nba_players').delete().neq('id', '0');
        await supabase.from('nba_teams').delete().neq('id', '0');
        
        // --- 1. FETCH STANDINGS ---
        console.log("1. Fetching Teams & Standings...");
        const res = await fetch(NBA_STANDINGS_API, { headers: NBA_HEADERS });
        if (!res.ok) throw new Error(`NBA Standings API Error: ${res.status}`);
        
        const data = await res.json();
        const resultSet = data.resultSets ? data.resultSets[0] : null;
        if (!resultSet) throw new Error("Invalid Standings Data");

        const headers = resultSet.headers;
        const rows = resultSet.rowSet;
        const teamsToUpsert = [];

        const getValue = (row, field) => {
            const index = headers.indexOf(field);
            return index > -1 ? row[index] : null;
        };

        rows.forEach(row => {
            const teamName = getValue(row, 'TeamName');
            const teamId = getValue(row, 'TeamID');
            
            teamsToUpsert.push({
                id: teamId.toString(),
                name: teamName,
                city: getValue(row, 'TeamCity'),
                abbr: TEAM_ABBR_MAP[teamName] || teamName.substring(0, 3).toUpperCase(),
                conference: getValue(row, 'Conference'),
                wins: parseInt(getValue(row, 'WINS')) || 0,
                losses: parseInt(getValue(row, 'LOSSES')) || 0,
                rank: parseInt(getValue(row, 'PlayoffRank') || getValue(row, 'ConferenceRank')) || 0,
                logo: `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`
            });
        });

        const { error: teamError } = await supabase.from('nba_teams').upsert(teamsToUpsert);
        if (teamError) throw teamError;
        console.log(`✅ Updated ${teamsToUpsert.length} teams.`);

        // --- 2. FETCH LEADERS (NBA STATS API) ---
        console.log("2. Fetching Leaders...");
        const leadRes = await fetch(NBA_LEADERS_API, { headers: NBA_HEADERS });
        if (!leadRes.ok) throw new Error(`NBA Leaders API Error: ${leadRes.status}`);

        const leadData = await leadRes.json();
        const leadSet = leadData.resultSet;
        if (!leadSet) throw new Error("Invalid Leaders Data");

        const lHeaders = leadSet.headers;
        const lRows = leadSet.rowSet;
        
        // Helper for leaders (same logic)
        const getLValue = (row, field) => lHeaders.indexOf(field) > -1 ? row[lHeaders.indexOf(field)] : null;

        const players = lRows.slice(0, 5).map(row => { // Top 5 Only
            const playerId = getLValue(row, 'PLAYER_ID');
            return {
                id: playerId.toString(),
                name: getLValue(row, 'PLAYER'),
                team_abbr: getLValue(row, 'TEAM'), // "OKC", "LAL" etc
                pts: parseFloat(getLValue(row, 'PTS')),
                // Official NBA Headshot URL
                headshot: `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`
            };
        });

        const { error: playerError } = await supabase.from('nba_players').upsert(players);
        if (playerError) throw playerError;

        console.log(`✅ Updated ${players.length} leaders.`);
        console.log("🏆 SYNC COMPLETE. Database is now accurate.");

    } catch (e) {
        console.error("❌ SYNC ERROR:", e);
    }
}

sync();