'use client';

import React, { useState } from 'react';
// FIX: Import from the parent lib folder (../golf-api)
import { StatLeaderboard } from '../golf-api';
import { BarChart3, ChevronRight } from 'lucide-react';

export function SeasonLeaders({ data }: { data: StatLeaderboard[] }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!data || data.length === 0) return null;

  const activeCategory = data[activeTab];

  return (
    <div className="border border-zinc-800 bg-black h-full flex flex-col">
       {/* HEADER */}
       <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center text-[#DFFF00]">
                 <BarChart3 size={16} />
             </div>
             <div>
                 <h3 className="text-sm font-black text-white uppercase tracking-wider">Season Metrics</h3>
                 <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">2025 Campaign Leaders</p>
             </div>
          </div>
       </div>

       {/* CATEGORY TABS */}
       <div className="flex border-b border-zinc-800">
           {data.map((cat, idx) => (
               <button
                  key={cat.category}
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors border-r border-zinc-800 last:border-r-0 ${
                      activeTab === idx ? 'bg-[#DFFF00] text-black' : 'bg-black text-zinc-500 hover:text-white hover:bg-zinc-900'
                  }`}
               >
                  {cat.abbr}
               </button>
           ))}
       </div>

       {/* LEADERBOARD LIST */}
       <div className="flex-1 overflow-y-auto p-2">
           {activeCategory.leaders.map((leader, index) => (
               <div key={index} className="group flex items-center gap-4 p-3 hover:bg-zinc-900 border-b border-zinc-900 last:border-0 transition-colors">
                   
                   {/* RANK */}
                   <div className={`w-6 h-6 flex items-center justify-center font-black text-xs border ${index === 0 ? 'bg-white text-black border-white' : 'bg-zinc-950 text-zinc-600 border-zinc-800'}`}>
                       {leader.rank}
                   </div>

                   {/* NAME */}
                   <div className="flex-1">
                       <div className="text-xs font-bold text-zinc-200 group-hover:text-white uppercase tracking-tight">
                           {leader.name}
                       </div>
                       <div className="text-[9px] font-mono text-zinc-600 group-hover:text-[#DFFF00] flex items-center gap-1">
                           {leader.team} <span className="w-1 h-1 bg-zinc-700 rounded-full"></span> {activeCategory.category}
                       </div>
                   </div>

                   {/* VALUE */}
                   <div className="text-right">
                       <div className="text-sm font-black text-[#DFFF00] tabular-nums tracking-tighter">
                           {leader.value}
                       </div>
                   </div>
               </div>
           ))}
       </div>

       {/* FOOTER */}
       <div className="p-3 border-t border-zinc-800 bg-zinc-900/30">
          <button className="w-full py-2 border border-zinc-800 hover:border-[#DFFF00] text-[9px] font-mono text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              View Full Analytics <ChevronRight size={10} />
          </button>
       </div>
    </div>
  );
}