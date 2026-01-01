'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Stars, Html, CameraControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_DATA } from '../data';
import { useSimulation, J2000_EPOCH, MILLISECONDS_PER_DAY, getBodyPosition, findBodyById } from '../context';

// --- SHADERS ---
const SunShaderMaterial = {
  uniforms: {
    time: { value: 0 },
    color1: { value: new THREE.Color("#ffaa00") }, 
    color2: { value: new THREE.Color("#ff5500") }, 
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

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
        float n1 = noise(vUv * 20.0 + time * 0.2);
        float n2 = noise(vUv * 40.0 - time * 0.4);
        float n = mix(n1, n2, 0.5);
        vec3 finalColor = mix(color1, color2, n);
        vec3 viewDir = normalize(vViewPosition);
        float viewAngle = max(0.0, dot(vNormal, viewDir));
        float rim = pow(1.0 - viewAngle, 3.0);
        gl_FragColor = vec4(finalColor + rim * 0.6, 1.0);
    }
  `
};

export function StarBackground() {
    const texture = useLoader(THREE.TextureLoader, '/textures/8k_stars.jpg') as THREE.Texture;
    return (
        <mesh>
            <sphereGeometry args={[100000, 64, 64]} />
            {/* Tinting the texture with a dark gray color reduces the brightness significantly */}
            <meshBasicMaterial map={texture} side={THREE.BackSide} color="#333333" />
        </mesh>
    );
}

export function Sun({ onClick }: { onClick: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    useFrame(({ clock }) => {
        if (materialRef.current) materialRef.current.uniforms.time.value = clock.getElapsedTime();
    });
    return (
        <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[25, 64, 64]} />
                <shaderMaterial ref={materialRef} args={[SunShaderMaterial]} side={THREE.FrontSide} />
            </mesh>
            <pointLight intensity={2.5} decay={0} distance={0} color="#fff8e7" />
        </group>
    );
}

function PlanetClouds({ textureUrl, radius }: { textureUrl: string, radius: number }) {
    const cloudsRef = useRef<THREE.Mesh>(null);
    const cloudMap = useLoader(THREE.TextureLoader, textureUrl) as THREE.Texture;
    const { speedRef } = useSimulation();

    useFrame((state, delta) => {
        if (cloudsRef.current && speedRef.current < 1000) {
            cloudsRef.current.rotation.y += (delta * 0.05); 
        }
    });

    return (
        <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial map={cloudMap} transparent opacity={0.8} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
}

export function Planet({ data, isSelected, onClick, onSelectRef }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { timeRef } = useSimulation();
    
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

    useEffect(() => {
        if(groupRef.current) onSelectRef(data.id, groupRef.current);
    }, [data.id, onSelectRef]);

    return (
        <group>
            <mesh rotation={[-Math.PI/2, 0, 0]}>
                <ringGeometry args={[data.distance - 0.2, data.distance + 0.2, 256]} />
                <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={THREE.DoubleSide} />
            </mesh>
            <group ref={groupRef}>
                <group rotation={[0, 0, tiltRadians]}>
                    <PlanetBody data={data} meshRef={meshRef} colorMap={colorMap} onClick={onClick} />
                    {data.ringTextureUrl && ringMap && (
                        <mesh rotation={[-Math.PI/2, 0, 0]}>
                            <ringGeometry args={[data.radius * 1.4, data.radius * 2.5, 128]} />
                            <meshStandardMaterial map={ringMap} transparent side={THREE.DoubleSide} opacity={0.9} />
                        </mesh>
                    )}
                </group>
                {isSelected && (
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[data.radius * 1.8, data.radius * 2.0, 64]} />
                        <meshBasicMaterial color="#DFFF00" transparent opacity={0.5} side={THREE.DoubleSide} />
                    </mesh>
                )}
                {!isSelected && (
                    <Html position={[0, data.radius + 2, 0]} distanceFactor={150}>
                        <div className="text-white text-xs font-mono opacity-50 tracking-widest uppercase bg-black/40 px-2 rounded backdrop-blur-sm pointer-events-none">
                            {data.name}
                        </div>
                    </Html>
                )}
                {data.moons && data.moons.map((moon: any, idx: number) => (
                    <Moon key={idx} data={moon} parentRadius={data.radius} onSelectRef={onSelectRef} onClick={() => onClick(moon.id)} />
                ))}
            </group>
        </group>
    );
}

function PlanetBody({ data, meshRef, colorMap, onClick }: any) {
    if (data.id === 'kuva') {
        return (
            <group ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
                <mesh>
                    <dodecahedronGeometry args={[data.radius, 0]} />
                    <meshStandardMaterial color="#880000" roughness={0.9} metalness={0.5} />
                </mesh>
                <mesh rotation={[Math.PI/4, 0, 0]}><torusGeometry args={[data.radius * 1.5, 0.1, 8, 32]} /><meshStandardMaterial color="#550000" /></mesh>
                <mesh rotation={[-Math.PI/4, 0, 0]}><torusGeometry args={[data.radius * 1.8, 0.1, 8, 32]} /><meshStandardMaterial color="#330000" /></mesh>
                <pointLight distance={5} intensity={5} color="red" />
            </group>
        )
    }
    return (
        <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
            <sphereGeometry args={[data.radius, 64, 64]} />
            <meshStandardMaterial map={colorMap} roughness={0.7} metalness={0.1} color={!colorMap ? data.color : undefined} />
            {data.cloudTextureUrl && <PlanetClouds textureUrl={data.cloudTextureUrl} radius={data.radius} />}
            {data.atmosphere && !data.cloudTextureUrl && (
                <mesh scale={[1.01, 1.01, 1.01]}>
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
            )}
        </mesh>
    );
}

function Moon({ data, parentRadius, onSelectRef, onClick }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const isStation = data.type === 'Station';
    const texture = !isStation ? useLoader(THREE.TextureLoader, data.textureUrl) as THREE.Texture : null;
    const { timeRef } = useSimulation();

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
            else if (data.id === 'dreadnaught') meshRef.current.rotation.y += 0.001; 
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
             <group ref={meshRef as any} onClick={(e) => { e.stopPropagation(); onClick(); }}>
                {data.id === 'dreadnaught' ? (
                    <group>
                        <mesh rotation={[0, 0, Math.PI/4]}><octahedronGeometry args={[data.radius * 2, 0]} /><meshStandardMaterial color="#332211" roughness={0.8} /></mesh>
                        <pointLight distance={3} intensity={3} color="orange" />
                    </group>
                ) : (
                    <group>
                        <mesh><boxGeometry args={[data.radius * 3, data.radius, data.radius]} /><meshStandardMaterial color="#eeeeee" metalness={0.8} roughness={0.2} /></mesh>
                        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[data.radius * 0.1, data.radius * 0.1, data.radius * 8, 8]} /><meshStandardMaterial color="#2244ff" metalness={0.9} roughness={0.3} /></mesh>
                        <pointLight distance={2} intensity={2} color="cyan" />
                    </group>
                )}
            </group>
        );
    }

    return (
        <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <sphereGeometry args={[data.radius, 16, 16]} />
            <meshStandardMaterial map={texture} color={data.color} />
        </mesh>
    );
}

export function SpaceRoute({ originId, destinationId, isDriving, isPreviewing, setArrived }: any) {
    const { timeRef } = useSimulation();
    const [progress, setProgress] = useState(0);
    const [tripDuration, setTripDuration] = useState(15); 

    const carRef = useRef<THREE.Group>(null);
    const lineRef = useRef<any>(null);
    const materialRef = useRef<THREE.LineDashedMaterial>(null);
    const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

    // Temp vectors for frame calculations
    const currentPos = useRef(new THREE.Vector3());
    const currentLookAt = useRef(new THREE.Vector3());

    // Calculate duration only when trip starts/changes
    useEffect(() => {
        if (originId && destinationId) {
            const p1 = getBodyPosition(originId, timeRef.current);
            const p2 = getBodyPosition(destinationId, timeRef.current);
            const dist = p1.distanceTo(p2);
            // Longer duration formula: Min 15s, Max 120s, scaled by distance
            const duration = Math.max(15, Math.min(120, dist / 50));
            setTripDuration(duration);
        }
    }, [originId, destinationId]);

    useFrame((state, delta) => {
        if (!originId || !destinationId) return;

        // 1. Calculate Positions
        const originPos = getBodyPosition(originId, timeRef.current);
        const destPos = getBodyPosition(destinationId, timeRef.current);

        // 2. Generate Smart Route
        const dist = originPos.distanceTo(destPos);
        const sunPos = new THREE.Vector3(0,0,0);
        
        // Calculate "Parking Orbits" (Lagrange-ish points)
        const originToSun = new THREE.Vector3().subVectors(sunPos, originPos).normalize();
        const destToSun = new THREE.Vector3().subVectors(sunPos, destPos).normalize();
        
        // Lift path
        const originL = originPos.clone().add(originToSun.multiplyScalar(20)).add(new THREE.Vector3(0, 15, 0));
        const destL = destPos.clone().add(destToSun.multiplyScalar(20)).add(new THREE.Vector3(0, 15, 0));
        
        const midPoint = new THREE.Vector3().lerpVectors(originL, destL, 0.5);
        midPoint.y += Math.min(dist * 0.3, 100); 

        const points = [
            originPos,
            originL,
            midPoint,
            destL,
            destPos
        ];

        // Create/Update Curve
        const curve = new THREE.CatmullRomCurve3(points);
        curveRef.current = curve;

        // Update Line Geometry for visual feedback
        if (lineRef.current) {
            const geometry = lineRef.current.geometry;
            const pointsList = curve.getPoints(60);
            geometry.setFromPoints(pointsList);
            // CRITICAL: Ensure dashes render correctly
            lineRef.current.computeLineDistances();
        }

        // 3. Animation Logic
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

                // POV Cam
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
            {/* The Route Line - Force render to ensure visibility during preview */}
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

            {/* Ghost Pod for Preview */}
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

export function SystemControls({ targetId, refs, isShuttleActive, previewTarget }: any) {
    const controlsRef = useRef<CameraControls>(null);
    const { timeRef } = useSimulation();

    // 1. Zoom Logic for Preview
    useEffect(() => {
        if(!controlsRef.current) return;
        if (previewTarget && previewTarget.origin && previewTarget.destination && !isShuttleActive) {
            const destObj = refs.current[previewTarget.destination];
            if(destObj) {
                const p1 = getBodyPosition(previewTarget.origin, timeRef.current);
                const p2 = getBodyPosition(previewTarget.destination, timeRef.current);
                const dist = p1.distanceTo(p2);
                // Zoom out enough to see the path, but focus on destination
                controlsRef.current.fitToBox(destObj, true, { paddingLeft: dist/3, paddingRight: dist/3, paddingTop: dist/3, paddingBottom: dist/3 });
            }
        }
    }, [previewTarget, isShuttleActive]);

    // 2. Focus Logic
    useEffect(() => {
        if (!controlsRef.current || isShuttleActive || previewTarget) return;
        if (targetId === 'sun') {
            controlsRef.current.setLookAt(0, 100, 250, 0, 0, 0, true);
            return;
        }
        if (targetId && refs.current[targetId]) {
            const targetObj = refs.current[targetId];
            const data = findBodyById(targetId) || { radius: 25 };
            const viewDistance = data.radius < 1 ? data.radius * 12 : data.radius * 4; 
            controlsRef.current.fitToBox(targetObj, true, { paddingTop: viewDistance, paddingBottom: viewDistance, paddingLeft: viewDistance, paddingRight: viewDistance });
        } else if (!targetId) {
            controlsRef.current.setLookAt(0, 600, 800, 0, 0, 0, true);
        }
    }, [targetId, refs, isShuttleActive, previewTarget]);

    // 3. Tracking Logic (Keep camera center on planet, but allow rotation)
    useFrame(() => {
        if (isShuttleActive) return;
        if (targetId && targetId !== 'sun' && refs.current[targetId] && controlsRef.current && !previewTarget) {
            const targetObj = refs.current[targetId];
            const pos = new THREE.Vector3();
            targetObj.getWorldPosition(pos);
            
            // We only update the TARGET (center of rotation), not the camera position
            // This allows the user to rotate/drag around the planet while it moves.
            controlsRef.current.setTarget(pos.x, pos.y, pos.z, true);
        }
    });

    return <CameraControls ref={controlsRef} maxDistance={50000} minDistance={0.1} smoothTime={1.2} enabled={!isShuttleActive} />;
}