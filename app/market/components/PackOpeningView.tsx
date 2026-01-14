'use client'

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    Layers, Grid3X3, Info, Lock, Zap, CarFront, Loader2, X, Sparkles, Trophy, 
    RotateCcw, Crown, Scan, Check, Play, ShoppingBag, Cpu, Flame, Radiation, 
    Hexagon, MonitorPlay, Shield
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion';
import { REEL_ITEMS_SOURCE, CAR_PACK_SOURCE, GRIDIRON_PACK_SOURCE, BasePackIcon } from './shared';
import { TradingCard } from './TradingCard';
import { GenerativeCardArt } from './GenerativeCardArt';

// --- CONFIGURATION ---

const WALKOUT_RARITIES = ['SUPER_RARE', 'ULTRA', 'ZENITH', 'COSMIC'];

const PACK_CONFIG = {
    BASE: { 
        id: 'BASE',
        cost: 100, 
        name: 'Series 1', 
        label: 'The Vault', 
        icon: Hexagon, 
        source: REEL_ITEMS_SOURCE, 
        desc: "Standard issue encrypted assets.",
        theme: {
            primary: '#DFFF00',
            secondary: '#18181b', // Zinc-950
            accent: 'rgba(223, 255, 0, 0.2)',
            bgGradient: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
            texture: 'url("https://grainy-gradients.vercel.app/noise.svg")',
            border: 'border-[#DFFF00]/30',
            packStyle: 'CYBER'
        }
    },
    CARS: { 
        id: 'CARS',
        cost: 250, 
        name: 'Turbo Series', 
        label: 'Speedster', 
        icon: CarFront, 
        source: CAR_PACK_SOURCE, 
        desc: "High performance automotive machinery.",
        theme: {
            primary: '#ef4444', // Red-500
            secondary: '#7f1d1d', // Red-900
            accent: 'rgba(239, 68, 68, 0.3)',
            bgGradient: 'linear-gradient(to bottom right, #2b0a0a, #000000)',
            texture: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 4px)', // Carbon-ish
            border: 'border-red-500/50',
            packStyle: 'RACING'
        }
    },
    GRIDIRON: { 
        id: 'GRIDIRON',
        cost: 300, 
        name: 'Legends', 
        label: 'Gridiron', 
        icon: Trophy, 
        source: GRIDIRON_PACK_SOURCE, 
        desc: "Legendary athletes from the league.",
        theme: {
            primary: '#3b82f6', // Blue-500
            secondary: '#1e3a8a', // Blue-900
            accent: 'rgba(59, 130, 246, 0.3)',
            bgGradient: 'radial-gradient(ellipse at top, #1e3a8a 0%, #000000 80%)', // Stadium lights feel
            texture: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px) 0 0/10px 10px', // Mesh
            border: 'border-blue-500/50',
            packStyle: 'SPORT'
        }
    }
};

const getHypeConfig = (rarity: string) => {
    switch (rarity) {
        case 'ZENITH': return { color: '#DFFF00', label: 'ZENITH RARE', icon: Crown, bg: 'bg-[#DFFF00]' };
        case 'COSMIC': return { color: '#EC4899', label: 'COSMIC RARE', icon: Sparkles, bg: 'bg-pink-500' };
        case 'ULTRA': return { color: '#A855F7', label: 'ULTRA RARE', icon: Radiation, bg: 'bg-purple-600' };
        case 'SUPER_RARE': return { color: '#F97316', label: 'SUPER RARE', icon: Flame, bg: 'bg-orange-500' };
        default: return { color: '#71717a', label: 'Standard', icon: Layers, bg: 'bg-zinc-500' };
    }
};

// --- COMPONENTS ---

// 1. Themed Pack Component
const ThemedPack = ({ config, isSelected, onClick }: { config: any, isSelected: boolean, onClick: () => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Mouse Interaction for 3D Tilt
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleMouseLeave = () => { x.set(0); y.set(0); };

    const rotateX = useTransform(useSpring(y, { stiffness: 300, damping: 30 }), [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(useSpring(x, { stiffness: 300, damping: 30 }), [-0.5, 0.5], ["-15deg", "15deg"]);
    const brightness = useTransform(useSpring(y, { stiffness: 300, damping: 30 }), [-0.5, 0.5], [1.2, 0.8]);

    return (
        <motion.div
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
                perspective: 1000, 
                rotateX: isSelected ? rotateX : 0, 
                rotateY: isSelected ? rotateY : 0,
                scale: isSelected ? 1.05 : 0.9,
                opacity: isSelected ? 1 : 0.6,
                filter: isSelected ? 'grayscale(0%)' : 'grayscale(100%) blur(1px)',
                zIndex: isSelected ? 10 : 1
            }}
            className="relative w-72 h-[420px] cursor-pointer transition-all duration-500 ease-out preserve-3d group"
        >
            {/* PACK SHAPE */}
            <motion.div 
                className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border-2"
                style={{ 
                    borderColor: config.theme.primary,
                    boxShadow: isSelected ? `0 20px 50px -10px ${config.theme.primary}60` : 'none',
                    background: config.theme.secondary
                }}
            >
                {/* --- STYLE VARIATIONS --- */}
                
                {/* 1. CYBER (BASE) STYLE */}
                {config.theme.packStyle === 'CYBER' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-6">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:4px_4px]" />
                        
                        <div className="relative z-10 w-full flex justify-between items-center border-b border-[#DFFF00]/30 pb-4">
                            <span className="font-mono text-[10px] text-[#DFFF00] tracking-widest">SERIES.01</span>
                            <Hexagon size={16} className="text-[#DFFF00] animate-pulse" />
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                                className="w-32 h-32 rounded-full border border-[#DFFF00]/50 flex items-center justify-center mb-4 relative"
                            >
                                <div className="absolute inset-0 border border-[#DFFF00] rounded-full border-t-transparent animate-spin" />
                                <config.icon size={48} className="text-[#DFFF00]" />
                            </motion.div>
                            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter shadow-black drop-shadow-lg">
                                THE VAULT
                            </h2>
                        </div>
                        
                        <div className="relative z-10 w-full text-center border-t border-[#DFFF00]/30 pt-4">
                            <div className="bg-[#DFFF00]/20 text-[#DFFF00] text-xs font-black uppercase py-1 px-3 rounded-full inline-block">
                                Encrypted
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. RACING (CARS) STYLE */}
                {config.theme.packStyle === 'RACING' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 overflow-hidden">
                         <div className="absolute inset-0 bg-zinc-900" />
                         {/* Carbon Fiberish */}
                         <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#333 15%, transparent 16%)', backgroundSize: '8px 8px' }} />
                         
                         {/* Racing Stripes */}
                         <div className="absolute top-0 bottom-0 left-8 w-12 bg-red-600 transform -skew-x-12 opacity-80" />
                         <div className="absolute top-0 bottom-0 left-24 w-4 bg-white transform -skew-x-12 opacity-80" />

                         <div className="relative z-10 w-full flex justify-end">
                            <span className="bg-red-600 text-white font-black italic px-3 py-1 text-xs skew-x-[-12deg]">
                                TURBO
                            </span>
                         </div>

                         <div className="relative z-10 flex flex-col items-center transform skew-x-[-6deg]">
                            <CarFront size={80} className="text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] mb-2" />
                            <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none stroke-black" style={{ WebkitTextStroke: '1px black' }}>
                                SPEED
                                <span className="text-red-500 block">STER</span>
                            </h2>
                         </div>

                         <div className="relative z-10 w-full flex justify-between items-end">
                             <div className="flex flex-col">
                                 <span className="text-[9px] text-zinc-400 font-bold uppercase">Class A</span>
                                 <span className="text-[9px] text-zinc-400 font-bold uppercase">Imports</span>
                             </div>
                             <div className="text-4xl font-black italic text-white/20">01</div>
                         </div>
                    </div>
                )}

                {/* 3. SPORT (NFL) STYLE */}
                {config.theme.packStyle === 'SPORT' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 bg-blue-900">
                         {/* Mesh Texture */}
                         <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2.5px)', backgroundSize: '12px 12px' }} />
                         
                         {/* Stadium Lights Glow */}
                         <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/30 to-transparent blur-xl" />

                         <div className="relative z-10 w-full flex justify-center border-b-2 border-yellow-400 pb-2 mb-4">
                             <div className="flex items-center gap-2">
                                <Trophy size={16} className="text-yellow-400" />
                                <span className="font-black text-xs uppercase text-yellow-400 tracking-widest">Legends</span>
                                <Trophy size={16} className="text-yellow-400" />
                             </div>
                         </div>

                         <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                             <div className="relative">
                                 <Shield size={120} className="text-blue-950 fill-blue-800 stroke-yellow-400 stroke-2 drop-shadow-xl" />
                                 <div className="absolute inset-0 flex items-center justify-center">
                                     <span className="text-5xl font-black text-white drop-shadow-md">NFL</span>
                                 </div>
                             </div>
                             <h2 className="text-3xl font-black uppercase text-white tracking-tight mt-4 drop-shadow-lg">
                                 GRIDIRON
                             </h2>
                         </div>

                         <div className="relative z-10 w-full bg-blue-950/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 text-center">
                             <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-wider">Official Licensed Product</span>
                         </div>
                    </div>
                )}
                
                {/* SHARED REFLECTION */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none mix-blend-overlay" />
            </motion.div>
        </motion.div>
    );
};

// 2. Card Back with Shared Logic but Theme Props
const CardBack = ({ config, shaking, intensity }: any) => {
    return (
        <motion.div 
            animate={shaking ? { x: [-2, 2, -2, 2, 0], rotate: [-1, 1, -1, 1, 0] } : {}}
            transition={{ duration: 0.2, repeat: shaking ? Infinity : 0 }}
            className="w-full h-full rounded-[1.5rem] relative overflow-hidden flex flex-col items-center justify-center shadow-2xl border-4"
            style={{ 
                backgroundColor: config.theme.secondary,
                borderColor: intensity === 'HIGH' ? '#fff' : config.theme.primary 
            }}
        >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: config.theme.texture }} />
            
            <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative z-10 p-6 rounded-full border-2 bg-black/40 backdrop-blur-md"
                style={{ borderColor: config.theme.primary }}
            >
                <config.icon size={48} style={{ color: config.theme.primary }} />
            </motion.div>

            <div className="mt-8 font-black uppercase tracking-[0.3em] text-[10px] z-10 text-center opacity-80" style={{ color: config.theme.primary }}>
                {config.label}
                <div className="text-[8px] opacity-50 mt-1 text-white">Zinc Protocols</div>
            </div>
        </motion.div>
    );
};

// 3. Mini Summary
const MiniSummaryCard = ({ item, index }: { item: any, index: number }) => {
    const isRare = WALKOUT_RARITIES.includes(item.rarity);
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border ${isRare ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'border-zinc-800'} group`}>
            <GenerativeCardArt name={item.name} type={item.type} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-3">
                <div className={`text-[9px] font-black uppercase tracking-wider ${isRare ? 'text-yellow-400' : 'text-zinc-500'} mb-1`}>{item.rarity.replace('_', ' ')}</div>
                <div className="text-[10px] font-bold text-white leading-tight truncate">{item.name}</div>
            </div>
        </motion.div>
    );
};

// 4. Hold Button
const HoldButton = ({ onComplete, disabled, loading, cost, theme }: any) => {
    const [holding, setHolding] = useState(false);
    const progress = useMotionValue(0);
    const fill = useTransform(progress, [0, 100], ["0%", "100%"]);
    const intervalRef = useRef<any>(null);

    const startHold = () => {
        if (disabled || loading) return;
        setHolding(true);
        let p = 0;
        intervalRef.current = setInterval(() => {
            p += 2; 
            progress.set(p);
            if (p >= 100) {
                clearInterval(intervalRef.current);
                onComplete();
                setHolding(false);
                progress.set(0);
            }
        }, 16);
    };

    const stopHold = () => {
        setHolding(false);
        progress.set(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    return (
        <button
            onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={startHold} onTouchEnd={stopHold}
            disabled={disabled}
            className={`relative w-full py-6 rounded-xl overflow-hidden font-black uppercase tracking-widest text-xs italic transition-all select-none group ${disabled ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98]'}`}
        >
            <motion.div style={{ width: fill, backgroundColor: theme.primary }} className="absolute inset-0 origin-left" />
            <span className="relative z-10 flex items-center justify-center gap-3 mix-blend-difference text-white">
                {loading ? <Loader2 className="animate-spin" size={16}/> : (holding ? <Scan size={18} className="animate-pulse" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />)}
                {loading ? 'Processing...' : holding ? 'HOLD TO RIP' : `HOLD TO PURCHASE (${cost} CR)`}
            </span>
        </button>
    );
};

// --- MAIN VIEW ---

export const PackOpeningView = ({ user, profile, authLoading, refreshProfile }: any) => {
    const supabase = createClient();
    const [stage, setStage] = useState<'IDLE' | 'OPENING' | 'REVEAL' | 'WALKOUT' | 'SUMMARY'>('IDLE');
    const [packQueue, setPackQueue] = useState<any[]>([]); 
    const [currentCardIndex, setCurrentCardIndex] = useState(0); 
    const [isCardFlipped, setIsCardFlipped] = useState(false); 
    const [teasing, setTeasing] = useState(false);
    
    // Default to base
    const [selectedPackKey, setSelectedPackKey] = useState<keyof typeof PACK_CONFIG>('BASE');
    const [packQuantity, setPackQuantity] = useState<1 | 3>(1);
    const [error, setError] = useState('');

    const currentConfig = PACK_CONFIG[selectedPackKey];
    const cost = packQuantity * currentConfig.cost;
    const canAfford = (profile?.credits || 0) >= cost;
    const isReady = !authLoading && user;

    // --- ACTIONS ---

    const handleOpenPack = async () => {
        if (authLoading || !profile || profile.credits < cost) return;
        setStage('OPENING'); setError(''); setPackQueue([]); setCurrentCardIndex(0); setIsCardFlipped(false); setTeasing(false);
        
        try {
            const { error: txError } = await supabase.rpc('add_credits', { amount: -cost });
            if (txError) throw txError;
            
            const generatedItems: any[] = [];
            const count = packQuantity * 5; 
            
            for (let i = 0; i < count; i++) {
                const rand = Math.random() * 100;
                let rarity = 'COMMON';
                // Weighted Logic
                if (rand <= 0.1) rarity = 'ZENITH'; 
                else if (rand <= 1.0) rarity = 'ULTRA'; 
                else if (rand <= 5.0) rarity = 'SUPER_RARE'; 
                else if (rand <= 20.0) rarity = 'RARE'; 
                else if (rand <= 50.0) rarity = 'UNCOMMON';
                
                const pool = currentConfig.source.filter((item: any) => item.rarity === rarity);
                const sourcePool = pool.length > 0 ? pool : currentConfig.source;
                const wonItem = sourcePool[Math.floor(Math.random() * sourcePool.length)];
                
                generatedItems.push({ ...wonItem, rarity, uniqueId: Math.random().toString() });
            }
            
            setPackQueue(generatedItems); 
            refreshProfile();
            
            // Wait for rip animation (Shortened for punchiness)
            setTimeout(() => {
                setStage('REVEAL');
                checkTease(0, generatedItems);
            }, 1800); 

        } catch (err: any) { setError(err.message || "Purchase failed"); setStage('IDLE'); }
    };

    const checkTease = (index: number, items: any[]) => {
        const item = items[index];
        setTeasing(WALKOUT_RARITIES.includes(item.rarity));
    };

    const revealCard = () => {
        const currentItem = packQueue[currentCardIndex];
        if (teasing) {
            setStage('WALKOUT');
            setTimeout(() => {
                setStage('REVEAL');
                setTeasing(false);
                setIsCardFlipped(true); 
            }, 4000); 
        } else {
            setIsCardFlipped(true);
        }
    };

    const nextCard = () => {
        if (!isCardFlipped) {
            revealCard();
        } else if (currentCardIndex < packQueue.length - 1) {
            setIsCardFlipped(false);
            const nextIdx = currentCardIndex + 1;
            setCurrentCardIndex(nextIdx);
            checkTease(nextIdx, packQueue);
        } else {
            setStage('SUMMARY');
        }
    };

    return (
        <div className="w-full relative min-h-[800px] flex flex-col items-center justify-center transition-colors duration-1000"
             style={{ background: currentConfig.theme.bgGradient }}>
            
            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 opacity-30 pointer-events-none transition-all duration-1000" 
                 style={{ backgroundImage: currentConfig.theme.texture }} />
            
            {/* IDLE STATE: PACK SELECTION CAROUSEL */}
            {stage === 'IDLE' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col items-center justify-center z-10 py-12">
                    
                    {/* Pack Showcase */}
                    <div className="flex gap-12 items-center justify-center mb-16 perspective-1000">
                        {Object.values(PACK_CONFIG).map((pack) => (
                            <div key={pack.id} className="relative group">
                                {selectedPackKey === pack.id && (
                                    <motion.div layoutId="selection-glow" className="absolute inset-0 blur-3xl opacity-40 -z-10" style={{ backgroundColor: pack.theme.primary }} />
                                )}
                                <ThemedPack 
                                    config={pack} 
                                    isSelected={selectedPackKey === pack.id} 
                                    onClick={() => setSelectedPackKey(pack.id as any)} 
                                />
                            </div>
                        ))}
                    </div>

                    {/* Details Panel */}
                    <div className="w-full max-w-xl bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: currentConfig.theme.primary }} />
                         
                         <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-4xl font-black italic uppercase text-white tracking-tight mb-2">{currentConfig.label}</h1>
                                <p className="text-sm font-mono text-zinc-400 max-w-xs leading-relaxed">{currentConfig.desc}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Unit Price</div>
                                <div className="text-3xl font-black italic" style={{ color: currentConfig.theme.primary }}>{currentConfig.cost} CR</div>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-8">
                             {[1, 3].map(qty => (
                                <button key={qty} onClick={() => setPackQuantity(qty as 1|3)} className={`flex-1 py-4 rounded-xl border font-black uppercase text-xs tracking-widest transition-all ${packQuantity === qty ? `bg-zinc-800 border-white/20 text-white shadow-lg` : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>
                                    {qty === 1 ? 'Single Pack' : '3x Bundle'}
                                </button>
                             ))}
                        </div>

                        <HoldButton onComplete={handleOpenPack} disabled={!isReady || !canAfford} loading={authLoading} cost={cost} theme={currentConfig.theme} />
                        
                        {!canAfford && <div className="mt-4 text-center text-red-500 text-[10px] font-mono uppercase tracking-widest animate-pulse">Insufficient Credits</div>}
                    </div>
                </motion.div>
            )}

            {/* ANIMATION STAGES (RIP, REVEAL, SUMMARY) reuse similar logic but styled with theme */}
            
            {/* OPENING (WARP/BREACH) */}
            {stage === 'OPENING' && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-0 bg-black"
                    />
                    
                    {/* Warp Tunnel Effect */}
                    <div className="absolute inset-0 flex items-center justify-center perspective-1000">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0, z: -1000 }}
                                animate={{ scale: 20, opacity: [0, 1, 0], z: 1000 }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    delay: i * 0.2, 
                                    ease: "linear"
                                }}
                                className="absolute w-[500px] h-[500px] border-[20px] rounded-full opacity-0"
                                style={{ borderColor: currentConfig.theme.primary }}
                            />
                        ))}
                    </div>

                    {/* Pack Breach Animation */}
                    <motion.div 
                        initial={{ scale: 1, y: 0, rotate: 0 }}
                        animate={{ 
                            scale: [1, 0.8, 50], // Shrink then explode into camera
                            rotate: [0, -5, 5, -5, 5, 0], // Violent shake
                            opacity: [1, 1, 0] 
                        }} 
                        transition={{ 
                            duration: 1.8, 
                            times: [0, 0.5, 1],
                            ease: "anticipate" 
                        }}
                        className="relative z-10"
                    >
                         <div className="relative w-72 h-[420px] rounded-3xl bg-zinc-900 border-4 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]" style={{ borderColor: currentConfig.theme.primary }}>
                             <div className="absolute inset-0 bg-black opacity-90" />
                             
                             {/* Glowing Core */}
                             <motion.div 
                                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.2, repeat: Infinity }}
                                className="absolute inset-0 bg-white mix-blend-overlay blur-xl"
                             />

                             <div className="absolute inset-0 flex items-center justify-center">
                                <currentConfig.icon size={120} className="text-white relative z-10" />
                             </div>
                         </div>
                    </motion.div>

                    {/* Flashbang */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0, 1, 0] }}
                        transition={{ duration: 1.8, times: [0, 0.9, 0.95, 1] }}
                        className="absolute inset-0 bg-white z-50 pointer-events-none"
                    />
                </div>
            )}

            {/* WALKOUT */}
            {stage === 'WALKOUT' && packQueue[currentCardIndex] && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden perspective-1000">
                    {(() => {
                        const hype = getHypeConfig(packQueue[currentCardIndex].rarity);
                        return (
                            <>
                                <motion.div 
                                    initial={{ scale: 1, opacity: 0 }} 
                                    animate={{ scale: 2, opacity: 0.4 }} 
                                    transition={{ duration: 4, ease: "easeOut" }}
                                    className={`absolute inset-0 ${hype.bg} blur-[150px] mix-blend-screen`} 
                                />
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0 }} 
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, type: 'spring' }}
                                    className="relative z-10 flex flex-col items-center"
                                >
                                    <hype.icon size={180} className="text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] mb-8" />
                                    <h1 className="text-8xl md:text-9xl font-black italic uppercase text-white tracking-tighter text-center" 
                                        style={{ textShadow: `0 0 100px ${hype.color}` }}>
                                        {hype.label}
                                    </h1>
                                </motion.div>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* REVEAL */}
            {stage === 'REVEAL' && packQueue.length > 0 && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6" onClick={nextCard}>
                    <div className="relative w-full max-w-sm aspect-[2/3] perspective-1000 cursor-pointer">
                        <motion.div 
                            animate={{ rotateY: isCardFlipped ? 180 : 0 }} 
                            transition={{ duration: isCardFlipped ? 0.6 : 0.2, type: "spring", stiffness: 200, damping: 20 }}
                            className="w-full h-full relative preserve-3d"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="absolute inset-0 backface-hidden" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                                <TradingCard item={packQueue[currentCardIndex]} isLocked={false} />
                            </div>
                            <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                                <CardBack 
                                    config={currentConfig} 
                                    shaking={teasing} 
                                    intensity={WALKOUT_RARITIES.includes(packQueue[currentCardIndex].rarity) ? 'HIGH' : 'LOW'} 
                                />
                            </div>
                        </motion.div>
                        
                        <div className="mt-12 text-center">
                            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">
                                {isCardFlipped ? 'TAP TO CONTINUE' : 'TAP TO REVEAL'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* SUMMARY */}
            {stage === 'SUMMARY' && (
                <div className="fixed inset-0 z-40 bg-black overflow-y-auto">
                    <div className="w-full max-w-7xl mx-auto pt-24 px-6 pb-24">
                        <div className="text-center mb-16">
                            <h2 className="text-6xl font-black uppercase italic text-white tracking-tighter mb-4">Acquisition Report</h2>
                            <p className="text-zinc-500 font-mono uppercase tracking-widest text-xs">Items transferred to inventory</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-16">
                            {packQueue.map((item, i) => (
                                <MiniSummaryCard key={i} item={item} index={i} />
                            ))}
                        </div>
                        <div className="flex justify-center gap-6">
                            <button onClick={() => setStage('IDLE')} className="px-12 py-5 bg-zinc-900 border border-zinc-800 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800">
                                Back to Market
                            </button>
                            <button onClick={() => { setStage('IDLE'); handleOpenPack(); }} className="px-12 py-5 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                Buy Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};