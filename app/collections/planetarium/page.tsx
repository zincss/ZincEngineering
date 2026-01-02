'use client';

import React, { useRef, useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ArrowLeft, Search, Car, Film, Pause } from 'lucide-react';
import Link from 'next/link';

// Import split components
import { SimulationProvider, useSimulation, TimeKeeper } from './context';
import { StarBackground, Sun, Planet, SpaceRoute, SystemControls } from './components/Scene';
import { CinematicDirector, CinematicOverlay, OverlayData } from './components/Cinematic';
import { DetailPanel, SystemFinder, ZincShuttleApp, SpeedControls } from './components/UI';
import { PLANET_DATA } from './data';

// Helper component to display time
function TimeDisplay() {
    const { simulationTime } = useSimulation();
    return (
        <div className="mt-2 text-zinc-500 font-mono text-xs" suppressHydrationWarning>
            {new Date(simulationTime).toLocaleDateString()} {new Date(simulationTime).toLocaleTimeString()}
        </div>
    );
}

function PlanetariumContent() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [finderOpen, setFinderOpen] = useState(false);
    
    // Shuttle State
    const [shuttleOpen, setShuttleOpen] = useState(false);
    const [rideStatus, setRideStatus] = useState<'idle' | 'driving'>('idle');
    const [shuttleDestination, setShuttleDestination] = useState<string | null>(null);
    const [shuttleOrigin, setShuttleOrigin] = useState<string | null>(null);
    const [previewTarget, setPreviewTarget] = useState<{origin: string, destination: string} | null>(null);

    // Cinematic State
    const [isCinematic, setIsCinematic] = useState(false);
    const [cinematicOverlay, setCinematicOverlay] = useState<OverlayData>({ show: false });

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

    const toggleCinematic = () => {
        setSelectedId(null);
        setFinderOpen(false);
        setShuttleOpen(false);
        setIsCinematic(!isCinematic);
        setCinematicOverlay({ show: false }); // Reset overlay
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden touch-none">
            {/* 1. THE 3D SCENE */}
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

                    {/* Cinematic Logic Inside Canvas */}
                    <CinematicDirector 
                        active={isCinematic} 
                        tourId="grand_tour" 
                        refs={planetRefs} 
                        onStop={() => setIsCinematic(false)}
                        onOverlayUpdate={setCinematicOverlay}
                    />
                    
                    <StarBackground />
                    
                    <Sun onClick={() => handleSelect('sun')} />
                    <group ref={(ref) => { if(ref) planetRefs.current['sun'] = ref }} />

                    {PLANET_DATA.filter(p => p.id !== 'sun').map((planet) => (
                        <Planet 
                            key={planet.id} 
                            data={planet} 
                            isSelected={selectedId === planet.id}
                            isCinematic={isCinematic}
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

            {/* 2. CINEMATIC OVERLAY (HUD LAYER) */}
            {/* This sits ON TOP of the canvas, not inside it */}
            <CinematicOverlay data={cinematicOverlay} />

            {/* 3. MAIN UI LAYER - HIDDEN DURING CINEMATIC */}
            {!isCinematic && (
                <div className="absolute top-20 md:top-24 left-0 p-4 md:p-8 w-full z-10 pointer-events-none flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="pointer-events-auto w-full md:w-auto animate-in fade-in slide-in-from-top-4 duration-500">
                        <Link href="/collections" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest mb-2 md:mb-4">
                            <ArrowLeft size={14} /> Exit Simulation
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                            Solar <span className="text-[#DFFF00]">Map</span>
                        </h1>
                        <TimeDisplay />
                    </div>
                    
                    {/* Only show these buttons if no planet is selected AND we are not driving */}
                    {(!rideStatus || rideStatus === 'idle') && !selectedId ? (
                        <div className="flex gap-2 md:gap-4 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-500 w-full md:w-auto mt-2 md:mt-0">
                            {/* SCENIC FLIGHT BUTTON */}
                            <button 
                                onClick={toggleCinematic}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 md:px-6 py-3 font-bold uppercase tracking-widest rounded-full transition-all text-xs md:text-sm bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                            >
                                <Film size={16} className="text-[#DFFF00]" /> 
                                <span className="whitespace-nowrap">Scenic Flight</span>
                            </button>

                            <button 
                                onClick={() => setShuttleOpen(!shuttleOpen)}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest rounded-full transition-all border border-white/10 text-xs md:text-sm"
                            >
                                <Car size={16} className="text-[#DFFF00]" /> <span className="whitespace-nowrap">Zinc Shuttle</span>
                            </button>
                            <button 
                                onClick={() => setFinderOpen(true)}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-[#DFFF00] hover:bg-white text-black font-bold uppercase tracking-widest rounded-full transition-all shadow-[0_0_30px_rgba(223,255,0,0.4)] text-xs md:text-sm"
                            >
                                <Search size={16} /> <span className="whitespace-nowrap">Browser</span>
                            </button>
                        </div>
                    ) : null}
                </div>
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
            
            {!isCinematic && <SpeedControls />}
            
            {/* CINEMATIC STOP CONTROL */}
            {isCinematic && (
                <div className="fixed bottom-12 w-full text-center pointer-events-auto animate-in fade-in duration-1000 z-50">
                    <button 
                        onClick={toggleCinematic}
                        className="group inline-block bg-black/40 hover:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 transition-all cursor-pointer"
                    >
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <div className="flex flex-col items-start">
                                <span className="text-white font-mono text-xs uppercase tracking-[0.2em] group-hover:text-red-400 transition-colors">Auto-Pilot Engaged</span>
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Click or ESC to Stop</span>
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