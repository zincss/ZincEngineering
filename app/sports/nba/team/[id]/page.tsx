// app/sports/nba/team/[id]/page.tsx
import React from 'react';
import { getTeamSnapshot } from '../../actions';
import { MapPin, Trophy, Calendar, ExternalLink, Database } from 'lucide-react';
import Link from 'next/link';

export default async function TeamPage({ params }: { params: { id: string } }) {
  const team = await getTeamSnapshot(params.id);

  if (!team) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono">DATA NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      
      {/* HEADER */}
      <div className="relative h-64 overflow-hidden border-b border-zinc-800">
         <div className="absolute inset-0 bg-zinc-900" style={{ backgroundColor: `#${team.color}20` }} />
         <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
         
         <div className="relative z-10 max-w-[1600px] mx-auto px-6 h-full flex items-end pb-8 gap-6">
             <div className="w-32 h-32 bg-zinc-950 border border-zinc-800 flex items-center justify-center p-4 rounded-xl shadow-2xl">
                <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
             </div>
             <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs uppercase mb-2">
                    <Database size={12} /> Snapshot ID: {team.id}
                </div>
                <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">{team.location} <span className="text-zinc-500">{team.name}</span></h1>
             </div>
         </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
         
         {/* INFO CARD */}
         <div className="bg-zinc-900/20 border border-zinc-800 p-6 space-y-6">
            <h3 className="text-xl font-black uppercase">Franchise Data</h3>
            <div className="space-y-4">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 text-xs font-mono uppercase">Record</span>
                    <span className="font-bold text-white">{team.record}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 text-xs font-mono uppercase">Standing</span>
                    <span className="font-bold text-white">{team.standing}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                     <span className="text-zinc-500 text-xs font-mono uppercase">Abbreviation</span>
                     <span className="font-bold text-[#DFFF00]">{team.abbr}</span>
                </div>
            </div>
         </div>

         {/* NEXT GAME */}
         {team.nextEvent && (
             <div className="bg-zinc-900/20 border border-zinc-800 p-6">
                 <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Calendar size={20} /> Next Event</h3>
                 <div className="text-center py-6 bg-zinc-900/50 border border-zinc-800">
                     <div className="text-xs font-mono text-zinc-500 mb-2">{new Date(team.nextEvent.date).toLocaleDateString()}</div>
                     <div className="text-3xl font-black uppercase text-white mb-2">
                         {team.abbr} <span className="text-zinc-600">vs</span> {team.nextEvent.opponent}
                     </div>
                     <div className="text-[10px] uppercase tracking-widest text-[#DFFF00] animate-pulse">Upcoming</div>
                 </div>
             </div>
         )}
         
      </div>
    </div>
  );
}