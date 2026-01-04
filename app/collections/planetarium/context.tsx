// app/collections/planetarium/context.tsx

'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_DATA, CelestialBody } from './data';
import { FANTASY_DATA } from './fantasy_data';

export const J2000_EPOCH = 946728000000;
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// --- MATH HELPERS ---
const solveKepler = (M: number, e: number): number => {
    let E = M;
    // Increased iterations from 5 to 8 for better precision on highly eccentric orbits (like Eris)
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

    const value = useMemo(() => ({ 
        timeRef, 
        speedRef, 
        simulationTime: simTimeState,
        speed,
        setSpeed,
        resetTime,
        setTime,
        activeSystem,
        setActiveSystem,
        currentData,
        findBody,
        getOrbitalPosition,
        getOrbitPoints 
    }), [speed, simTimeState, activeSystem, currentData, findBody, resetTime, setTime]);

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}

export const getBodyPosition = (body: CelestialBody | undefined, time: number, allData: CelestialBody[]): THREE.Vector3 => {
    if (!body) return new THREE.Vector3(0, 0, 0);

    let pos = getOrbitalPosition(body, time);

    const parent = allData.find(p => p.moons?.some(m => m.id === body.id));
    if (parent) {
        const parentPos = getOrbitalPosition(parent, time);
        pos.add(parentPos);
    }

    return pos;
};

export function TimeKeeper() {
    const { timeRef, speedRef } = useSimulation();
    useFrame((_, delta) => {
        timeRef.current += (delta * 1000) * speedRef.current;
    });
    return null;
}