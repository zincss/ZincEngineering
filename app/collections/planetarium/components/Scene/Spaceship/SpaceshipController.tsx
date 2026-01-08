'use client';

// app/collections/planetarium/components/Scene/Spaceship/SpaceshipController.tsx

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation, getOrbitalPosition, MINING_LOCATIONS } from '../../../context';
import { PLANET_DATA, CelestialBody } from '../../../data';
import { MiningLaser } from './MiningLaser';
import {
    SPACESHIP_UPDATE_EVENT,
    SPACESHIP_CONTROL_EVENT,
    SPACESHIP_EXIT_EVENT,
    MOVEMENT_KEYS,
    isDockableStructure,
    OrbitTarget
} from './constants';

interface SpaceshipControllerProps {
    active: boolean;
    lockedTargetId: string | null;
    hoveredTargetId: string | null;
}

export function SpaceshipController({ active, lockedTargetId, hoveredTargetId }: SpaceshipControllerProps) {
    const { camera } = useThree() as unknown as { camera: THREE.PerspectiveCamera };
    const { 
        timeRef, 
        fuel: contextFuel, 
        updateFuel, 
        boost: contextBoost, 
        updateBoost, 
        saveGame, 
        savedPosition, 
        dockedAt, 
        lastDockedNode, 
        lastDockVector, 
        findBody, 
        isLoadingSave, 
        currentShip, 
        activeJob,
        miningState,
        startMining,
        stopMining,
        currentData,
    } = useSimulation(); 
    
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const trueQuaternion = useRef(new THREE.Quaternion()); // Actual flight direction
    const lastEventTime = useRef(0);
    const isPrecision = useRef(false);
    const isFreeLook = useRef(false);
    const flightAssist = useRef(true); 
    const autopilot = useRef(false); 
    const initialized = useRef(false);
    
    // Mining State
    const miningHeat = useRef(0);
    const isOverheated = useRef(false);
    const isFiring = useRef(false); // Track mouse hold
    
    const fuelRef = useRef(contextFuel);
    const boostRef = useRef(contextBoost);
    
    const lockedTargetRef = useRef(lockedTargetId);
    const hoveredTargetRef = useRef(hoveredTargetId);

    const isOrbiting = useRef(false);
    const activeOrbitTarget = useRef<OrbitTarget | null>(null);

    const cruiseThrottle = useRef(0);
    const smoothedPointer = useRef(new THREE.Vector2(0, 0));
    const shipGroupRef = useRef<THREE.Group>(null);
    
    // Cockpit motion state for immersive camera effects
    const cockpitMotion = useRef({
        roll: 0,           // Turn-induced roll
        pitch: 0,          // Thrust-induced pitch  
        sway: 0,           // Lateral sway from strafing
        verticalBob: 0,    // Vertical movement feedback
        shakeIntensity: 0, // Current shake level (smoothed)
        breathPhase: 0     // For idle breathing motion
    });

    const keys = useRef({
        forward: false, backward: false,
        left: false, right: false,
        rollLeft: false, rollRight: false,
        up: false, down: false,
        boost: false
    });
    
    const { allBodies, parentMap } = useMemo(() => {
        const bodies: CelestialBody[] = [];
        const parents: Record<string, CelestialBody> = {};
        PLANET_DATA.forEach(p => {
            bodies.push(p);
            if (p.moons) {
                p.moons.forEach(m => {
                    bodies.push(m);
                    parents[m.id] = p; 
                });
            }
        });
        return { allBodies: bodies, parentMap: parents };
    }, []);

    // --- AUTO-SAVE LOGIC ---
    useEffect(() => {
        if (!active || isLoadingSave || dockedAt) return;
        const saveInterval = setInterval(() => {
            if (camera) {
                saveGame(camera.position.clone());
            }
        }, 10000);
        return () => clearInterval(saveInterval);
    }, [active, isLoadingSave, dockedAt, saveGame, camera]);

    useEffect(() => {
        if (!active) initialized.current = false;
    }, [active]);

    // --- INITIALIZATION ---
    useEffect(() => {
        if (active && !isLoadingSave && !initialized.current) {
            initialized.current = true;
            velocity.current.set(0, 0, 0); 
            cruiseThrottle.current = 0;
            autopilot.current = false; 

            let spawnBodyId = null;

            if (dockedAt) {
                spawnBodyId = dockedAt;
            }
            else if (lastDockedNode) {
                spawnBodyId = lastDockedNode;
            }

            if (spawnBodyId) {
                const body = findBody(spawnBodyId);
                if (body) {
                    const bodyPos = getOrbitalPosition(body, timeRef.current);
                    if (parentMap[body.id]) {
                        const parent = parentMap[body.id];
                        bodyPos.add(getOrbitalPosition(parent, timeRef.current));
                    }
                    
                    if (lastDockVector && !dockedAt) {
                        const offset = new THREE.Vector3(lastDockVector.x, lastDockVector.y, lastDockVector.z);
                        if (offset.length() < body.radius * 1.05) offset.setLength(body.radius * 1.05);
                        
                        camera.position.copy(bodyPos).add(offset);
                        camera.lookAt(bodyPos);
                    } else {
                        camera.position.copy(bodyPos).add(new THREE.Vector3(0, 0, body.radius + 100));
                        camera.lookAt(bodyPos);
                    }
                    trueQuaternion.current.copy(camera.quaternion);
                }
            } 
            else if (savedPosition) {
                camera.position.set(savedPosition.x, savedPosition.y, savedPosition.z);
                trueQuaternion.current.copy(camera.quaternion);
            }
            else {
                 const earth = findBody('earth');
                 if (earth) {
                    const pos = getOrbitalPosition(earth, timeRef.current);
                    camera.position.copy(pos).add(new THREE.Vector3(0, 0, earth.radius + 200));
                    camera.lookAt(pos);
                    trueQuaternion.current.copy(camera.quaternion);
                 }
            }
        }
    }, [active, isLoadingSave, dockedAt, lastDockedNode, lastDockVector, savedPosition, findBody, parentMap, timeRef, camera]);

    useEffect(() => { lockedTargetRef.current = lockedTargetId; }, [lockedTargetId]);
    useEffect(() => { hoveredTargetRef.current = hoveredTargetId; }, [hoveredTargetId]);
    useEffect(() => { fuelRef.current = contextFuel; }, [contextFuel]);
    useEffect(() => { boostRef.current = contextBoost; }, [contextBoost]);

    const calculateTargetScore = (body: CelestialBody, currentPos: THREE.Vector3, camDir: THREE.Vector3, physicsTime: number) => {
        let bodyPos = getOrbitalPosition(body, physicsTime);
        if (parentMap[body.id]) {
            const parent = parentMap[body.id];
            bodyPos.add(getOrbitalPosition(parent, physicsTime));
        }
        const dist = currentPos.distanceTo(bodyPos);
        const altitude = dist - body.radius;
        const isStation = isDockableStructure(body.type);
        const isMoon = body.type === 'Moon';
        const isDwarf = body.type === 'Dwarf Planet';
        if (lockedTargetRef.current && lockedTargetRef.current === body.id) {
             return { score: -100000000 + dist, data: { id: body.id, data: body, pos: bodyPos, dist, altitude, isStation } };
        }
        if (hoveredTargetRef.current && hoveredTargetRef.current === body.id) {
            return { score: -50000000 + dist, data: { id: body.id, data: body, pos: bodyPos, dist, altitude, isStation } };
        }
        let activeScanRange = 15000; 
        if (isMoon) activeScanRange = 5000; 
        if (isStation) activeScanRange = 2500; 
        if (dist > activeScanRange) return null;
        const dirToBody = bodyPos.clone().sub(currentPos).normalize();
        const viewAlign = camDir.dot(dirToBody); 
        const proximityThreshold = Math.max(50, body.radius * 5); 
        if (dist > proximityThreshold && viewAlign < 0.6) return null;
        let score = altitude;
        if (isStation) score -= 800;
        else if (isMoon) score -= 500; 
        else if (isDwarf) score -= 250; 
        const alignWeight = dist < proximityThreshold ? 1 : Math.pow(Math.max(0, viewAlign), 10) * 10;
        score = score / alignWeight;
        return { score, data: { id: body.id, data: body, pos: bodyPos, dist, altitude, isStation } };
    };

    const engageOrbit = () => {
        const physicsTime = timeRef.current; 
        const currentPos = camera.position;
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        let bestTarget: OrbitTarget | null = null;
        let minPriorityScore = Infinity; 
        for (const body of allBodies) {
             const result = calculateTargetScore(body, currentPos, camDir, physicsTime);
             if (result && result.score < minPriorityScore) {
                 minPriorityScore = result.score;
                 bestTarget = result.data;
             }
        }
        if (bestTarget) {
            const maxOrbitRange = Math.max(15000, bestTarget.data.radius * 25);
            if (bestTarget.dist > maxOrbitRange) return; 
            const safetyRadius = bestTarget.data.radius * 1.5;
            const r = Math.max(bestTarget.dist, safetyRadius);
            let massMultiplier = 5; 
            let cushionMultiplier = 500; 
            if (bestTarget.isStation) { massMultiplier = 50; cushionMultiplier = 100; } 
            else if (bestTarget.data.type === 'Moon' || bestTarget.data.type === 'Dwarf Planet') { massMultiplier = 8; cushionMultiplier = 800; }
            const massProxy = bestTarget.data.radius * massMultiplier;
            const cushion = bestTarget.data.radius * cushionMultiplier;
            const acceleration = massProxy / (r * r + cushion);
            let orbitalSpeed = Math.sqrt(acceleration * r);
            const MAX_SAFE_SPEED = 80; 
            orbitalSpeed = Math.min(orbitalSpeed, MAX_SAFE_SPEED);
            const radiusVec = new THREE.Vector3().subVectors(currentPos, bestTarget.pos).normalize();
            let tangent = new THREE.Vector3().crossVectors(radiusVec, new THREE.Vector3(0, 1, 0)).normalize();
            if (tangent.lengthSq() < 0.1) tangent = new THREE.Vector3(1, 0, 0);
            velocity.current.copy(tangent.multiplyScalar(orbitalSpeed));
            camera.lookAt(bestTarget.pos);
            isOrbiting.current = true;
            activeOrbitTarget.current = bestTarget;
            cruiseThrottle.current = 0; 
            autopilot.current = false; 
        }
    };

    useEffect(() => {
        if (!active) return;
        
        const handleControlEvent = (e: any) => {
            if (e.detail.type === 'TOGGLE_PRECISION') isPrecision.current = !isPrecision.current;
            if (e.detail.type === 'ENGAGE_ORBIT') engageOrbit();
            if (e.detail.type === 'TOGGLE_FA') flightAssist.current = !flightAssist.current;
            if (e.detail.type === 'TOGGLE_AUTOPILOT') {
                if (activeJob || lockedTargetRef.current) autopilot.current = !autopilot.current;
            }
            if (e.detail.type === 'MINING') {
                if (miningState.isMining) {
                    stopMining();
                } else {
                    const shipPos = camera.position;
                    const distFromCenter = shipPos.length();
                    let foundZone = 'deep_space';
                    if (distFromCenter > 300 && distFromCenter < 600) foundZone = 'asteroid_belt';
                    else if (distFromCenter > 5800 && distFromCenter < 8500) foundZone = 'kuiper_belt';
                    else {
                        for (const zoneId of MINING_LOCATIONS) {
                            const body = findBody(zoneId);
                            if (body) {
                                let bodyPos = getOrbitalPosition(body, timeRef.current);
                                if (parentMap[body.id]) bodyPos.add(getOrbitalPosition(parentMap[body.id], timeRef.current));
                                if (shipPos.distanceTo(bodyPos) < 500) { foundZone = zoneId; break; }
                            }
                        }
                    }
                    startMining(foundZone);
                }
            }
            if (e.detail.type === 'EXIT') {
                updateFuel(fuelRef.current); 
                updateBoost(boostRef.current);
                saveGame(camera.position.clone());
                window.dispatchEvent(new CustomEvent(SPACESHIP_EXIT_EVENT));
            }
            if (e.detail.type === 'SET_TARGET') {
                lockedTargetRef.current = e.detail.targetId;
            }
        };

        const handleWheel = (e: WheelEvent) => {
            const sensitivity = 0.05;
            const delta = -Math.sign(e.deltaY) * sensitivity;
            const maxCruise = currentShip.cruiseSpeed;
            cruiseThrottle.current = Math.max(-0.5, Math.min(maxCruise, cruiseThrottle.current + delta));
            
            if (Math.abs(cruiseThrottle.current) < 0.05) cruiseThrottle.current = 0;
            
            if (isOrbiting.current && Math.abs(delta) > 0) {
                isOrbiting.current = false;
                activeOrbitTarget.current = null;
            }
            if (autopilot.current && Math.abs(delta) > 0) {
                autopilot.current = false;
            }
        };

        const handleKey = (e: KeyboardEvent, isDown: boolean) => {
            if (MOVEMENT_KEYS.FORWARD.includes(e.code)) keys.current.forward = isDown;
            if (MOVEMENT_KEYS.BACKWARD.includes(e.code)) keys.current.backward = isDown;
            if (MOVEMENT_KEYS.LEFT.includes(e.code)) keys.current.left = isDown;
            if (MOVEMENT_KEYS.RIGHT.includes(e.code)) keys.current.right = isDown;
            if (MOVEMENT_KEYS.ROLL_LEFT.includes(e.code)) keys.current.rollLeft = isDown;   
            if (MOVEMENT_KEYS.ROLL_RIGHT.includes(e.code)) keys.current.rollRight = isDown; 
            if (MOVEMENT_KEYS.UP.includes(e.code)) keys.current.up = isDown;
            if (MOVEMENT_KEYS.DOWN.includes(e.code)) keys.current.down = isDown;
            
            if (MOVEMENT_KEYS.BOOST.includes(e.code)) {
                if(isDown) e.preventDefault(); 
                keys.current.boost = isDown;
            }

            if (isDown) {
                if (MOVEMENT_KEYS.PRECISION.includes(e.code)) {
                    e.preventDefault();
                    isPrecision.current = !isPrecision.current;
                }
                if ((MOVEMENT_KEYS as any).FREE_LOOK?.includes(e.code)) {
                    e.preventDefault();
                    isFreeLook.current = !isFreeLook.current;
                }
                if (MOVEMENT_KEYS.ORBIT.includes(e.code)) {
                    if (isOrbiting.current) {
                        window.dispatchEvent(new CustomEvent(SPACESHIP_CONTROL_EVENT, { detail: { type: 'ATTEMPT_DOCK' } }));
                    } else {
                        engageOrbit();
                    }
                }
                // --- MINING TOGGLE ---
                if (MOVEMENT_KEYS.MINING.includes(e.code)) {
                    if (miningState.isMining) {
                        stopMining();
                    } else {
                        // Check valid zone
                        const shipPos = camera.position;
                        const distFromCenter = shipPos.length();
                        let foundZone = 'deep_space'; // Default: Deep Space Mining
                        
                        if (distFromCenter > 300 && distFromCenter < 600) foundZone = 'asteroid_belt';
                        else if (distFromCenter > 5800 && distFromCenter < 8500) foundZone = 'kuiper_belt';
                        else {
                            for (const zoneId of MINING_LOCATIONS) {
                                const body = findBody(zoneId);
                                if (body) {
                                    let bodyPos = getOrbitalPosition(body, timeRef.current);
                                    if (parentMap[body.id]) bodyPos.add(getOrbitalPosition(parentMap[body.id], timeRef.current));
                                    if (shipPos.distanceTo(bodyPos) < 500) { foundZone = zoneId; break; }
                                }
                            }
                        }
                        startMining(foundZone);
                    }
                }
                if (MOVEMENT_KEYS.FLIGHT_ASSIST.includes(e.code)) {
                    e.preventDefault();
                    flightAssist.current = !flightAssist.current;
                }
                if (MOVEMENT_KEYS.AUTOPILOT.includes(e.code)) {
                    if (activeJob || lockedTargetRef.current) {
                        autopilot.current = !autopilot.current;
                        if(autopilot.current) {
                            isOrbiting.current = false; 
                            cruiseThrottle.current = 0; 
                        }
                    }
                }

                if (MOVEMENT_KEYS.EXIT.includes(e.code)) {
                    e.preventDefault();
                    updateFuel(fuelRef.current); 
                    updateBoost(boostRef.current);
                    saveGame(camera.position.clone());
                    window.dispatchEvent(new CustomEvent(SPACESHIP_EXIT_EVENT));
                }
                if (MOVEMENT_KEYS.FORWARD.includes(e.code) || MOVEMENT_KEYS.BACKWARD.includes(e.code)) {
                    cruiseThrottle.current = 0;
                }
            }

            if (isDown && (
                MOVEMENT_KEYS.FORWARD.includes(e.code) || MOVEMENT_KEYS.BACKWARD.includes(e.code) ||
                MOVEMENT_KEYS.LEFT.includes(e.code) || MOVEMENT_KEYS.RIGHT.includes(e.code) ||
                MOVEMENT_KEYS.UP.includes(e.code) || MOVEMENT_KEYS.DOWN.includes(e.code) ||
                MOVEMENT_KEYS.BOOST.includes(e.code)
            )) {
                if (isOrbiting.current) {
                    isOrbiting.current = false;
                    activeOrbitTarget.current = null;
                }
                if (autopilot.current) {
                    autopilot.current = false;
                }
            }
        };

        // --- MOUSE LISTENERS FOR MINING ---
        const handleMouseDown = () => { isFiring.current = true; };
        const handleMouseUp = () => { isFiring.current = false; };
        
        const onDown = (e: KeyboardEvent) => handleKey(e, true);
        const onUp = (e: KeyboardEvent) => handleKey(e, false);
        window.addEventListener(SPACESHIP_CONTROL_EVENT, handleControlEvent);
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            window.removeEventListener(SPACESHIP_CONTROL_EVENT, handleControlEvent);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [active, allBodies, updateFuel, updateBoost, saveGame, camera, currentShip, activeJob, miningState, startMining, stopMining]);

    useFrame((state, delta) => {
        if (!active) return;
        const dt = Math.min(delta, 0.1);
        const precision = isPrecision.current;
        const orbiting = isOrbiting.current;
        const ap = autopilot.current;

        // --- UPDATE SHIP GROUP (VISUALS) ---
        if (shipGroupRef.current) {
            shipGroupRef.current.position.copy(camera.position);
            shipGroupRef.current.quaternion.copy(camera.quaternion);
        }

        // --- MINING HEAT LOGIC ---
        if (miningState.isMining) {
            if (isOverheated.current) {
                // Should not happen if stopMining was called, but safety check
                stopMining();
            } else {
                // If mining but not firing, cool down (handled in else below if we check isFiring)
            }
        } 
        
        const isActuallyMining = miningState.isMining && isFiring.current && !isOverheated.current;

        if (isActuallyMining) {
            miningHeat.current = Math.min(100, miningHeat.current + (30 * dt));
            if (miningHeat.current >= 100) {
                isOverheated.current = true;
                miningHeat.current = 100;
                stopMining();
            }
        } else {
            // Cooling
            const coolRate = isOverheated.current ? 10 : 35; 
            miningHeat.current = Math.max(0, miningHeat.current - (coolRate * dt));
            
            if (isOverheated.current && miningHeat.current < 5) {
                isOverheated.current = false;
            }
        }

        // --- MINING PHYSICS OVERRIDES ---
        const isMining = miningState.isMining;
        const MINING_SPEED_CAP = 0.6; // INCREASED: Was 0.2
        const MINING_ACCEL_MOD = 0.5; // INCREASED: Was 0.2
        
        const ACCEL = (precision ? (currentShip.acceleration * 0.25) : currentShip.acceleration) * (isMining ? MINING_ACCEL_MOD : 1.0); 
        const TURN_SPEED_MULT = precision ? 0.6 : 1.0;
        const TURN_SENSITIVITY = currentShip.turnSpeed * TURN_SPEED_MULT * (isMining ? 0.5 : 1.0); 
        const BOOST_MULT = precision ? 2.0 : currentShip.boostMultiplier; 
        const FUEL_BURN_BASE = currentShip.fuelBurnRate; 
        const BOOST_BURN_RATE = currentShip.boostBurnRate;

        // --- AUTOPILOT LOGIC (FIXED SPEED) ---
        const apTargetId = activeJob?.destId || lockedTargetRef.current;
        if (ap && apTargetId) {
            const targetBody = allBodies.find(b => b.id === apTargetId);
            if (targetBody) {
                const physicsTime = timeRef.current;
                let targetPos = getOrbitalPosition(targetBody, physicsTime);
                if (parentMap[targetBody.id]) {
                    targetPos.add(getOrbitalPosition(parentMap[targetBody.id], physicsTime));
                }

                const currentPos = camera.position;
                const dirToTarget = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
                
                const targetQuaternion = new THREE.Quaternion();
                const m = new THREE.Matrix4().lookAt(currentPos, targetPos, new THREE.Vector3(0, 1, 0));
                targetQuaternion.setFromRotationMatrix(m);
                trueQuaternion.current.slerp(targetQuaternion, dt * 1.5 * currentShip.turnSpeed); 

                const targetApSpeed = currentShip.acceleration / 4.0;
                const currentSpeed = velocity.current.length();
                
                if (fuelRef.current > 0) {
                    if (currentSpeed < targetApSpeed) {
                        const thrustDir = new THREE.Vector3(0, 0, -1).applyQuaternion(trueQuaternion.current);
                        velocity.current.add(thrustDir.multiplyScalar(ACCEL * 0.5 * dt)); 
                        fuelRef.current = Math.max(0, fuelRef.current - (FUEL_BURN_BASE * 0.5 * dt));
                    } else {
                        velocity.current.multiplyScalar(0.98); 
                    }
                } else {
                    autopilot.current = false; 
                }
            } else {
                autopilot.current = false; 
            }
        }

        // --- MANUAL STEERING ---
        if (!orbiting && !ap && !isFreeLook.current) {
            // Smooth pointer input to reduce jitter
            const targetMX = state.pointer.x;
            const targetMY = state.pointer.y;
            
            const inertia = Math.max(0.05, 0.2 - (currentShip.turnSpeed * 0.05));
            smoothedPointer.current.x = THREE.MathUtils.lerp(smoothedPointer.current.x, targetMX, dt / inertia);
            smoothedPointer.current.y = THREE.MathUtils.lerp(smoothedPointer.current.y, targetMY, dt / inertia);

            const mx = smoothedPointer.current.x;
            const my = smoothedPointer.current.y;
            
            const deadzone = 0.05; 
            let turnX = 0; let turnY = 0;
            
            if (Math.abs(mx) > deadzone) {
                const val = (Math.abs(mx) - deadzone) / (1 - deadzone);
                turnX = Math.sign(mx) * (val * val); 
            }
            if (Math.abs(my) > deadzone) {
                const val = (Math.abs(my) - deadzone) / (1 - deadzone);
                turnY = Math.sign(my) * (val * val);
            }
            
            const sensitivity = TURN_SENSITIVITY;
            
            // Update trueQuaternion (actual flight path)
            const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -turnX * sensitivity * dt);
            const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), turnY * sensitivity * dt);
            
            trueQuaternion.current.multiply(qYaw);
            trueQuaternion.current.multiply(qPitch);
            
            // Manual Roll
            const rollSpeed = 2.0;
            if (keys.current.rollLeft) {
                const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rollSpeed * dt);
                trueQuaternion.current.multiply(qRoll);
            }
            if (keys.current.rollRight) {
                const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -rollSpeed * dt);
                trueQuaternion.current.multiply(qRoll);
            }
            
            // Flight assist auto-leveling (smoothed)
            if (flightAssist.current && !keys.current.rollLeft && !keys.current.rollRight) {
                const currentDir = new THREE.Vector3(0, 0, -1).applyQuaternion(trueQuaternion.current);
                const targetMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0), currentDir, new THREE.Vector3(0, 1, 0));
                const targetQuat = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);
                trueQuaternion.current.slerp(targetQuat, dt * 2.0);
            }
        }

        const DRAG = (orbiting || ap) ? 0.0 : (flightAssist.current ? (precision ? 4.0 : 2.0) : 0.5); 
        const FINAL_DRAG = isMining ? (DRAG + 8.0) : DRAG;

        let thrustMult = 1.0;
        if (keys.current.boost && boostRef.current > 0 && !ap && !isMining) {
            thrustMult = BOOST_MULT;
            boostRef.current = Math.max(0, boostRef.current - (BOOST_BURN_RATE * dt));
        }

        // --- MANUAL THRUST ---
        if (!orbiting && !ap) {
            const inputVector = new THREE.Vector3(0, 0, 0);
            if (keys.current.forward) inputVector.z -= 1;
            if (keys.current.backward) inputVector.z += 1;
            
            // Limit cruise throttle if mining
            if (isMining && Math.abs(cruiseThrottle.current) > MINING_SPEED_CAP) {
                cruiseThrottle.current = Math.sign(cruiseThrottle.current) * MINING_SPEED_CAP;
            }
            
            if (cruiseThrottle.current !== 0) inputVector.z -= cruiseThrottle.current;
            if (keys.current.left) inputVector.x -= 1;
            if (keys.current.right) inputVector.x += 1;
            if (keys.current.up) inputVector.y += 1;
            if (keys.current.down) inputVector.y -= 1;

            if (inputVector.lengthSq() > 0.01) {
                if (fuelRef.current > 0) {
                    const speedFactor = velocity.current.length() * 0.05;
                    const burn = (FUEL_BURN_BASE + speedFactor) * dt;
                    fuelRef.current = Math.max(0, fuelRef.current - burn);

                    inputVector.normalize();
                    const thrust = inputVector.clone().applyQuaternion(trueQuaternion.current);
                    velocity.current.add(thrust.multiplyScalar(ACCEL * thrustMult * dt));
                } else {
                    cruiseThrottle.current = 0;
                }
            }
        }

        if (isMining) {
            const currentV = velocity.current.length();
            const MAX_MINING_VELOCITY = 40.0; // INCREASED: Was 10.0
            if (currentV > MAX_MINING_VELOCITY) {
                velocity.current.setLength(THREE.MathUtils.lerp(currentV, MAX_MINING_VELOCITY, dt * 5.0));
            }
        }

        // --- GRAVITY & PHYSICS ---
        const physicsTime = timeRef.current; 
        const currentPos = camera.position;
        const gravityForce = new THREE.Vector3(0, 0, 0);
        let validOrbitTargetFound = false;
        let validOrbitTargetId = null;
        let minPriorityScore = Infinity;
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);

        for (const body of allBodies) {
             let bodyPos = getOrbitalPosition(body, physicsTime);
             if (parentMap[body.id]) {
                 const parent = parentMap[body.id];
                 bodyPos.add(getOrbitalPosition(parent, physicsTime));
             }

             const distToBody = currentPos.distanceTo(bodyPos);
             const isStation = isDockableStructure(body.type);
             const isMoon = body.type === 'Moon';
             const isDwarf = body.type === 'Dwarf Planet';
             
             const gravityRange = isStation ? 800 : (body.radius * 3 + 2000); 
             
             if (distToBody < gravityRange && distToBody > body.radius * 0.9) {
                 let massMultiplier = 2; 
                 let cushionMultiplier = 500; 
                 if (isStation) { massMultiplier = 20; cushionMultiplier = 100; }
                 else if (isMoon || isDwarf) { massMultiplier = 4; cushionMultiplier = 800; }

                 const massProxy = body.radius * massMultiplier; 
                 const cushion = body.radius * cushionMultiplier;
                 const acceleration = massProxy / (distToBody * distToBody + cushion);
                 
                 const dir = new THREE.Vector3().subVectors(bodyPos, currentPos).normalize();
                 const MAX_GRAVITY_FORCE = 2.0; 
                 const finalAccel = Math.min(acceleration, MAX_GRAVITY_FORCE);
                 gravityForce.add(dir.multiplyScalar(finalAccel * dt));
                 
                 if (orbiting && activeOrbitTarget.current?.id === body.id) {
                     const safeRadius = Math.max(distToBody, body.radius * 1.2);
                     let idealSpeed = Math.sqrt(acceleration * safeRadius);
                     velocity.current.setLength(Math.min(idealSpeed, 100)); 
                 }
             }

             const result = calculateTargetScore(body, currentPos, camDir, physicsTime);
             if (result && result.score < minPriorityScore) {
                 minPriorityScore = result.score;
                 validOrbitTargetFound = true;
                 validOrbitTargetId = body.id;
             }
        }

        velocity.current.add(gravityForce);
        if (FINAL_DRAG > 0) velocity.current.add(velocity.current.clone().multiplyScalar(-FINAL_DRAG * dt));
        camera.position.add(velocity.current.clone().multiplyScalar(dt));

        if (orbiting && activeOrbitTarget.current) {
             const targetQuat = new THREE.Quaternion();
             const m = new THREE.Matrix4().lookAt(camera.position, activeOrbitTarget.current.pos, new THREE.Vector3(0, 1, 0));
             targetQuat.setFromRotationMatrix(m);
             trueQuaternion.current.slerp(targetQuat, dt * 0.5);
        }

        const currentSpeed = velocity.current.length();
        const isBoosting = keys.current.boost && boostRef.current > 0;
        
        // === COCKPIT MOTION EFFECTS ===
        const motion = cockpitMotion.current;
        const elapsedTime = state.clock.elapsedTime;
        
        const precisionDampen = precision ? 0.3 : 1.0;
        motion.breathPhase += dt * 0.8;
        
        const breathingX = Math.sin(motion.breathPhase * 0.5) * 0.0004 * precisionDampen;
        const breathingY = Math.cos(motion.breathPhase * 0.35) * 0.0003 * precisionDampen;
        const breathingRoll = Math.sin(motion.breathPhase * 0.2) * 0.0002 * precisionDampen;
        
        const speedNormalized = Math.min(1, currentSpeed / 50);
        const speedVibrationIntensity = speedNormalized * 0.0008 * precisionDampen;
        const speedVibX = (Math.sin(elapsedTime * 45) + Math.sin(elapsedTime * 67)) * speedVibrationIntensity;
        const speedVibY = (Math.cos(elapsedTime * 53) + Math.cos(elapsedTime * 71)) * speedVibrationIntensity;
        
        const targetShakeIntensity = isBoosting ? 0.003 * precisionDampen : (isActuallyMining ? 0.001 : 0); 
        motion.shakeIntensity = THREE.MathUtils.lerp(motion.shakeIntensity, targetShakeIntensity, dt * 8);
        const boostShakeX = (Math.sin(elapsedTime * 80) * 0.6 + Math.sin(elapsedTime * 123) * 0.4) * motion.shakeIntensity;
        const boostShakeY = (Math.cos(elapsedTime * 95) * 0.5 + Math.cos(elapsedTime * 137) * 0.5) * motion.shakeIntensity;
        const boostShakeRoll = Math.sin(elapsedTime * 60) * motion.shakeIntensity * 0.3;
        
        const mouseX = isFreeLook.current ? 0 : state.pointer.x;
        const turnRollTarget = -mouseX * 0.015 * (1 + speedNormalized * 0.5) * precisionDampen;
        motion.roll = THREE.MathUtils.lerp(motion.roll, turnRollTarget, dt * 3);
        
        let pitchTarget = 0;
        if (keys.current.forward) pitchTarget = -0.008 * (1 + speedNormalized * 0.3) * precisionDampen;
        if (keys.current.backward) pitchTarget = 0.006 * precisionDampen;
        if (cruiseThrottle.current > 0) pitchTarget = -0.004 * cruiseThrottle.current * precisionDampen;
        motion.pitch = THREE.MathUtils.lerp(motion.pitch, pitchTarget, dt * 4);
        
        let swayTarget = 0;
        if (keys.current.left) swayTarget = 0.008 * precisionDampen;
        if (keys.current.right) swayTarget = -0.008 * precisionDampen;
        motion.sway = THREE.MathUtils.lerp(motion.sway, swayTarget, dt * 5);
        
        let verticalTarget = 0;
        if (keys.current.up) verticalTarget = -0.004 * precisionDampen;
        if (keys.current.down) verticalTarget = 0.004 * precisionDampen;
        motion.verticalBob = THREE.MathUtils.lerp(motion.verticalBob, verticalTarget, dt * 5);
        
        let apDriftX = 0;
        let apDriftY = 0;
        if (ap) {
            apDriftX = Math.sin(elapsedTime * 0.3) * 0.0003;
            apDriftY = Math.cos(elapsedTime * 0.25) * 0.0002;
        }
        
        // --- APPLY FINAL CAMERA ORIENTATION ---
        const visualOffsets = new THREE.Euler(
            breathingY + speedVibY + boostShakeY + motion.pitch + motion.verticalBob + apDriftY,
            breathingX + speedVibX + boostShakeX + apDriftX,
            breathingRoll + boostShakeRoll + motion.roll + motion.sway
        );
        const offsetQuat = new THREE.Quaternion().setFromEuler(visualOffsets);
        
        camera.quaternion.copy(trueQuaternion.current).multiply(offsetQuat);
        
        // === FOV EFFECTS ===
        let targetFov = 45 + (currentSpeed * 0.05) + (isBoosting ? 5 : 0);
        if (isActuallyMining) targetFov = 40; 
        
        camera.fov = THREE.MathUtils.lerp(camera.fov, Math.min(targetFov, 85), 0.1);
        camera.updateProjectionMatrix();

        const now = state.clock.elapsedTime;
        if (now - lastEventTime.current > 0.03) { 
            let distToTarget = 0;
            let altitudeToTarget = 0;
            let targetRadius = 0;
            const targetData = activeOrbitTarget.current 
                ? activeOrbitTarget.current 
                : (validOrbitTargetId ? { id: validOrbitTargetId } : null);

            if (targetData) {
                 const body = allBodies.find(b => b.id === targetData.id);
                 if(body) {
                     targetRadius = body.radius;
                     if(activeOrbitTarget.current) {
                         distToTarget = activeOrbitTarget.current.dist;
                         altitudeToTarget = activeOrbitTarget.current.altitude;
                     } else {
                         let bodyPos = getOrbitalPosition(body, physicsTime);
                         if (parentMap[body.id]) bodyPos.add(getOrbitalPosition(parentMap[body.id], physicsTime));
                         distToTarget = currentPos.distanceTo(bodyPos);
                         altitudeToTarget = distToTarget - body.radius;
                     }
                 }
            }

            const event = new CustomEvent(SPACESHIP_UPDATE_EVENT, { 
                detail: { 
                    speed: currentSpeed, 
                    boost: boostRef.current,
                    fuel: fuelRef.current,
                    maxFuel: currentShip.maxFuel,
                    maxBoost: currentShip.maxBoost,
                    shipName: currentShip.name,
                    boosting: keys.current.boost && boostRef.current > 0,
                    precision: precision,
                    isFreeLook: isFreeLook.current,
                    flightAssist: flightAssist.current,
                    canOrbit: validOrbitTargetFound,
                    isOrbiting: orbiting,
                    autopilot: ap, 
                    cruise: cruiseThrottle.current,
                    mouseX: state.pointer.x,
                    mouseY: state.pointer.y,
                    targetId: targetData?.id,
                    targetDist: distToTarget, 
                    targetAltitude: altitudeToTarget, 
                    targetRadius: targetRadius, 
                    shipPos: { x: currentPos.x, y: currentPos.y, z: currentPos.z }, 
                    distanceFromCenter: currentPos.length(),
                    shipQuat: trueQuaternion.current,
                    isLocked: !!lockedTargetRef.current,
                    miningHeat: miningHeat.current,
                    isOverheated: isOverheated.current,
                    // isCockpitMode removed
                    isFiring: isActuallyMining
                } 
            });
            window.dispatchEvent(event);
            lastEventTime.current = now;
        }
    });

    if (!active) return null;

    return (
        <group ref={shipGroupRef}>
             <MiningLaser active={miningState.isMining && isFiring.current && !isOverheated.current} color={isOverheated.current ? '#ef4444' : '#a855f7'} />
        </group>
    );
}