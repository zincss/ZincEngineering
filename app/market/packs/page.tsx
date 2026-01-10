'use client';

import React from 'react';
import { PackOpeningView } from '../components/PackOpeningView';
import { useAuth } from '@/app/context/AuthContext';
import { Package } from 'lucide-react';
import StockTicker from '@/app/components/StockTicker';

export default function PacksPage() {
  const { user, profile, loading, refreshProfile } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-950 pt-24">
      <StockTicker />
      <div className="max-w-[1800px] mx-auto px-6 pt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b border-white/5 pb-12">
              <div className="flex items-center gap-8">
                  <div>
                      <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-2">
                          <span>Zinc_Market_Protocol // V4.2</span>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20">
                              <div className="w-1 h-1 rounded-full bg-[#ef4444] animate-pulse" />
                              <span className="text-[8px] font-mono font-bold text-[#ef4444] uppercase tracking-widest">Global_Liquidity_Online</span>
                          </div>
                      </div>
                      <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic text-white">
                          Black <span className="text-zinc-800">Market</span>
                      </h1>
                  </div>
              </div>
          </div>
          <PackOpeningView 
            user={user} 
            profile={profile} 
            authLoading={loading} 
            refreshProfile={refreshProfile} 
          />
      </div>
    </main>
  );
}
