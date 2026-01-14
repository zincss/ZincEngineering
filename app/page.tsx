'use client';

import React, { useState, useEffect, MouseEvent, useCallback, useRef } from 'react';
import GlobalTicker from './components/GlobalTicker';
import PersonalLogs from './components/PersonalLogs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  motion, AnimatePresence, useScroll, useTransform, useSpring,
  useMotionTemplate, useMotionValue, useAnimation, Variants 
} from 'framer-motion';
import { 
  ArrowRight, Activity, ShieldCheck, Cpu, Radio, Edit2, Scan,
  Info, X, MoveRight, Rocket, Globe, Eye, Star, Terminal, CloudRain, LayoutGrid, Trophy, Gamepad2, FolderOpen, TrendingUp, Layers, RefreshCw, Check
} from 'lucide-react';
import { COMPANIES } from './play/stocks/data';
import { getCurrentPrice } from './play/stocks/utils';
import { getPublicSystemMessage } from '@/app/system-actions';
import { useAuth } from '@/app/context/AuthContext';
import { updateSystemMessage } from '@/app/admin/actions';

// --- CUSTOM ANIMATED ICONS ---

const AnimatedTrophy = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      onMouseEnter={() => controls.start("hover")}
      onMouseLeave={() => controls.start("normal")}
    >
      <motion.path 
        d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" 
        variants={{ hover: { rotate: -10 }, normal: { rotate: 0 } }} 
        animate={controls}
      />
      <motion.path 
        d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" 
        variants={{ hover: { rotate: 10 }, normal: { rotate: 0 } }} 
        animate={controls}
      />
      <motion.path d="M4 22h16" />
      <motion.path d="M10 14.66V22" />
      <motion.path d="M14 14.66V22" />
      <motion.path 
        d="M18 2H6v7c0 3.31 2.69 6 6 6s6-2.69 6-6V2Z" 
        variants={{ hover: { y: -1 }, normal: { y: 0 } }}
        animate={controls}
      />
    </motion.svg>
  );
};

const AnimatedGlobe = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
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

const AnimatedGamepad = () => {
  const controls = useAnimation();
  return (
    <div onMouseEnter={() => controls.start("hover")} onMouseLeave={() => controls.start("normal")}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <line x1="6" x2="10" y1="12" y2="12" />
        <line x1="8" x2="8" y1="10" y2="14" />
        <line x1="15" x2="15.01" y1="13" y2="13" />
        <line x1="18" x2="18.01" y1="11" y2="11" />
        <motion.rect 
          x="2" y="6" width="20" height="12" rx="2"
          variants={{ 
            hover: { rotate: [0, -2, 2, -2, 2, 0], transition: { duration: 0.4 } }, 
            normal: { rotate: 0 } 
          }}
          animate={controls}
        />
      </motion.svg>
    </div>
  );
};

const AnimatedLayers = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      onMouseEnter={() => controls.start("hover")}
      onMouseLeave={() => controls.start("normal")}
    >
      <motion.path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" 
        variants={{ hover: { y: -2 }, normal: { y: 0 } }} animate={controls}
      />
      <motion.path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" 
        variants={{ hover: { y: 2 }, normal: { y: 0 } }} animate={controls}
      />
      <motion.path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" 
        variants={{ hover: { y: 0 }, normal: { y: 0 } }} animate={controls}
      />
    </motion.svg>
  );
};

const AnimatedTrend = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      onMouseEnter={() => controls.start("hover")}
      onMouseLeave={() => controls.start("normal")}
    >
      <motion.polyline points="23 6 13.5 15.5 8.5 10.5 1 18" 
        initial={{ pathLength: 1 }}
        variants={{ 
          hover: { pathLength: [0, 1], transition: { duration: 0.6, ease: "easeInOut" } },
          normal: { pathLength: 1 }
        }}
        animate={controls}
      />
      <motion.polyline points="17 6 23 6 23 12" 
        variants={{ 
          hover: { x: 2, y: -2, transition: { repeat: Infinity, repeatType: "reverse" } },
          normal: { x: 0, y: 0 }
        }}
        animate={controls}
      />
    </motion.svg>
  );
};

const AnimatedWeather = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
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

const AnimatedMatchCenter = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      onMouseEnter={() => controls.start("hover")}
      onMouseLeave={() => controls.start("normal")}
    >
      <motion.path d="M12 2v20" variants={{ hover: { opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 1 } } }} animate={controls} />
      <motion.path d="M2 12h20" variants={{ hover: { opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 1, delay: 0.5 } } }} animate={controls} />
      <motion.circle cx="12" cy="12" r="10" variants={{ hover: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } } }} animate={controls} />
      <motion.circle cx="12" cy="12" r="2" fill="currentColor" variants={{ hover: { scale: [1, 1.5, 1], transition: { repeat: Infinity, duration: 1 } } }} animate={controls} />
    </motion.svg>
  );
};

const AnimatedTerminal = () => {
  const controls = useAnimation();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      onMouseEnter={() => controls.start("hover")}
      onMouseLeave={() => controls.start("normal")}
    >
      <polyline points="4 17 10 11 4 5" />
      <motion.line x1="12" x2="20" y1="19" y2="19" 
        variants={{ 
          hover: { opacity: [1, 0, 1], transition: { duration: 0.8, repeat: Infinity } },
          normal: { opacity: 1 }
        }}
        animate={controls}
      />
    </motion.svg>
  );
};

// --- UTILITY: MOUSE-FOLLOW SPOTLIGHT ---
function SpotlightCard({ 
  children, 
  className = "", 
  spotlightColor = "rgba(223, 255, 0, 0.1)" 
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
      className={`group relative border border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/20 ${className}`}
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
      
      {/* HUD CORNER ACCENTS */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-[#DFFF00]/50 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-[#DFFF00]/50 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-[#DFFF00]/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-[#DFFF00]/50 transition-colors" />

      <div className="relative h-full z-20">{children}</div>
    </div>
  );
}

// --- COMPONENT: DLC INFO OVERLAY ---
const dlcSteps = [
  {
    id: 'dlc_init',
    title: "ASTRO DLC UPDATE",
    subtitle: "Stellar Cartography Expansion",
    description: "A major system update introducing a high-fidelity Planetarium. Explore the Origin System with real-time orbital mechanics, surface details, and astronomical data.",
    icon: <Globe size={48} className="text-[#DFFF00]" />,
  },
  {
    id: 'guest_access',
    title: "PUBLIC ACCESS",
    subtitle: "Scenic Exploration",
    description: "Guests are welcome to freely navigate the cosmos. Experience curated cinematic journeys, view orbital paths, and access our detailed celestial database without an account.",
    icon: <Eye size={48} className="text-cyan-400" />,
  },
  {
    id: 'user_access',
    title: "PILOT LICENSE",
    subtitle: "Authorized Personnel Only",
    description: "Registered users gain access to the Flight Deck. Captain your own starship, accept hauling contracts, manage fuel resources, and earn credits in a living economy.",
    icon: <Rocket size={48} className="text-orange-500" />,
  },
  {
    id: 'launch',
    title: "PREPARE FOR LAUNCH",
    subtitle: "Destination: Solar System",
    description: "The stars are waiting. Whether you are here to observe or to conquer the trade routes, your journey begins now.",
    icon: <Star size={48} className="text-purple-400" />,
  }
];

const CreatorLetterModal = ({ sysMsg, isAdmin, onClose, onRefresh }: { sysMsg: { message: string }, isAdmin: boolean, onClose: () => void, onRefresh: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditingMessage] = useState(sysMsg.message);
  const [isSaving, setIsSaving] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: scrollRef
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate reading time
  const wordCount = sysMsg.message.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Sync edit buffer with incoming message
  useEffect(() => {
    setEditingMessage(sysMsg.message);
  }, [sysMsg.message]);

  const handleSave = async () => {
    if (!editedMessage.trim()) return;
    setIsSaving(true);
    const res = await updateSystemMessage(editedMessage, ''); 
    if (res.success) {
        setIsEditing(false);
        onRefresh();
    } else {
        alert("Failed to save: " + res.error);
    }
    setIsSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-12"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.98, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 10, opacity: 0 }}
        className="relative w-full max-w-4xl bg-white text-zinc-900 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col rounded-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        {/* SCROLL PROGRESS BAR */}
        {!isEditing && (
            <motion.div 
                className="absolute top-0 left-0 right-0 h-1 bg-[#DFFF00] origin-left z-50 shadow-[0_0_15px_rgba(223,255,0,0.5)]"
                style={{ scaleX }}
            />
        )}

        {/* PREMIUM PAPER TEXTURE */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-10 right-10 text-zinc-300 hover:text-zinc-900 transition-colors z-20 p-2">
            <X size={28} />
        </button>

        <div ref={scrollRef} className="overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
            <div className="p-10 md:p-24 flex flex-col relative z-10">
                
                {/* ADMIN CONTROLS */}
                {isAdmin && (
                    <div className="flex gap-3 mb-16">
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all border border-zinc-200"
                        >
                            {isEditing ? <X size={14} /> : <Edit2 size={14} />}
                            {isEditing ? 'Discard' : 'Edit Content'}
                        </button>
                        {isEditing && (
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-lg"
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                                Save Letter
                            </button>
                        )}
                    </div>
                )}

                {/* STATIONERY HEADER */}
                <div className="mb-20">
                    <div className="w-14 h-14 bg-[#DFFF00] flex items-center justify-center rounded-2xl mb-12 shadow-[0_10px_30px_rgba(223,255,0,0.3)]">
                        <span className="text-black font-black text-3xl">Z</span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Published</span>
                                <p className="text-xl font-serif italic text-zinc-900">
                                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="h-px w-24 bg-zinc-200" />
                        </div>

                        {!isEditing && (
                            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-md border border-zinc-100">
                                <Scan size={10} className="text-[#DFFF00]" />
                                {readTime} min read
                            </div>
                        )}
                    </div>
                </div>

                {/* MESSAGE AREA */}
                <div className="flex-1">
                    {isEditing ? (
                        <textarea 
                            value={editedMessage}
                            onChange={(e) => setEditingMessage(e.target.value)}
                            className="w-full h-[400px] p-10 bg-zinc-50 border-2 border-zinc-100 rounded-2xl font-serif text-xl focus:outline-none focus:border-zinc-900 transition-colors resize-none leading-relaxed shadow-inner"
                            placeholder="Write something personal to the community..."
                        />
                    ) : (
                        <article className="font-serif text-xl md:text-2xl text-zinc-800 leading-[1.8] max-w-3xl">
                            <span className="text-7xl font-black mr-4 float-left leading-[0.7] text-zinc-900 uppercase">
                                {sysMsg.message.charAt(0)}
                            </span>
                            <p className="whitespace-pre-wrap">
                                {sysMsg.message.slice(1)}
                            </p>
                        </article>
                    )}
                </div>

                {/* SIGNATURE AREA */}
                {!isEditing && (
                    <div className="mt-32">
                        <div className="flex flex-col gap-8">
                            <div className="space-y-2">
                                <p className="text-sm font-serif italic text-zinc-500">Sincerely,</p>
                                <div className="font-serif italic text-5xl text-zinc-900 tracking-tighter">Zac</div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-12 border-t border-zinc-100">
                                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">Zinc Engineering // Core Lead</p>
                                <button 
                                    onClick={onClose}
                                    className="px-12 py-5 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-2xl"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* BOTTOM ACCENT / SCROLL HINT */}
        <div className="h-1.5 w-full bg-zinc-900 shrink-0 relative overflow-hidden">
            {!isEditing && (
                <motion.div 
                    style={{ opacity: useTransform(scrollYProgress, [0, 0.9], [1, 0]) }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="flex items-center gap-2">
                        <motion.div 
                            animate={{ y: [0, 2, 0] }} 
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <ArrowRight size={8} className="text-white/20 rotate-90" />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const words = ["ENGINEERING", "TELEMETRY", "EXCHANGE", "FRONTIER", "STRATEGY", "LIFESTYLE", "ARCHIVE", "ANALYTICS", "ECOSYSTEMS"];
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [tickerData, setTickerData] = useState<any[]>([]);
  
  const { isAdmin } = useAuth();

  // System Broadcast Message
  const [sysMsg, setSysMsg] = useState({ message: 'SYSTEM UPDATES // ONLINE', link: '/collections/astro' });

  const refreshMessage = useCallback(() => {
    getPublicSystemMessage().then(res => {
        if (res && res.message) {
            setSysMsg({ message: res.message, link: res.link || '/collections/astro' });
        }
    });
  }, []);

  // Parallax Logic
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const videoY = useTransform(scrollY, [0, 1000], [0, -150]);

  useEffect(() => {
    refreshMessage();
  }, [refreshMessage]);

  useEffect(() => {
    // Generate ticker data on client-side mount
    const data = COMPANIES.slice(0, 20).map(c => {
        const price = getCurrentPrice(c.ticker);
        const change = ((price - c.basePrice) / c.basePrice) * 100;
        return {
            s: c.ticker,
            p: price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
            c: (change >= 0 ? '+' : '') + change.toFixed(1) + '%'
        };
    });
    setTickerData(data);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  const scrollToLogs = () => document.getElementById('system-logs')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-32 relative overflow-x-hidden font-sans">
      
      {/* GLOBAL GRAIN OVERLAY */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none z-[60]" />

      <AnimatePresence>
        {showBroadcast && <CreatorLetterModal sysMsg={sysMsg} isAdmin={isAdmin} onClose={() => setShowBroadcast(false)} onRefresh={refreshMessage} />}
      </AnimatePresence>

      {/* --- CINEMATIC BACKGROUND VIDEO --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <motion.div 
            animate={{ opacity: cinematicMode ? 0 : 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 bg-zinc-950/80 z-20" 
          />
          
          <motion.div style={{ y: videoY }} className="absolute inset-0 z-10 h-[120%]">
            <motion.video 
              initial={{ opacity: 0.5, filter: 'grayscale(100%)', mixBlendMode: 'overlay' }}
              animate={{ 
                opacity: cinematicMode ? 1 : 0.5, 
                filter: cinematicMode 
                  ? 'grayscale(0%) contrast(125%) saturate(130%) brightness(110%)' 
                  : 'grayscale(100%) contrast(100%) saturate(100%) brightness(100%)',
                mixBlendMode: cinematicMode ? 'normal' : 'overlay'
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
              autoPlay loop muted playsInline
              poster="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop"
              className="w-full h-full object-cover"
            >
              <source src="/rocket.mp4" type="video/mp4" />
            </motion.video>
          </motion.div>
      </div>

      {/* --- CINEMATIC CLICK-TO-RESTORE LAYER --- */}
      {cinematicMode && (
        <div 
            onClick={() => setCinematicMode(false)}
            className="fixed inset-0 z-[100] cursor-pointer flex items-end justify-center pb-12 group"
        >
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 2 }}
                className="bg-black/40 text-white/70 px-8 py-3 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 group-hover:bg-black/60 group-hover:text-white transition-all shadow-2xl"
            >
                UPLINK STANDBY // CLICK TO RESTORE
            </motion.div>
        </div>
      )}

      {/* --- MAIN INTERFACE WRAPPER --- */}
      <motion.div
        animate={{ opacity: cinematicMode ? 0 : 1, pointerEvents: cinematicMode ? 'none' : 'auto' }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="relative z-10"
      >
          {/* --- HERO SECTION --- */}
          <motion.section 
            style={{ opacity: heroOpacity, y: heroY }}
            className="min-h-[95vh] flex flex-col items-center justify-center py-20 px-6"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none" />

            <div className="relative w-full max-w-[1400px] mx-auto flex flex-col items-center text-center">
              
              {/* Hero Quick Links */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
                className="mb-12 flex items-center gap-8"
              >
                <Link href="/collections/weather" className="group flex items-center gap-3 hover:opacity-70 transition-opacity">
                  <CloudRain size={14} className="text-[#DFFF00]" />
                  <span className="text-[10px] font-black text-[#DFFF00] tracking-[0.4em] uppercase italic">Weather</span>
                </Link>
                <div className="h-3 w-px bg-zinc-800" />
                <Link href="/sports/match-center" className="group flex items-center gap-3 hover:opacity-70 transition-opacity">
                  <Activity size={14} className="text-[#DFFF00]" />
                  <span className="text-[10px] font-black text-[#DFFF00] tracking-[0.4em] uppercase italic">Match Center</span>
                </Link>
              </motion.div>

              {/* Typography & Branding */}
              <div className="flex flex-col items-center gap-10 select-none w-full max-w-5xl">
                 
                 <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 relative">
                     
                     {/* Emblem */}
                     <div 
                       onClick={() => setCinematicMode(true)}
                       className="relative group cursor-pointer shrink-0"
                     >
                        <div className="absolute -inset-12 bg-[#DFFF00] rounded-[2.5rem] blur-[80px] opacity-5 group-hover:opacity-20 transition-opacity duration-700" />
                        <div className="relative bg-[#DFFF00] w-28 h-28 md:w-36 md:h-36 flex items-center justify-center rounded-[2rem] shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-500">
                            <span className="font-black text-[80px] md:text-[110px] text-black leading-none z-10">Z</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-black/5 opacity-50" />
                        </div>
                     </div>

                     {/* Main Text */}
                     <div className="relative select-none">
                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-[0.1em] drop-shadow-2xl leading-[0.8] text-center md:text-left uppercase italic">
                           ZINC
                        </h1>
                        
                        <div className="absolute top-[85%] left-0 right-0 md:left-1 flex items-center justify-center md:justify-start h-12 md:h-20 lg:h-24 overflow-visible">
                           <AnimatePresence mode="wait">
                             <motion.div 
                               key={words[wordIndex]}
                               initial={{ x: 40, opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
                               animate={{ x: 0, opacity: 1, filter: 'blur(0px)', scale: 1 }}
                               exit={{ x: -40, opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
                               transition={{ 
                                 duration: 0.4, 
                                 ease: [0.23, 1, 0.32, 1] 
                               }}
                               className="text-[#DFFF00] font-mono text-xl md:text-2xl lg:text-4xl font-black tracking-[0.3em] uppercase italic drop-shadow-[0_0_20px_rgba(223,255,0,0.2)] whitespace-nowrap"
                             >
                                {words[wordIndex]}
                             </motion.div>
                           </AnimatePresence>
                        </div>
                     </div>
                 </div>
                 
                 <motion.div 
                   initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5, duration: 1 }}
                   className="h-px w-full max-w-lg bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-4" 
                 />
              </div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
                className="mt-20 flex flex-col sm:flex-row items-center gap-8 w-full justify-center"
              >
                <div className="relative group">
                  {/* Ambient Core Glow */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.15, 0.3, 0.15]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#DFFF00] blur-[60px] rounded-full pointer-events-none z-0"
                  />

                  {/* Refined Liquid Ripples */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ 
                        scale: [1, 2.2],
                        opacity: [0, 0.4, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        delay: i * 1,
                        ease: [0.16, 1, 0.3, 1],
                        times: [0, 0.2, 1] // Quick fade in, slow fade out
                      }}
                      className="absolute inset-0 rounded-full border-[0.5px] border-[#DFFF00]/40 blur-[1px] pointer-events-none z-0"
                    />
                  ))}

                  <motion.button 
                    onClick={() => setShowBroadcast(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative px-16 py-7 bg-white text-black font-black text-xs tracking-[0.5em] uppercase rounded-full overflow-hidden transition-all shadow-[0_0_50px_rgba(223,255,0,0.2)] ring-1 ring-black/5 hover:ring-[#DFFF00]/40 z-10"
                  >
                    <span className="relative z-10 flex items-center gap-4 italic">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DFFF00]"></span>
                      </span>
                      READ ME <span className="mx-1 text-black/30 font-bold">//</span> <Radio size={18} className="animate-pulse" />
                    </span>
                    
                    {/* Hover Background Fluid */}
                    <div className="absolute inset-0 bg-[#DFFF00] translate-y-full group-hover:translate-y-0 transition-transform duration-500 cubic-bezier[0.16,1,0.3,1]" />
                    
                    {/* Shimmer Light */}
                    <motion.div 
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                    />
                  </motion.button>
                </div>

                <button 
                  onClick={scrollToLogs}
                  className="group flex items-center gap-4 px-10 py-7 rounded-full bg-white/5 border border-white/10 hover:bg-zinc-900 hover:border-[#DFFF00]/30 transition-all backdrop-blur-md"
                >
                  <Terminal size={14} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors"/>
                  <span className="text-[10px] font-black text-zinc-400 group-hover:text-white uppercase tracking-[0.3em] italic">System_Logs_v3.1 //</span>
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

          {/* --- MODULES SECTION --- */}
          <section id="modules-grid" className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-8 py-40">
            <SectionHeader title="System Modules" icon={<Activity size={16} />} />
            
            <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[300px] gap-[1px] bg-zinc-800 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
              
              {/* 1. SPORTS (Col 3) */}
              <Link href="/sports" className="group md:col-span-3 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                     <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">01_Sports</span>
                     <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <AnimatedTrophy />
                     </div>
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Sports</h3>
                     <div className="h-0.5 w-8 bg-[#DFFF00] mt-4 group-hover:bg-black group-hover:w-full transition-all duration-500" />
                  </div>
              </Link>

              {/* 2. ARCADE (Col 3) */}
              <Link href="/play" className="group md:col-span-3 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                     <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">02_Arcade</span>
                     <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <AnimatedGamepad />
                     </div>
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Arcade</h3>
                     <div className="h-0.5 w-8 bg-[#DFFF00] mt-4 group-hover:bg-black group-hover:w-full transition-all duration-500" />
                  </div>
              </Link>

              {/* 3. ARCHIVES (Col 3) */}
              <Link href="/collections" className="group md:col-span-3 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                     <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">03_Archives</span>
                     <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <AnimatedLayers />
                     </div>
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Archives</h3>
                     <div className="h-0.5 w-8 bg-[#DFFF00] mt-4 group-hover:bg-black group-hover:w-full transition-all duration-500" />
                  </div>
              </Link>

              {/* 4. PLANETARIUM (Col 3) */}
              <Link href="/collections/planetarium" className="group md:col-span-3 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                     <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">07_Astro</span>
                     <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <AnimatedGlobe />
                     </div>
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Astro</h3>
                     <div className="h-0.5 w-8 bg-[#DFFF00] mt-4 group-hover:bg-black group-hover:w-full transition-all duration-500" />
                  </div>
              </Link>

              {/* 5. MARKET (Col 6) */}
              <Link href="/market" className="group md:col-span-6 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors">
                            <AnimatedTrend />
                        </div>
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">04_Economy</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse group-hover:bg-black" />
                        <span className="font-mono text-[9px] font-bold text-zinc-500 group-hover:text-black/60 transition-colors">LIVE_TICKER</span>
                     </div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col gap-6">
                     <div>
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Market</h3>
                        <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase tracking-widest group-hover:text-black/60">Zinc Exchange //</p>
                     </div>
                     
                     <div className="w-full overflow-hidden border-t border-zinc-800 pt-4 group-hover:border-black/10 transition-colors">
                        <motion.div 
                             initial={{ x: 0 }}
                             animate={{ x: "-50%" }}
                             transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
                             className="flex gap-12 whitespace-nowrap"
                           >
                              {[...tickerData, ...tickerData].map((stock, i) => (
                                 <div key={i} className="flex items-center gap-3">
                                    <span className="font-black text-sm text-white group-hover:text-black transition-colors tracking-tighter">{stock.s}</span>
                                    <span className="font-mono text-xs text-[#DFFF00] group-hover:text-black/80 transition-colors">{stock.p}</span>
                                    <span className={`text-[10px] font-bold ${stock.c.startsWith('+') ? 'text-emerald-500 group-hover:text-emerald-700' : 'text-red-500 group-hover:text-red-700'}`}>
                                       {stock.c}
                                    </span>
                                 </div>
                              ))}
                        </motion.div>
                     </div>
                  </div>
              </Link>

              {/* 6. WEATHER (Col 3) */}
              <Link href="/collections/weather" className="group md:col-span-3 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                     <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">05_Atmos</span>
                     <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <AnimatedWeather />
                     </div>
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Weather</h3>
                     <div className="flex items-center gap-2 mt-4 text-zinc-500 group-hover:text-black/60">
                        <CloudRain size={12} />
                        <span className="text-[10px] font-bold">Local //</span>
                     </div>
                  </div>
              </Link>
              
              {/* 7. LOGS (Col 3) */}
              <button onClick={scrollToLogs} className="group md:col-span-3 relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors duration-300 p-8 flex flex-col justify-between overflow-hidden text-left">
                  <div className="relative z-10 flex justify-between items-start">
                     <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black/60 transition-colors">06_System</span>
                     <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-black/10 transition-colors text-[#DFFF00] group-hover:text-black">
                        <AnimatedTerminal />
                     </div>
                  </div>
                  <div className="relative z-10 w-full">
                     <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-black transition-colors">Logs</h3>
                     <div className="mt-4 px-3 py-2 bg-zinc-900 rounded border border-zinc-800 font-mono text-[9px] text-zinc-400 group-hover:bg-black/10 group-hover:border-black/10 group-hover:text-black/70 transition-all">
                        &gt; DIAGNOSTICS...
                     </div>
                  </div>
              </button>

            </div>
          </section>

          {/* --- LOGS SECTION --- */}
          <section id="system-logs" className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-8 pb-40">
            <SectionHeader title="System Logs" icon={<Terminal size={16} />} />
            
            <div className="relative rounded-[4rem] bg-black/40 border border-white/10 backdrop-blur-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
               <div className="h-16 bg-white/[0.03] border-b border-white/5 flex items-center justify-between px-10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#DFFF00]/5 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center gap-8 relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#DFFF00] shadow-[0_0_15px_#DFFF00]" />
                        <span className="text-[10px] font-black text-[#DFFF00] uppercase tracking-[0.3em]">Archives Online</span>
                     </div>
                     <div className="h-5 w-px bg-white/10" />
                     <div className="flex items-center gap-3 opacity-40">
                        <Terminal size={12} className="text-zinc-400" />
                        <span className="text-[10px] font-mono text-zinc-400 tracking-widest font-bold uppercase">Uplink: Zinc_OS_v3.1</span>
                     </div>
                  </div>

                  <div className="flex items-center gap-6 opacity-30 relative z-10">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Recent Activity</span>
                  </div>
               </div>
               
               <div className="p-6 md:p-16 relative">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
                  <PersonalLogs />
               </div>
            </div>
          </section>

          {/* --- FOOTER --- */}
          <footer className="relative z-20 pt-32 pb-16 px-8 text-center border-t border-white/5 bg-zinc-950">
            <div className="max-w-[1600px] mx-auto flex flex-col items-center gap-12">
                <div className="w-16 h-16 bg-[#DFFF00] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(223,255,0,0.2)]">
                    <span className="font-black text-2xl text-black">Z</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-20 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                    <div className="flex items-center gap-3 justify-center group cursor-default">
                        <ShieldCheck size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span>Secure Connection</span>
                    </div>
                    <div className="flex items-center gap-3 justify-center group cursor-default">
                        <Cpu size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span>Status: Optimal</span>
                    </div>
                    <div className="flex items-center gap-3 justify-center group cursor-default">
                        <Activity size={16} className="text-[#DFFF00] group-hover:scale-110 transition-transform" />
                        <span>Version: 3.1.0_PRO</span>
                    </div>
                </div>
                <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                <Link href="/clipflation" className="group relative px-6 py-3">
                  <p className="text-zinc-600 font-black text-xs uppercase tracking-[0.4em] italic group-hover:text-[#DFFF00] transition-colors">
                    Zinc Engineering © 2026 // ALL_RIGHTS_RESERVED //
                  </p>
                </Link>
            </div>
          </footer>
      </motion.div>
    </main>
  );
}

// --- SUB-COMPONENTS ---
const SectionHeader = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
  <div className="flex items-center gap-6 mb-12 px-4 md:px-0">
      <div className="text-[#DFFF00] opacity-80">{icon}</div>
      <span className="text-[11px] font-black uppercase tracking-[0.5em] italic text-[#DFFF00] whitespace-nowrap">{title} //</span>
      <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
  </div>
);