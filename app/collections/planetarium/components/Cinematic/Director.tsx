'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TOURS } from './data';
import { easeInOutSine } from './utils';
import { OverlayData, FlightData } from './types';

export function CinematicDirector({ 
    active, 
    tourId, 
    refs, 
    onStop,
    onOverlayUpdate,
    onFlightUpdate 
}: { 
    active: boolean, 
    tourId: string, 
    refs: any, 
    onStop: () => void,
    onOverlayUpdate: (data: OverlayData) => void,
    onFlightUpdate: (data: FlightData) => void
}) {
    const { camera } = useThree();
    
    const [shotIndex, setShotIndex] = useState(0);
    const [shotStartTime, setShotStartTime] = useState(0);
    const isFirstRun = useRef(true);
    const lastCountdownValue = useRef<number | null>(null);

    const physicsState = useRef({
        pos: new THREE.Vector3(),
        lookAt: new THREE.Vector3(),
        roll: 0,
        fov: 45,
        orbitAngle: 0
    });
    
    const currentLerpStart = useRef({
        pos: new THREE.Vector3(),
        lookAt: new THREE.Vector3()
    });

    const activeSpline = useRef<THREE.CatmullRomCurve3 | null>(null);
    const activeLookSpline = useRef<THREE.CatmullRomCurve3 | null>(null);
    const activeAuxSpline = useRef<THREE.CatmullRomCurve3 | null>(null);

    // --- ACTIVATION ---
    useEffect(() => {
        if (active) {
            setShotIndex(0);
            setShotStartTime(Date.now());
            isFirstRun.current = true;
            onOverlayUpdate({ show: false });
            onFlightUpdate({ active: false });
        } else {
            onOverlayUpdate({ show: false });
            onFlightUpdate({ active: false });
            camera.rotation.set(0,0,0); 
            activeSpline.current = null;
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

        // 1. BUILD SPLINES
        if (shot.type === 'spline' && shot.keyframes) {
            const points: THREE.Vector3[] = [];
            const auxPoints: THREE.Vector3[] = [];

            shot.keyframes.forEach(kf => {
                const vec = new THREE.Vector3();
                if (kf.targetId && refs.current[kf.targetId]) {
                    refs.current[kf.targetId].getWorldPosition(vec);
                }
                if (kf.offset) vec.add(new THREE.Vector3(...kf.offset));
                points.push(vec);

                const lastAux = auxPoints.length > 0 ? auxPoints[auxPoints.length - 1] : new THREE.Vector3(0, 45, 0);
                auxPoints.push(new THREE.Vector3(
                    kf.roll !== undefined ? kf.roll : lastAux.x,
                    kf.fov !== undefined ? kf.fov : lastAux.y,
                    0
                ));
            });

            // Increased tension (0.5 -> 0.4) for tighter curves around planets
            activeSpline.current = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4);
            activeAuxSpline.current = new THREE.CatmullRomCurve3(auxPoints, false, 'catmullrom', 0.5);

            if (shot.lookAtKeyframes) {
                const lookPoints = shot.lookAtKeyframes.map(kf => {
                    const vec = new THREE.Vector3();
                    if (kf.targetId && refs.current[kf.targetId]) {
                        refs.current[kf.targetId].getWorldPosition(vec);
                    }
                    if (kf.offset) vec.add(new THREE.Vector3(...kf.offset));
                    return vec;
                });
                activeLookSpline.current = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.5);
            } else {
                activeLookSpline.current = null;
            }
        } else {
            activeSpline.current = null;
        }

        // 2. DETERMINE START POSITION
        let startPos = new THREE.Vector3();
        let startLook = new THREE.Vector3();
        let startRoll = 0;
        let startFov = shot.fov || 45;

        if (shot.type === 'spline' && activeSpline.current) {
            activeSpline.current.getPointAt(0, startPos);
            if (activeAuxSpline.current) {
                const aux = activeAuxSpline.current.getPointAt(0);
                startRoll = aux.x;
                startFov = aux.y;
            }
            if (activeLookSpline.current) {
                activeLookSpline.current.getPointAt(0, startLook);
            } else {
                const t = activeSpline.current.getTangentAt(0);
                startLook.copy(startPos).add(t);
            }
        } else if (shot.targetId && refs.current[shot.targetId]) {
             const tPos = new THREE.Vector3();
             refs.current[shot.targetId].getWorldPosition(tPos);
             startPos.set(tPos.x + shot.distance, tPos.y + shot.height, tPos.z);
             startLook.copy(tPos);
        }

        // 3. TRANSITION
        if (shot.transition === 'cut' || isFirstRun.current) {
            physicsState.current.pos.copy(startPos);
            physicsState.current.lookAt.copy(startLook);
            physicsState.current.roll = startRoll;
            physicsState.current.fov = startFov;
            currentLerpStart.current.pos.copy(startPos);
            currentLerpStart.current.lookAt.copy(startLook);
            camera.position.copy(startPos);
            camera.lookAt(startLook);
            isFirstRun.current = false;
        } else {
            currentLerpStart.current.pos.copy(physicsState.current.pos);
            currentLerpStart.current.lookAt.copy(physicsState.current.lookAt);
        }

        // 4. UI
        if (shot.showFlightComputer) {
            onFlightUpdate({ 
                active: true, 
                startTime: Date.now(), 
                duration: shot.duration,
                origin: shot.originName || 'UNKNOWN',
                destination: shot.destName || 'UNKNOWN',
                facts: shot.facts 
            });
        } else {
            onFlightUpdate({ active: false });
        }

        // Titles & Countdown
        onOverlayUpdate({ show: false }); 
        let showTimer: NodeJS.Timeout;
        let hideTimer: NodeJS.Timeout;

        if (shot.countdownStart) {
            lastCountdownValue.current = shot.countdownStart;
            onOverlayUpdate({ title: `T-MINUS ${shot.countdownStart}`, subtitle: shot.subtitle, show: true });
        } 
        else if (shot.title) {
            const delayMs = (shot.titleDelay || 0) * 1000;
            const DISPLAY_DURATION = 6000; // Slower read time

            showTimer = setTimeout(() => {
                onOverlayUpdate({ title: shot.title, subtitle: shot.subtitle, show: true });
            }, delayMs);
            
            hideTimer = setTimeout(() => {
                onOverlayUpdate({ title: shot.title, subtitle: shot.subtitle, show: false });
            }, delayMs + DISPLAY_DURATION);
        } 
        return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
    }, [shotIndex, active, tourId]);


    // --- RENDER LOOP ---
    useFrame((state, delta) => {
        if (!active) return;
        if (shotStartTime === 0) return;

        const tour = TOURS.find(t => t.id === tourId);
        if (!tour || !tour.shots[shotIndex]) {
            setShotIndex(0);
            return;
        }
        
        const shot = tour.shots[shotIndex];
        const elapsed = (Date.now() - shotStartTime) / 1000;
        const progress = Math.min(1, elapsed / shot.duration);
        const smoothProgress = easeInOutSine(progress);

        // Countdown Logic
        if (shot.countdownStart) {
            const remaining = Math.ceil(shot.countdownStart - elapsed);
            if (remaining >= 0 && remaining !== lastCountdownValue.current) {
                lastCountdownValue.current = remaining;
                onOverlayUpdate({ 
                    title: remaining === 0 ? 'IGNITION' : `T-MINUS ${remaining}`, 
                    subtitle: shot.subtitle, 
                    show: true 
                });
            }
        }

        if (elapsed > shot.duration) {
            const nextIndex = (shotIndex + 1) % tour.shots.length;
            setShotIndex(nextIndex);
            setShotStartTime(Date.now());
            return;
        }

        const idealPos = new THREE.Vector3();
        const idealLookAt = new THREE.Vector3();
        let idealRoll = 0;
        let idealFov = shot.fov || 45;

        // --- SPLINE ENGINE ---
        if (shot.type === 'spline' && activeSpline.current) {
            const t = smoothProgress;
            activeSpline.current.getPointAt(t, idealPos);

            if (activeAuxSpline.current) {
                const aux = new THREE.Vector3();
                activeAuxSpline.current.getPointAt(t, aux);
                idealRoll = aux.x;
                idealFov = aux.y;
            }

            if (activeLookSpline.current) {
                activeLookSpline.current.getPointAt(t, idealLookAt);
            } else {
                 const tangent = activeSpline.current.getTangentAt(t);
                 idealLookAt.copy(idealPos).add(tangent);
            }
        }
        else {
             // Fallback
             idealPos.copy(currentLerpStart.current.pos);
             const targetCenter = new THREE.Vector3(0,0,0);
             if (shot.targetId && refs.current[shot.targetId]) {
                refs.current[shot.targetId].getWorldPosition(targetCenter);
             }
             idealLookAt.copy(targetCenter);
        }

        // --- PHYSICS ---
        const damp = shot.dampening || 0.6; 
        
        physicsState.current.pos.lerp(idealPos, delta * damp);
        physicsState.current.lookAt.lerp(idealLookAt, delta * (damp * 0.8));
        physicsState.current.roll = THREE.MathUtils.lerp(physicsState.current.roll, idealRoll, delta * 2.0);
        physicsState.current.fov = THREE.MathUtils.lerp(physicsState.current.fov, idealFov, delta * 2.0);

        // --- CAMERA SHAKE (REFINED) ---
        const renderPos = physicsState.current.pos.clone();

        if (shot.shakeIntensity && shot.shakeIntensity > 0) {
            const i = shot.shakeIntensity * 0.8; // Global reduction
            const time = state.clock.getElapsedTime();
            
            // Smooth "Perlin-like" drift instead of vibration
            const xShake = Math.sin(time * 1.5) * 0.5 + Math.sin(time * 3.5) * 0.25;
            const yShake = Math.cos(time * 1.8) * 0.5 + Math.cos(time * 4.2) * 0.25;
            const zShake = Math.sin(time * 0.5); // Very slow breathing

            renderPos.x += xShake * i;
            renderPos.y += yShake * i;
            renderPos.z += zShake * i * 0.5;
        }

        camera.position.copy(renderPos);
        camera.lookAt(physicsState.current.lookAt);
        const rollRad = THREE.MathUtils.degToRad(physicsState.current.roll);
        camera.rotation.z = rollRad;

        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = physicsState.current.fov;
            camera.updateProjectionMatrix();
        }
    });

    return null;
}