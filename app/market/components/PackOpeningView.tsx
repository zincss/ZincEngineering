'use client'

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    Layers, Grid3X3, Info, Lock, Zap, CarFront, Loader2, X, Sparkles, Cpu, 
    RotateCcw, Trophy, AlertTriangle, Siren, Radiation, Fingerprint, Crown, Scan, 
    Signal, Radio, Disc, ChevronRight, LayoutGrid, Hand
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { REEL_ITEMS_SOURCE, CAR_PACK_SOURCE, GRIDIRON_PACK_SOURCE, BasePackIcon, ItemImage } from './shared';
import { TradingCard } from './TradingCard';

const WALKOUT_RARITIES = ['SUPER_RARE', 'ULTRA', 'ZENITH'];

const getHypeConfig = (rarity: string) => {
    switch (rarity) {
        case 'ZENITH': return { tier: 3, color: '#DFFF00', label: 'ZENITH_CLASS', icon: Crown, detectText: 'ZENITH_LEVEL_EVENT', revealText: 'MYTHIC_ARTIFACT', bg: 'bg-[#DFFF00]' };
        case 'ULTRA': return { tier: 3, color: '#A855F7', label: 'ULTRA_CLASS', icon: Radiation, detectText: 'CRITICAL_ANOMALY', revealText: 'ULTRA_RARE_ASSET', bg: 'bg-purple-600' };
        case 'SUPER_RARE': return { tier: 3, color: '#F97316', label: 'SUPER_RARE_CLASS', icon: Zap, detectText: 'SECURITY_BREACH', revealText: 'HIGH_VOLTAGE_SIGNATURE', bg: 'bg-orange-500' };
        default: return null;
    }
};

const CardBack = ({ config }: { config: any }) => (
    <div className="w-full h-full rounded-[2rem] bg-zinc-950 border-4 border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#DFFF00]/5 to-transparent pointer-events-none" />
        <div className={`w-24 h-24 rounded-3xl border-2 flex items-center justify-center bg-zinc-900 z-10 shadow-2xl transition-all duration-500 group-hover:scale-110`} style={{ borderColor: config.color }}>
            <config.icon size={48} style={{ color: config.color }} />
        </div>
        <div className="mt-8 font-black uppercase text-zinc-600 tracking-[0.4em] text-[10px] z-10 flex flex-col items-center gap-2">
            <span className="italic">ZINC_PROTOCOLS</span>
            <span className="text-white opacity-40">ENCRYPTED_ASSET</span>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800" />
    </div>
);

const MiniSummaryCard = ({ item, index }: { item: any, index: number }) => {
    const isRare = WALKOUT_RARITIES.includes(item.rarity);
    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border ${isRare ? 'border-[#DFFF00]/50 shadow-[0_0_20px_rgba(223,255,0,0.1)]' : 'border-white/5'} group`}>
            <ItemImage name={item.name} searchQuery={item.searchQuery || item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-4">
                <div className={`text-[8px] font-black uppercase tracking-widest ${isRare ? 'text-[#DFFF00]' : 'text-zinc-500'} mb-1 italic`}>{item.rarity}</div>
                <div className="text-[10px] font-black text-white uppercase leading-tight truncate italic">{item.name}</div>
            </div>
        </motion.div>
    );
};

// --- HYPE OVERLAY WITH GOD RAYS ---
const HypeOverlay = ({ rarity, item }: { rarity: string, item: any }) => {
    const config = getHypeConfig(rarity);
    const [phase, setPhase] = useState<'DETECTING' | 'IDENTIFIED' | 'REVEALED'>('DETECTING');
    useEffect(() => {
        const t1 = setTimeout(() => setPhase('IDENTIFIED'), 2000);
        const t2 = setTimeout(() => setPhase('REVEALED'), 3500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);
    if (!config) return null;
    const isDetecting = phase === 'DETECTING';
    const isRevealed = phase === 'REVEALED';
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(20px)' }} className="fixed inset-0 z-[150] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
            
            {/* GOD RAYS BACKGROUND */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vh] opacity-20 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,${config.color}_30deg,transparent_60deg,${config.color}_90deg,transparent_120deg,${config.color}_150deg,transparent_180deg)] animate-spin-slow blur-3xl`} />
            </div>

            <motion.div animate={{ opacity: isDetecting ? [0.05, 0.15, 0.05] : 0.1, backgroundColor: isDetecting ? '#ef4444' : config.color }} transition={{ duration: 0.5, repeat: isDetecting ? Infinity : 0 }} className="absolute inset-0 z-0" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
            
            <AnimatePresence>
                {isRevealed && (
                    <motion.div initial={{ scale: 0.5, opacity: 0, rotateY: 90 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} transition={{ type: "spring", damping: 15 }} className="relative z-50 flex flex-col items-center">
                        <div className="w-[300px] aspect-[2/3] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative rounded-[2.5rem] overflow-hidden border border-white/10">
                            <div className={`absolute inset-0 blur-3xl opacity-30 animate-pulse`} style={{ backgroundColor: config.color }} />
                            <TradingCard item={item} />
                        </div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center mt-12">
                            <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter" style={{ textShadow: `0 0 40px ${config.color}40` }}>{item.name}</h2>
                            <div className="text-[#DFFF00] font-mono text-xs font-bold tracking-[0.4em] mt-4 uppercase italic">Level_Signature // {config.label}</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {!isRevealed && (
                <div className="relative z-10 flex flex-col items-center gap-12">
                    <div className="relative">
                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className={`absolute -inset-8 rounded-full border-2 ${isDetecting ? 'border-red-500/30' : 'border-[#DFFF00]/30'}`} />
                        <div className={`w-48 h-48 rounded-[2.5rem] border-2 flex items-center justify-center backdrop-blur-xl relative overflow-hidden transition-colors duration-500 ${isDetecting ? 'border-red-500/50 bg-red-500/5' : 'border-[#DFFF00]/50 bg-[#DFFF00]/5'}`}>
                            {isDetecting ? <Scan size={80} className="text-red-500 animate-pulse" /> : <config.icon size={100} style={{ color: config.color }} />}
                        </div>
                    </div>
                    <div className="text-center space-y-6">
                        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="flex items-center gap-4 justify-center">
                            <span className={`font-mono text-xs uppercase tracking-[0.5em] font-black italic ${isDetecting ? 'text-red-500' : 'text-[#DFFF00]'}`}>{isDetecting ? config.detectText : config.label}</span>
                        </motion.div>
                        <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter">{isDetecting ? 'ANALYZING...' : rarity.replace('_', ' ')}</h2>
                        <div className="w-80 h-1 bg-zinc-900 rounded-full overflow-hidden mx-auto border border-white/5">
                            <motion.div initial={{ width: "0%" }} animate={{ width: isDetecting ? "70%" : "100%" }} transition={{ duration: 2 }} className={`h-full ${isDetecting ? 'bg-red-500' : 'bg-[#DFFF00]'}`} />
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// --- IMPROVED FOIL PACK WITH 3D TILT ---
const FoilPack = ({ config, isSelected }: { config: any, isSelected: boolean }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);
    const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isSelected) return;
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            x.set((e.clientX - rect.left) / rect.width - 0.5);
            y.set((e.clientY - rect.top) / rect.height - 0.5);
        }
    };
    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000, transformStyle: "preserve-3d", rotateX: isSelected ? rotateX : 0, rotateY: isSelected ? rotateY : 0 }}
            className={`relative w-64 h-96 shrink-0 transition-all duration-500 ${isSelected ? 'scale-105 z-10' : 'scale-90 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
        >
             <div className={`absolute -inset-4 bg-${config.color === '#DFFF00' ? '[#DFFF00]' : config.color.replace('text-', '').replace('-500', '-500')}/20 blur-[50px] rounded-full transition-opacity duration-1000 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
            
            {/* PHYSICAL PACK WRAPPER */}
            <div className={`relative w-full h-full flex flex-col items-center justify-between overflow-hidden shadow-2xl rounded-[1.5rem] border transition-all duration-500 bg-zinc-950 ${isSelected ? 'border-white/20' : 'border-white/5'}`}>
                
                {/* METALLIC GRADIENT BG */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-800 via-zinc-950 to-zinc-900" />
                <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                
                {/* CRIMPED EDGES (TOP/BOTTOM) */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)] opacity-50 z-20" />
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)] opacity-50 z-20" />

                {/* CONTENT */}
                <div className="flex-1 w-full flex flex-col items-center justify-center p-6 relative z-10 text-center">
                    <div className="mb-8 p-6 rounded-[2rem] bg-zinc-900 border border-white/5 shadow-2xl relative group">
                        <div className={`absolute inset-0 blur-xl opacity-20 bg-${config.color === '#DFFF00' ? '[#DFFF00]' : config.color.replace('text-', '')}`} />
                        <config.icon size={56} style={{ color: config.color }} className="relative z-10" />
                    </div>
                    <h3 className="text-4xl font-black uppercase italic leading-none text-white tracking-tighter drop-shadow-lg">{config.label}</h3>
                    <div className="mt-4 text-[10px] font-mono font-black uppercase tracking-[0.3em] text-[#DFFF00] bg-[#DFFF00]/10 px-4 py-1.5 rounded-full border border-[#DFFF00]/20">{config.name}</div>
                </div>

                <div className="w-full text-center py-8 relative z-10 bg-gradient-to-t from-black to-transparent">
                    <div className="text-xs font-black text-white italic tracking-widest">{config.cost} CREDITS</div>
                </div>

                {/* HOLOGRAPHIC GLARE */}
                {isSelected && (
                    <motion.div 
                        style={{ background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.0) 50%)`, backgroundSize: '200% 200%', backgroundPosition: glareX }}
                        className="absolute inset-0 z-30 opacity-40 mix-blend-overlay pointer-events-none"
                    />
                )}
            </div>
        </motion.div>
    );
};

// --- HOLD BUTTON ---
const HoldButton = ({ onComplete, disabled, loading, cost }: any) => {
    const [holding, setHolding] = useState(false);
    const progress = useMotionValue(0);
    const scale = useTransform(progress, [0, 100], [1, 0.95]);
    const fill = useTransform(progress, [0, 100], ["0%", "100%"]);
    const intervalRef = useRef<any>(null);

    const startHold = () => {
        if (disabled || loading) return;
        setHolding(true);
        let p = 0;
        intervalRef.current = setInterval(() => {
            p += 2; // Speed of fill
            progress.set(p);
            if (p >= 100) {
                clearInterval(intervalRef.current);
                onComplete();
                setHolding(false);
                progress.set(0);
            }
        }, 16); // ~60fps
    };

    const stopHold = () => {
        setHolding(false);
        progress.set(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    return (
        <motion.button
            onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={startHold} onTouchEnd={stopHold}
            style={{ scale }}
            disabled={disabled}
            className={`relative w-full py-8 rounded-[2rem] overflow-hidden group select-none ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
        >
            <div className="absolute inset-0 bg-zinc-800 border border-white/10" />
            <motion.div style={{ width: fill }} className="absolute inset-0 bg-[#DFFF00]" />
            
            <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                    {loading ? <Loader2 className="animate-spin text-zinc-500" /> : <Fingerprint size={24} className={holding ? 'text-black' : 'text-[#DFFF00]'} />}
                    <span className={`text-sm font-black uppercase tracking-[0.3em] italic ${holding ? 'text-black' : 'text-white'}`}>
                        {loading ? 'Processing...' : holding ? 'HOLD TO AUTHORIZE' : `HOLD TO PURCHASE (${cost} CR)`}
                    </span>
                </div>
            </div>
        </motion.button>
    );
};


export const PackOpeningView = ({ user, profile, authLoading, refreshProfile }: any) => {
    const supabase = createClient();
    const [stage, setStage] = useState<'IDLE' | 'CHARGING' | 'BURST' | 'REVEAL' | 'HYPE' | 'SUMMARY'>('IDLE');
    const [packQueue, setPackQueue] = useState<any[]>([]); 
    const [currentCardIndex, setCurrentCardIndex] = useState(0); 
    const [isCardFlipped, setIsCardFlipped] = useState(false); 
    const [isAutoFlipping, setIsAutoFlipping] = useState(false);
    const [error, setError] = useState('');
    const [showInfo, setShowInfo] = useState(false);
    const [packQuantity, setPackQuantity] = useState<1 | 3>(1);
    const [selectedPack, setSelectedPack] = useState<'BASE' | 'CARS' | 'GRIDIRON' | 'TEST'>('BASE');

    const PACK_CONFIG = {
        BASE: { cost: 100, name: 'Series_01', label: 'Base Set', icon: BasePackIcon, source: REEL_ITEMS_SOURCE, color: '#DFFF00', desc: "Standard archive extraction. Contains 5 randomized artifacts." },
        CARS: { cost: 250, name: 'Hyper_Drive', label: 'Auto Legends', icon: CarFront, source: CAR_PACK_SOURCE, color: '#ef4444', desc: "High octane vehicle acquisition. 5 high-performance cards." },
        GRIDIRON: { cost: 300, name: 'End_Zone', label: 'NFL Legends', icon: Trophy, source: GRIDIRON_PACK_SOURCE, color: '#3b82f6', desc: "Legendary player cards. Hunt for the Zenith Tom Brady (1 of 5)." },
        TEST: { cost: 9999, name: 'Debug_Mode', label: 'Test Protocol', icon: Cpu, source: REEL_ITEMS_SOURCE, color: '#ff00ff', desc: "Restricted developer access. Guaranteed high-tier walkouts." }
    };

    const currentConfig = PACK_CONFIG[selectedPack];
    const cost = packQuantity * currentConfig.cost;
    const canAfford = (profile?.credits || 0) >= cost;
    const isReady = !authLoading && user;

    const handleOpenPack = async () => {
        if (authLoading || !profile || profile.credits < cost) return;
        setStage('CHARGING'); setError(''); setPackQueue([]); setCurrentCardIndex(0); setIsCardFlipped(false);
        try {
            const { error: txError } = await supabase.rpc('add_credits', { amount: -cost });
            if (txError) throw txError;
            const generatedItems: any[] = [];
            for (let i = 0; i < packQuantity * 5; i++) {
                const rand = Math.random() * 100;
                let rarity = 'COMMON';
                if (selectedPack === 'TEST') { if (rand <= 40) rarity = 'ZENITH'; else if (rand <= 70) rarity = 'ULTRA'; else if (rand <= 90) rarity = 'SUPER_RARE'; else rarity = 'RARE'; }
                else { if (rand <= 0.1) rarity = 'ZENITH'; else if (rand <= 1.0) rarity = 'ULTRA'; else if (rand <= 5.0) rarity = 'SUPER_RARE'; else if (rand <= 20.0) rarity = 'RARE'; else if (rand <= 50.0) rarity = 'UNCOMMON'; }
                const pool = currentConfig.source.filter((item: any) => item.rarity === rarity);
                const wonItem = (pool.length > 0 ? pool : currentConfig.source)[Math.floor(Math.random() * (pool.length || currentConfig.source.length))];
                generatedItems.push({ ...wonItem, rarity, uniqueId: Math.random().toString() });
            }
            setPackQueue(generatedItems); refreshProfile();
            setStage('BURST');
            setTimeout(() => { 
                if (WALKOUT_RARITIES.includes(generatedItems[0].rarity)) { setStage('HYPE'); setIsCardFlipped(true); setTimeout(() => setStage('REVEAL'), 6000); }
                else setStage('REVEAL');
            }, 2000); // Wait for burst anim
        } catch (err: any) { setError(err.message || "Uplink Failed"); setStage('IDLE'); }
    };

    const handleCardTap = () => {
        if (isAutoFlipping || (stage !== 'REVEAL' && stage !== 'HYPE')) return;
        if (!isCardFlipped) setIsCardFlipped(true);
        else if (currentCardIndex < packQueue.length - 1) {
            const nextIdx = currentCardIndex + 1;
            setIsAutoFlipping(true); setIsCardFlipped(false);
            setTimeout(() => {
                setCurrentCardIndex(nextIdx);
                if (WALKOUT_RARITIES.includes(packQueue[nextIdx].rarity)) { setStage('HYPE'); setIsCardFlipped(true); setTimeout(() => setStage('REVEAL'), 6000); }
                setIsAutoFlipping(false);
            }, 300);
        } else setStage('SUMMARY');
    };

    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-4 relative min-h-[800px]">
            
            {/* AMBIENT VIDEO BACKGROUND */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="/market-page.mp4" type="video/mp4" />
                </video>
            </div>

            <AnimatePresence>
                {stage === 'BURST' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white flex items-center justify-center pointer-events-none">
                        <motion.div animate={{ scale: [1, 20], opacity: [1, 0] }} transition={{ duration: 1.5, ease: "circOut" }} className="w-24 h-24 bg-[#DFFF00] rounded-full blur-xl" />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>{stage === 'HYPE' && packQueue[currentCardIndex] && <HypeOverlay rarity={packQueue[currentCardIndex].rarity} item={packQueue[currentCardIndex]} />}</AnimatePresence>

            <AnimatePresence>
                {stage === 'IDLE' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl flex flex-col items-center z-10">
                        
                        {/* PACK CAROUSEL */}
                        <div className="flex items-center gap-12 mb-20 overflow-x-auto no-scrollbar snap-x snap-mandatory px-[calc(50%-8rem)] w-full py-12 mask-linear-fade">
                            {Object.keys(PACK_CONFIG).map((id) => (
                                <div key={id} onClick={() => setSelectedPack(id as any)} className="cursor-pointer snap-center outline-none">
                                    <FoilPack config={PACK_CONFIG[id as keyof typeof PACK_CONFIG]} isSelected={selectedPack === id} />
                                </div>
                            ))}
                        </div>

                        {/* CONTROLS */}
                        <div className="w-full max-w-2xl bg-zinc-950/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-white/5">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-3">Archive_Extraction // Series_09</div>
                                    <h3 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">{currentConfig.label}</h3>
                                </div>
                                <button onClick={() => setShowInfo(!showInfo)} className={`p-4 rounded-2xl transition-all border ${showInfo ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-950 text-zinc-500 border-white/5 hover:text-white'}`}><Info size={20}/></button>
                            </div>

                            <AnimatePresence>{showInfo && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/40 rounded-2xl border border-white/5 mb-8 p-6 text-xs font-mono text-zinc-400 italic leading-relaxed">{currentConfig.desc}</motion.div>}</AnimatePresence>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {[1, 3].map(qty => (
                                    <button key={qty} onClick={() => setPackQuantity(qty as 1|3)} className={`p-6 rounded-[2rem] border-2 flex items-center justify-center gap-4 transition-all duration-500 ${packQuantity === qty ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'}`}>
                                        {qty === 1 ? <Layers size={20}/> : <LayoutGrid size={20}/>}
                                        <span className="font-black text-xs uppercase tracking-[0.2em] italic">{qty === 1 ? 'Single_Unit' : 'Triple_Stack'}</span>
                                    </button>
                                ))}
                            </div>

                            <HoldButton onComplete={handleOpenPack} disabled={!isReady || !canAfford} loading={authLoading} cost={cost} />
                            
                            {!canAfford && (
                                <div className="mt-4 text-center">
                                    <span className="text-red-500 font-mono text-[10px] uppercase tracking-widest">Insufficient Funds // Required: {cost} CR</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {(stage === 'REVEAL' || stage === 'HYPE') && (
                <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-3xl flex flex-col items-center justify-center" onClick={handleCardTap}>
                    
                    {/* GOD RAYS */}
                     <div className="absolute inset-0 overflow-hidden pointer-events-none">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[100vh] bg-gradient-to-b from-[#DFFF00]/10 to-transparent blur-3xl opacity-50" />
                    </div>

                    <div className="absolute top-28 text-center z-10">
                        <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.5em] mb-4">Uplink_Sequence_Active</div>
                        <div className="flex items-center gap-4 justify-center text-4xl font-black italic tracking-tighter text-white">
                            <span>{currentCardIndex + 1}</span> <span className="text-zinc-800">/</span> <span>{packQueue.length}</span>
                        </div>
                    </div>
                    <div className="relative w-[85vw] max-w-[340px] aspect-[2/3] perspective-1000 z-20">
                        <AnimatePresence mode='wait'>
                            <motion.div key={currentCardIndex} initial={{ y: 200, opacity: 0, rotateX: 20 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} exit={{ y: -200, opacity: 0, rotateX: -20 }} transition={{ type: "spring", damping: 20 }} className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
                                <motion.div animate={{ rotateY: isCardFlipped ? 180 : 0 }} transition={{ duration: 0.8, ease: "backOut" }} className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
                                    <div className="absolute inset-0 backface-hidden rounded-[2.5rem] overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><TradingCard item={packQueue[currentCardIndex]} /></div>
                                    <div className="absolute inset-0 backface-hidden rounded-[2.5rem] overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}><CardBack config={currentConfig} /></div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="absolute bottom-16 text-[#DFFF00] font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse italic z-10 cursor-pointer">{isCardFlipped ? 'Tap_to_Dismiss' : 'Tap_to_Reveal'}</div>
                </div>
            )}

            {stage === 'SUMMARY' && (
                <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center overflow-y-auto pt-32 pb-20 px-6">
                    <div className="max-w-6xl w-full">
                        <div className="flex flex-col items-center text-center mb-16">
                            <div className="w-16 h-16 bg-[#DFFF00] rounded-2xl flex items-center justify-center mb-6 shadow-2xl"><Scan className="text-black" size={32}/></div>
                            <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">Acquisition_Report</h2>
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] mt-4">Security verification complete. Assets transferred to local storage.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">{packQueue.map((item, i) => <MiniSummaryCard key={i} item={item} index={i} />)}</div>
                        <div className="flex justify-center"><button onClick={() => setStage('IDLE')} className="px-12 py-5 bg-zinc-900 border border-white/5 rounded-2xl text-white font-black uppercase tracking-[0.3em] text-xs italic hover:bg-white hover:text-black transition-all flex items-center gap-4 shadow-2xl">Return_to_Terminal <RotateCcw size={16}/></button></div>
                    </div>
                </div>
            )}
        </div>
    );
};