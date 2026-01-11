'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Package, CarFront, Gavel, ArrowLeftRight, 
  Wallet, Zap, Globe, BarChart3, ChevronRight, Sparkles,
  ArrowUpRight, ShieldCheck, Activity
} from 'lucide-react';
import StockTicker from '../components/StockTicker';
import { useAuth } from '../context/AuthContext';

export default function MarketIndex() {
  const { profile } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden font-sans">
      
      {/* GLOBAL GRAIN OVERLAY */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none z-[0]" />

      <div className="relative z-10 pt-20 md:pt-24 pb-8 px-6 max-w-[1600px] mx-auto w-full">
        
        {/* TICKER MOVED UP */}
        <div className="mb-12 md:mb-16">
            <StockTicker />
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 border-b border-white/5 pb-12">
           <div className="flex items-center gap-8">
              <div>
                 <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
                    <span>ZINC_MARKET_TELEMETRY // LIVE</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Exchange_Open</span>
                    </div>
                 </div>
                 <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic text-white">
                    Market <span className="text-zinc-800">Index</span>
                 </h1>
              </div>
           </div>

           <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 flex flex-col items-end gap-1 backdrop-blur-xl min-w-[260px] shadow-2xl relative group hover:border-[#DFFF00]/50 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#DFFF00] opacity-[0.03] blur-3xl -mr-12 -mt-12" />
              <div className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em] leading-none mb-2">Available Credits</div>
              <div className="text-4xl font-sans font-black tracking-tighter text-white tabular-nums flex items-baseline gap-3">
                 <div className="p-1.5 bg-zinc-950 rounded-xl text-[#DFFF00] border border-white/5">
                    <Wallet size={18} />
                 </div>
                 {profile?.credits?.toLocaleString() || 0}
                 <span className="text-xs text-[#DFFF00] font-black tracking-widest">CR</span>
              </div>
           </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 auto-rows-[340px] gap-[1px] bg-zinc-800 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
            
            {/* 1. STOCK EXCHANGE (Col 8) */}
            <Link href="/market/stocks" className="group md:col-span-8 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-500 p-10 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-black/60 transition-colors">01_Exchange</span>
                        <h3 className="text-5xl md:text-6xl font-black uppercase text-white mt-4 tracking-tighter italic group-hover:text-black transition-colors leading-none">StockZ</h3>
                    </div>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black shadow-xl">
                        <BarChart3 size={18} />
                    </div>
                </div>
                <div className="relative z-10 flex items-end justify-between">
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest max-w-sm group-hover:text-black/60 leading-relaxed">
                        High-frequency trading terminal. Monitor global liquidity & high-fidelity portfolio analytics.
                    </p>
                    <div className="flex items-center gap-4 text-zinc-500 group-hover:text-black">
                        <span className="text-[10px] font-black uppercase tracking-widest">Portal Ready</span>
                        <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#DFFF00] opacity-0 group-hover:opacity-10 blur-[100px] transition-opacity" />
            </Link>
            
            {/* 2. BLACK MARKET (Col 4) */}
            <Link href="/market/packs" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#ef4444] transition-colors duration-500 p-10 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-white/60 transition-colors">02_Acquisition</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-white/10 transition-colors text-red-500 group-hover:text-white shadow-xl">
                        <Package size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-4 tracking-tighter italic group-hover:text-white transition-colors">Black Market</h3>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest group-hover:text-white/60">Asset Pack Extraction //</p>
                </div>
            </Link>

            {/* 3. PRESTIGE IMPORTS (Col 4) */}
            <Link href="/market/dealership" className="group md:col-span-4 relative bg-zinc-950 hover:bg-white transition-colors duration-500 p-10 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-black/60 transition-colors">03_Imports</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-zinc-400 group-hover:text-black shadow-xl">
                        <CarFront size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">Prestige Imports</h3>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest group-hover:text-black/60 italic font-bold">Showroom Open //</p>
                </div>
            </Link>

            {/* 4. AUCTION HOUSE (Col 4) */}
            <Link href="/market/auction" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-500 p-10 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-black/60 transition-colors">04_Bidding</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black shadow-xl">
                        <Gavel size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">Auction House</h3>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest group-hover:text-black/60">Live Asset Bidding //</p>
                </div>
            </Link>

            {/* 5. P2P TRADING (Col 4) */}
            <Link href="/market/trading" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#3b82f6] transition-colors duration-500 p-10 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-white/60 transition-colors">05_Network</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-white/10 transition-colors text-blue-500 group-hover:text-white shadow-xl">
                        <ArrowLeftRight size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-white transition-colors">P2P Trading</h3>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest group-hover:text-white/60 font-bold italic">Secure Link Active //</p>
                </div>
            </Link>

        </div>

        {/* FOOTER STATS */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 px-4">
            <div className="flex items-center gap-12 text-zinc-600 font-mono text-[9px] font-bold uppercase tracking-[0.4em]">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={14} className="text-[#DFFF00]" />
                    <span>Zinc_Secure_Transfer_V4.2</span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <Globe size={14} />
                    <span>Nodes: 12_Connected</span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <Activity size={14} />
                    <span>Latency: 12ms</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                    <Zap size={18} className="text-[#DFFF00]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Zinc Engineering © 2026</span>
            </div>
        </div>
      </div>
    </main>
  );
}