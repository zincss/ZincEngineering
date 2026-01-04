'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../context'; 
import { 
    ArrowLeft, Thermometer, Clock, Calendar, Minimize2, Orbit, Satellite, 
    Film, Sparkles, Eye, EyeOff, Tag, Crosshair, Shuffle, BarChart3, 
    Rocket, CalendarCheck, Search, X 
} from 'lucide-react';

// --- CINEMATIC MENU ---
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

// --- DETAIL PANEL (FIXED MOBILE HEIGHT) ---
export function DetailPanel({ id, onClose }: { id: string | null, onClose: () => void }) {
    const { findBody, activeSystem, setActiveSystem } = useSimulation();
    
    if (!id) return null;
    const data = findBody(id);
    if (!data) return null;

    return (
        <AnimatePresence>
            <motion.div 
                // ANIMATION VARIANTS
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`
                    fixed z-40 bg-black/80 backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden
                    
                    /* MOBILE: Bottom Sheet (Max Height 60vh) */
                    bottom-0 left-0 right-0 w-full rounded-t-3xl border-t border-x-0
                    max-h-[60vh] pb-8
                    
                    /* DESKTOP: Floating Card */
                    md:absolute md:top-24 md:right-4 md:left-auto md:bottom-auto 
                    md:w-full md:max-w-sm md:rounded-3xl md:border md:pb-0
                    md:max-h-[75vh]
                `}
            >
                {/* Mobile Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1 md:hidden pointer-events-none">
                    <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
                </div>

                {/* Content Container (Scrollable) */}
                <div className="p-6 overflow-y-auto max-h-[calc(60vh-2rem)] md:max-h-[calc(75vh-2rem)] custom-scrollbar">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                             <span className="text-[#DFFF00] text-[10px] font-mono uppercase tracking-widest border border-[#DFFF00]/20 bg-[#DFFF00]/5 px-2 py-0.5 rounded mb-2 inline-block">
                                {data.type}
                            </span>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{data.name}</h1>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="h-0.5 w-16 bg-[#DFFF00] mb-4" />
                    
                    {/* WARP BUTTONS */}
                    {id === 'sun' && activeSystem === 'solar' && (
                        <button 
                            onClick={() => { onClose(); setActiveSystem('fantasy'); }}
                            className="w-full mb-6 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl border border-purple-500/30 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(88,28,135,0.4)] group"
                        >
                            <Sparkles size={18} className="text-purple-300 group-hover:rotate-12 transition-transform" />
                            <span className="text-white font-bold uppercase tracking-widest text-xs">Warp to Zinc Prime</span>
                        </button>
                    )}
                    
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
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// --- SYSTEM FINDER (FIXED HOOK ORDER) ---
export function SystemFinder({ isOpen, onClose, onSelect }: any) {
    const { currentData } = useSimulation();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'planet' | 'moon' | 'station'>('all');

    // FIX: useMemo MUST run before any 'if (!isOpen) return' statements
    const allBodies = useMemo(() => {
        const bodies: any[] = [];
        currentData.forEach(p => {
            bodies.push(p); 
            if (p.moons) bodies.push(...p.moons); 
        });
        return bodies;
    }, [currentData]);

    if (!isOpen) return null; // Safe to return here now

    // Filtering Logic
    const filteredBodies = allBodies.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' 
            ? true 
            : activeFilter === 'planet' 
                ? (b.type === 'Planet' || b.type === 'Dwarf Planet' || b.type === 'Star')
                : b.type.toLowerCase() === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col pt-safe-top">
            
            {/* Header / Search Bar */}
            <div className="sticky top-0 z-10 w-full bg-black/50 border-b border-white/10 p-4 md:p-6 backdrop-blur-md">
                <div className="max-w-5xl mx-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                            System <span className="text-[#DFFF00]">Browser</span>
                        </h2>
                        <button 
                            onClick={onClose} 
                            className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search planets, moons, stations..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#DFFF00] transition-colors"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'planet', label: 'Planets' },
                                { id: 'moon', label: 'Moons' },
                                { id: 'station', label: 'Stations' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id as any)}
                                    className={`
                                        px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border
                                        ${activeFilter === tab.id 
                                            ? 'bg-[#DFFF00] text-black border-[#DFFF00]' 
                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {filteredBodies.length > 0 ? (
                        filteredBodies.map((body) => (
                            <button 
                                key={body.id}
                                onClick={() => onSelect(body.id)}
                                className="group flex items-center gap-4 bg-zinc-900/50 border border-white/5 hover:border-[#DFFF00]/50 hover:bg-zinc-800/80 p-4 rounded-xl text-left transition-all duration-300"
                            >
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center shrink-0
                                    ${body.type === 'Star' ? 'bg-orange-500/20 text-orange-500' :
                                      body.type === 'Planet' ? 'bg-blue-500/20 text-blue-500' :
                                      body.type === 'Station' ? 'bg-[#DFFF00]/20 text-[#DFFF00]' :
                                      'bg-zinc-700/50 text-zinc-400'}
                                `}>
                                    {body.type === 'Station' ? <Satellite size={20} /> : <Orbit size={20} />}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-0.5 truncate group-hover:text-[#DFFF00] transition-colors">
                                        {body.type}
                                    </div>
                                    <div className="text-white font-bold text-lg leading-none truncate">{body.name}</div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-600">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="uppercase tracking-widest text-sm">No Celestial Bodies Found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- SPEED CONTROLS (Standard) ---
export function SpeedControls({ 
    showOrbits, setShowOrbits, 
    showLabels, setShowLabels, 
    showSolarWind, setShowSolarWind, 
    handleRecenter,
    isSpaceshipMode,
    setIsSpaceshipMode
}: any) {
    const { speed, setSpeed, resetTime, setTime, simulationTime } = useSimulation();
    const [dateInputOpen, setDateInputOpen] = useState(false);
    
    const handleDateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const dateStr = formData.get('date') as string;
        if(dateStr) {
            const timestamp = new Date(dateStr).getTime();
            if(!isNaN(timestamp)) {
                setTime(timestamp);
                setSpeed(1); 
                setDateInputOpen(false);
            }
        }
    };
    
    return (
        <>
            <AnimatePresence>
                {dateInputOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 border border-white/20 p-3 rounded-xl shadow-2xl flex flex-col items-center gap-2"
                    >
                         <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Jump to Date</div>
                         <form onSubmit={handleDateSubmit} className="flex gap-2">
                            <input 
                                type="date" 
                                name="date" 
                                className="bg-black text-white text-xs p-2 rounded border border-zinc-700 outline-none focus:border-[#DFFF00]"
                                defaultValue={new Date(simulationTime).toISOString().split('T')[0]}
                            />
                            <button type="submit" className="bg-[#DFFF00] text-black text-xs font-bold px-3 rounded hover:bg-white transition-colors">
                                GO
                            </button>
                         </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed bottom-8 md:bottom-12 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 bg-black/70 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-x-auto [&::-webkit-scrollbar]:hidden touch-pan-x">
                    <div className="flex items-center gap-1 pr-1">
                        <button 
                            onClick={() => setIsSpaceshipMode(!isSpaceshipMode)}
                            className={`p-3 rounded-full transition-all ${isSpaceshipMode ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.5)]' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                            title="Toggle Spaceship Mode"
                        >
                            <Rocket size={18} />
                        </button>
                        <div className="w-px h-6 bg-white/20 mx-1" />
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

                    <div className="w-px h-8 bg-white/20 mx-1" />

                    <div className="flex items-center gap-2 pl-1 relative">
                        <button 
                            onClick={resetTime}
                            className="p-3 rounded-full hover:bg-white/10 text-[#DFFF00] transition-colors shrink-0"
                            title="Reset to Live Time"
                        >
                            <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent -rotate-45" />
                        </button>

                         <button 
                            onClick={() => setDateInputOpen(!dateInputOpen)}
                            className={`p-3 rounded-full transition-colors shrink-0 ${dateInputOpen ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                            title="Jump to Date"
                        >
                            <CalendarCheck size={18} />
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
        </>
    );
}