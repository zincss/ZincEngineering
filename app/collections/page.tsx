'use client';

import React, { MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { 
  CarFront, Gamepad2, Flag, CloudHail, ArrowRight, 
  Database, Layers, Orbit, Search, Globe, ListOrdered,
  Book
} from 'lucide-react'; 
import GlobalTicker from '../components/GlobalTicker';

function SpotlightCard({ children, className = "", spotlightColor = "rgba(223, 255, 0, 0.15)" }: { children: React.ReactNode; className?: string; spotlightColor?: string; }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  return (
    <div className={`group relative border border-white/10 bg-zinc-900 overflow-hidden ${className}`} onMouseMove={handleMouseMove}>
      <motion.div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10" style={{ background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)` }} />
      <div className="relative h-full z-20">{children}</div>
    </div>
  );
}

const SectionHeader = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
  <div className="flex items-center gap-4 mb-12 px-4">
      <div className="w-2 h-2 bg-[#DFFF00] rounded-full shadow-[0_0_10px_#DFFF00]" />
      <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      <div className="flex items-center gap-2 text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md shadow-lg">{icon}<span className="text-xs font-mono font-bold uppercase tracking-widest">{title}</span></div>
  </div>
);

export default function CollectionsHub() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 pt-24 pb-8 px-6 max-w-[1600px] mx-auto w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                 <Database size={24} className="text-[#DFFF00]" />
              </div>
              <div>
                 <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                    <span>DIGITAL_ARCHIVES // v3.1</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">
                    Collections<span className="text-zinc-800">.DB</span>
                 </h1>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-2 text-zinc-600 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest">Online</span>
           </div>
        </div>

        <GlobalTicker />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 auto-rows-[300px] gap-[1px] bg-zinc-800 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
            
            {/* GAMING DB (8) */}
            <Link href="/gaming" className="group md:col-span-8 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">01_Warframe</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <Gamepad2 size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl md:text-5xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">Gaming DB</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest max-w-md group-hover:text-black/60">
                        Item prices, module configurations, and drop tables.
                    </p>
                </div>
            </Link>

            {/* PLANETARIUM (4) */}
            <Link href="/collections/planetarium" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">02_Astro</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <Orbit size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">Planetarium</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">Solar System Map //</p>
                </div>
            </Link>

            {/* AUTO INDEX (4) */}
            <Link href="/automotive" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">03_Garage</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <CarFront size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">Auto Index</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">Vehicle Database //</p>
                </div>
            </Link>

            {/* WEATHER (4) */}
            <Link href="/collections/weather" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">04_Atmos</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <CloudHail size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">Weather</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">Live Scanner //</p>
                </div>
            </Link>

            {/* GOLF (4) */}
            <Link href="/collections/golf" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">05_Score</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <Flag size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">Golf</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">4-Op Capacity //</p>
                </div>
            </Link>

            {/* RECIPES (6) */}
            <Link href="/collections/recipes" className="group md:col-span-6 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">06_Nutrition</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">Recipes</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">Schematic Database //</p>
                </div>
            </Link>

            {/* SEARCH (6) */}
            <Link href="/collections/search" className="group md:col-span-6 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">07_Query</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <Globe size={18} />
                    </div>
                </div>
                <div className="relative z-10 w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-4xl font-black uppercase text-white tracking-tighter italic group-hover:text-black transition-colors">Zinc</h3>
                        <div className="h-px flex-1 bg-zinc-800 group-hover:bg-black/20" />
                        <Search size={24} className="text-zinc-600 group-hover:text-black" />
                    </div>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">Global Web Search //</p>
                </div>
            </Link>

            {/* TIER LIST (12) */}
            <Link href="/collections/tier-list" className="group md:col-span-12 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-row items-center justify-between overflow-hidden">
                <div className="relative z-10 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                            <ListOrdered size={18} />
                        </div>
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">08_Utility</span>
                    </div>
                    <h3 className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter italic group-hover:text-black transition-colors">Hierarchy Builder</h3>
                </div>
                <div className="relative z-10 hidden md:flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black/60">Classification Tool</div>
                        <div className="text-2xl font-black text-white group-hover:text-black">ACTIVE</div>
                    </div>
                    <Layers size={32} className="text-zinc-600 group-hover:text-black transition-colors" />
                </div>
            </Link>

            {/* THE LIBRARY (12) */}
            <Link href="/collections/library" className="group md:col-span-12 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-row items-center justify-between overflow-hidden">
                <div className="relative z-10 hidden md:flex items-center gap-4">
                    <Book size={32} className="text-zinc-600 group-hover:text-black transition-colors" />
                    <div className="text-left">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black/60">Knowledge Archive</div>
                        <div className="text-2xl font-black text-white group-hover:text-black">SECURE</div>
                    </div>
                </div>
                <div className="relative z-10 flex flex-col justify-center h-full text-right items-end">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">09_Archive</span>
                        <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                            <Book size={18} />
                        </div>
                    </div>
                    <h3 className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter italic group-hover:text-black transition-colors">The Library</h3>
                </div>
            </Link>

        </div>
      </div>
    </main>
  );
}