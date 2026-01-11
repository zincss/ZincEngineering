'use client';

import React from 'react';
import Marquee from 'react-fast-marquee';

export default function GolfLeaderboard({ data }: { data: any }) {
  if (!data || !data.leaderboard) return null;

  return (
    <div className="border-y border-zinc-800 bg-black/50 backdrop-blur-md relative z-40">
        <Marquee gradient={false} speed={40} className="py-3">
            {data.leaderboard.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 px-6 border-r border-zinc-800/50">
                    <span className="font-mono text-xs font-bold text-[#DFFF00]">{p.position}</span>
                    <div className="flex items-center gap-2">
                        {p.country && <img src={p.country} className="w-3 h-3 rounded-full opacity-70" />}
                        <span className="text-xs font-black uppercase text-white whitespace-nowrap">{p.name}</span>
                    </div>
                    <span className={`text-xs font-mono font-black ${p.toPar.includes('-') ? 'text-red-500' : p.toPar === 'E' ? 'text-zinc-500' : 'text-green-500'}`}>
                        {p.toPar}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-600">{p.thru}</span>
                </div>
            ))}
        </Marquee>
    </div>
  );
}
