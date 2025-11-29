'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Flag, Loader2, Trophy, AlertTriangle, User, History, Activity, Map, MapPin, Share2, Wrench, Users, Car, LayoutGrid, Shield, Crown, BarChart3, Star, Timer, Terminal } from 'lucide-react';
import Link from 'next/link';
import EloLeaderboard from './EloLeaderboard';
import { searchF1Archive } from '../actions';

// --- IMAGES & CONFIG ---
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

// --- LOADER OVERLAY COMPONENT ---
const NavigationLoader = () => (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-[#DFFF00] blur-2xl opacity-20 animate-pulse"></div>
           <div className="w-16 h-16 border-2 border-zinc-800 border-t-[#DFFF00] rounded-full animate-spin relative z-10"></div>
           <div className="absolute inset-0 flex items-center justify-center z-10">
               <Activity size={24} className="text-[#DFFF00]" />
           </div>
        </div>
        <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-sm font-black tracking-[0.2em] uppercase">
                <Terminal size={14} />
                <span>ACCESSING PROFILE</span>
            </div>
            <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-widest animate-pulse">
                RETRIEVING SECURE DATA...
            </span>
        </div>
    </div>
);

// --- MODIFIED CARD COMPONENTS ---
// Now accepts `onNavigate` to trigger the loader manually

const DriverCard = ({ driver, isHistorical = false, onNavigate }: { driver: any, isHistorical?: boolean, onNavigate: (url: string) => void }) => {
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        const did = driver.driverId;
        if (VERIFIED_IMAGES[did]) { setImage(VERIFIED_IMAGES[did]); }
    }, [driver]);

    const latestPos = driver.stats?.latest?.pos || '-';
    const latestRace = driver.stats?.latest?.race || '-';
    const targetUrl = `/sports/f1/driver/${driver.driverId}`;

    return (
        <div 
            onClick={() => onNavigate(targetUrl)}
            className="group cursor-pointer h-40 border-2 border-black dark:border-zinc-500 hover:border-[#DFFF00] dark:hover:border-[#DFFF00] bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex relative overflow-hidden"
        >
            <div className="w-32 bg-zinc-100 dark:bg-zinc-950 border-r-2 border-inherit relative shrink-0 overflow-hidden flex items-center justify-center">
                {image ? (
                    <img src={image} className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500" alt={driver.familyName} />
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
                {!isHistorical && (
                    <div className="flex divide-x divide-zinc-200 dark:divide-zinc-700 border-t-2 border-zinc-100 dark:border-zinc-800 pt-2 mt-auto">
                        <div className="flex-1 pr-2 flex flex-col justify-between">
                            <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">POINTS</span>
                            <span className="text-sm font-black bg-[#DFFF00] text-black px-1.5 py-0.5 leading-none block w-fit">{driver.points}</span>
                        </div>
                        <div className="flex-1 px-2 flex flex-col justify-between min-w-0">
                            <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">LATEST</span>
                            <div>
                                <span className={`text-sm font-black leading-none block ${latestPos === 'DNF' ? 'text-red-500' : 'text-black dark:text-white'}`}>{latestPos}</span>
                                <span className="text-[7px] font-mono font-bold text-zinc-400 truncate block mt-0.5 w-full">{latestRace}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TrackCard = ({ circuit, onNavigate }: { circuit: any, onNavigate: (url: string) => void }) => (
    <div 
        onClick={() => onNavigate(`/sports/f1/circuit/${circuit.circuitId}`)}
        className="group cursor-pointer border-2 border-black dark:border-zinc-500 hover:border-[#DFFF00] dark:hover:border-[#DFFF00] bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex flex-col h-auto md:h-64 relative overflow-hidden"
    >
        <div className="h-32 md:h-40 bg-zinc-50 dark:bg-zinc-950 border-b-2 border-inherit relative flex items-center justify-center p-6 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors overflow-hidden">
             <Map className="text-zinc-300 dark:text-zinc-700 group-hover:scale-110 transition-transform duration-500" size={64} strokeWidth={1} />
        </div>
        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between gap-2 md:gap-0">
            <div>
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><MapPin size={10}/> {circuit.Location.locality}, {circuit.Location.country}</span>
                <h3 className="text-base md:text-lg font-black uppercase leading-tight text-black dark:text-white mt-1 line-clamp-1">{circuit.circuitName}</h3>
            </div>
        </div>
    </div>
);

const ManufacturerCard = ({ team, onNavigate }: { team: any, onNavigate: (url: string) => void }) => {
    const countryCode = NATIONALITY_CODES[team.nationality] || 'xx';
    const flagUrl = `https://flagcdn.com/w640/${countryCode.toLowerCase()}.png`;

    return (
        <div 
            onClick={() => onNavigate(`/sports/f1/team/${team.constructorId}`)}
            className="group cursor-pointer border-2 border-black dark:border-zinc-500 hover:border-[#DFFF00] dark:hover:border-[#DFFF00] bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex flex-col h-auto md:h-64 relative overflow-hidden"
        >
            <div className="h-32 md:h-40 bg-zinc-50 dark:bg-zinc-950 border-b-2 border-inherit relative flex items-center justify-center overflow-hidden">
                {countryCode !== 'xx' && <img src={flagUrl} className="w-full h-full object-cover opacity-80 filter grayscale group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" alt={team.nationality} />}
            </div>
            <div className="flex-1 p-3 md:p-4 flex flex-col justify-between gap-2 md:gap-0">
                <div>
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">CONSTRUCTOR</span>
                    <h3 className="text-xl font-black uppercase leading-none text-black dark:text-white mb-1 line-clamp-1">{team.name}</h3>
                </div>
                <div className="flex justify-between items-end border-t-2 border-zinc-100 dark:border-zinc-800 pt-2 mt-1">
                    <div className="flex flex-col"><span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">PTS</span><span className="text-sm font-black text-acid bg-black px-1 w-fit leading-none py-0.5">{team.points}</span></div>
                    <div className="flex flex-col items-end"><span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">WINS</span><span className="text-sm font-black text-black dark:text-white">{team.wins}</span></div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN CLIENT COMPONENT ---
export default function F1Dashboard({ activeDrivers, teams, tracks, season }: { activeDrivers: any[], teams: any[], tracks: any[], season: string }) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'drivers' | 'tracks' | 'elo' | 'teams'>('drivers');
    const [search, setSearch] = useState('');
    const [historicalDrivers, setHistoricalDrivers] = useState<any[]>([]);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // --- NAVIGATION HANDLER ---
    const handleNavigate = (url: string) => {
        setIsNavigating(true);
        router.push(url);
    };

    // Historical Search Logic
    useEffect(() => {
        const fetchHistory = async () => {
            if (search.length < 3) return;
            const alreadyFound = historicalDrivers.some(d => d.familyName.toLowerCase().includes(search.toLowerCase()));
            if (!alreadyFound && !activeDrivers.some(d => d.familyName.toLowerCase().includes(search.toLowerCase()))) {
                setArchiveLoading(true);
                const results = await searchF1Archive(search);
                setHistoricalDrivers(prev => [...prev, ...results]);
                setArchiveLoading(false);
            }
        };
        const timeout = setTimeout(fetchHistory, 500);
        return () => clearTimeout(timeout);
    }, [search, activeDrivers, historicalDrivers]);

    const filteredActive = activeDrivers.filter(d => d.givenName.toLowerCase().includes(search.toLowerCase()) || d.familyName.toLowerCase().includes(search.toLowerCase()));
    const filteredHistorical = historicalDrivers.filter(d => 
        (d.givenName.toLowerCase().includes(search.toLowerCase()) || d.familyName.toLowerCase().includes(search.toLowerCase())) && 
        !activeDrivers.find(ad => ad.driverId === d.driverId)
    ).slice(0, 50);

    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    const filteredTracks = tracks.filter(t => t.circuitName.toLowerCase().includes(search.toLowerCase()) || t.Location.country.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 pt-12 pb-20">
            
            {/* MANUAL LOADING OVERLAY */}
            {isNavigating && <NavigationLoader />}

            {/* HEADER */}
            <div className="mb-12 border-b-2 border-black dark:border-zinc-700 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[#DFFF00] mb-2"><Flag size={14} /><span className="font-mono text-[10px] font-bold tracking-widest text-black dark:text-white">F1 INTELLIGENCE HUB // {season}</span></div>
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
                    </div>
                </div>
            </div>

            {/* SEARCH BAR */}
            {viewMode !== 'elo' && (
                <div className="mb-12 sticky top-24 z-30">
                    <div className="relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{archiveLoading ? <Loader2 size={20} className="animate-spin"/> : <Search size={20} />}</div>
                        <input type="text" placeholder={`SEARCH ${viewMode.toUpperCase()}...`} className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-12 pr-4 font-bold font-mono text-base md:text-lg uppercase focus:outline-none focus:border-[#DFFF00] transition-colors text-black dark:text-white placeholder:text-zinc-400" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
            )}

            {/* CONTENT GRIDS */}
            {viewMode === 'drivers' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                     <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4 text-black dark:text-white"><Activity size={16} className="text-[#DFFF00]"/><span className="text-xs font-black tracking-widest uppercase">ACTIVE GRID</span></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredActive.map((driver) => <DriverCard key={driver.driverId} driver={driver} onNavigate={handleNavigate} />)}
                        </div>
                    </div>
                    {filteredHistorical.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-black dark:text-white"><History size={16} /><span className="text-xs font-black tracking-widest uppercase">HISTORICAL ARCHIVES</span></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredHistorical.map((driver) => <DriverCard key={driver.driverId} driver={driver} isHistorical={true} onNavigate={handleNavigate} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'teams' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTeams.map(t => <ManufacturerCard key={t.constructorId} team={t} onNavigate={handleNavigate} />)}
                    </div>
                </div>
            )}

            {viewMode === 'tracks' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTracks.map(t => <TrackCard key={t.circuitId} circuit={t} onNavigate={handleNavigate} />)}
                    </div>
                </div>
            )}

            {viewMode === 'elo' && <EloLeaderboard />}

        </div>
    );
}