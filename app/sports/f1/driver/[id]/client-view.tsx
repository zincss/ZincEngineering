'use client';

import React, { useState } from 'react';
import { ArrowLeft, Terminal, BarChart3, Flag, Loader2, History, Crown, Star, Calendar, Trophy, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DriverClientView({ data, id }: { data: any, id: string }) {
  const { profile, stats, highlights, driverImage, careerRaces } = data;
  
  // Interactive State
  const [selectedSeason, setSelectedSeason] = useState<string>(careerRaces[0]?.season || '2025');

  // Computed on the fly
  const uniqueSeasons = Array.from(new Set(careerRaces.map((r: any) => r.season))) as string[];
  const seasonalRaces = careerRaces.filter((r: any) => r.season === selectedSeason);
  const recentRaces = careerRaces.slice(0, 5);
  
  const seasonSummary = seasonalRaces.reduce((acc: any, race: any) => {
      const pos = parseInt(race.Results[0].position);
      const pts = parseFloat(race.Results[0].points);
      return {
          points: acc.points + pts,
          wins: acc.wins + (pos === 1 ? 1 : 0),
          podiums: acc.podiums + (pos <= 3 ? 1 : 0)
      };
  }, { points: 0, wins: 0, podiums: 0 });

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 pt-24">
      
      <div className="max-w-[1600px] mx-auto px-6">
          <Link href="/sports/f1" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] transition-colors font-mono font-bold text-[10px] uppercase tracking-widest mb-8">
              <ArrowLeft size={14} /> Back to Grid
          </Link>

          {/* HERO SECTION */}
          <div className="relative border-b border-zinc-800 pb-12 mb-12">
              <div className="flex flex-col md:flex-row items-end justify-between gap-8 relative z-10">
                  <div>
                      <div className="flex items-center gap-3 mb-4">
                          <span className="px-2 py-1 bg-[#DFFF00] text-black text-[10px] font-black font-mono uppercase tracking-widest">{profile.team}</span>
                          <span className="px-2 py-1 border border-zinc-800 text-[10px] font-bold font-mono uppercase text-zinc-400">{profile.nationality}</span>
                      </div>
                      <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] text-white">
                          {profile.givenName}<br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 to-zinc-800 text-stroke-white">{profile.familyName}</span>
                      </h1>
                  </div>
                  
                  {/* HERO STATS */}
                  <div className="flex gap-8 md:gap-16 border-t md:border-t-0 border-zinc-800 pt-6 md:pt-0">
                      <div>
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Career Points</span>
                          <span className="block text-4xl font-black text-white">{stats.points}</span>
                      </div>
                      <div>
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Victories</span>
                          <span className="block text-4xl font-black text-[#DFFF00]">{stats.wins}</span>
                      </div>
                      <div>
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Podiums</span>
                          <span className="block text-4xl font-black text-white">{stats.podiums}</span>
                      </div>
                  </div>
              </div>

              {/* BACKGROUND NUMBER */}
              {profile.permanentNumber && (
                  <div className="absolute top-0 right-0 -translate-y-1/3 text-[400px] font-black text-zinc-900 select-none z-0 pointer-events-none opacity-50">
                      {profile.permanentNumber}
                  </div>
              )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* LEFT COL: IMAGE & BIO */}
              <div className="lg:col-span-4 space-y-8">
                  <div className="aspect-[3/4] relative border border-zinc-800 bg-zinc-900 overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                      {driverImage ? (
                          <img src={driverImage} className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700" alt="Driver" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                              <span className="text-zinc-800 font-black text-9xl">{profile.code}</span>
                          </div>
                      )}
                      
                      {/* OVERLAY TECH DATA */}
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                          <div className="flex justify-between items-end">
                              <span className="text-6xl font-black text-[#DFFF00]">{profile.permanentNumber}</span>
                              <span className="font-mono text-[10px] text-zinc-400 mb-2">{profile.code} // {profile.driverId}</span>
                          </div>
                      </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                      <h3 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
                          <Terminal size={14} className="text-[#DFFF00]" /> Driver Dossier
                      </h3>
                      <p className="text-xs font-mono text-zinc-400 leading-relaxed text-justify uppercase">
                          {data.bio}
                      </p>
                  </div>
              </div>

              {/* RIGHT COL: STATS & SEASONS */}
              <div className="lg:col-span-8 space-y-12">
                  
                  {/* HIGHLIGHTS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-zinc-900 border border-zinc-800 p-6 hover:border-[#DFFF00] transition-colors group">
                          <div className="flex items-center justify-between mb-4">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Active Years</span>
                              <History size={14} className="text-zinc-600 group-hover:text-[#DFFF00]" />
                          </div>
                          <div className="text-xl font-bold text-white uppercase">{highlights.firstRace} — {highlights.lastRace}</div>
                      </div>
                      
                      <div className="bg-zinc-900 border border-zinc-800 p-6 hover:border-[#DFFF00] transition-colors group">
                          <div className="flex items-center justify-between mb-4">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Best Circuit</span>
                              <Flag size={14} className="text-zinc-600 group-hover:text-[#DFFF00]" />
                          </div>
                          <div className="text-xl font-bold text-white uppercase truncate">{(highlights.bestTrack || 'N/A').replace(' Circuit', '')}</div>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 p-6 hover:border-[#DFFF00] transition-colors group">
                          <div className="flex items-center justify-between mb-4">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Pole Positions</span>
                              <Zap size={14} className="text-zinc-600 group-hover:text-[#DFFF00]" />
                          </div>
                          <div className="text-3xl font-black text-white">{highlights.poles}</div>
                      </div>
                  </div>

                  {/* SEASON ARCHIVE */}
                  <div>
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-zinc-800 pb-4">
                          <div>
                              <h2 className="text-2xl font-black uppercase text-white mb-1">Season Archives</h2>
                              <p className="text-[10px] font-mono text-zinc-500 uppercase">Historical Performance Data</p>
                          </div>
                          
                          <div className="flex gap-1 overflow-x-auto max-w-full pb-2 md:pb-0 no-scrollbar">
                              {uniqueSeasons.map((season) => (
                                  <button 
                                    key={season}
                                    onClick={() => setSelectedSeason(season)}
                                    className={`
                                        px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border transition-all whitespace-nowrap
                                        ${selectedSeason === season 
                                            ? 'bg-[#DFFF00] text-black border-[#DFFF00]' 
                                            : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white'}
                                    `}
                                  >
                                      {season}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="bg-zinc-900/30 border border-zinc-800">
                          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                              <span className="text-xs font-black uppercase text-white">{selectedSeason} Summary</span>
                              <div className="flex gap-4 text-[10px] font-mono font-bold">
                                  <span className="text-zinc-400">PTS: <span className="text-[#DFFF00]">{seasonSummary.points}</span></span>
                                  <span className="text-zinc-400">WINS: <span className="text-white">{seasonSummary.wins}</span></span>
                              </div>
                          </div>
                          
                          <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                  <thead>
                                      <tr className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                                          <th className="px-4 py-3">Round</th>
                                          <th className="px-4 py-3">Grand Prix</th>
                                          <th className="px-4 py-3">Team</th>
                                          <th className="px-4 py-3 text-center">Grid</th>
                                          <th className="px-4 py-3 text-center">Result</th>
                                          <th className="px-4 py-3 text-right">Pts</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-xs font-mono">
                                      {seasonalRaces.map((race: any) => {
                                          const res = race.Results[0];
                                          const posText = res.positionText;
                                          const pos = parseInt(res.position);
                                          const grid = parseInt(res.grid);
                                          const isDNF = isNaN(pos);
                                          const gained = !isDNF && grid > 0 ? grid - pos : 0;
                                          
                                          return (
                                              <tr key={race.round} className="border-b border-zinc-800/50 hover:bg-zinc-800 transition-colors">
                                                  <td className="px-4 py-3 text-zinc-500">{race.round}</td>
                                                  <td className="px-4 py-3 font-bold text-white uppercase">{race.raceName.replace(' Grand Prix', '')}</td>
                                                  <td className="px-4 py-3 text-zinc-400">{res.Constructor.name}</td>
                                                  <td className="px-4 py-3 text-center text-zinc-500">{grid === 0 ? 'PL' : grid}</td>
                                                  <td className="px-4 py-3 text-center">
                                                      <span className={`
                                                          px-2 py-0.5 rounded-sm font-bold
                                                          ${isDNF ? 'text-red-500 bg-red-900/10' : 
                                                            pos === 1 ? 'bg-[#DFFF00] text-black' : 
                                                            pos <= 3 ? 'text-white border border-zinc-700' : 
                                                            'text-zinc-400'}
                                                      `}>
                                                          {isDNF ? 'DNF' : `P${posText}`}
                                                      </span>
                                                  </td>
                                                  <td className="px-4 py-3 text-right font-bold text-[#DFFF00]">{res.points}</td>
                                              </tr>
                                          );
                                      })}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      </div>
    </div>
  );
}