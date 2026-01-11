
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { getGemsOfTheWeek } from '../app/collections/gem-finder/actions';

// Note: To run this script with server actions, we might need a simpler data fetcher 
// because of next/headers usage in some actions.
// I will implement direct DB queries here for reliability in a standalone script.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchStats(league: 'nba' | 'nfl') {
    const sport = league === 'nfl' ? 'football' : 'basketball';
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/leaders`);
    return res.json();
}

async function generateEmailHtml(userData: any, globalData: any) {
    const { profile, portfolio, transactions, favorites } = userData;
    const { gems, nflLeaders, nbaLeaders } = globalData;

    const brandColor = '#DFFF00';
    const bgColor = '#09090b';
    const cardColor = '#18181b';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Zinc Digest</title>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: ${bgColor}; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { font-size: 48px; font-weight: 900; font-style: italic; letter-spacing: -2px; margin: 0; text-transform: uppercase; }
            .header .brand { color: ${brandColor}; }
            .section { background-color: ${cardColor}; border: 1px solid #27272a; border-radius: 24px; padding: 30px; margin-bottom: 30px; }
            .section-title { font-[900] text-transform: uppercase; font-size: 12px; letter-spacing: 2px; color: #71717a; margin-bottom: 20px; border-left: 3px solid ${brandColor}; padding-left: 10px; }
            .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .stat-card { background: #09090b; padding: 15px; border-radius: 16px; }
            .stat-value { font-size: 24px; font-weight: 900; color: #fff; }
            .stat-label { font-size: 10px; color: #52525b; text-transform: uppercase; margin-top: 5px; }
            .player-row { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #27272a; }
            .player-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .player-img { width: 50px; height: 50px; border-radius: 12px; background: #000; object-fit: cover; }
            .player-info h4 { margin: 0; font-size: 16px; text-transform: uppercase; }
            .player-info p { margin: 0; font-size: 12px; color: #71717a; }
            .gem-card { display: flex; gap: 15px; background: #000; padding: 15px; border-radius: 16px; margin-top: 15px; text-decoration: none; color: inherit; }
            .gem-img { width: 100px; height: 60px; border-radius: 8px; object-fit: cover; }
            .footer { text-align: center; font-size: 10px; color: #3f3f46; text-transform: uppercase; letter-spacing: 3px; margin-top: 40px; }
            .payout { color: ${brandColor}; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ZINC<span class="brand">DIGEST</span></h1>
                <p style="color: #52525b; font-size: 10px; font-weight: bold; letter-spacing: 2px;">SECURE_TRANSMISSION // ${new Date().toLocaleDateString()}</p>
            </div>

            <!-- WALLET & PERFORMANCE -->
            <div class="section">
                <div class="section-title">Operational Status</div>
                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-value">${profile.credits.toLocaleString()}</div>
                        <div class="stat-label">Available Credits</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color: ${brandColor}">${portfolio.length}</div>
                        <div class="stat-label">Stock Positions</div>
                    </div>
                </div>
            </div>

            <!-- PLAYER STATS -->
            <div class="section">
                <div class="section-title">Field Intelligence // NBA & NFL</div>
                ${favorites.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        ${favorites.map((f: any) => `
                            <div class="player-row">
                                <img src="${f.headshot_url}" class="player-img">
                                <div class="player-info">
                                    <h4>${f.player_name}</h4>
                                    <p>${f.league.toUpperCase()} // TRACKED_UNIT</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p style="font-size: 12px; color: #52525b;">Add players to your favorites to see their weekly analytics here.</p>
                `}
                
                <div style="margin-top: 20px;">
                    <h4 style="font-size: 10px; color: #3f3f46; text-transform: uppercase; margin-bottom: 10px;">League Leaders</h4>
                    <div style="display: flex; gap: 10px; overflow-x: auto;">
                        ${nbaLeaders.slice(0, 3).map((l: any) => `
                            <div style="background: #09090b; padding: 10px; border-radius: 12px; min-width: 120px;">
                                <div style="font-size: 14px; font-weight: bold;">${l.name}</div>
                                <div style="font-size: 10px; color: ${brandColor}">${l.value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- RECENT DISCOVERIES -->
            <div class="section">
                <div class="section-title">New Extractions // Gem Finder</div>
                <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 15px;">The automated discovery engine has identified new high-potential titles this week.</p>
                ${gems.slice(0, 2).map((gem: any) => `
                    <a href="${gem.storeUrl}" class="gem-card">
                        <img src="${gem.header_image}" class="gem-img">
                        <div>
                            <h4 style="margin: 0; font-size: 14px;">${gem.name}</h4>
                            <div style="font-size: 9px; color: #71717a; margin-top: 4px;">${gem.genres}</div>
                            <div style="font-size: 10px; color: ${brandColor}; margin-top: 4px;">${gem.reviews?.description}</div>
                        </div>
                    </a>
                `).join('')}
            </div>

            <!-- TRANSACTIONS -->
            ${transactions.length > 0 ? `
                <div class="section">
                    <div class="section-title">Financial Log</div>
                    ${transactions.slice(0, 5).map((tx: any) => `
                        <div style="display: flex; justify-between; align-items: center; margin-bottom: 10px; font-size: 12px;">
                            <span style="color: #71717a">${new Date(tx.created_at).toLocaleDateString()}</span>
                            <span style="flex: 1; margin: 0 10px; border-bottom: 1px dashed #27272a;"></span>
                            <span class="${tx.recipient_id === profile.id ? 'payout' : ''}">${tx.recipient_id === profile.id ? '+' : '-'}${tx.amount} CR</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="footer">
                STAY_SHARP // ZINC_SECURE_NODE_4 // ${new Date().getFullYear()}
            </div>
        </div>
    </body>
    </html>
    `;
}

async function main() {
    console.log("📨 STARTING WEEKLY DIGEST GENERATION...");

    // 1. Get Global Data
    console.log("   - Fetching global intelligence...");
    const [gems, nbaData, nflData] = await Promise.all([
        getGemsOfTheWeek(),
        fetchStats('nba'),
        fetchStats('nfl')
    ]);

    // Flatten ESPN leaders for easy display
    const nbaLeaders = nbaData.categories?.flatMap((c: any) => c.leaders.map((l: any) => ({
        name: l.athlete.displayName, 
        value: `${l.displayValue} ${c.displayName}` 
    }))) || [];

    const globalData = { gems, nbaLeaders, nflLeaders: [] };

    // 2. Get Users
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('weekly_digest_opt_in', true);

    if (error || !users) {
        console.error("Error fetching users:", error);
        return;
    }

    console.log(`   - Found ${users.length} operatives opted-in.`);

    for (const userProfile of users) {
        console.log(`   - Generating report for ${userProfile.username}...`);

        // Fetch User-specific data
        const [portfolio, transactions, favorites] = await Promise.all([
            supabase.from('stock_portfolio').select('*').eq('user_id', userProfile.id),
            supabase.from('credit_transactions').select('*').or(`sender_id.eq.${userProfile.id},recipient_id.eq.${userProfile.id}`).order('created_at', { ascending: false }).limit(10),
            supabase.from('favorite_players').select('*').eq('user_id', userProfile.id)
        ]);

        const userData = {
            profile: userProfile,
            portfolio: portfolio.data || [],
            transactions: transactions.data || [],
            favorites: favorites.data || []
        };

        const html = await generateEmailHtml(userData, globalData);

        // --- EMAIL SENDING LOGIC ---
        // In a production app, you would use a service like Resend, Postmark, or SendGrid here.
        // For this task, we will simulate the send by logging the result.
        
        console.log(`     ✅ Digest ready for ${userProfile.email || userProfile.username}. Size: ${html.length} bytes.`);
        
        // Example:
        // await resend.emails.send({
        //   from: 'Zinc <digest@zincengineering.com>',
        //   to: userProfile.email,
        //   subject: 'Weekly Operational Intelligence',
        //   html: html
        // });
    }

    console.log("\n🚀 DIGEST CYCLE COMPLETE.");
}

main().catch(console.error);
