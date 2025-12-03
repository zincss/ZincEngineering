// app/sports/golf/page.tsx
import React from 'react';
import { getGolfDashboard } from './actions';
import GolfDashboard from './components/GolfDashboard';
import LiveTicker from './components/LiveTicker';
import { Trophy } from 'lucide-react';
import BackButton from '../../components/BackButton';

export const revalidate = 60; 

export default async function GolfPage() {
    const { leaderboard, rankings, fedex, schedule } = await getGolfDashboard();

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 pt-20">
            <BackButton href="/sports" />
            
            {/* STICKY TICKER */}
            <div className="sticky top-20 z-40 shadow-2xl border-b border-zinc-900">
                <LiveTicker data={leaderboard} />
            </div>

            {/* HEADER SECTION */}
            {/* ... rest of content ... */}
            <div className="relative pt-16 pb-12 overflow-hidden">
                {/* ... */}
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