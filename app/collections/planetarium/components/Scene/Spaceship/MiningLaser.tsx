import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function MiningLaser({ active, color = '#a855f7' }: { active: boolean, color?: string }) {
    const leftLaser = useRef<THREE.Mesh>(null);
    const rightLaser = useRef<THREE.Mesh>(null);
    const impactPoint = useRef<THREE.Group>(null);
    
    // Laser Geometry: Thin long cylinder
    // Origin is center, so we need to offset it so it shoots "forward"
    
    useFrame((state) => {
        if (!active) return;
        
        const time = state.clock.elapsedTime;
        const pulse = 0.8 + Math.sin(time * 20) * 0.2;
        
        if (leftLaser.current) {
            (leftLaser.current.material as THREE.MeshBasicMaterial).opacity = pulse;
            leftLaser.current.scale.set(1, 1, 1 + Math.random() * 0.1);
        }
        if (rightLaser.current) {
            (rightLaser.current.material as THREE.MeshBasicMaterial).opacity = pulse;
            rightLaser.current.scale.set(1, 1, 1 + Math.random() * 0.1);
        }
    });

    if (!active) return null;

    const length = 1000;

    return (
        <group>
            {/* LEFT LASER */}
            <mesh ref={leftLaser as any} position={[-2, -2, -length/2]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, length, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </mesh>
            
            {/* RIGHT LASER */}
            <mesh ref={rightLaser as any} position={[2, -2, -length/2]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, length, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    );
}