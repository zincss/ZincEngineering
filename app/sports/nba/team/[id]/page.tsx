// app/sports/nba/team/[id]/page.tsx
import React from 'react';
import { getTeamSnapshot } from '../../actions';
import { MapPin, Trophy, Calendar, ExternalLink, Database, Users } from 'lucide-react';
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

      <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
         
         {/* LEFT COL: INFO */}
         <div className="lg:col-span-1 space-y-6">
             {/* STATS */}
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

         {/* RIGHT COL: ROSTER */}
         <div className="lg:col-span-3">
             <div className="flex items-center gap-2 mb-6">
                 <Users size={16} className="text-[#DFFF00]" />
                 <h3 className="text-lg font-black uppercase text-white tracking-tight">Active Roster</h3>
             </div>
             
             {team.roster && team.roster.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                     {team.roster.map((player: any) => (
                         <Link href={`/sports/nba/player/${player.id}`} key={player.id} className="flex items-center gap-4 p-4 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 transition-colors group">
                             <div className="w-12 h-12 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                 <img src={player.headshot} alt={player.name} className="w-full h-full object-cover scale-110 pt-2" />
                             </div>
                             <div>
                                 <div className="text-[10px] font-mono text-zinc-500">#{player.jersey} • {player.pos} • {player.height}</div>
                                 <div className="font-bold text-sm uppercase text-white group-hover:text-[#DFFF00] transition-colors">{player.name}</div>
                             </div>
                         </Link>
                     ))}
                 </div>
             ) : (
                 <div className="p-12 border border-zinc-800 text-center text-zinc-600 font-mono text-xs">ROSTER DATA NOT AVAILABLE</div>
             )}
         </div>

      </div>
    </div>
  );
}