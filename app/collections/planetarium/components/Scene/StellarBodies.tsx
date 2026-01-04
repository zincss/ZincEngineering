'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AccretionDiskShader, SunSurfaceShader, SunAtmosphereShader } from './shaders';

// --- BLACK HOLE ---
export function BlackHole({ data, onClick }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const diskRef = useRef<THREE.Mesh>(null);
    const lensRef = useRef<THREE.Mesh>(null);
    const diskMat = useRef<THREE.ShaderMaterial>(null);
    const lensMat = useRef<THREE.ShaderMaterial>(null);
    const [hovered, setHover] = useState(false);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (diskMat.current) diskMat.current.uniforms.time.value = t;
        if (lensMat.current) lensMat.current.uniforms.time.value = t + 50.0; 
    });

    return (
        <group>
            <mesh 
                ref={meshRef}
                onClick={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
            >
                <sphereGeometry args={[data.radius, 64, 64]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh ref={diskRef} rotation={[-Math.PI/2, 0, 0]} raycast={() => null}>
                <ringGeometry args={[data.radius * 1.0, data.radius * 6.0, 128, 1]} />
                <shaderMaterial ref={diskMat} args={[AccretionDiskShader]} side={THREE.DoubleSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={lensRef} rotation={[0, 0, 0]} raycast={() => null}>
                <ringGeometry args={[data.radius * 1.1, data.radius * 2.5, 128, 1]} />
                <shaderMaterial ref={lensMat} args={[AccretionDiskShader]} side={THREE.DoubleSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh raycast={() => null}>
                <sphereGeometry args={[data.radius * 1.05, 64, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </mesh>
            {hovered && (
                 <mesh scale={[1.1, 1.1, 1.1]} raycast={() => null}>
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshBasicMaterial color="#DFFF00" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}

// --- SUN ---
export function Sun({ onClick }: { onClick: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const coronaRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Sprite>(null);
    const surfaceMat = useRef<THREE.ShaderMaterial>(null);
    const coronaMat = useRef<THREE.ShaderMaterial>(null);
    const [hovered, setHover] = useState(false);

    useFrame(({ clock }) => {
        const elapsed = clock.getElapsedTime();
        if (surfaceMat.current) surfaceMat.current.uniforms.uTime.value = elapsed;
        if (coronaMat.current) coronaMat.current.uniforms.uTime.value = elapsed;

        if (meshRef.current) meshRef.current.rotation.y = elapsed * 0.005;
        if (coronaRef.current) {
             coronaRef.current.rotation.y = -elapsed * 0.01; 
             coronaRef.current.rotation.z = elapsed * 0.005; 
             const scale = 1.04 + Math.sin(elapsed * 2.0) * 0.005; 
             coronaRef.current.scale.set(scale, scale, scale);
        }
        if (glowRef.current) {
            const scale = 90 + Math.sin(elapsed * 0.5) * 5; 
            glowRef.current.scale.set(scale, scale, 1);
        }
    });

    const glowTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, 'rgba(255, 200, 100, 0.6)'); 
            gradient.addColorStop(0.2, 'rgba(255, 140, 0, 0.4)'); 
            gradient.addColorStop(0.5, 'rgba(200, 50, 0, 0.1)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); 
            context.fillStyle = gradient;
            context.fillRect(0, 0, 128, 128);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            <mesh 
                ref={meshRef}
                onClick={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
            >
                <sphereGeometry args={[25, 128, 128]} /> 
                <shaderMaterial ref={surfaceMat} args={[SunSurfaceShader]} />
            </mesh>
            <mesh ref={coronaRef} scale={[1.04, 1.04, 1.04]} raycast={() => null}>
                <sphereGeometry args={[25, 64, 64]} />
                <shaderMaterial ref={coronaMat} args={[SunAtmosphereShader]} transparent side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <sprite ref={glowRef} scale={[90, 90, 1]} raycast={() => null}>
                <spriteMaterial map={glowTexture} color="#ffaa00" blending={THREE.AdditiveBlending} depthWrite={false} />
            </sprite>
            <pointLight intensity={1.5} decay={0} distance={0} color="#fff8e7" />
            {hovered && (
                 <mesh scale={[1.02, 1.02, 1.02]} raycast={() => null}>
                    <sphereGeometry args={[25, 64, 64]} />
                    <meshBasicMaterial color="#DFFF00" transparent opacity={0.4} side={THREE.BackSide} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}