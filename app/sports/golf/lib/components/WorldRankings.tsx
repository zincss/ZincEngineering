'use client';

import React from 'react';
// FIX: Point directly to the parent folder
import { Golfer } from '../golf-api';
import { ChevronUp, ChevronDown, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function WorldRankings({ data }: { data: Golfer[] }) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-xl font-black uppercase text-white tracking-tighter">OWGR // TOP 5</h3>
         <span className="text-[10px] font-mono text-zinc-500">UPDATED: T-MINUS 4HR</span>
      </div>

      <div className="space-y-2">
         <div className="grid grid-cols-12 gap-2 text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-2 px-2">
             <div className="col-span-1">Rank</div>
             <div className="col-span-1">Mov</div>
             <div className="col-span-6">Athlete</div>
             <div className="col-span-2 text-right">Avg Pts</div>
             <div className="col-span-2 text-right">Events</div>
         </div>

         {data.map((golfer) => (
            <Link href={`/sports/golf/player/${golfer.id}`} key={golfer.id} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer group">
                <div className="col-span-1 font-black text-lg text-white group-hover:text-[#DFFF00]">{golfer.rank}</div>
                
                <div className="col-span-1 flex items-center justify-center">
                    {golfer.movement > 0 && <ChevronUp size={14} className="text-[#DFFF00]" />}
                    {golfer.movement < 0 && <ChevronDown size={14} className="text-red-500" />}
                    {golfer.movement === 0 && <Minus size={14} className="text-zinc-600" />}
                </div>

                <div className="col-span-6 flex flex-col justify-center">
                    <span className="font-bold text-xs text-zinc-200 uppercase tracking-tight">{golfer.name}</span>
                    <span className="text-[9px] font-mono text-zinc-500">{golfer.country}</span>
                </div>

                <div className="col-span-2 text-right font-mono text-xs text-[#DFFF00]">{golfer.points}</div>
                <div className="col-span-2 text-right font-mono text-xs text-zinc-400">{golfer.events_played}</div>
            </Link>
         ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button className="text-[10px] font-black uppercase flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
              FULL DATABASE <ArrowRight size={12} />
          </button>
      </div>
    </div>
  );
}