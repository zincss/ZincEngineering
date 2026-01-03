import { CelestialBody } from './data';

export const FANTASY_DATA: CelestialBody[] = [
    {
        id: "zinc_prime_stars",
        name: "Zinc Binary",
        type: "Star",
        description: "A binary star system consisting of a Blue Giant and a Red Dwarf.",
        radius: 0, // Placeholder, rendered specially
        distance: 0,
        orbitalPeriod: 0,
        rotationPeriod: 0,
        meanLongitude: 0,
        axialTilt: 0,
        textureUrl: "",
        color: "#ffffff",
        stats: { temp: "Unknown", day: "-", year: "-" }
    },
    {
        id: "endor_prime",
        name: "Endor Prime",
        type: "Planet", // Gas Giant
        description: "A massive silver-blue gas giant orbiting the binary pair. Its intense gravity well hosts a complex moon system.",
        radius: 9, 
        distance: 400, // Orbiting the binary pair
        orbitalPeriod: 1200, 
        rotationPeriod: 14, 
        meanLongitude: 0, 
        axialTilt: 5,
        textureUrl: "/textures/endorgas.jpg", // FIXED
        color: "#4a94a5",
        stats: { temp: "-120°C", day: "14 Hours", year: "3.2 Years" },
        moons: [
            {
                id: "endor_moon",
                name: "Forest Moon",
                type: "Moon",
                description: "A sanctuary moon teeming with life, famously known for its dense forests and indigenous tribes.",
                radius: 1.4, 
                distance: 22, 
                orbitalPeriod: 18, 
                rotationPeriod: 18, // Tidally locked
                meanLongitude: 90, 
                axialTilt: 0,
                textureUrl: "/textures/endormoon.jpg",
                color: "#2a5c2a",
                stats: { temp: "22°C", day: "18 Days", year: "-" }
            },
            {
                id: "zinc_outpost",
                name: "Zinc Outpost",
                type: "Station",
                description: "The arrival gate for travelers from the Sol system.",
                radius: 0.1, 
                distance: 26, 
                orbitalPeriod: 24, 
                rotationPeriod: 0, 
                meanLongitude: 0, 
                axialTilt: 0,
                textureUrl: "",
                color: "#DFFF00",
                stats: { temp: "20°C", day: "-", year: "-" }
            }
        ]
    }
];