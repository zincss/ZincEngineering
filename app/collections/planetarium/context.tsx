'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAuth } from '@/app/context/AuthContext'; 
import { getPlayerSave, savePlayerProgress, PlanetariumSaveData } from './actions'; 
import { PLANET_DATA, CelestialBody } from './data';
import { FANTASY_DATA } from './fantasy_data';
import { SHIP_CATALOG, ShipStats, getShipById } from './ships'; 
import { 
    J2000_EPOCH, 
    MILLISECONDS_PER_DAY, 
    FUEL_COST_PER_UNIT, 
    BOOST_COST_PER_UNIT,
    UNINHABITABLE_IDS,
    CARGO_TIERS,
    MINING_RESOURCES,
    MINING_LOCATIONS
} from './constants';

// Re-export constants for backwards compatibility
export { 
    J2000_EPOCH, 
    MILLISECONDS_PER_DAY, 
    FUEL_COST_PER_UNIT, 
    BOOST_COST_PER_UNIT,
    UNINHABITABLE_IDS,
    CARGO_TIERS,
    MINING_RESOURCES,
    MINING_LOCATIONS,
    SPACESHIP_UPDATE_EVENT
} from './constants';

export interface HaulingJob {
    id: string;
    originId: string;
    destId: string;
    cargo: string;
    reward: number;
    description: string;
    tier: number;
}

export interface Inventory {
    [resourceId: string]: number;
}

const solveKepler = (M: number, e: number): number => {
    let E = M;
    for (let i = 0; i < 8; i++) { E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); }
    return E;
};

const calculateOrbitalVector = (body: CelestialBody, E_rad: number): THREE.Vector3 => {
    const e = body.eccentricity || 0;
    const a = body.distance; 
    const P = a * (Math.cos(E_rad) - e);
    const Q = a * Math.sqrt(1 - e * e) * Math.sin(E_rad);
    const i = THREE.MathUtils.degToRad(body.inclination || 0);
    const om = THREE.MathUtils.degToRad(body.periapsis || 0);      
    const Om = THREE.MathUtils.degToRad(body.ascendingNode || 0);  
    const cosOm = Math.cos(Om);
    const sinOm = Math.sin(Om);
    const cosom = Math.cos(om);
    const sinom = Math.sin(om);
    const cosi = Math.cos(i);
    const sini = Math.sin(i);
    const x = P * (cosOm * cosom - sinOm * sinom * cosi) - Q * (cosOm * sinom + sinOm * cosom * cosi);
    const z = P * (sinOm * cosom + cosOm * sinom * cosi) - Q * (sinOm * sinom - cosOm * cosom * cosi);
    const y = P * (sinom * sini) + Q * (cosom * sini);
    return new THREE.Vector3(x, y, z);
};

export const getOrbitalPosition = (body: CelestialBody, time: number): THREE.Vector3 => {
    if (body.distance === 0) return new THREE.Vector3(0, 0, 0);
    const daysSinceJ2000 = (time - J2000_EPOCH) / MILLISECONDS_PER_DAY;
    const n = 360 / (body.orbitalPeriod || 1); 
    const M_deg = (body.meanLongitude || 0) + (n * daysSinceJ2000);
    const M_rad = THREE.MathUtils.degToRad(M_deg);
    const e = body.eccentricity || 0;
    const E_rad = solveKepler(M_rad, e);
    return calculateOrbitalVector(body, E_rad);
};

export const getOrbitPoints = (body: CelestialBody, segments: number = 128): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    if (body.distance === 0) return points;
    for (let i = 0; i <= segments; i++) {
        const E = (i / segments) * Math.PI * 2;
        points.push(calculateOrbitalVector(body, E));
    }
    return points;
};

interface SimulationContextType {
    timeRef: React.MutableRefObject<number>;
    speedRef: React.MutableRefObject<number>;
    simulationTime: number; 
    setSpeed: (s: number) => void;
    speed: number;
    resetTime: () => void;
    setTime: (t: number) => void;
    activeSystem: 'solar' | 'fantasy';
    setActiveSystem: (s: 'solar' | 'fantasy') => void;
    currentData: CelestialBody[];
    findBody: (id: string | null) => CelestialBody | undefined;
    getOrbitalPosition: (body: CelestialBody, time: number) => THREE.Vector3;
    getOrbitPoints: (body: CelestialBody, segments?: number) => THREE.Vector3[];
    
    user: any;
    isLoadingSave: boolean;
    credits: number;
    fuel: number; 
    boost: number;
    
    // SHIP STATE
    currentShip: ShipStats;
    ownedShips: string[];
    purchaseShip: (shipId: string) => void;
    equipShip: (shipId: string) => void;
    
    activeJob: HaulingJob | null;
    availableJobs: HaulingJob[];
    dockedAt: string | null;
    lastDockedNode: string | null;
    lastDockVector: { x: number, y: number, z: number } | null;
    lastCompletedJob: HaulingJob | null;
    savedPosition: { x: number, y: number, z: number } | null;
    
    setDockedAt: (id: string | null, vector?: { x: number, y: number, z: number } | null) => void;
    acceptJob: (job: HaulingJob) => void;
    completeJob: () => void;
    clearCompletedJob: () => void;
    generateJobsForLocation: (locationId: string) => void;
    updateFuel: (newAmount: number) => void;
    buyFuel: () => void;
    updateBoost: (newAmount: number) => void;
    buyBoost: () => void;

    // MINING
    inventory: Inventory;
    miningState: { isMining: boolean; activeZoneId: string | null };
    startMining: (zoneId: string) => void;
    stopMining: () => void;
    mineAsteroid: (resource: string) => number; // Returns quantity added
    sellResource: (resourceId: string, quantity: number) => void;
    marketState: Record<string, { data: MarketData, lastUpdate: number }>;
    getMarketForStation: (stationId: string) => MarketData | null;
    
    // HANGAR / SHIP MANAGEMENT
    shipLocations: { [shipId: string]: string }; // Maps shipId to stationId
    shipTransfers: { [shipId: string]: { destination: string, arrivalTime: number, totalTime: number } };
    recallShip: (shipId: string) => void;
    
    // UPDATED: Added creditOverride support
    saveGame: (currentPosition?: THREE.Vector3, creditOverride?: number, invOverride?: Inventory, locOverride?: { [shipId: string]: string }) => Promise<void>;
}

export interface MarketData {
    [resourceId: string]: {
        price: number;
        demand: number; // 0.5 to 1.5 multiplier
        saturation: number; // 0 to 100 (percentage filled)
    }
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function useSimulation() {
    const context = useContext(SimulationContext);
    if (!context) throw new Error("useSimulation must be used within SimulationProvider");
    return context;
}

export function SimulationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth(); 
    const [isLoadingSave, setIsLoadingSave] = useState(true);

    const [speed, setSpeed] = useState(1);
    const [simTimeState, setSimTimeState] = useState(Date.now());
    const [activeSystem, setActiveSystem] = useState<'solar' | 'fantasy'>('solar');
    
    const [credits, setCredits] = useState(500);
    const [fuel, setFuel] = useState(1000); 
    const [boost, setBoost] = useState(50); 
    
    // Ship State
    const [currentShipId, setCurrentShipId] = useState('starter_tub');
    const [ownedShips, setOwnedShips] = useState<string[]>(['starter_tub']);
    const [shipLocations, setShipLocations] = useState<{ [shipId: string]: string }>({});
    const [shipTransfers, setShipTransfers] = useState<{ [shipId: string]: { destination: string, arrivalTime: number, totalTime: number } }>({});
    
    const [activeJob, setActiveJob] = useState<HaulingJob | null>(null);
    const [dockedAt, _setDockedAt] = useState<string | null>(null);
    const [lastDockedNode, setLastDockedNode] = useState<string | null>(null);
    const [lastDockVector, setLastDockVector] = useState<{ x: number, y: number, z: number } | null>(null);
    const [availableJobs, setAvailableJobs] = useState<HaulingJob[]>([]);
    const [lastCompletedJob, setLastCompletedJob] = useState<HaulingJob | null>(null);
    const [savedPosition, setSavedPosition] = useState<{ x: number, y: number, z: number } | null>(null);

    // Mining & Market State
    const [inventory, setInventory] = useState<Inventory>({});
    const [miningState, setMiningState] = useState<{ isMining: boolean; activeZoneId: string | null }>({
        isMining: false,
        activeZoneId: null
    });
    const [marketState, setMarketState] = useState<Record<string, { data: MarketData, lastUpdate: number }>>({});

    const timeRef = useRef(Date.now());
    const speedRef = useRef(1);

    // ------------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------------

    const currentData = useMemo(() => {
        return activeSystem === 'fantasy' ? FANTASY_DATA : PLANET_DATA;
    }, [activeSystem]);

    const findBody = useCallback((id: string | null): CelestialBody | undefined => {
        if (!id) return undefined;
        for (const body of currentData) {
            if (body.id === id) return body;
            if (body.moons) {
                const moon = body.moons.find(m => m.id === id);
                if (moon) return moon;
            }
        }
        return undefined;
    }, [currentData]);

    const generateMarket = useCallback((stationId: string): MarketData => {
        const market: MarketData = {};
        const resources = Object.keys(MINING_RESOURCES);
        
        resources.forEach(res => {
            const basePrice = (MINING_RESOURCES as any)[res]?.price || 1;
            
            // Random demand fluctuation (0.7x to 1.4x)
            const demand = 0.7 + Math.random() * 0.7; 
            
            // Initial saturation (0% to 60%)
            const saturation = Math.floor(Math.random() * 60);

            market[res] = {
                price: Math.floor(basePrice * demand),
                demand,
                saturation
            };
        });

        return market;
    }, []);

    const getMarketForStation = useCallback((stationId: string): MarketData | null => {
        const now = Date.now();
        const current = marketState[stationId];
        
        // 30 Minutes = 1800000ms
        if (current && (now - current.lastUpdate) < 1800000) {
            return current.data;
        }
        
        // Generate new market
        const newData = generateMarket(stationId);
        setMarketState(prev => ({
            ...prev,
            [stationId]: {
                data: newData,
                lastUpdate: now
            }
        }));
        return newData;
    }, [marketState, generateMarket]);

    // ------------------------------------------------------------------
    // INIT & SAVE
    // ------------------------------------------------------------------

    const setDockedAt = useCallback((id: string | null, vector?: { x: number, y: number, z: number } | null) => {
        if (id) {
            setLastDockedNode(id);
            if (vector) setLastDockVector(vector);
            // Auto stop mining if docked
            setMiningState(prev => ({ ...prev, isMining: false }));
            
            // Trigger market refresh if needed
            getMarketForStation(id);
        }
        _setDockedAt(id);
    }, [getMarketForStation]);


    // Derived Current Ship Object
    const currentShip = useMemo(() => getShipById(currentShipId), [currentShipId]);

    // TRANSFER MONITORING LOOP
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setShipTransfers(prev => {
                const next = { ...prev };
                let changed = false;
                
                Object.keys(next).forEach(shipId => {
                    if (now >= next[shipId].arrivalTime) {
                        // Transfer complete
                        const dest = next[shipId].destination;
                        delete next[shipId];
                        
                        setShipLocations(locs => ({
                            ...locs,
                            [shipId]: dest
                        }));
                        changed = true;
                    }
                });
                
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (user) {
                setIsLoadingSave(true);
                try {
                    const save = await getPlayerSave();
                    if (save && mounted) {
                        setFuel(save.fuel);
                        setBoost(save.boost);
                        setCredits(save.credits);
                        setActiveSystem(save.current_system as any);
                        
                        // Load Ship Data
                        if (save.current_ship_id) setCurrentShipId(save.current_ship_id);
                        if (save.owned_ships) setOwnedShips(save.owned_ships);
                        
                        // Load Ship Locations (using 'extra' field or assuming schema update soon)
                        // For now we store it in local state but if we want persistence we need backend update.
                        // Assuming save object has it or we default.
                        const savedLocs = (save as any).ship_locations || {};
                        
                        // Ensure all owned ships (except current) have a location
                        const owned = save.owned_ships || ['starter_tub'];
                        const current = save.current_ship_id || 'starter_tub';
                        
                        const finalLocs: {[key:string]: string} = { ...savedLocs };
                        owned.forEach((sId: string) => {
                            if (sId !== current && !finalLocs[sId]) {
                                finalLocs[sId] = 'earth'; // Default fallback
                            }
                        });
                        setShipLocations(finalLocs);

                        if (save.docked_at) {
                            _setDockedAt(save.docked_at);
                            setLastDockedNode(save.docked_at);
                        } else {
                            _setDockedAt(null);
                        }
                        
                        setSavedPosition(save.position);
                        
                        if ((save as any).inventory) {
                            setInventory((save as any).inventory);
                        }
                        
                        if (!save.docked_at && !save.position) {
                            _setDockedAt('earth');
                            setLastDockedNode('earth');
                        }
                    }
                } catch (e) {
                    console.error("Failed to load save", e);
                } finally {
                    if (mounted) setIsLoadingSave(false);
                }
            } else {
                // GUEST INITIALIZATION
                if (mounted) {
                    setIsLoadingSave(false);
                    setFuel(1000); 
                    setBoost(50);
                    setCredits(500);
                    setCurrentShipId('starter_tub');
                    setOwnedShips(['starter_tub']);
                    setInventory({});
                    setShipLocations({});
                    
                    _setDockedAt(null); 
                    setLastDockedNode(null);
                    setSavedPosition(null);
                }
            }
        };
        load();
        return () => { mounted = false; };
    }, [user]);

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSimTimeState(timeRef.current);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const resetTime = useCallback(() => {
        timeRef.current = Date.now();
        setSpeed(1);
    }, []);

    const setTime = useCallback((t: number) => {
        timeRef.current = t;
        setSimTimeState(t);
    }, []);

    // UPDATED: Added locOverride
    const saveGame = useCallback(async (currentPosition?: THREE.Vector3, creditOverride?: number, invOverride?: Inventory, locOverride?: { [shipId: string]: string }) => {
        if (!user || isLoadingSave) return; 
        
        if (currentPosition) {
            setSavedPosition({ x: currentPosition.x, y: currentPosition.y, z: currentPosition.z });
        }

        const data: PlanetariumSaveData & { inventory?: Inventory, ship_locations?: { [shipId: string]: string } } = {
            fuel,
            boost,
            credits: creditOverride !== undefined ? creditOverride : credits, // USE OVERRIDE IF PRESENT
            current_system: activeSystem,
            location_id: dockedAt, 
            docked_at: dockedAt,
            position: currentPosition ? { x: currentPosition.x, y: currentPosition.y, z: currentPosition.z } : null,
            current_ship_id: currentShipId,
            owned_ships: ownedShips,
            inventory: invOverride || inventory,
            ship_locations: locOverride || shipLocations
        };

        await savePlayerProgress(data);
    }, [user, isLoadingSave, fuel, boost, credits, activeSystem, dockedAt, currentShipId, ownedShips, inventory, shipLocations]);

    // ------------------------------------------------------------------
    // SHIP MANAGEMENT
    // ------------------------------------------------------------------

    const purchaseShip = useCallback((shipId: string) => {
        const ship = getShipById(shipId);
        if (!ship) return;
        if (ownedShips.includes(shipId)) return;
        
        if (credits >= ship.price) {
            const newCredits = credits - ship.price;
            setCredits(newCredits);
            setOwnedShips(prev => [...prev, shipId]);
            
            // New ship is delivered to current location
            const newLocs = { ...shipLocations, [shipId]: dockedAt || 'earth' };
            setShipLocations(newLocs);
            
            // Instant save on purchase
            saveGame(undefined, newCredits, undefined, newLocs);
        }
    }, [credits, ownedShips, saveGame, dockedAt, shipLocations]);

    const equipShip = useCallback((shipId: string) => {
        if (!dockedAt) return; // Must be docked to switch
        if (!ownedShips.includes(shipId)) return;
        
        // Check if ship is here
        const shipLoc = shipLocations[shipId];
        if (shipLoc && shipLoc !== dockedAt) {
            console.warn("Ship is not at this station");
            return;
        }

        // SWAP LOGIC
        const oldShipId = currentShipId;
        const newShipId = shipId;
        
        if (oldShipId === newShipId) return;

        // 1. Update State
        setCurrentShipId(newShipId);
        
        const newShip = getShipById(newShipId);
        setFuel(prev => Math.min(prev, newShip.maxFuel));
        setBoost(prev => Math.min(prev, newShip.maxBoost));
        
        setShipLocations(prev => {
            const next = { ...prev };
            // Move old ship to current station
            next[oldShipId] = dockedAt;
            // Remove new ship from locations (it's now active)
            delete next[newShipId];
            return next;
        });

        // 2. Persist
        // We need the *calculated* new locations for the save
        const nextLocs = { ...shipLocations };
        nextLocs[oldShipId] = dockedAt;
        delete nextLocs[newShipId];

        const data: PlanetariumSaveData & { ship_locations?: any } = {
            fuel: Math.min(fuel, newShip.maxFuel),
            boost: Math.min(boost, newShip.maxBoost),
            credits,
            current_system: activeSystem,
            location_id: dockedAt,
            docked_at: dockedAt,
            position: savedPosition ? { x: savedPosition.x, y: savedPosition.y, z: savedPosition.z } : null,
            current_ship_id: newShipId,
            owned_ships: ownedShips,
            ship_locations: nextLocs
        };
        savePlayerProgress(data);

    }, [ownedShips, fuel, boost, credits, activeSystem, dockedAt, savedPosition, shipLocations, currentShipId, ownedShips]);

    const recallShip = useCallback((shipId: string) => {
        if (!dockedAt) return;
        const shipLoc = shipLocations[shipId];
        if (!shipLoc || shipLoc === dockedAt) return;
        
        // Calculate Distance
        const originBody = findBody(shipLoc);
        const destBody = findBody(dockedAt);
        
        if (!originBody || !destBody) return;
        
        const posA = getOrbitalPosition(originBody, simTimeState);
        const posB = getOrbitalPosition(destBody, simTimeState);
        const dist = posA.distanceTo(posB);
        
        // Travel Time: 5s base + 1s per 50 units
        const duration = 5000 + (dist / 50) * 1000;
        
        setShipTransfers(prev => ({
            ...prev,
            [shipId]: {
                destination: dockedAt,
                arrivalTime: Date.now() + duration,
                totalTime: duration
            }
        }));
    }, [dockedAt, shipLocations, findBody, simTimeState]);

    // ------------------------------------------------------------------
    // JOBS & ECONOMY
    // ------------------------------------------------------------------

    const generateJobsForLocation = useCallback((locationId: string) => {
        const origin = findBody(locationId);
        if (!origin) return;

        const validDestinations = currentData.flatMap(p => [p, ...(p.moons || [])])
            .filter(b => 
                b.id !== locationId && 
                !UNINHABITABLE_IDS.includes(b.id) && 
                b.type !== 'Star' && 
                b.type !== 'Black Hole'
            );
        
        const newJobs: HaulingJob[] = [];
        
        // Define cargo pools by Tier
        const tier = currentShip.tier || 1;
        
        const TIER_1_CARGO = ['Scrap Metal', 'Bio-Waste', 'Water Ice', 'Processed Food', 'Raw Iron'];
        const TIER_2_CARGO = ['Helium-3', 'Machinery', 'Textiles', 'Electronics', 'Fertilizer'];
        const TIER_3_CARGO = ['Rare Ore', 'Medical Supplies', 'Weapons', 'Gold Bullion', 'Cybernetics'];
        const TIER_4_CARGO = ['Data Cores', 'Prototype Tech', 'Zero-G Alloys', 'Sentient AI Units'];
        const TIER_5_CARGO = ['Alien Artifacts', 'Quantum Cores', 'Neutron Star Matter', 'Dark Matter Containers'];

        // Build pool based on ship tier
        let cargoPool = [...TIER_1_CARGO];
        if (tier >= 2) cargoPool = [...cargoPool, ...TIER_2_CARGO];
        if (tier >= 3) cargoPool = [...cargoPool, ...TIER_3_CARGO];
        if (tier >= 4) cargoPool = [...cargoPool, ...TIER_4_CARGO];
        if (tier >= 5) cargoPool = [...cargoPool, ...TIER_5_CARGO];

        const jobCount = 2 + Math.floor(tier / 2);

        for(let i=0; i < jobCount; i++) {
            const dest = validDestinations[Math.floor(Math.random() * validDestinations.length)];
            const dist = Math.abs(origin.distance - dest.distance) + 10; 
            
            let selectedCargo = cargoPool[Math.floor(Math.random() * cargoPool.length)];
            
            // --- UPDATED ECONOMY MATH ---
            // Base reward increased from 10 -> 30 to better cover fuel
            let baseReward = dist * 30; 
            
            // Multiplier based on cargo tier
            let valueMult = 1.0;
            if (TIER_5_CARGO.includes(selectedCargo)) valueMult = 10.0;
            else if (TIER_4_CARGO.includes(selectedCargo)) valueMult = 5.0;
            else if (TIER_3_CARGO.includes(selectedCargo)) valueMult = 2.5;
            else if (TIER_2_CARGO.includes(selectedCargo)) valueMult = 1.5;
            else valueMult = 1.2; // Tier 1 multiplier buffed from 0.5 -> 1.2

            // Flat fee increased to ensure short hops are profitable
            const flatFee = 1000 * valueMult; // Was 100
            const reward = Math.floor((baseReward * valueMult) + flatFee);

            newJobs.push({
                id: Math.random().toString(36).substr(2, 9),
                originId: locationId,
                destId: dest.id,
                cargo: selectedCargo,
                reward: reward,
                description: `Deliver ${selectedCargo} to ${dest.name}`,
                tier: tier 
            });
        }
        setAvailableJobs(newJobs);
    }, [currentData, findBody, currentShip]);

    const acceptJob = useCallback((job: HaulingJob) => {
        setActiveJob(job);
        setAvailableJobs([]); 
        setDockedAt(null); 
    }, [setDockedAt]);

    // UPDATED: Fix Stale State Issue
    const completeJob = useCallback(() => {
        if(activeJob) {
            const newCredits = credits + activeJob.reward;
            
            setCredits(newCredits);
            setLastCompletedJob(activeJob); 
            setActiveJob(null);
            
            // Pass newCredits directly to saveGame to avoid stale state closure
            saveGame(undefined, newCredits); 
        }
    }, [activeJob, saveGame, credits]);

    const clearCompletedJob = useCallback(() => {
        setLastCompletedJob(null);
    }, []);

    const updateFuel = useCallback((newAmount: number) => {
        setFuel(Math.max(0, Math.min(currentShip.maxFuel, newAmount)));
    }, [currentShip]);

    const buyFuel = useCallback(() => {
        setFuel(prev => {
            const missing = currentShip.maxFuel - prev;
            const cost = Math.floor(missing * FUEL_COST_PER_UNIT);
            if (credits >= cost) {
                const newCredits = credits - cost;
                setCredits(newCredits);
                // Instant Save
                saveGame(undefined, newCredits); 
                return currentShip.maxFuel; 
            }
            if (credits > 0) {
                 const affordableUnits = credits / FUEL_COST_PER_UNIT;
                 setCredits(0);
                 saveGame(undefined, 0);
                 return prev + affordableUnits;
            }
            return prev;
        });
    }, [credits, currentShip, saveGame]);

    const updateBoost = useCallback((newAmount: number) => {
        setBoost(Math.max(0, Math.min(currentShip.maxBoost, newAmount)));
    }, [currentShip]);

    const buyBoost = useCallback(() => {
        setBoost(prev => {
            const missing = currentShip.maxBoost - prev;
            const cost = Math.floor(missing * BOOST_COST_PER_UNIT);
            if (credits >= cost) {
                const newCredits = credits - cost;
                setCredits(newCredits);
                // Instant Save
                saveGame(undefined, newCredits);
                return currentShip.maxBoost;
            }
            if (credits > 0) {
                const affordableUnits = credits / BOOST_COST_PER_UNIT;
                setCredits(0);
                saveGame(undefined, 0);
                return prev + affordableUnits;
            }
            return prev;
        });
    }, [credits, currentShip, saveGame]);

    // MINING IMPLEMENTATION
    const startMining = useCallback((zoneId: string) => {
        setMiningState({ isMining: true, activeZoneId: zoneId });
    }, []);

    const stopMining = useCallback(() => {
        setMiningState({ isMining: false, activeZoneId: null });
    }, []);

    const mineAsteroid = useCallback((resource: string) => {
        if (!currentShip.miningCap) return 0;

        // Use functional state update to get the fresh inventory
        let added = 0;
        setInventory(prev => {
            const currentLoad = Object.values(prev).reduce((a, b) => a + b, 0);
            if (currentLoad >= currentShip.miningCap) return prev; // Full

            const baseYield = 1;
            const actualYield = Math.floor(baseYield * (currentShip.miningLaserPower || 1));
            // Ensure at least 1 if power > 0, unless 0 power
            const amountToAdd = Math.max(1, Math.min(actualYield, currentShip.miningCap - currentLoad));
            
            if (amountToAdd <= 0) return prev;

            added = amountToAdd;
            return {
                ...prev,
                [resource]: (prev[resource] || 0) + amountToAdd
            };
        });
        
        return added;
    }, [currentShip]);

    const sellResource = useCallback((resourceId: string, quantity: number) => {
        if (!dockedAt) return;
        const currentMarket = getMarketForStation(dockedAt);
        if (!currentMarket) return;
        
        const marketItem = currentMarket[resourceId];
        if (!marketItem || marketItem.saturation >= 100) return; // Market saturated or item not valid

        const available = inventory[resourceId] || 0;
        const amountToSell = Math.min(quantity, available);
        
        if (amountToSell <= 0) return;

        const profit = amountToSell * marketItem.price;

        // 1. Update Credits & Inventory
        const newCredits = credits + profit;
        setCredits(newCredits);
        
        const newInventory = { ...inventory };
        newInventory[resourceId] -= amountToSell;
        if (newInventory[resourceId] <= 0) delete newInventory[resourceId];
        setInventory(newInventory);

        // 2. Update Market Saturation (Selling fills demand)
        setMarketState(prev => {
            const stationMarket = prev[dockedAt];
            if (!stationMarket) return prev;
            
            const newSaturation = Math.min(100, stationMarket.data[resourceId].saturation + Math.ceil(amountToSell / 2));
            
            return {
                ...prev,
                [dockedAt]: {
                    ...stationMarket,
                    data: {
                        ...stationMarket.data,
                        [resourceId]: {
                            ...stationMarket.data[resourceId],
                            saturation: newSaturation
                        }
                    }
                }
            };
        });

        // 3. Save
        saveGame(undefined, newCredits, newInventory);
    }, [inventory, credits, saveGame, dockedAt, getMarketForStation]);

    const buyResource = useCallback((resourceId: string, quantity: number) => {
        if (!dockedAt) return;
        const currentMarket = getMarketForStation(dockedAt);
        if (!currentMarket) return;

        const marketItem = currentMarket[resourceId];
        if (!marketItem) return;

        const cost = quantity * marketItem.price;
        if (credits < cost) return;

        // Check Cargo Capacity
        const currentLoad = Object.values(inventory).reduce((a, b) => a + b, 0);
        const maxLoad = currentShip.miningCap || 0;
        if (currentLoad + quantity > maxLoad) return;

        // 1. Update Credits & Inventory
        const newCredits = credits - cost;
        setCredits(newCredits);

        const newInventory = { ...inventory };
        newInventory[resourceId] = (newInventory[resourceId] || 0) + quantity;
        setInventory(newInventory);

        // 2. Update Market Saturation (Buying reduces saturation/stock)
        setMarketState(prev => {
            const stationMarket = prev[dockedAt];
            if (!stationMarket) return prev;

            const newSaturation = Math.max(0, stationMarket.data[resourceId].saturation - Math.ceil(quantity / 2));

            return {
                ...prev,
                [dockedAt]: {
                    ...stationMarket,
                    data: {
                        ...stationMarket.data,
                        [resourceId]: {
                            ...stationMarket.data[resourceId],
                            saturation: newSaturation
                        }
                    }
                }
            };
        });

        saveGame(undefined, newCredits, newInventory);
    }, [inventory, credits, saveGame, dockedAt, getMarketForStation, currentShip]);

    const value = useMemo(() => ({ 
        timeRef, speedRef, simulationTime: simTimeState, speed, setSpeed, resetTime, setTime,
        activeSystem, setActiveSystem, currentData, findBody, getOrbitalPosition, getOrbitPoints,
        credits, fuel, boost, activeJob, availableJobs, dockedAt, lastDockedNode, lastDockVector, lastCompletedJob, savedPosition,
        currentShip, ownedShips, purchaseShip, equipShip, 
        setDockedAt, acceptJob, completeJob, clearCompletedJob, generateJobsForLocation, 
        updateFuel, buyFuel, updateBoost, buyBoost, saveGame, user, isLoadingSave,
        inventory, miningState, startMining, stopMining, mineAsteroid, sellResource, buyResource,
        marketState, getMarketForStation,
        shipLocations, shipTransfers, recallShip
    }), [speed, simTimeState, activeSystem, currentData, findBody, resetTime, setTime, credits, fuel, boost, activeJob, availableJobs, dockedAt, lastDockedNode, lastDockVector, lastCompletedJob, savedPosition, currentShip, ownedShips, updateFuel, buyFuel, updateBoost, buyBoost, saveGame, user, isLoadingSave, purchaseShip, equipShip, inventory, miningState, startMining, stopMining, mineAsteroid, sellResource, buyResource, marketState, getMarketForStation, shipLocations, shipTransfers, recallShip]);


    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}

export function TimeKeeper() {
    const { timeRef, speedRef } = useSimulation();
    useFrame((_, delta) => {
        timeRef.current += (delta * 1000) * speedRef.current;
    });
    return null;
}