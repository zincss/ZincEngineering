'use client';

import React, { useState, useEffect, MouseEvent } from 'react';
import Link from 'next/link';
import { motion, useAnimation, useMotionTemplate, useMotionValue } from 'framer-motion';
import { 
  Brain, ChevronRight, Construction, Spade, Trophy, Package, ArrowRight, Info, X, LogIn, Flame, Zap, Hash 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- CUSTOM ANIMATIONS ---
const AnimatedSpade = () => {
  const controls = useAnimation();
  return (
    <motion.svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onMouseEnter={() => controls.start("hover")} onMouseLeave={() => controls.start("normal")}>
      <motion.path d="M5 9c0-2.3 2-3 4-3 1.5 0 2.8 1 3 2.2.2-1.2 1.5-2.2 3-2.2 2 0 4 .7 4 3 0 2.8-2.6 6.3-5.2 9.5-.7.9-1.8.9-2.5 0C8.6 15.3 5 11.8 5 9z" variants={{ hover: { scale: 1.1 }, normal: { scale: 1 } }} animate={controls} />
      <path d="M12 17v5" />
    </motion.svg>
  );
};

const AnimatedFlame = () => {
  const controls = useAnimation();
  return (
    <motion.svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onMouseEnter={() => controls.start("hover")} onMouseLeave={() => controls.start("normal")}>
      <motion.path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.3.9.8 2.3 2.9 2.8z" variants={{ hover: { scale: [1, 1.1, 1], y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.8 } }, normal: { scale: 1, y: 0 } }} animate={controls} />
    </motion.svg>
  );
};

// --- SPOTLIGHT CARD ---
function SpotlightCard({ children, className = "", spotlightColor = "rgba(223, 255, 0, 0.15)" }: { children: React.ReactNode; className?: string; spotlightColor?: string; }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  return (
    <div className={`group relative border border-zinc-800 bg-zinc-900 overflow-hidden ${className}`} onMouseMove={handleMouseMove}>
      <motion.div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10" style={{ background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)` }} />
      <div className="relative h-full z-20">{children}</div>
    </div>
  );
}

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
  <div className="flex items-center gap-4 mb-6 px-2 sticky top-20 z-20 py-2 glass-panel rounded-xl md:static md:bg-transparent md:p-0">
      <div className="p-2 bg-[#DFFF00]/10 rounded-lg border border-[#DFFF00]/20 hidden md:block"><Icon size={18} className="text-[#DFFF00]" /></div>
      <div className="flex-1">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2"><span className="md:hidden text-[#DFFF00]"><Icon size={16} /></span>{title}</h3>
          <p className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-widest">{subtitle}</p>
      </div>
      <div className="h-px flex-1 bg-zinc-800 hidden md:block" />
  </div>
);

export default function PlayHub() {
  const { user, loading } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const hasSeenIntro = sessionStorage.getItem('zinc_play_intro_seen');
      if (!hasSeenIntro) setShowInfoModal(true);
    }
  }, [loading, user]);

  const closeInfoModal = () => { setShowInfoModal(false); sessionStorage.setItem('zinc_play_intro_seen', 'true'); };

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 relative overflow-x-hidden selection:bg-[#DFFF00] selection:text-black font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={closeInfoModal} />
          <div className="relative bg-zinc-900 border border-[#DFFF00]/30 rounded-3xl p-8 max-w-lg w-full animate-in zoom-in-95 slide-in-from-bottom-4">
            <button onClick={closeInfoModal} className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white"><X size={20} /></button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#DFFF00]/10 rounded-full border border-[#DFFF00]/20"><Info className="text-[#DFFF00]" size={24} /></div>
              <div><h3 className="text-xl font-black uppercase tracking-tight">Ecosystem Access</h3><p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Guest Mode Detected</p></div>
            </div>
            <div className="space-y-4 font-mono text-sm text-zinc-400 py-6 border-y border-zinc-800 mb-6"><p><strong className="text-white">Welcome to Zinc Arcade.</strong> Signing in unlocks persistence, credits, and the global economy.</p></div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="flex-1 flex items-center justify-center gap-2 bg-[#DFFF00] hover:bg-[#cce600] text-black font-bold py-3 px-4 rounded-xl uppercase text-xs tracking-widest"><LogIn size={16} /> Initialize Session</Link>
              <button onClick={closeInfoModal} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-xl uppercase text-xs tracking-widest">Continue as Guest</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 pt-24 pb-8 px-6 max-w-[1600px] mx-auto w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                 <Brain size={24} className="text-[#DFFF00]" />
              </div>
              <div>
                 <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                    <span>ARCADE_SYSTEMS // v4.0</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">
                    System <span className="text-zinc-800">Arcade</span>
                 </h1>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-2 text-zinc-600 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest">Online</span>
           </div>
        </div>

        {/* MONOLITH GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[300px] gap-[1px] bg-zinc-800 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
           
           {/* CYPHERS (Large) */}
           <Link href="/play/cyphers" className="group md:col-span-8 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">01_Logic</span>
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 group-hover:border-black/20 group-hover:bg-black/10 transition-colors">
                       <span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full animate-pulse group-hover:bg-black" />
                       <span className="text-[9px] font-bold text-zinc-500 group-hover:text-black/60 uppercase">Daily_Protocol</span>
                    </div>
                 </div>
                 <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                    <Hash size={18} />
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors mb-2">Protocol Cyphers</h3>
                 <p className="font-mono text-xs text-zinc-500 max-w-md group-hover:text-black/60">
                    Daily cryptographic sequence challenge. Decrypt security layers to earn credits.
                 </p>
              </div>
           </Link>

           {/* BLACK MARKET (Medium) */}
           <Link href="/play/market" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                 <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">02_Acquire</span>
                 <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                    <Package size={18} />
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Black Market</h3>
                 <div className="h-0.5 w-8 bg-[#DFFF00] mt-4 group-hover:bg-black group-hover:w-full transition-all duration-500" />
              </div>
           </Link>

           {/* POKER */}
           <Link href="/play/poker" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                 <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">03_Table</span>
                 <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                    <Trophy size={18} />
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Poker</h3>
                 <p className="font-mono text-[10px] text-zinc-500 group-hover:text-black/60 mt-1 uppercase tracking-widest">Texas Hold'em //</p>
              </div>
           </Link>

           {/* BLACKJACK */}
           <Link href="/play/blackjack" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                 <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">04_Table</span>
                 <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                    <AnimatedSpade />
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Blackjack</h3>
                 <p className="font-mono text-[10px] text-zinc-500 group-hover:text-black/60 mt-1 uppercase tracking-widest">21 Protocol //</p>
              </div>
           </Link>

           {/* ROULETTE */}
           <Link href="/play/roulette" className="group md:col-span-4 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                 <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">05_Chance</span>
                 <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                    <Spade size={18} />
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Roulette</h3>
                 <p className="font-mono text-[10px] text-zinc-500 group-hover:text-black/60 mt-1 uppercase tracking-widest">Spin Cycle //</p>
              </div>
           </Link>

           {/* HOTSEAT */}
           <Link href="/play/hotseat" className="group md:col-span-6 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                 <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">06_Rapid</span>
                 <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                    <AnimatedFlame />
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Hotseat</h3>
                 <p className="font-mono text-[10px] text-zinc-500 group-hover:text-black/60 mt-1 uppercase tracking-widest">High Velocity Trivia //</p>
              </div>
           </Link>

           {/* TRIVIA MATRIX */}
           <Link href="/collections/trivia" className="group md:col-span-6 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                 <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">07_Database</span>
                 <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                    <Brain size={18} />
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Trivia Matrix</h3>
                 <p className="font-mono text-[10px] text-zinc-500 group-hover:text-black/60 mt-1 uppercase tracking-widest">Standard Assessment //</p>
              </div>
           </Link>

        </div>

        <div className="mt-12 opacity-60 hover:opacity-100 transition-opacity">
           <div className="border border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-950">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-zinc-900 rounded-2xl text-zinc-600 border border-zinc-800">
                     <Construction size={32} />
                  </div>
                  <div>
                     <h3 className="text-lg font-black uppercase text-zinc-500 tracking-wide">Memory Core</h3>
                     <p className="text-xs font-mono text-zinc-600">Module under construction</p>
                  </div>
               </div>
               <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-700 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">v0.9.2 Alpha</div>
           </div>
        </div>
      </div>
    </main>
  );
}