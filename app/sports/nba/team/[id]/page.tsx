'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar, Trophy, Activity, MapPin } from 'lucide-react';
import { getTeamData } from '../../actions';

export default function TeamPage({ params }: { params: { id: string } }) {
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    getTeamData(params.id).then(setTeam);
  }, [params.id]);

  if (!team) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">LOADING TEAM DATA...</div>;

  return (
    <div className="min-h-screen bg-black pb-20">
       <div className="relative h-64 overflow-hidden">
           <div className="absolute inset-0 opacity-20" style={{ backgroundColor: team.color }}></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
           <div className="absolute bottom-0 left-0 p-8 w-full max-w-[1600px] mx-auto flex items-end gap-6">
               <div className="w-32 h-32 bg-black border-2 border-zinc-800 p-4 flex items-center justify-center shadow-2xl relative z-10">
                   <img src={team.logo} className="w-full h-full object-contain" />
               </div>
               <div className="mb-2">
                   <h1 className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter leading-none">{team.name}</h1>
                   <div className="flex gap-4 mt-2 text-zinc-400 font-mono text-xs font-bold uppercase">
                       <span>{team.record}</span>
                       <span className="text-zinc-600">|</span>
                       <span>{team.standing}</span>
                   </div>
               </div>
           </div>
       </div>

       <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8">
               <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800">
                   <Users size={16} className="text-[#DFFF00]"/>
                   <span className="text-xs font-black tracking-widest uppercase text-white">ACTIVE ROSTER</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {team.roster.map((p: any) => (
                       <Link href={`/sports/nba/player/${p.id}`} key={p.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 hover:border-[#DFFF00] transition-all group">
                           <img src={p.headshot} className="w-12 h-12 rounded-full bg-black object-cover object-top border border-zinc-700" />
                           <div>
                               <h4 className="text-sm font-black text-white uppercase group-hover:text-[#DFFF00] transition-colors">{p.name}</h4>
                               <div className="text-[10px] font-mono text-zinc-500 uppercase">#{p.number} • {p.pos} • {p.height}</div>
                           </div>
                       </Link>
                   ))}
               </div>
           </div>

           <div className="lg:col-span-4">
               {team.nextGame && (
                   <div className="bg-zinc-900 border border-zinc-800 p-6 mb-8">
                       <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
                           <Calendar size={16} className="text-[#DFFF00]"/>
                           <span className="text-xs font-black tracking-widest uppercase text-white">NEXT MATCHUP</span>
                       </div>
                       <div className="text-center">
                           <div className="text-2xl font-black text-white uppercase mb-2">{team.nextGame.name}</div>
                           <div className="text-xs font-mono text-zinc-500">{new Date(team.nextGame.date).toLocaleString()}</div>
                       </div>
                   </div>
               )}
               <Link href="/sports/nba" className="block w-full text-center py-4 border border-zinc-800 hover:bg-[#DFFF00] hover:text-black hover:border-[#DFFF00] transition-colors text-xs font-black uppercase tracking-widest text-zinc-500">
                   RETURN TO HUB
               </Link>
           </div>
       </div>
    </div>
  );
}