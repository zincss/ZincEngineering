'use client';

import React from 'react';
import WeatherTerminal from './components/WeatherTerminal';

export default function WeatherPage() {
  return (
    <div className="min-h-screen text-white selection:bg-[#DFFF00] selection:text-black overflow-x-hidden">
      <WeatherTerminal />
    </div>
  );
}