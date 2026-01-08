'use client';

import React, { useRef, useState, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ArrowLeft, Search, Lock } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- DIRECT IMPORTS ---
import { SimulationProvider, useSimulation, TimeKeeper, J2000_EPOCH, SPACESHIP_EXIT_EVENT } from './context';
import { StarBackground, SolarWind, AsteroidBelt } from './components/Scene/Environment';
import { GravityWellGrid } from './components/Scene/GravityWellGrid';
import { Sun } from './components/Scene/StellarBodies';
import { Planet } from './components/Scene/PlanetarySystem';
import { SpaceshipController, SpaceshipHUD } from './components/Scene/Spaceship';
import { AsteroidField } from './components/Scene/AsteroidField';
import { SystemControls } from './components/Controls'; 
import { FantasyContent } from './components/FantasyScene';

import { CinematicDirector } from './components/Cinematic/Director';
import { CinematicOverlay } from './components/Cinematic/Overlay';
import { FlightComputer } from './components/Cinematic/FlightComputer';
import { generateCommercialFlight } from './components/Cinematic/utils';
import type { OverlayData, FlightData } from './components/Cinematic/types';

import { DetailPanel, SystemFinder, SpeedControls, CinematicMenu, JobBoard, MissionHUD, JobCompleteOverlay, NavigationComputer, MiningOverlay, SceneTransition } from './components/UI';

function TimeDisplay() {
    const { simulationTime, activeSystem } = useSimulation();
    return (
        <div className="mt-1 md:mt-2 text-zinc-500 font-mono text-[10px] md:text-xs" suppressHydrationWarning>
            {activeSystem === 'fantasy' ? 'ZINC PRIME TIME' : ''} {new Date(simulationTime).toLocaleDateString()} {new Date(simulationTime).toLocaleTimeString()}
        </div>
    );
}

function PlanetariumContent() {
    const { setTime, setSpeed, activeSystem, currentData, dockedAt, setDockedAt, lastCompletedJob, isLoadingSave, savedPosition, user } = useSimulation();
    
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null); 
    const [finderOpen, setFinderOpen] = useState(false);
    const [navComputerOpen, setNavComputerOpen] = useState(false);
    
    const [showOrbits, setShowOrbits] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [viewMode, setViewMode] = useState<'standard' | 'wind' | 'gravity'>('standard');
    
    const [isCinematic, setIsCinematic] = useState(false);
    const [isSpaceshipMode, setIsSpaceshipMode] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionText, setTransitionText] = useState("");

    const handleModeSwitch = useCallback((targetMode: boolean, onComplete?: () => void) => {
        setTransitionText(targetMode ? "Establishing Neural Link" : "Disconnecting Link");
        setIsTransitioning(true);
        
        setTimeout(() => {
            setIsSpaceshipMode(targetMode);
            if (onComplete) onComplete();
            
            setTimeout(() => {
                setIsTransitioning(false);
            }, 1200);
        }, 1000);
    }, []);

    const { timeRef, getOrbitalPosition } = useSimulation();

    // Helper to find closest body to a position
    const findClosestBody = useCallback((pos: {x: number, y: number, z: number} | null) => {
        if (!pos) return 'earth';
        let closestId = 'earth';
        let minSelfDist = Infinity;
        const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);
        
        currentData.forEach(body => {
            let bPos = getOrbitalPosition(body, timeRef.current);
            const d = currentPos.distanceTo(bPos);
            if (d < minSelfDist) {
                minSelfDist = d;
                closestId = body.id;
            }
            if (body.moons) {
                body.moons.forEach((m: any) => {
                    const mPos = getOrbitalPosition(m, timeRef.current).add(bPos);
                    const md = currentPos.distanceTo(mPos);
                    if (md < minSelfDist) {
                        minSelfDist = md;
                        closestId = m.id;
                    }
                });
            }
        });
        return closestId;
    }, [currentData, getOrbitalPosition, timeRef]);

    const [cinematicKey, setCinematicKey] = useState(0); 
    const [cinematicOverlay, setCinematicOverlay] = useState<OverlayData>({ show: false });
    const [flightData, setFlightData] = useState<FlightData>({ active: false });
    const [currentTourId, setCurrentTourId] = useState('grand_tour');

    const planetRefs = useRef<Record<string, THREE.Object3D>>({});
    const initialLoadRef = useRef(false);
    const prevDocked = useRef(!!dockedAt);

    useEffect(() => {
        setSelectedId(null);
        setFinderOpen(false);
    }, [activeSystem]);

    useEffect(() => {
        const handleOpenNav = () => setNavComputerOpen(true);
        const handleExitShip = (e: any) => {
            const closestId = e.detail?.closestBodyId;
            handleModeSwitch(false, () => {
                if (closestId) {
                    setDockedAt(closestId);
                }
            });
        };
        
        window.addEventListener('spaceship-open-nav', handleOpenNav);
        window.addEventListener(SPACESHIP_EXIT_EVENT, handleExitShip);
        
        return () => {
            window.removeEventListener('spaceship-open-nav', handleOpenNav);
            window.removeEventListener(SPACESHIP_EXIT_EVENT, handleExitShip);
        };
    }, [handleModeSwitch, setDockedAt]);

    useEffect(() => {
        if (isCinematic) setIsSpaceshipMode(false);
    }, [isCinematic]);

    // Force Spaceship Mode off if docked
    useEffect(() => {
        if (dockedAt) {
            setIsSpaceshipMode(false);
        }
    }, [dockedAt]);

    // AUTO-RESUME & INTRO LOGIC
    useEffect(() => {
        if (isLoadingSave) return;

        // 1. Initial Load Logic
        if (!initialLoadRef.current) {
            initialLoadRef.current = true;

            // Always play Intro for Solar System on first entry
            if (activeSystem === 'solar') {
                setIsCinematic(true);
                setCurrentTourId('intro_reveal');
                setCinematicKey(k => k + 1);
                setCinematicOverlay({ show: false });
                setFlightData({ active: false });
            } 
        }
        
        // 2. Undocking Logic: If we just undocked manually, trigger flight transition
        if (user) {
            const wasDocked = prevDocked.current;
            const isDocked = !!dockedAt;
            
            if (wasDocked && !isDocked && !isCinematic) {
                // User clicked "Undock" or "Launch"
                handleModeSwitch(true);
            }
            prevDocked.current = isDocked;
        }
    }, [isLoadingSave, activeSystem, dockedAt, savedPosition, isCinematic, user, handleModeSwitch]);


    const handleSelect = useCallback((id: string | null) => {
        if (isCinematic) return;
        setSelectedId(id);
        setFinderOpen(false);
    }, [isCinematic]);

    // Update handleRocketClick logic via setIsSpaceshipMode prop
    const handleRocketToggle = useCallback((targetMode: boolean) => {
        if (targetMode) {
            // Entering flight: find closest body to saved position and dock there first
            const closestId = findClosestBody(savedPosition);
            handleModeSwitch(false, () => {
                setDockedAt(closestId);
            });
        } else {
            // Exiting flight: manual toggle (same as ESC)
            window.dispatchEvent(new CustomEvent(SPACESHIP_CONTROL_EVENT, { detail: { type: 'EXIT' } }));
        }
    }, [findClosestBody, savedPosition, handleModeSwitch, setDockedAt]);

    const handleBackgroundClick = useCallback(() => {
        if (isCinematic) return;
        setSelectedId(null);
        setFinderOpen(false);
    }, [isCinematic]);
    
    const handleRecenter = () => {
        setSelectedId(null);
        setSelectedId(activeSystem === 'solar' ? 'sun' : 'zinc_prime_stars');
        setTimeout(() => setSelectedId(null), 1000);
    };

    const handleJobCompleteExit = useCallback(() => {
        if (lastCompletedJob) {
            setDockedAt(lastCompletedJob.destId);
        }
    }, [lastCompletedJob, setDockedAt]);

    const startCinematic = (tourId: string) => {
        if (activeSystem !== 'solar') return; 
        
        if (tourId === 'random') {
            const randomId = generateCommercialFlight();
            setCurrentTourId(randomId);
            setSpeed(1);
        } else {
            setCurrentTourId(tourId);
            if (tourId === 'grand_tour') {
                setTime(J2000_EPOCH);
                setSpeed(0.5); 
            }
            if (tourId === 'oumuamua_visit') {
                 setTime(1504915200000);
                 setSpeed(0.2); 
            }
        }
        
        setCinematicKey(k => k + 1); 
        setSelectedId(null);
        setFinderOpen(false);
        setIsCinematic(true);
        setIsSpaceshipMode(false); 
        setCinematicOverlay({ show: false });
        setFlightData({ active: false });
    };

    const stopCinematic = () => {
        setIsCinematic(false);
        setCinematicOverlay({ show: false });
        setFlightData({ active: false });
    };

    const scalePositions = useMemo(() => {
        if (currentTourId !== 'scale_comparison') return {};
        const allBodies = [...currentData, ...currentData.flatMap(p => p.moons || [])].filter(b => b.type !== 'Star' && b.type !== 'Black Hole');
        allBodies.sort((a, b) => a.radius - b.radius);
        const posMap: Record<string, THREE.Vector3> = {};
        let currentX = 0;
        allBodies.forEach((body, index) => {
             if (index > 0) {
                 const prevBody = allBodies[index - 1];
                 const gap = (prevBody.radius + body.radius) * 1.2 + Math.max(2, prevBody.radius * 2.0); 
                 currentX += gap;
             }
             posMap[body.id] = new THREE.Vector3(currentX, 0, 0);
        });
        const lastBody = allBodies[allBodies.length - 1];
        if (lastBody) {
            const sunGap = lastBody.radius + 25 + 50; 
            posMap['sun'] = new THREE.Vector3(currentX + sunGap, 0, 0);
        }
        return posMap;
    }, [currentData, currentTourId]);

    const isScaleMode = isCinematic && currentTourId === 'scale_comparison';
    const sunScalePos = isScaleMode && scalePositions['sun'] ? scalePositions['sun'] : new THREE.Vector3(0,0,0);

    if (isLoadingSave) {
        return <div className="w-full h-screen bg-black flex items-center justify-center text-[#DFFF00] font-mono animate-pulse">Initializing Flight Systems...</div>;
    }

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden touch-none">
            <Canvas 
                dpr={[1, 2]} 
                gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
                camera={{ position: [0, 400, 600], fov: 45, far: 1000000 }}
                onPointerMissed={handleBackgroundClick}
            >
                <color attach="background" args={['#000000']} />
                
                <Suspense fallback={null}>
                    <TimeKeeper />
                    
                    <SystemControls 
                        targetId={selectedId} 
                        refs={planetRefs} 
                        isCinematic={isCinematic} 
                        isSpaceshipMode={isSpaceshipMode} 
                    />

                    {isSpaceshipMode && (
                        <SpaceshipController 
                            active={isSpaceshipMode} 
                            lockedTargetId={selectedId} 
                            hoveredTargetId={hoveredId} 
                        />
                    )}

                    {activeSystem === 'fantasy' ? (
                        <FantasyContent 
                            handleSelect={handleSelect} 
                            planetRefs={planetRefs} 
                            showOrbits={showOrbits}
                            showLabels={showLabels}
                        />
                    ) : (
                        <>
                            <CinematicDirector 
                                key={cinematicKey} 
                                active={isCinematic} 
                                tourId={currentTourId}
                                refs={planetRefs} 
                                onStop={stopCinematic}
                                onOverlayUpdate={setCinematicOverlay}
                                onFlightUpdate={setFlightData}
                                loop={currentTourId !== 'intro_reveal'}
                                overridePositions={isScaleMode ? scalePositions : undefined}
                            />
                            
                            <StarBackground />
                            {!isScaleMode && <AsteroidBelt />}
                            {!isScaleMode && (
                                <>
                                    {/* Inner Belt (Main Asteroid Belt) */}
                                    <AsteroidField count={100} minRadius={300} maxRadius={600} />
                                    {/* Outer Belt (Kuiper Belt) */}
                                    <AsteroidField count={100} minRadius={5800} maxRadius={8500} />
                                    {/* Local Body Mining (e.g. Moons/Stations) */}
                                    <AsteroidField count={40} minRadius={20} maxRadius={60} mode="local" />
                                </>
                            )}
                            {!isScaleMode && viewMode === 'wind' && <SolarWind />}
                            {!isScaleMode && viewMode === 'gravity' && <GravityWellGrid />}
                            
                            <group position={sunScalePos}>
                                 <Sun onClick={() => handleSelect('sun')} />
                            </group>
                            <group ref={(ref) => { if(ref) planetRefs.current['sun'] = ref }} position={sunScalePos} />

                            {currentData.filter(p => p.id !== 'sun').map((planet) => (
                                <Planet 
                                    key={planet.id} 
                                    data={planet} 
                                    isSelected={selectedId === planet.id}
                                    selectedId={selectedId}
                                    isSpaceshipMode={isSpaceshipMode}
                                    isCinematic={isCinematic}
                                    showOrbits={showOrbits}
                                    showLabels={showLabels}
                                    scalePosition={scalePositions[planet.id]}
                                    isScaleAlignment={isScaleMode}
                                    allScalePositions={scalePositions}
                                    onClick={(idOverride?: string) => handleSelect(idOverride || planet.id)}
                                    onSelectRef={(id: string, ref: THREE.Object3D) => { planetRefs.current[id] = ref; }}
                                    onHover={setHoveredId} 
                                />
                            ))}
                        </>
                    )}

                    <EffectComposer>
                        <Bloom luminanceThreshold={0.9} mipmapBlur intensity={1.5} radius={0.6} />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                        <Noise opacity={0.02} />
                    </EffectComposer>
                </Suspense>
            </Canvas>

            <MiningOverlay />
            <MissionHUD />
            <JobCompleteOverlay onExit={handleJobCompleteExit} />
            
            <SpaceshipHUD active={isSpaceshipMode} />
            
            {dockedAt && (
                <div className="relative z-[100]">
                    <JobBoard onClose={() => setDockedAt(null)} />
                </div>
            )}

            <CinematicOverlay data={cinematicOverlay} />
            <FlightComputer data={flightData} />

            {!isCinematic && !dockedAt && !isSpaceshipMode && (
                <>
                    <div className="absolute top-0 left-0 w-full z-10 pointer-events-none p-4 md:p-6 pt-safe-top md:pt-6 flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="pointer-events-auto flex items-start justify-between w-full md:w-auto md:block">
                            <div>
                                <Link href="/collections" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[10px] md:text-xs font-mono uppercase tracking-widest mb-1 md:mb-2">
                                    <ArrowLeft size={12} /> Exit Simulation
                                </Link>
                                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl leading-none">
                                    {activeSystem === 'solar' ? 'Solar ' : 'Zinc '} <span className="text-[#DFFF00]">{activeSystem === 'solar' ? 'Map' : 'Prime'}</span>
                                </h1>
                                <TimeDisplay />
                            </div>
                        </div>
                        
                        {!selectedId && (
                            <div className="flex flex-col gap-2 w-full md:w-auto items-end mt-12 md:mt-0">
                                <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 pointer-events-auto w-full md:w-auto items-start">
                                    {activeSystem === 'solar' && (
                                        <div className="flex flex-col gap-1 w-full md:w-auto flex-1 md:flex-initial">
                                            <CinematicMenu onSelectTour={startCinematic} />
                                            {!user && (
                                                <button 
                                                    onClick={() => startCinematic('grand_tour')}
                                                    className="hidden md:flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-[#DFFF00] transition-colors py-1"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                                                    Start: Grand Tour
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setFinderOpen(true)}
                                        className="flex-1 md:flex-initial min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 bg-[#DFFF00] hover:bg-white text-black font-bold uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(223,255,0,0.3)] text-[10px] md:text-xs"
                                    >
                                        <Search size={14} /> <span className="whitespace-nowrap">Browser</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <SpeedControls 
                        showOrbits={showOrbits} setShowOrbits={setShowOrbits}
                        showLabels={showLabels} setShowLabels={setShowLabels}
                        viewMode={viewMode} setViewMode={setViewMode}
                        handleRecenter={handleRecenter}
                        isSpaceshipMode={isSpaceshipMode}
                        setIsSpaceshipMode={handleRocketToggle}
                    />
                </>
            )}

            <SceneTransition active={isTransitioning} text={transitionText} />

            <DetailPanel id={isSpaceshipMode ? null : selectedId} onClose={() => setSelectedId(null)} />
            <SystemFinder isOpen={finderOpen} onClose={() => setFinderOpen(false)} onSelect={handleSelect} />
            <NavigationComputer isOpen={navComputerOpen} onClose={() => setNavComputerOpen(false)} onSelect={handleSelect} />
            
            {isCinematic && (
                <div className="fixed bottom-8 md:bottom-12 w-full text-center pointer-events-auto animate-in fade-in duration-1000 z-50 px-4">
                    <button onClick={stopCinematic} className="group inline-block w-full md:w-auto bg-black/40 hover:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 transition-all cursor-pointer">
                         <div className="flex items-center justify-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <div className="flex flex-col items-start">
                                <span className="text-white font-mono text-xs uppercase tracking-[0.2em] group-hover:text-red-400 transition-colors">Auto-Pilot Engaged</span>
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest hidden md:inline">Click or ESC to Stop</span>
                            </div>
                         </div>
                    </button>
                </div>
            )}
        </div>
    );
}

export default function PlanetariumPage() {
    return (
        <SimulationProvider>
            <PlanetariumContent />
        </SimulationProvider>
    );
}