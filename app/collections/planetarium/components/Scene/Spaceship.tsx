'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { FlyControls } from '@react-three/drei';
import * as THREE from 'three';
import { Rocket, Gauge, Compass } from 'lucide-react';

const SPACESHIP_EVENT = 'spaceship-update';

// --- 3D CONTROLLER COMPONENT (Inside Canvas) ---
export function SpaceshipController({ active }: { active: boolean }) {
    // Cast camera to PerspectiveCamera
    const { camera } = useThree() as unknown as { camera: THREE.PerspectiveCamera };
    
    // REFS: Physics loop
    const speedRef = useRef(0);
    const lastPos = useRef(new THREE.Vector3());
    const lastEventTime = useRef(0);
    const baseFov = 45;

    // Reset/Init logic
    useEffect(() => {
        if (active) {
            lastPos.current.copy(camera.position);
            camera.rotation.set(0, 0, 0);
            camera.updateProjectionMatrix();
        } else {
            camera.fov = baseFov;
            camera.updateProjectionMatrix();
        }
    }, [active, camera]);

    useFrame((state, delta) => {
        if (!active) return;

        const safeDelta = Math.max(delta, 0.001);
        const currentPos = camera.position;
        const dist = currentPos.distanceTo(lastPos.current);
        const instantSpeed = dist / safeDelta;
        
        // Smooth speed (Low-pass filter)
        speedRef.current = THREE.MathUtils.lerp(speedRef.current, instantSpeed, 0.05);
        lastPos.current.copy(currentPos);

        // Smooth FOV transition (Warp Effect)
        const targetFov = THREE.MathUtils.clamp(baseFov + (speedRef.current * 0.2), 45, 100);
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.05);
        camera.updateProjectionMatrix();

        // Broadcast speed to HUD (Throttle to 15fps to save performance)
        const now = state.clock.elapsedTime;
        if (now - lastEventTime.current > 0.06) {
            const event = new CustomEvent(SPACESHIP_EVENT, { detail: { speed: speedRef.current } });
            window.dispatchEvent(event);
            lastEventTime.current = now;
        }
    });

    if (!active) return null;

    return (
        <FlyControls 
            rollSpeed={0.4} 
            movementSpeed={50} 
            dragToLook={true} 
            makeDefault
        />
    );
}

// --- 2D HUD COMPONENT (Outside Canvas) ---
export function SpaceshipHUD({ active }: { active: boolean }) {
    const [speed, setSpeed] = useState(0);

    useEffect(() => {
        if (!active) return;
        
        const handleUpdate = (e: any) => {
            setSpeed(e.detail.speed);
        };

        window.addEventListener(SPACESHIP_EVENT, handleUpdate);
        return () => window.removeEventListener(SPACESHIP_EVENT, handleUpdate);
    }, [active]);

    if (!active) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[60] flex flex-col justify-between p-8 md:p-12 font-sans select-none">
            
            {/* Top Center: Heading */}
            <div className="self-center flex flex-col items-center opacity-80">
                 <div className="w-64 h-1 bg-gradient-to-r from-transparent via-[#DFFF00] to-transparent" />
                 <div className="flex gap-8 text-[#DFFF00] font-mono text-xs mt-1">
                    <span>NAV</span>
                    <Compass size={14} />
                    <span>000</span>
                 </div>
            </div>

            {/* Center Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80">
                <div className="w-8 h-8 border border-[#DFFF00]/50 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#DFFF00] rounded-full shadow-[0_0_10px_#DFFF00]" />
                </div>
            </div>

            {/* Bottom Left: Speed */}
            <div className="flex items-end gap-4 pointer-events-auto">
                <div className="flex flex-col items-start bg-black/80 backdrop-blur-md p-4 rounded-br-3xl border-l-2 border-[#DFFF00] shadow-[0_0_30px_rgba(0,0,0,0.5)] min-w-[200px]">
                    <div className="flex items-center gap-2 text-[#DFFF00] mb-2">
                        <Gauge size={18} />
                        <span className="font-bold tracking-widest text-sm">THRUST</span>
                    </div>
                    <div className="text-4xl font-mono font-black text-white tabular-nums">
                        {speed.toFixed(1)} <span className="text-sm font-normal text-zinc-400">km/s</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 mt-2 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#DFFF00]" 
                            style={{ width: `${Math.min((speed / 200) * 100, 100)}%`, transition: 'width 0.1s linear' }} 
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Right: Status */}
            <div className="self-end flex flex-col items-end bg-black/80 backdrop-blur-md p-4 rounded-bl-3xl border-r-2 border-[#DFFF00] shadow-[0_0_30px_rgba(0,0,0,0.5)] pointer-events-auto">
                 <div className="flex items-center gap-2 text-[#DFFF00] mb-1">
                    <span className="font-bold tracking-widest text-sm">SYSTEMS</span>
                    <Rocket size={18} />
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Warp Drive</div>
                    <div className="text-white font-mono text-sm">ONLINE</div>
                </div>
                <div className="text-right mt-2">
                     <div className="text-[10px] font-mono text-zinc-400 uppercase">Controls</div>
                     <div className="text-white font-mono text-xs">WASD + Drag</div>
                </div>
            </div>
        </div>
    );
}