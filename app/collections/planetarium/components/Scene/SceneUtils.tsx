'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation } from '../../context';
import { CelestialBody, PLANET_DATA } from '../../data';
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
        <mesh ref={meshRef} scale={[1.2, 1.2, 1.2]} raycast={() => null}>
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
    const { getOrbitPoints, activeJob } = useSimulation(); 
    
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

    const baseOpacity = isSelected ? 0.75 : (activeJob ? 0.05 : 0.15);
    const color = isSelected ? '#FFFFFF' : '#555555';
    const lineWidth = isSelected ? 2 : 1;

    return (
        <lineLoop geometry={geometry} raycast={() => null}>
            <lineBasicMaterial 
                color={color} 
                opacity={baseOpacity} 
                transparent 
                depthWrite={false} 
                linewidth={lineWidth} 
            />
        </lineLoop>
    );
}

// --- SMART LABEL (UPDATED FOR CLOSE-UP PROXIMITY) ---
export function SmartLabel({ 
    id,
    text, 
    type, 
    position, 
    visible, 
    offset = 0 
}: { 
    id?: string,
    text: string, 
    type: string, 
    position: [number, number, number], 
    visible: boolean,
    offset?: number 
}) {
    const { camera } = useThree();
    const { activeJob } = useSimulation(); 
    
    const groupRef = useRef<THREE.Group>(null);
    const scalerRef = useRef<HTMLDivElement>(null);
    
    const isMajor = type === 'Star' || type === 'Black Hole' || type === 'Planet' || type === 'Dwarf Planet';
    const isMinor = type === 'Moon' || type === 'Station';

    const isParentOfDestination = (myId: string, destId: string) => {
        const parent = PLANET_DATA.find(p => p.moons?.some(m => m.id === destId));
        return parent && parent.id === myId;
    };

    useFrame(() => {
        if (!scalerRef.current || !visible || !groupRef.current) return;
        
        if (activeJob && id) {
            const destId = activeJob.destId;
            const isDestination = id === destId;
            const isParent = isParentOfDestination(id, destId);
            
            if (!isDestination && !isParent) {
                scalerRef.current.style.opacity = '0';
                scalerRef.current.style.pointerEvents = 'none';
                return;
            }
        }

        const worldPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(worldPos);
        const dist = camera.position.distanceTo(worldPos);
        
        let scale = 1;
        let opacity = 1;
        let currentOffset = offset;

        // --- DISTANCE LOGIC ---
        if (isMinor) {
             const FADE_START = 120;
             const FADE_END = 200;
             
             if (dist > FADE_END) opacity = 0;
             else if (dist > FADE_START) opacity = 1 - (dist - FADE_START) / (FADE_END - FADE_START);
             else opacity = 1;

             scale = Math.max(0.6, 1 - (dist / FADE_END) * 0.3);

             // Pull label closer when very near
             if (dist < 50) {
                 // Linearly interpolate offset from 100% to 30% as distance drops
                 const proximityFactor = Math.max(0, (dist - 10) / 40); 
                 currentOffset = offset * (0.3 + 0.7 * proximityFactor);
             }

        } else {
             // Major bodies fade out at extreme range
             if (dist > 15000) opacity = Math.max(0, 1 - (dist - 15000) / 5000);
             if (dist > 500) scale = 1.1;
             
             // Pull label closer for major bodies too
             if (dist < 100) {
                 const proximityFactor = Math.max(0, (dist - 20) / 80);
                 currentOffset = offset * (0.4 + 0.6 * proximityFactor);
             }
        }
        
        // APPLY DYNAMIC POSITION
        groupRef.current.position.set(position[0], position[1] + currentOffset, position[2]);

        scalerRef.current.style.transform = `scale(${scale}) translateY(-60%)`; 
        scalerRef.current.style.opacity = opacity.toString();
        scalerRef.current.style.visibility = opacity < 0.05 ? 'hidden' : 'visible';
        scalerRef.current.style.pointerEvents = 'none'; 
    });

    if (!visible) return null;

    const textSizeClass = isMajor ? 'text-[10px] md:text-xs font-bold' :
                          'text-[8px] md:text-[9px] font-medium opacity-90';

    return (
        <group ref={groupRef} position={[position[0], position[1] + offset, position[2]]}>
            <Html 
                position={[0, 0, 0]} 
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
                    <div className="w-px h-3 bg-white/20 mx-auto" />
                </div>
            </Html>
        </group>
    )
}