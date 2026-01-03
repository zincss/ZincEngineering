'use client';

import React, { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Html, CameraControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation, J2000_EPOCH, MILLISECONDS_PER_DAY, getBodyPosition, findBodyById } from '../context';

// --- SOLAR WIND (Soft Wind Tunnel Effect) ---
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
        
        // Smoother, variable speed flow
        float speed = aSpeed * 50.0; 
        float maxDist = 1200.0; 
        float minDist = 80.0;   
        
        // Cycle the distance
        float newDist = mod(dist + (uTime * speed) + aOffset, maxDist);
        if (newDist < minDist) newDist += maxDist - minDist;
        
        vec3 finalPos = dir * newDist;
        vDist = newDist;

        // Soft fade in/out curves
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
        
        // Distance-based color shift (Gold near sun -> Blue/White far away)
        vec3 farColor = vec3(0.8, 0.9, 1.0);
        vec3 nearColor = uColor;
        vec3 finalColor = mix(nearColor, farColor, smoothstep(100.0, 1000.0, vDist));

        // Much softer opacity for "wind" look
        gl_FragColor = vec4(finalColor, vAlpha * 0.15); 
      }
    `
};

export function SolarWind() {
    const linesRef = useRef<THREE.LineSegments>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    
    // Increased count for denser, smoother flow
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
            // Longer lines for "tunnel" streak effect
            const len = 40 + Math.random() * 100; 
            
            const p1 = dir.clone().multiplyScalar(dist);
            const p2 = dir.clone().multiplyScalar(dist + len);
            
            positions.push(p1.x, p1.y, p1.z);
            positions.push(p2.x, p2.y, p2.z);
            
            const offset = Math.random() * 1000;
            offsets.push(offset, offset);
            
            const speed = 1.0 + Math.random() * 2.0;
            speeds.push(speed, speed);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 1));
        geometry.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speeds, 1));
        
        return { geometry };
    }, []);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <lineSegments ref={linesRef} geometry={geometry}>
            <shaderMaterial 
                ref={materialRef} 
                args={[SolarWindShader]} 
                transparent 
                depthWrite={false} 
                blending={THREE.AdditiveBlending} 
            />
        </lineSegments>
    );
}

// --- SPACE DUST (Infinite Particle Field for Motion) ---
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
        
        // Wrap logic: Modulo based on camera position creates infinite field
        float boxSize = 400.0; // Size of the particle box
        vec3 offset = mod(pos - uCameraPos, boxSize) - boxSize * 0.5;
        vec3 finalPos = uCameraPos + offset;
        
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size attenuation
        gl_PointSize = (1.5 / -mvPosition.z) * 100.0;
        
        // Fade out at edges of box to prevent popping
        float dist = length(offset);
        vAlpha = 1.0 - smoothstep(boxSize * 0.35, boxSize * 0.5, dist);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        // Circular particle
        if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
        gl_FragColor = vec4(uColor, vAlpha * 0.4);
      }
    `
};

export function SpaceDust() {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { camera } = useThree();
    
    // Generate 3000 random static positions in a box
    const particles = useMemo(() => {
        const count = 3000;
        const data = new Float32Array(count * 3);
        const boxSize = 400;
        for(let i=0; i<count*3; i++) {
            data[i] = (Math.random() - 0.5) * boxSize; 
        }
        return data;
    }, []);

    useFrame(() => {
        if (materialRef.current) {
            // Pass current camera position to shader to handle wrapping
            materialRef.current.uniforms.uCameraPos.value.copy(camera.position);
        }
    });

    return (
        <points ref={pointsRef} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
            </bufferGeometry>
            <shaderMaterial 
                ref={materialRef} 
                args={[DustShader]} 
                transparent 
                depthWrite={false} 
                blending={THREE.AdditiveBlending} 
            />
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
           // Random placement in a ring between Mars (230) and Jupiter (780)
           const angle = Math.random() * Math.PI * 2;
           const radius = 300 + Math.random() * 300; // Wider belt
           
           const x = Math.cos(angle) * radius;
           const z = Math.sin(angle) * radius;
           // Slight vertical spread
           const y = (Math.random() - 0.5) * 60; 
           
           tempObj.position.set(x, y, z);
           
           // Random Rotation
           tempObj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
           
           // Random Scale - Small but visible
           const scale = Math.random() * 0.4 + 0.05; 
           tempObj.scale.set(scale, scale, scale);
           
           tempObj.updateMatrix();
           meshRef.current.setMatrixAt(i, tempObj.matrix);
           
           // BRIGHTER COLOR LOGIC (Updated)
           // HSL: Lightness between 0.4 and 0.9 for much better visibility
           color.setHSL(0.08, 0.3, Math.random() * 0.5 + 0.4); 
           meshRef.current.setColorAt(i, color);
        }
        
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, []);
  
    useFrame(({ clock }) => {
       if(meshRef.current) {
           // Rotate the entire belt slowly
           meshRef.current.rotation.y = clock.getElapsedTime() * 0.003;
       }
    });
  
    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
           <dodecahedronGeometry args={[1, 0]} /> {/* Low poly rock shape */}
           {/* Pure White base color for maximum brightness potential */}
           <meshStandardMaterial color="#FFFFFF" roughness={0.8} metalness={0.2} flatShading />
        </instancedMesh>
    )
}

// --- STAR BACKGROUND (TEXTURE + PARTICLES) ---
export function StarBackground() {
    const texture = useLoader(THREE.TextureLoader, '/textures/8k_stars.jpg') as THREE.Texture;
    
    return (
        <group>
            {/* 1. The Deep Field Texture (Base Layer) */}
            <mesh>
                <sphereGeometry args={[100000, 64, 64]} />
                <meshBasicMaterial map={texture} side={THREE.BackSide} color="#050505" />
            </mesh>

            {/* 2. Subtle 3D Depth Stars */}
            <Stars 
                radius={300} 
                depth={500}  
                count={2000} 
                factor={4}   
                saturation={0} 
                fade 
                speed={0.5} 
            />
        </group>
    );
}

// --- BLACK HOLE SHADER MATERIAL ---
const AccretionDiskShader = {
    uniforms: {
        time: { value: 0 },
        colorInner: { value: new THREE.Color("#ffaa00") },
        colorOuter: { value: new THREE.Color("#cc4400") },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
            vUv = uv;
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 colorInner;
        uniform vec3 colorOuter;
        varying vec2 vUv;
        varying vec3 vPos;

        // Simple noise function
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
            // Polar coordinates for the disk
            vec2 center = vec2(0.5);
            vec2 toCenter = vUv - center;
            float dist = length(toCenter) * 2.0; // 0 at center, 1 at edge
            float angle = atan(toCenter.y, toCenter.x);

            // Create swirl effect
            float swirl = noise(vec2(dist * 10.0 - time * 2.0, angle * 4.0 + time));
            
            // Soft inner and outer edges
            float alpha = smoothstep(0.3, 0.45, dist) * smoothstep(0.9, 0.5, dist);
            
            // Color gradient
            vec3 finalColor = mix(colorInner, colorOuter, dist);
            
            // Add noise detail/swirl brightness
            finalColor += swirl * 0.4;
            
            // Boost brightness for HDR bloom
            gl_FragColor = vec4(finalColor * 2.5, alpha * 0.9);
        }
    `
};

function BlackHole({ data, onClick }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const diskRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [hovered, setHover] = useState(false);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (diskRef.current) diskRef.current.rotation.z = t * 0.1;
        if (materialRef.current) materialRef.current.uniforms.time.value = t;
    });

    return (
        <group>
            {/* The actual clickable sphere - Hit area restricted to event body */}
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
            {/* Decoration (Non-clickable) */}
            <mesh ref={diskRef} rotation={[Math.PI/2, 0, 0]} raycast={() => null}>
                <ringGeometry args={[data.radius * 1.5, data.radius * 4, 128]} />
                <shaderMaterial 
                    ref={materialRef} 
                    args={[AccretionDiskShader]} 
                    side={THREE.DoubleSide} 
                    transparent 
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Tighter Outline Highlight */}
            {hovered && (
                 <mesh scale={[1.05, 1.05, 1.05]} raycast={() => null}>
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshBasicMaterial color="#DFFF00" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}

// --- NEW EPIC SUN SHADERS ---

// 1. Turbulent Surface
const SunSurfaceShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#ffaa00') }, // Bright Orange
    uColorB: { value: new THREE.Color('#ff3300') }, // Deep Red
    uColorC: { value: new THREE.Color('#ffddaa') }, // Hot White
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

    // Simplex Noise 3D
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
      
      // Multi-layered noise for turbulence
      float n1 = snoise(pos * 6.0 + uTime * 0.2);
      float n2 = snoise(pos * 12.0 - uTime * 0.4);
      float n3 = snoise(pos * 24.0 + uTime * 0.5);
      
      float noiseSum = n1 * 0.5 + n2 * 0.3 + n3 * 0.2; // Range ~[-1, 1]
      
      // Remap noise to colors
      // Base: Red/Orange mix
      vec3 baseColor = mix(uColorB, uColorA, noiseSum * 0.5 + 0.5);
      
      // Hot spots (white/yellow) where noise is high
      float hot = smoothstep(0.3, 0.8, noiseSum);
      vec3 finalColor = mix(baseColor, uColorC, hot);
      
      // Edge darkening (Fresnel approximation) to give volume
      float viewAngle = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)); // Approximate view dir for simplicity
      // In 3D engine usually pass camera position, but standard normal works for sphere glow feel
      finalColor *= 0.8 + 0.5 * pow(viewAngle, 2.0); 

      // Super bright emissive boost
      gl_FragColor = vec4(finalColor * 2.0, 1.0);
    }
  `
};

// 2. Animated Atmosphere / Corona Shader (UPDATED for subtlety)
const SunAtmosphereShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ffaa00') }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        uniform float uTime;
        
        // Simplex Noise (Vertex optimized)
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v){
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
            vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 0.142857142857; vec3  ns = n_ * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_ ); vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw); vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0; vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww; vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w); vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0); m = m * m; return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))); }

        void main() {
            vNormal = normal;
            vPos = position;
            
            // Reduced displacement speed and magnitude for "Minimal" effect
            float noise = snoise(position * 0.05 + uTime * 0.2); // Larger, slower noise
            vec3 newPos = position + normal * (noise * 0.5); // Minimal displacement
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vPos;
        
        // Include same noise function for fragment
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v){ const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0); vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx); vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy); vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i); vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0)); float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_); vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw); vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0; vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww; vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w); vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0); m = m * m; return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))); }

        void main() {
            // Noise based transparency: Larger scale (0.04) and slower speed (0.1)
            float noise = snoise(vPos * 0.04 - uTime * 0.1);
            
            // Fresnel for edge intensity
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            
            float alpha = smoothstep(0.2, 0.6, noise) * fresnel;
            
            vec3 color = mix(uColor, vec3(1.0, 0.8, 0.4), noise);
            
            if (alpha < 0.05) discard;
            
            // Reduced alpha multiplier (0.25) for "Not so bright"
            gl_FragColor = vec4(color, alpha * 0.25);
        }
    `
};

export function Sun({ onClick }: { onClick: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const coronaRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Sprite>(null);
    
    // Shader Refs
    const surfaceMat = useRef<THREE.ShaderMaterial>(null);
    const coronaMat = useRef<THREE.ShaderMaterial>(null);
    
    const [hovered, setHover] = useState(false);

    useFrame(({ clock }) => {
        const elapsed = clock.getElapsedTime();
        
        // Pass time to shaders
        if (surfaceMat.current) surfaceMat.current.uniforms.uTime.value = elapsed;
        if (coronaMat.current) coronaMat.current.uniforms.uTime.value = elapsed;

        if (meshRef.current) meshRef.current.rotation.y = elapsed * 0.005; // Slow rotation of surface sphere
        if (coronaRef.current) {
             coronaRef.current.rotation.y = -elapsed * 0.01; // Corona swirls opposite way
             coronaRef.current.rotation.z = elapsed * 0.005; 
        }

        // Pulse the distant glow sprite
        if (glowRef.current) {
            const scale = 130 + Math.sin(elapsed * 0.5) * 10;
            glowRef.current.scale.set(scale, scale, 1);
        }
    });

    const glowTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, 'rgba(255, 200, 100, 1)'); 
            gradient.addColorStop(0.2, 'rgba(255, 140, 0, 0.8)'); 
            gradient.addColorStop(0.5, 'rgba(200, 50, 0, 0.2)'); 
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); 
            context.fillStyle = gradient;
            context.fillRect(0, 0, 128, 128);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
             {/* 1. Main Sun Surface (Turbulent Shader) */}
            <mesh 
                ref={meshRef}
                onClick={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
            >
                <sphereGeometry args={[25, 128, 128]} /> 
                <shaderMaterial 
                    ref={surfaceMat} 
                    args={[SunSurfaceShader]} 
                />
            </mesh>

            {/* 2. Corona / Atmosphere (Animated Transparency Shader) */}
            <mesh ref={coronaRef} scale={[1.15, 1.15, 1.15]} raycast={() => null}>
                <sphereGeometry args={[25, 64, 64]} />
                <shaderMaterial 
                    ref={coronaMat}
                    args={[SunAtmosphereShader]}
                    transparent
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* 3. Distant Glow Sprite (Bloom) */}
            <sprite ref={glowRef} scale={[120, 120, 1]} raycast={() => null}>
                <spriteMaterial map={glowTexture} color="#ffaa00" blending={THREE.AdditiveBlending} depthWrite={false} />
            </sprite>
            
            {/* 4. Light Source */}
            <pointLight intensity={3} decay={0} distance={0} color="#fff8e7" />
            
            {/* 5. Selection Outline */}
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
    // Clouds set to not raycast so clicks fall through to the planet body
    return (
        <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]} raycast={() => null}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial map={cloudMap} transparent opacity={0.8} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
}

// Updated Planet Component with Show/Hide props
export function Planet({ data, isSelected, onClick, onSelectRef, isCinematic, showOrbits, showLabels }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { timeRef } = useSimulation();

    // REGISTER REF: Must be done before any early returns!
    useEffect(() => {
        if(groupRef.current) onSelectRef(data.id, groupRef.current);
    }, [data.id, onSelectRef]);
    
    // --- BLACK HOLE RENDERER ---
    if (data.type === 'Black Hole') {
        return (
             <group ref={groupRef} position={[data.distance, 1000, 0]}> 
                <group rotation={[THREE.MathUtils.degToRad(60), THREE.MathUtils.degToRad(30), 0]}>
                    <BlackHole data={data} onClick={onClick} />
                </group>
                {!isSelected && !isCinematic && showLabels && (
                    <Html position={[0, data.radius * 4, 0]} distanceFactor={10000}>
                        <div className="text-white text-xs font-mono opacity-50 tracking-widest uppercase bg-black/40 px-2 rounded backdrop-blur-sm pointer-events-none whitespace-nowrap">
                            {data.name}
                        </div>
                    </Html>
                )}
             </group>
        );
    }

    const isStation = data.type === 'Station';
    const colorMap = !isStation ? useLoader(THREE.TextureLoader, data.textureUrl) as THREE.Texture : null;
    const ringMap = data.ringTextureUrl ? useLoader(THREE.TextureLoader, data.ringTextureUrl) as THREE.Texture : null;

    const tiltRadians = THREE.MathUtils.degToRad(data.axialTilt || 0);
    const n = 360 / data.orbitalPeriod; 
    const L0 = data.meanLongitude; 

    useFrame(() => {
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
            {/* ORBIT RINGS (Togglable) */}
            {!isCinematic && showOrbits && (
                <mesh rotation={[-Math.PI/2, 0, 0]}>
                    <ringGeometry args={[data.distance - 0.2, data.distance + 0.2, 256]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={THREE.DoubleSide} />
                </mesh>
            )}
            <group ref={groupRef}>
                <group rotation={[0, 0, tiltRadians]}>
                    <PlanetBody data={data} meshRef={meshRef} colorMap={colorMap} onClick={onClick} />
                    {data.ringTextureUrl && ringMap && (
                        <mesh rotation={[-Math.PI/2, 0, 0]}>
                            <ringGeometry args={[data.radius * 1.4, data.radius * 2.5, 128]} />
                            {/* FIX: depthWrite={false} prevents transparent rings from fighting with planet depth */}
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
                {/* LABELS (Togglable) */}
                {!isSelected && !isCinematic && showLabels && (
                    <Html position={[0, data.radius + 2, 0]} distanceFactor={150}>
                        <div className="text-white text-xs font-mono opacity-50 tracking-widest uppercase bg-black/40 px-2 rounded backdrop-blur-sm pointer-events-none whitespace-nowrap">
                            {data.name}
                        </div>
                    </Html>
                )}
                
                {/* MOONS & STATIONS */}
                {data.moons && data.moons.map((moon: any, idx: number) => (
                    <React.Fragment key={idx}>
                        {/* Cinematic Orbit Ring for Moons/Stations - Respects Toggle & Cinematic Mode */}
                        {!isCinematic && showOrbits && (
                            <mesh rotation={[-Math.PI/2, 0, 0]}>
                                <ringGeometry args={[data.radius + moon.distance - 0.05, data.radius + moon.distance + 0.05, 128]} />
                                <meshBasicMaterial color="#ffffff" opacity={0.08} transparent side={THREE.DoubleSide} depthWrite={false} />
                            </mesh>
                        )}
                        <Moon data={moon} parentRadius={data.radius} onSelectRef={onSelectRef} onClick={() => onClick(moon.id)} />
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
                
                 {/* Outline Highlight for Kuva */}
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
            {/* Interaction events moved to the specific mesh to tighten hitbox */}
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
            
            {/* Clouds (non-interactive) */}
            {data.cloudTextureUrl && <PlanetClouds textureUrl={data.cloudTextureUrl} radius={data.radius} />}
            {data.atmosphere && !data.cloudTextureUrl && (
                <mesh scale={[1.01, 1.01, 1.01]} raycast={() => null}>
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
            )}

             {/* Tighter, thinner Outline Highlight */}
             {hovered && (
                 <mesh scale={[1.015, 1.015, 1.015]} raycast={() => null}>
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshBasicMaterial color="#DFFF00" transparent opacity={0.2} side={THREE.BackSide} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}

function Moon({ data, parentRadius, onSelectRef, onClick }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const isStation = data.type === 'Station';
    const texture = !isStation ? useLoader(THREE.TextureLoader, data.textureUrl) as THREE.Texture : null;
    const { timeRef } = useSimulation();
    const [hovered, setHover] = useState(false);
    
    const n = 360 / data.orbitalPeriod; 
    const L0 = data.meanLongitude || 0; 

    useFrame(() => {
        const daysSinceJ2000 = (timeRef.current - J2000_EPOCH) / MILLISECONDS_PER_DAY;
        if (meshRef.current) {
            const currentAngleDeg = L0 + (n * daysSinceJ2000);
            const currentAngleRad = THREE.MathUtils.degToRad(currentAngleDeg);
            const r = parentRadius + data.distance;
            meshRef.current.position.x = Math.cos(currentAngleRad) * r;
            meshRef.current.position.z = Math.sin(currentAngleRad) * r;
            if (data.id === 'iss') meshRef.current.lookAt(0, 0, 0); 
            else if (data.rotationPeriod) {
                const hoursSinceJ2000 = daysSinceJ2000 * 24;
                meshRef.current.rotation.y = (hoursSinceJ2000 / data.rotationPeriod) * (Math.PI * 2);
            }
        }
    });
    useEffect(() => {
        if(meshRef.current) onSelectRef(data.id, meshRef.current);
    }, [data.id, onSelectRef]);
    
    if (isStation) {
         return (
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
                {/* Highlight for Station */}
                {hovered && (
                     <mesh scale={[1.05, 1.05, 1.05]} raycast={() => null}>
                        <sphereGeometry args={[data.radius, 32, 32]} />
                        <meshBasicMaterial color="#DFFF00" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
                    </mesh>
                )}
            </group>
        );
    }

    return (
        <group>
            {/* Clickable Moon Body */}
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
            {/* Tighter Outline for Moons */}
            {hovered && (
                 <mesh 
                    position={meshRef.current?.position} 
                    rotation={meshRef.current?.rotation} 
                    scale={[1.02, 1.02, 1.02]} 
                    raycast={() => null}
                 >
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshBasicMaterial color="#DFFF00" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}

// Updated SpaceRoute (No Changes Needed)
export function SpaceRoute({ originId, destinationId, isDriving, isPreviewing, setArrived }: any) {
    const { timeRef } = useSimulation();
    const [progress, setProgress] = useState(0);
    const [tripDuration, setTripDuration] = useState(15); 
    const carRef = useRef<THREE.Group>(null);
    const lineRef = useRef<any>(null);
    const materialRef = useRef<THREE.LineDashedMaterial>(null);
    const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
    const currentPos = useRef(new THREE.Vector3());
    const currentLookAt = useRef(new THREE.Vector3());

    useEffect(() => {
        if (originId && destinationId) {
            const p1 = getBodyPosition(originId, timeRef.current);
            const p2 = getBodyPosition(destinationId, timeRef.current);
            const dist = p1.distanceTo(p2);
            const duration = Math.max(15, Math.min(120, dist / 50));
            setTripDuration(duration);
        }
    }, [originId, destinationId]);

    useFrame((state, delta) => {
        if (!originId || !destinationId) return;
        const originPos = getBodyPosition(originId, timeRef.current);
        const destPos = getBodyPosition(destinationId, timeRef.current);
        const dist = originPos.distanceTo(destPos);
        const sunPos = new THREE.Vector3(0,0,0);
        const originToSun = new THREE.Vector3().subVectors(sunPos, originPos).normalize();
        const destToSun = new THREE.Vector3().subVectors(sunPos, destPos).normalize();
        const originL = originPos.clone().add(originToSun.multiplyScalar(20)).add(new THREE.Vector3(0, 15, 0));
        const destL = destPos.clone().add(destToSun.multiplyScalar(20)).add(new THREE.Vector3(0, 15, 0));
        const midPoint = new THREE.Vector3().lerpVectors(originL, destL, 0.5);
        midPoint.y += Math.min(dist * 0.3, 100); 

        const points = [originPos, originL, midPoint, destL, destPos];
        const curve = new THREE.CatmullRomCurve3(points);
        curveRef.current = curve;

        if (lineRef.current) {
            const geometry = lineRef.current.geometry;
            const pointsList = curve.getPoints(60);
            geometry.setFromPoints(pointsList);
            lineRef.current.computeLineDistances();
        }

        if (isPreviewing && materialRef.current) {
            (materialRef.current as any).dashOffset -= delta * 20;
        }

        if (isDriving) {
            const speed = 1 / tripDuration;
            const safeDelta = Math.min(delta, 0.1); 
            const newProg = progress + (safeDelta * speed);
            if (newProg >= 1) {
                setProgress(1);
                setArrived(true);
            } else {
                setProgress(newProg);
            }
            if (carRef.current) {
                const t = Math.min(1, Math.max(0, progress));
                const targetPos = curve.getPointAt(t);
                const lookAtPos = curve.getPointAt(Math.min(1, t + 0.01));
                currentPos.current.lerp(targetPos, safeDelta * 10); 
                carRef.current.position.copy(currentPos.current);
                currentLookAt.current.lerp(lookAtPos, safeDelta * 10);
                carRef.current.lookAt(currentLookAt.current);
                const relativeOffset = new THREE.Vector3(0, 5, -15);
                relativeOffset.applyQuaternion(carRef.current.quaternion);
                const desiredCamPos = carRef.current.position.clone().add(relativeOffset);
                state.camera.position.lerp(desiredCamPos, safeDelta * 3);
                state.camera.lookAt(carRef.current.position);
            }
        } else if (!isDriving) {
            setProgress(0);
            currentPos.current.copy(originPos);
        }
    });

    if (!originId || !destinationId || (!isDriving && !isPreviewing)) return null;

    return (
        <group>
            <line ref={lineRef}>
                <bufferGeometry />
                <lineDashedMaterial 
                    ref={materialRef}
                    color={isDriving ? "#00ffff" : "#DFFF00"} 
                    dashSize={2} 
                    gapSize={2}
                    scale={1}
                    linewidth={2}
                    opacity={isDriving ? 0.3 : 0.6}
                    transparent
                />
            </line>
            {isPreviewing && (
                 <mesh position={currentPos.current}>
                    <sphereGeometry args={[0.5]} />
                    <meshBasicMaterial color="#DFFF00" />
                 </mesh>
            )}
            {isDriving && (
                <group ref={carRef}>
                    <mesh rotation={[Math.PI/2, Math.PI, 0]}>
                        <coneGeometry args={[0.5, 2, 4]} />
                        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.9} emissive="#00ffff" emissiveIntensity={1} />
                    </mesh>
                    <pointLight position={[0, 0, -1]} distance={8} intensity={8} color="#00ffff" />
                </group>
            )}
        </group>
    )
}

// Updated SystemControls to allow free movement & Sag A focusing
export function SystemControls({ targetId, refs, isShuttleActive, previewTarget, isCinematic }: any) {
    const controlsRef = useRef<CameraControls>(null);
    const { timeRef } = useSimulation();
    
    // Track previous frame position for delta movement
    const prevTargetPos = useRef(new THREE.Vector3());
    const prevTargetId = useRef<string | null>(null);

    // 1. Initial Setup: Set position once, but don't lock it constantly
    useEffect(() => {
        if (controlsRef.current && !targetId && !isCinematic && !isShuttleActive) {
            // Default "Overview" position
            controlsRef.current.setLookAt(0, 600, 800, 0, 0, 0, true);
        }
    }, []); // Run only on mount

    // 2. Focus Logic
    useEffect(() => {
        if(!controlsRef.current) return;
        
        if (isShuttleActive || isCinematic) return;

        // Preview Route Focus
        if (previewTarget && previewTarget.origin && previewTarget.destination) {
            const destObj = refs.current[previewTarget.destination];
            if(destObj) {
                const p1 = getBodyPosition(previewTarget.origin, timeRef.current);
                const p2 = getBodyPosition(previewTarget.destination, timeRef.current);
                const dist = p1.distanceTo(p2);
                controlsRef.current.fitToBox(destObj, true, { paddingLeft: dist/3, paddingRight: dist/3, paddingTop: dist/3, paddingBottom: dist/3 });
            }
            return;
        }

        // Target Focus
        if (targetId) {
             // Handle Sun explicitly
            if (targetId === 'sun') {
                controlsRef.current.setLookAt(0, 100, 250, 0, 0, 0, true);
                return;
            }
            // Handle Sagittarius A explicitly (Far distance)
            if (targetId === 'sagittarius_a' && refs.current['sagittarius_a']) {
                 const bhGroup = refs.current['sagittarius_a'];
                 // Get world position of the group
                 const pos = new THREE.Vector3();
                 bhGroup.getWorldPosition(pos);
                 // Fly to it, keeping some distance
                 controlsRef.current.setLookAt(
                     pos.x + 150, pos.y + 50, pos.z + 150, // Eye
                     pos.x, pos.y, pos.z,                  // Target
                     true
                 );
                 return;
            }

            // Handle Planets/Stations
            if (refs.current[targetId]) {
                const targetObj = refs.current[targetId];
                const data = findBodyById(targetId) || { radius: 25 };
                // Calculate view distance
                // Allows extremely close up views for stations
                const viewDistance = data.radius < 1 ? data.radius * 6 : data.radius * 4; 
                controlsRef.current.fitToBox(targetObj, true, { paddingTop: viewDistance, paddingBottom: viewDistance, paddingLeft: viewDistance, paddingRight: viewDistance });
            }
        } 

    }, [targetId, refs, isShuttleActive, previewTarget, isCinematic]);

    // 3. Lock Logic (Only runs when we have a target)
    useFrame(() => {
        if (isShuttleActive || isCinematic || !targetId) {
            prevTargetId.current = null;
            return; // Don't lock if free roaming
        }
        
        if (targetId !== 'sun' && targetId !== 'sagittarius_a' && refs.current[targetId] && controlsRef.current && !previewTarget) {
            const targetObj = refs.current[targetId];
            const currentTargetPos = new THREE.Vector3();
            targetObj.getWorldPosition(currentTargetPos);

            // If we are locked on the same target as last frame, move camera by delta
            if (targetId === prevTargetId.current) {
                const delta = new THREE.Vector3().subVectors(currentTargetPos, prevTargetPos.current);
                // Only move if there is significant movement
                if (delta.lengthSq() > 0.000001) {
                    const currentCamPos = controlsRef.current.camera.position;
                    // Move the camera body by the same delta as the planet
                    controlsRef.current.setPosition(
                        currentCamPos.x + delta.x, 
                        currentCamPos.y + delta.y, 
                        currentCamPos.z + delta.z, 
                        false // No transition for instant lock
                    );
                    // Update the target point to the new planet position
                    controlsRef.current.setTarget(
                        currentTargetPos.x, 
                        currentTargetPos.y, 
                        currentTargetPos.z, 
                        false // No transition
                    );
                }
            } else {
                // Just acquired target, let the useEffect handle the initial jump
                // but we might want to ensure the target is set correctly in case we drifted
                controlsRef.current.setTarget(currentTargetPos.x, currentTargetPos.y, currentTargetPos.z, true);
            }

            // Update refs for next frame
            prevTargetPos.current.copy(currentTargetPos);
            prevTargetId.current = targetId;
        }
    });

    // Reduced minDistance to allow extreme close-ups on tiny stations
    return <CameraControls ref={controlsRef} maxDistance={50000} minDistance={0.001} smoothTime={1.2} enabled={!isShuttleActive && !isCinematic} />;
}