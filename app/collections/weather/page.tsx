'use client';

import React from 'react';
import WeatherTerminal from './components/WeatherTerminal';
import BackButton from '../../components/BackButton';

export default function WeatherPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* NAVIGATION */}
      <BackButton href="/collections" label="COLLECTIONS HUB" />
      
      {/* MAIN MODULE */}
      <div className="max-w-[1600px] mx-auto px-6 pb-20 pt-12">
        <WeatherTerminal />
      </div>

    </div>
  );
}