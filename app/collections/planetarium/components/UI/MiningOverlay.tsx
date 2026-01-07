'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pickaxe, Box, ArrowRight, X } from 'lucide-react';
import { useSimulation, MINING_RESOURCES } from '../../context';

export function MiningOverlay() {
    const { miningState, stopMining, inventory, currentShip, mineAsteroid } = useSimulation();
    
    // Calculate current cargo load
    const currentLoad = useMemo(() => {
        return Object.values(inventory).reduce((acc, qty) => acc + qty, 0);
    }, [inventory]);

    const maxLoad = currentShip.miningCap || 0;
    const loadPercent = Math.min(100, (currentLoad / (maxLoad || 1)) * 100);

    if (!miningState.isMining) return null;

    return (
        <div className="absolute top-24 left-4 z-50 flex flex-col gap-2 w-64 pointer-events-none">
            {/* STATUS PANEL */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-black/80 border border-purple-500/30 rounded-lg p-3 backdrop-blur-md pointer-events-auto"
            >
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs tracking-wider">
                        <Pickaxe size={14} className="animate-pulse" />
                        Mining Mode
                    </div>
                    <button 
                        onClick={stopMining}
                        className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
                
                {/* CARGO BAR */}
                <div className="mb-3">
                    <div className="flex justify-between text-[10px] uppercase font-mono text-zinc-400 mb-1">
                        <span>Cargo Hold</span>
                        <span className={loadPercent >= 100 ? "text-red-500 font-bold" : "text-white"}>
                            {currentLoad} / {maxLoad}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                            className={`h-full ${loadPercent >= 100 ? 'bg-red-500' : 'bg-purple-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${loadPercent}%` }}
                        />
                    </div>
                </div>

                {/* INVENTORY LIST */}
                <div className="space-y-1">
                    {Object.entries(inventory).map(([res, qty]) => {
                        const meta = (MINING_RESOURCES as any)[res];
                        if (!meta || qty === 0) return null;
                        return (
                            <div key={res} className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-1 last:border-0">
                                <span style={{ color: meta.color }}>{meta.name}</span>
                                <span className="text-white">x{qty}</span>
                            </div>
                        );
                    })}
                    {Object.keys(inventory).length === 0 && (
                        <div className="text-[10px] text-zinc-600 text-center italic py-2">
                            Cargo Hold Empty
                        </div>
                    )}
                </div>
            </motion.div>
            
            {/* INSTRUCTIONS */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 border border-white/10 rounded px-3 py-2 text-[10px] text-zinc-400 text-center font-mono pointer-events-auto"
            >
                Click asteroids to mine.
                <br />
                Return to station to sell.
            </motion.div>
        </div>
    );
}