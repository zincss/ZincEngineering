'use client';
import React from 'react';
import Marquee from 'react-fast-marquee';

export default function GameTicker({ scores }: { scores: any[] }) {
    if (!scores || scores.length === 0) return null;

    return (
      <div className="relative w-full bg-[#DFFF00] py-1.5 overflow-hidden flex items-center z-30 shadow-2xl">
        <div className="w-full">
          <Marquee gradient={false} speed={50} className="flex items-center h-full">
             {scores.map((game, i) => (
               <div key={`${game.id}-${i}`} className="flex items-center gap-4 mx-6 select-none">
                  {/* SEPARATOR */}
                  <span className="text-black/30 text-[10px] font-black italic">//</span>

                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-black italic">
                        <span className="flex gap-3 items-center">
                           <span className="opacity-40">{game.status}</span>
                           <span className="flex items-center gap-2">
                               <img src={game.home.logo} className="w-4 h-4 object-contain" alt={game.home.code}/>
                               {game.home.score}
                           </span>
                           <span className="opacity-40">-</span>
                           <span className="flex items-center gap-2">
                               {game.away.score}
                               <img src={game.away.logo} className="w-4 h-4 object-contain" alt={game.away.code}/>
                           </span>
                           {game.isLive && (
                              <span className="flex items-center gap-1.5 bg-black text-[#DFFF00] px-2 py-0.5 rounded-sm scale-90 origin-left not-italic tracking-normal">
                                 <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                 LIVE
                              </span>
                           )}
                        </span>
                  </div>
               </div>
             ))}
          </Marquee>
        </div>
      </div>
    );
}