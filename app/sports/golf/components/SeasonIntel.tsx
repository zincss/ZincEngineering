// app/sports/golf/components/SeasonIntel.tsx
'use client';

import React from 'react';
import { Globe, Calendar, Crown, ArrowRight, Activity } from 'lucide-react';

export default function SeasonIntel({ rankings, schedule }: { rankings: any[], schedule: any[] }) {
  return (
    <div className="space-y-8">
        
        {/* GLOBAL RANKINGS */}
        <div className="border border-zinc-800 bg-zinc-900/30">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                <Globe size={14} className="text-[#DFFF00]" />
                <span className="font-black text-xs text-white uppercase tracking-widest">World Rankings (OWGR)</span>
            </div>
            <div className="divide-y divide-zinc-800">
                {rankings.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-zinc-900 transition-colors group">
                        <div className="flex items-center gap-4">
                            <span className={`font-mono text-sm font-black w-6 text-center ${i < 3 ? 'text-[#DFFF00]' : 'text-zinc-600'}`}>{r.rank}</span>
                            <div className="flex items-center gap-3">
                                {r.image && <img src={r.image} className="w-6 h-6 rounded-full bg-zinc-800 object-cover" />}
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase transition-colors">{r.name}</span>
                            </div>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500">PTS: {r.points}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* UPCOMING SCHEDULE */}
        <div className="border border-zinc-800 bg-zinc-900/30">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                <Calendar size={14} className="text-[#DFFF00]" />
                <span className="font-black text-xs text-white uppercase tracking-widest">Upcoming Operations</span>
            </div>
            <div className="divide-y divide-zinc-800">
                {schedule.map((evt, i) => (
                    <div key={i} className="p-4 hover:bg-zinc-900 transition-colors group">
                        <div className="flex justify-between mb-1">
                            <span className="text-[9px] font-mono text-[#DFFF00] uppercase tracking-widest">{evt.date}</span>
                            <span className="text-[9px] font-mono text-zinc-600 uppercase">DEF: {evt.def}</span>
                        </div>
                        <div className="font-black text-sm text-white uppercase mb-1 group-hover:text-[#DFFF00] transition-colors">{evt.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase">{evt.course}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* STAT LEADERS TEASER (Static for Design Parity if API lacks depth) */}
        <div className="bg-[#DFFF00] p-6 text-black relative overflow-hidden group cursor-pointer">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                <Activity size={140} />
            </div>
            <h3 className="font-black text-2xl uppercase leading-none mb-2">Stat Center</h3>
            <p className="font-mono text-xs font-bold opacity-70 mb-4 max-w-[200px]">Access detailed driving, putting, and scoring analytics.</p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                View Database <ArrowRight size={12}/>
            </div>
        </div>

    </div>
  );
}