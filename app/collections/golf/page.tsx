'use client';

import React, { useState } from 'react';
import { Target, BrainCircuit, Activity, LayoutGrid, FileDigit } from 'lucide-react';
import GolfScorecard from './components/GolfScorecard';
import CoachInterface from './coach/components/CoachInterface';

// Inline utility to avoid dependency on missing @/lib/utils
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

type Tab = 'SCORECARD' | 'CADDIE';

export default function GolfPage() {
  const [activeTab, setActiveTab] = useState<Tab>('SCORECARD');

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* --- HEADER SECTION --- */}
      <div className="relative border-b border-zinc-800 bg-zinc-900/50 pt-32 pb-6 px-6">
        <div className="max-w-[1800px] mx-auto">
            
            {/* Top Meta Line */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center gap-1"><Activity size={12} className="text-[#DFFF00]" /> System Online</span>
                    <span>//</span>
                    <span>Field Operations</span>
                    <span>//</span>
                    <span>Golf Protocol V2.0</span>
                </div>
                
                {/* Weather / Env Placeholder */}
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                     <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2">
                        <span>WIND: 4 MPH NE</span>
                     </div>
                     <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2">
                        <span>TEMP: 72°F</span>
                     </div>
                </div>
            </div>

            {/* Main Title & Nav */}
            <div className="flex flex-col xl:flex-row justify-between items-end gap-8">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-2">
                        Golf <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600">Operations</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest max-w-xl">
                        Advanced telemetry tracking and biomechanical analysis suite.
                    </p>
                </div>

                {/* TAB CONTROLS */}
                <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-full xl:w-auto">
                    <button
                        onClick={() => setActiveTab('SCORECARD')}
                        className={cn(
                            "flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-lg text-sm font-black uppercase tracking-wider transition-all duration-300",
                            activeTab === 'SCORECARD' 
                                ? "bg-[#DFFF00] text-black shadow-[0_0_20px_rgba(223,255,0,0.3)]" 
                                : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                        )}
                    >
                        <FileDigit size={18} />
                        <span>Live Scorecard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('CADDIE')}
                        className={cn(
                            "flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-lg text-sm font-black uppercase tracking-wider transition-all duration-300",
                            activeTab === 'CADDIE' 
                                ? "bg-[#DFFF00] text-black shadow-[0_0_20px_rgba(223,255,0,0.3)]" 
                                : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                        )}
                    >
                        <BrainCircuit size={18} />
                        <span>Virtual Caddie</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="w-full">
          
          {/* SCORECARD MODULE */}
          <div className={cn(
              "w-full transition-opacity duration-500 px-6 py-12",
              activeTab === 'SCORECARD' ? "opacity-100 block" : "opacity-0 hidden"
          )}>
               <div className="max-w-[1600px] mx-auto">
                   <div className="mb-8 flex items-center gap-2 text-zinc-600 font-mono text-xs uppercase tracking-widest border-l-2 border-[#DFFF00] pl-3">
                       <LayoutGrid size={14} /> Active Module: Scoring Database
                   </div>
                   <GolfScorecard />
               </div>
          </div>

          {/* CADDIE MODULE */}
          <div className={cn(
              "w-full transition-opacity duration-500 px-6 py-12",
              activeTab === 'CADDIE' ? "opacity-100 block" : "opacity-0 hidden"
          )}>
               <div className="max-w-[1600px] mx-auto">
                    <div className="mb-8 flex items-center gap-2 text-zinc-600 font-mono text-xs uppercase tracking-widest border-l-2 border-[#DFFF00] pl-3">
                       <Target size={14} /> Active Module: AI Diagnostics
                   </div>
                   <CoachInterface />
               </div>
          </div>

      </div>

      {/* Footer / Status Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800 py-2 px-6 flex justify-between items-center z-50">
           <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase">
               <div className={`w-2 h-2 rounded-full ${activeTab === 'SCORECARD' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
               Database
           </div>
           <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase">
               AI Engine
               <div className={`w-2 h-2 rounded-full ${activeTab === 'CADDIE' ? 'bg-[#DFFF00]' : 'bg-zinc-600'}`} />
           </div>
      </div>

    </div>
  );
}