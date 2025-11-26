'use client';

import React from 'react';
import { Trophy, Flag, ChevronRight, Activity, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SportsDashboard() {
  return (
    <div className="min-h-[80vh] max-w-7xl mx-auto px-4 pt-12 pb-20 flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 text-zinc-400 text-[10px] font-mono font-bold tracking-[0.4em] mb-4 border border-zinc-200 dark:border-zinc-800 px-4 py-1 rounded-full">
           <span>ATHLETICS_DIVISION</span>
           <span className="w-2 h-2 bg-acid rounded-full animate-pulse"></span>
        </div>
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-black dark:text-white uppercase leading-none">
          SELECT<br/>DISCIPLINE
        </h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          
          {/* F1 CARD */}
          <Link href="/sports/f1" className="group relative h-96 border-2 border-black dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-900 p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#DFFF00] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                <Flag size={200} className="text-white"/>
            </div>
            <div>
                <div className="w-14 h-14 bg-white text-black flex items-center justify-center mb-8 group-hover:bg-acid transition-colors border-2 border-transparent group-hover:border-black">
                    <Trophy size={28} />
                </div>
                <h2 className="text-5xl font-black uppercase mb-4 text-white leading-none tracking-tighter">FORMULA 1</h2>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed max-w-xs">
                    Global motorsport telemetry. Driver biometrics, constructor performance data, and historical archives.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all text-acid">
                ACCESS TERMINAL <ChevronRight size={14} />
            </div>
          </Link>

          {/* NRL CARD (NEW) */}
          <Link href="/sports/nrl" className="group relative h-96 border-2 border-black dark:border-zinc-700 bg-white dark:bg-black p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#000000] dark:hover:shadow-[12px_12px_0px_0px_#333] transition-all duration-300 overflow-hidden">
            <div className="absolute top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity -rotate-12">
                <Shield size={250} className="text-black dark:text-white"/>
            </div>
            <div>
                <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Shield size={28} />
                </div>
                <h2 className="text-5xl font-black uppercase mb-4 text-black dark:text-white leading-none tracking-tighter">NRL TELSTRA</h2>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                    National Rugby League analytics. Team ladders, player stats, and match performance indicators.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all text-black dark:text-white">
                INITIALIZE FEED <ChevronRight size={14} />
            </div>
          </Link>

      </div>
    </div>
  );
}