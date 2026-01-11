'use client';

import React from 'react';
import { Trophy, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TournamentCard({ data }: { data: any }) {
  if (!data) return null;

  const isActive = data.status === 'in';
  const isPost = data.status === 'post';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 relative overflow-hidden group">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full group-hover:bg-green-500/20 transition-all duration-700" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 text-[#DFFF00] shadow-lg">
                    <Trophy size={20} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isActive ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : isPost ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                    {isActive ? 'LIVE NOW' : isPost ? 'CONCLUDED' : 'UPCOMING'}
                </div>
           </div>
           
           <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2 leading-none">
              {data.name}
           </h2>
           
           <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-500">
              <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{data.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>{data.location}</span>
              </div>
              <div>
                  PURSE: <span className="text-white">{data.purse}</span>
              </div>
           </div>
        </div>

        {/* Top 3 Leaderboard Preview (if active/post) */}
        {(isActive || isPost) && data.leaderboard && (
            <div className="w-full md:w-auto min-w-[300px] bg-zinc-950/50 rounded-2xl border border-zinc-800 p-4">
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-3 pl-1">Leaderboard Top 3</div>
                <div className="space-y-2">
                    {data.leaderboard.slice(0, 3).map((p: any, i: number) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className={`font-mono font-bold w-4 text-center ${i===0 ? 'text-[#DFFF00]' : 'text-zinc-600'}`}>{p.position}</span>
                                {p.headshot && <img src={p.headshot} className="w-6 h-6 rounded-full bg-zinc-900 object-cover" />}
                                <span className="text-xs font-black uppercase text-white">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-xs">
                                <span className="text-zinc-500">{p.thru}</span>
                                <span className={`font-black ${p.toPar.includes('-') ? 'text-red-500' : p.toPar === 'E' ? 'text-zinc-400' : 'text-green-500'}`}>{p.toPar}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
