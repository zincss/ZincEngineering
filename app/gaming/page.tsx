'use client';

import Link from "next/link";
import { Ghost, ArrowRight, Plus } from "lucide-react";

export default function GamingHub() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center relative px-4 bg-grid-pattern">
      
      {/* Hero */}
      <div className="text-center mb-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 text-zinc-400 text-[10px] font-mono font-bold tracking-[0.4em] mb-6 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm px-4 py-1 rounded-full">
           <span>ZINC_CORP // GAMING_DIVISION</span>
           <span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full animate-pulse"></span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-black dark:text-white uppercase leading-none">
          SELECT
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-zinc-400 to-zinc-200 dark:from-zinc-600 dark:to-zinc-800 mt-2">
            PROTOCOL
          </span>
        </h1>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl relative z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        
        {/* 1. WARFRAME */}
        <Link href="/gaming/warframe" className="group relative h-72 border-2 border-black dark:border-zinc-700 bg-zinc-950 p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-300 overflow-hidden">
            <div className="absolute -right-8 -top-8 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Ghost size={200} className="text-white" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                   <div className="w-10 h-10 bg-[#DFFF00] text-black flex items-center justify-center font-bold border border-black">
                       WF
                   </div>
                   <span className="text-[9px] font-mono text-[#DFFF00] border border-[#DFFF00]/30 px-2 py-1 rounded-full">ONLINE</span>
                </div>
                
                <h2 className="text-3xl font-black uppercase mb-2 text-white tracking-tighter">WARFRAME</h2>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed max-w-[200px]">
                    Tactical database, market analytics, and build optimization.
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:gap-4 transition-all">
                INITIALIZE <ArrowRight size={14} className="text-[#DFFF00]" />
            </div>
        </Link>

        {/* 2. COMING SOON PLACEHOLDER */}
        <div className="group relative h-72 border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-8 flex flex-col justify-center items-center text-center transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={24} />
            </div>
            <h2 className="text-xl font-black uppercase text-zinc-400 dark:text-zinc-600 tracking-tighter">ADDITIONAL<br/>PROTOCOLS</h2>
            <p className="font-mono text-[10px] text-zinc-400 mt-2 uppercase tracking-widest">Coming Soon</p>
        </div>

      </div>
    </div>
  );
}