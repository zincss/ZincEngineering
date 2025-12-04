'use client';

import React from 'react';
import { BarChart3, ArrowUpRight } from 'lucide-react';

export default function StatGrid({ stats }: { stats: any[] }) {
  if (!stats) return null;

  return (
    <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800">
            <BarChart3 size={16} className="text-[#DFFF00]"/>
            <h3 className="font-black text-sm uppercase text-white tracking-widest">2025 SEASON LEADERS</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
            {stats.map((s, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 flex flex-col justify-between group hover:border-[#DFFF00] transition-all hover:-translate-y-1">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</span>
                            <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-[#DFFF00] transition-colors"/>
                        </div>
                        <div className="text-lg font-black text-white uppercase leading-tight mb-1 group-hover:text-[#DFFF00] transition-colors break-words">
                            {s.value}
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-end">
                        <span className="text-2xl font-mono font-bold text-white tracking-tighter">{s.sub}</span>
                        <span className="text-[9px] font-bold font-mono text-black bg-[#DFFF00] px-1.5 py-0.5 uppercase">{s.trend}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}