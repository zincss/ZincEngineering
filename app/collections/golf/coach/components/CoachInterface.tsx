'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SYMPTOMS, DIAGNOSTIC_NODES, PRESCRIPTIONS, Drill, Handedness } from '../data';
import { 
  Target, ChevronRight, RefreshCw, CheckCircle2, Play, 
  BrainCircuit, Activity, Save, Settings, Timer, 
  ArrowLeft, Check, AlertTriangle, Lightbulb, Zap,
  Wind, Navigation, Lock, Unlock, Gauge, ArrowUp, MapPin
} from 'lucide-react';

type ViewState = 'SETUP' | 'SELECT_SYMPTOM' | 'DIAGNOSIS' | 'ANALYZING' | 'PRESCRIPTION' | 'DRILL_MODE' | 'WIND_GAUGE';
type UnitSystem = 'IMPERIAL' | 'METRIC';

export default function CoachInterface() {
  // --- STATE ---
  const [view, setView] = useState<ViewState>('SETUP');
  const [handedness, setHandedness] = useState<Handedness>('RIGHT');
  const [selectedSymptomId, setSelectedSymptomId] = useState<string | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [activeDrill, setActiveDrill] = useState<Drill | null>(null);
  const [saved, setSaved] = useState(false);
  const [cueMode, setCueMode] = useState<'TECHNICAL' | 'FEEL'>('TECHNICAL');

  // --- WIND GAUGE STATE ---
  const [weather, setWeather] = useState({ temp: 0, windSpeed: 0, windDirection: 0, loaded: false });
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [lockedHeading, setLockedHeading] = useState<number | null>(null);
  const [compassActive, setCompassActive] = useState(false);
  const [targetDistance, setTargetDistance] = useState<string>('');
  const [windUnit, setWindUnit] = useState<UnitSystem>('IMPERIAL');

  // --- HELPER: TEXT PARSER ---
  const parseText = (text: string) => {
    const leadSide = handedness === 'RIGHT' ? 'Left' : 'Right';
    const trailSide = handedness === 'RIGHT' ? 'Right' : 'Left';
    return text.replace(/{LEAD_SIDE}/g, leadSide).replace(/{TRAIL_SIDE}/g, trailSide);
  };

  // --- ACTIONS ---
  const handleSymptomSelect = (id: string) => {
    setSelectedSymptomId(id);
    const symptom = SYMPTOMS.find(s => s.id === id);
    if (symptom) {
      setCurrentNodeId(symptom.startNodeId);
      setView('DIAGNOSIS');
    }
  };

  const handleOptionSelect = (option: any) => {
    if (option.prescriptionId) {
      setPrescriptionId(option.prescriptionId);
      setView('ANALYZING');
    } else if (option.nextId) {
      setCurrentNodeId(option.nextId);
    }
  };

  const startDrill = (drill: Drill) => {
    setActiveDrill(drill);
    setView('DRILL_MODE');
  };

  const reset = () => {
    setView('SELECT_SYMPTOM');
    setSelectedSymptomId(null);
    setCurrentNodeId(null);
    setPrescriptionId(null);
    setSaved(false);
    setActiveDrill(null);
  };

  // --- WIND GAUGE LOGIC ---
  const initWeather = async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m`
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
  };

  const handleOrientation = useCallback((event: any) => {
    let heading: number | null = null;
    if (event.webkitCompassHeading) heading = event.webkitCompassHeading;
    else if (event.alpha !== null) heading = 360 - event.alpha;
    if (heading !== null) setDeviceHeading(heading);
  }, []);

  const toggleCompass = async () => {
      if (compassActive) {
          window.removeEventListener('deviceorientation', handleOrientation);
          // @ts-ignore
          window.removeEventListener('deviceorientationabsolute', handleOrientation);
          setCompassActive(false);
          return;
      }
      
      const startListening = () => {
          setCompassActive(true);
          // @ts-ignore
          if ('ondeviceorientationabsolute' in (window as any)) {
               // @ts-ignore
               (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
          } else {
               window.addEventListener('deviceorientation', handleOrientation);
          }
      };

      // @ts-ignore
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          try {
              // @ts-ignore
              const permission = await DeviceOrientationEvent.requestPermission();
              if (permission === 'granted') startListening();
              else alert("Compass permission required for wind vectoring.");
          } catch (error) { console.error(error); }
      } else {
          startListening();
      }
  };

  // Calculate Plays Like
  const calculateBallistics = () => {
      if (!weather.loaded) return null;
      
      const heading = lockedHeading !== null ? lockedHeading : deviceHeading;
      const dist = parseInt(targetDistance) || 0;
      
      // Calculate wind relative to shot line
      // relAngle 0 = Headwind (Wind coming from North, Shot heading North)
      // relAngle 180 = Tailwind
      const relAngle = (weather.windDirection - heading + 360) % 360;
      const windSpeedMph = weather.windSpeed * 0.621371;
      
      // Cosine gives 1 for 0deg (Headwind), -1 for 180deg (Tailwind)
      // Standard approximation: 1mph headwind = +1 yard. 1mph tailwind = -0.5 yard.
      // We will use a slightly simplified model consistent with the scorecard: +/- based on cosine
      const windEffectYards = Math.cos((relAngle * Math.PI) / 180) * windSpeedMph;
      
      // Apply effect
      const playsLike = dist + windEffectYards;
      
      // Determine label
      let label = "CALM";
      if (windSpeedMph > 3) {
          if (relAngle >= 315 || relAngle < 45) label = "HEADWIND";
          else if (relAngle >= 45 && relAngle < 135) label = "L → R CROSS";
          else if (relAngle >= 135 && relAngle < 225) label = "TAILWIND";
          else label = "R → L CROSS";
      }

      return {
          playsLike: Math.round(playsLike),
          effect: Math.round(windEffectYards),
          label,
          speed: Math.round(windSpeedMph),
          relAngle
      };
  };

  const ballistics = calculateBallistics();

  // --- EFFECT: ANALYSIS SIMULATION ---
  useEffect(() => {
    if (view === 'ANALYZING') {
      const timer = setTimeout(() => {
        setView('PRESCRIPTION');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  // Init weather when entering wind gauge
  useEffect(() => {
      if (view === 'WIND_GAUGE') initWeather();
  }, [view]);

  // Cleanup compass on unmount
  useEffect(() => {
      return () => {
          window.removeEventListener('deviceorientation', handleOrientation);
          // @ts-ignore
          window.removeEventListener('deviceorientationabsolute', handleOrientation);
      };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[600px] relative">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#DFFF00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* --- HEADER BAR (Context Aware) --- */}
      {view !== 'SETUP' && (
         <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
             <div className="flex items-center gap-4">
                 {view !== 'SELECT_SYMPTOM' && view !== 'WIND_GAUGE' && (
                     <button onClick={() => setView('SELECT_SYMPTOM')} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                         <ArrowLeft size={16} />
                     </button>
                 )}
                 {view === 'WIND_GAUGE' && (
                     <button onClick={() => setView('SETUP')} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                         <ArrowLeft size={16} />
                     </button>
                 )}
                 <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        {view === 'WIND_GAUGE' ? 'Ballistics Module' : 'Active Operative'}
                    </span>
                    <span className="text-xs font-bold text-white uppercase">
                        {view === 'WIND_GAUGE' ? 'Atmospheric Sensor' : `${handedness} HANDED`}
                    </span>
                 </div>
             </div>
             <button onClick={() => setView('SETUP')} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-600 transition-all">
                 <Settings size={12} /> Config
             </button>
         </div>
      )}

      {/* --- VIEW: SETUP (Handedness + Tools) --- */}
      {view === 'SETUP' && (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
           <Activity size={48} className="text-[#DFFF00] mb-6 animate-pulse" />
           <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 text-center">System Initialization</h2>
           <p className="text-zinc-500 font-mono text-sm mb-10 text-center max-w-md">
               Select dexterity profile or access standalone tactical modules.
           </p>
           
           <div className="flex flex-col gap-4 w-full max-w-md">
               <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => { setHandedness('RIGHT'); setView('SELECT_SYMPTOM'); }}
                    className="group relative h-32 bg-zinc-900 border-2 border-zinc-800 hover:border-[#DFFF00] rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:shadow-[0_0_30px_rgba(223,255,0,0.15)]"
                   >
                       <span className="text-3xl font-black text-zinc-700 group-hover:text-white transition-colors">R</span>
                       <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest group-hover:text-[#DFFF00]">Right Handed</span>
                   </button>
                   <button 
                    onClick={() => { setHandedness('LEFT'); setView('SELECT_SYMPTOM'); }}
                    className="group relative h-32 bg-zinc-900 border-2 border-zinc-800 hover:border-[#DFFF00] rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:shadow-[0_0_30px_rgba(223,255,0,0.15)]"
                   >
                       <span className="text-3xl font-black text-zinc-700 group-hover:text-white transition-colors">L</span>
                       <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest group-hover:text-[#DFFF00]">Left Handed</span>
                   </button>
               </div>
               
               <button 
                onClick={() => setView('WIND_GAUGE')}
                className="group relative h-20 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl flex items-center justify-between px-8 transition-all"
               >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] group-hover:bg-[#DFFF00] group-hover:text-black transition-colors">
                            <Wind size={20} />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-black text-white uppercase tracking-wide">Ballistics Gauge</span>
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">Wind / Elevation / Plays-Like</span>
                        </div>
                    </div>
                    <ChevronRight className="text-zinc-600 group-hover:text-white" />
               </button>
           </div>
        </div>
      )}

      {/* --- VIEW: WIND GAUGE --- */}
      {view === 'WIND_GAUGE' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* STATUS BAR */}
              <div className="flex justify-between items-center mb-6 px-2">
                  <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${weather.loaded ? 'bg-[#DFFF00] animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-mono uppercase text-zinc-500">
                          {weather.loaded ? 'LIVE METEO DATA' : 'SEARCHING SATELLITE...'}
                      </span>
                  </div>
                  <button 
                    onClick={() => setWindUnit(windUnit === 'IMPERIAL' ? 'METRIC' : 'IMPERIAL')}
                    className="text-[10px] font-bold bg-zinc-900 px-2 py-1 rounded border border-zinc-800 hover:text-white transition-colors"
                  >
                      {windUnit}
                  </button>
              </div>

              {/* MAIN GAUGE CARD */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl mb-4">
                  
                  {/* COMPASS RING */}
                  <div className="relative aspect-square max-w-[280px] mx-auto mb-8">
                      {/* Static Rings */}
                      <div className="absolute inset-0 rounded-full border border-zinc-800" />
                      <div className="absolute inset-4 rounded-full border border-zinc-800 border-dashed opacity-50" />
                      
                      {/* Live Rotating Ring */}
                      <div 
                        className="absolute inset-0 transition-transform duration-300 ease-out"
                        style={{ transform: `rotate(-${lockedHeading !== null ? lockedHeading : deviceHeading}deg)` }}
                      >
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[#DFFF00] font-black text-xs">N</div>
                           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-zinc-600 font-bold text-[10px]">S</div>
                           <div className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 text-zinc-600 font-bold text-[10px]">E</div>
                           <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 text-zinc-600 font-bold text-[10px]">W</div>
                           
                           {/* Wind Arrow (Relative to Earth) */}
                           {weather.loaded && (
                               <div 
                                style={{ transform: `rotate(${weather.windDirection}deg)` }}
                                className="absolute inset-0 pointer-events-none"
                               >
                                   <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                       <ArrowUp size={32} className="text-cyan-400 rotate-180 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                       <span className="text-[10px] font-black text-cyan-400 bg-black/50 px-1 rounded backdrop-blur">WIND</span>
                                   </div>
                               </div>
                           )}
                      </div>

                      {/* Locked Vector Indicator */}
                      {lockedHeading !== null && (
                          <div className="absolute inset-0 pointer-events-none">
                               <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <Lock size={16} className="text-[#DFFF00] mb-1" />
                                    <div className="h-8 w-0.5 bg-[#DFFF00]" />
                               </div>
                          </div>
                      )}

                      {/* Center Hub */}
                      <div className="absolute inset-0 m-auto w-20 h-20 bg-zinc-950 rounded-full border-2 border-zinc-700 flex flex-col items-center justify-center z-10 shadow-xl">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">HDG</span>
                          <span className="text-xl font-black text-white tabular-nums">
                              {Math.round(lockedHeading !== null ? lockedHeading : deviceHeading)}°
                          </span>
                      </div>
                  </div>

                  {/* CONTROLS */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                      <button 
                        onClick={toggleCompass}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                            compassActive 
                            ? 'bg-zinc-800 text-white border-zinc-700' 
                            : 'bg-[#DFFF00] text-black border-[#DFFF00] hover:bg-white'
                        }`}
                      >
                         <Navigation size={14} className={compassActive ? "animate-pulse" : ""} />
                         {compassActive ? 'Compass On' : 'Start Compass'}
                      </button>

                      {lockedHeading === null ? (
                          <button 
                            onClick={() => setLockedHeading(deviceHeading)}
                            disabled={!compassActive}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-50 text-[10px] font-bold uppercase tracking-widest transition-all"
                          >
                             <Lock size={14} /> Lock Pin
                          </button>
                      ) : (
                        <button 
                            onClick={() => setLockedHeading(null)}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-500 hover:bg-red-950/50 text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            <Unlock size={14} /> Unlock
                        </button>
                      )}
                  </div>
              </div>

              {/* CALCULATION CARD */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                   <div className="flex gap-4 mb-8">
                       <div className="flex-1">
                           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Distance to Pin</label>
                           <div className="relative">
                               <input 
                                    type="number" 
                                    value={targetDistance}
                                    onChange={(e) => setTargetDistance(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-2xl font-black text-white focus:border-[#DFFF00] outline-none transition-colors"
                               />
                               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-600">{windUnit === 'IMPERIAL' ? 'YDS' : 'M'}</span>
                           </div>
                       </div>
                       <div className="flex-1 bg-zinc-950 rounded-xl border border-zinc-800 p-3 flex flex-col justify-center">
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Wind Speed</span>
                           <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-cyan-400">
                                    {weather.loaded ? Math.round(weather.windSpeed * (windUnit === 'IMPERIAL' ? 0.62 : 1)) : '--'}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-600">{windUnit === 'IMPERIAL' ? 'MPH' : 'KPH'}</span>
                           </div>
                       </div>
                   </div>

                   <div className="border-t border-zinc-800 pt-6">
                       <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-mono font-bold text-[#DFFF00] uppercase tracking-widest">
                               {ballistics?.label || 'READY TO CALCULATE'}
                           </span>
                           {ballistics && (
                               <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                   Effect: {ballistics.effect > 0 ? '+' : ''}{ballistics.effect} {windUnit === 'IMPERIAL' ? 'Yds' : 'm'}
                               </span>
                           )}
                       </div>
                       
                       <div className="flex items-baseline justify-between">
                            <span className="text-sm font-bold text-zinc-400 uppercase">Plays Like</span>
                            <div className="text-6xl font-black text-white tracking-tighter tabular-nums">
                                {ballistics?.playsLike || '--'}
                            </div>
                       </div>
                   </div>
              </div>
          </div>
      )}

      {/* --- VIEW: SYMPTOM SELECTION --- */}
      {view === 'SELECT_SYMPTOM' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Identify Anomaly</h2>
            <p className="text-zinc-500 font-mono text-sm max-w-md mx-auto">
              Select the primary flight characteristic or mechanical failure currently affecting your performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYMPTOMS.map((symptom) => (
              <button
                key={symptom.id}
                onClick={() => handleSymptomSelect(symptom.id)}
                className="group relative p-6 bg-zinc-900/50 border border-zinc-800 hover:border-[#DFFF00] transition-all duration-300 rounded-xl text-left hover:shadow-[0_0_30px_rgba(223,255,0,0.1)] active:scale-[0.98]"
              >
                <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 group-hover:text-[#DFFF00] transition-all">
                    <Target size={16} />
                </div>
                <div className="mb-4 text-zinc-400 group-hover:text-[#DFFF00] transition-colors">
                  <symptom.icon size={32} />
                </div>
                <h3 className="text-xl font-bold uppercase text-white mb-1">{symptom.label}</h3>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wide group-hover:text-zinc-300">
                  {symptom.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- VIEW: DIAGNOSTICS --- */}
      {view === 'DIAGNOSIS' && currentNodeId && (
        <div className="max-w-2xl mx-auto pt-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                <div className="h-full w-2/3 bg-[#DFFF00] animate-pulse" />
             </div>

             <div className="flex items-center gap-2 mb-6 text-[#DFFF00] font-mono text-xs uppercase tracking-widest">
                <Activity size={12} />
                <span>Diagnostic Protocol Active</span>
             </div>

             <h3 className="text-2xl md:text-3xl font-black text-white mb-8 leading-tight">
                {parseText(DIAGNOSTIC_NODES[currentNodeId].question)}
             </h3>

             <div className="flex flex-col gap-3">
                {DIAGNOSTIC_NODES[currentNodeId].options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        className="flex items-center justify-between p-5 bg-zinc-950 border border-zinc-800 hover:border-[#DFFF00] hover:bg-zinc-900 transition-all rounded-xl group text-left active:scale-[0.99]"
                    >
                        <span className="font-mono text-sm uppercase tracking-wider text-zinc-300 group-hover:text-white">
                            {parseText(option.label)}
                        </span>
                        <ChevronRight size={16} className="text-zinc-600 group-hover:text-[#DFFF00] transition-transform group-hover:translate-x-1" />
                    </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* --- VIEW: ANALYZING --- */}
      {view === 'ANALYZING' && (
        <div className="flex flex-col items-center justify-center pt-20 animate-in fade-in duration-500">
           <div className="relative w-32 h-32 mb-8">
               <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
               <div className="absolute inset-0 border-4 border-t-[#DFFF00] border-r-[#DFFF00] border-b-transparent border-l-transparent rounded-full animate-spin" />
               <BrainCircuit className="absolute inset-0 m-auto text-zinc-500 animate-pulse" size={40} />
           </div>
           <div className="font-mono text-sm text-[#DFFF00] uppercase tracking-[0.2em] animate-pulse">
              Computing Trajectory...
           </div>
           <div className="mt-2 text-zinc-600 font-mono text-xs uppercase">
              Applied Physics: {handedness === 'RIGHT' ? 'Right' : 'Left'}-Handed Model
           </div>
        </div>
      )}

      {/* --- VIEW: PRESCRIPTION --- */}
      {view === 'PRESCRIPTION' && prescriptionId && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="flex items-center justify-between mb-8">
            <button onClick={reset} className="flex items-center gap-2 text-xs font-mono uppercase text-zinc-500 hover:text-white transition-colors">
                <RefreshCw size={12} /> Restart Protocol
            </button>
            <div className="px-3 py-1 bg-[#DFFF00]/10 border border-[#DFFF00]/20 rounded-full">
                <span className="text-[#DFFF00] text-[10px] font-black uppercase tracking-widest">Confidence: 99.9%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             
             {/* LEFT COLUMN: DIAGNOSIS (8 Cols) */}
             <div className="lg:col-span-8 space-y-6">
                
                {/* PRIMARY DIAGNOSIS CARD */}
                <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle size={120} />
                    </div>
                    
                    <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-1">Detected Anomaly</h3>
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-2">
                        {PRESCRIPTIONS[prescriptionId].diagnosis.replace(/_/g, ' ')}
                    </h2>
                    <div className="inline-block px-2 py-1 bg-red-500/10 border border-red-500/20 rounded mb-6">
                         <span className="text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                            {PRESCRIPTIONS[prescriptionId].scientificTerm}
                         </span>
                    </div>

                    <div className="space-y-4 border-t border-zinc-800 pt-6">
                        <div className="flex gap-4">
                             <div className="min-w-[4px] bg-zinc-700 rounded-full" />
                             <div>
                                 <h4 className="text-white font-bold uppercase text-sm mb-1">Mechanical Breakdown</h4>
                                 <p className="text-zinc-400 text-sm leading-relaxed">
                                    {parseText(PRESCRIPTIONS[prescriptionId].explanation)}
                                 </p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* SWING CUE TOGGLE SECTION */}
                <div className="flex flex-col gap-4">
                     {/* Toggle Buttons */}
                     <div className="flex gap-2">
                         <button 
                            onClick={() => setCueMode('TECHNICAL')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                cueMode === 'TECHNICAL' ? 'bg-[#DFFF00] text-black shadow-lg' : 'bg-zinc-900 text-zinc-500 hover:text-white'
                            }`}
                         >
                            <BrainCircuit size={14} /> Technical Thought
                         </button>
                         <button 
                            onClick={() => setCueMode('FEEL')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                cueMode === 'FEEL' ? 'bg-cyan-400 text-black shadow-lg' : 'bg-zinc-900 text-zinc-500 hover:text-white'
                            }`}
                         >
                            <Zap size={14} /> Sensory Feel
                         </button>
                     </div>

                     {/* The Cue Card */}
                     <div className={`p-8 rounded-3xl relative overflow-hidden text-black shadow-[0_0_40px_rgba(0,0,0,0.2)] transition-colors duration-500 ${
                         cueMode === 'TECHNICAL' ? 'bg-[#DFFF00]' : 'bg-cyan-400'
                     }`}>
                         <div className="flex items-center gap-3 mb-4 opacity-70">
                            {cueMode === 'TECHNICAL' ? <BrainCircuit size={20} /> : <Zap size={20} />}
                            <span className="font-black font-mono text-xs uppercase tracking-widest">
                                {cueMode === 'TECHNICAL' ? 'Corrective Algorithm' : 'Kinesthetic Sensation'}
                            </span>
                         </div>
                         <p className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none italic animate-in fade-in slide-in-from-bottom-2 duration-300">
                            "{parseText(
                                cueMode === 'TECHNICAL' 
                                ? PRESCRIPTIONS[prescriptionId].swingThought 
                                : PRESCRIPTIONS[prescriptionId].swingFeel
                            )}"
                         </p>
                    </div>
                </div>

             </div>

             {/* RIGHT COLUMN: DRILLS (4 Cols) */}
             <div className="lg:col-span-4 space-y-4">
                 <div className="flex items-center justify-between text-white font-mono text-xs uppercase tracking-widest mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-[#DFFF00]" />
                        Training Regimen
                    </div>
                    <span className="text-zinc-600">{PRESCRIPTIONS[prescriptionId].drills.length} Modules</span>
                 </div>
                 
                 {PRESCRIPTIONS[prescriptionId].drills.map((drill, idx) => (
                    <div key={idx} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-600 transition-colors group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                drill.difficulty === 'ROOKIE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                                drill.difficulty === 'PRO' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                                'bg-red-950 text-red-400 border border-red-900'
                            }`}>
                                {drill.difficulty}
                            </span>
                            <span className="text-zinc-500 text-[10px] font-mono flex items-center gap-1">
                                <Timer size={10} /> {Math.floor(drill.durationSeconds / 60)} Mins
                            </span>
                        </div>
                        
                        <h4 className="text-white font-bold uppercase mb-1 relative z-10 group-hover:text-[#DFFF00] transition-colors">{drill.title}</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed mb-4 relative z-10 line-clamp-2">{drill.description}</p>
                        
                        <button 
                            onClick={() => startDrill(drill)}
                            className="relative z-10 w-full py-3 bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:text-black hover:bg-white hover:border-white rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Play size={10} /> Initiate Protocol
                        </button>
                    </div>
                 ))}

                 <button 
                    onClick={() => setSaved(true)}
                    disabled={saved}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all mt-4 ${
                        saved 
                        ? 'bg-zinc-900 text-zinc-500 cursor-default' 
                        : 'bg-zinc-800 text-zinc-300 hover:bg-[#DFFF00] hover:text-black'
                    }`}
                 >
                    {saved ? <><CheckCircle2 size={16} /> Saved to Logs</> : <><Save size={16} /> Save to Profile</>}
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* --- VIEW: ACTIVE DRILL MODE --- */}
      {view === 'DRILL_MODE' && activeDrill && (
          <DrillSessionView drill={activeDrill} onClose={() => setView('PRESCRIPTION')} />
      )}

    </div>
  );
}

// --- SUB-COMPONENT: DRILL SESSION ---
function DrillSessionView({ drill, onClose }: { drill: Drill, onClose: () => void }) {
    const [timeLeft, setTimeLeft] = useState(drill.durationSeconds);
    const [isActive, setIsActive] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const toggleStep = (idx: number) => {
        if (completedSteps.includes(idx)) {
            setCompletedSteps(completedSteps.filter(i => i !== idx));
        } else {
            setCompletedSteps([...completedSteps, idx]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="w-full max-w-2xl">
                
                {/* HEADER */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs uppercase tracking-widest mb-2">
                             <Activity size={12} className="animate-pulse"/> Active Session
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase text-white leading-none">{drill.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                        <ArrowLeft size={24} className="text-zinc-500 hover:text-white" />
                    </button>
                </div>

                {/* TIMER CARD */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 to-transparent opacity-50" />
                    
                    <div className="text-8xl font-black font-mono text-white tracking-tighter tabular-nums relative z-10 mb-4">
                        {formatTime(timeLeft)}
                    </div>
                    
                    <div className="flex gap-4 relative z-10">
                        <button 
                            onClick={() => setIsActive(!isActive)}
                            className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${
                                isActive 
                                ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                                : 'bg-[#DFFF00] text-black hover:bg-white'
                            }`}
                        >
                            {isActive ? 'Pause Timer' : timeLeft === drill.durationSeconds ? 'Start Timer' : 'Resume'}
                        </button>
                        <button 
                            onClick={() => { setIsActive(false); setTimeLeft(drill.durationSeconds); }}
                            className="px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-colors"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* CHECKLIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Execution Protocol</h3>
                        {drill.steps.map((step, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => toggleStep(idx)}
                                className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                                    completedSteps.includes(idx) 
                                    ? 'bg-[#DFFF00]/10 border-[#DFFF00]/30' 
                                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'
                                }`}
                            >
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    completedSteps.includes(idx) ? 'bg-[#DFFF00] border-[#DFFF00]' : 'border-zinc-600'
                                }`}>
                                    {completedSteps.includes(idx) && <Check size={10} className="text-black" />}
                                </div>
                                <div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                                        completedSteps.includes(idx) ? 'text-[#DFFF00]' : 'text-zinc-500'
                                    }`}>
                                        {step.focus}
                                    </span>
                                    <p className={`text-sm font-medium leading-tight ${
                                        completedSteps.includes(idx) ? 'text-zinc-300 line-through decoration-zinc-600' : 'text-white'
                                    }`}>
                                        {step.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Required Equipment</h3>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                             <ul className="space-y-3">
                                {drill.equipment.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm font-bold uppercase">
                                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />
                                        {item}
                                    </li>
                                ))}
                             </ul>
                        </div>
                        
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                            <p className="text-zinc-500 text-xs italic leading-relaxed">
                                "Amateurs practice until they get it right. Professionals practice until they can't get it wrong."
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}