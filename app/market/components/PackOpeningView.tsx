'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Layers, Grid3X3, Info, Lock, Zap, CarFront, Loader2, X, Sparkles, Cpu, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { REEL_ITEMS_SOURCE, CAR_PACK_SOURCE, BasePackIcon, ItemImage } from './shared';
import { TradingCard } from './TradingCard';

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
const MiniSummaryCard = ({ item }: { item: any }) => {
    const isRare = ['RARE', 'SUPER_RARE', 'ULTRA', 'ZENITH'].includes(item.rarity);
    const borderColor = isRare ? 'border-[#DFFF00]' : 'border-zinc-800';
    const textColor = isRare ? 'text-[#DFFF00]' : 'text-zinc-500';

    return (
        <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border ${borderColor} shadow-lg group`}>
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
        </div>
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
    
    // Stages: IDLE -> CHARGING (Animation) -> STACK (Card Reveal) -> SUMMARY
    const [stage, setStage] = useState<'IDLE' | 'CHARGING' | 'STACK' | 'SUMMARY'>('IDLE');
    
    const [packQueue, setPackQueue] = useState<any[]>([]); 
    const [currentCardIndex, setCurrentCardIndex] = useState(0); 
    const [isCardFlipped, setIsCardFlipped] = useState(false); 
    const [isAutoFlipping, setIsAutoFlipping] = useState(false);
    
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState<'SAVING' | 'SAVED' | 'ERROR' | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [packQuantity, setPackQuantity] = useState<1 | 3>(1);
    const [selectedPack, setSelectedPack] = useState<'BASE' | 'CARS'>('BASE');

    const PACK_CONFIG = {
        BASE: { 
            cost: 100, name: 'Series 1', label: 'BASE SET', icon: BasePackIcon, source: REEL_ITEMS_SOURCE, comingSoon: false, color: '#DFFF00',
            desc: "The essential collection. Contains 5 randomized artifacts per pack."
        },
        CARS: { 
            cost: 250, name: 'Legends', label: 'AUTO LEGENDS', icon: CarFront, source: CAR_PACK_SOURCE, comingSoon: false, color: '#ef4444', 
            desc: "High octane collection. Contains 5 vehicle cards per pack." 
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
                if (rand <= 0.1) rarity = 'ZENITH';
                else if (rand <= 1.0) rarity = 'ULTRA';
                else if (rand <= 5.0) rarity = 'SUPER_RARE';
                else if (rand <= 20.0) rarity = 'RARE';
                else if (rand <= 50.0) rarity = 'UNCOMMON';

                const itemsOfRarity = source.filter((item: any) => item.rarity === rarity);
                const pool = itemsOfRarity.length > 0 ? itemsOfRarity : source; 
                const wonItem = pool[Math.floor(Math.random() * pool.length)];
                
                generatedItems.push({ ...wonItem, rarity, uniqueId: Math.random().toString() });
            }

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
            setTimeout(() => { setStage('STACK'); }, 2000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Transaction Failed");
            setSaveStatus('ERROR');
            setStage('IDLE');
        }
    };

    const handleCardTap = () => {
        if (isAutoFlipping) return;
        if (!isCardFlipped) {
            setIsCardFlipped(true);
        } else {
            if (currentCardIndex < packQueue.length - 1) {
                setCurrentCardIndex(prev => prev + 1);
                setIsCardFlipped(false);
                setIsAutoFlipping(true);
                setTimeout(() => {
                    setIsCardFlipped(true);
                    setIsAutoFlipping(false);
                }, 600);
            } else {
                setTimeout(() => setStage('SUMMARY'), 300);
            }
        }
    };

    const reset = () => { setPackQueue([]); setStage('IDLE'); setCurrentCardIndex(0); setIsCardFlipped(false); setSaveStatus(null); };

    const currentItem = packQueue[currentCardIndex];
    const isRare = currentItem && ['RARE', 'SUPER_RARE', 'ULTRA', 'ZENITH'].includes(currentItem.rarity);

    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-4 relative min-h-[700px]">
            
            {/* --- IDLE --- */}
            <AnimatePresence>
                {stage === 'IDLE' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} className="w-full max-w-4xl flex flex-col items-center z-10">
                        {/* MOBILE OPTIMIZED: SCROLLABLE CAROUSEL */}
                        <div className="flex items-center gap-8 mb-12 h-[350px] w-full overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 md:justify-center">
                            {['BASE', 'CARS'].map((packId) => (
                                <div key={packId} onClick={() => { setSelectedPack(packId as any); setShowInfo(false); }} className="cursor-pointer snap-center shrink-0">
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
                    <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.05, 1], filter: ["drop-shadow(0 0 0px rgba(223,255,0,0))", "drop-shadow(0 0 30px rgba(223,255,0,0.5))", "drop-shadow(0 0 0px rgba(223,255,0,0))"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="mb-8">
                        <FoilPack config={currentConfig} isSelected={true} />
                    </motion.div>
                    <div className="absolute bottom-20 text-[#DFFF00] font-mono text-sm font-bold uppercase tracking-[0.3em] animate-pulse flex flex-col items-center gap-2">
                        <span>{saveStatus === 'SAVING' ? 'Encrypting Assets...' : 'Decrypting Payload...'}</span>
                        {saveStatus === 'SAVING' && <Loader2 className="animate-spin" size={16}/>}
                    </div>
                </div>
            )}

            {/* --- STAGE: STACK --- */}
            {stage === 'STACK' && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md overflow-hidden" onClick={handleCardTap}>
                    <div className="absolute top-24 md:top-20 text-center z-50 pointer-events-none">
                        <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Asset Sequence</div>
                        <div className="flex items-center gap-2 justify-center">
                            <span className="text-3xl font-black text-white">{currentCardIndex + 1}</span>
                            <span className="text-xl font-bold text-zinc-600">/</span>
                            <span className="text-xl font-bold text-zinc-600">{packQueue.length}</span>
                        </div>
                    </div>

                    {/* RESPONSIVE CARD CONTAINER */}
                    <div className="relative w-[85vw] max-w-[320px] aspect-[2/3]">
                        {packQueue.length - currentCardIndex > 1 && (
                            <>
                                <div className="absolute top-4 left-4 w-full h-full bg-zinc-800 rounded-3xl border border-zinc-700 opacity-20 scale-90" />
                                <div className="absolute top-2 left-2 w-full h-full bg-zinc-800 rounded-3xl border border-zinc-700 opacity-40 scale-95" />
                            </>
                        )}

                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentCardIndex}
                                initial={{ x: 300, opacity: 0, rotate: 10 }}
                                animate={{ x: 0, opacity: 1, rotate: 0 }}
                                exit={{ x: -500, opacity: 0, rotate: -20, transition: { duration: 0.2 } }}
                                className="w-full h-full cursor-pointer perspective-1000"
                                style={{ perspective: '1000px' }}
                            >
                                <motion.div
                                    className="relative w-full h-full transition-all duration-300"
                                    animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                        <div className="w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                                            <div className="transform scale-[0.95] origin-center w-full h-full flex items-center justify-center">
                                                <TradingCard item={currentItem} />
                                            </div>
                                            {isRare && <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[inset_0_0_50px_rgba(223,255,0,0.2)] animate-pulse border-2 border-[#DFFF00]/50" />}
                                        </div>
                                    </div>
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
                <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col overflow-y-auto animate-in fade-in duration-500">
                    <div className="p-4 pt-28 md:pt-32 max-w-7xl mx-auto w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-2">Acquisition Report</h2>
                            <p className="text-zinc-500 font-mono text-xs">All assets transferred to secure storage.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mb-12">
                            {packQueue.map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover:scale-105 transition-transform">
                                    <MiniSummaryCard item={item} />
                                </motion.div>
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