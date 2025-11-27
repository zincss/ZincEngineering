'use client';

import Link from "next/link";
import { Ghost, ArrowRight, Plus } from "lucide-react";

export default function GamingHub() {
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
        <div className="inline-flex items-center gap-2 text-zinc-500 text-[10px] font-mono font-bold tracking-[0.3em] mb-6 uppercase border border-zinc-800 px-4 py-1 rounded-full bg-black/50 backdrop-blur-sm">
           <span>ZINC_CORP // GAMING_DIVISION</span>
           <span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full animate-pulse shadow-[0_0_10px_#DFFF00]"></span>
        </div>

        <div className="flex flex-col items-center">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-sm">
              SELECT
            </h1>
            <div className="h-1 w-24 bg-[#DFFF00] my-4"></div>
            <h2 className="text-3xl md:text-5xl font-black tracking-[0.2em] text-zinc-500 uppercase">
              PROTOCOL
            </h2>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl relative z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        
        {/* WARFRAME */}
        <Link href="/gaming/warframe" className="group relative h-80 border border-zinc-800 bg-black/50 hover:bg-zinc-900/80 p-8 flex flex-col justify-between hover:border-[#DFFF00] transition-all duration-300 overflow-hidden backdrop-blur-sm">
            <div className="absolute -right-8 -top-8 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 duration-500 group-hover:scale-110">
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
                <p className="font-mono text-[10px] text-zinc-400 leading-relaxed max-w-[200px]">
                    Tactical database, market analytics, and build optimization.
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                INITIALIZE <ArrowRight size={14} className="text-[#DFFF00]" />
            </div>
        </Link>

        {/* COMING SOON */}
        <div className="group relative h-80 border border-dashed border-zinc-800 bg-black/30 p-8 flex flex-col justify-center items-center text-center transition-all duration-300 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-zinc-900 text-zinc-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={24} />
            </div>
            <h2 className="text-xl font-black uppercase text-zinc-600 tracking-tighter">ADDITIONAL<br/>PROTOCOLS</h2>
            <p className="font-mono text-[10px] text-zinc-700 mt-2 uppercase tracking-widest">Coming Soon</p>
        </div>

      </div>
    </div>
  );
}