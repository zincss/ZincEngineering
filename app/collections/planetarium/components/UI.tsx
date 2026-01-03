'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../context'; 
import { ArrowLeft, Thermometer, Clock, Calendar, Minimize2, Orbit, Satellite, Film, Sparkles, Eye, EyeOff, Tag, Crosshair, Shuffle, BarChart3 } from 'lucide-react';

export function CinematicMenu({ onSelectTour }: { onSelectTour: (id: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const tours = [
        { id: 'random', label: 'Random Commercial Flight', desc: 'Book a seat on a random system transit.', duration: '2m', icon: <Shuffle size={14} className="text-[#DFFF00]" /> },
        { id: 'grand_tour', label: 'Grand Tour', desc: 'The classic celestial journey.', duration: '5m' },
        { id: 'scale_comparison', label: 'Cosmic Scale', desc: 'Size comparison lineup.', duration: '2m', icon: <BarChart3 size={14} className="text-[#DFFF00]" /> },
        { id: 'earth_mars_transfer', label: 'Mars Transfer', desc: 'Accelerated cinematic journey.', duration: '5m' },
        { id: 'jovian_leap', label: 'The Jovian Leap', desc: 'Europa to Ganymede transfer.', duration: '3m' },
        { id: 'oumuamua_visit', label: 'Oumuamua', desc: 'The first interstellar visitor.', duration: '3m' },
        { id: 'voyager_1', label: 'Voyager 1', desc: 'The historic 45-year mission.', duration: '1h' }
    ];
    return (
        <div className="relative flex-1 md:flex-initial">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-center gap-2 px-4 md:px-6 py-3 font-bold uppercase tracking-widest rounded-full transition-all text-xs md:text-sm bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
                <Film size={16} className="text-[#DFFF00]" /> 
                <span className="whitespace-nowrap">Scenic Flight</span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full mt-2 left-0 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] flex flex-col gap-1"
                    >
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 px-3 py-2 font-mono border-b border-white/5 mb-2">Select Program</div>
                        {tours.map(tour => (
                            <button
                                key={tour.id}
                                onClick={() => { onSelectTour(tour.id); setIsOpen(false); }}
                                className="text-left p-3 rounded-xl hover:bg-white/10 transition-colors group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-center mb-1 relative z-10">
                                    <div className="text-white font-bold text-sm group-hover:text-[#DFFF00] transition-colors flex items-center gap-2">
                                        {tour.icon && tour.icon}
                                        {tour.label}
                                    </div>
                                    <div className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300">{tour.duration}</div>
                                </div>
                                <div className="text-xs text-zinc-500 relative z-10">{tour.desc}</div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function DetailPanel({ id, onClose }: { id: string | null, onClose: () => void }) {
    const { findBody, activeSystem, setActiveSystem } = useSimulation();
    
    if (!id) return null;
    const data = findBody(id);
    if (!data) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-24 right-4 w-full max-w-sm bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 z-30 shadow-2xl overflow-hidden max-h-[75vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                         <span className="text-[#DFFF00] text-[10px] font-mono uppercase tracking-widest border border-[#DFFF00]/20 bg-[#DFFF00]/5 px-2 py-0.5 rounded mb-2 inline-block">
                            {data.type}
                        </span>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{data.name}</h1>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                        <Minimize2 size={18} />
                    </button>
                </div>

                <div className="h-0.5 w-16 bg-[#DFFF00] mb-4" />
                
                {/* --- WARP BUTTONS --- */}
                {id === 'sun' && activeSystem === 'solar' && (
                    <button 
                        onClick={() => { onClose(); setActiveSystem('fantasy'); }}
                        className="w-full mb-6 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl border border-purple-500/30 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(88,28,135,0.4)] group"
                    >
                        <Sparkles size={18} className="text-purple-300 group-hover:rotate-12 transition-transform" />
                        <span className="text-white font-bold uppercase tracking-widest text-xs">Warp to Zinc Prime</span>
                    </button>
                )}
                
                {/* Return Button for Zinc Binary */}
                {id === 'zinc_prime_stars' && activeSystem === 'fantasy' && (
                    <button 
                        onClick={() => { onClose(); setActiveSystem('solar'); }}
                        className="w-full mb-6 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-900 to-red-900 rounded-xl border border-orange-500/30 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(124,45,18,0.4)] group"
                    >
                        <ArrowLeft size={18} className="text-orange-300 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-white font-bold uppercase tracking-widest text-xs">Return to Sol</span>
                    </button>
                )}

                <p className="text-zinc-300 leading-relaxed text-sm font-light mb-6">
                    {data.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Thermometer size={16} /></div>
                        <div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Surface Temp</div>
                            <div className="text-sm font-mono text-white font-bold">{data.stats.temp}</div>
                        </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Clock size={16} /></div>
                        <div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Day Length</div>
                            <div className="text-sm font-mono text-white font-bold">{data.stats.day}</div>
                        </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Calendar size={16} /></div>
                        <div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Orbital Period</div>
                            <div className="text-sm font-mono text-white font-bold">{data.stats.year}</div>
                        </div>
                    </div>
                </div>

                {data.moons && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Satellites</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {data.moons.map((m, i) => (
                                <span key={i} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 transition-colors rounded-lg text-[10px] text-zinc-300 border border-white/5 cursor-help">
                                    {m.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

export function SystemFinder({ isOpen, onClose, onSelect }: any) {
    const { currentData } = useSimulation();
    if(!isOpen) return null;
    const allMoons = currentData.flatMap(p => p.moons || []);

    return (
        <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-start md:justify-center p-4 md:p-8 pt-24 md:pt-32 overflow-y-auto">
            <button 
                onClick={onClose} 
                className="fixed top-24 right-4 md:absolute md:top-32 md:right-8 p-2 bg-black/50 md:bg-transparent rounded-full text-zinc-500 hover:text-white z-50 backdrop-blur-md md:backdrop-blur-none"
            >
                <Minimize2 size={32} />
            </button>
            
            <div className="w-full max-w-5xl pb-24 md:pb-0">
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-8">System <span className="text-[#DFFF00]">Browser</span></h2>
                <h3 className="text-zinc-500 uppercase tracking-widest font-mono text-sm mb-4">Major Bodies</h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full mb-12">
                    {currentData.map((p) => (
                        <button 
                            key={p.id}
                            onClick={() => onSelect(p.id)}
                            className="group relative overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#DFFF00] transition-all p-4 md:p-6 rounded-xl text-left"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Orbit size={40} />
                            </div>
                            <div className="text-[#DFFF00] text-[10px] font-mono uppercase mb-2">{p.type}</div>
                            <div className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">{p.name}</div>
                            <div className="text-zinc-500 text-xs mt-1">{p.distance === 0 ? 'System Center' : `${p.distance} AU Distance`}</div>
                        </button>
                    ))}
                </div>
                {allMoons.length > 0 && (
                    <>
                        <h3 className="text-zinc-500 uppercase tracking-widest font-mono text-sm mb-4">Satellites & Stations</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 w-full mb-12">
                            {allMoons.map((m) => (
                                <button 
                                    key={m.id}
                                    onClick={() => onSelect(m.id)}
                                    className="group relative overflow-hidden bg-zinc-900 border border-white/10 hover:border-cyan-400 transition-all p-3 md:p-4 rounded-xl text-left"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Satellite size={24} />
                                    </div>
                                    <div className="text-cyan-400 text-[9px] font-mono uppercase mb-1">{m.type}</div>
                                    <div className="text-sm md:text-lg font-bold text-white uppercase tracking-wider">{m.name}</div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export function SpeedControls({ 
    showOrbits, setShowOrbits, 
    showLabels, setShowLabels, 
    showSolarWind, setShowSolarWind, 
    handleRecenter 
}: any) {
    const { speed, setSpeed, resetTime } = useSimulation();
    
    return (
        <div className="fixed bottom-8 md:bottom-12 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
            {/* Unified Bar */}
            <div className="pointer-events-auto flex items-center gap-2 bg-black/70 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-x-auto [&::-webkit-scrollbar]:hidden touch-pan-x">
                
                {/* View Controls Group */}
                <div className="flex items-center gap-1 pr-1">
                    <button 
                        onClick={() => setShowOrbits(!showOrbits)}
                        className={`p-3 rounded-full transition-all ${showOrbits ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                        title="Toggle Orbits"
                    >
                        {showOrbits ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button 
                        onClick={() => setShowLabels(!showLabels)}
                        className={`p-3 rounded-full transition-all ${showLabels ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                        title="Toggle Labels"
                    >
                        <Tag size={18} />
                    </button>
                    <button 
                        onClick={() => setShowSolarWind(!showSolarWind)}
                        className={`p-3 rounded-full transition-all ${showSolarWind ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.5)]' : 'text-zinc-400 hover:text-[#DFFF00] hover:bg-white/10'}`}
                        title="Toggle Solar Wind"
                    >
                        <div className="w-4 h-4 rounded-full border border-current opacity-50" /> 
                    </button>
                    <button 
                        onClick={handleRecenter}
                        className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        title="Recenter Camera"
                    >
                        <Crosshair size={18} />
                    </button>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-white/20 mx-1" />

                {/* Time Controls Group */}
                <div className="flex items-center gap-2 pl-1">
                    <button 
                        onClick={resetTime}
                        className="p-3 rounded-full hover:bg-white/10 text-[#DFFF00] transition-colors shrink-0"
                        title="Reset to Live Time"
                    >
                        <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent -rotate-45" />
                    </button>
                    
                    {[
                        { v: 1, l: 'LIVE' },
                        { v: 100, l: '100x' },
                        { v: 10000, l: '10kx' },
                        { v: 100000, l: '100kx' },
                        { v: 1000000, l: '1Mx' },
                    ].map((opt) => (
                        <button
                            key={opt.v}
                            onClick={() => setSpeed(opt.v)}
                            className={`
                                px-3 py-1.5 rounded-full text-[10px] font-mono font-bold transition-all whitespace-nowrap shrink-0
                                ${speed === opt.v ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}
                            `}
                        >
                            {opt.l}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}