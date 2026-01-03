'use client';

import React, { useRef, useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ArrowLeft, Search, Car, Eye, EyeOff, Tag, Crosshair } from 'lucide-react';
import Link from 'next/link';

// Import split components
import { SimulationProvider, useSimulation, TimeKeeper, J2000_EPOCH } from './context';
import { StarBackground, Sun, Planet, SpaceRoute, SystemControls, SpaceDust, AsteroidBelt, SolarWind } from './components/Scene';

import { CinematicDirector, CinematicOverlay, FlightComputer } from './components/Cinematic';
import type { OverlayData, FlightData } from './components/Cinematic';

import { DetailPanel, SystemFinder, ZincShuttleApp, SpeedControls, CinematicMenu } from './components/UI';
import { PLANET_DATA } from './data';

function TimeDisplay() {
    const { simulationTime } = useSimulation();
    return (
        <div className="mt-1 md:mt-2 text-zinc-500 font-mono text-[10px] md:text-xs" suppressHydrationWarning>
            {new Date(simulationTime).toLocaleDateString()} {new Date(simulationTime).toLocaleTimeString()}
        </div>
    );
}

function PlanetariumContent() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [finderOpen, setFinderOpen] = useState(false);
    const { setTime, setSpeed } = useSimulation(); // Destructure new setTime function
    
    // View Options
    const [showOrbits, setShowOrbits] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [showSolarWind, setShowSolarWind] = useState(false);
    
    // Shuttle State
    const [shuttleOpen, setShuttleOpen] = useState(false);
    const [rideStatus, setRideStatus] = useState<'idle' | 'driving'>('idle');
    const [shuttleDestination, setShuttleDestination] = useState<string | null>(null);
    const [shuttleOrigin, setShuttleOrigin] = useState<string | null>(null);
    const [previewTarget, setPreviewTarget] = useState<{origin: string, destination: string} | null>(null);

    // Cinematic State
    const [isCinematic, setIsCinematic] = useState(false);
    const [cinematicKey, setCinematicKey] = useState(0); // Forces remount of director
    const [cinematicOverlay, setCinematicOverlay] = useState<OverlayData>({ show: false });
    const [flightData, setFlightData] = useState<FlightData>({ active: false });
    const [currentTourId, setCurrentTourId] = useState('grand_tour');

    const planetRefs = useRef<Record<string, THREE.Object3D>>({});

    const handleSelect = useCallback((id: string | null) => {
        if (rideStatus === 'driving' || isCinematic) return;
        setSelectedId(id);
        setFinderOpen(false);
    }, [rideStatus, isCinematic]);

    const handleBackgroundClick = useCallback(() => {
        if (rideStatus === 'driving' || isCinematic) return;
        setSelectedId(null);
        setFinderOpen(false);
    }, [rideStatus, isCinematic]);
    
    // Explicit Recenter Function
    const handleRecenter = () => {
        setSelectedId(null);
        // Toggle sun selection briefly to trigger camera movement if needed, or simply unlock
        setSelectedId('sun');
        setTimeout(() => setSelectedId(null), 1000);
    };

    const handlePreview = useCallback((route: { origin: string, destination: string } | null) => {
        setPreviewTarget(route);
    }, []);

    const handleRideRequest = useCallback((route: { origin: string, destination: string }) => {
        if (route.origin === route.destination) return;
        setShuttleOrigin(route.origin);
        setShuttleDestination(route.destination);
        setRideStatus('driving');
        setShuttleOpen(false); 
        setPreviewTarget(null); 
    }, []);

    const handleRideArrival = useCallback(() => {
        setRideStatus('idle');
        setShuttleDestination((prev) => {
            if (prev) setSelectedId(prev);
            return null;
        });
        setShuttleOrigin(null);
    }, []);

    const startCinematic = (tourId: string) => {
        // --- NEW CONSISTENCY LOGIC ---
        // If it's the Grand Tour, force the universe to a known state (J2000 Epoch)
        // so the camera path is always perfectly aligned with the planets.
        if (tourId === 'grand_tour') {
            setTime(J2000_EPOCH);
            setSpeed(0.5); // Slow, majestic rotation during tour
        }
        
        setCurrentTourId(tourId);
        setCinematicKey(k => k + 1); // Increment to force reset
        setSelectedId(null);
        setFinderOpen(false);
        setShuttleOpen(false);
        setIsCinematic(true);
        setCinematicOverlay({ show: false });
        setFlightData({ active: false });
    };

    const stopCinematic = () => {
        setIsCinematic(false);
        setCinematicOverlay({ show: false });
        setFlightData({ active: false });
    };

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
                        isShuttleActive={rideStatus === 'driving'}
                        isCinematic={isCinematic}
                        previewTarget={previewTarget}
                    />

                    <CinematicDirector 
                        key={cinematicKey} // KEY PROP FORCES RESET ON RESTART
                        active={isCinematic} 
                        tourId={currentTourId}
                        refs={planetRefs} 
                        onStop={stopCinematic}
                        onOverlayUpdate={setCinematicOverlay}
                        onFlightUpdate={setFlightData}
                    />
                    
                    <StarBackground />
                    <SpaceDust />
                    <AsteroidBelt />
                    {showSolarWind && <SolarWind />}
                    
                    <Sun onClick={() => handleSelect('sun')} />
                    <group ref={(ref) => { if(ref) planetRefs.current['sun'] = ref }} />

                    {PLANET_DATA.filter(p => p.id !== 'sun').map((planet) => (
                        <Planet 
                            key={planet.id} 
                            data={planet} 
                            isSelected={selectedId === planet.id}
                            isCinematic={isCinematic}
                            showOrbits={showOrbits}
                            showLabels={showLabels}
                            onClick={(idOverride?: string) => handleSelect(idOverride || planet.id)}
                            onSelectRef={(id: string, ref: THREE.Object3D) => { planetRefs.current[id] = ref; }}
                        />
                    ))}
                    
                    <SpaceRoute 
                        originId={rideStatus === 'driving' ? shuttleOrigin : previewTarget?.origin} 
                        destinationId={rideStatus === 'driving' ? shuttleDestination : previewTarget?.destination} 
                        isDriving={rideStatus === 'driving'}
                        isPreviewing={!!previewTarget}
                        setArrived={handleRideArrival}
                    />

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
                    {/* Top Bar - Simplified */}
                    <div className="absolute top-0 left-0 w-full z-10 pointer-events-none p-4 md:p-6 pt-safe-top md:pt-6 flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="pointer-events-auto flex items-start justify-between w-full md:w-auto md:block">
                            <div>
                                <Link href="/collections" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[10px] md:text-xs font-mono uppercase tracking-widest mb-1 md:mb-2">
                                    <ArrowLeft size={12} /> Exit Simulation
                                </Link>
                                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl leading-none">
                                    Solar <span className="text-[#DFFF00]">Map</span>
                                </h1>
                                <TimeDisplay />
                            </div>
                        </div>
                        
                        {/* Right Side Buttons (Browser, Shuttle, Scenic) */}
                        {(!rideStatus || rideStatus === 'idle') && !selectedId && (
                            <div className="flex flex-col gap-2 w-full md:w-auto items-end">
                                <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 pointer-events-auto w-full md:w-auto">
                                    <CinematicMenu onSelectTour={startCinematic} />

                                    <button 
                                        onClick={() => setShuttleOpen(!shuttleOpen)}
                                        className="flex-1 md:flex-initial min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest rounded-full transition-all border border-white/10 text-[10px] md:text-xs"
                                    >
                                        <Car size={14} className="text-[#DFFF00]" /> <span className="whitespace-nowrap">Shuttle</span>
                                    </button>
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

            <ZincShuttleApp 
                isOpen={shuttleOpen} 
                onClose={() => { setShuttleOpen(false); setPreviewTarget(null); }}
                currentId={selectedId || 'earth'}
                onRideRequest={handleRideRequest}
                onPreviewRoute={handlePreview}
                rideStatus={rideStatus}
            />

            <DetailPanel id={selectedId} onClose={() => setSelectedId(null)} />
            <SystemFinder isOpen={finderOpen} onClose={() => setFinderOpen(false)} onSelect={handleSelect} />
            
            {isCinematic && (
                <div className="fixed bottom-8 md:bottom-12 w-full text-center pointer-events-auto animate-in fade-in duration-1000 z-50 px-4">
                    <button 
                        onClick={stopCinematic}
                        className="group inline-block w-full md:w-auto bg-black/40 hover:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 transition-all cursor-pointer"
                    >
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