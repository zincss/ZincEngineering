import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function main() {
    console.log("💸 STARTING REFUND PROCESS FOR INVALID WAGERS...");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("❌ Missing Supabase Env Vars");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get all pending wagers with their legs
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

    console.log(`Scanning ${wagers.length} pending wagers...`);
    let refundedCount = 0;

    for (const wager of wagers) {
        let shouldRefund = false;

        // Check if any leg is an "old format" spread or total
        for (const leg of wager.wager_legs) {
            if (leg.type === 'spread' || leg.type === 'total') {
                // New format uses ':', old format was just 'home', 'away', 'over', 'under'
                if (!leg.selection.includes(':')) {
                    shouldRefund = true;
                    console.log(`  ⚠️ Wager ${wager.id.slice(0, 8)} has invalid leg: ${leg.type} "${leg.selection}"`);
                    break;
                }
            }
        }

        if (shouldRefund) {
            console.log(`  🔄 Refunding Wager ${wager.id.slice(0, 8)} (${wager.amount} CR)...`);

            // 1. Mark Wager as Void
            await supabase.from('sports_wagers').update({ status: 'void', payout: wager.amount }).eq('id', wager.id);

            // 2. Mark Legs as Void
            await supabase.from('wager_legs').update({ status: 'void' }).eq('wager_id', wager.id);

            // 3. Refund User
            const { data: profile } = await supabase.from('profiles').select('credits').eq('id', wager.user_id).single();
            if (profile) {
                await supabase.from('profiles').update({ credits: profile.credits + wager.amount }).eq('id', wager.user_id);
                console.log(`     ✅ User credited. New Balance: ${profile.credits + wager.amount}`);
            }

            // 4. Create Refund Transaction Record
            await supabase.from('credit_transactions').insert({
                sender_id: wager.user_id, // Self-reference or system ID ideally, but user_id works for "to self" context
                recipient_id: wager.user_id,
                amount: wager.amount,
                type: 'refund',
                metadata: { reason: 'System Migration - Invalid Wager Format', wager_id: wager.id }
            });

            refundedCount++;
        }
    }

    console.log(`
🎉 Done. Refunded ${refundedCount} wagers.`);
}

main().catch(console.error);
