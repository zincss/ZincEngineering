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
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black flex flex-col relative overflow-hidden font-sans">
      <AssetPreloader />
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* Background Ambience - Subtler */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#DFFF00]/[0.02] blur-[120px] rounded-full" />
      </div>

      {/* HEADER SECTION - Monolith Style */}
      <div className="relative z-10 pt-24 pb-8 px-6 max-w-[1600px] mx-auto w-full border-b border-zinc-800">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                    <Activity size={24} className="text-[#DFFF00]" />
                </div>
                <div>
                    <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                        <span>ZINC_ECONOMY_PROTOCOL // v2.0</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">
                        {activeTab === 'EXCHANGE' && <>Zinc <span className="text-zinc-800">Exchange</span></>}
                        {activeTab === 'PACKS' && <>Black <span className="text-zinc-800">Market</span></>}
                        {activeTab === 'AUCTION' && <>Auction <span className="text-zinc-800">House</span></>}
                        {activeTab === 'TRADING' && <>P2P <span className="text-zinc-800">Network</span></>}
                        {activeTab === 'DEALERSHIP' && <>Prestige <span className="text-zinc-800">Imports</span></>}
                    </h1>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-end gap-1 shadow-2xl min-w-[240px] group hover:border-[#DFFF00] transition-colors">
                <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1 group-hover:text-[#DFFF00] transition-colors">Available Liquidity</div>
                <div className="flex items-center gap-3 text-3xl font-black text-white tabular-nums tracking-tighter">
                    <div className="p-1.5 bg-zinc-950 rounded-lg text-[#DFFF00]">
                        <Wallet size={16} />
                    </div>
                    {profile?.credits?.toLocaleString() || 0}
                    <span className="text-xs text-zinc-600 font-bold tracking-widest ml-1">CR</span>
                </div>
            </div>
        </div>

        {/* TABS NAVIGATION - Monolith Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {tabs.map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        group flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap rounded-xl border shrink-0
                        ${activeTab === tab.id 
                            ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_20px_rgba(223,255,0,0.3)]' 
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600'}
                    `}
                >
                    <div className={`p-1 rounded-md transition-colors ${activeTab === tab.id ? 'bg-black/10 text-black' : 'bg-black text-zinc-600 group-hover:text-[#DFFF00]'}`}>
                        {React.cloneElement(tab.icon as React.ReactElement, { size: 14 })}
                    </div>
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 w-full relative z-10 bg-zinc-950">
          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
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

      {/* MOBILE QUICK NAV - Monolith Style */}
      <nav className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-2 flex items-center justify-between shadow-2xl">
              {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                      {React.cloneElement(tab.icon as React.ReactElement, { size: 16 })}
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