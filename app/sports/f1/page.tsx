'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Flag, Loader2, AlertTriangle, User, History, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// --- GLOBAL CACHE ---
let globalDriverCache: any[] = [];
let isCacheLoaded = false;

// --- 1. VERIFIED IMAGE MAP (Curated High-Res) ---
// We keep this for the absolute best 2025 photos, but the new "Smart Search" makes it less critical.
const DRIVER_IMG_MAP: Record<string, string> = {
    'antonelli': 'https://commons.wikimedia.org/wiki/Special:FilePath/2025_Japan_GP_-_Mercedes_-_Kimi_Antonelli_-_FP2.jpg',
    'bearman': 'https://commons.wikimedia.org/wiki/Special:FilePath/2025_Japan_GP_-_Haas_-_Oliver_Bearman_-_FP2.jpg',
    'doohan': 'https://commons.wikimedia.org/wiki/Special:FilePath/2025_Japan_GP_-_Alpine_-_Jack_Doohan_-_FP3.jpg',
    'lawson': 'https://commons.wikimedia.org/wiki/Special:FilePath/2025_Japan_GP_-_Racing_Bulls_-_Liam_Lawson_-_FP2.jpg',
    'bortoleto': 'https://commons.wikimedia.org/wiki/Special:FilePath/Gabriel_Bortoleto_(cropped).jpg',
    'colapinto': 'https://commons.wikimedia.org/wiki/Special:FilePath/Franco_Colapinto_F3_2023_Austria.jpg',
};

// --- NEW: SMART SEARCH FUNCTION ---
// Searches Wikimedia Commons directly if the main Wikipedia page fails.
const searchCommons = async (query: string) => {
    try {
        const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`);
        const data = await res.json();
        if (!data.query || !data.query.pages) return null;
        
        const pages = Object.values(data.query.pages);
        if (pages.length > 0) {
            // @ts-ignore
            return pages[0].imageinfo[0].url;
        }
    } catch (e) {
        return null;
    }
    return null;
};

const DriverCard = ({ driver, isHistorical = false }: { driver: any, isHistorical?: boolean }) => {
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchImage = async () => {
            const did = driver.driverId;
            const fullName = `${driver.givenName} ${driver.familyName}`;

            // STEP 1: Check Verified Map (Fastest)
            if (did && DRIVER_IMG_MAP[did]) {
                setImage(DRIVER_IMG_MAP[did]);
                return;
            }

            // STEP 2: Try Standard Wikipedia Page Image
            // This is the "official" profile pic method.
            let wikiSuccess = false;
            if (driver.url) {
                try {
                    const slug = driver.url.split('/wiki/')[1];
                    const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${slug}&prop=pageimages&format=json&pithumbsize=400&origin=*`);
                    const wikiData = await wikiRes.json();
                    const pages = wikiData.query.pages;
                    const pageId = Object.keys(pages)[0];
                    
                    if (pageId !== "-1") {
                        const imgUrl = pages[pageId]?.thumbnail?.source;
                        if (imgUrl) {
                            setImage(imgUrl);
                            wikiSuccess = true;
                        }
                    }
                } catch(e) { 
                    // Silent fail, move to Step 3
                }
            }

            // STEP 3: THE "SMART SEARCH" FALLBACK
            // If Step 2 failed, we hunt for a file directly on Commons.
            if (!wikiSuccess) {
                // Try searching for "Driver Name 2024" to get a recent pic
                let commonsUrl = await searchCommons(`File:${fullName} 2024`);
                
                // If that fails, try just the name (e.g. historical drivers)
                if (!commonsUrl) {
                    commonsUrl = await searchCommons(`File:${fullName} racing`);
                }

                if (commonsUrl) setImage(commonsUrl);
            }
        };
        fetchImage();
    }, [driver]);

    // Format Position Logic
    const formatPosition = (pos: string) => {
        if (!pos) return '-';
        if (/^\d+$/.test(pos)) return `P${pos}`;
        if (['R', 'W', 'N', 'F'].includes(pos)) return 'DNF'; 
        if (pos === 'D') return 'DSQ';
        return pos; 
    };

    const latestPosDisplay = !isHistorical && driver.stats?.latest 
        ? formatPosition(driver.stats.latest.pos) 
        : '-';

    const formatRaceName = (name: string) => {
        if (!name) return '';
        return name
            .replace(' Grand Prix', '')
            .replace('Saudi Arabia', 'KSA')
            .replace('United States', 'USA')
            .replace('Emilia Romagna', 'Imola')
            .toUpperCase();
    };

    const latestRaceName = !isHistorical && driver.stats?.latest?.race 
        ? formatRaceName(driver.stats.latest.race)
        : '';

    return (
        <Link href={`/sports/f1/driver/${driver.driverId}`} className="group">
            <div className={`h-40 border-2 ${isHistorical ? 'border-zinc-400 dark:border-zinc-700 opacity-80 hover:opacity-100' : 'border-black dark:border-zinc-500'} bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex relative overflow-hidden`}>
                
                {/* Image Area */}
                <div className="w-32 bg-zinc-100 dark:bg-zinc-950 border-r-2 border-inherit relative shrink-0 overflow-hidden">
                    {image ? (
                        <img src={image} className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                            <User size={40} />
                        </div>
                    )}
                    {driver.permanentNumber && (
                        <div className="absolute bottom-0 right-0 bg-black text-white text-xs font-black px-2 py-1">
                            #{driver.permanentNumber}
                        </div>
                    )}
                </div>

                {/* Info Area */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">
                                {isHistorical ? 'HISTORICAL' : 'ACTIVE GRID'}
                            </span>
                             {driver.nationality && (
                                <span className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 px-1 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                   {driver.nationality.slice(0,3).toUpperCase()}
                                </span>
                             )}
                        </div>
                        <h3 className="text-xl font-black uppercase leading-none text-black dark:text-white mb-1 line-clamp-2">
                            {driver.givenName} {driver.familyName}
                        </h3>
                    </div>
                    
                    {/* Stats */}
                    {!isHistorical && driver.points ? (
                        <div className="grid grid-cols-3 gap-1 border-t-2 border-zinc-100 dark:border-zinc-800 pt-2 mt-1">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">PTS</span>
                                <span className="text-sm font-black text-acid bg-black px-1 w-fit leading-none py-0.5">{driver.points}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">LATEST</span>
                                <div className="flex flex-col leading-none">
                                    <span className={`text-sm font-black ${latestPosDisplay === 'DNF' || latestPosDisplay === 'DSQ' ? 'text-red-500' : 'text-black dark:text-white'}`}>
                                        {latestPosDisplay}
                                    </span>
                                    {latestRaceName && <span className="text-[7px] font-mono font-bold text-zinc-400 truncate w-full">{latestRaceName}</span>}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">BEST</span>
                                <span className="text-sm font-black text-black dark:text-white leading-none">P{driver.stats?.best || '-'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mt-auto">
                            {driver.code && (
                                <div className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1">
                                    CODE: {driver.code}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default function F1Search() {
  const [search, setSearch] = useState('');
  const [activeDrivers, setActiveDrivers] = useState<any[]>([]); 
  const [historicalDrivers, setHistoricalDrivers] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");

  const downloadStarted = useRef(false);

  // FETCH ACTIVE GRID
  const fetchActiveGrid = async (forceRefresh = false) => {
      if (forceRefresh) setIsRefreshing(true);
      try {
        const timestamp = forceRefresh ? `&t=${Date.now()}` : '';
        const timestampFirst = forceRefresh ? `?t=${Date.now()}` : '';

        // 1. Points
        const standingsRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/driverStandings.json${timestampFirst}`);
        const standingsData = await standingsRes.json();
        const standingsList = standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];

        // 2. Latest Race (Truth)
        const lastRaceRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/last/results.json${timestampFirst}`);
        const lastRaceData = await lastRaceRes.json();
        const lastRace = lastRaceData.MRData.RaceTable.Races[0];

        // 3. Full Season
        const allResultsRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/results.json?limit=1000${timestamp}`);
        const allResultsData = await allResultsRes.json();
        const allRaces = allResultsData.MRData.RaceTable.Races;

        // 4. Process
        const driverStats: Record<string, { best: number, latest: { pos: string, race: string } }> = {};

        allRaces.forEach((race: any) => {
            race.Results.forEach((result: any) => {
                const did = result.Driver.driverId;
                const pos = parseInt(result.position); 
                
                if (!driverStats[did]) driverStats[did] = { best: 99, latest: { pos: '-', race: '' } };
                if (!isNaN(pos) && pos < driverStats[did].best) {
                    driverStats[did].best = pos;
                }
            });
        });

        if (lastRace && lastRace.Results) {
            lastRace.Results.forEach((result: any) => {
                const did = result.Driver.driverId;
                if (!driverStats[did]) driverStats[did] = { best: 99, latest: { pos: '-', race: '' } };
                
                driverStats[did].latest = {
                    pos: result.positionText,
                    race: lastRace.raceName
                };
            });
        }

        const drivers = standingsList.map((ds: any) => {
            const did = ds.Driver.driverId;
            const stats = driverStats[did] || { best: 99, latest: { pos: '-', race: '' } };
            
            return {
                ...ds.Driver,
                points: ds.points,
                stats: {
                    best: stats.best === 99 ? '-' : stats.best,
                    latest: stats.latest
                }
            };
        });
        
        setActiveDrivers(drivers);
        
        const now = new Date();
        setLastSync(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
        
        setError(false);
      } catch (e) {
        console.error("F1 Uplink Failed:", e);
        setError(true);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
  };

  useEffect(() => {
    fetchActiveGrid();
  }, []);

  useEffect(() => {
    const fetchAllDrivers = async () => {
      if (isCacheLoaded || downloadStarted.current) return;
      downloadStarted.current = true;
      setArchiveLoading(true);
      try {
        const initRes = await fetch('https://api.jolpi.ca/ergast/f1/drivers.json?limit=1');
        const initData = await initRes.json();
        const total = parseInt(initData.MRData.total);
        const limit = 100;
        const batches = Math.ceil(total / limit);
        const promises = [];
        for (let i = 0; i < batches; i++) {
            promises.push(
                fetch(`https://api.jolpi.ca/ergast/f1/drivers.json?limit=${limit}&offset=${i * limit}`)
                    .then(res => res.json())
                    .then(data => data.MRData.DriverTable.Drivers)
            );
        }
        const results = await Promise.all(promises);
        globalDriverCache = results.flat();
        isCacheLoaded = true;
        if (search.length >= 2) updateSearchResults(search);
      } catch (e) {
        downloadStarted.current = false; 
      } finally {
        setArchiveLoading(false);
      }
    };
    if (search.length > 0 && !isCacheLoaded) fetchAllDrivers();
  }, [search]);

  const updateSearchResults = (term: string) => {
      if (term.length < 2) {
          setHistoricalDrivers([]);
          return;
      }
      const matches = globalDriverCache.filter((d: any) => 
          d.givenName.toLowerCase().includes(term.toLowerCase()) || 
          d.familyName.toLowerCase().includes(term.toLowerCase())
      );
      const uniqueMatches = matches.filter((d: any) => !activeDrivers.find((ad: any) => ad.driverId === d.driverId));
      setHistoricalDrivers(uniqueMatches.slice(0, 50));
  };

  useEffect(() => {
      if (isCacheLoaded) updateSearchResults(search);
  }, [search, isCacheLoaded, activeDrivers]);

  const filteredActive = activeDrivers.filter(d => 
    d.givenName.toLowerCase().includes(search.toLowerCase()) || 
    d.familyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 pt-12 pb-20">
      <div className="mb-12 border-b-2 border-black dark:border-zinc-700 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
            <div className="flex items-center gap-2 text-acid mb-2">
                <Flag size={14} />
                <span className="font-mono text-[10px] font-bold tracking-widest text-black dark:text-white">ARCHIVE ACCESS // UNRESTRICTED</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black dark:text-white">
            DRIVER<br/>DATABASE
            </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
            {lastSync && (
                <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-green-500"/> SYNCED: {lastSync}
                </span>
            )}
            <button 
                onClick={() => fetchActiveGrid(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-3 font-bold font-mono text-xs uppercase tracking-widest hover:bg-acid hover:text-black dark:hover:bg-acid transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
            >
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                {isRefreshing ? "ESTABLISHING UPLINK..." : "UPDATE TELEMETRY"}
            </button>
        </div>
      </div>

      <div className="mb-12 sticky top-24 z-30">
        <div className="relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                {archiveLoading ? <Loader2 size={20} className="animate-spin"/> : <Search size={20} />}
            </div>
            <input 
                type="text" 
                placeholder={archiveLoading ? "DOWNLOADING HISTORICAL ARCHIVE (PLEASE WAIT)..." : "SEARCH ANY DRIVER (E.G. SENNA, SCHUMACHER)..."}
                className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-12 pr-4 font-bold font-mono text-lg uppercase focus:outline-none focus:border-acid transition-colors text-black dark:text-white placeholder:text-zinc-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
            />
        </div>
        {archiveLoading && (
            <div className="absolute -bottom-6 left-0 text-[9px] font-mono font-bold text-acid animate-pulse">
                SYNCING COMPLETE DATABASE...
            </div>
        )}
      </div>

      {error && (
          <div className="p-8 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold font-mono flex items-center gap-4 mb-8">
             <AlertTriangle size={24} />
             <span>CONNECTION LOST: UNABLE TO RETRIEVE DATA STREAM.</span>
          </div>
      )}

      {filteredActive.length > 0 && (
          <div className="mb-12">
              <div className="flex items-center gap-2 mb-4 text-black dark:text-white">
                  <Activity size={16} className="text-acid"/>
                  <span className="text-xs font-black tracking-widest uppercase">2025 ACTIVE GRID</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredActive.map((driver) => (
                      <DriverCard key={driver.driverId} driver={driver} />
                  ))}
              </div>
          </div>
      )}

      {historicalDrivers.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-4 text-black dark:text-white">
                  <History size={16} className="text-zinc-400"/>
                  <span className="text-xs font-black tracking-widest uppercase">HISTORICAL ARCHIVES ({historicalDrivers.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {historicalDrivers.map((driver) => (
                      <DriverCard key={driver.driverId} driver={driver} isHistorical={true} />
                  ))}
              </div>
          </div>
      )}

      {!loading && !archiveLoading && filteredActive.length === 0 && historicalDrivers.length === 0 && search.length > 0 && (
          <div className="text-center py-20 border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 font-mono text-sm">
              NO MATCHING RECORDS IN ARCHIVE.
          </div>
      )}
    </div>
  );
}