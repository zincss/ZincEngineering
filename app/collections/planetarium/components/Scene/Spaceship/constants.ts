// app/collections/planetarium/components/Scene/Spaceship/constants.ts

import * as THREE from 'three';
import { CelestialBody } from '../../../data';

// --- EVENT NAMES ---
export const SPACESHIP_UPDATE_EVENT = 'spaceship-update';
export const SPACESHIP_CONTROL_EVENT = 'spaceship-control';
export const SPACESHIP_EXIT_EVENT = 'spaceship-exit';

// --- CONFIGURATION ---
export const NO_LANDING_IDS = ['sun', 'sagittarius_a', 'jupiter', 'saturn', 'uranus', 'neptune', 'zinc_prime_stars', 'endor_prime'];
export const DOCKING_RANGE = 50; 
export const DISTANCE_MULTIPLIER = 1275; 

// --- TYPES ---
export interface OrbitTarget {
    id: string;
    data: CelestialBody;
    pos: THREE.Vector3;
    dist: number;
    altitude: number;
    isStation: boolean;
}

export interface SpaceshipUpdateEventDetail {
    speed: number;
    boost: number;
    fuel: number;
    maxFuel: number;
    maxBoost: number;
    shipName: string;
    boosting: boolean;
    precision: boolean;
    flightAssist: boolean;
    canOrbit: boolean;
    isOrbiting: boolean;
    autopilot: boolean;
    cruise: number;
    mouseX: number;
    mouseY: number;
    targetId: string | undefined;
    targetDist: number;
    targetAltitude: number;
    targetRadius: number;
    shipPos: { x: number; y: number; z: number };
    shipQuat: THREE.Quaternion;
    isLocked: boolean;
}

// --- KEY BINDINGS ---
export const MOVEMENT_KEYS = {
    FORWARD: ['KeyW', 'ArrowUp'],
    BACKWARD: ['KeyS', 'ArrowDown'],
    LEFT: ['KeyA', 'ArrowLeft'],
    RIGHT: ['KeyD', 'ArrowRight'],
    ROLL_LEFT: ['KeyQ'],  
    ROLL_RIGHT: ['KeyE'], 
    UP: ['KeyR', 'ShiftLeft'],      
    DOWN: ['KeyF', 'ControlLeft'],  
    BOOST: ['Space'],
    PRECISION: ['Tab'],             
    ORBIT: ['KeyO'],
    FLIGHT_ASSIST: ['KeyZ'], 
    AUTOPILOT: ['KeyC'], 
    EXIT: ['Escape'] 
};

// --- HELPER FUNCTIONS ---
export const isDockableStructure = (type: string): boolean => {
    return ['Station', 'Relay', 'Satellite', 'Ship', 'Telescope', 'Outpost', 'Base', 'Forge', 'City'].includes(type);
};

export const formatDistance = (val: number): string => {
    const km = val * DISTANCE_MULTIPLIER;
    if (km >= 1000000) return (km / 1000000).toFixed(2) + "M km";
    if (km >= 1000) return (km / 1000).toFixed(1) + "k km";
    return km.toFixed(0) + " km";
};
