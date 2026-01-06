'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { 
  motion, useMotionTemplate, useMotionValue, useAnimation, AnimatePresence 
} from 'framer-motion';
import { 
  ArrowRight, Globe, CloudRain, Star, Rocket, ChevronRight, Info
} from 'lucide-react';

// --- ANIMATED ICONS (Recreated for Astro Page) ---

const AnimatedGlobe = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      onMouseEnter={() => controls.start("hover")}
      onMouseLeave={() => controls.start("normal")}
    >
      <motion.circle cx="12" cy="12" r="10" />
      <motion.path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" 
        variants={{ hover: { rotate: 180 }, normal: { rotate: 0 } }}
        transition={{ duration: 1, ease: "easeInOut" }}
        animate={controls}
      />
      <motion.path d="M2 12h20" 
         variants={{ hover: { scaleX: 1.1 }, normal: { scaleX: 1 } }}
         animate={controls}
      />
    </motion.svg>
  );
};

const AnimatedWeather = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      onMouseEnter={() => controls.start("hover")}
      onMouseLeave={() => controls.start("normal")}
    >
      <motion.path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" 
         variants={{ hover: { x: [0, 1, -1, 0], transition: { repeat: Infinity, duration: 2 } } }}
         animate={controls}
      />
      <motion.path d="M16 14v6" 
         variants={{ hover: { y: [0, 5], opacity: [0, 1, 0], transition: { repeat: Infinity, duration: 0.8 } } }}
         animate={controls}
      />
      <motion.path d="M8 14v6" 
         variants={{ hover: { y: [0, 5], opacity: [0, 1, 0], transition: { repeat: Infinity, duration: 0.8, delay: 0.2 } } }}
         animate={controls}
      />
      <motion.path d="M12 16v6" 
         variants={{ hover: { y: [0, 5], opacity: [0, 1, 0], transition: { repeat: Infinity, duration: 0.8, delay: 0.4 } } }}
         animate={controls}
      />
    </motion.svg>
  );
};

// --- SPOTLIGHT CARD COMPONENT ---
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
      className={`group relative border border-white/10 bg-zinc-900/50 overflow-hidden ${className}`}
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

export default function AstroPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 relative overflow-x-hidden selection:bg-[#DFFF00] selection:text-black">
      
      {/* BACKGROUND VIDEO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-zinc-950/70 z-20" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-20 mix-blend-overlay opacity-20" />
          <video 
            autoPlay loop muted playsInline
            className="w-full h-full object-cover opacity-60"
          >
            <source src="/rocket.mp4" type="video/mp4" />
          </video>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 pt-32 px-6 max-w-[1400px] mx-auto">
        
        {/* HERO SECTION */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="text-center mb-24"
        >
           <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <Star size={12} className="text-[#DFFF00]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300">Official DLC Update 3.1</span>
           </div>
           
           <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 uppercase">
              Astro <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-600">Expansion</span>
           </h1>
           
           <p className="max-w-2xl mx-auto text-zinc-400 font-mono text-sm md:text-base leading-relaxed">
              The boundaries of the Zinc Ecosystem have expanded. Experience high-fidelity solar system simulation and local atmospheric monitoring with our latest modules.
           </p>
        </motion.div>

        {/* MODULES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
           
           {/* PLANETARIUM CARD */}
           <motion.div
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2, duration: 0.8 }}
           >
             <SpotlightCard className="h-[400px] rounded-[2.5rem] border-white/10 hover:border-white/20 transition-colors">
                <Link href="/collections/planetarium" className="flex flex-col h-full p-10 group">
                   <div className="flex justify-between items-start mb-auto">
                      <div className="p-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md text-[#DFFF00] group-hover:scale-110 transition-transform duration-300">
                         <AnimatedGlobe />
                      </div>
                      <div className="px-3 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20 text-[#DFFF00] text-[10px] font-bold uppercase tracking-wider">
                         Featured
                      </div>
                   </div>
                   
                   <div className="relative z-10">
                      <h2 className="text-4xl font-black uppercase text-white mb-3 tracking-tighter group-hover:text-[#DFFF00] transition-colors">
                         Planetarium
                      </h2>
                      <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-6 group-hover:text-zinc-300">
                         Interactive solar system simulation. Explore planets, moons, and stations with real-time orbital mechanics.
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                         <span>Launch Module</span>
                         <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                   </div>

                   {/* Background Image/Video Effect */}
                   <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-[url('/textures/8k_earth_daymap.jpg')] bg-cover bg-center mix-blend-overlay" />
                </Link>
             </SpotlightCard>
           </motion.div>

           {/* WEATHER CARD */}
           <motion.div
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4, duration: 0.8 }}
           >
             <SpotlightCard className="h-[400px] rounded-[2.5rem] border-white/10 hover:border-white/20 transition-colors" spotlightColor="rgba(6, 182, 212, 0.15)">
                <Link href="/collections/weather" className="flex flex-col h-full p-10 group">
                   <div className="flex justify-between items-start mb-auto">
                      <div className="p-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                         <AnimatedWeather />
                      </div>
                   </div>
                   
                   <div className="relative z-10">
                      <h2 className="text-4xl font-black uppercase text-white mb-3 tracking-tighter group-hover:text-cyan-400 transition-colors">
                         Weather Station
                      </h2>
                      <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-6 group-hover:text-zinc-300">
                         Advanced atmospheric monitoring system. Track real-time weather patterns and local conditions.
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                         <span>View Terminal</span>
                         <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                   </div>
                   
                   <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-cyan-900/20 mix-blend-overlay" />
                </Link>
             </SpotlightCard>
           </motion.div>

        </div>

        {/* FOOTER INFO */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.8, duration: 0.8 }}
           className="mt-24 text-center pb-12"
        >
           <div className="inline-flex items-center gap-2 text-zinc-500 text-[10px] font-mono uppercase tracking-widest bg-black/20 px-6 py-3 rounded-full border border-white/5">
              <Info size={12} />
              <span>More modules coming in v3.2</span>
           </div>
        </motion.div>

      </div>
    </main>
  );
}