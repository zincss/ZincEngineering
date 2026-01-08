'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Compass, Target, RefreshCw, Gauge, ArrowRightCircle, 
    Plane, AlertCircle, Fuel, Crosshair, AlertTriangle, Lock, 
    Wallet, Navigation, Activity, Shield, Cpu, Pickaxe, LogOut, Settings,
    Terminal, Power, Droplets, Timer, Monitor, HardDrive, Anchor, Box, Scan, Focus,
    Thermometer, Fish, X, Globe, Map, Hammer, Construction, Gem
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

const MiningGauge = ({ heat, overheated }: { heat: number, overheated: boolean }) => (
    <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${heat > 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative w-2 h-24 bg-zinc-900/80 rounded-full border border-white/10 overflow-hidden backdrop-blur-md">
            <div 
                className={`absolute bottom-0 w-full transition-all duration-100 ${overheated ? 'bg-red-500 animate-pulse' : 'bg-purple-500'}`}
                style={{ height: `${heat}%` }}
            />
        </div>
        <Thermometer size={14} className={overheated ? 'text-red-500 animate-pulse' : 'text-purple-400'} />
        {overheated && <span className="text-[8px] font-black text-red-500 bg-black/80 px-1 rounded animate-pulse absolute -bottom-4">COOLING</span>}
    </div>
);

// --- 2. SHIP MODEL BADGE (Helper) ---
const ShipModelBadge = ({ manufacturer, name, color }: any) => (
    <div className="flex flex-col items-center mb-2 z-50">
        <div className="flex items-center gap-2 px-6 py-1.5 bg-black/60 backdrop-blur-md border-x border-white/10 rounded-full relative overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">{manufacturer}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span className="text-xs font-black text-white uppercase tracking-[0.1em]" style={{ color }}>{name}</span>
        </div>
        <div className="w-[1px] h-4 bg-gradient-to-b from-white/20 to-transparent" />
    </div>
);

// --- 3. BRANDED COMPONENTS (Externalized) ---

const BrandedLogo = ({ manufacturer }: { manufacturer: string }) => {
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
    // Industrial/Military Utility Branding (Yellow/Slate)
    if (manufacturer === "Fishworx Staryard") return (
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/60 backdrop-blur-md p-1.5 pr-4 rounded-sm border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
            <div className="w-8 h-8 bg-yellow-500/20 flex items-center justify-center text-yellow-500 border border-yellow-500/50">
                <Hammer size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tight">FISHWORX</span>
                <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-[0.1em]">HEAVY IND.</span>
            </div>
        </div>
    );
    // NEW: Marse Movement (High Fashion/Luxury)
    if (manufacturer === "Marse Movement") return (
        <div className="flex items-center gap-4 pointer-events-auto pl-4">
            <div className="relative">
                <Gem size={20} fill="currentColor" className="text-[#D4AF37]" />
                <div className="absolute inset-0 blur-md bg-[#D4AF37]/40" />
            </div>
            <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-xl font-serif text-white uppercase tracking-widest drop-shadow-md">Marse</span>
                <span className="text-[7px] font-sans font-light text-[#D4AF37] tracking-[0.4em] uppercase opacity-80 pl-0.5">Movement</span>
            </div>
        </div>
    );
    return null;
};

const TargetingComputer = ({ manufacturer, hud, shipName, targetName, isOrbiting, canOrbit, inDockingRange, onDock, onOrbit, onOpenNav }: any) => {
    const baseStyle = "flex flex-col items-center gap-3 mb-2 pointer-events-auto scale-[0.8] origin-bottom-left";
    
    // 1. ZINC: Balanced glass with top accent
    if (manufacturer === "Zinc Aerospace") return (
        <div className={baseStyle}>
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 px-10 rounded-2xl flex flex-col items-center shadow-2xl relative overflow-hidden min-w-[200px]">
                <div className="absolute top-0 left-0 w-full h-[1.5px]" style={{ backgroundColor: hud.primary }} />
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Targeting Computer</span>
                <span className="text-xl font-black text-white uppercase truncate max-w-[180px] tracking-tight">{targetName}</span>
                <div className="mt-4 h-10 flex items-center">
                    {isOrbiting ? (
                        <ControlButton icon={ArrowRightCircle} label={`Confirm Dock`} onClick={onDock} active color={hud.primary} disabled={!inDockingRange} hotkey="O" />
                    ) : canOrbit ? (
                        <ControlButton icon={RefreshCw} label="Link Orbit" onClick={onOrbit} active color={hud.primary} hotkey="O" />
                    ) : (
                        <button onClick={onOpenNav} className="text-[9px] font-black text-zinc-500 uppercase hover:text-white transition-colors flex items-center gap-2">
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
            <div className="bg-zinc-950 border border-white/10 p-3 px-8 rounded-lg flex flex-col items-center shadow-2xl relative min-w-[200px]">
                <div className="flex items-center gap-2 mb-2 w-full border-b border-white/10 pb-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-sm" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Tracking</span>
                </div>
                <span className="text-xl font-black text-white uppercase truncate max-w-[180px]">{targetName}</span>
                <div className="mt-3 w-full flex justify-center">
                    {isOrbiting ? (
                        <ControlButton icon={ArrowRightCircle} label="DOCK" onClick={onDock} active color="#fbbf24" disabled={!inDockingRange} hotkey="O" />
                    ) : canOrbit ? (
                        <ControlButton icon={RefreshCw} label="ORBIT" onClick={onOrbit} active color="#fbbf24" hotkey="O" />
                    ) : (
                        <button onClick={onOpenNav} className="text-[9px] font-black text-zinc-500 uppercase hover:text-white transition-colors flex items-center gap-2">
                            <Terminal size={10} /> SCAN GRID
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // 3. ARES: Tactical red skew
    if (manufacturer === "Ares-Miltech") return (
        <div className={baseStyle}>
            <div className="bg-black/90 border-l-2 border-red-600/50 p-3 px-10 skew-x-[-12deg] flex flex-col items-center shadow-[0_0_20px_rgba(220,38,38,0.1)] min-w-[200px]">
                <div className="skew-x-[12deg] flex flex-col items-center w-full">
                    <div className="flex items-center gap-2 mb-1 border-b border-red-900/30 w-full justify-center pb-1">
                        <Shield size={10} className="text-red-600" />
                        <span className="text-[9px] font-black italic text-red-500 uppercase tracking-widest">Locked_Tgt</span>
                    </div>
                    <span className="text-xl font-black text-white uppercase italic tracking-tighter truncate max-w-[180px]">{targetName}</span>
                    <div className="mt-3 flex justify-center">
                       {isOrbiting ? (
                            <ControlButton icon={ArrowRightCircle} label="DOCK" onClick={onDock} active color="#ef4444" disabled={!inDockingRange} hotkey="O" />
                        ) : canOrbit ? (
                            <ControlButton icon={RefreshCw} label="ORBIT" onClick={onOrbit} active color="#ef4444" hotkey="O" />
                        ) : (
                            <button onClick={onOpenNav} className="text-[9px] font-black italic text-red-800 uppercase hover:text-red-500 transition-colors flex items-center gap-2">
                                <Crosshair size={10} /> ACQUIRE
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // 4. TITAN: Heavy orange industrial
    if (manufacturer === "Titan Industries") return (
        <div className={baseStyle}>
            <div className="bg-zinc-950 border-l-4 border-orange-600 p-3 px-10 rounded-r-lg flex flex-col items-center shadow-2xl min-w-[200px]">
                <span className="text-[8px] font-black text-orange-700 uppercase tracking-[0.2em] w-full text-left mb-1">Heavy Systems</span>
                <span className="text-2xl font-black text-white uppercase tracking-tighter truncate max-w-[180px]">{targetName}</span>
                <div className="mt-3 w-full flex justify-center border-t border-white/5 pt-2">
                    {isOrbiting ? (
                        <ControlButton icon={ArrowRightCircle} label="ANCHOR" onClick={onDock} active color="#f59e0b" disabled={!inDockingRange} hotkey="O" />
                    ) : canOrbit ? (
                        <ControlButton icon={RefreshCw} label="LINK" onClick={onOrbit} active color="#f59e0b" hotkey="O" />
                    ) : (
                        <button onClick={onOpenNav} className="text-[9px] font-black text-zinc-600 uppercase hover:text-white transition-colors">
                            NAV_COMP
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // 5. INTAKE: Neon racing pill
    if (manufacturer === "inTAKE racing") return (
        <div className={baseStyle}>
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-3 px-12 rounded-full flex flex-col items-center shadow-[0_0_30px_rgba(6,182,212,0.1)] relative min-w-[220px]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-500 rounded-b-full shadow-[0_0_10px_#06b6d4]" />
                <span className="text-[9px] font-black italic text-cyan-400 uppercase tracking-widest mt-2 mb-0.5">Next Checkpoint</span>
                <span className="text-xl font-black italic text-white uppercase tracking-tighter truncate max-w-[180px]">{targetName}</span>
                <div className="mt-2">
                     {isOrbiting ? (
                        <ControlButton icon={ArrowRightCircle} label="PIT STOP" onClick={onDock} active color="#06b6d4" disabled={!inDockingRange} hotkey="O" />
                    ) : canOrbit ? (
                        <ControlButton icon={RefreshCw} label="DRIFT" onClick={onOrbit} active color="#06b6d4" hotkey="O" />
                    ) : (
                        <button onClick={onOpenNav} className="text-[9px] font-black italic text-zinc-500 uppercase hover:text-white transition-colors">
                            SELECT TRACK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // 6. ORBITAL: Minimal glass arch
    if (manufacturer === "Orbital Mechanics") return (
        <div className={baseStyle}>
            <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 p-4 px-12 rounded-[2rem] flex flex-col items-center shadow-2xl min-w-[200px]">
                <div className="w-8 h-1 bg-purple-400/50 rounded-full mb-2" />
                <span className="text-[8px] font-serif italic text-purple-200 uppercase tracking-[0.4em] mb-1 opacity-60">Guidance</span>
                <span className="text-xl font-bold text-white uppercase tracking-widest truncate max-w-[180px]">{targetName}</span>
                <div className="mt-3">
                    {isOrbiting ? (
                        <ControlButton icon={ArrowRightCircle} label="DOCK" onClick={onDock} active color="#d8b4fe" disabled={!inDockingRange} hotkey="O" />
                    ) : canOrbit ? (
                        <ControlButton icon={RefreshCw} label="SYNC" onClick={onOrbit} active color="#d8b4fe" hotkey="O" />
                    ) : (
                        <button onClick={onOpenNav} className="text-[9px] font-serif italic text-zinc-500 uppercase hover:text-purple-200 transition-colors tracking-widest">
                            Catalog
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // 7. FISHWORX: Industrial CAD Frame (Yellow/Slate - REFINED)
    if (manufacturer === "Fishworx Staryard") return (
        <div className={baseStyle}>
            <div className="bg-slate-900/60 backdrop-blur-md border border-yellow-500/50 p-3 px-10 rounded-sm flex flex-col items-center shadow-[0_0_20px_rgba(234,179,8,0.1)] min-w-[200px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#eab308_5px,#eab308_6px)]" />
                <div className="flex items-center gap-2 mb-1 w-full border-b border-yellow-500/30 pb-1 justify-center z-10">
                    <Scan size={10} className="text-yellow-500" />
                    <span className="text-[9px] font-mono font-bold text-yellow-500 uppercase tracking-widest">Guidance_Lock</span>
                </div>
                <span className="text-xl font-black text-white uppercase tracking-tight z-10 truncate max-w-[180px] font-mono">{targetName}</span>
                <div className="mt-3 z-10">
                    {isOrbiting ? (
                        <ControlButton icon={ArrowRightCircle} label="MOOR" onClick={onDock} active color="#eab308" disabled={!inDockingRange} hotkey="O" />
                    ) : canOrbit ? (
                        <ControlButton icon={RefreshCw} label="ANCHOR" onClick={onOrbit} active color="#eab308" hotkey="O" />
                    ) : (
                        <button onClick={onOpenNav} className="text-[9px] font-bold text-yellow-600 uppercase hover:text-yellow-400 transition-colors bg-slate-900/50 border border-yellow-500/50 px-4 py-1.5 rounded-sm">
                            SET COORDS
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // 8. MARSE MOVEMENT: High Fashion Luxury (White/Gold/Black)
    if (manufacturer === "Marse Movement") return (
        <div className={baseStyle}>
            <div className="bg-[#050505]/90 backdrop-blur-2xl border border-[#D4AF37]/20 p-5 px-10 rounded-2xl flex flex-col items-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] relative min-w-[240px]">
                {/* Accent Line */}
                <div className="absolute top-0 w-16 h-[1px] bg-[#D4AF37]/60 shadow-[0_0_15px_#D4AF37]" />
                
                <div className="flex flex-col items-center mb-3 mt-1 gap-1">
                    <span className="text-[9px] font-sans font-medium text-[#D4AF37] uppercase tracking-[0.3em] opacity-80">Guidance</span>
                    <span className="text-2xl font-serif text-white uppercase tracking-widest leading-none drop-shadow-md">{targetName}</span>
                </div>
                
                <div className="mt-2 flex items-center justify-center w-full gap-4">
                    {isOrbiting ? (
                        <button onClick={onDock} disabled={!inDockingRange} className="group flex items-center gap-2 px-4 py-1.5 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <span className="text-[10px] font-sans font-bold text-white uppercase tracking-widest group-hover:text-[#D4AF37] transition-colors">Arrive</span>
                            <ArrowRightCircle size={12} className="text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    ) : canOrbit ? (
                        <button onClick={onOrbit} className="group flex items-center gap-2 px-4 py-1.5 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 rounded-full transition-all">
                            <span className="text-[10px] font-sans font-bold text-white uppercase tracking-widest group-hover:text-[#D4AF37] transition-colors">Align</span>
                            <RefreshCw size={12} className="text-[#D4AF37] group-hover:rotate-180 transition-transform duration-700" />
                        </button>
                    ) : (
                        <button onClick={onOpenNav} className="text-[9px] font-serif italic text-zinc-500 uppercase hover:text-[#D4AF37] transition-colors tracking-[0.2em]">
                            Select Destination
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return null;
};

const Speedometer = ({ manufacturer, speed, hud }: any) => {
    // 1. ZINC AEROSPACE (Baseline)
    if (manufacturer === "Zinc Aerospace") {
        return (
            <div className="bg-black/80 border border-white/10 p-4 px-8 rounded-2xl flex flex-col items-center shadow-2xl relative overflow-hidden min-w-[160px]">
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: hud.primary }} />
                <span className="text-[9px] font-black text-zinc-500 uppercase mb-1 tracking-[0.3em]">Propulsion</span>
                <div className="flex items-baseline gap-1.5 leading-none text-white">
                    <span className="text-5xl font-black tabular-nums">{speed.toFixed(0)}</span>
                    <span className="text-xs font-bold opacity-40">KM/S</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full mt-3 overflow-hidden border border-white/5">
                    <div className="h-full bg-white transition-all duration-300 shadow-[0_0_10px_white]" style={{ width: `${Math.min(100, (speed/40)*100)}%` }} />
                </div>
            </div>
        );
    }

    // 2. AUSTRALIAN DYNAMICS (Rugged Amber Frame)
    if (manufacturer === "Australian Dynamics") {
        return (
            <div className="bg-zinc-900 border border-white/10 p-3 px-6 rounded-lg shadow-xl min-w-[160px] flex flex-col gap-2 relative">
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                    <span className="text-[9px] font-black text-amber-500 uppercase">VELOCITY</span>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-4xl font-black text-white tabular-nums leading-none">{speed.toFixed(0)}</span>
                    <span className="text-[9px] font-bold text-zinc-500 mb-1">km/s</span>
                </div>
                <div className="flex gap-0.5 h-1.5">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={`flex-1 rounded-sm ${i < (speed/40)*10 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
                    ))}
                </div>
            </div>
        );
    }

    // 3. ARES-MILTECH (Tactical Red Skew)
    if (manufacturer === "Ares-Miltech") {
        return (
            <div className="bg-black/90 border-l-2 border-red-600/50 p-3 px-8 skew-x-[-12deg] shadow-[0_0_20px_rgba(220,38,38,0.1)] min-w-[160px] flex flex-col items-center">
                <div className="skew-x-[12deg] w-full flex flex-col items-center">
                    <span className="text-[8px] font-black italic text-red-500 uppercase tracking-widest mb-1">THRUST_VEC</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black italic text-white tabular-nums tracking-tighter">{speed.toFixed(0)}</span>
                        <span className="text-[10px] font-bold text-red-600 italic">KMS</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 skew-x-[-20deg] mt-2 overflow-hidden">
                        <div className="h-full bg-red-600 shadow-[0_0_5px_red]" style={{ width: `${Math.min(100, (speed/40)*100)}%` }} />
                    </div>
                </div>
            </div>
        );
    }

    // 4. TITAN INDUSTRIES (Heavy Block)
    if (manufacturer === "Titan Industries") {
        return (
            <div className="bg-zinc-950 border-l-4 border-orange-600 p-3 px-8 rounded-r-lg shadow-2xl min-w-[160px] flex flex-col">
                <span className="text-[8px] font-black text-orange-700 uppercase tracking-widest mb-1">Mass Drive</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-orange-500 tabular-nums leading-none tracking-tighter">{speed.toFixed(0)}</span>
                    <span className="text-[10px] font-black text-zinc-600">KM/S</span>
                </div>
                <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 ${i < (speed/40)*5 ? 'bg-orange-600' : 'bg-zinc-900'}`} />
                    ))}
                </div>
            </div>
        );
    }

    // 5. INTAKE RACING (Neon Pill)
    if (manufacturer === "inTAKE racing") {
        return (
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-3 px-10 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.15)] min-w-[180px] flex flex-col items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/5" />
                <span className="text-[8px] font-black italic text-cyan-400 uppercase tracking-widest z-10">Velocity</span>
                <span className="text-6xl font-black italic text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] tabular-nums z-10 leading-none">{speed.toFixed(0)}</span>
                <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            </div>
        );
    }

    // 6. ORBITAL MECHANICS (Minimal Arch)
    if (manufacturer === "Orbital Mechanics") {
        return (
            <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 p-4 px-10 rounded-[2rem] shadow-2xl min-w-[160px] flex flex-col items-center">
                <span className="text-[8px] font-serif italic text-purple-200 uppercase tracking-[0.3em] mb-1 opacity-60">Velocity</span>
                <span className="text-5xl font-serif text-white tabular-nums leading-none">{speed.toFixed(0)}</span>
                <div className="w-12 h-[1px] bg-purple-400/30 mt-2" />
            </div>
        );
    }

    // 7. FISHWORX STARYARD (Industrial Digital - Yellow/Slate - REFINED)
    if (manufacturer === "Fishworx Staryard") {
        return (
            <div className="bg-slate-900/60 backdrop-blur-md border border-yellow-500/50 p-3 px-8 rounded-sm shadow-[0_0_15px_rgba(234,179,8,0.1)] min-w-[160px] flex flex-col items-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#eab308_2px,#eab308_3px)]" />
                <div className="flex items-center gap-2 mb-1 w-full justify-between z-10">
                    <span className="text-[9px] font-mono font-bold text-yellow-500 uppercase">SYS_SPD</span>
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-sm animate-pulse" />
                </div>
                <div className="flex items-baseline gap-1 z-10">
                    <span className="text-5xl font-black text-yellow-100 font-mono tabular-nums">{speed.toFixed(0)}</span>
                    <span className="text-[10px] font-bold text-yellow-600 font-mono">m/s</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800/50 mt-2 z-10 rounded-sm overflow-hidden border border-yellow-500/30">
                    <div className="h-full bg-yellow-500" style={{ width: `${Math.min(100, (speed/40)*100)}%` }} />
                </div>
            </div>
        );
    }

    // 8. MARSE MOVEMENT: High Fashion Luxury (White/Gold/Black)
    if (manufacturer === "Marse Movement") {
        return (
            <div className="bg-[#050505]/90 backdrop-blur-2xl border border-[#D4AF37]/20 p-6 px-12 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] min-w-[200px] flex flex-col items-center relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] rounded-full pointer-events-none" />
                
                <span className="text-[8px] font-sans font-medium text-[#D4AF37] uppercase tracking-[0.4em] mb-0.5 opacity-80 z-10">Vitesse</span>
                <span className="text-6xl font-serif text-white tabular-nums z-10 tracking-tight drop-shadow-lg">{speed.toFixed(0)}</span>
                
                {/* Minimalist Progress Ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-full overflow-hidden">
                    <svg className="w-full h-full -rotate-90 p-[1px]">
                        <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                        <circle 
                            cx="50%" cy="50%" r="48%" 
                            fill="none" 
                            stroke="#D4AF37" 
                            strokeWidth="1" 
                            strokeDasharray="300" 
                            strokeDashoffset={300 - (Math.min(1, speed/40) * 300)} 
                            strokeLinecap="round"
                            className="transition-all duration-1000 opacity-80" 
                        />
                    </svg>
                </div>
            </div>
        );
    }

    return null;
};

const ResourceGauge = ({ manufacturer, fuel, maxFuel, boost, maxBoost, isBoosting, hud }: any) => {
    // 1. ZINC AEROSPACE (Baseline)
    if (manufacturer === "Zinc Aerospace") {
        return (
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
            </div>
        );
    }

    // 2. AUSTRALIAN DYNAMICS
    if (manufacturer === "Australian Dynamics") {
        return (
            <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-lg flex flex-col gap-2 min-w-[130px]">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[7px] font-black text-amber-500"><span>FUEL</span><span>{Math.floor(fuel)}</span></div>
                    <div className="flex gap-0.5 h-1.5">
                        {[...Array(5)].map((_, i) => <div key={i} className={`flex-1 rounded-sm ${i < (fuel/maxFuel)*5 ? 'bg-amber-500' : 'bg-zinc-800'}`} />)}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[7px] font-black text-amber-500"><span>BST</span><span>{Math.floor(boost)}</span></div>
                    <div className="flex gap-0.5 h-1.5">
                        {[...Array(5)].map((_, i) => <div key={i} className={`flex-1 rounded-sm ${i < (boost/maxBoost)*5 ? (isBoosting ? 'bg-white' : 'bg-amber-500') : 'bg-zinc-800'}`} />)}
                    </div>
                </div>
            </div>
        );
    }

    // 3. ARES-MILTECH
    if (manufacturer === "Ares-Miltech") {
        return (
            <div className="bg-black/80 border-r-2 border-red-600/50 p-2 pl-4 skew-x-[-12deg] flex flex-col items-end min-w-[130px]">
                <div className="skew-x-[12deg] w-full flex flex-col gap-2">
                    <div>
                        <span className="text-[7px] font-black text-red-500 uppercase block text-right">Core_Temp</span>
                        <div className="w-full h-1.5 bg-zinc-900 skew-x-[-20deg] mt-0.5">
                            <div className="h-full bg-red-600" style={{ width: `${(fuel/maxFuel)*100}%` }} />
                        </div>
                    </div>
                    <div>
                        <span className="text-[7px] font-black text-red-500 uppercase block text-right">Inj_Press</span>
                        <div className="w-full h-1.5 bg-zinc-900 skew-x-[-20deg] mt-0.5">
                            <div className={`h-full ${isBoosting ? 'bg-white' : 'bg-red-600'}`} style={{ width: `${(boost/maxBoost)*100}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 4. TITAN INDUSTRIES
    if (manufacturer === "Titan Industries") {
        return (
            <div className="bg-zinc-950 border-r-4 border-orange-600 p-3 rounded-l-lg shadow-lg min-w-[130px] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-[7px] font-black text-orange-700 w-8">FUEL</span>
                    <div className="flex-1 h-2 bg-zinc-900 border border-zinc-800">
                        <div className="h-full bg-orange-600" style={{ width: `${(fuel/maxFuel)*100}%` }} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[7px] font-black text-orange-700 w-8">BST</span>
                    <div className="flex-1 h-2 bg-zinc-900 border border-zinc-800">
                        <div className={`h-full ${isBoosting ? 'bg-white' : 'bg-orange-500'}`} style={{ width: `${(boost/maxBoost)*100}%` }} />
                    </div>
                </div>
            </div>
        );
    }

    // 5. INTAKE RACING
    if (manufacturer === "inTAKE racing") {
        return (
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-3 rounded-2xl min-w-[140px] flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-pink-500/5" />
                <div className="z-10">
                    <span className="text-[7px] font-black italic text-pink-400 tracking-wider block text-right">N2O</span>
                    <div className="w-full h-1 bg-zinc-800/50 rounded-full mt-0.5">
                        <div className={`h-full bg-pink-500 shadow-[0_0_8px_#ec4899] ${isBoosting ? 'bg-white' : ''}`} style={{ width: `${(boost/maxBoost)*100}%` }} />
                    </div>
                </div>
                <div className="z-10">
                    <span className="text-[7px] font-black italic text-cyan-400 tracking-wider block text-right">FUEL</span>
                    <div className="w-full h-1 bg-zinc-800/50 rounded-full mt-0.5">
                        <div className="h-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" style={{ width: `${(fuel/maxFuel)*100}%` }} />
                    </div>
                </div>
            </div>
        );
    }

    // 6. ORBITAL MECHANICS
    if (manufacturer === "Orbital Mechanics") {
        return (
            <div className="bg-white/5 backdrop-blur-[30px] border border-white/10 p-4 px-6 rounded-2xl shadow-lg min-w-[130px] flex flex-col items-center">
                <span className="text-[7px] font-serif italic text-purple-200 uppercase tracking-[0.2em] mb-2 opacity-60">Status</span>
                <div className="w-full h-[1px] bg-white/10 mb-2" />
                <div className="w-full flex justify-between text-[8px] font-serif text-white mb-1">
                    <span>PWR</span><span>{(fuel/maxFuel*100).toFixed(0)}%</span>
                </div>
                <div className="w-full flex justify-between text-[8px] font-serif text-white">
                    <span>BST</span><span>{(boost/maxBoost*100).toFixed(0)}%</span>
                </div>
            </div>
        );
    }

    // 7. FISHWORX STARYARD (Yellow/Slate - REFINED)
    if (manufacturer === "Fishworx Staryard") {
        return (
            <div className="bg-slate-900/60 backdrop-blur-md border border-yellow-500/50 p-3 rounded-sm shadow-lg min-w-[130px] flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[7px] font-mono font-bold text-yellow-500"><span>FUEL_CELL</span><span>{Math.floor(fuel)}</span></div>
                    <div className="w-full h-1.5 bg-slate-800/50 rounded-sm overflow-hidden border border-yellow-500/30">
                        <div className="h-full bg-yellow-500" style={{ width: `${(fuel/maxFuel)*100}%` }} />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[7px] font-mono font-bold text-yellow-500"><span>HYD_PRESS</span><span>{Math.floor(boost)}</span></div>
                    <div className="w-full h-1.5 bg-slate-800/50 rounded-sm overflow-hidden border border-yellow-500/30">
                        <div className={`h-full ${isBoosting ? 'bg-white' : 'bg-yellow-400'}`} style={{ width: `${(boost/maxBoost)*100}%` }} />
                    </div>
                </div>
            </div>
        );
    }

    // 8. MARSE MOVEMENT: High Fashion Luxury (White/Gold/Black)
    if (manufacturer === "Marse Movement") {
        return (
            <div className="bg-[#050505]/90 backdrop-blur-2xl border border-[#D4AF37]/20 p-4 px-8 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] min-w-[160px] flex flex-col gap-4 relative">
                {/* Fuel / Essence */}
                <div className="flex flex-col gap-1 z-10">
                    <div className="flex justify-between items-baseline">
                        <span className="text-[8px] font-sans font-medium text-[#D4AF37] uppercase tracking-[0.2em] opacity-80">Essence</span>
                        <span className="text-[10px] font-serif text-white tabular-nums">{Math.floor(fuel)}</span>
                    </div>
                    <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" style={{ width: `${(fuel/maxFuel)*100}%` }} />
                    </div>
                </div>
                
                {/* Boost / Force */}
                <div className="flex flex-col gap-1 z-10">
                    <div className="flex justify-between items-baseline">
                        <span className="text-[8px] font-sans font-medium text-white uppercase tracking-[0.2em] opacity-60">Force</span>
                        <span className="text-[10px] font-serif text-white tabular-nums">{Math.floor(boost)}</span>
                    </div>
                    <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-white shadow-[0_0_10px_white] transition-all duration-300 ${isBoosting ? 'opacity-100' : 'opacity-60'}`} style={{ width: `${(boost/maxBoost)*100}%` }} />
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

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
            {manufacturer === "Fishworx Staryard" && (
                <div className="flex flex-col items-center">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center bg-slate-900/80 backdrop-blur-xl p-8 rounded-lg border border-yellow-500/50 shadow-2xl">
                        {/* Active Hydraulic Piston Animation */}
                        <div className="flex gap-2 mb-6 h-12 items-end">
                            {[0, 1, 2, 3].map(i => (
                                <motion.div 
                                    key={i} 
                                    initial={{ height: "20%" }} 
                                    animate={{ height: ["20%", "100%", "20%"] }} 
                                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2, ease: "easeInOut" }}
                                    className="w-4 bg-yellow-500 rounded-t-sm shadow-[0_0_10px_#eab308]" 
                                />
                            ))}
                        </div>
                        
                        <h2 className="text-3xl font-black text-white uppercase tracking-widest">System Check</h2>
                        <span className="text-[9px] font-mono font-bold text-yellow-600 mt-4 tracking-[0.2em] uppercase">Hydraulics Pressurized</span>
                    </motion.div>
                </div>
            )}
            {manufacturer === "Marse Movement" && (
                <div className="flex flex-col items-center justify-center w-full h-full bg-black">
                    {/* Background Ambience */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_60%)] pointer-events-none" />
                    
                    {/* Phase 0: The Spark / Horizon */}
                    {phase >= 0 && (
                        <motion.div 
                            initial={{ scaleX: 0, opacity: 0 }} 
                            animate={{ scaleX: 1, opacity: 1 }} 
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="absolute w-2/3 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" 
                        />
                    )}

                    {/* Phase 1: The Emblem Rise */}
                    {phase >= 1 && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="flex flex-col items-center z-10"
                        >
                            <div className="relative mb-6">
                                <motion.div 
                                    animate={{ rotate: 180, scale: [1, 1.1, 1] }} 
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-[-30px] border-[0.5px] border-[#D4AF37]/30 rounded-full border-dashed" 
                                />
                                <motion.div 
                                    initial={{ scale: 0.8, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ duration: 1.5, ease: "backOut" }}
                                >
                                    <Gem size={48} fill="currentColor" className="text-[#D4AF37] drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]" />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Phase 2: Typography */}
                    {phase >= 2 && (
                        <motion.div 
                            initial={{ opacity: 0, letterSpacing: "0.5em" }} 
                            animate={{ opacity: 1, letterSpacing: "0.2em" }} 
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="flex flex-col items-center z-10 mt-4"
                        >
                            <h1 className="text-5xl font-serif text-white uppercase tracking-[0.2em] font-medium drop-shadow-lg">Marse</h1>
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: "100px" }} 
                                transition={{ delay: 0.5, duration: 1 }}
                                className="h-[1px] bg-[#D4AF37]/50 mt-4 mb-2"
                            />
                            <span className="text-[10px] font-sans text-[#D4AF37] uppercase tracking-[0.4em] font-light">Movement</span>
                        </motion.div>
                    )}

                    {/* Phase 3: Systems Check (Subtle) */}
                    {phase >= 3 && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 0.7 }} 
                            transition={{ duration: 1 }}
                            className="absolute bottom-20 flex flex-col items-center gap-2"
                        >
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Systems Online</span>
                            <div className="flex gap-1">
                                {[0,1,2].map(i => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        transition={{ delay: i * 0.2 }} 
                                        className="w-1 h-1 bg-[#D4AF37] rounded-full" 
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

const CockpitOverlay = ({ manufacturer, speed, fuel, boost, heat, overheated, color }: any) => {
    const frameColor = color;
    
    return (
        <div className="absolute inset-0 pointer-events-none z-[90] overflow-hidden">
            {/* Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-20 pointer-events-none mix-blend-overlay" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

            {/* SVG Frame - Simplified but effective */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M0,0 L0,100 L200,100 C 250,200 250,200 400,0 Z" fill="black" fillOpacity="0.8" transform="scale(1, -1) translate(0, -100%)" /> {/* Top Left */}
                <path d="M100%,0 L100%,100 Lcalc(100% - 200px),100 C calc(100% - 250px),200 calc(100% - 250px),200 calc(100% - 400px),0 Z" fill="black" fillOpacity="0.8" transform="scale(1, -1) translate(0, -100%)" /> {/* Top Right */}
                
                <path d="M0,100% L0,calc(100% - 200px) L150,calc(100% - 150px) L300,100% Z" fill="#09090b" /> {/* Bottom Left Dashboard */}
                <path d="M100%,100% L100%,calc(100% - 200px) Lcalc(100% - 150px),calc(100% - 150px) Lcalc(100% - 300px),100% Z" fill="#09090b" /> {/* Bottom Right Dashboard */}
            </svg>

            {/* Dashboard Displays embedded in SVG area */}
            <div className="absolute bottom-4 left-8 text-white">
                <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-black uppercase text-zinc-500">Systems / Propulsion</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-mono font-black tabular-nums" style={{ color: frameColor }}>{(speed * 10).toFixed(0)}</span>
                        <span className="text-xs text-zinc-400">M/S</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                         <div className={`w-3 h-3 rounded-full ${overheated ? 'bg-red-500 animate-pulse' : 'bg-zinc-800'}`} />
                         <div className={`w-3 h-3 rounded-full ${heat > 50 ? 'bg-orange-500' : 'bg-zinc-800'}`} />
                         <div className={`w-3 h-3 rounded-full ${heat > 0 ? 'bg-green-500' : 'bg-zinc-800'}`} />
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-8 text-white text-right">
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black uppercase text-zinc-500">Reactor / Fuel</span>
                    <div className="flex items-baseline gap-2 flex-row-reverse">
                        <span className="text-4xl font-mono font-black tabular-nums">{Math.floor(fuel)}</span>
                        <span className="text-xs text-zinc-400">UNITS</span>
                    </div>
                </div>
            </div>

            {/* Central HUD Elements projected on glass */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] border border-white/5 rounded-[50px] opacity-20 pointer-events-none" />
        </div>
    )
}

// --- 4. NAVIGATION UI ---

const NavigationUI = ({ onClose, currentData, manufacturer, hudColor, onSetTarget }: any) => {
    const [filter, setFilter] = useState<'all' | 'planet' | 'station'>('all');
    
    // Group items for display
    const items = useMemo(() => {
        let list = currentData.flatMap((body: any) => [
            body, 
            ...(body.moons || [])
        ]).filter((b: any) => b.type !== 'Star' && b.type !== 'Black Hole');

        if (filter === 'planet') list = list.filter((b: any) => b.type === 'Planet' || b.type === 'Dwarf Planet' || b.type === 'Moon');
        if (filter === 'station') list = list.filter((b: any) => ['Station', 'Relay'].includes(b.type));
        
        return list;
    }, [currentData, filter]);

    // Manufacturer Styling Logic
    const getStyle = () => {
        if (manufacturer === "Zinc Aerospace") return "bg-zinc-950 border-zinc-800 rounded-3xl";
        if (manufacturer === "Ares-Miltech") return "bg-red-950/90 border-red-900 skew-x-[-2deg]";
        if (manufacturer === "Titan Industries") return "bg-orange-950/90 border-orange-800 border-4";
        if (manufacturer === "inTAKE racing") return "bg-cyan-950/80 border-cyan-500/50 rounded-full";
        if (manufacturer === "Orbital Mechanics") return "bg-purple-950/80 border-purple-500/30 rounded-[3rem]";
        if (manufacturer === "Fishworx Staryard") return "bg-slate-900 border-2 border-yellow-600 rounded-lg shadow-2xl";
        if (manufacturer === "Marse Movement") return "bg-[#050505]/95 border border-[#D4AF37]/30 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]";
        return "bg-black border-white/10 rounded-xl";
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-[800px] h-[600px] flex flex-col p-8 shadow-2xl relative border ${getStyle()}`}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <Navigation size={24} style={{ color: hudColor }} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Navigation Systems</h2>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-1 block">
                            {manufacturer} Guidance v4.2
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} className="text-zinc-400" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-4">
                    {['all', 'planet', 'station'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all border ${filter === f ? `bg-[${hudColor}] text-black border-transparent` : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30'}`}
                            style={filter === f ? { backgroundColor: hudColor, color: '#000' } : {}}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-3 content-start">
                    {items.map((item: any) => (
                        <button 
                            key={item.id}
                            onClick={() => { onSetTarget(item.id); onClose(); }}
                            className="flex items-center gap-4 p-4 bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/20 rounded-lg text-left transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform" style={{ borderColor: hudColor }}>
                                {item.type === 'Station' ? <Anchor size={16} color={hudColor} /> : <Globe size={16} color={hudColor} />}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-[color:var(--hud-color)]" style={{ '--hud-color': hudColor } as any}>{item.name}</div>
                                <div className="text-[10px] text-zinc-500 font-mono uppercase">{item.type} • {formatDistance(item.distance)}</div>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <Crosshair size={16} color={hudColor} />
                            </div>
                        </button>
                    ))}
                </div>

            </motion.div>
        </div>
    );
};

// --- 5. MAIN HUD COMPONENT ---

export function SpaceshipHUD({ active }: SpaceshipHUDProps) {
    const { 
        setDockedAt, generateJobsForLocation, updateFuel, updateBoost, 
        findBody, saveGame, credits, currentShip, activeJob, miningState, currentData
    } = useSimulation();
    
    // ... (Existing State) ...
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

    const [isCockpitMode, setIsCockpitMode] = useState(false);
    const [miningHeat, setMiningHeat] = useState(0);
    const [isOverheated, setIsOverheated] = useState(false);

    const [isBooting, setIsBooting] = useState(false);
    const [bootPhase, setBootPhase] = useState(0);
    
    // NEW: Navigation UI State
    const [isNavOpen, setIsNavOpen] = useState(false);

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

    const dispatchControl = useCallback((type: string, payload?: any) => {
        window.dispatchEvent(new CustomEvent(SPACESHIP_CONTROL_EVENT, { detail: { type, ...payload } }));
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
            
            setMiningHeat(e.detail.miningHeat || 0);
            setIsOverheated(e.detail.isOverheated || false);
            setIsCockpitMode(e.detail.isCockpitMode || false);

            if (e.detail.shipQuat) shipQuat.current.copy(e.detail.shipQuat);
        };
        const handleDockCommand = (e: any) => { if (e.detail.type === 'ATTEMPT_DOCK') handleDock(); };
        // NEW: Listen for open-nav
        const handleOpenNav = () => setIsNavOpen(true);

        window.addEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
        window.addEventListener(SPACESHIP_CONTROL_EVENT, handleDockCommand);
        window.addEventListener('spaceship-open-nav', handleOpenNav);
        
        return () => {
            window.removeEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
            window.removeEventListener(SPACESHIP_CONTROL_EVENT, handleDockCommand);
            window.removeEventListener('spaceship-open-nav', handleOpenNav);
        };
    }, [active, handleDock]);

    const handleExit = useCallback(() => dispatchControl('EXIT'), [dispatchControl]);

    if (!active) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 pb-8 overflow-hidden font-sans ${isFreeLook || isNavOpen ? 'pointer-events-auto cursor-default' : 'pointer-events-none'}`}>
            <AnimatePresence>
                {isBooting && <IgnitionSequence manufacturer={manufacturer} color={hud.primary} phase={bootPhase} />}
                {isNavOpen && (
                    <NavigationUI 
                        onClose={() => setIsNavOpen(false)}
                        currentData={currentData}
                        manufacturer={manufacturer}
                        hudColor={hud.primary}
                        onSetTarget={(id: string) => dispatchControl('SET_TARGET', { targetId: id })}
                    />
                )}
            </AnimatePresence>

            {isCockpitMode && active && (
                <CockpitOverlay 
                    manufacturer={manufacturer} 
                    speed={speed} 
                    fuel={fuel} 
                    boost={boost} 
                    heat={miningHeat} 
                    overheated={isOverheated}
                    color={hud.primary} 
                />
            )}

            {!isBooting && active && !isNavOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 pointer-events-none flex flex-col items-center justify-between p-6 pb-8">
                    
                    {/* TOP BAR */}
                    <div className="w-full flex justify-between items-start pointer-events-none">
                        <BrandedLogo manufacturer={manufacturer} />
                        <div className="flex flex-col items-center gap-2">
                            <FreeLookAlert active={isFreeLook} />
                            <PrecisionAlert isPrecision={isPrecision} />
                            <WalletDisplay credits={credits} color={hud.primary} />
                        </div>
                        <div className="flex flex-col gap-1.5 pointer-events-auto">
                            <ControlButton icon={LogOut} label="Exit" onClick={handleExit} alert hotkey="ESC" />
                            <ControlButton icon={Pickaxe} label={miningState.isMining ? "Active" : "Mine"} onClick={() => dispatchControl('MINING')} active={miningState.isMining} color="#a855f7" hotkey="M" />
                            <ControlButton icon={Navigation} label="Nav" onClick={() => setIsNavOpen(true)} color={hud.primary} />
                            <span className="text-[7px] text-zinc-600 uppercase font-black tracking-widest text-right mt-2">Cockpit: V</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full" />

                    {/* BOTTOM BAR - HIDE IN COCKPIT MODE as it has its own instruments */}
                    {!isCockpitMode && (
                        <div className="w-full flex justify-between items-end pointer-events-none">
                            
                            {/* LEFT CLUSTER: TARGETING COMPUTER (Moved from Center) */}
                            <div className="flex flex-col gap-2 pointer-events-auto scale-[1.05] origin-bottom-left">
                                <TargetingComputer 
                                    manufacturer={manufacturer} 
                                    hud={hud} 
                                    shipName={shipName} 
                                    targetName={targetName} 
                                    isOrbiting={isOrbiting} 
                                    canOrbit={canOrbit} 
                                    inDockingRange={inDockingRange} 
                                    onDock={handleDock} 
                                    onOrbit={() => dispatchControl('ENGAGE_ORBIT')} 
                                    onOpenNav={() => setIsNavOpen(true)}
                                />
                                <div className="flex gap-1.5">
                                    <ControlButton icon={Plane} label="FA" onClick={() => dispatchControl('TOGGLE_FA')} active={flightAssist} hotkey="Z" />
                                    <ControlButton icon={Crosshair} label="P-Mode" onClick={() => dispatchControl('TOGGLE_PRECISION')} active={isPrecision} color="#60a5fa" hotkey="P" />
                                </div>
                            </div>

                            {/* CENTER CLUSTER: SPEEDOMETER (Redesigned as Central Module) */}
                            <div className="flex flex-col items-center pointer-events-auto mb-2">
                                <ShipModelBadge manufacturer={manufacturer} name={shipName} color={hud.primary} />
                                <Speedometer manufacturer={manufacturer} speed={speed} hud={hud} />
                            </div>

                            {/* RIGHT CLUSTER: LOGISTICS */}
                            <div className="flex flex-col gap-2 pointer-events-auto items-end scale-[1.05] origin-bottom-right">
                                <ResourceGauge manufacturer={manufacturer} fuel={fuel} maxFuel={maxFuel} boost={boost} maxBoost={maxBoost} isBoosting={isBoosting} hud={hud} />
                                <div className="flex justify-between w-full min-w-[130px] border-t border-white/10 pt-1.5 mt-1 bg-black/60 backdrop-blur-md rounded-xl p-3">
                                    <span className="text-[8px] font-bold text-zinc-600 uppercase italic">Arrival</span>
                                    <span className="text-[8px] font-black text-zinc-400 tabular-nums uppercase">{getEta()}</span>
                                </div>
                                <div className="mt-1">
                                    <ControlButton icon={Navigation} label="Autopilot" onClick={() => dispatchControl('TOGGLE_AUTOPILOT')} active={autopilot} color="#60a5fa" hotkey="C" />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* HEAT GAUGE */}
                    {!isCockpitMode && (
                         <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
                             <MiningGauge heat={miningHeat} overheated={isOverheated} />
                         </div>
                    )}

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