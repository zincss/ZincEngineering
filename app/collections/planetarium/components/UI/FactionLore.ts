export interface FactionLore {
    id: string;
    name: string;
    origin: string;
    history: string;
    territories: string[];
    portfolio: string[];
    stats: {
        revenue: string;
        marketShare: string;
        employees: string;
        status: 'Bullish' | 'Bearish' | 'Stable';
    };
    description: string;
}

export const FACTION_LORE: Record<string, FactionLore> = {
    'Zinc Aerospace': {
        id: 'zinc',
        name: 'Zinc Aerospace',
        origin: 'Neo-Tokyo Orbit, Earth',
        history: 'Founded in 2098 by a conglomerate of silicon valley refugees and orbital engineers. Zinc was the first private entity to successfully commercialize asteroid mining in the belt. They pioneered the "Zinc-Frame" standard for modular ship construction.',
        territories: ['Low Earth Orbit', 'Luna Hub', 'Zinc Prime (Deep Space)'],
        portfolio: ['Starter Ships', 'Heavy Haulers', 'Orbital Relays'],
        stats: {
            revenue: '4.2T CR',
            marketShare: '28%',
            employees: '1.2M',
            status: 'Bullish'
        },
        description: 'The standard-bearer of modern space flight. Zinc focuses on reliability, modularity, and high-tech accessibility.'
    },
    'Australian Dynamics': {
        id: 'aussie',
        name: 'Australian Dynamics',
        origin: 'Woomera, Australia / Mars Colony A-1',
        history: 'Born from the remnants of the Australian Space Agency and private mining titans. AD gained notoriety for their rugged, "no-nonsense" atmospheric entry vehicles. They were instrumental in the early terraforming efforts of the Red Planet.',
        territories: ['Mars North Pole', 'Outback Outposts', 'The Great Red Forge'],
        portfolio: ['Atmospheric Entry Vehicles', 'Landers', 'Rugged Utility Ships'],
        stats: {
            revenue: '2.8T CR',
            marketShare: '15%',
            employees: '850K',
            status: 'Stable'
        },
        description: 'Built like a brick and twice as reliable. AD ships aren\'t pretty, but they will get you home from the most hostile environments.'
    },
    'Ares-Miltech': {
        id: 'ares',
        name: 'Ares-Miltech',
        origin: 'Mars Orbit (Deimos Station)',
        history: 'A private military contractor that expanded into ship manufacturing during the Solar Wars of 2140. Ares-Miltech specializes in high-performance engines and defensive shielding systems. Their designs are aggressive and efficiency-focused.',
        territories: ['Deimos Security Zone', 'Valles Marineris Port', 'Asteroid Belt Blockades'],
        portfolio: ['Interceptors', 'Escort Ships', 'Security Systems'],
        stats: {
            revenue: '5.1T CR',
            marketShare: '12%',
            employees: '2.1M',
            status: 'Bullish'
        },
        description: 'Military-grade hardware for civilian pilots. Ares ships are fast, dangerous, and unapologetically loud.'
    },
    'Titan Industries': {
        id: 'titan',
        name: 'Titan Industries',
        origin: 'Titan, Saturn',
        history: 'Established by the first generation of Saturnian settlers. Titan Industries controls the methane seas and is the primary provider of deep-space fuel. Their ships are massive, heavy-duty machines built for the crushing pressures of the outer system.',
        territories: ['Titan Methane Fields', 'Saturnian Rings (Outer)', 'Rhea Refineries'],
        portfolio: ['Super-Tankers', 'Deep Space Refineries', 'Heavy Transports'],
        stats: {
            revenue: '3.9T CR',
            marketShare: '18%',
            employees: '1.5M',
            status: 'Stable'
        },
        description: 'The backbone of the outer system. If it\'s big and moves fuel, Titan Industries probably built it.'
    },
    'inTAKE racing': {
        id: 'intake',
        name: 'inTAKE racing',
        origin: 'The Neon Belt (Artificial Habitat)',
        history: 'Started as a luxury custom shop for elite racers. inTAKE evolved into a full-scale manufacturer when their "Slipstream" engine design broke every speed record in the system. They prioritize style and raw speed over everything else.',
        territories: ['The Grand Prix Circuit', 'Venus High-Atmosphere Resorts', 'Luxury Hubs'],
        portfolio: ['Racing Vessels', 'Luxury Yachts', 'Performance Engines'],
        stats: {
            revenue: '1.1T CR',
            marketShare: '5%',
            employees: '120K',
            status: 'Stable'
        },
        description: 'Where high-fashion meets high-velocity. inTAKE ships are status symbols that move faster than most missiles.'
    },
    'Orbital Mechanics': {
        id: 'orbital',
        name: 'Orbital Mechanics',
        origin: 'Cambridge Lagrange Point',
        history: 'A scientific collective that turned to manufacturing to fund their research into quantum gravity. Orbital Mechanics ships are marvels of engineering, often featuring experimental technology that other companies find too risky.',
        territories: ['The Quantum Reef', 'L4 Research Station', 'Europa Science Outposts'],
        portfolio: ['Science Vessels', 'Exploration Crafts', 'Experimental Drives'],
        stats: {
            revenue: '1.5T CR',
            marketShare: '7%',
            employees: '200K',
            status: 'Bearish'
        },
        description: 'Pure engineering excellence. Often silent and always sophisticated, Orbital ships are for the discerning pioneer.'
    },
    'Fishworx Staryard': {
        id: 'fish',
        name: 'Fishworx Staryard',
        origin: 'Ganymede Sub-Surface Oceans',
        history: 'What started as a sub-ice salvaging operation became the dominant force in orbital recycling. Fishworx prides itself on "using every part of the whale," building reliable ships from recycled hulls and modular industrial parts.',
        territories: ['Ganymede Core', 'The Junkyard (Earth Orbit)', 'Scrap Relays'],
        portfolio: ['Salvage Ships', 'Mining Platforms', 'Recycled Freighters'],
        stats: {
            revenue: '950B CR',
            marketShare: '9%',
            employees: '600K',
            status: 'Bullish'
        },
        description: 'Practical, sustainable, and surprisingly tough. Fishworx ships are the workhorses of the blue-collar pilot.'
    },
    'Marse Movement': {
        id: 'marse',
        name: 'Marse Movement',
        origin: 'Elysium Planitia, Mars',
        history: 'A boutique design house that redefined luxury in the 22nd century. Marse Movement views ship construction as high art. Every vessel is hand-finished and unique, catering to the absolute top 0.1% of solar society.',
        territories: ['Elysium High-Society District', 'The Golden Arch Station', 'Exclusive Moon Estates'],
        portfolio: ['Hyper-Luxury Coupes', 'Artisanal Ships', 'Status Symbols'],
        stats: {
            revenue: '800B CR',
            marketShare: '2%',
            employees: '45K',
            status: 'Bullish'
        },
        description: 'The pinnacle of exclusivity. A Marse ship is not a vehicle; it is a declaration of absolute dominance and refined taste.'
    }
};
