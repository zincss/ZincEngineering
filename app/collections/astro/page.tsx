'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { 
  motion, useMotionTemplate, useMotionValue, useAnimation, AnimatePresence 
} from 'framer-motion';
import { 
  ArrowRight, Globe, CloudRain, Star, Rocket, ChevronRight, Info,
  Zap, Shield, Cpu, Gauge, Navigation, Box, Activity, Terminal,
  Layers, HardDrive, Share2, Users, Coins, Pickaxe, Map as MapIcon,
  Tent, Ship, Target, Wind, Sun, Database, Gem, Hammer, Home
} from 'lucide-react';

// --- BRANDED LOGOS (EXTRACTED FROM SPACESHIP HUD) ---

const BrandedLogo = ({ manufacturer, scale = 1 }: { manufacturer: string, scale?: number }) => {
    const scaleStyle = { transform: `scale(${scale})`, transformOrigin: 'left' };
    
    if (manufacturer === "Zinc Aerospace") return (
        <div className="flex items-center gap-2 pointer-events-auto" style={scaleStyle}>
            <div className="w-8 h-8 border-2 border-[#DFFF00] rounded-lg flex items-center justify-center font-black text-white text-sm bg-[#DFFF00]/10 shadow-lg shadow-[#DFFF00]/10">Z</div>
            <div className="flex flex-col leading-none text-white font-bold uppercase text-[9px] tracking-widest"><span>Zinc</span><span className="text-[7px] text-[#DFFF00]">Aero</span></div>
        </div>
    );
    if (manufacturer === "Australian Dynamics") return (
        <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 p-1.5 pr-4 rounded-lg pointer-events-auto" style={scaleStyle}>
            <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center text-black font-black text-[10px]">AD</div>
            <span className="text-[10px] font-black text-white tracking-widest uppercase">Aussie_Dyn</span>
        </div>
    );
    if (manufacturer === "Ares-Miltech") return (
        <div className="flex items-center gap-2 pointer-events-auto bg-black/40 p-1.5 pr-6 border border-red-600/30 skew-x-[-12deg]" style={scaleStyle}>
            <div className="w-7 h-7 bg-red-600 flex items-center justify-center text-white"><Shield size={14} fill="currentColor" /></div>
            <span className="text-[10px] font-black italic text-white tracking-tighter uppercase">Ares_Mil</span>
        </div>
    );
    if (manufacturer === "Titan Industries") return (
        <div className="flex items-center gap-2 pointer-events-auto bg-zinc-900/90 p-1.5 pr-6 border-l-4 border-orange-600" style={scaleStyle}>
            <div className="w-8 h-8 bg-orange-600 flex items-center justify-center text-black font-black italic text-sm">T</div>
            <span className="text-sm font-black uppercase text-white tracking-tighter">TITAN</span>
        </div>
    );
    if (manufacturer === "inTAKE racing") return (
        <div className="flex items-baseline gap-1 pointer-events-auto bg-black/40 p-2 px-6 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl" style={scaleStyle}>
            <span className="text-xl font-black italic text-cyan-400">in</span><span className="text-xl font-black italic text-white">TAKE</span>
        </div>
    );
    if (manufacturer === "Orbital Mechanics") return (
        <div className="flex flex-col items-center pointer-events-auto bg-white/5 p-2 px-6 rounded-2xl border border-white/10 shadow-2xl" style={scaleStyle}>
            <div className="w-8 h-4 border-t border-x border-purple-400 rounded-t-full" />
            <span className="text-[8px] font-serif italic tracking-[0.4em] text-purple-200 mt-1 uppercase leading-none">Orbital</span>
        </div>
    );
    if (manufacturer === "Fishworx Staryard") return (
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/60 backdrop-blur-md p-1.5 pr-4 rounded-sm border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]" style={scaleStyle}>
            <div className="w-8 h-8 bg-yellow-500/20 flex items-center justify-center text-yellow-500 border border-yellow-500/50">
                <Hammer size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tight">FISHWORX</span>
                <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-[0.1em]">HEAVY IND.</span>
            </div>
        </div>
    );
    if (manufacturer === "Marse Movement") return (
        <div className="flex items-center gap-4 pointer-events-auto pl-4" style={scaleStyle}>
            <div className="relative">
                <Gem size={20} fill="currentColor" className="text-[#D4AF37]" />
                <div className="absolute inset-0 blur-md bg-[#D4AF37]/40" />
            </div>
            <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-xl font-serif text-white uppercase tracking-widest drop-shadow-md">Marse</span>
                <span className="text-[7px] font-sans font-light text-[#D4AF37] tracking-[0.4em] uppercase opacity-80 pl-0.5">Movement</span>
            </div>
        </div>
    );
    return null;
};

// --- ANIMATED ICONS ---

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

const FeatureItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
        <div className="p-2 h-fit rounded-lg bg-zinc-800 text-[#DFFF00]">
            <Icon size={18} />
        </div>
        <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-tight">{title}</h4>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const FactionCard = ({ name, origin, specialty, color, desc }: any) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all group min-h-[320px] flex flex-col"
    >
        <div className="mb-8">
            <BrandedLogo manufacturer={name} scale={0.9} />
        </div>
        <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-lg leading-none mb-1">{name}</h4>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">{origin}</p>
        </div>
        <p className="text-zinc-400 text-xs leading-relaxed my-6 font-mono flex-1">
            {desc}
        </p>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color }}>
            <Target size={12} /> {specialty}
        </div>
    </motion.div>
);

export default function AstroPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-32 relative overflow-x-hidden selection:bg-[#DFFF00] selection:text-black font-sans">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/80 to-zinc-950 z-20" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-20 mix-blend-overlay opacity-30" />
          <video 
            autoPlay loop muted playsInline
            className="w-full h-full object-cover opacity-40 grayscale contrast-125 scale-110"
          >
            <source src="/rocket.mp4" type="video/mp4" />
          </video>
      </div>

      {/* TOP TICKER */}
      <div className="relative z-30 w-full bg-[#DFFF00] py-1 overflow-hidden">
        <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="whitespace-nowrap flex gap-12"
        >
            {[...Array(10)].map((_, i) => (
                <span key={i} className="text-[10px] font-black uppercase tracking-[0.3em] text-black italic">
                    SYSTEM EXPANSION v3.1 // ASTRO MODULES ONLINE // ATMOSPHERIC SENSORS ACTIVE // ORBITAL MECHANICS ENGAGED //
                </span>
            ))}
        </motion.div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 pt-24 px-6 max-w-[1400px] mx-auto">
        
        {/* HERO SECTION */}
        <div className="flex flex-col items-center text-center mb-32">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 shadow-2xl"
            >
                <div className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse" />
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-zinc-300">New Content Available</span>
            </motion.div>
           
           <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-7xl md:text-[10rem] font-black text-white tracking-tighter mb-4 uppercase leading-none"
            >
              Astro <span className="text-transparent bg-clip-text bg-gradient-to-t from-zinc-700 to-zinc-200">Expansion</span>
           </motion.h1>
           
           <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-2xl mx-auto text-zinc-400 font-mono text-sm md:text-lg uppercase tracking-wider leading-relaxed"
           >
              A high-fidelity integration of stellar simulation and environmental analytics for the Zinc Engineering framework.
           </motion.p>

           <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex gap-4"
            >
                <button 
                  onClick={() => document.getElementById('planetarium-deep-dive')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-[#DFFF00] transition-colors"
                >
                  Explore Modules
                </button>
                <div className="px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md text-white font-black uppercase tracking-widest text-xs rounded-full cursor-default">v3.1 Specs</div>
            </motion.div>
        </div>

        {/* DLC MODULES PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-64">
           
           {/* PLANETARIUM DLC */}
           <motion.div
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
           >
             <SpotlightCard className="h-full rounded-[3rem] border-white/10 hover:border-[#DFFF00]/30 transition-all duration-500 shadow-2xl">
                <div className="flex flex-col h-full p-12 relative group">
                   <div className="flex justify-between items-start mb-12">
                      <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 text-[#DFFF00] group-hover:scale-110 group-hover:bg-[#DFFF00] group-hover:text-black transition-all duration-500 shadow-lg">
                         <AnimatedGlobe />
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="px-4 py-1.5 rounded-full bg-[#DFFF00] text-black text-[10px] font-black uppercase tracking-widest mb-2">
                           Module 01
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Interactive Simulation</span>
                      </div>
                   </div>
                   
                   <div className="relative z-10 mb-12">
                      <h2 className="text-5xl font-black uppercase text-white mb-6 tracking-tighter group-hover:text-[#DFFF00] transition-colors leading-none">
                         Planetarium<br/>Terminal
                      </h2>
                      <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-8 max-w-sm group-hover:text-zinc-300">
                         Real-time N-body orbital mechanics, lunar mining operations, and galactic trade routes. Experience the cosmos in high-fidelity.
                      </p>
                      
                      <Link href="/collections/planetarium" className="inline-flex items-center gap-4 px-8 py-4 bg-zinc-900 border border-white/10 text-white hover:bg-[#DFFF00] hover:text-black transition-all duration-300 rounded-2xl group/btn">
                         <span className="text-xs font-black uppercase tracking-widest">Initialise Launch</span>
                         <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                      </Link>
                   </div>

                   {/* Background Image/Video Effect */}
                   <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-30 transition-opacity duration-700 bg-[url('/textures/8k_earth_daymap.jpg')] bg-cover bg-center mix-blend-overlay grayscale" />
                </div>
             </SpotlightCard>
           </motion.div>

           {/* WEATHER DLC */}
           <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
           >
             <SpotlightCard className="h-full rounded-[3rem] border-white/10 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl" spotlightColor="rgba(6, 182, 212, 0.15)">
                <div className="flex flex-col h-full p-12 relative group">
                   <div className="flex justify-between items-start mb-12">
                      <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500 shadow-lg">
                         <AnimatedWeather />
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="px-4 py-1.5 rounded-full bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest mb-2">
                           Module 02
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Atmospheric Analytics</span>
                      </div>
                   </div>
                   
                   <div className="relative z-10 mb-12">
                      <h2 className="text-5xl font-black uppercase text-white mb-6 tracking-tighter group-hover:text-cyan-400 transition-colors leading-none">
                         Weather<br/>Intelligence
                      </h2>
                      <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-8 max-w-sm group-hover:text-zinc-300">
                         High-fidelity environmental monitoring. Global telemetry data fused with advanced Day/Night atmospheric analytics.
                      </p>
                      
                      <Link href="/collections/weather" className="inline-flex items-center gap-4 px-8 py-4 bg-zinc-900 border border-white/10 text-white hover:bg-cyan-500 hover:text-black transition-all duration-300 rounded-2xl group/btn">
                         <span className="text-xs font-black uppercase tracking-widest">Connect Terminal</span>
                         <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                      </Link>
                   </div>
                   
                   <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-30 transition-opacity duration-700 bg-cyan-900/40 mix-blend-overlay" />
                </div>
             </SpotlightCard>
           </motion.div>

        </div>

        {/* PLANETARIUM DEEP DIVE */}
        <div id="planetarium-deep-dive" className="max-w-6xl mx-auto mb-64 scroll-mt-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center gap-3 text-[#DFFF00] font-mono text-xs font-black uppercase tracking-[0.3em] mb-6">
                        <Globe size={16} /> <span>Open Exploration</span>
                    </div>
                    <h3 className="text-6xl font-black uppercase tracking-tighter leading-none mb-8">
                        The Universe, <span className="text-zinc-700">Unrestricted.</span>
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-10">
                        Guests are free to roam an immersive 3D solar system. Track real-time orbital paths, witness the rotation of gas giants, and explore the surface of remote moons with precision-engineered textures and lighting.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <MapIcon className="text-[#DFFF00] mb-4" />
                            <h5 className="text-white font-bold uppercase text-xs mb-2">Solar Browser</h5>
                            <p className="text-zinc-500 text-[10px] leading-relaxed">Search and target any celestial body in the known system instantly.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <Box className="text-[#DFFF00] mb-4" />
                            <h5 className="text-white font-bold uppercase text-xs mb-2">Cinematic Tours</h5>
                            <p className="text-zinc-500 text-[10px] leading-relaxed">Engage autopilot for guided visual tours across the major planetary hubs.</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#DFFF00]/20 to-transparent mix-blend-overlay z-10" />
                    <img src="/textures/8k_jupiter.jpg" className="w-full h-full object-cover scale-150 grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Jupiter" />
                    <div className="absolute bottom-10 left-10 z-20">
                        <div className="p-4 backdrop-blur-xl bg-black/50 border border-white/10 rounded-2xl">
                            <p className="text-[10px] font-mono text-[#DFFF00] uppercase tracking-widest mb-1">Target Identified</p>
                            <p className="text-xl font-black text-white uppercase italic">Jupiter System</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* REGISTERED USER FEATURES */}
            <div className="bg-zinc-900/50 rounded-[4rem] border border-white/5 p-12 md:p-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Users size={200} className="text-white" />
                </div>
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20 text-[#DFFF00] text-[10px] font-black uppercase tracking-widest mb-8">
                            <Shield size={12} /> Registered Pilot Access
                        </div>
                        <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
                            A Living <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DFFF00] to-white">Economy</span>
                        </h3>
                        <p className="text-zinc-400 font-mono text-sm md:text-lg leading-relaxed mb-12 max-w-2xl">
                            Unlock the full potential of the Planetarium. Registered users can pilot advanced vessels, mine rare ores from asteroid belts, and complete high-stakes contracts across the system.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 justify-center">
                        <FeatureItem icon={Coins} title="Working Economy" desc="Earn Zinc Credits through mining and contract fulfillment to upgrade your fleet." />
                        <FeatureItem icon={Pickaxe} title="Resource Extraction" desc="Identify high-yield asteroid fields and moons to harvest valuable minerals." />
                        <FeatureItem icon={Ship} title="Fleet Management" desc="Purchase and customize vessels from the system's leading manufacturers." />
                    </div>
                </div>
            </div>
        </div>

        {/* FACTIONS SECTION */}
        <div className="max-w-6xl mx-auto mb-64">
            <div className="text-center mb-20">
                <h3 className="text-5xl font-black uppercase tracking-tighter mb-4">Manufacturers of the Void</h3>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">The industrial powers shaping the solar system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FactionCard 
                    name="Zinc Aerospace"
                    origin="Earth Orbital"
                    specialty="Balanced / Exploration"
                    color="#DFFF00"
                    desc="The system standard. Reliable, agile, and accessible. Zinc vessels are the backbone of exploratory fleets."
                />
                <FactionCard 
                    name="Ares-Miltech"
                    origin="Mars Colony"
                    specialty="Combat / Interception"
                    color="#ef4444"
                    desc="Built for aggression. Ares ships prioritize speed and firepower over luxury or long-range endurance."
                />
                <FactionCard 
                    name="Titan Industries"
                    origin="Jovian Rings"
                    specialty="Industrial / Mining"
                    color="#f59e0b"
                    desc="Heavy-duty industrial giants. Titan hulls are designed to survive the crushing gravity of gas giants."
                />
                <FactionCard 
                    name="inTAKE racing"
                    origin="Neptune Outpost"
                    specialty="High-Performance"
                    color="#06b6d4"
                    desc="Experimental tech pushed to the limit. If it's not fast enough to tear itself apart, it's not an inTAKE."
                />
                <FactionCard 
                    name="Australian Dynamics"
                    origin="Frontier Void"
                    specialty="Rugged / Legacy"
                    color="#92400e"
                    desc="Indestructible machines from the outer rim. Built to last through centuries of solar radiation."
                />
                <FactionCard 
                    name="Orbital Mechanics"
                    origin="Black Hole Relay"
                    specialty="Prestige / Luxury"
                    color="#d8b4fe"
                    desc="Unparalleled elegance. For those who believe space travel should be as comfortable as a royal palace."
                />
                <FactionCard 
                    name="Fishworx Staryard"
                    origin="The Staryard"
                    specialty="Utility / Military"
                    color="#EAB308"
                    desc="Versatile military-grade contractors. Specialists in heavy utility and tactical support vessels."
                />
                <FactionCard 
                    name="Marse Movement"
                    origin="Elite Hub"
                    specialty="High-Fashion"
                    color="#D4AF37"
                    desc="The peak of aesthetic engineering. Marse vessels are statement pieces for the system's elite."
                />
            </div>
        </div>

        {/* WEATHER SECTION */}
        <div className="max-w-6xl mx-auto mb-64">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Visual Side: Mobile Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="order-2 lg:order-1 flex justify-center lg:justify-start"
                >
                    <div className="relative w-full max-w-[320px] aspect-[9/19] bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden group">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-30" />
                        
                        {/* Content */}
                        <div className="absolute inset-0 bg-zinc-950 p-6 pt-12 flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <Home size={8} className="text-[#DFFF00]" />
                                        <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Home Sector</span>
                                    </div>
                                    <span className="text-xl font-black text-white uppercase">London</span>
                                </div>
                                <CloudRain className="text-cyan-400" size={24} />
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="text-7xl font-black text-white mb-2 leading-none">14°</div>
                                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Scattered Showers</div>
                            </div>

                            {/* Atmospheric Report Mock Block */}
                            <div className="mt-auto mb-4 space-y-2">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[7px] font-black text-[#DFFF00] uppercase">Day Cycle</span>
                                        <span className="text-[7px] font-mono text-zinc-500">Peak: 18°</span>
                                    </div>
                                    <p className="text-[9px] text-zinc-400 font-mono leading-tight">
                                        Solar activity within standard parameters. Optimal for exploration.
                                    </p>
                                </div>
                                <div className="p-3 bg-black/40 border border-white/10 rounded-2xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[7px] font-black text-blue-400 uppercase">Night Cycle</span>
                                        <span className="text-[7px] font-mono text-zinc-500">Low: 8°</span>
                                    </div>
                                    <p className="text-[9px] text-zinc-400 font-mono leading-tight">
                                        Nocturnal cooling expected. Thermal layering recommended.
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Wind size={12} className="text-zinc-500 mb-1" />
                                    <div className="text-xs font-bold text-white">12<span className="text-[8px] text-zinc-600 ml-1">km/h</span></div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Gauge size={12} className="text-zinc-500 mb-1" />
                                    <div className="text-xs font-bold text-white">2.4<span className="text-[8px] text-zinc-600 ml-1">UV</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Gloss Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Background Decorative Element */}
                    <div className="absolute -z-10 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full translate-y-20" />
                </motion.div>

                {/* Text Side */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="order-1 lg:order-2"
                >
                    <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs font-black uppercase tracking-[0.3em] mb-6">
                        <Wind size={16} /> <span>Native Experience</span>
                    </div>
                    <h3 className="text-6xl font-black uppercase tracking-tighter leading-none mb-8">
                        Optimized for <span className="text-zinc-700">Exploration.</span>
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-10">
                        The Weather Station is natively optimized for mobile devices, providing a seamless terminal experience on the go. Access detailed Day/Night atmospheric reports, track global storm fronts, and receive real-time telemetry with a UI built for speed and precision.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h5 className="text-white font-bold uppercase text-xs">Atmospheric Reports</h5>
                                    <p className="text-zinc-500 text-[10px] mt-0.5 uppercase tracking-widest">Comprehensive Day/Night Analytics</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-zinc-700 group-hover:text-cyan-400 transition-colors" />
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h5 className="text-white font-bold uppercase text-xs">Global Cartography</h5>
                                    <p className="text-zinc-500 text-[10px] mt-0.5 uppercase tracking-widest">Interactive Map Engine</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-zinc-700 group-hover:text-cyan-400 transition-colors" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* TECHNICAL FEATURES SUMMARY */}
        <div className="max-w-6xl mx-auto mb-40">
            <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-8">
                <div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter">Core Integration</h3>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">v3.1 Architecture Overview</p>
                </div>
                <div className="hidden md:block">
                    <Layers className="text-zinc-800" size={48} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureItem 
                    icon={Cpu} 
                    title="N-Body Integration" 
                    desc="Proprietary orbital mechanics engine handling complex gravitational interactions between solar bodies." 
                />
                <FeatureItem 
                    icon={Shield} 
                    title="Cycle Analytics" 
                    desc="Advanced predictive modeling for day and night cycles, including precise sunrise/sunset and thermal variation tracking." 
                />
                <FeatureItem 
                    icon={HardDrive} 
                    title="Persistence Layer" 
                    desc="Integrated saving systems for ship position, mining resources, and local sector weather history." 
                />
            </div>
        </div>

        {/* FOOTER / ROADMAP */}
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="mt-32 text-center border-t border-white/5 pt-20"
        >
           <div className="inline-flex items-center gap-4 px-8 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-12">
              <Info size={16} className="text-[#DFFF00]" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Next Expansion: Deep Sea Monitoring (v3.2)</span>
           </div>
           
           <div className="flex justify-center gap-12 text-zinc-600 font-mono text-[10px] uppercase tracking-[0.3em]">
                <span>Status: Fully Operational</span>
                <span>Location: Zinc Engineering Hub</span>
                <span>Date: Jan 2026</span>
           </div>
        </motion.div>

      </div>
    </main>
  );
}
