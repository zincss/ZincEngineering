'use client'

import React, { useRef } from 'react';
import { GenerativeCardArt } from '@/app/market/components/GenerativeCardArt';
import { Trophy, Wind, Activity, ScanLine, Lock, Sparkles, Shield, Flame, Crown, Zap, Hexagon, Component, Gauge, Zap as ZapIcon } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// --- TYPES ---
interface TradingCardProps {
  item: any;
  showDetails?: boolean;
  isLocked?: boolean;
}

// --- RARITY CONFIG ---
const getRarityConfig = (rarity: string) => {
  switch (rarity) {
    case 'ZENITH': return { color: '#DFFF00', border: 'border-[#DFFF00]', bg: 'bg-[#DFFF00]/10', text: 'text-[#DFFF00]', glow: 'shadow-[0_0_40px_rgba(223,255,0,0.4)]', icon: Crown };
    case 'COSMIC': return { color: '#EC4899', border: 'border-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-500', glow: 'shadow-[0_0_35px_rgba(236,72,153,0.4)]', icon: Sparkles };
    case 'ULTRA': return { color: '#A855F7', border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-500', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]', icon: Zap };
    case 'SUPER_RARE': return { color: '#F97316', border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-500', glow: 'shadow-[0_0_25px_rgba(249,115,22,0.4)]', icon: Flame };
    case 'RARE': return { color: '#3B82F6', border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]', icon: Shield };
    case 'UNCOMMON': return { color: '#10B981', border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', glow: 'shadow-none', icon: Hexagon };
    default: return { color: '#71717A', border: 'border-zinc-700', bg: 'bg-zinc-800/50', text: 'text-zinc-500', glow: 'shadow-none', icon: Component };
  }
};

// --- 3D WRAPPER ---
const TiltCard = ({ children, isLocked, rarity }: { children: React.ReactNode, isLocked: boolean, rarity: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);
    const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isLocked) return;
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            x.set((e.clientX - rect.left) / rect.width - 0.5);
            y.set((e.clientY - rect.top) / rect.height - 0.5);
        }
    };

    return (
        <motion.div
            ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ perspective: 1200, rotateX: isLocked ? 0 : rotateX, rotateY: isLocked ? 0 : rotateY, transformStyle: "preserve-3d" }}
            className="w-full h-full relative will-change-transform z-0"
        >
            {children}
            {!isLocked && ['ZENITH', 'ULTRA', 'SUPER_RARE', 'COSMIC'].includes(rarity) && (
                <motion.div style={{ background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, transparent 60%)`, mixBlendMode: "overlay", pointerEvents: "none" }} className="absolute inset-0 z-40 rounded-[1.5rem] opacity-50" />
            )}
            {!isLocked && (
                 <motion.div className="absolute inset-0 z-30 opacity-20 rounded-[1.5rem] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-color-dodge" />
            )}
        </motion.div>
    );
};

// ==========================================
// 1. CYBER CARD (ITEMS / BASE)
// ==========================================
const CyberCard = ({ item, config, isLocked, serialNo }: any) => (
    <div className={`relative w-full h-full rounded-[1.5rem] overflow-hidden bg-zinc-950 border-2 ${isLocked ? 'border-zinc-800 grayscale opacity-60' : config.border} flex flex-col`}>
        {/* BG */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent)] bg-[size:30px_30px]" />
        
        {/* HEADER */}
        <div className="relative z-10 flex justify-between items-center p-4 border-b border-white/5 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <config.icon size={14} style={{ color: config.color }} />
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">ARCHIVE_ITEM</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-zinc-950 border border-white/10 text-[9px] font-mono text-zinc-500">
                #{serialNo}
            </div>
        </div>

        {/* IMAGE */}
        <div className="relative flex-1 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-80" />
            <motion.div 
                className="relative z-10 w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                animate={!isLocked ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <GenerativeCardArt name={item.name} type="ITEM" className="w-full h-full object-contain filter drop-shadow-2xl" />
            </motion.div>
        </div>

        {/* FOOTER */}
        <div className="relative z-10 p-5 pt-0">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-1 h-1 rounded-full ${isLocked ? 'bg-zinc-600' : 'bg-[#DFFF00] animate-pulse'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.color }}>{item.rarity.replace('_', ' ')}</span>
            </div>
            <h3 className="text-xl font-bold text-white font-mono leading-tight mb-2 uppercase line-clamp-2">{item.name}</h3>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-zinc-700" style={{ backgroundColor: isLocked ? undefined : config.color }} />
            </div>
        </div>
    </div>
);

// ==========================================
// 2. TURBO CARD (CARS)
// ==========================================
const TurboCard = ({ item, config, isLocked, serialNo }: any) => (
    <div className={`relative w-full h-full rounded-[1.5rem] overflow-hidden bg-zinc-900 border ${isLocked ? 'border-zinc-800 grayscale opacity-60' : 'border-red-500/30'} flex flex-col`}>
        {/* CARBON TEXTURE */}
        <div className="absolute inset-0 bg-[#111]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
        
        {/* RACING STRIPE */}
        <div className="absolute top-0 bottom-0 right-8 w-16 bg-gradient-to-b from-red-600/20 to-transparent transform skew-x-[-15deg]" />

        {/* IMAGE AREA */}
        <div className="relative h-[65%] w-full overflow-hidden">
             {/* Blurred BG */}
             <div className="absolute inset-0 scale-110 blur-xl opacity-50">
                <GenerativeCardArt name={item.name} type="CAR" className="w-full h-full object-cover" />
             </div>
             <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
             
             <div className="relative h-full w-full p-4 flex items-center justify-center">
                <GenerativeCardArt name={item.name} type="CAR" className="w-full h-full object-contain drop-shadow-2xl" />
             </div>
        </div>

        {/* INFO PLATE */}
        <div className="relative flex-1 bg-gradient-to-t from-black to-zinc-900/80 p-5 flex flex-col justify-end border-t border-white/10">
            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black italic text-zinc-500 uppercase">Model</span>
                    <h3 className="text-2xl font-black italic text-white uppercase leading-none">{item.name}</h3>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-black italic text-red-500 uppercase">Class</span>
                    <div className="text-xl font-black italic text-white uppercase leading-none">A+</div>
                </div>
            </div>
            
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
                 <div className="flex items-center gap-1">
                     <Gauge size={12} className="text-zinc-500" />
                     <span className="text-[9px] font-mono text-zinc-400">TURBO_CHARGED</span>
                 </div>
                 <div className="flex items-center gap-1 ml-auto">
                     <span className="text-[9px] font-mono text-zinc-600">#{serialNo}</span>
                 </div>
            </div>
        </div>
    </div>
);

// ==========================================
// 3. LEGENDS CARD (NFL)
// ==========================================
const LegendsCard = ({ item, config, isLocked, serialNo }: any) => {
    // Determine Team Color (Mock logic or use item prop if available)
    const teamColor = item.color || '#3b82f6'; // Default blue

    return (
        <div className={`relative w-full h-full rounded-[1.5rem] overflow-hidden bg-white border-4 ${isLocked ? 'border-zinc-300 grayscale opacity-60' : 'border-white'} shadow-2xl flex flex-col`}>
            {/* STADIUM BG */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-200 to-zinc-100" />
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-black/80 to-transparent z-0" />
            
            {/* MESH TEXTURE TOP */}
            <div className="absolute top-0 w-full h-32 opacity-20 z-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '6px 6px' }} />

            {/* MAIN PORTRAIT */}
            <div className="absolute inset-0 z-10">
                <GenerativeCardArt name={item.name} type="NFL_PLAYER" className="w-full h-full object-cover" />
                {/* Gradient fade at bottom for text */}
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>

            {/* OVERLAYS */}
            <div className="relative z-20 flex-1 flex flex-col justify-between p-5">
                {/* Top Header */}
                <div className="flex justify-between items-start">
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 transform -skew-x-12">
                         <span className="text-[10px] font-black italic text-white uppercase tracking-wider">{item.team || 'PRO LEAGUE'}</span>
                    </div>
                    <Trophy className="text-yellow-400 drop-shadow-md" size={24} />
                </div>

                {/* Bottom Nameplate */}
                <div className="mt-auto">
                     <div className="flex items-center gap-2 mb-1">
                         <div className="px-2 py-0.5 rounded bg-blue-600 text-[8px] font-black uppercase text-white shadow-lg">
                             {item.position || 'PLY'}
                         </div>
                         <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">{item.rarity.replace('_', ' ')}</span>
                     </div>
                     <h2 className="text-4xl font-black uppercase italic text-white leading-[0.85] tracking-tighter drop-shadow-lg">
                        {item.name.split(' ').map((n:string, i:number) => (
                            <span key={i} className="block">{n}</span>
                        ))}
                     </h2>
                </div>
            </div>
            
            {/* FOOTER STRIP */}
            <div className="relative z-20 h-8 bg-white flex items-center justify-between px-4 border-t-2" style={{ borderColor: teamColor }}>
                 <span className="text-[8px] font-black uppercase text-zinc-400">Zinc Legends Series</span>
                 <span className="text-[8px] font-mono font-bold text-zinc-800">#{serialNo}</span>
            </div>
        </div>
    );
};


// --- MAIN CONTROLLER ---
export const TradingCard = ({ item, isLocked = false }: TradingCardProps) => {
    const config = getRarityConfig(item.rarity);
    
    // Generate Stable Serial
    const serialNo = item.serial_number 
        ? String(item.serial_number).padStart(4, '0') 
        : Math.floor(Math.random() * 9999).toString().padStart(4, '0');

    // Dispatcher
    let CardComponent = CyberCard;
    if (item.type === 'CAR') CardComponent = TurboCard;
    if (item.type === 'NFL_PLAYER') CardComponent = LegendsCard;

    return (
        <TiltCard isLocked={isLocked} rarity={item.rarity}>
            <CardComponent item={item} config={config} isLocked={isLocked} serialNo={serialNo} />
            
            {/* GENERIC LOCK OVERLAY (If specific cards don't handle it fully) */}
            {isLocked && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] rounded-[1.5rem]">
                    <Lock size={32} className="text-white/50 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Restricted</span>
                </div>
            )}
        </TiltCard>
    );
};