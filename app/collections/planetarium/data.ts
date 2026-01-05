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
  eccentricity?: number;     
  inclination?: number;      
  ascendingNode?: number;    
  periapsis?: number;        
  textureUrl: string;
  // removed normalMapUrl
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
    meanLongitude: 174.79,
    axialTilt: 0.03,
    eccentricity: 0.205,
    inclination: 7.0,
    ascendingNode: 48.33,
    periapsis: 29.12,
    textureUrl: "/textures/8k_mercury.jpg",
    color: "#A5A5A5",
    stats: { temp: "430°C", day: "59 Days", year: "88 Days" },
    moons: [
      {
        id: "sunforge",
        name: "Sunforge Array",
        type: "Station",
        description: "A massive solar collector array shielding a research habitat.",
        radius: 0.008, 
        distance: 0.45, 
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
    meanLongitude: 50.11,
    axialTilt: 177.3,
    eccentricity: 0.007,
    inclination: 3.39,
    ascendingNode: 76.68,
    periapsis: 54.88,
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
        radius: 0.01, 
        distance: 1.1, 
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
    meanLongitude: 358.6,
    axialTilt: 23.4,
    eccentricity: 0.017,
    inclination: 0.0,
    ascendingNode: -11.26,
    periapsis: 102.9,
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
        meanLongitude: 135.2, 
        axialTilt: 6.68,
        eccentricity: 0.055,
        inclination: 5.14,
        ascendingNode: 125.08,
        periapsis: 318.15,
        textureUrl: "/textures/8k_moon.jpg",
        color: "#CCCCCC",
        stats: { temp: "-53°C", day: "27 Days", year: "-" }
      },
      {
        id: "zinc_orbital",
        name: "Zinc Orbital",
        type: "Station",
        description: "The primary transit hub for the Zinc Shuttle network.",
        radius: 0.005, 
        distance: 1.2, 
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
        radius: 0.003, 
        distance: 1.1, 
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
    meanLongitude: 19.41,
    axialTilt: 25.2,
    eccentricity: 0.094,
    inclination: 1.85,
    ascendingNode: 49.58,
    periapsis: 286.5,
    textureUrl: "/textures/8k_mars.jpg",
    atmosphere: true,
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
        radius: 0.01, 
        distance: 0.7, 
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
    id: "ceres",
    name: "Ceres",
    type: "Dwarf Planet",
    description: "The largest object in the asteroid belt.",
    radius: 0.07,
    distance: 414, 
    orbitalPeriod: 1680, 
    rotationPeriod: 9.07, 
    meanLongitude: 0,
    axialTilt: 4, 
    eccentricity: 0.076, 
    inclination: 10.6, 
    ascendingNode: 80.3,
    periapsis: 73.0,
    textureUrl: "/textures/8k_ceres_fictional.jpg",
    color: "#8c8c8c",
    stats: { temp: "-105°C", day: "9 Hours", year: "4.6 Years" },
    moons: [] 
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
    meanLongitude: 20.02,
    axialTilt: 3.1,
    eccentricity: 0.049,
    inclination: 1.3,
    ascendingNode: 100.5,
    periapsis: 273.8,
    textureUrl: "/textures/8k_jupiter.jpg",
    color: "#C99039",
    stats: { temp: "-108°C", day: "10 Hours", year: "12 Years" },
    moons: [
      {
         id: "io",
         name: "Io",
         type: "Moon",
         description: "The most geologically active object in the Solar System.",
         radius: 0.28,
         distance: 18, 
         orbitalPeriod: 1.76, 
         rotationPeriod: 42, 
         meanLongitude: 0,
         axialTilt: 0,
         eccentricity: 0.004,
         inclination: 0.05,
         textureUrl: "/textures/io_texture.jpg",
         color: "#F4E07F",
         stats: { temp: "-143°C", day: "1.8 Days", year: "-" }
      },
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
         radius: 0.05, 
         distance: 12, 
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
    meanLongitude: 317.0,
    axialTilt: 26.7,
    eccentricity: 0.056,
    inclination: 2.48,
    ascendingNode: 113.7,
    periapsis: 339.3,
    textureUrl: "/textures/8k_saturn.jpg",
    ringTextureUrl: "/textures/8k_saturn_ring_alpha.png",
    color: "#D4BC8C",
    stats: { temp: "-139°C", day: "10.7 Hours", year: "29 Years" },
    moons: [
        {
          id: "titan",
          name: "Titan",
          type: "Moon",
          description: "A moon with a thick atmosphere and methane lakes.",
          radius: 0.40, 
          distance: 22, 
          orbitalPeriod: 15.9, 
          rotationPeriod: 15.9,
          meanLongitude: 0,
          axialTilt: 0,
          textureUrl: "/textures/titan_texture.jpg",
          color: "#E5C163",
          stats: { temp: "-179°C", day: "16 Days", year: "-" }
        },
        {
          id: "enceladus",
          name: "Enceladus",
          type: "Moon",
          description: "An icy moon with geysers erupting from its south pole.",
          radius: 0.04, 
          distance: 18, 
          orbitalPeriod: 1.37, 
          rotationPeriod: 1.37,
          meanLongitude: 120, 
          axialTilt: 0,
          textureUrl: "/textures/enceladus_texture.jpg",
          color: "#EEEEEE",
          stats: { temp: "-200°C", day: "1.4 Days", year: "-" }
        },
        {
          id: "dreadnaught",
          name: "The Dreadnaught",
          type: "Station",
          description: "Oryx's flagship, carved out within the rings of Saturn.",
          radius: 0.1, // Slightly larger for visibility
          distance: 17, // Placed inside the ring system
          orbitalPeriod: 10, // Visual only now (controlled by ring rotation)
          rotationPeriod: 0,
          meanLongitude: 180, 
          axialTilt: 0,
          textureUrl: "",
          color: "#5c4f3d", // Darker hive-like color
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
    meanLongitude: 142.2,
    axialTilt: 97.8, 
    eccentricity: 0.046,
    inclination: 0.77,
    ascendingNode: 74.0,
    periapsis: 96.9,
    textureUrl: "/textures/2k_uranus.jpg",
    color: "#93B8BE",
    stats: { temp: "-197°C", day: "17 Hours", year: "84 Years" },
    moons: [
      {
         id: "titania_outpost",
         name: "Titania Outpost",
         type: "Station",
         description: "A deeply secluded ice-mining and cryo-storage facility.",
         radius: 0.02, 
         distance: 4.5, 
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
    meanLongitude: 256.2,
    axialTilt: 28.3,
    eccentricity: 0.009,
    inclination: 1.77,
    ascendingNode: 131.7,
    periapsis: 273.2,
    textureUrl: "/textures/2k_neptune.jpg",
    color: "#4b70dd",
    stats: { temp: "-201°C", day: "16 Hours", year: "165 Years" },
    moons: [
      {
         id: "trident_relay",
         name: "Trident Relay",
         type: "Station",
         description: "The furthest major communication buoy in the system.",
         radius: 0.02, 
         distance: 4.5,
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
    meanLongitude: 14.8,
    axialTilt: 122.5,
    eccentricity: 0.248, 
    inclination: 17.16, 
    ascendingNode: 110.3,
    periapsis: 113.7,
    textureUrl: "/textures/pluto.jpg",
    color: "#E3C2A6",
    stats: { temp: "-229°C", day: "153 Hours", year: "248 Years" },
    moons: [
      {
         id: "terminus_gate",
         name: "Terminus Gate",
         type: "Station",
         description: "The final fueling stop before the void.",
         radius: 0.005, 
         distance: 0.25, 
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
    eccentricity: 0.44, 
    inclination: 44.0, 
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
    radius: 30, 
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