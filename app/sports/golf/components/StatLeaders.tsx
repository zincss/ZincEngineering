'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default function StatLeaders({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00]">
                <BarChart3 size={18} />
            </div>
            <h3 className="text-xl font-black uppercase text-white tracking-tight">Season Leaders</h3>
        </div>

        <div className="space-y-8">
            {(Object.entries(stats) as [string, any[]][]).map(([category, players]) => (
                <div key={category} className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
                    <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                        <span className="text-xs font-black text-white uppercase tracking-wider">{category}</span>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">Top 5</span>
                    </div>
                    <div>
                        {players.slice(0, 5).map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs text-zinc-600 w-4">{i + 1}</span>
                                    {p.headshot && <img src={p.headshot} className="w-6 h-6 rounded-full bg-zinc-950 object-cover" />}
                                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase transition-colors">{p.name}</span>
                                </div>
                                <span className="font-mono text-xs font-black text-[#DFFF00]">{p.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
