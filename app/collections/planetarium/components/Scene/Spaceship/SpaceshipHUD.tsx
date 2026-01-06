'use client';

// app/collections/planetarium/components/Scene/Spaceship/SpaceshipHUD.tsx

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
    Zap, Compass, Target, RefreshCw, Gauge, ArrowRightCircle, 
    Plane, AlertCircle, Fuel, Crosshair, AlertTriangle, Lock, 
    Wallet, Navigation 
} from 'lucide-react';
import { useSimulation } from '../../../context';
import {
    SPACESHIP_UPDATE_EVENT,
    SPACESHIP_CONTROL_EVENT,
    NO_LANDING_IDS,
    DOCKING_RANGE,
    formatDistance
} from './constants';

interface SpaceshipHUDProps {
    active: boolean;
}

export function SpaceshipHUD({ active }: SpaceshipHUDProps) {
    const { 
        setDockedAt, 
        generateJobsForLocation, 
        updateFuel, 
        updateBoost, 
        findBody, 
        saveGame, 
        credits, 
        currentShip, 
        activeJob 
    } = useSimulation();
    
    const [speed, setSpeed] = useState(0);
    const [boost, setBoost] = useState(currentShip.maxBoost);
    const [fuel, setFuel] = useState(currentShip.maxFuel);
    const [maxFuel, setMaxFuel] = useState(currentShip.maxFuel);
    const [maxBoost, setMaxBoost] = useState(currentShip.maxBoost);
    const [shipName, setShipName] = useState(currentShip.name);
      
    const [isBoosting, setIsBoosting] = useState(false);
    const [isPrecision, setIsPrecision] = useState(false);
    const [flightAssist, setFlightAssist] = useState(true);
    const [canOrbit, setCanOrbit] = useState(false);
    const [isOrbiting, setIsOrbiting] = useState(false);
    const [autopilot, setAutopilot] = useState(false); 
    const [cruise, setCruise] = useState(0);
    const [reticlePos, setReticlePos] = useState({ x: 0, y: 0 });
    const [isLocked, setIsLocked] = useState(false);
    const [targetAltitude, setTargetAltitude] = useState(0); 
    const [targetDist, setTargetDist] = useState(0);
    const [targetRadius, setTargetRadius] = useState(0);
    const [targetId, setTargetId] = useState<string | null>(null);

    const shipQuat = useRef(new THREE.Quaternion());

    const targetBody = findBody(targetId);
    const targetName = targetBody ? targetBody.name : 'TARGET';
    const isNoLandingZone = targetId ? NO_LANDING_IDS.includes(targetId) : false;
    
    const inDockingRange = targetAltitude < DOCKING_RANGE;
    const maxOrbitRange = Math.max(15000, targetRadius * 25);
    const inOrbitRange = targetDist < maxOrbitRange;

    const hud = currentShip.hud || { 
        primary: '#DFFF00', 
        secondary: '#ffffff', 
        alert: '#ef4444', 
        shape: 'rounded', 
        fontParams: '' 
    };
    const shapeClass = hud.shape === 'angular' 
        ? 'rounded-none clip-path-polygon-[10%_0,100%_0,100%_100%,0_100%,0_20%]' 
        : hud.shape === 'blocky' 
            ? 'rounded-sm' 
            : 'rounded-t-3xl';
    const btnShape = hud.shape === 'angular' 
        ? 'rounded-none' 
        : hud.shape === 'blocky' 
            ? 'rounded-sm' 
            : 'rounded-l-full rounded-tr-lg';

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
            setFlightAssist(e.detail.flightAssist);
            setCanOrbit(e.detail.canOrbit);
            setIsOrbiting(e.detail.isOrbiting);
            setAutopilot(e.detail.autopilot);
            setCruise(e.detail.cruise);
            setReticlePos({ x: e.detail.mouseX, y: e.detail.mouseY });
            if(e.detail.targetId) setTargetId(e.detail.targetId);
            setIsLocked(e.detail.isLocked || false);
            setTargetAltitude(e.detail.targetAltitude || 0); 
            setTargetDist(e.detail.targetDist || 0);
            setTargetRadius(e.detail.targetRadius || 0);
            
            if (e.detail.shipQuat) {
                shipQuat.current.copy(e.detail.shipQuat);
            }
        };
        window.addEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
        return () => window.removeEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
    }, [active]);

    const dispatchControl = (type: string) => {
        window.dispatchEvent(new CustomEvent(SPACESHIP_CONTROL_EVENT, { detail: { type } }));
    };
    
    const handleDock = () => {
        if (targetId && !isNoLandingZone && inDockingRange && targetBody) {
            updateFuel(fuel); 
            updateBoost(boost); 
            generateJobsForLocation(targetId);
            
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(shipQuat.current);
            const offset = direction.multiplyScalar(-targetDist); 
            
            setDockedAt(targetId, { x: offset.x, y: offset.y, z: offset.z });
            saveGame(); 
        }
    };

    if (!active) return null;

    return (
        <div className={`fixed inset-0 z-[45] pointer-events-none flex flex-col justify-end items-center pb-0 overflow-hidden ${hud.fontParams}`}>
            {/* Wallet Display */}
            <div className="absolute top-32 right-6 flex items-center gap-2 pointer-events-auto">
                <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border-r-2 flex items-center gap-3" style={{ borderColor: hud.primary }}>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Credits</span>
                        <span className="text-lg font-mono text-white font-bold leading-none">{credits.toLocaleString()}</span>
                    </div>
                    <Wallet size={16} style={{ color: hud.primary }} />
                </div>
            </div>

            <div className={`relative mb-32 flex items-end gap-6 transition-transform duration-100 pointer-events-auto ${isBoosting ? 'scale-105 translate-y-1' : ''}`}>
                
                {/* LEFT CLUSTER: Ship Status */}
                <div className="flex flex-col items-end gap-2 pb-2">
                     <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest opacity-80" style={{ color: hud.secondary }}>
                         <span>{shipName}</span>
                         <Compass size={12} />
                     </div>
                    <div className="flex flex-col gap-1 items-end">
                         {/* FUEL GAUGE */}
                         <div className={`flex items-center gap-2 px-3 py-1.5 border-b-2 bg-zinc-900/90 mb-1 ${btnShape}`} style={{ borderColor: fuel < 500 ? hud.alert : 'rgb(63 63 70)' }}>
                            <Fuel size={14} className={fuel < 500 ? "animate-pulse" : ""} style={{ color: fuel < 500 ? hud.alert : hud.secondary }} />
                            <div className="flex flex-col items-end leading-none">
                                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                                    <div className="h-full transition-all duration-300" style={{ width: `${(fuel/maxFuel)*100}%`, backgroundColor: fuel < 500 ? hud.alert : hud.primary }} />
                                </div>
                                <span className="text-[8px] opacity-60 mt-0.5" style={{ color: hud.secondary }}>PROPELLANT</span>
                            </div>
                         </div>
                        
                        {/* FLIGHT ASSIST TOGGLE */}
                        <button 
                            onClick={() => dispatchControl('TOGGLE_FA')} 
                            className={`flex items-center gap-2 px-4 py-1.5 border-b-2 transition-all ${btnShape} ${flightAssist ? 'bg-zinc-800/80' : 'bg-red-900/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}
                            style={{ borderColor: flightAssist ? 'rgb(82 82 91)' : hud.alert }}
                        >
                            <Plane size={14} className={flightAssist ? "" : "rotate-12"} style={{ color: flightAssist ? hud.secondary : hud.alert }} />
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-[9px] font-bold tracking-widest" style={{ color: flightAssist ? hud.secondary : '#fca5a5' }}>
                                    {flightAssist ? 'FA ON' : 'FA OFF'}
                                </span>
                                <span className="text-[8px] opacity-60" style={{ color: hud.secondary }}>KEY Z</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* CENTER CLUSTER: Speedometer */}
                <div className="flex flex-col items-center">
                    {/* PRECISION MODE INDICATOR (MOVED TO TOP) */}
                    {isPrecision && (
                        <div className="absolute -top-10 flex items-center justify-center gap-1.5 font-bold text-[9px] tracking-[0.2em] animate-in fade-in slide-in-from-bottom-2 p-1.5 rounded bg-blue-900/50 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-20" style={{ color: '#60A5FA' }}>
                            <Crosshair size={10} />
                            <div>PRECISION ENGAGED</div>
                        </div>
                    )}

                    <div 
                        className={`relative flex flex-col items-center bg-black/80 backdrop-blur-xl px-14 py-5 border-t-2 border-x z-10 transition-colors duration-300 ${shapeClass}`}
                        style={{ 
                            borderColor: isPrecision ? '#60A5FA' : hud.primary,
                            boxShadow: isPrecision ? '0 -10px 40px rgba(59,130,246,0.3)' : `0 -10px 40px ${hud.primary}30`
                        }}
                    >
                        <div className="absolute top-2 w-12 h-1 rounded-full transition-colors duration-300" style={{ backgroundColor: isPrecision ? '#60A5FA50' : `${hud.primary}50` }} />
                        <div className="flex items-baseline gap-2 mt-1">
                            <span 
                                className="text-6xl font-black tabular-nums tracking-tighter"
                                style={{ 
                                    color: isBoosting ? '#00FFFF' : 'white',
                                    textShadow: isBoosting ? '0 0 15px #00FFFF' : 'none'
                                }}
                            >
                                {speed.toFixed(0)}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold font-mono" style={{ color: hud.secondary }}>KM/S</span>
                                <span className="text-[8px] opacity-50 font-bold" style={{ color: hud.secondary }}>TAB: PRECISION</span>
                            </div>
                        </div>
                        
                        {!flightAssist && <div className="absolute top-4 right-4 animate-pulse" style={{ color: hud.alert }}><AlertCircle size={12} /></div>}
                        {fuel <= 0 && <div className="absolute top-4 left-4 animate-pulse font-bold text-[10px] tracking-widest border px-1 rounded" style={{ color: hud.alert, borderColor: hud.alert }}>EMPTY</div>}
                    </div>
                    
                    {/* BOOST BAR */}
                    <div className="w-[340px] h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative mt-[-2px] z-10 shadow-lg">
                        <div 
                            className={`h-full transition-all duration-100 ease-linear ${isBoosting ? 'shadow-[0_0_20px_#00FFFF]' : ''}`} 
                            style={{ 
                                width: `${(boost/maxBoost)*100}%`, 
                                backgroundColor: isBoosting ? '#00FFFF' : (isPrecision ? '#60A5FA' : hud.primary) 
                            }} 
                        />
                        {cruise > 0 && <div className="absolute top-0 bottom-0 w-1 bg-white mix-blend-difference" style={{ left: `${(cruise / currentShip.cruiseSpeed) * 100}%` }} />}
                    </div>
                    <div className="flex flex-col items-center mt-[-1px]"><div className="w-[300px] h-4 bg-gradient-to-b from-black/80 to-transparent border-x border-white/5 clip-path-polygon-[0_0,100%_0,80%_100%,20%_100%]" /></div>
                    <div className="absolute -bottom-8 flex items-center gap-4">
                        {cruise > 0 && <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-500/30"><Gauge size={10} />CRUISE: {(cruise * 100).toFixed(0)}%</div>}
                    </div>
                </div>

                {/* RIGHT CLUSTER: Targeting/Docking + AUTOPILOT */}
                <div className="flex flex-col items-start gap-2 pb-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold tracking-wider transition-colors" style={{ color: isBoosting ? '#00FFFF' : hud.secondary }}>
                        <Zap size={12} className={isBoosting ? 'animate-pulse' : ''} />
                        INJECTOR
                    </div>

                    <div className="flex flex-col gap-1 items-start">
                        {/* AUTOPILOT TOGGLE */}
                        <button 
                            onClick={() => dispatchControl('TOGGLE_AUTOPILOT')} 
                            disabled={!activeJob}
                            className={`flex items-center gap-2 px-4 py-1.5 border-b-2 transition-all ${btnShape === 'rounded-l-full rounded-tr-lg' ? 'rounded-r-full rounded-tl-lg' : 'rounded-sm'} 
                                ${autopilot 
                                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                    : (activeJob ? 'bg-zinc-900/80 text-zinc-500 border-zinc-700 hover:text-white' : 'bg-zinc-900/50 text-zinc-700 border-zinc-800 cursor-not-allowed')}`}
                        >
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[9px] font-bold tracking-widest">
                                    {autopilot ? 'AUTOPILOT ON' : 'AUTOPILOT'}
                                </span>
                                <span className="text-[8px] opacity-60">KEY C</span>
                            </div>
                            <Navigation size={14} className={autopilot ? "animate-pulse" : ""} />
                        </button>

                        <div className="h-10 flex items-center min-w-[120px]">
                            {isOrbiting ? (
                                <div className="flex gap-1">
                                    <div className={`flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500/50 ${btnShape === 'rounded-l-full rounded-tr-lg' ? 'rounded-l-lg' : 'rounded-sm'}`}>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[9px] font-bold tracking-widest">ORBIT STABLE</span>
                                        </div>
                                        <RefreshCw size={14} className="animate-spin" />
                                    </div>
                                    
                                    {isNoLandingZone ? (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-r-full bg-red-900/50 text-red-300 border-b-2 border-red-500/50">
                                            <div className="flex flex-col items-start leading-none">
                                                <span className="text-[9px] font-bold tracking-widest">HAZARD</span>
                                            </div>
                                            <AlertTriangle size={14} />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleDock}
                                            disabled={!inDockingRange}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-r-full text-black border-b-2 transition-all 
                                                ${inDockingRange 
                                                    ? `hover:bg-white hover:scale-105 active:scale-95 cursor-pointer`
                                                    : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-80'}`}
                                            style={inDockingRange ? { backgroundColor: hud.primary, borderColor: hud.primary } : {}}
                                        >
                                            <div className="flex flex-col items-start leading-none">
                                                <span className="text-[9px] font-bold tracking-widest">
                                                    {inDockingRange ? "DOCK TO" : "RANGE ERROR"}
                                                </span>
                                                <span className="text-[8px] opacity-60">
                                                    {inDockingRange ? targetName : `ALT: ${formatDistance(targetAltitude)}`}
                                                </span>
                                            </div>
                                            {inDockingRange ? <ArrowRightCircle size={14} /> : <AlertTriangle size={14} />} 
                                        </button>
                                    )}
                                </div>
                            ) : canOrbit ? (
                                <button
                                    onClick={() => inOrbitRange && dispatchControl('ENGAGE_ORBIT')}
                                    disabled={!inOrbitRange}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-r-full rounded-tl-lg border-b-2 transition-all animate-in fade-in slide-in-from-left-4 duration-300`}
                                    style={inOrbitRange ? { 
                                        backgroundColor: `${hud.primary}20`, 
                                        color: hud.primary, 
                                        borderColor: `${hud.primary}80`,
                                        cursor: 'pointer'
                                    } : { 
                                        backgroundColor: 'rgb(24 24 27)', 
                                        color: 'rgb(82 82 91)', 
                                        borderColor: 'rgb(39 39 42)',
                                        cursor: 'not-allowed'
                                    }}
                                >
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[9px] font-bold tracking-widest flex items-center gap-1">
                                            {isLocked ? <><Lock size={9} /> LOCKED TARGET</> : "ENGAGE ORBIT"}
                                        </span>
                                        <span className="text-[8px] opacity-60">
                                            {inOrbitRange ? (isLocked ? targetName : "KEY O") : "TOO FAR"}
                                        </span>
                                    </div>
                                    <Target size={14} />
                                </button>
                            ) : (
                                <div className="px-4 py-2 rounded-r-full rounded-tl-lg border-b-2 border-zinc-800 bg-black/40 backdrop-blur-md text-zinc-700">
                                    <span className="text-[9px] font-bold tracking-widest">NO TARGET</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* RETICLE */}
            <div className="absolute pointer-events-none transition-all duration-75 ease-out" style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${reticlePos.x * window.innerWidth / 2}px), calc(-50% + ${-reticlePos.y * window.innerHeight / 2}px))` }}>
                 <div className="w-8 h-8 border rounded-full flex items-center justify-center transition-colors duration-300" style={{ borderColor: isBoosting ? '#00FFFF' : (isPrecision ? '#60A5FA' : hud.primary) }}>
                    <div className="w-1 h-1 rounded-full transition-colors duration-300" style={{ backgroundColor: isBoosting ? '#00FFFF' : (isPrecision ? '#60A5FA' : hud.primary), boxShadow: isBoosting ? '0 0 10px #00FFFF' : 'none' }} />
                 </div>
            </div>
            
            {/* GUIDE LINE */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="50%" y1="50%" x2={50 + (reticlePos.x * 50) + '%'} y2={50 - (reticlePos.y * 50) + '%'} stroke="white" strokeDasharray="4 4" />
            </svg>
            
            {/* CENTER CIRCLE */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15vh] h-[15vh] border border-white/5 rounded-full pointer-events-none" />
        </div>
    );
}
