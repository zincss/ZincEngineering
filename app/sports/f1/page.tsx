'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Flag, Loader2, Trophy, AlertTriangle, User, History, Activity, Map, MapPin, Share2, Wrench, Users, Car, LayoutGrid, Shield, Crown, BarChart3, Star, Timer } from 'lucide-react';
import Link from 'next/link';
import EloLeaderboard from './components/EloLeaderboard';

// --- 1. VERIFIED IMAGE MAP (Active Drivers 2025) ---
const VERIFIED_IMAGES: Record<string, string> = {
    'max_verstappen': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png',
    'perez': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/2col/image.png',
    'hamilton': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png',
    'russell': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/2col/image.png',
    'leclerc': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col/image.png',
    'sainz': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col/image.png',
    'norris': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col/image.png',
    'piastri': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col/image.png',
    'alonso': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col/image.png',
    'stroll': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/2col/image.png',
    'gasly': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/2col/image.png',
    'ocon': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/2col/image.png',
    'albon': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/2col/image.png',
    'tsunoda': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/2col/image.png',
    'bottas': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/2col/image.png',
    'zhou': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png.transform/2col/image.png',
    'hulkenberg': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/2col/image.png',
    'magnussen': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/2col/image.png',
    'antonelli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Andrea_Kimi_Antonelli_FRECA_2023_Red_Bull_Ring_%28cropped%29.jpg/600px-Andrea_Kimi_Antonelli_FRECA_2023_Red_Bull_Ring_%28cropped%29.jpg',
    'bearman': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Oliver_Bearman_Formula_2_2024_Bahrain.jpg/600px-Oliver_Bearman_Formula_2_2024_Bahrain.jpg',
    'colapinto': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Franco_Colapinto_F3_2023_Austria.jpg/600px-Franco_Colapinto_F3_2023_Austria.jpg',
    'lawson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Liam_Lawson_Austria_2022.jpg/600px-Liam_Lawson_Austria_2022.jpg',
    'doohan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Jack_Doohan_2023.jpg/600px-Jack_Doohan_2023.jpg',
    'bortoleto': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Gabriel_Bortoleto_%28cropped%29.jpg/600px-Gabriel_Bortoleto_%28cropped%29.jpg',
};

// --- 2. NATIONALITY TO FLAG CODE MAP ---
const NATIONALITY_CODES: Record<string, string> = {
    'British': 'gb', 'German': 'de', 'Italian': 'it', 'French': 'fr',
    'Austrian': 'at', 'American': 'us', 'Swiss': 'ch', 'Dutch': 'nl',
    'Japanese': 'jp', 'Indian': 'in', 'Malaysian': 'my', 'Russian': 'ru',
    'Irish': 'ie', 'Canadian': 'ca', 'Mexican': 'mx', 'Brazilian': 'br',
    'Spanish': 'es', 'Australian': 'au', 'New Zealander': 'nz', 'South African': 'za',
    'Belgian': 'be', 'Swedish': 'se', 'Finnish': 'fi', 'Thai': 'th',
    'Danish': 'dk', 'Chinese': 'cn', 'Monegasque': 'mc', 'Polish': 'pl',
    'Venezuelan': 've', 'Colombian': 'co', 'Argentine': 'ar', 'Portuguese': 'pt',
};

// --- 3. SEARCH UTILITY ---
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

// --- COMPONENT: DRIVER CARD ---
const DriverCard = ({ driver, isHistorical = false }: { driver: any, isHistorical?: boolean }) => {
    const [image, setImage] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        const fetchImage = async () => {
            const did = driver.driverId;
            if (VERIFIED_IMAGES[did]) { setImage(VERIFIED_IMAGES[did]); return; }
            
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
                const url = await searchCommons(`File:${fullName} F1 portrait`);
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

    const latestPos = !isHistorical && driver.stats?.latest?.pos ? formatPosition(driver.stats.latest.pos) : '-';
    const latestRace = !isHistorical && driver.stats?.latest?.race ? driver.stats.latest.race.replace(' Grand Prix', '').toUpperCase() : '';
    const bestPos = !isHistorical && driver.stats?.best !== 99 ? `P${driver.stats?.best}` : '-';

    return (
        <Link href={`/sports/f1/driver/${driver.driverId}`} className="group">
            <div className={`h-40 border-2 ${isHistorical ? 'border-zinc-400 dark:border-zinc-700 opacity-80 hover:opacity-100' : 'border-black dark:border-zinc-500'} bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex relative overflow-hidden`}>
                <div className="w-32 bg-zinc-100 dark:bg-zinc-950 border-r-2 border-inherit relative shrink-0 overflow-hidden flex items-center justify-center">
                    {image && !imgError ? (
                        <img 
                            src={image} 
                            onError={() => setImgError(true)}
                            className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500" 
                            alt={driver.familyName}
                        />
                    ) : (
                        <User size={48} strokeWidth={1} className="text-zinc-300 dark:text-zinc-700 group-hover:scale-110 transition-transform duration-500" />
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
                        <div className="flex divide-x divide-zinc-200 dark:divide-zinc-700 border-t-2 border-zinc-100 dark:border-zinc-800 pt-2 mt-auto">
                            
                            {/* COL 1: POINTS */}
                            <div className="flex-1 pr-2 flex flex-col justify-between">
                                <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">POINTS</span>
                                <div>
                                    <span className="text-sm font-black bg-[#DFFF00] text-black px-1.5 py-0.5 leading-none block w-fit">{driver.points}</span>
                                    <span className="text-[7px] font-mono font-bold text-transparent select-none block mt-0.5">.</span>
                                </div>
                            </div>
                            
                            {/* COL 2: LATEST */}
                            <div className="flex-1 px-2 flex flex-col justify-between min-w-0">
                                <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">LATEST</span>
                                <div>
                                    <span className={`text-sm font-black leading-none block ${latestPos === 'DNF' ? 'text-red-500' : 'text-black dark:text-white'}`}>{latestPos}</span>
                                    <span className="text-[7px] font-mono font-bold text-zinc-400 truncate block mt-0.5 w-full">{latestRace || '-'}</span>
                                </div>
                            </div>

                            {/* COL 3: BEST */}
                            <div className="flex-1 pl-2 flex flex-col justify-between">
                                <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">BEST</span>
                                <div>
                                    <span className="text-sm font-black text-black dark:text-white leading-none block">{bestPos}</span>
                                    <span className="text-[7px] font-mono font-bold text-zinc-400 block mt-0.5">SEASON</span>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mt-auto">{driver.code && <div className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1">CODE: {driver.code}</div>}</div>
                    )}
                </div>
            </div>
        </Link>
    );
};

// --- COMPONENT: TRACK CARD ---
const TrackCard = ({ circuit }: { circuit: any }) => {
    return (
        <Link href={`/sports/f1/circuit/${circuit.circuitId}`} className="group border-2 border-black dark:border-zinc-500 bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex flex-col h-auto md:h-64 relative overflow-hidden">
            <div className="h-32 md:h-40 bg-zinc-50 dark:bg-zinc-950 border-b-2 border-inherit relative flex items-center justify-center p-6 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors overflow-hidden">
                 <Map className="text-zinc-300 dark:text-zinc-700 group-hover:scale-110 transition-transform duration-500" size={64} strokeWidth={1} />
                <div className="absolute top-2 right-2"><div className="text-zinc-400 hover:text-black dark:hover:text-white"><Share2 size={14}/></div></div>
            </div>
            <div className="flex-1 p-3 md:p-4 flex flex-col justify-between gap-2 md:gap-0">
                <div>
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><MapPin size={10}/> {circuit.Location.locality}, {circuit.Location.country}</span>
                    <h3 className="text-base md:text-lg font-black uppercase leading-tight text-black dark:text-white mt-1 line-clamp-1">{circuit.circuitName}</h3>
                </div>
                <div className="flex justify-between items-end"><span className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-zinc-500 uppercase border border-zinc-200 dark:border-zinc-700">LAT: {parseFloat(circuit.Location.lat).toFixed(2)}</span></div>
            </div>
        </Link>
    );
};

// --- COMPONENT: MANUFACTURER CARD ---
const ManufacturerCard = ({ team, isHistorical = false }: { team: any, isHistorical?: boolean }) => {
    const drivers = team.drivers || [];
    const countryCode = NATIONALITY_CODES[team.nationality] || 'xx';
    const flagUrl = `https://flagcdn.com/w640/${countryCode.toLowerCase()}.png`;

    return (
        <Link href={`/sports/f1/team/${team.constructorId}`} className="group border-2 border-black dark:border-zinc-500 bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex flex-col h-auto md:h-64 relative overflow-hidden">
            <div className="h-32 md:h-40 bg-zinc-50 dark:bg-zinc-950 border-b-2 border-inherit relative flex items-center justify-center overflow-hidden">
                {countryCode !== 'xx' ? (
                     <img 
                        src={flagUrl} 
                        className="w-full h-full object-cover opacity-80 filter grayscale group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" 
                        alt={team.nationality} 
                     />
                ) : (
                    <Flag size={64} strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />
                )}
            </div>
            <div className="flex-1 p-3 md:p-4 flex flex-col justify-between gap-2 md:gap-0">
                <div>
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">{isHistorical ? 'HISTORICAL' : 'ACTIVE CONSTRUCTOR'}</span>
                    <h3 className="text-xl font-black uppercase leading-none text-black dark:text-white mb-1 line-clamp-1">{team.name}</h3>
                </div>
                
                {!isHistorical && team.points ? (
                    <div className="flex justify-between items-end border-t-2 border-zinc-100 dark:border-zinc-800 pt-2 mt-1">
                        <div className="flex flex-col"><span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">PTS</span><span className="text-sm font-black text-acid bg-black px-1 w-fit leading-none py-0.5">{team.points}</span></div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">DRIVERS</span>
                            <div className="flex gap-1">
                                {drivers.map((d: string) => (
                                    <span key={d} className="text-[9px] font-black bg-zinc-200 dark:bg-zinc-700 px-1 text-black dark:text-white">{d}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mt-auto text-[9px] font-mono font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 w-fit">ESTABLISHED: N/A</div>
                )}
            </div>
        </Link>
    );
};

// --- SUB-COMPONENT: DRIVER DATABASE (HYBRID FETCH) ---
const DriverDatabase = () => {
    const [search, setSearch] = useState('');
    const [activeDrivers, setActiveDrivers] = useState<any[]>([]);
    const [historicalDrivers, setHistoricalDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [error, setError] = useState(false);
    const [lastSync, setLastSync] = useState<string>("");
    const downloadStarted = useRef(false);

    // METHOD: Standings + Per-Driver History + Latest Round Injection
    const fetchActiveGrid = async () => {
        try {
            const t = `?t=${Date.now()}`;
            
            // 1. Get Current Season & Schedule
            const scheduleRes = await fetch('https://api.jolpi.ca/ergast/f1/current.json');
            const scheduleData = await scheduleRes.json();
            const season = scheduleData.MRData.RaceTable.season; 
            const races = scheduleData.MRData.RaceTable.Races;
            
            // Find truly latest completed round
            const today = new Date();
            const pastRaces = races.filter((r: any) => new Date(r.date) < today);
            const lastRound = pastRaces.length > 0 ? pastRaces[pastRaces.length - 1].round : '1';

            // 2. Fetch Standings
            const standingsRes = await fetch(`https://api.jolpi.ca/ergast/f1/${season}/driverStandings.json`);
            const standingsData = await standingsRes.json();
            const standingsList = standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];

            // 3. Fetch The Verified Latest Round (Guarantees "Latest" is correct)
            const latestRoundRes = await fetch(`https://api.jolpi.ca/ergast/f1/${season}/${lastRound}/results.json`);
            const latestRoundData = await latestRoundRes.json();
            const latestRaceInfo = latestRoundData.MRData.RaceTable.Races[0];

            // 4. Fetch Per-Driver History (Guarantees "Best" is correct) - WITH ERROR TOLERANCE
            // We use Promise.allSettled to ensure that one failure doesn't crash the entire grid
            const driverFetchPromises = standingsList.map((ds: any) => 
                fetch(`https://api.jolpi.ca/ergast/f1/${season}/drivers/${ds.Driver.driverId}/results.json?limit=100`)
                    .then(res => res.json())
                    .then(data => ({ 
                        driverId: ds.Driver.driverId, 
                        results: data.MRData.RaceTable.Races 
                    }))
            );

            // Wait for all requests to settle (success or fail)
            const results = await Promise.allSettled(driverFetchPromises);
            
            // Filter out only the successful ones
            const allDriversResults = results
                .filter(r => r.status === 'fulfilled')
                // @ts-ignore
                .map(r => r.value);

            // 5. Process Stats
            const driverStats: Record<string, { best: number, latest: { pos: string, race: string } }> = {};

            // Helper to process a list of races
            const processResults = (did: string, raceList: any[]) => {
                raceList.forEach((race: any) => {
                    const result = race.Results[0]; // Per-driver endpoint puts the driver in index 0
                    const pos = parseInt(result.position);
                    
                    if (!driverStats[did]) driverStats[did] = { best: 99, latest: { pos: '-', race: '' } };
                    
                    // Update Best
                    if (!isNaN(pos) && pos < driverStats[did].best) {
                        driverStats[did].best = pos;
                    }
                });
            };

            // A. Process Per-Driver History (from successful fetches)
            allDriversResults.forEach((item: any) => {
                processResults(item.driverId, item.results);
            });

            // B. Process Latest Round (Injection)
            // This ensures that if the per-driver endpoint is slightly stale, we still count the latest race
            if (latestRaceInfo) {
                latestRaceInfo.Results.forEach((result: any) => {
                    const did = result.Driver.driverId;
                    const pos = parseInt(result.position);
                    
                    if (!driverStats[did]) driverStats[did] = { best: 99, latest: { pos: '-', race: '' } };

                    // Update Best with Latest Round
                    if (!isNaN(pos) && pos < driverStats[did].best) {
                        driverStats[did].best = pos;
                    }

                    // Set Latest Display
                    driverStats[did].latest = {
                        pos: result.positionText,
                        race: latestRaceInfo.raceName.replace(' Grand Prix', '').toUpperCase()
                    };
                });
            }

            // 6. Map to Output
            const drivers = standingsList.map((ds: any) => {
                const did = ds.Driver.driverId;
                const stats = driverStats[did] || { best: 99, latest: { pos: '-', race: 'PRE-SEASON' } };
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
            setLastSync(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
            setError(false);
        } catch (e) { 
            console.error("GRID SYNC ERROR:", e);
            setError(true); 
        } finally { 
            setLoading(false); 
        }
    };
    useEffect(() => { fetchActiveGrid(); }, []);

    // LIVE SEARCH
    useEffect(() => {
        const fetchResults = async () => {
            if (search.length < 3) return;
            const localMatch = historicalDrivers.some(d => d.familyName.toLowerCase().includes(search.toLowerCase()));
            if (!localMatch) {
                try {
                    setArchiveLoading(true);
                    const res = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${search.toLowerCase()}.json`);
                    const data = await res.json();
                    if (data.MRData.DriverTable.Drivers.length > 0) {
                         setHistoricalDrivers(prev => [...prev, ...data.MRData.DriverTable.Drivers]);
                    }
                } catch(e) {} finally { setArchiveLoading(false); }
            }
        }
        const timeoutId = setTimeout(() => fetchResults(), 500);
        return () => clearTimeout(timeoutId);
    }, [search, historicalDrivers]);

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
                for (let i = 0; i < batches; i++) { promises.push(fetch(`https://api.jolpi.ca/ergast/f1/drivers.json?limit=${limit}&offset=${i * limit}`).then(res => res.json()).then(data => data.MRData.ConstructorTable.Constructors)); }
                const results = await Promise.all(promises);
                setHistoricalDrivers(results.flat());
            } catch (e) {} finally { setArchiveLoading(false); }
        };
        fetchAllDrivers(); 
    }, []);

    const filteredActive = activeDrivers.filter(d => d.givenName.toLowerCase().includes(search.toLowerCase()) || d.familyName.toLowerCase().includes(search.toLowerCase()));
    const filteredHistorical = historicalDrivers.filter(d => (d.givenName.toLowerCase().includes(search.toLowerCase()) || d.familyName.toLowerCase().includes(search.toLowerCase())) && !activeDrivers.find(ad => ad.driverId === d.driverId)).slice(0, 50);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-12 sticky top-24 z-30">
                <div className="relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{archiveLoading ? <Loader2 size={20} className="animate-spin"/> : <Search size={20} />}</div>
                    <input type="text" placeholder={archiveLoading ? "DOWNLOADING ARCHIVE..." : "SEARCH DRIVER..."} className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-12 pr-4 font-bold font-mono text-base md:text-lg uppercase focus:outline-none focus:border-acid transition-colors text-black dark:text-white placeholder:text-zinc-400" value={search} onChange={(e) => setSearch(e.target.value)} disabled={loading} />
                </div>
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
                    <input type="text" placeholder="SEARCH CIRCUITS..." className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-12 pr-4 font-bold font-mono text-base md:text-lg uppercase focus:outline-none focus:border-acid transition-colors text-black dark:text-white placeholder:text-zinc-400" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>
            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-400" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTracks.map((circuit) => <TrackCard key={circuit.circuitId} circuit={circuit} />)}
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: MANUFACTURER DATABASE ---
const ManufacturerDatabase = () => {
    const [search, setSearch] = useState('');
    const [active, setActive] = useState<any[]>([]);
    const [historical, setHistorical] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const downloadStarted = useRef(false);

    const SIGNIFICANT_TEAMS = [
        'lotus_f1', 'team_lotus', 'ferrari', 'mclaren', 'williams', 'renault', 'benetton',
        'tyrrell', 'brabham', 'brm', 'cooper', 'alfa', 'mercedes', 'red_bull', 'toro_rosso',
        'jordan', 'minardi', 'ligier', 'arrows', 'sauber', 'toyota', 'honda', 'jaguar', 
        'bmw_sauber', 'brawn', 'force_india', 'racing_point', 'alphatauri', 'haas', 'aston_martin', 'alpine'
    ];

    useEffect(() => {
        const fetchActive = async () => {
            try {
                const res = await fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json');
                const data = await res.json();
                const teams = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings.map((cs: any) => {
                    return { ...cs.Constructor, points: cs.points, wins: cs.wins }; 
                });
                
                const dRes = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
                const dData = await dRes.json();
                const dList = dData.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                
                const teamsWithDrivers = teams.map((t: any) => {
                    const drivers = dList.filter((d: any) => d.Constructors[0].constructorId === t.constructorId).map((d: any) => d.Driver.code);
                    return { ...t, drivers };
                });

                setActive(teamsWithDrivers || []);
                setLoading(false);
            } catch(e) {}
        };
        fetchActive();
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            if (downloadStarted.current) return;
            downloadStarted.current = true;
            setArchiveLoading(true);
            try {
                const initRes = await fetch('https://api.jolpi.ca/ergast/f1/constructors.json?limit=1');
                const initData = await initRes.json();
                const limit = 100;
                const batches = Math.ceil(parseInt(initData.MRData.total) / limit);
                const promises = [];
                for (let i = 0; i < batches; i++) { promises.push(fetch(`https://api.jolpi.ca/ergast/f1/constructors.json?limit=${limit}&offset=${i * limit}`).then(res => res.json()).then(data => data.MRData.ConstructorTable.Constructors)); }
                const results = await Promise.all(promises);
                setHistorical(results.flat());
            } catch (e) {} finally { setArchiveLoading(false); }
        };
        if (search.length > 0 && historical.length === 0) fetchAll();
    }, [search]);

    const filteredActive = active.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    const filteredHistorical = historical.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
        const isNotActive = !active.find(at => at.constructorId === t.constructorId);
        const isSignificant = SIGNIFICANT_TEAMS.includes(t.constructorId);
        
        if (search.length > 0) return matchesSearch && isNotActive;
        return isNotActive && isSignificant;
    }).slice(0, 50);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
             <div className="mb-12 sticky top-24 z-30">
                <div className="relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{archiveLoading ? <Loader2 size={20} className="animate-spin"/> : <Search size={20} />}</div>
                    <input type="text" placeholder="SEARCH CONSTRUCTORS..." className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-4 font-bold font-mono text-base md:text-lg uppercase focus:outline-none focus:border-acid" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {archiveLoading && <div className="absolute -bottom-6 left-0 text-[9px] font-mono font-bold text-acid animate-pulse">SYNCING TEAM ARCHIVE...</div>}
            </div>
            {filteredActive.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4 text-black dark:text-white"><Activity size={16} /><span className="text-xs font-black tracking-widest uppercase">2025 CONSTRUCTORS</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredActive.map(t => <ManufacturerCard key={t.constructorId} team={t} />)}</div>
                </div>
            )}
            {filteredHistorical.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4 text-black dark:text-white"><History size={16} /><span className="text-xs font-black tracking-widest uppercase">HISTORICAL ARCHIVES</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredHistorical.map(t => <ManufacturerCard key={t.constructorId} team={t} isHistorical={true} />)}</div>
                </div>
            )}
        </div>
    );
};

export default function F1Hub() {
    const [viewMode, setViewMode] = useState<'drivers' | 'tracks' | 'elo' | 'teams'>('drivers');
    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 pt-12 pb-20">
            <div className="mb-12 border-b-2 border-black dark:border-zinc-700 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-acid mb-2"><Flag size={14} /><span className="font-mono text-[10px] font-bold tracking-widest text-black dark:text-white">F1 INTELLIGENCE HUB</span></div>
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none text-black dark:text-white transition-all duration-300">
                        {viewMode === 'drivers' ? 'DRIVER DATABASE' : viewMode === 'tracks' ? 'TRACK SCHEMATICS' : viewMode === 'elo' ? 'ELO RANKINGS' : 'CONSTRUCTORS'}
                    </h1>
                </div>
                <div className="w-full overflow-x-auto pb-4 pt-1 px-1 no-scrollbar">
                    <div className="flex gap-2 justify-start min-w-min p-2">
                        {['drivers', 'tracks', 'elo', 'teams'].map((mode) => (
                            <button key={mode} onClick={() => setViewMode(mode as any)} className={`px-4 md:px-6 py-3 font-black font-mono text-xs uppercase tracking-widest border-2 transition-all whitespace-nowrap shrink-0 last:mr-6 ${viewMode === mode ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_#DFFF00]' : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'}`}>
                                {mode === 'teams' ? 'CONSTRUCTORS' : mode === 'elo' ? 'ELO RANKINGS' : mode.toUpperCase()}
                            </button>
                        ))}
                         <div className="w-2 shrink-0"></div>
                    </div>
                </div>
            </div>
            {viewMode === 'drivers' && <DriverDatabase />}
            {viewMode === 'tracks' && <TrackSchematics />}
            {viewMode === 'elo' && <EloLeaderboard />}
            {viewMode === 'teams' && <ManufacturerDatabase />}
        </div>
    );
}