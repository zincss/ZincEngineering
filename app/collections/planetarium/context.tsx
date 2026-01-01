'use client';

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_DATA, CelestialBody } from './data';

// --- CONSTANTS ---
export const J2000_EPOCH = 946728000000;
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// --- CONTEXT ---
interface SimulationContextType {
    timeRef: React.MutableRefObject<number>;
    speedRef: React.MutableRefObject<number>;
    simulationTime: number; // For UI updates (1hz)
    setSpeed: (s: number) => void;
    speed: number;
    resetTime: () => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function useSimulation() {
    const context = useContext(SimulationContext);
    if (!context) throw new Error("useSimulation must be used within SimulationProvider");
    return context;
}

// --- MATH HELPERS ---
export const findBodyById = (id: string | null): CelestialBody | undefined => {
    if (!id) return undefined;
    for (const planet of PLANET_DATA) {
        if (planet.id === id) return planet;
        if (planet.moons) {
            const moon = planet.moons.find(m => m.id === id);
            if (moon) return moon;
        }
    }
    return undefined;
};

export const getBodyPosition = (bodyId: string, time: number): THREE.Vector3 => {
    const body = findBodyById(bodyId);
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

    const parent = PLANET_DATA.find(p => p.moons?.some(m => m.id === bodyId));
    if (parent) {
        const parentPos = calculateLocalPos(parent);
        pos.add(parentPos);
    }

    return pos;
};

// --- PROVIDER ---
export function SimulationProvider({ children }: { children: React.ReactNode }) {
    const [speed, setSpeed] = useState(1);
    const [simTimeState, setSimTimeState] = useState(Date.now());
    const timeRef = useRef(Date.now());
    const speedRef = useRef(1);

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    // UI Clock Tick (1 second interval)
    useEffect(() => {
        const interval = setInterval(() => {
            setSimTimeState(timeRef.current);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const resetTime = () => {
        timeRef.current = Date.now();
        setSpeed(1);
    };

    return (
        <SimulationContext.Provider value={{ 
            timeRef, 
            speedRef, 
            simulationTime: simTimeState,
            speed,
            setSpeed,
            resetTime
        }}>
            {children}
        </SimulationContext.Provider>
    );
}

// Component to run the loop inside Canvas
export function TimeKeeper() {
    const { timeRef, speedRef } = useSimulation();
    useFrame((_, delta) => {
        timeRef.current += (delta * 1000) * speedRef.current;
    });
    return null;
}