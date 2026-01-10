'use client';

import React from 'react';
import { TradingLobbyView } from '../components/TradingLobbyView';
import { useAuth } from '@/app/context/AuthContext';

export default function TradingPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 pt-20">
      <TradingLobbyView user={user} />
    </main>
  );
}
