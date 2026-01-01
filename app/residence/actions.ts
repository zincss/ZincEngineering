'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// --- 1. PURCHASE PROPERTY ---
export async function purchaseProperty(templateId: string, price: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Call the robust Postgres Function we created
  const { error } = await supabase.rpc('purchase_property_tx', {
    p_user_id: user.id,
    p_template_id: templateId,
    p_cost: price
  });

  if (error) {
    console.error('Purchase Error:', error);
    return { error: error.message || 'Transaction Failed' };
  }

  revalidatePath('/residence');
  return { success: true };
}

// --- 2. SET SPAWN POINT (Primary Residence) ---
export async function setPrimaryResidence(propertyId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Unset previous primary, set new one
  await supabase.from('user_properties').update({ is_primary: false }).eq('user_id', user.id);
  await supabase.from('user_properties').update({ is_primary: true }).eq('id', propertyId);

  revalidatePath('/residence');
  return { success: true };
}

// --- 3. COLLECT YIELD (The "Safe") ---
export async function collectPropertyYield(propertyId: string, calculatedAmount: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  if (calculatedAmount <= 0) return { error: 'Nothing to collect' };

  // Call the Postgres Function
  const { error } = await supabase.rpc('payout_property_yield', {
    p_user_id: user.id,
    p_property_id: propertyId,
    p_amount: calculatedAmount
  });

  if (error) return { error: 'Collection Failed' };

  revalidatePath(`/residence/${propertyId}`);
  return { success: true };
}

// --- 4. PURCHASE UPGRADE ---
export async function purchaseUpgrade(propertyId: string, upgradeSlug: string, cost: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase.rpc('purchase_property_upgrade', {
    p_user_id: user.id,
    p_property_id: propertyId,
    p_upgrade_slug: upgradeSlug,
    p_cost: cost
  });

  if (error) return { error: 'Upgrade Failed' };

  revalidatePath(`/residence/${propertyId}`);
  return { success: true };
}

// --- 5. EQUIP ITEM / VEHICLE (Zoning Logic) ---
export async function equipItemToSlot(
    propertyId: string, 
    itemId: string | null, // null = unequip
    slotIndex: number, 
    type: 'DISPLAY' | 'OPERATIONS' | 'GARAGE'
) {
  const supabase = createClient();
  
  // Upsert the slot configuration
  const { error } = await supabase
    .from('property_slots')
    .upsert({ 
      user_property_id: propertyId, 
      inventory_item_id: itemId,
      slot_index: slotIndex,
      type: type 
    }, { onConflict: 'user_property_id, slot_index, type' });

  if (error) {
      console.error(error);
      return { error: 'Failed to update slot' };
  }
  
  revalidatePath(`/residence/${propertyId}`);
  return { success: true };
}