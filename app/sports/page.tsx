'use client';

import React, { MouseEvent } from 'react';
import Link from 'next/link';
import { motion, useAnimation, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ArrowRight, Zap, Radio, Microscope, Shield, Flag } from 'lucide-react';
import GlobalTicker from '../components/GlobalTicker';
import PersonalNexus from './components/PersonalNexus';
import { useSportsMode } from '@/app/context/SportsModeContext';
import SportsDashboard from './components/SportsDashboard';

// --- CUSTOM ANIMATED ICONS ---

const AnimatedFlag = () => {
  const controls = useAnimation();
  return (
    <motion.svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onMouseEnter={() => controls.start("hover")} onMouseLeave={() => controls.start("normal")}>
      <motion.path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" variants={{ hover: { y: [0, -2, 0], x: [0, 1, 0], transition: { duration: 1, repeat: Infinity } }, normal: { y: 0, x: 0 } }} animate={controls} />
      <line x1="4" x2="4" y1="22" y2="15" />
    </motion.svg>
  );
};

const AnimatedTrophy = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      onMouseEnter={() => controls.start("hover")}
      onMouseLeave={() => controls.start("normal")}
    >
      <motion.path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" variants={{ hover: { x: -2, rotate: -5 }, normal: { x: 0, rotate: 0 } }} animate={controls} />
      <motion.path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" variants={{ hover: { x: 2, rotate: 5 }, normal: { x: 0, rotate: 0 } }} animate={controls} />
      <motion.path d="M4 22h16" />
      <motion.path 
        d="M8 21h8v-2l-1-1v-6c0-3.1-1.6-5-4-5s-4 1.9-4 5v6l-1 1v2z" 
        variants={{ hover: { y: -2, scale: 1.05 }, normal: { y: 0, scale: 1 } }} 
        animate={controls}
      />
    </motion.svg>
  );
};

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

export default function SportsHub() {
  const { isSportsMode } = useSportsMode();

  if (isSportsMode) {
      return <SportsDashboard />;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 relative overflow-x-hidden selection:bg-[#DFFF00] selection:text-black font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 pt-24 pb-8 px-6 max-w-[1600px] mx-auto w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                 <Radio size={24} className="text-[#DFFF00]" />
              </div>
              <div>
                 <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                    <span>SPORTS_TELEMETRY // LIVE</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">
                    League <span className="text-zinc-800">Info</span>
                 </h1>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-2 text-zinc-600 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest">Receiving Data</span>
           </div>
        </div>

        <GlobalTicker />

        <PersonalNexus />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 auto-rows-[300px] gap-[1px] bg-zinc-800 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
            
            {/* BREAKDOWN CARD (8) */}
            <Link href="/sports/breakdown" className="group md:col-span-8 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">01_Analysis</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <Microscope size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl md:text-5xl font-black uppercase text-white mb-4 tracking-tighter italic group-hover:text-black transition-colors">The Breakdown</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest max-w-md group-hover:text-black/60">
                        Comprehensive offensive & defensive matchup analysis. Win probability and historical telemetry.
                    </p>
                </div>
            </Link>
            
            {/* NFL CARD (4) */}
            <Link href="/sports/nfl" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">02_Gridiron</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <Zap size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">NFL</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">Playoff Picture //</p>
                </div>
            </Link>

            {/* NBA CARD (4) */}
            <Link href="/sports/nba" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">03_Hardwood</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <AnimatedTrophy /> 
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">NBA</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">Live Scoring //</p>
                </div>
            </Link>

            {/* F1 CARD (4) */}
            <Link href="/sports/f1" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">04_Velocity</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <Flag size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">Formula 1</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">Global Circuit //</p>
                </div>
            </Link>

            {/* NRL CARD (4) */}
            <Link href="/sports/nrl" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">05_Rugby</span>
                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <Shield size={18} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-black transition-colors">NRL</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-black/60">Premiership //</p>
                </div>
            </Link>

            {/* GOLF CARD (12) */}
            <Link href="/sports/golf" className="group md:col-span-12 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-row items-center justify-between overflow-hidden">
                <div className="relative z-10 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                            <AnimatedFlag />
                        </div>
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">06_PGA_Tour</span>
                    </div>
                    <h3 className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter italic group-hover:text-black transition-colors">Golf</h3>
                </div>
                <div className="relative z-10 hidden md:flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black/60">Tour Rankings</div>
                        <div className="text-2xl font-black text-white group-hover:text-black">ACTIVE</div>
                    </div>
                    <ArrowRight size={32} className="text-zinc-600 group-hover:text-black -rotate-45 group-hover:rotate-0 transition-all duration-500" />
                </div>
            </Link>

        </div>
      </div>
      
      <footer className="relative z-10 pt-20 pb-12 px-6 text-center border-t border-white/5 bg-zinc-950">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center gap-8">
            <div className="w-12 h-12 bg-[#DFFF00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(223,255,0,0.2)]">
                <span className="font-black text-xl text-black">Z</span>
            </div>
            <p className="text-zinc-600 font-bold text-xs uppercase tracking-wider">Zinc Engineering © 2025</p>
        </div>
      </footer>
    </main>
  );
}