'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, ArrowRight, Zap, Activity, Box, AlertTriangle, Cpu, Terminal, Satellite } from "lucide-react";
import GlobalTicker from './components/GlobalTicker';

export default function Hub() {
  const [showAck, setShowAck] = useState(false);

  useEffect(() => {
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
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center relative px-4 pb-20">
      
      {/* --- BACKGROUND ENGINE --- */}
      <div className="bg-starfield">
          <div className="stars-1"></div>
          <div className="stars-2"></div>
          <div className="stars-3"></div>
      </div>

      <GlobalTicker />

      {/* --- ACKNOWLEDGEMENT MODAL --- */}
      {showAck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4 animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-black border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DFFF00] to-transparent opacity-50"></div>
                
                <div className="flex items-center gap-3 text-[#DFFF00] mb-6">
                    <Terminal size={24} />
                    <h2 className="text-xl font-mono font-bold tracking-wider uppercase">INITIALIZING...</h2>
                </div>

                <div className="font-mono text-xs text-zinc-400 leading-relaxed mb-8 space-y-4">
                    <p>
                        Welcome to <span className="text-white font-bold">ZINC ENGINEERING</span>.
                    </p>
                    <p>
                        This interface is currently operating in <span className="text-[#DFFF00]">ALPHA PREVIEW</span> mode. Live telemetry feeds and database connections may fluctuate.
                    </p>
                </div>

                <button
                    onClick={handleAck}
                    className="w-full py-4 bg-[#DFFF00] text-black font-black font-mono text-sm uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                    ESTABLISH LINK <ArrowRight size={16} />
                </button>
            </div>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <div className="text-center mb-24 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-3 text-zinc-500 text-[10px] font-mono font-bold tracking-[0.2em] mb-8 uppercase border border-zinc-800 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-sm">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
           </span>
           <span>Orbital Uplink Established</span>
        </div>

        {/* Title Block */}
        <div className="flex flex-col items-center">
            {/* ZINC: Clean, White, Heavy */}
            <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter text-black dark:text-white leading-[0.8] mix-blend-difference">
              ZINC
            </h1>
            
            {/* ENGINEERING: Acid Green, Tactical */}
            <div className="flex items-center gap-4 mt-6">
                <div className="h-px w-8 md:w-24 bg-zinc-800 dark:bg-zinc-700"></div>
                <h2 className="text-xl md:text-3xl font-mono font-bold tracking-[0.4em] text-[#DFFF00] uppercase">
                  ENGINEERING
                </h2>
                <div className="h-px w-8 md:w-24 bg-zinc-800 dark:bg-zinc-700"></div>
            </div>
        </div>

      </div>

      {/* --- MODULE SELECTOR --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl relative z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
        
        {/* 1. GAMING PROTOCOL */}
        <a href="/gaming" className="group relative h-64 border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-black p-8 flex flex-col justify-between hover:border-[#DFFF00] transition-colors duration-300 overflow-hidden">
            {/* Background Icon */}
            <div className="absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <Gamepad2 size={240} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-zinc-400 group-hover:text-[#DFFF00] transition-colors">
                    <Zap size={16} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">PROTOCOL_01</span>
                </div>
                <h2 className="text-4xl font-black uppercase text-black dark:text-white tracking-tighter mb-2">GAMING</h2>
                <p className="font-mono text-[10px] text-zinc-500 leading-relaxed max-w-[200px]">
                    Warframe build tactical database & market arbitrage tools.
                </p>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-300 dark:border-zinc-800 pt-4 mt-4 group-hover:border-[#DFFF00]/30 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">ACCESS</span>
                <ArrowRight size={14} className="text-[#DFFF00] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
        </a>

        {/* 2. ATHLETICS PROTOCOL */}
        <a href="/sports" className="group relative h-64 border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-black p-8 flex flex-col justify-between hover:border-[#DFFF00] transition-colors duration-300 overflow-hidden">
            {/* Background Icon */}
            <div className="absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <Satellite size={240} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-zinc-400 group-hover:text-[#DFFF00] transition-colors">
                    <Activity size={16} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">PROTOCOL_02</span>
                </div>
                <h2 className="text-4xl font-black uppercase text-black dark:text-white tracking-tighter mb-2">ATHLETICS</h2>
                <p className="font-mono text-[10px] text-zinc-500 leading-relaxed max-w-[200px]">
                    Live global sports telemetry & performance archives.
                </p>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-300 dark:border-zinc-800 pt-4 mt-4 group-hover:border-[#DFFF00]/30 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">ACCESS</span>
                <ArrowRight size={14} className="text-[#DFFF00] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
        </a>

      </div>

      {/* Footer */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center opacity-30 pointer-events-none z-0">
         <div className="h-px w-32 bg-zinc-800"></div>
      </div>

    </div>
  );
}