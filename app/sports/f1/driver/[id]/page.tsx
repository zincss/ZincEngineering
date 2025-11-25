'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Terminal, BarChart3, Flag, MapPin, Loader2, Trophy, Timer, History } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DriverPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentRaces, setRecentRaces] = useState<any[]>([]);
  const [driverImage, setDriverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. FETCH BASIC INFO (Name, Number, Nationality)
        // This works for ANY driver, active or retired.
        const infoRes = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${id}.json`);
        const infoData = await infoRes.json();
        const driverInfo = infoData.MRData.DriverTable.Drivers[0];

        if (!driverInfo) throw new Error("Driver not found");

        // 2. FETCH CAREER RESULTS (To calculate stats manually)
        // Limit=1000 ensures we get their ENTIRE career (Alonso has ~400, so this is safe)
        const resultsRes = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${id}/results.json?limit=1000`);
        const resultsData = await resultsRes.json();
        const allRaces = resultsData.MRData.RaceTable.Races;

        // 3. CALCULATE STATS LOCALLY
        let wins = 0;
        let podiums = 0;
        let points = 0;
        let teamName = "Free Agent";

        allRaces.forEach((race: any) => {
            const pos = parseInt(race.Results[0].position);
            const pts = parseFloat(race.Results[0].points);
            
            if (pos === 1) wins++;
            if (pos <= 3) podiums++;
            points += pts;
            
            // Keep updating team name to find their LATEST team
            teamName = race.Results[0].Constructor.name;
        });

        // 4. GET WIKIPEDIA IMAGE
        if (driverInfo.url) {
            try {
                const slug = driverInfo.url.split('/wiki/')[1];
                const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${slug}&prop=pageimages&format=json&pithumbsize=600&origin=*`);
                const wikiData = await wikiRes.json();
                const pages = wikiData.query.pages;
                const pageId = Object.keys(pages)[0];
                const imgUrl = pages[pageId]?.thumbnail?.source;
                if (imgUrl) setDriverImage(imgUrl);
            } catch(e) {} // Silent fail
        }

        setProfile({ ...driverInfo, team: teamName });
        setStats({ wins, podiums, points, races: allRaces.length });
        setRecentRaces(allRaces.slice(-5).reverse()); // Last 5 races
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
        <Loader2 className="animate-spin" /> ACCESSING ARCHIVES...
    </div>
  );

  if (!profile) return <div className="p-12 text-center font-mono">DRIVER_NOT_FOUND</div>;

  // Helper for "Engineering Log" text
  const getLastRaceLog = () => {
      if (recentRaces.length === 0) return null;
      const last = recentRaces[0]; // It's reversed, so 0 is latest
      const res = last.Results[0];
      
      const grid = parseInt(res.grid);
      const pos = parseInt(res.position);
      const start = grid === 0 ? 20 : grid;
      const diff = start - pos;

      return {
          name: last.raceName,
          year: last.season,
          pos: res.positionText,
          delta: diff > 0 ? `GAINED ${diff} POS` : diff < 0 ? `LOST ${Math.abs(diff)} POS` : "POSITION HELD",
          color: diff > 0 ? "text-acid" : diff < 0 ? "text-red-500" : "text-zinc-400"
      };
  };

  const log = getLastRaceLog();

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

              {/* DRIVER IMAGE */}
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

          {/* COL 2: ENGINEERING LOG */}
          <div className="lg:col-span-8 grid grid-rows-[auto_1fr] border-l-2 border-black dark:border-zinc-700">
              
              {/* ROW 1: LATEST RACE PERFORMANCE */}
              <div className="bg-zinc-900 text-zinc-300 p-6 border-b-2 border-black dark:border-zinc-700 flex flex-col h-[320px]">
                  <div className="flex items-center gap-2 text-acid mb-4 pb-2 border-b border-zinc-800">
                    <Activity size={14} />
                    <span className="font-bold tracking-widest font-mono text-xs">ZINC ENGINEERING LOG // LAST KNOWN TELEMETRY</span>
                  </div>
                  
                  {log ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-black border border-zinc-800 p-3">
                                <span className="text-acid font-bold block mb-1 text-[9px] uppercase tracking-wider">TRACK LOCATION</span>
                                <span className="text-white uppercase font-bold text-sm truncate">{log.name}</span>
                            </div>
                            <div className="bg-black border border-zinc-800 p-3">
                                <span className="text-acid font-bold block mb-1 text-[9px] uppercase tracking-wider">SEASON</span>
                                <span className="text-zinc-400 uppercase font-bold text-sm">{log.year}</span>
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 p-4 border border-zinc-700 flex-1">
                            <span className="text-acid font-bold block mb-2 flex items-center gap-2 text-[10px] uppercase"><MapPin size={12}/> PERFORMANCE SUMMARY</span>
                            <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                                In their final recorded session at the {log.year} {log.name}, the subject crossed the finish line in <span className="text-white font-bold">P{log.pos}</span>.
                                <br/><br/>
                                {/* FIX APPLIED HERE: Replaced '>' with '&gt;' */}
                                <span className="text-white">&gt; TACTICAL ASSESSMENT:</span> <span className={log.color}>{log.delta}</span> vs Grid Position.
                            </p>
                        </div>
                      </>
                  ) : (
                      <div className="text-zinc-500 font-mono text-xs">No race data available.</div>
                  )}
              </div>

              {/* ROW 2: LAST 5 RACES CHART */}
              <div className="bg-white dark:bg-zinc-900 p-6 flex flex-col h-full min-h-[300px]">
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
                            const pos = parseInt(race.Results[0].position) || 20; // Default to 20 if DNF/R
                            const isDNF = isNaN(parseInt(race.Results[0].positionText));

                            return (
                                <div key={race.date} className="group">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="font-black text-xs uppercase text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors truncate max-w-[200px]">{race.raceName} '{race.season.slice(2)}</span>
                                        <span className={`font-mono text-[10px] font-bold ${isDNF ? 'text-red-500' : 'text-black dark:text-white'}`}>
                                            {isDNF ? 'DNF' : `P${pText}`}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 skew-x-[-12deg] relative">
                                        {/* Bar logic: 1st place = 100%, 20th = 5% */}
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
    </div>
  );
}