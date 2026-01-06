'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CheckCircle, Zap, Activity, Gauge, Lock } from 'lucide-react';
import { useSimulation } from '../context';
import { SHIP_CATALOG, ShipStats } from '../ships';

export function Dealership({ onClose }: { onClose: () => void }) {
    const { credits, currentShip, ownedShips, purchaseShip, equipShip } = useSimulation();
    const [selectedShipId, setSelectedShipId] = useState<string>(currentShip.id);

    const selectedShip = SHIP_CATALOG.find(s => s.id === selectedShipId) || currentShip;
    const isOwned = ownedShips.includes(selectedShip.id);
    const canAfford = credits >= selectedShip.price;
    const isEquipped = currentShip.id === selectedShip.id;

    // Helper to calculate bar widths (normalized roughly)
    const getWidth = (val: number, max: number) => Math.min(100, (val / max) * 100) + '%';

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-6">
            {/* LEFT: Ship List */}
            <div className="w-full md:w-1/3 bg-black/20 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 bg-white/5 border-b border-white/10">
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Available Hulls</h3>
                    <div className="text-zinc-500 text-xs mt-1">Select a vessel to view specifications</div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                    {SHIP_CATALOG.map(ship => {
                        const owned = ownedShips.includes(ship.id);
                        const equipped = currentShip.id === ship.id;
                        return (
                            <button
                                key={ship.id}
                                onClick={() => setSelectedShipId(ship.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden group
                                    ${selectedShipId === ship.id 
                                        ? 'bg-white/10 border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.1)]' 
                                        : 'bg-transparent border-white/5 hover:bg-white/5'}`}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <span className={`font-bold text-sm ${selectedShipId === ship.id ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                                        {ship.name}
                                    </span>
                                    {equipped ? (
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                                    ) : owned ? (
                                        <CheckCircle size={12} className="text-zinc-500" />
                                    ) : (
                                        <span className="text-[#DFFF00] font-mono text-xs">{ship.price > 0 ? `${(ship.price/1000).toFixed(0)}k` : 'FREE'}</span>
                                    )}
                                </div>
                                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1 relative z-10">
                                    {ship.manufacturer}
                                </div>
                                {/* Background tint based on ship color */}
                                {selectedShipId === ship.id && (
                                    <div 
                                        className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-current to-transparent opacity-10 pointer-events-none"
                                        style={{ color: ship.color }} 
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT: Selected Ship Details */}
            <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-current to-transparent opacity-10 pointer-events-none rounded-bl-full" style={{ color: selectedShip.color }} />
                
                <div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <div className="text-[#DFFF00] text-xs uppercase tracking-widest font-bold mb-1">{selectedShip.manufacturer}</div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{selectedShip.name}</h2>
                            <p className="text-zinc-400 text-sm mt-2 max-w-md">{selectedShip.description}</p>
                        </div>
                        <div className="text-right">
                             <div className="text-zinc-500 text-xs uppercase tracking-wider">Hull Cost</div>
                             <div className="text-3xl font-mono font-bold text-white">
                                 {selectedShip.price === 0 ? "FREE" : selectedShip.price.toLocaleString()} <span className="text-sm text-zinc-500">CR</span>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <StatBar label="Thruster Output (Accel)" value={selectedShip.acceleration} max={25} icon={Gauge} color="blue" />
                            <StatBar label="Maneuverability" value={selectedShip.turnSpeed} max={3.0} icon={Activity} color="emerald" />
                            <StatBar label="Boost Multiplier" value={selectedShip.boostMultiplier} max={25} icon={Zap} color="purple" />
                        </div>
                        <div className="space-y-4">
                            <StatBar label="Fuel Capacity" value={selectedShip.maxFuel} max={10000} icon={null} color="orange" />
                            <StatBar label="Boost Tank" value={selectedShip.maxBoost} max={500} icon={null} color="pink" />
                            <div className="pt-2">
                                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1 flex justify-between">
                                    <span>Efficiency Rating</span>
                                    <span className="text-white">{selectedShip.fuelBurnRate < 2.0 ? "HIGH" : selectedShip.fuelBurnRate > 3.0 ? "LOW" : "MED"}</span>
                                </div>
                                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-white" 
                                        style={{ width: `${Math.max(10, 100 - (selectedShip.fuelBurnRate / 4.0 * 100))}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
                    {isOwned ? (
                        isEquipped ? (
                            <button disabled className="px-8 py-3 bg-zinc-800 text-zinc-500 font-bold uppercase tracking-widest rounded-lg cursor-not-allowed">
                                Current Vessel
                            </button>
                        ) : (
                            <button 
                                onClick={() => equipShip(selectedShip.id)}
                                className="px-8 py-3 bg-white text-black hover:bg-[#DFFF00] font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg"
                            >
                                Equip Ship
                            </button>
                        )
                    ) : (
                        canAfford ? (
                            <button 
                                onClick={() => purchaseShip(selectedShip.id)}
                                className="px-8 py-3 bg-[#DFFF00] text-black hover:bg-white font-bold uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(223,255,0,0.3)] flex items-center gap-2"
                            >
                                <ShoppingCart size={16} /> Purchase
                            </button>
                        ) : (
                            <button disabled className="px-8 py-3 bg-red-900/30 text-red-400 border border-red-900 font-bold uppercase tracking-widest rounded-lg cursor-not-allowed flex items-center gap-2">
                                <Lock size={16} /> Insufficient Funds
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

function StatBar({ label, value, max, icon: Icon, color }: any) {
    const width = Math.min(100, (value / max) * 100);
    const colors: any = {
        blue: 'bg-blue-500',
        emerald: 'bg-emerald-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        pink: 'bg-pink-500'
    };
    
    return (
        <div>
            <div className="flex justify-between items-end mb-1">
                <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
                    {Icon && <Icon size={12} />} {label}
                </div>
                <div className="font-mono text-white text-xs font-bold">{value}</div>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    className={`h-full ${colors[color] || 'bg-white'} shadow-[0_0_10px_currentColor]`}
                />
            </div>
        </div>
    );
}