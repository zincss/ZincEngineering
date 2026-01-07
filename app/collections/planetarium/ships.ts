// app/collections/planetarium/ships.ts

export interface ShipHUDConfig {
    primary: string;      // Main color (Speed, borders)
    secondary: string;    // Accent color (highlights)
    alert: string;        // Warning color
    shape: 'rounded' | 'angular' | 'blocky'; // UI shape language
    fontParams: string;   // Optional font tracking/weight tweaks
}

export interface ShipStats {
    id: string;
    name: string;
    description: string;
    manufacturer: string;
    price: number;
    tier: number; // 1 = Starter, 5 = Endgame
    
    // Physics Multipliers
    maxFuel: number;
    maxBoost: number;
    fuelBurnRate: number;
    boostBurnRate: number;
    
    // Flight Characteristics
    acceleration: number;
    turnSpeed: number;
    boostMultiplier: number;
    cruiseSpeed: number;

    // Mining Capabilities
    miningCap: number;      // Cargo space for ore
    miningLaserPower: number; // Speed of mining (1 = standard)
    
    // Visual/Flavor
    color: string;
    hud: ShipHUDConfig;
}

export const SHIP_CATALOG: ShipStats[] = [
    // TIER 1: THE STARTER
    {
        id: "starter_tub",
        name: "Rusty Tub",
        description: "A decommissioned mining pod. It smells like ozone and despair, but it flies.",
        manufacturer: "ScrapCo",
        price: 0,
        tier: 1,
        maxFuel: 1000,
        maxBoost: 50,
        fuelBurnRate: 3.0,
        boostBurnRate: 25.0,
        acceleration: 5.0,
        turnSpeed: 0.8,
        boostMultiplier: 5.0,
        cruiseSpeed: 0.6,
        miningCap: 100,
        miningLaserPower: 1.0,
        color: "#71717a",
        hud: {
            primary: '#fb923c', // Rusty Orange
            secondary: '#78350f', // Dark Brown
            alert: '#ef4444',
            shape: 'blocky',
            fontParams: 'tracking-tight font-mono'
        }
    },
    // TIER 2: STANDARD
    {
        id: "standard_scout",
        name: "Horizon Scout",
        description: "Standard issue exploration vessel. Reliable, balanced, and ubiquitous.",
        manufacturer: "United Aerospace",
        price: 15000,
        tier: 2,
        maxFuel: 2000,
        maxBoost: 100,
        fuelBurnRate: 2.0,
        boostBurnRate: 20.0,
        acceleration: 10.0,
        turnSpeed: 1.5,
        boostMultiplier: 12.0,
        cruiseSpeed: 1.0,
        miningCap: 80,
        miningLaserPower: 1.2,
        color: "#DFFF00",
        hud: {
            primary: '#DFFF00', // Zinc Yellow
            secondary: '#a1a1aa', // Zinc Gray
            alert: '#ef4444',
            shape: 'rounded',
            fontParams: 'tracking-widest'
        }
    },
    // TIER 3: SPECIALIZED
    {
        id: "interceptor_mk1",
        name: "Void Dart",
        description: "Sacrifices fuel capacity for raw speed and aggressive maneuvering thrusters.",
        manufacturer: "Ares Mil-Tech",
        price: 45000,
        tier: 3,
        maxFuel: 800,
        maxBoost: 150,
        fuelBurnRate: 2.5,
        boostBurnRate: 15.0,
        acceleration: 18.0,
        turnSpeed: 2.5,
        boostMultiplier: 18.0,
        cruiseSpeed: 1.2,
        miningCap: 40,
        miningLaserPower: 0.8,
        color: "#ef4444",
        hud: {
            primary: '#ef4444', // Red
            secondary: '#ffffff', // White
            alert: '#f87171',
            shape: 'angular',
            fontParams: 'tracking-normal font-bold'
        }
    },
    {
        id: "hauler_barge",
        name: "Clydesdale Hauler",
        description: "Built for long-haul logistics. Handles like a brick, but runs forever.",
        manufacturer: "Titan Heavy Industries",
        price: 60000,
        tier: 3,
        maxFuel: 5000,
        maxBoost: 80,
        fuelBurnRate: 1.0,
        boostBurnRate: 30.0,
        acceleration: 4.0,
        turnSpeed: 0.5,
        boostMultiplier: 4.0,
        cruiseSpeed: 0.8,
        miningCap: 2500,
        miningLaserPower: 3.0,
        color: "#f59e0b",
        hud: {
            primary: '#f59e0b', // Amber
            secondary: '#000000', // Black
            alert: '#dc2626',
            shape: 'blocky',
            fontParams: 'tracking-wide font-serif'
        }
    },
    // TIER 4: ADVANCED
    {
        id: "stealth_runner",
        name: "Phantom Echo",
        description: "Advanced stealth coatings and silent running engines.",
        manufacturer: "Unknown",
        price: 120000,
        tier: 4,
        maxFuel: 1500,
        maxBoost: 120,
        fuelBurnRate: 1.5,
        boostBurnRate: 18.0,
        acceleration: 12.0,
        turnSpeed: 1.8,
        boostMultiplier: 14.0,
        cruiseSpeed: 1.1,
        miningCap: 120,
        miningLaserPower: 1.5,
        color: "#18181b",
        hud: {
            primary: '#10b981', // Emerald (Night vision style)
            secondary: '#064e3b',
            alert: '#ef4444',
            shape: 'angular',
            fontParams: 'tracking-[0.2em] font-light'
        }
    },
    {
        id: "racing_proto",
        name: "Velocity X-1",
        description: "An engine with a cockpit strapped to it. Dangerous.",
        manufacturer: "Redhead Racing",
        price: 250000,
        tier: 4,
        maxFuel: 1200,
        maxBoost: 200,
        fuelBurnRate: 4.0,
        boostBurnRate: 10.0,
        acceleration: 25.0,
        turnSpeed: 3.0,
        boostMultiplier: 25.0,
        cruiseSpeed: 1.5,
        miningCap: 0,
        miningLaserPower: 0,
        color: "#06b6d4",
        hud: {
            primary: '#06b6d4', // Cyan
            secondary: '#ec4899', // Pink (Synthwave)
            alert: '#ef4444',
            shape: 'rounded',
            fontParams: 'italic font-black italic'
        }
    },
    // TIER 5: ENDGAME
    {
        id: "luxury_yacht",
        name: "Nebula Crown",
        description: "Why fly when you can glide in absolute comfort?",
        manufacturer: "Orbital Dynamics",
        price: 500000,
        tier: 5,
        maxFuel: 3000,
        maxBoost: 100,
        fuelBurnRate: 1.8,
        boostBurnRate: 20.0,
        acceleration: 8.0,
        turnSpeed: 1.2,
        boostMultiplier: 10.0,
        cruiseSpeed: 1.0,
        miningCap: 500,
        miningLaserPower: 2.0,
        color: "#e879f9",
        hud: {
            primary: '#d8b4fe', // Light Purple
            secondary: '#f0abfc', // Fuchsia
            alert: '#ef4444',
            shape: 'rounded',
            fontParams: 'font-serif tracking-widest'
        }
    },
    {
        id: "endgame_dread",
        name: "Oryx's Will",
        description: "The pinnacle of Hive engineering. A mobile fortress.",
        manufacturer: "The Dreadnaught",
        price: 2500000,
        tier: 5,
        maxFuel: 10000,
        maxBoost: 500,
        fuelBurnRate: 0.5,
        boostBurnRate: 5.0,
        acceleration: 15.0,
        turnSpeed: 2.0,
        boostMultiplier: 20.0,
        cruiseSpeed: 1.3,
        miningCap: 10000,
        miningLaserPower: 10.0,
        color: "#5c4f3d",
        hud: {
            primary: '#84cc16', // Lime (Hive magic)
            secondary: '#365314', // Dark Green
            alert: '#ffffff',
            shape: 'angular',
            fontParams: 'tracking-tight'
        }
    }
];

export const getShipById = (id: string | null) => {
    return SHIP_CATALOG.find(s => s.id === id) || SHIP_CATALOG[0];
};