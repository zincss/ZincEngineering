'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// --- TYPES ---
export type Club = {
  name: string;
  dist: number; // Carry distance in yards/meters
  type: 'WOOD' | 'IRON' | 'WEDGE' | 'SPECIAL';
};

const DEFAULT_BAG: Club[] = [
    { name: 'DRIVER', dist: 250, type: 'WOOD' },
    { name: '3 WOOD', dist: 230, type: 'WOOD' },
    { name: '5 IRON', dist: 185, type: 'IRON' },
    { name: '6 IRON', dist: 175, type: 'IRON' },
    { name: '7 IRON', dist: 165, type: 'IRON' },
    { name: '8 IRON', dist: 155, type: 'IRON' },
    { name: '9 IRON', dist: 145, type: 'IRON' },
    { name: 'PW', dist: 135, type: 'WEDGE' },
    { name: 'SW', dist: 110, type: 'WEDGE' },
    { name: 'PUTTER', dist: 0, type: 'SPECIAL' },
];

// --- EXISTING TOUR FETCH (Kept Intact) ---
const LEADERBOARD_API = 'https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga';

export async function fetchLiveTourCourse() {
    try {
        const res = await fetch(LEADERBOARD_API, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        const event = data.events?.[0];
        const competition = event?.competitions?.[0];
        const courseInfo = competition?.venue;
        const courseData = competition?.courses?.[0];

        if (!courseData || !courseData.holes) {
            return { success: false, message: "LIVE COURSE DATA UNAVAILABLE" };
        }

        const holes = courseData.holes.map((h: any) => h.par);
        const parTotal = courseData.par ? courseData.par : holes.reduce((a: number, b: number) => a + b, 0);

        return {
            success: true,
            data: {
                id: `live-${event.id}`,
                name: courseInfo?.fullName || event.name,
                location: `${courseInfo?.address?.city || 'Unknown'}, ${courseInfo?.address?.state || ''}`,
                parTotal: parTotal,
                holes: holes 
            }
        };

    } catch (error) {
        console.error("Error fetching live course:", error);
        return { success: false, message: "CONNECTION FAILED" };
    }
}

// --- NEW: ARMORY ACTIONS ---

export async function getUserBag() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, data: DEFAULT_BAG };

  const { data, error } = await supabase
    .from('golf_profiles')
    .select('bag_data')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    // Return default if no custom profile exists yet
    return { success: true, data: DEFAULT_BAG };
  }

  return { success: true, data: data.bag_data as Club[] };
}

export async function saveUserBag(bag: Club[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be logged in to save loadouts.' };

  const { error } = await supabase
    .from('golf_profiles')
    .upsert({ 
      user_id: user.id, 
      bag_data: bag,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving bag:', error);
    return { success: false, message: 'Failed to save loadout.' };
  }

  revalidatePath('/collections/golf');
  return { success: true, message: 'Ballistics data updated.' };
}