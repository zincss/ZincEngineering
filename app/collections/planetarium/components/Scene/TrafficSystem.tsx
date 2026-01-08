'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation, PLANET_DATA } from '../../context';

// Simple ship geometry for distant traffic
const TrafficShipGeometry = () => (
    <coneGeometry args={[0.5, 2, 8]} />
);

// Route Definition
interface Route {
    startId: string;
    endId: string;
    color: string;
    trafficDensity: number; // Ships per route
}

const ROUTES: Route[] = [
    { startId: 'earth', endId: 'moon', color: '#55aaff', trafficDensity: 8 },
    { startId: 'earth', endId: 'mars', color: '#ffaa55', trafficDensity: 6 },
    { startId: 'mars', endId: 'earth', color: '#ffaa55', trafficDensity: 6 },
    { startId: 'moon', endId: 'iss', color: '#ffffff', trafficDensity: 4 },
    { startId: 'earth', endId: 'iss', color: '#ffffff', trafficDensity: 5 },
    { startId: 'mars', endId: 'dreadnaught', color: '#ff4444', trafficDensity: 5 },
];

export function TrafficSystem() {
    const { findBody, simulationTime, getOrbitalPosition } = useSimulation();
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate static fleet data
    const fleet = useMemo(() => {
        const ships = [];
        let index = 0;

        for (const route of ROUTES) {
            for (let i = 0; i < route.trafficDensity; i++) {
                ships.push({
                    id: index++,
                    route,
                    offset: Math.random(), // 0 to 1 progress along route
                    speed: 0.005 + Math.random() * 0.01, // Random speed
                    laneOffset: new THREE.Vector3(
                        (Math.random() - 0.5) * 5, 
                        (Math.random() - 0.5) * 2, 
                        (Math.random() - 0.5) * 5
                    ) // Slight spread so they aren't in a perfect line
                });
            }
        }
        return ships;
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        fleet.forEach((ship, i) => {
            const startBody = findBody(ship.route.startId);
            const endBody = findBody(ship.route.endId);

            if (startBody && endBody) {
                // Get current positions of bodies (they move!)
                const startPos = getOrbitalPosition(startBody, simulationTime);
                const endPos = getOrbitalPosition(endBody, simulationTime);

                // Update progress
                // The distance varies, so constant speed means variable duration
                // For simplicity, we just cycle 0-1
                ship.offset += ship.speed * delta * 0.5; // Adjust speed scale
                if (ship.offset > 1) ship.offset = 0;

                // Linear interpolation + Lane Offset
                // A simple curve could be added by lerping height, but linear is fine for "cruise"
                const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, ship.offset);
                currentPos.add(ship.laneOffset);

                // Orientation: Look at destination
                dummy.position.copy(currentPos);
                dummy.lookAt(endPos);
                dummy.scale.set(1, 1, 1);
                
                // Pulsing effect for engine
                const pulse = 1 + Math.sin(state.clock.elapsedTime * 10 + ship.id) * 0.2;
                dummy.scale.multiplyScalar(pulse);

                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
                
                // Color update (optional, if we used instanceColor)
                // meshRef.current.setColorAt(i, new THREE.Color(ship.route.color));
            } else {
                // Hide if invalid route (e.g. body not found)
                dummy.scale.set(0,0,0);
                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
            }
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined, undefined, fleet.length]} frustumCulled={false}>
                <coneGeometry args={[1, 4, 8]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </instancedMesh>
        </group>
    );
}
