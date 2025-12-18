'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  ArrowRight, Trophy, Wind, Shield, Flag, Zap, Activity, Radio, 
  Cpu, ShieldCheck 
} from 'lucide-react';
import BackButton from '../components/BackButton';
import GlobalTicker from '../components/GlobalTicker';

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

export default function SportsHub() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-zinc-950/80 z-10" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale mix-blend-overlay" />
      </div>

      <BackButton href="/" label="HOME" />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden py-20 border-b border-white/5">
        <div className="relative z-20 w-full max-w-[1600px] mx-auto px-6 flex flex-col items-center text-center">
          
          {/* STATUS PILL */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/60 border border-white/10 backdrop-blur-xl rounded-full shadow-2xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-300 tracking-[0.2em] uppercase">
                  Athletics Uplink
                </span>
             </div>
          </motion.div>

          {/* MASSIVE TYPOGRAPHY */}
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="text-[12vw] md:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase leading-[0.8] select-none"
          >
            LEAGUE <span className="text-stroke-3 text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-zinc-900">OPS</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-12 max-w-2xl text-center"
          >
             <div className="flex items-center justify-center gap-3 text-zinc-400 font-mono text-sm md:text-base leading-relaxed tracking-widest uppercase">
               <span className="text-[#DFFF00] font-black">///</span>
               <span>Real-time Telemetry & Archives</span>
             </div>
          </motion.div>
        </div>
      </section>

      <GlobalTicker />

      {/* --- MODULE GRID --- */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-20">
        
        {/* SECTION HEADER */}
        <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-2 h-2 bg-[#DFFF00] rounded-full shadow-[0_0_10px_#DFFF00]" />
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
            <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                 <Radio size={16} className="text-[#DFFF00]" />
                 <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Active Frequencies</span>
            </div>
        </div>

        <motion.div 
            variants={containerVar}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr"
        >
            
            {/* 1. NFL (Featured Wide) */}
            <motion.div variants={itemVar} className="md:col-span-8">
                <Link href="/sports/nfl" className="group relative block min-h-[360px] h-full rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(223,255,0,0.1)]">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=2626&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-20 grayscale transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
                    
                    <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 group-hover:border-[#DFFF00] transition-colors">
                        <Zap className="text-[#DFFF00]" size={24} />
                    </div>

                    <div className="absolute bottom-0 left-0 p-10 md:p-12 w-full max-w-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20 text-[#DFFF00] text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                 RedZone Link
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-4 italic tracking-tight">NFL Nexus</h2>
                        <p className="text-zinc-400 font-mono text-sm md:text-base leading-relaxed max-w-xl group-hover:text-zinc-200 transition-colors">
                            National Football League. Playoff picture, roster depth charts, and live scoring telemetry.
                        </p>
                    </div>
                </Link>
            </motion.div>

            {/* 2. NBA (Tall) */}
            <motion.div variants={itemVar} className="md:col-span-4 md:row-span-2">
                <Link href="/sports/nba" className="group relative flex flex-col h-full min-h-[400px] rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(234,88,12,0.1)]">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                    
                    <div className="absolute top-8 right-8">
                       <ArrowRight size={24} className="text-zinc-600 -rotate-45 group-hover:text-[#DFFF00] group-hover:rotate-0 transition-all duration-500" />
                    </div>

                    <div className="absolute bottom-0 left-0 p-10 w-full">
                        <Trophy size={48} className="text-zinc-600 group-hover:text-[#DFFF00] mb-6 transition-colors duration-500" />
                        <h2 className="text-4xl font-black uppercase text-white mb-2">NBA Ops</h2>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6 group-hover:text-zinc-300 transition-colors">
                            Hardwood<br/>Analytics
                        </p>
                        <div className="h-0.5 w-12 bg-[#DFFF00] group-hover:w-full transition-all duration-700" />
                    </div>
                </Link>
            </motion.div>

            {/* 3. F1 (Medium) */}
            <motion.div variants={itemVar} className="md:col-span-4">
                <Link href="/sports/f1" className="group relative block h-full min-h-[300px] rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.1)]">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-zinc-950/50" />
                    
                    <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                        <div className="p-3 bg-zinc-950/50 backdrop-blur-md rounded-2xl border border-white/10 text-red-500">
                             <Wind size={24} />
                        </div>
                        <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Season 2025</span>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                        <h2 className="text-3xl font-black uppercase text-white mb-2 leading-none">Formula 1<br/>Telemetry</h2>
                        <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-white transition-colors">
                            Live timing & driver standings.
                        </p>
                    </div>
                </Link>
            </motion.div>

            {/* 4. NRL & GOLF (Stacked) */}
            <motion.div variants={itemVar} className="md:col-span-4 flex flex-col gap-6">
                 {/* NRL */}
                <Link href="/sports/nrl" className="group relative flex-1 min-h-[160px] rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(223,255,0,0.1)]">
                    <div className="absolute inset-0 bg-[url('https://www.rlpa.com.au/wp-content/themes/yootheme/cache/5a/Erin-Clark-Named-2025-RLPA-NRL-Recruit-of-the-Year-5a22c256.jpeg')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-zinc-950/60" />
                    <div className="absolute inset-0 p-8 flex items-center justify-between">
                         <div>
                            <h3 className="text-2xl font-black uppercase text-white italic">NRL</h3>
                            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Premiership</span>
                         </div>
                         <Shield size={24} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                    </div>
                </Link>

                 {/* GOLF */}
                 <Link href="/sports/golf" className="group relative flex-1 min-h-[160px] rounded-[2.5rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-zinc-950/60" />
                    <div className="absolute inset-0 p-8 flex items-center justify-between">
                         <div>
                            <h3 className="text-2xl font-black uppercase text-white italic">PGA Golf</h3>
                            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Tour Rankings</span>
                         </div>
                         <Flag size={24} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                    </div>
                </Link>
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