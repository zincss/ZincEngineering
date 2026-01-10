'use client';

import React from 'react';
import { StockMarketView } from '../components/StockMarketView';
import { useAuth } from '@/app/context/AuthContext';
import StockTicker from '@/app/components/StockTicker';

export default function StocksPage() {
  const { user, profile, refreshProfile } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Reduced spacer to move ticker up */}
      <div className="h-16 md:h-20" />
      
      <div className="mb-12 md:mb-16">
        <StockTicker />
      </div>
      
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