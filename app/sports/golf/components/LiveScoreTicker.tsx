'use client';

import React from 'react';
import { Activity } from 'lucide-react';

export default function LiveScoreTicker({ data, status }: { data: any[], status: string }) {
  if (!data || data.length === 0) return null;

  const loopData = [...data, ...data, ...data];

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800 h-14 flex items-center overflow-hidden relative z-20">
        <div className="h-full px-6 flex items-center gap-3 bg-zinc-950 border-r border-zinc-800 z-30 shrink-0 shadow-[10px_0_20px_rgba(0,0,0,1)]">
            <div className={`w-2 h-2 rounded-full ${status === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-[#DFFF00]'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {status === 'LIVE' ? 'LIVE LEADERBOARD' : 'FINAL RESULTS'}
            </span>
        </div>

        <div className="flex animate-ticker hover:[animation-play-state:paused]">
            {loopData.map((p, i) => (
                <div key={`${p.pos}-${p.name}-${i}`} className="flex items-center px-8 border-r border-zinc-900 h-14 shrink-0 gap-4 group cursor-default hover:bg-zinc-900/50 transition-colors">
                    <span className={`text-sm font-mono font-black ${i < 3 ? 'text-[#DFFF00]' : 'text-zinc-600'}`}>
                        {p.pos}
                    </span>
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-white uppercase leading-none mb-0.5 whitespace-nowrap group-hover:text-[#DFFF00] transition-colors">
                            {p.name}
                        </span>
                        <div className="flex gap-2">
                             <span className={`text-[10px] font-mono font-bold ${p.score.includes('-') ? 'text-red-500' : p.score === 'E' ? 'text-zinc-400' : 'text-white'}`}>
                                TOT: {p.score}
                            </span>
                            {status === 'LIVE' && (
                                <span className="text-[10px] font-mono text-zinc-600">
                                    THRU: {p.thru}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}