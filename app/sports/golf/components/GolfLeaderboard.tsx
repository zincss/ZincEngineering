// app/sports/golf/components/LiveLeaderboard.tsx
'use client';

import React from 'react';
import { User, TrendingUp } from 'lucide-react';

export default function LiveLeaderboard({ data }: { data: any[] }) {
  if (!data || data.length === 0) return (
    <div className="p-12 text-center border border-zinc-800 bg-zinc-900/50">
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">NO ACTIVE TELEMETRY</span>
    </div>
  );

  return (
    <div className="border border-zinc-800 bg-zinc-900/30">
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="font-black text-sm uppercase text-white tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-[#DFFF00]"/> Live Scoring
            </h3>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">TOP 15</span>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
                <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-widest text-[9px]">
                    <tr>
                        <th className="p-4 w-16">Pos</th>
                        <th className="p-4">Athlete</th>
                        <th className="p-4 text-center">Total</th>
                        <th className="p-4 text-center hidden md:table-cell">Today</th>
                        <th className="p-4 text-right">Thru</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {data.map((p, i) => (
                        <tr key={i} className="hover:bg-zinc-800/50 transition-colors group">
                            <td className={`p-4 font-black ${i < 3 ? 'text-[#DFFF00]' : 'text-zinc-500'}`}>
                                {p.pos}
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    {p.image ? (
                                        <img src={p.image} className="w-8 h-8 rounded-full bg-zinc-800 object-cover border border-zinc-700" alt={p.name}/>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                            <User size={14} className="text-zinc-500"/>
                                        </div>
                                    )}
                                    <span className="font-bold text-zinc-300 group-hover:text-white uppercase transition-colors">
                                        {p.name}
                                    </span>
                                </div>
                            </td>
                            <td className={`p-4 text-center font-bold ${p.score.includes('-') ? 'text-red-500' : p.score === 'E' ? 'text-zinc-400' : 'text-white'}`}>
                                {p.score}
                            </td>
                            <td className="p-4 text-center hidden md:table-cell text-zinc-500">
                                {p.today}
                            </td>
                            <td className="p-4 text-right text-zinc-400">
                                {p.thru}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}