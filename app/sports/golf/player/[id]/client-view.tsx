'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, User, BarChart3, Shield, GraduationCap, MapPin, Calendar, Timer, History, Trophy, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getPlayerProfile, getPlayerGameLog } from '../../actions';

export default function PlayerPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
        if (!id) return;
        setLoading(true);
        try {
            const [profileData, gamesData] = await Promise.all([
                getPlayerProfile(id),
                getPlayerGameLog(id)
            ]);
            setData(profileData);
            setLogs(gamesData || []);
        } catch (e) {
            console.error("Failed to load player data", e);
        }
        setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !data) return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-xs uppercase tracking-widest animate-pulse">
         <Activity size={16} /> Retrieving Athlete Dossier...
      </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-[#DFFF00] selection:text-black font-sans">
        
        {/* --- HEADER --- */}
        <div className="relative border-b border-zinc-800 bg-zinc-900/20 overflow-hidden">
            <div className="absolute top-0 right-0 p-64 bg-[#DFFF00] blur-[200px] opacity-[0.03] rounded-full pointer-events-none"></div>
            
            <div className="max-w-[1600px] mx-auto pt-24 px-6 pb-12 relative z-10">
                <Link href="/sports/golf" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] mb-8 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors">
                    <ArrowLeft size={12} /> Return to Tour
                </Link>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-12">
                    {/* Headshot Circle - Holographic Ring */}
                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-[#DFFF00] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="w-48 h-48 md:w-64 md:h-64 bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-2xl overflow-hidden relative z-10 group-hover:border-[#DFFF00] transition-colors">
                            <img src={data.headshot} className="w-full h-full object-cover object-top pt-4 scale-110" alt={data.name} />
                        </div>
                        <div className={`absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${data.status === 'Active' ? 'bg-zinc-950 border-[#DFFF00] text-[#DFFF00]' : 'bg-red-950 border-red-500 text-red-500'}`}>
                            {data.status}
                        </div>
                    </div>

                    {/* Identity Block */}
                    <div className="text-center md:text-left flex-1 w-full">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-zinc-400 mb-4">
                             <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">{data.team} // PRO</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-8xl font-black uppercase text-white leading-none tracking-tighter mb-8">{data.name}</h1>
                        
                        {/* Quick Bio Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-zinc-800 pt-6">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-zinc-900 rounded border border-zinc-800"><Trophy size={14} className="text-[#DFFF00]"/></div>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Affiliation</span>
                                     <span className="font-mono text-sm font-bold text-white">{data.team || 'PGA'}</span>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-zinc-900 rounded border border-zinc-800"><User size={14} className="text-[#DFFF00]"/></div>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Role</span>
                                     <span className="font-mono text-sm font-bold text-white">Professional</span>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-zinc-900 rounded border border-zinc-800"><MapPin size={14} className="text-[#DFFF00]"/></div>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Position</span>
                                     <span className="font-mono text-sm font-bold text-white">Tour Athlete</span>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-zinc-900 rounded border border-zinc-800"><Shield size={14} className="text-[#DFFF00]"/></div>
                                 <div className="text-left">
                                     <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">ID</span>
                                     <span className="font-mono text-sm font-bold text-white">#{data.id}</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: BIO & INFO (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Dossier Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2">
                            <Activity size={14} className="text-[#DFFF00]" /> Personnel File
                        </h3>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Athlete Type</span>
                            <span className="text-xs font-bold text-white text-right">Golf Professional</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Status</span>
                            <span className={`text-xs font-bold text-right ${data.status === 'Active' ? 'text-[#DFFF00]' : 'text-zinc-400'}`}>{data.status}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Season Summary (Compact) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
                        <h3 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2">
                            <BarChart3 size={14} className="text-[#DFFF00]" /> Season Metrics
                        </h3>
                    </div>
                     {data.stats && data.stats.length > 0 ? (
                        <div className="grid grid-cols-2 gap-px bg-zinc-800 border-b border-zinc-800">
                            {data.stats.map((stat: any, i: number) => (
                                <div key={i} className="bg-zinc-900 p-4 hover:bg-zinc-800 transition-colors">
                                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.name}</div>
                                    <div className="text-xl font-mono font-bold text-white">{stat.displayValue}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-500 font-mono text-xs flex flex-col items-center gap-2">
                            <AlertCircle size={24} />
                            NO SEASON DATA AVAILABLE
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: EVENT LOG (8 cols) */}
            <div className="lg:col-span-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-full flex flex-col shadow-lg">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                         <h3 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2">
                            <History size={14} className="text-[#DFFF00]" /> Tournament History
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest px-2 py-1 bg-[#DFFF00]/10 rounded border border-[#DFFF00]/20">Recent Events</span>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left font-mono text-xs">
                            <thead>
                                <tr className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                                    <th className="p-4 font-black tracking-widest whitespace-nowrap">DATE</th>
                                    <th className="p-4 font-black tracking-widest whitespace-nowrap">EVENT</th>
                                    <th className="p-4 font-black tracking-widest whitespace-nowrap text-center">RESULT</th>
                                    <th className="p-4 font-black tracking-widest text-right text-white">SCORE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {logs && logs.length > 0 ? logs.map((game, i) => (
                                    <tr key={i} className="hover:bg-zinc-800 transition-colors group">
                                        <td className="p-4 text-zinc-400 whitespace-nowrap group-hover:text-white">{game.date}</td>
                                        <td className="p-4 font-bold text-zinc-300 uppercase whitespace-nowrap group-hover:text-white">{game.opponent}</td>
                                        <td className="p-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black ${game.result && (game.result === 'W' || game.result.includes('1')) ? 'bg-[#DFFF00] text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                                {game.result}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-[10px] font-bold text-zinc-400 group-hover:border-zinc-700 group-hover:text-white">
                                                {game.stats?.[0] || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-zinc-600 font-mono flex flex-col items-center gap-2">
                                            <History size={24} />
                                            NO RECENT EVENT DATA FOUND
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
