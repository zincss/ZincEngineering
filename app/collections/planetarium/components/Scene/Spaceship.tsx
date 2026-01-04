'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { FlyControls } from '@react-three/drei';
import * as THREE from 'three';
import { Rocket, Zap, Compass, Navigation } from 'lucide-react';
import { useSimulation, getOrbitalPosition } from '../../context';
import { PLANET_DATA } from '../../data';

const SPACESHIP_EVENT = 'spaceship-update';

// KEY MAPPINGS
const MOVEMENT_KEYS = {
    FORWARD: ['KeyW', 'ArrowUp'],
    BACKWARD: ['KeyS', 'ArrowDown'],
    LEFT: ['KeyA', 'ArrowLeft'],
    RIGHT: ['KeyD', 'ArrowRight'],
    UP: ['KeyR', 'ShiftLeft'],      // Shift = Up (Elevation)
    DOWN: ['KeyF', 'ControlLeft'],  // Ctrl = Down
    BOOST: ['Space']                // Space = Boost (As requested)
};

// --- 3D CONTROLLER COMPONENT ---
export function SpaceshipController({ active }: { active: boolean }) {
    const { camera, gl } = useThree() as unknown as { camera: THREE.PerspectiveCamera, gl: THREE.WebGLRenderer };
    const { timeRef } = useSimulation(); 
    
    // PHYSICS STATE
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const lastEventTime = useRef(0);
    
    // INPUT STATE
    const keys = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
        boost: false
    });
    
    // FUEL STATE
    const boostFuel = useRef(100);
    const baseFov = 45;

    // KEYBOARD LISTENERS
    useEffect(() => {
        if (!active) return;
        
        const handleKey = (e: KeyboardEvent, isDown: boolean) => {
            if (MOVEMENT_KEYS.FORWARD.includes(e.code)) keys.current.forward = isDown;
            if (MOVEMENT_KEYS.BACKWARD.includes(e.code)) keys.current.backward = isDown;
            if (MOVEMENT_KEYS.LEFT.includes(e.code)) keys.current.left = isDown;
            if (MOVEMENT_KEYS.RIGHT.includes(e.code)) keys.current.right = isDown;
            if (MOVEMENT_KEYS.UP.includes(e.code)) keys.current.up = isDown;
            if (MOVEMENT_KEYS.DOWN.includes(e.code)) keys.current.down = isDown;
            if (MOVEMENT_KEYS.BOOST.includes(e.code)) keys.current.boost = isDown;
        };
        
        const onDown = (e: KeyboardEvent) => handleKey(e, true);
        const onUp = (e: KeyboardEvent) => handleKey(e, false);
        
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, [active]);

    // RESET LOGIC
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

        // 1. SAFE DELTA
        const dt = Math.min(delta, 0.1);

        // 2. ENGINE SETTINGS
        const ACCEL = 80.0; 
        const DRAG = 2.0;   
        const BOOST_MULT = 3.5;
        
        // 3. BOOST LOGIC
        let thrustMult = 1.0;
        if (keys.current.boost && boostFuel.current > 0) {
            thrustMult = BOOST_MULT;
            boostFuel.current = Math.max(0, boostFuel.current - (30 * dt)); // Drain slightly slower
        } else {
            boostFuel.current = Math.min(100, boostFuel.current + (10 * dt)); // Recharge
        }

        // 4. INPUT THRUST (Local Space)
        const inputVector = new THREE.Vector3(0, 0, 0);
        if (keys.current.forward) inputVector.z -= 1;
        if (keys.current.backward) inputVector.z += 1;
        if (keys.current.left) inputVector.x -= 1;
        if (keys.current.right) inputVector.x += 1;
        if (keys.current.up) inputVector.y += 1;
        if (keys.current.down) inputVector.y -= 1;

        if (inputVector.lengthSq() > 0) inputVector.normalize();

        const thrust = inputVector.clone().applyQuaternion(camera.quaternion);
        thrust.multiplyScalar(ACCEL * thrustMult * dt);
        
        velocity.current.add(thrust);

        // 5. GRAVITY (Gentle Drift)
        const physicsTime = timeRef.current; 
        const currentPos = camera.position;
        const gravityForce = new THREE.Vector3(0, 0, 0);

        PLANET_DATA.forEach(planet => {
             if (['Star', 'Planet', 'Black Hole'].includes(planet.type)) {
                 const planetPos = getOrbitalPosition(planet, physicsTime);
                 const distToPlanet = currentPos.distanceTo(planetPos);
                 
                 if (distToPlanet < 1000 && distToPlanet > planet.radius) {
                     const massProxy = planet.radius * 300; 
                     const cushion = planet.radius * 200;
                     const force = massProxy / (distToPlanet * distToPlanet + cushion);
                     const dir = new THREE.Vector3().subVectors(planetPos, currentPos).normalize();
                     gravityForce.add(dir.multiplyScalar(force * dt)); 
                 }
             }
        });

        velocity.current.add(gravityForce);

        // 6. DRAG
        const dragForce = velocity.current.clone().multiplyScalar(-DRAG * dt);
        velocity.current.add(dragForce);

        // 7. APPLY MOVE
        camera.position.add(velocity.current.clone().multiplyScalar(dt));

        // 8. FOV WARP
        const currentSpeed = velocity.current.length(); 
        const targetFov = 45 + (currentSpeed * 0.1); 
        camera.fov = THREE.MathUtils.lerp(camera.fov, Math.min(targetFov, 100), 0.1);
        camera.updateProjectionMatrix();

        // 9. BROADCAST
        const now = state.clock.elapsedTime;
        if (now - lastEventTime.current > 0.05) { 
            const event = new CustomEvent(SPACESHIP_EVENT, { 
                detail: { 
                    speed: currentSpeed, 
                    fuel: boostFuel.current,
                    boosting: keys.current.boost && boostFuel.current > 0
                } 
            });
            window.dispatchEvent(event);
            lastEventTime.current = now;
        }
    });

    if (!active) return null;

    return (
        <FlyControls 
            movementSpeed={0} 
            rollSpeed={0.4} 
            dragToLook={true} 
            makeDefault={true} 
            domElement={gl.domElement} 
        />
    );
}

// --- CENTERED DASHBOARD HUD ---
export function SpaceshipHUD({ active }: { active: boolean }) {
    const [speed, setSpeed] = useState(0);
    const [fuel, setFuel] = useState(100);
    const [isBoosting, setIsBoosting] = useState(false);

    useEffect(() => {
        if (!active) return;
        const handleUpdate = (e: any) => {
            setSpeed(e.detail.speed);
            setFuel(e.detail.fuel);
            setIsBoosting(e.detail.boosting);
        };
        window.addEventListener(SPACESHIP_EVENT, handleUpdate);
        return () => window.removeEventListener(SPACESHIP_EVENT, handleUpdate);
    }, [active]);

    if (!active) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[60] flex flex-col justify-end pb-24 font-sans select-none">
            
            {/* Center Dashboard */}
            <div className={`self-center flex flex-col items-center transition-transform duration-100 ${isBoosting ? 'scale-105 translate-y-1' : ''}`}>
                
                {/* 1. Main Speed Readout */}
                <div className="relative flex flex-col items-center bg-black/80 backdrop-blur-xl px-12 py-4 rounded-t-3xl border-t-2 border-l border-r border-[#DFFF00] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
                    
                    {/* Top Decorative Lines */}
                    <div className="absolute top-2 w-1/3 h-0.5 bg-[#DFFF00]/50 rounded-full" />
                    
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className={`text-6xl font-black tabular-nums tracking-tighter ${isBoosting ? 'text-[#00FFFF] drop-shadow-[0_0_15px_#00FFFF]' : 'text-white'}`}>
                            {speed.toFixed(0)}
                        </span>
                        <span className="text-sm font-bold text-zinc-500 font-mono">KM/S</span>
                    </div>

                    {/* Navigation Heading */}
                    <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-mono tracking-[0.2em] mt-1 opacity-60">
                         <div className="w-8 h-px bg-zinc-600" />
                         <Compass size={10} /> 
                         <span>NAV-092</span>
                         <div className="w-8 h-px bg-zinc-600" />
                    </div>
                </div>

                {/* 2. Fuel & Status Bar (Full Width Bottom) */}
                <div className="w-[320px] h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative mt-[-2px] z-10 shadow-lg">
                    {/* Fuel Bar */}
                    <div 
                        className={`h-full transition-all duration-100 ease-linear ${isBoosting ? 'bg-[#00FFFF] shadow-[0_0_20px_#00FFFF]' : 'bg-[#DFFF00]'}`} 
                        style={{ width: `${fuel}%` }}
                    />
                </div>

                {/* 3. Indicators under the bar */}
                <div className="flex justify-between w-[320px] mt-2 px-2">
                    <div className={`flex items-center gap-1 text-[10px] font-bold tracking-wider transition-colors ${isBoosting ? 'text-[#00FFFF]' : 'text-zinc-500'}`}>
                        <Zap size={10} className={isBoosting ? 'animate-pulse' : ''} />
                        BOOST {isBoosting ? 'ACTIVE' : 'READY'}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 tracking-wider">
                         <Navigation size={10} />
                         MANUAL
                    </div>
                </div>

            </div>
            
            {/* Center Reticle (Stays in middle of screen) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none">
                 <div className={`w-12 h-12 border border-white/30 rounded-full flex items-center justify-center transition-all duration-200 ${isBoosting ? 'scale-90 border-[#00FFFF]/50' : 'scale-100'}`}>
                    <div className={`w-1 h-1 rounded-full ${isBoosting ? 'bg-[#00FFFF] shadow-[0_0_10px_#00FFFF]' : 'bg-[#DFFF00]'}`} />
                 </div>
                 {/* Crosshairs */}
                 <div className="absolute top-1/2 left-0 w-full h-px bg-transparent bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                 <div className="absolute left-1/2 top-0 h-full w-px bg-transparent bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>

        </div>
    );
}