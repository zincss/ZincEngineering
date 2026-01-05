'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Zap, Compass, Target, MousePointer2, RefreshCw, Gauge, ArrowRightCircle, Plane, AlertCircle, Fuel, Crosshair, AlertTriangle } from 'lucide-react';
import { useSimulation, getOrbitalPosition, MAX_FUEL, MAX_BOOST } from '../../context';
import { PLANET_DATA, CelestialBody } from '../../data';

const SPACESHIP_UPDATE_EVENT = 'spaceship-update';
const SPACESHIP_CONTROL_EVENT = 'spaceship-control';
export const SPACESHIP_EXIT_EVENT = 'spaceship-exit';

// UNINHABITABLE BODIES (Gas Giants / Stars)
const NO_LANDING_IDS = ['sun', 'sagittarius_a', 'jupiter', 'saturn', 'uranus', 'neptune', 'zinc_prime_stars', 'endor_prime'];

interface OrbitTarget {
    id: string;
    data: CelestialBody;
    pos: THREE.Vector3;
    dist: number;
    altitude: number;
    isStation: boolean;
}

const MOVEMENT_KEYS = {
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
    EXIT: ['Escape'] 
};

const isDockableStructure = (type: string) => {
    return ['Station', 'Relay', 'Satellite', 'Ship', 'Telescope', 'Outpost', 'Base', 'Forge', 'City'].includes(type);
};

export function SpaceshipController({ active, lockedTargetId }: { active: boolean, lockedTargetId: string | null }) {
    const { camera } = useThree() as unknown as { camera: THREE.PerspectiveCamera };
    const { timeRef, fuel: contextFuel, updateFuel, boost: contextBoost, updateBoost } = useSimulation(); 
    
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    // RE-ADDED MISSING REF
    const lastEventTime = useRef(0);
    const isPrecision = useRef(false);
    const flightAssist = useRef(true); 
    
    const fuelRef = useRef(contextFuel);
    const boostRef = useRef(contextBoost);
    
    const isOrbiting = useRef(false);
    const activeOrbitTarget = useRef<OrbitTarget | null>(null);

    const cruiseThrottle = useRef(0); 

    const keys = useRef({
        forward: false, backward: false,
        left: false, right: false,
        rollLeft: false, rollRight: false,
        up: false, down: false,
        boost: false
    });
    
    const baseFov = 45;

    // --- PRE-CALCULATE HIERARCHY MAP ---
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

    useEffect(() => {
        fuelRef.current = contextFuel;
    }, [contextFuel]);

    useEffect(() => {
        boostRef.current = contextBoost;
    }, [contextBoost]);

    useEffect(() => {
        if (!active) return;
        
        const handleControlEvent = (e: any) => {
            if (e.detail.type === 'TOGGLE_PRECISION') isPrecision.current = !isPrecision.current;
            if (e.detail.type === 'ENGAGE_ORBIT') engageOrbit();
            if (e.detail.type === 'TOGGLE_FA') flightAssist.current = !flightAssist.current;
        };

        const handleWheel = (e: WheelEvent) => {
            const sensitivity = 0.05;
            const delta = -Math.sign(e.deltaY) * sensitivity;
            cruiseThrottle.current = Math.max(-0.5, Math.min(1.0, cruiseThrottle.current + delta));
            if (Math.abs(cruiseThrottle.current) < 0.05) cruiseThrottle.current = 0;
            if (isOrbiting.current && Math.abs(delta) > 0) {
                isOrbiting.current = false;
                activeOrbitTarget.current = null;
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
                if (MOVEMENT_KEYS.ORBIT.includes(e.code)) engageOrbit();
                if (MOVEMENT_KEYS.FLIGHT_ASSIST.includes(e.code)) flightAssist.current = !flightAssist.current;
                if (MOVEMENT_KEYS.EXIT.includes(e.code)) {
                    updateFuel(fuelRef.current); 
                    updateBoost(boostRef.current);
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
            }
        };
        
        const onDown = (e: KeyboardEvent) => handleKey(e, true);
        const onUp = (e: KeyboardEvent) => handleKey(e, false);
        window.addEventListener(SPACESHIP_CONTROL_EVENT, handleControlEvent);
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        
        return () => {
            window.removeEventListener(SPACESHIP_CONTROL_EVENT, handleControlEvent);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, [active, allBodies, updateFuel, updateBoost]);

    // --- TARGETING LOGIC V3 (Dynamic Ranges) ---
    const calculateTargetScore = (
        body: CelestialBody, 
        currentPos: THREE.Vector3, 
        camDir: THREE.Vector3, 
        physicsTime: number
    ) => {
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
        
        // --- 1. DYNAMIC SCAN RANGES ---
        let activeScanRange = 15000; 
        if (isMoon) activeScanRange = 5000; 
        if (isStation) activeScanRange = 2000; 

        if (dist > activeScanRange) return null;

        // --- 2. USER OVERRIDE ---
        if (lockedTargetId && lockedTargetId === body.id) {
             return {
                score: -10000000 + dist, 
                data: { id: body.id, data: body, pos: bodyPos, dist, altitude, isStation }
            };
        }

        // --- 3. ALIGNMENT CHECK ---
        const dirToBody = bodyPos.clone().sub(currentPos).normalize();
        const viewAlign = camDir.dot(dirToBody); 
        
        if (dist > 500 && viewAlign < 0.5) return null;

        // --- 4. SCORING HIERARCHY ---
        let score = altitude;
        
        if (isStation) score -= 50000; 
        else if (isMoon) score -= 20000;
        else if (isDwarf) score -= 10000;

        const alignMultiplier = Math.pow(Math.max(0, viewAlign), 10) * 10; 
        score = score / alignMultiplier;

        return {
            score,
            data: { id: body.id, data: body, pos: bodyPos, dist, altitude, isStation }
        };
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
            const r = bestTarget.dist;
            let massMultiplier = 20; 
            let cushionMultiplier = 2000; 

            if (bestTarget.isStation) {
                massMultiplier = 400; 
                cushionMultiplier = 50; 
            } else if (bestTarget.data.type === 'Moon' || bestTarget.data.type === 'Dwarf Planet') {
                massMultiplier = 15; 
                cushionMultiplier = 1000; 
            }

            const massProxy = bestTarget.data.radius * massMultiplier;
            const cushion = bestTarget.data.radius * cushionMultiplier;
            const acceleration = massProxy / (r * r + cushion);
            const orbitalSpeed = Math.sqrt(acceleration * r);

            const radiusVec = new THREE.Vector3().subVectors(currentPos, bestTarget.pos).normalize();
            let tangent = new THREE.Vector3().crossVectors(radiusVec, new THREE.Vector3(0, 1, 0)).normalize();
            if (tangent.lengthSq() < 0.1) tangent = new THREE.Vector3(1, 0, 0);

            velocity.current.copy(tangent.multiplyScalar(orbitalSpeed));
            camera.lookAt(bestTarget.pos);
            
            isOrbiting.current = true;
            activeOrbitTarget.current = bestTarget;
            cruiseThrottle.current = 0; 
        }
    };

    // --- MAIN LOOP ---
    useFrame((state, delta) => {
        if (!active) return;
        const dt = Math.min(delta, 0.1);
        const precision = isPrecision.current;
        const orbiting = isOrbiting.current;

        // Steering
        if (!orbiting) {
            const mx = state.pointer.x;
            const my = state.pointer.y;
            const deadzone = 0.15;
            let turnX = 0; let turnY = 0;
            if (Math.abs(mx) > deadzone) turnX = Math.sign(mx) * (Math.abs(mx) - deadzone) / (1 - deadzone);
            if (Math.abs(my) > deadzone) turnY = Math.sign(my) * (Math.abs(my) - deadzone) / (1 - deadzone);
            
            const sensitivity = precision ? 0.8 : 1.5;
            camera.rotateY(-turnX * Math.abs(turnX) * sensitivity * dt);
            camera.rotateX(turnY * Math.abs(turnY) * sensitivity * dt);
            
            const rollSpeed = 2.0;
            if (keys.current.rollLeft) camera.rotateZ(rollSpeed * dt);
            if (keys.current.rollRight) camera.rotateZ(-rollSpeed * dt);
            if (flightAssist.current && !keys.current.rollLeft && !keys.current.rollRight) {
                camera.rotation.z -= camera.rotation.z * 2.0 * dt;
            }
        }

        // Movement
        const ACCEL = precision ? 2.5 : 10.0; 
        const DRAG = orbiting ? 0.0 : (flightAssist.current ? (precision ? 4.0 : 2.0) : 0.5); 
        const BOOST_MULT = precision ? 2.0 : 12.0; 
        const FUEL_BURN_BASE = 2.0; 
        const BOOST_BURN_RATE = 20.0;

        let thrustMult = 1.0;
        if (keys.current.boost && boostRef.current > 0) {
            thrustMult = BOOST_MULT;
            boostRef.current = Math.max(0, boostRef.current - (BOOST_BURN_RATE * dt));
        }

        if (!orbiting) {
            const inputVector = new THREE.Vector3(0, 0, 0);
            if (keys.current.forward) inputVector.z -= 1;
            if (keys.current.backward) inputVector.z += 1;
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
                    const thrust = inputVector.clone().applyQuaternion(camera.quaternion);
                    velocity.current.add(thrust.multiplyScalar(ACCEL * thrustMult * dt));
                } else {
                    cruiseThrottle.current = 0;
                }
            }
        }

        // Physics & Targeting Scan
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
             
             if (distToBody < 5000 && distToBody > body.radius * 0.9) {
                 let massMultiplier = 20; 
                 let cushionMultiplier = 2000; 
                 if (isStation) { massMultiplier = 400; cushionMultiplier = 50; }
                 else if (isMoon || isDwarf) { massMultiplier = 15; cushionMultiplier = 1000; }

                 const massProxy = body.radius * massMultiplier; 
                 const cushion = body.radius * cushionMultiplier;
                 const acceleration = massProxy / (distToBody * distToBody + cushion);
                 
                 const dir = new THREE.Vector3().subVectors(bodyPos, currentPos).normalize();
                 gravityForce.add(dir.multiplyScalar(acceleration * dt));
                 
                 if (orbiting && activeOrbitTarget.current?.id === body.id) {
                     const idealSpeed = Math.sqrt(acceleration * distToBody);
                     velocity.current.setLength(idealSpeed);
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
        if (DRAG > 0) velocity.current.add(velocity.current.clone().multiplyScalar(-DRAG * dt));
        camera.position.add(velocity.current.clone().multiplyScalar(dt));

        if (orbiting && activeOrbitTarget.current) {
             const targetQuat = new THREE.Quaternion();
             const m = new THREE.Matrix4().lookAt(camera.position, activeOrbitTarget.current.pos, new THREE.Vector3(0, 1, 0));
             targetQuat.setFromRotationMatrix(m);
             camera.quaternion.slerp(targetQuat, dt * 0.5);
        }

        const currentSpeed = velocity.current.length(); 
        const targetFov = 45 + (currentSpeed * 0.05); 
        camera.fov = THREE.MathUtils.lerp(camera.fov, Math.min(targetFov, 80), 0.1);
        camera.updateProjectionMatrix();

        const now = state.clock.elapsedTime;
        if (now - lastEventTime.current > 0.03) { 
            const event = new CustomEvent(SPACESHIP_UPDATE_EVENT, { 
                detail: { 
                    speed: currentSpeed, 
                    boost: boostRef.current,
                    fuel: fuelRef.current,
                    boosting: keys.current.boost && boostRef.current > 0,
                    precision: precision,
                    flightAssist: flightAssist.current,
                    canOrbit: validOrbitTargetFound,
                    isOrbiting: orbiting,
                    cruise: cruiseThrottle.current,
                    mouseX: state.pointer.x,
                    mouseY: state.pointer.y,
                    targetId: activeOrbitTarget.current ? activeOrbitTarget.current.id : validOrbitTargetId
                } 
            });
            window.dispatchEvent(event);
            lastEventTime.current = now;
        }
    });

    if (!active) return null;
    return null;
}

// --- HUD COMPONENT ---
export function SpaceshipHUD({ active }: { active: boolean }) {
    const [speed, setSpeed] = useState(0);
    const [boost, setBoost] = useState(MAX_BOOST);
    const [fuel, setFuel] = useState(MAX_FUEL);      
    const [isBoosting, setIsBoosting] = useState(false);
    const [isPrecision, setIsPrecision] = useState(false);
    const [flightAssist, setFlightAssist] = useState(true);
    const [canOrbit, setCanOrbit] = useState(false);
    const [isOrbiting, setIsOrbiting] = useState(false);
    const [cruise, setCruise] = useState(0);
    const [reticlePos, setReticlePos] = useState({ x: 0, y: 0 });
    
    const { setDockedAt, generateJobsForLocation, updateFuel, updateBoost, findBody } = useSimulation();
    const [targetId, setTargetId] = useState<string | null>(null);

    const targetBody = findBody(targetId);
    const targetName = targetBody ? targetBody.name : 'TARGET';
    const isNoLandingZone = targetId ? NO_LANDING_IDS.includes(targetId) : false;

    useEffect(() => {
        if (!active) return;
        const handleUpdate = (e: any) => {
            setSpeed(e.detail.speed);
            setBoost(e.detail.boost);
            setFuel(e.detail.fuel);
            setIsBoosting(e.detail.boosting);
            setIsPrecision(e.detail.precision);
            setFlightAssist(e.detail.flightAssist);
            setCanOrbit(e.detail.canOrbit);
            setIsOrbiting(e.detail.isOrbiting);
            setCruise(e.detail.cruise);
            setReticlePos({ x: e.detail.mouseX, y: e.detail.mouseY });
            if(e.detail.targetId) setTargetId(e.detail.targetId);
        };
        window.addEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
        return () => window.removeEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
    }, [active]);

    const dispatchControl = (type: string) => {
        window.dispatchEvent(new CustomEvent(SPACESHIP_CONTROL_EVENT, { detail: { type } }));
    };
    
    const handleDock = () => {
        if (targetId && !isNoLandingZone) {
            updateFuel(fuel); 
            updateBoost(boost); 
            generateJobsForLocation(targetId);
            setDockedAt(targetId);
        }
    };

    if (!active) return null;

    const hudPrimary = isPrecision ? '#60A5FA' : '#DFFF00'; 
    const hudBorderClass = isPrecision ? 'border-blue-400' : 'border-[#DFFF00]';
    const hudShadowClass = isPrecision ? 'shadow-[0_-10px_40px_rgba(59,130,246,0.3)]' : 'shadow-[0_-10px_40px_rgba(223,255,0,0.3)]';

    return (
        <div className="fixed inset-0 z-[45] pointer-events-none flex flex-col justify-end items-center pb-0 overflow-hidden">
            <div className={`relative mb-32 flex items-end gap-6 transition-transform duration-100 pointer-events-auto ${isBoosting ? 'scale-105 translate-y-1' : ''}`}>
                
                {/* --- LEFT WING --- */}
                <div className="flex flex-col items-end gap-2 pb-2">
                     <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest opacity-80">
                         <span>NAV-092</span>
                         <Compass size={12} className="text-zinc-500" />
                     </div>
                    <div className="flex flex-col gap-1 items-end">
                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-l-full rounded-tr-lg border-b-2 bg-zinc-900/90 border-zinc-700 text-zinc-400 mb-1">
                            <Fuel size={14} className={fuel < 500 ? "text-red-500 animate-pulse" : "text-zinc-400"} />
                            <div className="flex flex-col items-end leading-none">
                                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                                    <div className={`h-full ${fuel < 500 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${(fuel/MAX_FUEL)*100}%` }} />
                                </div>
                                <span className="text-[8px] opacity-60 mt-0.5">PROPELLANT</span>
                            </div>
                         </div>
                        <button onClick={() => dispatchControl('TOGGLE_FA')} className={`flex items-center gap-2 px-4 py-1.5 rounded-l-full rounded-tr-lg border-b-2 transition-all ${flightAssist ? 'bg-zinc-800/80 border-zinc-600 text-zinc-400' : 'bg-red-900/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}>
                            <Plane size={14} className={flightAssist ? "" : "rotate-12"} />
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-[9px] font-bold tracking-widest">{flightAssist ? 'FA ON' : 'FA OFF'}</span>
                                <span className="text-[8px] opacity-60">KEY Z</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* --- CENTER --- */}
                <div className="flex flex-col items-center">
                    <div className={`relative flex flex-col items-center bg-black/80 backdrop-blur-xl px-14 py-5 rounded-t-3xl border-t-2 border-x ${hudBorderClass} ${hudShadowClass} z-10 transition-colors duration-300`}>
                        <div className={`absolute top-2 w-12 h-1 rounded-full transition-colors duration-300 ${isPrecision ? 'bg-blue-500/30' : 'bg-[#DFFF00]/30'}`} />
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className={`text-6xl font-black tabular-nums tracking-tighter ${isBoosting ? 'text-[#00FFFF] drop-shadow-[0_0_15px_#00FFFF]' : 'text-white'}`}>
                                {speed.toFixed(0)}
                            </span>
                            <span className="text-xs font-bold text-zinc-500 font-mono mb-1">KM/S</span>
                        </div>
                        {isPrecision && <div className="absolute -bottom-6 flex items-center gap-1.5 text-blue-400 font-bold text-[10px] tracking-[0.2em] animate-in fade-in slide-in-from-top-2"><Crosshair size={10} />PRECISION SYS ENGAGED</div>}
                        {!flightAssist && <div className="absolute top-4 right-4 animate-pulse text-red-500"><AlertCircle size={12} /></div>}
                        {fuel <= 0 && <div className="absolute top-4 left-4 animate-pulse text-red-500 font-bold text-[10px] tracking-widest border border-red-500 px-1 rounded">EMPTY</div>}
                    </div>
                    <div className="w-[340px] h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative mt-[-2px] z-10 shadow-lg">
                        <div className={`h-full transition-all duration-100 ease-linear ${isBoosting ? 'bg-[#00FFFF] shadow-[0_0_20px_#00FFFF]' : ''}`} style={{ width: `${(boost/MAX_BOOST)*100}%`, backgroundColor: isBoosting ? '#00FFFF' : hudPrimary }} />
                        {cruise > 0 && <div className="absolute top-0 bottom-0 w-1 bg-white mix-blend-difference" style={{ left: `${cruise * 100}%` }} />}
                    </div>
                    <div className="flex flex-col items-center mt-[-1px]"><div className="w-[300px] h-4 bg-gradient-to-b from-black/80 to-transparent border-x border-white/5 clip-path-polygon-[0_0,100%_0,80%_100%,20%_100%]" /></div>
                    <div className="absolute -bottom-8 flex items-center gap-4">
                        {cruise > 0 && <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-500/30"><Gauge size={10} />CRUISE: {(cruise * 100).toFixed(0)}%</div>}
                    </div>
                </div>

                {/* --- RIGHT WING --- */}
                <div className="flex flex-col items-start gap-2 pb-2">
                    <div className={`flex items-center gap-1 text-[10px] font-bold tracking-wider transition-colors ${isBoosting ? 'text-[#00FFFF]' : 'text-zinc-600'}`}>
                        <Zap size={12} className={isBoosting ? 'animate-pulse' : ''} />
                        INJECTOR
                    </div>

                    <div className="h-10 flex items-center min-w-[120px]">
                        {isOrbiting ? (
                            <div className="flex gap-1">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-l-lg bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500/50">
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[9px] font-bold tracking-widest">ORBIT STABLE</span>
                                    </div>
                                    <RefreshCw size={14} className="animate-spin" />
                                </div>
                                
                                {isNoLandingZone ? (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-r-full bg-red-900/50 text-red-300 border-b-2 border-red-500/50">
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[9px] font-bold tracking-widest">ATMOSPHERE HAZARD</span>
                                            <span className="text-[8px] opacity-60">NO LANDING</span>
                                        </div>
                                        <AlertTriangle size={14} />
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleDock}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-r-full text-black border-b-2 hover:bg-white transition-all animate-in zoom-in ${isPrecision ? 'bg-blue-400 border-blue-400' : 'bg-[#DFFF00] border-[#DFFF00]'}`}
                                    >
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[9px] font-bold tracking-widest">DOCK TO</span>
                                            <span className="text-[8px] opacity-60">{targetName}</span>
                                        </div>
                                        <ArrowRightCircle size={14} /> 
                                    </button>
                                )}
                            </div>
                        ) : canOrbit ? (
                            <button
                                onClick={() => dispatchControl('ENGAGE_ORBIT')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-r-full rounded-tl-lg border-b-2 transition-all animate-in fade-in slide-in-from-left-4 duration-300 
                                    ${isPrecision 
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 hover:bg-blue-400 hover:text-black' 
                                        : 'bg-[#DFFF00]/10 text-[#DFFF00] border-[#DFFF00]/50 hover:bg-[#DFFF00] hover:text-black'}`}
                            >
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] font-bold tracking-widest">ENGAGE ORBIT</span>
                                    <span className="text-[8px] opacity-60">KEY O</span>
                                </div>
                                <Target size={14} />
                            </button>
                        ) : (
                            <div className="px-4 py-2 rounded-r-full rounded-tl-lg border-b-2 border-zinc-800 bg-black/40 backdrop-blur-md text-zinc-700">
                                <span className="text-[9px] font-bold tracking-widest">NO TARGET</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* RETICLE */}
            <div className="absolute pointer-events-none transition-all duration-75 ease-out" style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${reticlePos.x * window.innerWidth / 2}px), calc(-50% + ${-reticlePos.y * window.innerHeight / 2}px))` }}>
                 <div className={`w-8 h-8 border rounded-full flex items-center justify-center transition-colors duration-300 ${isBoosting ? 'border-[#00FFFF]' : (isPrecision ? 'border-blue-400' : 'border-white/30')}`}>
                    <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${isBoosting ? 'bg-[#00FFFF] shadow-[0_0_10px_#00FFFF]' : (isPrecision ? 'bg-blue-400' : 'bg-[#DFFF00]')}`} />
                 </div>
            </div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><line x1="50%" y1="50%" x2={50 + (reticlePos.x * 50) + '%'} y2={50 - (reticlePos.y * 50) + '%'} stroke="white" strokeDasharray="4 4" /></svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15vh] h-[15vh] border border-white/5 rounded-full pointer-events-none" />
        </div>
    );
}