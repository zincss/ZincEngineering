// app/collections/planetarium/components/Cinematic/data.ts

import { CinematicShot, Tour } from './types';
import { PLANET_DATA } from '../../data'; 

// --- FACTS ARRAYS ---
export const SUN_FACTS = [ "The Sun contains 99.86% of the Solar System's total mass.", "Surface temperature is approx. 5,500°C.", "Light takes 8m 20s to reach Earth." ];
export const MERCURY_FACTS = [ "Smallest planet.", "No atmosphere.", "88 Earth days per year." ];
export const VENUS_FACTS = [ "Hottest planet.", "Retrograde rotation.", "Thick sulfuric clouds." ];
export const EARTH_FACTS = [ "Only known life.", "71% water.", "Nitrogen-Oxygen atmosphere." ];
export const MARS_FACTS = [ "The Red Planet.", "Olympus Mons is the largest volcano.", "Two moons: Phobos & Deimos." ];
export const JUPITER_FACTS = [ "Largest planet.", "Great Red Spot storm.", "Shortest day (10h)." ];
export const SATURN_FACTS = [ "Extensive ring system.", "Least dense planet.", "Most moons (146)." ];
export const URANUS_FACTS = [ "Rotates on its side.", "Ice Giant.", "Coldest atmosphere." ];
export const NEPTUNE_FACTS = [ "Strongest winds.", "Discovered by math.", "Ice Giant." ];
export const PLUTO_FACTS = [ "Dwarf Planet.", "Kuiper Belt object.", "5 moons." ];
export const GALACTIC_FACTS = [ "Supermassive Black Hole.", "4 million solar masses.", "Center of Milky Way." ];
export const SCALE_FACTS = [ "Aligning planetary bodies...", "Sorting by radius...", "Comparing celestial magnitude." ];

export const VOYAGER_GENERAL_FACTS = [ "Voyager 1 Interstellar Mission.", "Launched 1977.", "Currently 24B km away." ];
export const VOYAGER_JUPITER_FACTS = [ "Jupiter Encounter: 1979.", "Discovered Io volcanism.", "Gravity assist used." ];
export const VOYAGER_SATURN_FACTS = [ "Saturn Encounter: 1980.", "Titan flyby.", "Departed ecliptic plane." ];
export const INTERSTELLAR_FACTS = [ "Pale Blue Dot: 1990.", "Entered Interstellar Space: 2012.", "Power failing." ];
export const OUMUAMUA_FACTS = [ "First Interstellar Visitor.", "Origin: Vega.", "Hyperbolic trajectory." ];
export const COMMERCIAL_FACTS = [ "Welcome aboard.", "Cruising speed: 75,000 km/h.", "Enjoy the view." ];

// --- DYNAMIC SCALE SHOT GENERATION ---
const generateScaleShots = (): CinematicShot[] => {
    // 1. Replicate sorting (Smallest -> Largest)
    const allBodies = [
        ...PLANET_DATA, 
        ...PLANET_DATA.flatMap(p => p.moons || [])
    ].filter(b => b.type !== 'Star' && b.type !== 'Black Hole');

    allBodies.sort((a, b) => a.radius - b.radius);

    const smallest = allBodies[0];
    const largestPlanet = allBodies[allBodies.length - 1]; // Jupiter typically
    const midPoint = allBodies[Math.floor(allBodies.length * 0.4)];
    const giantsStart = allBodies.find(b => b.radius > 3) || midPoint; // Find first "big" one

    // Preset Start Configuration (Closer & tighter for impact)
    const startOffset: [number, number, number] = [0.8, 0.2, 0.8]; 
    const startLookAt: [number, number, number] = [0, 0, 0];
    const startRoll = 0;
    const startFov = 45;

    return [
        // SHOT 1: THE HEAVY PARADE (Slow, Close, Impactful)
        {
            title: 'COSMIC SCALE', 
            subtitle: 'MAGNITUDE COMPARISON', 
            titleDelay: 1.0, 
            type: 'spline', 
            transition: 'cut', 
            duration: 90, // Slower duration for "heavier" feel
            distance: 0, 
            height: 0, 
            speed: 0, 
            dampening: 0.98, // High dampening for heavy camera feel
            showFlightComputer: true, 
            originName: 'MICRO', 
            destName: 'MACRO', 
            facts: SCALE_FACTS,
            keyframes: [
                // 1. Start: Very close to the smallest body
                { targetId: smallest.id, offset: startOffset, roll: startRoll, fov: startFov },
                
                // 2. Small Bodies: Skimming right past them
                { targetId: allBodies[3].id, offset: [2, 0.5, 2], roll: 5, fov: 50 },
                
                // 3. Mid-Point: Pulling back slightly but staying low
                { targetId: midPoint.id, offset: [8, 2, 8], roll: 0, fov: 55 },
                
                // 4. The Rise: Approaching giants, looking up from below to emphasize scale
                { targetId: giantsStart.id, offset: [15, -5, 15], roll: -5, fov: 60 },
                
                // 5. The Titans: Passing Jupiter/Saturn closely
                { targetId: largestPlanet.id, offset: [50, 0, 40], roll: 0, fov: 65 },
                
                // 6. Arrival: The Sun (Massive scale reveal)
                { targetId: 'sun', offset: [180, 20, 100], roll: 5, fov: 50 }
            ],
            lookAtKeyframes: [
                { targetId: smallest.id, offset: [0, 0, 0] },
                { targetId: midPoint.id, offset: [0, 0, 0] },
                { targetId: largestPlanet.id, offset: [0, 5, 0] }, // Look slightly up at giant
                { targetId: 'sun', offset: [0, 0, 0] }
            ]
        },

        // SHOT 2: THE SMOOTH RETURN (Seamless Loop)
        {
            title: 'RESET', 
            subtitle: 'LOOPING SIMULATION', 
            titleDelay: 2.0,
            type: 'spline', 
            transition: 'smooth', 
            duration: 30, // Gentle return flight
            distance: 0, 
            height: 0, 
            speed: 0, 
            dampening: 0.94,
            showFlightComputer: false, 
            keyframes: [
                // Start from Shot 1 End
                { targetId: 'sun', offset: [180, 20, 100], roll: 5, fov: 50 },
                
                // Pull wide and high to see the whole line
                { targetId: largestPlanet.id, offset: [0, 150, 100], roll: 0, fov: 60 },
                
                // Glide back towards the small end
                { targetId: midPoint.id, offset: [0, 80, 40], roll: 5, fov: 55 },
                
                // Dive in...
                { targetId: smallest.id, offset: [5, 10, 5], roll: 0, fov: 50 },
                
                // SNAP: Perfect loop to start
                { targetId: smallest.id, offset: startOffset, roll: startRoll, fov: startFov }
            ],
            lookAtKeyframes: [
                { targetId: 'sun', offset: [0, 0, 0] },
                { targetId: midPoint.id, offset: [0, 0, 0] },
                { targetId: smallest.id, offset: startLookAt }
            ]
        }
    ];
};

export const SCALE_SHOTS = generateScaleShots();

export const OUMUAMUA_VISIT_SHOTS: CinematicShot[] = [
    // 1. INBOUND FROM VEGA (Deep Space -> Inner System)
    {
        title: 'OUMUAMUA', subtitle: 'MESSENGER FROM AFAR', titleDelay: 3.0, 
        type: 'spline', transition: 'cut', duration: 45, distance: 0, height: 0, speed: 0, dampening: 0.9,
        showFlightComputer: true, originName: 'VEGA (LYRA)', destName: 'SOL', facts: OUMUAMUA_FACTS,
        keyframes: [
            { targetId: 'sun', offset: [500, 200, 1000], roll: 0, fov: 40 }, // Far out
            { targetId: 'sun', offset: [200, 50, 400], roll: 10, fov: 45 },  // Approaching
            { targetId: 'mercury', offset: [50, 20, 50], roll: 20, fov: 50 } // Passing Mercury orbit
        ],
        lookAtKeyframes: [
            { targetId: 'sun', offset: [0, 0, 0] },
            { targetId: 'sun', offset: [0, 0, 0] },
            { targetId: 'sun', offset: [0, 0, 0] }
        ]
    },
    // 2. PERIHELION (The Slingshot)
    {
        title: 'PERIHELION', subtitle: 'MAX VELOCITY: 87.7 KM/S', titleDelay: 2.0,
        type: 'spline', transition: 'smooth', duration: 40, distance: 0, height: 0, speed: 0, dampening: 0.94,
        showFlightComputer: true, originName: 'SOL', destName: 'INTERSTELLAR SPACE', facts: OUMUAMUA_FACTS,
        keyframes: [
            { targetId: 'sun', offset: [50, 20, 50], roll: 20, fov: 50 },
            { targetId: 'sun', offset: [0, 10, 20], roll: 45, fov: 70 },   // Close skim
            { targetId: 'sun', offset: [-40, -10, -40], roll: 20, fov: 55 } // Exit
        ],
        lookAtKeyframes: [
            { targetId: 'sun', offset: [0, 0, 0] },
            { targetId: 'sun', offset: [0, 0, 0] },
            { targetId: 'sun', offset: [0, 0, 0] }
        ]
    },
    // 3. EARTH FLYBY (The Mystery)
    {
        title: 'ANOMALY DETECTED', subtitle: 'NON-GRAVITATIONAL ACCELERATION', titleDelay: 1.0,
        type: 'spline', transition: 'smooth', duration: 45, distance: 0, height: 0, speed: 0, dampening: 0.9,
        showFlightComputer: true, originName: 'SOL', destName: 'PEGASUS', facts: OUMUAMUA_FACTS,
        keyframes: [
            { targetId: 'sun', offset: [-40, -10, -40], roll: 20, fov: 55 },
            { targetId: 'earth', offset: [20, 10, 20], roll: 0, fov: 45 }, // Passing Earth
            { targetId: 'earth', offset: [-10, 5, -10], roll: -10, fov: 50 }
        ],
        lookAtKeyframes: [
            { targetId: 'sun', offset: [0, 0, 0] },
            { targetId: 'earth', offset: [0, 0, 0] },
            { targetId: 'earth', offset: [0, 0, 0] }
        ]
    },
    // 4. DEPARTURE (To Pegasus)
    {
        title: 'DEPARTURE', subtitle: 'INTO THE VOID', titleDelay: 3.0,
        type: 'spline', transition: 'smooth', duration: 60, distance: 0, height: 0, speed: 0, dampening: 0.95,
        showFlightComputer: true, originName: 'SOLAR SYSTEM', destName: 'DEEP SPACE', facts: OUMUAMUA_FACTS,
        keyframes: [
            { targetId: 'earth', offset: [-10, 5, -10], roll: -10, fov: 50 },
            { targetId: 'jupiter', offset: [300, 100, 300], roll: 0, fov: 40 }, // Distant Jupiter view
            { targetId: 'sun', offset: [1000, 500, 1000], roll: 0, fov: 35 }    // Fading sun
        ],
        lookAtKeyframes: [
            { targetId: 'earth', offset: [0, 0, 0] },
            { targetId: 'jupiter', offset: [0, 0, 0] },
            { targetId: 'sun', offset: [0, 0, 0] }
        ]
    }
];

export const TOURS: Tour[] = [
    {
        id: 'grand_tour',
        name: 'The Grand Tour',
        description: 'From the blazing Sun to the supermassive heart of the galaxy.',
        shots: [
            // SUN
            { 
                title: 'THE SUN', subtitle: 'THE ARCHITECT', titleDelay: 4.0, type: 'spline', transition: 'cut', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.94,
                showFlightComputer: true, originName: 'ZINC SYSTEM', destName: 'SOL', facts: SUN_FACTS,
                keyframes: [{ targetId: 'sun', offset: [0, 250, 600], roll: 0, fov: 55 }, { targetId: 'sun', offset: [150, 80, 150], roll: 5, fov: 60 }, { targetId: 'sun', offset: [180, 0, -120], roll: 0, fov: 55 }],
                lookAtKeyframes: [{ targetId: 'sun', offset: [0, 0, 0] }, { targetId: 'sun', offset: [0, 0, 0] }, { targetId: 'sun', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 25, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'SOL', destName: 'MERCURY', facts: MERCURY_FACTS,
                keyframes: [{ targetId: 'sun', offset: [180, 0, -120], roll: 0, fov: 55 }, { targetId: 'mercury', offset: [0, 25, 50], roll: 0, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'sun', offset: [0, 0, 0] }, { targetId: 'mercury', offset: [0, 0, 0] }]
            },
            // MERCURY
            { title: 'MERCURY', subtitle: 'EDGE OF THE SUN', titleDelay: 5.0, type: 'spline', transition: 'smooth', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'SOL', destName: 'MERCURY', facts: MERCURY_FACTS,
                keyframes: [{ targetId: 'mercury', offset: [0, 25, 50], roll: 0, fov: 45 }, { targetId: 'mercury', offset: [6, 2, 2], roll: 15, fov: 60 }, { targetId: 'mercury', offset: [10, -5, -25], roll: 0, fov: 50 }],
                lookAtKeyframes: [{ targetId: 'mercury', offset: [0, 0, 0] }, { targetId: 'mercury', offset: [0, 0, 0] }, { targetId: 'mercury', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 25, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'MERCURY', destName: 'VENUS', facts: VENUS_FACTS,
                keyframes: [{ targetId: 'mercury', offset: [10, -5, -25], roll: 0, fov: 50 }, { targetId: 'venus', offset: [-30, 15, 30], roll: -5, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'mercury', offset: [0, 0, 0] }, { targetId: 'venus', offset: [0, 0, 0] }]
            },
            // VENUS
            { title: 'VENUS', subtitle: 'MORNING STAR', titleDelay: 5.0, type: 'spline', transition: 'smooth', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.92,
                showFlightComputer: true, originName: 'MERCURY', destName: 'VENUS', facts: VENUS_FACTS,
                keyframes: [{ targetId: 'venus', offset: [-30, 15, 30], roll: -5, fov: 45 }, { targetId: 'venus', offset: [-15, 0, -15], roll: -10, fov: 55 }, { targetId: 'venus', offset: [20, -10, -20], roll: 0, fov: 50 }],
                lookAtKeyframes: [{ targetId: 'venus', offset: [0, 0, 0] }, { targetId: 'venus', offset: [0, 0, 0] }, { targetId: 'venus', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 25, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'VENUS', destName: 'EARTH', facts: EARTH_FACTS,
                keyframes: [{ targetId: 'venus', offset: [20, -10, -20], roll: 0, fov: 50 }, { targetId: 'earth', offset: [30, 20, 50], roll: 5, fov: 40 }],
                lookAtKeyframes: [{ targetId: 'venus', offset: [0, 0, 0] }, { targetId: 'earth', offset: [0, 0, 0] }]
            },
            // EARTH
            { title: 'EARTH', subtitle: 'TERRA', titleDelay: 5.0, type: 'spline', transition: 'smooth', duration: 40, distance: 0, height: 0, speed: 0, dampening: 0.94,
                showFlightComputer: true, originName: 'VENUS', destName: 'EARTH', facts: EARTH_FACTS,
                keyframes: [{ targetId: 'earth', offset: [30, 20, 50], roll: 5, fov: 40 }, { targetId: 'earth', offset: [5, 1, 5], roll: 0, fov: 55 }, { targetId: 'moon', offset: [0, 0.5, 3], roll: 0, fov: 60 }, { targetId: 'earth', offset: [-25, -15, -25], roll: 0, fov: 50 }],
                lookAtKeyframes: [{ targetId: 'earth', offset: [0, 0, 0] }, { targetId: 'earth', offset: [0, 0, 0] }, { targetId: 'moon', offset: [0, 0, 0] }, { targetId: 'earth', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 25, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'EARTH', destName: 'MARS', facts: MARS_FACTS,
                keyframes: [{ targetId: 'earth', offset: [-25, -15, -25], roll: 0, fov: 50 }, { targetId: 'mars', offset: [-25, 10, 25], roll: -10, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'earth', offset: [0, 0, 0] }, { targetId: 'mars', offset: [0, 0, 0] }]
            },
            // MARS
            { title: 'MARS', subtitle: 'THE RED PLANET', titleDelay: 4.5, type: 'spline', transition: 'smooth', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'EARTH', destName: 'MARS', facts: MARS_FACTS,
                keyframes: [{ targetId: 'mars', offset: [-25, 10, 25], roll: -10, fov: 45 }, { targetId: 'mars', offset: [0, 2, 4], roll: -25, fov: 65 }, { targetId: 'mars', offset: [20, -10, -20], roll: 0, fov: 50 }],
                lookAtKeyframes: [{ targetId: 'mars', offset: [0, 0, 0] }, { targetId: 'mars', offset: [0, 0, 0] }, { targetId: 'mars', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 30, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'MARS', destName: 'JUPITER', facts: JUPITER_FACTS,
                keyframes: [{ targetId: 'mars', offset: [20, -10, -20], roll: 0, fov: 50 }, { targetId: 'jupiter', offset: [-200, 50, -200], roll: 5, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'mars', offset: [0, 0, 0] }, { targetId: 'jupiter', offset: [0, 0, 0] }]
            },
            // JUPITER
            { title: 'JUPITER', subtitle: 'THE GIANT', titleDelay: 5.0, type: 'spline', transition: 'smooth', duration: 40, distance: 0, height: 0, speed: 0, dampening: 0.94,
                showFlightComputer: true, originName: 'MARS', destName: 'JUPITER', facts: JUPITER_FACTS,
                keyframes: [{ targetId: 'jupiter', offset: [-200, 50, -200], roll: 5, fov: 45 }, { targetId: 'jupiter', offset: [0, 0, -60], roll: 10, fov: 60 }, { targetId: 'jupiter', offset: [200, -50, 200], roll: 0, fov: 50 }],
                lookAtKeyframes: [{ targetId: 'jupiter', offset: [0, 0, 0] }, { targetId: 'jupiter', offset: [0, 0, 0] }, { targetId: 'jupiter', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 30, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'JUPITER', destName: 'SATURN', facts: SATURN_FACTS,
                keyframes: [{ targetId: 'jupiter', offset: [200, -50, 200], roll: 0, fov: 50 }, { targetId: 'saturn', offset: [180, 80, 180], roll: -10, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'jupiter', offset: [0, 0, 0] }, { targetId: 'saturn', offset: [0, 0, 0] }]
            },
            // SATURN
            { title: 'SATURN', subtitle: 'LORD OF THE RINGS', titleDelay: 5.0, type: 'spline', transition: 'smooth', duration: 40, distance: 0, height: 0, speed: 0, dampening: 0.94,
                showFlightComputer: true, originName: 'JUPITER', destName: 'SATURN', facts: SATURN_FACTS,
                keyframes: [{ targetId: 'saturn', offset: [180, 80, 180], roll: -10, fov: 45 }, { targetId: 'saturn', offset: [30, 5, 0], roll: -30, fov: 70 }, { targetId: 'saturn', offset: [-120, -60, -120], roll: 0, fov: 55 }],
                lookAtKeyframes: [{ targetId: 'saturn', offset: [0, 0, 0] }, { targetId: 'saturn', offset: [0, 0, 0] }, { targetId: 'saturn', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 25, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'SATURN', destName: 'URANUS', facts: URANUS_FACTS,
                keyframes: [{ targetId: 'saturn', offset: [-120, -60, -120], roll: 0, fov: 55 }, { targetId: 'uranus', offset: [60, 60, 60], roll: 45, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'saturn', offset: [0, 0, 0] }, { targetId: 'uranus', offset: [0, 0, 0] }]
            },
            // URANUS
            { title: 'URANUS', subtitle: 'ICE GIANT', titleDelay: 4.5, type: 'spline', transition: 'smooth', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'SATURN', destName: 'URANUS', facts: URANUS_FACTS,
                keyframes: [{ targetId: 'uranus', offset: [60, 60, 60], roll: 45, fov: 45 }, { targetId: 'uranus', offset: [0, 0, 15], roll: 90, fov: 60 }, { targetId: 'uranus', offset: [-60, -60, -60], roll: 45, fov: 50 }],
                lookAtKeyframes: [{ targetId: 'uranus', offset: [0, 0, 0] }, { targetId: 'uranus', offset: [0, 0, 0] }, { targetId: 'uranus', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 25, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'URANUS', destName: 'NEPTUNE', facts: NEPTUNE_FACTS,
                keyframes: [{ targetId: 'uranus', offset: [-60, -60, -60], roll: 45, fov: 50 }, { targetId: 'neptune', offset: [-70, 20, -70], roll: 0, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'uranus', offset: [0, 0, 0] }, { targetId: 'neptune', offset: [0, 0, 0] }]
            },
            // NEPTUNE
            { title: 'NEPTUNE', subtitle: 'WINDY GIANT', titleDelay: 4.5, type: 'spline', transition: 'smooth', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'URANUS', destName: 'NEPTUNE', facts: NEPTUNE_FACTS,
                keyframes: [{ targetId: 'neptune', offset: [-70, 20, -70], roll: 0, fov: 45 }, { targetId: 'neptune', offset: [0, 0, 18], roll: -15, fov: 60 }, { targetId: 'neptune', offset: [60, -20, 60], roll: 0, fov: 50 }],
                lookAtKeyframes: [{ targetId: 'neptune', offset: [0, 0, 0] }, { targetId: 'neptune', offset: [0, 0, 0] }, { targetId: 'neptune', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 25, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'NEPTUNE', destName: 'PLUTO', facts: PLUTO_FACTS,
                keyframes: [{ targetId: 'neptune', offset: [60, -20, 60], roll: 0, fov: 50 }, { targetId: 'pluto', offset: [-15, 8, 15], roll: 0, fov: 40 }],
                lookAtKeyframes: [{ targetId: 'neptune', offset: [0, 0, 0] }, { targetId: 'pluto', offset: [0, 0, 0] }]
            },
            // PLUTO
            { title: 'PLUTO', subtitle: 'THE OUTPOST', titleDelay: 4.5, type: 'spline', transition: 'smooth', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.9,
                showFlightComputer: true, originName: 'NEPTUNE', destName: 'PLUTO', facts: PLUTO_FACTS,
                keyframes: [{ targetId: 'pluto', offset: [-15, 8, 15], roll: 0, fov: 40 }, { targetId: 'pluto', offset: [0, 1.5, 4], roll: 10, fov: 55 }, { targetId: 'pluto', offset: [15, -8, 15], roll: 0, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'pluto', offset: [0, 0, 0] }, { targetId: 'pluto', offset: [0, 0, 0] }, { targetId: 'pluto', offset: [0, 0, 0] }]
            },
            // TRANSIT
            { type: 'spline', transition: 'smooth', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.8,
                showFlightComputer: true, originName: 'PLUTO', destName: 'GALACTIC CENTER', facts: GALACTIC_FACTS,
                keyframes: [{ targetId: 'pluto', offset: [15, -8, 15], roll: 0, fov: 45 }, { targetId: 'sagittarius_a', offset: [-500, 200, 1000], roll: 10, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'pluto', offset: [0, 0, 0] }, { targetId: 'sagittarius_a', offset: [0, 0, 0] }]
            },
            // SAGITTARIUS A*
            { title: 'SAGITTARIUS A*', subtitle: 'GALACTIC CENTER', titleDelay: 6.0, type: 'spline', transition: 'smooth', duration: 45, distance: 0, height: 0, speed: 0, dampening: 0.95, shakeIntensity: 0.2,
                showFlightComputer: true, originName: 'PLUTO', destName: 'SAG A*', facts: GALACTIC_FACTS,
                keyframes: [{ targetId: 'sagittarius_a', offset: [-500, 200, 1000], roll: 10, fov: 45 }, { targetId: 'sagittarius_a', offset: [0, 50, 200], roll: 45, fov: 70 }, { targetId: 'sagittarius_a', offset: [500, -200, 500], roll: 90, fov: 55 }],
                lookAtKeyframes: [{ targetId: 'sagittarius_a', offset: [0, 0, 0] }, { targetId: 'sagittarius_a', offset: [0, 0, 0] }, { targetId: 'sagittarius_a', offset: [0, 0, 0] }]
            },
            // WARP LOOP
            { title: 'CHRONOSYNC', subtitle: 'RESETTING SIMULATION', type: 'spline', transition: 'smooth', duration: 15, distance: 0, height: 0, speed: 0, dampening: 0.2, shakeIntensity: 0.8,
                showFlightComputer: true, originName: 'SAG A*', destName: 'SOL', facts: COMMERCIAL_FACTS,
                keyframes: [{ targetId: 'sagittarius_a', offset: [500, -200, 500], roll: 90, fov: 55 }, { targetId: 'sagittarius_a', offset: [2000, 2000, 2000], roll: 180, fov: 160 }, { targetId: 'sun', offset: [0, 500, 1500], roll: 360, fov: 120 }, { targetId: 'sun', offset: [0, 250, 600], roll: 0, fov: 55 }],
                lookAtKeyframes: [{ targetId: 'sagittarius_a', offset: [0, 0, 0] }, { targetId: 'sun', offset: [0, 0, 0] }, { targetId: 'sun', offset: [0, 0, 0] }, { targetId: 'sun', offset: [0, 0, 0] }]
            }
        ]
    },

    {
        id: 'earth_mars_transfer',
        name: 'Earth to Mars Transfer',
        description: 'A cinematic 5-minute injection orbit from Earth to the Red Planet.',
        shots: [
            // 1. COUNTDOWN
            { 
                targetId: 'earth', 
                subtitle: 'SYSTEMS CHECK', 
                countdownStart: 10,
                showFlightComputer: true, originName: 'CAPE CANAVERAL', destName: 'MARS', facts: MARS_FACTS,
                type: 'static', transition: 'cut', duration: 10, distance: 0, height: 0, speed: 0, dampening: 1,
                keyframes: [{ targetId: 'earth', offset: [0, 0.2, 1.2], roll: 0, fov: 45 }, { targetId: 'earth', offset: [0.1, 0.2, 1.2], roll: 0, fov: 45 }],
                lookAtKeyframes: [{ targetId: 'earth', offset: [0, 0, 0] }, { targetId: 'earth', offset: [0, 0, 0] }]
            },
            // 2. LIFTOFF (Reduced Shake)
            { 
                targetId: 'earth', 
                title: 'LIFTOFF', subtitle: 'ACHIEVING MAX BURN', titleDelay: 1.0, 
                showFlightComputer: true, originName: 'EARTH', destName: 'LOW EARTH ORBIT', facts: MARS_FACTS,
                type: 'spline', transition: 'smooth', duration: 40, distance: 0, height: 0, speed: 0, dampening: 0.9, shakeIntensity: 0.05,
                keyframes: [
                    { targetId: 'earth', offset: [0.1, 0.2, 1.2], roll: 0, fov: 45 },
                    { targetId: 'earth', offset: [2, 1, 3], roll: 20, fov: 60 },
                    { targetId: 'earth', offset: [8, 5, 10], roll: 45, fov: 70 }
                ],
                lookAtKeyframes: [{ targetId: 'earth', offset: [0, 0, 0] }, { targetId: 'earth', offset: [0, 0, 0] }, { targetId: 'earth', offset: [0, 0, 0] }]
            },
            // 3. THE TRANSIT (180s)
            { 
                targetId: 'sun', 
                title: 'INTERPLANETARY CRUISE', subtitle: 'DISTANCE: 225M KM', titleDelay: 5.0,
                showFlightComputer: true, originName: 'EARTH', destName: 'MARS', facts: MARS_FACTS,
                type: 'spline', duration: 180, distance: 0, height: 0, speed: 0, dampening: 0.95,
                keyframes: [
                    { targetId: 'earth', offset: [8, 5, 10], roll: 45, fov: 70 },
                    { targetId: 'sun', offset: [50, 20, 50], roll: 0, fov: 50 }, 
                    { targetId: 'mars', offset: [-50, 20, 50], roll: -10, fov: 40 } 
                ],
                lookAtKeyframes: [
                    { targetId: 'earth', offset: [0, 0, 0] }, 
                    { targetId: 'mars', offset: [0, 0, 0] },  
                    { targetId: 'mars', offset: [0, 0, 0] }
                ]
            },
            // 4. MARS APPROACH (60s)
            { 
                targetId: 'mars', 
                title: 'MARS APPROACH', subtitle: 'GRAVITY WELL DETECTED', titleDelay: 4.0,
                showFlightComputer: true, originName: 'DEEP SPACE', destName: 'MARS', facts: MARS_FACTS,
                type: 'spline', transition: 'smooth', duration: 60, distance: 0, height: 0, speed: 0, dampening: 0.92,
                keyframes: [
                    { targetId: 'mars', offset: [-50, 20, 50], roll: -10, fov: 40 },
                    { targetId: 'mars', offset: [-10, 5, 10], roll: -20, fov: 55 },
                    { targetId: 'mars', offset: [-5, 2, 5], roll: -30, fov: 60 }
                ],
                lookAtKeyframes: [{ targetId: 'mars', offset: [0, 0, 0] }, { targetId: 'mars', offset: [0, 0, 0] }, { targetId: 'mars', offset: [0, 0, 0] }]
            },
            // 5. ORBITAL INSERTION (Finale)
            { 
                targetId: 'mars', 
                title: 'ORBITAL INSERTION', subtitle: 'WELCOME TO MARS', titleDelay: 3.0, 
                showFlightComputer: true, originName: 'MARS ORBIT', destName: 'SURFACE', facts: MARS_FACTS,
                type: 'spline', transition: 'smooth', duration: 40, distance: 0, height: 0, speed: 0, dampening: 0.85, shakeIntensity: 0.08,
                keyframes: [
                    { targetId: 'mars', offset: [-5, 2, 5], roll: -30, fov: 60 },
                    { targetId: 'mars', offset: [0, 1, 2], roll: 0, fov: 70 }, 
                    { targetId: 'mars', offset: [3, -1, -3], roll: 10, fov: 50 }
                ],
                lookAtKeyframes: [{ targetId: 'mars', offset: [0, 0, 0] }, { targetId: 'mars', offset: [0, 0, 0] }, { targetId: 'mars', offset: [0, 0, 0] }]
            }
        ]
    },

    {
        id: 'jovian_leap',
        name: 'The Jovian Leap',
        description: 'A high-speed gravity assist through the Jupiter system.',
        shots: [
            // 1. COUNTDOWN
            { 
                targetId: 'europa', 
                subtitle: 'IGNITION SEQUENCE', 
                countdownStart: 5,
                showFlightComputer: true, originName: 'EUROPA BASE', destName: 'GANYMEDE', facts: JUPITER_FACTS,
                type: 'static', transition: 'cut', duration: 5, distance: 0, height: 0, speed: 0, dampening: 1,
                keyframes: [{ targetId: 'europa', offset: [0.4, 0.1, 0.4], roll: 0, fov: 60 }, { targetId: 'europa', offset: [0.4, 0.15, 0.4], roll: 0, fov: 60 }],
                lookAtKeyframes: [{ targetId: 'europa', offset: [0, 0, 0] }, { targetId: 'europa', offset: [0, 0, 0] }]
            },
            // 2. EUROPA DEPARTURE
            { 
                targetId: 'europa', 
                title: 'EUROPA', subtitle: 'SURFACE DEPARTURE', titleDelay: 2.0, 
                showFlightComputer: true, originName: 'EUROPA', destName: 'JUPITER', facts: JUPITER_FACTS,
                type: 'spline', transition: 'cut', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.9, shakeIntensity: 0.05,
                keyframes: [
                    { targetId: 'europa', offset: [0.4, 0.15, 0.4], roll: 0, fov: 60 },
                    { targetId: 'europa', offset: [2, 1, 2], roll: 10, fov: 55 },
                    { targetId: 'europa', offset: [5, 2, 5], roll: 20, fov: 50 }
                ],
                lookAtKeyframes: [{ targetId: 'europa', offset: [0, 0, 0] }, { targetId: 'europa', offset: [0, 0, 0] }, { targetId: 'europa', offset: [0, 0, 0] }]
            },
            // 3. JUPITER TRANSIT (No Clipping!)
            { 
                targetId: 'jupiter', 
                title: 'JUPITER', subtitle: 'GRAVITY WELL TRANSIT', titleDelay: 5.0, 
                showFlightComputer: true, originName: 'EUROPA', destName: 'GANYMEDE', facts: JUPITER_FACTS,
                type: 'spline', transition: 'smooth', duration: 80, distance: 0, height: 0, speed: 0, dampening: 0.94,
                keyframes: [
                    { targetId: 'europa', offset: [5, 2, 5], roll: 20, fov: 50 },
                    { targetId: 'jupiter', offset: [-100, 30, 100], roll: 0, fov: 45 }, // WIDER arc (was -60)
                    { targetId: 'jupiter', offset: [0, 0, 75], roll: -15, fov: 70 },    // WIDER arc (was 45)
                    { targetId: 'jupiter', offset: [100, -30, -30], roll: -30, fov: 55 } // WIDER exit (was 60)
                ],
                lookAtKeyframes: [
                    { targetId: 'jupiter', offset: [0, 0, 0] }, 
                    { targetId: 'jupiter', offset: [0, 0, 0] }, 
                    { targetId: 'jupiter', offset: [0, 0, 0] },
                    { targetId: 'jupiter', offset: [0, 0, 0] }
                ]
            },
            // 4. GANYMEDE ARRIVAL
            { 
                targetId: 'ganymede', 
                title: 'GANYMEDE', subtitle: 'DESTINATION IN SIGHT', titleDelay: 3.0, 
                showFlightComputer: true, originName: 'JUPITER SPACE', destName: 'GANYMEDE', facts: JUPITER_FACTS,
                type: 'spline', transition: 'smooth', duration: 40, distance: 0, height: 0, speed: 0, dampening: 0.9,
                keyframes: [
                    { targetId: 'jupiter', offset: [100, -30, -30], roll: -30, fov: 55 },
                    { targetId: 'ganymede', offset: [-10, 5, -10], roll: 0, fov: 45 },
                    { targetId: 'ganymede', offset: [-2, 1, -2], roll: 10, fov: 60 }
                ],
                lookAtKeyframes: [
                    { targetId: 'ganymede', offset: [0, 0, 0] },
                    { targetId: 'ganymede', offset: [0, 0, 0] },
                    { targetId: 'ganymede', offset: [0, 0, 0] }
                ]
            },
            // 5. FINALE: ORBITAL DOCKING
            { 
                targetId: 'ganymede', 
                title: 'ARRIVAL COMPLETE', subtitle: 'ESTABLISHING ORBIT', titleDelay: 1.0, 
                showFlightComputer: true, originName: 'GANYMEDE', destName: 'STATION', facts: JUPITER_FACTS,
                type: 'spline', transition: 'smooth', duration: 20, distance: 0, height: 0, speed: 0, dampening: 0.95, shakeIntensity: 0.05,
                keyframes: [
                    { targetId: 'ganymede', offset: [-2, 1, -2], roll: 10, fov: 60 },
                    { targetId: 'ganymede', offset: [0, 0.5, 1], roll: 0, fov: 50 } // Gentle stop
                ],
                lookAtKeyframes: [
                    { targetId: 'ganymede', offset: [0, 0, 0] },
                    { targetId: 'ganymede', offset: [0, 0, 0] }
                ]
            }
        ]
    },

    {
        id: 'voyager_1',
        name: 'Voyager 1: The Grand Tour',
        description: 'A 30-minute meditative journey across the solar system.',
        shots: [
            // 1. EARTH DEPARTURE (2 mins)
            { 
                targetId: 'earth', 
                title: 'VOYAGER 1', subtitle: 'SEPT 5, 1977', titleDelay: 3.0, 
                showFlightComputer: true, originName: 'CAPE CANAVERAL', destName: 'JUPITER', facts: VOYAGER_GENERAL_FACTS,
                type: 'spline', transition: 'cut', duration: 120, distance: 0, height: 0, speed: 0, dampening: 0.95, shakeIntensity: 0.02,
                keyframes: [
                    { targetId: 'earth', offset: [0, 0.5, 1], roll: 0, fov: 50 }, 
                    { targetId: 'earth', offset: [2, 1, 3], roll: 5, fov: 55 },
                    { targetId: 'earth', offset: [15, 10, 20], roll: 10, fov: 60 }
                ],
                lookAtKeyframes: [
                    { targetId: 'earth', offset: [0, 0, 0] }, 
                    { targetId: 'earth', offset: [0, 0, 0] }, 
                    { targetId: 'earth', offset: [0, 0, 0] }
                ]
            },
            // 2. THE VOID (5 mins)
            { 
                type: 'spline', transition: 'smooth', duration: 300, distance: 0, height: 0, speed: 0, dampening: 0.98,
                showFlightComputer: true, originName: 'EARTH', destName: 'JUPITER', facts: VOYAGER_GENERAL_FACTS,
                keyframes: [
                    { targetId: 'earth', offset: [15, 10, 20], roll: 10, fov: 60 },
                    { targetId: 'jupiter', offset: [-200, 50, -200], roll: 0, fov: 40 } // Slow drift to Jupiter
                ],
                lookAtKeyframes: [
                    { targetId: 'earth', offset: [0, 0, 0] },
                    { targetId: 'jupiter', offset: [0, 0, 0] }
                ]
            },
            // 3. JUPITER ENCOUNTER (5 mins)
            { 
                targetId: 'jupiter', 
                title: 'JUPITER', subtitle: 'MARCH 5, 1979', titleDelay: 10.0, 
                showFlightComputer: true, originName: 'DEEP SPACE', destName: 'JUPITER', facts: VOYAGER_JUPITER_FACTS,
                type: 'spline', transition: 'smooth', duration: 300, distance: 0, height: 0, speed: 0, dampening: 0.95,
                keyframes: [
                    { targetId: 'jupiter', offset: [-200, 50, -200], roll: 0, fov: 40 },
                    { targetId: 'jupiter', offset: [-50, 10, -50], roll: -5, fov: 50 },
                    { targetId: 'jupiter', offset: [0, 0, 60], roll: -20, fov: 65 }, // Closest approach
                    { targetId: 'jupiter', offset: [100, -20, 100], roll: 0, fov: 50 } // Gravity assist exit
                ],
                lookAtKeyframes: [
                    { targetId: 'jupiter', offset: [0, 0, 0] },
                    { targetId: 'jupiter', offset: [0, 0, 0] },
                    { targetId: 'jupiter', offset: [0, 0, 0] },
                    { targetId: 'jupiter', offset: [0, 0, 0] }
                ]
            },
            // 4. CRUISE TO SATURN (5 mins)
            { 
                type: 'spline', transition: 'smooth', duration: 300, distance: 0, height: 0, speed: 0, dampening: 0.98,
                showFlightComputer: true, originName: 'JUPITER', destName: 'SATURN', facts: VOYAGER_GENERAL_FACTS,
                keyframes: [
                    { targetId: 'jupiter', offset: [100, -20, 100], roll: 0, fov: 50 },
                    { targetId: 'saturn', offset: [-150, 60, -150], roll: -10, fov: 45 }
                ],
                lookAtKeyframes: [
                    { targetId: 'jupiter', offset: [0, 0, 0] },
                    { targetId: 'saturn', offset: [0, 0, 0] }
                ]
            },
            // 5. SATURN ENCOUNTER (5 mins)
            { 
                targetId: 'saturn', 
                title: 'SATURN', subtitle: 'NOV 12, 1980', titleDelay: 10.0, 
                showFlightComputer: true, originName: 'JUPITER', destName: 'SATURN', facts: VOYAGER_SATURN_FACTS,
                type: 'spline', transition: 'smooth', duration: 300, distance: 0, height: 0, speed: 0, dampening: 0.95,
                keyframes: [
                    { targetId: 'saturn', offset: [-150, 60, -150], roll: -10, fov: 45 },
                    { targetId: 'saturn', offset: [0, 5, 50], roll: -45, fov: 75 }, // Titan & Rings flyby
                    { targetId: 'saturn', offset: [100, -80, 100], roll: 0, fov: 55 } // Ecliptic exit
                ],
                lookAtKeyframes: [
                    { targetId: 'saturn', offset: [0, 0, 0] },
                    { targetId: 'saturn', offset: [0, 0, 0] },
                    { targetId: 'saturn', offset: [0, 0, 0] }
                ]
            },
            // 6. PALE BLUE DOT (3 mins)
            { 
                targetId: 'sun', 
                title: 'PALE BLUE DOT', subtitle: 'FEB 14, 1990', titleDelay: 5.0, 
                showFlightComputer: true, originName: 'SATURN', destName: 'VOID', facts: INTERSTELLAR_FACTS,
                type: 'spline', transition: 'smooth', duration: 180, distance: 0, height: 0, speed: 0, dampening: 0.98,
                keyframes: [
                    { targetId: 'saturn', offset: [100, -80, 100], roll: 0, fov: 55 },
                    { targetId: 'sun', offset: [2000, 500, 2000], roll: 180, fov: 40 } // Looking back at Sun
                ],
                lookAtKeyframes: [
                    { targetId: 'saturn', offset: [0, 0, 0] },
                    { targetId: 'sun', offset: [0, 0, 0] }
                ]
            },
            // 7. INTERSTELLAR (5 mins)
            { 
                targetId: 'sun', 
                title: 'INTERSTELLAR SPACE', subtitle: 'PRESENT DAY', titleDelay: 10.0, 
                showFlightComputer: true, originName: 'HELIOSPHERE', destName: 'INTERSTELLAR MEDIUM', facts: INTERSTELLAR_FACTS,
                type: 'spline', transition: 'smooth', duration: 300, distance: 0, height: 0, speed: 0, side: 'dark', dampening: 0.99,
                keyframes: [
                    { targetId: 'sun', offset: [2000, 500, 2000], roll: 180, fov: 40 },
                    { targetId: 'sun', offset: [5000, 2000, 5000], roll: 190, fov: 35 } // Fading into darkness
                ],
                lookAtKeyframes: [
                    { targetId: 'sun', offset: [0, 0, 0] },
                    { targetId: 'sun', offset: [0, 0, 0] }
                ]
            }
        ]
    },

    {
        id: 'oumuamua_visit',
        name: 'Oumuamua',
        description: 'The first interstellar visitor. A 3-minute cinematic recreation.',
        shots: OUMUAMUA_VISIT_SHOTS
    },

    {
        id: 'scale_comparison',
        name: 'Cosmic Scale',
        description: 'A cinematic lineup from smallest to largest.',
        shots: SCALE_SHOTS
    }
];

export function addTour(tour: Tour) {
    const idx = TOURS.findIndex(t => t.id === tour.id);
    if (idx >= 0) {
        TOURS[idx] = tour;
    } else {
        TOURS.push(tour);
    }
}