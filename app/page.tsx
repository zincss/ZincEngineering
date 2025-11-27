'use client';

import React from 'react';
import { Gamepad2, Trophy, ArrowRight, Zap, Activity, Box } from "lucide-react";

export default function Hub() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center relative px-4 bg-grid-pattern">
      
      {/* Hero Section */}
      <div className="text-center mb-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 text-zinc-400 text-[10px] font-mono font-bold tracking-[0.4em] mb-6 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm px-4 py-1 rounded-full">
           <span>ZINC_CORP // CENTRAL_COMMAND</span>
           <span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full animate-pulse shadow-[0_0_10px_#DFFF00]"></span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-black dark:text-white uppercase leading-[0.85]">
          ZINC
          <span className="block text-4xl md:text-6xl tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-zinc-400 to-zinc-200 dark:from-zinc-600 dark:to-zinc-800 mt-2">
            ENGINEERING
          </span>
        </h1>
        <p className="mt-8 text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            <Box size={12} /> Select Operational Division
        </p>
      </div>

      {/* Division Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl relative z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        
        {/* 1. GAMING DIVISION */}
        <a href="/gaming" className="group relative h-80 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-300 overflow-hidden">
            <div className="absolute -right-12 -top-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Gamepad2 size={280} className="text-black dark:text-white" />
            </div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white flex items-center justify-center mb-6 group-hover:bg-[#DFFF00] group-hover:text-black group-hover:border-black transition-colors">
                    <Zap size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase mb-2 text-black dark:text-white tracking-tighter">GAMING<br/>DIVISION</h2>
                <div className="h-1 w-12 bg-[#DFFF00] mb-4"></div>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                    Warframe tactical database, market analytics, and automated build optimization tools.
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white group-hover:gap-4 transition-all">
                INITIALIZE <ArrowRight size={14} className="text-[#DFFF00]" />
            </div>
        </a>

        {/* 2. ATHLETICS DIVISION */}
        <a href="/sports" className="group relative h-80 border-2 border-black dark:border-zinc-700 bg-zinc-950 dark:bg-black p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-300 overflow-hidden">
            <div className="absolute -right-12 -top-12 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Trophy size={280} className="text-white" />
            </div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                    <Trophy size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase mb-2 text-white tracking-tighter">ATHLETICS<br/>DIVISION</h2>
                <div className="h-1 w-12 bg-white mb-4"></div>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed max-w-xs">
                    Live sports telemetry, team analytics, and comprehensive performance archives (NBA, F1, NRL).
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:gap-4 transition-all">
                ACCESS DATA <ArrowRight size={14} className="text-[#DFFF00]" />
            </div>
        </a>

      </div>

      {/* Decorative Footer */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-8 pb-8 opacity-30 pointer-events-none font-mono text-[9px] z-0">
         <div className="flex flex-col gap-1">
            <div className="h-16 w-px bg-black dark:bg-white" />
            <span className="text-black dark:text-white tracking-widest">SEC.LEVEL: ALPHA</span>
         </div>
         <div className="flex flex-col gap-1 items-end">
            <div className="h-16 w-px bg-black dark:bg-white" />
            <span className="text-black dark:text-white tracking-widest">V.3.0.4 // STABLE</span>
         </div>
      </div>

    </div>
  );
}