'use client';

import React from 'react';
import { Target, Wind, Activity } from 'lucide-react';
import GolfScorecard from './components/GolfScorecard';
import BackButton from '../../components/BackButton';

export default function GolfTrackerPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* NAVIGATION */}
      <BackButton href="/collections" label="COLLECTIONS HUB" />
      
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
      </div>

      {/* TRACKER MODULE */}
      <div className="max-w-[1600px] mx-auto px-6 pb-20">
        <GolfScorecard />
      </div>

    </div>
  );
}