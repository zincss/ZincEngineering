'use client';

import React, { useRef, useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ArrowLeft, Search, Car } from 'lucide-react';
import Link from 'next/link';

// Import split components
import { SimulationProvider, useSimulation, TimeKeeper } from './context';
import { StarBackground, Sun, Planet, SpaceRoute, SystemControls } from './components/Scene';
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

    const planetRefs = useRef<Record<string, THREE.Object3D>>({});

    const handleSelect = useCallback((id: string | null) => {
        if (rideStatus === 'driving') return;
        setSelectedId(id);
        setFinderOpen(false);
    }, [rideStatus]);

    const handleBackgroundClick = useCallback(() => {
        if (rideStatus === 'driving') return;
        setSelectedId(null);
        setFinderOpen(false);
    }, [rideStatus]);

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

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
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
                        previewTarget={previewTarget}
                    />
                    
                    <StarBackground />
                    
                    <Sun onClick={() => handleSelect('sun')} />
                    {/* Hack to register Sun ref */}
                    <group ref={(ref) => { if(ref) planetRefs.current['sun'] = ref }} />

                    {PLANET_DATA.filter(p => p.id !== 'sun').map((planet) => (
                        <Planet 
                            key={planet.id} 
                            data={planet} 
                            isSelected={selectedId === planet.id}
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

            {/* MAIN UI LAYER */}
            <div className="absolute top-0 left-0 p-8 w-full z-10 pointer-events-none flex justify-between items-start">
                <div className="pointer-events-auto">
                    <Link href="/collections" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest mb-4">
                        <ArrowLeft size={14} /> Exit Simulation
                    </Link>
                    <h1 className="text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                        Solar <span className="text-[#DFFF00]">Map</span>
                    </h1>
                    <TimeDisplay />
                </div>
                
                {/* Only show these buttons if no planet is selected AND we are not driving */}
                {(!rideStatus || rideStatus === 'idle') && !selectedId ? (
                    <div className="flex gap-4 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-500">
                        <button 
                            onClick={() => setShuttleOpen(!shuttleOpen)}
                            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest rounded-full transition-all border border-white/10"
                        >
                            <Car size={16} className="text-[#DFFF00]" /> Zinc Shuttle
                        </button>
                        <button 
                            onClick={() => setFinderOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#DFFF00] hover:bg-white text-black font-bold uppercase tracking-widest rounded-full transition-all shadow-[0_0_30px_rgba(223,255,0,0.4)]"
                        >
                            <Search size={16} /> System Browser
                        </button>
                    </div>
                ) : null}
            </div>

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
            <SpeedControls />
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