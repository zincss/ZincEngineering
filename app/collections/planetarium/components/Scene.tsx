'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Html, CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation, J2000_EPOCH, MILLISECONDS_PER_DAY, getBodyPosition, findBodyById } from '../context';

// --- STAR BACKGROUND ---
export function StarBackground() {
    const texture = useLoader(THREE.TextureLoader, '/textures/8k_stars.jpg') as THREE.Texture;
    return (
        <mesh>
            <sphereGeometry args={[100000, 64, 64]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} color="#111111" />
        </mesh>
    );
}

// --- NEW CINEMATIC SUN ---
export function Sun({ onClick }: { onClick: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Sprite>(null);
    
    // Try to load the texture, fallback handled gracefully by Three.js usually (pink/black)
    // Ensure you have 'public/textures/8k_sun.jpg'
    const sunTexture = useLoader(THREE.TextureLoader, '/textures/8k_sun.jpg');

    useFrame(({ clock }) => {
        const elapsed = clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y = elapsed * 0.05; // Slow rotation
        }
        // Pulse the glow slightly
        if (glowRef.current) {
            const scale = 120 + Math.sin(elapsed * 0.5) * 5;
            glowRef.current.scale.set(scale, scale, 1);
        }
    });

    // Create a simple glow texture programmatically so you don't need to download another file
    const glowTexture = React.useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, 'rgba(255, 200, 100, 1)'); // Inner Core (White/Orange)
            gradient.addColorStop(0.2, 'rgba(255, 140, 0, 0.8)'); // Mid (Orange)
            gradient.addColorStop(0.5, 'rgba(200, 50, 0, 0.2)'); // Outer (Reddish)
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fade to transparent
            context.fillStyle = gradient;
            context.fillRect(0, 0, 128, 128);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {/* The Actual Sun Sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[25, 64, 64]} />
                <meshBasicMaterial map={sunTexture} color="#ffffff" /> 
            </mesh>
            
            {/* The Glow Sprite (Always faces camera) */}
            <sprite ref={glowRef} scale={[120, 120, 1]}>
                <spriteMaterial map={glowTexture} color="#ffaa00" blending={THREE.AdditiveBlending} depthWrite={false} />
            </sprite>

            {/* Light Source */}
            <pointLight intensity={3} decay={0} distance={0} color="#fff8e7" />
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

export function Planet({ data, isSelected, onClick, onSelectRef, isCinematic }: any) {
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
            {!isCinematic && (
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
                {!isSelected && !isCinematic && (
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
            else if (data.rotationPeriod) {
                const hoursSinceJ2000 = daysSinceJ2000 * 24;
                meshRef.current.rotation.y = (hoursSinceJ2000 / data.rotationPeriod) * (Math.PI * 2);
            }
        }
    });
    useEffect(() => {
        if(meshRef.current) onSelectRef(data.id, meshRef.current);
    }, [data.id, onSelectRef]);
    
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

export function SystemControls({ targetId, refs, isShuttleActive, previewTarget, isCinematic }: any) {
    const controlsRef = useRef<CameraControls>(null);
    const { timeRef } = useSimulation();

    useEffect(() => {
        if(!controlsRef.current) return;
        if (previewTarget && previewTarget.origin && previewTarget.destination && !isShuttleActive) {
            const destObj = refs.current[previewTarget.destination];
            if(destObj) {
                const p1 = getBodyPosition(previewTarget.origin, timeRef.current);
                const p2 = getBodyPosition(previewTarget.destination, timeRef.current);
                const dist = p1.distanceTo(p2);
                controlsRef.current.fitToBox(destObj, true, { paddingLeft: dist/3, paddingRight: dist/3, paddingTop: dist/3, paddingBottom: dist/3 });
            }
        }
    }, [previewTarget, isShuttleActive]);

    useEffect(() => {
        if (!controlsRef.current || isShuttleActive || previewTarget || isCinematic) return;
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
    }, [targetId, refs, isShuttleActive, previewTarget, isCinematic]);

    useFrame(() => {
        if (isShuttleActive || isCinematic) return;
        if (targetId && targetId !== 'sun' && refs.current[targetId] && controlsRef.current && !previewTarget) {
            const targetObj = refs.current[targetId];
            const pos = new THREE.Vector3();
            targetObj.getWorldPosition(pos);
            controlsRef.current.setTarget(pos.x, pos.y, pos.z, true);
        }
    });

    return <CameraControls ref={controlsRef} maxDistance={50000} minDistance={0.1} smoothTime={1.2} enabled={!isShuttleActive && !isCinematic} />;
}