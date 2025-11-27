'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Info, Loader2, Ruler, Weight, Users, TrendingUp, Crosshair, Shield, Zap, Calendar, Award, Globe, Clock, FileText, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPlayerProfile } from '../../actions'; 
import { NBA_TEAMS } from '../../data';

export default function PlayerPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
          const profile = await getPlayerProfile(id as string);
          setData(profile);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-[#DFFF00]" size={40}/> 
        <span className="font-mono text-xs font-bold tracking-widest text-zinc-400 animate-pulse">DECRYPTING PLAYER BIOMETRICS...</span>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500 font-mono text-sm">
        PLAYER ARCHIVE NOT FOUND.
    </div>
  );

  const teamConfig = NBA_TEAMS.find(t => t.espnId === data.teamId) || NBA_TEAMS.find(t => t.name.includes(data.team)) || NBA_TEAMS[0];
  const teamColor = teamConfig.color;

  return (
    <div className="max-w-7xl mx-auto pb-40 px-4 md:px-0 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER NAV */}
      <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-[#DFFF00] px-4 py-2 mb-8 group transition-all font-mono font-black text-[10px] uppercase tracking-[0.2em] border border-zinc-200 dark:border-zinc-800 hover:border-black">
          <ArrowLeft size={12} /> TACTICAL ROSTER
      </Link>

      {/* HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-2 border-black dark:border-zinc-700 bg-zinc-900 shadow-[12px_12px_0px_0px_#DFFF00] mb-12 relative overflow-hidden">
          
          {/* LEFT: IMAGE */}
          <div className={`lg:col-span-5 relative h-[400px] lg:h-auto ${teamColor} overflow-hidden`}>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.3)_1px,transparent_1px),linear-gradient(-45deg,rgba(0,0,0,0.3)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="bg-black text-[#DFFF00] px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-[#DFFF00] shadow-sm">{data.team}</span>
                  <span className="bg-white text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">#{data.number}</span>
              </div>

              <img src={data.image} className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[90%] w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10 hover:scale-105 transition-transform duration-500" alt={data.name} />
          </div>

          {/* RIGHT: INFO */}
          <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-zinc-900 text-white relative">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Activity size={300} />
              </div>

              <div>
                  <div className="flex items-center gap-3 mb-2 text-zinc-400">
                      <Users size={16} />
                      <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">{data.pos} // {data.status}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-6">{data.name}</h1>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-700 pt-6">
                      <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">HEIGHT</span>
                          <span className="text-xl font-mono font-bold">{data.height}</span>
                      </div>
                      <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">WEIGHT</span>
                          <span className="text-xl font-mono font-bold">{data.weight}</span>
                      </div>
                      <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">AGE</span>
                          <span className="text-xl font-mono font-bold">{data.age}</span>
                      </div>
                      <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">EXP</span>
                          <span className="text-xl font-mono font-bold">{data.exp} YRS</span>
                      </div>
                  </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                  <div className="px-4 py-2 border border-zinc-700 bg-black/50 text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                      <Globe size={12} className="text-[#DFFF00]"/> {data.country}
                  </div>
                  <div className="px-4 py-2 border border-zinc-700 bg-black/50 text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                      <MapPin size={12} className="text-[#DFFF00]"/> {data.school}
                  </div>
                  <div className="px-4 py-2 border border-zinc-700 bg-black/50 text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                      <Award size={12} className="text-[#DFFF00]"/> DRAFT: {data.draft}
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COL 1: SEASON STATS */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* STAT CARDS */}
              <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black text-[#DFFF00] p-6 border-2 border-black dark:border-zinc-700 relative overflow-hidden group">
                      <div className="absolute top-2 right-2 opacity-20"><Crosshair size={40}/></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2 group-hover:text-white transition-colors">POINTS</span>
                      <span className="text-5xl font-black tracking-tighter">{data.stats.ppg}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-6 border-2 border-zinc-200 dark:border-zinc-700 relative overflow-hidden group">
                      <div className="absolute top-2 right-2 opacity-10"><Shield size={40}/></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">REBOUNDS</span>
                      <span className="text-5xl font-black tracking-tighter text-black dark:text-white">{data.stats.rpg}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-6 border-2 border-zinc-200 dark:border-zinc-700 relative overflow-hidden group">
                      <div className="absolute top-2 right-2 opacity-10"><Zap size={40}/></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">ASSISTS</span>
                      <span className="text-5xl font-black tracking-tighter text-black dark:text-white">{data.stats.apg}</span>
                  </div>
              </div>

              {/* GAME LOG */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 p-8">
                  <div className="flex items-center justify-between mb-6 border-b-2 border-black dark:border-zinc-800 pb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Clock size={16} /> RECENT PERFORMANCE</h3>
                      <span className="text-[9px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">LAST 5 GAMES</span>
                  </div>
                  
                  {data.gameLog.length > 0 ? (
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead>
                                  <tr className="text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                                      <th className="pb-3 pl-2">DATE</th>
                                      <th className="pb-3">OPPONENT</th>
                                      <th className="pb-3 text-center">RESULT</th>
                                      <th className="pb-3 text-right">PTS</th>
                                      <th className="pb-3 text-right">REB</th>
                                      <th className="pb-3 text-right">AST</th>
                                      <th className="pb-3 text-right pr-2">MIN</th>
                                  </tr>
                              </thead>
                              <tbody className="font-mono text-xs text-zinc-600 dark:text-zinc-300">
                                  {data.gameLog.map((g: any, i: number) => (
                                      <tr key={i} className="border-b border-zinc-50 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                                          <td className="py-3 pl-2 font-bold text-zinc-400">{g.date}</td>
                                          <td className="py-3 font-black text-black dark:text-white uppercase">{g.opponent}</td>
                                          <td className="py-3 text-center">
                                              <span className={`px-2 py-0.5 font-bold text-[9px] ${g.result === 'W' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{g.result}</span>
                                          </td>
                                          <td className="py-3 text-right font-black text-black dark:text-white group-hover:text-[#DFFF00] transition-colors">{g.pts}</td>
                                          <td className="py-3 text-right">{g.reb}</td>
                                          <td className="py-3 text-right">{g.ast}</td>
                                          <td className="py-3 text-right pr-2 text-zinc-400">{g.min}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  ) : (
                      <div className="py-8 text-center text-zinc-400 font-mono text-xs">NO GAME LOG DATA AVAILABLE.</div>
                  )}
              </div>
          </div>

          {/* COL 2: SCOUTING REPORT */}
          <div className="space-y-6">
               <div className="bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-zinc-400"><TrendingUp size={14} /> DEFENSIVE METRICS</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                             <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">STEALS</span>
                             <span className="font-black text-sm">{data.stats.spg}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                             <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">BLOCKS</span>
                             <span className="font-black text-sm">{data.stats.bpg}</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">TURNOVERS</span>
                             <span className="font-black text-sm text-red-500">{data.stats.topg}</span>
                        </div>
                    </div>
               </div>

               <div className="bg-zinc-900 text-zinc-400 p-6 border-l-4 border-[#DFFF00]">
                  <div className="flex items-center gap-2 mb-4 text-[#DFFF00]">
                      <FileText size={16} />
                      <span className="font-bold font-mono text-xs tracking-widest">SCOUTING REPORT</span>
                  </div>
                  <p className="text-xs leading-relaxed font-mono whitespace-pre-line">
                      {data.desc}
                  </p>
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">DATA SOURCE</span>
                      <span className="text-white font-black text-[10px] bg-black px-2 py-1 border border-zinc-700">NBA OFFICIAL API</span>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
}