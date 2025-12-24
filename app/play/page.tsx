'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  ChevronRight, 
  Construction, 
  Spade, 
  Trophy, 
  Package, 
  ArrowRight,
  Info,
  X,
  LogIn,
  Flame,
  Zap,
  Hash // Added Hash icon for Cyphers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- COMPONENTS ---

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
  <div className="flex items-center gap-4 mb-6 px-2 sticky top-20 z-20 py-2 glass-panel rounded-xl md:static md:bg-transparent md:p-0">
      <div className="p-2 bg-[#DFFF00]/10 rounded-lg border border-[#DFFF00]/20 hidden md:block">
           <Icon size={18} className="text-[#DFFF00]" />
      </div>
      <div className="flex-1">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span className="md:hidden text-[#DFFF00]"><Icon size={16} /></span>
            {title}
          </h3>
          <p className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-widest">
            {subtitle}
          </p>
      </div>
      <div className="h-px flex-1 bg-zinc-800 hidden md:block" />
  </div>
);

// Updated GameCard to accept className for custom sizing/grids
const GameCard = ({ 
  href, 
  title, 
  description, 
  icon: Icon, 
  bgImage, 
  accentColor = "text-white", 
  tag = "",
  size = "standard",
  className = "" 
}: { 
  href: string, 
  title: string, 
  description: string, 
  icon: any, 
  bgImage: string, 
  accentColor?: string,
  tag?: string,
  size?: "standard" | "large" | "wide",
  className?: string
}) => {
  // Base size logic (can be overridden by className prop)
  const heightClass = size === 'large' ? 'h-96' : size === 'wide' ? 'h-64 md:h-80' : 'h-64';
  const colSpanClass = size === 'large' ? 'col-span-1 md:col-span-2 lg:col-span-8' : size === 'wide' ? 'col-span-1 md:col-span-2' : 'col-span-1';

  return (
    <Link 
      href={href}
      className={`
        group relative block ${heightClass} ${colSpanClass} 
        rounded-[2rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden 
        hover:border-[#DFFF00]/50 transition-all duration-500 
        hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] active:scale-[0.98]
        ${className}
      `}
    >
      {/* Background Image */}
      <div className={`absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-20 grayscale transition-all duration-700 group-hover:scale-105`} style={{ backgroundImage: `url('${bgImage}')` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
      
      {/* Icon Badge */}
      <div className="absolute top-6 left-6 flex justify-between w-[calc(100%-3rem)]">
         <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 group-hover:border-[#DFFF00]/50 transition-colors">
            <Icon size={24} className={`${accentColor} group-hover:text-[#DFFF00] transition-colors`} />
         </div>
         {tag && (
           <div className="px-3 py-1.5 h-fit bg-[#DFFF00] text-black font-black text-[10px] uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(223,255,0,0.4)] animate-pulse">
             {tag}
           </div>
         )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
         <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-2 leading-none group-hover:text-[#DFFF00] transition-colors">{title}</h2>
         <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider group-hover:text-zinc-200 transition-colors line-clamp-2">
           {description}
         </p>
         
         <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
              Initialize <ChevronRight size={10} />
         </div>
      </div>
    </Link>
  );
};

export default function PlayHub() {
  const { user, loading } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const hasSeenIntro = sessionStorage.getItem('zinc_play_intro_seen');
      if (!hasSeenIntro) setShowInfoModal(true);
    }
  }, [loading, user]);

  const closeInfoModal = () => {
    setShowInfoModal(false);
    sessionStorage.setItem('zinc_play_intro_seen', 'true');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 relative overflow-x-hidden selection:bg-[#DFFF00] selection:text-black">
      
      <div className="bg-starfield fixed inset-0 z-0" />

      {/* --- GUEST MODAL --- */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={closeInfoModal} />
          <div className="relative bg-zinc-900 border border-[#DFFF00]/30 rounded-3xl p-8 max-w-lg w-full animate-in zoom-in-95 slide-in-from-bottom-4">
            <button onClick={closeInfoModal} className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#DFFF00]/10 rounded-full border border-[#DFFF00]/20">
                <Info className="text-[#DFFF00]" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Ecosystem Access</h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Guest Mode Detected</p>
              </div>
            </div>
            <div className="space-y-4 font-mono text-sm text-zinc-400 py-6 border-y border-zinc-800 mb-6">
              <p><strong className="text-white">Welcome to Zinc Arcade.</strong> Signing in unlocks persistence, credits, and the global economy.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="flex-1 flex items-center justify-center gap-2 bg-[#DFFF00] hover:bg-[#cce600] text-black font-bold py-3 px-4 rounded-xl uppercase text-xs tracking-widest">
                <LogIn size={16} /> Initialize Session
              </Link>
              <button onClick={closeInfoModal} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-xl uppercase text-xs tracking-widest">
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <section className="relative pt-32 pb-8 px-6 border-b border-zinc-800/50 z-10 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 text-white">
                    System <span className="text-zinc-800">Arcade</span>
                </h1>
                <p className="text-zinc-400 font-mono text-xs md:text-sm max-w-xl leading-relaxed">
                   <span className="text-[#DFFF00] font-black mr-2">///</span>
                   Interactive simulation modules. Wager credits. Test algorithms.
                </p>
            </div>
            
            <Link 
                href="/play/market"
                className="group flex items-center gap-3 px-6 py-3 bg-[#DFFF00] hover:bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(223,255,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95 whitespace-nowrap"
            >
                <Package size={16} className="group-hover:rotate-12 transition-transform" />
                <span>Black Market</span>
                <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform" />
            </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-16 relative z-10">
        
        {/* --- 1. DAILY ENGAGEMENT (HERO) --- */}
        <section>
           <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-[#DFFF00] fill-[#DFFF00] animate-pulse" />
              <span className="text-xs font-mono font-bold text-[#DFFF00] uppercase tracking-widest">Daily Protocol</span>
           </div>

           <Link 
              href="/play/cyphers"
              className="group relative block w-full h-[400px] md:h-[320px] rounded-[2.5rem] overflow-hidden border border-zinc-700 hover:border-[#DFFF00] transition-all duration-500 shadow-2xl"
           >
              {/* Animated BG */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105 saturate-0 group-hover:saturate-100" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
              
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DFFF00] text-black text-[10px] font-black uppercase tracking-widest rounded-full w-fit mb-4">
                     <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" /> New Module
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-4 tracking-tight group-hover:text-[#DFFF00] transition-colors">
                    Protocol <br/><span className="text-zinc-600 group-hover:text-white transition-colors">Cyphers</span>
                  </h2>
                  <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-6 max-w-md">
                    Daily cryptographic sequence challenge. Decrypt 4, 5, and 6-letter security layers to earn credits.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white group-hover:translate-x-2 transition-transform">
                      Initiate Hack <ArrowRight size={14} />
                  </div>
              </div>
           </Link>
        </section>

        {/* --- 2. LIVE TABLES --- */}
        <section>
          <SectionHeader icon={Spade} title="Live Tables" subtitle="High Stakes Environment" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
             
             {/* POKER (Featured Half-Width) */}
             <div className="col-span-1 md:col-span-2 lg:col-span-6 group relative min-h-[300px] rounded-[2rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500">
                <Link href="/play/poker" className="block h-full">
                  <div className="absolute inset-0 overflow-hidden">
                     {/* Try to load video, fallback to image if needed */}
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity duration-700">
                        <source src="/videos/casino-bg.mp4" type="video/mp4" />
                     </video>
                     <div className="absolute inset-0 bg-zinc-950/50" /> 
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  
                  <div className="absolute top-6 right-6 bg-black/50 backdrop-blur p-3 rounded-full border border-white/10 group-hover:scale-110 transition-transform">
                      <Trophy className="text-[#DFFF00]" size={24} />
                  </div>

                  <div className="absolute bottom-0 left-0 p-8 w-full">
                      <h2 className="text-4xl font-black uppercase text-white mb-2">Texas Hold&apos;em</h2>
                      <p className="text-zinc-400 font-mono text-sm max-w-lg">
                        No-Limit Protocol. Neural network opponents.
                      </p>
                  </div>
                </Link>
             </div>

             {/* BLACKJACK */}
             <GameCard 
                  href="/play/blackjack"
                  title="Blackjack"
                  description="21 Probability Sim"
                  icon={Spade}
                  bgImage="https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2674&auto=format&fit=crop"
                  size="standard"
                  className="lg:col-span-3 h-full min-h-[300px]"
             />

             {/* ROULETTE (NEW) */}
             <GameCard 
                  href="/play/roulette"
                  title="Roulette"
                  description="Wheel of Fortune"
                  icon={Spade}
                  bgImage="https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=2672&auto=format&fit=crop"
                  size="standard"
                  className="lg:col-span-3 h-full min-h-[300px]"
             />
          </div>
        </section>

        {/* --- 3. SIMULATION & KNOWLEDGE --- */}
        <section>
          <SectionHeader icon={Brain} title="Cognitive Sims" subtitle="Market & Logic" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             
             {/* REPLACED: Zinc Exchange -> Cyphers */}
             <GameCard 
                href="/play/cyphers"
                title="Cyphers"
                description="Cryptographic Word Logic"
                icon={Hash}
                bgImage="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2670&auto=format&fit=crop"
                accentColor="text-[#DFFF00]"
             />

             <GameCard 
                href="/play/hotseat"
                title="Hotseat"
                description="Rapid Fire Trivia"
                icon={Flame}
                bgImage="https://images.pexels.com/photos/3826581/pexels-photo-3826581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                accentColor="text-red-500"
                tag="HOT"
             />

             <GameCard 
                href="/collections/trivia"
                title="Trivia Matrix"
                description="Standard Assessment"
                icon={Brain}
                bgImage="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2670&auto=format&fit=crop"
             />

          </div>
        </section>

        {/* --- 4. DEV --- */}
        <section className="opacity-60 hover:opacity-100 transition-opacity">
           <div className="border border-dashed border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-950/30">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-zinc-900 rounded-2xl text-zinc-600">
                     <Construction size={32} />
                  </div>
                  <div>
                     <h3 className="text-lg font-black uppercase text-zinc-500">Memory Core</h3>
                     <p className="text-xs font-mono text-zinc-600">Module under construction</p>
                  </div>
               </div>
               <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-700 bg-zinc-900 px-4 py-2 rounded-full">
                  v0.9.2 Alpha
               </div>
           </div>
        </section>

      </div>
    </main>
  );
}