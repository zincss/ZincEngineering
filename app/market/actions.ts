'use server'

import { createClient } from '@/utils/supabase/server';
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

// Buy Stock
export async function buyStock(ticker: string, quantity: number) {
  const supabase = createClient();
  
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
  const supabase = createClient();
  
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

// --- DEALERSHIP ACTIONS ---

export async function purchaseVehicle(carId: string, price: number, name: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  // 1. CHECK GARAGE AVAILABILITY
  // We fetch all properties the user owns, including their template stats and currently used slots.
  const { data: properties, error: propError } = await supabase
    .from('user_properties')
    .select(`
      id,
      template:property_templates ( max_garage_slots ),
      slots:property_slots ( type )
    `)
    .eq('user_id', user.id);

  if (propError || !properties) {
      console.error('Residence Check Failed:', propError);
      return { error: 'Could not verify residence status. Try again.' };
  }

  let totalGarageCapacity = 0;
  let occupiedGarageSlots = 0;

  // Calculate total capacity vs usage across all properties
  properties.forEach((prop: any) => {
      // Add capacity from this property's template
      if (prop.template) {
          totalGarageCapacity += (prop.template.max_garage_slots || 0);
      }
      // Count currently filled garage slots
      if (prop.slots) {
          const garageItems = prop.slots.filter((s: any) => s.type === 'GARAGE');
          occupiedGarageSlots += garageItems.length;
      }
  });

  const availableSpace = totalGarageCapacity - occupiedGarageSlots;

  // REJECT if no space
  if (availableSpace <= 0) {
      return { 
        error: totalGarageCapacity === 0 
          ? 'You must own a Residence with a Garage to purchase vehicles.' 
          : `Your Garages are full (${occupiedGarageSlots}/${totalGarageCapacity}). Upgrade your residence or sell a car first.` 
      };
  }

  // 2. CHECK CREDITS
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (!profile || profile.credits < price) {
    return { error: 'Insufficient funds' };
  }

  // 3. DEDUCT CREDITS
  const { error: updateError } = await supabase.rpc('deduct_credits', {
    amount: price,
    row_id: user.id
  });

  if (updateError) {
    // Fallback: Direct Update if RPC fails
    const { error: directUpdateError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - price })
        .eq('id', user.id);
        
    if (directUpdateError) return { error: 'Transaction failed' };
  }

  // 4. DELIVER ASSET (Save to user_cars)
  const { error: insertError } = await supabase
    .from('user_cars')
    .insert({
      user_id: user.id,
      car_id: carId, // Maps to 'id' in your CARS data
      purchase_price: price,
      acquired_at: new Date().toISOString(),
      condition: 100 // Default condition (optional)
    });

  if (insertError) {
    console.error('Asset Delivery Error:', insertError);
    return { error: 'Payment successful, but asset delivery failed. Contact Support with ID: ' + carId }; 
  }

  revalidatePath('/market');
  revalidatePath('/residence');
  revalidatePath('/profile');
  
  return { success: true };
}