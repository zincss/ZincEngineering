import { CARS, Car } from '@/app/automotive/data';

export interface DealershipCar extends Car {
  price: number;
  rarity: 'ZENITH' | 'ULTRA' | 'SUPER_RARE' | 'RARE' | 'UNCOMMON' | 'COMMON';
  stock: number;
  rotationId: string; // Unique ID for this specific instance in the shop
}

const RARITY_WEIGHTS = {
  ZENITH: 0.001,    // 0.1% Chance
  ULTRA: 0.05,      // 5% Chance
  SUPER_RARE: 0.15, // 15% Chance
  RARE: 0.30,       // 30% Chance
  UNCOMMON: 0.50,   // 50% Chance
};

// Deterministic Random (Seeded by Hour)
function seededRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Helper to determine rarity based on the existing data structure
function getCarRarity(car: Car): DealershipCar['rarity'] {
  if (car.id === '919-hybrid-evo') return 'ZENITH';
  if (car.class.includes('Formula') || car.class.includes('Hypercar') || car.class.includes('Prototype')) return 'ULTRA';
  if (car.class.includes('Supercar') || car.class.includes('Group B')) return 'SUPER_RARE';
  if (car.class.includes('WRC') || car.class.includes('JDM') || car.class.includes('Track')) return 'RARE';
  return 'UNCOMMON';
}

function calculatePrice(car: Car, rarity: string): number {
  const basePrices: Record<string, number> = {
    ZENITH: 15000000,
    ULTRA: 2500000,
    SUPER_RARE: 850000,
    RARE: 250000,
    UNCOMMON: 65000,
    COMMON: 25000
  };

  // Add variance based on specs (Power/Top Speed)
  const power = parseInt(car.specs.power) || 300;
  const variance = power * 100;
  
  return (basePrices[rarity] || 50000) + variance;
}

export function getCurrentShowroom(): DealershipCar[] {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + now.getMonth() * 100 + now.getDate() * 24 + now.getHours(); // Unique seed per hour
  
  const showroom: DealershipCar[] = [];
  const SHOWROOM_SIZE = 12; // 12 Cars on display at once

  // Shuffle CARS using the seed
  const availableCars = [...CARS].sort((a, b) => {
    return seededRandom(seed + a.id.length) - 0.5;
  });

  // Select cars based on rarity rolls
  let attempt = 0;
  while (showroom.length < SHOWROOM_SIZE && attempt < availableCars.length * 2) {
    const car = availableCars[attempt % availableCars.length];
    const rarity = getCarRarity(car);
    const roll = seededRandom(seed + attempt * 13);
    
    // Higher rarity = Harder to get into the showroom
    let threshold = 1.0;
    if (rarity === 'ZENITH') threshold = 0.99; // 1% chance if it appears in the shuffle
    else if (rarity === 'ULTRA') threshold = 0.85;
    else if (rarity === 'SUPER_RARE') threshold = 0.60;
    else threshold = 0.0; // Rare and below always pass if selected

    if (roll > threshold) {
      // Check if not already in showroom
      if (!showroom.find(c => c.id === car.id)) {
        showroom.push({
          ...car,
          rarity,
          price: calculatePrice(car, rarity),
          stock: rarity === 'ZENITH' ? 1 : Math.floor(seededRandom(seed) * 5) + 1,
          rotationId: `${seed}-${car.id}`
        });
      }
    }
    attempt++;
  }

  return showroom.sort((a, b) => b.price - a.price);
}

export function getNextRotationTime() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(next.getHours() + 1);
  next.setMinutes(0);
  next.setSeconds(0);
  return next;
}