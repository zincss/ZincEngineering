import React, { useMemo } from 'react';
import * as THREE from 'three';

export function ProceduralShip({ color = '#DFFF00', engineColor = '#00FFFF' }: { color?: string, engineColor?: string }) {
    
    // Create a cool, low-poly sci-fi ship geometry
    const shipGeo = useMemo(() => {
        const group = new THREE.Group();

        // MAIN HULL
        const hullGeo = new THREE.ConeGeometry(1, 4, 6);
        hullGeo.rotateX(Math.PI / 2);
        const hullMat = new THREE.MeshStandardMaterial({ 
            color: color, 
            roughness: 0.3,
            metalness: 0.8,
            flatShading: true
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        group.add(hull);

        // COCKPIT
        const cockpitGeo = new THREE.BoxGeometry(0.8, 0.4, 1.5);
        cockpitGeo.translate(0, 0.5, 0.5);
        const cockpitMat = new THREE.MeshStandardMaterial({ 
            color: '#111', 
            roughness: 0.2, 
            metalness: 0.9 
        });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        group.add(cockpit);

        // WINGS
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(2, -1);
        wingShape.lineTo(2, -2);
        wingShape.lineTo(0.5, -0.5);
        wingShape.lineTo(0, 0);

        const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.2, bevelEnabled: false });
        wingGeo.rotateX(-Math.PI / 2);
        
        const wingMat = new THREE.MeshStandardMaterial({ 
            color: '#333', 
            roughness: 0.5, 
            metalness: 0.5 
        });

        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(0.5, 0, 1);
        group.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(-0.5, 0, 1);
        rightWing.scale.x = -1; // Mirror
        group.add(rightWing);

        // ENGINES
        const engineGeo = new THREE.CylinderGeometry(0.3, 0.5, 1, 8);
        engineGeo.rotateX(Math.PI / 2);
        const engineMat = new THREE.MeshStandardMaterial({ color: '#555' });
        
        const leftEngine = new THREE.Mesh(engineGeo, engineMat);
        leftEngine.position.set(1, 0, 2);
        group.add(leftEngine);

        const rightEngine = new THREE.Mesh(engineGeo, engineMat);
        rightEngine.position.set(-1, 0, 2);
        group.add(rightEngine);

        // ENGINE GLOW
        const glowGeo = new THREE.CircleGeometry(0.4, 16);
        const glowMat = new THREE.MeshBasicMaterial({ color: engineColor });
        
        const leftGlow = new THREE.Mesh(glowGeo, glowMat);
        leftGlow.position.set(0, -0.55, 0);
        leftGlow.rotateX(Math.PI / 2);
        leftEngine.add(leftGlow);

        const rightGlow = new THREE.Mesh(glowGeo, glowMat);
        rightGlow.position.set(0, -0.55, 0);
        rightGlow.rotateX(Math.PI / 2);
        rightEngine.add(rightGlow);

        return group;
    }, [color, engineColor]);

    return <primitive object={shipGeo} />;
}