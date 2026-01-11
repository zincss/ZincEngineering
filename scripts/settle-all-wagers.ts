
import { createClient } from '@supabase/supabase-js';
// We need to use require for the service because of TS execution context issues in scripts sometimes, 
// but let's try import first. If it fails, we will inline the logic.
// Actually, to be safe and avoid "cannot use import outside module" or path alias issues:
// I will inline the getGameResult logic or a simplified version of it.
// It's safer for a standalone script.

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
                console.log(`  Leg ${leg.id.slice(0, 8)}: Game ${realGameId} not finished.`);
                anyLegPending = true;
                continue;
            }

            let legStatus = 'pending';
            const selection = leg.selection.toLowerCase();
            
            if (leg.type === 'moneyline') {
                const winner = result.home.winner ? 'home' : 'away';
                if (selection === 'home' || selection === 'away') {
                     if (selection === winner) legStatus = 'won';
                     else legStatus = 'lost';
                } else {
                    legStatus = 'lost'; 
                }
            } else if (leg.type === 'spread') {
                const [side, lineStr] = selection.split(':');
                const line = parseFloat(lineStr);

                if (!side || isNaN(line)) {
                    console.log(`  Leg ${leg.id.slice(0, 8)}: Invalid Spread Format (${selection}).`);
                    anyLegPending = true;
                    continue;
                }

                const homeScore = result.home.score;
                const awayScore = result.away.score;
                let scoreDiff = 0;

                if (side === 'home') scoreDiff = homeScore - awayScore;
                else if (side === 'away') scoreDiff = awayScore - homeScore;
                
                if (scoreDiff + line > 0) legStatus = 'won';
                else if (scoreDiff + line < 0) legStatus = 'lost';
                else legStatus = 'void';
                
            } else if (leg.type === 'total') {
                const [side, lineStr] = selection.split(':');
                const line = parseFloat(lineStr);

                if (!side || isNaN(line)) {
                    console.log(`  Leg ${leg.id.slice(0, 8)}: Invalid Total Format (${selection}).`);
                    anyLegPending = true;
                    continue;
                }

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
