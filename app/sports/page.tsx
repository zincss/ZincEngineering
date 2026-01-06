'use client';

import React, { MouseEvent } from 'react';
import Link from 'next/link';
import { motion, useAnimation, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ArrowRight, Zap, Radio, Microscope, Shield, Flag } from 'lucide-react';
import GlobalTicker from '../components/GlobalTicker';

// --- CUSTOM ANIMATED ICONS ---

const AnimatedFlag = () => {
  const controls = useAnimation();
  return (
    <motion.svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onMouseEnter={() => controls.start("hover")} onMouseLeave={() => controls.start("normal")}>
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
      width="48" height="48" viewBox="0 0 24 24" fill="none"
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
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0"><div className="absolute inset-0 bg-zinc-950/80 z-10" /><div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 mix-blend-overlay pointer-events-none" /><div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale mix-blend-overlay" /></div>

      <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden py-20 border-b border-white/5">
        <div className="relative z-20 w-full max-w-[1600px] mx-auto px-6 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mb-8">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/60 border border-white/10 backdrop-blur-xl rounded-full shadow-2xl"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span></span><span className="text-[10px] font-mono font-bold text-zinc-300 tracking-[0.2em] uppercase">Athletics Uplink</span></div>
          </motion.div>
          <motion.h1 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: "circOut" }} className="text-[12vw] md:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase leading-[0.8] select-none">LEAGUE <span className="text-stroke-3 text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-zinc-900">INFO</span></motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-12 max-w-2xl text-center"><div className="flex items-center justify-center gap-3 text-zinc-400 font-mono text-sm md:text-base leading-relaxed tracking-widest uppercase"><span className="text-[#DFFF00] font-black">///</span><span>Real-time Telemetry & Archives</span></div></motion.div>
        </div>
      </section>

      <GlobalTicker />

      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-20">
        <div className="flex items-center gap-4 mb-12 px-2"><div className="w-2 h-2 bg-[#DFFF00] rounded-full shadow-[0_0_10px_#DFFF00]" /><div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" /><div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md"><Radio size={16} className="text-[#DFFF00]" /><span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Active Frequencies</span></div></div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">
            
            {/* BREAKDOWN CARD */}
            <SpotlightCard className="md:col-span-12 rounded-[2.5rem]">
               <Link href="/sports/breakdown" className="block h-full w-full group overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1631194758628-71ec7c35137e?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-all duration-700 grayscale mix-blend-luminosity z-0" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-0" />
                    
                    <div className="absolute top-0 right-0 p-8 z-20">
                       <div className="bg-[#DFFF00] text-black px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg animate-pulse">
                          New Uplink
                       </div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-center p-10 md:p-16 max-w-4xl h-full min-h-[300px]">
                        <div className="flex items-center gap-3 text-[#DFFF00] mb-4">
                            <Microscope size={24} />
                            <span className="font-mono text-sm uppercase tracking-[0.3em]">Deep Analysis Protocol</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase text-white mb-6 tracking-tighter italic">
                           The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DFFF00] to-zinc-500">Breakdown</span>
                        </h2>
                        <p className="text-zinc-400 font-mono text-sm md:text-lg leading-relaxed max-w-xl border-l-2 border-[#DFFF00] pl-6">
                            Comprehensive offensive & defensive matchup analysis. 
                            Win probability, historical telemetry, and real-time tactical overlays.
                        </p>
                        <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white group-hover:translate-x-4 transition-transform">
                             <span>Initialize Scan</span>
                             <ArrowRight size={16} className="text-[#DFFF00]" />
                        </div>
                    </div>
               </Link>
            </SpotlightCard>
            
            {/* NFL CARD */}
            <SpotlightCard className="md:col-span-8 rounded-[2.5rem]">
                <Link href="/sports/nfl" className="block h-full w-full group overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=2626&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-20 grayscale transition-all duration-700 group-hover:scale-105 z-0" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent z-0" />
                    
                    <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 group-hover:border-[#DFFF00] transition-colors z-20">
                        <Zap className="text-[#DFFF00]" size={24} />
                    </div>

                    <div className="relative z-10 flex flex-col justify-end p-10 md:p-12 w-full max-w-3xl h-full min-h-[360px]">
                        <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-4 italic tracking-tight">NFL</h2>
                        <p className="text-zinc-400 font-mono text-sm md:text-base leading-relaxed max-w-xl group-hover:text-zinc-200 transition-colors">
                            National Football League. Playoff picture, roster depth charts, and live scoring telemetry.
                        </p>
                    </div>
                </Link>
            </SpotlightCard>

            {/* NBA CARD (Fixed Trophy & Opacity) */}
            <SpotlightCard className="md:col-span-4 md:row-span-2 rounded-[2.5rem]">
                <Link href="/sports/nba" className="block h-full w-full group overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105 z-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent z-0" />
                    
                    <div className="absolute top-8 right-8 z-20">
                       <ArrowRight size={24} className="text-zinc-600 -rotate-45 group-hover:text-[#DFFF00] group-hover:rotate-0 transition-all duration-500" />
                    </div>

                    <div className="relative z-10 flex flex-col justify-end p-10 w-full h-full min-h-[400px]">
                        <div className="text-zinc-600 group-hover:text-[#DFFF00] mb-6 transition-colors duration-500">
                            <AnimatedTrophy /> 
                        </div>
                        <h2 className="text-4xl font-black uppercase text-white mb-2">NBA</h2>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6 group-hover:text-zinc-300 transition-colors">
                            Hardwood<br/>Analytics
                        </p>
                        <div className="h-0.5 w-12 bg-[#DFFF00] group-hover:w-full transition-all duration-700" />
                    </div>
                </Link>
            </SpotlightCard>

            {/* F1 CARD */}
            <SpotlightCard className="md:col-span-4 rounded-[2.5rem]">
                <Link href="/sports/f1" className="block h-full w-full group overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105 z-0" />
                    <div className="absolute inset-0 bg-zinc-950/50 z-0" />
                    
                    <div className="relative z-10 flex flex-col justify-end p-8 w-full h-full min-h-[300px]">
                        <h2 className="text-3xl font-black uppercase text-white mb-2 leading-none">Formula 1<br/>Telemetry</h2>
                    </div>
                </Link>
            </SpotlightCard>

            {/* NRL & GOLF CARDS */}
            <div className="md:col-span-4 flex flex-col gap-6">
                <SpotlightCard className="flex-1 min-h-[160px] rounded-[2.5rem]">
                    <Link href="/sports/nrl" className="relative flex items-center justify-between h-full p-8 group overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.rlpa.com.au/wp-content/themes/yootheme/cache/5a/Erin-Clark-Named-2025-RLPA-NRL-Recruit-of-the-Year-5a22c256.jpeg')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105 z-0" />
                        <div className="absolute inset-0 bg-zinc-950/60 z-0" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black uppercase text-white italic">NRL</h3>
                            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Premiership</span>
                        </div>
                        <div className="relative z-10">
                            <Shield size={24} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                        </div>
                    </Link>
                </SpotlightCard>

                 <SpotlightCard className="flex-1 min-h-[160px] rounded-[2.5rem]">
                    <Link href="/sports/golf" className="relative flex items-center justify-between h-full p-8 group overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105 z-0" />
                        <div className="absolute inset-0 bg-zinc-950/60 z-0" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black uppercase text-white italic">PGA Golf</h3>
                            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Tour Rankings</span>
                        </div>
                        <div className="relative z-10">
                            <AnimatedFlag />
                        </div>
                    </Link>
                </SpotlightCard>
            </div>
        </div>
      </section>
      
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