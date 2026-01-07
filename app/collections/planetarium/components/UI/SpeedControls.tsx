'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, EyeOff, Tag, Crosshair, Rocket, CalendarCheck, Lock, Pickaxe
} from 'lucide-react';
import * as THREE from 'three';
import { useSimulation, MINING_LOCATIONS, SPACESHIP_UPDATE_EVENT, getOrbitalPosition } from '../../context';

interface SpeedControlsProps {
    showOrbits: boolean;
    setShowOrbits: (value: boolean) => void;
    showLabels: boolean;
    setShowLabels: (value: boolean) => void;
    showSolarWind: boolean;
    setShowSolarWind: (value: boolean) => void;
    handleRecenter: () => void;
    isSpaceshipMode: boolean;
    setIsSpaceshipMode: (value: boolean) => void;
}

export function SpeedControls({
    showOrbits,
    setShowOrbits,
    showLabels,
    setShowLabels,
    showSolarWind,
    setShowSolarWind,
    handleRecenter,
    isSpaceshipMode,
    setIsSpaceshipMode
}: SpeedControlsProps) {
    const { speed, setSpeed, resetTime, setTime, simulationTime, user, miningState, startMining, stopMining, findBody, activeSystem, currentShip, timeRef, currentData } = useSimulation();
    const [dateInputOpen, setDateInputOpen] = useState(false);
    const [showLoginHint, setShowLoginHint] = useState(false);
    const [showMiningHint, setShowMiningHint] = useState(false);
    
    const [canMine, setCanMine] = useState(false);
    const [nearestMiningZone, setNearestMiningZone] = useState<string | null>(null);
    const [distFromSun, setDistFromSun] = useState<number>(0);

    // Monitor ship position for mining zones
    useEffect(() => {
        if (!isSpaceshipMode) return;

        const handleUpdate = (e: any) => {
            if (e.detail.shipPos) {
                const shipPos = new THREE.Vector3(e.detail.shipPos.x, e.detail.shipPos.y, e.detail.shipPos.z);
                const distFromCenter = shipPos.length();
                setDistFromSun(Math.floor(distFromCenter));
                
                let foundZone = null;

                // 1. Check Generic Zones (Radius based)
                if (distFromCenter > 300 && distFromCenter < 600) {
                    foundZone = 'asteroid_belt';
                } else if (distFromCenter > 5800 && distFromCenter < 8500) {
                    foundZone = 'kuiper_belt';
                }

                // 2. Check Specific Bodies
                if (!foundZone) {
                    for (const zoneId of MINING_LOCATIONS) {
                        const body = findBody(zoneId);
                        if (body) {
                            // Use timeRef for instant check without re-render lag
                            let bodyPos = getOrbitalPosition(body, timeRef.current);
                            
                            // Check if body has a parent (is a moon)
                            const parent = currentData.find(p => p.moons?.some(m => m.id === body.id));
                            if (parent) {
                                bodyPos.add(getOrbitalPosition(parent, timeRef.current));
                            }

                            const dist = shipPos.distanceTo(bodyPos);
                            // Mining range 500 units
                            if (dist < 500) {
                                foundZone = zoneId;
                                break;
                            }
                        }
                    }
                }
                
                if (foundZone) {
                    setCanMine(true);
                    setNearestMiningZone(foundZone);
                } else {
                    setCanMine(false);
                    setNearestMiningZone(null);
                }
            }
        };

        window.addEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
        return () => window.removeEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
    }, [isSpaceshipMode, findBody, timeRef]);

    const handleRocketClick = () => {
        if (!user) {
            setShowLoginHint(true);
            setTimeout(() => setShowLoginHint(false), 2500);
        } else {
            setIsSpaceshipMode(!isSpaceshipMode);
        }
    };

    const handleMiningToggle = () => {
        if (miningState.isMining) {
            stopMining();
        } else if (canMine && nearestMiningZone) {
            startMining(nearestMiningZone);
        } else {
            // Show hint
            setShowMiningHint(true);
            setTimeout(() => setShowMiningHint(false), 4000);
        }
    };

    const handleDateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const dateStr = formData.get('date') as string;
        if (dateStr) {
            const timestamp = new Date(dateStr).getTime();
            if (!isNaN(timestamp)) {
                setTime(timestamp);
                setSpeed(1);
                setDateInputOpen(false);
            }
        }
    };

    const speedOptions = [
        { v: 1, l: 'LIVE' },
        { v: 100, l: '100x' },
        { v: 10000, l: '10kx' },
        { v: 100000, l: '100kx' },
        { v: 1000000, l: '1Mx' }
    ];
    
    return (
        <>
            <AnimatePresence>
                {dateInputOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 border border-white/20 p-3 rounded-xl shadow-2xl flex flex-col items-center gap-2"
                    >
                        <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Jump to Date</div>
                        <form onSubmit={handleDateSubmit} className="flex gap-2">
                            <input
                                type="date"
                                name="date"
                                className="bg-black text-white text-xs p-2 rounded border border-zinc-700 outline-none focus:border-[#DFFF00]"
                                defaultValue={new Date(simulationTime).toISOString().split('T')[0]}
                            />
                            <button
                                type="submit"
                                className="bg-[#DFFF00] text-black text-xs font-bold px-3 rounded hover:bg-white transition-colors"
                            >
                                GO
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Login Required Tooltip */}
                {showLoginHint && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-24 left-4 z-[70] bg-red-900/90 border border-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg pointer-events-none"
                    >
                        Login Required for Flight Systems
                    </motion.div>
                )}
                
                {/* Mining Hint Tooltip */}
                {showMiningHint && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-24 left-16 z-[70] bg-zinc-800/90 border border-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg pointer-events-none w-64"
                    >
                        <div className="uppercase tracking-widest text-purple-400 mb-1">Scanner Offline</div>
                        No mineable resources detected nearby.
                        <br />
                        <span className="text-zinc-400 font-normal">
                            Try navigating to the <strong>Asteroid Belt</strong> (300-600 Units) or <strong>Kuiper Belt</strong> (&gt;5800 Units).
                        </span>
                        <div className="mt-2 text-[10px] text-zinc-500 border-t border-zinc-700 pt-1">
                            Current Solar Distance: <span className="text-white">{distFromSun} Units</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed bottom-8 md:bottom-12 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 bg-black/70 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-x-auto [&::-webkit-scrollbar]:hidden touch-pan-x">
                    <div className="flex items-center gap-1 pr-1">

                        {/* ROCKET BUTTON - LOCKED FOR GUESTS */}
                        <button
                            onClick={handleRocketClick}
                            className={`p-3 rounded-full transition-all relative ${
                                isSpaceshipMode
                                    ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.5)]'
                                    : (user ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-zinc-600 bg-white/5 cursor-not-allowed')
                            }`}
                        >
                            {user ? <Rocket size={18} /> : <Lock size={18} />}
                        </button>

                        {/* MINING BUTTON - Always visible if ship has mining capabilities */}
                        {isSpaceshipMode && (currentShip.miningCap || 0) > 0 && (
                             <button
                                onClick={handleMiningToggle}
                                className={`p-3 rounded-full transition-all relative ${
                                    miningState.isMining
                                        ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse'
                                        : canMine 
                                            ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white'
                                            : 'bg-zinc-800/50 text-zinc-600 hover:text-zinc-500' // Disabled/Scanning look
                                }`}
                            >
                                <Pickaxe size={18} className={!canMine && !miningState.isMining ? "opacity-50" : ""} />
                            </button>
                        )}

                        <div className="w-px h-6 bg-white/20 mx-1" />
                        <button
                            onClick={() => setShowOrbits(!showOrbits)}
                            className={`p-3 rounded-full transition-all ${showOrbits ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                        >
                            {showOrbits ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                            onClick={() => setShowLabels(!showLabels)}
                            className={`p-3 rounded-full transition-all ${showLabels ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <Tag size={18} />
                        </button>
                        <button
                            onClick={() => setShowSolarWind(!showSolarWind)}
                            className={`p-3 rounded-full transition-all ${showSolarWind ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.5)]' : 'text-zinc-400 hover:text-[#DFFF00] hover:bg-white/10'}`}
                        >
                            <div className="w-4 h-4 rounded-full border border-current opacity-50" />
                        </button>
                        <button
                            onClick={handleRecenter}
                            className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        >
                            <Crosshair size={18} />
                        </button>
                    </div>
                    <div className="w-px h-8 bg-white/20 mx-1" />
                    <div className="flex items-center gap-2 pl-1 relative">
                        <button
                            onClick={resetTime}
                            className="p-3 rounded-full hover:bg-white/10 text-[#DFFF00] transition-colors shrink-0"
                        >
                            <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent -rotate-45" />
                        </button>
                        <button
                            onClick={() => setDateInputOpen(!dateInputOpen)}
                            className={`p-3 rounded-full transition-colors shrink-0 ${dateInputOpen ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <CalendarCheck size={18} />
                        </button>
                        {speedOptions.map((opt) => (
                            <button
                                key={opt.v}
                                onClick={() => setSpeed(opt.v)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold transition-all whitespace-nowrap shrink-0 ${
                                    speed === opt.v ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}