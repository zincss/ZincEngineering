'use client';

import React from 'react';
import { Trophy, Flag, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function SportsDashboard() {
  return (
    <div className="min-h-[80vh] max-w-7xl mx-auto px-4 pt-12 pb-20 flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 text-zinc-400 text-[10px] font-mono font-bold tracking-[0.4em] mb-4 border border-zinc-200 dark:border-zinc-800 px-4 py-1 rounded-full">
           <span>ATHLETICS_DIVISION</span>
           <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </div>
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-black dark:text-white uppercase leading-none">
          SELECT<br/>DISCIPLINE
        </h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* F1 CARD */}
          <Link href="/sports/f1" className="group relative h-80 border-2 border-black dark:border-white bg-zinc-900 dark:bg-black p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#DFFF00] transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity rotate-12">
                <Flag size={150} className="text-white"/>
            </div>
            <div>
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center mb-6 group-hover:bg-acid transition-colors">
                    <Trophy size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase mb-2 text-white">FORMULA 1</h2>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed max-w-xs">
                    Telemetry analysis, driver biometrics, and constructor performance data.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all text-acid">
                INITIALIZE FEED <ChevronRight size={14} />
            </div>
          </Link>

          {/* COMING SOON CARD */}
          <div className="group relative h-80 border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 flex flex-col justify-between opacity-50 cursor-not-allowed">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={150} className="text-black dark:text-white"/>
            </div>
            <div>
                <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-6">
                    <Activity size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase mb-2 text-zinc-400 dark:text-zinc-600">UFC / MMA</h2>
                <p className="font-mono text-xs text-zinc-400 dark:text-zinc-600 leading-relaxed max-w-xs">
                    Fighter stats, strike analytics, and matchup prediction models.
                </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                OFFLINE
            </div>
          </div>

      </div>
    </div>
  );
}