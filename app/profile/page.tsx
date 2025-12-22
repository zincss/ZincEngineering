'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { ProfileHeader } from './components/ProfileHeader';
import { PortfolioView } from './components/PortfolioView';
import { WalletView } from './components/WalletView';
import InventoryView from './components/InventoryView'; 
import { MaterialsView } from './components/MaterialsView';
import { BaseCampView } from './components/BaseCampView';
import { Package, LineChart, Wallet, Hammer, Tent, X, Trophy } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'PORTFOLIO' | 'WALLET' | 'MATERIALS'>('INVENTORY');
  const [showBaseCamp, setShowBaseCamp] = useState(false);

  const TABS = [
    { id: 'INVENTORY', label: 'Assets', icon: Package },
    { id: 'PORTFOLIO', label: 'Portfolio', icon: LineChart },
    { id: 'WALLET', label: 'Wallet', icon: Wallet },
    { id: 'MATERIALS', label: 'Materials', icon: Hammer },
  ];

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-[#DFFF00] font-mono animate-pulse">AUTHENTICATING...</div>;
  if (!user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-500 font-mono">ACCESS DENIED</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 relative overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="relative">
          <ProfileHeader profile={profile} inventoryCount={0} />
          
          {/* BASE CAMP BUTTON (ABSOLUTE TOP RIGHT) */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
              <button 
                onClick={() => setShowBaseCamp(true)}
                className="group relative flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-full hover:border-[#DFFF00] hover:bg-black transition-all shadow-lg overflow-hidden"
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DFFF00]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Tent size={14} className="text-[#DFFF00]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-white hidden sm:inline">Base Camp</span>
              </button>
          </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 relative z-10">
        
        {/* CLEAN TAB NAVIGATION - MOBILE OPTIMIZED */}
        <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  relative flex items-center gap-2 px-6 py-4 transition-all whitespace-nowrap outline-none shrink-0
                  ${isActive ? 'text-[#DFFF00]' : 'text-zinc-500 hover:text-zinc-300'}
                `}
              >
                <tab.icon size={16} />
                <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                
                {/* ACTIVE INDICATOR LINE (BOTTOM) */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#DFFF00] shadow-[0_0_10px_#DFFF00]" />
                )}
              </button>
            );
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'INVENTORY' && <InventoryView user={user} />}
          {activeTab === 'PORTFOLIO' && <PortfolioView userId={user.id} />}
          {activeTab === 'WALLET' && <WalletView profile={profile} onRefresh={() => {}} />}
          {activeTab === 'MATERIALS' && <MaterialsView materials={[]} />}
        </div>

      </main>

      {/* BASE CAMP OVERLAY */}
      {showBaseCamp && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
              {/* MODAL HEADER */}
              <div className="flex justify-between items-center p-4 md:p-6 border-b border-zinc-800 bg-zinc-950">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-900 rounded-full border border-zinc-800 text-[#DFFF00]">
                        <Tent size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase text-white tracking-tight">Base Camp</h2>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Personal Quarters // Trading Post</p>
                      </div>
                  </div>
                  <button onClick={() => setShowBaseCamp(false)} className="p-3 bg-zinc-900 rounded-full hover:bg-white hover:text-black transition-all">
                      <X size={20} />
                  </button>
              </div>
              
              {/* MODAL CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[url('/grid.svg')] bg-fixed">
                  <div className="max-w-7xl mx-auto">
                    <BaseCampView materials={[]} onTrade={() => {}} />
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}