'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Package, Gavel, ArrowLeftRight, Wallet, Activity, TrendingUp } from 'lucide-react';
import { AssetPreloader, animationStyles } from './components/shared';

// IMPORTS: Ensure these files are located in app/market/components/
import { PackOpeningView } from './components/PackOpeningView';
import { AuctionHouseView } from './components/AuctionHouseView';
import { TradingLobbyView } from './components/TradingLobbyView';
import { StockMarketView } from './components/StockMarketView';

export default function MarketHubPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'EXCHANGE' | 'PACKS' | 'AUCTION' | 'TRADING'>('EXCHANGE');

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black flex flex-col relative overflow-hidden">
      <AssetPreloader />
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* Navigation Helper */}

      {/* HEADER SECTION - Optimized for Mobile */}
      {/* FIX: Reduced top padding from pt-24 to pt-20 on mobile */}
      <div className="pt-20 pb-4 px-4 md:pt-32 md:pb-8 md:px-6 max-w-[1800px] mx-auto border-b border-zinc-800 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6 md:mb-8">
            <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs md:text-sm font-black tracking-widest uppercase mb-2 md:mb-4">
                    <Activity size={16} />
                    <span>ZINC_ECONOMY_PROTOCOL // {activeTab}</span>
                </div>
                {/* FIX: Adjusted responsive font sizes for title */}
                <h1 className="text-3xl sm:text-4xl md:text-7xl font-black uppercase tracking-tighter">
                    {activeTab === 'EXCHANGE' && <>Zinc <span className="text-zinc-700">Exchange</span></>}
                    {activeTab === 'PACKS' && <>Black <span className="text-zinc-700">Market</span></>}
                    {activeTab === 'AUCTION' && <>Auction <span className="text-zinc-700">House</span></>}
                    {activeTab === 'TRADING' && <>P2P <span className="text-zinc-700">Network</span></>}
                </h1>
            </div>

            <div className="text-right w-full md:w-auto border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0 flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest md:mb-1">Available Liquidity</div>
                <div className="text-2xl md:text-3xl font-mono font-black text-[#DFFF00] flex items-center gap-2 justify-end">
                    <Wallet size={20} className="md:w-6 md:h-6" />
                    {profile?.credits?.toLocaleString() || 0}
                </div>
            </div>
        </div>

        {/* TABS NAVIGATION - Scrollable on mobile */}
        <div className="flex gap-2 md:gap-8 overflow-x-auto pb-1 no-scrollbar mask-gradient-right -mx-4 px-4 md:mx-0 md:px-0">
            <TabButton 
                active={activeTab === 'EXCHANGE'} 
                onClick={() => setActiveTab('EXCHANGE')} 
                icon={<TrendingUp size={14} />} 
                label="Stock Exchange" 
            />
            <TabButton 
                active={activeTab === 'PACKS'} 
                onClick={() => setActiveTab('PACKS')} 
                icon={<Package size={14} />} 
                label="Acquisitions" 
            />
            <TabButton 
                active={activeTab === 'AUCTION'} 
                onClick={() => setActiveTab('AUCTION')} 
                icon={<Gavel size={14} />} 
                label="Auctions" 
            />
            <TabButton 
                active={activeTab === 'TRADING'} 
                onClick={() => setActiveTab('TRADING')} 
                icon={<ArrowLeftRight size={14} />} 
                label="P2P Trading" 
            />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 w-full relative z-20 bg-zinc-950/50">
          {activeTab === 'EXCHANGE' && <StockMarketView user={user} profile={profile} refreshProfile={refreshProfile} />}
          {activeTab === 'PACKS' && <PackOpeningView user={user} profile={profile} authLoading={authLoading} refreshProfile={refreshProfile} />}
          {activeTab === 'AUCTION' && <AuctionHouseView user={user} profile={profile} refreshProfile={refreshProfile} />}
          {activeTab === 'TRADING' && <TradingLobbyView user={user} />}
      </div>
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