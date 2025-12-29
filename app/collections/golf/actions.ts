'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// --- TYPES ---
export type UnitSystem = 'METRIC' | 'IMPERIAL';

export type Club = {
  id: string; 
  name: string;
  dist: number; 
  type: 'WOOD' | 'IRON' | 'WEDGE' | 'SPECIAL';
};

export type GolfProfile = {
  clubs: Club[];
  units: UnitSystem;
};

// Default setup
const DEFAULT_BAG: Club[] = [
    { id: '1', name: 'DRIVER', dist: 250, type: 'WOOD' },
    { id: '2', name: '3 WOOD', dist: 230, type: 'WOOD' },
    { id: '3', name: '5 IRON', dist: 185, type: 'IRON' },
    { id: '4', name: '7 IRON', dist: 165, type: 'IRON' },
    { id: '5', name: 'PW', dist: 135, type: 'WEDGE' },
    { id: '6', name: 'PUTTER', dist: 0, type: 'SPECIAL' },
];

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

export async function getUserProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, data: { clubs: DEFAULT_BAG, units: 'IMPERIAL' as UnitSystem } };

  const { data, error } = await supabase
    .from('golf_profiles')
    .select('bag_data')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return { success: true, data: { clubs: DEFAULT_BAG, units: 'IMPERIAL' as UnitSystem } };
  }

  // Handle migration from old array format to new object format
  const rawData = data.bag_data;
  if (Array.isArray(rawData)) {
      return { success: true, data: { clubs: rawData, units: 'IMPERIAL' as UnitSystem } };
  }

  return { success: true, data: rawData as GolfProfile };
}

export async function saveUserProfile(profile: GolfProfile) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be logged in.' };

  const { error } = await supabase
    .from('golf_profiles')
    .upsert({ 
      user_id: user.id, 
      bag_data: profile,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving profile:', error);
    return { success: false, message: 'Failed to save.' };
  }

  revalidatePath('/collections/golf');
  return { success: true, message: 'Armory Updated' };
}