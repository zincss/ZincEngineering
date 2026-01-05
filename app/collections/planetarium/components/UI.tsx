'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../context'; 
import { 
    ArrowLeft, Thermometer, Clock, Calendar, Minimize2, Maximize2, Orbit, Satellite, 
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

// --- DETAIL PANEL (COMPACT & SMOOTH) ---
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
                    layout="position" // Enables smooth morphological layout changes
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
                        /* Tighter corner radius for more technical look */
                        ${isMinimized 
                            ? 'rounded-full md:min-w-[300px]' 
                            : 'rounded-2xl md:min-w-[600px] md:max-w-3xl' 
                        }
                    `}
                >
                    {/* HEADER - Compact Padding */}
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

                    {/* EXPANDED CONTENT - Compact & Animated */}
                    <AnimatePresence mode="popLayout">
                        {!isMinimized && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }} // Smooth "Apple-like" easing
                                className="relative z-10"
                            >
                                 <div className="px-5 py-4 bg-black/20">
                                     <div className="grid grid-cols-1 md:grid-cols-[1.3fr,1fr] gap-5 items-start">
                                        
                                        {/* COL 1 */}
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

                                        {/* COL 2 */}
                                        <div className="flex flex-col gap-3">
                                            {/* Stats - Compact */}
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

                                            {/* Satellites - Compact List */}
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
                    
                    {/* DESKTOP CONNECTOR */}
                    <div className="hidden md:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-5 bg-black/80 backdrop-blur-2xl border-x border-white/10 [clip-path:polygon(5%_0%,95%_0%,100%_100%,0%_100%)] z-0">
                        <div className="absolute top-0 left-0 w-full h-px bg-white/5" />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// --- SYSTEM FINDER ---
export function SystemFinder({ isOpen, onClose, onSelect }: any) {
    const { currentData } = useSimulation();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'planet' | 'moon' | 'station'>('all');

    const allBodies = useMemo(() => {
        const bodies: any[] = [];
        currentData.forEach(p => {
            bodies.push(p); 
            if (p.moons) bodies.push(...p.moons); 
        });
        return bodies;
    }, [currentData]);

    if (!isOpen) return null;

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

// --- SPEED CONTROLS ---
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