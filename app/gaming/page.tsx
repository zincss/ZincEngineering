'use client';

import Link from "next/link";
import { Database, Cpu, Activity, ArrowRight, Shield, Crosshair, Zap } from "lucide-react";

export default function GamingDashboard() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative px-4 py-12">
      
      {/* --- HERO TITLE --- */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 text-zinc-400 text-[10px] font-mono font-bold tracking-[0.4em] mb-4 border border-zinc-200 dark:border-zinc-800 px-4 py-1 rounded-full">
           <span>GAMING_DIVISION</span>
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-black dark:text-white uppercase leading-none transition-colors">
          ZINC
          <span className="block text-3xl md:text-4xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-zinc-400 to-zinc-100 dark:from-zinc-600 dark:to-zinc-800 mt-2">
            COMMAND DECK
          </span>
        </h1>
      </div>

      {/* --- MODULE SELECTOR GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl relative z-20">
        
        {/* 1. DATABASE CARD */}
        <Link href="/gaming/database" className="group relative h-80 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database size={120} className="text-black dark:text-white" />
            </div>
            <div>
                <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6 group-hover:bg-acid group-hover:text-black transition-colors">
                    <Shield size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase mb-2 text-black dark:text-white">REGISTRY</h2>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Full archive of Warframes and Armaments. Access tactical assessments and build configurations.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all text-black dark:text-white">
                ACCESS DATABASE <ArrowRight size={14} />
            </div>
        </Link>

        {/* 2. MODULES CARD */}
        <Link href="/gaming/modules" className="group relative h-80 border-2 border-black dark:border-white bg-zinc-900 dark:bg-black text-white p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#DFFF00] transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu size={120} className="text-white" />
            </div>
            <div>
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center mb-6 group-hover:bg-acid transition-colors">
                    <Zap size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase mb-2 text-white">MODULES</h2>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                    Neural link search engine. Locate drop sources and trade data for system enhancements.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all text-acid">
                FIND MODS <ArrowRight size={14} />
            </div>
        </Link>

        {/* 3. MARKET CARD */}
        <Link href="/gaming/market" className="group relative h-80 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={120} className="text-black dark:text-white" />
            </div>
            <div>
                <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6 group-hover:bg-acid group-hover:text-black transition-colors">
                    <Crosshair size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase mb-2 text-black dark:text-white">MARKET</h2>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Real-time arbitrage surveillance. Identify profitable trade opportunities and market trends.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all text-black dark:text-white">
                OPEN TERMINAL <ArrowRight size={14} />
            </div>
        </Link>

      </div>

      {/* --- FOOTER DECORATION --- */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-8 pb-8 opacity-20 pointer-events-none font-mono text-[10px] z-0">
         <div className="flex flex-col gap-1">
            <div className="h-32 w-px bg-black dark:bg-white" />
            <span className="text-black dark:text-white">SEC.LEVEL: ALPHA</span>
         </div>
         <div className="flex flex-col gap-1 items-end">
            <div className="h-32 w-px bg-black dark:bg-white" />
            <span className="text-black dark:text-white">ZINC.ENG // V.3.0</span>
         </div>
      </div>

    </div>
  );
}