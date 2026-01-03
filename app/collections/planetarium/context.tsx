'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_DATA, CelestialBody } from './data';
import { FANTASY_DATA } from './fantasy_data';

// --- CONSTANTS ---
export const J2000_EPOCH = 946728000000;
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// --- CONTEXT ---
interface SimulationContextType {
    timeRef: React.MutableRefObject<number>;
    speedRef: React.MutableRefObject<number>;
    simulationTime: number; 
    setSpeed: (s: number) => void;
    speed: number;
    resetTime: () => void;
    setTime: (t: number) => void;
    // New Multi-System Support
    activeSystem: 'solar' | 'fantasy';
    setActiveSystem: (s: 'solar' | 'fantasy') => void;
    currentData: CelestialBody[];
    findBody: (id: string | null) => CelestialBody | undefined;
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

    // UI Clock Tick
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

    // Dynamic Data Source
    const currentData = useMemo(() => {
        return activeSystem === 'fantasy' ? FANTASY_DATA : PLANET_DATA;
    }, [activeSystem]);

    // Scoped Find Function - Memoized to prevent unnecessary effect triggers
    const findBody = useCallback((id: string | null): CelestialBody | undefined => {
        if (!id) return undefined;
        // Search current data first
        for (const body of currentData) {
            if (body.id === id) return body;
            if (body.moons) {
                const moon = body.moons.find(m => m.id === id);
                if (moon) return moon;
            }
        }
        return undefined;
    }, [currentData]);

    // Memoize the context value to prevent consumers from re-rendering on every clock tick
    // unless they specifically use simulationTime
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
        findBody
    }), [speed, simTimeState, activeSystem, currentData, findBody, resetTime, setTime]);

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}

// Math Helper: Needs to be available globally but doesn't need context if we pass data
export const getBodyPosition = (body: CelestialBody | undefined, time: number, allData: CelestialBody[]): THREE.Vector3 => {
    if (!body) return new THREE.Vector3(0, 0, 0);

    const daysSinceJ2000 = (time - J2000_EPOCH) / MILLISECONDS_PER_DAY;
    
    const calculateLocalPos = (b: CelestialBody) => {
        if (b.distance === 0) return new THREE.Vector3(0, 0, 0); 
        const n = 360 / (b.orbitalPeriod || 1);
        const L0 = b.meanLongitude || 0;
        const currentAngleDeg = L0 + (n * daysSinceJ2000);
        const currentAngleRad = THREE.MathUtils.degToRad(currentAngleDeg);
        return new THREE.Vector3(
            Math.cos(currentAngleRad) * b.distance,
            0,
            Math.sin(currentAngleRad) * b.distance
        );
    };

    let pos = calculateLocalPos(body);

    // Find parent in the provided dataset
    const parent = allData.find(p => p.moons?.some(m => m.id === body.id));
    if (parent) {
        const parentPos = calculateLocalPos(parent);
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