// app/sports/nba/player/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, User, BarChart3, Shield, GraduationCap, MapPin, Calendar, Timer, History } from 'lucide-react';
import { getPlayerProfile, getPlayerGameLog } from '../../actions';

export default function PlayerPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
        setLoading(true);
        try {
            const [profileData, gamesData] = await Promise.all([
                getPlayerProfile(params.id),
                getPlayerGameLog(params.id)
            ]);
            setData(profileData);
            setLogs(gamesData || []);
        } catch (e) {
            console.error("Failed to load player data", e);
        }
        setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading || !data) return (
      <div className="min-h-screen bg-black flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-xs uppercase tracking-widest animate-pulse">
         <Activity size={16} /> Retrieving Player Dossier...
      </div>
  );

  return (
    <div className="min-h-screen bg-black pb-20 text-white selection:bg-[#DFFF00] selection:text-black">
        
        {/* --- HEADER --- */}
        <div className="relative border-b border-zinc-800 bg-zinc-900/20 overflow-hidden">
            <div className="absolute top-0 right-0 p-64 bg-[#DFFF00] blur-[200px] opacity-5 rounded-full pointer-events-none"></div>
            
            <div className="max-w-6xl mx-auto pt-12 px-6 pb-12 relative z-10">
                <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] mb-8 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors">
                    <ArrowLeft size={12} /> Database Search
                </Link>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                    {/* Headshot Circle */}
                    <div className="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-b from-zinc-800 to-black rounded-full border-4 border-zinc-900 shadow-2xl overflow-hidden relative shrink-0">
                        <img src={data.headshot} className="w-full h-full object-cover object-top scale-110 pt-4" alt={data.name} />
                    </div>

                    {/* Identity Block */}
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-zinc-400 mb-2">
                             <div className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded ${data.status === 'Active' ? 'bg-[#DFFF00] text-black' : 'bg-red-500 text-white'}`}>
                                {data.status}
                             </div>
                             {data.teamId ? (
                                <Link href={`/sports/nba/team/${data.teamId}`} className="font-mono text-xs font-bold tracking-[0.2em] uppercase hover:text-white transition-colors border-b border-zinc-800 hover:border-[#DFFF00]">
                                    {data.team} // #{data.number}
                                </Link>
                             ) : (
                                <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">{data.team} // #{data.number}</span>
                             )}
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black uppercase text-white leading-none tracking-tighter mb-4">{data.name}</h1>
                        
                        {/* Quick Bio Bar */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 border-t border-zinc-800 pt-4">
                             <div className="flex items-center gap-3">
                                 <Shield size={14} className="text-zinc-600"/>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Position</span>
                                     <span className="font-mono text-sm font-bold">{data.pos}</span>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <User size={14} className="text-zinc-600"/>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Height / Weight</span>
                                     <span className="font-mono text-sm font-bold">{data.height} • {data.weight}</span>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <Timer size={14} className="text-zinc-600"/>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Experience</span>
                                     <span className="font-mono text-sm font-bold">{data.experience} Yrs</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: BIO & INFO */}
            <div className="space-y-6">
                
                {/* 1. Dossier Card */}
                <div className="bg-zinc-900/30 border border-zinc-800 p-6">
                    <h3 className="text-sm font-black uppercase text-[#DFFF00] mb-6 flex items-center gap-2">
                        <User size={16} /> Dossier
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-800 text-zinc-500 shrink-0">
                                <GraduationCap size={14} />
                            </div>
                            <div>
                                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">College</div>
                                <div className="text-sm font-bold text-white leading-tight">{data.college || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-800 text-zinc-500 shrink-0">
                                <MapPin size={14} />
                            </div>
                            <div>
                                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Birthplace</div>
                                <div className="text-sm font-bold text-white leading-tight">{data.birthPlace || 'Unknown'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-800 text-zinc-500 shrink-0">
                                <Calendar size={14} />
                            </div>
                            <div>
                                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Age</div>
                                <div className="text-sm font-bold text-white leading-tight">{data.age ? `${data.age} Years Old` : 'N/A'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-800 text-zinc-500 shrink-0">
                                <Activity size={14} />
                            </div>
                            <div>
                                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Draft</div>
                                <div className="text-sm font-bold text-white leading-tight">{data.draft || 'Undrafted'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Season Summary (Compact) */}
                <div className="bg-zinc-900/30 border border-zinc-800 p-6">
                    <h3 className="text-sm font-black uppercase text-[#DFFF00] mb-6 flex items-center gap-2">
                        <BarChart3 size={16} /> Season Avg
                    </h3>
                     {data.stats && data.stats.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {data.stats.map((stat: any, i: number) => (
                                <div key={i} className="bg-black border border-zinc-800 p-3 text-center">
                                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.name}</div>
                                    <div className="text-xl font-mono font-bold text-white">{stat.displayValue}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-zinc-500 font-mono text-xs">NO SEASON DATA</div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: GAME LOG */}
            <div className="lg:col-span-2">
                <div className="bg-zinc-900/30 border border-zinc-800 h-full">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                         <h3 className="text-sm font-black uppercase text-[#DFFF00] flex items-center gap-2">
                            <History size={16} /> Recent Performance
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Last 5 Games</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                            <thead>
                                <tr className="bg-black text-zinc-500 border-b border-zinc-800">
                                    <th className="p-4 font-black tracking-widest whitespace-nowrap">DATE</th>
                                    <th className="p-4 font-black tracking-widest whitespace-nowrap">OPPONENT</th>
                                    <th className="p-4 font-black tracking-widest whitespace-nowrap">RESULT</th>
                                    <th className="p-4 font-black tracking-widest text-right">PTS</th>
                                    <th className="p-4 font-black tracking-widest text-right">REB</th>
                                    <th className="p-4 font-black tracking-widest text-right">AST</th>
                                    <th className="p-4 font-black tracking-widest text-right hidden md:table-cell">BLK</th>
                                    <th className="p-4 font-black tracking-widest text-right hidden md:table-cell">STL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {logs && logs.length > 0 ? logs.map((game, i) => (
                                    <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                                        <td className="p-4 text-zinc-400 whitespace-nowrap">{game.date}</td>
                                        <td className="p-4 font-bold text-white uppercase whitespace-nowrap">{game.opponent}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${game.result && game.result.startsWith('W') ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
                                                {game.result}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-white">{game.pts}</td>
                                        <td className="p-4 text-right text-zinc-300">{game.reb}</td>
                                        <td className="p-4 text-right text-zinc-300">{game.ast}</td>
                                        <td className="p-4 text-right text-zinc-500 hidden md:table-cell">{game.blk}</td>
                                        <td className="p-4 text-right text-zinc-500 hidden md:table-cell">{game.stl}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-zinc-600 font-mono">
                                            NO RECENT GAME DATA FOUND
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}