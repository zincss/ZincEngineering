import { CinematicShot, Tour } from './types';

// --- GENERAL CELESTIAL FACTS (For Grand Tour & General Flights) ---

export const SUN_FACTS = [
    "The Sun contains 99.86% of the Solar System's total mass.",
    "Surface temperature is approx. 5,500°C (10,000°F).",
    "Light from the Sun takes 8 minutes and 20 seconds to reach Earth.",
    "The Sun is a G-type main-sequence star (G2V).",
    "It converts 600 million tons of hydrogen into helium every second.",
    "The Sun's core temperature reaches 15 million degrees Celsius.",
    "Eventually, the Sun will expand into a Red Giant, engulfing Earth."
];

export const MERCURY_FACTS = [
    "Mercury is the smallest planet in the Solar System.",
    "It has no atmosphere to retain heat, causing extreme temp swings.",
    "A year on Mercury is 88 Earth days.",
    "Mercury has the most cratered surface in the Solar System.",
    "It is tidally locked in a 3:2 spin-orbit resonance.",
    "Temperatures range from -173°C at night to 427°C during the day."
];

export const VENUS_FACTS = [
    "Venus spins in the opposite direction (retrograde) to most planets.",
    "It is the hottest planet due to a runaway greenhouse effect.",
    "Atmospheric pressure is 92 times greater than Earth's.",
    "A day on Venus is longer than a year on Venus.",
    "The surface is hidden by thick clouds of sulfuric acid.",
    "Venus is often called Earth's 'sister planet' due to similar size."
];

export const EARTH_FACTS = [
    "Earth is the only planet known to harbor life.",
    "71% of the surface is covered by water.",
    "The atmosphere is 78% nitrogen and 21% oxygen.",
    "Earth's magnetic field protects it from solar wind.",
    "It is the densest planet in the Solar System.",
    "Earth is the only planet not named after a Greek or Roman god."
];

export const MARS_FACTS = [
    "Mars is approx. 140 million miles away from Earth on average.",
    "A day on Mars (Sol) is 24 hours and 37 minutes.",
    "Gravity on Mars is 38% of Earth's gravity.",
    "Olympus Mons on Mars is the largest volcano in the solar system.",
    "Mars appears red due to iron oxide (rust) on its surface.",
    "Mars has two moons: Phobos and Deimos.",
    "Average temperature on Mars is -60 degrees Celsius.",
    "Sunset on Mars appears blue due to the fine dust in the atmosphere.",
    "Mars has the largest dust storms in the solar system."
];

export const JUPITER_FACTS = [
    "Jupiter is the largest planet in our solar system.",
    "It has a Great Red Spot, a storm larger than Earth raging for centuries.",
    "Jupiter has over 90 known moons, including the massive Galilean moons.",
    "It has the shortest day of all planets, rotating in just 10 hours.",
    "Jupiter's magnetic field is 14 times stronger than Earth's.",
    "The planet is a gas giant, composed mostly of hydrogen and helium."
];

export const SATURN_FACTS = [
    "Saturn is the second largest planet, famous for its extensive ring system.",
    "The rings are made mostly of ice particles, some as big as a house.",
    "Saturn is the least dense planet; it would float in water.",
    "It has 146 confirmed moons, the most in the solar system.",
    "Titan, its largest moon, has a thick atmosphere and liquid methane lakes.",
    "Saturn takes 29.4 Earth years to orbit the Sun."
];

export const URANUS_FACTS = [
    "Uranus rotates on its side with an axial tilt of 98 degrees.",
    "It is an Ice Giant, with a mantle of icy water, ammonia, and methane.",
    "Methane in the upper atmosphere gives Uranus its blue-green color.",
    "It was the first planet discovered with a telescope (1781).",
    "Uranus has 27 known moons, named after Shakespearean characters.",
    "It has the coldest planetary atmosphere, reaching -224°C."
];

export const NEPTUNE_FACTS = [
    "Neptune is the most distant major planet from the Sun.",
    "It has the strongest winds in the solar system, reaching 2,100 km/h.",
    "Neptune takes 165 Earth years to complete one orbit.",
    "It was predicted by mathematics before it was directly observed.",
    "Its largest moon, Triton, orbits in the opposite direction (retrograde).",
    "Like Uranus, it is an Ice Giant with a deep blue color."
];

export const PLUTO_FACTS = [
    "Pluto was reclassified as a dwarf planet in 2006.",
    "It resides in the Kuiper Belt, a ring of bodies beyond Neptune.",
    "Pluto has five known moons; Charon is the largest.",
    "A year on Pluto is 248 Earth years.",
    "Its surface features mountains made of water ice.",
    "Sunlight on Pluto is 2,000 times dimmer than on Earth."
];

export const GALACTIC_FACTS = [
    "Sagittarius A* is the supermassive black hole at the Milky Way's center.",
    "It has a mass equal to 4 million Suns.",
    "It is located 26,000 light-years from Earth.",
    "Time dilates significantly near the event horizon.",
    "The gravity is so strong that not even light can escape.",
    "It spins at a significant fraction of the speed of light."
];

// --- MISSION SPECIFIC FACTS ---

export const VOYAGER_GENERAL_FACTS = [
    "MISSION: Voyager 1 Interstellar Mission.",
    "LAUNCH: September 5, 1977 from Cape Canaveral.",
    "OBJECTIVE: Investigate Jupiter, Saturn, and the outer heliosphere.",
    "CURRENT DISTANCE: Over 24 billion km (160 AU) from Earth.",
    "SPEED: 17 km/s (38,000 mph) relative to the Sun.",
    "POWER: Radioisotope Thermoelectric Generators (RTGs).",
    "DATA: It takes over 22 hours for a signal to reach Earth.",
    "GOLDEN RECORD: Carries sounds and images of Earth for alien civilizations.",
    "STATUS: The most distant human-made object in existence.",
    "FUTURE: Will pass within 1.6 light-years of star Gliese 445 in 40,000 years."
];

export const VOYAGER_JUPITER_FACTS = [
    "JUPITER ENCOUNTER: Voyager 1 began photographing Jupiter in Jan 1979.",
    "GRAVITY ASSIST: Voyager used Jupiter to accelerate towards Saturn.",
    "DISCOVERY: Voyager discovered active volcanoes on the moon Io.",
    "RINGS: Voyager confirmed the existence of Jupiter's faint ring system.",
    "DATA RATE: 115.2 kilobits per second at Jupiter encounter.",
    "MAGNETOSPHERE: The spacecraft passed through the deadly radiation belts.",
    "DURATION: The encounter phase lasted several months.",
    "LEGACY: Changed our understanding of gas giants forever."
];

export const VOYAGER_SATURN_FACTS = [
    "SATURN ENCOUNTER: Nov 1980. The spacecraft flew within 124,000 km of the cloud tops.",
    "TITAN: Voyager 1 performed a close flyby of this haze-shrouded moon.",
    "GRAVITY ASSIST: The Titan flyby flung Voyager out of the ecliptic plane.",
    "RINGS: Discovered 'spokes' and braids in the rings.",
    "ATMOSPHERE: Measured wind speeds of 1,800 km/h (1,100 mph).",
    "HEXAGON: Hinted at the polar hexagon structure.",
    "DEPARTURE: This was the final planetary encounter for Voyager 1."
];

export const INTERSTELLAR_FACTS = [
    "PALE BLUE DOT: In 1990, Voyager turned around to take a portrait of the solar system.",
    "HELIOPAUSE: Crossed the boundary of the Sun's influence in August 2012.",
    "INTERSTELLAR MEDIUM: Now sampling the plasma between the stars.",
    "PLASMA WAVE: Detects the 'hum' of interstellar gas.",
    "SILENCE: Power levels are dropping; instruments are being turned off one by one.",
    "ETERNAL: Voyager will wander the Milky Way long after Earth is gone."
];

export const OUMUAMUA_FACTS = [
    "DISCOVERY: Oct 19, 2017. The first interstellar object detected.",
    "NAME: Hawaiian for 'scout' or 'messenger from afar'.",
    "ORIGIN: Vega (Lyra Constellation).",
    "SPEED: 87.7 km/s at perihelion.",
    "SHAPE: Highly elongated, cigar-shaped.",
    "ANOMALY: Showed non-gravitational acceleration."
];

export const COMMERCIAL_FACTS = [
    "Welcome aboard Zinc Spacelines.",
    "Cruising velocity: 75,000 km/h.",
    "Next stop: Destination Unknown.",
    "Please keep gravitational harnesses fastened.",
    "Enjoy the view of the cosmos."
];

// --- SHOT DEFINITIONS ---

export const SCALE_SHOTS: CinematicShot[] = [
    {
        title: 'COSMIC SCALE', subtitle: 'SIZE COMPARISON', titleDelay: 2.0, type: 'spline', transition: 'cut', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.9,
        showFlightComputer: true, originName: 'PLUTO', destName: 'SOL', facts: PLUTO_FACTS,
        keyframes: [{ targetId: 'pluto', offset: [4, 1, 4], roll: 0, fov: 45 }, { targetId: 'mercury', offset: [5, 1, 5], roll: 5, fov: 50 }, { targetId: 'mars', offset: [6, 2, 6], roll: 0, fov: 50 }, { targetId: 'venus', offset: [8, 2, 8], roll: -5, fov: 55 }, { targetId: 'earth', offset: [10, 3, 10], roll: 0, fov: 60 }],
        lookAtKeyframes: [{ targetId: 'pluto', offset: [0, 0, 0] }, { targetId: 'mercury', offset: [0, 0, 0] }, { targetId: 'mars', offset: [0, 0, 0] }, { targetId: 'venus', offset: [0, 0, 0] }, { targetId: 'earth', offset: [0, 0, 0] }]
    },
    {
        title: 'THE GIANTS', subtitle: 'MASSIVE WORLDS', titleDelay: 2.0, type: 'spline', transition: 'smooth', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.9,
        showFlightComputer: true, originName: 'TERRA', destName: 'JUPITER', facts: JUPITER_FACTS,
        keyframes: [{ targetId: 'earth', offset: [10, 3, 10], roll: 0, fov: 60 }, { targetId: 'neptune', offset: [15, 5, 15], roll: 0, fov: 65 }, { targetId: 'uranus', offset: [18, 6, 18], roll: 5, fov: 65 }, { targetId: 'saturn', offset: [25, 8, 25], roll: -5, fov: 70 }, { targetId: 'jupiter', offset: [35, 10, 35], roll: 0, fov: 75 }],
        lookAtKeyframes: [{ targetId: 'earth', offset: [0, 0, 0] }, { targetId: 'neptune', offset: [0, 0, 0] }, { targetId: 'uranus', offset: [0, 0, 0] }, { targetId: 'saturn', offset: [0, 0, 0] }, { targetId: 'jupiter', offset: [0, 0, 0] }]
    },
    {
        title: 'SOL', subtitle: 'THE ANCHOR', titleDelay: 3.0, type: 'spline', transition: 'smooth', duration: 35, distance: 0, height: 0, speed: 0, dampening: 0.94,
        showFlightComputer: true, originName: 'JUPITER', destName: 'SOL', facts: SUN_FACTS,
        keyframes: [{ targetId: 'jupiter', offset: [35, 10, 35], roll: 0, fov: 75 }, { targetId: 'sun', offset: [60, 0, 60], roll: 0, fov: 80 }, { targetId: 'sun', offset: [0, 30, 100], roll: 20, fov: 70 }, { targetId: 'sun', offset: [-60, 0, 60], roll: 0, fov: 60 }],
        lookAtKeyframes: [{ targetId: 'jupiter', offset: [0, 0, 0] }, { targetId: 'sun', offset: [0, 0, 0] }, { targetId: 'sun', offset: [0, 0, 0] }, { targetId: 'sun', offset: [0, 0, 0] }]
    },
    {
        title: 'THE RETURN', subtitle: 'LOOPING SEQUENCE', type: 'spline', transition: 'smooth', duration: 25, distance: 0, height: 0, speed: 0, dampening: 0.7,
        showFlightComputer: true, originName: 'SOL', destName: 'PLUTO', facts: PLUTO_FACTS,
        keyframes: [{ targetId: 'sun', offset: [-60, 0, 60], roll: 0, fov: 60 }, { targetId: 'saturn', offset: [40, 20, 40], roll: -10, fov: 60 }, { targetId: 'mars', offset: [20, 10, 20], roll: 10, fov: 55 }, { targetId: 'pluto', offset: [4, 1, 4], roll: 0, fov: 45 }],
        lookAtKeyframes: [{ targetId: 'sun', offset: [0, 0, 0] }, { targetId: 'jupiter', offset: [0, 0, 0] }, { targetId: 'earth', offset: [0, 0, 0] }, { targetId: 'pluto', offset: [0, 0, 0] }]
    }
];

export const TOURS: Tour[] = [
    // --- 1. THE GRAND TOUR ---
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

    // --- 2. EARTH TO MARS (5 MINUTE EPIC) ---
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

    // --- 3. JOVIAN LEAP (REMASTERED 3 MINUTE JOURNEY) ---
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

    // --- 4. VOYAGER 1 (REMASTERED: 30 MINUTES) ---
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

    // --- 5. OUMUAMUA VISIT ---
    {
        id: 'oumuamua_visit',
        name: 'Oumuamua',
        description: 'The first interstellar visitor.',
        shots: [
            {
                title: 'OUMUAMUA', subtitle: 'THE SCOUT', titleDelay: 1.0, type: 'flyby', transition: 'cut', duration: 120, distance: 50, height: 10, speed: 1.5,
                showFlightComputer: true, originName: 'VEGA', destName: 'PEGASUS', facts: OUMUAMUA_FACTS
            }
        ]
    },

    // --- 6. COSMIC SCALE ---
    {
        id: 'scale_comparison',
        name: 'Cosmic Scale',
        description: 'A cinematic lineup from smallest to largest.',
        shots: SCALE_SHOTS
    }
];

// --- HELPER: ADD TOUR ---
export function addTour(tour: Tour) {
    const idx = TOURS.findIndex(t => t.id === tour.id);
    if (idx >= 0) {
        TOURS[idx] = tour;
    } else {
        TOURS.push(tour);
    }
}