'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Radio, Trophy, ArrowRight, Zap, Target } from 'lucide-react';
import { getLiveScores } from '@/app/sports/actions';
import Link from 'next/link';

export default function LivePulseHero() {
    const [matches, setMatches] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        getLiveScores().then(data => {
            // Prioritize LIVE games, then upcoming
            const sorted = data.sort((a: any, b: any) => (b.isLive === a.isLive) ? 0 : b.isLive ? 1 : -1);
            setMatches(sorted.slice(0, 5));
        });
    }, []);

    useEffect(() => {
        if (matches.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % matches.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [matches.length]);

    if (matches.length === 0) return (
        <div className="h-48 rounded-3xl bg-slate-900/50 border border-blue-500/10 flex items-center justify-center animate-pulse">
            <span className="text-slate-500 font-mono text-xs uppercase tracking-widest">Scanning Frequencies...</span>
        </div>
    );

    const match = matches[currentIndex];

    return (
        <div className="relative h-64 w-full rounded-[2.5rem] overflow-hidden border border-blue-500/20 bg-[#020617] group">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900/50 to-black z-0" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-colors duration-1000" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />

            <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md ${match.isLive ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                            <Radio size={12} className={match.isLive ? 'animate-pulse' : ''} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{match.isLive ? 'LIVE BROADCAST' : 'UPCOMING EVENT'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{match.league}</span>
                    </div>
                    
                    <div className="flex gap-1">
                        {matches.map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-6 bg-blue-400' : 'w-2 bg-slate-800'}`} />
                        ))}
                    </div>
                </div>

                {/* Matchup */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={match.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <img src={match.away.logo} alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                            <div>
                                <div className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{match.away.code}</div>
                                <div className="text-xl md:text-3xl font-mono font-bold text-blue-400 leading-none">{match.away.score}</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <div className="h-12 w-px bg-slate-800" />
                            <span className="text-slate-600 font-black text-xs italic">VS</span>
                            <div className="h-12 w-px bg-slate-800" />
                        </div>

                        <div className="flex items-center gap-4 text-right">
                            <div>
                                <div className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{match.home.code}</div>
                                <div className="text-xl md:text-3xl font-mono font-bold text-blue-400 leading-none">{match.home.score}</div>
                            </div>
                            <img src={match.home.logo} alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[9px] uppercase tracking-widest">
                        <Activity size={12} />
                        {match.venue}
                    </div>
                    <Link href="/sports/match-center" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white hover:text-blue-400 transition-colors group/link">
                        Open Match Center <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
