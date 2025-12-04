'use client';

import React from 'react';
import { Globe, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';

export default function OWGRCards({ rankings }: { rankings: any[] }) {
  // Display Top 8 in the grid
  const topRankings = rankings.slice(0, 8); 

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
            <Globe size={16} className="text-[#DFFF00]"/>
            <h3 className="font-black text-sm uppercase text-white tracking-widest">WORLD RANKINGS (OWGR)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topRankings.map((r) => (
                <div key={r.rank} className="group relative h-72 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#DFFF00] transition-all duration-300 flex flex-col shadow-lg">
                    
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/20 to-zinc-950 z-0"></div>
                    
                    {/* Massive Rank Watermark */}
                    <div className="absolute top-[-10px] right-2 text-[100px] font-black text-zinc-800/40 z-0 leading-none select-none group-hover:text-zinc-800/60 transition-colors pointer-events-none">
                        {r.rank}
                    </div>

                    {/* Top Badges */}
                    <div className="relative z-10 p-4 flex justify-between items-start">
                        {r.rank === 1 && (
                            <div className="inline-flex items-center gap-1 bg-[#DFFF00] text-black px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm shadow-[0_0_15px_rgba(223,255,0,0.4)]">
                                <Crown size={10} /> No.1
                            </div>
                        )}
                    </div>

                    {/* Player Image - Centered/Bottom */}
                    <div className="absolute inset-x-0 bottom-16 top-4 z-10 flex items-end justify-center">
                        {r.image ? (
                            <img 
                                src={r.image} 
                                alt={r.name} 
                                className="h-[115%] w-auto object-contain object-bottom drop-shadow-2xl group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 ease-out will-change-transform" 
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center opacity-10">
                                <Globe size={64} />
                            </div>
                        )}
                    </div>

                    {/* Bottom Info Plate (Glassmorphism) */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
                        <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-3 rounded-xl shadow-lg group-hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-[9px] text-zinc-500 font-bold uppercase mb-0.5 tracking-wider">
                                        PTS: <span className="text-zinc-300">{r.points}</span>
                                    </div>
                                    <div className="text-sm font-black text-white uppercase leading-none truncate max-w-[120px] group-hover:text-[#DFFF00] transition-colors">
                                        {r.name}
                                    </div>
                                </div>
                                
                                {/* Trend Indicator */}
                                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                                    {r.trend === 'up' ? <TrendingUp size={12} className="text-[#DFFF00]"/> : 
                                     r.trend === 'down' ? <TrendingDown size={12} className="text-red-500"/> : 
                                     <Minus size={12} className="text-zinc-600"/>}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            ))}
        </div>
    </div>
  );
}