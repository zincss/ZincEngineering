'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Flag, Loader2, Trophy, AlertTriangle, User, History, Activity, RefreshCw, CheckCircle2, Map, MapPin, Share2, Info } from 'lucide-react';
import Link from 'next/link';

// --- UTILS: SMART IMAGE SEARCH ---
const searchCommons = async (query: string) => {
    try {
        const safeQuery = `${query} F1 driver portrait 2024`;
        const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(safeQuery)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`);
        const data = await res.json();
        if (!data.query || !data.query.pages) return null;
        const pages = Object.values(data.query.pages);
        // @ts-ignore
        return pages.length > 0 ? pages[0].imageinfo[0].url : null;
    } catch (e) { return null; }
};

// --- COMPONENT 1: DRIVER CARD (Unchanged) ---
const DriverCard = ({ driver, isHistorical = false }: { driver: any, isHistorical?: boolean }) => {
    const [image, setImage] = useState<string | null>(null);

    const ROOKIE_IMG_MAP: Record<string, string> = {
        'antonelli': 'https://commons.wikimedia.org/wiki/Special:FilePath/Antonelli_Barcelona_2024_(cropped).jpg',
        'k_antonelli': 'https://commons.wikimedia.org/wiki/Special:FilePath/Antonelli_Barcelona_2024_(cropped).jpg',
        'bearman': 'https://commons.wikimedia.org/wiki/Special:FilePath/Oliver_Bearman_Formula_2_2024_Bahrain.jpg',
        'doohan': 'https://commons.wikimedia.org/wiki/Special:FilePath/Jack_Doohan_2023.jpg',
        'lawson': 'https://commons.wikimedia.org/wiki/Special:FilePath/Liam_Lawson_Austria_2022.jpg',
        'bortoleto': 'https://commons.wikimedia.org/wiki/Special:FilePath/Gabriel_Bortoleto_(cropped).jpg',
        'colapinto': 'https://commons.wikimedia.org/wiki/Special:FilePath/Conferencia_de_prensa_Colapinto_ACA_octubre_2023_-_BugWarp_(13)_(cropped).jpg',
        'hadjar': 'https://commons.wikimedia.org/wiki/Special:FilePath/Isack_Hadjar_2022_(cropped).JPG',
        'iwasa': 'https://commons.wikimedia.org/wiki/Special:FilePath/Ayumu_Iwasa_F2_Austria_2022.jpg',
    };

    useEffect(() => {
        const fetchImage = async () => {
            const did = driver.driverId;
            if (did && ROOKIE_IMG_MAP[did]) { setImage(ROOKIE_IMG_MAP[did]); return; }
            
            let wikiSuccess = false;
            if (driver.url) {
                try {
                    const slug = driver.url.split('/wiki/')[1];
                    const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${slug}&prop=pageimages&format=json&pithumbsize=600&origin=*`);
                    const wikiData = await wikiRes.json();
                    const pages = wikiData.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId !== "-1") {
                        const imgUrl = pages[pageId]?.thumbnail?.source;
                        if (imgUrl) { setImage(imgUrl); wikiSuccess = true; }
                    }
                } catch(e) {}
            }

            if (!wikiSuccess) {
                const fullName = `${driver.givenName} ${driver.familyName}`;
                let url = await searchCommons(`${fullName} F1 portrait`);
                if (!url) url = await searchCommons(`${fullName} driver face`);
                if (url) setImage(url);
            }
        };
        fetchImage();
    }, [driver]);

    const formatPosition = (pos: string) => {
        if (!pos) return '-';
        if (/^\d+$/.test(pos)) return `P${pos}`;
        if (['R', 'W', 'N', 'F'].includes(pos)) return 'DNF'; 
        return pos; 
    };

    const latestPos = !isHistorical && driver.stats?.latest ? formatPosition(driver.stats.latest.pos) : '-';
    const latestRace = !isHistorical && driver.stats?.latest?.race ? driver.stats.latest.race.replace(' Grand Prix', '').toUpperCase() : '';

    return (
        <Link href={`/sports/f1/driver/${driver.driverId}`} className="group">
            <div className={`h-40 border-2 ${isHistorical ? 'border-zinc-400 dark:border-zinc-700 opacity-80 hover:opacity-100' : 'border-black dark:border-zinc-500'} bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex relative overflow-hidden`}>
                <div className="w-32 bg-zinc-100 dark:bg-zinc-950 border-r-2 border-inherit relative shrink-0 overflow-hidden">
                    {image ? (
                        <img src={image} className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700"><User size={40} /></div>
                    )}
                    {driver.permanentNumber && <div className="absolute bottom-0 right-0 bg-black text-white text-xs font-black px-2 py-1">#{driver.permanentNumber}</div>}
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">{isHistorical ? 'HISTORICAL' : 'ACTIVE GRID'}</span>
                             {driver.nationality && <span className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 px-1 text-zinc-500 border border-zinc-200 dark:border-zinc-700">{driver.nationality.slice(0,3).toUpperCase()}</span>}
                        </div>
                        <h3 className="text-xl font-black uppercase leading-none text-black dark:text-white mb-1 line-clamp-2">{driver.givenName} {driver.familyName}</h3>
                    </div>
                    {!isHistorical && driver.points ? (
                        <div className="grid grid-cols-3 gap-1 border-t-2 border-zinc-100 dark:border-zinc-800 pt-2 mt-1">
                            <div className="flex flex-col"><span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">PTS</span><span className="text-sm font-black text-acid bg-black px-1 w-fit leading-none py-0.5">{driver.points}</span></div>
                            <div className="flex flex-col"><span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">LATEST</span><div className="flex flex-col leading-none"><span className={`text-sm font-black ${latestPos === 'DNF' ? 'text-red-500' : 'text-black dark:text-white'}`}>{latestPos}</span>{latestRace && <span className="text-[7px] font-mono font-bold text-zinc-400 truncate w-full">{latestRace}</span>}</div></div>
                            <div className="flex flex-col"><span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">BEST</span><span className="text-sm font-black text-black dark:text-white leading-none">P{driver.stats?.best || '-'}</span></div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mt-auto">{driver.code && <div className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1">CODE: {driver.code}</div>}</div>
                    )}
                </div>
            </div>
        </Link>
    );
};

// --- COMPONENT 2: TRACK CARD (Now Clickable) ---
const TrackCard = ({ circuit }: { circuit: any }) => {
    const [mapImage, setMapImage] = useState<string | null>(null);
    const [flagImage, setFlagImage] = useState<string | null>(null);

    // SEARCH COMMONS UTILITY (Duplicated here to avoid prop drilling complexity in this snippet)
    const searchTrack = async (query: string) => {
        try {
            const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`);
            const data = await res.json();
            if (!data.query || !data.query.pages) return null;
            const pages = Object.values(data.query.pages);
            // @ts-ignore
            return pages.length > 0 ? pages[0].imageinfo[0].url : null;
        } catch (e) { return null; }
    };

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

    useEffect(() => {
        const fetchAssets = async () => {
            const id = circuit.circuitId;
            const name = circuit.circuitName;
            const country = circuit.Location.country;

            if (DIRECT_MAPS[id]) {
                setMapImage(DIRECT_MAPS[id]);
                return;
            }

            let mapUrl = await searchTrack(`File:${name} layout.svg`); 
            if (!mapUrl) mapUrl = await searchTrack(`File:${name} track map.svg`);
            if (!mapUrl) mapUrl = await searchTrack(`File:${name} circuit.png`);
            
            if (mapUrl) {
                setMapImage(mapUrl);
            } else {
                let flagUrl = await searchTrack(`File:Flag of ${country}.svg`);
                if (flagUrl) setFlagImage(flagUrl);
            }
        };
        fetchAssets();
    }, [circuit]);

    return (
        // ADDED: Link Wrapper
        <Link href={`/sports/f1/circuit/${circuit.circuitId}`} className="group border-2 border-black dark:border-zinc-500 bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex flex-col h-64 relative overflow-hidden">
            
            {/* IMAGE AREA */}
            <div className="h-40 bg-zinc-50 dark:bg-zinc-950 border-b-2 border-inherit relative flex items-center justify-center p-6 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors overflow-hidden">
                {mapImage ? (
                    <img src={mapImage} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:filter dark:invert opacity-90 group-hover:scale-105 transition-transform duration-500" alt="Track Map" />
                ) : flagImage ? (
                    <>
                        <div className="absolute inset-0 opacity-10 bg-cover bg-center grayscale" style={{ backgroundImage: `url(${flagImage})` }}></div>
                        <img src={flagImage} className="w-12 h-12 object-contain shadow-sm" alt="Country Flag" />
                    </>
                ) : (
                    <Map className="text-zinc-300 dark:text-zinc-700" size={64} />
                )}
            </div>

            {/* INFO AREA */}
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><MapPin size={10}/> {circuit.Location.locality}, {circuit.Location.country}</span>
                    <h3 className="text-lg font-black uppercase leading-tight text-black dark:text-white mt-1 line-clamp-1">{circuit.circuitName}</h3>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-zinc-500 uppercase border border-zinc-200 dark:border-zinc-700">LAT: {parseFloat(circuit.Location.lat).toFixed(2)}</span>
                </div>
            </div>
        </Link>
    );
};

// --- SUB-COMPONENT: DRIVER DATABASE ---
const DriverDatabase = () => {
    const [search, setSearch] = useState('');
    const [activeDrivers, setActiveDrivers] = useState<any[]>([]);
    const [historicalDrivers, setHistoricalDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSync, setLastSync] = useState<string>("");
    
    const downloadStarted = useRef(false);

    const fetchActiveGrid = async (forceRefresh = false) => {
        if (forceRefresh) setIsRefreshing(true);
        try {
            const t = forceRefresh ? `&t=${Date.now()}` : '';
            const tf = forceRefresh ? `?t=${Date.now()}` : '';

            const standingsRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/driverStandings.json${tf}`);
            const standingsData = await standingsRes.json();
            const standingsList = standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];

            const lastRaceRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/last/results.json${tf}`);
            const lastRaceData = await lastRaceRes.json();
            const lastRace = lastRaceData.MRData.RaceTable.Races[0];

            const allResultsRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/results.json?limit=1000${t}`);
            const allResultsData = await allResultsRes.json();
            const allRaces = allResultsData.MRData.RaceTable.Races;

            const driverStats: Record<string, { best: number, latest: { pos: string, race: string } }> = {};

            allRaces.forEach((race: any) => {
                race.Results.forEach((result: any) => {
                    const did = result.Driver.driverId;
                    const pos = parseInt(result.position);
                    if (!driverStats[did]) driverStats[did] = { best: 99, latest: { pos: '-', race: '' } };
                    if (!isNaN(pos) && pos < driverStats[did].best) driverStats[did].best = pos;
                });
            });

            if (lastRace && lastRace.Results) {
                lastRace.Results.forEach((result: any) => {
                    const did = result.Driver.driverId;
                    if (!driverStats[did]) driverStats[did] = { best: 99, latest: { pos: '-', race: '' } };
                    driverStats[did].latest = { pos: result.positionText, race: lastRace.raceName };
                });
            }

            const drivers = standingsList.map((ds: any) => {
                const did = ds.Driver.driverId;
                const stats = driverStats[did] || { best: 99, latest: { pos: '-', race: '' } };
                return { ...ds.Driver, points: ds.points, stats: { best: stats.best === 99 ? '-' : stats.best, latest: stats.latest } };
            });
            
            setActiveDrivers(drivers);
            const now = new Date();
            setLastSync(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
            setError(false);
        } catch (e) { setError(true); } finally { setLoading(false); setIsRefreshing(false); }
    };

    useEffect(() => { fetchActiveGrid(); }, []);

    useEffect(() => {
        const fetchAllDrivers = async () => {
            if (downloadStarted.current) return;
            downloadStarted.current = true;
            setArchiveLoading(true);
            try {
                const initRes = await fetch('https://api.jolpi.ca/ergast/f1/drivers.json?limit=1');
                const initData = await initRes.json();
                const limit = 100;
                const batches = Math.ceil(parseInt(initData.MRData.total) / limit);
                const promises = [];
                for (let i = 0; i < batches; i++) {
                    promises.push(fetch(`https://api.jolpi.ca/ergast/f1/drivers.json?limit=${limit}&offset=${i * limit}`).then(res => res.json()).then(data => data.MRData.DriverTable.Drivers));
                }
                const results = await Promise.all(promises);
                setHistoricalDrivers(results.flat());
            } catch (e) {} finally { setArchiveLoading(false); }
        };
        if (search.length > 0 && historicalDrivers.length === 0) fetchAllDrivers();
    }, [search]);

    const filteredActive = activeDrivers.filter(d => d.givenName.toLowerCase().includes(search.toLowerCase()) || d.familyName.toLowerCase().includes(search.toLowerCase()));
    const filteredHistorical = historicalDrivers.filter(d => (d.givenName.toLowerCase().includes(search.toLowerCase()) || d.familyName.toLowerCase().includes(search.toLowerCase())) && !activeDrivers.find(ad => ad.driverId === d.driverId)).slice(0, 50);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-12 sticky top-24 z-30">
                <div className="relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{archiveLoading ? <Loader2 size={20} className="animate-spin"/> : <Search size={20} />}</div>
                    <input type="text" placeholder={archiveLoading ? "DOWNLOADING ARCHIVE..." : "SEARCH DRIVER (E.G. SENNA, SCHUMACHER)..."} className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-12 pr-4 font-bold font-mono text-lg uppercase focus:outline-none focus:border-acid transition-colors text-black dark:text-white placeholder:text-zinc-400" value={search} onChange={(e) => setSearch(e.target.value)} disabled={loading} />
                </div>
                {archiveLoading && <div className="absolute -bottom-6 left-0 text-[9px] font-mono font-bold text-acid animate-pulse">SYNCING COMPLETE DATABASE...</div>}
            </div>

            {error && <div className="p-8 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold font-mono flex items-center gap-4 mb-8"><AlertTriangle size={24} /><span>CONNECTION LOST.</span></div>}

            {filteredActive.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4 text-black dark:text-white"><Activity size={16} className="text-acid"/><span className="text-xs font-black tracking-widest uppercase">2025 ACTIVE GRID ({lastSync})</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredActive.map((driver) => <DriverCard key={driver.driverId} driver={driver} />)}
                    </div>
                </div>
            )}

            {filteredHistorical.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4 text-black dark:text-white"><History size={16} className="text-zinc-400"/><span className="text-xs font-black tracking-widest uppercase">HISTORICAL ARCHIVES ({filteredHistorical.length})</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredHistorical.map((driver) => <DriverCard key={driver.driverId} driver={driver} isHistorical={true} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: TRACK SCHEMATICS ---
const TrackSchematics = () => {
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const res = await fetch('https://api.jolpi.ca/ergast/f1/circuits.json?limit=100');
                const data = await res.json();
                setTracks(data.MRData.CircuitTable.Circuits);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchTracks();
    }, []);

    const filteredTracks = tracks.filter(t => t.circuitName.toLowerCase().includes(search.toLowerCase()) || t.Location.country.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
             <div className="mb-12 sticky top-24 z-30">
                <div className="relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><Search size={20} /></div>
                    <input type="text" placeholder="SEARCH CIRCUITS (E.G. MONZA, SUZUKA)..." className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-12 pr-4 font-bold font-mono text-lg uppercase focus:outline-none focus:border-acid transition-colors text-black dark:text-white placeholder:text-zinc-400" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-400" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTracks.map((circuit) => (
                        <TrackCard key={circuit.circuitId} circuit={circuit} />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- MAIN HUB ---
export default function F1Hub() {
    const [viewMode, setViewMode] = useState<'drivers' | 'tracks'>('drivers');

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 pt-12 pb-20">
            
            {/* HEADER & SELECTOR */}
            <div className="mb-12 border-b-2 border-black dark:border-zinc-700 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-acid mb-2">
                        <Flag size={14} />
                        <span className="font-mono text-[10px] font-bold tracking-widest text-black dark:text-white">F1 INTELLIGENCE HUB</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black dark:text-white">
                        {viewMode === 'drivers' ? 'DRIVER DATABASE' : 'TRACK SCHEMATICS'}
                    </h1>
                </div>

                {/* MODE TOGGLE */}
                <div className="flex gap-2">
                    <button 
                        onClick={() => setViewMode('drivers')}
                        className={`px-4 md:px-6 py-3 font-black font-mono text-xs uppercase tracking-widest border-2 transition-all ${
                            viewMode === 'drivers' 
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_#DFFF00]' 
                            : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                        }`}
                    >
                        DRIVERS
                    </button>
                    <button 
                        onClick={() => setViewMode('tracks')}
                        className={`px-4 md:px-6 py-3 font-black font-mono text-xs uppercase tracking-widest border-2 transition-all ${
                            viewMode === 'tracks' 
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_#DFFF00]' 
                            : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                        }`}
                    >
                        TRACKS
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            {viewMode === 'drivers' ? <DriverDatabase /> : <TrackSchematics />}

        </div>
    );
}