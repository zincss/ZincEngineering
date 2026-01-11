import React from 'react';
import { getGolfDashboard } from './actions';
import GolfHeader from './components/GolfHeader';
import TournamentCard from './components/TournamentCard';
import GolfLeaderboard from './components/GolfLeaderboard';
import GolfWagerGrid from './components/GolfWagerGrid';
import StatLeaders from './components/StatLeaders';
import WagerHistory from '../wagers/components/WagerHistory';

export const dynamic = 'force-dynamic';

export default async function GolfHub() {
  const { live, rankings, stats } = await getGolfDashboard();

  // Transform rankings for the slideshow to rotate through the top 10 players
  // LeaderSlideshow rotates through the *keys* of the object passed to it.
  const slideshowData: any = {};
  if (rankings && rankings.length > 0) {
      rankings.slice(0, 10).forEach((player: any) => {
          slideshowData[`Rank ${player.rank}`] = [player];
      });
  } else {
      // Fallback to stats if no rankings
      Object.assign(slideshowData, stats);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-[#DFFF00] selection:text-black font-sans">
      
      {/* HEADER */}
      <GolfHeader leaders={slideshowData} />

      {/* --- LIVE TICKER --- */}
      <GolfLeaderboard data={live} />

      {/* --- MAIN GRID --- */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        
        {/* TOURNAMENT INFO */}
        <div className="mb-12">
            <TournamentCard data={live} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COL 1: WAGERING & MAIN CONTENT (8 Spans) */}
            <div className="lg:col-span-8">
                {/* WAGERING SECTION */}
                <GolfWagerGrid tournament={live} players={live?.leaderboard || []} />
                
                {/* Wager History */}
                <WagerHistory />
            </div>

            {/* COL 2: STATS & LEADERS (4 Spans) */}
            <div className="lg:col-span-4">
                <StatLeaders stats={stats} />
            </div>

        </div>
      </div>
    </main>
  );
}
