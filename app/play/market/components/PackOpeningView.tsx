'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Layers, Grid3X3, Info, Lock, Zap, CarFront, Loader2, X, Sparkles, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  REEL_ITEMS_SOURCE, CAR_PACK_SOURCE, FLAIR_ITEMS_SOURCE, BasePackIcon, ItemImage, 
  getScrollRarityStyle 
} from './shared';
import { TradingCard } from './TradingCard';

// Foil Pack Component
const FoilPack = ({ config, isSelected }: { config: any, isSelected: boolean }) => {
    return (
        <div className={`relative w-48 h-72 transition-all duration-500 ${isSelected ? 'scale-110 z-10' : 'scale-90 opacity-60 hover:opacity-100 hover:scale-95'}`}>
            <div className={`absolute inset-0 bg-${config.color === '#DFFF00' ? 'yellow' : 'red'}-500/20 blur-3xl rounded-full transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
            <div 
                className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden shadow-2xl"
                style={{
                    background: `linear-gradient(135deg, #18181b 0%, #27272a 20%, #18181b 40%, #3f3f46 50%, #18181b 60%, #27272a 80%, #18181b 100%)`,
                    boxShadow: isSelected ? `0 0 30px -5px ${config.color}40` : 'none',
                    borderRadius: '4px'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
                <div className="w-full h-4 bg-[#111] relative z-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #333 2px, #333 4px)', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }} />
                <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative z-10">
                    <div className={`w-24 h-24 mb-4 rounded-full border-2 flex items-center justify-center bg-black/50 backdrop-blur-sm`} style={{ borderColor: config.color }}>
                        <config.icon size={48} style={{ color: config.color }} />
                    </div>
                    <h3 className="text-2xl font-black uppercase text-center italic leading-none text-white drop-shadow-md">
                        {config.label.split(' ').map((word: string, i: number) => <div key={i}>{word}</div>)}
                    </h3>
                    <div className="mt-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 bg-black/40 px-2 py-1 rounded">
                        {config.name}
                    </div>
                </div>
                <div className="w-full text-center py-6 relative z-10">
                    <div className="text-xs font-black text-white bg-black/30 mx-4 py-1 rounded border border-white/10">
                        {config.cost} CREDITS
                    </div>
                </div>
                <div className="w-full h-4 bg-[#111] relative z-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #333 2px, #333 4px)', boxShadow: '0 -2px 5px rgba(0,0,0,0.5)' }} />
                {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine pointer-events-none z-30" />}
            </div>
        </div>
    );
};

export const PackOpeningView = ({ user, profile, authLoading, refreshProfile }: any) => {
    const supabase = createClient();
    const [stage, setStage] = useState<'IDLE' | 'CHARGING' | 'SCANNING' | 'REVEAL'>('IDLE');
    const [packQueue, setPackQueue] = useState<any[]>([]);
    const [currentPackIndex, setCurrentPackIndex] = useState(0);
    const [error, setError] = useState('');
    const [showOdds, setShowOdds] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [packQuantity, setPackQuantity] = useState<1 | 3>(1);
    const [activeReel, setActiveReel] = useState<{items: any[]} | null>(null);
    const [selectedPack, setSelectedPack] = useState<'BASE' | 'CARS'>('BASE');
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const PACK_CONFIG = {
        BASE: { 
            cost: 100, name: 'Series 1', label: 'BASE PACK', icon: BasePackIcon, source: REEL_ITEMS_SOURCE, comingSoon: false, color: '#DFFF00',
            desc: "The essential collection of everyday artifacts. Discover the beauty in the mundane."
        },
        CARS: { 
            cost: 250, name: 'Legends', label: 'AUTO LEGENDS', icon: CarFront, source: CAR_PACK_SOURCE, comingSoon: false, color: '#ef4444', 
            desc: "The ultimate collection for petrolheads. Collect 100+ unique vehicles including WRC Legends, F1 icons, and Hypercars." 
        }
    };

    const currentConfig = PACK_CONFIG[selectedPack];
    const cost = packQuantity * currentConfig.cost;
    const canAfford = (profile?.credits || 0) >= cost;
    const isReady = !authLoading && user;

    const NUM_PRE_FILLERS = 60; 
    const NUM_POST_FILLERS = 5; 
    const SPIN_DURATION = 6; 
    const ITEM_SIZE_PX = 192; 

    let buttonText = `PURCHASE (${cost})`;
    if (currentConfig.comingSoon) buttonText = "DROPPING SOON";
    else if (authLoading) buttonText = "CONNECTING...";
    else if (!user) buttonText = "LOGIN REQUIRED";
    else if (!canAfford) buttonText = "INSUFFICIENT CREDITS";

    // --- MAIN ACTION: OPEN PACK ---
    const handleOpenPack = async () => {
        if (authLoading || !profile || profile.credits < cost || currentConfig.comingSoon) return;
        setStage('CHARGING');
        setError('');
        setPackQueue([]);
        setCurrentPackIndex(0);
        setShowInfo(false);
        setShowOdds(false);

        try {
            // 1. DEDUCT CREDITS
            const { error: txError } = await supabase.rpc('add_credits', { amount: -cost });
            if (txError) throw txError;

            // 2. RECORD TRANSACTION
            await supabase.from('transactions').insert({
                sender_id: user.id,
                receiver_id: null,
                amount: cost,
                created_at: new Date().toISOString()
            });

            // 3. GENERATE ITEMS (Client-Side Logic for Prototype)
            const generatedItems: any[] = [];
            const source = currentConfig.source;

            for (let i = 0; i < packQuantity; i++) {
                // Determine Rarity
                const rand = Math.random() * 100;
                let rarity = 'COMMON';
                if (rand <= 0.1) rarity = 'ZENITH';
                else if (rand <= 1.0) rarity = 'ULTRA';
                else if (rand <= 5.0) rarity = 'SUPER_RARE';
                else if (rand <= 20.0) rarity = 'RARE';
                else if (rand <= 50.0) rarity = 'UNCOMMON';

                // Pick Item of Rarity
                const itemsOfRarity = source.filter((item: any) => item.rarity === rarity);
                const pool = itemsOfRarity.length > 0 ? itemsOfRarity : source; 
                const wonItem = pool[Math.floor(Math.random() * pool.length)];
                
                generatedItems.push({ ...wonItem, rarity });
            }

            // 4. DATABASE SYNC
            for (const item of generatedItems) {
                // A. Check/Create Template
                const { data: existingTemplate } = await supabase
                    .from('item_templates')
                    .select('id')
                    .eq('name', item.name)
                    .single();

                let templateId = existingTemplate?.id;

                if (!templateId) {
                    const { data: newTemplate, error: createError } = await supabase
                        .from('item_templates')
                        .insert({
                            name: item.name,
                            rarity: item.rarity,
                            description: item.description,
                            image_url: `https://image.pollinations.ai/prompt/${encodeURIComponent(item.name)}` // Fallback URL, real images handled in frontend
                        })
                        .select('id')
                        .single();
                    
                    if (createError) {
                        console.error("Template creation failed:", createError);
                        continue; 
                    }
                    templateId = newTemplate.id;
                }

                // B. Insert User Item
                await supabase.from('user_items').insert({
                    user_id: user.id,
                    template_id: templateId,
                    is_shiny: Math.random() < 0.05, 
                    serial_number: Math.floor(Math.random() * 9000) + 1000, 
                    obtained_at: new Date().toISOString()
                });
            }

            setPackQueue(generatedItems);
            refreshProfile();
            runSpinSequence(generatedItems[0]);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Transaction Failed");
            setStage('IDLE');
        }
    };

    const runSpinSequence = (targetItem: any) => {
        setStage('CHARGING');
        const source = currentConfig.source;
        
        // Build the reel visual
        const preFillers = Array.from({ length: NUM_PRE_FILLERS }, () => source[Math.floor(Math.random() * source.length)]);
        const postFillers = Array.from({ length: NUM_POST_FILLERS }, () => source[Math.floor(Math.random() * source.length)]);
        setActiveReel({ items: [...preFillers, targetItem, ...postFillers] });

        setTimeout(() => { setStage('SCANNING'); }, 1500); 
        setTimeout(() => { setStage('REVEAL'); }, 1500 + (SPIN_DURATION * 1000) + 500);
    };

    const handleNextPack = () => {
        const nextIndex = currentPackIndex + 1;
        if (nextIndex < packQueue.length) {
            setCurrentPackIndex(nextIndex);
            runSpinSequence(packQueue[nextIndex]);
        } else {
            reset();
        }
    };

    const reset = () => { setPackQueue([]); setStage('IDLE'); };

    const FINAL_POS = `calc(50% - (${NUM_PRE_FILLERS} * ${ITEM_SIZE_PX}px) - ${ITEM_SIZE_PX / 2}px)`;
    const currentResult = packQueue[currentPackIndex];
    const remainingPacks = packQueue.length - 1 - currentPackIndex;

    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-4 relative min-h-[700px]">
            
            {/* --- IDLE STATE --- */}
            <AnimatePresence>
                {stage === 'IDLE' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        className="w-full max-w-4xl flex flex-col items-center z-10"
                    >
                        {/* 3D PACK SELECTION CAROUSEL */}
                        <div className="flex items-center justify-center gap-8 mb-12 h-[350px]">
                            {['BASE', 'CARS'].map((packId) => (
                                <div key={packId} onClick={() => { setSelectedPack(packId as any); setShowInfo(false); }} className="cursor-pointer">
                                    <FoilPack config={PACK_CONFIG[packId as keyof typeof PACK_CONFIG]} isSelected={selectedPack === packId} />
                                </div>
                            ))}
                        </div>

                        {/* CONTROLS AREA */}
                        <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">{currentConfig.name}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowInfo(!showInfo)} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                                        {showInfo ? <X size={18} /> : <Info size={18} />}
                                    </button>
                                    <button onClick={() => setShowOdds(!showOdds)} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                                        <Cpu size={18} />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showInfo && currentConfig.desc && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0, marginBottom: 0 }} 
                                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }} 
                                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                        className="overflow-hidden bg-zinc-950/50 rounded-xl border border-zinc-700/50"
                                    >
                                        <div className="p-4 text-xs font-mono text-zinc-300 leading-relaxed">{currentConfig.desc}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {showOdds && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0, marginBottom: 0 }} 
                                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }} 
                                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-2 text-[10px] font-mono uppercase gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
                                            {['Common|50%', 'Uncommon|30%', 'Rare|15%', 'Super Rare|4%', 'Ultra|0.9%', 'Zenith|0.1%'].map(r => {
                                                const [label, chance] = r.split('|');
                                                return <React.Fragment key={label}><div className="bg-zinc-900 p-2 text-zinc-400">{label}</div><div className="bg-zinc-900 p-2 text-right text-white">{chance}</div></React.Fragment>
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {[1, 3].map(qty => (
                                    <button 
                                        key={qty} onClick={() => setPackQuantity(qty as 1|3)}
                                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${packQuantity === qty ? 'bg-zinc-800 border-white/20 text-white shadow-lg' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                    >
                                        {qty === 1 ? <Layers size={16} /> : <Grid3X3 size={16} />}
                                        <span className="font-bold text-xs">{qty === 1 ? 'SINGLE PACK' : 'BUNDLE (x3)'}</span>
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={handleOpenPack} disabled={!isReady || !canAfford || currentConfig.comingSoon}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 ${currentConfig.comingSoon ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-[#DFFF00]'}`}
                            >
                                {authLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                                <span>{buttonText}</span>
                            </button>
                            
                            {error && <div className="text-red-500 text-center text-xs font-mono mt-4">{error}</div>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- ANIMATION STAGE --- */}
            <AnimatePresence>
                {stage !== 'IDLE' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950/98 backdrop-blur-xl">
                        
                        {stage === 'CHARGING' && (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                                <motion.div 
                                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }} 
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className="mb-8"
                                >
                                    <FoilPack config={currentConfig} isSelected={true} />
                                </motion.div>
                                <div className="text-[#DFFF00] font-mono text-sm font-bold uppercase tracking-[0.5em] animate-pulse">Breaching Protocol...</div>
                                {packQueue.length > 1 && <div className="mt-2 text-zinc-500 font-mono text-xs">Opening Pack {currentPackIndex + 1} of {packQueue.length}</div>}
                            </motion.div>
                        )}

                        {stage === 'SCANNING' && activeReel && (
                            <div className="w-full flex flex-col items-center">
                                <div className={`relative bg-zinc-900 border-[#DFFF00] overflow-hidden flex items-center justify-center ${isDesktop ? 'w-full max-w-5xl border-y-2' : 'w-64 border-x-2'}`} style={{ height: isDesktop ? `${ITEM_SIZE_PX + 32}px` : '60vh' }}>
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] z-20 pointer-events-none bg-[length:100%_4px,3px_100%]" />
                                    <div className={`absolute inset-0 z-20 ${isDesktop ? 'bg-gradient-to-r' : 'bg-gradient-to-t'} from-zinc-950 via-transparent to-zinc-950`} />
                                    <div className={`absolute bg-red-500/50 z-30 shadow-[0_0_15px_red] ${isDesktop ? 'top-0 bottom-0 left-1/2 w-[2px]' : 'left-0 right-0 top-1/2 h-[2px]'}`} />

                                    <motion.div 
                                        initial={isDesktop ? { x: "0%" } : { y: "0%" }}
                                        animate={isDesktop ? { x: FINAL_POS } : { y: FINAL_POS }}
                                        transition={{ duration: SPIN_DURATION, ease: [0.1, 0, 0.05, 1] }} 
                                        className="flex"
                                        style={{ flexDirection: isDesktop ? 'row' : 'column' }}
                                    >
                                        {activeReel.items.map((item, i) => (
                                            <div key={i} className={`flex flex-col items-center justify-center relative p-4 ${getScrollRarityStyle(item.rarity)}`} style={{ width: ITEM_SIZE_PX, height: ITEM_SIZE_PX, flexShrink: 0 }}>
                                                <div className={`absolute bg-zinc-900/50 ${isDesktop ? 'top-4 bottom-4 right-0 w-px' : 'bottom-0 left-4 right-4 h-px'}`} />
                                                <div className="w-24 h-24 mb-2"><ItemImage name={item.name} searchQuery={item.searchQuery || item.name} className="w-full h-full grayscale opacity-80" /></div>
                                                <span className="text-[10px] font-mono uppercase text-zinc-500 text-center truncate w-full px-2">{item.name}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                                <div className="mt-8 flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest"><Loader2 className="animate-spin" size={14} /> Decrypting Data Stream</div>
                            </div>
                        )}

                        {stage === 'REVEAL' && currentResult && (
                            <div className="w-full max-w-lg mx-auto p-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                {currentResult.isBonus && <div className="mb-8 text-center animate-bounce"><h2 className="text-4xl font-black text-pink-500 uppercase tracking-tighter">COSMIC ITEM</h2></div>}
                                
                                {/* New Trading Card Reveal */}
                                <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                                    <TradingCard item={currentResult} />
                                </div>

                                <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={remainingPacks > 0 ? handleNextPack : reset} className={`mt-4 w-full py-4 rounded-full font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 ${remainingPacks > 0 ? 'bg-[#DFFF00] text-black hover:bg-white' : 'bg-white text-black hover:bg-[#DFFF00]'}`}>
                                    {remainingPacks > 0 ? <><span>OPEN NEXT PACK ({remainingPacks} LEFT)</span><Zap size={18} fill="currentColor" /></> : <><span>STORE ASSET & FINISH</span><Lock size={18} /></>}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};