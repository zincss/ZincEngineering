'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CarFront, 
  Gamepad2, 
  Flag, 
  CloudHail, 
  ArrowRight, 
  BookOpen, 
  ChefHat, 
  Search, 
  Globe 
} from 'lucide-react'; 
import GlobalTicker from '../components/GlobalTicker';

export default function CollectionsHub() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      
      {/* BACKGROUND */}
      <div className="bg-starfield" />

      {/* --- HERO SECTION --- */}
      <section className="relative h-[50vh] md:h-[65vh] flex flex-col items-center justify-center border-b border-zinc-800/50 overflow-hidden">
        
        {/* HERO BACKGROUND */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/30 z-10" />
           <Image 
             src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"
             alt="Hero Background"
             fill
             priority
             className="object-cover opacity-20 grayscale mix-blend-overlay"
           />
        </div>
        
        <div className="relative z-20 w-full max-w-[1800px] mx-auto px-6 flex flex-col items-center text-center">
          
          <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-top-8 duration-1000">
             <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl rounded-full shadow-2xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DFFF00]"></span>
                </span>
                <span className="text-[10px] md:text-[11px] font-mono font-bold text-zinc-300 tracking-[0.2em] uppercase">
                  Collections Codex
                </span>
             </div>
          </div>

          <h1 className="text-6xl md:text-[10vw] font-black tracking-tighter text-white uppercase leading-[0.9] md:leading-[0.8] animate-in fade-in zoom-in-95 duration-1000 delay-100 select-none">
            Digital <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-500 to-zinc-800">Archive</span>
          </h1>
          
          <div className="mt-8 md:mt-12 max-w-lg md:max-w-2xl text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
             <p className="text-zinc-400 font-mono text-xs md:text-base leading-relaxed px-4">
               <span className="text-[#DFFF00] font-black mr-2">///</span>
               Central repository for specialized item databases, mechanical schematics, and interactive encyclopedias.
             </p>
          </div>
        </div>
      </section>

      <GlobalTicker />

      {/* --- MODULE GRID --- */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-12 md:py-20">
        
        {/* SECTION HEADER */}
        <div className="flex items-center gap-4 mb-8 md:mb-10 px-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-md">
                 <BookOpen size={14} className="text-[#DFFF00]" />
                 <span className="text-[10px] md:text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Database Modules</span>
            </div>
            <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* BENTO GRID */}
        {/* Grid Logic: Mobile = 1 col, Tablet = 2 col, Desktop = 12 col */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[minmax(300px,auto)]">
            
            {/* 1. GAMING DATABASE (Large Feature) */}
            <Link 
              href="/gaming" 
              className="group md:col-span-8 relative min-h-[300px] md:min-h-[400px] rounded-[2rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-300 active:scale-[0.98] hover:shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                <div className="absolute inset-0">
                    <Image 
                      src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop"
                      alt="Gaming Database"
                      fill
                      className="object-cover opacity-40 group-hover:opacity-30 grayscale transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 66vw"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
                
                <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-black/40 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/10 group-hover:border-[#DFFF00] transition-colors">
                    <Gamepad2 className="text-[#DFFF00]" size={20} />
                </div>

                <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-3xl">
                    <h2 className="text-3xl md:text-6xl font-black uppercase text-white mb-2 md:mb-4 italic tracking-tight">Gaming Database</h2>
                    <p className="text-zinc-400 font-mono text-xs md:text-sm leading-relaxed max-w-xl group-hover:text-zinc-200 transition-colors">
                        Warframe market data, module configurations, and item archives.
                    </p>
                </div>
            </Link>

            {/* 2. AUTOMOTIVE (Tall Vertical on Desktop) */}
            <Link 
              href="/automotive" 
              className="group md:col-span-4 md:row-span-2 relative min-h-[300px] rounded-[2rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-300 active:scale-[0.98]"
            >
                <div className="absolute inset-0">
                    <Image 
                        src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2670&auto=format&fit=crop"
                        alt="Automotive"
                        fill
                        className="object-cover opacity-30 group-hover:opacity-20 grayscale transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                
                <div className="absolute top-6 right-6 md:top-8 md:right-8">
                   <ArrowRight size={24} className="text-zinc-600 -rotate-45 group-hover:text-[#DFFF00] group-hover:rotate-0 transition-all duration-500" />
                </div>

                <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full">
                    <CarFront size={40} className="text-zinc-700 group-hover:text-[#DFFF00] mb-4 md:mb-6 transition-colors duration-500" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-2">Auto Index</h2>
                    <p className="text-zinc-500 font-mono text-[10px] md:text-xs uppercase tracking-widest mb-6 group-hover:text-zinc-300 transition-colors">
                        Garage<br/>Protocol
                    </p>
                    <div className="h-px w-12 bg-[#DFFF00] group-hover:w-full transition-all duration-700" />
                </div>
            </Link>

            {/* 3. WEATHER (Compact) */}
            <Link 
              href="/collections/weather" 
              className="group md:col-span-4 relative h-[300px] md:h-auto rounded-[2rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-300 active:scale-[0.98]"
            >
                <div className="absolute inset-0">
                    <Image 
                        src="https://images.unsplash.com/photo-1514632542354-958d91dde23e?q=80&w=2670&auto=format&fit=crop"
                        alt="Weather"
                        fill
                        className="object-cover opacity-20 group-hover:opacity-10 grayscale transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
                <div className="absolute inset-0 bg-zinc-950/30" />
                
                <div className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-start">
                    <CloudHail size={28} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                    <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Live S.O.S</span>
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-1 leading-none">Atmosphere<br/>Scanner</h2>
                    <p className="text-zinc-500 font-mono text-[10px] md:text-xs mt-2 group-hover:text-white transition-colors truncate">
                        Warning: AI personality is hostile.
                    </p>
                </div>
            </Link>

            {/* 4. SCORECARD (Compact) */}
            <Link 
              href="/collections/golf" 
              className="group md:col-span-4 relative h-[300px] md:h-auto rounded-[2rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-300 active:scale-[0.98]"
            >
                <div className="absolute inset-0">
                    <Image 
                        src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2670&auto=format&fit=crop"
                        alt="Golf"
                        fill
                        className="object-cover opacity-20 group-hover:opacity-10 grayscale transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
                <div className="absolute inset-0 bg-zinc-950/30" />
                
                <div className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-start">
                    <Flag size={28} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                    <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">V2.0</span>
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-1 leading-none">Tactical<br/>Scorecard</h2>
                    <p className="text-zinc-500 font-mono text-[10px] md:text-xs mt-2 group-hover:text-white transition-colors">
                        4-Operative capacity.
                    </p>
                </div>
            </Link>

            {/* 5. RECIPES (Wide) */}
            <Link 
              href="/collections/recipes" 
              className="group md:col-span-6 relative h-[300px] rounded-[2rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-300 active:scale-[0.98]"
            >
                <div className="absolute inset-0">
                    <Image 
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2670&auto=format&fit=crop"
                        alt="Recipes"
                        fill
                        className="object-cover opacity-20 group-hover:opacity-10 grayscale transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
                
                <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-black/40 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/10 group-hover:border-[#DFFF00] transition-colors">
                    <ChefHat className="text-[#DFFF00]" size={20} />
                </div>

                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-3xl">
                    <div className="flex items-center gap-3 mb-2 md:mb-4">
                        <span className="px-2 py-0.5 bg-[#DFFF00] text-black font-bold text-[10px] uppercase tracking-widest rounded-full">New</span>
                        <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Global Database</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black uppercase text-white mb-2">Random Recipes</h2>
                    <p className="text-zinc-400 font-mono text-xs md:text-sm leading-relaxed max-w-xs group-hover:text-zinc-200 transition-colors">
                        Access culinary schematics. Breakfast, Lunch, Dinner.
                    </p>
                </div>
            </Link>

            {/* 6. ZINC SEARCH ENGINE (Wide) */}
            <Link 
              href="/collections/search" 
              className="group md:col-span-6 relative h-[300px] rounded-[2rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-300 active:scale-[0.98]"
            >
                <div className="absolute inset-0">
                    <Image 
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2670&auto=format&fit=crop"
                        alt="Search"
                        fill
                        className="object-cover opacity-30 group-hover:opacity-10 grayscale transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                <div className="absolute inset-0 bg-zinc-950/40" />
                
                {/* Center "Google-like" Search Bar Visualization */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                   <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter group-hover:scale-110 transition-transform duration-500">
                      <span className="text-[#DFFF00]">Z</span>INC
                   </h2>
                   
                   <div className="w-full max-w-xs md:max-w-sm h-10 md:h-12 rounded-full border border-zinc-600 bg-black/40 backdrop-blur-md flex items-center px-4 gap-3 group-hover:border-[#DFFF00] group-hover:shadow-[0_0_30px_rgba(223,255,0,0.2)] transition-all duration-500">
                      <Search className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors" size={16} />
                      <span className="text-zinc-500 font-mono text-[10px] md:text-xs uppercase tracking-widest group-hover:text-zinc-300">
                         Search Archive...
                      </span>
                   </div>
                </div>

                {/* Corner Label */}
                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8">
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800">
                      <Globe size={12} className="text-[#DFFF00]" />
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Global Web</span>
                   </div>
                </div>
            </Link>
            {/* 7. TIER LIST CREATOR (NEW) */}
            <Link href="/collections/tier-list" className="group md:col-span-12 relative h-64 md:h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 mt-6 active:scale-[0.98]">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                
                <div className="absolute top-0 right-0 p-8 opacity-30 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="flex flex-col gap-2">
                       <div className="w-16 h-4 bg-red-500 rounded-sm" />
                       <div className="w-12 h-4 bg-orange-500 rounded-sm" />
                       <div className="w-8 h-4 bg-yellow-500 rounded-sm" />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col justify-end h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-zinc-100 text-black font-bold text-xs uppercase tracking-widest rounded-full group-hover:bg-[#DFFF00] transition-colors">Utility</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase text-white mb-4">Hierarchy Builder</h2>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-lg group-hover:text-zinc-200 transition-colors">
                        Tactical asset classification. Drag-and-drop ranking system with local persistence and database import.
                    </p>
                </div>
            </Link>

        </div>
      </section>
    </main>
  );
}