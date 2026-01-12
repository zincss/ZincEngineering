'use client'

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    Layers, Grid3X3, Info, Lock, Zap, CarFront, Loader2, X, Sparkles, Trophy, 
    RotateCcw, Crown, Scan, Check, Play, ShoppingBag, Cpu
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { REEL_ITEMS_SOURCE, CAR_PACK_SOURCE, GRIDIRON_PACK_SOURCE, BasePackIcon, ItemImage } from './shared';
import { TradingCard } from './TradingCard';

const WALKOUT_RARITIES = ['SUPER_RARE', 'ULTRA', 'ZENITH'];

const getHypeConfig = (rarity: string) => {
    switch (rarity) {
        case 'ZENITH': return { color: '#DFFF00', label: 'Zenith', icon: Crown, bg: 'bg-[#DFFF00]' };
        case 'ULTRA': return { color: '#A855F7', label: 'Ultra Rare', icon: Sparkles, bg: 'bg-purple-600' };
        case 'SUPER_RARE': return { color: '#F97316', label: 'Super Rare', icon: Zap, bg: 'bg-orange-500' };
        default: return null;
    }
};

const CardBack = ({ config }: { config: any }) => (
    <div className="w-full h-full rounded-2xl bg-zinc-900 border-2 border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
        <div className={`w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700`}>
            <config.icon size={40} className="text-zinc-500" />
        </div>
        <div className="font-bold text-zinc-600 uppercase tracking-widest text-xs">Zinc</div>
    </div>
);

const MiniSummaryCard = ({ item, index }: { item: any, index: number }) => {
    const isRare = WALKOUT_RARITIES.includes(item.rarity);
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border ${isRare ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'border-zinc-800'} group`}>
            <ItemImage name={item.name} searchQuery={item.searchQuery || item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-3">
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isRare ? 'text-yellow-400' : 'text-zinc-500'} mb-0.5`}>{item.rarity.replace('_', ' ')}</div>
                <div className="text-xs font-bold text-white leading-tight truncate">{item.name}</div>
            </div>
        </motion.div>
    );
};

const FoilPack = ({ config, isSelected }: { config: any, isSelected: boolean }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);
    const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isSelected) return;
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            x.set((e.clientX - rect.left) / rect.width - 0.5);
            y.set((e.clientY - rect.top) / rect.height - 0.5);
        }
    };

    return (
        <motion.div
            ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ perspective: 1000, transformStyle: "preserve-3d", rotateX: isSelected ? rotateX : 0, rotateY: isSelected ? rotateY : 0 }}
            className={`relative w-64 h-96 shrink-0 transition-all duration-300 ${isSelected ? 'scale-105 z-10' : 'scale-90 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}
        >
            <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-white/10 flex flex-col items-center justify-between p-6 ${isSelected ? 'ring-2 ring-white/20' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black z-0" />
                
                {/* Pack Art */}
                <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full">
                     <div className={`w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-6 shadow-lg border border-white/5`}>
                        <config.icon size={48} style={{ color: config.color }} />
                     </div>
                     <h3 className="text-3xl font-black uppercase text-white tracking-tight text-center leading-none mb-2">{config.label}</h3>
                     <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{config.name}</p>
                </div>

                <div className="relative z-10 w-full pt-6 border-t border-white/10 text-center">
                    <span className="text-lg font-bold text-white">{config.cost} Credits</span>
                </div>

                {/* Glare */}
                {isSelected && (
                    <motion.div 
                        style={{ background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.0) 50%)`, backgroundSize: '200% 200%', backgroundPosition: glareX }}
                        className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
                    />
                )}
            </div>
        </motion.div>
    );
};

const HoldButton = ({ onComplete, disabled, loading, cost }: any) => {
    const [holding, setHolding] = useState(false);
    const progress = useMotionValue(0);
    const fill = useTransform(progress, [0, 100], ["0%", "100%"]);
    const intervalRef = useRef<any>(null);

    const startHold = () => {
        if (disabled || loading) return;
        setHolding(true);
        let p = 0;
        intervalRef.current = setInterval(() => {
            p += 3; 
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
            className={`relative w-full py-6 rounded-xl overflow-hidden font-bold uppercase tracking-wider text-sm transition-all select-none ${disabled ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'}`}
        >
            <motion.div style={{ width: fill }} className="absolute inset-0 bg-[#DFFF00] origin-left" />
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18}/> : <ShoppingBag size={18}/>}
                {loading ? 'Processing...' : holding ? 'Hold to Confirm...' : `Hold to Buy (${cost} CR)`}
            </span>
        </button>
    );
};

export const PackOpeningView = ({ user, profile, authLoading, refreshProfile }: any) => {
    const supabase = createClient();
    const [stage, setStage] = useState<'IDLE' | 'OPENING' | 'REVEAL' | 'SUMMARY'>('IDLE');
    const [packQueue, setPackQueue] = useState<any[]>([]); 
    const [currentCardIndex, setCurrentCardIndex] = useState(0); 
    const [isCardFlipped, setIsCardFlipped] = useState(false); 
    const [selectedPack, setSelectedPack] = useState<'BASE' | 'CARS' | 'GRIDIRON' | 'TEST'>('BASE');
    const [packQuantity, setPackQuantity] = useState<1 | 3>(1);
    const [error, setError] = useState('');

    const PACK_CONFIG = {
        BASE: { cost: 100, name: 'Series 1', label: 'Standard Pack', icon: BasePackIcon, source: REEL_ITEMS_SOURCE, color: '#DFFF00', desc: "Contains 5 mixed items." },
        CARS: { cost: 250, name: 'Turbo Series', label: 'Car Pack', icon: CarFront, source: CAR_PACK_SOURCE, color: '#ef4444', desc: "Guaranteed 1 Rare vehicle." },
        GRIDIRON: { cost: 300, name: 'Legends', label: 'NFL Pack', icon: Trophy, source: GRIDIRON_PACK_SOURCE, color: '#3b82f6', desc: "Chance for Legendary players." },
        TEST: { cost: 9999, name: 'Debug', label: 'Test Pack', icon: Cpu, source: REEL_ITEMS_SOURCE, color: '#ff00ff', desc: "Developer use only." }
    };

    const currentConfig = PACK_CONFIG[selectedPack];
    const cost = packQuantity * currentConfig.cost;
    const canAfford = (profile?.credits || 0) >= cost;
    const isReady = !authLoading && user;

    const handleOpenPack = async () => {
        if (authLoading || !profile || profile.credits < cost) return;
        setStage('OPENING'); setError(''); setPackQueue([]); setCurrentCardIndex(0); setIsCardFlipped(false);
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
            
            // "Opening" animation duration
            setTimeout(() => {
                setStage('REVEAL');
            }, 2500); 

        } catch (err: any) { setError(err.message || "Purchase failed"); setStage('IDLE'); }
    };

    const nextCard = () => {
        if (!isCardFlipped) {
            setIsCardFlipped(true);
        } else if (currentCardIndex < packQueue.length - 1) {
            setIsCardFlipped(false);
            setTimeout(() => setCurrentCardIndex(prev => prev + 1), 200);
        } else {
            setStage('SUMMARY');
        }
    };

    return (
        <div className="w-full relative min-h-[600px] flex flex-col items-center">
            
            {/* IDLE STATE - PACK SELECTION */}
            {stage === 'IDLE' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center max-w-6xl">
                    <div className="flex gap-8 overflow-x-auto w-full py-12 px-4 justify-center items-center no-scrollbar">
                        {Object.keys(PACK_CONFIG).map((id) => (
                            <div key={id} onClick={() => setSelectedPack(id as any)} className="cursor-pointer">
                                <FoilPack config={PACK_CONFIG[id as keyof typeof PACK_CONFIG]} isSelected={selectedPack === id} />
                            </div>
                        ))}
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl w-full max-w-lg shadow-2xl">
                         <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black uppercase text-white tracking-tight">{currentConfig.label}</h2>
                                <p className="text-sm text-zinc-400 mt-1">{currentConfig.desc}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Price</div>
                                <div className="text-xl font-bold text-white">{currentConfig.cost} CR</div>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-8">
                             {[1, 3].map(qty => (
                                <button key={qty} onClick={() => setPackQuantity(qty as 1|3)} className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${packQuantity === qty ? 'bg-zinc-800 border-white/20 text-white' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                                    {qty === 1 ? '1 Pack' : '3 Packs'}
                                </button>
                             ))}
                        </div>

                        <HoldButton onComplete={handleOpenPack} disabled={!isReady || !canAfford} loading={authLoading} cost={cost} />
                        
                        {!canAfford && <div className="mt-4 text-center text-red-500 text-xs font-bold uppercase tracking-wider">Insufficient Credits</div>}
                    </div>
                </motion.div>
            )}

            {/* OPENING ANIMATION */}
            {stage === 'OPENING' && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 0.8, 1.5], 
                            rotate: [0, -5, 5, 0],
                            opacity: [1, 1, 1, 0] 
                        }} 
                        transition={{ duration: 2, times: [0, 0.4, 0.8, 1] }}
                        className="relative"
                    >
                         <div className="w-64 h-96 bg-zinc-900 rounded-2xl border-2 border-white/10 flex items-center justify-center shadow-2xl">
                            <currentConfig.icon size={64} className="text-white animate-pulse" />
                         </div>
                         <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1, scale: 2 }} 
                            transition={{ delay: 1.8, duration: 0.2 }}
                            className="absolute inset-0 bg-white rounded-full mix-blend-overlay blur-3xl"
                        />
                    </motion.div>
                </div>
            )}

            {/* CARD REVEAL */}
            {stage === 'REVEAL' && packQueue.length > 0 && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6" onClick={nextCard}>
                    <div className="text-center mb-8">
                        <h3 className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-2">Card {currentCardIndex + 1} of {packQueue.length}</h3>
                        <p className="text-white/50 text-sm">Tap to Reveal</p>
                    </div>

                    <div className="relative w-full max-w-sm aspect-[2/3] perspective-1000 cursor-pointer">
                        <motion.div 
                            animate={{ rotateY: isCardFlipped ? 180 : 0 }} 
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            className="w-full h-full relative preserve-3d"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* FRONT (Revealed Card) */}
                            <div className="absolute inset-0 backface-hidden" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                                <TradingCard item={packQueue[currentCardIndex]} isLocked={false} />
                            </div>

                            {/* BACK (Card Back) */}
                            <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                                <CardBack config={currentConfig} />
                            </div>
                        </motion.div>
                    </div>

                    {isCardFlipped && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                            <button className="px-8 py-3 bg-white text-black rounded-full font-bold uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors">
                                {currentCardIndex < packQueue.length - 1 ? 'Next Card' : 'Finish'}
                            </button>
                        </motion.div>
                    )}
                </div>
            )}

            {/* SUMMARY */}
            {stage === 'SUMMARY' && (
                <div className="w-full max-w-6xl">
                    <div className="flex flex-col items-center text-center mb-12">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                            <Check className="text-green-500" size={32} />
                        </div>
                        <h2 className="text-4xl font-black uppercase text-white tracking-tight mb-2">Pack Opened</h2>
                        <p className="text-zinc-400">Successfully added {packQueue.length} new items to your collection.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                        {packQueue.map((item, i) => (
                            <MiniSummaryCard key={i} item={item} index={i} />
                        ))}
                    </div>

                    <div className="flex justify-center gap-4">
                        <button onClick={() => setStage('IDLE')} className="px-8 py-3 bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-zinc-700 transition-colors">
                            Back to Market
                        </button>
                        <button onClick={() => { setStage('IDLE'); handleOpenPack(); }} className="px-8 py-3 bg-white text-black rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors">
                            Open Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
