'use client';

import React, { useState, useEffect } from 'react';
import { Flag, MapPin, Trophy, DollarSign, Target, Activity, Clock } from 'lucide-react';

export default function GolfHero({ event }: { event: any }) {
  const [status, setStatus] = useState(event.status);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  // Countdown Timer Logic
  useEffect(() => {
    // If we are already live, skip the timer
    if (status === 'LIVE' || !event.startTime) return;

    const targetDate = new Date(event.startTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        // Time is up! Switch to Live mode
        setStatus('LIVE');
        clearInterval(interval);
      } else {
        // Update timer
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ h, m, s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, event.startTime]);

  const isLive = status === 'LIVE';

  return (
    <div className="relative h-[600px] bg-zinc-950 group overflow-hidden border-b border-zinc-800">
        {/* Dynamic Video Background */}
        <div className="absolute inset-0 z-0">
            <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale scale-105 group-hover:scale-110 transition-transform duration-[20s] ease-linear will-change-transform"
            >
                <source src="/golf-bg.mp4" type="video/mp4" />
            </video>
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.3)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-10"></div>

        <div className="relative z-20 h-full max-w-[1600px] mx-auto px-6 flex flex-col justify-end pb-16">
            
            {/* STATUS INDICATOR (Live or Countdown) */}
            <div className="absolute top-12 right-6 md:right-0">
                {isLive ? (
                    <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse">
                        <Activity size={12} /> LIVE BROADCAST
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest bg-black/80 backdrop-blur px-2 py-1 border border-zinc-800">
                            TEE OFF IN
                        </span>
                        <div className="flex items-center gap-1 font-mono font-black text-xl text-[#DFFF00] bg-black/80 backdrop-blur px-3 py-2 border border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.2)]">
                            <Clock size={16} className="mr-2 animate-pulse" />
                            <span>{timeLeft.h.toString().padStart(2, '0')}</span>
                            <span className="text-zinc-600">:</span>
                            <span>{timeLeft.m.toString().padStart(2, '0')}</span>
                            <span className="text-zinc-600">:</span>
                            <span>{timeLeft.s.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-2 text-black font-bold font-mono text-[10px] uppercase tracking-widest bg-[#DFFF00] px-3 py-1">
                    <Flag size={10}/> PGA TOUR
                </div>
                <div className="flex items-center gap-2 text-zinc-300 font-mono text-[10px] uppercase tracking-widest bg-black/60 px-3 py-1 border border-zinc-800 backdrop-blur-md">
                    <MapPin size={10} className="text-[#DFFF00]"/> {event.location}
                </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black uppercase text-white tracking-tighter leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-2xl">
                {event.name}
            </h1>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800 border border-zinc-800 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="bg-zinc-900/90 backdrop-blur-md p-4 flex flex-col justify-center">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">COURSE</span>
                    <span className="text-white font-bold uppercase text-xs md:text-sm truncate">{event.course}</span>
                </div>
                <div className="bg-zinc-900/90 backdrop-blur-md p-4 flex flex-col justify-center">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">PURSE</span>
                    <span className="text-white font-bold uppercase text-xs md:text-sm truncate flex items-center gap-1">
                        <DollarSign size={12} className="text-[#DFFF00]"/> {event.purse}
                    </span>
                </div>
                <div className="bg-zinc-900/90 backdrop-blur-md p-4 flex flex-col justify-center">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">DEFENDING</span>
                    <span className="text-white font-bold uppercase text-xs md:text-sm truncate flex items-center gap-1">
                        <Trophy size={12} className="text-[#DFFF00]"/> {event.defendingChamp?.name}
                    </span>
                </div>
                <div className="bg-zinc-900/90 backdrop-blur-md p-4 flex flex-col justify-center">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">SPECS</span>
                    <span className="text-white font-bold uppercase text-xs md:text-sm truncate flex items-center gap-1">
                        <Target size={12} className="text-[#DFFF00]"/> PAR {event.par}
                    </span>
                </div>
            </div>

        </div>
    </div>
  );
}