'use client';

import React, { MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { 
  CarFront, Gamepad2, Flag, CloudHail, ArrowRight, 
  Database, Layers, Orbit, Search, Globe, ListOrdered
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
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-zinc-950/90 z-20" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 mix-blend-overlay" />
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <section className="relative z-10 h-[50vh] flex flex-col items-center justify-center border-b border-white/5">
        <div className="relative w-full max-w-[1400px] mx-auto px-6 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
             <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-900/60 border border-white/10 backdrop-blur-xl rounded-full shadow-2xl">
                <Database size={12} className="text-[#DFFF00]" />
                <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.2em] uppercase">Digital Archives</span>
             </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none select-none">Collections<span className="text-zinc-600">.DB</span></motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }} className="mt-8 max-w-lg text-center">
             <p className="text-zinc-500 font-mono text-xs md:text-sm leading-relaxed"><span className="text-[#DFFF00] font-black mr-2">///</span>Central repository for specialized item databases, mechanical schematics, and interactive encyclopedias.</p>
          </motion.div>
        </div>
      </section>

      <GlobalTicker />

      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-20">
        <SectionHeader title="Database Modules" icon={<Layers size={16} />} />
        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[320px] gap-6">
            <SpotlightCard className="md:col-span-8 rounded-[2.5rem]" spotlightColor="rgba(223, 255, 0, 0.15)">
                <Link href="/gaming" className="relative flex flex-col h-full w-full p-10 group z-30">
                    <div className="absolute inset-0 z-0">
                        <Image src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop" alt="Gaming Database" fill className="object-cover opacity-30 group-hover:opacity-20 grayscale transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="p-4 bg-zinc-950/50 backdrop-blur-md rounded-2xl border border-white/10 text-[#DFFF00]"><Gamepad2 size={28} /></div>
                        <div className="bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10"><span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Warframe Market</span></div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <h2 className="text-5xl md:text-6xl font-black uppercase text-white mb-2 tracking-tighter">Gaming DB</h2>
                        <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-lg group-hover:text-[#DFFF00] transition-colors">Item prices, module configurations, and drop tables.</p>
                    </div>
                </Link>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-4 rounded-[2.5rem]" spotlightColor="rgba(59, 130, 246, 0.25)">
                <Link href="/collections/planetarium" className="relative flex flex-col h-full w-full p-8 group z-30">
                    <div className="absolute inset-0 z-0">
                        <Image src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2670&auto=format&fit=crop" alt="Planetarium" fill className="object-cover opacity-40 group-hover:opacity-30 grayscale transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-zinc-950/90" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="p-3 bg-blue-500/10 backdrop-blur-md rounded-2xl border border-blue-500/20 text-blue-400"><Orbit size={24} /></div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <h2 className="text-4xl font-black uppercase text-white mb-1 tracking-tighter group-hover:text-blue-400 transition-colors">Planetarium</h2>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Solar System Map</p>
                    </div>
                </Link>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-4 rounded-[2.5rem]">
                <Link href="/automotive" className="relative flex flex-col h-full w-full p-8 group">
                    <div className="absolute inset-0 z-0">
                        <Image src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2670&auto=format&fit=crop" alt="Automotive" fill className="object-cover opacity-20 group-hover:opacity-10 grayscale transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                         <div className="p-3 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/10 text-zinc-400 group-hover:text-white"><CarFront size={24} /></div>
                        <ArrowRight size={20} className="text-zinc-600 -rotate-45 group-hover:text-[#DFFF00] group-hover:rotate-0 transition-all duration-500" />
                    </div>
                    <div className="relative z-10 mt-auto">
                        <h2 className="text-3xl font-black uppercase text-white mb-1 tracking-tight">Auto Index</h2>
                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Garage Protocol</p>
                        <div className="h-0.5 w-8 bg-[#DFFF00] mt-4 group-hover:w-full transition-all duration-700" />
                    </div>
                </Link>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-4 rounded-[2.5rem]" spotlightColor="rgba(6, 182, 212, 0.2)">
                <Link href="/collections/weather" className="relative flex flex-col h-full w-full p-8 group">
                     <div className="absolute inset-0 z-0">
                        <Image src="https://images.unsplash.com/photo-1514632542354-958d91dde23e?q=80&w=2670&auto=format&fit=crop" alt="Weather" fill className="object-cover opacity-20 group-hover:opacity-10 grayscale transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 to-transparent" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-12">
                            <CloudHail size={28} className="text-cyan-600 group-hover:text-cyan-400 transition-colors" />
                             <span className="text-[9px] font-mono font-bold text-cyan-900 bg-cyan-500/20 px-2 py-1 rounded">LIVE S.O.S</span>
                        </div>
                        <h2 className="text-3xl font-black uppercase text-white tracking-tight">Weather<br/>Scanner</h2>
                         <p className="text-zinc-600 font-mono text-[10px] mt-2 group-hover:text-cyan-400 transition-colors">AI Personality: Hostile</p>
                    </div>
                </Link>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-4 rounded-[2.5rem]" spotlightColor="rgba(34, 197, 94, 0.2)">
                <Link href="/collections/golf" className="relative flex flex-col h-full w-full p-8 group">
                    <div className="absolute inset-0 z-0">
                         <Image src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2670&auto=format&fit=crop" alt="Golf" fill className="object-cover opacity-20 group-hover:opacity-10 grayscale transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                        <Flag size={28} className="text-green-600 group-hover:text-green-400 transition-colors mb-auto" />
                        <div><h2 className="text-3xl font-black uppercase text-white tracking-tight">Golf<br/>Scorecard</h2><p className="text-zinc-500 font-mono text-[10px] mt-2">4-Operative Capacity</p></div>
                    </div>
                </Link>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-6 rounded-[2.5rem]" spotlightColor="rgba(249, 115, 22, 0.15)">
                <Link href="/collections/recipes" className="relative flex items-center h-full w-full p-8 group overflow-hidden">
                    <div className="absolute inset-0 z-0">
                         <Image src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2670&auto=format&fit=crop" alt="Recipes" fill className="object-cover opacity-20 group-hover:opacity-10 grayscale transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                    </div>
                    <div className="relative z-10 w-full">
                        <h2 className="text-4xl font-black uppercase text-white mb-2">Recipes</h2>
                        <p className="text-zinc-400 font-mono text-xs max-w-xs group-hover:text-white transition-colors">Breakfast, Lunch, Dinner schematics.</p>
                    </div>
                </Link>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-6 rounded-[2.5rem]">
                <Link href="/collections/search" className="relative flex flex-col items-center justify-center h-full w-full p-8 group">
                     <div className="absolute inset-0 z-0">
                         <Image src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2670&auto=format&fit=crop" alt="Search" fill className="object-cover opacity-20 group-hover:opacity-10 grayscale transition-transform duration-700 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-zinc-950/50" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tighter group-hover:scale-110 transition-transform duration-500"><span className="text-[#DFFF00]">Z</span>INC</h2>
                        <div className="w-64 h-10 rounded-full border border-zinc-600 bg-black/40 backdrop-blur-md flex items-center px-4 gap-3 group-hover:border-[#DFFF00] transition-colors"><Search className="text-zinc-500" size={14} /><span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Search Archive...</span></div>
                    </div>
                    <div className="absolute bottom-6 right-6 flex items-center gap-2"><Globe size={12} className="text-[#DFFF00]" /><span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Global Web</span></div>
                </Link>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-12 rounded-[2.5rem]" spotlightColor="rgba(255, 255, 255, 0.1)">
                <Link href="/collections/tier-list" className="relative flex items-end h-full w-full p-10 group">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                    <div className="relative z-10 w-full">
                        <div className="flex items-center gap-3 mb-4"><ListOrdered size={20} className="text-zinc-400" /><span className="px-3 py-1 bg-zinc-800 text-zinc-300 font-bold text-[10px] uppercase tracking-widest rounded-full border border-white/5">Utility</span></div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-2">Hierarchy Builder</h2>
                        <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-lg group-hover:text-white transition-colors">Tactical asset classification. Drag-and-drop ranking system with local persistence.</p>
                    </div>
                </Link>
            </SpotlightCard>
        </div>
      </section>
    </main>
  );
}