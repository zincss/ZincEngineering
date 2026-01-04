'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';

export function SystemControls({ 
    targetId, 
    refs, 
    isCinematic, 
    isSpaceshipMode 
}: { 
    targetId: string | null, 
    refs: any, 
    isCinematic: boolean, 
    isSpaceshipMode?: boolean 
}) {
    const controlsRef = useRef<CameraControls>(null);
    const prevTargetPos = useRef(new THREE.Vector3());
    const prevTargetId = useRef<string | null>(null);

    // 1. Initial Setup
    useEffect(() => {
        if (controlsRef.current && !targetId && !isCinematic && !isSpaceshipMode) {
            controlsRef.current.setLookAt(0, 600, 800, 0, 0, 0, true);
        }
    }, []);

    // 2. Focus Logic
    useEffect(() => {
        if (!controlsRef.current || isCinematic || isSpaceshipMode) return;

        // Target Focus
        if (targetId) {
            if (targetId === 'sun') {
                controlsRef.current.setLookAt(0, 100, 250, 0, 0, 0, true);
                return;
            }
            if (targetId === 'sagittarius_a' && refs.current['sagittarius_a']) {
                 const bhGroup = refs.current['sagittarius_a'];
                 const pos = new THREE.Vector3();
                 bhGroup.getWorldPosition(pos);
                 controlsRef.current.setLookAt(
                     pos.x + 150, pos.y + 50, pos.z + 150, 
                     pos.x, pos.y, pos.z,                  
                     true
                 );
                 return;
            }

            if (refs.current[targetId]) {
                const targetObj = refs.current[targetId];
                controlsRef.current.fitToBox(targetObj, true, { paddingLeft: 4, paddingRight: 4, paddingTop: 4, paddingBottom: 4 });
            }
        } 
    }, [targetId, refs, isCinematic, isSpaceshipMode]);

    // 3. Lock Logic
    useFrame(() => {
        if (isCinematic || isSpaceshipMode || !targetId) {
            prevTargetId.current = null;
            return; 
        }
        
        if (targetId !== 'sun' && targetId !== 'sagittarius_a' && refs.current[targetId] && controlsRef.current) {
            const targetObj = refs.current[targetId];
            const currentTargetPos = new THREE.Vector3();
            targetObj.getWorldPosition(currentTargetPos);

            if (targetId === prevTargetId.current) {
                const delta = new THREE.Vector3().subVectors(currentTargetPos, prevTargetPos.current);
                if (delta.lengthSq() > 0.000001) {
                    const currentCamPos = controlsRef.current.camera.position;
                    const currentLookAt = new THREE.Vector3();
                    controlsRef.current.getTarget(currentLookAt);

                    controlsRef.current.setPosition(
                        currentCamPos.x + delta.x, 
                        currentCamPos.y + delta.y, 
                        currentCamPos.z + delta.z, 
                        false 
                    );
                    controlsRef.current.setTarget(
                        currentLookAt.x + delta.x,
                        currentLookAt.y + delta.y,
                        currentLookAt.z + delta.z,
                        false
                    );
                }
            }

            prevTargetPos.current.copy(currentTargetPos);
            prevTargetId.current = targetId;
        }
    });

    return (
        <CameraControls 
            ref={controlsRef} 
            maxDistance={50000} 
            minDistance={0.001} 
            smoothTime={1.2} 
            enabled={!isCinematic && !isSpaceshipMode} 
        />
    );
}