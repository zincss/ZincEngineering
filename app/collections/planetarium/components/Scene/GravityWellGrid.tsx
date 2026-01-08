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
    const size = 2000;
    const segments = 100;

    // Filter massive bodies for gravity influence
    const bodies = useMemo(() => {
        return PLANET_DATA.filter(p => p.radius > 5).map(p => ({
            id: p.id,
            mass: p.id === 'sun' ? 500 : p.radius * 3, // Boost sun mass visual
            data: p
        }));
    }, []);

    useFrame(() => {
        if (!meshRef.current || !geometryRef.current) return;

        const positions = geometryRef.current.attributes.position;
        const count = positions.count;

        // Get current body positions once per frame
        const bodyPositions = bodies.map(b => {
            if (b.id === 'sun') return new THREE.Vector3(0, 0, 0);
            return getOrbitalPosition(b.data, simulationTime);
        });

        for (let i = 0; i < count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            
            // Original Y is 0 (plane)
            let y = -20; // Base level below the orbital plane

            // Calculate deflection
            for (let j = 0; j < bodies.length; j++) {
                const bodyPos = bodyPositions[j];
                const dx = x - bodyPos.x;
                const dz = z - bodyPos.z;
                const distSq = dx * dx + dz * dz;
                const dist = Math.sqrt(distSq);

                // Simple gravity well formula: - Mass / Distance
                // Clamped to avoid infinite spikes
                const influence = bodies[j].mass * 150 / (distSq + 500); 
                y -= influence;
            }

            positions.setY(i, y);
        }

        positions.needsUpdate = true;
        geometryRef.current.computeVertexNormals();
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -50, 0]}>
            <planeGeometry ref={geometryRef} args={[size, size, segments, segments]} />
            <meshStandardMaterial 
                color="#4444ff" 
                wireframe 
                transparent 
                opacity={0.3} 
                emissive="#2222aa"
                emissiveIntensity={0.5}
            />
        </mesh>
    );
}
