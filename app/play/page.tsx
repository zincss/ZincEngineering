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
    <motion.svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onMouseEnter={() => controls.start("hover")} onMouseLeave={() => controls.start("normal")}>
      <motion.path d="M5 9c0-2.3 2-3 4-3 1.5 0 2.8 1 3 2.2.2-1.2 1.5-2.2 3-2.2 2 0 4 .7 4 3 0 2.8-2.6 6.3-5.2 9.5-.7.9-1.8.9-2.5 0C8.6 15.3 5 11.8 5 9z" variants={{ hover: { scale: 1.1 }, normal: { scale: 1 } }} animate={controls} />
      <path d="M12 17v5" />
    </motion.svg>
  );
};

const AnimatedFlame = () => {
  const controls = useAnimation();
  return (
    <motion.svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onMouseEnter={() => controls.start("hover")} onMouseLeave={() => controls.start("normal")}>
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
    <main className="min-h-screen bg-zinc-950 text-white pb-20 relative overflow-x-hidden selection:bg-[#DFFF00] selection:text-black">
      <div className="bg-starfield fixed inset-0 z-0" />
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

      <section className="relative pt-32 pb-8 px-6 border-b border-zinc-800/50 z-10 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 text-white">System <span className="text-zinc-800">Arcade</span></h1>
                <p className="text-zinc-400 font-mono text-xs md:text-sm max-w-xl leading-relaxed"><span className="text-[#DFFF00] font-black mr-2">///</span>Interactive simulation modules. Wager credits. Test algorithms.</p>
            </div>
            <Link href="/play/market" className="group flex items-center gap-3 px-6 py-3 bg-[#DFFF00] hover:bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(223,255,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95 whitespace-nowrap">
                <Package size={16} className="group-hover:rotate-12 transition-transform" /><span>Black Market</span><ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform" />
            </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-16 relative z-10">
        <section>
           <div className="flex items-center gap-2 mb-4"><Zap size={16} className="text-[#DFFF00] fill-[#DFFF00] animate-pulse" /><span className="text-xs font-mono font-bold text-[#DFFF00] uppercase tracking-widest">Daily Protocol</span></div>
           <Link href="/play/cyphers" className="group relative block w-full h-[400px] md:h-[320px] rounded-[2.5rem] overflow-hidden border border-zinc-700 hover:border-[#DFFF00] transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105 saturate-0 group-hover:saturate-100" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DFFF00] text-black text-[10px] font-black uppercase tracking-widest rounded-full w-fit mb-4"><span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" /> New Module</div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-4 tracking-tight group-hover:text-[#DFFF00] transition-colors">Protocol <br/><span className="text-zinc-600 group-hover:text-white transition-colors">Cyphers</span></h2>
                  <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-6 max-w-md">Daily cryptographic sequence challenge. Decrypt 4, 5, and 6-letter security layers to earn credits.</p>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white group-hover:translate-x-2 transition-transform">Initiate Hack <ArrowRight size={14} /></div>
              </div>
           </Link>
        </section>

        <section>
          <SectionHeader icon={Spade} title="Live Tables" subtitle="High Stakes Environment" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
             <div className="col-span-1 md:col-span-2 lg:col-span-6 group relative min-h-[300px] rounded-[2rem] border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500">
                <Link href="/play/poker" className="block h-full">
                  <div className="absolute inset-0 overflow-hidden"><video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity duration-700"><source src="/videos/casino-bg.mp4" type="video/mp4" /></video><div className="absolute inset-0 bg-zinc-950/50" /></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  <div className="absolute top-6 right-6 bg-black/50 backdrop-blur p-3 rounded-full border border-white/10 group-hover:scale-110 transition-transform"><Trophy className="text-[#DFFF00]" size={24} /></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full"><h2 className="text-4xl font-black uppercase text-white mb-2">Texas Hold&apos;em</h2><p className="text-zinc-400 font-mono text-sm max-w-lg">No-Limit Protocol. Neural network opponents.</p></div>
                </Link>
             </div>
             <SpotlightCard className="lg:col-span-3 h-full min-h-[300px] rounded-[2rem]">
                <Link href="/play/blackjack" className="relative flex flex-col h-full p-8 group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2674&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                    <div className="relative z-10 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-fit mb-auto group-hover:border-[#DFFF00]/50 transition-colors"><AnimatedSpade /></div>
                    <div className="relative z-10"><h2 className="text-2xl font-black uppercase text-white mb-2 group-hover:text-[#DFFF00] transition-colors">Blackjack</h2><p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">21 Probability Sim</p></div>
                </Link>
             </SpotlightCard>
             <SpotlightCard className="lg:col-span-3 h-full min-h-[300px] rounded-[2rem]">
                <Link href="/play/roulette" className="relative flex flex-col h-full p-8 group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=2672&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                    <div className="relative z-10 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-fit mb-auto group-hover:border-[#DFFF00]/50 transition-colors"><Spade size={24} className="text-white group-hover:text-[#DFFF00] transition-colors" /></div>
                    <div className="relative z-10"><h2 className="text-2xl font-black uppercase text-white mb-2 group-hover:text-[#DFFF00] transition-colors">Roulette</h2><p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Wheel of Fortune</p></div>
                </Link>
             </SpotlightCard>
          </div>
        </section>

        <section>
          <SectionHeader icon={Brain} title="Cognitive Sims" subtitle="Market & Logic" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <SpotlightCard className="rounded-[2.5rem]">
                <Link href="/play/cyphers" className="relative flex flex-col h-64 p-8 group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-zinc-950/60" />
                    <div className="relative z-10 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-fit mb-auto group-hover:border-[#DFFF00]/50 transition-colors"><Hash size={24} className="text-[#DFFF00]" /></div>
                    <div className="relative z-10"><h2 className="text-2xl font-black uppercase text-white mb-2 group-hover:text-[#DFFF00] transition-colors">Cyphers</h2><p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Cryptographic Word Logic</p></div>
                </Link>
             </SpotlightCard>
             <SpotlightCard className="rounded-[2.5rem]" spotlightColor="rgba(239, 68, 68, 0.2)">
                <Link href="/play/hotseat" className="relative flex flex-col h-64 p-8 group">
                    <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3826581/pexels-photo-3826581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-30 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-zinc-950/60" />
                    <div className="relative z-10 flex justify-between w-full mb-auto"><div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 group-hover:border-red-500/50 transition-colors"><AnimatedFlame /></div><div className="px-3 py-1.5 h-fit bg-[#DFFF00] text-black font-black text-[10px] uppercase tracking-widest rounded-full animate-pulse">HOT</div></div>
                    <div className="relative z-10"><h2 className="text-2xl font-black uppercase text-white mb-2 group-hover:text-red-500 transition-colors">Hotseat</h2><p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Rapid Fire Trivia</p></div>
                </Link>
             </SpotlightCard>
             <SpotlightCard className="rounded-[2.5rem]">
                <Link href="/collections/trivia" className="relative flex flex-col h-64 p-8 group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-zinc-950/60" />
                    <div className="relative z-10 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-fit mb-auto group-hover:border-[#DFFF00]/50 transition-colors"><Brain size={24} className="text-white" /></div>
                    <div className="relative z-10"><h2 className="text-2xl font-black uppercase text-white mb-2 group-hover:text-[#DFFF00] transition-colors">Trivia Matrix</h2><p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Standard Assessment</p></div>
                </Link>
             </SpotlightCard>
          </div>
        </section>

        <section className="opacity-60 hover:opacity-100 transition-opacity">
           <div className="border border-dashed border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-950/30">
               <div className="flex items-center gap-4"><div className="p-4 bg-zinc-900 rounded-2xl text-zinc-600"><Construction size={32} /></div><div><h3 className="text-lg font-black uppercase text-zinc-500">Memory Core</h3><p className="text-xs font-mono text-zinc-600">Module under construction</p></div></div>
               <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-700 bg-zinc-900 px-4 py-2 rounded-full">v0.9.2 Alpha</div>
           </div>
        </section>
      </div>
    </main>
  );
}