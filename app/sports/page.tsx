'use client';

import Link from "next/link";
import { Trophy, Wind, Activity, ArrowRight, Shield, Flag } from "lucide-react";

export default function SportsHub() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center relative px-4 pb-20">
      
      {/* BACKGROUND */}
      <div className="bg-starfield">
          <div className="stars-1"></div>
          <div className="stars-2"></div>
          <div className="stars-3"></div>
      </div>

      {/* HERO */}
      <div className="text-center mb-20 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Status Badge: Square Look */}
        <div className="inline-flex items-center gap-3 text-zinc-500 text-[10px] font-mono font-bold tracking-[0.2em] mb-6 uppercase border border-zinc-800 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-sm">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
           </span>
           <span>ZINC_CORP // ATHLETICS_DIVISION</span>
        </div>

        <div className="flex flex-col items-center">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-sm">
              LEAGUE
            </h1>
            <div className="h-1 w-24 bg-[#DFFF00] my-4"></div>
            <h2 className="text-3xl md:text-5xl font-black tracking-[0.2em] text-zinc-500 uppercase">
              DATA UPLINK
            </h2>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[1400px] relative z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        
        {/* NBA */}
        <Link href="/sports/nba" className="group relative h-80 border border-zinc-800 bg-black/50 hover:bg-zinc-900/80 p-8 flex flex-col justify-between hover:border-[#DFFF00] transition-all duration-300 overflow-hidden backdrop-blur-sm">
            <div className="absolute -right-12 -top-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Trophy size={200} className="text-white" />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-[#DFFF00] text-black flex items-center justify-center mb-6 font-black text-xl group-hover:scale-110 transition-transform">
                    NBA
                </div>
                <h2 className="text-2xl font-black uppercase mb-2 text-white tracking-tighter">BASKETBALL<br/>OPS</h2>
                <div className="h-1 w-12 bg-[#DFFF00] mb-4"></div>
                <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                    Real-time court telemetry and archives.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                ACCESS FEED <ArrowRight size={14} className="text-[#DFFF00]" />
            </div>
        </Link>

        {/* F1 */}
        <Link href="/sports/f1" className="group relative h-80 border border-zinc-800 bg-black/50 hover:bg-zinc-900/80 p-8 flex flex-col justify-between hover:border-red-600 transition-all duration-300 overflow-hidden backdrop-blur-sm">
            <div className="absolute -right-12 -top-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Wind size={200} className="text-white" />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center mb-6 font-black text-xl group-hover:scale-110 transition-transform">
                    F1
                </div>
                <h2 className="text-2xl font-black uppercase mb-2 text-white tracking-tighter">FORMULA 1<br/>TELEMETRY</h2>
                <div className="h-1 w-12 bg-red-600 mb-4"></div>
                <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                    Lap data and constructor metrics.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                INITIALIZE <ArrowRight size={14} className="text-red-600" />
            </div>
        </Link>

        {/* NRL */}
        <Link href="/sports/nrl" className="group relative h-80 border border-zinc-800 bg-black/50 hover:bg-zinc-900/80 p-8 flex flex-col justify-between hover:border-green-600 transition-all duration-300 overflow-hidden backdrop-blur-sm">
            <div className="absolute -right-12 -top-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Shield size={200} className="text-white" />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center mb-6 font-black text-xl group-hover:scale-110 transition-transform">
                    NRL
                </div>
                <h2 className="text-2xl font-black uppercase mb-2 text-white tracking-tighter">RUGBY<br/>LEAGUE</h2>
                <div className="h-1 w-12 bg-green-600 mb-4"></div>
                <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                    Match stats and player tracking.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                OPEN DATABASE <ArrowRight size={14} className="text-green-600" />
            </div>
        </Link>

        {/* GOLF - NEW MODULE */}
        <Link href="/sports/golf" className="group relative h-80 border border-zinc-800 bg-black/50 hover:bg-zinc-900/80 p-8 flex flex-col justify-between hover:border-[#DFFF00] transition-all duration-300 overflow-hidden backdrop-blur-sm">
            <div className="absolute -right-12 -top-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Flag size={200} className="text-white" />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center mb-6 font-black text-xl group-hover:scale-110 transition-transform border border-zinc-200">
                    GOLF
                </div>
                <div className="absolute top-0 right-0">
                    <span className="text-[9px] font-mono text-[#DFFF00] border border-[#DFFF00]/30 px-2 py-1 bg-black/50">NEW</span>
                </div>
                <h2 className="text-2xl font-black uppercase mb-2 text-white tracking-tighter">FAIRWAY<br/>CONTROL</h2>
                <div className="h-1 w-12 bg-white mb-4"></div>
                <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                    Global rankings, live tournament scoring, and shot analytics.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                TEE OFF <ArrowRight size={14} className="text-white" />
            </div>
        </Link>

      </div>
    </div>
  );
}