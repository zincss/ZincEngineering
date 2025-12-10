'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Brain, 
  ChevronRight, 
  Construction, 
  Dna, 
  Spade, 
  Trophy, 
  Package, 
  TrendingUp, 
  Activity,
  ArrowRight
} from 'lucide-react';
import BackButton from '../components/BackButton';

export default function PlayHub() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      
      {/* BACKGROUND: Deep Space (Matches Home) */}
      <div className="bg-starfield" />

      {/* GLOBAL BACK BUTTON */}
      <BackButton href="/" label="MAIN TERMINAL" />

      {/* --- HEADER SECTION --- */}
      <section className="relative pt-32 pb-12 px-6 border-b border-zinc-800/50">
        <div className="max-w-[1600px] mx-auto relative">
          
          {/* Breadcrumb / Status */}
          <div className="absolute top-0 right-0 hidden md:flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-1000">
             <div className="bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800 backdrop-blur-md flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  Arcade Protocols Online
                </span>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-white">
                    System <span className="text-zinc-800">Arcade</span>
                </h1>
                <p className="text-zinc-400 font-mono text-sm md:text-base max-w-2xl leading-relaxed">
                   <span className="text-[#DFFF00] font-black mr-2">///</span>
                   Interactive entertainment modules and cognitive assessment tools. 
                   Wager credits and test probability algorithms.
                </p>
            </div>

            {/* MARKET ACCESS BUTTON */}
            <Link 
                href="/play/market"
                className="group flex items-center gap-3 px-6 py-3 bg-[#DFFF00] hover:bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(223,255,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95"
            >
                <Package size={16} className="group-hover:rotate-12 transition-transform" />
                <span>Access Black Market</span>
                <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- MODULE GRID --- */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-12">
        
        {/* DECORATIVE HEADER */}
        <div className="flex items-center gap-4 mb-10 px-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-md">
                 <Activity size={16} className="text-[#DFFF00]" />
                 <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Active Simulations</span>
            </div>
            <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">
            
            {/* 1. BLACKJACK (FEATURED - WIDE) */}
            <Link 
                href="/play/blackjack" 
                className="group md:col-span-8 relative min-h-[360px] rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2674&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-20 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

                {/* Floating Icon */}
                <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 group-hover:border-[#DFFF00] transition-colors">
                    <Spade className="text-[#DFFF00]" size={24} />
                </div>

                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-black uppercase tracking-widest group-hover:bg-[#DFFF00] group-hover:text-black group-hover:border-[#DFFF00] transition-colors">
                          High Stakes
                       </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4 italic tracking-tight">Tactical Blackjack</h2>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed group-hover:text-zinc-200 transition-colors">
                        High-stakes probability simulation. Wager credits against the house algorithm in a secure environment.
                    </p>
                </div>
            </Link>

            {/* 2. POKER (TALL) */}
            <Link 
                href="/play/poker" 
                className="group md:col-span-4 relative min-h-[360px] rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500"
            >
                {/* NEW IMAGE: Dark Poker Cards/Table */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                
                <div className="absolute top-8 left-8">
                   <Trophy size={32} className="text-zinc-700 group-hover:text-[#DFFF00] transition-colors duration-500" />
                </div>

                <div className="absolute bottom-0 left-0 p-10 w-full">
                   <h2 className="text-3xl font-black uppercase text-white mb-2 leading-none">Texas<br/>Hold&apos;em</h2>
                   <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6 group-hover:text-zinc-300 transition-colors">
                     No-Limit Protocol
                   </p>
                   
                   <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-[#DFFF00] transition-colors">
                        Enter Table <ChevronRight size={12} />
                   </div>
                </div>
            </Link>

            {/* 3. TRIVIA (SQUARE) */}
            <Link 
                href="/collections/trivia" 
                className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 to-transparent" />
                
                <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                   <Brain size={32} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                   <h2 className="text-2xl font-black uppercase text-white mb-2">Trivia Matrix</h2>
                   <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-zinc-300 transition-colors">
                      Procedural knowledge assessment generator.
                   </p>
                </div>
            </Link>

            {/* 4. STOCKS (SQUARE) */}
            <Link 
                href="/play/stocks" 
                className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500"
            >
                {/* NEW IMAGE: Dark Financial Charts */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 to-transparent" />
                
                <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                   <TrendingUp size={32} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                   <h2 className="text-2xl font-black uppercase text-white mb-2">Zinc Exchange</h2>
                   <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-zinc-300 transition-colors">
                      Volatile market simulation. Trade commodities.
                   </p>
                </div>
            </Link>

            {/* 5. COMING SOON (SQUARE DASHED) */}
            <div className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-dashed border-zinc-800 bg-zinc-950/30 flex flex-col items-center justify-center text-center p-8 opacity-60 hover:opacity-100 transition-all hover:border-zinc-700">
                <div className="mb-6 text-zinc-700 group-hover:text-zinc-500 transition-colors">
                    <Dna size={48} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-700 mb-4 group-hover:text-zinc-400">
                    Memory Core
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    <Construction size={10} />
                    In Development
                </div>
            </div>

        </div>
      </section>

    </main>
  );
}