'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Thermometer, Clock, Calendar, Minimize2, Maximize2, 
    Orbit, Satellite, Sparkles, X 
} from 'lucide-react';
import { useSimulation } from '../../context';

export function DetailPanel({ id, onClose }: { id: string | null, onClose: () => void }) {
    const { findBody, activeSystem, setActiveSystem } = useSimulation();
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (id) setIsMinimized(false);
    }, [id]);

    if (!id) return null;
    const data = findBody(id);
    if (!data) return null;

    return (
        <AnimatePresence mode="wait">
            <div className={`
                fixed z-40 pointer-events-none
                bottom-24 left-4 right-4 
                md:bottom-28 md:left-0 md:right-0 md:flex md:justify-center
            `}>
                <motion.div
                    key={id}
                    layout="position"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{
                        layout: { duration: 0.4, type: "spring", bounce: 0, damping: 25, stiffness: 120 },
                        opacity: { duration: 0.3 }
                    }}
                    className={`
                        pointer-events-auto relative
                        bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
                        overflow-hidden flex flex-col
                        w-auto
                        ${isMinimized
                            ? 'rounded-full md:min-w-[300px]'
                            : 'rounded-2xl md:min-w-[600px] md:max-w-3xl'
                        }
                    `}
                >
                    <motion.div
                        layout="position"
                        className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors relative z-20 border-b border-white/5"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-7 h-7 rounded-full flex items-center justify-center
                                shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10
                                ${data.type === 'Star' ? 'bg-orange-500/20 text-orange-500' :
                                    data.type === 'Planet' ? 'bg-blue-500/20 text-blue-500' :
                                        data.type === 'Station' ? 'bg-[#DFFF00]/20 text-[#DFFF00]' :
                                            'bg-zinc-700/50 text-zinc-400'}
                            `}>
                                {data.type === 'Station' ? <Satellite size={14} /> : <Orbit size={14} />}
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="flex items-baseline gap-2">
                                    <h1 className="text-base font-black text-white uppercase tracking-tighter leading-none">{data.name}</h1>
                                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">{data.type}</span>
                                </div>
                                {isMinimized && <div className="text-[9px] text-zinc-400 truncate max-w-[200px] mt-0.5">{data.description}</div>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pl-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="p-1.5 rounded-full hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>

                    <AnimatePresence mode="popLayout">
                        {!isMinimized && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                                className="relative z-10"
                            >
                                <div className="px-5 py-4 bg-black/20">
                                    <div className="grid grid-cols-1 md:grid-cols-[1.3fr,1fr] gap-5 items-start">
                                        <div className="flex flex-col h-full justify-between gap-3">
                                            <p className="text-zinc-300 leading-snug text-xs font-light pr-2">
                                                {data.description}
                                            </p>

                                            <div className="mt-1">
                                                {id === 'sun' && activeSystem === 'solar' && (
                                                    <button
                                                        onClick={() => { onClose(); setActiveSystem('fantasy'); }}
                                                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg border border-indigo-400/30 transition-all shadow-lg shadow-indigo-900/20 group"
                                                    >
                                                        <Sparkles size={14} className="text-white group-hover:rotate-12 transition-transform" />
                                                        <span className="text-white font-bold uppercase tracking-widest text-[10px]">Warp to Zinc Prime</span>
                                                    </button>
                                                )}

                                                {id === 'zinc_prime_stars' && activeSystem === 'fantasy' && (
                                                    <button
                                                        onClick={() => { onClose(); setActiveSystem('solar'); }}
                                                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-orange-700 hover:bg-orange-600 rounded-lg border border-orange-500/30 transition-all shadow-lg shadow-orange-900/20 group"
                                                    >
                                                        <ArrowLeft size={14} className="text-white group-hover:-translate-x-1 transition-transform" />
                                                        <span className="text-white font-bold uppercase tracking-widest text-[10px]">Return to Sol</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {[
                                                    { icon: Thermometer, label: 'Temp', val: data.stats.temp, color: 'blue' },
                                                    { icon: Clock, label: 'Day', val: data.stats.day, color: 'purple' },
                                                    { icon: Calendar, label: 'Year', val: data.stats.year, color: 'green' }
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-white/5 p-1.5 rounded-lg border border-white/5 flex flex-col items-center text-center">
                                                        <stat.icon size={12} className={`text-${stat.color}-400 mb-0.5`} />
                                                        <div className="text-[8px] text-zinc-500 uppercase tracking-widest scale-90 origin-center">{stat.label}</div>
                                                        <div className="text-[10px] font-mono text-white font-bold mt-0.5 whitespace-nowrap">{stat.val}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {data.moons && data.moons.length > 0 ? (
                                                <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                                    <div className="flex items-center gap-1.5 mb-1.5 opacity-60">
                                                        <Satellite size={10} className="text-zinc-400" />
                                                        <h3 className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest">Orbital Bodies</h3>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto custom-scrollbar">
                                                        {data.moons.map((m, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-black/40 rounded text-[9px] text-zinc-300 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                                                {m.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-zinc-600 text-[9px] uppercase tracking-widest min-h-[50px]">
                                                    No Satellites
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="hidden md:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-5 bg-black/80 backdrop-blur-2xl border-x border-white/10 [clip-path:polygon(5%_0%,95%_0%,100%_100%,0%_100%)] z-0">
                        <div className="absolute top-0 left-0 w-full h-px bg-white/5" />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
