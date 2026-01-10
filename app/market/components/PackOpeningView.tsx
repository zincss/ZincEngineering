'use client'

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    Layers, Grid3X3, Info, Lock, Zap, CarFront, Loader2, X, Sparkles, Cpu, 
    RotateCcw, Trophy, AlertTriangle, Siren, Radiation, Fingerprint, Crown, Scan, 
    Signal, Radio, Disc, ChevronRight, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
            <motion.div animate={{ opacity: isDetecting ? [0.05, 0.15, 0.05] : 0.1, backgroundColor: isDetecting ? '#ef4444' : config.color }} transition={{ duration: 0.5, repeat: isDetecting ? Infinity : 0 }} className="absolute inset-0 z-0" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
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

const FoilPack = ({ config, isSelected }: { config: any, isSelected: boolean }) => (
    <div className={`relative w-56 h-80 shrink-0 transition-all duration-500 ${isSelected ? 'scale-110 z-10' : 'scale-90 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}>
        <div className={`absolute inset-0 bg-${config.color === '#DFFF00' ? '[#DFFF00]' : 'red-500'}/20 blur-[60px] rounded-full transition-opacity duration-1000 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`relative w-full h-full flex flex-col items-center justify-between overflow-hidden shadow-2xl rounded-[2.5rem] border-2 transition-all duration-500 ${isSelected ? 'border-[#DFFF00]/50' : 'border-white/5'}`} style={{ background: `linear-gradient(135deg, #09090b 0%, #18181b 100%)` }}>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
            <div className="flex-1 w-full flex flex-col items-center justify-center p-6 relative z-10 text-center">
                <div className="mb-6 p-5 rounded-[2rem] bg-zinc-900 border border-white/5 shadow-2xl">
                    <config.icon size={48} style={{ color: config.color }} />
                </div>
                <h3 className="text-3xl font-black uppercase italic leading-none text-white tracking-tighter">{config.label}</h3>
                <div className="mt-3 text-[9px] font-mono font-black uppercase tracking-[0.3em] text-[#DFFF00] bg-[#DFFF00]/10 px-4 py-1.5 rounded-full border border-[#DFFF00]/20">{config.name}</div>
            </div>
            <div className="w-full text-center py-6 relative z-10 bg-zinc-950/50 border-t border-white/5">
                <div className="text-xs font-black text-white italic tracking-widest">{config.cost} CREDITS</div>
            </div>
        </div>
    </div>
);

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
        BASE: { cost: 100, name: 'Series_01', label: 'Base Set', icon: BasePackIcon, source: REEL_ITEMS_SOURCE, color: '#DFFF00', desc: "Standard archive extraction. Contains 5 randomized artifacts." },
        CARS: { cost: 250, name: 'Hyper_Drive', label: 'Auto Legends', icon: CarFront, source: CAR_PACK_SOURCE, color: '#ef4444', desc: "High octane vehicle acquisition. 5 high-performance cards." },
        GRIDIRON: { cost: 300, name: 'End_Zone', label: 'NFL Legends', icon: Trophy, source: GRIDIRON_PACK_SOURCE, color: '#3b82f6', desc: "Legendary player cards. Hunt for the Zenith Tom Brady (1 of 5)." },
        TEST: { cost: 9999, name: 'Debug_Mode', label: 'Test Protocol', icon: Cpu, source: REEL_ITEMS_SOURCE, color: '#ff00ff', desc: "Restricted developer access. Guaranteed high-tier walkouts." }
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

    const handleOpenPack = async () => {
        if (authLoading || !profile || profile.credits < cost) return;
        setStage('CHARGING'); setSaveStatus('SAVING'); setError(''); setPackQueue([]); setCurrentCardIndex(0); setIsCardFlipped(false);
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
            setPackQueue(generatedItems); setSaveStatus('SAVED'); refreshProfile();
            setTimeout(() => setStage('BURST'), 800); 
            setTimeout(() => { 
                if (WALKOUT_RARITIES.includes(generatedItems[0].rarity)) { setStage('HYPE'); setIsCardFlipped(true); setTimeout(() => setStage('REVEAL'), 6000); }
                else setStage('REVEAL');
            }, 1000);
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
            <AnimatePresence>{stage === 'BURST' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white pointer-events-none" />}</AnimatePresence>
            <AnimatePresence>{stage === 'HYPE' && packQueue[currentCardIndex] && <HypeOverlay rarity={packQueue[currentCardIndex].rarity} item={packQueue[currentCardIndex]} />}</AnimatePresence>

            <AnimatePresence>
                {stage === 'IDLE' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-6xl flex flex-col items-center z-10">
                        <div className="flex items-center gap-8 mb-16 overflow-x-auto no-scrollbar snap-x snap-mandatory px-[calc(50%-7rem)] w-full pb-8">
                            {Object.keys(PACK_CONFIG).map((id) => (
                                <div key={id} onClick={() => setSelectedPack(id as any)} className="cursor-pointer snap-center"><FoilPack config={PACK_CONFIG[id as keyof typeof PACK_CONFIG]} isSelected={selectedPack === id} /></div>
                            ))}
                        </div>

                        <div className="w-full max-w-2xl bg-zinc-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-white/5">
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

                            <button onClick={handleOpenPack} disabled={!isReady || !canAfford} className="w-full py-6 rounded-[2rem] bg-[#DFFF00] text-black font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(223,255,0,0.2)] hover:bg-white hover:shadow-white/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30 disabled:grayscale">
                                {authLoading ? <Loader2 className="animate-spin" size={20}/> : <Zap size={20} fill="black"/>}
                                Authorize Acquisition ({cost} CR)
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {(stage === 'REVEAL' || stage === 'HYPE') && (
                <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-center" onClick={handleCardTap}>
                    <div className="absolute top-28 text-center">
                        <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.5em] mb-4">Uplink_Sequence_Active</div>
                        <div className="flex items-center gap-4 justify-center text-4xl font-black italic tracking-tighter text-white">
                            <span>{currentCardIndex + 1}</span> <span className="text-zinc-800">/</span> <span>{packQueue.length}</span>
                        </div>
                    </div>
                    <div className="relative w-[85vw] max-w-[340px] aspect-[2/3] perspective-1000">
                        <AnimatePresence mode='wait'>
                            <motion.div key={currentCardIndex} initial={{ y: 400, opacity: 0, rotate: 10 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: -400, opacity: 0, rotate: -10 }} transition={{ type: "spring", damping: 20 }} className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
                                <motion.div animate={{ rotateY: isCardFlipped ? 180 : 0 }} transition={{ duration: 0.6, ease: "circOut" }} className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
                                    <div className="absolute inset-0 backface-hidden rounded-[2.5rem] overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><TradingCard item={packQueue[currentCardIndex]} /></div>
                                    <div className="absolute inset-0 backface-hidden rounded-[2.5rem] overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}><CardBack config={currentConfig} /></div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="absolute bottom-16 text-[#DFFF00] font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse italic">{isCardFlipped ? 'Tap_to_Dismiss' : 'Authorize_Signal_Reveal'}</div>
                </div>
            )}

            {stage === 'SUMMARY' && (
                <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center overflow-y-auto pt-32 pb-20 px-6">
                    <div className="max-w-6xl w-full">
                        <div className="flex flex-col items-center text-center mb-16">
                            <div className="w-16 h-16 bg-[#DFFF00] rounded-2xl flex items-center justify-center mb-6 shadow-2xl"><CheckCircle2 className="text-black" size={32}/></div>
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

const CheckCircle2 = ({ size, className }: any) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
