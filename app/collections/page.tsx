'use client';

import React from 'react';
import Link from 'next/link';
import { CarFront, Gamepad2, ChevronRight, Flag, CloudHail } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function CollectionsHub() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* GLOBAL BACK BUTTON */}
      <BackButton href="/" label="MAIN TERMINAL" />

      {/* HEADER SECTION */}
      <div className="pt-40 md:pt-32 pb-12 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 relative">
        
        <div className="absolute top-32 right-6 flex items-center gap-2 text-[#DFFF00] font-mono text-sm font-black tracking-widest uppercase animate-in fade-in slide-in-from-right-4 duration-1000">
            <span className="text-zinc-600">/</span>
            <span>COLLECTIONS_CODEX</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Digital <span className="text-zinc-700">Archives</span>
        </h1>
        <p className="text-zinc-400 font-mono max-w-2xl">
            Central repository for specialized item databases, mechanical schematics, and interactive encyclopedias.
        </p>
      </div>

      {/* INDEX GRID */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* LINK 1: WARFRAME / GAMING */}
            <Link 
                href="/gaming" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[300px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00]">
                        <Gamepad2 size={40} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Gaming Database
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        Warframe market data, module configurations, and item archives.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        ACCESS DATABASE <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* LINK 2: AUTOMOTIVE */}
            <Link 
                href="/automotive" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[300px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00]">
                        <CarFront size={40} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Automotive Index
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        Garage Protocol. Technical schematics and specs for high-performance machinery.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        ACCESS INDEX <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* LINK 3: SCORECARD */}
            <Link 
                href="/collections/golf" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[300px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00]">
                        <Flag size={40} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Scorecard
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        Tactical round tracker. 4-Operative capacity. Real-time stat tracking.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        INITIALIZE PROTOCOL <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* LINK 4: WEATHER */}
            <Link 
                href="/collections/weather" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[300px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514632542354-958d91dde23e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00]">
                        <CloudHail size={40} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Atmosphere
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        Live weather telemetry. Warning: AI personality is permanently set to "Hostile".
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        SCAN SKY <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

        </div>
      </div>
    </div>
  );
}