'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Terminal, Flag, MapPin, Loader2, Trophy, History, Crown, Users, Car, Wrench, BarChart3, Star, Building2, Zap } from 'lucide-react';
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
  // EXACT filenames from Wikimedia Commons
  const TEAM_CAR_MAP: Record<string, string> = {
      // Active Grid (2024 Specs)
      'red_bull': 'https://commons.wikimedia.org/wiki/Special:FilePath/RB20_During_the_2024_Japanese_Free_Practice.jpg', //
      'mercedes': 'https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes_W15_on_display_-_2024_Chinese_GP.jpg', //
      'ferrari': 'https://commons.wikimedia.org/wiki/Special:FilePath/SF-24_at_the_Japanese_GP.jpg', //
      'mclaren': 'https://commons.wikimedia.org/wiki/Special:FilePath/McLaren_MCL38.jpg', //
      'aston_martin': 'https://commons.wikimedia.org/wiki/Special:FilePath/2024_Aston_Martin_AMR24.jpg', //
      'alpine': 'https://commons.wikimedia.org/wiki/Special:FilePath/2024_Alpine_A524_Show_car.jpg', //
      'williams': 'https://commons.wikimedia.org/wiki/Special:FilePath/Williams_Racing_2024.jpg', //
      'rb': 'https://commons.wikimedia.org/wiki/Special:FilePath/RB_VCARB01_2024_Chinese_GP.jpg', //
      'sauber': 'https://commons.wikimedia.org/wiki/Special:FilePath/Valtteri_Bottas_Chinese_GP_2024.jpg', //
      'haas': 'https://commons.wikimedia.org/wiki/Special:FilePath/Nico_Hulkenberg_2024_Chinese_GP.jpg', //
      
      // Historical Legends
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

  // --- 4. HARDCODED TITLES ---
  const WCC_TITLES: Record<string, number> = {
      'ferrari': 16, 'williams': 9, 'mclaren': 8, 'mercedes': 8, 'lotus_f1': 7, 'team_lotus': 7, 
      'red_bull': 6, 'cooper': 2, 'brabham': 2, 'renault': 2, 'benetton': 1, 'brawn': 1, 'vanwall': 1, 'matra': 1, 'tyrrell': 1
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. BASIC INFO
        const infoRes = await fetch(`https://api.jolpi.ca/ergast/f1/constructors/${id}.json`);
        const infoData = await infoRes.json();
        const constructor = infoData.MRData.ConstructorTable.Constructors[0];
        if (!constructor) throw new Error("Team not found");
        setTeam(constructor);

        // 2. IMAGES (Parallel)
        const name = constructor.name;
        let logoUrl = TEAM_LOGO_MAP[id as string];
        if (!logoUrl) {
             logoUrl = await searchCommons(`File:${name} F1 logo.svg`) || 
                       await searchCommons(`File:${name} logo.svg`) ||
                       await searchCommons(`File:${name} logo.png`);
        }
        
        // CAR IMAGE LOGIC
        let carUrl = TEAM_CAR_MAP[id as string];
        if (!carUrl) {
             // Historical Fallback
             carUrl = await searchCommons(`File:${name} F1 car.jpg`);
             if (!carUrl) carUrl = await searchCommons(`File:${name} Formula One car.jpg`);
        }
        
        setImages({ logo: logoUrl || null, car: carUrl || null });

        // 3. RECENT FORM
        const recentRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/constructors/${id}/results.json?limit=10`);
        const recentData = await recentRes.json();
        let lastRaces = recentData.MRData.RaceTable.Races;
        
        if (lastRaces.length === 0) {
             const prevRes = await fetch(`https://api.jolpi.ca/ergast/f1/2024/constructors/${id}/results.json?limit=10`);
             const prevData = await prevRes.json();
             lastRaces = prevData.MRData.RaceTable.Races;
        }
        setRecentResults(lastRaces.slice(-5));

        // 4. NOTABLE DRIVERS
        const winnersRes = await fetch(`https://api.jolpi.ca/ergast/f1/constructors/${id}/results/1.json?limit=500`);
        const winnersData = await winnersRes.json();
        const winningRaces = winnersData.MRData.RaceTable.Races;
        
        const winCount = parseInt(winnersData.MRData.total);
        const driverWinMap: Record<string, any> = {};

        winningRaces.forEach((race: any) => {
            const d = race.Results[0].Driver;
            if (!driverWinMap[d.driverId]) {
                driverWinMap[d.driverId] = { ...d, wins: 0 };
            }
            driverWinMap[d.driverId].wins++;
        });

        let notableDrivers = Object.values(driverWinMap).sort((a: any, b: any) => b.wins - a.wins);

        if (notableDrivers.length === 0) {
            const currentDriversRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/constructors/${id}/drivers.json`);
            const currentDriversData = await currentDriversRes.json();
            notableDrivers = currentDriversData.MRData.DriverTable.Drivers;
        }

        // 5. STATS AGGREGATION
        const polesRes = await fetch(`https://api.jolpi.ca/ergast/f1/constructors/${id}/qualifying/1.json?limit=1`);
        const polesData = await polesRes.json();
        const poleCount = parseInt(polesData.MRData.total);
        
        const entriesRes = await fetch(`https://api.jolpi.ca/ergast/f1/constructors/${id}/results.json?limit=1`);
        const entriesData = await entriesRes.json();
        const entryCount = parseInt(entriesData.MRData.total);

        setStats({ 
            wins: winCount, 
            poles: parseInt(polesData.MRData.total), 
            entries: parseInt(entriesData.MRData.total),
            titles: WCC_TITLES[id as string] || 0,
            factory: FACTORY_DATA[id as string] || { hq: 'Unknown Location', engine: 'Various' }
        });
        
        setDrivers(notableDrivers.slice(0, 12));
        setLoading(false);

      } catch (e) {
        console.error("Team Data Error:", e);
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-black dark:text-white gap-2 font-mono text-xs animate-pulse">
        <Loader2 className="animate-spin" /> ACCESSING CONSTRUCTOR ARCHIVES...
    </div>
  );

  if (!team) return <div className="p-12 text-center font-mono">TEAM_NOT_FOUND</div>;

  const log = recentResults.length > 0 ? {
      name: recentResults[recentResults.length - 1].raceName,
      year: recentResults[recentResults.length - 1].season,
      pos: recentResults[recentResults.length - 1].Results[0].positionText,
      delta: parseInt(recentResults[recentResults.length - 1].Results[0].grid) - parseInt(recentResults[recentResults.length - 1].Results[0].position) > 0 ? "GAINED" : "LOST/HELD",
      color: parseInt(recentResults[recentResults.length - 1].Results[0].grid) - parseInt(recentResults[recentResults.length - 1].Results[0].position) > 0 ? "text-acid" : "text-zinc-400"
  } : null;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-40 px-4 md:px-0 pt-12">
      
      <Link href="/sports/f1" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-acid px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent hover:border-black"><ArrowLeft size={16} /> RETURN TO HUB</Link>

      {/* DASHBOARD HEADER */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-lg mb-12 relative overflow-hidden">
        
        {/* TOP BAR */}
        <div className="bg-black text-acid text-[10px] font-mono font-bold px-4 py-2 uppercase flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b-2 border-zinc-800">
           <div className="flex items-center gap-2"><Terminal size={12} /> CONSTRUCTOR TELEMETRY // {id}</div>
           <div className="flex gap-4 text-zinc-400">
             <span className="flex items-center gap-1"><Flag size={12}/> {team.nationality.toUpperCase()}</span>
           </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-black dark:border-zinc-700">
          
          {/* COL 1: IDENTITY (Logo & Car) */}
          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col gap-6 border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-zinc-700 relative">
              <div className="flex-1 flex flex-col items-center justify-center py-8 min-h-[200px]">
                  {images.logo ? (
                      <img src={images.logo} className="w-48 h-48 object-contain mb-6 mix-blend-multiply dark:mix-blend-normal dark:filter dark:invert" alt="Logo" />
                  ) : (
                      <Wrench size={64} className="text-zinc-300 dark:text-zinc-700 mb-6" />
                  )}
                  <h1 className="text-4xl md:text-5xl font-black text-center uppercase leading-none tracking-tighter text-black dark:text-white break-words w-full">{team.name}</h1>
              </div>

              {/* FACTORY BLOCK */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <Activity size={14} className="text-acid"/>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">FACTORY DATA</span>
                  </div>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase flex items-center gap-1"><Building2 size={10}/> HQ LOCATION</span>
                          <span className="text-xs font-mono font-bold text-black dark:text-white uppercase">{stats?.factory.hq}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase flex items-center gap-1"><Zap size={10}/> POWER UNIT</span>
                          <span className="text-xs font-mono font-bold text-black dark:text-white uppercase">{stats?.factory.engine}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase flex items-center gap-1"><Flag size={10}/> LICENSE</span>
                          <span className="text-xs font-mono font-bold text-black dark:text-white uppercase">{team.nationality}</span>
                      </div>
                  </div>
              </div>
              
              {images.car && (
                  <div className="border-2 border-black dark:border-zinc-700 h-48 overflow-hidden relative group">
                      <img src={images.car} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Car" />
                      <div className="absolute bottom-0 left-0 bg-black text-white text-[9px] font-bold px-2 py-1">MACHINE ARCHIVE</div>
                  </div>
              )}
          </div>

          {/* COL 2: TROPHY CASE & DRIVERS */}
          <div className="lg:col-span-7 grid grid-rows-[auto_1fr]">
              
              <div className="bg-zinc-900 text-zinc-300 p-8 border-b-2 border-black dark:border-zinc-700">
                  <div className="flex items-center gap-2 text-acid mb-6">
                    <Crown size={16} />
                    <span className="font-bold tracking-widest font-mono text-xs">LEGACY REPORT</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
                      <div className="p-3 border border-zinc-700 bg-black">
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">CHAMPIONSHIPS</span>
                          <span className="text-3xl font-black text-white">{stats?.titles || 0}</span>
                      </div>
                      <div className="p-3 border border-zinc-700 bg-zinc-800/50">
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">RACE WINS</span>
                          <span className="text-2xl font-black text-white">{stats?.wins || 0}</span>
                      </div>
                      <div className="p-3 border border-zinc-700 bg-zinc-800/50">
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">POLE POSITIONS</span>
                          <span className="text-2xl font-black text-white">{stats?.poles || 0}</span>
                      </div>
                      <div className="p-3 border border-zinc-700 bg-zinc-800/50">
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">TOTAL ENTRIES</span>
                          <span className="text-2xl font-black text-white">{stats?.entries || 0}</span>
                      </div>
                  </div>

                  {log && (
                      <div className="bg-black/30 p-4 border-l-2 border-acid text-[10px] font-mono">
                          <span className="text-acid font-bold block mb-1">LATEST TELEMETRY: {log.year} {log.name.toUpperCase()}</span>
                          <span className="text-zinc-400">Result: <span className="text-white font-bold">P{log.pos}</span>. &gt; TACTICAL: <span className={log.color}>{log.delta}</span> vs Grid.</span>
                      </div>
                  )}
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 flex flex-col">
                    <div className="mb-8">
                         <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-zinc-100 dark:border-zinc-800">
                             <BarChart3 size={14} className="text-black dark:text-white"/> 
                             <span className="text-xs font-black tracking-widest uppercase text-black dark:text-white">RECENT FORM (LAST 5 RACES)</span>
                        </div>
                        
                        {recentResults.length > 0 ? (
                            <div className="grid grid-cols-5 gap-2 h-24 items-end">
                                {recentResults.map((race: any, i: number) => {
                                    let bestPos = 20;
                                    // Safety check for Results array
                                    if (race.Results) {
                                        race.Results.forEach((r: any) => {
                                            const p = parseInt(r.position);
                                            if (p < bestPos) bestPos = p;
                                        });
                                    }

                                    const isWin = bestPos === 1;
                                    const isPodium = bestPos <= 3;
                                    const height = Math.max(10, 100 - (bestPos * 4)); 
                                    // Safety check for Circuit.Location
                                    const countryCode = race.Circuit?.Location?.country?.slice(0,3).toUpperCase() || "GP";
                                    
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-2 group h-full justify-end">
                                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 relative flex items-end overflow-hidden h-full">
                                                <div 
                                                    className={`w-full transition-all duration-500 ${isWin ? 'bg-acid' : isPodium ? 'bg-black dark:bg-white' : 'bg-zinc-400'}`}
                                                    style={{ height: `${height}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                 <span className="text-[9px] font-black font-mono text-black dark:text-white">P{bestPos}</span>
                                                 <span className="text-[7px] font-mono text-zinc-400 uppercase truncate max-w-[40px]">{countryCode}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-xs font-mono text-zinc-400 py-4">NO RECENT TELEMETRY AVAILABLE.</div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-zinc-100 dark:border-zinc-800">
                         <Users size={14} className="text-black dark:text-white"/> 
                         <span className="text-xs font-black tracking-widest uppercase text-black dark:text-white">NOTABLE DRIVERS ({drivers.length})</span>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 content-start">
                        {drivers.map((d: any) => (
                            <Link href={`/sports/f1/driver/${d.driverId}`} key={d.driverId} className="flex items-center gap-2 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group">
                                <Star size={10} className={`group-hover:text-acid transition-colors ${d.wins > 0 ? 'text-acid fill-acid' : 'text-zinc-300'}`} />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[10px] font-bold uppercase truncate text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white">
                                        {d.givenName.charAt(0)}. <span className="text-black dark:text-white">{d.familyName}</span>
                                    </span>
                                    {d.wins > 0 && <span className="text-[8px] font-mono text-zinc-400">{d.wins} WINS</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
              </div>

          </div>
        </div>
      </div>
    </div>
  );
}