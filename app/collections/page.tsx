'use client';

import React from 'react';
import Link from 'next/link';
import { CarFront, Gamepad2, ChevronRight, Flag, CloudHail, Database, ArrowRight, BookOpen } from 'lucide-react';
import BackButton from '../components/BackButton';
import GlobalTicker from '../components/GlobalTicker';

export default function CollectionsHub() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      
      {/* BACKGROUND */}
      <div className="bg-starfield" />
      <BackButton href="/" label="HOME" />

      {/* --- HERO SECTION --- */}
      <section className="relative h-[65vh] flex flex-col items-center justify-center border-b border-zinc-800/50 overflow-hidden">
        
        {/* HERO BACKGROUND */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/30 z-10" />
           {/* Abstract Geometric Background */}
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale mix-blend-overlay" />
        </div>
        
        <div className="relative z-20 w-full max-w-[1800px] mx-auto px-6 flex flex-col items-center text-center">
          
          {/* STATUS PILL */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-8 duration-1000">
             <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl rounded-full shadow-2xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DFFF00]"></span>
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-300 tracking-[0.2em] uppercase">
                  Collections Codex
                </span>
             </div>
          </div>

          {/* MASSIVE TYPOGRAPHY */}
          <h1 className="text-[12vw] md:text-[10vw] font-black tracking-tighter text-white uppercase leading-[0.8] animate-in fade-in zoom-in-95 duration-1000 delay-100 select-none">
            Digital <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-500 to-zinc-800">Archive</span>
          </h1>
          
          <div className="mt-12 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
             <p className="text-zinc-400 font-mono text-sm md:text-base leading-relaxed">
               <span className="text-[#DFFF00] font-black mr-2">///</span>
               Central repository for specialized item databases, mechanical schematics, and interactive encyclopedias.
             </p>
          </div>
        </div>
      </section>

      <GlobalTicker />

      {/* --- MODULE GRID --- */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-20">
        
        {/* SECTION HEADER */}
        <div className="flex items-center gap-4 mb-10 px-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-md">
                 <BookOpen size={16} className="text-[#DFFF00]" />
                 <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Database Modules</span>
            </div>
            <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">
            
            {/* 1. GAMING DATABASE (Featured Wide) */}
            <Link href="/gaming" className="group md:col-span-8 relative min-h-[320px] rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-20 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
                
                <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 group-hover:border-[#DFFF00] transition-colors">
                    <Gamepad2 className="text-[#DFFF00]" size={24} />
                </div>

                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-3xl">
                    <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-4 italic tracking-tight">Gaming Database</h2>
                    <p className="text-zinc-400 font-mono text-sm md:text-base leading-relaxed max-w-xl group-hover:text-zinc-200 transition-colors">
                        Warframe market data, module configurations, and item archives.
                    </p>
                </div>
            </Link>

            {/* 2. AUTOMOTIVE (Tall) */}
            <Link href="/automotive" className="group md:col-span-4 md:row-span-2 relative min-h-[320px] rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                
                <div className="absolute top-8 right-8">
                   <ArrowRight size={24} className="text-zinc-600 -rotate-45 group-hover:text-[#DFFF00] group-hover:rotate-0 transition-all duration-500" />
                </div>

                <div className="absolute bottom-0 left-0 p-10 w-full">
                    <CarFront size={48} className="text-zinc-700 group-hover:text-[#DFFF00] mb-6 transition-colors duration-500" />
                    <h2 className="text-4xl font-black uppercase text-white mb-2">Auto Index</h2>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6 group-hover:text-zinc-300 transition-colors">
                        Garage<br/>Protocol
                    </p>
                    <div className="h-px w-12 bg-[#DFFF00] group-hover:w-full transition-all duration-700" />
                </div>
            </Link>

            {/* 3. WEATHER (Medium) */}
            <Link href="/collections/weather" className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514632542354-958d91dde23e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-zinc-950/30" />
                
                <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                    <CloudHail size={32} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                    <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Live S.O.S</span>
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h2 className="text-3xl font-black uppercase text-white mb-2 leading-none">Atmosphere<br/>Scanner</h2>
                    <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-white transition-colors">
                        Warning: AI personality is hostile.
                    </p>
                </div>
            </Link>

            {/* 4. SCORECARD (Medium) */}
            <Link href="/collections/golf" className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-zinc-950/30" />
                
                <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                    <Flag size={32} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                    <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">V2.0</span>
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h2 className="text-3xl font-black uppercase text-white mb-2 leading-none">Tactical<br/>Scorecard</h2>
                    <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-white transition-colors">
                        4-Operative capacity. Real-time stats.
                    </p>
                </div>
            </Link>

        </div>
      </section>
    </main>
  );
}