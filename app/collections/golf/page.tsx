'use client';

import React from 'react';
import { Target, Wind, Activity, BrainCircuit, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import GolfScorecard from './components/GolfScorecard';

export default function GolfTrackerPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* HEADER */}
      <div className="pt-32 pb-8 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-[10px] font-black tracking-widest uppercase mb-2">
                    <span>FIELD_OPERATIONS</span>
                    <span className="text-zinc-600">/</span>
                    <span>GOLF_PROTOCOL</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">
                    Golf <span className="text-zinc-800 text-stroke-white">Protocol</span>
                </h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Target size={12} /> Live Telemetry & Scoring
                </p>
            </div>
            
            {/* Status Modules */}
            <div className="flex gap-4">
                 <div className="bg-zinc-900 border border-zinc-800 p-3 w-32">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1 flex items-center gap-2"><Activity size={10} /> Status</div>
                    <div className="text-xl font-black text-[#DFFF00] animate-pulse">ACTIVE</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-3 w-32">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1 flex items-center gap-2"><Wind size={10} /> Wind</div>
                    <div className="text-xl font-black text-white">CALM</div>
                </div>
            </div>
        </div>

        {/* --- NEW SECTION: TOOLBAR --- */}
        <div className="mt-8 flex items-center gap-4">
            <Link 
              href="/collections/golf/coach"
              className="group flex items-center gap-3 px-6 py-4 bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] hover:bg-zinc-800 transition-all rounded-xl w-full md:w-auto"
            >
                <div className="bg-black p-2 rounded-lg group-hover:text-[#DFFF00] transition-colors">
                    <BrainCircuit size={20} />
                </div>
                <div className="text-left">
                    <div className="text-sm font-black text-white uppercase tracking-tight">Virtual Caddie</div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Diagnose & Fix Swing</div>
                </div>
                <ArrowRight size={16} className="ml-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
      </div>

      {/* TRACKER MODULE */}
      <div className="max-w-[1600px] mx-auto px-6 pb-20">
        <GolfScorecard />
      </div>

    </div>
  );
}