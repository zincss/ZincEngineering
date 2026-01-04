'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation } from '../../context';
import { CelestialBody } from '../../data';
import { AtmosphereShader } from './shaders';

// --- REALISTIC ATMOSPHERE COMPONENT ---
export function RealisticAtmosphere({ radius, color, sunPosition }: { radius: number, color: string, sunPosition: THREE.Vector3 }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (!materialRef.current || !meshRef.current) return;
        
        const worldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPos);
        const sunDirWorld = new THREE.Vector3().subVectors(new THREE.Vector3(0,0,0), worldPos).normalize();
        const sunDirView = sunDirWorld.clone().transformDirection(camera.matrixWorldInverse);
        
        materialRef.current.uniforms.uSunPosition.value.copy(sunDirView);
    });

    return (
        <mesh ref={meshRef} scale={[1.2, 1.2, 1.2]}>
            <sphereGeometry args={[radius, 64, 64]} />
            <shaderMaterial 
                ref={materialRef}
                args={[AtmosphereShader]}
                uniforms-uColor-value={new THREE.Color(color)}
                uniforms-uSunset-value={new THREE.Color('#ff5500')}
                transparent
                depthWrite={false}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

// --- ELLIPTICAL ORBIT LINE ---
export function EllipticalOrbit({ body, type = 'planet', isSelected = false, parentRadius = 0 }: { body: CelestialBody, type?: 'planet' | 'moon', isSelected?: boolean, parentRadius?: number }) {
    const { getOrbitPoints } = useSimulation();
    
    // 2048 segments for high precision smooth lines
    const points = useMemo(() => {
        const rawPoints = getOrbitPoints(body, 2048);
        
        if (type === 'moon' && parentRadius > 0) {
            const scaleFactor = (parentRadius + body.distance) / (body.distance || 1);
            return rawPoints.map(p => p.multiplyScalar(scaleFactor));
        }
        
        return rawPoints;
    }, [body, getOrbitPoints, type, parentRadius]);

    const geometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [points]);

    // UPDATED: Brightened default to 0.15 (visible but subtle) and selected to 0.75
    const opacity = isSelected ? 0.75 : 0.15;
    const color = isSelected ? '#FFFFFF' : '#555555';
    const lineWidth = isSelected ? 2 : 1;

    return (
        <lineLoop geometry={geometry}>
            <lineBasicMaterial 
                color={color} 
                opacity={opacity} 
                transparent 
                depthWrite={false} 
                linewidth={lineWidth} 
            />
        </lineLoop>
    );
}

// --- SMART LABEL ---
export function SmartLabel({ 
    text, 
    type, 
    position, 
    visible, 
    offset = 0 
}: { 
    text: string, 
    type: string, 
    position: [number, number, number], 
    visible: boolean,
    offset?: number 
}) {
    const { camera } = useThree();
    const scalerRef = useRef<HTMLDivElement>(null);
    
    const isStar = type === 'Star' || type === 'Black Hole';
    const isPlanet = type === 'Planet' || type === 'Dwarf Planet';
    const isMoon = type === 'Moon' || type === 'Station';

    useFrame(() => {
        if (!scalerRef.current || !visible) return;
        const labelPos = new THREE.Vector3(position[0], position[1] + offset, position[2]);
        const dist = camera.position.distanceTo(labelPos);
        
        // --- ADAPTIVE LOGIC ---
        let scale = 1;
        let opacity = 1;

        if (isMoon) {
             // UPDATED: Fade out quickly when zooming out to avoid crowding.
             // Dist < 5: Close up scaling
             // Dist > 350: Start fading out (Visible near planet, invisible from system view)
             if (dist < 5) scale = Math.max(0.4, dist * 0.15);
             if (dist > 350) opacity = Math.max(0, 1 - (dist - 350) / 150);
        } else {
             // Planets remain visible much further out
             if (dist < 50) scale = Math.max(0.4, dist * 0.02);
             if (dist > 5000) opacity = Math.max(0, 1 - (dist - 5000) / 5000);
        }
        
        scalerRef.current.style.transform = `scale(${scale})`;
        scalerRef.current.style.opacity = opacity.toString();
        scalerRef.current.style.display = opacity < 0.05 ? 'none' : 'block';
    });

    if (!visible) return null;

    const textSizeClass = isStar ? 'text-[10px] md:text-xs font-bold' :
                          isPlanet ? 'text-[8px] md:text-[10px] font-semibold' :
                          'text-[8px] md:text-[9px] font-medium opacity-90';

    return (
        <Html 
            position={[position[0], position[1] + offset, position[2]]} 
            center 
            zIndexRange={[0, 0]} 
            style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
        >
            <div ref={scalerRef} className="origin-center transition-transform duration-75 will-change-transform">
                <div className={`
                    flex items-center gap-1.5 px-2 py-1 rounded-full border backdrop-blur-md shadow-lg
                    transition-colors duration-200
                    ${isStar ? 'bg-black/60 border-white/30' : 
                      isPlanet ? 'bg-black/50 border-white/20' : 
                      'bg-black/40 border-white/15'}
                `}>
                    {type === 'Station' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse shadow-[0_0_4px_#DFFF00]" />
                    )}
                    <span className={`
                        font-mono uppercase tracking-widest leading-none text-white
                        ${textSizeClass}
                    `}>
                        {text}
                    </span>
                </div>
            </div>
        </Html>
    )
}