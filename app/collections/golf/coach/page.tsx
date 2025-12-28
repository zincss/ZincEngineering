'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, BrainCircuit, Activity } from 'lucide-react';
import CoachInterface from './components/CoachInterface';

export default function GolfCoachPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20">
      
      {/* NAVIGATION HEADER */}
      <div className="pt-32 pb-8 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 mb-12">
        <div className="mb-6">
            <Link 
                href="/collections/golf" 
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
            >
                <ChevronLeft size={14} /> Return to Scorecard
            </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-[10px] font-black tracking-widest uppercase mb-2">
                    <span>AI_ASSIST</span>
                    <span className="text-zinc-600">/</span>
                    <span>COACHING_MODULE</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
                    Virtual <span className="text-zinc-800 text-stroke-white">Caddie</span>
                </h1>
                <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mt-4 flex items-center gap-2 max-w-xl leading-relaxed">
                    <BrainCircuit size={14} className="text-[#DFFF00]" /> 
                    Input symptoms to receive corrective swing mechanics and custom training protocols.
                </p>
            </div>
            
            {/* Status Modules */}
            <div className="flex gap-4">
                 <div className="bg-zinc-900 border border-zinc-800 p-3 w-40">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1 flex items-center gap-2"><Activity size={10} /> System Status</div>
                    <div className="text-sm font-bold text-[#DFFF00] animate-pulse">DIAGNOSTICS ONLINE</div>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN INTERFACE */}
      <div className="px-6">
        <CoachInterface />
      </div>

    </div>
  );
}