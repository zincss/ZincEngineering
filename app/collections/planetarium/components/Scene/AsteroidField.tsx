'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation, MINING_RESOURCES, getOrbitalPosition } from '../../context';
import { Html } from '@react-three/drei';
import { PLANET_DATA } from '../../data';

interface AsteroidFieldProps {
    count?: number;
    minRadius?: number;
    maxRadius?: number;
    mode?: 'belt' | 'local';
}

export function AsteroidField({ count = 50, minRadius = 350, maxRadius = 550, mode = 'belt' }: AsteroidFieldProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { miningState, mineAsteroid, currentShip, findBody, timeRef } = useSimulation();
    const [lasers, setLasers] = useState<{ id: number; start: THREE.Vector3; end: THREE.Vector3; color: string; timeLeft: number }[]>([]);
    const [depletedAsteroids, setDepletedAsteroids] = useState<Record<number, boolean>>({});

    // Reset depleted asteroids when zone changes
    useEffect(() => {
        setDepletedAsteroids({});
    }, [miningState.activeZoneId]);
    
    // Compute parent map for local mode positioning
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

    // Generate asteroids only when mining starts or zone changes
    const asteroids = useMemo(() => {
        // If local mode, only generate if we have a specific target body
        if (mode === 'local') {
            if (!miningState.activeZoneId || ['asteroid_belt', 'kuiper_belt'].includes(miningState.activeZoneId)) {
                return [];
            }
        }

        const temp = [];
        // Resource Weights
        const weights: Record<string, number> = {
            'ice': 30, 'iron': 25, 'silicon': 20, // Common (75%)
            'titanium': 10, 'gold': 5,            // Uncommon (15%)
            'cobalt': 4, 'platinum': 3,           // Rare (7%)
            'palladium': 1.5, 'void_crystal': 1,  // Epic (2.5%)
            'iridium': 0.3, 'painite': 0.15, 'low_temp_diamond': 0.05 // Legendary (0.5%)
        };
        const resources = Object.keys(MINING_RESOURCES);
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            // Random distance between min and max radius
            const r = minRadius + Math.random() * (maxRadius - minRadius);
            
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            
            const scale = 0.5 + Math.random() * 2.5;
            
            // Weighted Random Selection
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
                rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
                scale: new THREE.Vector3(scale, scale, scale),
                resource: resourceType,
                hp: 100, // Durability? For now instant mine
                id: i
            });
        }
        return temp;
    }, [count, minRadius, maxRadius, miningState.activeZoneId, mode]);

    // Update instances
    useEffect(() => {
        if (!meshRef.current) return;
        
        // If no asteroids (e.g. local mode but in belt), hide
        if (asteroids.length === 0) {
             meshRef.current.visible = false;
             return;
        }
        meshRef.current.visible = true;

        const tempObj = new THREE.Object3D();
        const color = new THREE.Color();
        
        asteroids.forEach((ast, i) => {
            // Check if depleted
            if (depletedAsteroids[ast.id]) {
                tempObj.scale.set(0, 0, 0); // Hide it
            } else {
                tempObj.scale.copy(ast.scale);
            }
            
            tempObj.position.copy(ast.position);
            tempObj.rotation.copy(ast.rotation);
            tempObj.updateMatrix();
            
            meshRef.current!.setMatrixAt(i, tempObj.matrix);
            
            // Color based on resource
            const resMeta = (MINING_RESOURCES as any)[ast.resource];
            if (resMeta) {
                color.set(resMeta.color);
                // Darken rock slightly
                color.multiplyScalar(0.6); 
            } else {
                color.set('#555555');
            }
            meshRef.current!.setColorAt(i, color);
        });
        
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [asteroids, depletedAsteroids]);

    // Animation loop for lasers and rotation
    useFrame((state, delta) => {
        if (!miningState.isMining) return;
        
        // Handle Local Mode Positioning
        if (mode === 'local' && groupRef.current && miningState.activeZoneId) {
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

        // Update lasers
        if (lasers.length > 0) {
            setLasers(prev => prev.map(l => ({ ...l, timeLeft: l.timeLeft - delta })).filter(l => l.timeLeft > 0));
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation();
        const instanceId = e.instanceId;
        if (instanceId === undefined) return;

        const ast = asteroids[instanceId];
        if (!ast) return;
        
        // Check if already depleted
        if (depletedAsteroids[ast.id]) return;

        // Mine it
        const amount = mineAsteroid(ast.resource);
        
        if (amount > 0) {
            // Visual feedback: Laser
            setLasers(prev => [...prev, {
                id: Math.random(),
                start: new THREE.Vector3(0, -2, 0), // Approx ship weapon mount (relative to group)
                end: ast.position.clone(),
                color: (MINING_RESOURCES as any)[ast.resource]?.color || '#fff',
                timeLeft: 0.2
            }]);
            
            // Mark as depleted (remove rock)
            setDepletedAsteroids(prev => ({ ...prev, [ast.id]: true }));
        }
    };

    if (!miningState.isMining) return null;

    return (
        <group ref={groupRef}>
            <instancedMesh 
                ref={meshRef} 
                args={[undefined, undefined, count]} 
                onClick={handleClick}
                onPointerOver={() => document.body.style.cursor = 'crosshair'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial roughness={0.8} metalness={0.2} />
            </instancedMesh>

            {/* LASERS */}
            {lasers.map(laser => (
                <line key={laser.id}>
                    <bufferGeometry setFromPoints={[laser.start, laser.end]} />
                    <lineBasicMaterial color={laser.color} linewidth={2} transparent opacity={laser.timeLeft * 5} />
                </line>
            ))}
        </group>
    );
}
