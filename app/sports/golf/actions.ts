'use server';

import { getOrFetchResource } from '@/lib/data-manager';
import * as ESPN from './lib/espn';

// CONFIG: Snapshot Caching Durations (Hours)
const CACHE_CONFIG = {
  LEADERBOARD: 0.05, // 3 minutes (Live Data)
  RANKINGS: 24,      // 24 Hours
  SCHEDULE: 12       // 12 Hours
};

// --- MAIN DATA HUB ---
export async function getGolfHubData() {
  
  // 1. Parallel Fetch with Snapshot Management
  const [liveData, rankings, schedule] = await Promise.all([
    
    // LIVE LEADERBOARD SNAPSHOT
    getOrFetchResource({
        table: 'golf_snapshots', 
        keyField: 'key', 
        id: 'live_leaderboard', 
        expirationHours: CACHE_CONFIG.LEADERBOARD
    }, ESPN.fetchLiveGolfData),

    // RANKINGS SNAPSHOT
    getOrFetchResource({
        table: 'golf_snapshots', 
        keyField: 'key', 
        id: 'world_rankings', 
        expirationHours: CACHE_CONFIG.RANKINGS
    }, ESPN.fetchRankings),

    // SCHEDULE SNAPSHOT
    getOrFetchResource({
        table: 'golf_snapshots', 
        keyField: 'key', 
        id: 'tour_schedule', 
        expirationHours: CACHE_CONFIG.SCHEDULE
    }, ESPN.fetchSchedule)
  ]);

  // 2. Data Synthesis (Fallbacks if snapshot creation fails completely)
  const eventData = liveData?.event || getFallbackEvent();
  
  // 3. Calculate Season Stats (Derived from current rankings/performance)
  const seasonStats = [
      { 
          label: 'FEDEX CUP', 
          value: 'Tommy Fleetwood', // Placeholder or fetch real FedEx points if available
          sub: 'CHAMPION', 
          trend: '2025', 
          image: 'https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_350,q_auto,w_280/headshots_30911.png' 
      },
      { 
          label: 'WORLD NO.1', 
          value: rankings?.[0]?.name || 'Scottie Scheffler', 
          sub: rankings?.[0]?.points || '0.00', 
          trend: 'LEADER', 
          image: rankings?.[0]?.image 
      },
      { 
          label: 'DRIVING DIST', 
          value: 'Aldrich Potgieter', 
          sub: '325.0 YDS', 
          trend: '#1', 
          // We use the ID-based image here as a fallback, BUT since we use ESPN above for rankings, 
          // those images will now be 100% correct.
          image: 'https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_350,q_auto,w_280/headshots_63343.png' 
      },
      { 
          label: 'DEFENDING', 
          value: eventData.defendingChamp?.name || 'TBD', 
          sub: 'CHAMPION', 
          trend: 'REIGNING', 
          // Try to find image in rankings, else generic
          image: rankings?.find((r:any) => r.name === eventData.defendingChamp?.name)?.image || null
      }
  ];

  return {
      event: eventData,
      rankings: rankings || [],
      schedule: schedule || [],
      seasonStats,
      season: 2025
  };
}

// --- FALLBACK DATA (Only used if ESPN API & DB both fail) ---
function getFallbackEvent() {
    return {
        id: 'hero-2025',
        name: 'Hero World Challenge',
        course: 'Albany Golf Club',
        location: 'New Providence, BAH',
        status: 'SCHEDULED', 
        startTime: '2025-12-04T22:00:00+11:00',
        purse: '$5,000,000',
        par: 72,
        defendingChamp: { name: 'Scottie Scheffler', score: '-20' },
        leaderboard: []
    };
}