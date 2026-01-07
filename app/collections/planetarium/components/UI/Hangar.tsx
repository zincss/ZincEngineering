'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Clock, MapPin, Check, Plane } from 'lucide-react';
import { useSimulation, formatTime } from '../../context';
import { SHIP_CATALOG } from '../../ships';

export function Hangar({ onClose }: { onClose: () => void }) {
    const { 
        ownedShips, currentShip, equipShip, shipLocations, recallShip, 
        shipTransfers, dockedAt, findBody 
    } = useSimulation();

    // Group ships: Active, At Station, Elsewhere
    const activeShipId = currentShip.id;
    const shipsAtStation: string[] = [];
    const shipsElsewhere: string[] = [];

    ownedShips.forEach(id => {
        if (id === activeShipId) return;
        
        const loc = shipLocations[id];
        // If loc is current station OR loc is undefined/null (assume at current if not tracked elsewhere? No, default is 'earth')
        // Actually, if we just bought it, it's at 'dockedAt'.
        
        if (loc === dockedAt) {
            shipsAtStation.push(id);
        } else {
            shipsElsewhere.push(id);
        }
    });

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: ACTIVE SHIP */}
            <div className="col-span-1">
                <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-3">Active Vessel</div>
                <div className="bg-[#DFFF00]/10 border border-[#DFFF00] rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Rocket size={64} className="text-[#DFFF00]" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white uppercase">{currentShip.name}</h3>
                        <div className="text-[#DFFF00] font-mono text-sm mb-4">{currentShip.manufacturer}</div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-400">
                            <div>
                                <span className="block uppercase text-[10px] text-zinc-600">Class</span>
                                Tier {currentShip.tier}
                            </div>
                            <div>
                                <span className="block uppercase text-[10px] text-zinc-600">Mining Cap</span>
                                {currentShip.miningCap || 0} Units
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: STORED SHIPS */}
            <div className="col-span-1">
                <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-3">Station Hangar</div>
                <div className="space-y-3">
                    {shipsAtStation.length === 0 ? (
                        <div className="text-zinc-600 text-sm italic py-4 border border-dashed border-zinc-800 rounded-xl text-center">
                            No other ships in local hangar.
                        </div>
                    ) : (
                        shipsAtStation.map(id => {
                            const ship = SHIP_CATALOG.find(s => s.id === id);
                            if (!ship) return null;
                            return (
                                <div key={id} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-white/30 transition-all">
                                    <div>
                                        <div className="text-white font-bold">{ship.name}</div>
                                        <div className="text-zinc-500 text-[10px] font-mono uppercase">{ship.manufacturer}</div>
                                    </div>
                                    <button 
                                        onClick={() => equipShip(id)}
                                        className="bg-white/10 hover:bg-[#DFFF00] hover:text-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                                    >
                                        Equip
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-3 mt-8">Off-World Storage</div>
                <div className="space-y-3">
                    {shipsElsewhere.length === 0 ? (
                        <div className="text-zinc-600 text-sm italic py-4 border border-dashed border-zinc-800 rounded-xl text-center">
                            All ships accounted for.
                        </div>
                    ) : (
                        shipsElsewhere.map(id => {
                            const ship = SHIP_CATALOG.find(s => s.id === id);
                            const locId = shipLocations[id] || 'Unknown';
                            const locName = findBody(locId)?.name || locId;
                            const transfer = shipTransfers[id];

                            if (!ship) return null;

                            return (
                                <div key={id} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-white font-bold opacity-70">{ship.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin size={10} className="text-zinc-500" />
                                            <div className="text-zinc-500 text-[10px] font-mono uppercase">{locName}</div>
                                        </div>
                                    </div>
                                    
                                    {transfer ? (
                                        <div className="bg-blue-900/30 border border-blue-500/30 px-3 py-2 rounded-lg flex items-center gap-3">
                                            <Plane size={14} className="text-blue-400 animate-pulse" />
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-blue-300 font-bold uppercase">In Transit</span>
                                                <span className="text-[10px] text-white font-mono">
                                                    {formatTime((transfer.arrivalTime - Date.now()) / 1000)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => recallShip(id)}
                                            className="bg-black border border-white/20 hover:border-[#DFFF00] text-zinc-400 hover:text-[#DFFF00] px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                                        >
                                            <Clock size={12} /> Recall Ship
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}