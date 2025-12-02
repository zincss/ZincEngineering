// app/sports/golf/page.tsx
import React from 'react';
import { getGolfDashboard } from './actions';
import GolfDashboard from './components/GolfDashboard';
import LiveTicker from './components/LiveTicker';

export const revalidate = 60; 

export default async function GolfPage() {
    // We fetch the data, but any of these could technically be null if the API is down
    const { leaderboard, rankings, fedex, schedule } = await getGolfDashboard();

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 pt-20">
            
            {/* STICKY TICKER (Sorted by golf-api) */}
            <div className="sticky top-20 z-40 shadow-2xl">
                <LiveTicker data={leaderboard} />
            </div>

            <div className="pt-12 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 mb-12">
                <div className="flex flex-col xl:flex-row items-end justify-between gap-8 pb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-[#DFFF00] tracking-widest uppercase mb-6">
                           <span>PGA TOUR // SEASON 2025</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase mb-2">
                           Golf <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-zinc-500">Central</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6">
                <GolfDashboard 
                    // FIX: Default to empty arrays to satisfy TypeScript and prevent crashes
                    rankings={rankings || []} 
                    fedex={fedex || []} 
                    leaderboard={leaderboard} 
                    schedule={schedule || []}
                />
            </div>
        </div>
    );
}