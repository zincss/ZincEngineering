'use client';

import React, { useState, useEffect, MouseEvent } from 'react';
import GlobalTicker from './components/GlobalTicker';
import PersonalLogs from './components/PersonalLogs';
import Link from 'next/link';
import { 
  motion, AnimatePresence, useScroll, useTransform, 
  useMotionTemplate, useMotionValue 
} from 'framer-motion';
import { 
  ArrowRight, Trophy, Gamepad2, 
  Activity, CloudHail, Terminal,
  Layers, TrendingUp, ShieldCheck, Cpu,
  Info, Navigation, Coins, X, MoveRight
} from 'lucide-react';

// --- UTILITY: MOUSE-FOLLOW SPOTLIGHT ---
function SpotlightCard({ 
  children, 
  className = "", 
  spotlightColor = "rgba(223, 255, 0, 0.15)" 
}: { 
  children: React.ReactNode; 
  className?: string;
  spotlightColor?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div 
      className={`group relative border border-white/10 bg-zinc-900/40 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full z-20">{children}</div>
    </div>
  );
}

// --- COMPONENT: INTRO OVERLAY ---
const introSteps = [
  {
    id: 'init',
    title: "SYSTEM INITIALIZED",
    subtitle: "Welcome to ZINC Engineering",
    description: "You have accessed a comprehensive digital ecosystem. This platform unifies real-time sports telemetry, a simulated underground economy, and competitive arcade modules.",
    icon: <Cpu size={48} className="text-[#DFFF00]" />,
  },
  {
    id: 'nav',
    title: "COMMAND CENTER",
    subtitle: "Global Navigation",
    description: "The Header Bar is your primary controller. Access the Weather Station, Arcade, Market Exchange, and Archives from anywhere in the network.",
    icon: <Navigation size={48} className="text-blue-400" />,
  },
  {
    id: 'eco',
    title: "LIVE ECONOMY",
    subtitle: "Credits & Assets",
    description: "Participate in the Black Market. Open packs, trade serialized assets, and gamble in the Arcade. Your portfolio value is tracked in real-time.",
    icon: <Coins size={48} className="text-amber-400" />,
  },
  {
    id: 'start',
    title: "READY TO LAUNCH",
    subtitle: "Awaiting Input",
    description: "System optimal. Data streams active. Explore the modules below or check the System Logs for updates.",
    icon: <Activity size={48} className="text-emerald-400" />,
  }
];

const IntroOverlay = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const currentData = introSteps[step];
  const isLast = step === introSteps.length - 1;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      <motion.div 
        layout
        className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 flex">
          {introSteps.map((_, i) => (
             <div key={i} className={`h-full flex-1 transition-all duration-500 ${i <= step ? 'bg-[#DFFF00]' : 'bg-transparent'}`} />
          ))}
        </div>

        <div className="p-12 flex flex-col items-center text-center">
           <AnimatePresence mode="wait">
             <motion.div 
               key={currentData.id}
               initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
               animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
               exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
               className="flex flex-col items-center"
             >
                <div className="mb-6 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md">
                   {currentData.icon}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
                  {currentData.title}
                </h1>
                <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-md mb-8">
                  {currentData.description}
                </p>
             </motion.div>
           </AnimatePresence>

           <div className="flex items-center gap-4 w-full justify-center">
              {step > 0 && (
                <button onClick={() => setStep(prev => prev - 1)} className="px-6 py-3 rounded-xl border border-white/10 text-zinc-500 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
                  Back
                </button>
              )}
              <button 
                onClick={() => isLast ? onClose() : setStep(prev => prev + 1)}
                className="px-10 py-3 bg-[#DFFF00] hover:bg-white text-black rounded-xl transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
              >
                 {isLast ? "Enter System" : "Next Step"} <ArrowRight size={14} />
              </button>
           </div>
        </div>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-600 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const words = ["Engineering", "Economy", "Entertainment", "Everything"];
  const [showIntro, setShowIntro] = useState(false);

  // Parallax Logic
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const videoY = useTransform(scrollY, [0, 1000], [0, -150]);

  useEffect(() => {
    // Check LocalStorage
    const hasSeen = localStorage.getItem('zinc_intro_v3_0'); 
    if (!hasSeen) {
      const timer = setTimeout(() => setShowIntro(true), 1000);
      return () => clearTimeout(timer);
    }
    
    // Word Cycler
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  const handleCloseIntro = () => {
    setShowIntro(false);
    localStorage.setItem('zinc_intro_v3_0', 'true');
  };

  const scrollToModules = () => document.getElementById('modules-grid')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToLogs = () => document.getElementById('system-logs')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      
      <AnimatePresence>
        {showIntro && <IntroOverlay onClose={handleCloseIntro} />}
      </AnimatePresence>

      {/* --- CINEMATIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-zinc-950/80 z-20" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 z-20 mix-blend-overlay" />
          
          <motion.div style={{ y: videoY }} className="absolute inset-0 z-10 h-[120%]">
            <video 
              autoPlay loop muted playsInline
              poster="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop"
              className="w-full h-full object-cover opacity-50 grayscale mix-blend-overlay"
            >
              <source src="/rocket.mp4" type="video/mp4" />
            </video>
          </motion.div>
      </div>

      {/* --- HERO SECTION --- */}
      <motion.section 
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 min-h-[92vh] flex flex-col items-center justify-center py-20 px-6"
      >
        {/* Subtle Gradient Glow Behind Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-[1400px] mx-auto flex flex-col items-center lg:items-center text-center">
          
          {/* Status Chip */}
          <motion.button 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            onClick={() => setShowIntro(true)}
            className="mb-12 group inline-flex items-center gap-3 px-5 py-2 bg-zinc-900/60 border border-white/10 hover:border-[#DFFF00]/50 hover:bg-zinc-900/90 backdrop-blur-2xl rounded-full transition-all cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.3)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
            </span>
            <span className="text-[10px] font-mono font-bold text-zinc-300 group-hover:text-white tracking-[0.25em] uppercase transition-colors">
              System Online v3.0
            </span>
            <div className="w-px h-3 bg-white/10 mx-1" />
            <Info size={12} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors" />
          </motion.button>

          {/* Typography & Branding */}
          <div className="flex flex-col items-center gap-8 select-none w-full max-w-5xl">
             
             {/* Logo + Title Lockup */}
             <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                 
                 {/* Emblem (Static, no rotation) */}
                 <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }} 
                   animate={{ scale: 1, opacity: 1 }} 
                   transition={{ duration: 1.2, ease: "circOut" }}
                   className="relative group"
                 >
                    <div className="absolute -inset-8 bg-[#DFFF00] rounded-[2.5rem] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                    <div className="relative bg-[#DFFF00] w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-[1.5rem] shadow-2xl shrink-0 overflow-hidden hover:scale-105 transition-transform duration-500">
                        <span className="font-black text-[70px] md:text-[90px] text-black leading-none z-10">Z</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-black/5 opacity-50" />
                    </div>
                 </motion.div>

                 {/* Main Text */}
                 <div className="flex flex-col items-center md:items-start">
                    <motion.h1 
                      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}
                      className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 tracking-tighter drop-shadow-sm leading-[0.9] text-center md:text-left"
                    >
                       ZINC<br/><span className="text-zinc-500">ECOSYSTEMS</span>
                    </motion.h1>
                 </div>
             </div>
             
             {/* Divider Line */}
             <motion.div 
               initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5, duration: 1 }}
               className="h-px w-full max-w-md bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-4" 
             />

             {/* Rotating Subtext */}
             <div className="h-6 overflow-hidden relative w-full flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={words[wordIndex]}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[#DFFF00] font-bold text-xs">///</span>
                    <span className="font-mono text-sm md:text-base text-zinc-400 tracking-[0.4em] uppercase">
                      {words[wordIndex]}
                    </span>
                    <span className="text-[#DFFF00] font-bold text-xs">///</span>
                  </motion.div>
                </AnimatePresence>
             </div>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 flex flex-col sm:flex-row items-center gap-5 w-full justify-center"
          >
            <button 
              onClick={scrollToModules}
              className="group relative px-10 py-4 bg-[#DFFF00] text-black font-black text-xs tracking-[0.2em] uppercase rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(223,255,0,0.15)] hover:shadow-[0_0_60px_rgba(223,255,0,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-3">
                Initialize System <ArrowRight size={14} />
              </span>
              <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <button 
              onClick={scrollToLogs}
              className="group flex items-center gap-3 px-8 py-4 rounded-full bg-zinc-900/40 border border-white/10 hover:bg-zinc-900 hover:border-white/20 transition-all backdrop-blur-md"
            >
              <Terminal size={14} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors"/>
              <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest">System Logs</span>
            </button>
          </motion.div>

        </div>
      </motion.section>

      {/* --- TICKER --- */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
        className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-y border-white/5 shadow-2xl"
      >
        <GlobalTicker />
      </motion.div>

      {/* --- GRID SYSTEM --- */}
      <section id="modules-grid" className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-6 py-32">
        
        <SectionHeader title="Active Modules" icon={<Activity size={16} />} />

        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[280px] gap-6">
          
          {/* 1. SPORTS (Large) */}
          <SpotlightCard className="md:col-span-8 md:row-span-2 rounded-[2.5rem]">
            <Link href="/sports" className="relative flex flex-col h-full w-full p-10 group z-30">
               {/* Video BG */}
               <div className="absolute inset-0 z-0">
                   <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-30">
                     <source src="/sports-page.mp4" type="video/mp4" />
                   </video>
                   <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
               </div>

               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="p-4 bg-zinc-950/50 backdrop-blur-md rounded-2xl border border-white/10 text-blue-400 group-hover:scale-110 transition-transform">
                        <Trophy size={28} />
                     </div>
                     <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                        Live Telemetry
                     </span>
                  </div>

                  <div>
                     <h2 className="text-5xl md:text-7xl font-black uppercase text-white mb-4 tracking-tighter">Sports</h2>
                     <div className="flex flex-wrap gap-3">
                        {['Formula 1', 'NBA', 'NFL', 'PGA Tour'].map((item) => (
                           <span key={item} className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 text-xs font-mono font-bold uppercase hover:bg-white/10 hover:text-white transition-colors">
                              {item}
                           </span>
                        ))}
                     </div>
                  </div>
               </div>
            </Link>
          </SpotlightCard>

          {/* 2. ARCADE (Medium) */}
          <SpotlightCard className="md:col-span-4 rounded-[2.5rem]" spotlightColor="rgba(223, 255, 0, 0.2)">
            <Link href="/play" className="relative flex flex-col h-full w-full p-8 group">
               <div className="absolute inset-0 z-0">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 transition-all duration-700 group-hover:scale-110">
                     <source src="/play-page.mp4" type="video/mp4" />
                   </video>
                   <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 to-transparent" />
               </div>

               <div className="relative z-10 flex justify-between items-start mb-auto">
                  <div className="p-3 bg-zinc-950/50 backdrop-blur-md rounded-2xl border border-white/10 text-[#DFFF00]">
                     <Gamepad2 size={24} />
                  </div>
               </div>
               
               <div className="relative z-10">
                  <h2 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter">Arcade</h2>
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest group-hover:text-[#DFFF00] transition-colors">
                     High Stakes Gaming
                  </p>
               </div>
            </Link>
          </SpotlightCard>

          {/* 3. ARCHIVES (Medium) */}
          <SpotlightCard className="md:col-span-4 rounded-[2.5rem]" spotlightColor="rgba(168, 85, 247, 0.2)">
            <Link href="/collections" className="relative flex flex-col h-full w-full p-8 group">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="absolute inset-0 z-0">
                   <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-10 grayscale transition-all duration-700 group-hover:scale-110">
                     <source src="/archive-page.mp4" type="video/mp4" />
                   </video>
               </div>
               
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <Layers size={24} className="text-purple-400" />
                  <div>
                    <h2 className="text-3xl font-black uppercase text-white mb-2 tracking-tighter">Archives</h2>
                    <p className="text-purple-400/80 font-mono text-xs uppercase tracking-widest">
                       Databases & Tools
                    </p>
                  </div>
               </div>
            </Link>
          </SpotlightCard>

          {/* 4. MARKET (Full Width Strip) */}
          <SpotlightCard className="md:col-span-12 md:row-span-1 rounded-[2.5rem]" spotlightColor="rgba(16, 185, 129, 0.2)">
             <Link href="/market" className="relative flex items-center justify-between h-full w-full p-10 group overflow-hidden">
                <div className="absolute inset-0 z-0">
                   <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 grayscale transition-all duration-700 group-hover:opacity-30 group-hover:scale-105">
                     <source src="/market-page.mp4" type="video/mp4" />
                   </video>
                   <div className="absolute inset-0 bg-zinc-950/60" />
                </div>

                <div className="relative z-10 flex flex-col justify-center">
                   <div className="flex items-center gap-3 mb-2">
                      <TrendingUp size={18} className="text-emerald-500" />
                      <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                         Underground Exchange
                      </span>
                   </div>
                   <h2 className="text-5xl md:text-6xl font-black uppercase text-white tracking-tighter group-hover:text-emerald-400 transition-colors">
                      Black Market
                   </h2>
                </div>

                <div className="relative z-10 hidden md:flex items-center gap-6 pr-10">
                   <div className="text-right">
                      <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Volume</div>
                      <div className="text-2xl font-black text-white">24h</div>
                   </div>
                   <div className="h-10 w-px bg-zinc-800" />
                   <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">
                      <MoveRight size={24} />
                   </div>
                </div>
             </Link>
          </SpotlightCard>

          {/* 5. WEATHER & LOGS QUICK LINK */}
          <SpotlightCard className="md:col-span-6 rounded-[2.5rem]">
             <Link href="/collections/weather" className="relative flex items-center p-8 h-full group">
                <CloudHail size={32} className="text-zinc-400 mr-6 group-hover:text-cyan-400 transition-colors" />
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">Weather Station</h3>
                   <p className="text-zinc-500 font-mono text-xs">Local atmospheric conditions</p>
                </div>
                <div className="ml-auto">
                   <ArrowRight className="text-zinc-600 group-hover:-rotate-45 transition-transform duration-300" />
                </div>
             </Link>
          </SpotlightCard>
          
          <SpotlightCard className="md:col-span-6 rounded-[2.5rem]">
             <button onClick={scrollToLogs} className="relative flex items-center p-8 h-full w-full text-left group">
                <Terminal size={32} className="text-zinc-400 mr-6 group-hover:text-[#DFFF00] transition-colors" />
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">Access Logs</h3>
                   <p className="text-zinc-500 font-mono text-xs">View system updates & notes</p>
                </div>
                <div className="ml-auto">
                   <ArrowRight className="text-zinc-600 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
             </button>
          </SpotlightCard>

        </div>
      </section>

      {/* --- LOGS SECTION --- */}
      <section id="system-logs" className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-6 pb-32">
        <SectionHeader title="System Terminal" icon={<Terminal size={16} />} />
        
        <div className="relative rounded-[3rem] bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
           {/* Terminal Bar */}
           <div className="h-12 bg-zinc-900/50 border-b border-white/5 flex items-center px-6 gap-2 backdrop-blur-md">
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                 <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="ml-4 flex items-center gap-2 opacity-30">
                 <Terminal size={12} />
                 <span className="text-[10px] font-mono">root/users/public/logs</span>
              </div>
           </div>
           
           <div className="p-4 md:p-12 bg-zinc-950">
              <PersonalLogs />
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-20 pt-20 pb-12 px-6 text-center border-t border-white/5 bg-zinc-950">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center gap-8">
            
            <div className="w-12 h-12 bg-[#DFFF00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(223,255,0,0.2)]">
                <span className="font-black text-xl text-black">Z</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-2 justify-center">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Secure Connection</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                    <Cpu size={14} className="text-blue-500" />
                    <span>Status: Optimal</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                    <Activity size={14} className="text-[#DFFF00]" />
                    <span>Version: 3.0.0</span>
                </div>
            </div>

            <div className="w-full max-w-xs h-px bg-zinc-900" />

            <Link 
              href="/clipflation"
              className="group relative px-4 py-2"
            >
              <p className="text-zinc-600 font-bold text-xs uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
                Zinc Engineering © 2026
              </p>
            </Link>
        </div>
      </footer>
    </main>
  );
}

// --- SUB-COMPONENTS ---
const SectionHeader = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
  <div className="flex items-center gap-4 mb-12 px-4">
      <div className="w-2 h-2 bg-[#DFFF00] rounded-full shadow-[0_0_10px_#DFFF00]" />
      <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      <div className="flex items-center gap-2 text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md shadow-lg">
           {icon}
           <span className="text-xs font-mono font-bold uppercase tracking-widest">{title}</span>
      </div>
  </div>
);