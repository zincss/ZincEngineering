'use client';

import Link from 'next/link';
import { ArrowLeft, Trophy, Wind, Shield, Flag, ChevronRight } from 'lucide-react';

export default function SportsHub() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* HEADER SECTION */}
      <div className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto border-b border-zinc-800">
        <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-sm font-black tracking-widest uppercase mb-4">
            <Link href="/" className="hover:underline flex items-center gap-2">
                <ArrowLeft size={14} /> HOME
            </Link>
            <span className="text-zinc-600">/</span>
            <span>ATHLETICS_DIVISION</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            League <span className="text-zinc-700">Telemetry</span>
        </h1>
        <p className="text-zinc-400 font-mono max-w-2xl">
            Real-time tracking, historical archives, and performance analytics for global professional leagues. Access raw data streams below.
        </p>
      </div>

      {/* INDEX GRID */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NBA */}
            <Link 
                href="/sports/nba" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[300px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00]">
                        <Trophy size={40} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Basketball Ops
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        National Basketball Association. Real-time court telemetry, player rosters, and historical records.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        ACCESS FEED <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* F1 */}
            <Link 
                href="/sports/f1" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[300px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00]">
                        <Wind size={40} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Formula 1
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        Grand Prix telemetry. Constructor rankings, driver analytics, and circuit schematics.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        INITIALIZE <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* NRL - Updated to User Provided Image */}
            <Link 
                href="/sports/nrl" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[300px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://www.rlpa.com.au/wp-content/themes/yootheme/cache/5a/Erin-Clark-Named-2025-RLPA-NRL-Recruit-of-the-Year-5a22c256.jpeg')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00]">
                        <Shield size={40} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Rugby League
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        NRL Premiership. Match statistics, club data, and player performance tracking.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        OPEN DATABASE <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* GOLF */}
            <Link 
                href="/sports/golf" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[300px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00]">
                        <Flag size={40} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Fairway Control
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        PGA Tour & Global Golf. Live tournament scoring, world rankings, and shot analytics.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        TEE OFF <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

        </div>
      </div>
    </div>
  );
}