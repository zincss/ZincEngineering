'use client';

import React from 'react';
import { Hammer, Cpu, Zap, Box, Database, Sparkles, Layers } from 'lucide-react';
import { Material } from '../types';
import { motion } from 'framer-motion';

interface MaterialsViewProps {
    materials: Material[];
}

const MATERIAL_MAP: Record<string, { icon: any, color: string, description: string }> = {
    'BASIC_SCRAP': { icon: Box, color: 'text-zinc-500', description: 'Raw metals salvaged from common grade assets.' },
    'UNCOMMON_CIRCUITS': { icon: Cpu, color: 'text-emerald-500', description: 'Functional electronics for mid-tier machinery.' },
    'RARE_ALLOY': { icon: Database, color: 'text-blue-500', description: 'Reinforced plating for high-stress operations.' },
    'PLASMA_CORE': { icon: Zap, color: 'text-orange-500', description: 'Energetic components extracted from epic gear.' },
    'VOID_CRYSTAL': { icon: Layers, color: 'text-purple-500', description: 'Extradimensional shards with unstable properties.' },
    'QUANTUM_SHARD': { icon: Sparkles, color: 'text-[#DFFF00]', description: 'The fundamental building blocks of Zenith technology.' },
    'COSMIC_DUST': { icon: Database, color: 'text-pink-500', description: 'Trace remains of anomalous interstellar objects.' }
};

export const MaterialsView = ({ materials }: MaterialsViewProps) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(MATERIAL_MAP).map(([type, config]) => {
                    const mat = materials.find(m => m.material_type === type);
                    const quantity = mat?.quantity || 0;
                    
                    return (
                        <motion.div 
                            key={type} 
                            whileHover={{ y: -5 }}
                            className={`group relative bg-zinc-950 border border-zinc-800 p-6 rounded-[2rem] overflow-hidden transition-all hover:border-zinc-600 shadow-xl ${quantity === 0 ? 'opacity-40 grayscale' : ''}`}
                        >
                            <div className="relative z-10 flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 ${config.color} shadow-inner shadow-black/50`}>
                                    <config.icon size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-sm font-black uppercase text-white tracking-wider truncate">
                                            {type.replace('_', ' ')}
                                        </h3>
                                        <span className={`text-xl font-black font-mono ${config.color}`}>x{quantity}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-tight line-clamp-2">
                                        {config.description}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Visual Detail */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                <Hammer size={80} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            {materials.length === 0 && (
                <div className="mt-12 py-32 text-center text-zinc-700 font-mono flex flex-col items-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
                    <Hammer size={48} className="mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Resource Cache Offline</p>
                    <p className="text-[9px] mt-2 text-zinc-800 uppercase">Dismantle assets to aggregate components</p>
                </div>
            )}
        </div>
    );
};