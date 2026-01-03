'use client';

import React, { useState, useEffect } from 'react';
import { FlightData } from './types';
import { COMMERCIAL_FACTS } from './data';

export function FlightComputer({ data }: { data: FlightData }) {
    const [elapsed, setElapsed] = useState(0);
    const [factIndex, setFactIndex] = useState(0);
    const currentFacts = data.facts || COMMERCIAL_FACTS;

    useEffect(() => {
        if (!data.active || !data.startTime) return;
        const interval = setInterval(() => {
            setElapsed(Date.now() - data.startTime!);
        }, 100);
        return () => clearInterval(interval);
    }, [data.active, data.startTime]);

    useEffect(() => {
        if (!data.active) return;
        setFactIndex(0);
        const interval = setInterval(() => {
            setFactIndex(prev => (prev + 1) % currentFacts.length);
        }, 8000); 
        return () => clearInterval(interval);
    }, [data.active, currentFacts.length]);

    if (!data.active || !data.duration) return null;

    // Progress logic is still needed for the bar and distance remaining
    const progress = Math.min(1, elapsed / (data.duration * 1000));
    
    const totalDistance = 225000000; 
    const currentDist = Math.floor(totalDistance * progress);
    const remainingDist = totalDistance - currentDist;
    const speed = 75000; 

    return (
        <div className="absolute inset-0 pointer-events-none z-40 p-4 md:p-8 flex flex-col justify-between pt-safe-top">
            {/* Top Section */}
            <div className="flex justify-between items-start animate-in fade-in slide-in-from-top duration-1000">
                {/* Top Left: Title - KEEP */}
                <div className="bg-black/60 backdrop-blur-md p-4 rounded-br-2xl border-l-4 border-l-[#DFFF00] border-y border-r border-white/10">
                    <div className="text-[#DFFF00] font-mono text-xs uppercase tracking-[0.2em] mb-1">Flight Computer</div>
                    <div className="text-white font-black text-xl md:text-2xl uppercase tracking-tighter">Transfer {data.origin} → {data.destination}</div>
                </div>
                {/* Top Right: Time Elapsed - REMOVED */}
            </div>

            {/* Bottom Section */}
            <div className="flex justify-between items-end animate-in fade-in slide-in-from-bottom duration-1000 pb-safe-bottom">
                {/* Bottom Left: Facts & Stats - KEEP */}
                <div className="bg-black/60 backdrop-blur-md p-6 rounded-tr-2xl border-l-4 border-l-[#DFFF00] border-y border-r border-white/10 w-full max-w-lg hidden md:block">
                    <div key={factIndex} className="mb-6 animate-in fade-in zoom-in duration-500">
                        <div className="text-[#DFFF00] font-mono text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full animate-pulse"></span>
                            In-Flight Update
                        </div>
                        <h2 className="text-sm md:text-base font-light text-white leading-relaxed opacity-90">
                            "{currentFacts[factIndex]}"
                        </h2>
                    </div>

                    <div className="h-[1px] w-full bg-white/10 mb-4"></div>

                    <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-2">
                        <span className="text-zinc-400">Progress</span>
                        <span className="text-[#DFFF00]">{(progress * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 w-full mb-4 overflow-hidden rounded-full">
                        <div className="h-full bg-[#DFFF00] transition-all duration-300" style={{ width: `${progress * 100}%` }} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Distance Rem.</div>
                            <div className="text-white font-mono text-xl">{remainingDist.toLocaleString()} <span className="text-xs text-zinc-500">km</span></div>
                        </div>
                        <div>
                            <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Velocity</div>
                            <div className="text-white font-mono text-xl">{speed.toLocaleString()} <span className="text-xs text-zinc-500">km/h</span></div>
                        </div>
                    </div>
                </div>
                {/* Bottom Right: Est. Arrival - REMOVED */}
            </div>
        </div>
    );
}