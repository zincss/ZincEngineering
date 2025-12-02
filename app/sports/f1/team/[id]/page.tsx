'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Terminal, Flag, MapPin, Loader2, Trophy, History, Crown, Users, Car, Wrench, BarChart3, Star, Building2, Zap, Hash } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- SMART SEARCH UTILITY ---
const searchCommons = async (query: string) => {
    try {
        const safeQuery = query;
        const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(safeQuery)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`);
        const data = await res.json();
        if (!data.query || !data.query.pages) return null;
        const pages = Object.values(data.query.pages);
        // @ts-ignore
        return pages.length > 0 ? pages[0].imageinfo[0].url : null;
    } catch (e) { return null; }
};

export default function TeamPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [images, setImages] = useState<{logo: string | null, car: string | null}>({ logo: null, car: null });
  const [loading, setLoading] = useState(true);

  // --- 1. VERIFIED LOGOS MAP ---
  const TEAM_LOGO_MAP: Record<string, string> = {
        'mercedes': 'https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes_AMG_Petronas_F1_Logo.svg',
        'ferrari': 'https://commons.wikimedia.org/wiki/Special:FilePath/Ferrari_wordmark.svg',
        'red_bull': 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo_of_Red_bull.svg',
        'mclaren': 'https://commons.wikimedia.org/wiki/Special:FilePath/McLaren_Automotive_logo.svg',
        'alpine': 'https://commons.wikimedia.org/wiki/Special:FilePath/Alpine_F1_Team_Logo.svg',
        'aston_martin': 'https://commons.wikimedia.org/wiki/Special:FilePath/Aston_Martin_wordmark.svg',
        'williams': 'https://commons.wikimedia.org/wiki/Special:FilePath/Williams_Racing_2022_logo.svg',
        'haas': 'https://commons.wikimedia.org/wiki/Special:FilePath/MoneyGram_Haas_F1_Team_Logo.svg',
        'rb': 'https://commons.wikimedia.org/wiki/Special:FilePath/RB_Logo.svg',
        'sauber': 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo_of_Stake_F1_Team_Kick_Sauber.png',
        'lotus_f1': 'https://commons.wikimedia.org/wiki/Special:FilePath/Lotus_F1_Team_logo.svg',
        'team_lotus': 'https://commons.wikimedia.org/wiki/Special:FilePath/Team_Lotus_Logo_1958-1994.svg',
        'benetton': 'https://commons.wikimedia.org/wiki/Special:FilePath/Benetton_F1_logo.svg',
        'brawn': 'https://commons.wikimedia.org/wiki/Special:FilePath/Brawn_GP_logo.svg',
        'tyrrell': 'https://commons.wikimedia.org/wiki/Special:FilePath/Tyrrell_Racing_logo.svg',
        'jordan': 'https://commons.wikimedia.org/wiki/Special:FilePath/Jordan_Grand_Prix_Logo.svg',
        'ligier': 'https://commons.wikimedia.org/wiki/Special:FilePath/Equipe_Ligier_Logo.svg',
  };

  // --- 2. VERIFIED MACHINE ARCHIVE (CARS) ---
  const TEAM_CAR_MAP: Record<string, string> = {
      'red_bull': 'https://commons.wikimedia.org/wiki/Special:FilePath/RB20_During_the_2024_Japanese_Free_Practice.jpg', 
      'mercedes': 'https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes_W15_on_display_-_2024_Chinese_GP.jpg', 
      'ferrari': 'https://commons.wikimedia.org/wiki/Special:FilePath/SF-24_at_the_Japanese_GP.jpg', 
      'mclaren': 'https://commons.wikimedia.org/wiki/Special:FilePath/McLaren_MCL38.jpg', 
      'aston_martin': 'https://commons.wikimedia.org/wiki/Special:FilePath/2024_Aston_Martin_AMR24.jpg', 
      'alpine': 'https://commons.wikimedia.org/wiki/Special:FilePath/2024_Alpine_A524_Show_car.jpg', 
      'williams': 'https://commons.wikimedia.org/wiki/Special:FilePath/Williams_Racing_2024.jpg', 
      'rb': 'https://commons.wikimedia.org/wiki/Special:FilePath/RB_VCARB01_2024_Chinese_GP.jpg', 
      'sauber': 'https://commons.wikimedia.org/wiki/Special:FilePath/Valtteri_Bottas_Chinese_GP_2024.jpg', 
      'haas': 'https://commons.wikimedia.org/wiki/Special:FilePath/Nico_Hulkenberg_2024_Chinese_GP.jpg', 
      'team_lotus': 'https://commons.wikimedia.org/wiki/Special:FilePath/Lotus_72E_at_Goodwood_2014_001.jpg',
      'mclaren-honda': 'https://commons.wikimedia.org/wiki/Special:FilePath/Ayrton_Senna_Mclaren_Honda_MP4_4_1988.jpg',
      'ferrari_historical': 'https://commons.wikimedia.org/wiki/Special:FilePath/Michael_Schumacher_Ferrari_F2004.jpg',
      'benetton': 'https://commons.wikimedia.org/wiki/Special:FilePath/Michael_Schumacher_Benetton_B194_Goodwood.jpg',
  };

  // --- 3. FACTORY DATA ---
  const FACTORY_DATA: Record<string, { hq: string, engine: string }> = {
      'red_bull': { hq: 'Milton Keynes, UK', engine: 'Honda RBPT' },
      'mercedes': { hq: 'Brackley, UK', engine: 'Mercedes' },
      'ferrari': { hq: 'Maranello, Italy', engine: 'Ferrari' },
      'mclaren': { hq: 'Woking, UK', engine: 'Mercedes' },
      'aston_martin': { hq: 'Silverstone, UK', engine: 'Mercedes' },
      'alpine': { hq: 'Enstone, UK', engine: 'Renault' },
      'williams': { hq: 'Grove, UK', engine: 'Mercedes' },
      'haas': { hq: 'Kannapolis, USA', engine: 'Ferrari' },
      'rb': { hq: 'Faenza, Italy', engine: 'Honda RBPT' },
      'sauber': { hq: 'Hinwil, Switzerland', engine: 'Ferrari' },
      'team_lotus': { hq: 'Norfolk, UK', engine: 'Ford / Honda / Renault' },
      'tyrrell': { hq: 'Ockham, UK', engine: 'Ford Cosworth' },
      'benetton': { hq: 'Enstone, UK', engine: 'Ford / Renault' },
      'brawn': { hq: 'Brackley, UK', engine: 'Mercedes' },
  };

  // --- 4. TITLES ---
  const WCC_TITLES: Record<string, number> = {
      'ferrari': 16, 'williams': 9, 'mclaren': 8, 'mercedes': 8, 'lotus_f1': 7, 'team_lotus': 7, 
      'red_bull': 6, 'cooper': 2, 'brabham': 2, 'renault': 2, 'benetton': 1, 'brawn': 1, 'vanwall': 1, 'matra': 1, 'tyrrell': 1
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const infoRes = await fetch(`https://api.jolpi.ca/ergast/f1/constructors/${id}.json`);
        const infoData = await infoRes.json();
        const constructor = infoData.MRData.ConstructorTable.Constructors[0];
        if (!constructor) throw new Error("Team not found");
        setTeam(constructor);

        const name = constructor.name;
        let logoUrl = TEAM_LOGO_MAP[id as string];
        if (!logoUrl) {
             logoUrl = await searchCommons(`File:${name} F1 logo.svg`) || await searchCommons(`File:${name} logo.svg`);
        }
        
        let carUrl = TEAM_CAR_MAP[id as string];
        if (!carUrl) {
             carUrl = await searchCommons(`File:${name} F1 car.jpg`);
        }
        
        setImages({ logo: logoUrl || null, car: carUrl || null });

        const recentRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/constructors/${id}/results.json?limit=10`);
        const recentData = await recentRes.json();
        let lastRaces = recentData.MRData.RaceTable.Races;
        
        if (lastRaces.length === 0) {
             const prevRes = await fetch(`https://api.jolpi.ca/ergast/f1/2024/constructors/${id}/results.json?limit=10`);
             const prevData = await prevRes.json();
             lastRaces = prevData.MRData.RaceTable.Races;
        }
        setRecentResults(lastRaces.slice(-5));

        const winnersRes = await fetch(`https://api.jolpi.ca/ergast/f1/constructors/${id}/results/1.json?limit=500`);
        const winnersData = await winnersRes.json();
        const winCount = parseInt(winnersData.MRData.total);
        
        const polesRes = await fetch(`https://api.jolpi.ca/ergast/f1/constructors/${id}/qualifying/1.json?limit=1`);
        const polesData = await polesRes.json();
        
        const entriesRes = await fetch(`https://api.jolpi.ca/ergast/f1/constructors/${id}/results.json?limit=1`);
        const entriesData = await entriesRes.json();

        setStats({ 
            wins: winCount, 
            poles: parseInt(polesData.MRData.total), 
            entries: parseInt(entriesData.MRData.total),
            titles: WCC_TITLES[id as string] || 0,
            factory: FACTORY_DATA[id as string] || { hq: 'Unknown Location', engine: 'Various' }
        });
        
        const currentDriversRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/constructors/${id}/drivers.json`);
        const currentDriversData = await currentDriversRes.json();
        setDrivers(currentDriversData.MRData.DriverTable.Drivers);
        
        setLoading(false);

      } catch (e) {
        console.error("Team Data Error:", e);
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white gap-2 font-mono text-xs animate-pulse">
        <Loader2 className="animate-spin text-[#DFFF00]" /> ACCESSING CONSTRUCTOR ARCHIVES...
    </div>
  );

  if (!team) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-zinc-500">TEAM_NOT_FOUND</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 pt-24">
      
      <div className="max-w-[1600px] mx-auto px-6">
          <Link href="/sports/f1" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] transition-colors font-mono font-bold text-[10px] uppercase tracking-widest mb-8">
              <ArrowLeft size={14} /> Back to Paddock
          </Link>

          {/* HEADER */}
          <div className="border-b border-zinc-800 pb-12 mb-12">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                          <span className="px-2 py-1 bg-[#DFFF00] text-black text-[10px] font-black font-mono uppercase tracking-widest">{stats.factory.engine} POWER</span>
                          <span className="px-2 py-1 border border-zinc-800 text-[10px] font-bold font-mono uppercase text-zinc-400">{team.nationality}</span>
                      </div>
                      <div className="flex items-center gap-8">
                          {images.logo && (
                              <div className="w-24 h-24 relative bg-white/5 rounded-lg p-4 border border-white/10">
                                  <img src={images.logo} className="w-full h-full object-contain filter invert" alt="Logo" />
                              </div>
                          )}
                          <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-white">
                              {team.name}
                          </h1>
                      </div>
                  </div>
                  
                  {/* HERO STATS */}
                  <div className="flex gap-12 border-t lg:border-t-0 border-zinc-800 pt-6 lg:pt-0">
                      <div>
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Constructors Titles</span>
                          <span className="block text-5xl font-black text-[#DFFF00]">{stats.titles}</span>
                      </div>
                      <div>
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Race Wins</span>
                          <span className="block text-5xl font-black text-white">{stats.wins}</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* LEFT COL: TECH & MACHINE */}
              <div className="lg:col-span-5 space-y-8">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                      <h3 className="text-sm font-black uppercase text-white mb-6 flex items-center gap-2">
                          <Wrench size={14} className="text-[#DFFF00]" /> Factory Data
                      </h3>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Headquarters</span>
                              <span className="text-sm font-bold text-white uppercase">{stats.factory.hq}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Power Unit</span>
                              <span className="text-sm font-bold text-white uppercase">{stats.factory.engine}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Entries</span>
                              <span className="text-sm font-bold text-white uppercase">{stats.entries}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Poles</span>
                              <span className="text-sm font-bold text-[#DFFF00] uppercase">{stats.poles}</span>
                          </div>
                      </div>
                  </div>

                  {images.car && (
                      <div className="relative border border-zinc-800 bg-zinc-900 group overflow-hidden">
                          <img src={images.car} className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" alt="Car" />
                          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-zinc-950 to-transparent">
                              <span className="text-[9px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest">Machine Archive</span>
                          </div>
                      </div>
                  )}
              </div>

              {/* RIGHT COL: DRIVERS & FORM */}
              <div className="lg:col-span-7 space-y-12">
                  
                  {/* DRIVERS */}
                  <div>
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
                           <Users size={14} className="text-[#DFFF00]"/> 
                           <span className="text-xs font-black tracking-widest uppercase text-white">Active Drivers</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {drivers.map((d: any) => (
                              <Link href={`/sports/f1/driver/${d.driverId}`} key={d.driverId} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 hover:border-[#DFFF00] transition-colors group">
                                  <div className="h-12 w-12 bg-zinc-800 flex items-center justify-center text-zinc-600 font-black text-xl group-hover:text-white transition-colors">
                                      {d.permanentNumber}
                                  </div>
                                  <div>
                                      <span className="block text-lg font-black text-white uppercase leading-none group-hover:text-[#DFFF00] transition-colors">{d.givenName} {d.familyName}</span>
                                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{d.nationality}</span>
                                  </div>
                              </Link>
                          ))}
                      </div>
                  </div>

                  {/* RECENT FORM */}
                  <div>
                      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800">
                           <Activity size={14} className="text-[#DFFF00]"/> 
                           <span className="text-xs font-black tracking-widest uppercase text-white">Recent Performance</span>
                      </div>
                      
                      <div className="space-y-2">
                          {recentResults.map((race: any, i: number) => {
                              // Find best result for team in this race
                              let bestPos = 20;
                              race.Results?.forEach((r: any) => {
                                  const p = parseInt(r.position);
                                  if (p < bestPos) bestPos = p;
                              });
                              
                              return (
                                  <div key={i} className="flex justify-between items-center p-3 bg-zinc-900/30 border-l-2 border-zinc-800 hover:border-[#DFFF00] hover:bg-zinc-900 transition-all">
                                      <span className="text-xs font-bold text-zinc-300 uppercase">{race.raceName.replace(' Grand Prix', '')}</span>
                                      <div className="flex items-center gap-3">
                                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Best Finish</span>
                                          <span className={`text-sm font-black font-mono ${bestPos === 1 ? 'text-[#DFFF00]' : 'text-white'}`}>P{bestPos}</span>
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>

              </div>
          </div>
      </div>
    </div>
  );
}