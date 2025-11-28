'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
// Importing the NEW rich profile fetcher
import { getPlayerProfile, RichGolferProfile } from '../../lib/golf-api';
import { ChevronLeft, TrendingUp, Target, Activity, Calendar, Trophy, Zap, Info, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PlayerProfile() {
  const params = useParams();
  const [player, setPlayer] = useState<RichGolferProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
        setLoading(true);
        getPlayerProfile(params.id as string)
          .then((data) => {
            setPlayer(data || null);
            setLoading(false);
          })
          .catch((err) => {
             console.error(err);
             setLoading(false);
          });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#DFFF00] font-mono text-xs gap-2">
        <Loader2 className="animate-spin" size={16} /> ACCESSING SECURE ARCHIVES...
      </div>
    );
  }

  if (!player) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 font-mono text-xs gap-4">
            <span>PLAYER NOT FOUND IN ARCHIVES</span>
            <Link href="/sports/golf" className="text-[#DFFF00] hover:underline">RETURN TO HUB</Link>
        </div>
    );
  }

  // Helper for Form Guide Colors
  const getPosColor = (pos: string) => {
      if (pos === "1") return "bg-[#DFFF00] text-black border-[#DFFF00]";
      if (pos.startsWith("T1")) return "bg-[#DFFF00] text-black border-[#DFFF00]";
      if (pos === "MC") return "bg-red-900/50 text-red-500 border-red-900";
      if (parseInt(pos.replace('T', '')) <= 10) return "bg-zinc-800 text-white border-zinc-700";
      return "bg-black text-zinc-500 border-zinc-800";
  };

  return (
    <div className="min-h-screen bg-black pb-20">
        
        {/* --- NAV STRIP --- */}
        <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4 flex items-center justify-between sticky top-[80px] z-30 backdrop-blur-md">
            <Link href="/sports/golf" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] font-mono text-[10px] uppercase tracking-widest transition-colors">
                <ChevronLeft size={12} /> Command Center
            </Link>
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
                <span className="text-zinc-500">Global Rank</span>
                <span className="bg-[#DFFF00] text-black px-2 py-0.5 font-black">#{player.rank}</span>
            </div>
        </div>

        {/* --- HERO PROFILE --- */}
        <div className="relative border-b border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-zinc-900 to-transparent opacity-50"></div>
            
            <div className="max-w-[1600px] mx-auto px-6 py-12 md:py-20 relative z-10 flex flex-col md:flex-row gap-8 md:items-end justify-between">
                
                {/* ID CARD */}
                <div className="flex items-start gap-6 md:gap-8">
                    {/* Headshot / Avatar */}
                    <div className="w-24 h-24 md:w-40 md:h-40 border border-zinc-700 bg-zinc-900 relative flex-shrink-0">
                        {player.image ? (
                            <img src={player.image} alt={player.name} className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                <Zap size={40} />
                            </div>
                        )}
                        <div className="absolute -bottom-3 -right-3 bg-black border border-zinc-700 px-3 py-1">
                            <span className="text-2xl md:text-3xl font-black text-white">{player.country}</span>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-2">
                            {player.name.split(' ')[0]}<br/>
                            <span className="text-zinc-500">{player.name.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 md:gap-8 mt-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                            <span className="flex items-center gap-2"><MapPin size={12} /> {player.bio.college}</span>
                            <span className="w-px h-3 bg-zinc-700"></span>
                            <span>{player.bio.height} // {player.bio.weight}</span>
                            <span className="w-px h-3 bg-zinc-700"></span>
                            <span>PRO SINCE {player.bio.turnedPro}</span>
                        </div>
                    </div>
                </div>

                {/* STATS SUMMARY */}
                <div className="grid grid-cols-2 gap-8 text-right">
                    <div>
                        <div className="text-3xl md:text-5xl font-black text-[#DFFF00] tabular-nums tracking-tighter">{player.points}</div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">OWGR Points</div>
                    </div>
                    <div>
                        <div className="text-3xl md:text-5xl font-black text-white tabular-nums tracking-tighter">{player.events_played}</div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Events Played</div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- MAIN DASHBOARD --- */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COL 1: RECENT FORM (Visual Ticker) */}
            <div className="lg:col-span-1 space-y-8">
                
                {/* Form Guide */}
                <div className="border border-zinc-800 bg-zinc-900/30 p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <TrendingUp size={16} className="text-[#DFFF00]" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Recent Form</h3>
                    </div>
                    <div className="space-y-3">
                        {player.recentResults.map((res, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-zinc-300 uppercase truncate max-w-[150px] group-hover:text-[#DFFF00] transition-colors">{res.eventName}</span>
                                    <span className="text-[9px] font-mono text-zinc-600">{res.date}</span>
                                </div>
                                <div className={`px-3 py-1 border text-[10px] font-black font-mono w-12 text-center ${getPosColor(res.position)}`}>
                                    {res.position}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bag Check (Hardware) */}
                <div className="border border-zinc-800 bg-zinc-900/30 p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <Zap size={16} className="text-zinc-500" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Hardware</h3>
                    </div>
                    <div className="space-y-4 font-mono text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 uppercase">Driver</span>
                            <span className="text-zinc-300 text-right">{player.bio.bag.driver}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 uppercase">Irons</span>
                            <span className="text-zinc-300 text-right">{player.bio.bag.irons}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 uppercase">Putter</span>
                            <span className="text-zinc-300 text-right">{player.bio.bag.putter}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 uppercase">Ball</span>
                            <span className="text-zinc-300 text-right">{player.bio.bag.ball}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* COL 2 & 3: PERFORMANCE METRICS */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Advanced Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Stat 1 */}
                    <div className="border border-zinc-800 bg-black p-6 hover:border-[#DFFF00] transition-colors group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 bg-zinc-900 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Power</span>
                                <Activity size={14} className="text-zinc-700 group-hover:text-[#DFFF00]" />
                            </div>
                            <div className="text-4xl font-black text-white group-hover:text-[#DFFF00] transition-colors">{player.stats.driving_dist.toFixed(1)}</div>
                            <div className="text-[10px] font-mono text-zinc-600 mt-1">AVG DRIVE (YDS)</div>
                            
                            {/* Visual Bar */}
                            <div className="w-full h-1 bg-zinc-900 mt-4 overflow-hidden">
                                <div className="h-full bg-[#DFFF00]" style={{ width: `${(player.stats.driving_dist / 350) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="border border-zinc-800 bg-black p-6 hover:border-[#DFFF00] transition-colors group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 bg-zinc-900 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Precision</span>
                                <Target size={14} className="text-zinc-700 group-hover:text-[#DFFF00]" />
                            </div>
                            <div className="text-4xl font-black text-white group-hover:text-[#DFFF00] transition-colors">{player.stats.gir_pct.toFixed(1)}%</div>
                            <div className="text-[10px] font-mono text-zinc-600 mt-1">GIR PERCENTAGE</div>
                            
                            {/* Visual Bar */}
                            <div className="w-full h-1 bg-zinc-900 mt-4 overflow-hidden">
                                <div className="h-full bg-[#DFFF00]" style={{ width: `${player.stats.gir_pct}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="border border-zinc-800 bg-black p-6 hover:border-[#DFFF00] transition-colors group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 bg-zinc-900 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Putting</span>
                                <TrendingUp size={14} className="text-zinc-700 group-hover:text-[#DFFF00]" />
                            </div>
                            <div className="text-4xl font-black text-white group-hover:text-[#DFFF00] transition-colors">{player.stats.putting_avg.toFixed(2)}</div>
                            <div className="text-[10px] font-mono text-zinc-600 mt-1">AVG PUTTS / HOLE</div>
                            
                            {/* Visual Bar (Inverse better) */}
                            <div className="w-full h-1 bg-zinc-900 mt-4 overflow-hidden">
                                <div className="h-full bg-[#DFFF00]" style={{ width: `${(2 / player.stats.putting_avg) * 80}%` }}></div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Season Log Table */}
                <div className="border border-zinc-800 bg-zinc-900/20 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-[#DFFF00]" />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Tournament Log</h3>
                        </div>
                        <button className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2">
                            Full Season <ChevronLeft className="rotate-180" size={10}/>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest border-b border-zinc-800">
                                    <th className="pb-3 pl-2">Date</th>
                                    <th className="pb-3">Event</th>
                                    <th className="pb-3 text-center">Pos</th>
                                    <th className="pb-3 text-center">Score</th>
                                    <th className="pb-3 text-right pr-2">Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-mono">
                                {player.recentResults.map((res, i) => (
                                    <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors group">
                                        <td className="py-4 pl-2 text-zinc-500">{res.date}</td>
                                        <td className="py-4 font-bold text-zinc-300 group-hover:text-white">{res.eventName}</td>
                                        <td className="py-4 text-center">
                                            <span className={`px-2 py-1 text-[10px] font-black border ${getPosColor(res.position)}`}>
                                                {res.position}
                                            </span>
                                        </td>
                                        <td className={`py-4 text-center ${res.score.includes('-') ? 'text-[#DFFF00]' : 'text-zinc-500'}`}>{res.score}</td>
                                        <td className="py-4 text-right pr-2 text-zinc-400">{res.earnings}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}