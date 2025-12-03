'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Activity, Map as MapIcon, MapPin, User, Terminal, Trophy, Grid3X3, List, Zap, Ruler, Clock, CornerUpRight, Hash, ArrowRight, RotateCw } from 'lucide-react';
import EloLeaderboard from './EloLeaderboard';
import F1Search from './F1Search';

// --- CONFIGURATION & ASSETS ---

const TEAM_COLORS: Record<string, string> = {
    'Red Bull': '#1E41FF',
    'Mercedes': '#00D2BE',
    'Ferrari': '#FF0000',
    'McLaren': '#FF8700',
    'Aston Martin': '#006F62',
    'Alpine': '#FF87BA',
    'Williams': '#005AFF',
    'RB': '#6692FF',
    'Haas': '#B6BABD',
    'Kick Sauber': '#52E252',
    'Sauber': '#52E252',
    'Audi': '#F2F2F2',
};

// Robust Mapping for Track Flags (Noun -> ISO Code)
const COUNTRY_TO_CODE: Record<string, string> = {
    'Australia': 'au', 'Austria': 'at', 'Azerbaijan': 'az', 'Bahrain': 'bh',
    'Belgium': 'be', 'Brazil': 'br', 'Canada': 'ca', 'China': 'cn',
    'France': 'fr', 'Germany': 'de', 'Hungary': 'hu', 'Italy': 'it',
    'Japan': 'jp', 'Mexico': 'mx', 'Monaco': 'mc', 'Netherlands': 'nl',
    'Portugal': 'pt', 'Qatar': 'qa', 'Russia': 'ru', 'Saudi Arabia': 'sa',
    'Singapore': 'sg', 'Spain': 'es', 'Turkey': 'tr', 'UAE': 'ae',
    'UK': 'gb', 'USA': 'us', 'United States': 'us', 'United Arab Emirates': 'ae', 
    'Korea': 'kr', 'India': 'in', 'Malaysia': 'my'
};

const COUNTRY_COLORS: Record<string, string> = {
    'Australia': 'from-green-500/20 to-yellow-500/20',
    'Austria': 'from-red-600/20 to-white/10',
    'Azerbaijan': 'from-blue-500/20 to-green-500/20',
    'Bahrain': 'from-red-600/20 to-white/10',
    'Belgium': 'from-yellow-500/20 to-red-500/20',
    'Brazil': 'from-green-600/20 to-yellow-500/20',
    'Canada': 'from-red-600/20 to-white/10',
    'China': 'from-red-600/20 to-yellow-500/20',
    'France': 'from-blue-600/20 to-red-600/20',
    'Germany': 'from-yellow-500/20 to-red-500/20',
    'Hungary': 'from-green-600/20 to-red-600/20',
    'Italy': 'from-green-600/20 to-red-600/20',
    'Japan': 'from-white/10 to-red-600/20',
    'Mexico': 'from-green-600/20 to-red-600/20',
    'Monaco': 'from-red-600/20 to-white/10',
    'Netherlands': 'from-orange-500/20 to-blue-600/20',
    'Portugal': 'from-green-600/20 to-red-600/20',
    'Qatar': 'from-purple-800/20 to-white/10',
    'Russia': 'from-blue-600/20 to-red-600/20',
    'Saudi Arabia': 'from-green-600/20 to-white/10',
    'Singapore': 'from-red-600/20 to-white/10',
    'Spain': 'from-red-600/20 to-yellow-500/20',
    'Turkey': 'from-red-600/20 to-white/10',
    'UAE': 'from-green-600/20 to-red-600/20',
    'United Arab Emirates': 'from-green-600/20 to-red-600/20',
    'UK': 'from-blue-700/20 to-red-600/20',
    'USA': 'from-blue-600/20 to-red-600/20',
    'United States': 'from-blue-600/20 to-red-600/20',
};

// Tech Specs for Details
const TRACK_SPECS: Record<string, { len: string, turns: number, record: string, laps: number }> = {
    'bahrain': { len: '5.412 km', turns: 15, record: '1:31.447', laps: 57 },
    'jeddah': { len: '6.174 km', turns: 27, record: '1:30.734', laps: 50 },
    'albert_park': { len: '5.278 km', turns: 14, record: '1:20.260', laps: 58 },
    'suzuka': { len: '5.807 km', turns: 18, record: '1:30.983', laps: 53 },
    'shanghai': { len: '5.451 km', turns: 16, record: '1:31.095', laps: 56 },
    'miami': { len: '5.412 km', turns: 19, record: '1:29.708', laps: 57 },
    'imola': { len: '4.909 km', turns: 19, record: '1:15.484', laps: 63 },
    'monaco': { len: '3.337 km', turns: 19, record: '1:12.909', laps: 78 },
    'villeneuve': { len: '4.361 km', turns: 14, record: '1:13.078', laps: 70 },
    'catalunya': { len: '4.657 km', turns: 14, record: '1:16.330', laps: 66 },
    'red_bull_ring': { len: '4.318 km', turns: 10, record: '1:05.619', laps: 71 },
    'silverstone': { len: '5.891 km', turns: 18, record: '1:27.097', laps: 52 },
    'hungaroring': { len: '4.381 km', turns: 14, record: '1:16.627', laps: 70 },
    'spa': { len: '7.004 km', turns: 19, record: '1:46.286', laps: 44 },
    'zandvoort': { len: '4.259 km', turns: 14, record: '1:11.097', laps: 72 },
    'monza': { len: '5.793 km', turns: 11, record: '1:21.046', laps: 53 },
    'baku': { len: '6.003 km', turns: 20, record: '1:43.009', laps: 51 },
    'singapore': { len: '4.940 km', turns: 19, record: '1:35.867', laps: 62 },
    'americas': { len: '5.513 km', turns: 20, record: '1:36.169', laps: 56 },
    'rodriguez': { len: '4.304 km', turns: 17, record: '1:17.774', laps: 71 },
    'interlagos': { len: '4.309 km', turns: 15, record: '1:10.540', laps: 71 },
    'vegas': { len: '6.201 km', turns: 17, record: '1:35.490', laps: 50 },
    'losail': { len: '5.419 km', turns: 16, record: '1:24.319', laps: 57 },
    'yas_marina': { len: '5.281 km', turns: 16, record: '1:26.103', laps: 58 },
};

// --- HIGH QUALITY DRIVER DATABASE (2025 & LEGENDS) ---
const DRIVER_HEADSHOTS: Record<string, string> = {
    // --- 2025 GRID (High-Res Sources) ---
    'max_verstappen': 'https://media.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png',
    'verstappen': 'https://media.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png',
    'perez': 'https://media.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png',
    'lawson': 'https://media.formula1.com/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png',
    'hamilton': 'https://media.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png',
    'russell': 'https://media.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png',
    'antonelli': 'https://media.formula1.com/content/dam/fom-website/drivers/K/KIMANT01_Kimi_Antonelli/kimant01.png',
    'leclerc': 'https://media.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png',
    'sainz': 'https://media.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png',
    'norris': 'https://media.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png',
    'piastri': 'https://media.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png',
    'alonso': 'https://media.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png',
    'stroll': 'https://media.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png',
    'gasly': 'https://media.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png',
    'ocon': 'https://media.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png',
    'doohan': 'https://media.formula1.com/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png',
    'albon': 'https://media.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png',
    'colapinto': 'https://media.formula1.com/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png',
    'tsunoda': 'https://media.formula1.com/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png',
    'ricciardo': 'https://media.formula1.com/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png',
    'hadjar': 'https://media.formula1.com/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png',
    'bottas': 'https://media.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png',
    'zhou': 'https://media.formula1.com/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png',
    'hulkenberg': 'https://media.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png',
    'bortoleto': 'https://media.formula1.com/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png',
    'magnussen': 'https://media.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png',
    'bearman': 'https://media.formula1.com/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png',

    // --- LEGENDS (Wikimedia High-Quality Archives) ---
    'michael_schumacher': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Michael_Schumacher_2005_United_States_GP.jpg',
    'ayrton_senna': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Ayrton_Senna_1991.jpg',
    'senna': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Ayrton_Senna_1991.jpg',
    'prost': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Alain_Prost_1993.jpg',
    'vettel': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Sebastian_Vettel_2012_Bahrain_GP.jpg',
    'lauda': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Niki_Lauda_1975.jpg',
    'fangio': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Juan_Manuel_Fangio_1955.jpg',
    'clark': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Jim_Clark_1966.jpg',
    'stewart': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Jackie_Stewart_1969.jpg',
    'mansell': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Nigel_Mansell_1991.jpg',
    'raikkonen': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kimi_Raikkonen_2012.jpg',
    'hakkinen': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Mika_Hakkinen_2001.jpg',
    'rosberg': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Nico_Rosberg_2016.jpg',
    'button': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Jenson_Button_2009.jpg',
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

// --- LOADER ---
const NavigationLoader = () => (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-[#DFFF00] blur-2xl opacity-20 animate-pulse"></div>
           <div className="w-16 h-16 border-2 border-zinc-800 border-t-[#DFFF00] rounded-full animate-spin relative z-10"></div>
        </div>
        <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-widest animate-pulse">
            RETRIEVING SECURE DATA...
        </span>
    </div>
);

// --- DRIVER CARD COMPONENT ---
const DriverCard = ({ driver, onNavigate, variant = 'standard', rank }: { driver: any, onNavigate: (url: string) => void, variant?: 'standard' | 'compact' | 'mobile', rank?: number }) => {
    const did = driver.driverId || driver.id || '';
    const image = DRIVER_HEADSHOTS[did] || DRIVER_HEADSHOTS[did.toLowerCase()] || null;
    const teamName = driver.constructors?.[0]?.name || 'Unknown';
    const teamColor = TEAM_COLORS[teamName] || '#52525B';
    
    // Explicitly safe check for stats to ensure no "missing" data appearance
    const latestPos = driver.stats?.latest?.pos ? driver.stats.latest.pos : '---';
    const latestRace = driver.stats?.latest?.race ? driver.stats.latest.race.replace('Grand Prix', '').trim() : 'PREV GP';
    
    const targetUrl = `/sports/f1/driver/${did}`;
    const [imgError, setImgError] = useState(false);

    const isMobile = variant === 'mobile';

    // Dynamic Sizing Based on Variant
    // UPDATED: Increased mobile height from 200px to 280px to prevent face cutoff
    const heightClass = variant === 'compact' ? 'h-[280px]' : isMobile ? 'h-[280px]' : 'h-[360px]';
    // Changed text-lg to text-base for mobile as requested ("tiny bit smaller")
    const titleSize = variant === 'compact' ? 'text-2xl' : isMobile ? 'text-base' : 'text-4xl';
    const padding = isMobile ? 'p-2' : 'p-4';
    const numberSize = isMobile ? 'text-[80px]' : 'text-[140px]';

    return (
        <div 
            onClick={() => onNavigate(targetUrl)}
            className={`
                group cursor-pointer relative border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col transition-all duration-500 hover:border-white hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]
                ${heightClass}
            `}
            style={{ borderBottomWidth: '2px', borderBottomColor: teamColor }}
        >
             <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/30 via-zinc-900/80 to-zinc-950 z-0" />
            
             {/* RANK BADGE FOR MOBILE LIST (Legacy support, usually overridden by grid labels now) */}
             {rank && variant !== 'mobile' && (
                 <div className="absolute top-4 left-4 z-30 md:hidden">
                    <span className="text-4xl font-black text-white/10">{rank}</span>
                 </div>
             )}

            {/* BIG TEAM NUMBER */}
            {driver.permanentNumber && (
                <div className={`absolute top-0 right-[-10px] ${numberSize} font-black text-zinc-800/20 z-0 leading-none select-none group-hover:text-zinc-800/40 transition-colors duration-500`}>
                    {driver.permanentNumber}
                </div>
            )}

            {/* MOBILE ONLY: NATIONALITY TOP LEFT */}
            {isMobile && driver.nationality && (
                <div className="absolute top-2 left-2 z-30">
                    <span className="text-[9px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-sm backdrop-blur-md border border-zinc-800 shadow-sm">
                        {driver.nationality}
                    </span>
                </div>
            )}

            {/* DRIVER IMAGE */}
            <div className="absolute inset-0 z-10 flex items-end justify-center overflow-hidden">
                {!imgError && image ? (
                    <img 
                        src={image} 
                        className="h-[95%] w-auto object-contain object-bottom transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110 drop-shadow-2xl" 
                        alt={driver.familyName}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="mb-8 opacity-10 group-hover:opacity-20 transition-opacity"><User size={120} strokeWidth={1} /></div>
                )}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none" />
            </div>

            {/* INFO LAYER */}
            <div className={`absolute bottom-0 left-0 w-full z-20 ${padding}`}>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        {/* DESKTOP NATIONALITY: ABOVE NAME (Hidden on mobile) */}
                        {!isMobile && (
                            <div className="flex items-center gap-2 mb-1">
                                {driver.nationality && (
                                    <span className="text-[9px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-sm backdrop-blur-sm border border-zinc-800">
                                        {driver.nationality}
                                    </span>
                                )}
                            </div>
                        )}
                        
                        <h3 className={`font-black uppercase italic tracking-tighter text-white leading-[0.85] ${titleSize}`}>
                            {driver.givenName}<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 group-hover:to-white transition-all">
                                {driver.familyName}
                            </span>
                        </h3>
                    </div>
                </div>

                {/* UPDATED STATS GRID WITH EXPLICIT LAST RACE */}
                <div className="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800">
                    <div className="bg-zinc-900 p-2 flex flex-col items-center justify-center group-hover:bg-zinc-800 transition-colors">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase">Season Pts</span>
                        <span className="text-sm font-bold text-white font-mono">{driver.points || 0}</span>
                    </div>
                    <div className="bg-zinc-900 p-2 flex flex-col items-center justify-center group-hover:bg-zinc-800 transition-colors relative overflow-hidden">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase relative z-10">Last Result</span>
                        <div className="flex items-baseline gap-1 relative z-10">
                            <span className={`text-sm font-bold font-mono ${latestPos.includes('DNF') ? 'text-red-500' : 'text-[#DFFF00]'}`}>
                                {latestPos}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-600 uppercase truncate max-w-[50px]">
                                {latestRace}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW TRACK CARD COMPONENT (RECTANGULAR FLAG) ---
const TrackCard = ({ circuit, onNavigate }: { circuit: any, onNavigate: (url: string) => void }) => {
    const cid = circuit.circuitId || '';
    // Use part of ID to find specs (e.g. 'americas' for 'circuit_of_the_americas')
    const specKey = Object.keys(TRACK_SPECS).find(k => cid.toLowerCase().includes(k)) || 'bahrain'; 
    const specs = TRACK_SPECS[specKey] || { len: '---', turns: 0, record: '---', laps: 0 };
    
    // Flag Colors
    const country = circuit.Location.country;
    const gradient = COUNTRY_COLORS[country] || 'from-zinc-800/20 to-zinc-900/20';
    
    // Resolve Flag
    const isoCode = COUNTRY_TO_CODE[country] || 'xx';
    const flagUrl = `https://flagcdn.com/w640/${isoCode.toLowerCase()}.png`;

    return (
        <div 
            onClick={() => onNavigate(`/sports/f1/circuit/${circuit.circuitId}`)}
            className="group cursor-pointer relative h-[280px] border border-zinc-800 bg-zinc-950 hover:border-[#DFFF00] transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
             {/* ATMOSPHERIC GRADIENT (FLAG COLORS) */}
             <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-15 transition-opacity duration-700`} />

             {/* SCHEMATIC GRID OVERLAY */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

             {/* TOP SECTION: NAME & ID */}
             <div className="relative p-6 z-10">
                 <div className="flex justify-between items-start mb-4">
                     <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded bg-black/50">
                         <MapPin size={10} className="inline mr-1 text-[#DFFF00]"/> {isoCode.toUpperCase()}
                     </span>
                     <Hash size={14} className="text-zinc-800 group-hover:text-[#DFFF00] transition-colors" />
                 </div>
                 <h3 className="text-3xl font-black uppercase text-white leading-[0.8] mb-1 group-hover:translate-x-1 transition-transform duration-300">
                     {circuit.circuitName.replace('International', '').replace('Circuit', '').trim()}
                 </h3>
                 <span className="text-[10px] font-mono text-zinc-500 uppercase block mt-2">
                     {circuit.Location.locality}
                 </span>
             </div>

             {/* CENTER VISUAL: CENTERED FLAG RECTANGLE */}
             <div className="flex-1 flex items-center justify-center overflow-hidden py-2 relative">
                 {isoCode !== 'xx' ? (
                     <div className="w-24 h-16 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-500 border border-zinc-800 bg-zinc-900">
                         <img 
                            src={flagUrl} 
                            alt={country} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                         />
                         {/* Subtle Glint */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10 pointer-events-none"></div>
                     </div>
                 ) : (
                    <MapIcon size={48} className="text-zinc-800" strokeWidth={0.5} />
                 )}
             </div>

             {/* BOTTOM SECTION: TECHNICAL SPECS (SIMPLIFIED) */}
             <div className="relative z-10 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
                 <div className="grid grid-cols-2 divide-x divide-zinc-800">
                     <div className="p-3 flex items-center justify-between">
                         <span className="text-[8px] text-zinc-500 font-mono uppercase flex items-center gap-1">
                             <RotateCw size={10}/> Laps
                         </span>
                         <span className="text-xs font-bold text-white">{specs.laps}</span>
                     </div>
                     <div className="p-3 flex items-center justify-between bg-zinc-900 group-hover:bg-[#DFFF00] transition-colors group-hover:text-black">
                         <span className="text-[8px] text-zinc-500 font-mono uppercase flex items-center gap-1 group-hover:text-zinc-800">
                             <Clock size={10}/> Record
                         </span>
                         <span className="text-[10px] font-bold text-[#DFFF00] group-hover:text-black">{specs.record}</span>
                     </div>
                 </div>
             </div>
        </div>
    );
};

const ManufacturerCard = ({ team, onNavigate }: { team: any, onNavigate: (url: string) => void }) => {
    const countryCode = NATIONALITY_CODES[team.nationality] || 'xx';
    const flagUrl = `https://flagcdn.com/w640/${countryCode.toLowerCase()}.png`;
    const teamColor = TEAM_COLORS[team.name] || '#ffffff';

    return (
        <div 
            onClick={() => onNavigate(`/sports/f1/team/${team.constructorId}`)}
            className="group cursor-pointer border border-zinc-800 bg-zinc-900 hover:border-white transition-all duration-300 relative h-48 overflow-hidden"
            style={{ borderTop: `2px solid ${teamColor}` }}
        >
             <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                {countryCode !== 'xx' && <img src={flagUrl} className="w-full h-full object-cover grayscale" alt={team.nationality} />}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                <div className="flex justify-between items-end mb-4">
                     <div>
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1 block">CONSTRUCTOR</span>
                        <h3 className="text-3xl font-black uppercase text-white leading-none italic tracking-tighter">
                            {team.name}
                        </h3>
                     </div>
                </div>
                
                <div className="flex gap-6 border-t border-zinc-800/50 pt-3">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-mono uppercase">Points</span>
                        <span className="text-sm font-bold text-[#DFFF00]">{team.points}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-mono uppercase">Wins</span>
                        <span className="text-sm font-bold text-white">{team.wins}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STARTING GRID VISUALIZATION ---
const StartingGrid = ({ drivers, onNavigate }: { drivers: any[], onNavigate: (url: string) => void }) => {
    // DESKTOP: Split logic for staggered grid
    const leftSide = drivers.filter((_, i) => i % 2 === 0);
    const rightSide = drivers.filter((_, i) => i % 2 !== 0);

    return (
        <div className="relative max-w-6xl mx-auto py-4 md:py-12 px-0 md:px-4">
            
            {/* DESKTOP VIEW: STAGGERED GRID */}
            <div className="hidden md:block">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2" />
                <div className="absolute left-1/2 top-0 w-24 h-full border-l border-r border-zinc-800/30 -translate-x-1/2" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-4 bg-[repeating-linear-gradient(90deg,white,white_20px,transparent_20px,transparent_40px)] opacity-20" />

                <div className="grid grid-cols-2 gap-12 relative z-10">
                    <div className="flex flex-col gap-12">
                        {leftSide.map((driver, i) => (
                            <div key={driver.driverId} className="relative group">
                                <div className="absolute -left-12 top-10 font-black text-6xl text-zinc-800/20 rotate-[-90deg]">
                                    P{i * 2 + 1}
                                </div>
                                <DriverCard driver={driver} onNavigate={onNavigate} variant="standard" />
                                {i === 0 && (
                                    <div className="absolute -top-6 left-0 bg-[#DFFF00] text-black text-[10px] font-black uppercase px-3 py-1 tracking-widest shadow-[0_0_15px_#DFFF00]">
                                        POLE POSITION
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-12 pt-32">
                        {rightSide.map((driver, i) => (
                            <div key={driver.driverId} className="relative group">
                                <div className="absolute -right-12 top-10 font-black text-6xl text-zinc-800/20 rotate-[90deg]">
                                    P{i * 2 + 2}
                                </div>
                                <DriverCard driver={driver} onNavigate={onNavigate} variant="standard" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MOBILE VIEW: STAGGERED GRID (SCALED DOWN) */}
            <div className="md:hidden block relative px-1">
                {/* Central Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2" />
                
                <div className="grid grid-cols-2 gap-3">
                    {/* Left Column (P1, P3, P5...) */}
                    <div className="flex flex-col gap-3">
                        {leftSide.map((driver, i) => (
                             <div key={driver.driverId} className="relative group">
                                {/* Position Label - Scaled */}
                                <div className="absolute -left-2 top-2 font-black text-2xl text-zinc-800/30 rotate-[-90deg] z-0">
                                    P{i * 2 + 1}
                                </div>
                                
                                {i === 0 && (
                                    <div className="absolute -top-3 left-0 z-30 bg-[#DFFF00] text-black text-[8px] font-black uppercase px-2 py-0.5 tracking-widest shadow-[0_0_10px_rgba(223,255,0,0.4)]">
                                        POLE
                                    </div>
                                )}
                                
                                <DriverCard driver={driver} onNavigate={onNavigate} variant="mobile" />
                             </div>
                        ))}
                    </div>

                    {/* Right Column (P2, P4, P6...) */}
                    <div className="flex flex-col gap-3 pt-12">
                         {rightSide.map((driver, i) => (
                             <div key={driver.driverId} className="relative group">
                                <div className="absolute -right-2 top-2 font-black text-2xl text-zinc-800/30 rotate-[90deg] z-0">
                                    P{i * 2 + 2}
                                </div>
                                <DriverCard driver={driver} onNavigate={onNavigate} variant="mobile" />
                             </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

// --- MAIN CLIENT COMPONENT ---
export default function F1Dashboard({ activeDrivers, teams, tracks, season }: { activeDrivers: any[], teams: any[], tracks: any[], season: string }) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'drivers' | 'tracks' | 'elo' | 'teams'>('drivers');
    const [driverLayout, setDriverLayout] = useState<'grid' | 'cards'>('grid');
    const [isNavigating, setIsNavigating] = useState(false);

    const handleNavigate = (url: string) => {
        setIsNavigating(true);
        router.push(url);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20">
            {isNavigating && <NavigationLoader />}

            {/* UPDATED: Increased top padding from pt-24 to pt-36 on mobile to clear fixed Back Button */}
            <div className="pt-36 md:pt-24 pb-12 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 mb-12 relative">
                
                {/* BADGE MOVED TO RELATIVE FLEX ON MOBILE TO AVOID OVERLAP */}
                {/* UPDATED: Changed absolute to static flex on mobile, absolute on desktop */}
                <div className="flex justify-end mb-4 md:mb-0 md:absolute md:top-0 md:right-4 md:mt-24 lg:mt-24 xl:right-6">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-[#DFFF00] tracking-widest uppercase">
                      <Flag size={12} />
                      <span>F1 INTELLIGENCE HUB // {season}</span>
                   </div>
                </div>

                <div className="flex flex-col xl:flex-row items-end justify-between gap-8">
                    <div>
                        {/* Responsive Text Size */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white uppercase mb-2">
                           Formula <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-800 text-stroke-white">One</span>
                        </h1>
                    </div>

                    {/* Scrollable Navigation for Mobile */}
                    <div className="w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 no-scrollbar">
                        <div className="flex gap-2 bg-zinc-900/50 p-1 border border-zinc-800 rounded-lg backdrop-blur-sm min-w-max">
                            {['drivers', 'teams', 'tracks', 'elo'].map((mode) => (
                                <button 
                                    key={mode} 
                                    onClick={() => setViewMode(mode as any)} 
                                    className={`
                                        px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-md whitespace-nowrap
                                        ${viewMode === mode 
                                            ? 'bg-[#DFFF00] text-black shadow-[0_0_20px_rgba(223,255,0,0.2)]' 
                                            : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}
                                    `}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6">
                {viewMode !== 'elo' && (
                    <div className="mb-12 sticky top-4 z-40">
                        <F1Search />
                    </div>
                )}

                {viewMode === 'drivers' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                                <Activity size={14} className="text-[#DFFF00]"/> 
                                Active Grid ({activeDrivers.length})
                            </div>
                            <div className="flex gap-1 bg-zinc-900 p-1 border border-zinc-800 rounded-md">
                                <button onClick={() => setDriverLayout('grid')} className={`p-2 rounded ${driverLayout === 'grid' ? 'bg-zinc-800 text-[#DFFF00]' : 'text-zinc-500 hover:text-white'}`}><Grid3X3 size={16} /></button>
                                <button onClick={() => setDriverLayout('cards')} className={`p-2 rounded ${driverLayout === 'cards' ? 'bg-zinc-800 text-[#DFFF00]' : 'text-zinc-500 hover:text-white'}`}><List size={16} /></button>
                            </div>
                        </div>
                        {driverLayout === 'grid' ? <StartingGrid drivers={activeDrivers} onNavigate={handleNavigate} /> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {activeDrivers.map((driver) => <DriverCard key={driver.driverId} driver={driver} onNavigate={handleNavigate} />)}
                            </div>
                        )}
                    </div>
                )}

                {viewMode === 'teams' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teams.map(t => <ManufacturerCard key={t.constructorId} team={t} onNavigate={handleNavigate} />)}
                        </div>
                    </div>
                )}

                {viewMode === 'tracks' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {tracks.map(t => <TrackCard key={t.circuitId} circuit={t} onNavigate={handleNavigate} />)}
                        </div>
                    </div>
                )}

                {viewMode === 'elo' && <EloLeaderboard />}
            </div>
        </div>
    );
}