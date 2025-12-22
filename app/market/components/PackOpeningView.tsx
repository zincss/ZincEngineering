'use client'

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    Layers, Grid3X3, Info, Lock, Zap, CarFront, Loader2, X, Sparkles, Cpu, 
    RotateCcw, Trophy, AlertTriangle, Siren, Radiation, Fingerprint, Crown, Scan, 
    Signal, Radio, Disc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { REEL_ITEMS_SOURCE, CAR_PACK_SOURCE, GRIDIRON_PACK_SOURCE, BasePackIcon, ItemImage } from './shared';
import { TradingCard } from './TradingCard';

// --- CONFIGURATION: WALKOUT TIERS ---
// Common/Uncommon/Rare = No Walkout (Tier 1)
// Super Rare+ = Tier 3 (Alarm/Chaos + Cinematic Reveal)

// UPDATED: Removed 'RARE' so only Super Rare and above get the animation
const WALKOUT_RARITIES = ['SUPER_RARE', 'ULTRA', 'ZENITH'];

const getHypeConfig = (rarity: string) => {
    switch (rarity) {
        case 'ZENITH': return { 
            tier: 3,
            color: '#DFFF00', 
            label: 'ZENITH CLASS', 
            icon: Crown, 
            detectText: 'OMEGA LEVEL EVENT',
            revealText: 'MYTHIC ARTIFACT',
            bg: 'bg-yellow-500'
        };
        case 'ULTRA': return { 
            tier: 3,
            color: '#A855F7', 
            label: 'OMEGA CLASS', 
            icon: Radiation, 
            detectText: 'CRITICAL ANOMALY',
            revealText: 'ULTRA RARE ASSET',
            bg: 'bg-purple-600'
        };
        case 'SUPER_RARE': return { 
            tier: 3,
            color: '#F97316', 
            label: 'SIGMA CLASS', 
            icon: Zap, 
            detectText: 'SECURITY BREACH',
            revealText: 'HIGH VOLTAGE SIGNATURE',
            bg: 'bg-orange-500'
        };
        // RARE Removed from config as it no longer triggers hype
        default: return null;
    }
};

// --- VISUAL: CARD BACK ---
const CardBack = ({ config }: { config: any }) => (
    <div className="w-full h-full rounded-3xl bg-zinc-950 border-4 border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '16px 16px' }} 
        />
        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center bg-zinc-900 z-10 shadow-lg`} style={{ borderColor: config.color }}>
            <config.icon size={48} style={{ color: config.color }} />
        </div>
        <div className="mt-6 font-black uppercase text-zinc-600 tracking-[0.3em] text-xs z-10 flex flex-col items-center gap-1">
            <span>ZINC</span>
            <span style={{ color: config.color }}>ASSET_PACK</span>
        </div>
        <div className="absolute top-0 left-0 w-full h-2 bg-zinc-800" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-zinc-800" />
    </div>
);

// --- COMPONENT: MINI SUMMARY CARD ---
const MiniSummaryCard = ({ item, index }: { item: any, index: number }) => {
    const isRare = ['RARE', 'SUPER_RARE', 'ULTRA', 'ZENITH'].includes(item.rarity);
    const borderColor = isRare ? 'border-[#DFFF00]' : 'border-zinc-800';
    const textColor = isRare ? 'text-[#DFFF00]' : 'text-zinc-500';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border ${borderColor} shadow-lg group`}
        >
            <ItemImage name={item.name} searchQuery={item.searchQuery || item.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-3">
                <div className={`text-[8px] font-mono font-black uppercase tracking-widest ${textColor} mb-0.5`}>
                    {item.rarity}
                </div>
                <div className="text-xs font-bold text-white uppercase leading-tight truncate">
                    {item.name}
                </div>
            </div>
        </motion.div>
    );
};

// --- COMPONENT: CINEMATIC SUSPENSE OVERLAY ---
const HypeOverlay = ({ rarity, item }: { rarity: string, item: any }) => {
    const config = getHypeConfig(rarity);
    const [phase, setPhase] = useState<'DETECTING' | 'IDENTIFIED' | 'REVEALED'>('DETECTING');
    
    // Timing Configuration
    const detectDuration = 2000;
    const identifyDuration = 1500;

    useEffect(() => {
        // Phase 1 -> 2: Detecting to Identified
        const timer1 = setTimeout(() => {
            setPhase('IDENTIFIED');
        }, detectDuration);

        // Phase 2 -> 3: Identified to Card Reveal
        const timer2 = setTimeout(() => {
            setPhase('REVEALED');
        }, detectDuration + identifyDuration);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [detectDuration, identifyDuration]);

    if (!config) return null;

    const isDetecting = phase === 'DETECTING';
    const isRevealed = phase === 'REVEALED';
    const isHighTier = true; // All remaining walkouts are high tier

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Background: Pulsing */}
            <motion.div 
                animate={{ 
                    opacity: isDetecting ? [0.1, 0.3, 0.1] : 0.2,
                    backgroundColor: isDetecting 
                        ? '#ef4444' // Red for Alarm
                        : config.color
                }}
                transition={{ duration: isDetecting ? 0.5 : 1, repeat: isDetecting ? Infinity : 0 }}
                className="absolute inset-0 z-0"
            />
            
            {/* Rotating Radar/Scanlines */}
            {!isRevealed && (
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,${isDetecting ? '#fff' : config.color}_0%,transparent_60%)] z-0`}
                />
            )}

            {/* --- PHASE 3: THE CINEMATIC CARD REVEAL --- */}
            <AnimatePresence>
                {isRevealed && (
                    <motion.div 
                        initial={{ scale: 0.2, opacity: 0, rotateY: 180 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        transition={{ type: "spring", damping: 12, stiffness: 100 }}
                        className="relative z-50 perspective-1000"
                    >
                         {/* Flash Effect */}
                        <motion.div 
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ opacity: 0, scale: 2 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-white rounded-3xl z-50 pointer-events-none"
                        />
                        
                        {/* The Card */}
                        <div className="w-[300px] aspect-[2/3] shadow-2xl relative">
                            <div className={`absolute inset-0 bg-${config.color} blur-3xl opacity-50 animate-pulse`} style={{ backgroundColor: config.color }} />
                            <TradingCard item={item} />
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-center mt-8"
                        >
                            <h2 
                                className="text-4xl font-black italic uppercase text-white tracking-tighter"
                                style={{ textShadow: `0 0 40px ${config.color}` }}
                            >
                                {item.name}
                            </h2>
                            <div className="text-white/60 font-mono text-sm tracking-widest mt-2 uppercase">
                                {config.label} ACQUIRED
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* --- PHASE 1 & 2: SCANNER UI --- */}
            {!isRevealed && (
                <div className="relative z-10 flex flex-col items-center gap-8 p-6">
                    {/* ICON CONTAINER */}
                    <div className="relative">
                        {/* Rings */}
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.5, 1],
                                borderColor: isDetecting ? '#ef4444' : config.color,
                                opacity: [1, 0, 1]
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border-2"
                        />
                        
                        <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ 
                                scale: isDetecting ? [0.9, 1.1, 0.9] : 1.2,
                                borderColor: isDetecting ? '#ef4444' : config.color,
                                backgroundColor: isDetecting ? '#000' : 'rgba(0,0,0,0.5)'
                            }}
                            transition={{ duration: 0.2 }}
                            className="w-40 h-40 rounded-full border-4 flex items-center justify-center backdrop-blur-sm relative overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                {isDetecting ? (
                                    <motion.div 
                                        key="detecting"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0 }}
                                    >
                                        <Scan size={64} className="text-red-500 animate-pulse" />
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="found"
                                        initial={{ scale: 0, rotate: 180 }} 
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", bounce: 0.5 }}
                                    >
                                        <config.icon size={80} style={{ color: config.color }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* TEXT CONTAINER */}
                    <div className="text-center space-y-4">
                        <motion.div 
                            className="flex items-center gap-3 justify-center"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            {isDetecting ? (
                                <>
                                    <AlertTriangle size={20} className="text-red-500" />
                                    <span className="text-red-500 font-mono text-sm uppercase tracking-[0.3em] font-bold">
                                        {config.detectText}
                                    </span>
                                    <AlertTriangle size={20} className="text-red-500" />
                                </>
                            ) : (
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <span style={{ color: config.color }} className="font-mono text-sm uppercase tracking-[0.3em] font-bold">{config.label}</span>
                                </motion.div>
                            )}
                        </motion.div>

                        <div className="h-16 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {isDetecting ? (
                                    <motion.h2 
                                        key="text-scan"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
                                        className="text-4xl md:text-5xl font-black uppercase text-white/20 tracking-tighter"
                                    >
                                        SCANNING...
                                    </motion.h2>
                                ) : (
                                    <motion.h2 
                                        key="text-found"
                                        initial={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
                                        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                                        className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter"
                                        style={{ textShadow: `0 0 40px ${config.color}` }}
                                    >
                                        {rarity.replace('_', ' ')}
                                    </motion.h2>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* Loading/Progress Bar */}
                        <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden mx-auto">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: isDetecting ? "60%" : "100%" }}
                                transition={{ duration: isDetecting ? 2 : 0.5 }}
                                className={`h-full ${isDetecting ? 'bg-red-500' : config.bg}`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// --- FOIL PACK ---
const FoilPack = ({ config, isSelected }: { config: any, isSelected: boolean }) => {
    return (
        <div className={`relative w-48 h-72 flex-shrink-0 transition-all duration-300 ${isSelected ? 'scale-110 z-10' : 'scale-90 opacity-60 hover:opacity-100 hover:scale-95'}`}>
            <div className={`absolute inset-0 bg-${config.color === '#DFFF00' ? 'yellow' : 'red'}-500/20 blur-3xl rounded-full transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
            <div 
                className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden shadow-2xl"
                style={{
                    background: `linear-gradient(135deg, #18181b 0%, #27272a 40%, #18181b 100%)`,
                    borderRadius: '16px',
                    border: isSelected ? `2px solid ${config.color}40` : '2px solid #27272a'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
                <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative z-10">
                    <div className="mb-4 p-4 rounded-full bg-black/40 border border-white/5 shadow-inner">
                        <config.icon size={40} style={{ color: config.color }} />
                    </div>
                    <h3 className="text-2xl font-black uppercase text-center italic leading-none text-white drop-shadow-md">
                        {config.label}
                    </h3>
                    <div className="mt-2 text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 bg-black/60 px-3 py-1 rounded-full">
                        {config.name}
                    </div>
                </div>
                <div className="w-full text-center py-4 relative z-10 bg-black/20">
                    <div className="text-xs font-black text-white">
                        {config.cost} CREDITS
                    </div>
                </div>
            </div>
        </div>
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
    const [saveStatus, setSaveStatus] = useState<'SAVING' | 'SAVED' | 'ERROR' | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [packQuantity, setPackQuantity] = useState<1 | 3>(1);
    const [selectedPack, setSelectedPack] = useState<'BASE' | 'CARS' | 'GRIDIRON' | 'TEST'>('BASE');

    const PACK_CONFIG = {
        BASE: { 
            cost: 100, name: 'Series 1', label: 'BASE SET', icon: BasePackIcon, source: REEL_ITEMS_SOURCE, comingSoon: false, color: '#DFFF00',
            desc: "The essential collection. Contains 5 randomized artifacts per pack."
        },
        CARS: { 
            cost: 250, name: 'Legends', label: 'AUTO LEGENDS', icon: CarFront, source: CAR_PACK_SOURCE, comingSoon: false, color: '#ef4444', 
            desc: "High octane collection. Contains 5 vehicle cards per pack." 
        },
        GRIDIRON: {
            cost: 300, name: 'Gridiron', label: 'GRIDIRON LEGENDS', icon: Trophy, source: GRIDIRON_PACK_SOURCE, comingSoon: false, color: '#3b82f6',
            desc: "The greatest to ever play the game. 150 unique cards. Hunt for the Zenith Tom Brady (1 of 5)."
        },
        TEST: {
            cost: 9999, name: 'DEBUG', label: 'TEST PROTOCOL', icon: Cpu, source: REEL_ITEMS_SOURCE, comingSoon: false, color: '#ff00ff',
            desc: "DEV ONLY. Extremely high probability of Zenith and Omega level assets for testing walkout animations."
        }
    };

    const RARITY_ODDS = [
        { label: 'Common', chance: '50%', color: 'text-zinc-500' },
        { label: 'Uncommon', chance: '30%', color: 'text-emerald-500' },
        { label: 'Rare', chance: '15%', color: 'text-blue-500' },
        { label: 'Super Rare', chance: '4%', color: 'text-orange-500' },
        { label: 'Ultra', chance: '0.9%', color: 'text-purple-500' },
        { label: 'Zenith', chance: '0.1%', color: 'text-[#DFFF00]' },
    ];

    const currentConfig = PACK_CONFIG[selectedPack];
    const cost = packQuantity * currentConfig.cost;
    const canAfford = (profile?.credits || 0) >= cost;
    const isReady = !authLoading && user;
    const CARDS_PER_PACK = 5;

    let buttonText = `PURCHASE (${cost})`;
    if (currentConfig.comingSoon) buttonText = "DROPPING SOON";
    else if (authLoading) buttonText = "CONNECTING...";
    else if (!user) buttonText = "LOGIN REQUIRED";
    else if (!canAfford) buttonText = "INSUFFICIENT CREDITS";

    const getWalkoutDuration = (rarity: string) => {
        const config = getHypeConfig(rarity);
        if (!config) return 0;
        // Detect (2s) + Identify (1.5s) + Reveal (2.5s) = 6s Total Cinematic
        return 6000;
    };

    // --- SCROLL TO CENTER LOGIC ---
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const selectPack = (packId: any) => {
        setSelectedPack(packId);
        setShowInfo(false);
        
        // Scroll to center logic
        const element = document.getElementById(`pack-${packId}`);
        if (element && scrollContainerRef.current) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    const handleOpenPack = async () => {
        if (authLoading || !profile || profile.credits < cost || currentConfig.comingSoon) return;
        
        setStage('CHARGING');
        setSaveStatus('SAVING');
        setError('');
        setPackQueue([]);
        setCurrentCardIndex(0);
        setIsCardFlipped(false);
        setIsAutoFlipping(false);

        try {
            const { error: txError } = await supabase.rpc('add_credits', { amount: -cost });
            if (txError) throw txError;
            await supabase.from('transactions').insert({ sender_id: user.id, receiver_id: null, amount: cost, created_at: new Date().toISOString() });

            const generatedItems: any[] = [];
            const source = currentConfig.source;
            const totalItems = packQuantity * CARDS_PER_PACK;

            for (let i = 0; i < totalItems; i++) {
                const rand = Math.random() * 100;
                let rarity = 'COMMON';
                
                if (selectedPack === 'TEST') {
                    // --- TEST PACK ODDS (BOOSTED) ---
                    if (rand <= 40.0) rarity = 'ZENITH'; // 40% Chance
                    else if (rand <= 70.0) rarity = 'ULTRA'; // 30% Chance
                    else if (rand <= 90.0) rarity = 'SUPER_RARE'; // 20% Chance
                    else rarity = 'RARE'; // 10% Chance (Minimum Rare)
                } else {
                    // --- STANDARD ODDS ---
                    if (rand <= 0.1) rarity = 'ZENITH';
                    else if (rand <= 1.0) rarity = 'ULTRA';
                    else if (rand <= 5.0) rarity = 'SUPER_RARE';
                    else if (rand <= 20.0) rarity = 'RARE';
                    else if (rand <= 50.0) rarity = 'UNCOMMON';
                }

                const itemsOfRarity = source.filter((item: any) => item.rarity === rarity);
                const pool = itemsOfRarity.length > 0 ? itemsOfRarity : source; 
                const wonItem = pool[Math.floor(Math.random() * pool.length)];
                
                generatedItems.push({ ...wonItem, rarity, uniqueId: Math.random().toString() });
            }

            // Async save to DB
            (async () => {
                for (const item of generatedItems) {
                    const { data: existingTemplate } = await supabase.from('item_templates').select('id').eq('name', item.name).single();
                    let templateId = existingTemplate?.id;
                    if (!templateId) {
                        const { data: newTemplate, error: insertError } = await supabase.from('item_templates').insert({
                            name: item.name, rarity: item.rarity, description: item.description,
                            image_url: `https://image.pollinations.ai/prompt/${encodeURIComponent(item.name)}`
                        }).select('id').single();
                        if (!insertError && newTemplate) templateId = newTemplate.id;
                    }
                    if (templateId) {
                        await supabase.from('user_items').insert({
                            user_id: user.id, template_id: templateId, is_shiny: Math.random() < 0.05, 
                            serial_number: Math.floor(Math.random() * 9000) + 1000, obtained_at: new Date().toISOString()
                        });
                    }
                }
            })();

            setPackQueue(generatedItems);
            setSaveStatus('SAVED');
            refreshProfile();
            
            setTimeout(() => { setStage('BURST'); }, 800); 
            setTimeout(() => { 
                const firstItem = generatedItems[0];
                if (WALKOUT_RARITIES.includes(firstItem.rarity)) {
                    setStage('HYPE');
                    setIsCardFlipped(true); // Auto flip card underneath
                    setTimeout(() => setStage('REVEAL'), getWalkoutDuration(firstItem.rarity)); 
                } else {
                    setStage('REVEAL'); 
                }
            }, 1000); 

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Transaction Failed");
            setSaveStatus('ERROR');
            setStage('IDLE');
        }
    };

    const handleCardTap = () => {
        // Block interaction if we are auto-flipping or in a crucial hype stage
        if (isAutoFlipping || (stage !== 'REVEAL' && stage !== 'HYPE')) return;
        
        if (!isCardFlipped) {
            setIsCardFlipped(true);
        } else {
            if (currentCardIndex < packQueue.length - 1) {
                const nextIndex = currentCardIndex + 1;
                const nextItem = packQueue[nextIndex];
                const isNextWalkout = WALKOUT_RARITIES.includes(nextItem.rarity);
                
                setIsAutoFlipping(true);
                setIsCardFlipped(false); 

                setTimeout(() => {
                    setCurrentCardIndex(nextIndex);
                    
                    if (isNextWalkout) {
                        setStage('HYPE');
                        setIsAutoFlipping(false);
                        setIsCardFlipped(true); // Auto flip card underneath
                        setTimeout(() => {
                           setStage('REVEAL');
                        }, getWalkoutDuration(nextItem.rarity)); 
                    } else {
                        setIsAutoFlipping(false);
                    }
                }, 200);
            } else {
                setTimeout(() => setStage('SUMMARY'), 300);
            }
        }
    };

    const reset = () => { setPackQueue([]); setStage('IDLE'); setCurrentCardIndex(0); setIsCardFlipped(false); setSaveStatus(null); };

    const currentItem = packQueue[currentCardIndex];
    const isRare = currentItem && WALKOUT_RARITIES.includes(currentItem.rarity);

    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-4 relative min-h-[700px] overflow-hidden">
            
            {/* BACKGROUND FLASH EFFECT */}
            <AnimatePresence>
                {stage === 'BURST' && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[100] bg-white pointer-events-none"
                        transition={{ duration: 0.15 }}
                    />
                )}
            </AnimatePresence>

            {/* --- STAGE: HYPE WALKOUT --- */}
            <AnimatePresence>
                {stage === 'HYPE' && currentItem && (
                    <HypeOverlay key="hype" rarity={currentItem.rarity} item={currentItem} />
                )}
            </AnimatePresence>

            {/* --- STAGE: IDLE --- */}
            <AnimatePresence>
                {stage === 'IDLE' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} className="w-full max-w-4xl flex flex-col items-center z-10">
                        {/* PACK SELECTION SCROLL - OPTIMIZED FOR MOBILE */}
                        <div 
                            ref={scrollContainerRef}
                            className="flex items-center gap-8 mb-8 md:mb-12 h-[350px] w-full overflow-x-auto no-scrollbar snap-x snap-mandatory px-[calc(50%-6rem)] md:px-4 md:justify-center scroll-smooth"
                        >
                            {['BASE', 'CARS', 'GRIDIRON', 'TEST'].map((packId) => (
                                <div 
                                    key={packId} 
                                    id={`pack-${packId}`}
                                    onClick={() => selectPack(packId as any)} 
                                    className="cursor-pointer snap-center shrink-0 transition-transform duration-300 active:scale-95"
                                >
                                    <FoilPack config={PACK_CONFIG[packId as keyof typeof PACK_CONFIG]} isSelected={selectedPack === packId} />
                                </div>
                            ))}
                        </div>

                        <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">{currentConfig.name}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowInfo(!showInfo)} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                                        {showInfo ? <X size={18} /> : <Info size={18} />}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showInfo && currentConfig.desc && (
                                    <motion.div initial={{ height: 0, opacity: 0, marginBottom: 0 }} animate={{ height: 'auto', opacity: 1, marginBottom: 24 }} exit={{ height: 0, opacity: 0, marginBottom: 0 }} className="overflow-hidden bg-zinc-950/50 rounded-xl border border-zinc-700/50">
                                        <div className="p-4 text-xs font-mono text-zinc-300 leading-relaxed">{currentConfig.desc}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-6 text-[10px] font-mono uppercase bg-black/40 p-4 rounded-xl border border-white/5">
                                {RARITY_ODDS.map((odd, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className={`font-bold ${odd.color}`}>{odd.label}</span>
                                        <span className="text-zinc-500">{odd.chance}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {[1, 3].map(qty => (
                                    <button key={qty} onClick={() => setPackQuantity(qty as 1|3)} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${packQuantity === qty ? 'bg-zinc-800 border-white/20 text-white shadow-lg' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                                        {qty === 1 ? <Layers size={16} /> : <Grid3X3 size={16} />}
                                        <span className="font-bold text-xs">{qty === 1 ? '1 PACK' : '3 PACKS'}</span>
                                    </button>
                                ))}
                            </div>

                            <button onClick={handleOpenPack} disabled={!isReady || !canAfford || currentConfig.comingSoon} className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 ${currentConfig.comingSoon ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-[#DFFF00]'}`}>
                                {authLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                                <span>{buttonText}</span>
                            </button>
                            {error && <div className="text-red-500 text-center text-xs font-mono mt-4">{error}</div>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- STAGE: CHARGING --- */}
            {stage === 'CHARGING' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl">
                    <motion.div 
                        animate={{ 
                            x: [0, -15, 15, -15, 15, 0], 
                            scale: [1, 1.05, 1.1]
                        }} 
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="mb-8 relative"
                    >
                        <FoilPack config={currentConfig} isSelected={true} />
                        <motion.div 
                            className="absolute inset-0 bg-[#DFFF00] blur-3xl opacity-0"
                            animate={{ opacity: [0, 0.8, 1] }}
                            transition={{ duration: 0.8 }}
                        />
                    </motion.div>
                    <div className="absolute bottom-20 text-[#DFFF00] font-mono text-sm font-bold uppercase tracking-[0.3em] animate-pulse flex flex-col items-center gap-2">
                        <span>{saveStatus === 'SAVING' ? 'Encrypting Assets...' : 'Decrypting Payload...'}</span>
                        {saveStatus === 'SAVING' && <Loader2 className="animate-spin" size={16}/>}
                    </div>
                </div>
            )}

            {/* --- STAGE: REVEAL --- */}
            {(stage === 'REVEAL' || stage === 'HYPE') && (
                <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md overflow-hidden" onClick={handleCardTap}>
                    <div className="absolute top-24 md:top-20 text-center z-50 pointer-events-none">
                        <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Asset Sequence</div>
                        <div className="flex items-center gap-2 justify-center">
                            <span className="text-3xl font-black text-white">{currentCardIndex + 1}</span>
                            <span className="text-xl font-bold text-zinc-600">/</span>
                            <span className="text-xl font-bold text-zinc-600">{packQueue.length}</span>
                        </div>
                    </div>
                    
                    {/* VISUAL FLARE BEHIND CARD FOR HIGH TIERS */}
                    {isRare && stage === 'REVEAL' && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        className="absolute inset-0 pointer-events-none z-0"
                     >
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,${getHypeConfig(currentItem.rarity)?.color || '#fff'}_0%,transparent_60%)] blur-3xl opacity-20 animate-pulse`} />
                     </motion.div>
                    )}

                    {/* RESPONSIVE CARD CONTAINER */}
                    <div className="relative w-[85vw] max-w-[320px] aspect-[2/3] perspective-1000 z-10">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentCardIndex}
                                initial={{ y: 600, scale: 0.8, opacity: 0 }}
                                animate={{ y: 0, scale: 1, opacity: 1 }}
                                exit={{ y: -600, scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "backOut" }} 
                                className="w-full h-full cursor-pointer absolute inset-0"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <motion.div
                                    className="relative w-full h-full transition-all"
                                    animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }} 
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* FRONT OF CARD (Asset) */}
                                    <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                        <div className="w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                                            <div className="transform scale-[0.98] origin-center w-full h-full flex items-center justify-center">
                                                <TradingCard item={currentItem} />
                                            </div>
                                            {isRare && <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[inset_0_0_50px_rgba(223,255,0,0.2)] animate-pulse border-2 border-[#DFFF00]/50" />}
                                        </div>
                                    </div>

                                    {/* BACK OF CARD (Pack Art) */}
                                    <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>
                                        <CardBack config={currentConfig} />
                                    </div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="absolute bottom-12 text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse pointer-events-none">
                        {isAutoFlipping ? "Analyzing Signal..." : isCardFlipped ? "Tap to Dismiss" : "Tap to Reveal"}
                    </div>
                </div>
            )}

            {/* --- STAGE: SUMMARY --- */}
            {stage === 'SUMMARY' && (
                <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col overflow-y-auto animate-in fade-in duration-300">
                    <div className="p-4 pt-28 md:pt-32 max-w-7xl mx-auto w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-2">Acquisition Report</h2>
                            <p className="text-zinc-500 font-mono text-xs">All assets transferred to secure storage.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mb-12">
                            {packQueue.map((item, i) => (
                                <MiniSummaryCard key={i} item={item} index={i} />
                            ))}
                        </div>

                        <div className="flex justify-center pb-8">
                            <button onClick={reset} className="px-8 py-4 bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-700 flex items-center gap-2 text-xs md:text-sm shadow-lg border border-zinc-700">
                                <RotateCcw size={16} /> Return to Market
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};