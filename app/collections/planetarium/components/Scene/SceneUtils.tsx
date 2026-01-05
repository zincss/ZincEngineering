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

// --- SMART LABEL (FIXED WORLD POSITION TRACKING) ---
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
    
    // We use a Group ref to track the actual World Position of this label anchor
    const groupRef = useRef<THREE.Group>(null);
    const scalerRef = useRef<HTMLDivElement>(null);
    
    const isMajor = type === 'Star' || type === 'Black Hole' || type === 'Planet' || type === 'Dwarf Planet';
    const isMinor = type === 'Moon' || type === 'Station';

    useFrame(() => {
        if (!scalerRef.current || !visible || !groupRef.current) return;
        
        // FIX: Calculate distance based on TRUE WORLD POSITION
        const worldPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(worldPos);
        const dist = camera.position.distanceTo(worldPos);
        
        // --- ADAPTIVE LOGIC ---
        let scale = 1;
        let opacity = 1;

        if (isMinor) {
             // 1. SMART VISIBILITY FOR MINOR OBJECTS
             // Only show moons/stations when closer than 200 units
             // Fade out smoothly between 120 and 200.
             const FADE_START = 120;
             const FADE_END = 200;
             
             if (dist > FADE_END) {
                 opacity = 0;
             } else if (dist > FADE_START) {
                 opacity = 1 - (dist - FADE_START) / (FADE_END - FADE_START);
             } else {
                 opacity = 1;
             }

             // Scale down slightly when at the edge of visibility to reduce noise
             scale = Math.max(0.6, 1 - (dist / FADE_END) * 0.3);

        } else {
             // 2. LOGIC FOR MAJOR BODIES
             // Always visible unless super far (System View / Galaxy View)
             if (dist > 15000) {
                 opacity = Math.max(0, 1 - (dist - 15000) / 5000);
             }
             
             // Scale up slightly when far to maintain readability
             if (dist > 500) scale = 1.1;
        }
        
        // 3. BETTER POSITIONING
        // translateY(-60%) moves the label up so the anchor point is at the BOTTOM of the text
        scalerRef.current.style.transform = `scale(${scale}) translateY(-60%)`; 
        scalerRef.current.style.opacity = opacity.toString();
        
        // Prevent interaction/layout ghosts when invisible
        scalerRef.current.style.visibility = opacity < 0.05 ? 'hidden' : 'visible';
        scalerRef.current.style.pointerEvents = 'none'; // Labels shouldn't block clicks
    });

    if (!visible) return null;

    const textSizeClass = isMajor ? 'text-[10px] md:text-xs font-bold' :
                          'text-[8px] md:text-[9px] font-medium opacity-90';

    return (
        // Wrap in a group positioned at the requested local coordinates.
        // This allows us to get the derived World Position easily.
        <group ref={groupRef} position={[position[0], position[1] + offset, position[2]]}>
            <Html 
                position={[0, 0, 0]} // Position is handled by parent group
                center 
                zIndexRange={[0, 0]} 
                style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
            >
                <div ref={scalerRef} className="origin-bottom transition-opacity duration-200 will-change-transform">
                    <div className={`
                        flex items-center gap-1.5 px-2 py-1 rounded-full border backdrop-blur-md shadow-lg
                        transition-colors duration-200
                        ${isMajor ? 'bg-black/60 border-white/30' : 
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
                    {/* Optional: A small line connecting label to object for clarity */}
                    <div className="w-px h-3 bg-white/20 mx-auto" />
                </div>
            </Html>
        </group>
    )
}