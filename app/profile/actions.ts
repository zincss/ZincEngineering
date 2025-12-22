'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const QUICK_SELL_VALUES: Record<string, number> = {
    'COMMON': 2, 'UNCOMMON': 5, 'RARE': 20, 'SUPER_RARE': 100, 
    'ULTRA': 500, 'ZENITH': 2000, 'COSMIC': 5000
};

const BREAKDOWN_YIELDS: Record<string, { type: string, amount: number }> = {
    'COMMON': { type: 'BASIC_SCRAP', amount: 3 },
    'UNCOMMON': { type: 'UNCOMMON_CIRCUITS', amount: 2 },
    'RARE': { type: 'RARE_ALLOY', amount: 1 },
    'SUPER_RARE': { type: 'PLASMA_CORE', amount: 1 },
    'ULTRA': { type: 'VOID_CRYSTAL', amount: 1 },
    'ZENITH': { type: 'QUANTUM_SHARD', amount: 1 },
    'COSMIC': { type: 'COSMIC_DUST', amount: 5 }
};

export async function quickSellItem(itemId: string, rarity: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const value = QUICK_SELL_VALUES[rarity] || 2;

    // Transaction: Delete item, Add credits
    const { error } = await supabase.rpc('quick_sell_transaction', {
        p_user_id: user.id,
        p_item_id: itemId,
        p_amount: value
    });

    if (error) {
        console.error("Quick Sell Error:", error);
        return { error: 'Transaction failed' };
    }

    revalidatePath('/profile');
    return { success: true, message: `Sold for ${value} Credits` };
}

export async function breakdownItem(itemId: string, rarity: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const yieldData = BREAKDOWN_YIELDS[rarity] || BREAKDOWN_YIELDS['COMMON'];

    // Transaction: Delete item, Add material
    const { error } = await supabase.rpc('breakdown_transaction', {
        p_user_id: user.id,
        p_item_id: itemId,
        p_material_type: yieldData.type,
        p_quantity: yieldData.amount
    });

    if (error) {
        console.error("Breakdown Error:", error);
        return { error: 'Breakdown failed' };
    }

    revalidatePath('/profile');
    return { success: true, message: `Salvaged ${yieldData.amount}x ${yieldData.type.replace('_', ' ')}` };
}

export async function listAuctionItem(itemId: string, startPrice: number, buyoutPrice: number, durationHours: number) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + durationHours);

    // Verify ownership and insert
    const { error } = await supabase
        .from('auctions')
        .insert({
            seller_id: user.id,
            item_id: itemId,
            start_price: startPrice,
            current_bid: startPrice,
            buyout_price: buyoutPrice,
            ends_at: endsAt.toISOString(),
            status: 'ACTIVE'
        });

    if (error) {
        console.error("Auction Error:", error);
        return { error: 'Failed to create listing' };
    }

    revalidatePath('/profile');
    revalidatePath('/market');
    return { success: true, message: 'Item listed on Auction House' };
}