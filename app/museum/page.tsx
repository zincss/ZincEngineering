'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { 
  ArrowLeft, Sparkles, Palette, Construction, Database, 
  HelpCircle, Ghost, Gem, Infinity as InfinityIcon 
} from 'lucide-react';
import Link from 'next/link';

// --- DATA: The History of Zinc ---
const ARTIFACTS = [
  {
    id: 1,
    title: "INCEPTION",
    description: "The Genesis. A singular vision to unify diverse digital interests into a cohesive, space-themed singularity.",
    icon: <Sparkles size={40} className="text-cyan-400" />,
    color: "#22d3ee",
    z: -1000,
    x: 0,
    y: 0
  },
  {
    id: 2,
    title: "EARLY ALPHAS",
    description: "Aesthetic Exploration. Prioritizing form over function, the visual language was forged through experimental UI/UX paradigms.",
    icon: <Palette size={40} className="text-purple-400" />,
    color: "#c084fc",
    z: -4000,
    x: -25,
    y: -15
  },
  {
    id: 3,
    title: "BROKEN BUILDS",
    description: "The Fragmented Era. Rapid iteration led to unstable foundations, where ambitious designs often outpaced the underlying architecture.",
    icon: <Construction size={40} className="text-orange-500" />,
    color: "#f97316",
    z: -7000,
    x: 30,
    y: 20
  },
  {
    id: 4,
    title: "THE BETA STAGES",
    description: "Stabilization. The integration of robust database layers and cloud deployments marked the shift from concept to functional reality.",
    icon: <Database size={40} className="text-emerald-400" />,
    color: "#34d399",
    z: -10000,
    x: -20,
    y: 30
  },
  {
    id: 5,
    title: "WORKING?",
    description: "The Great Filter. A volatile state of development where every bug fix birthed two new errors. A delicate balance between progress and regression.",
    icon: <HelpCircle size={40} className="text-yellow-400" />,
    color: "#facc15",
    z: -13000,
    x: 0,
    y: -25
  },
  {
    id: 6,
    title: "DESPAIR",
    description: "The Void. The grueling reality of complex engineering. Seemingly endless cycles of debugging where momentum stalled and progress felt illusory.",
    icon: <Ghost size={40} className="text-blue-500" />,
    color: "#3b82f6",
    z: -16000,
    x: -35,
    y: 10
  },
  {
    id: 7,
    title: "GREED",
    description: "Feature Creep. The siren call of expansion. Neglecting core stability to chase the dopamine of new modules, spiraling into technical debt.",
    icon: <Gem size={40} className="text-amber-400" />,
    color: "#fbbf24",
    z: -19000,
    x: 35,
    y: -10
  },
  {
    id: 8,
    title: "PRESENT TENSE",
    description: "State: Current. Perpetual beta. The realization that the system is a living organism, forever expanding, never truly complete.",
    icon: <InfinityIcon size={40} className="text-white" />,
    color: "#ffffff",
    z: -22000,
    x: 0,
    y: 0
  },
];

// --- COMPONENT: COUNTER ---
const Counter = ({ value }: { value: MotionValue<number> }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    return value.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
  }, [value]);
  return <span ref={ref} />;
};

// --- COMPONENT: 3D CARD ---
function ArtifactCard({ data, currentZ }: { data: typeof ARTIFACTS[0], currentZ: MotionValue<number> }) {
  const zOffset = data.z;
  const z = useTransform(currentZ, (value) => value + zOffset);
  
  // Adjusted Opacity: Reaches 100% opacity much earlier (-4000) and stays bright until passed.
  const opacity = useTransform(z, [-10000, -4000, 500, 2000], [0, 1, 1, 0]);
  
  // Scale Effect: Grows as it approaches
  const scale = useTransform(z, [-12000, 500], [0.6, 1.3]);

  return (
    <motion.div
      style={{
        z,
        opacity,
        scale,
        x: `${data.x}%`,
        y: `${data.y}%`,
      }}
      className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none will-change-transform"
    >
      <motion.div 
        // Floating Animation
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
        className="relative w-[320px] md:w-[500px] bg-zinc-950 border border-white/20 p-10 rounded-[2rem] pointer-events-auto group overflow-hidden"
        style={{ 
           boxShadow: `0 0 80px -20px ${data.color}60` // Increased glow intensity
        }}
      >
        {/* --- CARD INTERNALS --- */}
        
        {/* 1. Subtle Scanline Animation */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-scanline opacity-20 pointer-events-none" />

        {/* 2. Glow blob behind icon */}
        <div 
           className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-[50px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"
           style={{ backgroundColor: data.color }}
        />

        <div className="relative z-10 flex flex-col items-center text-center gap-8">
           {/* Icon Container with Pulse */}
           <motion.div 
             animate={{ scale: [1, 1.1, 1] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             className="p-5 rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-lg backdrop-blur-sm"
           >
             {data.icon}
           </motion.div>
           
           <div>
             <h2 
               className="text-4xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-md"
             >
               {data.title}
             </h2>
             <p className="text-zinc-300 font-medium font-mono text-sm leading-relaxed tracking-wide">
               {data.description}
             </p>
           </div>

           <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest opacity-80 mt-2 bg-zinc-900/80 px-4 py-1.5 rounded-full border border-white/10">
              <span style={{ color: data.color }}>///</span>
              <span className="text-zinc-400">Log 0{data.id}</span>
              <span style={{ color: data.color }}>///</span>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- MAIN PAGE ---
export default function MuseumPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const rawZ = useTransform(scrollYProgress, [0, 1], [0, 28000]);
  const smoothZ = useSpring(rawZ, { damping: 40, stiffness: 90, mass: 1 });

  return (
    <div ref={containerRef} className="relative h-[1600vh] bg-black">
      
      <div className="fixed inset-0 z-0 overflow-hidden perspective-container">
        
        {/* --- UI LAYER --- */}
        <div className="absolute inset-0 z-50 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <Link 
               href="/" 
               className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/20 hover:bg-white hover:text-black text-zinc-300 transition-all text-xs font-mono uppercase tracking-widest shadow-xl group"
             >
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> System Root
             </Link>
             
             <div className="text-right">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                   The <span className="text-[#DFFF00]">Timeline</span>
                </h1>
                <p className="text-zinc-400 font-mono text-xs uppercase tracking-[0.3em] mt-2 font-bold">
                   Depth: <Counter value={smoothZ} />m
                </p>
             </div>
          </div>

          <div className="w-full flex justify-center pb-10">
             <motion.div 
               style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
               className="flex flex-col items-center gap-2"
             >
                <div className="w-px h-12 bg-gradient-to-b from-[#DFFF00] to-transparent animate-pulse" />
                <span className="text-[10px] font-mono text-[#DFFF00] uppercase tracking-widest animate-bounce font-bold">Initialize Scroll</span>
             </motion.div>
          </div>
        </div>

        {/* --- 3D WORLD LAYER --- */}
        <div className="relative w-full h-full flex items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
           
           <motion.div 
             className="relative w-full h-full [transform-style:preserve-3d]"
             style={{ translateZ: smoothZ }}
           >
              {/* STARFIELD TUNNEL */}
              <div className="absolute inset-0 [transform-style:preserve-3d]">
                 {Array.from({ length: 80 }).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
                      style={{
                         transform: `translate3d(${Math.random() * 4000 - 2000}px, ${Math.random() * 2000 - 1000}px, -${i * 500}px)`,
                         opacity: Math.random() * 0.7 + 0.3 // Increased star brightness
                      }}
                    />
                 ))}
              </div>

              {/* RENDER ARTIFACTS */}
              {ARTIFACTS.map((artifact) => (
                <ArtifactCard key={artifact.id} data={artifact} currentZ={smoothZ} />
              ))}

              {/* ENDING PORTAL */}
              <motion.div 
                className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center [transform-style:preserve-3d]"
                style={{ 
                   transform: `translateZ(-${29000}px)`,
                }}
              >
                  <div className="w-[600px] h-[600px] rounded-full bg-[#DFFF00] blur-[150px] opacity-20 animate-pulse" />
                  <div className="absolute text-center">
                     <h3 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-50 uppercase tracking-tighter">
                        To Be Continued
                     </h3>
                  </div>
              </motion.div>

           </motion.div>
        </div>

        {/* --- BACKGROUND --- */}
        <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none" />
        {/* Reduced vignette intensity to prevent dimming of later items */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-zinc-950/40 to-black pointer-events-none z-10" />

      </div>
      
      {/* Global Style for Scanline Animation */}
      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scanline {
          animation: scanline 3s linear infinite;
        }
      `}</style>
    </div>
  );
}