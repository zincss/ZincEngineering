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
    CARGO_TIERS
} from './constants';

// Re-export constants for backwards compatibility
export { 
    J2000_EPOCH, 
    MILLISECONDS_PER_DAY, 
    FUEL_COST_PER_UNIT, 
    BOOST_COST_PER_UNIT,
    UNINHABITABLE_IDS,
    CARGO_TIERS
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
    
    // UPDATED: Added creditOverride support
    saveGame: (currentPosition?: THREE.Vector3, creditOverride?: number) => Promise<void>;
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
    
    const [activeJob, setActiveJob] = useState<HaulingJob | null>(null);
    const [dockedAt, _setDockedAt] = useState<string | null>(null);
    const [lastDockedNode, setLastDockedNode] = useState<string | null>(null);
    const [lastDockVector, setLastDockVector] = useState<{ x: number, y: number, z: number } | null>(null);
    const [availableJobs, setAvailableJobs] = useState<HaulingJob[]>([]);
    const [lastCompletedJob, setLastCompletedJob] = useState<HaulingJob | null>(null);
    const [savedPosition, setSavedPosition] = useState<{ x: number, y: number, z: number } | null>(null);

    const timeRef = useRef(Date.now());
    const speedRef = useRef(1);

    const setDockedAt = useCallback((id: string | null, vector?: { x: number, y: number, z: number } | null) => {
        if (id) {
            setLastDockedNode(id);
            if (vector) setLastDockVector(vector);
        }
        _setDockedAt(id);
    }, []);

    // Derived Current Ship Object
    const currentShip = useMemo(() => getShipById(currentShipId), [currentShipId]);

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
                        
                        if (save.docked_at) {
                            _setDockedAt(save.docked_at);
                            setLastDockedNode(save.docked_at);
                        } else {
                            _setDockedAt(null);
                        }
                        
                        setSavedPosition(save.position);
                        
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

    // UPDATED: Added creditOverride to support instant saving after job complete
    const saveGame = useCallback(async (currentPosition?: THREE.Vector3, creditOverride?: number) => {
        if (!user || isLoadingSave) return; 
        
        if (currentPosition) {
            setSavedPosition({ x: currentPosition.x, y: currentPosition.y, z: currentPosition.z });
        }

        const data: PlanetariumSaveData = {
            fuel,
            boost,
            credits: creditOverride !== undefined ? creditOverride : credits, // USE OVERRIDE IF PRESENT
            current_system: activeSystem,
            location_id: dockedAt, 
            docked_at: dockedAt,
            position: currentPosition ? { x: currentPosition.x, y: currentPosition.y, z: currentPosition.z } : null,
            current_ship_id: currentShipId,
            owned_ships: ownedShips
        };

        await savePlayerProgress(data);
    }, [user, isLoadingSave, fuel, boost, credits, activeSystem, dockedAt, currentShipId, ownedShips]);

    // SHIP ACTIONS
    const purchaseShip = useCallback((shipId: string) => {
        const ship = getShipById(shipId);
        if (!ship) return;
        if (ownedShips.includes(shipId)) return;
        
        if (credits >= ship.price) {
            const newCredits = credits - ship.price;
            setCredits(newCredits);
            setOwnedShips(prev => [...prev, shipId]);
            // Instant save on purchase
            saveGame(undefined, newCredits);
        }
    }, [credits, ownedShips, saveGame]);

    const equipShip = useCallback((shipId: string) => {
        if (ownedShips.includes(shipId)) {
            setCurrentShipId(shipId);
            // Cap fuel/boost if new ship has smaller tanks
            const newShip = getShipById(shipId);
            setFuel(prev => Math.min(prev, newShip.maxFuel));
            setBoost(prev => Math.min(prev, newShip.maxBoost));
            
            // Trigger a save so the ship persists
            const data: PlanetariumSaveData = {
                fuel: Math.min(fuel, newShip.maxFuel),
                boost: Math.min(boost, newShip.maxBoost),
                credits,
                current_system: activeSystem,
                location_id: dockedAt,
                docked_at: dockedAt,
                position: savedPosition ? { x: savedPosition.x, y: savedPosition.y, z: savedPosition.z } : null,
                current_ship_id: shipId,
                owned_ships: ownedShips
            };
            savePlayerProgress(data);
        }
    }, [ownedShips, fuel, boost, credits, activeSystem, dockedAt, savedPosition]);

    // TIERED JOB GENERATION
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

    const value = useMemo(() => ({ 
        timeRef, speedRef, simulationTime: simTimeState, speed, setSpeed, resetTime, setTime,
        activeSystem, setActiveSystem, currentData, findBody, getOrbitalPosition, getOrbitPoints,
        credits, fuel, boost, activeJob, availableJobs, dockedAt, lastDockedNode, lastDockVector, lastCompletedJob, savedPosition,
        currentShip, ownedShips, purchaseShip, equipShip, 
        setDockedAt, acceptJob, completeJob, clearCompletedJob, generateJobsForLocation, 
        updateFuel, buyFuel, updateBoost, buyBoost, saveGame, user, isLoadingSave
    }), [speed, simTimeState, activeSystem, currentData, findBody, resetTime, setTime, credits, fuel, boost, activeJob, availableJobs, dockedAt, lastDockedNode, lastDockVector, lastCompletedJob, savedPosition, currentShip, ownedShips, updateFuel, buyFuel, updateBoost, buyBoost, saveGame, user, isLoadingSave, purchaseShip, equipShip]);

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