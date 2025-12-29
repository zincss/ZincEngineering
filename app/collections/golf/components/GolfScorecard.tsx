//
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Minus, Users, Play, RotateCcw, ChevronLeft, ChevronRight, 
  Trophy, Wind, Thermometer, MapPin, Target, Activity, ListOrdered, X, Compass, Power,
  DollarSign, TrendingUp, TrendingDown, Menu, ArrowUp, Navigation
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- TYPES ---
type GameMode = 'STROKE' | 'SCRAMBLE' | 'MATCH' | 'MONEY';
type UnitSystem = 'METRIC' | 'IMPERIAL';
type HolePhase = 'INTEL' | 'ENGAGEMENT'; 

interface Player {
  id: string;
  name: string; 
  scores: number[]; 
}

interface LeaderboardPlayer extends Player {
    total: number;
    relative: number;
    display: string;
    money?: number; 
}

interface LocalWeather {
  temp: number; 
  windSpeed: number; 
  windDirection: number; 
  loaded: boolean;
}

const TOTAL_HOLES = 18;
const DEFAULT_PARS = Array(18).fill(4); 

// --- UTILITY ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function GolfScorecard() {
  // --- STATE ---
  const [mode, setMode] = useState<'SETUP' | 'ACTIVE' | 'SUMMARY'>('SETUP');
  const [gameMode, setGameMode] = useState<GameMode>('STROKE');
  const [units, setUnits] = useState<UnitSystem>('METRIC');
  
  // Players & Game
  const [players, setPlayers] = useState<Player[]>([]);
  const [inputName, setInputName] = useState('');
  const [currentHole, setCurrentHole] = useState(1);
  const [pars, setPars] = useState<number[]>(DEFAULT_PARS);
  const [holePhase, setHolePhase] = useState<HolePhase>('INTEL'); 
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Money Mode State
  const [baseStake, setBaseStake] = useState(10); 
  const [holeStakes, setHoleStakes] = useState<number[]>(Array(18).fill(10)); 
  
  // Transition State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState(1); 

  // Tactical / Compass State
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [manualHeading, setManualHeading] = useState(0); 
  const [isCompassActive, setIsCompassActive] = useState(false);

  // Auto-Scroll Refs
  const activeSectionRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Weather
  const [weather, setWeather] = useState<LocalWeather>({ 
    temp: 0, windSpeed: 0, windDirection: 0, loaded: false 
  });

  // --- EFFECT: WEATHER ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code`
          );
          const data = await res.json();
          setWeather({
            temp: data.current.temperature_2m,
            windSpeed: data.current.wind_speed_10m,
            windDirection: data.current.wind_direction_10m,
            loaded: true
          });
        } catch (error) { console.error("Weather fetch failed", error); }
      });
    }
  }, []);

  // --- COMPASS HANDLERS ---
  const handleOrientation = useCallback((event: any) => {
      let heading: number | null = null;
      
      // iOS WebKit Support
      if (event.webkitCompassHeading) {
          heading = event.webkitCompassHeading;
      } 
      // Standard / Android (Try to use absolute if available, else relative alpha)
      else if (event.alpha !== null) {
          // If the device reports absolute orientation, or generally on Android chrome
          heading = 360 - event.alpha;
      }

      if (heading !== null) {
          setDeviceHeading(heading);
      }
  }, []);

  const toggleCompass = async () => {
      if (isCompassActive) {
          window.removeEventListener('deviceorientation', handleOrientation);
          // @ts-ignore
          window.removeEventListener('deviceorientationabsolute', handleOrientation);
          setIsCompassActive(false);
          setDeviceHeading(null);
          return;
      }

      const startListening = () => {
          setIsCompassActive(true);
          // Try absolute first for Android
          // Cast to any to avoid TS narrowing window to 'never' if property is missing from type defs
          if ('ondeviceorientationabsolute' in (window as any)) {
               // @ts-ignore
               (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
          } else {
               window.addEventListener('deviceorientation', handleOrientation);
          }
      };

      // Check for iOS permission requirement
      // @ts-ignore
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          try {
              // @ts-ignore
              const permission = await DeviceOrientationEvent.requestPermission();
              if (permission === 'granted') {
                  startListening();
              } else {
                  alert("Compass permission required for wind vectoring.");
              }
          } catch (error) {
              console.error(error);
          }
      } else {
          // Standard devices
          startListening();
      }
  };

  useEffect(() => {
      return () => { 
          window.removeEventListener('deviceorientation', handleOrientation);
          // @ts-ignore
          if ('ondeviceorientationabsolute' in (window as any)) {
            // @ts-ignore
            (window as any).removeEventListener('deviceorientationabsolute', handleOrientation);
          }
      };
  }, [handleOrientation]);


  // --- EFFECT: AUTO-SCROLL ---
  useEffect(() => {
    if (mode === 'ACTIVE' && !isTransitioning) {
        setTimeout(() => {
            activeSectionRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 150);
    }
  }, [holePhase, currentHole, mode, isTransitioning]);


  // --- HELPERS ---
  const displayVal = (val: number, type: 'temp'|'speed') => {
      if (type === 'temp') return units === 'METRIC' ? `${Math.round(val)}°C` : `${Math.round((val * 9/5)+32)}°F`;
      if (type === 'speed') return units === 'METRIC' ? `${Math.round(val)}kph` : `${Math.round(val * 0.62)}mph`;
      return '';
  };

  // --- ADVANCED WIND ANALYSIS ---
  const getWindAnalysis = () => {
      if (!weather.loaded) return { term: "OFFLINE", color: "text-zinc-500", advice: "Weather data unavailable", angle: 0 };
      
      const headingToUse = isCompassActive && deviceHeading !== null ? deviceHeading : manualHeading;
      
      // Calculate where wind is coming FROM relative to user
      // 0 = Wind hitting face (Headwind)
      // 180 = Wind hitting back (Tailwind)
      // 90 = Wind from right
      // 270 = Wind from left
      let rel = (weather.windDirection - headingToUse + 360) % 360;
      
      // Calculate wind speed in MPH for advice logic (approx 1 club per 10mph)
      const speedMph = weather.windSpeed * 0.621371;
      const isSignificant = speedMph > 5;
      
      let term = "CALM";
      let color = "text-zinc-500";
      let advice = "No adjustment needed";
      
      if (isSignificant) {
          if (rel >= 315 || rel < 45) {
              term = "HEADWIND";
              color = "text-red-500";
              const clubs = Math.ceil(speedMph / 10);
              advice = `Club Up ${clubs} ${clubs > 1 ? 'clubs' : 'club'}. Keep it low.`;
          } else if (rel >= 45 && rel < 135) {
              term = "RIGHT-TO-LEFT";
              color = "text-orange-400";
              advice = "Aim Right. Wind will draw ball Left.";
          } else if (rel >= 135 && rel < 225) {
              term = "TAILWIND";
              color = "text-[#DFFF00]";
              const clubs = Math.ceil(speedMph / 10);
              advice = `Club Down ${clubs}. Launch it high.`;
          } else if (rel >= 225 && rel < 315) {
              term = "LEFT-TO-RIGHT";
              color = "text-orange-400";
              advice = "Aim Left. Wind will fade ball Right.";
          }
      }

      return { term, color, advice, angle: rel, rawSpeed: speedMph };
  };

  // --- LOGIC ---
  const calculateBalances = () => {
      const balances = new Map<string, number>();
      players.forEach(p => balances.set(p.id, 0));
      let currentPot = 0; 
      for (let i = 0; i < 18; i++) {
          const scores = players.map(p => ({ id: p.id, score: p.scores[i] }));
          if (scores.some(s => s.score === 0)) break; 
          currentPot += holeStakes[i];
          const minScore = Math.min(...scores.map(s => s.score));
          const winners = scores.filter(s => s.score === minScore);
          if (winners.length === 1) {
              const winnerId = winners[0].id;
              const winAmount = currentPot * (players.length - 1);
              const lossAmount = currentPot; 
              balances.set(winnerId, (balances.get(winnerId) || 0) + winAmount);
              players.forEach(p => {
                  if (p.id !== winnerId) balances.set(p.id, (balances.get(p.id) || 0) - lossAmount);
              });
              currentPot = 0;
          }
      }
      return { balances, carryover: currentPot };
  };

  const getLeaderboard = (): LeaderboardPlayer[] => {
      if (gameMode === 'MATCH') {
          let status = 0;
          players[0].scores.forEach(s => status += s);
          return [
              { ...players[0], total: status, relative: status > 0 ? -1 : status < 0 ? 1 : 0, display: status === 0 ? 'AS' : status > 0 ? `${status} UP` : `${Math.abs(status)} DN` },
              { ...players[1], total: -status, relative: status < 0 ? -1 : status > 0 ? 1 : 0, display: status === 0 ? 'AS' : status < 0 ? `${Math.abs(status)} UP` : `${status} DN` }
          ];
      }
      if (gameMode === 'MONEY') {
          const { balances } = calculateBalances();
          return players.map(p => {
              const money = balances.get(p.id) || 0;
              const total = p.scores.reduce((a,b) => a+b, 0);
              return { ...p, total, relative: money > 0 ? -1 : 0, money, display: money === 0 ? '--' : money > 0 ? `+$${money}` : `-$${Math.abs(money)}` };
          }).sort((a,b) => (b.money || 0) - (a.money || 0));
      }
      return players.map(p => {
          const total = p.scores.reduce((a,b)=>a+b,0);
          let validPar = 0;
          p.scores.forEach((s, i) => { if(s > 0) validPar += pars[i] });
          const relative = total - validPar;
          return { ...p, total, relative, display: relative > 0 ? `+${relative}` : relative === 0 ? 'E' : relative.toString() };
      }).sort((a,b) => a.relative - b.relative);
  };

  // --- ACTIONS ---
  const handleAddPlayer = () => {
    const limit = gameMode === 'SCRAMBLE' ? 1 : gameMode === 'MATCH' ? 2 : 4;
    if (!inputName.trim() || players.length >= limit) return;
    const newPlayer: Player = { id: Date.now().toString(), name: inputName.toUpperCase().slice(0, 8), scores: Array(TOTAL_HOLES).fill(0) };
    setPlayers([...players, newPlayer]);
    setInputName('');
  };

  const updateScore = (pIdx: number, change: number) => {
    const newP = [...players];
    const current = newP[pIdx].scores[currentHole-1];
    let val = current === 0 ? pars[currentHole-1] : current + change;
    if (val < 1) val = 1;
    newP[pIdx].scores[currentHole-1] = val;
    setPlayers(newP);
  };

  const setMatchResult = (result: 1 | 0 | -1) => {
      const newP = [...players];
      newP[0].scores[currentHole-1] = result; 
      newP[1].scores[currentHole-1] = -result; 
      setPlayers(newP);
  };

  const nextHole = () => {
      if (currentHole >= 18) { setMode('SUMMARY'); return; }
      setTransitionTarget(currentHole + 1);
      setIsTransitioning(true);
      setTimeout(() => {
          setCurrentHole(h => h + 1);
          setHolePhase('INTEL'); 
          setIsTransitioning(false);
      }, 800);
  };

  const confirmIntel = () => {
      setHolePhase('ENGAGEMENT');
  };

  const updateHoleStake = (amount: number) => {
      const newStakes = [...holeStakes];
      newStakes[currentHole-1] = amount;
      setHoleStakes(newStakes);
  };

  const terminateRound = () => {
      if(confirm('TERMINATE MISSION EARLY?')) { setMode('SUMMARY'); setShowLeaderboard(false); }
  };

  // --- RENDER HELPERS ---
  const { carryover } = calculateBalances();
  const currentHoleStake = holeStakes[currentHole-1];
  const totalPot = currentHoleStake + carryover;

  // ================= VIEW: SETUP =================
  if (mode === 'SETUP') {
    return (
      <div className="max-w-xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 px-4 pt-12">
          <div className="text-center mb-10 space-y-4">
               <div className="inline-block p-4 rounded-full bg-zinc-900 border border-zinc-800 shadow-2xl">
                    <Activity size={32} className="text-[#DFFF00]" />
               </div>
               <h2 className="text-4xl font-black uppercase text-white tracking-tighter">Mission Config</h2>
               <div className="flex justify-center gap-2">
                   {['METRIC', 'IMPERIAL'].map(u => (
                       <button 
                        key={u} 
                        onClick={() => setUnits(u as UnitSystem)}
                        className={cn(
                            "text-[10px] font-bold px-4 py-2 rounded-lg border transition-all",
                            units === u ? "bg-[#DFFF00] text-black border-[#DFFF00]" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white"
                        )}
                       >
                           {u}
                       </button>
                   ))}
               </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
              {(['STROKE', 'SCRAMBLE', 'MATCH', 'MONEY'] as GameMode[]).map(m => (
                  <button 
                    key={m} 
                    onClick={() => { setGameMode(m); setPlayers([]); }}
                    className={cn(
                        "p-6 border rounded-2xl flex flex-col items-center gap-3 transition-all duration-300",
                        gameMode === m 
                            ? "bg-[#DFFF00] border-[#DFFF00] text-black shadow-lg transform scale-[1.02]" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                      {m === 'STROKE' && <Users size={24} />}
                      {m === 'SCRAMBLE' && <Target size={24} />}
                      {m === 'MATCH' && <Trophy size={24} />}
                      {m === 'MONEY' && <DollarSign size={24} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{m === 'MONEY' ? 'HIGH ROLLER' : m}</span>
                  </button>
              ))}
          </div>
          
          {gameMode === 'MONEY' && (
              <div className="bg-zinc-900 border border-[#DFFF00]/30 rounded-2xl p-6 mb-8 text-center animate-in zoom-in-95">
                  <label className="text-[#DFFF00] text-xs font-black uppercase tracking-widest mb-4 block">Base Stake Per Hole</label>
                  <div className="flex items-center justify-center gap-6">
                      <button onClick={() => setBaseStake(s => Math.max(5, s - 5))} className="p-4 bg-zinc-950 rounded-xl text-zinc-400 hover:text-white"><Minus/></button>
                      <div className="text-4xl font-black text-white">${baseStake}</div>
                      <button onClick={() => setBaseStake(s => s + 5)} className="p-4 bg-zinc-950 rounded-xl text-zinc-400 hover:text-white"><Plus/></button>
                  </div>
              </div>
          )}

          <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-3xl p-6 mb-8 relative overflow-hidden">
              <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                  {gameMode === 'SCRAMBLE' ? 'Team Callsign' : 'Operative Identity'}
              </label>

              <div className="flex gap-2 mb-4">
                  <input 
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                      placeholder="ENTER NAME..."
                      className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white font-bold uppercase focus:border-[#DFFF00] outline-none transition-colors"
                  />
                  <button 
                    onClick={handleAddPlayer} 
                    disabled={(gameMode === 'SCRAMBLE' && players.length >= 1) || (gameMode === 'MATCH' && players.length >= 2) || players.length >= 4}
                    className="bg-zinc-800 hover:bg-[#DFFF00] hover:text-black text-white w-16 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                      <Plus size={24} />
                  </button>
              </div>

              <div className="space-y-2">
                  {players.map((p, i) => (
                      <div key={p.id} className="flex justify-between items-center p-4 bg-zinc-950 border-l-2 border-[#DFFF00] rounded-r-xl animate-in slide-in-from-left-2">
                          <span className="font-black uppercase tracking-wide">{p.name}</span>
                          <span className="text-[10px] text-zinc-600 font-mono">
                              {gameMode === 'SCRAMBLE' ? 'UNIT LEAD' : `OP-0${i+1}`}
                          </span>
                      </div>
                  ))}
                  {players.length === 0 && <div className="text-center text-zinc-700 text-xs italic py-4">ROSTER EMPTY</div>}
              </div>
          </div>

          <div className="fixed bottom-0 left-0 w-full p-4 bg-zinc-950/90 backdrop-blur border-t border-zinc-800">
            <button 
                onClick={() => {
                    if(gameMode === 'MONEY') setHoleStakes(Array(18).fill(baseStake));
                    setMode('ACTIVE');
                }} 
                disabled={players.length === 0 || (gameMode === 'MATCH' && players.length < 2)}
                className="w-full h-16 bg-[#DFFF00] text-black font-black uppercase text-lg tracking-widest rounded-xl hover:bg-white transition-colors disabled:opacity-50 shadow-lg flex items-center justify-center gap-3"
            >
                <Play size={24} /> Deploy to Sector 1
            </button>
          </div>
      </div>
    );
  }

  // ================= VIEW: ACTIVE =================
  if (mode === 'ACTIVE') {
      const par = pars[currentHole-1];
      const windAnalysis = getWindAnalysis();
      const compassRotation = isCompassActive && deviceHeading !== null ? deviceHeading : manualHeading;

      return (
        <div ref={mainContainerRef} className="relative min-h-screen pb-32 bg-zinc-950">
            
            {/* TRANSITION OVERLAY */}
            <div className={cn(
                "fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-transform duration-700 ease-in-out",
                isTransitioning ? "translate-y-0" : "-translate-y-full"
            )}>
                 <div className="flex items-center gap-3 text-[#DFFF00] mb-4">
                     <Activity className="animate-pulse" size={32} />
                     <span className="font-mono text-sm tracking-widest">LOADING SECTOR...</span>
                 </div>
                 <h2 className="text-7xl font-black text-white italic">HOLE {transitionTarget}</h2>
            </div>

            {/* LIVE MENU OVERLAY */}
            {showLeaderboard && (
                <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col p-6">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-2xl font-black uppercase text-white">Live Intel</h3>
                        <button onClick={() => setShowLeaderboard(false)} className="p-3 bg-zinc-900 rounded-full text-white"><X size={24}/></button>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 px-4">
                            <span>Operative</span>
                            <span>{gameMode === 'MONEY' ? 'Net Profit/Loss' : 'Standing'}</span>
                        </div>
                        {getLeaderboard().map((p, i) => (
                            <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-600 font-mono text-sm">0{i+1}</span>
                                    <span className="font-black text-xl text-white">{p.name}</span>
                                </div>
                                <div className={cn("flex items-center gap-2 text-xl font-black", 
                                    (p.money && p.money > 0) || p.relative < 0 ? "text-[#DFFF00]" : 
                                    (p.money && p.money < 0) ? "text-red-500" : "text-white"
                                )}>
                                    {p.display}
                                    {gameMode === 'MONEY' && p.money !== 0 && (
                                        p.money! > 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={terminateRound}
                        className="mt-auto w-full py-6 bg-red-950/20 text-red-500 border border-red-900/50 rounded-2xl font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-red-900/40 transition-colors"
                    >
                        <Power size={20} /> Terminate Round Early
                    </button>
                </div>
            )}
            
            {/* --- STICKY HEADER --- */}
            <div className="fixed top-0 left-0 w-full z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex justify-between items-center shadow-md">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sector {currentHole}</span>
                    <div className="flex items-center gap-3">
                         <span className="text-sm font-bold text-white">{displayVal(weather.temp, 'temp')}</span>
                         <span className="text-zinc-700">|</span>
                         {weather.loaded ? (
                             <span className={cn("text-xs font-black truncate max-w-[150px]", windAnalysis.color)}>{windAnalysis.term}</span>
                         ) : (
                            <span className="text-xs font-mono text-zinc-500 animate-pulse">Scanning...</span>
                         )}
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                     {gameMode === 'MONEY' && (
                         <div className="flex items-center gap-1 bg-[#DFFF00] text-black px-3 py-1.5 rounded-lg font-black text-xs shadow-[0_0_15px_rgba(223,255,0,0.3)]">
                             <DollarSign size={14} /> {totalPot}
                         </div>
                     )}
                     <button 
                        onClick={() => setShowLeaderboard(true)}
                        className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
                     >
                        <Menu size={24} />
                     </button>
                </div>
            </div>

            {/* --- PHASE 1: INTEL --- */}
            {holePhase === 'INTEL' && (
                <div className="pt-24 pb-48 px-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500 min-h-screen">
                    
                    <div ref={activeSectionRef} className="text-center mb-10 w-full">
                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00] text-[#DFFF00] mb-6 shadow-[0_0_40px_rgba(223,255,0,0.2)]">
                             <MapPin size={40} />
                         </div>
                         <h2 className="text-8xl font-black italic text-white leading-none mb-4">HOLE {currentHole}</h2>
                         <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Configure Sector</p>
                    </div>
                    
                    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6 shadow-xl">
                         <label className="block text-center text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">
                             Confirm Sector Par
                         </label>
                         <div className="flex justify-between gap-2">
                             {[3, 4, 5].map((val) => (
                                 <button
                                    key={val}
                                    onClick={() => {
                                        const newPars = [...pars];
                                        newPars[currentHole-1] = val;
                                        setPars(newPars);
                                    }}
                                    className={cn(
                                        "flex-1 aspect-square rounded-2xl text-4xl font-black transition-all duration-300 flex items-center justify-center",
                                        pars[currentHole-1] === val 
                                            ? "bg-[#DFFF00] text-black shadow-[0_0_20px_rgba(223,255,0,0.4)] scale-105" 
                                            : "bg-zinc-950 text-zinc-600 border border-zinc-800"
                                    )}
                                 >
                                     {val}
                                 </button>
                             ))}
                         </div>
                    </div>
                    
                    {gameMode === 'MONEY' && (
                        <div className="w-full max-w-md bg-zinc-900 border border-[#DFFF00]/30 rounded-3xl p-6 mb-8 shadow-2xl">
                             <div className="flex justify-between items-center mb-6">
                                 <div className="flex flex-col">
                                     <span className="text-[#DFFF00] font-black uppercase text-sm">Active Pot</span>
                                     <span className="text-[10px] text-zinc-500 font-mono uppercase">Includes Carryover: ${carryover}</span>
                                 </div>
                                 <div className="text-4xl font-black text-white">${totalPot}</div>
                             </div>
                             
                             <div className="flex items-center justify-between gap-4">
                                 <button 
                                    onClick={() => updateHoleStake(Math.max(5, currentHoleStake - 5))}
                                    className="p-4 bg-black rounded-xl text-zinc-400 hover:text-white"
                                 >
                                     <Minus size={24} />
                                 </button>
                                 <div className="text-center">
                                     <div className="text-[10px] text-zinc-500 uppercase font-bold">Hole Value</div>
                                     <div className="text-2xl font-bold text-white">${currentHoleStake}</div>
                                 </div>
                                 <button 
                                    onClick={() => updateHoleStake(currentHoleStake + 5)}
                                    className="p-4 bg-black rounded-xl text-zinc-400 hover:text-white"
                                 >
                                     <Plus size={24} />
                                 </button>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- PHASE 2: ENGAGEMENT --- */}
            {holePhase === 'ENGAGEMENT' && (
                <div className="pt-24 pb-40 px-4 animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* UPDATED TACTICAL COMPASS UI */}
                    <div ref={activeSectionRef} className="mb-6 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-5 shadow-2xl overflow-hidden relative">
                        {/* Header Info */}
                        <div className="flex items-start justify-between mb-6 z-10 relative">
                             <div className="flex flex-col">
                                 <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                     <Wind size={16} />
                                     <span className="text-xs font-mono uppercase tracking-widest">Live Ballistics</span>
                                 </div>
                                 <div className="text-3xl font-black text-white">{displayVal(weather.windSpeed, 'speed')}</div>
                             </div>
                             <div className="text-right">
                                 <div className={cn("text-sm font-black uppercase", windAnalysis.color)}>{windAnalysis.term}</div>
                                 <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                                    {windAnalysis.advice}
                                 </div>
                             </div>
                        </div>

                        {/* Compass Visualizer */}
                        <div className="flex justify-center items-center py-4 relative mb-4">
                             {/* Bezel Ring */}
                             <div className="w-56 h-56 rounded-full border-2 border-zinc-800 bg-zinc-950/50 shadow-inner flex items-center justify-center relative">
                                  
                                  {/* Compass Card (Rotates opposite to heading so 'N' stays North) */}
                                  <div 
                                    style={{ transform: `rotate(${-compassRotation}deg)` }}
                                    className="absolute inset-0 w-full h-full rounded-full transition-transform duration-200 ease-out will-change-transform"
                                  >
                                      {/* Cardinal Points */}
                                      <div className="absolute top-2 left-1/2 -translate-x-1/2 font-black text-[#DFFF00] text-xs">N</div>
                                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-zinc-700 text-[10px]">S</div>
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-zinc-700 text-[10px]">E</div>
                                      <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-zinc-700 text-[10px]">W</div>
                                      
                                      {/* Ticks */}
                                      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                                          <div key={deg} style={{ transform: `rotate(${deg}deg)` }} className="absolute top-0 left-1/2 w-0.5 h-full -ml-[1px]">
                                              <div className="w-full h-1 bg-zinc-800"></div>
                                          </div>
                                      ))}

                                      {/* ABSOLUTE WIND VECTOR: Attached to the Compass Card at the Wind Angle */}
                                      {/* This arrow points in the direction the wind is blowing TO (meteorological convention inverted) */}
                                      <div 
                                        style={{ transform: `rotate(${weather.windDirection}deg)` }}
                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                      >
                                           {/* Arrow Head (Wind Origin) */}
                                           <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                               <ArrowUp size={24} className="text-[#DFFF00] fill-[#DFFF00] rotate-180 drop-shadow-[0_0_8px_rgba(223,255,0,0.8)]" />
                                           </div>
                                      </div>
                                  </div>

                                  {/* User Indicator (Fixed Center) */}
                                  <div className="z-10 w-16 h-16 bg-zinc-900 rounded-full border border-zinc-700 flex items-center justify-center shadow-2xl">
                                      <Navigation size={24} className="text-white fill-white" />
                                  </div>
                                  
                                  {/* Heading Readout */}
                                  <div className="absolute -bottom-6 text-[10px] font-mono text-zinc-600">
                                      HDG: {Math.round(compassRotation)}°
                                  </div>
                             </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={toggleCompass}
                                className={cn(
                                    "flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                    isCompassActive 
                                        ? "bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.3)]" 
                                        : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-white"
                                )}
                            >
                                <Compass size={16} className={isCompassActive ? "animate-spin-slow" : ""} />
                                {isCompassActive ? "LIVE COMPASS ON" : "ACTIVATE COMPASS"}
                            </button>
                            {!isCompassActive && (
                                <div className="flex-1 flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 h-[42px]">
                                    <span className="text-[10px] text-zinc-500 font-bold">MANUAL</span>
                                    <input 
                                        type="range" min="0" max="360" 
                                        value={manualHeading}
                                        onChange={(e) => setManualHeading(Number(e.target.value))}
                                        className="flex-1 accent-[#DFFF00] h-1 bg-zinc-800 rounded-full appearance-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SCORING CARDS */}
                    <div className="space-y-4">
                        {gameMode === 'MATCH' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setMatchResult(1)} className={cn("p-8 rounded-2xl border flex flex-col items-center gap-2 transition-all", players[0].scores[currentHole-1] === 1 ? "bg-[#DFFF00] border-[#DFFF00] text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500")}>
                                    <span className="text-xs font-bold uppercase">{players[0].name}</span>
                                    <span className="text-3xl font-black">WIN</span>
                                </button>
                                <button onClick={() => setMatchResult(-1)} className={cn("p-8 rounded-2xl border flex flex-col items-center gap-2 transition-all", players[0].scores[currentHole-1] === -1 ? "bg-[#DFFF00] border-[#DFFF00] text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500")}>
                                    <span className="text-xs font-bold uppercase">{players[1].name}</span>
                                    <span className="text-3xl font-black">WIN</span>
                                </button>
                                <button onClick={() => setMatchResult(0)} className={cn("col-span-2 p-6 rounded-xl border flex items-center justify-center gap-2 transition-all", players[0].scores[currentHole-1] === 0 ? "bg-white text-black border-white" : "bg-zinc-950 border-zinc-800 text-zinc-600")}>
                                    <span className="font-black uppercase tracking-widest text-lg">HALVE HOLE</span>
                                </button>
                            </div>
                        )}

                        {gameMode !== 'MATCH' && players.map((p, i) => {
                             if (gameMode === 'SCRAMBLE' && i > 0) return null;
                             const s = p.scores[currentHole-1];
                             return (
                                <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-md">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="font-black uppercase text-2xl text-white tracking-tight">{p.name}</div>
                                        <div className="text-xs font-bold text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
                                            PAR {par}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => updateScore(i, -1)} className="h-20 w-20 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 active:bg-[#DFFF00] active:text-black active:scale-95 transition-all flex items-center justify-center">
                                            <Minus size={32} />
                                        </button>
                                        <div className="flex-1 h-20 bg-black rounded-2xl border border-zinc-800 flex items-center justify-center shadow-inner">
                                            <span className={cn("text-6xl font-black tabular-nums tracking-tighter", s === 0 ? "text-zinc-700" : "text-white")}>
                                                {s === 0 ? '-' : s}
                                            </span>
                                        </div>
                                        <button onClick={() => updateScore(i, 1)} className="h-20 w-20 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 active:bg-white active:text-black active:scale-95 transition-all flex items-center justify-center">
                                            <Plus size={32} />
                                        </button>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                </div>
            )}

            {/* --- FIXED FOOTER (ACTION BAR) --- */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-zinc-950/90 backdrop-blur border-t border-zinc-800 z-30">
                {holePhase === 'INTEL' ? (
                     <button 
                        onClick={confirmIntel}
                        className="w-full h-16 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#DFFF00] transition-colors shadow-lg text-lg flex items-center justify-center gap-3"
                    >
                        <Target size={20} /> Initiate Engagement
                    </button>
                ) : (
                    <button 
                        onClick={nextHole}
                        className={cn(
                            "w-full h-16 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 text-lg",
                            currentHole === 18 ? "bg-white hover:bg-zinc-200" : "bg-[#DFFF00] hover:bg-white"
                        )}
                    >
                        {currentHole === 18 ? 'COMPLETE MISSION' : 'NEXT SECTOR'}
                        <ChevronRight size={24} />
                    </button>
                )}
            </div>
        </div>
      );
  }

  // ================= VIEW: SUMMARY =================
  if (mode === 'SUMMARY') {
      const sortedPlayers = getLeaderboard();
      return (
          <div className="max-w-xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-500 min-h-screen">
              <Trophy size={80} className="text-[#DFFF00] mx-auto mb-8 drop-shadow-[0_0_30px_rgba(223,255,0,0.5)]" />
              <h2 className="text-5xl font-black uppercase text-white mb-2 text-center">Debrief</h2>
              <div className="text-zinc-500 font-mono text-sm uppercase mb-12 text-center tracking-widest">
                  Mission Complete // {displayVal(weather.temp, 'temp')}
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden mb-8 shadow-2xl">
                  {sortedPlayers.map((p, i) => (
                      <div key={p.id} className={cn(
                          "flex justify-between items-center p-6 border-b border-zinc-800 last:border-0",
                          i === 0 ? "bg-[#DFFF00]/5" : ""
                      )}>
                          <div className="flex items-center gap-4">
                              <span className="font-mono text-zinc-600 text-sm">0{i+1}</span>
                              <div>
                                  <div className="font-black uppercase text-white text-xl">{p.name}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono uppercase">
                                      {gameMode === 'MATCH' ? 'Match Play' : gameMode === 'MONEY' ? 'Final Balance' : `Total Strokes: ${p.total}`}
                                  </div>
                              </div>
                          </div>
                          <div className={cn("text-3xl font-black", 
                              (p.money && p.money > 0) || p.relative < 0 ? "text-[#DFFF00]" : 
                              (p.money && p.money < 0) ? "text-red-500" : "text-white"
                          )}>
                              {p.display}
                          </div>
                      </div>
                  ))}
              </div>
              
              <div className="flex flex-col gap-3">
                   <button onClick={() => { 
                        const doc = new jsPDF();
                        autoTable(doc, { 
                            head: [['Player', 'Score', 'Result']], 
                            body: sortedPlayers.map(p => [p.name, p.total, p.display]) 
                        });
                        doc.save('mission_report.pdf');
                   }} className="w-full h-16 bg-white text-black rounded-xl font-bold uppercase text-sm tracking-widest shadow-lg">
                       Download Field Report
                   </button>
                   <button onClick={() => { if(confirm('End Session?')) { setMode('SETUP'); setPlayers([]); setCurrentHole(1); } }} className="w-full h-16 bg-zinc-900 text-red-500 border border-zinc-800 rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-red-950/20">
                       Terminate Mission
                   </button>
              </div>
          </div>
      )
  }

  return null;
}