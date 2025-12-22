import React from 'react';
import { getGolfDashboard } from './actions';
import LiveTournament from './components/LiveTournament';

export const dynamic = 'force-dynamic';

export default async function GolfHub() {
  const { live, rankings } = await getGolfDashboard();

  return (
    <main className="h-screen bg-black text-white selection:bg-[#DFFF00] selection:text-black overflow-hidden flex flex-col font-sans">
      
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-900/20 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#DFFF00]/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col pt-32 md:pt-40 pb-8 px-4 md:px-8 max-w-[1920px] mx-auto w-full relative z-10">
            {/* Pass both LIVE data AND RANKINGS data */}
            <div className="flex-1 min-h-0 animate-in fade-in zoom-in-95 duration-1000 slide-in-from-bottom-4">
                <LiveTournament data={live} fallbackData={rankings} />
            </div>
      </div>
    </main>
  );
}