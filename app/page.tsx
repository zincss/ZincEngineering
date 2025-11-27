'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, ArrowRight, Zap, Activity, Box, AlertTriangle } from "lucide-react";
import GlobalTicker from './components/GlobalTicker';

export default function Hub() {
  const [showAck, setShowAck] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged the alpha state
    const hasAcked = localStorage.getItem('zinc_alpha_ack');
    if (!hasAcked) {
      setShowAck(true);
    }
  }, []);

  const handleAck = () => {
    localStorage.setItem('zinc_alpha_ack', 'true');
    setShowAck(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center relative px-4 bg-grid-pattern pb-20">
      
      {/* --- LIVE TICKER --- */}
      <GlobalTicker />

      {/* --- ALPHA ACKNOWLEDGEMENT MODAL --- */}
      {showAck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4 animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-zinc-900 border-2 border-[#DFFF00] p-1 shadow-[0_0_50px_rgba(223,255,0,0.15)] relative">
                
                {/* Decorative Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#DFFF00] -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#DFFF00] translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#DFFF00] -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#DFFF00] translate-x-1 translate-y-1"></div>

                <div className="bg-black p-8 relative overflow-hidden">
                    {/* Scanline texture */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,#000_2px)] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>

                    <div className="flex items-center gap-3 text-[#DFFF00] mb-6 border-b border-zinc-800 pb-4">
                        <AlertTriangle size={28} className="animate-pulse" />
                        <div>
                            <h2 className="text-xl font-black tracking-widest uppercase leading-none">SYSTEM WARNING</h2>
                            <span className="text-[9px] font-mono text-zinc-500">SECURE CONNECTION // UNSTABLE</span>
                        </div>
                    </div>

                    <div className="font-mono text-xs text-zinc-300 leading-relaxed mb-8 space-y-4">
                        <p>
                            <strong className="text-white bg-red-500/20 text-red-500 px-1 py-0.5 mr-1">CAUTION:</strong> 
                            You are accessing the ZINC ENGINEERING Interface in <span className="text-[#DFFF00] font-bold">ALPHA STATE</span> (v.3.0.4).
                        </p>
                        <p className="text-zinc-400">
                            System stability is not guaranteed. Operational modules may be incomplete, unstable, or prone to critical runtime errors.
                        </p>
                    </div>

                    <button
                        onClick={handleAck}
                        className="w-full py-4 bg-[#DFFF00] text-black font-black font-mono text-sm uppercase tracking-widest hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        I UNDERSTAND <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>
            </div>
        </div>
      )}

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
      <div className="absolute bottom-10 left-0 right-0 flex justify-between items-end px-8 pb-4 opacity-30 pointer-events-none font-mono text-[9px] z-0">
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