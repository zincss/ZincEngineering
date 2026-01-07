'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Compass, Target, RefreshCw, Gauge, ArrowRightCircle, 
    Plane, AlertCircle, Fuel, Crosshair, AlertTriangle, Lock, 
    Wallet, Navigation, Activity, Shield, Cpu, Pickaxe, LogOut, Settings,
    Terminal, Power, Droplets, Timer, Monitor, HardDrive, Anchor, Box, Scan, Focus
} from 'lucide-react';
import { useSimulation } from '../../../context';
import {
    SPACESHIP_UPDATE_EVENT,
    SPACESHIP_CONTROL_EVENT,
    SPACESHIP_EXIT_EVENT,
    NO_LANDING_IDS,
    DOCKING_RANGE,
    formatDistance
} from './constants';

interface SpaceshipHUDProps {
    active: boolean;
}

// --- 1. SHARED HUD COMPONENTS ---

const WalletDisplay = ({ credits, color }: any) => (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 px-4 border border-white/5 rounded-xl pointer-events-auto shadow-xl scale-90">
        <div className="flex flex-col items-end leading-none">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Liquid Assets</span>
            <span className="text-xl font-black font-mono tracking-tighter text-white tabular-nums" style={{ color }}>{credits.toLocaleString()}</span>
        </div>
        <Wallet size={14} className="opacity-40" />
    </div>
);

const PrecisionAlert = ({ isPrecision }: { isPrecision: boolean }) => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border bg-blue-950/60 backdrop-blur-md border-blue-500/50 text-blue-400 animate-in fade-in zoom-in duration-300 shadow-md scale-75 ${!isPrecision && 'invisible'}`}>
        <Crosshair size={10} className="animate-spin-slow" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Precision Mode (P)</span>
    </div>
);

const FreeLookAlert = ({ active }: { active: boolean }) => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border bg-amber-950/60 backdrop-blur-md border-amber-500/50 text-amber-400 animate-in fade-in zoom-in duration-300 shadow-md scale-75 ${!active && 'invisible'}`}>
        <Monitor size={10} className="animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Mouse Free (TAB)</span>
    </div>
);

const ControlButton = ({ icon: Icon, label, onClick, active = false, color = '#DFFF00', alert = false, disabled = false, hotkey = "" }: any) => (
    <button 
        onPointerDown={(e) => { e.stopPropagation(); if(!disabled) onClick(); }}
        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-all pointer-events-auto select-none
            ${active ? 'bg-white/10 shadow-lg' : 'bg-black/60 hover:bg-black/80 backdrop-blur-md'} 
            ${alert ? 'border-red-500/50 text-red-400' : 'border-white/10'}
            ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-95'}`}
    >
        {Icon && <Icon size={12} style={{ color: active ? color : 'currentColor' }} className={active ? 'animate-pulse' : ''} />}
        <div className="flex flex-col items-start leading-none text-left">
            <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-zinc-400'}`}>{label}</span>
            {hotkey && <span className="text-[7px] font-bold opacity-40 uppercase">({hotkey})</span>}
        </div>
    </button>
);

// --- 2. UNIQUE BRANDED STARTUP SEQUENCES ---

const IgnitionSequence = ({ manufacturer, color, phase }: any) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none">
            {manufacturer === "Zinc Aerospace" && (
                <div className="flex flex-col items-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="w-32 h-32 border border-dashed rounded-full opacity-20 border-[#DFFF00]" />
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute w-16 h-16 bg-[#DFFF00]/10 rounded-2xl border-2 border-[#DFFF00] flex items-center justify-center shadow-[0_0_30px_rgba(223,255,0,0.2)]">
                        <Cpu size={32} color="#DFFF00" />
                    </motion.div>
                    <div className="mt-8 flex flex-col items-center gap-1 text-center">
                        <span className="text-[10px] font-black tracking-[0.8em] text-[#DFFF00] uppercase block opacity-50">Zinc Aerospace Division</span>
                        <h2 className="text-2xl font-black tracking-[0.4em] text-white uppercase">Neural Link Sync</h2>
                    </div>
                </div>
            )}
            {manufacturer === "Australian Dynamics" && (
                <div className="bg-zinc-950 border border-white/10 p-6 rounded font-mono text-left shadow-2xl w-[400px]">
                    <div className="flex justify-between border-b border-white/10 pb-2 mb-4">
                        <span className="text-amber-500 text-xs font-black uppercase">Australian Dynamics // AussieOS</span>
                        <Terminal size={14} className="text-zinc-600" />
                    </div>
                    <div className="space-y-1 text-[9px] text-zinc-500 uppercase">
                        <p>{phase >= 0 ? "> Loading logic kernels..." : ""}</p>
                        <p>{phase >= 1 ? "> Checking thruster pressure..." : ""}</p>
                        <p>{phase >= 2 ? "> Welcome back mate." : ""}</p>
                        <p className="text-white font-bold mt-4">{phase >= 2 ? "> SYSTEM_READY_V4.2" : ""}</p>
                    </div>
                </div>
            )}
            {manufacturer === "Ares-Miltech" && (
                <div className="flex flex-col items-center">
                    <Shield size={64} className="text-red-600 mb-4 animate-pulse" />
                    <h2 className="text-5xl font-black italic text-white skew-x-[-12deg] tracking-tighter">ARES_MILTECH</h2>
                    <span className="text-[10px] font-black text-red-600 tracking-[0.5em] mt-4 italic">WEAPONS_SYSTEMS_PRIMED</span>
                </div>
            )}
            {manufacturer === "Titan Industries" && (
                <div className="flex flex-col items-center">
                    <div className="flex gap-2 mb-6">
                        {[0, 1, 2, 3].map(i => (
                            <motion.div key={i} initial={{ height: 0 }} animate={{ height: phase >= i ? 40 : 0 }} className="w-4 bg-orange-600" />
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 tracking-[0.6em] uppercase mb-2">Titan Industries // Heavy Div</span>
                    <h2 className="text-4xl font-black text-white tracking-widest uppercase">Bolt Lock Engaged</h2>
                </div>
            )}
            {manufacturer === "inTAKE racing" && (
                <div className="flex flex-col items-center">
                    <div className="text-9xl font-black italic text-cyan-400 drop-shadow-[0_0_30px_#06b6d4] leading-none">
                        {phase === 0 ? "3" : phase === 1 ? "2" : "1"}
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-1">
                        <span className="text-3xl font-black italic text-white uppercase tracking-tighter">IGNITION</span>
                        <span className="text-xs font-black italic text-cyan-400 uppercase tracking-[0.4em]">inTAKE Racing Systems</span>
                    </div>
                </div>
            )}
            {manufacturer === "Orbital Mechanics" && (
                <div className="flex flex-col items-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="flex flex-col items-center">
                        <div className="w-16 h-8 border-t-2 border-x-2 border-purple-400 rounded-t-full relative mb-12 scale-150" />
                        <h2 className="text-3xl font-serif italic text-white tracking-[0.3em]">Orbital Mechanics</h2>
                        <span className="text-[10px] uppercase font-light text-purple-200 tracking-[0.6em] mt-6 opacity-50">Welcome, Commander</span>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

// --- 3. MAIN HUD COMPONENT ---

export function SpaceshipHUD({ active }: SpaceshipHUDProps) {
    const { 
        setDockedAt, generateJobsForLocation, updateFuel, updateBoost, 
        findBody, saveGame, credits, currentShip, activeJob, miningState
    } = useSimulation();
    
    const [speed, setSpeed] = useState(0);
    const [boost, setBoost] = useState(currentShip.maxBoost);
    const [fuel, setFuel] = useState(currentShip.maxFuel);
    const [maxFuel, setMaxFuel] = useState(currentShip.maxFuel);
    const [maxBoost, setMaxBoost] = useState(currentShip.maxBoost);
    const [shipName, setShipName] = useState(currentShip.name);
    const [isBoosting, setIsBoosting] = useState(false);
    const [isPrecision, setIsPrecision] = useState(false);
    const [isFreeLook, setIsFreeLook] = useState(false);
    const [flightAssist, setFlightAssist] = useState(true);
    const [canOrbit, setCanOrbit] = useState(false);
    const [isOrbiting, setIsOrbiting] = useState(false);
    const [autopilot, setAutopilot] = useState(false); 
    const [reticlePos, setReticlePos] = useState({ x: 0, y: 0 });
    const [isLocked, setIsLocked] = useState(false);
    const [targetAltitude, setTargetAltitude] = useState(0); 
    const [targetDist, setTargetDist] = useState(0);
    const [targetRadius, setTargetRadius] = useState(0);
    const [targetId, setTargetId] = useState<string | null>(null);

    const [isBooting, setIsBooting] = useState(false);
    const [bootPhase, setBootPhase] = useState(0);

    const shipQuat = useRef(new THREE.Quaternion());
    const targetBody = findBody(targetId);
    const targetName = targetBody ? targetBody.name : 'TARGET';
    const isNoLandingZone = targetId ? NO_LANDING_IDS.includes(targetId) : false;
    const inDockingRange = targetAltitude < DOCKING_RANGE;

    const hud = currentShip.hud;
    const manufacturer = currentShip.manufacturer;

    const getEta = () => {
        if (!isLocked || speed <= 1) return "--";
        const seconds = targetDist / speed;
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds/60)}m`;
        return `${Math.floor(seconds/3600)}h`;
    };

    const dispatchControl = useCallback((type: string) => {
        window.dispatchEvent(new CustomEvent(SPACESHIP_CONTROL_EVENT, { detail: { type } }));
    }, []);

    const handleDock = useCallback(() => {
        if (targetId && !isNoLandingZone && inDockingRange && targetBody) {
            updateFuel(fuel); 
            updateBoost(boost); 
            generateJobsForLocation(targetId);
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(shipQuat.current);
            const offset = direction.multiplyScalar(-targetDist); 
            setDockedAt(targetId, { x: offset.x, y: offset.y, z: offset.z });
            saveGame(); 
        }
    }, [targetId, isNoLandingZone, inDockingRange, targetBody, fuel, boost, updateFuel, updateBoost, generateJobsForLocation, targetDist, setDockedAt, saveGame]);

    useEffect(() => {
        if (active) {
            setIsBooting(true);
            setBootPhase(0);
            const t1 = setTimeout(() => setBootPhase(1), 1000);
            const t2 = setTimeout(() => setBootPhase(2), 2000);
            const t3 = setTimeout(() => setBootPhase(3), 3000);
            const t4 = setTimeout(() => setIsBooting(false), 4000);
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
        }
    }, [active]);

    useEffect(() => {
        if (!active) return;
        const handleUpdate = (e: any) => {
            setSpeed(e.detail.speed);
            setBoost(e.detail.boost);
            setFuel(e.detail.fuel);
            setMaxFuel(e.detail.maxFuel);
            setMaxBoost(e.detail.maxBoost);
            setShipName(e.detail.shipName);
            setIsBoosting(e.detail.boosting);
            setIsPrecision(e.detail.precision);
            setIsFreeLook(e.detail.isFreeLook ?? false);
            setFlightAssist(e.detail.flightAssist);
            setCanOrbit(e.detail.canOrbit);
            setIsOrbiting(e.detail.isOrbiting);
            setAutopilot(e.detail.autopilot);
            setReticlePos({ x: e.detail.mouseX, y: e.detail.mouseY });
            if(e.detail.targetId) setTargetId(e.detail.targetId);
            setIsLocked(e.detail.isLocked || false);
            setTargetAltitude(e.detail.targetAltitude || 0); 
            setTargetDist(e.detail.targetDist || 0);
            setTargetRadius(e.detail.targetRadius || 0);
            if (e.detail.shipQuat) shipQuat.current.copy(e.detail.shipQuat);
        };
        const handleDockCommand = (e: any) => { if (e.detail.type === 'ATTEMPT_DOCK') handleDock(); };
        window.addEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
        window.addEventListener(SPACESHIP_CONTROL_EVENT, handleDockCommand);
        return () => {
            window.removeEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
            window.removeEventListener(SPACESHIP_CONTROL_EVENT, handleDockCommand);
        };
    }, [active, handleDock]);

    const handleExit = useCallback(() => dispatchControl('EXIT'), [dispatchControl]);

    if (!active) return null;

    // --- BRANDED LOGOS ---
    const BrandedLogo = () => {
        if (manufacturer === "Zinc Aerospace") return (
            <div className="flex items-center gap-2 pointer-events-auto">
                <div className="w-8 h-8 border-2 border-[#DFFF00] rounded-lg flex items-center justify-center font-black text-white text-sm bg-[#DFFF00]/10 shadow-lg shadow-[#DFFF00]/10">Z</div>
                <div className="flex flex-col leading-none text-white font-bold uppercase text-[9px] tracking-widest"><span>Zinc</span><span className="text-[7px] text-[#DFFF00]">Aero</span></div>
            </div>
        );
        if (manufacturer === "Australian Dynamics") return (
            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 p-1.5 pr-4 rounded-lg pointer-events-auto">
                <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center text-black font-black text-[10px]">AD</div>
                <span className="text-[10px] font-black text-white tracking-widest uppercase">Aussie_Dyn</span>
            </div>
        );
        if (manufacturer === "Ares-Miltech") return (
            <div className="flex items-center gap-2 pointer-events-auto bg-black/40 p-1.5 pr-6 border border-red-600/30 skew-x-[-12deg]">
                <div className="w-7 h-7 bg-red-600 flex items-center justify-center text-white"><Shield size={14} fill="currentColor" /></div>
                <span className="text-[10px] font-black italic text-white tracking-tighter uppercase">Ares_Mil</span>
            </div>
        );
        if (manufacturer === "Titan Industries") return (
            <div className="flex items-center gap-2 pointer-events-auto bg-zinc-900/90 p-1.5 pr-6 border-l-4 border-orange-600">
                <div className="w-8 h-8 bg-orange-600 flex items-center justify-center text-black font-black italic text-sm">T</div>
                <span className="text-sm font-black uppercase text-white tracking-tighter">TITAN</span>
            </div>
        );
        if (manufacturer === "inTAKE racing") return (
            <div className="flex items-baseline gap-1 pointer-events-auto bg-black/40 p-2 px-6 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl">
                <span className="text-xl font-black italic text-cyan-400">in</span><span className="text-xl font-black italic text-white">TAKE</span>
            </div>
        );
        if (manufacturer === "Orbital Mechanics") return (
            <div className="flex flex-col items-center pointer-events-auto bg-white/5 p-2 px-6 rounded-2xl border border-white/10 shadow-2xl">
                <div className="w-8 h-4 border-t border-x border-purple-400 rounded-t-full" />
                <span className="text-[8px] font-serif italic tracking-[0.4em] text-purple-200 mt-1 uppercase leading-none">Orbital</span>
            </div>
        );
        return null;
    };

    // --- UNIQUE TARGETING COMPUTER RENDERER ---
    const TargetingComputer = () => {
        const baseStyle = "flex flex-col items-center gap-3 mb-2 pointer-events-auto scale-[0.8] origin-bottom";
        
        // 1. ZINC: Balanced glass with top accent
        if (manufacturer === "Zinc Aerospace") return (
            <div className={baseStyle}>
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 px-10 rounded-2xl flex flex-col items-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1.5px]" style={{ backgroundColor: hud.primary }} />
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Targeting Computer</span>
                    <span className="text-xl font-black text-white uppercase truncate max-w-[200px] tracking-tight">{targetName}</span>
                    <div className="mt-4 h-10 flex items-center">
                        {isOrbiting ? (
                            <ControlButton icon={ArrowRightCircle} label={`Confirm Dock`} onClick={handleDock} active color={hud.primary} disabled={!inDockingRange} hotkey="O" />
                        ) : canOrbit ? (
                            <ControlButton icon={RefreshCw} label="Link Orbit" onClick={() => dispatchControl('ENGAGE_ORBIT')} active color={hud.primary} hotkey="O" />
                        ) : (
                            <button onClick={() => window.dispatchEvent(new CustomEvent('spaceship-open-nav'))} className="text-[9px] font-black text-zinc-500 uppercase hover:text-white transition-colors flex items-center gap-2">
                                <Navigation size={10} /> Set Destination
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );

        // 2. AUSSIE: Rugged tablet with corner brackets
        if (manufacturer === "Australian Dynamics") return (
            <div className={baseStyle}>
                <div className="bg-zinc-950 border-2 border-white/10 p-4 px-12 rounded-lg flex flex-col items-center shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500" />
                    <span className="text-[10px] font-mono text-amber-500 font-bold mb-2 uppercase">Tele-Link // Tracking</span>
                    <span className="text-2xl font-black text-white uppercase font-mono">{targetName}</span>
                    <div className="mt-4 h-10 flex items-center">
                        {isOrbiting ? (
                            <button onPointerDown={handleDock} disabled={!inDockingRange} className={`px-10 py-2 border-2 font-mono font-black text-sm uppercase transition-all ${inDockingRange ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-transparent border-zinc-800 text-zinc-600'}`}>DOCK_INIT (O)</button>
                        ) : canOrbit ? (
                            <button onPointerDown={() => dispatchControl('ENGAGE_ORBIT')} className="bg-white text-black border-2 border-zinc-200 px-10 py-2 font-mono font-black text-sm uppercase hover:bg-amber-500 transition-all">ORBIT_LINK (O)</button>
                        ) : (
                            <button onClick={() => window.dispatchEvent(new CustomEvent('spaceship-open-nav'))} className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2 hover:text-amber-500 transition-colors">
                                <Terminal size={12} /> SCAN_SECTOR_GRID
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );

        // 3. ARES: Sharp tactical skewed glow
        if (manufacturer === "Ares-Miltech") return (
            <div className={baseStyle}>
                <div className="bg-black/90 border-2 border-red-600/40 p-4 px-12 skew-x-[-12deg] flex flex-col items-center shadow-[0_0_40px_rgba(220,38,38,0.2)]">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield size={10} className="text-red-600" />
                        <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] italic">Active_Scan</span>
                    </div>
                    <span className="text-3xl font-black text-white uppercase italic tracking-tighter">{targetName}</span>
                    <div className="mt-4 h-10 flex items-center skew-x-[12deg]">
                        {isOrbiting ? (
                            <button onPointerDown={handleDock} disabled={!inDockingRange} className={`px-12 py-2 font-black italic text-sm uppercase transition-all border-2 ${inDockingRange ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_30px_red]' : 'bg-transparent border-zinc-900 text-zinc-700'}`}>LINK_DOCK (O)</button>
                        ) : canOrbit ? (
                            <button onPointerDown={() => dispatchControl('ENGAGE_ORBIT')} className="bg-white text-black border-2 border-zinc-200 px-12 py-2 font-black italic text-sm uppercase hover:bg-red-600 hover:text-white transition-colors">ORBIT_INS (O)</button>
                        ) : (
                            <span className="text-[10px] font-black text-red-900 italic tracking-widest animate-pulse">SEARCHING_SPACE...</span>
                        )}
                    </div>
                </div>
            </div>
        );

        // 4. TITAN: Heavy industrial blocky
        if (manufacturer === "Titan Industries") return (
            <div className={baseStyle}>
                <div className="bg-zinc-950 border-4 border-orange-600 p-4 px-14 rounded-sm flex flex-col items-center shadow-2xl">
                    <div className="w-full h-4 bg-orange-600 flex items-center justify-center mb-3">
                        <span className="text-[8px] font-black text-black uppercase tracking-widest">Heavy Systems Tracking</span>
                    </div>
                    <span className="text-2xl font-black text-white uppercase tracking-widest">{targetName}</span>
                    <div className="mt-5 h-10 flex items-center">
                        {isOrbiting ? (
                            <button onPointerDown={handleDock} disabled={!inDockingRange} className={`px-12 py-3 border-4 font-black text-sm uppercase transition-all ${inDockingRange ? 'bg-orange-600 border-orange-400 text-black shadow-[0_0_40px_rgba(234,88,12,0.5)]' : 'bg-transparent border-zinc-900 text-zinc-800'}`}>CONFIRM DOCK (O)</button>
                        ) : canOrbit ? (
                            <button onPointerDown={() => dispatchControl('ENGAGE_ORBIT')} className="bg-white text-black border-4 border-zinc-200 px-12 py-3 font-black text-sm uppercase hover:bg-orange-600 transition-all">ENGAGE ANCHOR (O)</button>
                        ) : (
                            <button onClick={() => window.dispatchEvent(new CustomEvent('spaceship-open-nav'))} className="text-[10px] font-black text-orange-600 border-b-2 border-orange-600 uppercase hover:text-white hover:border-white transition-all">INITIALIZE_NAV</button>
                        )}
                    </div>
                </div>
            </div>
        );

        // 5. INTAKE: Racing telemetry with neon
        if (manufacturer === "inTAKE racing") return (
            <div className={baseStyle}>
                <div className="bg-black/60 backdrop-blur-2xl border-2 border-white/10 p-4 px-12 rounded-full flex flex-col items-center shadow-[0_0_50px_rgba(6,182,212,0.1)] relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899]" />
                    </div>
                    <span className="text-[9px] font-black italic text-cyan-400 uppercase tracking-[0.2em] mb-1">Current Circuit</span>
                    <span className="text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{targetName}</span>
                    <div className="mt-4 h-10 flex items-center">
                        {isOrbiting ? (
                            <button onPointerDown={handleDock} disabled={!inDockingRange} className={`px-12 py-2 rounded-full italic font-black text-sm uppercase transition-all border-2 ${inDockingRange ? 'bg-white text-black border-cyan-400 shadow-[0_0_30px_#06b6d4]' : 'bg-transparent border-white/5 text-zinc-700'}`}>FINISH LINE (O)</button>
                        ) : canOrbit ? (
                            <button onPointerDown={() => dispatchControl('ENGAGE_ORBIT')} className="bg-cyan-500 text-black border-2 border-white px-12 py-2 rounded-full italic font-black text-sm uppercase animate-pulse shadow-[0_0_30px_#06b6d4]">LOCK CIRCUIT (O)</button>
                        ) : (
                            <span className="text-[9px] font-black italic text-zinc-600 uppercase tracking-widest animate-pulse">GATE_SWEEP_ACTIVE...</span>
                        )}
                    </div>
                </div>
            </div>
        );

        // 6. ORBITAL: Luxury minimal glass
        if (manufacturer === "Orbital Mechanics") return (
            <div className={baseStyle}>
                <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 p-5 px-16 rounded-[3rem] flex flex-col items-center shadow-2xl">
                    <div className="w-12 h-[1px] bg-purple-400/50 mb-3" />
                    <span className="text-[9px] font-serif italic text-purple-200 uppercase tracking-[0.6em] mb-2 opacity-60">Observation</span>
                    <span className="text-3xl font-bold text-white uppercase tracking-tight leading-none">{targetName}</span>
                    <div className="mt-6 h-10 flex items-center">
                        {isOrbiting ? (
                            <button onPointerDown={handleDock} disabled={!inDockingRange} className={`px-14 py-2.5 rounded-full font-black text-xs uppercase tracking-[0.5em] transition-all border ${inDockingRange ? 'bg-white text-black shadow-[0_0_30px_white]' : 'bg-transparent border-white/5 text-zinc-700'}`}>INITIATE (O)</button>
                        ) : canOrbit ? (
                            <button onPointerDown={() => dispatchControl('ENGAGE_ORBIT')} className="bg-purple-500/10 border border-purple-400/50 text-purple-200 px-14 py-2.5 rounded-full font-black text-xs uppercase tracking-[0.5em] hover:bg-purple-500/20 transition-all">HARMONIZE (O)</button>
                        ) : (
                            <button onClick={() => window.dispatchEvent(new CustomEvent('spaceship-open-nav'))} className="text-[9px] font-serif italic text-zinc-500 uppercase hover:text-purple-200 transition-colors tracking-widest">Navigation Catalog</button>
                        )}
                    </div>
                </div>
            </div>
        );

        return null;
    };

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 pb-8 overflow-hidden font-sans ${isFreeLook ? 'pointer-events-auto cursor-default' : 'pointer-events-none'}`}>
            <AnimatePresence>{isBooting && <IgnitionSequence manufacturer={manufacturer} color={hud.primary} phase={bootPhase} />}</AnimatePresence>

            {!isBooting && active && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 pointer-events-none flex flex-col items-center justify-between p-6 pb-8">
                    
                    {/* TOP BAR */}
                    <div className="w-full flex justify-between items-start pointer-events-none">
                        <BrandedLogo />
                        <div className="flex flex-col items-center gap-2">
                            <FreeLookAlert active={isFreeLook} />
                            <PrecisionAlert isPrecision={isPrecision} />
                            <WalletDisplay credits={credits} color={hud.primary} />
                        </div>
                        <div className="flex flex-col gap-1.5 pointer-events-auto">
                            <ControlButton icon={LogOut} label="Exit" onClick={handleExit} alert hotkey="ESC" />
                            <ControlButton icon={Pickaxe} label={miningState.isMining ? "Active" : "Mine"} onClick={() => dispatchControl('MINING')} active={miningState.isMining} color="#a855f7" hotkey="M" />
                        </div>
                    </div>

                    <div className="flex-1 w-full" />

                    {/* BOTTOM BAR */}
                    <div className="w-full flex justify-between items-end pointer-events-none">
                        
                        {/* LEFT CLUSTER: TELEMETRY (Zinc-Style) */}
                        <div className="flex flex-col gap-2 pointer-events-auto scale-[1.05] origin-bottom-left">
                            <div className="bg-black/60 border border-white/10 p-3 rounded-xl backdrop-blur-md flex flex-col items-start min-w-[130px]">
                                <span className="text-[8px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Velocity</span>
                                <div className="flex items-baseline gap-1.5 leading-none text-white">
                                    <span className="text-4xl font-black tabular-nums">{speed.toFixed(0)}</span>
                                    <span className="text-[10px] font-bold opacity-40">KM/S</span>
                                </div>
                                <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-300" style={{ width: `${Math.min(100, (speed/20)*100)}%` }} />
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <ControlButton icon={Plane} label="FA" onClick={() => dispatchControl('TOGGLE_FA')} active={flightAssist} hotkey="Z" />
                                <ControlButton icon={Crosshair} label="P-Mode" onClick={() => dispatchControl('TOGGLE_PRECISION')} active={isPrecision} color="#60a5fa" hotkey="P" />
                            </div>
                        </div>

                        {/* CENTER CLUSTER: TARGETING COMPUTER (Unique Branded) */}
                        <TargetingComputer />

                        {/* RIGHT CLUSTER: LOGISTICS (Zinc-Style) */}
                        <div className="flex flex-col gap-2 pointer-events-auto items-end scale-[1.05] origin-bottom-right">
                            <div className="bg-black/60 border border-white/10 p-3 rounded-xl backdrop-blur-md flex flex-col items-end min-w-[130px]">
                                <span className="text-[8px] font-black text-zinc-500 uppercase mb-2 tracking-widest">Reserves</span>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full transition-all duration-300 shadow-[0_0_10px_#DFFF00]" style={{ width: `${(fuel/maxFuel)*100}%`, backgroundColor: hud.primary }} />
                                    </div>
                                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full transition-all duration-300 shadow-[0_0_10px_#00FFFF]" style={{ width: `${(boost/maxBoost)*100}%`, backgroundColor: isBoosting ? '#00FFFF' : hud.primary }} />
                                    </div>
                                </div>
                                <div className="flex justify-between w-full mt-2 border-t border-white/10 pt-1.5">
                                    <span className="text-[8px] font-bold text-zinc-600 uppercase italic">Arrival</span>
                                    <span className="text-[8px] font-black text-zinc-400 tabular-nums uppercase">{getEta()}</span>
                                </div>
                            </div>
                            <ControlButton icon={Navigation} label="Autopilot" onClick={() => dispatchControl('TOGGLE_AUTOPILOT')} active={autopilot} color="#60a5fa" hotkey="C" />
                        </div>
                    </div>

                    {/* RETICLE */}
                    <div className="absolute pointer-events-none opacity-30" style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${reticlePos.x * 50}vw), calc(-50% + ${-reticlePos.y * 50}vh))` }}>
                        <div className="w-10 h-10 border rounded-full flex items-center justify-center border-white">
                            <div className="w-1 h-1 rounded-full bg-white" />
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
