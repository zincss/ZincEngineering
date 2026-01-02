'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// --- TYPES ---
export type ShotType = 'orbit' | 'flyby' | 'static' | 'travel' | 'eclipse';

export interface CinematicShot {
    targetId?: string;      
    title?: string;         
    subtitle?: string;      
    titleDelay?: number;    
    type: ShotType;
    duration: number;       
    distance: number;       
    height: number;         
    speed: number;          
    fov?: number;          
    dampening?: number;     
    side?: 'lit' | 'dark' | 'any'; 
}

export interface Tour {
    id: string;
    name: string;
    description: string;
    shots: CinematicShot[];
}

export interface OverlayData {
    title?: string;
    subtitle?: string;
    show: boolean;
}

// --- CINEMATIC DATA ---
export const TOURS: Tour[] = [
    {
        id: 'grand_tour',
        name: 'The Grand Tour',
        description: 'A pure celestial journey.',
        shots: [
            // --- SUN SEQUENCE ---
            { 
                targetId: 'sun', 
                title: 'SOL', 
                subtitle: 'SYSTEM ORIGIN // CLASS G STAR',
                titleDelay: 1,
                type: 'static', 
                duration: 12, 
                distance: 160, 
                height: 0, 
                speed: 0.02,
                fov: 60,
                dampening: 1.5
            },

            // --- MERCURY SEQUENCE ---
            { targetId: 'mercury', type: 'travel', duration: 7, distance: 15, height: 2, speed: 0, side: 'lit', dampening: 2.0 },
            { 
                targetId: 'mercury', 
                title: 'MERCURY', 
                subtitle: 'THE MESSENGER',
                titleDelay: 1.0, 
                type: 'orbit', 
                duration: 14, 
                distance: 8, 
                height: 1, 
                speed: 0.08,
                dampening: 1.5 
            },
            { targetId: 'mercury', type: 'orbit', duration: 10, distance: 5, height: 0.5, speed: 0.25, fov: 55 },
            { targetId: 'mercury', type: 'eclipse', duration: 8, distance: 18, height: 0, speed: 0.05 },

            // --- VENUS SEQUENCE ---
            { targetId: 'venus', type: 'travel', duration: 9, distance: 20, height: 0, speed: 0, side: 'lit' },
            { 
                targetId: 'venus', 
                title: 'VENUS', 
                subtitle: 'THE MORNING STAR',
                titleDelay: 1.5,
                type: 'orbit', 
                duration: 16, 
                distance: 14, 
                height: 0, 
                speed: 0.06,
                dampening: 1.5
            },
            { targetId: 'venus', type: 'orbit', duration: 12, distance: 18, height: 14, speed: 0.04 },
            { targetId: 'venus', type: 'flyby', duration: 8, distance: 20, height: -5, speed: 0.1 },

            // --- EARTH SEQUENCE ---
            { targetId: 'earth', type: 'travel', duration: 10, distance: 25, height: 5, speed: 0, side: 'lit' },
            { 
                targetId: 'earth', 
                title: 'TERRA', 
                subtitle: 'SECTOR ZERO // HOME',
                titleDelay: 1.0,
                type: 'orbit', 
                duration: 20, 
                distance: 12, 
                height: 3, 
                speed: 0.04,
                dampening: 1.2 
            },
            { targetId: 'earth', type: 'static', duration: 10, distance: 25, height: 10, speed: 0.02 },

            // --- MOON SEQUENCE ---
            { targetId: 'moon', type: 'travel', duration: 6, distance: 8, height: 0, speed: 0, side: 'lit' },
            { 
                targetId: 'moon', 
                title: 'LUNA', 
                subtitle: 'THE SATELLITE',
                titleDelay: 1.0, 
                type: 'orbit', 
                duration: 14, 
                distance: 5, 
                height: 0, 
                speed: 0.1,
                dampening: 1.5
            },
            { targetId: 'moon', type: 'orbit', duration: 10, distance: 3.5, height: 0.5, speed: 0.2 },

            // --- MARS SEQUENCE ---
            { targetId: 'mars', type: 'travel', duration: 10, distance: 20, height: 0, speed: 0, side: 'lit' },
            { 
                targetId: 'mars', 
                title: 'MARS', 
                subtitle: 'THE RED PLANET',
                titleDelay: 1.5,
                type: 'orbit', 
                duration: 16, 
                distance: 10, 
                height: 2, 
                speed: 0.1,
                dampening: 1.5
            },
            { targetId: 'mars', type: 'orbit', duration: 12, distance: 7, height: 0.5, speed: 0.25 },
            { targetId: 'mars', type: 'eclipse', duration: 8, distance: 15, height: -2, speed: 0.05 },

            // --- JUPITER SEQUENCE ---
            { targetId: 'jupiter', type: 'travel', duration: 14, distance: 60, height: 10, speed: 0, side: 'lit' },
            { 
                targetId: 'jupiter', 
                title: 'JUPITER', 
                subtitle: 'KING OF WORLDS',
                titleDelay: 2.0, 
                type: 'orbit', 
                duration: 22, 
                distance: 45, 
                height: 0, 
                speed: 0.03,
                dampening: 1.0 
            },
            { targetId: 'jupiter', type: 'flyby', duration: 15, distance: 50, height: 0, speed: 0.08 },
            { targetId: 'jupiter', type: 'orbit', duration: 12, distance: 55, height: -30, speed: 0.04 },

            // --- SATURN SEQUENCE ---
            { targetId: 'saturn', type: 'travel', duration: 16, distance: 70, height: 0, speed: 0, side: 'lit' },
            { 
                targetId: 'saturn', 
                title: 'SATURN', 
                subtitle: 'THE JEWEL',
                titleDelay: 2.0,
                type: 'orbit', 
                duration: 20, 
                distance: 60, 
                height: 10, 
                speed: 0.05, 
                dampening: 1.2
            },
            { targetId: 'saturn', type: 'orbit', duration: 15, distance: 45, height: 1, speed: 0.12 },
            { targetId: 'saturn', type: 'static', duration: 10, distance: 100, height: 80, speed: 0.02 },

            // --- URANUS SEQUENCE ---
            { targetId: 'uranus', type: 'travel', duration: 16, distance: 30, height: 0, speed: 0, side: 'lit' },
            {
                targetId: 'uranus',
                title: 'URANUS',
                subtitle: 'THE ICE GIANT',
                titleDelay: 1.5,
                type: 'orbit',
                duration: 18,
                distance: 12,
                height: 0,
                speed: 0.06
            },
            { targetId: 'uranus', type: 'orbit', duration: 14, distance: 14, height: 10, speed: 0.08 },

            // --- NEPTUNE SEQUENCE ---
            { targetId: 'neptune', type: 'travel', duration: 16, distance: 30, height: 0, speed: 0, side: 'lit' },
            {
                targetId: 'neptune',
                title: 'NEPTUNE',
                subtitle: 'THE DEEP BLUE',
                titleDelay: 1.5,
                type: 'orbit',
                duration: 18,
                distance: 12,
                height: 0,
                speed: 0.06
            },
            { targetId: 'neptune', type: 'flyby', duration: 12, distance: 15, height: -5, speed: 0.08 },

            // --- PLUTO SEQUENCE ---
            { targetId: 'pluto', type: 'travel', duration: 14, distance: 5, height: 0, speed: 0, side: 'lit' },
            {
                targetId: 'pluto',
                title: 'PLUTO',
                subtitle: 'THE EDGE',
                titleDelay: 1.0,
                type: 'orbit',
                duration: 16,
                distance: 2,
                height: 0.5,
                speed: 0.1
            },
            { targetId: 'pluto', type: 'static', duration: 12, distance: 4, height: 1, speed: 0.02 },

            // --- THE INTERSTELLAR LEAP TO SAGITTARIUS A* ---
            { 
                targetId: 'sagittarius_a', 
                type: 'travel', 
                duration: 25, // Long travel for the sense of scale
                distance: 200, 
                height: 50, 
                speed: 0, 
                dampening: 3.0 // Stable flight
            },
            {
                targetId: 'sagittarius_a',
                title: 'SAGITTARIUS A*',
                subtitle: 'GALACTIC CORE // SINGULARITY',
                titleDelay: 2.0,
                type: 'orbit',
                duration: 30,
                distance: 120,
                height: 30,
                speed: 0.03, // Majestic slow rotation
                dampening: 1.0
            },
            {
                targetId: 'sagittarius_a',
                type: 'flyby', // Dive into the accretion disk
                duration: 15,
                distance: 80,
                height: 0, 
                speed: 0.1,
                fov: 90 // Warp speed feel
            },

             // --- OUTRO ---
             { targetId: 'sun', title: 'SOLAR SYSTEM', subtitle: 'SIMULATION PAUSED', type: 'static', duration: 20, distance: 1000, height: 500, speed: 0.05, fov: 70 },
        ]
    }
];

// --- MATH HELPERS ---
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// --- COMPONENT: TITLE OVERLAY ---
export function CinematicOverlay({ data }: { data: OverlayData }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <div className={`
                flex flex-col items-center justify-center 
                transition-opacity duration-[5000ms] ease-in-out
                ${data.show ? 'opacity-100' : 'opacity-0'}
            `}>
                <div className="relative flex flex-col items-center">
                    <h1 className={`
                        text-6xl md:text-8xl font-black text-white uppercase tracking-tighter
                        transition-all duration-[5000ms] ease-out transform
                        ${data.show ? 'scale-100 blur-0 translate-z-0' : 'scale-105 blur-lg translate-z-10'}
                    `}
                    style={{ 
                        fontFamily: 'system-ui, -apple-system, sans-serif', 
                        textShadow: '0 0 50px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5)' 
                    }}>
                        {data.title}
                    </h1>
                    
                    <div className={`
                        h-[2px] bg-white mx-auto mt-2 shadow-[0_0_10px_white]
                        transition-all duration-[3000ms] ease-out delay-200
                        ${data.show ? 'w-[120%] opacity-100' : 'w-0 opacity-0'}
                    `} />

                    {data.subtitle && (
                        <p className={`
                            text-sm md:text-xl font-mono text-[#DFFF00] mt-4 tracking-[0.5em] uppercase text-center
                            transition-all duration-[3000ms] delay-300
                            ${data.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                        style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                        >
                            {data.subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- MAIN DIRECTOR COMPONENT ---
export function CinematicDirector({ 
    active, 
    tourId, 
    refs, 
    onStop,
    onOverlayUpdate 
}: { 
    active: boolean, 
    tourId: string, 
    refs: any, 
    onStop: () => void,
    onOverlayUpdate: (data: OverlayData) => void
}) {
    const { camera } = useThree();
    
    // Playback State
    const [shotIndex, setShotIndex] = useState(0);
    const [shotStartTime, setShotStartTime] = useState(0);
    
    // Physics State
    const transitionState = useRef({
        pos: new THREE.Vector3(),
        lookAt: new THREE.Vector3(),
        orbitAngle: 0
    });
    const currentPos = useRef(new THREE.Vector3());
    const currentLookAt = useRef(new THREE.Vector3());

    // --- INITIALIZATION ---
    useEffect(() => {
        if (active) {
            setShotIndex(0);
            setShotStartTime(Date.now());
            transitionState.current.pos.copy(camera.position);
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            transitionState.current.lookAt.copy(camera.position).add(forward.multiplyScalar(100));
            currentPos.current.copy(camera.position);
            currentLookAt.current.copy(transitionState.current.lookAt);
            onOverlayUpdate({ show: false });
        } else {
            onOverlayUpdate({ show: false });
        }
    }, [active, tourId]);

    // --- ESCAPE KEY ---
    useEffect(() => {
        if (!active) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onStop();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, onStop]);

    // --- SHOT MANAGER ---
    useEffect(() => {
        if (!active) return;
        const tour = TOURS.find(t => t.id === tourId);
        if (!tour || !tour.shots[shotIndex]) return;
        const shot = tour.shots[shotIndex];

        // Capture Handoff
        transitionState.current.pos.copy(currentPos.current);
        transitionState.current.lookAt.copy(currentLookAt.current);
        
        if (shot.targetId && refs.current[shot.targetId]) {
            const targetPos = new THREE.Vector3();
            refs.current[shot.targetId].getWorldPosition(targetPos);
            const dx = currentPos.current.x - targetPos.x;
            const dz = currentPos.current.z - targetPos.z;
            transitionState.current.orbitAngle = Math.atan2(dz, dx);
        }

        // Overlay logic
        onOverlayUpdate({ show: false });
        let showTimer: NodeJS.Timeout;
        let hideTimer: NodeJS.Timeout;

        if (shot.title) {
            const delay = (shot.titleDelay || 0) * 1000;
            showTimer = setTimeout(() => {
                onOverlayUpdate({ title: shot.title, subtitle: shot.subtitle, show: true });
            }, delay);
            hideTimer = setTimeout(() => {
                onOverlayUpdate({ title: shot.title, subtitle: shot.subtitle, show: false });
            }, delay + 4000); // Hold for 4s then fade
        } 
        return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
    }, [shotIndex, active, tourId]);


    // --- RENDER LOOP ---
    useFrame((state, delta) => {
        if (!active) return;

        const tour = TOURS.find(t => t.id === tourId);
        if (!tour) return;

        const shot = tour.shots[shotIndex];
        const elapsed = (Date.now() - shotStartTime) / 1000;
        const progress = Math.min(1, elapsed / shot.duration);
        const smoothProgress = easeInOutCubic(progress);

        if (elapsed > shot.duration) {
            const nextIndex = (shotIndex + 1) % tour.shots.length;
            setShotIndex(nextIndex);
            setShotStartTime(Date.now());
            return;
        }

        const targetCenter = new THREE.Vector3(0, 0, 0);
        if (shot.targetId && refs.current[shot.targetId]) {
            refs.current[shot.targetId].getWorldPosition(targetCenter);
        } 

        const idealPos = new THREE.Vector3();
        const idealLookAt = new THREE.Vector3();

        if (shot.type === 'travel') {
            const pStart = transitionState.current.pos;
            let arrivalOffset = new THREE.Vector3(shot.distance, shot.height, shot.distance);
            
            if (shot.side === 'lit') {
                const sunPos = new THREE.Vector3(0,0,0);
                const toSun = new THREE.Vector3().subVectors(sunPos, targetCenter).normalize();
                toSun.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI * 0.15); 
                arrivalOffset.copy(toSun).multiplyScalar(shot.distance);
                arrivalOffset.y = shot.height;
            }

            const pEnd = targetCenter.clone().add(arrivalOffset);
            const mid = new THREE.Vector3().lerpVectors(pStart, pEnd, 0.5);
            const dist = pStart.distanceTo(pEnd);
            
            // --- COLLISION AVOIDANCE ---
            // If midpoint is dangerously close to the Sun (0,0,0)
            const sunDist = mid.distanceTo(new THREE.Vector3(0,0,0));
            if (sunDist < 50) {
                 // Push path UP significantly to fly "over" the solar system plane
                 mid.y += 100;
            } else {
                 // Normal arc
                 mid.y += Math.min(60, dist * 0.25); 
            }

            const t = smoothProgress;
            idealPos.x = (1-t)*(1-t)*pStart.x + 2*(1-t)*t*mid.x + t*t*pEnd.x;
            idealPos.y = (1-t)*(1-t)*pStart.y + 2*(1-t)*t*mid.y + t*t*pEnd.y;
            idealPos.z = (1-t)*(1-t)*pStart.z + 2*(1-t)*t*mid.z + t*t*pEnd.z;

            idealLookAt.lerpVectors(transitionState.current.lookAt, targetCenter, t);
        }
        else if (shot.type === 'orbit') {
            const angle = transitionState.current.orbitAngle + (elapsed * shot.speed);
            idealPos.x = targetCenter.x + Math.cos(angle) * shot.distance;
            idealPos.z = targetCenter.z + Math.sin(angle) * shot.distance;
            idealPos.y = targetCenter.y + shot.height + (Math.sin(elapsed * 0.5) * 2);
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'flyby') {
            const startOffset = new THREE.Vector3(-shot.distance, shot.height, -shot.distance * 0.5);
            const endOffset = new THREE.Vector3(shot.distance, shot.height, shot.distance * 0.5);
            const currentOffset = new THREE.Vector3().lerpVectors(startOffset, endOffset, progress);
            idealPos.copy(targetCenter).add(currentOffset);
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'eclipse') {
            const sunPos = new THREE.Vector3(0,0,0);
            const dirFromSun = new THREE.Vector3().subVectors(targetCenter, sunPos).normalize();
            const verticalDrift = Math.sin(elapsed * 0.2) * 5;
            idealPos.copy(targetCenter).add(dirFromSun.multiplyScalar(shot.distance));
            idealPos.y += shot.height + verticalDrift;
            idealLookAt.copy(targetCenter);
        }
        else if (shot.type === 'static') {
            const driftFactor = 1 + (elapsed * 0.01);
            const angle = transitionState.current.orbitAngle;
            idealPos.x = targetCenter.x + Math.cos(angle) * (shot.distance * driftFactor);
            idealPos.z = targetCenter.z + Math.sin(angle) * (shot.distance * driftFactor);
            idealPos.y = targetCenter.y + shot.height;
            idealLookAt.copy(targetCenter);
        }

        const damp = shot.dampening || 1.8; 
        currentPos.current.lerp(idealPos, delta * damp);
        currentLookAt.current.lerp(idealLookAt, delta * 2.0);

        camera.position.copy(currentPos.current);
        camera.lookAt(currentLookAt.current);
        
        if (shot.fov && camera instanceof THREE.PerspectiveCamera) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, shot.fov, delta);
            camera.updateProjectionMatrix();
        } else if (camera instanceof THREE.PerspectiveCamera && camera.fov !== 45) {
             camera.fov = THREE.MathUtils.lerp(camera.fov, 45, delta);
             camera.updateProjectionMatrix();
        }
    });

    return null;
}