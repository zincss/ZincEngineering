// app/collections/planetarium/constants.ts
// Centralized constants for the planetarium module

// === TIME CONSTANTS ===
export const J2000_EPOCH = 946728000000;
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// === ECONOMY CONSTANTS ===
export const FUEL_COST_PER_UNIT = 0.5;
export const BOOST_COST_PER_UNIT = 5;

// === SPACESHIP CONSTANTS ===
export const DISTANCE_MULTIPLIER = 1275;
export const DOCKING_RANGE = 50;

// === GAMEPLAY CONSTANTS ===
export const NO_LANDING_IDS = [
    'sun', 
    'sagittarius_a', 
    'jupiter', 
    'saturn', 
    'uranus', 
    'neptune', 
    'zinc_prime_stars', 
    'endor_prime'
];

export const UNINHABITABLE_IDS = [
    'sun', 
    'sagittarius_a', 
    'zinc_prime_stars', 
    'jupiter', 
    'saturn', 
    'uranus', 
    'neptune', 
    'endor_prime'
];

// === MINING CONSTANTS ===
export const MINING_LOCATIONS = [
    'ceres',
    'deep_space_99',
    'pluto',
    'kuiper_rest_stop',
    'eris',
    'titania_outpost', // Uranus rings/moon
    'enceladus' // Saturn rings
];

export const MINING_RESOURCES = {
    'ice': { name: 'Water Ice', price: 25, color: '#38bdf8' },
    'iron': { name: 'Iron Ore', price: 35, color: '#a1a1aa' },
    'silicon': { name: 'Silicon', price: 45, color: '#94a3b8' },
    'titanium': { name: 'Titanium', price: 75, color: '#64748b' },
    'gold': { name: 'Gold Ore', price: 150, color: '#facc15' },
    'cobalt': { name: 'Cobalt', price: 220, color: '#1d4ed8' },
    'platinum': { name: 'Platinum', price: 350, color: '#e2e8f0' },
    'palladium': { name: 'Palladium', price: 500, color: '#f472b6' },
    'void_crystal': { name: 'Void Crystal', price: 800, color: '#a855f7' },
    'iridium': { name: 'Iridium', price: 1200, color: '#ef4444' },
    'painite': { name: 'Painite', price: 2500, color: '#ec4899' },
    'low_temp_diamond': { name: 'Low Temp Diamond', price: 5000, color: '#bae6fd' }
};

// === CARGO TIER DEFINITIONS ===
export const CARGO_TIERS = {
    TIER_1: ['Scrap Metal', 'Bio-Waste', 'Water Ice', 'Processed Food', 'Raw Iron'],
    TIER_2: ['Helium-3', 'Machinery', 'Textiles', 'Electronics', 'Fertilizer'],
    TIER_3: ['Rare Ore', 'Medical Supplies', 'Weapons', 'Gold Bullion', 'Cybernetics'],
    TIER_4: ['Data Cores', 'Prototype Tech', 'Zero-G Alloys', 'Sentient AI Units'],
    TIER_5: ['Alien Artifacts', 'Quantum Cores', 'Neutron Star Matter', 'Dark Matter Containers']
};

// === MOVEMENT KEY BINDINGS ===
export const MOVEMENT_KEYS = {
    FORWARD: ['KeyW', 'ArrowUp'],
    BACKWARD: ['KeyS', 'ArrowDown'],
    LEFT: ['KeyA', 'ArrowLeft'],
    RIGHT: ['KeyD', 'ArrowRight'],
    ROLL_LEFT: ['KeyQ'],
    ROLL_RIGHT: ['KeyE'],
    UP: ['KeyR', 'ShiftLeft'],
    DOWN: ['KeyF', 'ControlLeft'],
    BOOST: ['Space'],
    PRECISION: ['Tab'],
    ORBIT: ['KeyO'],
    FLIGHT_ASSIST: ['KeyZ'],
    AUTOPILOT: ['KeyC'],
    MINING: ['KeyM'],
    EXIT: ['Escape']
};

// === EVENT NAMES ===
export const SPACESHIP_UPDATE_EVENT = 'spaceship-update';
export const SPACESHIP_CONTROL_EVENT = 'spaceship-control';
export const SPACESHIP_EXIT_EVENT = 'spaceship-exit';

// === HELPER FUNCTIONS ===
export const isDockableStructure = (type: string): boolean => {
    return ['Station', 'Relay', 'Satellite', 'Ship', 'Telescope', 'Outpost', 'Base', 'Forge', 'City'].includes(type);
};

export const formatDistance = (val: number): string => {
    const km = val * DISTANCE_MULTIPLIER;
    if (km >= 1000000) return (km / 1000000).toFixed(2) + "M km";
    if (km >= 1000) return (km / 1000).toFixed(1) + "k km";
    return km.toFixed(0) + " km";
};

export const formatTime = (secs: number): string => {
    if (!secs || secs === Infinity) return "--:--";
    if (secs > 3600) return "> 1 HR";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
};
