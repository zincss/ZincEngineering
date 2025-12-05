'use client';

import React from 'react';
import { TrendingUp, Crown, Target } from 'lucide-react';

export default function GolfStats({ stats, rankings }: { stats: any, rankings: any[] }) {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COL 1: OWGR RANKINGS */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-6 text-[#DFFF00]">
                <Crown size={16} />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">World Rankings (OWGR)</h3>
            </div>
            <div className="space-y-3">
                {rankings.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-black border border-zinc-800 hover:border-zinc-600 transition-colors group">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-zinc-500 text-xs w-6">#{r.rank}</span>
                            <div className="w-8 h-8 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                                <img src={r.headshot} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-bold text-white uppercase group-hover:text-[#DFFF00] transition-colors">{r.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{r.points} PTS</span>
                    </div>
                ))}
            </div>
        </div>

        {/* COL 2 & 3: STAT LEADERS */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(stats).map(([category, players]: [string, any], idx) => (
                <div key={idx} className="bg-zinc-900/30 border border-zinc-800 p-6">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <TrendingUp size={16} className="text-[#DFFF00]" />
                        <h3 className="text-sm font-black uppercase tracking-widest">{category} Leaders</h3>
                    </div>
                    
                    {/* Top Leader Big Card */}
                    {players[0] && (
                        <div className="flex items-center gap-4 bg-zinc-900 p-4 mb-4 border-l-2 border-[#DFFF00]">
                            <img src={players[0].headshot} className="w-16 h-16 object-cover bg-black rounded-full" />
                            <div>
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Current Leader</span>
                                <div className="text-lg font-black text-white uppercase leading-none mb-1">{players[0].name}</div>
                                <div className="text-xl font-mono font-bold text-[#DFFF00]">{players[0].value}</div>
                            </div>
                        </div>
                    )}

                    {/* List */}
                    <div className="space-y-1">
                        {players.slice(1, 5).map((p: any, i: number) => (
                            <div key={i} className="flex justify-between items-center px-3 py-2 border-b border-zinc-800 last:border-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-zinc-600">0{i+2}</span>
                                    <span className="text-xs font-bold text-zinc-300 uppercase">{p.name}</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-white">{p.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}