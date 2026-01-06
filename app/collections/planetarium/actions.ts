'use server'

import { createClient } from '@/utils/supabase/server';

export interface PlanetariumSaveData {
    fuel: number;
    boost: number;
    credits: number;
    current_system: 'solar' | 'fantasy';
    location_id: string | null;
    docked_at: string | null;
    position: { x: number, y: number, z: number } | null;
}

export async function getPlayerSave() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch save data
    const { data, error } = await supabase
        .from('planetarium_saves')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error("Error fetching save:", error);
        return null;
    }

    if (!data) {
        // Create default save if none exists
        const defaultSave = {
            user_id: user.id,
            fuel: 2000,
            boost: 100,
            credits: 1000,
            current_system: 'solar',
            location_id: 'earth',
            docked_at: 'earth'
        };
        
        await supabase.from('planetarium_saves').insert(defaultSave);
        return { 
            ...defaultSave, 
            position: null 
        };
    }

    return {
        fuel: data.fuel,
        boost: data.boost,
        credits: data.credits,
        current_system: data.current_system,
        location_id: data.location_id,
        docked_at: data.docked_at,
        position: (data.position_x !== null) ? {
            x: data.position_x,
            y: data.position_y,
            z: data.position_z
        } : null
    };
}

export async function savePlayerProgress(data: PlanetariumSaveData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authorized' };

    // 1. Update Planetarium Save
    const { error: saveError } = await supabase
        .from('planetarium_saves')
        .upsert({
            user_id: user.id,
            fuel: data.fuel,
            boost: data.boost,
            credits: data.credits,
            current_system: data.current_system,
            location_id: data.location_id,
            docked_at: data.docked_at,
            position_x: data.position?.x ?? null,
            position_y: data.position?.y ?? null,
            position_z: data.position?.z ?? null,
            last_updated: new Date().toISOString()
        });

    if (saveError) {
        console.error("Save Error:", saveError);
        return { error: 'Failed to save progress' };
    }

    // 2. Sync Credits to Main Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ credits: data.credits })
        .eq('id', user.id);

    if (profileError) console.error("Profile Sync Error:", profileError);

    // REMOVED: revalidatePath('/collections/planetarium'); 
    // This stops the page from reloading/flickering on every save.
    return { success: true };
}

export async function claimJobReward(amount: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authorized' };

    const { error } = await supabase.rpc('increment_credits', { 
        amount_to_add: amount, 
        user_id_arg: user.id 
    });

    if (error) {
        const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
        if (profile) {
            await supabase.from('profiles').update({ credits: profile.credits + amount }).eq('id', user.id);
            await supabase.from('planetarium_saves').update({ credits: profile.credits + amount }).eq('id', user.id);
        }
    }
    
    return { success: true };
}