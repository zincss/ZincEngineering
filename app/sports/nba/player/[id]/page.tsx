import React from 'react';
import { ArrowLeft, Activity, Clock, Crosshair, Shield, Zap, TrendingUp, Users, FileText, Globe, MapPin, Award } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlayerProfile } from '../../actions'; // We will use your existing action as the "fetcher"
import { getOrFetchResource } from '@/lib/data-manager';
import { NBA_TEAMS } from '../../data';

// Force dynamic so we catch new IDs instantly
export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }: { params: { id: string } }) {
  
  // THE MAGIC LINE: Check DB -> Fetch if Missing -> Save -> Return
  const data = await getOrFetchResource(
    { table: 'nba_profiles', keyField: 'player_id', id: params.id },
    () => getPlayerProfile(params.id)
  );

  if (!data) return notFound();

  // Determine Team Color
  const teamConfig = NBA_TEAMS.find(t => t.espnId === data.teamId) || NBA_TEAMS.find(t => t.name.includes(data.team)) || NBA_TEAMS[0];
  const teamColor = teamConfig.color;

  return (
    <div className="max-w-7xl mx-auto pb-40 px-4 md:px-0 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* NAV */}
      <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-[#DFFF00] px-4 py-2 mb-8 group transition-all font-mono font-black text-[10px] uppercase tracking-[0.2em] border border-zinc-200 dark:border-zinc-800 hover:border-black">
          <ArrowLeft size={12} /> TACTICAL ROSTER
      </Link>

      {/* HERO */}
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
                      <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">HEIGHT</span><span className="text-xl font-mono font-bold">{data.height}</span></div>
                      <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">WEIGHT</span><span className="text-xl font-mono font-bold">{data.weight}</span></div>
                      <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">AGE</span><span className="text-xl font-mono font-bold">{data.age}</span></div>
                      <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">EXP</span><span className="text-xl font-mono font-bold">{data.exp} YRS</span></div>
                  </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                  <div className="px-4 py-2 border border-zinc-700 bg-black/50 text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-widest"><Globe size={12} className="text-[#DFFF00]"/> {data.country}</div>
                  <div className="px-4 py-2 border border-zinc-700 bg-black/50 text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-widest"><MapPin size={12} className="text-[#DFFF00]"/> {data.school}</div>
                  <div className="px-4 py-2 border border-zinc-700 bg-black/50 text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-widest"><Award size={12} className="text-[#DFFF00]"/> {data.draft}</div>
              </div>
          </div>
      </div>

      {/* STATS GRID (Simplified for Server Component) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black text-[#DFFF00] p-6 border-2 border-black dark:border-zinc-700 relative overflow-hidden">
                      <div className="absolute top-2 right-2 opacity-20"><Crosshair size={40}/></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">POINTS</span>
                      <span className="text-5xl font-black tracking-tighter">{data.stats.ppg}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-6 border-2 border-zinc-200 dark:border-zinc-700 relative overflow-hidden">
                      <div className="absolute top-2 right-2 opacity-10"><Shield size={40}/></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">REBOUNDS</span>
                      <span className="text-5xl font-black tracking-tighter text-black dark:text-white">{data.stats.rpg}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-6 border-2 border-zinc-200 dark:border-zinc-700 relative overflow-hidden">
                      <div className="absolute top-2 right-2 opacity-10"><Zap size={40}/></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">ASSISTS</span>
                      <span className="text-5xl font-black tracking-tighter text-black dark:text-white">{data.stats.apg}</span>
                  </div>
              </div>
              
              {/* GAME LOG RENDERER */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 p-8">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b-2 border-black dark:border-zinc-800 pb-4">RECENT PERFORMANCE</h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                  <th className="pb-3 pl-2">DATE</th>
                                  <th className="pb-3">OPPONENT</th>
                                  <th className="pb-3 text-right">PTS</th>
                                  <th className="pb-3 text-right">REB</th>
                                  <th className="pb-3 text-right">AST</th>
                              </tr>
                          </thead>
                          <tbody className="font-mono text-xs">
                              {data.gameLog.map((g: any, i: number) => (
                                  <tr key={i} className="border-b border-zinc-50 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                      <td className="py-3 pl-2 font-bold text-zinc-400">{g.date}</td>
                                      <td className="py-3 font-black text-black dark:text-white uppercase">{g.opponent}</td>
                                      <td className="py-3 text-right font-bold">{g.pts}</td>
                                      <td className="py-3 text-right">{g.reb}</td>
                                      <td className="py-3 text-right">{g.ast}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
          
          <div className="space-y-6">
              <div className="bg-zinc-900 text-zinc-400 p-6 border-l-4 border-[#DFFF00]">
                  <div className="flex items-center gap-2 mb-4 text-[#DFFF00]">
                      <FileText size={16} />
                      <span className="font-bold font-mono text-xs tracking-widest">SCOUTING REPORT</span>
                  </div>
                  <p className="text-xs leading-relaxed font-mono whitespace-pre-line">{data.desc}</p>
              </div>
          </div>
      </div>
    </div>
  );
}