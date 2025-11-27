'use client';

import Link from "next/link";
import { Trophy, Wind, Activity, ArrowRight, Target, Zap } from "lucide-react";

export default function SportsHub() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center relative px-4 bg-grid-pattern">
      
      {/* --- HERO TITLE --- */}
      <div className="text-center mb-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 text-zinc-400 text-[10px] font-mono font-bold tracking-[0.4em] mb-6 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm px-4 py-1 rounded-full">
           <span>ZINC_CORP // ATHLETICS_DIVISION</span>
           <span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full animate-pulse shadow-[0_0_10px_#DFFF00]"></span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-black dark:text-white uppercase leading-none">
          LEAGUE
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-zinc-400 to-zinc-200 dark:from-zinc-600 dark:to-zinc-800 mt-2">
            DATA UPLINK
          </span>
        </h1>
      </div>

      {/* --- LEAGUE SELECTOR GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl relative z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        
        {/* 1. NBA (Restyled to Zinc Theme) */}
        <Link href="/sports/nba" className="group relative h-80 border-2 border-black dark:border-zinc-700 bg-zinc-900 hover:bg-zinc-950 p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-300 overflow-hidden">
            <div className="absolute -right-12 -top-12 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Trophy size={200} className="text-white" />
            </div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-[#DFFF00] text-black flex items-center justify-center mb-6 font-black text-xl border border-black group-hover:scale-110 transition-transform">
                    NBA
                </div>
                <h2 className="text-3xl font-black uppercase mb-2 text-white tracking-tighter">BASKETBALL<br/>OPERATIONS</h2>
                <div className="h-1 w-12 bg-[#DFFF00] mb-4"></div>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                    Real-time court telemetry, player efficiency ratings, and franchise historical archives.
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:gap-4 transition-all">
                ACCESS FEED <ArrowRight size={14} className="text-[#DFFF00]" />
            </div>
        </Link>

        {/* 2. FORMULA 1 */}
        <Link href="/sports/f1" className="group relative h-80 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] transition-all duration-300 overflow-hidden">
            <div className="absolute -right-12 -top-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Wind size={200} className="text-black dark:text-white" />
            </div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center mb-6 font-black text-xl border border-red-800 group-hover:scale-110 transition-transform">
                    F1
                </div>
                <h2 className="text-3xl font-black uppercase mb-2 text-black dark:text-white tracking-tighter">FORMULA 1<br/>TELEMETRY</h2>
                <div className="h-1 w-12 bg-red-600 mb-4"></div>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Circuit lap data, driver standings, and constructor performance metrics.
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white group-hover:gap-4 transition-all">
                INITIALIZE <ArrowRight size={14} className="text-red-600" />
            </div>
        </Link>

        {/* 3. NRL */}
        <Link href="/sports/nrl" className="group relative h-80 border-2 border-black dark:border-zinc-700 bg-zinc-950 dark:bg-black p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#22c55e] transition-all duration-300 overflow-hidden">
            <div className="absolute -right-12 -top-12 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Activity size={200} className="text-white" />
            </div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center mb-6 font-black text-xl border border-green-800 group-hover:scale-110 transition-transform">
                    NRL
                </div>
                <h2 className="text-3xl font-black uppercase mb-2 text-white tracking-tighter">RUGBY<br/>LEAGUE</h2>
                <div className="h-1 w-12 bg-green-600 mb-4"></div>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                    Match statistics, team ladders, and player performance tracking.
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:gap-4 transition-all">
                OPEN DATABASE <ArrowRight size={14} className="text-green-600" />
            </div>
        </Link>

      </div>
    </div>
  );
}