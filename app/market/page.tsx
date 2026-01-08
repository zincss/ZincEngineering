'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { Package, Gavel, ArrowLeftRight, Wallet, Activity, TrendingUp, CarFront } from 'lucide-react';
import { AssetPreloader, animationStyles } from './components/shared';

// IMPORTS: Ensure these files are located in app/market/components/
import { PackOpeningView } from './components/PackOpeningView';
import { AuctionHouseView } from './components/AuctionHouseView';
import { TradingLobbyView } from './components/TradingLobbyView';
import { StockMarketView } from './components/StockMarketView';
import { CarDealershipView } from './components/CarDealershipView';

export default function MarketHubPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'EXCHANGE' | 'PACKS' | 'AUCTION' | 'TRADING' | 'DEALERSHIP'>('EXCHANGE');

  const tabs = [
    { id: 'EXCHANGE', label: 'Stocks', icon: <TrendingUp size={18} /> },
    { id: 'PACKS', label: 'ACQ', icon: <Package size={18} /> },
    { id: 'DEALERSHIP', label: 'Dealer', icon: <CarFront size={18} /> },
    { id: 'AUCTION', label: 'Auction', icon: <Gavel size={18} /> },
    { id: 'TRADING', label: 'P2P', icon: <ArrowLeftRight size={18} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#DFFF00] selection:text-black flex flex-col relative overflow-hidden">
      <AssetPreloader />
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#DFFF00]/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/[0.03] blur-[120px] rounded-full" />
      </div>

      {/* HERO SECTION - Refined */}
      <div className="relative z-10 pt-20 md:pt-32 pb-4 md:pb-8 px-4 md:px-8 max-w-[1800px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
            <div>
                <div className="flex items-center gap-3 text-[#DFFF00] font-mono text-[10px] md:text-xs font-black tracking-[0.3em] uppercase mb-4">
                    <Activity size={14} className="animate-pulse" />
                    <span>ZINC_ECONOMY_PROTOCOL // {activeTab}</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-[-0.05em] leading-[0.9]">
                    {activeTab === 'EXCHANGE' && <>Zinc <span className="text-zinc-800">Exchange</span></>}
                    {activeTab === 'PACKS' && <>Black <span className="text-zinc-800">Market</span></>}
                    {activeTab === 'AUCTION' && <>Auction <span className="text-zinc-800">House</span></>}
                    {activeTab === 'TRADING' && <>P2P <span className="text-zinc-800">Network</span></>}
                    {activeTab === 'DEALERSHIP' && <>Prestige <span className="text-zinc-800">Imports</span></>}
                </h1>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col items-end gap-1 backdrop-blur-3xl min-w-[240px] shadow-2xl">
                <div className="text-[8px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">Available Liquidity</div>
                <div className="flex items-center gap-3 text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter">
                    <Wallet size={20} className="text-[#DFFF00]" />
                    {profile?.credits?.toLocaleString() || 0}
                    <span className="text-xs text-zinc-600 font-bold tracking-widest ml-1">CR</span>
                </div>
            </div>
        </div>

        {/* TABS NAVIGATION - Refined Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
            {tabs.map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        group flex items-center gap-3 px-8 py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap rounded-[2rem] border shrink-0
                        ${activeTab === tab.id 
                            ? 'bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.1)] scale-[1.02]' 
                            : 'bg-white/[0.03] border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 hover:border-white/10'}
                    `}
                >
                    <span className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === tab.id ? 'text-black' : 'text-zinc-600 group-hover:text-[#DFFF00]'}`}>
                        {tab.icon}
                    </span>
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 w-full relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
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

      {/* MOBILE QUICK NAV - Fixed at bottom */}
      <nav className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 flex items-center justify-between shadow-2xl shadow-black">
              {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                      {React.cloneElement(tab.icon as React.ReactElement, { size: 20 })}
                      <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{tab.label}</span>
                  </button>
              ))}
          </div>
      </nav>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`
                group flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap rounded-t-xl border-b-2 shrink-0
                ${active 
                    ? 'text-[#DFFF00] border-[#DFFF00] bg-zinc-900/50' 
                    : 'text-zinc-500 border-transparent hover:text-white hover:bg-zinc-900/30'}
            `}
        >
            <span className={active ? 'text-[#DFFF00]' : 'text-zinc-600 group-hover:text-zinc-400'}>{icon}</span>
            {label}
        </button>
    );
}