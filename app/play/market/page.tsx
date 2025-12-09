'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Package, Gavel, ArrowLeftRight, Wallet } from 'lucide-react';
import BackButton from '@/app/components/BackButton';
import { AssetPreloader, animationStyles } from './components/shared';
import { PackOpeningView } from './components/PackOpeningView';
import { AuctionHouseView } from './components/AuctionHouseView';
import { TradingLobbyView } from './components/TradingLobbyView';

export default function MarketPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'PACKS' | 'AUCTION' | 'TRADING'>('PACKS');

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black flex flex-col relative overflow-hidden">
      <AssetPreloader />
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <BackButton href="/play" label="ARCADE HUB" />

      {/* HEADER SECTION */}
      <div className="pt-24 pb-8 px-4 md:pt-32 md:pb-8 md:px-6 max-w-[1600px] mx-auto border-b border-zinc-800 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs md:text-sm font-black tracking-widest uppercase mb-4">
                    {activeTab === 'PACKS' && <Package size={16} />}
                    {activeTab === 'AUCTION' && <Gavel size={16} />}
                    {activeTab === 'TRADING' && <ArrowLeftRight size={16} />}
                    <span>GLOBAL_MARKET // {activeTab}</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
                    {activeTab === 'PACKS' && <>Asset <span className="text-zinc-700">Acquisition</span></>}
                    {activeTab === 'AUCTION' && <>Black <span className="text-zinc-700">Market</span></>}
                    {activeTab === 'TRADING' && <>Direct <span className="text-zinc-700">Trading</span></>}
                </h1>
            </div>

            <div className="text-right w-full md:w-auto border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Liquid Credits</div>
                <div className="text-2xl font-mono font-black text-[#DFFF00] flex items-center gap-2 justify-end">
                    <Wallet size={20} />
                    {profile?.credits?.toLocaleString() || 0}
                </div>
            </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-8 overflow-x-auto pb-1 no-scrollbar">
            {['PACKS', 'AUCTION', 'TRADING'].map((tab) => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeTab === tab ? 'text-[#DFFF00] border-b-2 border-[#DFFF00]' : 'text-zinc-500 hover:text-white'
                    }`}
                >
                    {tab === 'PACKS' ? 'Acquisition' : tab === 'AUCTION' ? 'Auction House' : 'P2P Trading'}
                </button>
            ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 w-full relative z-20">
          {activeTab === 'PACKS' && <PackOpeningView user={user} profile={profile} authLoading={authLoading} refreshProfile={refreshProfile} />}
          {activeTab === 'AUCTION' && <AuctionHouseView user={user} profile={profile} refreshProfile={refreshProfile} />}
          {activeTab === 'TRADING' && <TradingLobbyView user={user} />}
      </div>
    </div>
  );
}