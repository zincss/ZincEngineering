'use client';

import React, { useState, useEffect } from 'react';
import GlobalTicker from './components/GlobalTicker';
import PersonalLogs from './components/PersonalLogs';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ArrowRight, Trophy, Gamepad2, Package, 
  Activity, CloudHail, Zap, Terminal, ChevronRight,
  PlayCircle, Layers, TrendingUp, ShieldCheck, Cpu
} from 'lucide-react';
import EditableContent from '@/app/components/EditableContent'; // IMPORT ADDED

// --- ANIMATION VARIANTS ---
const containerVar: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVar: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 50 
    } 
  }
};

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const words = ["Engineering", "Ecosystem", "Economy", "Everyone", "Everything"];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  const scrollToModules = () => {
    const modulesSection = document.getElementById('modules-grid');
    if (modulesSection) {
      modulesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToLogs = () => {
    const logsSection = document.getElementById('system-logs');
    if (logsSection) {
      logsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      
      {/* --- CINEMATIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-zinc-950/80 z-10" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 mix-blend-overlay pointer-events-none" />
          
          <video 
            autoPlay loop muted playsInline
            poster="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-overlay"
          >
            <source src="/rocket.mp4" type="video/mp4" />
          </video>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden py-20">
        
        <div className="relative z-20 w-full max-w-[1600px] mx-auto px-6 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* FLOATING STATUS PILL */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-10"
          >
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/60 border border-white/10 backdrop-blur-xl rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-300 tracking-[0.2em] uppercase">
                  <EditableContent id="home-status-pill" defaultContent="System Online v2.6" tag="span" />
                </span>
             </div>
          </motion.div>

          {/* MASSIVE BRANDING */}
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 select-none max-w-full">
             
             {/* LOGO */}
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 1.2, ease: "circOut" }}
               className="relative group"
             >
                <div className="absolute -inset-10 bg-[#DFFF00] rounded-full blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-700" />
                <div className="relative bg-[#DFFF00] w-32 h-32 md:w-52 md:h-52 flex items-center justify-center rounded-[2.5rem] shadow-[0_0_40px_rgba(223,255,0,0.15)] shrink-0 overflow-hidden transform transition-transform duration-500 group-hover:scale-105">
                    <span className="font-black text-[90px] md:text-[160px] text-black leading-none z-10">Z</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-black/5 opacity-50 pointer-events-none" />
                </div>
             </motion.div>

             {/* TEXT STACK */}
             <div className="flex flex-col items-center lg:items-start justify-center">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                   <EditableContent 
                      id="home-hero-title" 
                      defaultContent="ZINC" 
                      tag="h1" 
                      className="font-black text-7xl md:text-9xl lg:text-[11rem] leading-[0.8] text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 tracking-tighter drop-shadow-2xl"
                   />
                </motion.div>
                
                <div className="h-8 md:h-12 overflow-hidden relative w-full flex justify-center lg:justify-start mt-6">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={words[wordIndex]}
                      initial={{ y: 30, opacity: 0, filter: 'blur(5px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -30, opacity: 0, filter: 'blur(5px)' }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-[2px] bg-[#DFFF00]" />
                      <span className="font-mono text-lg md:text-2xl text-zinc-400 tracking-[0.3em] uppercase">
                        {words[wordIndex]}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
             </div>
          </div>

          {/* ACTION BUTTONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto"
          >
             
            <button 
              onClick={scrollToModules}
              className="group relative px-10 py-4 bg-[#DFFF00] text-black font-black text-xs tracking-[0.2em] uppercase rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(223,255,0,0.3)] hover:shadow-[0_0_50px_rgba(223,255,0,0.5)]"
            >
              <span className="relative z-10 flex items-center gap-3">
                <EditableContent id="home-btn-init" defaultContent="Initialize System" tag="span" />
                <ArrowRight size={14} />
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            </button>

            <div className="flex items-center gap-3">
                <QuickLink href="/collections/weather" icon={<CloudHail size={14} />} label="Weather" />
                <button 
                  onClick={scrollToLogs}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-900/40 border border-white/10 hover:border-[#DFFF00]/50 hover:bg-zinc-900 transition-all group backdrop-blur-md"
                >
                  <span className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors"><Terminal size={14} /></span>
                  <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest">
                    <EditableContent id="home-btn-logs" defaultContent="System Logs" tag="span" />
                  </span>
                </button>
            </div>

          </motion.div>
        </div>
      </section>

      {/* TICKER */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="sticky top-0 z-40 bg-zinc-950/70 backdrop-blur-xl border-y border-white/5 shadow-2xl"
      >
        <GlobalTicker />
      </motion.div>

      {/* --- MODULES GRID --- */}
      <section id="modules-grid" className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-24">
        
        <SectionHeader title="Mainframe" icon={<Activity size={16} />} id="home-header-mainframe" />

        {/* BENTO GRID */}
        <motion.div 
          variants={containerVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24"
        >
          
          {/* 1. SPORTS */}
          <motion.div variants={itemVar} className="md:col-span-4 md:row-span-2">
            <div className="group relative flex flex-col h-full min-h-[500px] rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-blue-500/50 transition-all duration-500 overflow-hidden hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
               
               {/* Background links to Main Sports Page */}
               <Link href="/sports" className="absolute inset-0 z-0">
                   {/* CHANGED: Video Background */}
                   <video 
                     autoPlay loop muted playsInline 
                     className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110 grayscale"
                   >
                     <source src="/sports-page.mp4" type="video/mp4" />
                   </video>
                   <div className="absolute inset-0 bg-zinc-950/60" />
               </Link>

               <div className="relative p-10 flex-1 flex flex-col z-10 pointer-events-none">
                  <div className="flex justify-between items-start mb-auto">
                     <div className="p-3 bg-zinc-950/50 backdrop-blur-md rounded-2xl border border-white/10 text-blue-400 group-hover:scale-110 transition-transform">
                        <Trophy size={28} />
                     </div>
                     <Activity size={20} className="text-blue-500 animate-pulse" />
                  </div>

                  <div className="mb-6">
                    <EditableContent 
                        id="home-card-sports-title" 
                        defaultContent="Sports Telemetry" 
                        tag="h2" 
                        className="text-4xl font-black uppercase text-white tracking-tighter leading-tight"
                    />
                  </div>
                  
                  {/* Buttons Container */}
                  <div className="space-y-3 pointer-events-auto">
                     {[
                        { label: 'Formula 1', path: '/sports/f1' },
                        { label: 'NBA Stats', path: '/sports/nba' },
                        { label: 'NFL Data', path: '/sports/nfl' }
                     ].map((item, i) => (
                        <Link 
                           key={i} 
                           href={item.path}
                           className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all cursor-pointer group/item backdrop-blur-sm"
                        >
                           <span className="text-xs font-mono font-bold text-zinc-400 group-hover/item:text-white uppercase">{item.label}</span>
                           <ChevronRight size={14} className="text-zinc-600 group-hover/item:text-blue-400" />
                        </Link>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>

          {/* 2. ARCHIVES / COLLECTIONS */}
          <motion.div variants={itemVar} className="md:col-span-8">
            <Link href="/collections" className="group relative flex flex-col h-full min-h-[260px] rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-purple-500/50 transition-all duration-500 overflow-hidden hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]">
               <video 
                 autoPlay loop muted playsInline 
                 className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110 grayscale"
               >
                 <source src="/archive-page.mp4" type="video/mp4" />
               </video>
               
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />

               <div className="relative p-10 h-full flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-zinc-950/50 backdrop-blur-md rounded-2xl border border-white/10 text-purple-400 group-hover:scale-110 transition-transform">
                        <Layers size={24} />
                    </div>
                  </div>
                  
                  <div>
                    <EditableContent 
                        id="home-card-archives-title" 
                        defaultContent="Archives" 
                        tag="h2" 
                        className="text-3xl font-black uppercase text-white mb-2 tracking-tighter"
                    />
                    <EditableContent 
                        id="home-card-archives-desc" 
                        defaultContent="Weather // Recipes // Tools" 
                        tag="p" 
                        className="text-purple-400/80 font-mono text-xs uppercase tracking-widest"
                    />
                  </div>
               </div>
            </Link>
          </motion.div>

          {/* 3. ARCADE */}
          <motion.div variants={itemVar} className="md:col-span-8">
            <Link href="/play" className="group relative block h-full min-h-[260px] rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-[#DFFF00]/50 transition-all duration-500 overflow-hidden hover:shadow-[0_0_40px_rgba(223,255,0,0.1)]">
               <video 
                 autoPlay loop muted playsInline 
                 className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-20 transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
               >
                 <source src="/play-page.mp4" type="video/mp4" />
               </video>

               <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

               <div className="relative p-10 h-full flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                     <div className="p-4 bg-zinc-950/50 backdrop-blur-md rounded-2xl border border-white/10 text-[#DFFF00] shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <Gamepad2 size={24} />
                     </div>
                     <PlayCircle size={40} className="text-white/20 group-hover:text-[#DFFF00] transition-colors duration-500" />
                  </div>
                  <div>
                     <EditableContent 
                        id="home-card-arcade-title" 
                        defaultContent="Arcade" 
                        tag="h2" 
                        className="text-4xl md:text-5xl font-black uppercase text-white mb-2 tracking-tighter drop-shadow-lg"
                     />
                     <div className="inline-flex gap-2 items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest">
                            <EditableContent 
                                id="home-card-arcade-desc" 
                                defaultContent="Play games & earn/gamble currency" 
                                tag="span" 
                            />
                        </span>
                     </div>
                  </div>
               </div>
            </Link>
          </motion.div>

        </motion.div>

        {/* --- MARKET SECTION --- */}
        <SectionHeader title="Underground Exchange" icon={<TrendingUp size={16} />} id="home-header-exchange" />

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="mb-24"
        >
            <Link href="/market" className="group relative block w-full min-h-[360px] rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-[#DFFF00]/50 transition-all duration-500 overflow-hidden hover:shadow-[0_0_50px_rgba(223,255,0,0.1)]">
               
               <video 
                 autoPlay loop muted playsInline 
                 className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-10 transition-all duration-700 group-hover:scale-105 grayscale"
               >
                 <source src="/market-page.mp4" type="video/mp4" />
               </video>

               <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-zinc-950/60 to-transparent" />

               <div className="relative p-12 h-full flex flex-col justify-center items-end text-right z-10">
                  <div className="mb-6 px-4 py-2 bg-[#DFFF00]/10 border border-[#DFFF00]/30 rounded-full backdrop-blur-md">
                     <span className="flex items-center gap-2 text-xs font-black text-[#DFFF00] uppercase tracking-widest">
                        <Zap size={14} className="fill-[#DFFF00]" /> 
                        <EditableContent id="home-card-market-pill" defaultContent="Live Economy" tag="span" />
                     </span>
                  </div>

                  <EditableContent 
                     id="home-card-market-title" 
                     defaultContent="Black Market" 
                     tag="h2" 
                     className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#DFFF00] transition-all"
                  />
                  
                  <div className="text-zinc-400 font-mono text-sm uppercase tracking-widest max-w-xl leading-relaxed">
                     <EditableContent 
                        id="home-card-market-desc" 
                        defaultContent="Trade serialized assets, open packs, and manage your inventory in the secure exchange protocol." 
                        tag="p" 
                     />
                  </div>
                  
                  <div className="mt-8 flex items-center gap-4">
                     <div className="h-px w-24 bg-zinc-800 group-hover:bg-[#DFFF00] transition-colors" />
                     <Package size={24} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                  </div>
               </div>
            </Link>
        </motion.div>

        {/* LOGS SECTION */}
        <section id="system-logs" className="scroll-mt-24">
            <SectionHeader title="System Logs" icon={<Terminal size={16} />} id="home-header-logs" />
            
            <div className="relative rounded-[3rem] bg-zinc-900/20 border border-white/5 p-2 md:p-8 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <PersonalLogs />
            </div>
        </section>

      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 pt-20 pb-12 px-6 text-center border-t border-white/5 bg-zinc-950">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center gap-8">
            
            <div className="w-12 h-12 bg-[#DFFF00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(223,255,0,0.2)]">
                <span className="font-black text-xl text-black">Z</span>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Secure Connection: Est. 2024</span>
                </div>
                <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-blue-500" />
                    <span>System Status: Optimal</span>
                </div>
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[#DFFF00]" />
                    <span>Version: 2.6.1</span>
                </div>
            </div>

            <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

            <p className="text-zinc-600 font-bold text-xs uppercase tracking-wider hover:text-white transition-colors cursor-default">
              Zinc Engineering © 2025 // All Rights Reserved
            </p>
        </div>
      </footer>
    </main>
  );
}

// --- SUB-COMPONENTS ---

const QuickLink = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => (
  <Link 
    href={href} 
    className="flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-900/40 border border-white/10 hover:border-[#DFFF00]/50 hover:bg-zinc-900 transition-all group backdrop-blur-md"
  >
    <span className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors">{icon}</span>
    <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest">{label}</span>
  </Link>
);

const SectionHeader = ({ title, icon, id }: { title: string, icon: React.ReactNode, id: string }) => (
  <div className="flex items-center gap-4 mb-12 px-4">
      <div className="w-2 h-2 bg-[#DFFF00] rounded-full shadow-[0_0_10px_#DFFF00]" />
      <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      <div className="flex items-center gap-2 text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
           {icon}
           <span className="text-xs font-mono font-bold uppercase tracking-widest">
             <EditableContent id={id} defaultContent={title} tag="span" />
           </span>
      </div>
  </div>
);