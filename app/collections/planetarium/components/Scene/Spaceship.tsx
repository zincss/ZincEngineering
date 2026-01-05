'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Zap, Compass, Target, MousePointer2, RefreshCw, Gauge } from 'lucide-react';
import { useSimulation, getOrbitalPosition } from '../../context';
import { PLANET_DATA, CelestialBody } from '../../data';

const SPACESHIP_UPDATE_EVENT = 'spaceship-update';
const SPACESHIP_CONTROL_EVENT = 'spaceship-control';
export const SPACESHIP_EXIT_EVENT = 'spaceship-exit';

interface OrbitTarget {
    id: string;
    data: CelestialBody;
    pos: THREE.Vector3;
    dist: number;
}

const MOVEMENT_KEYS = {
    FORWARD: ['KeyW', 'ArrowUp'],
    BACKWARD: ['KeyS', 'ArrowDown'],
    LEFT: ['KeyA', 'ArrowLeft'],
    RIGHT: ['KeyD', 'ArrowRight'],
    ROLL_LEFT: ['KeyQ'],  // NEW
    ROLL_RIGHT: ['KeyE'], // NEW
    UP: ['KeyR', 'ShiftLeft'],      
    DOWN: ['KeyF', 'ControlLeft'],  
    BOOST: ['Space'],
    PRECISION: ['Tab'],             
    ORBIT: ['KeyO'],
    EXIT: ['Escape'] 
};

// --- 3D CONTROLLER COMPONENT ---
export function SpaceshipController({ active }: { active: boolean }) {
    const { camera, gl, pointer, size } = useThree() as unknown as { camera: THREE.PerspectiveCamera, gl: THREE.WebGLRenderer, pointer: THREE.Vector2, size: { width: number, height: number } };
    const { timeRef } = useSimulation(); 
    
    // PHYSICS STATE
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const lastEventTime = useRef(0);
    const isPrecision = useRef(false);
    
    // ORBIT STATE
    const isOrbiting = useRef(false);
    const activeOrbitTarget = useRef<OrbitTarget | null>(null);

    // CRUISE CONTROL STATE
    const cruiseThrottle = useRef(0); 

    // INPUT STATE
    const keys = useRef({
        forward: false, backward: false,
        left: false, right: false,
        rollLeft: false, rollRight: false, // NEW
        up: false, down: false,
        boost: false
    });
    
    const boostFuel = useRef(100);
    const baseFov = 45;

    // EVENT LISTENERS
    useEffect(() => {
        if (!active) return;
        
        // 1. UI COMMANDS
        const handleControlEvent = (e: any) => {
            if (e.detail.type === 'TOGGLE_PRECISION') isPrecision.current = !isPrecision.current;
            if (e.detail.type === 'ENGAGE_ORBIT') engageOrbit();
        };

        // 2. SCROLL / TRACKPAD LISTENER
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

        window.addEventListener(SPACESHIP_CONTROL_EVENT, handleControlEvent);
        window.addEventListener('wheel', handleWheel, { passive: false });
        
        // 3. KEYBOARD LISTENERS
        const handleKey = (e: KeyboardEvent, isDown: boolean) => {
            // MOVEMENT MAPPING
            if (MOVEMENT_KEYS.FORWARD.includes(e.code)) keys.current.forward = isDown;
            if (MOVEMENT_KEYS.BACKWARD.includes(e.code)) keys.current.backward = isDown;
            if (MOVEMENT_KEYS.LEFT.includes(e.code)) keys.current.left = isDown;
            if (MOVEMENT_KEYS.RIGHT.includes(e.code)) keys.current.right = isDown;
            if (MOVEMENT_KEYS.ROLL_LEFT.includes(e.code)) keys.current.rollLeft = isDown;   // NEW
            if (MOVEMENT_KEYS.ROLL_RIGHT.includes(e.code)) keys.current.rollRight = isDown; // NEW
            if (MOVEMENT_KEYS.UP.includes(e.code)) keys.current.up = isDown;
            if (MOVEMENT_KEYS.DOWN.includes(e.code)) keys.current.down = isDown;
            
            // SPECIAL KEYS
            if (MOVEMENT_KEYS.BOOST.includes(e.code)) {
                if(isDown) e.preventDefault(); 
                keys.current.boost = isDown;
            }

            // TOGGLES (KeyDown Only)
            if (isDown) {
                if (MOVEMENT_KEYS.PRECISION.includes(e.code)) {
                    e.preventDefault();
                    isPrecision.current = !isPrecision.current;
                }
                if (MOVEMENT_KEYS.ORBIT.includes(e.code)) engageOrbit();
                
                // ESC TO EXIT
                if (MOVEMENT_KEYS.EXIT.includes(e.code)) {
                    window.dispatchEvent(new CustomEvent(SPACESHIP_EXIT_EVENT));
                }

                // Reset Cruise on manual input
                if (MOVEMENT_KEYS.FORWARD.includes(e.code) || MOVEMENT_KEYS.BACKWARD.includes(e.code)) {
                    cruiseThrottle.current = 0;
                }
            }

            // Break Orbit Logic
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
        
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        
        return () => {
            window.removeEventListener(SPACESHIP_CONTROL_EVENT, handleControlEvent);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, [active]);

    // ORBIT LOGIC
    const engageOrbit = () => {
        const physicsTime = timeRef.current; 
        const currentPos = camera.position;
        let bestTarget: OrbitTarget | null = null;
        let minDist = 1000; 

        for (const planet of PLANET_DATA) {
             if (['Star', 'Planet', 'Black Hole'].includes(planet.type)) {
                 const planetPos = getOrbitalPosition(planet, physicsTime);
                 const dist = currentPos.distanceTo(planetPos);
                 if (dist < minDist && dist > planet.radius) {
                     minDist = dist;
                     bestTarget = { id: planet.id, data: planet, pos: planetPos, dist };
                 }
             }
        }

        if (bestTarget) {
            const r = bestTarget.dist;
            const massProxy = bestTarget.data.radius * 300;
            const cushion = bestTarget.data.radius * 200;
            const acceleration = massProxy / (r * r + cushion);
            const orbitalSpeed = Math.sqrt(acceleration * r);

            const radiusVec = new THREE.Vector3().subVectors(currentPos, bestTarget.pos).normalize();
            const upVec = new THREE.Vector3(0, 1, 0); 
            let tangent = new THREE.Vector3().crossVectors(radiusVec, upVec).normalize();
            
            if (tangent.lengthSq() < 0.1) tangent = new THREE.Vector3(1, 0, 0);

            velocity.current.copy(tangent.multiplyScalar(orbitalSpeed));
            camera.lookAt(bestTarget.pos);
            
            isOrbiting.current = true;
            activeOrbitTarget.current = bestTarget;
            cruiseThrottle.current = 0; 
        }
    };

    // RESET
    useEffect(() => {
        if (active) {
            velocity.current.set(0, 0, 0);
            camera.rotation.set(0, 0, 0);
            camera.updateProjectionMatrix();
        } else {
            camera.fov = baseFov;
            camera.updateProjectionMatrix();
        }
    }, [active, camera]);

    useFrame((state, delta) => {
        if (!active) return;

        const dt = Math.min(delta, 0.1);
        const precision = isPrecision.current;
        const orbiting = isOrbiting.current;

        // --- 1. MOUSE STEERING (Virtual Joystick) ---
        if (!orbiting) {
            const mx = state.pointer.x;
            const my = state.pointer.y;
            const deadzone = 0.15;
            let turnX = 0;
            let turnY = 0;

            if (Math.abs(mx) > deadzone) {
                turnX = Math.sign(mx) * (Math.abs(mx) - deadzone) / (1 - deadzone);
            }
            if (Math.abs(my) > deadzone) {
                turnY = Math.sign(my) * (Math.abs(my) - deadzone) / (1 - deadzone);
            }

            const sensitivity = precision ? 0.8 : 1.5;
            const yawSpeed = -turnX * Math.abs(turnX) * sensitivity;
            const pitchSpeed = turnY * Math.abs(turnY) * sensitivity;

            camera.rotateY(yawSpeed * dt);
            camera.rotateX(pitchSpeed * dt);
            
            // --- ROLL LOGIC (Q / E) ---
            const rollSpeed = 2.0;
            if (keys.current.rollLeft) camera.rotateZ(rollSpeed * dt);
            if (keys.current.rollRight) camera.rotateZ(-rollSpeed * dt);

            // Auto-level roll (Only if not manually rolling)
            if (!keys.current.rollLeft && !keys.current.rollRight) {
                const currentRoll = camera.rotation.z;
                camera.rotation.z -= currentRoll * 2.0 * dt;
            }
        }

        // --- 2. MOVEMENT ---
        const ACCEL = precision ? 15.0 : 80.0;
        const DRAG = orbiting ? 0.0 : (precision ? 4.0 : 2.0);
        const BOOST_MULT = precision ? 2.0 : 3.5;

        let thrustMult = 1.0;
        if (keys.current.boost && boostFuel.current > 0) {
            thrustMult = BOOST_MULT;
            boostFuel.current = Math.max(0, boostFuel.current - (30 * dt)); 
        } else {
            boostFuel.current = Math.min(100, boostFuel.current + (10 * dt)); 
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

            if (inputVector.lengthSq() > 1) inputVector.normalize();

            const thrust = inputVector.clone().applyQuaternion(camera.quaternion);
            thrust.multiplyScalar(ACCEL * thrustMult * dt);
            velocity.current.add(thrust);
        }

        // --- 3. PHYSICS ---
        const physicsTime = timeRef.current; 
        const currentPos = camera.position;
        const gravityForce = new THREE.Vector3(0, 0, 0);
        let validOrbitTargetFound = false;

        for (const planet of PLANET_DATA) {
             if (['Star', 'Planet', 'Black Hole'].includes(planet.type)) {
                 const planetPos = getOrbitalPosition(planet, physicsTime);
                 const distToPlanet = currentPos.distanceTo(planetPos);
                 
                 if (distToPlanet < 1000 && distToPlanet > planet.radius) {
                     validOrbitTargetFound = true;
                     const massProxy = planet.radius * 300; 
                     const cushion = planet.radius * 200;
                     const acceleration = massProxy / (distToPlanet * distToPlanet + cushion);
                     
                     const dir = new THREE.Vector3().subVectors(planetPos, currentPos).normalize();
                     gravityForce.add(dir.multiplyScalar(acceleration * dt));
                     
                     if (orbiting && activeOrbitTarget.current?.id === planet.id) {
                         const idealSpeed = Math.sqrt(acceleration * distToPlanet);
                         const currentSpeed = velocity.current.length();
                         if (Math.abs(currentSpeed - idealSpeed) > 0.1) {
                             velocity.current.setLength(idealSpeed);
                         }
                     }
                 }
             }
        }

        velocity.current.add(gravityForce);

        if (DRAG > 0) {
            const dragForce = velocity.current.clone().multiplyScalar(-DRAG * dt);
            velocity.current.add(dragForce);
        }

        camera.position.add(velocity.current.clone().multiplyScalar(dt));

        if (orbiting && activeOrbitTarget.current) {
             const targetQuat = new THREE.Quaternion();
             const m = new THREE.Matrix4().lookAt(camera.position, activeOrbitTarget.current.pos, new THREE.Vector3(0, 1, 0));
             targetQuat.setFromRotationMatrix(m);
             camera.quaternion.slerp(targetQuat, dt * 0.5);
        }

        const currentSpeed = velocity.current.length(); 
        const targetFov = 45 + (currentSpeed * 0.1); 
        camera.fov = THREE.MathUtils.lerp(camera.fov, Math.min(targetFov, 100), 0.1);
        camera.updateProjectionMatrix();

        const now = state.clock.elapsedTime;
        if (now - lastEventTime.current > 0.03) { 
            const event = new CustomEvent(SPACESHIP_UPDATE_EVENT, { 
                detail: { 
                    speed: currentSpeed, 
                    fuel: boostFuel.current,
                    boosting: keys.current.boost && boostFuel.current > 0,
                    precision: precision,
                    canOrbit: validOrbitTargetFound,
                    isOrbiting: orbiting,
                    cruise: cruiseThrottle.current,
                    mouseX: state.pointer.x,
                    mouseY: state.pointer.y
                } 
            });
            window.dispatchEvent(event);
            lastEventTime.current = now;
        }
    });

    if (!active) return null;
    return null;
}

// --- CENTERED DASHBOARD HUD ---
export function SpaceshipHUD({ active }: { active: boolean }) {
    const [speed, setSpeed] = useState(0);
    const [fuel, setFuel] = useState(100);
    const [isBoosting, setIsBoosting] = useState(false);
    const [isPrecision, setIsPrecision] = useState(false);
    const [canOrbit, setCanOrbit] = useState(false);
    const [isOrbiting, setIsOrbiting] = useState(false);
    const [cruise, setCruise] = useState(0);
    const [reticlePos, setReticlePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!active) return;
        const handleUpdate = (e: any) => {
            setSpeed(e.detail.speed);
            setFuel(e.detail.fuel);
            setIsBoosting(e.detail.boosting);
            setIsPrecision(e.detail.precision);
            setCanOrbit(e.detail.canOrbit);
            setIsOrbiting(e.detail.isOrbiting);
            setCruise(e.detail.cruise);
            setReticlePos({ x: e.detail.mouseX, y: e.detail.mouseY });
        };
        window.addEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
        return () => window.removeEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
    }, [active]);

    const dispatchControl = (type: string) => {
        window.dispatchEvent(new CustomEvent(SPACESHIP_CONTROL_EVENT, { detail: { type } }));
    };

    if (!active) return null;

    return (
        <div className="fixed inset-0 z-[45] pointer-events-none flex flex-col justify-end items-center pb-0 overflow-hidden">
            <div className={`relative mb-32 flex items-end gap-6 transition-transform duration-100 pointer-events-auto ${isBoosting ? 'scale-105 translate-y-1' : ''}`}>
                
                {/* --- LEFT WING --- */}
                <div className="flex flex-col items-end gap-2 pb-2">
                     <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest opacity-80">
                         <span>NAV-092</span>
                         <Compass size={12} className="text-zinc-500" />
                     </div>

                    <button 
                        onClick={() => dispatchControl('TOGGLE_PRECISION')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-l-full rounded-tr-lg border-b-2 transition-all
                            ${isPrecision 
                                ? 'bg-indigo-900/80 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                                : 'bg-black/40 border-zinc-700 text-zinc-500 hover:text-white hover:bg-zinc-800 backdrop-blur-md'}
                        `}
                    >
                        <MousePointer2 size={14} />
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[9px] font-bold tracking-widest">PRECISION</span>
                            <span className="text-[8px] opacity-60">TAB</span>
                        </div>
                    </button>
                </div>

                {/* --- CENTER --- */}
                <div className="flex flex-col items-center">
                    <div className="relative flex flex-col items-center bg-black/80 backdrop-blur-xl px-14 py-5 rounded-t-3xl border-t-2 border-x border-[#DFFF00] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-10">
                        <div className="absolute top-2 w-12 h-1 bg-[#DFFF00]/30 rounded-full" />
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className={`text-6xl font-black tabular-nums tracking-tighter ${isBoosting ? 'text-[#00FFFF] drop-shadow-[0_0_15px_#00FFFF]' : 'text-white'}`}>
                                {speed.toFixed(0)}
                            </span>
                            <span className="text-xs font-bold text-zinc-500 font-mono mb-1">KM/S</span>
                        </div>
                    </div>

                    <div className="w-[340px] h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative mt-[-2px] z-10 shadow-lg">
                        <div 
                            className={`h-full transition-all duration-100 ease-linear ${isBoosting ? 'bg-[#00FFFF] shadow-[0_0_20px_#00FFFF]' : 'bg-[#DFFF00]'}`} 
                            style={{ width: `${fuel}%` }}
                        />
                        {cruise > 0 && (
                            <div className="absolute top-0 bottom-0 w-1 bg-white mix-blend-difference" style={{ left: `${cruise * 100}%` }} />
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center mt-[-1px]">
                         <div className="w-[300px] h-4 bg-gradient-to-b from-black/80 to-transparent border-x border-white/5 clip-path-polygon-[0_0,100%_0,80%_100%,20%_100%]" />
                    </div>

                    <div className="absolute -bottom-8 flex items-center gap-4">
                        {cruise > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <Gauge size={10} />
                                CRUISE: {(cruise * 100).toFixed(0)}%
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT WING --- */}
                <div className="flex flex-col items-start gap-2 pb-2">
                    <div className={`flex items-center gap-1 text-[10px] font-bold tracking-wider transition-colors ${isBoosting ? 'text-[#00FFFF]' : 'text-zinc-600'}`}>
                        <Zap size={12} className={isBoosting ? 'animate-pulse' : ''} />
                        BOOST
                    </div>

                    <div className="h-10 flex items-center min-w-[120px]">
                        {canOrbit && !isOrbiting && (
                            <button
                                onClick={() => dispatchControl('ENGAGE_ORBIT')}
                                className="flex items-center gap-2 px-4 py-2 rounded-r-full rounded-tl-lg bg-[#DFFF00]/10 text-[#DFFF00] border-b-2 border-[#DFFF00]/50 hover:bg-[#DFFF00] hover:text-black transition-all animate-in fade-in slide-in-from-left-4 duration-300"
                            >
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] font-bold tracking-widest">ENGAGE ORBIT</span>
                                    <span className="text-[8px] opacity-60">KEY O</span>
                                </div>
                                <Target size={14} />
                            </button>
                        )}
                        {isOrbiting && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-r-full rounded-tl-lg bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] font-bold tracking-widest">ORBIT LOCKED</span>
                                    <span className="text-[8px] opacity-60">AUTO-PILOT</span>
                                </div>
                                <RefreshCw size={14} className="animate-spin" />
                            </div>
                        )}
                         {!canOrbit && !isOrbiting && (
                            <div className="px-4 py-2 rounded-r-full rounded-tl-lg border-b-2 border-zinc-800 bg-black/40 backdrop-blur-md text-zinc-700">
                                <span className="text-[9px] font-bold tracking-widest">NO TARGET</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* RETICLE */}
            <div 
                className="absolute pointer-events-none transition-all duration-75 ease-out"
                style={{ 
                    left: '50%', top: '50%',
                    transform: `translate(calc(-50% + ${reticlePos.x * window.innerWidth / 2}px), calc(-50% + ${-reticlePos.y * window.innerHeight / 2}px))`
                }}
            >
                 <div className={`w-8 h-8 border border-white/30 rounded-full flex items-center justify-center ${isBoosting ? 'border-[#00FFFF]' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${isBoosting ? 'bg-[#00FFFF] shadow-[0_0_10px_#00FFFF]' : 'bg-[#DFFF00]'}`} />
                 </div>
            </div>

            {/* Steering Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line 
                    x1="50%" y1="50%" 
                    x2={50 + (reticlePos.x * 50) + '%'} 
                    y2={50 - (reticlePos.y * 50) + '%'} 
                    stroke="white" 
                    strokeDasharray="4 4"
                />
            </svg>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15vh] h-[15vh] border border-white/5 rounded-full pointer-events-none" />
        </div>
    );
}