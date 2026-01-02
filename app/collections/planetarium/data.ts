// app/collections/planetarium/data.ts

export interface CelestialBody {
  id: string;
  name: string;
  type: 'Star' | 'Planet' | 'Dwarf Planet' | 'Moon' | 'Station' | 'Black Hole';
  description: string;
  radius: number; 
  distance: number; 
  orbitalPeriod: number; 
  rotationPeriod: number; 
  meanLongitude: number; 
  axialTilt: number;
  textureUrl: string;
  cloudTextureUrl?: string; 
  ringTextureUrl?: string; 
  atmosphere?: boolean; 
  color: string; 
  stats: {
    temp: string;
    day: string;
    year: string;
  };
  moons?: CelestialBody[];
}

export const PLANET_DATA: CelestialBody[] = [
  {
    id: "sun",
    name: "The Sun",
    type: "Star",
    description: "The star at the center of our Solar System.",
    radius: 25, 
    distance: 0,
    orbitalPeriod: 0,
    rotationPeriod: 600, 
    meanLongitude: 0,
    axialTilt: 0,
    textureUrl: "/textures/8k_sun.jpg",
    color: "#FDB813",
    stats: { temp: "5,500°C", day: "25 Days", year: "230M Years" }
  },
  {
    id: "mercury",
    name: "Mercury",
    type: "Planet",
    description: "The smallest planet, closest to the Sun.",
    radius: 0.38,
    distance: 60, 
    orbitalPeriod: 87.97,
    rotationPeriod: 1407.6,
    meanLongitude: 252.25,
    axialTilt: 0.03,
    textureUrl: "/textures/8k_mercury.jpg",
    color: "#A5A5A5",
    stats: { temp: "430°C", day: "59 Days", year: "88 Days" },
    moons: [
      {
        id: "sunforge",
        name: "Sunforge Array",
        type: "Station",
        description: "A massive solar collector array shielding a research habitat.",
        radius: 0.04, 
        distance: 0.8, 
        orbitalPeriod: 3, 
        rotationPeriod: 0,
        meanLongitude: 45,
        axialTilt: 0,
        textureUrl: "",
        color: "#FFD700",
        stats: { temp: "400°C", day: "-", year: "-" }
      }
    ]
  },
  {
    id: "venus",
    name: "Venus",
    type: "Planet",
    description: "The hottest planet with a dense atmosphere.",
    radius: 0.95,
    distance: 108, 
    orbitalPeriod: 224.70,
    rotationPeriod: -5832.5, 
    meanLongitude: 181.98,
    axialTilt: 177.3,
    textureUrl: "/textures/8k_venus_surface.jpg",
    cloudTextureUrl: "/textures/4k_venus_atmosphere.jpg",
    atmosphere: true,
    color: "#E3BB76",
    stats: { temp: "462°C", day: "243 Days", year: "225 Days" },
    moons: [
      {
        id: "vesper",
        name: "Vesper Sky City",
        type: "Station",
        description: "A floating aerostat colony drifting high in the upper atmosphere.",
        radius: 0.06, 
        distance: 1.8, 
        orbitalPeriod: 5, 
        rotationPeriod: 0,
        meanLongitude: 180,
        axialTilt: 0,
        textureUrl: "",
        color: "#E3BB76",
        stats: { temp: "25°C", day: "-", year: "-" }
      }
    ]
  },
  {
    id: "earth",
    name: "Earth",
    type: "Planet",
    description: "Our home.",
    radius: 1,
    distance: 150, 
    orbitalPeriod: 365.256,
    rotationPeriod: 23.93,
    meanLongitude: 100.46,
    axialTilt: 23.4,
    textureUrl: "/textures/8k_earth_daymap.jpg",
    cloudTextureUrl: "/textures/8k_earth_clouds.jpg",
    atmosphere: true,
    color: "#2233FF",
    stats: { temp: "14°C", day: "24 Hours", year: "365 Days" },
    moons: [
      {
        id: "moon",
        name: "The Moon",
        type: "Moon",
        description: "Earth's only natural satellite.",
        radius: 0.27,
        distance: 8, 
        orbitalPeriod: 27.322,
        rotationPeriod: 655.7, 
        meanLongitude: 218.32, 
        axialTilt: 6.68,
        textureUrl: "/textures/8k_moon.jpg",
        color: "#CCCCCC",
        stats: { temp: "-53°C", day: "27 Days", year: "-" }
      },
      {
        id: "zinc_orbital",
        name: "Zinc Orbital",
        type: "Station",
        description: "The primary transit hub for the Zinc Shuttle network.",
        radius: 0.03, 
        distance: 1.8, 
        orbitalPeriod: 0.15, 
        rotationPeriod: 0,
        meanLongitude: 90, 
        axialTilt: 0,
        textureUrl: "",
        color: "#00FFFF",
        stats: { temp: "20°C", day: "90 Mins", year: "-" }
      },
      {
        id: "iss",
        name: "ISS",
        type: "Station",
        description: "International Space Station",
        radius: 0.015, 
        distance: 1.3, 
        orbitalPeriod: 0.0645, 
        rotationPeriod: 0,
        meanLongitude: 0, 
        axialTilt: 0,
        textureUrl: "",
        color: "#FFFFFF",
        stats: { temp: "20°C", day: "90 Mins", year: "-" }
      }
    ]
  },
  {
    id: "mars",
    name: "Mars",
    type: "Planet",
    description: "The Red Planet.",
    radius: 0.53,
    distance: 230, 
    orbitalPeriod: 686.98,
    rotationPeriod: 24.62,
    meanLongitude: 355.45,
    axialTilt: 25.2,
    textureUrl: "/textures/8k_mars.jpg",
    color: "#E27B58",
    stats: { temp: "-63°C", day: "25 Hours", year: "687 Days" },
    moons: [
      {
        id: "phobos",
        name: "Phobos",
        type: "Moon",
        description: "The doomed moon, spiraling inward.",
        radius: 0.08, 
        distance: 0.9, 
        orbitalPeriod: 0.32, 
        rotationPeriod: 0,
        meanLongitude: 120,
        axialTilt: 0,
        textureUrl: "/textures/phobos.jpg",
        color: "#BFA393",
        stats: { temp: "-4°C", day: "8 Hours", year: "-" }
      },
      {
        id: "ares_shipyards",
        name: "Ares Shipyards",
        type: "Station",
        description: "Orbital drydocks where the system's heavy cruisers are constructed.",
        radius: 0.05, 
        distance: 1.5, 
        orbitalPeriod: 1.2,
        rotationPeriod: 0,
        meanLongitude: 270,
        axialTilt: 0,
        textureUrl: "",
        color: "#FF4500",
        stats: { temp: "-20°C", day: "-", year: "-" }
      }
    ]
  },
  {
    id: "kuva",
    name: "Kuva Fortress",
    type: "Station",
    description: "A moving Grineer fortress hidden in the asteroid belt.",
    radius: 0.4, 
    distance: 450, 
    orbitalPeriod: 1500, 
    rotationPeriod: 48, 
    meanLongitude: 90,
    axialTilt: 15,
    textureUrl: "", 
    color: "#AA0000",
    stats: { temp: "Unknown", day: "Variable", year: "Unknown" }
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "Planet",
    description: "The largest planet.",
    radius: 11,
    distance: 780, 
    orbitalPeriod: 4332.59,
    rotationPeriod: 9.93,
    meanLongitude: 34.4,
    axialTilt: 3.1,
    textureUrl: "/textures/8k_jupiter.jpg",
    color: "#C99039",
    stats: { temp: "-108°C", day: "10 Hours", year: "12 Years" },
    moons: [
      {
         id: "europa",
         name: "Europa",
         type: "Moon",
         description: "An icy world with a subsurface ocean.",
         radius: 0.25,
         distance: 22, 
         orbitalPeriod: 3.55, 
         rotationPeriod: 0,
         meanLongitude: 45,
         axialTilt: 0,
         textureUrl: "/textures/europa.jpg",
         color: "#C4A88F",
         stats: { temp: "-160°C", day: "3.5 Days", year: "-" }
      },
      {
         id: "ganymede",
         name: "Ganymede",
         type: "Moon",
         description: "The largest moon in the solar system.",
         radius: 0.41,
         distance: 35, 
         orbitalPeriod: 7.15, 
         rotationPeriod: 0,
         meanLongitude: 180,
         axialTilt: 0,
         textureUrl: "/textures/ganymede.jpg",
         color: "#8B7D6E",
         stats: { temp: "-163°C", day: "7 Days", year: "-" }
      },
      {
         id: "galileo_hub",
         name: "Galileo Hub",
         type: "Station",
         description: "A massive research ring station monitoring the Great Red Spot.",
         radius: 0.15, 
         distance: 16, 
         orbitalPeriod: 6, 
         rotationPeriod: 0,
         meanLongitude: 0,
         axialTilt: 0,
         textureUrl: "",
         color: "#FFFFFF",
         stats: { temp: "-100°C", day: "-", year: "-" }
      }
    ]
  },
  {
    id: "saturn",
    name: "Saturn",
    type: "Planet",
    description: "Famous for its rings.",
    radius: 9,
    distance: 1450, 
    orbitalPeriod: 10759.22,
    rotationPeriod: 10.7,
    meanLongitude: 49.9,
    axialTilt: 26.7,
    textureUrl: "/textures/8k_saturn.jpg",
    ringTextureUrl: "/textures/8k_saturn_ring_alpha.png",
    color: "#D4BC8C",
    stats: { temp: "-139°C", day: "10.7 Hours", year: "29 Years" },
    moons: [
        {
          id: "dreadnaught",
          name: "The Dreadnaught",
          type: "Station",
          description: "Oryx's flagship, parked within the rings of Saturn.",
          radius: 0.12, 
          distance: 15, 
          orbitalPeriod: 10, 
          rotationPeriod: 0,
          meanLongitude: 180, 
          axialTilt: 0,
          textureUrl: "",
          color: "#4a3b2a",
          stats: { temp: "Cold", day: "-", year: "-" }
        }
    ]
  },
  {
    id: "uranus",
    name: "Uranus",
    type: "Planet",
    description: "The tilted ice giant.",
    radius: 4,
    distance: 2900, 
    orbitalPeriod: 30685.4,
    rotationPeriod: -17.24,
    meanLongitude: 313.2,
    axialTilt: 97.8, 
    textureUrl: "/textures/2k_uranus.jpg",
    color: "#93B8BE",
    stats: { temp: "-197°C", day: "17 Hours", year: "84 Years" },
    moons: [
      {
         id: "titania_outpost",
         name: "Titania Outpost",
         type: "Station",
         description: "A deeply secluded ice-mining and cryo-storage facility.",
         radius: 0.08, 
         distance: 6, 
         orbitalPeriod: 6,
         rotationPeriod: 0,
         meanLongitude: 270,
         axialTilt: 0,
         textureUrl: "",
         color: "#A0E0FF",
         stats: { temp: "-180°C", day: "-", year: "-" }
      }
    ]
  },
  {
    id: "neptune",
    name: "Neptune",
    type: "Planet",
    description: "The windy blue giant.",
    radius: 3.8,
    distance: 4500, 
    orbitalPeriod: 60189.0,
    rotationPeriod: 16.11,
    meanLongitude: 304.8,
    axialTilt: 28.3,
    textureUrl: "/textures/2k_neptune.jpg",
    color: "#4b70dd",
    stats: { temp: "-201°C", day: "16 Hours", year: "165 Years" },
    moons: [
      {
         id: "trident_relay",
         name: "Trident Relay",
         type: "Station",
         description: "The furthest major communication buoy in the system.",
         radius: 0.08, 
         distance: 6,
         orbitalPeriod: 5.5,
         rotationPeriod: 0,
         meanLongitude: 120,
         axialTilt: 0,
         textureUrl: "",
         color: "#5555FF",
         stats: { temp: "-200°C", day: "-", year: "-" }
      }
    ]
  },
  {
    id: "pluto",
    name: "Pluto",
    type: "Dwarf Planet",
    description: "The Kuiper belt object.",
    radius: 0.18,
    distance: 5900, 
    orbitalPeriod: 90560.0,
    rotationPeriod: 153.3,
    meanLongitude: 238.9,
    axialTilt: 122.5,
    textureUrl: "/textures/pluto.jpg",
    color: "#E3C2A6",
    stats: { temp: "-229°C", day: "153 Hours", year: "248 Years" },
    moons: [
      {
         id: "terminus_gate",
         name: "Terminus Gate",
         type: "Station",
         description: "The final fueling stop before the void.",
         radius: 0.02, 
         distance: 0.4, 
         orbitalPeriod: 3,
         rotationPeriod: 0,
         meanLongitude: 0,
         axialTilt: 0,
         textureUrl: "",
         color: "#888888",
         stats: { temp: "-230°C", day: "-", year: "-" }
      }
    ]
  },
  {
    id: "eris",
    name: "Eris",
    type: "Dwarf Planet",
    description: "Massive dwarf planet in the scattered disc.",
    radius: 0.18,
    distance: 8000, 
    orbitalPeriod: 203600,
    rotationPeriod: 25.9,
    meanLongitude: 0,
    axialTilt: 44, 
    textureUrl: "/textures/eris.jpg",
    color: "#DDDDDD",
    stats: { temp: "-240°C", day: "25.9 Hours", year: "558 Years" },
    moons: [] 
  },
  {
    id: "sagittarius_a",
    name: "Sagittarius A*",
    type: "Black Hole",
    description: "The supermassive black hole at the center of the galaxy.",
    radius: 30, // Event Horizon
    distance: 15000, 
    orbitalPeriod: 0,
    rotationPeriod: 0,
    meanLongitude: 180,
    axialTilt: 60,
    textureUrl: "",
    color: "#000000",
    stats: { temp: "∞", day: "Singularity", year: "Eternal" },
    moons: []
  }
];