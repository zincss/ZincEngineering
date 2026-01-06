'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation } from '../context';
// --- FIXED DIRECT IMPORTS ---
import { StarBackground, SpaceDust } from './Scene/Environment';
import { Planet } from './Scene/PlanetarySystem';

// --- SHARED SUN SHADERS (Adapted for Custom Colors) ---
const StarSurfaceShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#ffaa00') }, 
    uColorB: { value: new THREE.Color('#ff3300') }, 
    uColorC: { value: new THREE.Color('#ffddaa') }, 
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vPos = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;
    // Simplex Noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v){ const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0); vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx); vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy); vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i); vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0)); float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_); vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw); vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0; vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww; vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w); vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0); m = m * m; return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))); }

    void main() {
      vec3 pos = normalize(vPos);
      float n1 = snoise(pos * 6.0 + uTime * 0.2);
      float n2 = snoise(pos * 12.0 - uTime * 0.4);
      float noiseSum = n1 * 0.5 + n2 * 0.3; 
      vec3 baseColor = mix(uColorB, uColorA, noiseSum * 0.5 + 0.5);
      float hot = smoothstep(0.3, 0.8, noiseSum);
      vec3 finalColor = mix(baseColor, uColorC, hot);
      float viewAngle = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)); 
      finalColor *= 0.8 + 0.5 * pow(viewAngle, 2.0); 
      gl_FragColor = vec4(finalColor * 2.0, 1.0);
    }
  `
};

const StarAtmosphereShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ffaa00') }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        uniform float uTime;
        void main() {
            vNormal = normal;
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
            gl_FragColor = vec4(uColor, intensity * 0.8);
        }
    `
};

function StandardStar({ 
    radius, colorA, colorB, colorC, position, onClick 
}: { 
    radius: number, colorA: string, colorB: string, colorC: string, position: [number, number, number], onClick?: () => void
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const coronaRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Sprite>(null);
    const groupRef = useRef<THREE.Group>(null);
    const surfaceMat = useRef<THREE.ShaderMaterial>(null);
    const coronaMat = useRef<THREE.ShaderMaterial>(null);

    // Initial position for wobble calculation
    const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (surfaceMat.current) surfaceMat.current.uniforms.uTime.value = t;
        if (meshRef.current) meshRef.current.rotation.y = t * 0.05;
        if (coronaRef.current) {
             coronaRef.current.rotation.y = -t * 0.02;
             coronaRef.current.rotation.z = t * 0.01;
        }
        if (glowRef.current) {
             const s = (radius * 6) + Math.sin(t * 0.5) * (radius * 0.2);
             glowRef.current.scale.set(s, s, 1);
        }

        // Wobble / Unsteadiness Logic
        if (groupRef.current) {
            // Apply a small sine wave offset to create "unsteadiness"
            const wobbleX = Math.sin(t * 1.5) * 0.5;
            const wobbleY = Math.cos(t * 1.2) * 0.3;
            const wobbleZ = Math.sin(t * 0.8) * 0.5;
            groupRef.current.position.set(
                initialPos.x + wobbleX,
                initialPos.y + wobbleY,
                initialPos.z + wobbleZ
            );
        }
    });

    // UPDATED GLOW TEXTURE: Uses standard white-to-transparent gradient, colored by spriteMaterial
    const glowTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const g = ctx.createRadialGradient(64,64,0,64,64,64);
            // White core -> Transparent
            g.addColorStop(0, 'rgba(255,255,255,1)');
            g.addColorStop(0.2, 'rgba(255,255,255,0.8)');
            g.addColorStop(0.5, 'rgba(255,255,255,0.2)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0,0,128,128);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group ref={groupRef} position={position}>
            <mesh ref={meshRef} onClick={onClick}>
                <sphereGeometry args={[radius, 64, 64]} />
                <shaderMaterial 
                    ref={surfaceMat} 
                    args={[StarSurfaceShader]} 
                    uniforms-uColorA-value={new THREE.Color(colorA)}
                    uniforms-uColorB-value={new THREE.Color(colorB)}
                    uniforms-uColorC-value={new THREE.Color(colorC)}
                />
            </mesh>
            <mesh ref={coronaRef} scale={[1.2, 1.2, 1.2]} raycast={() => null}>
                 <sphereGeometry args={[radius, 64, 64]} />
                 <shaderMaterial 
                    ref={coronaMat}
                    args={[StarAtmosphereShader]}
                    transparent
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    uniforms-uColor-value={new THREE.Color(colorA)}
                    depthWrite={false}
                 />
            </mesh>
            <sprite ref={glowRef} raycast={() => null}>
                <spriteMaterial 
                    map={glowTexture} 
                    color={colorC} // Tint the white glow texture with the star's color
                    blending={THREE.AdditiveBlending} 
                    depthWrite={false} 
                    opacity={0.6} 
                />
            </sprite>
            {/* UPDATED LIGHTING: decay={0} for infinite range like Sun */}
            <pointLight intensity={2} distance={0} decay={0} color={colorC} />
        </group>
    );
}

function EpicAsteroidField() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 3000;
    
    useMemo(() => {
        const temp = new THREE.Object3D();
        const colors = [new THREE.Color('#555555'), new THREE.Color('#333333'), new THREE.Color('#2a2a2a')];
        
        setTimeout(() => {
            if (!meshRef.current) return;
            for(let i=0; i<count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 250 + Math.random() * 250; 
                const spread = 60; 
                
                temp.position.set(
                    Math.cos(angle) * radius,
                    (Math.random() - 0.5) * spread,
                    Math.sin(angle) * radius
                );
                
                const s = 1 + Math.random() * 4;
                temp.scale.set(s, s, s);
                temp.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
                temp.updateMatrix();
                meshRef.current.setMatrixAt(i, temp.matrix);
                meshRef.current.setColorAt(i, colors[Math.floor(Math.random() * colors.length)]);
            }
            meshRef.current.instanceMatrix.needsUpdate = true;
            if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
        }, 0);
    }, []);

    useFrame(({ clock }) => {
        if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.015;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial roughness={0.8} metalness={0.2} />
        </instancedMesh>
    );
}

export function FantasyContent({ handleSelect, planetRefs, showOrbits, showLabels }: any) {
    const { currentData } = useSimulation();
    const groupRef = useRef<THREE.Group>(null);
    
    // Rotate the stars slowly
    useFrame(({ clock }) => {
        if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    });

    return (
        <group>
            {/* Binary Stars Group */}
            <group ref={groupRef}>
                {/* Blue Giant */}
                <StandardStar 
                    radius={28} 
                    position={[-40, 0, 0]} 
                    colorA="#0066ff" 
                    colorB="#002266" 
                    colorC="#88bbff"
                    onClick={() => handleSelect('zinc_prime_stars')}
                />
                {/* Red Dwarf */}
                <StandardStar 
                    radius={16} 
                    position={[50, 0, 0]} 
                    colorA="#ff4400" 
                    colorB="#550000" 
                    colorC="#ffaa00"
                />
            </group>

            <EpicAsteroidField />
            <StarBackground />
            <SpaceDust />

            {/* Render Planets from Context Data (FANTASY_DATA) */}
            {currentData.filter(p => p.type !== 'Star').map((planet) => (
                <Planet 
                    key={planet.id}
                    data={planet}
                    isSelected={false} // Selection handled by parent state
                    onClick={(idOverride?: string) => handleSelect(idOverride || planet.id)}
                    onSelectRef={(id: string, ref: THREE.Object3D) => { planetRefs.current[id] = ref; }}
                    isCinematic={false}
                    showOrbits={showOrbits} // Pass Prop
                    showLabels={showLabels} // Pass Prop
                />
            ))}

            <ambientLight intensity={0.1} />
        </group>
    );
}