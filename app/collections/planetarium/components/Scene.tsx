'use client';

import React, { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation, J2000_EPOCH, MILLISECONDS_PER_DAY } from '../context';

// --- HELPERS FOR VISUALS ---

function OrbitRing({ radius, type = 'planet', color = '#FFFFFF' }: { radius: number, type?: 'planet' | 'moon', color?: string }) {
    const isMoon = type === 'moon';
    let width = isMoon ? 0.05 : 0.25; 
    if (!isMoon && radius > 1000) width = 0.8; 
    
    const opacity = isMoon ? 0.1 : 0.15; 
    const segments = isMoon ? 128 : 360;
    
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - width / 2, radius + width / 2, segments]} />
            <meshBasicMaterial 
                color={color} 
                opacity={opacity} 
                transparent 
                side={THREE.DoubleSide} 
                depthWrite={false} 
                blending={THREE.AdditiveBlending} 
            />
        </mesh>
    );
}

function SmartLabel({ 
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
    // --- SMART SCALING LOGIC ---
    const { camera } = useThree();
    const scalerRef = useRef<HTMLDivElement>(null);
    
    // Determine base factor (Distance at which scale is 1:1)
    const isMajor = ['Star', 'Planet', 'Black Hole', 'Dwarf Planet'].includes(type);
    const isStation = type === 'Station';
    const baseFactor = isMajor ? 150 : 80;

    useFrame(() => {
        if (!scalerRef.current || !visible) return;
        
        // 1. Calculate distance from camera to label
        const labelPos = new THREE.Vector3(position[0], position[1] + offset, position[2]);
        const dist = camera.position.distanceTo(labelPos);

        // 2. Smart Clamp Logic
        // The <Html> component automatically scales by (baseFactor / dist).
        // If dist < baseFactor, this scale becomes > 1 (Huge).
        // We counter-scale to ensure the visual size never exceeds native UI size (scale 1).
        // This effectively creates a "Fixed Screen Size" behavior when close, 
        // while preserving "Perspective Shrink" when far.
        const clampScale = Math.min(1, dist / baseFactor);
        
        // Apply the correction
        scalerRef.current.style.transform = `scale(${clampScale})`;
        
        // Optional: Fade out slightly if extremely close to avoid blocking surface view
        const opacity = dist < (baseFactor * 0.1) ? Math.max(0.3, dist / (baseFactor * 0.1)) : 1;
        scalerRef.current.style.opacity = opacity.toString();
    });

    if (!visible) return null;
    
    return (
        <Html 
            position={[position[0], position[1] + offset, position[2]]} 
            center 
            distanceFactor={baseFactor} 
            zIndexRange={[0, 10]}
            style={{ pointerEvents: 'none' }}
        >
            {/* Wrapper for Smart Scaling */}
            <div ref={scalerRef} className="origin-center transition-opacity duration-200">
                <div className={`
                    flex flex-col items-center transition-all duration-300 ease-out origin-center
                    ${visible ? 'opacity-100 blur-0 transform scale-100' : 'opacity-0 blur-md transform scale-50'}
                `}>
                    <div className={`
                        flex items-center gap-2 px-2 py-1 rounded-full border backdrop-blur-md shadow-lg
                        ${isMajor 
                            ? 'bg-black/40 border-white/20' 
                            : 'bg-black/30 border-white/10 scale-90'}
                    `}>
                        {isStation && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse shadow-[0_0_5px_#DFFF00]" />
                        )}
                        <span className={`
                            font-mono uppercase tracking-widest whitespace-nowrap text-white leading-none
                            ${isMajor ? 'text-[10px] md:text-xs font-bold' : 'text-[8px] md:text-[10px] text-zinc-300'}
                        `}>
                            {text}
                        </span>
                    </div>
                </div>
            </div>
        </Html>
    )
}

// --- SOLAR WIND ---
const SolarWindShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#DFFF00') }
    },
    vertexShader: `
      uniform float uTime;
      attribute float aLength;
      attribute float aOffset;
      attribute float aSpeed;
      varying float vAlpha;
      varying float vDist;
      
      void main() {
        vec3 pos = position;
        vec3 dir = normalize(pos);
        float dist = length(pos);
        float speed = aSpeed * 50.0; 
        float maxDist = 1200.0; 
        float minDist = 80.0;   
        float newDist = mod(dist + (uTime * speed) + aOffset, maxDist);
        if (newDist < minDist) newDist += maxDist - minDist;
        vec3 finalPos = dir * newDist;
        vDist = newDist;
        float alphaIn = smoothstep(minDist, minDist + 150.0, newDist);
        float alphaOut = 1.0 - smoothstep(maxDist - 300.0, maxDist, newDist);
        vAlpha = alphaIn * alphaOut;
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      varying float vDist;
      void main() {
        if (vAlpha < 0.01) discard;
        vec3 farColor = vec3(0.8, 0.9, 1.0);
        vec3 nearColor = uColor;
        vec3 finalColor = mix(nearColor, farColor, smoothstep(100.0, 1000.0, vDist));
        gl_FragColor = vec4(finalColor, vAlpha * 0.15); 
      }
    `
};

export function SolarWind() {
    const linesRef = useRef<THREE.LineSegments>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    
    const { geometry } = useMemo(() => {
        const count = 6000;
        const positions = [];
        const offsets = [];
        const speeds = [];
        const geometry = new THREE.BufferGeometry();
        
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
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 1));
        geometry.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speeds, 1));
        return { geometry };
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
const DustShader = {
    uniforms: {
        uColor: { value: new THREE.Color('#ffffff') },
        uCameraPos: { value: new THREE.Vector3() }
    },
    vertexShader: `
      uniform vec3 uCameraPos;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        float boxSize = 400.0;
        vec3 offset = mod(pos - uCameraPos, boxSize) - boxSize * 0.5;
        vec3 finalPos = uCameraPos + offset;
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = (1.5 / -mvPosition.z) * 100.0;
        float dist = length(offset);
        vAlpha = 1.0 - smoothstep(boxSize * 0.35, boxSize * 0.5, dist);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
        gl_FragColor = vec4(uColor, vAlpha * 0.4);
      }
    `
};

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

// --- ASTEROID BELT ---
export function AsteroidBelt() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 4000; 
    
    useLayoutEffect(() => {
        if(!meshRef.current) return;
        const tempObj = new THREE.Object3D();
        const color = new THREE.Color();
        for(let i=0; i<count; i++) {
           const angle = Math.random() * Math.PI * 2;
           const radius = 300 + Math.random() * 300; 
           const x = Math.cos(angle) * radius;
           const z = Math.sin(angle) * radius;
           const y = (Math.random() - 0.5) * 60; 
           tempObj.position.set(x, y, z);
           tempObj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
           const scale = Math.random() * 0.4 + 0.05; 
           tempObj.scale.set(scale, scale, scale);
           tempObj.updateMatrix();
           meshRef.current.setMatrixAt(i, tempObj.matrix);
           color.setHSL(0.08, 0.3, Math.random() * 0.5 + 0.4); 
           meshRef.current.setColorAt(i, color);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, []);
  
    useFrame(({ clock }) => {
       if(meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.003;
    });
  
    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
           <dodecahedronGeometry args={[1, 0]} /> 
           <meshStandardMaterial color="#FFFFFF" roughness={0.8} metalness={0.2} flatShading />
        </instancedMesh>
    )
}

// --- STAR BACKGROUND (UPDATED) ---
export function StarBackground() {
    const texture = useLoader(THREE.TextureLoader, '/textures/8k_stars.jpg') as THREE.Texture;
    return (
        <group>
            {/* The Infinite Background Sphere */}
            <mesh>
                <sphereGeometry args={[100000, 64, 64]} />
                <meshBasicMaterial map={texture} side={THREE.BackSide} color="#050505" />
            </mesh>
            {/* Volumetric Stars: Increased Range for Galactic Scale */}
            {/* Radius 100 ensures they don't clip inside the Sun */}
            {/* Depth 30000 ensures they extend past Sagittarius A* (15000) */}
            <Stars radius={100} depth={30000} count={12000} factor={4} saturation={0} fade speed={0.5} />
        </group>
    );
}

// --- BLACK HOLE ---
const AccretionDiskShader = {
    uniforms: {
        time: { value: 0 },
        colorInner: { value: new THREE.Color("#ffddaa") }, 
        colorMid: { value: new THREE.Color("#ff5500") },   
        colorOuter: { value: new THREE.Color("#330000") }, 
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        varying vec3 vViewPosition;
        void main() {
            vUv = uv;
            vPos = position;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 colorInner;
        uniform vec3 colorMid;
        uniform vec3 colorOuter;
        varying vec2 vUv;
        varying vec3 vPos;
        float random (in vec2 _st) { return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))* 43758.5453123); }
        float noise (in vec2 _st) {
            vec2 i = floor(_st);
            vec2 f = fract(_st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        void main() {
            vec2 center = vec2(0.5);
            vec2 toCenter = vUv - center;
            float r = length(toCenter) * 2.0; 
            float theta = atan(toCenter.y, toCenter.x);
            float doppler = 1.0 + 0.6 * sin(theta + 1.5); 
            float speed = 2.0 / (r + 0.1); 
            float noiseVal = noise(vec2(r * 10.0 - time * 0.5, theta * 4.0 + time * speed));
            vec3 baseColor = mix(colorMid, colorOuter, smoothstep(0.4, 1.0, r));
            baseColor = mix(colorInner, baseColor, smoothstep(0.2, 0.4, r));
            float alpha = smoothstep(0.32, 0.35, r) * smoothstep(1.0, 0.8, r);
            vec3 finalColor = baseColor * (0.8 + 1.2 * noiseVal); 
            finalColor *= doppler; 
            gl_FragColor = vec4(finalColor * 3.0, alpha * 0.95);
        }
    `
};

function BlackHole({ data, onClick }: any) {
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
const SunSurfaceShader = {
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

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857; 
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vec3 pos = normalize(vPos);
      float n1 = snoise(pos * 6.0 + uTime * 0.2);
      float n2 = snoise(pos * 12.0 - uTime * 0.4);
      float n3 = snoise(pos * 24.0 + uTime * 0.5);
      float noiseSum = n1 * 0.5 + n2 * 0.3 + n3 * 0.2; 
      vec3 baseColor = mix(uColorB, uColorA, noiseSum * 0.5 + 0.5);
      float hot = smoothstep(0.3, 0.8, noiseSum);
      vec3 finalColor = mix(baseColor, uColorC, hot);
      float viewAngle = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)); 
      finalColor *= 0.8 + 0.5 * pow(viewAngle, 2.0); 
      gl_FragColor = vec4(finalColor * 2.0, 1.0);
    }
  `
};

const SunAtmosphereShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ffaa00') }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        uniform float uTime;
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v){ const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0); vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx); vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy); vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i); vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0)); float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_); vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw); vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0; vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww; vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w); vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0); m = m * m; return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))); }

        void main() {
            float noise = snoise(vPos * 0.04 - uTime * 0.1);
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            float alpha = smoothstep(0.2, 0.6, noise) * fresnel;
            vec3 color = mix(uColor, vec3(1.0, 0.8, 0.4), noise);
            if (alpha < 0.05) discard;
            gl_FragColor = vec4(color, alpha * 0.25);
        }
    `
};

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
             // PULSE EFFECT
             const scale = 1.15 + Math.sin(elapsed * 2.0) * 0.02; 
             coronaRef.current.scale.set(scale, scale, scale);
        }
        if (glowRef.current) {
            const scale = 90 + Math.sin(elapsed * 0.5) * 5; // Reduced scale from 120 -> 90
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
            <mesh ref={coronaRef} scale={[1.15, 1.15, 1.15]} raycast={() => null}>
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

function PlanetClouds({ textureUrl, radius }: { textureUrl: string, radius: number }) {
    const cloudsRef = useRef<THREE.Mesh>(null);
    const cloudMap = useLoader(THREE.TextureLoader, textureUrl) as THREE.Texture;
    const { speedRef } = useSimulation();
    useFrame((state, delta) => {
        if (cloudsRef.current && speedRef.current < 1000) cloudsRef.current.rotation.y += (delta * 0.05); 
    });
    return (
        <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]} raycast={() => null}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial map={cloudMap} transparent opacity={0.8} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
}

function SaturnRings({ innerRadius, outerRadius }: { innerRadius: number, outerRadius: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 8000; 

    useLayoutEffect(() => {
        if (!meshRef.current) return;
        const tempObj = new THREE.Object3D();
        const color = new THREE.Color();
        const colors = ['#D4BC8C', '#8B7D6E', '#AFAFAF', '#5A5A5A']; 

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            let r = 0;
            const seed = Math.random();
            const ringB_Width = 5.5; 
            const ringA_Width = 4.5;
            if (seed > 0.4) {
                 r = innerRadius + Math.random() * ringB_Width;
            } else {
                 r = (innerRadius + ringB_Width + 2.0) + Math.random() * ringA_Width;
            }
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            const y = (Math.random() - 0.5) * 0.2; 
            tempObj.position.set(x, y, z);
            tempObj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            const scaleBase = r < 18 ? 0.12 : 0.08;
            const s = Math.random() * scaleBase + 0.02;
            tempObj.scale.set(s, s, s);
            tempObj.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObj.matrix);
            const colIndex = Math.floor(Math.random() * colors.length);
            color.set(colors[colIndex]);
            if (r < 18) {
                color.offsetHSL(0, 0.05, 0); 
            } else {
                color.offsetHSL(0, -0.05, -0.1);
            }
            color.multiplyScalar(0.8 + Math.random() * 0.4);
            meshRef.current.setColorAt(i, color);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [innerRadius, outerRadius]);

    useFrame(({ clock }) => {
        if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.005;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} rotation={[0,0,0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial roughness={0.8} metalness={0.2} />
        </instancedMesh>
    );
}

export function Planet({ data, isSelected, onClick, onSelectRef, isCinematic, showOrbits, showLabels, scalePosition, isScaleAlignment }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { timeRef } = useSimulation();

    useEffect(() => {
        if(groupRef.current) onSelectRef(data.id, groupRef.current);
    }, [data.id, onSelectRef]);
    
    if (data.type === 'Black Hole') {
        return (
             <group ref={groupRef} position={isScaleAlignment && scalePosition ? [scalePosition.x, scalePosition.y, scalePosition.z] : [data.distance, 1000, 0]}> 
                <group rotation={[THREE.MathUtils.degToRad(60), THREE.MathUtils.degToRad(30), 0]}>
                    <BlackHole data={data} onClick={onClick} />
                </group>
                <SmartLabel 
                    text={data.name} 
                    type={data.type} 
                    position={[0, data.radius * 4, 0]} 
                    visible={!isSelected && !isCinematic && showLabels} 
                />
             </group>
        );
    }

    const isStation = data.type === 'Station';
    const colorMap = !isStation ? useLoader(THREE.TextureLoader, data.textureUrl) as THREE.Texture : null;
    const useTextureRing = data.ringTextureUrl && data.id !== 'saturn';
    const ringMap = useTextureRing ? useLoader(THREE.TextureLoader, data.ringTextureUrl) as THREE.Texture : null;
    const tiltRadians = THREE.MathUtils.degToRad(data.axialTilt || 0);
    const n = 360 / data.orbitalPeriod; 
    const L0 = data.meanLongitude; 

    useFrame((state, delta) => {
        // SCALE ALIGNMENT OVERRIDE
        if (isScaleAlignment && scalePosition && groupRef.current) {
            groupRef.current.position.lerp(scalePosition, 0.05); // Smooth fly-in
            
            // Nice Rotation Override
            if (meshRef.current) {
                meshRef.current.rotation.y += delta * 0.1; // Consistent smooth spin
            }
            return;
        }

        const daysSinceJ2000 = (timeRef.current - J2000_EPOCH) / MILLISECONDS_PER_DAY;
        if (groupRef.current && data.distance > 0) {
            const currentAngleDeg = L0 + (n * daysSinceJ2000);
            const currentAngleRad = THREE.MathUtils.degToRad(currentAngleDeg);
            groupRef.current.position.x = Math.cos(currentAngleRad) * data.distance;
            groupRef.current.position.z = Math.sin(currentAngleRad) * data.distance;
        }
        if (meshRef.current && data.rotationPeriod !== 0) {
            const hoursSinceJ2000 = daysSinceJ2000 * 24;
            meshRef.current.rotation.y = (hoursSinceJ2000 / data.rotationPeriod) * (Math.PI * 2);
        }
    });

    return (
        <group>
            {/* PLANET ORBIT */}
            {!isCinematic && showOrbits && !isScaleAlignment && (
                <OrbitRing radius={data.distance} type="planet" />
            )}
            
            <group ref={groupRef}>
                <group rotation={[0, 0, tiltRadians]}>
                    <PlanetBody data={data} meshRef={meshRef} colorMap={colorMap} onClick={onClick} />
                    {data.id === 'saturn' && <group><SaturnRings innerRadius={13} outerRadius={25} /></group>}
                    {useTextureRing && ringMap && (
                        <mesh rotation={[-Math.PI/2, 0, 0]}>
                            <ringGeometry args={[data.radius * 1.4, data.radius * 2.5, 128]} />
                            <meshStandardMaterial map={ringMap} transparent side={THREE.DoubleSide} opacity={0.9} depthWrite={false} />
                        </mesh>
                    )}
                </group>

                {isSelected && (
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[data.radius * 1.8, data.radius * 2.0, 64]} />
                        <meshBasicMaterial color="#DFFF00" transparent opacity={0.5} side={THREE.DoubleSide} />
                    </mesh>
                )}
                
                <SmartLabel 
                    text={data.name} 
                    type={data.type} 
                    position={[0, data.radius, 0]} 
                    offset={data.radius > 2 ? 3 : 1.5}
                    visible={!isSelected && !isCinematic && showLabels} 
                />

                {data.moons && data.moons.map((moon: any, idx: number) => (
                    <React.Fragment key={idx}>
                        {/* MOON ORBIT (Relative to Planet) */}
                        {!isCinematic && showOrbits && !isScaleAlignment && (
                            <OrbitRing radius={data.radius + moon.distance} type="moon" />
                        )}
                        <Moon 
                            data={moon} 
                            parentRadius={data.radius} 
                            onSelectRef={onSelectRef} 
                            onClick={() => onClick(moon.id)} 
                            showLabels={showLabels}
                            isCinematic={isCinematic}
                        />
                    </React.Fragment>
                ))}
            </group>
        </group>
    );
}

function PlanetBody({ data, meshRef, colorMap, onClick }: any) {
    const [hovered, setHover] = useState(false);

    if (data.id === 'kuva') {
        return (
            <group 
                ref={meshRef} 
                onClick={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
            >
                <mesh>
                    <dodecahedronGeometry args={[data.radius, 0]} />
                    <meshStandardMaterial color="#880000" roughness={0.9} metalness={0.5} />
                </mesh>
                <mesh rotation={[Math.PI/4, 0, 0]}><torusGeometry args={[data.radius * 1.5, 0.1, 8, 32]} /><meshStandardMaterial color="#550000" /></mesh>
                <mesh rotation={[-Math.PI/4, 0, 0]}><torusGeometry args={[data.radius * 1.8, 0.1, 8, 32]} /><meshStandardMaterial color="#330000" /></mesh>
                <pointLight distance={5} intensity={5} color="red" />
                {hovered && (
                     <mesh scale={[1.02, 1.02, 1.02]} raycast={() => null}>
                        <dodecahedronGeometry args={[data.radius, 0]} />
                        <meshBasicMaterial color="#DFFF00" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
                    </mesh>
                )}
            </group>
        )
    }
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
                <meshStandardMaterial map={colorMap} roughness={0.7} metalness={0.1} color={!colorMap ? data.color : undefined} />
            </mesh>
            {data.cloudTextureUrl && <PlanetClouds textureUrl={data.cloudTextureUrl} radius={data.radius} />}
            {data.atmosphere && !data.cloudTextureUrl && (
                <mesh scale={[1.01, 1.01, 1.01]} raycast={() => null}>
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
            )}
             {hovered && (
                 <mesh scale={[1.015, 1.015, 1.015]} raycast={() => null}>
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshBasicMaterial color="#DFFF00" transparent opacity={0.2} side={THREE.BackSide} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}

function Moon({ data, parentRadius, onSelectRef, onClick, showLabels, isCinematic }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const isStation = data.type === 'Station';
    const texture = !isStation ? useLoader(THREE.TextureLoader, data.textureUrl) as THREE.Texture : null;
    const { timeRef } = useSimulation();
    const [hovered, setHover] = useState(false);
    
    const n = 360 / data.orbitalPeriod; 
    const L0 = data.meanLongitude || 0; 

    useFrame(() => {
        const daysSinceJ2000 = (timeRef.current - J2000_EPOCH) / MILLISECONDS_PER_DAY;
        if (groupRef.current) {
            const currentAngleDeg = L0 + (n * daysSinceJ2000);
            const currentAngleRad = THREE.MathUtils.degToRad(currentAngleDeg);
            const r = parentRadius + data.distance;
            groupRef.current.position.x = Math.cos(currentAngleRad) * r;
            groupRef.current.position.z = Math.sin(currentAngleRad) * r;
            
            if (data.id === 'iss') groupRef.current.lookAt(0, 0, 0); 
            else if (data.rotationPeriod && meshRef.current) {
                const hoursSinceJ2000 = daysSinceJ2000 * 24;
                meshRef.current.rotation.y = (hoursSinceJ2000 / data.rotationPeriod) * (Math.PI * 2);
            }
        }
    });
    useEffect(() => {
        if(groupRef.current) onSelectRef(data.id, groupRef.current);
    }, [data.id, onSelectRef]);
    
    if (isStation) {
         return (
             <group ref={groupRef}>
                 <group 
                    ref={meshRef as any} 
                    onClick={(e) => e.stopPropagation()} 
                    onDoubleClick={(e) => { e.stopPropagation(); onClick(); }}
                    onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
                 >
                    <group>
                        <mesh>
                            <sphereGeometry args={[data.radius, 64, 64]} />
                            <meshStandardMaterial color={data.color} metalness={0.9} roughness={0.3} />
                        </mesh>
                        <mesh rotation={[Math.PI/2, 0, 0]}>
                            <torusGeometry args={[data.radius, data.radius * 0.05, 32, 128]} />
                            <meshStandardMaterial color="#111111" />
                        </mesh>
                        <mesh position={[data.radius * 0.7, data.radius * 0.5, 0]} rotation={[0, 0, -Math.PI/4]}>
                             <cylinderGeometry args={[data.radius * 0.25, data.radius * 0.25, data.radius * 0.05, 64]} />
                             <meshStandardMaterial color="#222222" />
                        </mesh>
                        <pointLight distance={data.radius * 4} intensity={2} color={data.color} />
                    </group>
                    {hovered && (
                         <mesh scale={[1.05, 1.05, 1.05]} raycast={() => null}>
                            <sphereGeometry args={[data.radius, 32, 32]} />
                            <meshBasicMaterial color="#DFFF00" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
                        </mesh>
                    )}
                </group>
                <SmartLabel 
                    text={data.name} 
                    type={data.type} 
                    position={[0, data.radius, 0]} 
                    offset={data.radius + 0.1} 
                    visible={!isCinematic && showLabels} 
                />
            </group>
        );
    }

    return (
        <group ref={groupRef}>
            <mesh 
                ref={meshRef}
                onClick={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
            >
                <sphereGeometry args={[data.radius, 64, 64]} />
                <meshStandardMaterial map={texture} color={data.color} />
            </mesh>
            {hovered && (
                 <mesh 
                    rotation={meshRef.current?.rotation} 
                    scale={[1.02, 1.02, 1.02]} 
                    raycast={() => null}
                 >
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshBasicMaterial color="#DFFF00" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
                </mesh>
            )}
             <SmartLabel 
                text={data.name} 
                type={data.type} 
                position={[0, data.radius, 0]} 
                offset={data.radius + 0.5} 
                visible={!isCinematic && showLabels} 
            />
        </group>
    );
}