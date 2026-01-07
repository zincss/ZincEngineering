'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Navigation, Rocket, Disc, Orbit, Satellite, MapPin, Locate, Crosshair } from 'lucide-react';
import { useSimulation, getOrbitalPosition } from '../../context';
import { SPACESHIP_UPDATE_EVENT, formatDistance, DISTANCE_MULTIPLIER } from '../Scene/Spaceship/constants';
import * as THREE from 'three';

interface NavigationComputerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
}

export function NavigationComputer({ isOpen, onClose, onSelect }: NavigationComputerProps) {
    const { currentData, findBody, simulationTime } = useSimulation();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'planet' | 'station' | 'moon'>('all');
    const [shipPos, setShipPos] = useState<THREE.Vector3 | null>(null);
    const [shipSpeed, setShipSpeed] = useState(0);

    // Listen for ship position updates
    useEffect(() => {
        if (!isOpen) return;

        const handleUpdate = (e: any) => {
            if (e.detail.shipPos) {
                setShipPos(new THREE.Vector3(e.detail.shipPos.x, e.detail.shipPos.y, e.detail.shipPos.z));
            }
            if (e.detail.speed !== undefined) {
                setShipSpeed(e.detail.speed);
            }
        };
        window.addEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
        return () => window.removeEventListener(SPACESHIP_UPDATE_EVENT, handleUpdate);
    }, [isOpen]);

    const formatETA = (dist: number, speed: number) => {
        if (!speed || speed < 0.1) return "--:--";
        const seconds = dist / speed;
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    // Flatten and process data with distances
    const processedData = useMemo(() => {
        let items: any[] = [];
        const bodies = [...currentData];
        
        bodies.forEach(body => {
            // Calculate absolute position for distance
            let pos = getOrbitalPosition(body, simulationTime);
            
            items.push({
                ...body,
                position: pos,
                isMoon: false
            });

            if (body.moons) {
                body.moons.forEach(moon => {
                    let moonPos = getOrbitalPosition(moon, simulationTime);
                    moonPos.add(pos); // Add parent position
                    items.push({
                        ...moon,
                        position: moonPos,
                        isMoon: true,
                        parentName: body.name
                    });
                });
            }
        });

        // Calculate distances if shipPos is available
        if (shipPos) {
            items = items.map(item => ({
                ...item,
                currentDistance: item.position.distanceTo(shipPos)
            })).sort((a, b) => a.currentDistance - b.currentDistance);
        } else {
             items.sort((a, b) => a.name.localeCompare(b.name));
        }

        return items.filter(item => item.type !== 'Star' && item.type !== 'Black Hole');
    }, [currentData, simulationTime, shipPos]);

    const filteredItems = processedData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || 
                              (activeFilter === 'planet' && (item.type === 'Planet' || item.type === 'Dwarf Planet')) ||
                              (activeFilter === 'station' && item.type === 'Station') ||
                              (activeFilter === 'moon' && item.type === 'Moon');
        
        return matchesSearch && matchesFilter;
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-zinc-950/90 border border-[#DFFF00]/30 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-[0_0_100px_rgba(223,255,0,0.1)] overflow-hidden relative"
                    >
                        {/* DECORATIVE GRID */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(223,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(223,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                        {/* HEADER */}
                        <div className="relative z-10 p-6 border-b border-[#DFFF00]/20 flex justify-between items-center bg-black/40">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <div className="p-2 bg-[#DFFF00]/10 rounded border border-[#DFFF00]/30">
                                        <Navigation className="text-[#DFFF00]" size={24} />
                                    </div>
                                    Navigation Computer
                                </h2>
                                <div className="text-[#DFFF00]/60 font-mono text-xs uppercase tracking-[0.2em] mt-2 ml-1">
                                    System Cartography & Routing
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                                <X className="text-zinc-500 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* CONTROLS */}
                        <div className="relative z-10 p-4 bg-zinc-900/50 flex flex-col md:flex-row gap-4 border-b border-white/5 backdrop-blur-sm">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#DFFF00] transition-colors" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search Coordinates..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/60 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#DFFF00]/50 font-mono uppercase tracking-wider placeholder:text-zinc-600 transition-all focus:bg-black/80"
                                />
                            </div>
                            <div className="flex bg-black/60 rounded-lg p-1 border border-white/10">
                                {[
                                    { id: 'all', label: 'All', icon: Disc },
                                    { id: 'planet', label: 'Planets', icon: Orbit },
                                    { id: 'station', label: 'Stations', icon: Satellite },
                                    { id: 'moon', label: 'Moons', icon: MapPin },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveFilter(tab.id as any)}
                                        className={`px-4 py-2 rounded flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${
                                            activeFilter === tab.id 
                                            ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.3)]' 
                                            : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <tab.icon size={12} /> {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* LIST */}
                        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id}
                                    onClick={() => { onSelect(item.id); onClose(); }}
                                    className="group bg-zinc-900/40 border border-white/5 hover:border-[#DFFF00] hover:bg-[#DFFF00]/5 rounded-xl p-4 cursor-pointer transition-all duration-300 flex flex-col gap-3 relative overflow-hidden"
                                >
                                    {/* Tech Lines */}
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[url('/scan-lines.png')] opacity-10 pointer-events-none" />
                                    <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#DFFF00]/10 blur-xl rounded-full group-hover:bg-[#DFFF00]/20 transition-all" />

                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center border border-white/10 bg-black/60 shadow-inner ${
                                            item.type === 'Station' ? 'text-emerald-400 border-emerald-500/30' : 
                                            item.type === 'Planet' ? 'text-blue-400 border-blue-500/30' : 'text-zinc-400'
                                        }`}>
                                            {item.type === 'Station' ? <Satellite size={20} /> : 
                                             item.type === 'Moon' ? <MapPin size={18} /> : <Orbit size={24} />}
                                        </div>
                                        <div>
                                            <div className="text-white font-black uppercase text-sm md:text-base leading-none tracking-tight group-hover:text-[#DFFF00] transition-colors">{item.name}</div>
                                            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    item.type === 'Station' ? 'bg-emerald-500' :
                                                    item.type === 'Planet' ? 'bg-blue-500' : 'bg-zinc-500'
                                                }`} />
                                                {item.type} 
                                                {item.parentName && <span className="opacity-50">• {item.parentName}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-3 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">Distance</span>
                                            <span className="text-[#DFFF00] font-mono text-xs font-bold mt-0.5">
                                                {item.currentDistance ? formatDistance(item.currentDistance - item.radius) : 'CALC...'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">ETA</span>
                                            <span className="text-white font-mono text-xs font-bold mt-0.5">
                                                {item.currentDistance ? formatETA(item.currentDistance - item.radius, shipSpeed) : '--:--'}
                                            </span>
                                        </div>
                                    </div>

                                    <button className="relative z-10 w-full mt-1 py-2.5 bg-[#DFFF00]/5 hover:bg-[#DFFF00] border border-[#DFFF00]/20 hover:border-[#DFFF00] text-[#DFFF00] hover:text-black rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(223,255,0,0.3)]">
                                        <Crosshair size={14} className="animate-spin-slow group-hover:animate-none" /> 
                                        Lock Target
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}