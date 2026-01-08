'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation, PLANET_DATA } from '../../context';

export function GravityWellGrid() {
    const { getOrbitalPosition, simulationTime } = useSimulation();
    const meshRef = useRef<THREE.Mesh>(null);
    const geometryRef = useRef<THREE.PlaneGeometry>(null);

    // Grid Parameters
    const size = 4000;
    const divisions = 100; // Divisions per side (squares)
    const step = size / divisions;

    // Filter massive bodies for gravity influence
    const bodies = useMemo(() => {
        return PLANET_DATA.filter(p => p.radius > 5).map(p => ({
            id: p.id,
            mass: p.id === 'sun' ? 800 : p.radius * 8,
            data: p
        }));
    }, []);

    // Generate Grid Geometry (Lines for Rows and Columns)
    const { geometry, initialPositions } = useMemo(() => {
        const positions: number[] = [];
        const initialPos: number[] = [];
        
        const halfSize = size / 2;

        // Generate lines along X (Z fixed)
        for (let i = 0; i <= divisions; i++) {
            const z = -halfSize + i * step;
            // Line start
            positions.push(-halfSize, 0, z);
            initialPos.push(-halfSize, 0, z);
            // Line end (we need intermediate points for deformation, so we build segments)
            // Actually, we need MANY segments per line to bend them.
            // So we draw individual short segments for every cell.
        }

        // REVISED APPROACH:
        // To allow curving, we need a vertex at every grid intersection.
        // We will build "LineSegments" where every grid cell edge is a segment.
        
        const posArr: number[] = [];
        const initArr: number[] = [];

        // Vertical lines (moving along Z)
        for (let ix = 0; ix <= divisions; ix++) {
            const x = -halfSize + ix * step;
            for (let iz = 0; iz < divisions; iz++) {
                const z1 = -halfSize + iz * step;
                const z2 = -halfSize + (iz + 1) * step;
                
                posArr.push(x, 0, z1);
                posArr.push(x, 0, z2);
                
                initArr.push(x, 0, z1);
                initArr.push(x, 0, z2);
            }
        }

        // Horizontal lines (moving along X)
        for (let iz = 0; iz <= divisions; iz++) {
            const z = -halfSize + iz * step;
            for (let ix = 0; ix < divisions; ix++) {
                const x1 = -halfSize + ix * step;
                const x2 = -halfSize + (ix + 1) * step;
                
                posArr.push(x1, 0, z);
                posArr.push(x2, 0, z);
                
                initArr.push(x1, 0, z);
                initArr.push(x2, 0, z);
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
        return { geometry: geo, initialPositions: new Float32Array(initArr) };
    }, []);

    useFrame(() => {
        if (!geometryRef.current) return;

        const posAttr = geometryRef.current.attributes.position;
        const count = posAttr.count;

        // Get current body positions once per frame
        const bodyPositions = bodies.map(b => {
            if (b.id === 'sun') return new THREE.Vector3(0, 0, 0);
            return getOrbitalPosition(b.data, simulationTime);
        });

        for (let i = 0; i < count; i++) {
            // Read original X/Z to keep grid stable, only modifying Y
            const x = initialPositions[i * 3];
            const z = initialPositions[i * 3 + 2];
            
            let y = -30; // Base level

            // Calculate deflection
            for (let j = 0; j < bodies.length; j++) {
                const bodyPos = bodyPositions[j];
                const dx = x - bodyPos.x;
                const dz = z - bodyPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                const spread = bodies[j].id === 'sun' ? 150 : 40;
                const depth = bodies[j].mass * 2.5;
                
                const influence = depth * Math.exp(-dist / spread);
                y -= influence;
            }

            posAttr.setXYZ(i, x, y, z);
        }

        posAttr.needsUpdate = true;
    });

    return (
        <group position={[0, -50, 0]}>
            <lineSegments>
                <bufferGeometry ref={geometryRef} attach="geometry" {...geometry} />
                <lineBasicMaterial 
                    color="#00FF41" 
                    transparent 
                    opacity={0.3} 
                    linewidth={1} 
                />
            </lineSegments>
        </group>
    );
}
