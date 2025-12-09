'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, ChevronRight, Construction, Dna, Spade, Trophy, Package, TrendingUp } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function PlayHub() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* GLOBAL BACK BUTTON */}
      <BackButton href="/" label="MAIN TERMINAL" />

      {/* HEADER SECTION */}
      <div className="pt-40 md:pt-32 pb-12 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 relative">
        <div className="absolute top-32 right-6 flex items-center gap-2 text-[#DFFF00] font-mono text-sm font-black tracking-widest uppercase animate-in fade-in slide-in-from-right-4 duration-1000">
            <span className="text-zinc-600">/</span>
            <span>ARCADE_PROTOCOLS</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                    System <span className="text-zinc-700">Arcade</span>
                </h1>
                <p className="text-zinc-400 font-mono max-w-2xl">
                    Interactive entertainment modules and cognitive assessment tools.
                    Select a protocol to initialize.
                </p>
            </div>

            {/* MARKET BUTTON */}
            <Link 
                href="/play/market"
                className="flex items-center gap-2 px-8 py-4 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-widest rounded transition-all shadow-[0_0_20px_rgba(223,255,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95 group"
            >
                <Package size={20} className="group-hover:rotate-12 transition-transform" />
                <span>Access Market</span>
            </Link>
        </div>
      </div>

      {/* GAMES GRID */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* GAME 1: TRIVIA */}
            <Link 
                href="/collections/trivia" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[350px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00] bg-zinc-950/50 w-fit p-3 rounded-xl border border-zinc-800 backdrop-blur-sm">
                        <Brain size={32} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Trivia Matrix
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        Procedural knowledge assessment generator. Test your database across multiple categories.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        INITIALIZE GAME <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* GAME 2: BLACKJACK */}
            <Link 
                href="/play/blackjack" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[350px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2674&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00] bg-zinc-950/50 w-fit p-3 rounded-xl border border-zinc-800 backdrop-blur-sm">
                        <Spade size={32} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Tactical Blackjack
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        High-stakes probability simulation. Wager credits against the house algorithm.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        ENTER TABLE <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* GAME 3: POKER */}
            <Link 
                href="/play/poker" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[350px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605020420620-20c943cc4669?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00] bg-zinc-950/50 w-fit p-3 rounded-xl border border-zinc-800 backdrop-blur-sm">
                        <Trophy size={32} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Texas Hold'em
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        No-Limit Tactical Poker. Engage adaptive AI opponents across three difficulty tiers.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        TAKE A SEAT <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* GAME 4: ZINC EXCHANGE (Was Bookie) */}
            <Link 
                href="/play/stocks" 
                className="group relative border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-colors duration-300 min-h-[350px] flex flex-col"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 grayscale transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                    <div className="mb-4 text-[#DFFF00] bg-zinc-950/50 w-fit p-3 rounded-xl border border-zinc-800 backdrop-blur-sm">
                        <TrendingUp size={32} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#DFFF00] transition-colors">
                        Zinc Exchange
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mb-6 max-w-md">
                        Volatile parody market. Invest in Void Corp, Facade, and more.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                        OPEN TRADING FLOOR <ChevronRight size={12} />
                    </div>
                </div>
            </Link>

            {/* COMING SOON SLOT */}
            <div className="group relative border border-dashed border-zinc-800 bg-zinc-950/50 min-h-[350px] flex flex-col items-center justify-center text-center p-8 opacity-75 hover:opacity-100 transition-opacity">
                <div className="mb-4 text-zinc-700 group-hover:text-zinc-500 transition-colors">
                    <Dna size={48} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-700 mb-2">
                    Memory Core
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    <Construction size={10} />
                    In Development
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}