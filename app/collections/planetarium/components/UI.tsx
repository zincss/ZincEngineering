'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLANET_DATA } from '../data';
import { useSimulation, getBodyPosition, findBodyById } from '../context';
import { ArrowLeft, Thermometer, Clock, Calendar, Minimize2, Search, Orbit, Satellite, RotateCcw, Car, MapPin, Navigation, User, Star, Film, Play } from 'lucide-react';

// --- NEW COMPONENT: CINEMATIC MENU ---
export function CinematicMenu({ onSelectTour }: { onSelectTour: (id: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    const tours = [
        { id: 'grand_tour', label: 'Grand Tour', desc: 'The classic celestial journey.', duration: '5m' },
        { id: 'earth_mars_transfer', label: 'Mars Transfer', desc: 'Accelerated cinematic journey.', duration: '20m' },
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
                        // Updated: Opens DOWNWARDS (top-full) with margin-top (mt-2)
                        className="absolute top-full mt-2 left-0 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] flex flex-col gap-1"
                    >
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 px-3 py-2 font-mono border-b border-white/5 mb-2">Select Program</div>
                        {tours.map(tour => (
                            <button
                                key={tour.id}
                                onClick={() => {
                                    onSelectTour(tour.id);
                                    setIsOpen(false);
                                }}
                                className="text-left p-3 rounded-xl hover:bg-white/10 transition-colors group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-center mb-1 relative z-10">
                                    <div className="text-white font-bold text-sm group-hover:text-[#DFFF00] transition-colors">{tour.label}</div>
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
    if (!id) return null;
    const data = findBodyById(id);
    if (!data) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 20 }}
                // Mobile: w-full (covers screen), Desktop: w-[400px]
                className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-black/80 backdrop-blur-xl border-l border-white/10 p-6 md:p-8 pt-24 md:pt-32 z-20 overflow-y-auto"
            >
                {/* Close Button - Fixed to ensure it doesn't scroll away on mobile if content is long */}
                <button 
                    onClick={onClose} 
                    className="fixed top-24 right-4 md:absolute md:top-32 md:right-6 p-2 rounded-full bg-black/50 md:bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white transition-colors z-50 backdrop-blur-sm md:backdrop-blur-none"
                >
                    <Minimize2 size={20} />
                </button>

                <div className="mt-8">
                    <span className="text-[#DFFF00] text-xs font-mono uppercase tracking-widest border border-[#DFFF00]/20 bg-[#DFFF00]/5 px-2 py-1 rounded">
                        {data.type}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white mt-4 mb-2 uppercase tracking-tighter">{data.name}</h1>
                    <div className="h-1 w-20 bg-[#DFFF00] mb-6" />
                    <p className="text-zinc-300 leading-relaxed text-sm font-light">
                        {data.description}
                    </p>
                    <div className="grid grid-cols-1 gap-4 mt-8">
                        <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400"><Thermometer size={18} /></div>
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Surface Temp</div>
                                <div className="text-xl font-mono text-white">{data.stats.temp}</div>
                            </div>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-full text-purple-400"><Clock size={18} /></div>
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Day Length</div>
                                <div className="text-xl font-mono text-white">{data.stats.day}</div>
                            </div>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5 flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-full text-green-400"><Calendar size={18} /></div>
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Orbital Period</div>
                                <div className="text-xl font-mono text-white">{data.stats.year}</div>
                            </div>
                        </div>
                    </div>

                    {data.moons && (
                        <div className="mt-8">
                            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Known Moons</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.moons.map((m, i) => (
                                    <span key={i} className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400 border border-white/5">
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

export function SystemFinder({ isOpen, onClose, onSelect }: any) {
    if(!isOpen) return null;
    const allMoons = PLANET_DATA.flatMap(p => p.moons || []);

    return (
        <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-start md:justify-center p-4 md:p-8 pt-24 md:pt-32 overflow-y-auto">
            {/* Fixed Close Button for Mobile Accessibility */}
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
                    {PLANET_DATA.map((p) => (
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

export function ZincShuttleApp({ isOpen, onClose, currentId, onRideRequest, onPreviewRoute, rideStatus }: any) {
    const { simulationTime } = useSimulation();
    const [pickup, setPickup] = useState<string>(currentId || 'earth');
    const [destination, setDestination] = useState<string>('');
    const [searchState, setSearchState] = useState<'idle' | 'searching' | 'found'>('idle');
    const [tripInfo, setTripInfo] = useState<{ price: string, time: string, dist: number } | null>(null);

    const availableBodies = PLANET_DATA.flatMap(p => [p, ...(p.moons || [])]);
    const availablePickups = availableBodies;
    const availableDestinations = availableBodies.filter(b => b.id !== pickup);

    const drivers = [
        { name: "Xur", rating: "5.0", vehicle: "Agent of the Nine", pic: "https://api.dicebear.com/7.x/bottts/svg?seed=Xur" },
        { name: "Baro Ki'Teer", rating: "4.9", vehicle: "Prisma Skiff", pic: "https://api.dicebear.com/7.x/bottts/svg?seed=Baro" },
        { name: "Han S.", rating: "4.2", vehicle: "Corellian Freighter", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Han" },
        { name: "John P.", rating: "5.0", vehicle: "Prodman Employee", pic: "https://api.dicebear.com/7.x/micah/svg?seed=John" }
    ];
    
    const [driver, setDriver] = useState(drivers[0]);

    useEffect(() => {
        if(currentId) setPickup(currentId);
    }, [currentId]);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (destination && pickup) {
            setSearchState('searching');
            onPreviewRoute({ origin: pickup, destination }); 
            
            const p1 = getBodyPosition(pickup, simulationTime);
            const p2 = getBodyPosition(destination, simulationTime);
            const dist = p1.distanceTo(p2);
            
            const price = Math.floor(dist * 0.5 + 25).toFixed(2); 
            const time = Math.ceil(Math.max(15, dist / 20)).toString(); 

            timer = setTimeout(() => {
                setTripInfo({ price, time, dist });
                setDriver(drivers[Math.floor(Math.random() * drivers.length)]);
                setSearchState('found');
            }, 1000); 
        } else {
            setSearchState('idle');
            setTripInfo(null);
            onPreviewRoute(null);
        }

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destination, pickup, onPreviewRoute]); 

    if (!isOpen) return null;

    return (
        // Mobile Optimized: top-28 to sit higher up, preventing keyboard cover-up. 
        <div className="absolute top-28 md:top-44 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-40 font-sans flex flex-col transition-all duration-300">
            <div className="bg-black/40 p-4 md:p-5 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-[#DFFF00] p-1.5 rounded-lg text-black shadow-[0_0_15px_rgba(223,255,0,0.4)]">
                        <Navigation size={20} fill="black" />
                    </div>
                    <div>
                        <div className="text-white font-bold tracking-tight text-lg">Zinc Shuttle</div>
                        <div className="text-zinc-500 text-[10px] uppercase tracking-wider font-mono">Interplanetary</div>
                    </div>
                </div>
                <button onClick={onClose}><Minimize2 size={18} className="text-zinc-500 hover:text-white transition-colors" /></button>
            </div>
            <div className="p-4 md:p-6 space-y-6 flex-1 max-h-[50vh] md:max-h-none overflow-y-auto">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-zinc-600 before:to-[#DFFF00] before:opacity-30 before:rounded-full">
                    {/* PICKUP */}
                    <div className="relative group">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-zinc-500" />
                        </div>
                        <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-1 block">Pickup</label>
                         <div className="relative">
                            <select 
                                className="w-full bg-transparent text-white text-base md:text-lg font-medium focus:outline-none border-b border-white/10 pb-2 mt-1 cursor-pointer hover:border-white/30 transition-colors appearance-none"
                                onChange={(e) => setPickup(e.target.value)}
                                value={pickup}
                                disabled={rideStatus === 'driving'}
                            >
                                {availablePickups.map(d => (
                                    <option key={d.id} value={d.id} className="bg-zinc-900 text-white">{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* DROPOFF */}
                    <div className="relative group">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-[#DFFF00] bg-zinc-900 flex items-center justify-center shadow-[0_0_10px_rgba(223,255,0,0.2)]">
                            <MapPin size={10} className="text-[#DFFF00]" />
                        </div>
                        <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-1 block">Dropoff</label>
                        <div className="relative">
                            <select 
                                className="w-full bg-transparent text-white text-base md:text-lg font-medium focus:outline-none border-b border-white/10 pb-2 mt-1 cursor-pointer hover:border-white/30 transition-colors appearance-none"
                                onChange={(e) => setDestination(e.target.value)}
                                value={destination}
                                disabled={rideStatus === 'driving'}
                            >
                                <option value="" className="bg-zinc-900">Select Destination</option>
                                {availableDestinations.map(d => (
                                    <option key={d.id} value={d.id} className="bg-zinc-900 text-white">{d.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-0 top-2 pointer-events-none text-zinc-500">
                                <Search size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {searchState === 'searching' && (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-10 h-10 border-2 border-[#DFFF00] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(223,255,0,0.2)]" />
                        <div className="text-zinc-400 text-xs font-mono tracking-widest uppercase">Contacting Drivers...</div>
                    </div>
                )}
                {searchState === 'found' && tripInfo && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border border-white/10 rounded-xl p-4 hover:border-[#DFFF00]/50 transition-all cursor-pointer ring-1 ring-[#DFFF00]/10 group">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#DFFF00] to-yellow-600 rounded-lg flex items-center justify-center shadow-lg text-black">
                                        <Car size={20} />
                                    </div>
                                    <div>
                                        <div className="text-white font-bold group-hover:text-[#DFFF00] transition-colors">ZincX</div>
                                        <div className="text-xs text-zinc-400 flex items-center gap-1">
                                            <User size={10} /> 3 • Fast Warp
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-bold text-lg">${tripInfo.price}</div>
                                    <div className="text-[10px] text-zinc-500 line-through">${(parseFloat(tripInfo.price)*1.2).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                                <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Duration</div>
                                <div className="text-white font-mono text-lg">{tripInfo.time} <span className="text-xs text-zinc-500">min</span></div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                                <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Distance</div>
                                <div className="text-white font-mono text-lg">{Math.floor(tripInfo.dist)} <span className="text-xs text-zinc-500">AU</span></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                            <div className="relative">
                                <img src={driver.pic} className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10" />
                                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                                    <div className="bg-[#DFFF00] w-2.5 h-2.5 rounded-full border-2 border-black" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="text-white text-sm font-bold">{driver.name}</div>
                                <div className="text-zinc-500 text-xs">{driver.vehicle}</div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#DFFF00]/10 px-2.5 py-1 rounded-full border border-[#DFFF00]/20">
                                <Star size={10} className="text-[#DFFF00] fill-[#DFFF00]" />
                                <span className="text-[#DFFF00] text-xs font-bold font-mono">{driver.rating}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                {rideStatus === 'driving' && (
                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 md:p-8 text-center space-y-4">
                        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping" />
                            <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-pulse delay-75" />
                            <Navigation size={32} className="text-cyan-400 relative z-10" />
                        </div>
                        <div>
                            <div className="text-white font-bold text-xl mb-1">En Route</div>
                            <div className="text-cyan-400 text-xs uppercase tracking-widest">Arriving at {findBodyById(destination)?.name}</div>
                        </div>
                        <div className="h-1 w-20 mx-auto bg-cyan-900 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 animate-progress w-full origin-left" />
                        </div>
                    </div>
                )}
            </div>
            {rideStatus !== 'driving' && (
                <div className="p-4 md:p-6 bg-black/40 border-t border-white/5 backdrop-blur-md">
                    <button 
                        disabled={searchState !== 'found'}
                        onClick={() => onRideRequest({ origin: pickup, destination })}
                        className={`
                            w-full py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300
                            ${searchState !== 'found'
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                                : 'bg-[#DFFF00] text-black hover:bg-white hover:scale-[1.02] shadow-[0_0_30px_rgba(223,255,0,0.3)]'}
                        `}
                    >
                        {searchState === 'found' ? (
                            <>Confirm Ride <ArrowLeft className="rotate-180" size={16}/></>
                        ) : 'Select Destination'}
                    </button>
                </div>
            )}
        </div>
    );
}

export function SpeedControls() {
    const { speed, setSpeed, resetTime } = useSimulation();
    
    return (
        // Mobile Optimized: overflow-x-auto, max-width, no scale, centered comfortably
        <div className="fixed bottom-8 md:bottom-12 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-start md:justify-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-x-auto [&::-webkit-scrollbar]:hidden touch-pan-x">
             <button 
                onClick={resetTime}
                className="p-3 rounded-full hover:bg-white/10 text-[#DFFF00] transition-colors shrink-0"
                title="Reset to Live Time"
            >
                <RotateCcw size={18} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-2 shrink-0" />
            
            {[
                { v: 1, l: 'LIVE' },
                { v: 100, l: '100x' },
                { v: 10000, l: '10kx' },
                { v: 100000, l: '100kx' },
                { v: 1000000, l: '1Mx' },
                { v: 10000000, l: '10Mx' }
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
    );
}