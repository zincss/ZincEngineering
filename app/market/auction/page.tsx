'use client';

import React from 'react';
import { AuctionHouseView } from '../components/AuctionHouseView';
import { useAuth } from '@/app/context/AuthContext';

export default function AuctionPage() {
  const { user, profile, refreshProfile } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 pt-20">
      <AuctionHouseView 
        user={user} 
        profile={profile} 
        refreshProfile={refreshProfile} 
      />
    </main>
  );
}
