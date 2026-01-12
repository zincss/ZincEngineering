'use client';

import React from 'react';
import WagerHistory from './components/WagerHistory';
import SportsBettingInterface from './components/SportsBettingInterface';
import { Target } from 'lucide-react';
import { useSportsMode } from '@/app/context/SportsModeContext';

export default function WagersPage() {
    const { isSportsMode } = useSportsMode();
    const accent = isSportsMode ? 'text-blue-400' : 'text-[#DFFF00]';
    const bg = isSportsMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-[#DFFF00]/10 border-[#DFFF00]/20';

    return (
        <div className="pb-24 space-y-12">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl border ${bg} ${accent}`}>
                    <Target size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Sportsbook</h1>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Live Odds & Wagering</p>
                </div>
            </div>

            <SportsBettingInterface />

            <div className="pt-12 border-t border-white/5">
                <WagerHistory />
            </div>
        </div>
    );
}
