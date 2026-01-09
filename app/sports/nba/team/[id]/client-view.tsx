'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, Users, MapPin, Trophy, Calendar, Shield, Swords } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getTeamSnapshot } from '../../actions';

export default function TeamPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
        if (!id) return;
        setLoading(true);
        try {
            const teamData = await getTeamSnapshot(id);
            setData(teamData);
        } catch (e) {
            console.error("Failed to load team data", e);
        }
        setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !data) return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-xs uppercase tracking-widest animate-pulse">
         <Activity size={16} /> Retrieving Team Dossier...
      </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-[#DFFF00] selection:text-black font-sans">
        
        {/* --- HEADER --- */}
        <div className="relative border-b border-zinc-800 bg-zinc-900/20 overflow-hidden">
            <div className="absolute top-0 right-0 p-64 bg-[#DFFF00] blur-[200px] opacity-[0.03] rounded-full pointer-events-none"></div>
            
            <div className="max-w-[1600px] mx-auto pt-24 px-6 pb-12 relative z-10">
                <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] mb-8 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors">
                    <ArrowLeft size={12} /> Return to Nexus
                </Link>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-12">
                    {/* Logo Circle */}
                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-[#DFFF00] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="w-48 h-48 md:w-64 md:h-64 bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-2xl flex items-center justify-center relative z-10 group-hover:border-[#DFFF00] transition-colors p-8">
                            <img src={data.logo} className="w-full h-full object-contain" alt={data.name} />
                        </div>
                    </div>

                    {/* Identity Block */}
                    <div className="text-center md:text-left flex-1 w-full">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-zinc-400 mb-4">
                             <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#DFFF00]">{data.abbr} // {data.location}</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-8xl font-black uppercase text-white leading-none tracking-tighter mb-8">{data.nickname}</h1>
                        
                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-zinc-800 pt-6">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-zinc-900 rounded border border-zinc-800"><Trophy size={14} className="text-[#DFFF00]"/></div>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Record</span>
                                     <span className="font-mono text-sm font-bold text-white">{data.record}</span>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-zinc-900 rounded border border-zinc-800"><Shield size={14} className="text-[#DFFF00]"/></div>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Standing</span>
                                     <span className="font-mono text-sm font-bold text-white">{data.standing}</span>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-zinc-900 rounded border border-zinc-800"><MapPin size={14} className="text-[#DFFF00]"/></div>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Venue</span>
                                     <span className="font-mono text-sm font-bold text-white truncate max-w-[150px]">{data.stadium}</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: SCHEDULE & INFO (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Recent Form */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2">
                            <Swords size={14} className="text-[#DFFF00]" /> Recent Operations
                        </h3>
                    </div>
                    <div className="divide-y divide-zinc-800/50">
                        {data.recentGames && data.recentGames.length > 0 ? data.recentGames.map((game: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 flex items-center justify-center rounded font-black text-[10px] ${game.result === 'W' ? 'bg-[#DFFF00] text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                        {game.result}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-mono text-zinc-500">{game.date}</div>
                                        <div className="text-xs font-bold text-white flex items-center gap-2">
                                            <span className="text-zinc-500">vs</span> {game.opponent}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-mono text-sm font-bold text-white">{game.score}</div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-zinc-600 text-xs font-mono">NO RECENT DATA</div>
                        )}
                    </div>
                </div>

                {/* Next Event */}
                {data.nextEvent && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
                            <h3 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2">
                                <Calendar size={14} className="text-[#DFFF00]" /> Next Objective
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="text-lg font-black uppercase text-white mb-1">{data.nextEvent.shortName}</div>
                            <div className="text-xs font-mono text-[#DFFF00]">{data.nextEvent.date}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: ROSTER (8 cols) */}
            <div className="lg:col-span-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-full flex flex-col shadow-lg">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                         <h3 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2">
                            <Users size={14} className="text-[#DFFF00]" /> Active Roster
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{data.roster?.length || 0} Operatives</span>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[800px] overflow-y-auto custom-scrollbar">
                        {data.roster && data.roster.map((p: any) => (
                            <Link href={`/sports/nba/player/${p.id}`} key={p.id} className="group flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[#DFFF00] transition-colors">
                                <img src={p.headshot} className="w-10 h-10 rounded-full bg-zinc-900 object-cover border border-zinc-800" alt={p.name} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-white uppercase truncate group-hover:text-[#DFFF00] transition-colors">{p.name}</div>
                                    <div className="text-[10px] font-mono text-zinc-500">#{p.jersey} • {p.pos} • {p.exp}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}