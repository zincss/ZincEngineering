'use client';

import React from 'react';
import { CarDealershipView } from '../components/CarDealershipView';
import { useAuth } from '@/app/context/AuthContext';
import StockTicker from '@/app/components/StockTicker';

export default function DealershipPage() {
  const { user, profile, refreshProfile } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-950 pt-20">
      <StockTicker />
      <div className="px-6">
        <CarDealershipView 
          user={user} 
          profile={profile} 
          refreshProfile={refreshProfile} 
        />
      </div>
    </main>
  );
}
