'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Flag, Loader2, Trophy, AlertTriangle, User, History, Activity, RefreshCw, CheckCircle2, Map, MapPin, Share2, Info, Crown, TrendingUp, Medal, Wrench, Users, Car, ChevronDown } from 'lucide-react';
import Link from 'next/link';

// --- UTILS: SMART IMAGE SEARCH ---
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

// --- UTILS: NAME FORMATTER ---
const formatName = (name: string) => {
    return name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// --- COMPONENT 1: DRIVER CARD ---
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
                let url = await searchCommons(`File:${fullName} F1 portrait 2024`);
                if (!url) url = await searchCommons(`File:${fullName} driver face`);
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

// --- COMPONENT 2: TRACK CARD ---
const TrackCard = ({ circuit }: { circuit: any }) => {
    const [mapImage, setMapImage] = useState<string | null>(null);
    const [flagImage, setFlagImage] = useState<string | null>(null);

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

            if (DIRECT_MAPS[id]) { setMapImage(DIRECT_MAPS[id]); return; }

            const getMap = async (q: string) => {
                 try {
                    const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`);
                    const data = await res.json();
                    if (!data.query || !data.query.pages) return null;
                    const pages = Object.values(data.query.pages);
                    // @ts-ignore
                    return pages.length > 0 ? pages[0].imageinfo[0].url : null;
                } catch (e) { return null; }
            }

            let mapUrl = await getMap(`File:${name} Layout.svg`); 
            if (!mapUrl) mapUrl = await getMap(`File:${name} track map.svg`);
            if (!mapUrl) mapUrl = await getMap(`File:${name} circuit.png`);
            
            if (mapUrl) {
                setMapImage(mapUrl);
            } else {
                let flagUrl = await getMap(`File:Flag of ${country}.svg`);
                if (flagUrl) setFlagImage(flagUrl);
            }
        };
        fetchAssets();
    }, [circuit]);

    return (
        <Link 
            href={`/sports/f1/circuit/${circuit.circuitId}`} 
            className="group border-2 border-black dark:border-zinc-500 bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex flex-col h-auto md:h-64 relative overflow-hidden"
        >
            <div className="h-32 md:h-40 bg-zinc-50 dark:bg-zinc-950 border-b-2 border-inherit relative flex items-center justify-center p-6 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors overflow-hidden">
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

// --- COMPONENT 3: MANUFACTURER CARD ---
const ManufacturerCard = ({ team, isHistorical = false }: { team: any, isHistorical?: boolean }) => {
    const [logo, setLogo] = useState<string | null>(null);

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
        'minardi': 'https://commons.wikimedia.org/wiki/Special:FilePath/Minardi_F1_logo.svg',
        'toro_rosso': 'https://commons.wikimedia.org/wiki/Special:FilePath/Scuderia_Toro_Rosso_Logo.svg',
        'alphatauri': 'https://commons.wikimedia.org/wiki/Special:FilePath/Scuderia_AlphaTauri_Logo.svg',
        'racing_point': 'https://commons.wikimedia.org/wiki/Special:FilePath/Racing_Point_F1_Team_logo.svg',
        'force_india': 'https://commons.wikimedia.org/wiki/Special:FilePath/Sahara_Force_India_F1_Team_Logo.svg',
        'renault': 'https://commons.wikimedia.org/wiki/Special:FilePath/Renault_F1_Team_logo.svg',
        'toyota': 'https://commons.wikimedia.org/wiki/Special:FilePath/Toyota_F1_Team.svg',
        'bmw_sauber': 'https://commons.wikimedia.org/wiki/Special:FilePath/BMW_Sauber_F1_Team_logo.svg',
        'honda': 'https://commons.wikimedia.org/wiki/Special:FilePath/Honda_Racing_F1_Team_logo.svg',
        'jaguar': 'https://commons.wikimedia.org/wiki/Special:FilePath/Jaguar_Racing.svg',
        'brabham': 'https://commons.wikimedia.org/wiki/Special:FilePath/Brabham_logo.svg',
        'cooper': 'https://commons.wikimedia.org/wiki/Special:FilePath/Cooper_Car_Company_logo.svg',
        'vanwall': 'https://commons.wikimedia.org/wiki/Special:FilePath/Vanwall_logo.svg',
        'march': 'https://commons.wikimedia.org/wiki/Special:FilePath/March_Engineering_logo.svg',
        'arrows': 'https://commons.wikimedia.org/wiki/Special:FilePath/Arrows_Grand_Prix_logo.svg',
        'bar': 'https://commons.wikimedia.org/wiki/Special:FilePath/British_American_Racing_logo.svg',
    };

    useEffect(() => {
        const fetchLogo = async () => {
            const id = team.constructorId;
            if (TEAM_LOGO_MAP[id]) { setLogo(TEAM_LOGO_MAP[id]); return; }

            const name = team.name.split('-')[0].trim();
            
            let url = await searchCommons(`File:${name} F1 logo.svg`);
            if (!url) url = await searchCommons(`File:${name} Formula One logo.svg`);
            if (!url) url = await searchCommons(`File:${name} Grand Prix logo.svg`);
            if (!url) url = await searchCommons(`File:Scuderia ${name} logo.svg`);
            
            if (url) setLogo(url);
        };
        fetchLogo();
    }, [team]);

    const drivers = team.drivers || [];

    return (
        <Link href={`/sports/f1/team/${team.constructorId}`} className="group border-2 border-black dark:border-zinc-500 bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#DFFF00] transition-all duration-200 flex flex-col h-auto md:h-64 relative overflow-hidden">
            <div className="h-32 md:h-40 bg-zinc-50 dark:bg-zinc-950 border-b-2 border-inherit relative flex items-center justify-center p-6 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors overflow-hidden">
                {logo ? (
                    <img src={logo} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:filter dark:invert opacity-90 group-hover:scale-105 transition-transform duration-500" alt="Team Logo" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                        <Wrench size={64} />
                        {isHistorical && <span className="text-[9px] font-mono mt-2 font-bold tracking-widest text-zinc-400">NO LOGO IN ARCHIVE</span>}
                    </div>
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

// --- COMPONENT 4: ELO LEADERBOARD (V6.0 - THE GOLDEN RATIO) ---
const EloLeaderboard = () => {
    const [ratings, setRatings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(15);
    
    const LEGENDS = [
        'senna', 'michael_schumacher', 'prost', 'vettel', 'lauda', 'fangio', 'clark', 
        'hamilton', 'max_verstappen', 'alonso', 'raikkonen', 'mansell', 'stewart', 
        'nico_rosberg', 'keke_rosberg', 'hakkinen', 'piquet', 'emerson_fittipaldi', 
        'ascari', 'graham_hill', 'damon_hill', 'gilles_villeneuve', 'jacques_villeneuve', 
        'jones', 'rindt', 'surtees', 'hunt', 'mario_andretti', 'jack_brabham', 'hawthorn', 
        'phil_hill', 'farina', 'moss', 'peterson', 'ickx', 'regazzoni', 'coulthard', 
        'webber', 'massa', 'berger', 'patrese', 'alboreto', 'jody_scheckter', 'montoya'
    ];

    const CHAMPIONSHIPS: Record<string, number> = { 
        'michael_schumacher': 7, 'hamilton': 7, 'fangio': 5, 'prost': 4, 'vettel': 4, 'max_verstappen': 4,
        'senna': 3, 'lauda': 3, 'stewart': 3, 'piquet': 3, 'jack_brabham': 3,
        'alonso': 2, 'clark': 2, 'hakkinen': 2, 'emerson_fittipaldi': 2, 'graham_hill': 2, 'ascari': 2,
        'raikkonen': 1, 'mansell': 1, 'nico_rosberg': 1, 'keke_rosberg': 1, 'button': 1, 'hunt': 1, 'jones': 1, 'villeneuve': 1, 
        'damon_hill': 1, 'surtees': 1, 'rindt': 1, 'mario_andretti': 1, 'hawthorn': 1, 'phil_hill': 1, 'farina': 1,
        'jody_scheckter': 1, 'moss': 0, 'peterson': 0
    };

    useEffect(() => {
        const calculateElo = async () => {
            const activeRes = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
            const activeData = await activeRes.json();
            const activeDrivers = activeData.MRData.StandingsTable.StandingsLists[0].DriverStandings.map((d: any) => d.Driver.driverId);
            const allDriverIds = Array.from(new Set([...activeDrivers, ...LEGENDS]));
            
            let calculatedRatings: any[] = [];
            
            for (let i = 0; i < allDriverIds.length; i++) {
                const id = allDriverIds[i];
                try {
                    const res = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${id}/results.json?limit=1000`);
                    const data = await res.json();
                    const races = data.MRData.RaceTable.Races;
                    const driverInfo = data.MRData.RaceTable.Races[0]?.Results[0].Driver || { givenName: id, familyName: '', driverId: id };
                    
                    const entries = races.length;
                    let wins = 0, podiums = 0, poles = 0;
                    const titles = CHAMPIONSHIPS[id] || 0;

                    races.forEach((r: any) => { 
                        const pos = parseInt(r.Results[0].position);
                        const grid = parseInt(r.Results[0].grid);
                        if (pos === 1) wins++;
                        if (pos <= 3) podiums++;
                        if (grid === 1) poles++;
                    });

                    // --- ZINC ELO V6.0 ---
                    let score = 1000;
                    score += (titles * 2500); 
                    score += (wins * 75);
                    score += (poles * 40);
                    
                    if (entries > 10) {
                        const winRate = (wins / entries);
                        score += (winRate * 5000); 
                        
                        const podiumRate = (podiums / entries);
                        score += (podiumRate * 1000);
                    }
                    
                    if (titles === 0) {
                        if (wins >= 10) score += 2000; 
                        if (wins / entries > 0.15) score += 1000;
                    }

                    let tier = 'ROOKIE';
                    if (score > 16000) tier = 'GOD TIER';
                    else if (score > 12000) tier = 'GRANDMASTER';
                    else if (score > 8000) tier = 'LEGEND';
                    else if (score > 5000) tier = 'CHAMPION';
                    else if (score > 2000) tier = 'ELITE';
                    else if (score > 1200) tier = 'PRO';

                    const name = formatName(driverInfo.givenName + " " + driverInfo.familyName);
                    
                    calculatedRatings.push({ 
                        id, 
                        name, 
                        elo: Math.floor(score), 
                        titles, 
                        wins, 
                        entries, 
                        tier,
                        winRate: entries > 0 ? ((wins/entries)*100).toFixed(1) : "0.0",
                        podiumRate: entries > 0 ? ((podiums/entries)*100).toFixed(1) : "0.0"
                    });
                    
                    if (i % 5 === 0 || i === allDriverIds.length - 1) {
                         setRatings([...calculatedRatings].sort((a, b) => b.elo - a.elo));
                         if (i > 5) setLoading(false);
                    }
                } catch (e) {}
            }
        };
        calculateElo();
    }, []);

    const handleLoadMore = () => setVisibleCount(prev => prev + 15);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-zinc-900 border-2 border-black dark:border-zinc-700 p-6 mb-8">
                <div className="flex items-center gap-2 text-acid mb-2"><Info size={14}/><span className="font-bold font-mono text-xs tracking-widest">ZINC ELO ENGINE // V.6.0 (GOLDEN)</span></div>
                <p className="text-zinc-400 font-mono text-xs max-w-3xl leading-relaxed">
                    <span className="text-acid font-bold">BETA.</span> Calculates Skill Rating via: 
                    <span className="text-white"> Championships (2500)</span>, <span className="text-white">Win Dominance (5000)</span>, <span className="text-white">Wins (75)</span>, and <span className="text-white">Poles (40)</span>. 
                    Features 'Uncrowned King' protocol to properly rank legends like Stirling Moss.
                </p>
            </div>
            
            {loading && ratings.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="animate-spin text-acid" size={32}/><span className="font-mono text-xs animate-pulse text-zinc-500">CALCULATING LEGACY RATINGS...</span></div>
            )}

            <div className="grid gap-2">
                {ratings.slice(0, visibleCount).map((r, i) => (
                    <Link href={`/sports/f1/driver/${r.id}`} key={r.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border-2 border-transparent hover:border-black dark:hover:border-white p-4 group transition-all shadow-sm hover:shadow-md cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex items-center justify-center font-black font-mono text-sm ${i < 3 ? 'bg-acid text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{i + 1}</div>
                            <div>
                                <h3 className="font-black text-lg uppercase leading-none text-black dark:text-white">{r.name}</h3>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-[9px] font-bold font-mono uppercase tracking-widest ${r.tier === 'GOD TIER' ? 'text-acid bg-black px-1' : r.tier === 'GRANDMASTER' ? 'text-yellow-600' : 'text-zinc-400'}`}>{r.tier}</span>
                                    {r.titles > 0 && <span className="text-[9px] font-bold font-mono text-yellow-600 flex items-center gap-1"><Crown size={8} /> {r.titles}x WDC</span>}
                                    {r.titles === 0 && r.wins >= 10 && <span className="text-[9px] font-bold font-mono text-zinc-500 flex items-center gap-1"><Medal size={8} /> LEGEND</span>}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end text-black dark:text-white"><TrendingUp size={14} className={i < 3 ? "text-green-500" : "text-zinc-300"} /><span className="text-2xl font-black font-mono">{r.elo.toLocaleString()}</span></div>
                            <div className="flex gap-3 justify-end text-[9px] font-mono text-zinc-400">
                                <span>{r.wins} WINS</span>
                                <span className="text-zinc-600">|</span>
                                <span>{r.winRate}% RATE</span>
                                <span className="text-zinc-600">|</span>
                                <span>{r.podiumRate}% POD</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            {ratings.length > visibleCount && (
                <button onClick={handleLoadMore} className="w-full py-4 mt-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent hover:border-black dark:hover:border-zinc-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                    LOAD MORE DRIVERS <ChevronDown size={14}/>
                </button>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: DRIVER DATABASE (On-Demand History) ---
const DriverDatabase = () => {
    const [search, setSearch] = useState('');
    const [activeDrivers, setActiveDrivers] = useState<any[]>([]);
    const [historicalDrivers, setHistoricalDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [error, setError] = useState(false);
    const [lastSync, setLastSync] = useState<string>("");
    const downloadStarted = useRef(false);

    const fetchActiveGrid = async () => {
        try {
            const t = `?t=${Date.now()}`;
            const standingsRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/driverStandings.json${t}`);
            const standingsData = await standingsRes.json();
            const standingsList = standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
            const lastRaceRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/last/results.json${t}`);
            const lastRaceData = await lastRaceRes.json();
            const lastRace = lastRaceData.MRData.RaceTable.Races[0];
            const allResultsRes = await fetch(`https://api.jolpi.ca/ergast/f1/current/results.json?limit=1000`);
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
        } catch (e) { setError(true); } finally { setLoading(false); }
    };
    useEffect(() => { fetchActiveGrid(); }, []);

    // LIVE SEARCH: Query API if driver not in local cache
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
                for (let i = 0; i < batches; i++) { promises.push(fetch(`https://api.jolpi.ca/ergast/f1/drivers.json?limit=${limit}&offset=${i * limit}`).then(res => res.json()).then(data => data.MRData.DriverTable.Drivers)); }
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
             <div className="mb-12 sticky top-24 z-30 relative">
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
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['drivers', 'tracks', 'elo', 'teams'].map((mode) => (
                        <button key={mode} onClick={() => setViewMode(mode as any)} className={`px-4 md:px-6 py-3 font-black font-mono text-xs uppercase tracking-widest border-2 transition-all whitespace-nowrap ${viewMode === mode ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_#DFFF00]' : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'}`}>{mode}</button>
                    ))}
                </div>
            </div>
            {viewMode === 'drivers' && <DriverDatabase />}
            {viewMode === 'tracks' && <TrackSchematics />}
            {viewMode === 'elo' && <EloLeaderboard />}
            {viewMode === 'teams' && <ManufacturerDatabase />}
        </div>
    );
}