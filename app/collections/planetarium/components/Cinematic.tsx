'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// --- TYPES ---
export type ShotType = 'orbit' | 'flyby' | 'static' | 'travel' | 'eclipse';

export interface CinematicShot {
    targetId?: string;      
    title?: string;         
    subtitle?: string;      
    titleDelay?: number;    
    type: ShotType;
    duration: number;       
    distance: number;       
    height: number;         
    speed: number;          
    fov?: number;          
    dampening?: number;     
    side?: 'lit' | 'dark' | 'any'; 
    // Flight Computer Props
    showFlightComputer?: boolean;
    originName?: string;
    destName?: string;
    facts?: string[]; 
}

export interface Tour {
    id: string;
    name: string;
    description: string;
    shots: CinematicShot[];
}

export interface OverlayData {
    title?: string;
    subtitle?: string;
    show: boolean;
}

export interface FlightData {
    active: boolean;
    startTime?: number;
    duration?: number;
    origin?: string;
    destination?: string;
    facts?: string[];
}

// --- FACT SETS ---
const MARS_FACTS = [
    "Mars is approx. 140 million miles away from Earth on average.",
    "A day on Mars (Sol) is 24 hours and 37 minutes.",
    "Gravity on Mars is 38% of Earth's gravity.",
    "Olympus Mons on Mars is the largest volcano in the solar system.",
    "Mars appears red due to iron oxide (rust) on its surface.",
    "Mars has two moons: Phobos and Deimos.",
    "Average temperature on Mars is -60 degrees Celsius.",
    "Sunset on Mars appears blue due to the fine dust in the atmosphere.",
    "Mars has the largest dust storms in the solar system, lasting months.",
    "It takes sunlight about 13 minutes to travel from the Sun to Mars."
];

const VOYAGER_FACTS = [
    "LAUNCH: September 5, 1977. Mission: Grand Tour of the Solar System.",
    "1979: Voyager 1 made its closest approach to Jupiter, discovering its ring system.",
    "1980: The spacecraft flew past Saturn, giving us our first high-res look at the rings.",
    "1990: Voyager 1 took the 'Pale Blue Dot' photo of Earth from 6 billion km away.",
    "SPEED: Voyager is traveling at over 38,000 mph (17 km/s) relative to the Sun.",
    "2012: Voyager 1 became the first human-made object to enter Interstellar Space.",
    "DISTANCE: It is currently over 24 billion km (160 AU) from Earth.",
    "COMMS: It takes over 22 hours for a radio signal to travel one-way to the spacecraft.",
    "POWER: Its nuclear batteries (RTGs) produce about 4 watts less power each year.",
    "FUTURE: Voyager 1 will wander the Milky Way long after our Sun has burned out."
];

// --- CINEMATIC DATA ---
export const TOURS: Tour[] = [
    {
        id: 'grand_tour',
        name: 'The Grand Tour',
        description: 'A pure celestial journey.',
        shots: [
            // --- SUN SEQUENCE ---
            { 
                targetId: 'sun', 
                title: 'SOL', 
                subtitle: 'SYSTEM ORIGIN // CLASS G STAR',
                titleDelay: 1,
                type: 'static', 
                duration: 12, 
                distance: 160, 
                height: 0, 
                speed: 0.02,
                fov: 60,
                dampening: 0.5
            },
            { targetId: 'mercury', type: 'travel', duration: 7, distance: 8, height: 2, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'mercury', title: 'MERCURY', subtitle: 'THE LIGHTHOUSE', titleDelay: 1.0, type: 'orbit', duration: 14, distance: 2.5, height: 0.5, speed: 0.08, dampening: 0.5 },
            { targetId: 'mercury', type: 'orbit', duration: 10, distance: 1.8, height: 0.2, speed: 0.25, fov: 55, dampening: 0.5 },
            { targetId: 'mercury', type: 'eclipse', duration: 8, distance: 5, height: 0, speed: 0.05, dampening: 0.5 },
            { targetId: 'venus', type: 'travel', duration: 9, distance: 10, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'venus', title: 'VENUS', subtitle: 'THE MORNING STAR', titleDelay: 1.5, type: 'orbit', duration: 16, distance: 4.0, height: 0, speed: 0.06, dampening: 0.5 },
            { targetId: 'venus', type: 'orbit', duration: 12, distance: 5.0, height: 4, speed: 0.04, dampening: 0.6 },
            { targetId: 'venus', type: 'flyby', duration: 8, distance: 6, height: -2, speed: 0.1, dampening: 0.6 },
            { targetId: 'earth', type: 'travel', duration: 10, distance: 15, height: 5, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'earth', title: 'EARTH', subtitle: 'TERRA // HOME', titleDelay: 1.0, type: 'orbit', duration: 20, distance: 4.5, height: 1, speed: 0.04, dampening: 0.4 },
            { targetId: 'earth', type: 'static', duration: 10, distance: 8, height: 4, speed: 0.02, dampening: 0.5 },
            { targetId: 'moon', type: 'travel', duration: 6, distance: 4, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'moon', title: 'LUNA', subtitle: 'OUR SATELLITE', titleDelay: 1.0, type: 'orbit', duration: 14, distance: 1.5, height: 0, speed: 0.1, dampening: 0.5 },
            { targetId: 'moon', type: 'orbit', duration: 10, distance: 1.2, height: 0.2, speed: 0.2, dampening: 0.5 },
            { targetId: 'mars', type: 'travel', duration: 10, distance: 12, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'mars', title: 'MARS', subtitle: 'THE RED PLANET', titleDelay: 1.5, type: 'orbit', duration: 16, distance: 2.5, height: 0.5, speed: 0.1, dampening: 0.5 },
            { targetId: 'mars', type: 'orbit', duration: 12, distance: 2.0, height: 0.2, speed: 0.25, dampening: 0.5 },
            { targetId: 'phobos', type: 'travel', duration: 6, distance: 1.5, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'phobos', title: 'PHOBOS', subtitle: 'THE DOOMED MOON', titleDelay: 1.0, type: 'orbit', duration: 12, distance: 0.35, height: 0.1, speed: 0.15, dampening: 0.4 },
            { targetId: 'jupiter', type: 'travel', duration: 14, distance: 60, height: 10, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'jupiter', title: 'JUPITER', subtitle: 'KING OF WORLDS', titleDelay: 2.0, type: 'orbit', duration: 22, distance: 45, height: 0, speed: 0.03, dampening: 0.5 },
            { targetId: 'europa', type: 'travel', duration: 8, distance: 4, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'europa', title: 'EUROPA', subtitle: 'ICE SHELL', titleDelay: 1.0, type: 'orbit', duration: 12, distance: 1.2, height: 0.2, speed: 0.1, dampening: 0.5 },
            { targetId: 'ganymede', type: 'travel', duration: 8, distance: 5, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'ganymede', title: 'GANYMEDE', subtitle: 'THE GIANT', titleDelay: 1.0, type: 'orbit', duration: 12, distance: 1.8, height: 0.5, speed: 0.08, dampening: 0.5 },
            { targetId: 'saturn', type: 'travel', duration: 16, distance: 70, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'saturn', title: 'SATURN', subtitle: 'THE CROWN JEWEL', titleDelay: 2.0, type: 'orbit', duration: 20, distance: 55, height: 8, speed: 0.05, dampening: 0.5 },
            { targetId: 'saturn', type: 'orbit', duration: 15, distance: 40, height: 1, speed: 0.12, dampening: 0.5 },
            { targetId: 'uranus', type: 'travel', duration: 16, distance: 30, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'uranus', title: 'URANUS', subtitle: 'THE ICE GIANT', titleDelay: 1.5, type: 'orbit', duration: 18, distance: 10, height: 0, speed: 0.06, dampening: 0.5 },
            { targetId: 'neptune', type: 'travel', duration: 16, distance: 30, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'neptune', title: 'NEPTUNE', subtitle: 'THE DEEP BLUE', titleDelay: 1.5, type: 'orbit', duration: 18, distance: 10, height: 0, speed: 0.06, dampening: 0.5 },
            { targetId: 'pluto', type: 'travel', duration: 14, distance: 3, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'pluto', title: 'PLUTO', subtitle: 'THE EDGE', titleDelay: 1.0, type: 'orbit', duration: 16, distance: 0.8, height: 0.2, speed: 0.1, dampening: 0.4 },
            { targetId: 'eris', type: 'travel', duration: 14, distance: 3, height: 0, speed: 0, side: 'lit', dampening: 0.8 },
            { targetId: 'eris', title: 'ERIS', subtitle: 'NOWHERE...', titleDelay: 1.0, type: 'orbit', duration: 16, distance: 0.8, height: 0.2, speed: 0.1, dampening: 0.4 },
            { targetId: 'sagittarius_a', type: 'travel', duration: 25, distance: 200, height: 50, speed: 0, dampening: 1.5 },
            { targetId: 'sagittarius_a', title: 'SAGITTARIUS A*', subtitle: 'GALACTIC CORE // SINGULARITY', titleDelay: 2.0, type: 'orbit', duration: 30, distance: 100, height: 20, speed: 0.03, dampening: 0.5 },
            { targetId: 'sagittarius_a', type: 'flyby', duration: 15, distance: 60, height: 0, speed: 0.1, fov: 90, dampening: 0.6 },
            { targetId: 'sun', title: 'SOLAR SYSTEM', subtitle: 'by Zac. // ZINCS', type: 'static', duration: 20, distance: 800, height: 400, speed: 0.05, fov: 70, dampening: 0.4 },
        ]
    },
    {
        id: 'earth_mars_transfer',
        name: 'Earth to Mars Transfer',
        description: 'A cinematic 20-minute journey to the Red Planet.',
        shots: [
            // 1. Earth Orbit - Start EXTREMELY CLOSE (Radius 1.0, so 1.3 is 0.3 altitude)
            { 
                targetId: 'earth', 
                title: 'EARTH ORBIT', 
                subtitle: 'SYSTEM CHECK COMPLETE',
                titleDelay: 1,
                type: 'orbit', 
                duration: 20, 
                distance: 1.3, 
                height: 0, 
                speed: 0.15,
                dampening: 0.5 
            },
            // 2. Departure Burn - Pull back from close orbit to distance
            { 
                targetId: 'earth', 
                title: 'INJECTION BURN',
                subtitle: 'ESCAPE VELOCITY ACHIEVED',
                type: 'static', // Hold relative position while drifting back
                duration: 15, 
                distance: 30, // Move further away for dramatic departure
                height: 5, 
                speed: 0.0, 
                dampening: 0.4, // Slow drift
                fov: 65 
            },
            // 3. The Transfer (1135s)
            // Starts from Earth and moves to Mars (Arrives at 1.4 for close-up)
            { 
                targetId: 'mars', 
                type: 'travel', 
                duration: 1135, 
                distance: 1.4, // EXTREME CLOSE UP ARRIVAL
                height: 0.5, 
                speed: 0, 
                side: 'lit', 
                dampening: 0.4, 
                showFlightComputer: true,
                originName: 'EARTH',
                destName: 'MARS',
                facts: MARS_FACTS,
                fov: 45
            },
            // 4. Mars Arrival - Already close from previous shot
            { 
                targetId: 'mars', 
                title: 'MARS ARRIVAL', 
                subtitle: 'ORBITAL INSERTION BURN',
                titleDelay: 1,
                type: 'orbit', 
                duration: 30, 
                distance: 1.5, // Keep it tight
                height: 0.2, 
                speed: 0.2,
                dampening: 0.6,
                fov: 60
            },
            // 5. Stable Orbit
            {
                targetId: 'mars',
                type: 'orbit',
                duration: 60,
                distance: 2.0,
                height: 0,
                speed: 0.1,
                dampening: 0.6
            }
        ]
    },
    {
        id: 'voyager_1',
        name: 'Voyager 1: The Grand Tour',
        description: 'Relive the 45-year journey in 1 hour.',
        shots: [
            // --- 1. EARTH LAUNCH (1977) ---
            {
                targetId: 'earth',
                title: 'VOYAGER 1',
                subtitle: 'LAUNCH: SEPT 5, 1977',
                titleDelay: 1,
                type: 'orbit',
                duration: 60,
                distance: 5,
                height: 1,
                speed: 0.15,
                dampening: 0.6
            },
            {
                targetId: 'earth',
                title: 'DEPARTURE',
                subtitle: 'By ZAC. A VOYAGERS JOURNEY.',
                type: 'flyby',
                duration: 60,
                distance: 20,
                height: 5,
                speed: 0.5,
                dampening: 0.6,
                fov: 80
            },
            // --- 2. CRUISE TO JUPITER ---
            {
                targetId: 'jupiter',
                type: 'travel',
                duration: 600, // 10 mins
                distance: 50,
                height: 5,
                speed: 0,
                dampening: 0.5,
                showFlightComputer: true,
                originName: 'EARTH',
                destName: 'JUPITER',
                facts: VOYAGER_FACTS
            },
            // --- 3. JUPITER FLYBY (1979) ---
            {
                targetId: 'jupiter',
                title: 'JUPITER ENCOUNTER',
                subtitle: 'MARCH 1979 // GRAVITY ASSIST',
                titleDelay: 1,
                type: 'flyby',
                duration: 180, // 3 mins
                distance: 35,
                height: 0,
                speed: 0.2,
                dampening: 0.8,
                fov: 65
            },
             // --- 4. CRUISE TO SATURN ---
             {
                targetId: 'saturn',
                type: 'travel',
                duration: 600, // 10 mins
                distance: 50,
                height: 5,
                speed: 0,
                dampening: 0.5,
                showFlightComputer: true,
                originName: 'JUPITER',
                destName: 'SATURN',
                facts: VOYAGER_FACTS
            },
            // --- 5. SATURN FLYBY (1980) ---
            {
                targetId: 'saturn',
                title: 'SATURN ENCOUNTER',
                subtitle: 'NOV 1980 // TITAN FLYBY',
                titleDelay: 1,
                type: 'flyby',
                duration: 180, // 3 mins
                distance: 40,
                height: 10, // Higher angle for rings
                speed: 0.15,
                dampening: 0.8,
                fov: 65
            },
            // --- 6. INTERSTELLAR MISSION ---
            {
                targetId: 'sun', // Fly away from sun
                title: 'INTERSTELLAR MISSION',
                subtitle: 'HELIOPAUSE CROSSING // 2012',
                type: 'travel',
                duration: 1920, // ~32 mins remainder
                distance: 5000, // Massive distance
                height: 500, // Off-plane trajectory
                speed: 0,
                dampening: 0.2, // Extremely slow drift feel
                showFlightComputer: true,
                originName: 'SATURN',
                destName: 'DEEP SPACE',
                facts: VOYAGER_FACTS,
                side: 'dark'
            }
        ]
    }
];

// --- MATH HELPERS ---
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// --- COMPONENT: TITLE OVERLAY ---
export function CinematicOverlay({ data }: { data: OverlayData }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <div className={`
                flex flex-col items-center justify-center 
                transition-opacity duration-[5000ms] ease-in-out
                ${data.show ? 'opacity-100' : 'opacity-0'}
            `}>
                <div className="relative flex flex-col items-center">
                    <h1 className={`
                        text-6xl md:text-8xl font-black text-white uppercase tracking-tighter
                        transition-all duration-[5000ms] ease-out transform
                        ${data.show ? 'scale-100 blur-0 translate-z-0' : 'scale-105 blur-lg translate-z-10'}
                    `}
                    style={{ 
                        fontFamily: 'system-ui, -apple-system, sans-serif', 
                        textShadow: '0 0 50px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5)' 
                    }}>
                        {data.title}
                    </h1>
                    
                    <div className={`
                        h-[2px] bg-white mx-auto mt-2 shadow-[0_0_10px_white]
                        transition-all duration-[3000ms] ease-out delay-200
                        ${data.show ? 'w-[120%] opacity-100' : 'w-0 opacity-0'}
                    `} />

                    {data.subtitle && (
                        <p className={`
                            text-sm md:text-xl font-mono text-[#DFFF00] mt-4 tracking-[0.5em] uppercase text-center
                            transition-all duration-[3000ms] delay-300
                            ${data.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                        style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                        >
                            {data.subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- COMPONENT: FLIGHT COMPUTER ---
export function FlightComputer({ data }: { data: FlightData }) {
    const [elapsed, setElapsed] = useState(0);
    const [factIndex, setFactIndex] = useState(0);
    
    // Determine which facts to show
    const currentFacts = data.facts || MARS_FACTS;

    // Timer Logic
    useEffect(() => {
        if (!data.active || !data.startTime) return;
        const interval = setInterval(() => {
            setElapsed(Date.now() - data.startTime!);
        }, 100);
        return () => clearInterval(interval);
    }, [data.active, data.startTime]);

    // Fact Rotator
    useEffect(() => {
        if (!data.active) return;
        // Reset index when activation changes
        setFactIndex(0);
        
        const interval = setInterval(() => {
            setFactIndex(prev => (prev + 1) % currentFacts.length);
        }, 30000); // New fact every 30s
        return () => clearInterval(interval);
    }, [data.active, currentFacts.length]);

    if (!data.active || !data.duration) return null;

    const remaining = Math.max(0, data.duration * 1000 - elapsed);
    const progress = Math.min(1, elapsed / (data.duration * 1000));
    
    // Formatting Helpers
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Calculate approximate distance (Simulation)
    const totalDistance = 225000000; 
    const currentDist = Math.floor(totalDistance * progress);
    const remainingDist = totalDistance - currentDist;
    const speed = 60000; 

    return (
        <div className="absolute inset-0 pointer-events-none z-40 p-4 md:p-8 flex flex-col justify-between pt-safe-top">
            {/* TOP BAR */}
            <div className="flex justify-between items-start animate-in fade-in slide-in-from-top duration-1000">
                <div className="bg-black/60 backdrop-blur-md p-4 rounded-br-2xl border-l-4 border-l-[#DFFF00] border-y border-r border-white/10">
                    <div className="text-[#DFFF00] font-mono text-xs uppercase tracking-[0.2em] mb-1">Flight Computer</div>
                    <div className="text-white font-black text-xl md:text-2xl uppercase tracking-tighter">Transfer {data.origin} → {data.destination}</div>
                </div>
                <div className="bg-black/60 backdrop-blur-md p-4 rounded-bl-2xl border-r-4 border-r-cyan-400 border-y border-l border-white/10 text-right">
                    <div className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] mb-1">Time Elapsed</div>
                    <div className="text-white font-mono text-2xl md:text-3xl">{formatTime(elapsed)}</div>
                </div>
            </div>

            {/* CENTER FACTS */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl text-center px-4">
                 <div key={factIndex} className="animate-in fade-in zoom-in duration-1000">
                    <div className="inline-block bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 mb-4">
                        <span className="text-[#DFFF00] font-mono text-xs uppercase tracking-widest mr-2">Mission Log</span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-light text-white leading-relaxed drop-shadow-xl">
                        "{currentFacts[factIndex]}"
                    </h2>
                 </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="flex justify-between items-end animate-in fade-in slide-in-from-bottom duration-1000 pb-safe-bottom">
                <div className="bg-black/60 backdrop-blur-md p-6 rounded-tr-2xl border-l-4 border-l-[#DFFF00] border-y border-r border-white/10 w-full max-w-md hidden md:block">
                    <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-2">
                        <span className="text-zinc-400">Progress</span>
                        <span className="text-[#DFFF00]">{(progress * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 w-full mb-4 overflow-hidden rounded-full">
                        <div className="h-full bg-[#DFFF00] transition-all duration-300" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Distance Rem.</div>
                            <div className="text-white font-mono text-xl">{remainingDist.toLocaleString()} <span className="text-xs text-zinc-500">km</span></div>
                        </div>
                        <div>
                            <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Velocity</div>
                            <div className="text-white font-mono text-xl">{speed.toLocaleString()} <span className="text-xs text-zinc-500">km/h</span></div>
                        </div>
                    </div>
                </div>

                <div className="bg-black/60 backdrop-blur-md p-4 rounded-tl-2xl border-r-4 border-r-cyan-400 border-y border-l border-white/10 text-right ml-auto">
                    <div className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] mb-1">Est. Arrival</div>
                    <div className="text-white font-mono text-2xl md:text-3xl">{formatTime(remaining)}</div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN DIRECTOR COMPONENT ---
export function CinematicDirector({ 
    active, 
    tourId, 
    refs, 
    onStop,
    onOverlayUpdate,
    onFlightUpdate 
}: { 
    active: boolean, 
    tourId: string, 
    refs: any, 
    onStop: () => void,
    onOverlayUpdate: (data: OverlayData) => void,
    onFlightUpdate: (data: FlightData) => void
}) {
    const { camera } = useThree();
    
    // Playback State
    const [shotIndex, setShotIndex] = useState(0);
    const [shotStartTime, setShotStartTime] = useState(0);
    
    // Physics State
    const transitionState = useRef({
        pos: new THREE.Vector3(),
        lookAt: new THREE.Vector3(),
        orbitAngle: 0
    });
    const currentPos = useRef(new THREE.Vector3());
    const currentLookAt = useRef(new THREE.Vector3());

    // --- INITIALIZATION ---
    useEffect(() => {
        if (active) {
            setShotIndex(0);
            setShotStartTime(Date.now());
            transitionState.current.pos.copy(camera.position);
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            transitionState.current.lookAt.copy(camera.position).add(forward.multiplyScalar(100));
            currentPos.current.copy(camera.position);
            currentLookAt.current.copy(transitionState.current.lookAt);
            onOverlayUpdate({ show: false });
            onFlightUpdate({ active: false });
        } else {
            onOverlayUpdate({ show: false });
            onFlightUpdate({ active: false });
        }
    }, [active, tourId]);

    // --- ESCAPE KEY ---
    useEffect(() => {
        if (!active) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onStop();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, onStop]);

    // --- SHOT MANAGER ---
    useEffect(() => {
        if (!active) return;
        const tour = TOURS.find(t => t.id === tourId);
        if (!tour || !tour.shots[shotIndex]) return;
        const shot = tour.shots[shotIndex];

        // Capture Handoff
        transitionState.current.pos.copy(currentPos.current);
        transitionState.current.lookAt.copy(currentLookAt.current);
        
        if (shot.targetId && refs.current[shot.targetId]) {
            const targetPos = new THREE.Vector3();
            refs.current[shot.targetId].getWorldPosition(targetPos);
            const dx = currentPos.current.x - targetPos.x;
            const dz = currentPos.current.z - targetPos.z;
            transitionState.current.orbitAngle = Math.atan2(dz, dx);
        }

        // Overlay logic
        if (shot.showFlightComputer) {
            onOverlayUpdate({ show: false }); // Hide title cards
            onFlightUpdate({ 
                active: true, 
                startTime: Date.now(), 
                duration: shot.duration,
                origin: shot.originName,
                destination: shot.destName,
                facts: shot.facts // Pass the facts
            });
        } else {
            onFlightUpdate({ active: false });
            onOverlayUpdate({ show: false });
            let showTimer: NodeJS.Timeout;
            let hideTimer: NodeJS.Timeout;

            if (shot.title) {
                const delay = (shot.titleDelay || 0) * 1000;
                showTimer = setTimeout(() => {
                    onOverlayUpdate({ title: shot.title, subtitle: shot.subtitle, show: true });
                }, delay);
                hideTimer = setTimeout(() => {
                    onOverlayUpdate({ title: shot.title, subtitle: shot.subtitle, show: false });
                }, delay + 4000); // Hold for 4s then fade
            } 
            return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
        }
    }, [shotIndex, active, tourId]);


    // --- RENDER LOOP ---
    useFrame((state, delta) => {
        if (!active) return;

        const tour = TOURS.find(t => t.id === tourId);
        if (!tour) return;

        const shot = tour.shots[shotIndex];
        // SAFETY CHECK: Prevents undefined error when switching between tours of different lengths
        if (!shot) return; 

        const elapsed = (Date.now() - shotStartTime) / 1000;
        const progress = Math.min(1, elapsed / shot.duration);
        const smoothProgress = easeInOutCubic(progress);

        if (elapsed > shot.duration) {
            const nextIndex = (shotIndex + 1) % tour.shots.length;
            setShotIndex(nextIndex);
            setShotStartTime(Date.now());
            return;
        }

        const targetCenter = new THREE.Vector3(0, 0, 0);
        if (shot.targetId && refs.current[shot.targetId]) {
            refs.current[shot.targetId].getWorldPosition(targetCenter);
        } 

        const idealPos = new THREE.Vector3();
        const idealLookAt = new THREE.Vector3();

        if (shot.type === 'travel') {
            const pStart = transitionState.current.pos;
            let arrivalOffset = new THREE.Vector3(shot.distance, shot.height, shot.distance);
            
            if (shot.side === 'lit') {
                const sunPos = new THREE.Vector3(0,0,0);
                const toSun = new THREE.Vector3().subVectors(sunPos, targetCenter).normalize();
                toSun.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI * 0.15); 
                arrivalOffset.copy(toSun).multiplyScalar(shot.distance);
                arrivalOffset.y = shot.height;
            } else if (shot.side === 'dark') {
                // Fly away into darkness
                const sunPos = new THREE.Vector3(0,0,0);
                const fromSun = new THREE.Vector3().subVectors(targetCenter, sunPos).normalize().negate(); // Away vector
                arrivalOffset.copy(fromSun).multiplyScalar(shot.distance);
                arrivalOffset.y = shot.height;
            }

            const pEnd = targetCenter.clone().add(arrivalOffset);
            const mid = new THREE.Vector3().lerpVectors(pStart, pEnd, 0.5);
            const dist = pStart.distanceTo(pEnd);
            
            // --- COLLISION AVOIDANCE ---
            const sunDist = mid.distanceTo(new THREE.Vector3(0,0,0));
            if (sunDist < 50) {
                 mid.y += 100;
            } else {
                 mid.y += Math.min(60, dist * 0.25); 
            }

            const t = smoothProgress;
            idealPos.x = (1-t)*(1-t)*pStart.x + 2*(1-t)*t*mid.x + t*t*pEnd.x;
            idealPos.y = (1-t)*(1-t)*pStart.y + 2*(1-t)*t*mid.y + t*t*pEnd.y;
            idealPos.z = (1-t)*(1-t)*pStart.z + 2*(1-t)*t*mid.z + t*t*pEnd.z;

            idealLookAt.lerpVectors(transitionState.current.lookAt, targetCenter, t);
        }
        else if (shot.type === 'orbit') {
            const angle = transitionState.current.orbitAngle + (elapsed * shot.speed);
            idealPos.x = targetCenter.x + Math.cos(angle) * shot.distance;
            idealPos.z = targetCenter.z + Math.sin(angle) * shot.distance;
            idealPos.y = targetCenter.y + shot.height + (Math.sin(elapsed * 0.5) * 2);
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'flyby') {
            const startOffset = new THREE.Vector3(-shot.distance, shot.height, -shot.distance * 0.5);
            const endOffset = new THREE.Vector3(shot.distance, shot.height, shot.distance * 0.5);
            const currentOffset = new THREE.Vector3().lerpVectors(startOffset, endOffset, progress);
            idealPos.copy(targetCenter).add(currentOffset);
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'eclipse') {
            const sunPos = new THREE.Vector3(0,0,0);
            const dirFromSun = new THREE.Vector3().subVectors(targetCenter, sunPos).normalize();
            const verticalDrift = Math.sin(elapsed * 0.2) * 5;
            idealPos.copy(targetCenter).add(dirFromSun.multiplyScalar(shot.distance));
            idealPos.y += shot.height + verticalDrift;
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'static') {
            const driftFactor = 1 + (elapsed * 0.01);
            const angle = transitionState.current.orbitAngle;
            idealPos.x = targetCenter.x + Math.cos(angle) * (shot.distance * driftFactor);
            idealPos.z = targetCenter.z + Math.sin(angle) * (shot.distance * driftFactor);
            idealPos.y = targetCenter.y + shot.height;
            idealLookAt.copy(targetCenter);
        }

        // SMOOTHER TRANSITIONS
        const damp = shot.dampening || 0.8; 
        currentPos.current.lerp(idealPos, delta * damp);
        currentLookAt.current.lerp(idealLookAt, delta * (damp * 1.5));

        camera.position.copy(currentPos.current);
        camera.lookAt(currentLookAt.current);
        
        if (shot.fov && camera instanceof THREE.PerspectiveCamera) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, shot.fov, delta);
            camera.updateProjectionMatrix();
        } else if (camera instanceof THREE.PerspectiveCamera && camera.fov !== 45) {
             camera.fov = THREE.MathUtils.lerp(camera.fov, 45, delta);
             camera.updateProjectionMatrix();
        }
    });

    return null;
}