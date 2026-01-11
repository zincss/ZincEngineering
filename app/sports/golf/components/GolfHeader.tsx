'use client';

import React from 'react';
import LeaderSlideshow from '../../components/LeaderSlideshow';
import GolfSearch from './GolfSearch';

export default function GolfHeader({ leaders }: { leaders: any }) {
  return (
    <div className="relative z-50 pt-20 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 max-w-[1600px] mx-auto w-full border-b border-zinc-800">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
            <div className="flex items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 text-zinc-500 font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                        <span>ZincSports // PGA</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">
                        GOLF<span className="text-[#DFFF00]">TOUR</span>
                    </h1>
                </div>
            </div>

            <div className="w-full xl:w-auto">
                <LeaderSlideshow leaders={leaders} league="golf" />
            </div>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-xl w-full">
            <GolfSearch />
        </div>
    </div>
  );
}
