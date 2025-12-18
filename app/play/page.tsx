'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Brain, ChevronRight, Construction, Spade, Trophy, Activity, ArrowRight, Info, X, LogIn, Flame, 
  ShieldCheck, Cpu, Building2, CircleDashed
} from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import EditableContent from '@/app/components/EditableContent'; // IMPORT ADDED

const containerVar: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const itemVar: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
};

export default function PlayHub() {
  const { user, loading } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const hasSeenIntro = sessionStorage.getItem('zinc_play_intro_seen');
      if (!hasSeenIntro) {
        setShowInfoModal(true);
      }
    }
  }, [loading, user]);

  const closeInfoModal = () => {
    setShowInfoModal(false);
    sessionStorage.setItem('zinc_play_intro_seen', 'true');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-zinc-950/80 z-10" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 mix-blend-overlay pointer-events-none" />
      </div>
      <div className="bg-starfield" />

      <BackButton href="/" label="MAIN TERMINAL" />

      {/* --- NOT AUTHENTICATED POPUP MODAL --- */}
      <AnimatePresence>
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeInfoModal}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-zinc-900 border border-[#DFFF00]/30 rounded-[2rem] p-8 max-w-lg w-full shadow-[0_0_50px_rgba(223,255,0,0.1)]"
          >
            <button 
              onClick={closeInfoModal}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#DFFF00]/10 rounded-full border border-[#DFFF00]/20">
                <Info className="text-[#DFFF00]" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Ecosystem Access</h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Guest Mode Detected</p>
              </div>
            </div>

            <div className="space-y-4 font-mono text-sm text-zinc-400 leading-relaxed border-t border-b border-zinc-800 py-6 mb-6">
              <p><strong className="text-white">Welcome to the Zinc Arcade.</strong></p>
              <p>This platform works with our <span className="text-[#DFFF00]">currency system</span>. Signing in unlocks:</p>
              <ul className="grid grid-cols-2 gap-2 mt-2">
                <li className="flex items-center gap-2 text-xs text-zinc-300"><span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full" /> Pack Openings</li>
                <li className="flex items-center gap-2 text-xs text-zinc-300"><span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full" /> Zinc Exchange</li>
                <li className="flex items-center gap-2 text-xs text-zinc-300"><span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full" /> Persistent Profiles</li>
                <li className="flex items-center gap-2 text-xs text-zinc-300"><span className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full" /> Global Stats</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="flex-1 flex items-center justify-center gap-2 bg-[#DFFF00] hover:bg-white text-black font-bold py-3 px-4 rounded-xl transition-all uppercase text-xs tracking-widest">
                <LogIn size={16} /> Initialize Session
              </Link>
              <button onClick={closeInfoModal} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-xl transition-all uppercase text-xs tracking-widest border border-zinc-700">
                Continue as Guest
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* --- HEADER SECTION --- */}
      <section className="relative pt-40 pb-12 px-6 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto relative">
          
          <div className="absolute top-0 right-0 hidden md:flex items-center gap-2">
             <div className="bg-zinc-900/50 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  <EditableContent id="play-status-pill" defaultContent="Arcade Protocols Online" tag="span" />
                </span>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                <h1 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 leading-[0.8]">
                    <EditableContent id="play-hero-text-1" defaultContent="SYSTEM" tag="span" />{' '}
                    <span className="text-stroke-3 text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-zinc-900">
                        <EditableContent id="play-hero-text-2" defaultContent="ARCADE" tag="span" />
                    </span>
                </h1>
                <p className="text-zinc-400 font-mono text-sm md:text-base max-w-2xl leading-relaxed tracking-widest mt-8">
                   <span className="text-[#DFFF00] font-black mr-2">///</span>
                   <EditableContent 
                        id="play-hero-desc" 
                        defaultContent="Interactive entertainment modules and cognitive assessment tools." 
                        tag="span" 
                   />
                </p>
            </motion.div>

            <Link 
                href="/market"
                className="group flex items-center gap-3 px-8 py-4 bg-[#DFFF00] hover:bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_30px_rgba(223,255,0,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:-translate-y-1 active:scale-95"
            >
                <Building2 size={16} className="group-hover:rotate-12 transition-transform" />
                <span>Enter Economy Hub</span>
                <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- MODULE GRID --- */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-12">
        
        <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-2 h-2 bg-[#DFFF00] rounded-full shadow-[0_0_10px_#DFFF00]" />
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
            <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                 <Activity size={16} className="text-[#DFFF00]" />
                 <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                    <EditableContent id="play-section-header" defaultContent="Active Simulations" tag="span" />
                 </span>
            </div>
        </div>

        <motion.div 
            variants={containerVar}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr"
        >
            
            {/* 1. TEXAS HOLD'EM (Video BG) */}
            <motion.div variants={itemVar} className="md:col-span-8">
                <Link 
                    href="/play/poker" 
                    className="group relative block min-h-[380px] h-full rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(223,255,0,0.1)]"
                >
                    <div className="absolute inset-0 overflow-hidden">
                       <video 
                         autoPlay loop muted playsInline 
                         className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700 group-hover:scale-105"
                       >
                          <source src="/videos/casino-bg.mp4" type="video/mp4" />
                       </video>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

                    <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 group-hover:border-[#DFFF00] transition-colors">
                        <Trophy className="text-[#DFFF00]" size={24} />
                    </div>

                    <div className="absolute bottom-0 left-0 p-10 md:p-12 w-full max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                           <span className="px-3 py-1 rounded-full bg-zinc-900/50 text-zinc-300 border border-white/10 text-[10px] font-black uppercase tracking-widest group-hover:bg-[#DFFF00] group-hover:text-black group-hover:border-[#DFFF00] transition-colors backdrop-blur-md">
                              Elite Stakes
                           </span>
                        </div>
                        <EditableContent 
                            id="play-card-poker-title" 
                            defaultContent="Texas Hold'em" 
                            tag="h2" 
                            className="text-4xl md:text-5xl font-black uppercase text-white mb-4 italic tracking-tight"
                        />
                        <div className="text-zinc-400 font-mono text-sm leading-relaxed group-hover:text-zinc-200 transition-colors">
                            <EditableContent 
                                id="play-card-poker-desc" 
                                defaultContent="No-Limit Protocol. Compete against neural network agents in a high-stakes environment." 
                                tag="p" 
                            />
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* 2. BLACKJACK */}
            <motion.div variants={itemVar} className="md:col-span-4">
                <Link 
                    href="/play/blackjack" 
                    className="group relative block min-h-[380px] h-full rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2674&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                    
                    <div className="absolute top-8 left-8">
                       <Spade size={32} className="text-zinc-700 group-hover:text-[#DFFF00] transition-colors duration-500" />
                    </div>

                    <div className="absolute bottom-0 left-0 p-10 w-full">
                       <EditableContent 
                            id="play-card-blackjack-title" 
                            defaultContent="Tactical Blackjack" 
                            tag="h2" 
                            className="text-3xl font-black uppercase text-white mb-2 leading-none"
                        />
                       <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6 group-hover:text-zinc-300 transition-colors">
                         Probability Sim
                       </p>
                       <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-[#DFFF00] transition-colors">
                            Enter Table <ChevronRight size={12} />
                       </div>
                    </div>
                </Link>
            </motion.div>

            {/* NEW: ROULETTE */}
            <motion.div variants={itemVar} className="md:col-span-8">
                <Link 
                    href="/play/roulette" 
                    className="group relative block h-full min-h-[300px] rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-20 grayscale transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-zinc-950/60 to-transparent" />
                    
                    <div className="absolute top-8 right-8">
                       <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-full group-hover:scale-110 transition-transform shadow-xl">
                          <CircleDashed size={24} className="text-[#DFFF00] animate-spin-slow" />
                       </div>
                    </div>

                    <div className="absolute bottom-0 right-0 p-10 text-right w-full">
                       <EditableContent 
                            id="play-card-roulette-title" 
                            defaultContent="Roulette Royale" 
                            tag="h2" 
                            className="text-3xl md:text-5xl font-black uppercase text-white mb-2 italic"
                        />
                       <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
                          European Wheel // 36x Payouts
                       </p>
                    </div>
                </Link>
            </motion.div>

            {/* 3. HOTSEAT */}
            <motion.div variants={itemVar} className="md:col-span-4">
                <Link 
                    href="/play/hotseat" 
                    className="group relative block h-full min-h-[300px] rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                >
                    <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3826581/pexels-photo-3826581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                    
                    <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                       <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20 group-hover:border-red-500 group-hover:bg-red-500 text-red-500 group-hover:text-black transition-all">
                           <Flame size={24} />
                       </div>
                    </div>

                    <div className="absolute bottom-0 left-0 p-8 w-full">
                       <EditableContent 
                            id="play-card-hotseat-title" 
                            defaultContent="Protocol: Hotseat" 
                            tag="h2" 
                            className="text-2xl font-black uppercase text-white mb-2 italic"
                        />
                       <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-zinc-300 transition-colors">
                          High voltage trivia.
                       </p>
                    </div>
                </Link>
            </motion.div>

            {/* 4. TRIVIA */}
            <motion.div variants={itemVar} className="md:col-span-6">
                <Link 
                    href="/collections/trivia" 
                    className="group relative block h-full min-h-[260px] rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 to-transparent" />
                    
                    <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                       <Brain size={32} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                    </div>

                    <div className="absolute bottom-0 left-0 p-8 w-full">
                       <EditableContent 
                            id="play-card-trivia-title" 
                            defaultContent="Trivia Matrix" 
                            tag="h2" 
                            className="text-2xl font-black uppercase text-white mb-2"
                        />
                       <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-zinc-300 transition-colors">
                          Standard assessment generator.
                       </p>
                    </div>
                </Link>
            </motion.div>

            {/* 5. COMING SOON */}
            <motion.div variants={itemVar} className="md:col-span-6">
                <div className="group relative h-full min-h-[260px] rounded-[2.5rem] border border-dashed border-zinc-800 bg-zinc-950/30 flex flex-col items-center justify-center text-center p-8 opacity-60 hover:opacity-100 transition-all hover:border-zinc-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                        <Construction size={10} />
                        In Development
                    </div>
                    <EditableContent 
                        id="play-card-wip-title" 
                        defaultContent="Memory Core" 
                        tag="h3" 
                        className="text-xl font-black uppercase tracking-tight text-zinc-700 group-hover:text-zinc-400"
                    />
                </div>
            </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 pt-20 pb-12 px-6 text-center border-t border-white/5 bg-zinc-950">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center gap-8">
            <div className="w-12 h-12 bg-[#DFFF00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(223,255,0,0.2)]">
                <span className="font-black text-xl text-black">Z</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /><span>Secure Connection</span></div>
                <div className="flex items-center gap-2"><Cpu size={14} className="text-blue-500" /><span>System: Optimal</span></div>
                <div className="flex items-center gap-2"><Activity size={14} className="text-[#DFFF00]" /><span>Version: 2.6.1</span></div>
            </div>
            <p className="text-zinc-600 font-bold text-xs uppercase tracking-wider">Zinc Engineering © 2025</p>
        </div>
      </footer>
    </main>
  );
}