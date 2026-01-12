
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function getGameResult(league: string, gameId: string) {
    try {
        const sport = league === 'nfl' ? 'football' : 'basketball';
        const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?event=${gameId}`;
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) return null;
        const data = await res.json();
        const header = data.header;

        if (!header) return null;

        const c = header.competitions?.[0];
        if (!c) return null;

        const home = c.competitors.find((comp: any) => comp.homeAway === 'home');
        const away = c.competitors.find((comp: any) => comp.homeAway === 'away');

        return {
            completed: header.competitions[0].status.type.completed,
            home: {
                id: home.id || home.team.id,
                score: parseInt(home.score),
                winner: home.winner
            },
            away: {
                id: away.id || away.team.id,
                score: parseInt(away.score),
                winner: away.winner
            }
        };
    } catch (e) { return null; }
}

async function getLiveBoxScore(league: string, gameId: string) {
    try {
        const sport = league === 'nfl' ? 'football' : 'basketball';
        const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?event=${gameId}`;
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) return null;
        const data = await res.json();
        
        const playerStats: Record<string, any> = {};
        
        data.boxscore?.players?.forEach((team: any) => {
            team.statistics?.forEach((cat: any) => {
                const labels = cat.labels;
                cat.athletes?.forEach((ath: any) => {
                    const stats: Record<string, string> = {};
                    ath.stats?.forEach((val: string, idx: number) => {
                        stats[labels[idx]] = val;
                    });
                    
                    // ESPN names can vary, we key by Display Name
                    if (!playerStats[ath.athlete.displayName]) {
                        playerStats[ath.athlete.displayName] = {};
                    }
                    Object.assign(playerStats[ath.athlete.displayName], stats);
                });
            });
        });

        return playerStats;
    } catch (e) { return null; }
}

async function main() {
    console.log("🏀 STARTING WAGER SETTLEMENT...");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("❌ Missing Supabase Env Vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get all pending wagers
    const { data: wagers, error } = await supabase
        .from('sports_wagers')
        .select('*, wager_legs(*)')
        .eq('status', 'pending');

    if (error) {
        console.error("Error fetching wagers:", error);
        return;
    }

    if (!wagers || wagers.length === 0) {
        console.log("No pending wagers found.");
        return;
    }

    console.log(`Found ${wagers.length} pending wagers.`);
    let settledCount = 0;

    for (const wager of wagers) {
        let anyLegLost = false;
        let anyLegPending = false;
        let legsUpdated = false;

        console.log(`Checking Wager ${wager.id.slice(0, 8)}...`);

        for (const leg of wager.wager_legs) {
            if (leg.status !== 'pending') {
                if (leg.status === 'lost') anyLegLost = true;
                continue;
            }

            const realGameId = leg.match_id.split('-')[0];
            const league = leg.league || 'nba';

            const result = await getGameResult(league, realGameId);

            if (!result || !result.completed) {
                // Game not finished
                // Exception: Check if player prop hit (optional - but usually we wait for game end)
                // For safety, we only settle when game is Final.
                anyLegPending = true;
                continue;
            }

            let legStatus = 'pending';
            const selection = leg.selection.trim(); // Case sensitive for YES/NO/O/U?
            
            // Check for Player Prop (Name in brackets or match_name indicates player)
            const playerMatch = leg.match_name.match(/\[(.*?)\]/);
            const isPlayerProp = !!playerMatch;

            if (isPlayerProp) {
                const playerName = playerMatch[1];
                const statsMap = await getLiveBoxScore(league, realGameId);
                const stats = statsMap ? statsMap[playerName] : null;

                if (!stats) {
                    console.log(`  Leg ${leg.id.slice(0, 8)}: Player Stats not found for ${playerName}`);
                    // If game is final and player has no stats -> Void? Lost?
                    // Typically 'Did Not Play' = Void. 
                    // But if they played and got 0, they should be in boxscore? 
                    // ESPN boxscore includes all active players.
                    // If not found, assume DNP -> Void.
                    legStatus = 'void';
                } else {
                    const parts = selection.split(' '); // "O 79.5" or "YES"
                    const val = parseFloat(parts[1] || parts[0]); // 79.5 or NaN
                    const isOver = selection.startsWith('O') || selection === 'YES';
                    
                    let actual = 0;
                    // Infer stat category based on available stats and priority
                    if (stats.YDS) actual = parseInt(stats.YDS);
                    else if (stats.PTS) actual = parseInt(stats.PTS);
                    else if (stats.REB) actual = parseInt(stats.REB);
                    else if (stats.AST) actual = parseInt(stats.AST);
                    else if (stats.TD) actual = parseInt(stats.TD);
                    
                    // Specific logic for YES/NO (usually TD)
                    if (selection === 'YES') {
                        legStatus = actual > 0 ? 'won' : 'lost';
                    } else if (selection === 'NO') {
                        legStatus = actual === 0 ? 'won' : 'lost';
                    } else if (!isNaN(val)) {
                        if (isOver) legStatus = actual > val ? 'won' : 'lost';
                        else legStatus = actual < val ? 'won' : 'lost';
                    } else {
                        console.log(`  Leg ${leg.id.slice(0, 8)}: Unknown Prop Format (${selection})`);
                        legStatus = 'void';
                    }
                    console.log(`  Leg ${leg.id.slice(0, 8)} [Player]: ${playerName} Actual: ${actual}, Target: ${selection} -> ${legStatus.toUpperCase()}`);
                }

            } else if (leg.type === 'moneyline') {
                const winner = result.home.winner ? 'home' : 'away';
                const sel = selection.toLowerCase();
                if (sel === 'home' || sel === 'away') {
                     if (sel === winner) legStatus = 'won';
                     else legStatus = 'lost';
                } else {
                    legStatus = 'lost'; 
                }
            } else if (leg.type === 'spread') {
                const [side, lineStr] = selection.split(':');
                const line = parseFloat(lineStr);

                if (!side || isNaN(line)) {
                    console.log(`  Leg ${leg.id.slice(0, 8)}: Invalid Spread Format (${selection}).`);
                    // If format is invalid but game is over, we can't settle. 
                    // Mark void?
                    legStatus = 'void';
                } else {
                    const homeScore = result.home.score;
                    const awayScore = result.away.score;
                    let scoreDiff = 0;

                    if (side === 'home') scoreDiff = homeScore - awayScore;
                    else if (side === 'away') scoreDiff = awayScore - homeScore;
                    
                    if (scoreDiff + line > 0) legStatus = 'won';
                    else if (scoreDiff + line < 0) legStatus = 'lost';
                    else legStatus = 'void'; // Push
                }
                
            } else if (leg.type === 'total') {
                // Handle "over:210.5" OR potentially broken "over" (if found)
                let side = '';
                let line = NaN;

                if (selection.includes(':')) {
                    const parts = selection.split(':');
                    side = parts[0];
                    line = parseFloat(parts[1]);
                } else {
                    // Try to recover from broken format if possible, or just fail
                    // We saw "over" in DB. 
                    console.log(`  Leg ${leg.id.slice(0, 8)}: Invalid Total Format (${selection}).`);
                    legStatus = 'void'; // Can't settle without line
                }

                if (!isNaN(line)) {
                    const totalScore = result.home.score + result.away.score;
                    if (side === 'over') {
                        if (totalScore > line) legStatus = 'won';
                        else if (totalScore < line) legStatus = 'lost';
                        else legStatus = 'void';
                    } else if (side === 'under') {
                        if (totalScore < line) legStatus = 'won';
                        else if (totalScore > line) legStatus = 'lost';
                        else legStatus = 'void';
                    }
                }
            }

            if (legStatus !== 'pending') {
                console.log(`  Leg ${leg.id.slice(0, 8)}: ${legStatus.toUpperCase()}`);
                await supabase.from('wager_legs').update({ status: legStatus }).eq('id', leg.id);
                if (legStatus === 'lost') anyLegLost = true;
                legsUpdated = true;
            } else {
                anyLegPending = true;
            }
        }

        let newStatus = 'pending';
        if (anyLegLost) {
            newStatus = 'lost';
        } else if (!anyLegPending) {
            newStatus = 'won';
        }

        if (newStatus !== 'pending') {
            console.log(`👉 Wager ${wager.id.slice(0, 8)} SETTLED: ${newStatus.toUpperCase()}`);
            await supabase.from('sports_wagers').update({ status: newStatus }).eq('id', wager.id);
            
            if (newStatus === 'won') {
                const payout = Math.floor(wager.amount * wager.odds);
                await supabase.from('sports_wagers').update({ payout }).eq('id', wager.id);
                
                // Credit User
                const { data: profile } = await supabase.from('profiles').select('credits').eq('id', wager.user_id).single();
                if (profile) {
                    await supabase.from('profiles').update({ credits: profile.credits + payout }).eq('id', wager.user_id);
                    console.log(`   Credited ${payout} CR to user.`);
                }
            }
            settledCount++;
        }
    }

    console.log(`\n✅ Done. Settled ${settledCount} wagers.`);
}

main().catch(console.error);
