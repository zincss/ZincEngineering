'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Shuffle, BarChart3 } from 'lucide-react';

interface TourOption {
    id: string;
    label: string;
    desc: string;
    duration: string;
    icon?: React.ReactNode;
}

const TOURS: TourOption[] = [
    { id: 'random', label: 'Random Commercial Flight', desc: 'Book a seat on a random system transit.', duration: '2m', icon: <Shuffle size={14} className="text-[#DFFF00]" /> },
    { id: 'grand_tour', label: 'Grand Tour', desc: 'The classic celestial journey.', duration: '5m' },
    { id: 'scale_comparison', label: 'Cosmic Scale', desc: 'Size comparison lineup.', duration: '2m', icon: <BarChart3 size={14} className="text-[#DFFF00]" /> },
    { id: 'earth_mars_transfer', label: 'Mars Transfer', desc: 'Accelerated cinematic journey.', duration: '5m' },
    { id: 'jovian_leap', label: 'The Jovian Leap', desc: 'Europa to Ganymede transfer.', duration: '3m' },
    { id: 'oumuamua_visit', label: 'Oumuamua', desc: 'The first interstellar visitor.', duration: '3m' },
    { id: 'voyager_1', label: 'Voyager 1', desc: 'The historic 45-year mission.', duration: '1h' }
];

export function CinematicMenu({ onSelectTour }: { onSelectTour: (id: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

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
                        {TOURS.map(tour => (
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
