'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Info, Loader2, Ruler, Weight, Users, TrendingUp, Crosshair, Shield, Zap, Calendar } from 'lucide-react';
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

  if (loading) return <div className="min-h-screen flex items-center justify-center gap-2 font-mono text-xs text-zinc-500"><Loader2 className="animate-spin text-acid"/> ACCESSING BIOMETRICS...</div>;
  if (!data) return <div className="p-20 text-center font-mono text-zinc-500">PLAYER ARCHIVE NOT FOUND.</div>;

  const teamConfig = NBA_TEAMS.find(t => t.espnId === data.teamId) || NBA_TEAMS.find(t => t.name.includes(data.team)) || NBA_TEAMS[0];
  const teamColor = teamConfig.color;

  return (
    <div className="max-w-5xl mx-auto pb-40 px-4 md:px-0 pt-12 animate-in fade-in slide-in-from-bottom-4">
      <Link href={`/sports/nba/team/${teamConfig.id}`} className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-acid px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent hover:border-black"><ArrowLeft size={14} /> RETURN TO ROSTER</Link>

      {/* HERO SECTION */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_#DFFF00] mb-12 relative overflow-hidden min-h-[300px] flex flex-col md:flex-row items-end">
          
          {/* Background */}
          <div className={`absolute inset-0 ${teamColor} opacity-90`}>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:4px_4px]"></div>
          </div>
          
          {/* Player Image */}
          <div className="relative z-10 w-full md:w-1/3 h-64 md:h-full flex items-end justify-center md:justify-start md:pl-8 pointer-events-none">
              <img src={data.image} className="h-full w-auto object-contain drop-shadow-2xl transform scale-125 origin-bottom" alt={data.name} />
          </div>

          {/* Info Block */}
          <div className="relative z-10 flex-1 p-8 text-white w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-none">
              <div className="flex flex-wrap gap-2 mb-2">
                  <span className="bg-black border border-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-acid">{data.team}</span>
                  <span className="bg-black border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">#{data.number}</span>
                  <span className="bg-black border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{data.pos}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter drop-shadow-lg mb-6">{data.name}</h1>
              
              {/* Key Stats Row */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-4 max-w-md">
                  <div>
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">PPG</span>
                      <span className="text-3xl font-black">{data.stats.ppg}</span>
                  </div>
                  <div>
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">RPG</span>
                      <span className="text-3xl font-black">{data.stats.rpg}</span>
                  </div>
                  <div>
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">APG</span>
                      <span className="text-3xl font-black">{data.stats.apg}</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: GAME LOG */}
          <div className="lg:col-span-2">
              <div className="bg-zinc-50 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-6">
                  <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                          <Activity size={14} className="text-black dark:text-white"/>
                          <span className="text-xs font-black tracking-widest uppercase text-black dark:text-white">RECENT GAME LOG</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-acid text-black px-2 py-1">LAST 5 GAMES</span>
                  </div>

                  <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[400px]">
                          <thead>
                              <tr className="text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                                  <th className="pb-2 pl-2">DATE</th>
                                  <th className="pb-2">OPP</th>
                                  <th className="pb-2 text-center">RES</th>
                                  <th className="pb-2 text-right text-black dark:text-white">PTS</th>
                                  <th className="pb-2 text-right">REB</th>
                                  <th className="pb-2 text-right">AST</th>
                                  <th className="pb-2 text-right pr-2">MIN</th>
                              </tr>
                          </thead>
                          <tbody className="font-mono text-xs text-zinc-600 dark:text-zinc-300">
                              {data.gameLog.map((g: any, i: number) => (
                                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                                      <td className="py-3 pl-2 font-bold text-zinc-400">{g.date}</td>
                                      <td className="py-3 font-bold uppercase">{g.opponent}</td>
                                      <td className="py-3 text-center">
                                          <span className={`px-1.5 py-0.5 font-bold text-[9px] ${g.result === 'W' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{g.result}</span>
                                      </td>
                                      <td className="py-3 text-right font-black text-black dark:text-white text-sm">{g.pts}</td>
                                      <td className="py-3 text-right">{g.reb}</td>
                                      <td className="py-3 text-right">{g.ast}</td>
                                      <td className="py-3 text-right pr-2 text-zinc-400">{g.min}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

          {/* RIGHT COL: BIO & VITALS */}
          <div className="space-y-6">
               
               {/* VITALS */}
               <div className="bg-black text-zinc-300 p-6 border-b-4 border-acid">
                    <div className="flex items-center gap-2 text-acid mb-6">
                         <Zap size={16} />
                         <span className="font-bold font-mono text-xs tracking-widest">BIOMETRICS</span>
                    </div>
                    <div className="space-y-4 font-mono text-xs">
                        <div className="flex justify-between border-b border-zinc-800 pb-2">
                             <span className="text-zinc-500 flex items-center gap-2"><Ruler size={12}/> HEIGHT</span>
                             <span className="text-white font-bold">{data.height}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800 pb-2">
                             <span className="text-zinc-500 flex items-center gap-2"><Weight size={12}/> WEIGHT</span>
                             <span className="text-white font-bold">{data.weight}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800 pb-2">
                             <span className="text-zinc-500 flex items-center gap-2"><Users size={12}/> AGE</span>
                             <span className="text-white font-bold">{data.age} YEARS</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800 pb-2">
                             <span className="text-zinc-500 flex items-center gap-2"><Calendar size={12}/> BORN</span>
                             <span className="text-white font-bold">{data.born}</span>
                        </div>
                         <div className="flex justify-between pt-2">
                             <span className="text-zinc-500 flex items-center gap-2"><TrendingUp size={12}/> STATUS</span>
                             <span className="text-acid font-bold uppercase">{data.status}</span>
                        </div>
                    </div>
               </div>

               {/* BIO TEXT */}
               <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 p-6">
                  <h3 className="font-black text-xs uppercase mb-4 flex items-center gap-2 text-zinc-400"><Info size={14}/> PLAYER DOSSIER</h3>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-serif whitespace-pre-line text-justify">{data.desc}</p>
              </div>

          </div>

      </div>
    </div>
  );
}