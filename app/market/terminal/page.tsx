'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import {
  Package, Gavel, ArrowLeftRight, Wallet, Activity,
  TrendingUp, CarFront, Globe, Zap, Cpu, BarChart3,
  ChevronRight, ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';
import { AssetPreloader, animationStyles } from '../components/shared';
import GlobalTicker from '../../components/GlobalTicker';

// IMPORTS
import { PackOpeningView } from '../components/PackOpeningView';
import { AuctionHouseView } from '../components/AuctionHouseView';
import { TradingLobbyView } from '../components/TradingLobbyView';
import { StockMarketView } from '../components/StockMarketView';
import { CarDealershipView } from '../components/CarDealershipView';

export default function MarketHubPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'EXCHANGE' | 'PACKS' | 'AUCTION' | 'TRADING' | 'DEALERSHIP'>('EXCHANGE');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['EXCHANGE', 'PACKS', 'AUCTION', 'TRADING', 'DEALERSHIP'].includes(tab)) {
        setActiveTab(tab as any);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'EXCHANGE', label: 'Exchange', icon: <BarChart3 size={18} />, sub: 'Stock Market' },
    { id: 'PACKS', label: 'Black Market', icon: <Package size={18} />, sub: 'Acquisition' },
    { id: 'DEALERSHIP', label: 'Prestige', icon: <CarFront size={18} />, sub: 'Imports' },
    { id: 'AUCTION', label: 'Auction', icon: <Gavel size={18} />, sub: 'House' },
    { id: 'TRADING', label: 'Terminal', icon: <ArrowLeftRight size={18} />, sub: 'P2P Network' },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black flex flex-col relative overflow-hidden font-sans">
      <AssetPreloader />
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* GLOBAL GRAIN OVERLAY */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none z-[60]" />

      {/* HEADER SECTION */}
      <div className="relative z-50 pt-24 pb-8 px-6 max-w-[1800px] mx-auto w-full">
        <div className="flex flex-col xl:flex-row justify-between items-center xl:items-end gap-12 mb-12">
            <div className="flex items-center gap-8">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-[#DFFF00]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-zinc-800 shadow-2xl relative z-10">
                        <Zap size={32} className="text-[#DFFF00]" />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-2">
                        <span>Zinc_Market_Protocol // V4.2</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
                            <div className="w-1 h-1 rounded-full bg-[#DFFF00] animate-pulse" />
                            <span className="text-[8px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest">Global_Liquidity_Online</span>
                        </div>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic text-white">
                        The <span className="text-[#DFFF00]">Market</span>
                    </h1>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col items-end gap-1 shadow-2xl min-w-[200px] backdrop-blur-md relative overflow-hidden group hover:border-[#DFFF00]/50 transition-all">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#DFFF00] opacity-[0.02] blur-2xl -mr-8 -mt-8" />
                    <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-2">Available Credits</div>
                    <div className="flex items-center gap-3 text-4xl font-black text-white tabular-nums tracking-tighter">
                        {profile?.credits?.toLocaleString() || 0}
                        <span className="text-xs text-[#DFFF00] font-black tracking-widest">CR</span>
                    </div>
                </div>
                
                <div className="hidden lg:flex bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex-col items-end gap-1 shadow-2xl min-w-[200px] backdrop-blur-md relative overflow-hidden group hover:border-[#DFFF00]/50 transition-all">
                    <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-2">Market Index</div>
                    <div className="flex items-center gap-3 text-4xl font-black text-emerald-500 tabular-nums tracking-tighter">
                        +4.2%
                        <ArrowUpRight size={20} />
                    </div>
                </div>
            </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {tabs.map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        group relative flex flex-col gap-1 px-8 py-5 min-w-[180px] transition-all whitespace-nowrap rounded-2xl border
                        ${activeTab === tab.id 
                            ? 'bg-[#DFFF00] border-[#DFFF00] shadow-[0_0_30px_rgba(223,255,0,0.2)]' 
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 backdrop-blur-md'}
                    `}
                >
                    <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-black/10 text-black' : 'bg-zinc-950 text-zinc-600 group-hover:text-[#DFFF00]'}`}>
                            {React.cloneElement(tab.icon as React.ReactElement, { size: 18 })}
                        </div>
                        {activeTab === tab.id && <ChevronRight size={14} className="text-black" />}
                    </div>
                    <div className="mt-4 text-left">
                        <div className={`text-[10px] font-black uppercase tracking-widest leading-none ${activeTab === tab.id ? 'text-black/60' : 'text-zinc-600'}`}>{tab.sub}</div>
                        <div className={`text-xl font-black uppercase italic tracking-tighter ${activeTab === tab.id ? 'text-black' : 'text-white group-hover:text-[#DFFF00]'}`}>{tab.label}</div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* TICKER */}
      <div className="bg-zinc-950 border-y border-white/5 py-4 mb-8">
        <GlobalTicker />
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 w-full relative z-10 max-w-[1800px] mx-auto px-6 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="h-full"
            >
                {activeTab === 'EXCHANGE' && <StockMarketView user={user} profile={profile} refreshProfile={refreshProfile} />}
                {activeTab === 'PACKS' && <PackOpeningView user={user} profile={profile} authLoading={authLoading} refreshProfile={refreshProfile} />}
                {activeTab === 'DEALERSHIP' && <CarDealershipView user={user} profile={profile} refreshProfile={refreshProfile} />}
                {activeTab === 'AUCTION' && <AuctionHouseView user={user} profile={profile} refreshProfile={refreshProfile} />}
                {activeTab === 'TRADING' && <TradingLobbyView user={user} />}
            </motion.div>
          </AnimatePresence>
      </div>

      {/* MOBILE NAV */}
      <nav className="sm:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                      {React.cloneElement(tab.icon as React.ReactElement, { size: 20 })}
                  </button>
              ))}
          </div>
      </nav>
    </div>
  );
}
