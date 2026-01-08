'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation, MINING_RESOURCES, getOrbitalPosition } from '../../context';
import { PLANET_DATA } from '../../data';
import { SPACESHIP_UPDATE_EVENT } from './Spaceship/constants';

interface AsteroidFieldProps {
    count?: number;
    minRadius?: number;
    maxRadius?: number;
    mode?: 'belt' | 'local';
}

function MiningImpact({ position, color }: { position: THREE.Vector3, color: string }) {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
    );
}

export function AsteroidField({ count = 50, minRadius = 350, maxRadius = 550, mode = 'belt' }: AsteroidFieldProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { miningState, mineAsteroid, findBody, timeRef } = useSimulation();
    const [depletedAsteroids, setDepletedAsteroids] = useState<Record<number, boolean>>({});
    
    const damageRef = useRef<Record<number, number>>({});
    const isFiringRef = useRef(false);
    const [impacts, setImpacts] = useState<{ id: number, pos: THREE.Vector3, color: string, ttl: number }[]>([]);

    const { camera } = useThree();
    const raycaster = useMemo(() => new THREE.Raycaster(), []);

    // Track Deep Space Spawn
    const deepSpacePosRef = useRef<THREE.Vector3 | null>(null);

    // Update Deep Space Position when entering mode
    useEffect(() => {
        if (miningState.activeZoneId === 'deep_space' && mode === 'local') {
            // Spawn ~100 units in front of the ship
            const spawnDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            deepSpacePosRef.current = camera.position.clone().add(spawnDir.multiplyScalar(100));
        } else {
            deepSpacePosRef.current = null;
        }
    }, [miningState.activeZoneId, mode, camera]);

    useEffect(() => {
        const handleUpdate = (e: any) => {
            isFiringRef.current = e.detail.isFiring;
        };
        window.addEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
        return () => window.removeEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
    }, []);

    useEffect(() => {
        setDepletedAsteroids({});
        damageRef.current = {};
    }, [miningState.activeZoneId]);
    
    const parentMap = useMemo(() => {
        const map: Record<string, any> = {};
        PLANET_DATA.forEach(p => {
            if (p.moons) {
                p.moons.forEach(m => {
                    map[m.id] = p; 
                });
            }
        });
        return map;
    }, []);

    const asteroids = useMemo(() => {
        if (mode === 'local') {
            if (!miningState.activeZoneId || ['asteroid_belt', 'kuiper_belt'].includes(miningState.activeZoneId)) {
                return [];
            }
        }

        const temp = [];
        const weights: Record<string, number> = {
            'ice': 30, 'iron': 25, 'silicon': 20, 
            'titanium': 10, 'gold': 5,            
            'cobalt': 4, 'platinum': 3,           
            'palladium': 1.5, 'void_crystal': 1,  
            'iridium': 0.3, 'painite': 0.15, 'low_temp_diamond': 0.05 
        };
        const resources = Object.keys(MINING_RESOURCES);
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

        for (let i = 0; i < count; i++) {
            let x, y, z;

            if (mode === 'belt') {
                const angle = Math.random() * Math.PI * 2;
                const r = minRadius + Math.random() * (maxRadius - minRadius);
                const heightSpread = (maxRadius - minRadius) * 0.1; 
                const h = (Math.random() - 0.5) * heightSpread;

                x = r * Math.cos(angle);
                z = r * Math.sin(angle);
                y = h;
            } else {
                // Spherical
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                // For Deep Space, we want a tighter cluster
                const isDeep = miningState.activeZoneId === 'deep_space';
                const effectiveMin = isDeep ? 10 : minRadius;
                const effectiveMax = isDeep ? 80 : maxRadius;
                
                const r = effectiveMin + Math.random() * (effectiveMax - effectiveMin);
                
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
            }
            
            const baseScale = 0.3 + Math.random() * 0.7;
            const scale = new THREE.Vector3(
                baseScale * (0.8 + Math.random() * 0.4),
                baseScale * (0.8 + Math.random() * 0.4),
                baseScale * (0.8 + Math.random() * 0.4)
            );
            
            let random = Math.random() * totalWeight;
            let resourceType = 'ice';
            for (const res of resources) {
                const weight = weights[res] || 0;
                if (random < weight) {
                    resourceType = res;
                    break;
                }
                random -= weight;
            }
            
            temp.push({
                position: new THREE.Vector3(x, y, z),
                rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
                scale: scale,
                resource: resourceType,
                id: i
            });
        }
        return temp;
    }, [count, minRadius, maxRadius, miningState.activeZoneId, mode]);

    useEffect(() => {
        if (!meshRef.current) return;
        if (asteroids.length === 0) {
             meshRef.current.visible = false;
             return;
        }
        meshRef.current.visible = true;

        const tempObj = new THREE.Object3D();
        const color = new THREE.Color();
        
        asteroids.forEach((ast, i) => {
            if (depletedAsteroids[ast.id]) {
                tempObj.scale.set(0, 0, 0); 
            } else {
                tempObj.scale.copy(ast.scale);
            }
            
            tempObj.position.copy(ast.position);
            tempObj.rotation.copy(ast.rotation);
            tempObj.updateMatrix();
            
            meshRef.current!.setMatrixAt(i, tempObj.matrix);
            
            const resMeta = (MINING_RESOURCES as any)[ast.resource];
            if (resMeta) {
                color.set(resMeta.color);
                color.multiplyScalar(0.5); 
            } else {
                color.set('#555555');
            }
            const variation = (Math.random() - 0.5) * 0.1;
            color.offsetHSL(0, 0, variation);
            
            meshRef.current!.setColorAt(i, color);
        });
        
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [asteroids, depletedAsteroids]);

    useFrame((state, delta) => {
        if (!miningState.isMining) return;
        
        // 1. Positioning
        if (mode === 'local' && groupRef.current) {
             if (miningState.activeZoneId === 'deep_space') {
                 // Use cached spawn position for Deep Space
                 if (deepSpacePosRef.current) {
                     groupRef.current.position.copy(deepSpacePosRef.current);
                 }
             } else if (miningState.activeZoneId) {
                 // Use Orbital Body Position
                 const body = findBody(miningState.activeZoneId);
                 if (body) {
                     const pos = getOrbitalPosition(body, timeRef.current);
                     if (parentMap[body.id]) {
                         const parent = parentMap[body.id];
                         pos.add(getOrbitalPosition(parent, timeRef.current));
                     }
                     groupRef.current.position.copy(pos);
                }
             }
        }

        // 2. Mining Logic (Raycast)
        if (isFiringRef.current && meshRef.current) {
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            
            const intersects = raycaster.intersectObject(meshRef.current);

            if (intersects.length > 0) {
                const hit = intersects[0];
                const instanceId = hit.instanceId;
                
                if (instanceId !== undefined && !depletedAsteroids[instanceId]) {
                    const currentDmg = damageRef.current[instanceId] || 0;
                    const newDmg = currentDmg + (delta * 80); 
                    damageRef.current[instanceId] = newDmg;

                    const ast = asteroids[instanceId];
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(ast.position);
                    dummy.rotation.copy(ast.rotation);
                    
                    const jitter = Math.min(0.2, newDmg / 200);
                    dummy.position.add(new THREE.Vector3(
                        (Math.random() - 0.5) * jitter,
                        (Math.random() - 0.5) * jitter,
                        (Math.random() - 0.5) * jitter
                    ));
                    dummy.rotation.x += (Math.random() - 0.5) * jitter;
                    dummy.rotation.y += (Math.random() - 0.5) * jitter;
                    
                    dummy.scale.copy(ast.scale).multiplyScalar(1 - (jitter * 0.5)); 
                    dummy.updateMatrix();
                    meshRef.current.setMatrixAt(instanceId, dummy.matrix);
                    meshRef.current.instanceMatrix.needsUpdate = true;

                    if (Math.random() < 0.3) {
                        const color = (MINING_RESOURCES as any)[ast.resource]?.color || '#fff';
                        setImpacts(prev => [...prev, {
                            id: Math.random(),
                            pos: hit.point.clone(),
                            color: color,
                            ttl: 0.1
                        }]);
                    }

                    if (newDmg >= 100) {
                        mineAsteroid(ast.resource);
                        setDepletedAsteroids(prev => ({ ...prev, [ast.id]: true }));
                        
                        setImpacts(prev => [...prev, {
                            id: Math.random(),
                            pos: hit.point.clone(),
                            color: '#ffffff',
                            ttl: 0.5 
                        }]);
                    }
                }
            }
        }

        if (impacts.length > 0) {
            setImpacts(prev => prev.map(i => ({ ...i, ttl: i.ttl - delta })).filter(i => i.ttl > 0));
        }
    });

    if (!miningState.isMining) return null;

    return (
        <group ref={groupRef}>
            <instancedMesh 
                ref={meshRef} 
                args={[undefined, undefined, count]} 
            >
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial roughness={0.9} metalness={0.1} flatShading={true} />
            </instancedMesh>

            {impacts.map(i => (
                <MiningImpact key={i.id} position={i.pos} color={i.color} />
            ))}
        </group>
    );
}