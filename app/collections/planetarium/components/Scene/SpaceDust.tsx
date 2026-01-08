'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation } from '../../context';

export function DynamicSpaceDust({ count = 2000 }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { speed } = useSimulation(); // Ship speed from context
    const { camera } = useThree();
    
    // Create random initial positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 400;
            const y = (Math.random() - 0.5) * 400;
            const z = (Math.random() - 0.5) * 400;
            temp.push({ x, y, z, originalZ: z });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        if (!mesh.current) return;

        // Visual speed factor - adjust for aesthetic 'rush'
        // Base drift + ship speed contribution
        // We assume the ship moves 'forward' in -Z for the dust effect relative to camera
        const velocity = 2 + (speed * 2.5); 
        
        particles.forEach((particle, i) => {
            // Move particle towards camera (assuming camera looks down -Z effectively in local space or dust moves +Z)
            // Actually, usually dust flies *past* the camera.
            // Let's move dust +Z (towards camera) so it flies past.
            particle.z += velocity * delta * 20;

            // Reset if behind camera or too far
            if (particle.z > 200) {
                particle.z = -300; // Reset far ahead
                particle.x = (Math.random() - 0.5) * 400; // Scramble X/Y for variety
                particle.y = (Math.random() - 0.5) * 400;
            }

            // Stretch based on speed (warp effect)
            const stretch = Math.max(1, Math.min(velocity / 10, 20));
            
            dummy.position.set(particle.x, particle.y, particle.z);
            dummy.scale.set(1, 1, stretch); // Stretch in Z
            dummy.updateMatrix();
            
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
        
        // Keep the dust cloud centered on the camera roughly, but separate from rotation
        if (mesh.current.parent) {
             mesh.current.position.copy(camera.position);
             // Inverse rotation so dust feels "world space" but follows position? 
             // Actually simplest is to lock it to camera position but NOT rotation, 
             // so looking around sees different dust.
             mesh.current.quaternion.copy(camera.quaternion); 
        }
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
            <boxGeometry args={[0.2, 0.2, 0.8]} />
            <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.4} 
                blending={THREE.AdditiveBlending} 
            />
        </instancedMesh>
    );
}
