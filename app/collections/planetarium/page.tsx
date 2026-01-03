'use client';

import React, { useRef, useState, Suspense, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

// Import split components
import { SimulationProvider, useSimulation, TimeKeeper, J2000_EPOCH } from './context';
import { StarBackground, Sun, Planet, SpaceDust, AsteroidBelt, SolarWind } from './components/Scene';
import { SystemControls } from './components/Controls'; 
import { FantasyContent } from './components/FantasyScene';

import { CinematicDirector, CinematicOverlay, FlightComputer, generateCommercialFlight } from './components/Cinematic';
import type { OverlayData, FlightData } from './components/Cinematic';

import { DetailPanel, SystemFinder, SpeedControls, CinematicMenu } from './components/UI';

function TimeDisplay() {
    const { simulationTime, activeSystem } = useSimulation();
    return (
        <div className="mt-1 md:mt-2 text-zinc-500 font-mono text-[10px] md:text-xs" suppressHydrationWarning>
            {activeSystem === 'fantasy' ? 'ZINC PRIME TIME' : ''} {new Date(simulationTime).toLocaleDateString()} {new Date(simulationTime).toLocaleTimeString()}
        </div>
    );
}

function PlanetariumContent() {
    const { setTime, setSpeed, activeSystem, currentData } = useSimulation();
    
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [finderOpen, setFinderOpen] = useState(false);
    
    // View Options
    const [showOrbits, setShowOrbits] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [showSolarWind, setShowSolarWind] = useState(false);
    
    // Cinematic State
    const [isCinematic, setIsCinematic] = useState(false);
    const [cinematicKey, setCinematicKey] = useState(0); 
    const [cinematicOverlay, setCinematicOverlay] = useState<OverlayData>({ show: false });
    const [flightData, setFlightData] = useState<FlightData>({ active: false });
    const [currentTourId, setCurrentTourId] = useState('grand_tour');

    const planetRefs = useRef<Record<string, THREE.Object3D>>({});

    // Reset selection when switching systems
    useEffect(() => {
        setSelectedId(null);
        setFinderOpen(false);
    }, [activeSystem]);

    const handleSelect = useCallback((id: string | null) => {
        if (isCinematic) return;
        setSelectedId(id);
        setFinderOpen(false);
    }, [isCinematic]);

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

    const startCinematic = (tourId: string) => {
        if (activeSystem !== 'solar') return; 
        
        // Handle Random Flight Generation
        if (tourId === 'random') {
            const randomId = generateCommercialFlight();
            setCurrentTourId(randomId);
            setSpeed(1); // Real-time feel for launch
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
        setCinematicOverlay({ show: false });
        setFlightData({ active: false });
    };

    const stopCinematic = () => {
        setIsCinematic(false);
        setCinematicOverlay({ show: false });
        setFlightData({ active: false });
    };

    // Calculate Scale Positions
    const scalePositions = React.useMemo(() => {
        if (currentTourId !== 'scale_comparison') return {};
        
        // ORDERED BY RADIUS: Pluto -> Mercury -> Mars -> Venus -> Earth -> Neptune -> Uranus -> Saturn -> Jupiter -> Sun
        // Removed Black Hole
        const desiredOrder = ['pluto', 'mercury', 'mars', 'venus', 'earth', 'neptune', 'uranus', 'saturn', 'jupiter', 'sun'];
        
        const posMap: Record<string, THREE.Vector3> = {};
        let currentX = 0;

        desiredOrder.forEach((id, index) => {
             const body = currentData.find(b => b.id === id);
             if (!body) return;
             
             if (index > 0) {
                 const prevId = desiredOrder[index - 1];
                 const prevBody = currentData.find(b => b.id === prevId);
                 if (prevBody) {
                     // INCREASED SPACING for better Cinematic Camera movement
                     const gap = (prevBody.radius + body.radius) * 1.5 + Math.max(50, prevBody.radius * 3.0); 
                     currentX += gap;
                 }
             }
             posMap[id] = new THREE.Vector3(currentX, 0, 0);
        });
        return posMap;
    }, [currentData, currentTourId]);

    const isScaleMode = isCinematic && currentTourId === 'scale_comparison';

    // Helper for Sun Position
    const sunScalePos = isScaleMode && scalePositions['sun'] ? scalePositions['sun'] : new THREE.Vector3(0,0,0);

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
                    
                    {/* Controls & Camera */}
                    <SystemControls 
                        targetId={selectedId} 
                        refs={planetRefs} 
                        isCinematic={isCinematic}
                    />

                    {/* === SCENE CONTENT SWITCHER === */}
                    {activeSystem === 'fantasy' ? (
                        <FantasyContent 
                            handleSelect={handleSelect} 
                            planetRefs={planetRefs} 
                            showOrbits={showOrbits}
                            showLabels={showLabels}
                        />
                    ) : (
                        <>
                            {/* Standard Solar System */}
                            <CinematicDirector 
                                key={cinematicKey} 
                                active={isCinematic} 
                                tourId={currentTourId}
                                refs={planetRefs} 
                                onStop={stopCinematic}
                                onOverlayUpdate={setCinematicOverlay}
                                onFlightUpdate={setFlightData}
                            />
                            
                            <StarBackground />
                            {!isScaleMode && <SpaceDust />} 
                            {!isScaleMode && <AsteroidBelt />}
                            {!isScaleMode && showSolarWind && <SolarWind />}
                            
                            {/* SUN WRAPPER FOR MOVEMENT */}
                            <group position={sunScalePos}>
                                 <Sun onClick={() => handleSelect('sun')} />
                            </group>
                            {/* The Ref group must also move so camera tracks it correctly */}
                            <group 
                                ref={(ref) => { if(ref) planetRefs.current['sun'] = ref }} 
                                position={sunScalePos}
                            />

                            {currentData.filter(p => p.id !== 'sun').map((planet) => (
                                <Planet 
                                    key={planet.id} 
                                    data={planet} 
                                    isSelected={selectedId === planet.id}
                                    isCinematic={isCinematic}
                                    showOrbits={showOrbits}
                                    showLabels={showLabels}
                                    // PASS SCALE PROPS
                                    scalePosition={scalePositions[planet.id]}
                                    isScaleAlignment={isScaleMode}
                                    
                                    onClick={(idOverride?: string) => handleSelect(idOverride || planet.id)}
                                    onSelectRef={(id: string, ref: THREE.Object3D) => { planetRefs.current[id] = ref; }}
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

            <CinematicOverlay data={cinematicOverlay} />
            <FlightComputer data={flightData} />

            {!isCinematic && (
                <>
                    {/* Top Bar */}
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
                                <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 pointer-events-auto w-full md:w-auto">
                                    {/* Cinematic Menu */}
                                    {activeSystem === 'solar' && <CinematicMenu onSelectTour={startCinematic} />}

                                    {/* System Browser Button */}
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
                        showOrbits={showOrbits}
                        setShowOrbits={setShowOrbits}
                        showLabels={showLabels}
                        setShowLabels={setShowLabels}
                        showSolarWind={showSolarWind}
                        setShowSolarWind={setShowSolarWind}
                        handleRecenter={handleRecenter}
                    />
                </>
            )}

            {/* SHARED Detail Panel - renders data based on current system context */}
            <DetailPanel id={selectedId} onClose={() => setSelectedId(null)} />
            <SystemFinder isOpen={finderOpen} onClose={() => setFinderOpen(false)} onSelect={handleSelect} />
            
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