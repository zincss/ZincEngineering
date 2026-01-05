'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_DATA, CelestialBody } from './data';
import { FANTASY_DATA } from './fantasy_data';

export const J2000_EPOCH = 946728000000;
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// --- GAME CONFIG ---
export const MAX_FUEL = 2000;
export const FUEL_COST_PER_UNIT = 0.5; 
export const MAX_BOOST = 100;
export const BOOST_COST_PER_UNIT = 5; 

// --- BODIES YOU CANNOT DELIVER TO ---
const UNINHABITABLE_IDS = [
    'sun', 'sagittarius_a', 'zinc_prime_stars', 
    'jupiter', 'saturn', 'uranus', 'neptune', 'endor_prime' // Gas Giants
];

// --- GAME TYPES ---
export interface HaulingJob {
    id: string;
    originId: string;
    destId: string;
    cargo: string;
    reward: number;
    description: string;
}

// --- MATH HELPERS ---
const solveKepler = (M: number, e: number): number => {
    let E = M;
    for (let i = 0; i < 8; i++) {
        E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }
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

// --- CONTEXT ---
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
    
    // GAME MECHANICS
    credits: number;
    fuel: number; 
    boost: number;
    activeJob: HaulingJob | null;
    availableJobs: HaulingJob[];
    dockedAt: string | null;
    lastCompletedJob: HaulingJob | null;
    setDockedAt: (id: string | null) => void;
    acceptJob: (job: HaulingJob) => void;
    completeJob: () => void;
    clearCompletedJob: () => void;
    generateJobsForLocation: (locationId: string) => void;
    updateFuel: (newAmount: number) => void;
    buyFuel: () => void;
    updateBoost: (newAmount: number) => void;
    buyBoost: () => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function useSimulation() {
    const context = useContext(SimulationContext);
    if (!context) throw new Error("useSimulation must be used within SimulationProvider");
    return context;
}

// --- PROVIDER ---
export function SimulationProvider({ children }: { children: React.ReactNode }) {
    const [speed, setSpeed] = useState(1);
    const [simTimeState, setSimTimeState] = useState(Date.now());
    const [activeSystem, setActiveSystem] = useState<'solar' | 'fantasy'>('solar');
    
    // GAME STATE
    const [credits, setCredits] = useState(1000);
    const [fuel, setFuel] = useState(MAX_FUEL); 
    const [boost, setBoost] = useState(MAX_BOOST); 
    const [activeJob, setActiveJob] = useState<HaulingJob | null>(null);
    const [dockedAt, setDockedAt] = useState<string | null>(null);
    const [availableJobs, setAvailableJobs] = useState<HaulingJob[]>([]);
    const [lastCompletedJob, setLastCompletedJob] = useState<HaulingJob | null>(null);

    const timeRef = useRef(Date.now());
    const speedRef = useRef(1);

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

    // --- GAME LOGIC ---
    const generateJobsForLocation = useCallback((locationId: string) => {
        const origin = findBody(locationId);
        if (!origin) return;

        // FILTER: Only allow valid destinations (No Gas Giants, No Stars)
        const validDestinations = currentData.flatMap(p => [p, ...(p.moons || [])])
            .filter(b => 
                b.id !== locationId && 
                !UNINHABITABLE_IDS.includes(b.id) && 
                b.type !== 'Star' && 
                b.type !== 'Black Hole'
            );
        
        const newJobs: HaulingJob[] = [];
        const CARGO_TYPES = ['Helium-3', 'Water Ice', 'Machinery', 'Rare Ore', 'Data Cores', 'Passengers'];
        
        for(let i=0; i<3; i++) {
            const dest = validDestinations[Math.floor(Math.random() * validDestinations.length)];
            const dist = Math.abs(origin.distance - dest.distance) + 10; 
            const reward = Math.floor(dist * 50 + 500); 
            const cargo = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)];

            newJobs.push({
                id: Math.random().toString(36).substr(2, 9),
                originId: locationId,
                destId: dest.id,
                cargo: cargo,
                reward: reward,
                description: `Deliver ${cargo} to ${dest.name}`
            });
        }
        setAvailableJobs(newJobs);
    }, [currentData, findBody]);

    const acceptJob = useCallback((job: HaulingJob) => {
        setActiveJob(job);
        setAvailableJobs([]); 
        setDockedAt(null); 
    }, []);

    const completeJob = useCallback(() => {
        if(activeJob) {
            setCredits(c => c + activeJob.reward);
            setLastCompletedJob(activeJob); 
            setActiveJob(null);
        }
    }, [activeJob]);

    const clearCompletedJob = useCallback(() => {
        setLastCompletedJob(null);
    }, []);

    const updateFuel = useCallback((newAmount: number) => {
        setFuel(Math.max(0, Math.min(MAX_FUEL, newAmount)));
    }, []);

    const buyFuel = useCallback(() => {
        setFuel(prev => {
            const missing = MAX_FUEL - prev;
            const cost = Math.floor(missing * FUEL_COST_PER_UNIT);
            setCredits(c => Math.max(0, c - cost)); 
            return MAX_FUEL; 
        });
    }, []);

    const updateBoost = useCallback((newAmount: number) => {
        setBoost(Math.max(0, Math.min(MAX_BOOST, newAmount)));
    }, []);

    const buyBoost = useCallback(() => {
        setBoost(prev => {
            const missing = MAX_BOOST - prev;
            const cost = Math.floor(missing * BOOST_COST_PER_UNIT);
            setCredits(c => Math.max(0, c - cost));
            return MAX_BOOST;
        });
    }, []);

    const value = useMemo(() => ({ 
        timeRef, speedRef, simulationTime: simTimeState, speed, setSpeed, resetTime, setTime,
        activeSystem, setActiveSystem, currentData, findBody, getOrbitalPosition, getOrbitPoints,
        credits, fuel, boost, activeJob, availableJobs, dockedAt, lastCompletedJob,
        setDockedAt, acceptJob, completeJob, clearCompletedJob, generateJobsForLocation, 
        updateFuel, buyFuel, updateBoost, buyBoost
    }), [speed, simTimeState, activeSystem, currentData, findBody, resetTime, setTime, credits, fuel, boost, activeJob, availableJobs, dockedAt, lastCompletedJob, updateFuel, buyFuel, updateBoost, buyBoost]);

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