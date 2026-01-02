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

const JOVIAN_FACTS = [
    "JUPITER: The largest planet in our solar system, a gas giant with a mass one-thousandth that of the Sun.",
    "EUROPA: The smoothest object in the solar system, possessing a subsurface ocean of liquid water.",
    "MAGNETOSPHERE: Jupiter has the strongest magnetic field of any planet, 14 times stronger than Earth's.",
    "GANYMEDE: The largest moon in the solar system, it is even larger than the planet Mercury.",
    "RADIATION: The radiation belts around Jupiter are deadly to humans and electronics alike.",
    "GREAT RED SPOT: A storm that has raged for at least 400 years, large enough to swallow Earth whole.",
    "CALLISTO: The most heavily cratered object in the solar system, a remnant of the early system.",
    "IO: The most geologically active body in the solar system, with hundreds of volcanoes.",
    "TRANSIT: The distance between Europa and Ganymede varies, but averages around 400,000 km.",
    "GRAVITY: Jupiter's immense gravity acts as a vacuum cleaner, protecting inner planets from comets."
];

// --- CINEMATIC DATA ---
// NOTE: "Travel" arrival distance is slightly larger than "Orbit" distance to create a spiral-in effect.
export const TOURS: Tour[] = [
    {
        id: 'grand_tour',
        name: 'The Grand Tour',
        description: 'A pure celestial journey.',
        shots: [
            // --- 1. SUN START (Consistent Anchor) ---
            { 
                targetId: 'sun', 
                title: 'SOL', 
                subtitle: 'SYSTEM ORIGIN // CLASS G STAR',
                titleDelay: 3,
                type: 'orbit', 
                duration: 25, 
                distance: 140, // START DISTANCE FOR LOOP
                height: 20, 
                speed: 0.03, 
                fov: 50,
                dampening: 0.5
            },
            
            // --- MERCURY (Radius 0.38) ---
            // Travel: 20s. Arrive at 1.5 distance.
            { targetId: 'mercury', type: 'travel', duration: 20, distance: 1.5, height: 0.2, speed: 0, side: 'lit', dampening: 0.6 },
            // Orbit: 30s. Spiral in to 1.2.
            { 
                targetId: 'mercury', 
                title: 'MERCURY', 
                subtitle: 'THE LIGHTHOUSE', 
                titleDelay: 6.0, 
                type: 'orbit', 
                duration: 30, 
                distance: 1.2, 
                height: 0.1, 
                speed: 0.08, 
                dampening: 0.4 
            },
            
            // --- VENUS (Radius 0.95) ---
            { targetId: 'venus', type: 'travel', duration: 25, distance: 4.0, height: 0, speed: 0, side: 'lit', dampening: 0.6 },
            { 
                targetId: 'venus', 
                title: 'VENUS', 
                subtitle: 'THE MORNING STAR', 
                titleDelay: 6.0, 
                type: 'orbit', 
                duration: 35, 
                distance: 3.0, 
                height: 0.5, 
                speed: 0.04, 
                dampening: 0.4 
            },
            
            // --- EARTH (Radius 1.0) ---
            { targetId: 'earth', type: 'travel', duration: 25, distance: 5.0, height: 1.0, speed: 0, side: 'lit', dampening: 0.6 },
            { 
                targetId: 'earth', 
                title: 'EARTH', 
                subtitle: 'TERRA // HOME', 
                titleDelay: 6.0, 
                type: 'orbit', 
                duration: 40, 
                distance: 3.5, 
                height: 0.5, 
                speed: 0.03, 
                dampening: 0.4 
            },
            
            // --- MOON (Radius 0.27) ---
            { targetId: 'moon', type: 'travel', duration: 10, distance: 1.5, height: 0, speed: 0, side: 'lit', dampening: 0.6 },
            { 
                targetId: 'moon', 
                title: 'LUNA', 
                subtitle: 'OUR MOON', 
                titleDelay: 4.0, 
                type: 'orbit', 
                duration: 25, 
                distance: 0.9, 
                height: 0.1, 
                speed: 0.06, 
                dampening: 0.4 
            },

            // --- MARS (Radius 0.53) ---
            { targetId: 'mars', type: 'travel', duration: 25, distance: 2.5, height: 0.2, speed: 0, side: 'lit', dampening: 0.6 },
            { 
                targetId: 'mars', 
                title: 'MARS', 
                subtitle: 'THE RED PLANET', 
                titleDelay: 6.0, 
                type: 'orbit', 
                duration: 35, 
                distance: 1.8, 
                height: 0.2, 
                speed: 0.08, 
                dampening: 0.4 
            },
            
            // --- JUPITER (Radius 11) ---
            { targetId: 'jupiter', type: 'travel', duration: 35, distance: 40, height: 0, speed: 0, side: 'lit', dampening: 0.7 },
            { 
                targetId: 'jupiter', 
                title: 'JUPITER', 
                subtitle: 'KING OF WORLDS', 
                titleDelay: 8.0, 
                type: 'orbit', 
                duration: 45, 
                distance: 30, 
                height: 2, 
                speed: 0.02, 
                dampening: 0.4 
            },
            
            // --- SATURN (Radius 9) ---
            { targetId: 'saturn', type: 'travel', duration: 35, distance: 35, height: 5, speed: 0, side: 'lit', dampening: 0.7 },
            { 
                targetId: 'saturn', 
                title: 'SATURN', 
                subtitle: 'THE JEWEL', 
                titleDelay: 8.0, 
                type: 'orbit', 
                duration: 45, 
                distance: 26, 
                height: 6, 
                speed: 0.03, 
                dampening: 0.4 
            },

            // --- URANUS (Radius 4) ---
            { targetId: 'uranus', type: 'travel', duration: 30, distance: 16, height: 0, speed: 0, side: 'lit', dampening: 0.6 },
            { 
                targetId: 'uranus', 
                title: 'URANUS', 
                subtitle: 'THE ICE GIANT', 
                titleDelay: 6.0, 
                type: 'orbit', 
                duration: 35, 
                distance: 12, 
                height: 0, 
                speed: 0.04, 
                dampening: 0.4 
            },

            // --- NEPTUNE (Radius 3.8) ---
            { targetId: 'neptune', type: 'travel', duration: 30, distance: 15, height: 0, speed: 0, side: 'lit', dampening: 0.6 },
            { 
                targetId: 'neptune', 
                title: 'NEPTUNE', 
                subtitle: 'THE DEEP BLUE', 
                titleDelay: 6.0, 
                type: 'orbit', 
                duration: 35, 
                distance: 11, 
                height: 0, 
                speed: 0.04, 
                dampening: 0.4 
            },

            // --- PLUTO (Radius 0.18) ---
            { targetId: 'pluto', type: 'travel', duration: 30, distance: 1.0, height: 0, speed: 0, side: 'lit', dampening: 0.6 },
            { 
                targetId: 'pluto', 
                title: 'PLUTO', 
                subtitle: 'THE EDGE', 
                titleDelay: 6.0, 
                type: 'orbit', 
                duration: 35, 
                distance: 0.6, 
                height: 0.1, 
                speed: 0.06, 
                dampening: 0.4 
            },

            // --- SAGITTARIUS A* (Radius 30) ---
            // 1. Approach
            { targetId: 'sagittarius_a', type: 'travel', duration: 40, distance: 200, height: 20, speed: 0, dampening: 0.8 },
            // 2. The Final Cinematic Shot (Orbit)
            { 
                targetId: 'sagittarius_a', 
                title: 'SAGITTARIUS A*', 
                subtitle: 'GALACTIC CORE', 
                titleDelay: 8.0, 
                type: 'orbit', 
                duration: 50, 
                distance: 80, 
                height: 10, 
                speed: 0.02, 
                dampening: 0.4 
            },
            // 3. THE SINGULARITY (Spiral In)
            { 
                targetId: 'sagittarius_a', 
                title: 'EVENT HORIZON',
                subtitle: 'GRAVITATIONAL SINGULARITY',
                titleDelay: 0.5,
                type: 'orbit', // Orbiting while distance shrinks creates a spiral
                duration: 15, 
                distance: 0.1, // Radius 0 effectively
                height: 0, 
                speed: 2.0, // High speed spin
                dampening: 0.2 // Loose dampening for chaotic feel
            },
            // 4. THE WORMHOLE LOOP (Warp back to Sun)
            // This shot instantly transports us from the black hole center back to the Sun's start position
            { 
                targetId: 'sun', 
                title: '...RESET',
                subtitle: 'SIMULATION RESTART.',
                titleDelay: 0.5,
                type: 'travel', 
                duration: 4, // Fast warp
                distance: 140, // Matches Shot 1 distance
                height: 20, // Matches Shot 1 height
                speed: 0, 
                dampening: 0.1, // Very low dampening for instant response
                fov: 120 // Wide FOV for warp effect
            },
        ]
    },
    {
        id: 'earth_mars_transfer',
        name: 'Earth to Mars Transfer',
        description: 'A cinematic 20-minute journey to the Red Planet.',
        shots: [
            { 
                targetId: 'earth', 
                title: 'EARTH ORBIT', 
                subtitle: 'SYSTEM CHECK COMPLETE',
                titleDelay: 2,
                type: 'orbit', 
                duration: 30, 
                distance: 1.3, 
                height: 0, 
                speed: 0.1,
                dampening: 0.4 
            },
            { 
                targetId: 'earth', 
                title: 'INJECTION BURN',
                subtitle: 'ESCAPE VELOCITY ACHIEVED',
                type: 'static', 
                duration: 20, 
                distance: 30, 
                height: 5, 
                speed: 0.0, 
                dampening: 0.3, 
                fov: 65 
            },
            { 
                targetId: 'mars', 
                type: 'travel', 
                duration: 1135, 
                distance: 1.2, 
                height: 0.3, 
                speed: 0, 
                side: 'lit', 
                dampening: 0.3, 
                showFlightComputer: true,
                originName: 'EARTH',
                destName: 'MARS',
                facts: MARS_FACTS,
                fov: 45
            },
            { 
                targetId: 'mars', 
                title: 'MARS ARRIVAL', 
                subtitle: 'ORBITAL INSERTION BURN',
                titleDelay: 2,
                type: 'orbit', 
                duration: 40, 
                distance: 1.3, 
                height: 0.1, 
                speed: 0.15,
                dampening: 0.5,
                fov: 60
            },
            {
                targetId: 'mars',
                type: 'orbit',
                duration: 60,
                distance: 2.0,
                height: 0,
                speed: 0.08,
                dampening: 0.5
            }
        ]
    },
    {
        id: 'jovian_leap',
        name: 'The Jovian Leap',
        description: 'A 4-minute transfer from Europa to Ganymede through the giant\'s shadow.',
        shots: [
            // 1. Europa Surface - Start close
            { 
                targetId: 'europa', 
                title: 'EUROPA', 
                subtitle: 'ICE SHELL // DEPARTURE',
                titleDelay: 2,
                type: 'orbit', 
                duration: 40, 
                distance: 0.6, // Close (Radius 0.25)
                height: 0.1, 
                speed: 0.08,
                dampening: 0.5 
            },
            // 2. Pull back to reveal the transit path
            { 
                targetId: 'europa', 
                title: 'ORBITAL INJECTION',
                subtitle: 'TRANSIT VECTOR ALIGNED',
                type: 'static', 
                duration: 25, 
                distance: 4, 
                height: 0.5, 
                speed: 0.02, 
                dampening: 0.5, 
                fov: 60 
            },
            // 3. THE GIANT (New Sequence)
            // We focus on Jupiter to show scale while "traveling"
            { 
                targetId: 'jupiter', 
                // No main title to let the viewer soak in the scale, flight computer handles context
                type: 'orbit', 
                duration: 60, 
                distance: 22, // Close enough to fill screen (Radius 11)
                height: 0, 
                speed: 0.02, 
                dampening: 0.5, 
                showFlightComputer: true,
                originName: 'EUROPA',
                destName: 'GANYMEDE',
                facts: JOVIAN_FACTS,
                fov: 55
            },
            // 4. Ganymede Approach
            { 
                targetId: 'ganymede', 
                type: 'travel', 
                duration: 45, 
                distance: 2.0, // Arrive for spiral
                height: 0.2, 
                speed: 0, 
                side: 'lit', 
                dampening: 0.5, 
            },
            // 5. Arrival
            { 
                targetId: 'ganymede', 
                title: 'GANYMEDE', 
                subtitle: 'ARRIVAL CONFIRMED',
                titleDelay: 4,
                type: 'orbit', 
                duration: 40, 
                distance: 1.5, 
                height: 0.1, 
                speed: 0.1,
                dampening: 0.4
            }
        ]
    },
    {
        id: 'voyager_1',
        name: 'Voyager 1: The Grand Tour',
        description: 'Relive the 45-year journey in 1 hour.',
        shots: [
            {
                targetId: 'earth',
                title: 'VOYAGER 1',
                subtitle: 'LAUNCH: SEPT 5, 1977',
                titleDelay: 2,
                type: 'orbit', 
                duration: 60,
                distance: 5,
                height: 1,
                speed: 0.1,
                dampening: 0.6
            },
            {
                targetId: 'earth',
                title: 'DEPARTURE',
                subtitle: 'A VOYAGERS JOURNEY, BY ZAC.',
                type: 'flyby',
                duration: 60,
                distance: 20,
                height: 5,
                speed: 0.5,
                dampening: 0.6,
                fov: 80
            },
            {
                targetId: 'jupiter',
                type: 'travel',
                duration: 600, 
                distance: 50,
                height: 5,
                speed: 0,
                dampening: 0.5,
                showFlightComputer: true,
                originName: 'EARTH',
                destName: 'JUPITER',
                facts: VOYAGER_FACTS
            },
            {
                targetId: 'jupiter',
                title: 'JUPITER ENCOUNTER',
                subtitle: 'MARCH 1979 // GRAVITY ASSIST',
                titleDelay: 2,
                type: 'flyby',
                duration: 180, 
                distance: 35,
                height: 0,
                speed: 0.15,
                dampening: 0.8,
                fov: 65
            },
             {
                targetId: 'saturn',
                type: 'travel',
                duration: 600, 
                distance: 50,
                height: 5,
                speed: 0,
                dampening: 0.5,
                showFlightComputer: true,
                originName: 'JUPITER',
                destName: 'SATURN',
                facts: VOYAGER_FACTS
            },
            {
                targetId: 'saturn',
                title: 'SATURN ENCOUNTER',
                subtitle: 'NOV 1980 // TITAN FLYBY',
                titleDelay: 2,
                type: 'flyby',
                duration: 180, 
                distance: 40,
                height: 10, 
                speed: 0.1,
                dampening: 0.8,
                fov: 65
            },
            {
                targetId: 'sun',
                title: 'INTERSTELLAR MISSION',
                subtitle: 'HELIOPAUSE CROSSING // 2012',
                type: 'travel',
                duration: 1920, 
                distance: 5000, 
                height: 500, 
                speed: 0,
                dampening: 0.2, 
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
// Use Sine for smoother, less aggressive transitions than Cubic
const easeInOutSine = (x: number): number => -(Math.cos(Math.PI * x) - 1) / 2;
const easeOutSine = (x: number): number => Math.sin((x * Math.PI) / 2);

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
    const currentFacts = data.facts || MARS_FACTS;

    useEffect(() => {
        if (!data.active || !data.startTime) return;
        const interval = setInterval(() => {
            setElapsed(Date.now() - data.startTime!);
        }, 100);
        return () => clearInterval(interval);
    }, [data.active, data.startTime]);

    useEffect(() => {
        if (!data.active) return;
        setFactIndex(0);
        const interval = setInterval(() => {
            setFactIndex(prev => (prev + 1) % currentFacts.length);
        }, 30000); 
        return () => clearInterval(interval);
    }, [data.active, currentFacts.length]);

    if (!data.active || !data.duration) return null;

    const remaining = Math.max(0, data.duration * 1000 - elapsed);
    const progress = Math.min(1, elapsed / (data.duration * 1000));
    
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const totalDistance = 225000000; 
    const currentDist = Math.floor(totalDistance * progress);
    const remainingDist = totalDistance - currentDist;
    const speed = 60000; 

    return (
        <div className="absolute inset-0 pointer-events-none z-40 p-4 md:p-8 flex flex-col justify-between pt-safe-top">
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

            <div className="flex justify-between items-end animate-in fade-in slide-in-from-bottom duration-1000 pb-safe-bottom">
                <div className="bg-black/60 backdrop-blur-md p-6 rounded-tr-2xl border-l-4 border-l-[#DFFF00] border-y border-r border-white/10 w-full max-w-lg hidden md:block">
                    <div key={factIndex} className="mb-6 animate-in fade-in zoom-in duration-500">
                        <div className="text-[#DFFF00] font-mono text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full animate-pulse"></span>
                            Mission Log
                        </div>
                        <h2 className="text-sm md:text-base font-light text-white leading-relaxed opacity-90">
                            "{currentFacts[factIndex]}"
                        </h2>
                    </div>

                    <div className="h-[1px] w-full bg-white/10 mb-4"></div>

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
        orbitAngle: 0,
        entryDistance: 0 
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
        
        let targetPos = new THREE.Vector3();
        if (shot.targetId && refs.current[shot.targetId]) {
            refs.current[shot.targetId].getWorldPosition(targetPos);
            const dx = currentPos.current.x - targetPos.x;
            const dz = currentPos.current.z - targetPos.z;
            transitionState.current.orbitAngle = Math.atan2(dz, dx);
            // Capture entry distance to smoothly blend into the shot's desired radius
            transitionState.current.entryDistance = currentPos.current.distanceTo(targetPos);
        }

        // Overlay logic
        if (shot.showFlightComputer) {
            onOverlayUpdate({ show: false }); 
            onFlightUpdate({ 
                active: true, 
                startTime: Date.now(), 
                duration: shot.duration,
                origin: shot.originName,
                destination: shot.destName,
                facts: shot.facts 
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
                }, delay + 6000); 
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
        if (!shot) return; 

        const elapsed = (Date.now() - shotStartTime) / 1000;
        const progress = Math.min(1, elapsed / shot.duration);
        const smoothProgress = easeInOutSine(progress); // Using Sine for gentler feel

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
                const sunPos = new THREE.Vector3(0,0,0);
                const fromSun = new THREE.Vector3().subVectors(targetCenter, sunPos).normalize().negate(); 
                arrivalOffset.copy(fromSun).multiplyScalar(shot.distance);
                arrivalOffset.y = shot.height;
            }

            const pEnd = targetCenter.clone().add(arrivalOffset);
            const mid = new THREE.Vector3().lerpVectors(pStart, pEnd, 0.5);
            const dist = pStart.distanceTo(pEnd);
            
            // Reduced Y-offset for smoother, less "bumpy" flight path
            const sunDist = mid.distanceTo(new THREE.Vector3(0,0,0));
            if (sunDist < 50) {
                 mid.y += 100;
            } else {
                 mid.y += Math.min(40, dist * 0.15); 
            }

            const t = smoothProgress;
            idealPos.x = (1-t)*(1-t)*pStart.x + 2*(1-t)*t*mid.x + t*t*pEnd.x;
            idealPos.y = (1-t)*(1-t)*pStart.y + 2*(1-t)*t*mid.y + t*t*pEnd.y;
            idealPos.z = (1-t)*(1-t)*pStart.z + 2*(1-t)*t*mid.z + t*t*pEnd.z;

            // SMOOTH LOOK-AT: Blend over 60% of the shot for a lazy, cinematic turn
            // Using smoothstep to remove any harsh start/stop to the rotation
            const rawLookProgress = Math.min(1, progress * 1.5); 
            const lookProgress = THREE.MathUtils.smoothstep(rawLookProgress, 0, 1);
            idealLookAt.lerpVectors(transitionState.current.lookAt, targetCenter, lookProgress);
        }
        else if (shot.type === 'orbit') {
            const angle = transitionState.current.orbitAngle + (elapsed * shot.speed);
            
            // SPIRAL-IN BLENDING:
            // Smoothly blend from entry distance (e.g. 1.5) to orbit distance (e.g. 1.2)
            // over a longer period (8s) using easeOutSine for a very gentle deceleration
            const blendDuration = 8.0; 
            const blendFactor = Math.min(1, elapsed / blendDuration);
            const currentDistance = THREE.MathUtils.lerp(
                transitionState.current.entryDistance, 
                shot.distance, 
                easeOutSine(blendFactor)
            );

            idealPos.x = targetCenter.x + Math.cos(angle) * currentDistance;
            idealPos.z = targetCenter.z + Math.sin(angle) * currentDistance;
            idealPos.y = targetCenter.y + shot.height + (Math.sin(elapsed * 0.2) * 1); // Slower vertical drift
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'flyby') {
            const startOffset = new THREE.Vector3(-shot.distance, shot.height, -shot.distance * 0.5);
            const endOffset = new THREE.Vector3(shot.distance, shot.height, shot.distance * 0.5);
            const currentOffset = new THREE.Vector3().lerpVectors(startOffset, endOffset, smoothProgress);
            idealPos.copy(targetCenter).add(currentOffset);
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'eclipse') {
            const sunPos = new THREE.Vector3(0,0,0);
            const dirFromSun = new THREE.Vector3().subVectors(targetCenter, sunPos).normalize();
            const verticalDrift = Math.sin(elapsed * 0.1) * 5;
            idealPos.copy(targetCenter).add(dirFromSun.multiplyScalar(shot.distance));
            idealPos.y += shot.height + verticalDrift;
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'static') {
            const driftFactor = 1 + (elapsed * 0.005); // Very subtle drift
            const angle = transitionState.current.orbitAngle;
            idealPos.x = targetCenter.x + Math.cos(angle) * (shot.distance * driftFactor);
            idealPos.z = targetCenter.z + Math.sin(angle) * (shot.distance * driftFactor);
            idealPos.y = targetCenter.y + shot.height;
            idealLookAt.copy(targetCenter);
        }

        // WEIGHTY PHYSICS:
        // Use lower dampening (0.6 - 0.8) to simulate a heavy camera rig.
        // It lags slightly behind the ideal position, smoothing out any math jitters.
        const damp = shot.dampening || 0.6; 
        currentPos.current.lerp(idealPos, delta * damp);
        
        // Slower lookAt dampening for that "delayed operator" feel
        currentLookAt.current.lerp(idealLookAt, delta * (damp * 0.5));

        camera.position.copy(currentPos.current);
        camera.lookAt(currentLookAt.current);
        
        if (shot.fov && camera instanceof THREE.PerspectiveCamera) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, shot.fov, delta * 0.5);
            camera.updateProjectionMatrix();
        } else if (camera instanceof THREE.PerspectiveCamera && camera.fov !== 45) {
             camera.fov = THREE.MathUtils.lerp(camera.fov, 45, delta * 0.5);
             camera.updateProjectionMatrix();
        }
    });

    return null;
}