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
    const segments = 256;

    // Filter massive bodies for gravity influence
    const bodies = useMemo(() => {
        return PLANET_DATA.filter(p => p.radius > 5).map(p => ({
            id: p.id,
            mass: p.id === 'sun' ? 800 : p.radius * 8, // Boost mass visual
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
            let y = -30; // Base level below the orbital plane

            // Calculate deflection
            for (let j = 0; j < bodies.length; j++) {
                const bodyPos = bodyPositions[j];
                const dx = x - bodyPos.x;
                const dz = z - bodyPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                // Deep funnel formula: - Mass * exp(-distance / spread)
                // This creates a sharp "well" look
                const spread = bodies[j].id === 'sun' ? 150 : 40;
                const depth = bodies[j].mass * 2.5;
                
                // Gaussian-like curve for smooth but deep wells
                const influence = depth * Math.exp(-dist / spread);
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
            <meshBasicMaterial 
                color="#00FF41" 
                wireframe 
                transparent 
                opacity={0.15} 
            />
        </mesh>
    );
}
