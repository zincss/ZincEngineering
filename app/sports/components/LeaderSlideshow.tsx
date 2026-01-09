'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface Leader {
    id: string;
    name: string;
    team: string;
    headshot: string;
    value: string;
    label: string;
}

export default function LeaderSlideshow({ leaders, league }: { leaders: any, league: 'nfl' | 'nba' }) {
    const slides: Leader[] = Object.values(leaders)
        .map((list: any) => list[0])
        .filter(Boolean);

    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    const current = slides[index];

    const nameParts = current.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
        <div className="relative group w-full xl:w-auto h-32 sm:h-48 xl:h-32 flex items-center justify-center xl:justify-end mb-4 sm:mb-8 xl:mb-0">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id + current.label}
                    initial={{ opacity: 0, x: 20, filter: 'blur(15px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -20, filter: 'blur(15px)' }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-row items-center justify-center xl:justify-end w-full xl:min-w-[500px]"
                >
                    {/* The Raw Headshot - Anchored scale and position */}
                    <div className="w-32 h-32 sm:w-48 sm:h-48 xl:w-56 xl:h-56 relative shrink-0 flex items-center justify-center xl:translate-y-4">
                        <Link href={`/sports/${league}/player/${current.id}`} className="block pointer-events-auto group/head">
                            <div className="absolute inset-0 bg-[#DFFF00] rounded-full blur-3xl opacity-10 group-hover/head:opacity-20 transition-opacity" />
                            <img 
                                src={current.headshot} 
                                alt={current.name} 
                                className="w-full h-full object-contain scale-[1.3] sm:scale-[1.4] xl:scale-[1.5] relative z-10 transition-transform duration-500 group-hover/head:scale-[1.55]"
                            />
                        </Link>
                    </div>

                    {/* Stats Info - Fixed width on desktop to prevent dancing layout */}
                    <div className="flex flex-col justify-center select-none w-full max-w-[180px] sm:max-w-[260px] xl:w-[350px] ml-4 sm:ml-8 xl:ml-6">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <div className="p-1 bg-zinc-900 border border-zinc-800 rounded shadow-sm">
                                <Zap size={10} className="text-[#DFFF00]" />
                            </div>
                            <span className="text-[8px] sm:text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.2em] sm:tracking-[0.4em]">
                                {current.label} Leader
                            </span>
                        </div>

                        <div className="mb-2 sm:mb-4">
                            <div className="text-xl sm:text-3xl md:text-4xl xl:text-5xl font-black text-white uppercase leading-[0.85] tracking-tighter italic break-words">
                                {firstName}<br/>
                                <span className="text-[#DFFF00]">{lastName}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <BarChart3 size={12} className="text-[#DFFF00] hidden sm:block" />
                                    <span className="text-xl sm:text-3xl xl:text-4xl font-mono font-black text-white tracking-tighter">
                                        {current.value}
                                    </span>
                                </div>
                                <div className="text-[7px] sm:text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mt-0.5 sm:mt-1">
                                    Aggregate // {current.team}
                                </div>
                            </div>

                            <Link 
                                href={`/sports/${league}/player/${current.id}`}
                                className="group/btn flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-[#DFFF00] hover:bg-[#DFFF00] transition-all ml-2"
                            >
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-black">Profile</span>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}