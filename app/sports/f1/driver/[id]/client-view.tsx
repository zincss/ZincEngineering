'use client';

import React, { useState } from 'react';
import { ArrowLeft, Terminal, BarChart3, Flag, Loader2, History, Crown, Star, Calendar } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-40 px-4 md:px-0 pt-12">
      
      <Link href="/sports/f1" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-acid px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent hover:border-black"><ArrowLeft size={16} /> RETURN TO GRID</Link>

      {/* MAIN DASHBOARD */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-lg mb-12 relative overflow-hidden">
        
        {/* TOP BAR */}
        <div className="bg-black text-acid text-[10px] font-mono font-bold px-4 py-2 uppercase flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b-2 border-zinc-800">
           <div className="flex items-center gap-2"><Terminal size={12} /> DRIVER TELEMETRY // {profile.code || id}</div>
           <div className="flex gap-4 text-zinc-400">
             <span className="flex items-center gap-1"><Flag size={12}/> {profile.team}</span>
             <span className="text-zinc-600">|</span>
             <span className="flex items-center gap-1">{profile.permanentNumber ? `NO. ${profile.permanentNumber}` : 'HISTORICAL LEGEND'}</span>
           </div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-black dark:border-zinc-700">
          
          {/* COL 1: DRIVER PROFILE */}
          <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col gap-6 border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-zinc-700 relative">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold font-mono uppercase">{profile.team}</span>
                     <span className="px-2 py-0.5 border border-black dark:border-zinc-600 text-[9px] font-bold font-mono uppercase text-black dark:text-white">{profile.nationality}</span>
                  </div>
                  <h1 className="text-5xl font-black text-black dark:text-white tracking-tighter uppercase leading-[0.9]">{profile.givenName}<br/>{profile.familyName}</h1>
              </div>

              {/* IMAGE */}
              <div className="aspect-square border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 relative flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                 {driverImage ? (
                    <img src={driverImage} className="w-full h-full object-cover object-top" alt="Driver" />
                 ) : (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:0_0,0_0]"></div>
                        <span className="text-9xl font-black text-zinc-100 dark:text-zinc-800 select-none">{profile.permanentNumber || '#'}</span>
                    </>
                 )}
              </div>

              {/* CAREER STATS */}
              <div className="space-y-2">
                 <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="text-[10px] font-black uppercase text-zinc-400">CAREER POINTS</span>
                    <span className="text-xl font-black text-black dark:text-white">{stats.points}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="text-[10px] font-black uppercase text-zinc-400">TOTAL WINS</span>
                    <span className="text-xl font-black text-black dark:text-white">{stats.wins}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="text-[10px] font-black uppercase text-zinc-400">PODIUMS</span>
                    <span className="text-xl font-black text-black dark:text-white">{stats.podiums}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="text-[10px] font-black uppercase text-zinc-400">RACES ENTERED</span>
                    <span className="text-xl font-black text-black dark:text-white">{stats.races}</span>
                 </div>
              </div>
          </div>

          {/* COL 2: HIGHLIGHTS & FORM */}
          <div className="lg:col-span-8 grid grid-rows-[auto_1fr] border-l-2 border-black dark:border-zinc-700">
              
              <div className="bg-zinc-900 text-zinc-300 p-6 border-b-2 border-black dark:border-zinc-700 flex flex-col h-auto lg:h-[320px]">
                  <div className="flex items-center gap-2 text-acid mb-4 pb-2 border-b border-zinc-800">
                    <Crown size={14} />
                    <span className="font-bold tracking-widest font-mono text-xs">CAREER HIGHLIGHTS // LEGACY LOG</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-black border border-zinc-800 p-3">
                          <span className="text-acid font-bold block mb-1 text-[9px] uppercase tracking-wider">ACTIVE YEARS</span>
                          <span className="text-white uppercase font-bold text-sm">{highlights.firstRace} - {highlights.lastRace}</span>
                      </div>
                      <div className="bg-black border border-zinc-800 p-3">
                          <span className="text-acid font-bold block mb-1 text-[9px] uppercase tracking-wider">MOST SUCCESSFUL TRACK</span>
                          <span className="text-white uppercase font-bold text-sm truncate">{highlights.bestTrack.replace(' Circuit', '')}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="bg-zinc-800/50 p-4 border border-zinc-700 flex flex-col justify-center min-h-[100px]">
                          <div className="flex items-center gap-2 mb-2">
                              <Star size={14} className="text-acid" />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">MILESTONE MOMENT</span>
                          </div>
                          <div className="text-lg font-black text-white leading-tight uppercase">
                              {highlights.milestone}
                          </div>
                        </div>

                        <div className="bg-zinc-800/50 p-4 border border-zinc-700 flex flex-col justify-center min-h-[100px]">
                          <div className="flex items-center gap-2 mb-2">
                              <History size={14} className="text-acid" />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">POLE POSITIONS</span>
                          </div>
                          <div className="text-4xl font-black text-white leading-none">
                              {highlights.poles}
                          </div>
                        </div>
                  </div>
              </div>

              {/* RECENT FORM */}
              <div className="bg-white dark:bg-zinc-900 p-6 flex flex-col h-auto lg:h-full lg:min-h-[300px]">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                             <BarChart3 size={14} className="text-black dark:text-white"/> 
                             <span className="text-xs font-black tracking-widest uppercase text-black dark:text-white">RECENT FORM (LAST 5 ENTRIES)</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1">FINISHING POS</span>
                    </div>

                    <div className="space-y-4">
                        {recentRaces.map((race: any) => {
                            const pText = race.Results[0].positionText;
                            const pos = parseInt(race.Results[0].position) || 20; 
                            const isDNF = isNaN(parseInt(race.Results[0].positionText));

                            return (
                                <div key={race.date} className="group">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="font-black text-xs uppercase text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors truncate max-w-[200px]">{race.raceName.replace(' Grand Prix', '')} '{race.season.slice(2)}</span>
                                        <span className={`font-mono text-[10px] font-bold ${isDNF ? 'text-red-500' : 'text-black dark:text-white'}`}>
                                            {isDNF ? 'DNF' : `P${pText}`}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 skew-x-[-12deg] relative">
                                        <div 
                                            className={`h-full transition-all duration-700 ease-out ${isDNF ? 'bg-red-500 w-full opacity-20' : 'bg-black dark:bg-acid group-hover:bg-acid dark:group-hover:bg-white'}`}
                                            style={{ width: isDNF ? '100%' : `${Math.max(5, 100 - (pos * 4.5))}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
              </div>

          </div>
        </div>
      </div>

      {/* --- SEASONAL ARCHIVE SECTION --- */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 text-black dark:text-white">
                  <Calendar size={24} className="text-acid" />
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">SEASON ARCHIVES</h2>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar max-w-full touch-pan-x">
                  {uniqueSeasons.map((season) => (
                      <button 
                        key={season}
                        onClick={() => setSelectedSeason(season)}
                        className={`px-4 py-2 text-xs font-black font-mono uppercase tracking-widest border-2 transition-all whitespace-nowrap shrink-0 ${
                            selectedSeason === season 
                            ? 'bg-black dark:bg-white text-acid dark:text-black border-black dark:border-white' 
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white'
                        }`}
                      >
                          {season}
                      </button>
                  ))}
              </div>
          </div>

          <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_#DFFF00]">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-zinc-100 dark:border-zinc-800 pb-6 mb-6 gap-4">
                  <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SELECTED DATABASE</span>
                      <h3 className="text-4xl font-black uppercase text-black dark:text-white">{selectedSeason} CAMPAIGN</h3>
                  </div>
                  <div className="flex gap-8">
                      <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase">SEASON POINTS</span>
                          <span className="text-2xl font-black text-black dark:text-white">{seasonSummary.points}</span>
                      </div>
                      <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase">VICTORIES</span>
                          <span className="text-2xl font-black text-acid bg-black px-2">{seasonSummary.wins}</span>
                      </div>
                  </div>
              </div>

              <div className="overflow-x-auto pb-2">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                          <tr className="text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-black dark:border-zinc-700">
                              <th className="pb-3 pl-2">RND</th>
                              <th className="pb-3">GRAND PRIX</th>
                              <th className="pb-3">CONSTRUCTOR</th>
                              <th className="pb-3 text-center">GRID</th>
                              <th className="pb-3 text-center">FINISH</th>
                              <th className="pb-3 text-right pr-2">PTS</th>
                          </tr>
                      </thead>
                      <tbody className="font-mono text-xs">
                          {seasonalRaces.map((race: any) => {
                              const res = race.Results[0];
                              const posText = res.positionText;
                              const pos = parseInt(res.position);
                              const grid = parseInt(res.grid);
                              const isDNF = isNaN(pos);
                              const gained = !isDNF && grid > 0 ? grid - pos : 0;
                              
                              return (
                                  <tr key={race.round} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                                      <td className="py-3 pl-2 font-bold text-zinc-400">{race.round}</td>
                                      <td className="py-3 font-bold text-black dark:text-white uppercase">{race.raceName.replace(' Grand Prix', '')}</td>
                                      <td className="py-3 text-zinc-500">{res.Constructor.name}</td>
                                      <td className="py-3 text-center text-zinc-500">{grid === 0 ? 'PL' : grid}</td>
                                      <td className="py-3 text-center">
                                          <span className={`px-2 py-1 font-bold ${isDNF ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : pos === 1 ? 'bg-acid text-black border border-black' : gained > 0 ? 'text-green-600 dark:text-green-400' : gained < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                                              {isDNF ? 'DNF' : `P${posText}`}
                                          </span>
                                      </td>
                                      <td className="py-3 text-right pr-2 font-black text-black dark:text-white">{res.points}</td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>

          </div>
      </div>
    </div>
  );
}