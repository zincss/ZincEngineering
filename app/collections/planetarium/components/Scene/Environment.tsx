'use client';

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SolarWindShader, DustShader } from './shaders';

// --- SOLAR WIND ---
export function SolarWind() {
    const linesRef = useRef<THREE.LineSegments>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    
    const { geometry } = useMemo(() => {
        const count = 6000;
        const positions = [];
        const offsets = [];
        const speeds = [];
        
        for(let i=0; i<count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.sin(phi) * Math.sin(theta);
            const z = Math.cos(phi);
            const dir = new THREE.Vector3(x, y, z);
            const dist = 50 + Math.random() * 800;
            const len = 40 + Math.random() * 100; 
            const p1 = dir.clone().multiplyScalar(dist);
            const p2 = dir.clone().multiplyScalar(dist + len);
            positions.push(p1.x, p1.y, p1.z);
            positions.push(p2.x, p2.y, p2.z);
            offsets.push(Math.random() * 1000, Math.random() * 1000);
            const speed = 1.0 + Math.random() * 2.0;
            speeds.push(speed, speed);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 1));
        geo.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speeds, 1));
        return { geometry: geo };
    }, []);

    useFrame(({ clock }) => {
        if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    });

    return (
        <lineSegments ref={linesRef} geometry={geometry}>
            <shaderMaterial ref={materialRef} args={[SolarWindShader]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
    );
}

// --- SPACE DUST ---
export function SpaceDust() {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { camera } = useThree();
    
    const particles = useMemo(() => {
        const count = 3000;
        const data = new Float32Array(count * 3);
        const boxSize = 400;
        for(let i=0; i<count*3; i++) data[i] = (Math.random() - 0.5) * boxSize; 
        return data;
    }, []);

    useFrame(() => {
        if (materialRef.current) materialRef.current.uniforms.uCameraPos.value.copy(camera.position);
    });

    return (
        <points ref={pointsRef} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
            </bufferGeometry>
            <shaderMaterial ref={materialRef} args={[DustShader]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
}

// --- ASTEROID BELT (UPDATED) ---
export function AsteroidBelt() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 4000; 
    
    useLayoutEffect(() => {
        if(!meshRef.current) return;
        const tempObj = new THREE.Object3D();
        const color = new THREE.Color();
        
        for(let i=0; i<count; i++) {
           const angle = Math.random() * Math.PI * 2;
           // Improved Distribution: Less uniform, more "bands"
           const radius = 300 + Math.random() * 250 + (Math.random() > 0.5 ? 50 : 0); 
           
           const x = Math.cos(angle) * radius;
           const z = Math.sin(angle) * radius;
           // Gaussian-like vertical spread (concentrated in middle)
           const y = (Math.random() - 0.5) * (Math.random() * 80); 
           
           tempObj.position.set(x, y, z);
           tempObj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
           
           // Varied scale
           const scale = Math.random() * 0.5 + 0.1; 
           tempObj.scale.set(scale, scale, scale);
           tempObj.updateMatrix();
           meshRef.current.setMatrixAt(i, tempObj.matrix);
           
           // Rock Colors
           color.setHSL(0.08, 0.1, Math.random() * 0.4 + 0.3); 
           meshRef.current.setColorAt(i, color);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, []);
  
    useFrame(({ clock }) => {
       if(meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.005;
    });
  
    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
           {/* Replaced Dodecahedron with Icosahedron for more "rocky" look */}
           <icosahedronGeometry args={[1, 0]} /> 
           <meshStandardMaterial color="#FFFFFF" roughness={0.9} metalness={0.1} flatShading />
        </instancedMesh>
    )
}

// --- STAR BACKGROUND ---
export function StarBackground() {
    const texture = useLoader(THREE.TextureLoader, '/textures/8k_stars.jpg') as THREE.Texture;
    return (
        <group>
            <mesh>
                <sphereGeometry args={[100000, 64, 64]} />
                <meshBasicMaterial map={texture} side={THREE.BackSide} color="#050505" />
            </mesh>
            <Stars radius={100} depth={30000} count={12000} factor={4} saturation={0} fade speed={0.5} />
        </group>
    );
}