'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Minus, Users, Play, RotateCcw, ChevronLeft, ChevronRight, 
  Trophy, Wind, Thermometer, MapPin, Target, Activity, ListOrdered, X, Compass, Power,
  DollarSign, TrendingUp, TrendingDown
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

  // Weather
  const [weather, setWeather] = useState<LocalWeather>({ 
    temp: 0, windSpeed: 0, windDirection: 0, loaded: false 
  });

  // --- EFFECT: WEATHER & COMPASS ---
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

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
      let heading: number | null = null;
      // @ts-ignore
      if (event.webkitCompassHeading) heading = event.webkitCompassHeading;
      else if (event.alpha !== null) heading = 360 - event.alpha;
      if (heading !== null) setDeviceHeading(heading);
  }, []);

  const toggleCompass = async () => {
      if (isCompassActive) {
          window.removeEventListener('deviceorientation', handleOrientation);
          setIsCompassActive(false);
          setDeviceHeading(null);
          return;
      }
      // @ts-ignore
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          // @ts-ignore
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
              setIsCompassActive(true);
          }
      } else {
          window.addEventListener('deviceorientation', handleOrientation);
          setIsCompassActive(true);
      }
  };

  useEffect(() => {
      return () => { window.removeEventListener('deviceorientation', handleOrientation); };
  }, [handleOrientation]);


  // --- HELPERS ---
  const displayVal = (val: number, type: 'temp'|'speed') => {
      if (type === 'temp') return units === 'METRIC' ? `${Math.round(val)}°C` : `${Math.round((val * 9/5)+32)}°F`;
      if (type === 'speed') return units === 'METRIC' ? `${Math.round(val)}kph` : `${Math.round(val * 0.62)}mph`;
      return '';
  };

  const getWindAnalysis = () => {
      if (!weather.loaded) return { term: "OFFLINE", color: "text-zinc-500" };
      const headingToUse = isCompassActive && deviceHeading !== null ? deviceHeading : manualHeading;
      let diff = (weather.windDirection - headingToUse + 360) % 360;
      
      if (diff >= 337.5 || diff < 22.5) return { term: "INTO (HURTING)", color: "text-red-500" };
      if (diff >= 22.5 && diff < 67.5) return { term: "INTO / OFF LEFT", color: "text-orange-400" };
      if (diff >= 67.5 && diff < 112.5) return { term: "CROSS (L TO R)", color: "text-zinc-300" };
      if (diff >= 112.5 && diff < 157.5) return { term: "HELPING / OFF LEFT", color: "text-[#DFFF00]" };
      if (diff >= 157.5 && diff < 202.5) return { term: "HELPING (DOWN)", color: "text-[#DFFF00]" };
      if (diff >= 202.5 && diff < 247.5) return { term: "HELPING / OFF RIGHT", color: "text-[#DFFF00]" };
      if (diff >= 247.5 && diff < 292.5) return { term: "CROSS (R TO L)", color: "text-zinc-300" };
      if (diff >= 292.5 && diff < 337.5) return { term: "INTO / OFF RIGHT", color: "text-orange-400" };
      return { term: "CALM", color: "text-zinc-500" };
  };

  // --- LOGIC: MONEY / SKINS ---
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
              
              // Zero-Sum: Winner takes pot value from EVERY loser
              // Effectively Pot * (N-1) gain for winner
              const winAmount = currentPot * (players.length - 1);
              const lossAmount = currentPot; 

              balances.set(winnerId, (balances.get(winnerId) || 0) + winAmount);
              players.forEach(p => {
                  if (p.id !== winnerId) {
                      balances.set(p.id, (balances.get(p.id) || 0) - lossAmount);
                  }
              });

              currentPot = 0;
          }
      }
      return { balances, carryover: currentPot };
  };

  const getLeaderboard = (): LeaderboardPlayer[] => {
      // MATCH PLAY
      if (gameMode === 'MATCH') {
          let status = 0;
          players[0].scores.forEach(s => status += s);
          return [
              { ...players[0], total: status, relative: status > 0 ? -1 : status < 0 ? 1 : 0, display: status === 0 ? 'AS' : status > 0 ? `${status} UP` : `${Math.abs(status)} DN` },
              { ...players[1], total: -status, relative: status < 0 ? -1 : status > 0 ? 1 : 0, display: status === 0 ? 'AS' : status < 0 ? `${Math.abs(status)} UP` : `${status} DN` }
          ];
      }
      
      // MONEY MODE
      if (gameMode === 'MONEY') {
          const { balances } = calculateBalances();
          return players.map(p => {
              const money = balances.get(p.id) || 0;
              const total = p.scores.reduce((a,b) => a+b, 0);
              return {
                  ...p,
                  total,
                  relative: money > 0 ? -1 : 0, 
                  money,
                  display: money === 0 ? '--' : money > 0 ? `+$${money}` : `-$${Math.abs(money)}`
              };
          }).sort((a,b) => (b.money || 0) - (a.money || 0));
      }

      // STANDARD
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
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: inputName.toUpperCase().slice(0, 8),
      scores: Array(TOTAL_HOLES).fill(0)
    };
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
      if (currentHole >= 18) {
          setMode('SUMMARY');
          return;
      }
      
      setTransitionTarget(currentHole + 1);
      setIsTransitioning(true);
      
      setTimeout(() => {
          setCurrentHole(h => h + 1);
          setHolePhase('INTEL'); 
          setIsTransitioning(false);
          window.scrollTo({top:0, behavior:'smooth'});
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
      if(confirm('TERMINATE MISSION EARLY?')) {
          setMode('SUMMARY');
          setShowLeaderboard(false);
      }
  };

  // --- RENDER HELPERS ---
  const { carryover } = calculateBalances();
  const currentHoleStake = holeStakes[currentHole-1];
  const totalPot = currentHoleStake + carryover;

  // ================= VIEW: SETUP =================
  if (mode === 'SETUP') {
    return (
      <div className="max-w-xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4">
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
                            "text-[10px] font-bold px-3 py-1 rounded border transition-colors",
                            units === u ? "bg-[#DFFF00] text-black border-[#DFFF00]" : "text-zinc-500 border-zinc-800 hover:text-white"
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
                            ? "bg-[#DFFF00] border-[#DFFF00] text-black shadow-[0_0_25px_rgba(223,255,0,0.2)] transform scale-105" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                      {m === 'STROKE' && <Users size={20} />}
                      {m === 'SCRAMBLE' && <Target size={20} />}
                      {m === 'MATCH' && <Trophy size={20} />}
                      {m === 'MONEY' && <DollarSign size={20} />}
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
                      className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white font-bold uppercase focus:border-[#DFFF00] outline-none transition-colors"
                  />
                  <button 
                    onClick={handleAddPlayer} 
                    disabled={(gameMode === 'SCRAMBLE' && players.length >= 1) || (gameMode === 'MATCH' && players.length >= 2) || players.length >= 4}
                    className="bg-zinc-800 hover:bg-[#DFFF00] hover:text-black text-white w-14 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                      <Plus />
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

          <button 
            onClick={() => {
                if(gameMode === 'MONEY') setHoleStakes(Array(18).fill(baseStake));
                setMode('ACTIVE');
            }} 
            disabled={players.length === 0 || (gameMode === 'MATCH' && players.length < 2)}
            className="w-full py-6 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors disabled:opacity-50 shadow-lg"
          >
              Deploy to Sector 1
          </button>
      </div>
    );
  }

  // ================= VIEW: ACTIVE =================
  if (mode === 'ACTIVE') {
      const par = pars[currentHole-1];
      const windAnalysis = getWindAnalysis();

      return (
        <div className="relative min-h-screen pb-32">
            
            {/* TRANSITION OVERLAY */}
            <div className={cn(
                "fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-transform duration-700 ease-in-out",
                isTransitioning ? "translate-y-0" : "-translate-y-full"
            )}>
                 <div className="flex items-center gap-3 text-[#DFFF00] mb-4">
                     <Activity className="animate-pulse" size={32} />
                     <span className="font-mono text-sm tracking-widest">LOADING SECTOR...</span>
                 </div>
                 {/* Uses locked transition target to prevent number jumping */}
                 <h2 className="text-6xl font-black text-white italic">HOLE {transitionTarget}</h2>
            </div>

            {/* LIVE LEADERBOARD / MENU */}
            {showLeaderboard && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black uppercase text-white">Live Intel</h3>
                        <button onClick={() => setShowLeaderboard(false)} className="p-2 bg-zinc-900 rounded-full text-white"><X /></button>
                    </div>
                    
                    {/* Scores */}
                    <div className="space-y-2 mb-8">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 px-4">
                            <span>Operative</span>
                            <span>{gameMode === 'MONEY' ? 'Net Profit/Loss' : 'Standing'}</span>
                        </div>
                        {getLeaderboard().map((p, i) => (
                            <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-600 font-mono text-xs">0{i+1}</span>
                                    <span className="font-bold text-white">{p.name}</span>
                                </div>
                                <div className={cn("flex items-center gap-2 text-xl font-black", 
                                    (p.money && p.money > 0) || p.relative < 0 ? "text-[#DFFF00]" : 
                                    (p.money && p.money < 0) ? "text-red-500" : "text-white"
                                )}>
                                    {p.display}
                                    {gameMode === 'MONEY' && p.money !== 0 && (
                                        p.money! > 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={terminateRound}
                        className="mt-auto w-full py-4 bg-red-950/20 text-red-500 border border-red-900/50 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-red-900/40 transition-colors"
                    >
                        <Power size={16} /> Terminate Round Early
                    </button>
                </div>
            )}
            
            {/* --- TOP BAR --- */}
            <div className="bg-zinc-900/80 backdrop-blur border-b border-zinc-800 sticky top-0 z-30 px-4 py-3 flex justify-between items-center shadow-md">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sector {currentHole}</span>
                    <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-white">{displayVal(weather.temp, 'temp')}</span>
                         <span className="text-zinc-700">|</span>
                         {weather.loaded ? (
                             <span className={cn("text-xs font-bold truncate max-w-[150px]", windAnalysis.color)}>{windAnalysis.term}</span>
                         ) : (
                            <span className="text-xs font-mono text-zinc-500 animate-pulse">Scanning...</span>
                         )}
                    </div>
                </div>
                <div className="flex gap-2">
                     {gameMode === 'MONEY' && (
                         <div className="flex items-center gap-1 bg-[#DFFF00] text-black px-3 py-1 rounded-lg font-black text-xs">
                             <DollarSign size={12} /> {totalPot}
                         </div>
                     )}
                     <button 
                        onClick={() => setShowLeaderboard(true)}
                        className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                     >
                        <ListOrdered size={20} />
                     </button>
                </div>
            </div>

            {/* --- PHASE 1: INTEL --- */}
            {holePhase === 'INTEL' && (
                <div className="max-w-xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center mb-12">
                         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00] text-[#DFFF00] mb-6 shadow-[0_0_30px_rgba(223,255,0,0.2)]">
                             <MapPin size={32} />
                         </div>
                         <h2 className="text-6xl font-black italic text-white leading-none mb-2">HOLE {currentHole}</h2>
                         <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Configure Sector</p>
                    </div>
                    
                    {/* PAR SELECTION */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-4">
                         <label className="block text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                             Confirm Par
                         </label>
                         <div className="flex justify-center gap-4">
                             {[3, 4, 5].map((val) => (
                                 <button
                                    key={val}
                                    onClick={() => {
                                        const newPars = [...pars];
                                        newPars[currentHole-1] = val;
                                        setPars(newPars);
                                    }}
                                    className={cn(
                                        "w-16 h-16 rounded-2xl text-2xl font-black transition-all duration-300",
                                        pars[currentHole-1] === val 
                                            ? "bg-[#DFFF00] text-black shadow-lg scale-110" 
                                            : "bg-zinc-950 text-zinc-600 border border-zinc-800 hover:border-zinc-600"
                                    )}
                                 >
                                     {val}
                                 </button>
                             ))}
                         </div>
                    </div>
                    
                    {/* MONEY STAKE ADJUSTER */}
                    {gameMode === 'MONEY' && (
                        <div className="bg-zinc-900 border border-[#DFFF00]/30 rounded-3xl p-6 mb-8">
                             <div className="flex justify-between items-center mb-6">
                                 <div className="flex flex-col">
                                     <span className="text-[#DFFF00] font-black uppercase">Active Pot</span>
                                     <span className="text-[10px] text-zinc-500 font-mono uppercase">Includes Carryover: ${carryover}</span>
                                 </div>
                                 <div className="text-3xl font-black text-white">${totalPot}</div>
                             </div>
                             
                             <div className="flex items-center justify-between gap-4">
                                 <button 
                                    onClick={() => updateHoleStake(Math.max(5, currentHoleStake - 5))}
                                    className="p-4 bg-black rounded-xl text-zinc-400 hover:text-white"
                                 >
                                     <Minus size={20} />
                                 </button>
                                 <div className="text-center">
                                     <div className="text-[10px] text-zinc-500 uppercase font-bold">Hole Value</div>
                                     <div className="text-xl font-bold text-white">${currentHoleStake}</div>
                                 </div>
                                 <button 
                                    onClick={() => updateHoleStake(currentHoleStake + 5)}
                                    className="p-4 bg-black rounded-xl text-zinc-400 hover:text-white"
                                 >
                                     <Plus size={20} />
                                 </button>
                             </div>
                        </div>
                    )}

                    <button 
                        onClick={confirmIntel}
                        className="w-full py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-[#DFFF00] transition-colors shadow-xl text-sm flex items-center justify-center gap-2"
                    >
                        <Target size={18} /> Initiate Engagement
                    </button>
                </div>
            )}

            {/* --- PHASE 2: ENGAGEMENT --- */}
            {holePhase === 'ENGAGEMENT' && (
                <div className="max-w-xl mx-auto px-4 py-6 animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* TACTICAL COMPASS UI */}
                    <div className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2 text-zinc-400">
                                 <Wind size={14} />
                                 <span className="text-[10px] font-mono uppercase tracking-widest">Wind Vector</span>
                             </div>
                             <div className="text-sm font-bold text-white">{displayVal(weather.windSpeed, 'speed')}</div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={toggleCompass}
                                className={cn(
                                    "flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                    isCompassActive 
                                        ? "bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.3)]" 
                                        : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-white"
                                )}
                            >
                                <Compass size={14} className={isCompassActive ? "animate-spin-slow" : ""} />
                                {isCompassActive ? "LIVE COMPASS ON" : "ENABLE COMPASS"}
                            </button>
                            
                            <div className="relative w-12 h-12 bg-zinc-950 rounded-full border border-zinc-700 flex items-center justify-center shadow-inner shrink-0">
                                <div 
                                    style={{ transform: `rotate(${isCompassActive && deviceHeading !== null ? deviceHeading : manualHeading}deg)` }} 
                                    className="w-full h-full absolute inset-0 transition-transform duration-200 pointer-events-none"
                                >
                                    <div className="w-1 h-3 bg-[#DFFF00] mx-auto mt-0.5 rounded-full shadow-[0_0_10px_rgba(223,255,0,0.8)]" />
                                </div>
                                {!isCompassActive && (
                                    <input 
                                        type="range" min="0" max="360" 
                                        value={manualHeading}
                                        onChange={(e) => setManualHeading(Number(e.target.value))}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SCORING CARDS */}
                    <div className="space-y-4 mb-24">
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
                                <button onClick={() => setMatchResult(0)} className={cn("col-span-2 p-4 rounded-xl border flex items-center justify-center gap-2 transition-all", players[0].scores[currentHole-1] === 0 ? "bg-white text-black border-white" : "bg-zinc-950 border-zinc-800 text-zinc-600")}>
                                    <span className="font-black uppercase tracking-widest">HALVE HOLE</span>
                                </button>
                            </div>
                        )}

                        {gameMode !== 'MATCH' && players.map((p, i) => {
                             if (gameMode === 'SCRAMBLE' && i > 0) return null;
                             const s = p.scores[currentHole-1];
                             return (
                                <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="font-black uppercase text-2xl text-white tracking-tight">{p.name}</div>
                                        <div className="text-xs font-bold text-zinc-500 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                                            PAR {par}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => updateScore(i, -1)} className="h-16 w-16 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 active:bg-[#DFFF00] active:text-black active:scale-95 transition-all flex items-center justify-center">
                                            <Minus size={24} />
                                        </button>
                                        <div className="flex-1 h-16 bg-black rounded-2xl border border-zinc-800 flex items-center justify-center">
                                            <span className={cn("text-5xl font-black tabular-nums tracking-tighter", s === 0 ? "text-zinc-700" : "text-white")}>
                                                {s === 0 ? '-' : s}
                                            </span>
                                        </div>
                                        <button onClick={() => updateScore(i, 1)} className="h-16 w-16 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 active:bg-white active:text-black active:scale-95 transition-all flex items-center justify-center">
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>
                             )
                        })}
                    </div>

                    {/* BOTTOM NAV */}
                    <div className="fixed bottom-0 left-0 w-full bg-zinc-950/90 backdrop-blur p-4 pb-8 flex gap-3 border-t border-zinc-800 z-30">
                        <button 
                            onClick={() => { setHolePhase('INTEL'); window.scrollTo({top:0, behavior:'smooth'}); }}
                            className="aspect-square flex items-center justify-center bg-zinc-900 rounded-2xl text-zinc-400 border border-zinc-800"
                        >
                            <RotateCcw size={20}/>
                        </button>
                        <button 
                            onClick={nextHole}
                            className={cn(
                                "flex-1 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm",
                                currentHole === 18 ? "bg-white hover:bg-zinc-200" : "bg-[#DFFF00] hover:bg-white"
                            )}
                        >
                            {currentHole === 18 ? 'COMPLETE MISSION' : 'NEXT SECTOR'}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // ================= VIEW: SUMMARY =================
  if (mode === 'SUMMARY') {
      const sortedPlayers = getLeaderboard();
      return (
          <div className="max-w-xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <Trophy size={64} className="text-[#DFFF00] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(223,255,0,0.5)]" />
              <h2 className="text-4xl font-black uppercase text-white mb-2 text-center">Debrief</h2>
              <div className="text-zinc-500 font-mono text-xs uppercase mb-10 text-center tracking-widest">
                  Mission Complete // {displayVal(weather.temp, 'temp')}
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden mb-8">
                  {sortedPlayers.map((p, i) => (
                      <div key={p.id} className={cn(
                          "flex justify-between items-center p-6 border-b border-zinc-800 last:border-0",
                          i === 0 ? "bg-[#DFFF00]/5" : ""
                      )}>
                          <div className="flex items-center gap-4">
                              <span className="font-mono text-zinc-600 text-sm">0{i+1}</span>
                              <div>
                                  <div className="font-black uppercase text-white text-lg">{p.name}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono uppercase">
                                      {gameMode === 'MATCH' ? 'Match Play' : gameMode === 'MONEY' ? 'Final Balance' : `Total Strokes: ${p.total}`}
                                  </div>
                              </div>
                          </div>
                          <div className={cn("text-2xl font-black", 
                              (p.money && p.money > 0) || p.relative < 0 ? "text-[#DFFF00]" : 
                              (p.money && p.money < 0) ? "text-red-500" : "text-white"
                          )}>
                              {p.display}
                          </div>
                      </div>
                  ))}
              </div>
              
              <div className="flex gap-4">
                   <button onClick={() => { 
                        const doc = new jsPDF();
                        autoTable(doc, { 
                            head: [['Player', 'Score', 'Result']], 
                            body: sortedPlayers.map(p => [p.name, p.total, p.display]) 
                        });
                        doc.save('mission_report.pdf');
                   }} className="flex-1 py-4 bg-white text-black rounded-xl font-bold uppercase text-xs tracking-widest">
                       Download Report
                   </button>
                   <button onClick={() => { if(confirm('End Session?')) { setMode('SETUP'); setPlayers([]); setCurrentHole(1); } }} className="flex-1 py-4 bg-zinc-900 text-red-500 border border-zinc-800 rounded-xl font-bold uppercase text-xs tracking-widest">
                       Terminate
                   </button>
              </div>
          </div>
      )
  }

  return null;
}