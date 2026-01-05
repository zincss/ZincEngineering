'use client';

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation, J2000_EPOCH, MILLISECONDS_PER_DAY } from '../../context';
import { SmartLabel, EllipticalOrbit, RealisticAtmosphere } from './SceneUtils';
import { BlackHole } from './StellarBodies';

// --- PLANET CLOUDS ---
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

// --- SATURN RINGS (UPDATED WITH DREADNAUGHT) ---
function SaturnRings({ innerRadius, outerRadius, dreadnaughtData, onSelectRef, onClick }: { innerRadius: number, outerRadius: number, dreadnaughtData?: any, onSelectRef?: any, onClick?: any }) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dreadnaughtRef = useRef<THREE.Group>(null);
    
    // Increased density for fuller look
    const count = 9000; 

    // Dreadnaught Position (Fixed relative to ring rotation)
    const dreadX = dreadnaughtData ? dreadnaughtData.distance : 17;
    const holeRadius = 2.0; // Size of the "carved" space

    useEffect(() => {
        if(dreadnaughtData && dreadnaughtRef.current && onSelectRef) {
            onSelectRef(dreadnaughtData.id, dreadnaughtRef.current);
        }
    }, [dreadnaughtData, onSelectRef]);

    useLayoutEffect(() => {
        if (!meshRef.current) return;
        const tempObj = new THREE.Object3D();
        const color = new THREE.Color();
        const colors = ['#E0CDA7', '#C4A88F', '#8B7D6E', '#A0A0A0']; 

        for (let i = 0; i < count; i++) {
            // Random Angle
            const angle = Math.random() * Math.PI * 2;
            let r = 0;
            const seed = Math.random();
            const ringB_Width = 5.5; 
            const ringA_Width = 4.5;
            
            // 55% Inner Ring (B), 45% Outer Ring (A)
            if (seed > 0.45) {
                 r = innerRadius + Math.random() * ringB_Width;
            } else {
                 r = (innerRadius + ringB_Width + 2.0) + Math.random() * ringA_Width;
            }

            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            
            // HOLE LOGIC: If particle is near the Dreadnaught, skip it (push it elsewhere)
            if (dreadnaughtData) {
                const dx = x - dreadX; // Dreadnaught is at (dreadX, 0, 0)
                const dz = z - 0;
                const dist = Math.sqrt(dx*dx + dz*dz);
                if (dist < holeRadius) {
                    // Move particle to the other side to clear the hole
                    continue; 
                }
            }

            const y = (Math.random() - 0.5) * 0.15; 
            
            tempObj.position.set(x, y, z);
            tempObj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            
            const scaleBase = r < 18 ? 0.12 : 0.09;
            const s = Math.random() * scaleBase + 0.03;
            tempObj.scale.set(s, s * (0.6 + Math.random() * 0.4), s * (0.6 + Math.random() * 0.4));
            
            tempObj.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObj.matrix);
            
            const colIndex = Math.floor(Math.random() * colors.length);
            color.set(colors[colIndex]);
            
            if (r < 18) {
                color.offsetHSL(0.02, 0.05, -0.05); 
            } else {
                color.offsetHSL(0, -0.1, 0.1);
            }
            
            color.multiplyScalar(0.8 + Math.random() * 0.4);
            meshRef.current.setColorAt(i, color);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [innerRadius, outerRadius, dreadnaughtData, dreadX]);

    useFrame(({ clock }) => {
        // Rotate the ENTIRE group (Rings + Dreadnaught) together
        if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.005;
    });

    return (
        <group ref={groupRef}>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]} rotation={[0,0,0]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial roughness={0.7} metalness={0.3} />
            </instancedMesh>
            
            {/* THE DREADNAUGHT (Rendered here to stay locked in the hole) */}
            {dreadnaughtData && (
                <group 
                    ref={dreadnaughtRef}
                    position={[dreadX, 0, 0]}
                    onClick={(e) => { e.stopPropagation(); onClick(dreadnaughtData.id); }}
                >
                    {/* Main Hull (Diamond Shape) */}
                    <mesh rotation={[0, 0, Math.PI/4]} scale={[1, 0.4, 0.4]}>
                        <boxGeometry args={[dreadnaughtData.radius * 8, dreadnaughtData.radius * 3, dreadnaughtData.radius * 3]} />
                        <meshStandardMaterial color={dreadnaughtData.color} roughness={0.8} metalness={0.6} />
                    </mesh>
                    {/* Engine Glow */}
                    <mesh position={[-dreadnaughtData.radius * 4, 0, 0]}>
                         <planeGeometry args={[dreadnaughtData.radius * 2, dreadnaughtData.radius * 2]} />
                         <meshBasicMaterial color="#aaffaa" transparent opacity={0.5} side={THREE.DoubleSide} />
                    </mesh>
                    
                    {/* Label attached to the mesh inside the group */}
                    <SmartLabel 
                        text={dreadnaughtData.name} 
                        type={dreadnaughtData.type} 
                        position={[0, dreadnaughtData.radius * 2, 0]} 
                        offset={0} 
                        visible={true}
                    />
                </group>
            )}
        </group>
    );
}

// --- MOON ---
function Moon({ data, parentRadius, onSelectRef, onClick, showLabels, isCinematic, scalePosition, parentScalePosition, isScaleAlignment }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const isStation = data.type === 'Station';
    const texture = !isStation ? useLoader(THREE.TextureLoader, data.textureUrl) as THREE.Texture : null;
    const { timeRef, getOrbitalPosition } = useSimulation();
    const [hovered, setHover] = useState(false);
    
    const labelOffset = data.radius * 3 + 1.5;

    useFrame(() => {
        if (groupRef.current) {
            if (isScaleAlignment && scalePosition && parentScalePosition) {
                const localPos = scalePosition.clone().sub(parentScalePosition);
                groupRef.current.position.copy(localPos);
                if (meshRef.current) meshRef.current.rotation.y += 0.01;
                return;
            }

            const pos = getOrbitalPosition(data, timeRef.current);
            const oldStyleDist = parentRadius + data.distance;
            const scaleFactor = oldStyleDist / (data.distance || 1); 
            pos.multiplyScalar(scaleFactor); 
            
            groupRef.current.position.copy(pos);
            
            if (data.id === 'iss') groupRef.current.lookAt(0, 0, 0); 
            else if (data.rotationPeriod && meshRef.current) {
                const days = (timeRef.current - J2000_EPOCH) / MILLISECONDS_PER_DAY;
                const hours = days * 24;
                meshRef.current.rotation.y = (hours / data.rotationPeriod) * (Math.PI * 2);
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
                    <mesh visible={false}>
                        <sphereGeometry args={[data.radius * 4, 16, 16]} />
                        <meshBasicMaterial />
                    </mesh>

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
                         <mesh scale={[1.1, 1.1, 1.1]} raycast={() => null}>
                            <sphereGeometry args={[data.radius, 32, 32]} />
                            <meshBasicMaterial color="#DFFF00" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
                        </mesh>
                    )}
                </group>
                <SmartLabel 
                    text={data.name} 
                    type={data.type} 
                    position={[0, data.radius, 0]} 
                    offset={labelOffset} 
                    visible={!isCinematic && showLabels} 
                />
            </group>
        );
    }

    return (
        <group ref={groupRef}>
            <group
                onClick={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
            >
                <mesh visible={false}>
                    <sphereGeometry args={[data.radius * 2.5, 16, 16]} />
                    <meshBasicMaterial />
                </mesh>

                <mesh ref={meshRef}>
                    <sphereGeometry args={[data.radius, 64, 64]} />
                    <meshStandardMaterial map={texture} color={data.color} />
                </mesh>
                {hovered && (
                    <mesh 
                        rotation={meshRef.current?.rotation} 
                        scale={[1.05, 1.05, 1.05]} 
                        raycast={() => null}
                    >
                        <sphereGeometry args={[data.radius, 64, 64]} />
                        <meshBasicMaterial color="#DFFF00" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
                    </mesh>
                )}
            </group>
             <SmartLabel 
                text={data.name} 
                type={data.type} 
                position={[0, data.radius, 0]} 
                offset={labelOffset} 
                visible={!isCinematic && showLabels} 
            />
        </group>
    );
}

// --- PLANET BODY ---
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
            
            {/* REMOVED ATMOSPHERE GLOW FOR MARS */}
            {data.atmosphere && !data.cloudTextureUrl && data.id !== 'mars' && (
                <RealisticAtmosphere 
                    radius={data.radius} 
                    color={data.id === 'mars' ? '#E27B58' : '#3366ff'} 
                    sunPosition={new THREE.Vector3(0,0,0)} 
                />
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

// --- MAIN PLANET COMPONENT ---
export function Planet({ data, isSelected, selectedId, onClick, onSelectRef, isCinematic, showOrbits, showLabels, scalePosition, isScaleAlignment, allScalePositions }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { timeRef, getOrbitalPosition } = useSimulation();

    // Identify if this planet has the Dreadnaught
    const dreadnaught = data.moons?.find((m: any) => m.id === 'dreadnaught');

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
    const planetLabelOffset = data.radius * 1.5 + 5;

    useFrame((state, delta) => {
        if (isScaleAlignment && scalePosition && groupRef.current) {
            groupRef.current.position.copy(scalePosition);
            if (meshRef.current) meshRef.current.rotation.y += delta * 0.1; 
            return;
        }

        if (groupRef.current && data.distance > 0) {
            const pos = getOrbitalPosition(data, timeRef.current);
            groupRef.current.position.copy(pos);
        }
        
        if (meshRef.current && data.rotationPeriod !== 0) {
            const daysSinceJ2000 = (timeRef.current - J2000_EPOCH) / MILLISECONDS_PER_DAY;
            const hoursSinceJ2000 = daysSinceJ2000 * 24;
            meshRef.current.rotation.y = (hoursSinceJ2000 / data.rotationPeriod) * (Math.PI * 2);
        }
    });

    return (
        <group>
            {!isCinematic && showOrbits && !isScaleAlignment && (
                <EllipticalOrbit body={data} type="planet" isSelected={isSelected} />
            )}
            
            <group ref={groupRef}>
                <group rotation={[0, 0, tiltRadians]}>
                    <PlanetBody data={data} meshRef={meshRef} colorMap={colorMap} onClick={onClick} />
                    
                    {/* SATURN RINGS & DREADNAUGHT RENDERED HERE */}
                    {data.id === 'saturn' && (
                        <group>
                            <SaturnRings 
                                innerRadius={13} 
                                outerRadius={25} 
                                dreadnaughtData={dreadnaught} 
                                onSelectRef={onSelectRef}
                                onClick={onClick}
                            />
                        </group>
                    )}
                    
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
                    offset={planetLabelOffset}
                    visible={!isSelected && !isCinematic && showLabels} 
                />

                {data.moons && data.moons.map((moon: any, idx: number) => {
                    // SKIP DREADNAUGHT (It is handled inside SaturnRings)
                    if (moon.id === 'dreadnaught') return null;

                    const isMoonSelected = selectedId === moon.id;
                    const moonScalePos = isScaleAlignment && allScalePositions ? allScalePositions[moon.id] : undefined;
                    
                    return (
                        <React.Fragment key={idx}>
                            {!isCinematic && showOrbits && !isScaleAlignment && (
                                <EllipticalOrbit body={moon} type="moon" isSelected={isMoonSelected} parentRadius={data.radius} />
                            )}
                            <Moon 
                                data={moon} 
                                parentRadius={data.radius} 
                                onSelectRef={onSelectRef} 
                                onClick={() => onClick(moon.id)} 
                                showLabels={showLabels}
                                isCinematic={isCinematic}
                                scalePosition={moonScalePos}
                                parentScalePosition={scalePosition}
                                isScaleAlignment={isScaleAlignment}
                            />
                        </React.Fragment>
                    );
                })}
            </group>
        </group>
    );
}