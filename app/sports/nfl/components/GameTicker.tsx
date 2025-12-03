'use client';
import React from 'react';
import { Activity } from 'lucide-react';

export default function GameTicker({ scores }: { scores: any[] }) {
    if (!scores || scores.length === 0) return null;

    // Duplicate list for infinite scroll effect
    const tickerItems = [...scores, ...scores, ...scores]; 

    return (
        <div className="w-full bg-black/80 backdrop-blur-md border-b border-zinc-800 h-16 flex items-center z-20 relative overflow-hidden">
            <div className="h-full bg-black px-6 flex items-center border-r border-zinc-800 z-30 shrink-0">
                <div className="flex items-center gap-2 text-[#DFFF00] font-black text-[10px] uppercase tracking-widest">
                    <Activity size={14} className={scores.some(s => s.isLive) ? "animate-pulse" : ""} />
                    <span className="hidden md:inline">REDZONE WIRE</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden h-full flex items-center">
                <div className="flex animate-ticker hover:[animation-play-state:paused]">
                    {tickerItems.map((game, i) => (
                        <div key={`${game.id}-${i}`} className="flex items-center gap-6 px-8 border-r border-zinc-900 h-16 shrink-0 text-left">
                            <div className="flex flex-col items-center min-w-[60px]">
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${game.isLive ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                                    {game.status}
                                </span>
                                {game.isLive && <span className="text-[9px] font-mono text-zinc-300">{game.clock}</span>}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <img src={game.home.logo} className="w-6 h-6 object-contain" alt={game.home.code}/>
                                    <span className={`font-black text-sm ${parseInt(game.home.score) > parseInt(game.away.score) ? 'text-white' : 'text-zinc-400'}`}>
                                        {game.home.score}
                                    </span>
                                </div>
                                <span className="text-zinc-700 font-mono text-xs">vs</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-black text-sm ${parseInt(game.away.score) > parseInt(game.home.score) ? 'text-white' : 'text-zinc-400'}`}>
                                        {game.away.score}
                                    </span>
                                    <img src={game.away.logo} className="w-6 h-6 object-contain" alt={game.away.code}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}