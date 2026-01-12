'use client';

import React from 'react';
import { PackOpeningView } from '../components/PackOpeningView';
import { useAuth } from '@/app/context/AuthContext';
import StockTicker from '@/app/components/StockTicker';

export default function PacksPage() {
  const { user, profile, loading, refreshProfile } = useAuth();

  return (
    <main className="min-h-screen bg-black pt-24">
      <StockTicker />
      <div className="max-w-[1600px] mx-auto px-6 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b border-white/10 pb-8">
              <div className="flex items-center gap-8">
                  <div>
                      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-2">
                          Pack Market
                      </h1>
                      <p className="text-zinc-400 font-medium">
                          Purchase packs to build your collection of rare assets.
                      </p>
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