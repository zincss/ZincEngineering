'use server'

import { createClient } from '@/utils/supabase/server';
import { getCurrentPrice } from './utils';
import { revalidatePath } from 'next/cache';

// Fetch market with history
export async function getMarketStatus() {
  const { COMPANIES } = await import('./data');
  const { getStockHistory } = await import('./utils');

  const market = COMPANIES.map(c => {
    const history = getStockHistory(c.ticker, 24);
    const currentPrice = history[history.length - 1];
    const openPrice = history[0];
    
    return {
      ...c,
      currentPrice,
      change: ((currentPrice - openPrice) / openPrice) * 100,
      history
    };
  });
  
  return market;
}

// Fetch user's portfolio
export async function getPortfolio() {
  // [FIX] No arguments needed
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('user_id', user.id);
    
  if (error) {
    console.error("Portfolio fetch error:", error);
    return [];
  }
  
  return data || [];
}

// Buy Stock via Secure RPC
export async function buyStock(ticker: string, quantity: number) {
  // [FIX] No arguments needed
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const price = getCurrentPrice(ticker);
  const totalCost = Math.ceil(price * quantity);

  // Call the SQL function we created
  const { error } = await supabase.rpc('buy_stock', {
    p_ticker: ticker,
    p_quantity: quantity,
    p_price: price,
    p_total_cost: totalCost
  });

  if (error) return { error: error.message };
  
  revalidatePath('/play/stocks');
  return { success: true, price };
}

// Sell Stock via Secure RPC
export async function sellStock(ticker: string, quantity: number) {
  // [FIX] No arguments needed
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const price = getCurrentPrice(ticker);
  const totalValue = Math.floor(price * quantity);

  // Call the SQL function we created
  const { error } = await supabase.rpc('sell_stock', {
    p_ticker: ticker,
    p_quantity: quantity,
    p_price: price,
    p_total_val: totalValue
  });

  if (error) return { error: error.message };

  revalidatePath('/play/stocks');
  return { success: true, price };
}