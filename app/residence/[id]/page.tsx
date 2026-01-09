import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { PROPERTY_FLAVOR } from '../lib/data';
import PropertyDashboard from './client-view';

// [FIX] Required for static export
export async function generateStaticParams() {
  return [];
}

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) redirect('/login');

  // 1. Fetch the Property (and deep nested data)
  const { data: property } = await supabase
    .from('user_properties')
    .select(`
      *,
      template:property_templates(*),
      slots:property_slots(
        slot_index,
        type,
        inventory_item:inventory_items(
          id, 
          item_template:item_templates(name, image_url, rarity)
        ) 
      )
    `)
    .eq('id', params.id)
    .single();

  if (!property) notFound();

  // 2. Fetch Player Inventory (for equipping to display slots)
  const { data: inventory } = await supabase
    .from('inventory_items')
    .select('id, rarity, item_template:item_templates(name, rarity, image_url)')
    .eq('owner_id', user.id);

  // 3. Fetch Player Vehicles (for garage slots)
  // Note: If you haven't built the car system yet, this might return null/empty, which is fine.
  const { data: vehicles } = await supabase
    .from('user_cars') 
    .select('*')
    .eq('user_id', user.id);
  
  // 4. Get Visual Flavor
  const flavor = PROPERTY_FLAVOR[property.template.name] || PROPERTY_FLAVOR['The Pod'];

  return (
    <PropertyDashboard 
        property={property} 
        inventory={inventory || []} 
        vehicles={vehicles || []}
        flavor={flavor}
    />
  );
}