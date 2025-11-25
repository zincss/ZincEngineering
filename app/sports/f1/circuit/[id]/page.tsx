'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Terminal, BarChart3, Flag, MapPin, Loader2, Trophy, History, Crown, Star, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- SMART SEARCH UTILITY (Duplicated for independence) ---
const searchCommons = async (query: string) => {
    try {
        const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`);
        const data = await res.json();
        if (!data.query || !data.query.pages) return null;
        const pages = Object.values(data.query.pages);
        // @ts-ignore
        return pages.length > 0 ? pages[0].imageinfo[0].url : null;
    } catch (e) { return null; }
};

// --- DIRECT MAP OVERRIDES ---
const DIRECT_MAPS: Record<string, string> = {
    'monza': 'https://commons.wikimedia.org/wiki/Special:FilePath/Monza_track_map.svg',
    'spa': 'https://commons.wikimedia.org/wiki/Special:FilePath/Circuit_de_Spa-Francorchamps.svg',
    'silverstone': 'https://commons.wikimedia.org/wiki/Special:FilePath/Silverstone_Circuit_2020.svg',
    'monaco': 'https://commons.wikimedia.org/wiki/Special:FilePath/Monte_Carlo_Formula_1_track_map.svg',
    'suzuka': 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzuka_circuit_map_2005.svg',
    'interlagos': 'https://commons.wikimedia.org/wiki/Special:FilePath/Autódromo_José_Carlos_Pace_(Interlagos)_track_map.svg',
    'americas': 'https://commons.wikimedia.org/wiki/Special:FilePath/Austin_circuit.svg',
    'red_bull_ring': 'https://commons.wikimedia.org/wiki/Special:FilePath/Red_Bull_Ring.svg',
};

export default function CircuitPage() {
  const { id } = useParams();
  const [circuit, setCircuit] = useState<any>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. FETCH CIRCUIT INFO
        const circuitRes = await fetch(`https://api.jolpi.ca/ergast/f1/circuits/${id}.json`);
        const circuitData = await circuitRes.json();
        const circuitInfo = circuitData.MRData.CircuitTable.Circuits[0];

        if (!circuitInfo) throw new Error("Circuit not found");

        // 2. FETCH RACE HISTORY (WINNERS)
        // We fetch all winners at this circuit to calculate dominance
        const historyRes = await fetch(`https://api.jolpi.ca/ergast/f1/circuits/${id}/results/1.json?limit=1000`);
        const historyData = await historyRes.json();
        const races = historyData.MRData.RaceTable.Races;

        // 3. CALCULATE STATS
        const driverWins: Record<string, number> = {};
        const teamWins: Record<string, number> = {};
        
        races.forEach((race: any) => {
            const driverName = `${race.Results[0].Driver.givenName} ${race.Results[0].Driver.familyName}`;
            const teamName = race.Results[0].Constructor.name;
            
            driverWins[driverName] = (driverWins[driverName] || 0) + 1;
            teamWins[teamName] = (teamWins[teamName] || 0) + 1;
        });

        // Find Top Driver
        const topDriver = Object.keys(driverWins).reduce((a, b) => driverWins[a] > driverWins[b] ? a : b, "N/A");
        const topDriverCount = driverWins[topDriver] || 0;

        // Find Top Team
        const topTeam = Object.keys(teamWins).reduce((a, b) => teamWins[a] > teamWins[b] ? a : b, "N/A");
        const topTeamCount = teamWins[topTeam] || 0;

        // Last Winner
        const lastRace = races[races.length - 1];
        const lastWinner = lastRace ? `${lastRace.Results[0].Driver.givenName} ${lastRace.Results[0].Driver.familyName}` : "N/A";
        const lastYear = lastRace ? lastRace.season : "N/A";

        setCircuit(circuitInfo);
        setStats({
            totalGPs: races.length,
            topDriver,
            topDriverCount,
            topTeam,
            topTeamCount,
            lastWinner,
            lastYear
        });
        setWinners(races.reverse().slice(0, 5)); // Recent 5 winners

        // 4. FETCH MAP IMAGE
        const name = circuitInfo.circuitName;
        if (DIRECT_MAPS[id as string]) {
            setMapImage(DIRECT_MAPS[id as string]);
        } else {
            let url = await searchCommons(`File:${name} Layout.svg`);
            if (!url) url = await searchCommons(`File:${name} track map.svg`);
            if (!url) url = await searchCommons(`File:${name} circuit.png`);
            if (url) setMapImage(url);
        }

        setLoading(false);

      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-black dark:text-white gap-2 font-mono text-xs animate-pulse">
        <Loader2 className="animate-spin" /> UPLINKING TO CIRCUIT DATABASE...
    </div>
  );

  if (!circuit) return <div className="p-12 text-center font-mono">CIRCUIT_NOT_FOUND</div>;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-40 px-4 md:px-0 pt-12">
      
      <Link href="/sports/f1" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-acid px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent hover:border-black"><ArrowLeft size={16} /> RETURN TO HUB</Link>

      {/* MAIN DASHBOARD */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-lg mb-12 relative overflow-hidden">
        
        {/* TOP BAR */}
        <div className="bg-black text-acid text-[10px] font-mono font-bold px-4 py-2 uppercase flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b-2 border-zinc-800">
           <div className="flex items-center gap-2"><Terminal size={12} /> CIRCUIT TELEMETRY // {id}</div>
           <div className="flex gap-4 text-zinc-400">
             <span className="flex items-center gap-1"><Flag size={12}/> {circuit.Location.country.toUpperCase()}</span>
             <span className="text-zinc-600">|</span>
             <span className="flex items-center gap-1"><MapPin size={12}/> {circuit.Location.locality.toUpperCase()}</span>
           </div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-black dark:border-zinc-700">
          
          {/* COL 1: MAP & PROFILE */}
          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col gap-6 border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-zinc-700 relative">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold font-mono uppercase">LAT: {parseFloat(circuit.Location.lat).toFixed(3)}</span>
                     <span className="px-2 py-0.5 border border-black dark:border-zinc-600 text-[9px] font-bold font-mono uppercase text-black dark:text-white">LONG: {parseFloat(circuit.Location.long).toFixed(3)}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter uppercase leading-[0.9] break-words">{circuit.circuitName}</h1>
              </div>

              {/* MAP IMAGE */}
              <div className="aspect-square border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 relative flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-8">
                 {mapImage ? (
                    <img src={mapImage} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:filter dark:invert" alt="Circuit Map" />
                 ) : (
                    <MapIcon className="text-zinc-300 dark:text-zinc-700" size={100} />
                 )}
              </div>

              {/* KEY STATS */}
              <div className="space-y-2">
                 <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="text-[10px] font-black uppercase text-zinc-400">TOTAL GRAND PRIX HELD</span>
                    <span className="text-xl font-black text-black dark:text-white">{stats.totalGPs}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="text-[10px] font-black uppercase text-zinc-400">MOST SUCCESSFUL DRIVER</span>
                    <div className="text-right">
                        <span className="text-xl font-black text-black dark:text-white block leading-none">{stats.topDriver}</span>
                        <span className="text-[9px] font-mono text-acid bg-black px-1">{stats.topDriverCount} WINS</span>
                    </div>
                 </div>
              </div>
          </div>

          {/* COL 2: HISTORICAL DATA */}
          <div className="lg:col-span-7 grid grid-rows-[auto_1fr] border-l-2 border-black dark:border-zinc-700">
              
              {/* ROW 1: DOMINANCE & LAST WINNER */}
              <div className="bg-zinc-900 text-zinc-300 p-6 border-b-2 border-black dark:border-zinc-700 flex flex-col h-auto lg:h-[320px]">
                  <div className="flex items-center gap-2 text-acid mb-6 pb-2 border-b border-zinc-800">
                    <Crown size={14} />
                    <span className="font-bold tracking-widest font-mono text-xs">CIRCUIT LEGENDS // DOMINANCE LOG</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-zinc-800/50 p-4 border border-zinc-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy size={14} className="text-acid" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">REIGNING VICTOR ({stats.lastYear})</span>
                            </div>
                            <div className="text-2xl font-black text-white leading-none uppercase break-words">
                                {stats.lastWinner}
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 p-4 border border-zinc-700">
                            <div className="flex items-center gap-2 mb-2">
                                <History size={14} className="text-acid" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">TOP CONSTRUCTOR</span>
                            </div>
                            <div className="text-2xl font-black text-white leading-none uppercase break-words">
                                {stats.topTeam}
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 mt-1 block">{stats.topTeamCount} VICTORIES</span>
                        </div>
                  </div>
              </div>

              {/* ROW 2: RECENT WINNERS TABLE */}
              <div className="bg-white dark:bg-zinc-900 p-6 flex flex-col h-full min-h-[300px]">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                             <Activity size={14} className="text-black dark:text-white"/> 
                             <span className="text-xs font-black tracking-widest uppercase text-black dark:text-white">RECENT VICTORS (LAST 5 RACES)</span>
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                        {winners.map((race: any) => {
                            const driver = race.Results[0].Driver;
                            const team = race.Results[0].Constructor;
                            
                            return (
                                <div key={race.season} className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-2 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-black dark:text-white uppercase leading-none">{driver.givenName} {driver.familyName}</span>
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase">{team.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-zinc-300 dark:text-zinc-700">{race.season}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
              </div>

          </div>
        </div>
      </div>
    </div>
  );
}