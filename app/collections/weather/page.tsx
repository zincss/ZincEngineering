'use client';

import React from 'react';
import { CloudHail } from 'lucide-react';
import WeatherTerminal from './components/WeatherTerminal';
import BackButton from '../../components/BackButton';

export default function WeatherPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* NAVIGATION */}
      <BackButton href="/collections" label="COLLECTIONS HUB" />
      
      {/* HEADER */}
      <div className="pt-32 pb-8 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-[10px] font-black tracking-widest uppercase mb-2">
                    <span>ATMOSPHERIC_SENSORS</span>
                    <span className="text-zinc-600">/</span>
                    <span>PERSONALITY_MATRIX</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">
                    Weather <span className="text-zinc-800 text-stroke-white">Station</span>
                </h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                    <CloudHail size={12} /> Live Environment Analysis
                </p>
            </div>
        </div>
      </div>

      {/* MAIN MODULE */}
      <div className="max-w-[1600px] mx-auto px-6 pb-20">
        <WeatherTerminal />
      </div>

    </div>
  );
}