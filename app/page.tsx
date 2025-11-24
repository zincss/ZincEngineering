'use client';

import Link from "next/link";
import { Gamepad2, Trophy, ArrowRight, Zap } from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";

export default function Hub() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative px-4">
      
      {/* Header Area */}
      <div className="absolute top-4 right-4">
          <ThemeToggle />
      </div>

      <div className="text-center mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 text-zinc-400 text-[10px] font-mono font-bold tracking-[0.4em] mb-4 border border-zinc-200 dark:border-zinc-800 px-4 py-1 rounded-full">
           <span>ZINC_CORP // HUB</span>
           <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-black dark:text-white uppercase leading-none">
          ZINC
          <span className="block text-3xl md:text-4xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-zinc-400 to-zinc-100 dark:from-zinc-600 dark:to-zinc-800 mt-2">
            ENGINEERING
          </span>
        </h1>
        <p className="mt-6 text-zinc-500 font-mono text-sm uppercase tracking-widest">Select Operational Division</p>
      </div>

      {/* DIVISION SELECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* 1. GAMING DIVISION */}
        <Link href="/gaming" className="group relative h-96 border-2 border-black dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_#ffffff] transition-all duration-300 overflow-hidden">
            <div className="absolute -right-10 -top-10 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                <Gamepad2 size={250} className="text-black dark:text-white" />
            </div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6 group-hover:bg-acid group-hover:text-black transition-colors">
                    <Zap size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase mb-2 text-black dark:text-white">GAMING<br/>DIVISION</h2>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                    Warframe tactical database, market analytics, and loadout optimization tools.
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white group-hover:gap-4 transition-all">
                ENTER SYSTEM <ArrowRight size={14} />
            </div>
        </Link>

        {/* 2. ATHLETICS DIVISION (Sports) */}
        <Link href="/sports" className="group relative h-96 border-2 border-black dark:border-zinc-700 bg-white dark:bg-black p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_#DFFF00] transition-all duration-300 overflow-hidden">
            <div className="absolute -right-10 -top-10 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                <Trophy size={250} className="text-black dark:text-white" />
            </div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-white border-2 border-black dark:border-zinc-800 text-black flex items-center justify-center mb-6 group-hover:bg-acid transition-colors">
                    <Trophy size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase mb-2 text-black dark:text-white">ATHLETICS<br/>DIVISION</h2>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                    Live sports telemetry, team analytics, and performance tracking systems.
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white group-hover:gap-4 transition-all">
                ACCESS DATA <ArrowRight size={14} />
            </div>
        </Link>

      </div>
    </div>
  );
}