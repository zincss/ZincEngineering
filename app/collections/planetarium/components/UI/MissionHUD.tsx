'use client';

import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Briefcase, Navigation } from 'lucide-react';
import { useSimulation, getOrbitalPosition } from '../../context';
import { PLANET_DATA } from '../../data';
import { DISTANCE_MULTIPLIER, formatDistance, formatTime } from '../../constants';

export function MissionHUD() {
    const { activeJob, findBody, simulationTime } = useSimulation();
    const [distance, setDistance] = useState(0);
    const [eta, setEta] = useState(0);
    const [shipSpeed, setShipSpeed] = useState(0);

    const dest = activeJob ? findBody(activeJob.destId) : null;

    useEffect(() => {
        if (!activeJob) {
            setDistance(0);
            setEta(0);
            return;
        }

        const handleUpdate = (e: any) => {
            const shipPos = e.detail.shipPos;
            const speed = e.detail.speed;
            setShipSpeed(speed);

            if (shipPos && dest) {
                if (e.detail.targetId === activeJob.destId) {
                    setDistance(e.detail.targetDist);
                } else {
                    // Fallback Calculation
                    let destPos = getOrbitalPosition(dest, simulationTime);
                    // Handle moon parent offset
                    const parent = PLANET_DATA.find(p => p.moons?.some(m => m.id === dest.id));
                    if (parent) {
                        const parentPos = getOrbitalPosition(parent, simulationTime);
                        destPos.add(parentPos);
                    }
                    const d = new THREE.Vector3(shipPos.x, shipPos.y, shipPos.z).distanceTo(destPos);
                    setDistance(Math.max(0, d - dest.radius));
                }
            }
        };
        window.addEventListener('spaceship-update', handleUpdate);
        return () => window.removeEventListener('spaceship-update', handleUpdate);
    }, [activeJob, dest, simulationTime]);

    // Calc ETA
    useEffect(() => {
        if (shipSpeed > 1 && distance > 0) {
            setEta(distance / shipSpeed);
        } else {
            setEta(0);
        }
    }, [shipSpeed, distance]);

    if (!activeJob) return null;

    return (
        <div className="fixed top-24 left-4 z-40 animate-in slide-in-from-left duration-500">
            <div className="bg-black/60 backdrop-blur-md border-l-2 border-[#DFFF00] p-4 rounded-r-xl max-w-[250px]">
                <div className="flex items-center gap-2 text-[#DFFF00] mb-1">
                    <Briefcase size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Contract</span>
                </div>
                <div className="text-white font-bold text-sm leading-tight mb-2">
                    {activeJob.description}
                </div>
                <div className="flex flex-col gap-1 text-zinc-400 text-xs">
                    <div className="flex items-center gap-2">
                        <Navigation size={12} />
                        <span>Target: {dest?.name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 border-t border-white/10 pt-2">
                        <span>DIST: {distance > 0 ? formatDistance(distance) : '---'}</span>
                        <span className={eta > 0 ? "text-[#DFFF00]" : ""}>ETA: {formatTime(eta)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
