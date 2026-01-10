'use client';

import React from 'react';
import { StockMarketView } from '../components/StockMarketView';
import { useAuth } from '@/app/context/AuthContext';
import StockTicker from '@/app/components/StockTicker';

export default function StocksPage() {
  const { user, profile, refreshProfile } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Spacer for fixed global header */}
      <div className="h-20 md:h-24" />
      
      <StockTicker />
      
      <div className="px-4 md:px-10 max-w-[1800px] mx-auto">
        <StockMarketView 
          user={user} 
          profile={profile} 
          refreshProfile={refreshProfile} 
        />
      </div>
    </main>
  );
}