'use client';

import React, { useEffect, useState } from 'react';
import { Flag, Target, MapPin, Trophy, Calendar } from 'lucide-react';

// FIX: Update imports to point to lib/components
import { LiveLeaderboard } from './lib/components/LiveLeaderboard';
import { WorldRankings } from './lib/components/WorldRankings';
import { SeasonLeaders } from './lib/components/SeasonLeaders';

// FIX: Import from lib/golf-api
import { getRankings, getTournaments, getSeasonLeaders, Golfer, Tournament, StatLeaderboard } from './lib/golf-api';

export default function GolfHub() {
  const [rankings, setRankings] = useState<Golfer[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [featured, setFeatured] = useState<Tournament | null>(null);
  const [seasonStats, setSeasonStats] = useState<StatLeaderboard[]>([]);

  useEffect(() => {
    const init = async () => {
       const rData = await getRankings();
       const tData = await getTournaments();
       const sData = await getSeasonLeaders();
       
       setRankings(rData);
       setTournaments(tData);
       setSeasonStats(sData);

       const live = tData.find(t => t.status === 'LIVE');
       const upcoming = tData.find(t => t.status === 'UPCOMING');
       setFeatured(live || upcoming || tData[0]);
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-black pb-20 pt-8">
       {/* LIVE TICKER */}
       <div className="sticky top-[80px] z-30 mb-8">
          <LiveLeaderboard />
       </div>

       <div className="max-w-[1600px] mx-auto px-4 md:px-6">
           
           {/* HERO HEADER */}
           <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12 border-b border-zinc-800 pb-8">
               <div>
                   <div className="inline-flex items-center gap-3 text-[#DFFF00] border border-[#DFFF00]/30 px-3 py-1 rounded-sm mb-4">
                       <Flag size={14} fill="#DFFF00" />
                       <span className="text-[10px] font-mono font-bold tracking-widest uppercase">GOLF_DIVISION // GLOBAL</span>
                   </div>
                   <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.8]">
                       Fairway<br/><span className="text-zinc-800">Control</span>
                   </h1>
               </div>
               <div className="flex gap-4">
                  <div className="text-right">
                      <div className="text-4xl font-black text-[#DFFF00]">72</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Global Events</div>
                  </div>
                  <div className="w-px h-12 bg-zinc-800"></div>
                  <div className="text-right">
                      <div className="text-4xl font-black text-white">400+</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Tracked Athletes</div>
                  </div>
               </div>
           </div>

           {/* MAIN GRID */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* COL 1: RANKINGS */}
               <div className="lg:col-span-1 flex flex-col gap-8">
                   <WorldRankings data={rankings} />
               </div>

               {/* COL 2 & 3: FEATURED & STATS */}
               <div className="lg:col-span-2 flex flex-col gap-8">
                   
                   {/* FEATURED EVENT */}
                   {featured ? (
                       <div className="relative h-96 border border-zinc-800 bg-zinc-900 group overflow-hidden">
                           <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" 
                                style={{ backgroundImage: `url('${featured.details.image}')` }}>
                           </div>
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                           
                           <div className="absolute bottom-0 left-0 p-8 w-full">
                               <div className="flex items-end justify-between">
                                   <div>
                                       <div className={`flex items-center gap-2 mb-2 ${featured.status === 'LIVE' ? 'text-red-500' : 'text-[#DFFF00]'}`}>
                                           <div className={`w-2 h-2 rounded-full ${featured.status === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-[#DFFF00]'}`}></div>
                                           <span className="text-xs font-mono font-bold uppercase tracking-widest">{featured.status} COVERAGE</span>
                                       </div>
                                       
                                       <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-2 leading-none">
                                           {featured.name}
                                       </h2>
                                       
                                       <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-zinc-400 font-mono text-xs mt-4">
                                           <span className="flex items-center gap-2"><MapPin size={14} /> {featured.details.location}</span>
                                           <span className="hidden md:inline text-zinc-700">|</span>
                                           <span className="flex items-center gap-2"><Target size={14} /> {featured.course}</span>
                                           <span className="hidden md:inline text-zinc-700">|</span>
                                           <span className="text-[#DFFF00]">PAR {featured.details.par} // {featured.details.yardage.toLocaleString()} YDS</span>
                                       </div>
                                   </div>
                                   
                                   {featured.winner && (
                                       <div className="hidden md:block text-right">
                                           <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">CHAMPION</div>
                                           <div className="text-xl font-black text-white uppercase flex items-center gap-2 justify-end">
                                               {featured.winner} <Trophy size={16} className="text-[#DFFF00]" />
                                           </div>
                                       </div>
                                   )}
                               </div>
                           </div>
                       </div>
                   ) : (
                       <div className="h-96 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500 font-mono text-xs">
                           LOADING SATELLITE IMAGERY...
                       </div>
                   )}

                   {/* STAT LEADERS SECTION */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <SeasonLeaders data={seasonStats} />
                       
                       <div className="border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-center items-center text-center">
                           <Trophy size={48} className="text-zinc-800 mb-4" />
                           <h3 className="text-lg font-black text-white uppercase tracking-tight">PGA TOUR<br/>ARCHIVES</h3>
                           <p className="text-[10px] font-mono text-zinc-500 mt-2 max-w-[200px]">
                               Access historical data, course records, and past champion profiles.
                           </p>
                           <button className="mt-6 px-6 py-2 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#DFFF00] hover:text-black transition-colors">
                               OPEN VAULT
                           </button>
                       </div>
                   </div>

               </div>
           </div>

       </div>
    </div>
  );
}