'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Flag, Trophy } from 'lucide-react';
import type { GolfLeaderboard } from '../lib/golf-api';

export default function LiveTicker({ data }: { data: GolfLeaderboard | null }) {
    const router = useRouter();

    // LOGIC: Create a seamless loop by duplicating the list enough times to fill the screen
    const tickerItems = useMemo(() => {
        if (!data || !data.players || data.players.length === 0) return [];
        let baseList = [...data.players];
        // Ensure strictly enough items for smooth animation
        while (baseList.length < 15) {
            baseList = [...baseList, ...data.players];
        }
        return [...baseList, ...baseList]; // Double it for the loop seam
    }, [data]);

    if (!data) return null;

    return (
        <div className="w-full bg-zinc-950 border-b border-zinc-800 h-14 flex items-center z-20 relative overflow-hidden group">
            
            {/* 1. STATIC LABEL: Tournament Info - Mobile Optimized */}
            <div className="h-full bg-black px-3 md:px-6 flex items-center border-r border-zinc-800 shadow-[10px_0_20px_rgba(0,0,0,1)] z-30 shrink-0 gap-3">
                <div className="flex flex-col items-end justify-center">
                    <div className="flex items-center gap-2 text-[#DFFF00] font-black text-[10px] uppercase tracking-widest">
                        <Activity size={12} className="animate-pulse" />
                        <span className="hidden md:inline">LIVE FEED</span>
                    </div>
                    {/* Hide tournament name on very small screens if needed, or truncate heavier */}
                    <span className="hidden md:inline text-[9px] text-zinc-500 font-mono uppercase max-w-[100px] truncate text-right">
                        {data.tournament.name}
                    </span>
                </div>
            </div>

            {/* 2. SCROLLING AREA */}
            <div className="flex-1 overflow-hidden h-full flex items-center relative z-10">
                <div className="flex animate-ticker hover:[animation-play-state:paused]">
                    {tickerItems.map((player, i) => (
                        <button 
                            key={`${player.id}-${i}`}
                            onClick={() => router.push(`/sports/golf/player/${player.id}`)}
                            // Responsive padding/gap
                            className="flex items-center gap-2 md:gap-4 px-3 md:px-6 border-r border-zinc-900 h-14 hover:bg-zinc-900/50 transition-colors shrink-0 group/item text-left"
                        >
                            {/* Rank */}
                            <span className="font-mono text-xs font-bold text-zinc-600 min-w-[20px] md:min-w-[24px]">
                                {player.rank}
                            </span>

                            {/* Avatar & Name */}
                            <div className="flex items-center gap-2 md:gap-3">
                                {player.image ? (
                                    <img src={player.image} alt={player.name} className="w-8 h-8 rounded-full border border-zinc-800 object-cover bg-zinc-900" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                                        <Flag size={12} className="text-zinc-600"/>
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-zinc-300 uppercase leading-none mb-1 group-hover/item:text-white transition-colors whitespace-nowrap">
                                        {player.name}
                                    </span>
                                    <span className="text-[9px] text-zinc-600 font-mono uppercase">
                                        Thru {player.thru}
                                    </span>
                                </div>
                            </div>

                            {/* Score */}
                            <div className={`flex flex-col items-end min-w-[30px] ${player.isUnderPar ? 'text-red-500' : 'text-zinc-400'}`}>
                                <span className="font-black font-mono text-sm leading-none">
                                    {player.score}
                                </span>
                                <span className="text-[9px] font-mono opacity-60">
                                    {player.today}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* 3. TAIL INFO (Hidden on mobile) */}
            <div className="hidden md:flex h-full bg-black px-4 items-center border-l border-zinc-800 z-30 shrink-0">
                 <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                     {/* Cast to any to fix missing property error */}
                     Defending: <span className="text-zinc-400">{(data.tournament as any).defendingChampion || '-'}</span>
                 </div>
            </div>
        </div>
    );
}