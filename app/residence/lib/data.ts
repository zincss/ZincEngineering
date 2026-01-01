import { UpgradeDefinition } from "../types";

// 1. VISUAL IDENTITY (The "Flavor")
// Maps the database Name -> UI Visuals
export const PROPERTY_FLAVOR: Record<string, { 
    tagline: string; 
    description: string;
    gradient: string; 
    bgPattern: string;
    interior_image: string; // The background for the dashboard
    features: string[];
}> = {
    'The Pod': {
        tagline: "Efficient Living for the Modern Operator.",
        description: "A 4x4 meter sleeping unit in the lower sector. Includes a basic hardline connection.",
        gradient: "from-zinc-800 to-zinc-900",
        bgPattern: "opacity-20",
        interior_image: "bg-[url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop')]",
        features: ["Compact Design", "Low Maintenance", "Network Hardened"]
    },
    'Skyline Loft': {
        tagline: "Rise Above the Noise.",
        description: "Floor-to-ceiling smart glass overlooking the sector. Includes a personal garage lift.",
        gradient: "from-indigo-950 to-purple-950",
        bgPattern: "opacity-40",
        interior_image: "bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop')]",
        features: ["Panoramic Views", "Soundproof Glass", "Priority Uplink"]
    },
    'Industrial Warehouse': {
        tagline: "Raw Space for Heavy Industry.",
        description: "Converted manufacturing floor. Ideal for large-scale mining operations.",
        gradient: "from-amber-950/50 to-zinc-950",
        bgPattern: "opacity-30",
        interior_image: "bg-[url('https://images.unsplash.com/photo-1518640027989-a30d5d7e498e?q=80&w=2070&auto=format&fit=crop')]",
        features: ["Reinforced Floors", "High Voltage Access", "Cargo Bay"]
    },
    'Orbital Penthouse': {
        tagline: "The Pinnacle of Achievement.",
        description: "Zero-G lounge with dedicated docking bays and quantum-encrypted servers.",
        gradient: "from-emerald-950 to-black",
        bgPattern: "opacity-50",
        interior_image: "bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')]",
        features: ["Zero-G Lounge", "Quantum Encryption", "Off-World Tax Haven"]
    }
};

// 2. THE UPGRADE SHOP
// Defines what players can buy for their homes
export const UPGRADES: UpgradeDefinition[] = [
    // --- INCOME UPGRADES ---
    {
        slug: 'server_node_alpha',
        name: 'Node Alpha',
        type: 'INCOME',
        cost: 5000,
        description: 'Basic crypto-mining rig. Generates passive income.',
        modifier: 25 // +25 credits/hr
    },
    {
        slug: 'mining_rig_beta',
        name: 'Mining Rig Beta',
        type: 'INCOME',
        cost: 15000,
        description: 'Advanced rig with liquid cooling systems.',
        modifier: 80 // +80 credits/hr
    },
    {
        slug: 'quantum_server',
        name: 'Quantum Core',
        type: 'INCOME',
        cost: 50000,
        description: 'Experimental processor. Massive yield potential.',
        modifier: 300 // +300 credits/hr
    },

    // --- SECURITY UPGRADES ---
    {
        slug: 'smart_locks',
        name: 'Smart Locks',
        type: 'SECURITY',
        cost: 2000,
        description: 'Basic biometric entry system.',
        modifier: 0.1 // 10% protection (Flavor text mainly)
    },
    {
        slug: 'holosecurity_mesh',
        name: 'Holosecurity Mesh',
        type: 'SECURITY',
        cost: 8000,
        description: 'Laser grid coverage for all entry points.',
        modifier: 0.3 
    },

    // --- AESTHETIC / QUALITY OF LIFE ---
    {
        slug: 'display_lighting',
        name: 'Gallery Lighting',
        type: 'AESTHETIC',
        cost: 1000,
        description: 'Premium spotlighting for your trophy items.',
        modifier: 0
    },
    {
        slug: 'auto_repair_drone',
        name: 'Auto-Repair Drone',
        type: 'AESTHETIC',
        cost: 12000,
        description: 'Keeps your garage vehicles polished and repaired.',
        modifier: 0
    }
];

export const PERK_ICONS: Record<string, string> = {
    'MARKET_FEE_REDUCTION': '📉 Market Fees',
    'PASSIVE_CREDITS': '💸 Daily Income',
    'INVENTORY_SPACE': '📦 Storage Space',
    'SECURITY_LEVEL': '🛡️ Security'
};