// app/sports/golf/page.tsx
import React from 'react';
import { getGolfDashboard } from './actions';
import GolfDashboard from './components/GolfDashboard';
import LiveTicker from './components/LiveTicker';
import { Trophy } from 'lucide-react';

export const revalidate = 60; 

export default async function GolfPage() {
    const { leaderboard, rankings, fedex, schedule } = await getGolfDashboard();

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 pt-20">
            
            {/* STICKY TICKER */}
            <div className="sticky top-20 z-40 shadow-2xl border-b border-zinc-900">
                <LiveTicker data={leaderboard} />
            </div>

            {/* HEADER SECTION */}
            <div className="relative pt-16 pb-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/file.svg')] opacity-[0.02] bg-repeat pointer-events-none"></div>
                <div className="max-w-[1600px] mx-auto px-6 relative z-10">
                    <div className="flex flex-col xl:flex-row items-end justify-between gap-8 border-b border-zinc-800/50 pb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-[#DFFF00] tracking-widest uppercase mb-6">
                               <Trophy size={10} /> <span>PGA TOUR // SEASON 2025</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase mb-2">
                               Golf <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-zinc-500">Central</span>
                            </h1>
                            <p className="text-zinc-500 font-mono uppercase tracking-widest text-xs max-w-lg">
                                The ultimate hub for live scores, world rankings, and statistical leaders on the tour.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN DASHBOARD */}
            <div className="max-w-[1600px] mx-auto px-6">
                <GolfDashboard 
                    rankings={rankings || []} 
                    fedex={fedex || []} 
                    leaderboard={leaderboard} 
                    schedule={schedule || []}
                />
            </div>
        </div>
    );
}