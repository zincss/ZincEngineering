'use server'

import { createClient } from '@/utils/supabase/client';
import { COMPANIES } from './data';
import { getCurrentPrice } from './utils';
import { revalidatePath } from 'next/cache';

// Fetch the current market state
export async function getMarketStatus() {
  const market = COMPANIES.map(c => {
    const price = getCurrentPrice(c.ticker);
    return {
      ...c,
      currentPrice: price,
      change: ((price - c.basePrice) / c.basePrice) * 100
    };
  });
  return market;
}

// Buy Stock
export async function buyStock(ticker: string, quantity: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const price = getCurrentPrice(ticker);
  const totalCost = Math.ceil(price * quantity);

  // 1. Check Balance
  const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
  if (!profile || profile.credits < totalCost) return { error: 'Insufficient Funds' };

  // 2. Execute Trade (RPC recommended for atomicity)
  // Assumes you create a 'buy_stock' RPC in Supabase
  const { error } = await supabase.rpc('buy_stock', {
    p_user_id: user.id,
    p_ticker: ticker,
    p_quantity: quantity,
    p_price: price,
    p_total_cost: totalCost
  });

  if (error) return { error: error.message };
  
  revalidatePath('/play/stocks');
  revalidatePath('/profile');
  return { success: true, price };
}

// Sell Stock
export async function sellStock(ticker: string, quantity: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const price = getCurrentPrice(ticker);
  const totalValue = Math.floor(price * quantity);

  // Execute Trade via RPC
  const { error } = await supabase.rpc('sell_stock', {
    p_user_id: user.id,
    p_ticker: ticker,
    p_quantity: quantity,
    p_price: price,
    p_total_value: totalValue
  });

  if (error) return { error: error.message };

  revalidatePath('/play/stocks');
  revalidatePath('/profile');
  return { success: true, price };
}