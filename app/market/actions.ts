'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getCurrentPrice, getStockHistory } from './lib/utils';
import { COMPANIES } from './lib/data';
import { revalidatePath } from 'next/cache';

// Fetch market with history
export async function getMarketStatus() {
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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
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

// Buy Stock
export async function buyStock(ticker: string, quantity: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const price = getCurrentPrice(ticker);
  const totalCost = Math.ceil(price * quantity);

  const { error } = await supabase.rpc('buy_stock', {
    p_ticker: ticker,
    p_quantity: quantity,
    p_price: price,
    p_total_cost: totalCost
  });

  if (error) return { error: error.message };
  
  revalidatePath('/market');
  return { success: true, price };
}

// Sell Stock
export async function sellStock(ticker: string, quantity: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const price = getCurrentPrice(ticker);
  const totalValue = Math.floor(price * quantity);

  const { error } = await supabase.rpc('sell_stock', {
    p_ticker: ticker,
    p_quantity: quantity,
    p_price: price,
    p_total_val: totalValue
  });

  if (error) return { error: error.message };

  revalidatePath('/market');
  return { success: true, price };
}