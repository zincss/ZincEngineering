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
    transition?: 'smooth' | 'cut';
    initialAngle?: number; 
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

const OUMUAMUA_FACTS = [
    "DISCOVERY: Oct 19, 2017. The first interstellar object detected passing through the Solar System.",
    "NAME: 'Oumuamua' is Hawaiian for 'scout' or 'messenger from afar arriving first'.",
    "ORIGIN: Entered from the direction of Vega in the constellation Lyra at 26 km/s.",
    "SHAPE: Light curve analysis suggests a highly elongated, cigar-shaped object (10:1 ratio).",
    "SPEED: Peaked at 87.7 km/s (196,000 mph) at perihelion.",
    "TRAJECTORY: Hyperbolic excess velocity (e > 1.2) confirmed it is not gravitationally bound to the Sun.",
    "ANOMALY: Exhibited non-gravitational acceleration, possibly due to cometary outgassing.",
    "SURFACE: Dark red color, consistent with organic-rich tholins irradiated by cosmic rays.",
    "DESTINATION: Heading towards the constellation Pegasus, it will never return.",
    "MYSTERY: Its tumbling motion suggests a violent past event in its home system."
];

// --- CINEMATIC DATA ---
export const TOURS: Tour[] = [
    {
        id: 'grand_tour',
        name: 'The Grand Tour',
        description: 'The definitive cinematic journey through the Cosmos.',
        shots: [
            // --- 1. SYSTEM OVERVIEW (Cut to start position) ---
            { 
                targetId: 'sun', 
                title: 'THE SOLAR SYSTEM', 
                subtitle: 'OUR COSMIC NEIGHBORHOOD', 
                titleDelay: 1, 
                type: 'orbit',
                transition: 'cut', // START HERE INSTANTLY
                duration: 18, 
                distance: 900, 
                height: 400,   
                speed: 0.03, 
                dampening: 0.95, 
                fov: 70        
            },
            // --- 2. SUN APPROACH ---
            { 
                targetId: 'sun', 
                type: 'travel', 
                duration: 12, 
                distance: 55, 
                height: 0, 
                speed: 0, 
                dampening: 0.9,
                fov: 90 
            },
            { 
                targetId: 'sun', 
                title: 'SOL', 
                subtitle: 'G-TYPE MAIN SEQUENCE STAR', 
                titleDelay: 1.5, 
                type: 'orbit', 
                duration: 20, 
                distance: 55, 
                height: 0, 
                speed: 0.04, 
                dampening: 0.8,
                fov: 50
            },
            // --- 3. MERCURY ---
            { targetId: 'mercury', type: 'travel', duration: 15, distance: 4.0, height: 10.0, speed: 0, side: 'lit', dampening: 0.8, fov: 65 },
            { targetId: 'mercury', title: 'MERCURY', subtitle: 'THE SWIFT PLANET', titleDelay: 1.0, type: 'orbit', duration: 18, distance: 3.5, height: 0.5, speed: 0.06, dampening: 0.7, fov: 45 },

            // --- 4. VENUS ---
            { targetId: 'venus', type: 'travel', duration: 18, distance: 6.0, height: 15.0, speed: 0, side: 'lit', dampening: 0.85 },
            { targetId: 'venus', title: 'VENUS', subtitle: 'THE MORNING STAR', titleDelay: 1.5, type: 'orbit', duration: 20, distance: 6.0, height: 0, speed: 0.04, dampening: 0.8 },

            // --- 5. EARTH ---
            { targetId: 'earth', type: 'travel', duration: 20, distance: 7.0, height: 12.0, speed: 0, side: 'lit', dampening: 0.9 },
            { targetId: 'earth', title: 'EARTH', subtitle: 'PALE BLUE DOT', titleDelay: 2.0, type: 'orbit', duration: 22, distance: 7.0, height: 2.0, speed: 0.03, dampening: 0.8 },

            // --- 6. MOON ---
            { targetId: 'moon', type: 'travel', duration: 8, distance: 2.0, height: 1.0, speed: 0, dampening: 0.7 },
            { targetId: 'moon', title: 'LUNA', subtitle: 'SILENT GUARDIAN', titleDelay: 0.5, type: 'orbit', duration: 18, distance: 2.2, height: 0.2, speed: 0.05, dampening: 0.7, fov: 40 },

            // --- 7. MARS ---
            { targetId: 'mars', type: 'travel', duration: 25, distance: 5.0, height: 20.0, speed: 0, side: 'lit', dampening: 0.9 },
            { targetId: 'mars', title: 'MARS', subtitle: 'THE RED PLANET', titleDelay: 2.0, type: 'orbit', duration: 22, distance: 5.0, height: 1.0, speed: 0.05, dampening: 0.8 },

            // --- 8. JUPITER ---
            { targetId: 'jupiter', type: 'travel', duration: 35, distance: 75, height: 40, speed: 0, side: 'lit', dampening: 0.95 },
            { targetId: 'jupiter', title: 'JUPITER', subtitle: 'KING OF WORLDS', titleDelay: 3.0, type: 'orbit', duration: 25, distance: 75, height: 0, speed: 0.02, dampening: 0.9, fov: 60 },
            
            // --- 9. SATURN ---
            { targetId: 'saturn', type: 'travel', duration: 30, distance: 70, height: 30, speed: 0, side: 'lit', dampening: 0.95 },
            { targetId: 'saturn', title: 'SATURN', subtitle: 'THE JEWEL', titleDelay: 2.0, type: 'orbit', duration: 25, distance: 70, height: 15, speed: 0.02, dampening: 0.9 },
            { targetId: 'saturn', type: 'flyby', duration: 20, distance: 60, height: 50, speed: 0.1, dampening: 0.8, fov: 75 },

            // --- 10. URANUS ---
            { targetId: 'uranus', type: 'travel', duration: 25, distance: 35, height: 10, speed: 0, side: 'lit', dampening: 0.9 },
            { targetId: 'uranus', title: 'URANUS', subtitle: 'SIDEWAYS GIANT', titleDelay: 1.5, type: 'orbit', duration: 20, distance: 35, height: 0, speed: 0.04, dampening: 0.8 },

            // --- 11. NEPTUNE ---
            { targetId: 'neptune', type: 'travel', duration: 25, distance: 32, height: 10, speed: 0, side: 'lit', dampening: 0.9 },
            { targetId: 'neptune', title: 'NEPTUNE', subtitle: 'THE WINDY GIANT', titleDelay: 1.5, type: 'orbit', duration: 20, distance: 32, height: 0, speed: 0.04, dampening: 0.8 },

            // --- 12. PLUTO ---
            { targetId: 'pluto', type: 'travel', duration: 30, distance: 5.0, height: 10, speed: 0, side: 'lit', dampening: 0.9 },
            { targetId: 'pluto', title: 'PLUTO', subtitle: 'THE HEART', titleDelay: 2.0, type: 'orbit', duration: 25, distance: 4.5, height: 1.0, speed: 0.06, dampening: 0.8, fov: 45 },

            // --- 13. THE DEPARTURE (Pull Back) ---
            {
                targetId: 'sun', 
                title: 'DEPARTURE',
                subtitle: 'LEAVING THE HELIOSPHERE',
                type: 'travel',
                duration: 20,
                distance: 2000, 
                height: 500,
                speed: 0,
                dampening: 0.95,
                fov: 80
            },
            // --- 14. WARP TO GALACTIC CORE ---
            { 
                targetId: 'sagittarius_a', 
                type: 'travel', 
                duration: 10, 
                distance: 500, 
                height: 200, 
                speed: 0, 
                dampening: 0.6, 
                fov: 130 
            },
            // --- 15. SAGITTARIUS A* ARRIVAL ---
            { 
                targetId: 'sagittarius_a', 
                title: 'SAGITTARIUS A*', 
                subtitle: 'SUPERMASSIVE BLACK HOLE', 
                titleDelay: 1.0, 
                type: 'orbit', 
                duration: 35, 
                distance: 350, 
                height: 80, 
                speed: 0.08, 
                dampening: 0.95, 
                fov: 60
            },
            // --- 16. THE EVENT HORIZON ---
            { 
                targetId: 'sagittarius_a',
                title: 'EVENT HORIZON',
                subtitle: 'NO RETURN',
                type: 'travel',
                duration: 25,
                distance: 60, 
                height: 10,
                speed: 0,
                dampening: 0.9,
                fov: 90
            },
            // --- 17. THE PLUNGE (Loop) ---
            { 
                targetId: 'sagittarius_a', 
                type: 'flyby', 
                transition: 'cut', 
                duration: 5, 
                distance: 0, 
                height: 0, 
                speed: 5.0, 
                dampening: 0.1,
                fov: 150 
            },
            // --- 18. RESET ---
            { 
                targetId: 'sun', 
                title: 'CYCLE COMPLETE',
                subtitle: 'REBOOTING SIMULATION...',
                titleDelay: 0.5,
                type: 'travel', 
                duration: 6, 
                distance: 900, 
                height: 400, 
                speed: 0, 
                dampening: 0.1, 
                fov: 70 
            },
        ]
    },
    // --- UPDATED: EARTH TO MARS TRANSFER (~300 seconds / 5 mins) ---
    {
        id: 'earth_mars_transfer',
        name: 'Earth to Mars Transfer',
        description: 'A cinematic 5-minute journey to the Red Planet.',
        shots: [
            // 1. LAUNCH PREP: Instant cut to launch position
            // Earth Radius is 1. We position at 1.1 to be close but safe.
            { 
                targetId: 'earth', 
                title: 'SYSTEM CHECKS', 
                subtitle: 'T-MINUS 10 SECONDS',
                titleDelay: 0.5,
                type: 'static', 
                transition: 'cut', // SNAP TO POSITION
                duration: 10, 
                distance: 1.1, 
                height: 0.1, 
                speed: 0,
                dampening: 1,
                fov: 75
            },
            // 2. LIFTOFF / ASCENT
            { 
                targetId: 'earth', 
                title: 'LIFTOFF', 
                subtitle: 'CLEARING ATMOSPHERE',
                type: 'orbit', 
                duration: 40, 
                distance: 1.4, // Rising
                height: 0.2, 
                speed: 0.05,
                dampening: 0.6,
                fov: 70
            },
            // 3. INJECTION BURN: Pulling away from Earth rapidly
            { 
                targetId: 'earth', 
                title: 'INJECTION BURN',
                subtitle: 'LEAVING ORBIT',
                type: 'travel', 
                duration: 40, 
                distance: 50, // Pull back far
                height: 10, 
                speed: 0.0, 
                dampening: 0.4, 
                fov: 60 
            },
            // 4. THE LOOKBACK: Mid-transit view of the system
            {
                targetId: 'sun',
                title: 'INTERPLANETARY CRUISE',
                subtitle: 'LOOKING BACK',
                type: 'orbit',
                duration: 30,
                distance: 200,
                height: 10,
                speed: 0.02,
                dampening: 0.8,
                fov: 55
            },
            // 5. THE LONG HAUL: Flight Computer Travel (~2.5 mins)
            { 
                targetId: 'mars', 
                type: 'travel', 
                duration: 140, // The bulk of the journey
                distance: 2.5, 
                height: 0.5, 
                speed: 0, 
                side: 'lit', 
                dampening: 0.5, 
                showFlightComputer: true,
                originName: 'EARTH',
                destName: 'MARS',
                facts: MARS_FACTS,
                fov: 45
            },
            // 6. APPROACH: Getting close to Mars (Radius 0.53)
            { 
                targetId: 'mars', 
                title: 'MARS ARRIVAL', 
                subtitle: 'AEROBRAKING MANEUVER',
                titleDelay: 1,
                type: 'travel', 
                duration: 20, 
                distance: 1.0, 
                height: 0, 
                speed: 0,
                dampening: 0.7,
                fov: 60
            },
            // 7. ORBITAL INSERTION: Final parking orbit
            {
                targetId: 'mars',
                title: 'ORBIT ESTABLISHED',
                subtitle: 'WELCOME TO THE RED PLANET',
                type: 'orbit',
                duration: 20,
                distance: 0.8, // Safe close orbit
                height: 0.1,
                speed: 0.08,
                dampening: 0.6,
                fov: 55
            }
        ]
    },
    // --- UPDATED: JOVIAN LEAP (~180 seconds / 3 mins) ---
    {
        id: 'jovian_leap',
        name: 'The Jovian Leap',
        description: 'A 3-minute transfer from Europa to Ganymede.',
        shots: [
            // 1. EUROPA SURFACE: Cut to start position
            // Europa Radius 0.25. Pos at 0.28.
            { 
                targetId: 'europa', 
                title: 'EUROPA BASE', 
                subtitle: 'PRE-FLIGHT CHECK',
                titleDelay: 0.5,
                type: 'static', 
                transition: 'cut', // SNAP TO POSITION
                duration: 10, 
                distance: 0.28, 
                height: 0.02, 
                speed: 0,
                dampening: 1,
                fov: 70
            },
            // 2. DEPARTURE
            { 
                targetId: 'europa', 
                title: 'DEPARTURE', 
                subtitle: 'ICE SHELL CLEARED',
                type: 'orbit', 
                duration: 30, 
                distance: 0.6, 
                height: 0.1, 
                speed: 0.08,
                dampening: 0.5,
                fov: 65
            },
            // 3. JUPITER VIEW: Look at the giant
            { 
                targetId: 'jupiter', 
                title: 'JUPITER TRANSIT',
                subtitle: 'GRAVITY ASSIST',
                type: 'orbit', 
                duration: 30, 
                distance: 30, 
                height: 5, 
                speed: 0.02, 
                dampening: 0.8, 
                fov: 50 
            },
            // 4. CRUISE: To Ganymede
            { 
                targetId: 'ganymede', 
                type: 'travel', 
                duration: 80, // Travel time
                distance: 2.0, 
                height: 0.5, 
                speed: 0, 
                side: 'lit', 
                dampening: 0.6, 
                showFlightComputer: true,
                originName: 'EUROPA',
                destName: 'GANYMEDE',
                facts: JOVIAN_FACTS
            },
            // 5. APPROACH: Ganymede (Radius 0.41)
            { 
                targetId: 'ganymede', 
                title: 'GANYMEDE APPROACH', 
                subtitle: 'MAGNETOSPHERE ENTRY',
                titleDelay: 1,
                type: 'travel', 
                duration: 15, 
                distance: 0.6, 
                height: 0, 
                speed: 0,
                dampening: 0.7 
            },
            // 6. LANDING ORBIT
            { 
                targetId: 'ganymede', 
                title: 'TOUCHDOWN', 
                subtitle: 'LARGEST MOON IN SYSTEM',
                titleDelay: 1,
                type: 'orbit', 
                duration: 15, 
                distance: 0.55, 
                height: 0.05, 
                speed: 0.1,
                dampening: 0.5,
                fov: 60
            }
        ]
    },
    // --- UPDATED: OUMUAMUA VISIT (3 Minutes) ---
    {
        id: 'oumuamua_visit',
        name: 'Oumuamua: The Messenger',
        description: 'POV of the first interstellar visitor.',
        shots: [
            // 1. THE VOID (Approach from Deep Space)
            { 
                targetId: 'sun', 
                title: "'OUMUAMUA", 
                subtitle: 'INBOUND VECTOR // LYRA',
                titleDelay: 2,
                type: 'travel', 
                transition: 'cut', // Snap to start
                duration: 30, 
                distance: 1200, // Way out
                height: 400, 
                speed: 0, 
                dampening: 0.1, // Drifting feel
                fov: 70 
            },
            // 2. ACCELERATION (Falling into the well)
            { 
                targetId: 'sun', 
                title: 'GRAVITY WELL', 
                subtitle: 'VELOCITY: 26 KM/S',
                type: 'travel', 
                duration: 40, 
                distance: 90, // Getting to inner system
                height: 20, 
                speed: 0, 
                dampening: 0.2, // Loose physics for speed
                fov: 100 // Warping vision
            },
            // 3. THE SLINGSHOT (Perihelion)
            // UPDATED: Distance 60 (Sun radius is 25).
            { 
                targetId: 'sun', 
                title: 'PERIHELION', 
                subtitle: 'VELOCITY: 87.7 KM/S',
                type: 'flyby', 
                duration: 30, 
                distance: 60, 
                height: 15, 
                speed: 1.5, // Extreme speed pass
                dampening: 0.1, 
                fov: 110 // Max speed effect
            },
            // 4. OUTBOUND CRUISE (Computer Stats)
            {
                targetId: 'earth', // Passing Earth orbit on way out
                type: 'travel',
                duration: 40,
                distance: 30, // Passing distance
                height: 10,
                speed: 0,
                dampening: 0.3,
                showFlightComputer: true,
                originName: 'DEEP SPACE',
                destName: 'PEGASUS',
                facts: OUMUAMUA_FACTS
            },
            // 5. DEPARTURE (Fading into dark)
            { 
                targetId: 'sun', // Looking back
                title: 'DEPARTURE', 
                subtitle: 'EXITING HELIOSPHERE',
                type: 'travel', 
                duration: 40, 
                distance: 2500, // Fading away
                height: 200, 
                speed: 0, 
                dampening: 0.1, // Drifting forever
                fov: 60 
            }
        ]
    },
    {
        id: 'voyager_1',
        name: 'Voyager 1: The Grand Tour',
        description: 'Relive the 45-year journey in 1 hour.',
        shots: [
            { targetId: 'earth', title: 'VOYAGER 1', subtitle: 'LAUNCH: SEPT 5, 1977', titleDelay: 2, type: 'orbit', duration: 60, distance: 5, height: 1, speed: 0.1, dampening: 0.6 },
            { targetId: 'earth', title: 'DEPARTURE', subtitle: 'A VOYAGERS JOURNEY, BY ZAC.', type: 'flyby', duration: 60, distance: 20, height: 5, speed: 0.5, dampening: 0.6, fov: 80 },
            { targetId: 'jupiter', type: 'travel', duration: 600, distance: 50, height: 5, speed: 0, dampening: 0.5, showFlightComputer: true, originName: 'EARTH', destName: 'JUPITER', facts: VOYAGER_FACTS },
            { targetId: 'jupiter', title: 'JUPITER ENCOUNTER', subtitle: 'MARCH 1979 // GRAVITY ASSIST', titleDelay: 2, type: 'flyby', duration: 180, distance: 35, height: 0, speed: 0.15, dampening: 0.8, fov: 65 },
            { targetId: 'saturn', type: 'travel', duration: 600, distance: 50, height: 5, speed: 0, dampening: 0.5, showFlightComputer: true, originName: 'JUPITER', destName: 'SATURN', facts: VOYAGER_FACTS },
            { targetId: 'saturn', title: 'SATURN ENCOUNTER', subtitle: 'NOV 1980 // TITAN FLYBY', titleDelay: 2, type: 'flyby', duration: 180, distance: 40, height: 10, speed: 0.1, dampening: 0.8, fov: 65 },
            { targetId: 'sun', title: 'INTERSTELLAR MISSION', subtitle: 'HELIOPAUSE CROSSING // 2012', type: 'travel', duration: 1920, distance: 5000, height: 500, speed: 0, dampening: 0.2, showFlightComputer: true, originName: 'SATURN', destName: 'DEEP SPACE', facts: VOYAGER_FACTS, side: 'dark' }
        ]
    }
];

// --- MATH HELPERS ---
const easeInOutSine = (x: number): number => -(Math.cos(Math.PI * x) - 1) / 2;
const easeOutSine = (x: number): number => Math.sin((x * Math.PI) / 2);

// --- CINEMATIC OVERLAY COMPONENT ---
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

// --- FLIGHT COMPUTER COMPONENT ---
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

// --- CINEMATIC DIRECTOR (FIXED CAMERA SNAP) ---
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
        entryDistance: 0,
        entryHeight: 0 
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
        
        // Setup Next Shot Target
        let targetPos = new THREE.Vector3();
        if (shot.targetId && refs.current[shot.targetId]) {
            refs.current[shot.targetId].getWorldPosition(targetPos);
            const dx = currentPos.current.x - targetPos.x;
            const dz = currentPos.current.z - targetPos.z;
            const dy = currentPos.current.y - targetPos.y; 
            
            if (shot.transition !== 'cut') {
                 transitionState.current.orbitAngle = Math.atan2(dz, dx);
                 transitionState.current.entryDistance = Math.sqrt(dx*dx + dz*dz); 
                 transitionState.current.entryHeight = dy; 
            } else {
                transitionState.current.orbitAngle = shot.initialAngle !== undefined ? shot.initialAngle : Math.atan2(dz, dx);
                const d = shot.distance;
                const a = transitionState.current.orbitAngle;
                const snapX = targetPos.x + Math.cos(a) * d;
                const snapZ = targetPos.z + Math.sin(a) * d;
                const snapY = targetPos.y + shot.height;
                currentPos.current.set(snapX, snapY, snapZ);
                currentLookAt.current.copy(targetPos);
                transitionState.current.pos.copy(currentPos.current);
                transitionState.current.entryDistance = shot.distance;
                transitionState.current.entryHeight = shot.height;
            }
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
        const smoothProgress = easeInOutSine(progress);

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
            
            const arcHeight = Math.max(shot.height * 2.5, dist * 0.25); 
            mid.y += arcHeight; 

            const t = smoothProgress;
            idealPos.x = (1-t)*(1-t)*pStart.x + 2*(1-t)*t*mid.x + t*t*pEnd.x;
            idealPos.y = (1-t)*(1-t)*pStart.y + 2*(1-t)*t*mid.y + t*t*pEnd.y;
            idealPos.z = (1-t)*(1-t)*pStart.z + 2*(1-t)*t*mid.z + t*t*pEnd.z;

            const rawLookProgress = Math.min(1, progress * 1.5); 
            const lookProgress = THREE.MathUtils.smoothstep(rawLookProgress, 0, 1);
            idealLookAt.lerpVectors(transitionState.current.lookAt, targetCenter, lookProgress);
        }
        else if (shot.type === 'orbit') {
            const angle = transitionState.current.orbitAngle + (elapsed * shot.speed);
            
            let currentDistance = shot.distance;
            let currentHeight = shot.height;
            
            if (shot.transition !== 'cut') {
                const blendDuration = 6.0; 
                const blendFactor = Math.min(1, elapsed / blendDuration);
                const easedBlend = easeOutSine(blendFactor);
                
                currentDistance = THREE.MathUtils.lerp(transitionState.current.entryDistance, shot.distance, easedBlend);
                currentHeight = THREE.MathUtils.lerp(transitionState.current.entryHeight, shot.height, easedBlend);
            }

            idealPos.x = targetCenter.x + Math.cos(angle) * currentDistance;
            idealPos.z = targetCenter.z + Math.sin(angle) * currentDistance;
            idealPos.y = targetCenter.y + currentHeight + (Math.sin(elapsed * 0.2) * 1);
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'flyby') {
            const startOffset = new THREE.Vector3(-shot.distance, shot.height, -shot.distance * 0.5);
            const endOffset = new THREE.Vector3(shot.distance, shot.height, shot.distance * 0.5);
            
            if (shot.initialAngle !== undefined) {
                 const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), shot.initialAngle);
                 startOffset.applyQuaternion(rot);
                 endOffset.applyQuaternion(rot);
            }

            const currentOffset = new THREE.Vector3().lerpVectors(startOffset, endOffset, smoothProgress);
            idealPos.copy(targetCenter).add(currentOffset);
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'static') {
            const driftFactor = 1 + (elapsed * 0.005); 
            const angle = transitionState.current.orbitAngle;
            idealPos.x = targetCenter.x + Math.cos(angle) * (shot.distance * driftFactor);
            idealPos.z = targetCenter.z + Math.sin(angle) * (shot.distance * driftFactor);
            idealPos.y = targetCenter.y + shot.height;
            idealLookAt.copy(targetCenter);
        }

        const damp = shot.dampening || 0.6; 
        currentPos.current.lerp(idealPos, delta * damp);
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