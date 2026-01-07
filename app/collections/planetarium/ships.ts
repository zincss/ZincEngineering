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

// REFINED MANUFACTURER HUD DEFINITIONS (Following site aesthetic)
const HUD_ZINC: ShipHUDConfig = { primary: '#DFFF00', secondary: '#a1a1aa', alert: '#ef4444', shape: 'rounded', fontParams: 'tracking-tight' };
const HUD_AUSSIE: ShipHUDConfig = { primary: '#fbbf24', secondary: '#a1a1aa', alert: '#ef4444', shape: 'blocky', fontParams: 'font-mono' };
const HUD_ARES: ShipHUDConfig = { primary: '#ef4444', secondary: '#ffffff', alert: '#f87171', shape: 'angular', fontParams: 'tracking-tighter' };
const HUD_TITAN: ShipHUDConfig = { primary: '#f59e0b', secondary: '#a1a1aa', alert: '#ef4444', shape: 'blocky', fontParams: 'tracking-tight' };
const HUD_INTAKE: ShipHUDConfig = { primary: '#06b6d4', secondary: '#ec4899', alert: '#ef4444', shape: 'rounded', fontParams: 'italic' };
const HUD_ORBITAL: ShipHUDConfig = { primary: '#d8b4fe', secondary: '#ffffff', alert: '#ef4444', shape: 'rounded', fontParams: 'tracking-widest' };

export const SHIP_CATALOG: ShipStats[] = [
    // --- TIER 1: ENTRY LEVEL ---
    {
        id: "starter_tub",
        name: "Old Reliable",
        description: "A rugged, legacy mining pod from the Aussie outback. Built to last, not to look good.",
        manufacturer: "Australian Dynamics",
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
        miningCap: 150,
        miningLaserPower: 1.0,
        color: "#71717a",
        hud: HUD_AUSSIE
    },
    {
        id: "zac_sparrow",
        name: "Sparrow",
        description: "The standard entry point for Zinc pilots. Agile and efficient.",
        manufacturer: "Zinc Aerospace",
        price: 2500,
        tier: 1,
        maxFuel: 1200,
        maxBoost: 60,
        fuelBurnRate: 2.5,
        boostBurnRate: 22.0,
        acceleration: 8.0,
        turnSpeed: 1.2,
        boostMultiplier: 8.0,
        cruiseSpeed: 0.8,
        miningCap: 80,
        miningLaserPower: 0.8,
        color: "#DFFF00",
        hud: HUD_ZINC
    },
    {
        id: "aud_wombat",
        name: "Wombat",
        description: "Heavy-duty entry level hauler. It's built like a tank.",
        manufacturer: "Australian Dynamics",
        price: 5000,
        tier: 1,
        maxFuel: 2000,
        maxBoost: 40,
        fuelBurnRate: 2.0,
        boostBurnRate: 30.0,
        acceleration: 4.0,
        turnSpeed: 0.6,
        boostMultiplier: 4.0,
        cruiseSpeed: 0.5,
        miningCap: 400,
        miningLaserPower: 1.5,
        color: "#92400e",
        hud: HUD_AUSSIE
    },

    // --- TIER 2: STANDARD ---
    {
        id: "standard_scout",
        name: "Horizon Scout",
        description: "Balanced exploration vessel with upgraded sensors and fuel efficiency.",
        manufacturer: "Zinc Aerospace",
        price: 15000,
        tier: 2,
        maxFuel: 2500,
        maxBoost: 100,
        fuelBurnRate: 1.8,
        boostBurnRate: 20.0,
        acceleration: 10.0,
        turnSpeed: 1.5,
        boostMultiplier: 12.0,
        cruiseSpeed: 1.0,
        miningCap: 120,
        miningLaserPower: 1.2,
        color: "#DFFF00",
        hud: HUD_ZINC
    },
    {
        id: "aud_dingo",
        name: "Dingo Mk-II",
        description: "A fast, nimble utility scout favored by frontier explorers.",
        manufacturer: "Australian Dynamics",
        price: 18000,
        tier: 2,
        maxFuel: 1800,
        maxBoost: 120,
        fuelBurnRate: 2.2,
        boostBurnRate: 18.0,
        acceleration: 14.0,
        turnSpeed: 1.8,
        boostMultiplier: 15.0,
        cruiseSpeed: 1.2,
        miningCap: 60,
        miningLaserPower: 1.0,
        color: "#f59e0b",
        hud: HUD_AUSSIE
    },
    {
        id: "tin_mule",
        name: "Iron Mule",
        description: "The backbone of industrial mining operations. Solid and reliable.",
        manufacturer: "Titan Industries",
        price: 25000,
        tier: 2,
        maxFuel: 4000,
        maxBoost: 60,
        fuelBurnRate: 1.2,
        boostBurnRate: 35.0,
        acceleration: 4.5,
        turnSpeed: 0.5,
        boostMultiplier: 5.0,
        cruiseSpeed: 0.7,
        miningCap: 1200,
        miningLaserPower: 2.5,
        color: "#4b5563",
        hud: HUD_TITAN
    },
    {
        id: "arm_viper",
        name: "Viper Interceptor",
        description: "Ares-Miltech's primary short-range combat vessel. Extremely aggressive.",
        manufacturer: "Ares-Miltech",
        price: 35000,
        tier: 2,
        maxFuel: 1000,
        maxBoost: 150,
        fuelBurnRate: 2.8,
        boostBurnRate: 15.0,
        acceleration: 18.0,
        turnSpeed: 2.2,
        boostMultiplier: 18.0,
        cruiseSpeed: 1.3,
        miningCap: 20,
        miningLaserPower: 0.5,
        color: "#ef4444",
        hud: HUD_ARES
    },

    // --- TIER 3: SPECIALIZED ---
    {
        id: "interceptor_mk1",
        name: "Void Dart",
        description: "Experimental Ares technology. Sacrifices fuel for unmatched acceleration.",
        manufacturer: "Ares-Miltech",
        price: 55000,
        tier: 3,
        maxFuel: 900,
        maxBoost: 200,
        fuelBurnRate: 3.0,
        boostBurnRate: 12.0,
        acceleration: 22.0,
        turnSpeed: 2.8,
        boostMultiplier: 20.0,
        cruiseSpeed: 1.5,
        miningCap: 30,
        miningLaserPower: 0.4,
        color: "#991b1b",
        hud: HUD_ARES
    },
    {
        id: "hauler_barge",
        name: "Clydesdale",
        description: "Massive logistical freighter from Titan. Huge hold, slow response.",
        manufacturer: "Titan Industries",
        price: 75000,
        tier: 3,
        maxFuel: 8000,
        maxBoost: 80,
        fuelBurnRate: 0.8,
        boostBurnRate: 40.0,
        acceleration: 3.0,
        turnSpeed: 0.4,
        boostMultiplier: 3.0,
        cruiseSpeed: 0.8,
        miningCap: 5000,
        miningLaserPower: 4.0,
        color: "#d97706",
        hud: HUD_TITAN
    },
    {
        id: "aud_kangaroo",
        name: "Kangaroo",
        description: "Unique long-jump scout with specialized 'Pouch' storage for rare ores.",
        manufacturer: "Australian Dynamics",
        price: 85000,
        tier: 3,
        maxFuel: 3500,
        maxBoost: 150,
        fuelBurnRate: 1.5,
        boostBurnRate: 20.0,
        acceleration: 12.0,
        turnSpeed: 1.6,
        boostMultiplier: 14.0,
        cruiseSpeed: 1.1,
        miningCap: 800,
        miningLaserPower: 2.2,
        color: "#b45309",
        hud: HUD_AUSSIE
    },
    {
        id: "ink_pulse",
        name: "Neon Pulse",
        description: "Entry-level racing chassis from inTAKE. Flashy and fast.",
        manufacturer: "inTAKE racing",
        price: 95000,
        tier: 3,
        maxFuel: 1500,
        maxBoost: 180,
        fuelBurnRate: 3.5,
        boostBurnRate: 8.0,
        acceleration: 25.0,
        turnSpeed: 3.2,
        boostMultiplier: 22.0,
        cruiseSpeed: 1.8,
        miningCap: 0,
        miningLaserPower: 0,
        color: "#06b6d4",
        hud: HUD_INTAKE
    },
    {
        id: "omn_azure",
        name: "Azure Glide",
        description: "The height of luxury for the upper-tier traveler. Silky smooth flight.",
        manufacturer: "Orbital Mechanics",
        price: 110000,
        tier: 3,
        maxFuel: 3000,
        maxBoost: 100,
        fuelBurnRate: 1.4,
        boostBurnRate: 22.0,
        acceleration: 8.0,
        turnSpeed: 1.4,
        boostMultiplier: 10.0,
        cruiseSpeed: 1.0,
        miningCap: 200,
        miningLaserPower: 1.8,
        color: "#3b82f6",
        hud: HUD_ORBITAL
    },
    {
        id: "zac_skyward",
        name: "Skyward Ranger",
        description: "Next-gen long range explorer from Zinc Aerospace.",
        manufacturer: "Zinc Aerospace",
        price: 125000,
        tier: 3,
        maxFuel: 5000,
        maxBoost: 150,
        fuelBurnRate: 1.2,
        boostBurnRate: 18.0,
        acceleration: 10.0,
        turnSpeed: 1.6,
        boostMultiplier: 12.0,
        cruiseSpeed: 1.2,
        miningCap: 500,
        miningLaserPower: 2.0,
        color: "#DFFF00",
        hud: HUD_ZINC
    },

    // --- TIER 4: ADVANCED ---
    {
        id: "stealth_runner",
        name: "Phantom Echo",
        description: "Zinc's black-ops prototype. Near silent running.",
        manufacturer: "Zinc Aerospace",
        price: 250000,
        tier: 4,
        maxFuel: 2000,
        maxBoost: 180,
        fuelBurnRate: 1.0,
        boostBurnRate: 12.0,
        acceleration: 15.0,
        turnSpeed: 2.0,
        boostMultiplier: 16.0,
        cruiseSpeed: 1.3,
        miningCap: 150,
        miningLaserPower: 1.5,
        color: "#18181b",
        hud: HUD_ZINC
    },
    {
        id: "racing_proto",
        name: "Velocity X-1",
        description: "Pure adrenaline. Not street legal in most systems.",
        manufacturer: "inTAKE racing",
        price: 350000,
        tier: 4,
        maxFuel: 1800,
        maxBoost: 300,
        fuelBurnRate: 4.5,
        boostBurnRate: 6.0,
        acceleration: 35.0,
        turnSpeed: 4.5,
        boostMultiplier: 35.0,
        cruiseSpeed: 2.5,
        miningCap: 0,
        miningLaserPower: 0,
        color: "#ec4899",
        hud: HUD_INTAKE
    },
    {
        id: "tin_atlas",
        name: "Atlas Forge",
        description: "A mobile refinery from Titan Industries. The biggest lasers in its class.",
        manufacturer: "Titan Industries",
        price: 450000,
        tier: 4,
        maxFuel: 10000,
        maxBoost: 100,
        fuelBurnRate: 0.6,
        boostBurnRate: 50.0,
        acceleration: 4.0,
        turnSpeed: 0.5,
        boostMultiplier: 5.0,
        cruiseSpeed: 0.9,
        miningCap: 15000,
        miningLaserPower: 8.0,
        color: "#ea580c",
        hud: HUD_TITAN
    },
    {
        id: "aud_platypus",
        name: "The Platypus",
        description: "Versatile, strange, but surprisingly effective in any environment.",
        manufacturer: "Australian Dynamics",
        price: 500000,
        tier: 4,
        maxFuel: 6000,
        maxBoost: 200,
        fuelBurnRate: 1.2,
        boostBurnRate: 15.0,
        acceleration: 16.0,
        turnSpeed: 2.2,
        boostMultiplier: 18.0,
        cruiseSpeed: 1.5,
        miningCap: 2500,
        miningLaserPower: 5.0,
        color: "#78350f",
        hud: HUD_AUSSIE
    },
    {
        id: "arm_kestrel",
        name: "Kestrel Strike",
        description: "Elite combat superior vessel from Ares-Miltech.",
        manufacturer: "Ares-Miltech",
        price: 650000,
        tier: 4,
        maxFuel: 1500,
        maxBoost: 400,
        fuelBurnRate: 3.5,
        boostBurnRate: 10.0,
        acceleration: 28.0,
        turnSpeed: 3.5,
        boostMultiplier: 30.0,
        cruiseSpeed: 1.8,
        miningCap: 50,
        miningLaserPower: 0.2,
        color: "#b91c1c",
        hud: HUD_ARES
    },
    {
        id: "omn_nebula",
        name: "Nebula Crown",
        description: "Prestige and power from Orbital Mechanics. Includes a grand piano.",
        manufacturer: "Orbital Mechanics",
        price: 800000,
        tier: 4,
        maxFuel: 5000,
        maxBoost: 200,
        fuelBurnRate: 1.1,
        boostBurnRate: 20.0,
        acceleration: 12.0,
        turnSpeed: 1.8,
        boostMultiplier: 15.0,
        cruiseSpeed: 1.4,
        miningCap: 1200,
        miningLaserPower: 3.5,
        color: "#e879f9",
        hud: HUD_ORBITAL
    },

    // --- TIER 5: ENDGAME ---
    {
        id: "zac_apex",
        name: "Z-1 Apex Predator",
        description: "The final word in Zinc technology. Flawless execution.",
        manufacturer: "Zinc Aerospace",
        price: 1500000,
        tier: 5,
        maxFuel: 10000,
        maxBoost: 500,
        fuelBurnRate: 0.5,
        boostBurnRate: 8.0,
        acceleration: 22.0,
        turnSpeed: 3.0,
        boostMultiplier: 25.0,
        cruiseSpeed: 2.0,
        miningCap: 5000,
        miningLaserPower: 6.0,
        color: "#DFFF00",
        hud: HUD_ZINC
    },
    {
        id: "aud_crocodile",
        name: "The Salty Croc",
        description: "Indestructible. If it doesn't break on a moon, it won't break at all.",
        manufacturer: "Australian Dynamics",
        price: 1800000,
        tier: 5,
        maxFuel: 15000,
        maxBoost: 400,
        fuelBurnRate: 0.8,
        boostBurnRate: 25.0,
        acceleration: 18.0,
        turnSpeed: 2.5,
        boostMultiplier: 20.0,
        cruiseSpeed: 1.6,
        miningCap: 10000,
        miningLaserPower: 12.0,
        color: "#166534",
        hud: HUD_AUSSIE
    },
    {
        id: "tin_behemoth",
        name: "TIN Behemoth",
        description: "A mobile star-base. Consumes asteroid belts for breakfast.",
        manufacturer: "Titan Industries",
        price: 2500000,
        tier: 5,
        maxFuel: 50000,
        maxBoost: 200,
        fuelBurnRate: 0.4,
        boostBurnRate: 60.0,
        acceleration: 8.0,
        turnSpeed: 1.0,
        boostMultiplier: 8.0,
        cruiseSpeed: 1.2,
        miningCap: 100000,
        miningLaserPower: 25.0,
        color: "#431407",
        hud: HUD_TITAN
    },
    {
        id: "arm_wrath",
        name: "Ares Wrath",
        description: "The ultimate war-machine. Designed for system-wide conquest.",
        manufacturer: "Ares-Miltech",
        price: 3200000,
        tier: 5,
        maxFuel: 8000,
        maxBoost: 1000,
        fuelBurnRate: 4.0,
        boostBurnRate: 5.0,
        acceleration: 45.0,
        turnSpeed: 4.5,
        boostMultiplier: 50.0,
        cruiseSpeed: 3.0,
        miningCap: 100,
        miningLaserPower: 0.1,
        color: "#450a0a",
        hud: HUD_ARES
    },
    {
        id: "ink_infinity",
        name: "Infinity Zero",
        description: "Theoretical physics in motion. It might be in two places at once.",
        manufacturer: "inTAKE racing",
        price: 5000000,
        tier: 5,
        maxFuel: 5000,
        maxBoost: 2000,
        fuelBurnRate: 5.0,
        boostBurnRate: 4.0,
        acceleration: 60.0,
        turnSpeed: 6.0,
        boostMultiplier: 80.0,
        cruiseSpeed: 5.0,
        miningCap: 0,
        miningLaserPower: 0,
        color: "#a21caf",
        hud: HUD_INTAKE
    },
    {
        id: "endgame_dread",
        name: "Oryx's Will",
        description: "Ancient hive magic and impossible technology. The end of all things.",
        manufacturer: "Orbital Mechanics",
        price: 10000000,
        tier: 5,
        maxFuel: 100000,
        maxBoost: 1000,
        fuelBurnRate: 0.1,
        boostBurnRate: 5.0,
        acceleration: 30.0,
        turnSpeed: 3.5,
        boostMultiplier: 40.0,
        cruiseSpeed: 2.5,
        miningCap: 50000,
        miningLaserPower: 50.0,
        color: "#5c4f3d",
        hud: HUD_ORBITAL
    }
];

export const getShipById = (id: string | null) => {
    return SHIP_CATALOG.find(s => s.id === id) || SHIP_CATALOG[0];
};