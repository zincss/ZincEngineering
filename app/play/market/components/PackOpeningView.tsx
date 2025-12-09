'use client'

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Layers, Grid3X3, Info, ChevronUp, ChevronDown, Lock, Zap, CarFront, Loader2 } from 'lucide-react';
import { 
  REEL_ITEMS_SOURCE, CAR_PACK_SOURCE, FLAIR_ITEMS_SOURCE, BasePackIcon, ItemImage, 
  getScrollRarityStyle, getRarityBorder, getRarityBadge 
} from './shared';

export const PackOpeningView = ({ user, profile, authLoading, refreshProfile }: any) => {
    const [stage, setStage] = useState<'IDLE' | 'RUMBLE' | 'SCROLLING' | 'REVEAL'>('IDLE');
    const [results, setResults] = useState<any[]>([]); 
    const [error, setError] = useState('');
    const [showOdds, setShowOdds] = useState(false);
    const [packQuantity, setPackQuantity] = useState<1 | 3>(1);
    const [activeReels, setActiveReels] = useState<{items: any[]}[]>([]);
    const [selectedPack, setSelectedPack] = useState<'BASE' | 'CARS'>('BASE');

    const PACK_CONFIG = {
        BASE: { cost: 100, name: 'Series 1', label: 'BASE PACK NO.1', icon: BasePackIcon, source: REEL_ITEMS_SOURCE, desc: null, comingSoon: false },
        CARS: { cost: 250, name: 'Legends', label: 'AUTOMOTIVE PACK', icon: CarFront, source: CAR_PACK_SOURCE, comingSoon: true, desc: "The ultimate collection for petrolheads. Collect 100+ unique vehicles including WRC Legends, F1 icons, and Hypercars. Chase the 1/5 Zenith 919 Evo.\n\nFEATURE PREVIEW: Unlocking cars will grant access to the new 'Profile Garage', a dedicated 3D showroom to display your rarest pulls to the community." }
    };

    const currentConfig = PACK_CONFIG[selectedPack];
    const cost = packQuantity * currentConfig.cost;
    const canAfford = (profile?.credits || 0) >= cost;
    const isReady = !authLoading && user;

    let buttonText = `Authorize Payment (${cost})`;
    if (currentConfig.comingSoon) buttonText = "DROPPING SOON";
    else if (authLoading) buttonText = "CONNECTING...";
    else if (!user) buttonText = "LOGIN REQUIRED";
    else if (!canAfford) buttonText = "INSUFFICIENT CREDITS";

    const handleOpenPack = async () => {
        if (authLoading || !profile || profile.credits < cost || currentConfig.comingSoon) return;
        setStage('RUMBLE');
        setError('');
        setResults([]);

        try {
            // 1. Open Standard Packs via RPC
            const promises = Array(packQuantity).fill(null).map(() => supabase.rpc('open_base_set_pack'));
            const responses = await Promise.all(promises);
            const tempResults: any[] = [];
            
            for (const res of responses) {
                if (res.error) throw res.error;
                if (res.data && res.data.error === 'INSUFFICIENT_FUNDS') throw new Error("Insufficient Funds");
                tempResults.push(res.data);
            }

            // 2. SECRET BONUS LOGIC (5% Chance for Rare Flair)
            const ROLL_CHANCE = 0.05 * packQuantity; 
            if (Math.random() < ROLL_CHANCE) {
                const bonusItem = FLAIR_ITEMS_SOURCE[Math.floor(Math.random() * FLAIR_ITEMS_SOURCE.length)];
                // Note: Real persistence requires backend RPC support for 'COSMIC' items
                // For now, we simulate the drop visually
                tempResults.push({ ...bonusItem, isBonus: true });
            }

            // 3. Generate Reels
            const reels = tempResults.map((result) => {
                const source = currentConfig.source;
                
                // Special handling for Bonus items (All items in reel are the bonus to highlight it)
                if (result.isBonus) {
                     return { items: Array.from({ length: 30 }, () => ({ ...result })) };
                }

                // Standard random fillers + actual result at the end
                const randomFillers = Array.from({ length: 30 }, () => source[Math.floor(Math.random() * source.length)]);
                return { items: [...randomFillers, { name: result.name, rarity: result.rarity }] };
            });

            setActiveReels(reels);
            setResults(tempResults); 
            refreshProfile();

            setTimeout(() => {
                setStage('SCROLLING');
                setTimeout(() => { setStage('REVEAL'); }, 6000);
            }, 1500);

        } catch (err: any) {
            setError(err.message);
            setStage('IDLE');
        }
    };

    const reset = () => { setResults([]); setStage('IDLE'); };

    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-4 relative min-h-[600px]">
            <div className={`flex gap-4 mb-8 transition-all duration-500 ${stage !== 'IDLE' ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'}`}>
                <button onClick={() => setSelectedPack('BASE')} className={`group relative w-36 md:w-48 p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedPack === 'BASE' ? 'border-[#DFFF00] bg-zinc-900' : 'border-zinc-800 bg-zinc-950 opacity-60 hover:opacity-100'}`}>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Series 1</div><div className="text-white font-black uppercase text-sm md:text-base">Base Set</div><div className="text-xs font-mono text-zinc-400 mt-1">100 CR</div>
                </button>
                <button onClick={() => setSelectedPack('CARS')} className={`group relative w-36 md:w-48 p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedPack === 'CARS' ? 'border-[#DFFF00] bg-zinc-900' : 'border-zinc-800 bg-zinc-950 opacity-60 hover:opacity-100'}`}>
                     <div className="absolute -top-2 -right-2 bg-orange-500 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase shadow-lg animate-pulse">SOON</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Legends</div><div className="text-white font-black uppercase text-sm md:text-base">Automotive</div><div className="text-xs font-mono text-zinc-400 mt-1">??? CR</div>
                </button>
            </div>

            <div className={`w-full max-w-md transition-all duration-500 ease-in-out px-4 ${stage !== 'IDLE' ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <div className="group relative border border-zinc-800 bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 md:p-8 hover:border-[#DFFF00] transition-all duration-500 shadow-2xl">
                    <div className="absolute top-4 right-4 bg-[#DFFF00] text-black font-bold font-mono text-[10px] px-3 py-1 rounded uppercase shadow-[0_0_15px_rgba(223,255,0,0.4)] z-20">{currentConfig.name}</div>
                    <div className="flex justify-center py-8 md:py-10">
                        <div className={`relative w-40 h-56 md:w-48 md:h-64 foil-gradient rounded-xl border border-white/20 shadow-2xl flex flex-col items-center justify-center p-4 transform group-hover:scale-105 transition-transform duration-500 ${currentConfig.comingSoon ? 'grayscale brightness-75' : ''}`}>
                            <div className="bg-black/80 backdrop-blur border border-[#DFFF00] rounded-lg p-3 mb-4 w-20 h-20 flex items-center justify-center text-[#DFFF00]"><currentConfig.icon size={40} /></div>
                            <h3 className="text-xl md:text-2xl font-black uppercase text-white italic tracking-tighter text-center leading-none mt-2">{currentConfig.label.split(' ').map((word, i) => <div key={i}>{word}</div>)}</h3>
                            {currentConfig.comingSoon && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"><Lock size={48} className="text-white/50" /></div>}
                        </div>
                    </div>
                    {currentConfig.desc && (
                        <div className="mb-6 text-center bg-black/40 p-4 rounded-lg border border-zinc-800">
                            <p className="text-[#DFFF00] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">{currentConfig.comingSoon ? <><Lock size={12}/> Locked Intel</> : "Pack Contents"}</p>
                            <p className="text-zinc-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">{currentConfig.desc}</p>
                        </div>
                    )}
                    <div className="space-y-6">
                        <div className={`grid grid-cols-2 gap-3 ${currentConfig.comingSoon ? 'opacity-50 pointer-events-none' : ''}`}>
                            <button onClick={() => setPackQuantity(1)} className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${packQuantity === 1 ? 'border-[#DFFF00] bg-[#DFFF00]/10 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}><Layers size={16} /><span className="font-bold text-xs">SINGLE ({currentConfig.cost})</span></button>
                            <button onClick={() => setPackQuantity(3)} className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${packQuantity === 3 ? 'border-[#DFFF00] bg-[#DFFF00]/10 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}><Grid3X3 size={16} /><span className="font-bold text-xs">TRIPLE ({currentConfig.cost * 3})</span></button>
                        </div>
                        <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden transition-all duration-300">
                            <button onClick={() => setShowOdds(!showOdds)} className="w-full flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"><span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2"><Info size={12}/> Odds Protocol</span><span className="text-zinc-500 flex items-center gap-2 text-[10px] font-bold uppercase">{showOdds ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span></button>
                            {showOdds && (
                                <div className="grid grid-cols-2 text-[10px] font-mono uppercase animate-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 border-r border-b border-zinc-800 text-zinc-400">Common</div><div className="p-2 border-b border-zinc-800 text-right text-zinc-400">50.0%</div>
                                    <div className="p-2 border-r border-b border-zinc-800 text-green-500">Uncommon</div><div className="p-2 border-b border-zinc-800 text-right text-green-500">30.0%</div>
                                    <div className="p-2 border-r border-b border-zinc-800 text-blue-500">Rare</div><div className="p-2 border-b border-zinc-800 text-right text-blue-500">15.0%</div>
                                    <div className="p-2 border-r border-b border-zinc-800 text-orange-500">Super Rare</div><div className="p-2 border-b border-zinc-800 text-right text-orange-500">4.0%</div>
                                    <div className="p-2 border-r border-b border-zinc-800 text-purple-500">Ultra</div><div className="p-2 border-b border-zinc-800 text-right text-purple-500">0.9%</div>
                                    <div className="p-2 border-r border-b border-zinc-800 text-[#DFFF00] bg-[#DFFF00]/5 font-bold">Zenith</div><div className="p-2 border-b text-right text-[#DFFF00] bg-[#DFFF00]/5 font-bold">0.1%</div>
                                    <div className="p-2 border-r border-zinc-800 text-pink-500 bg-pink-500/10 font-bold animate-pulse">COSMIC</div><div className="p-2 text-right text-pink-500 bg-pink-500/10 font-bold">BONUS</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6">
                        <button onClick={handleOpenPack} disabled={!isReady || !canAfford || currentConfig.comingSoon} className={`w-full font-black uppercase py-4 rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${currentConfig.comingSoon ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 'bg-white text-black hover:bg-[#DFFF00] disabled:opacity-50'}`}>{authLoading ? <Loader2 size={16} className="animate-spin" /> : currentConfig.comingSoon ? <Lock size={16} /> : <Zap size={16} fill="currentColor" />}<span>{buttonText}</span></button>
                    </div>
                    {error && <div className="text-red-500 text-center text-xs font-mono mt-4">{error}</div>}
                </div>
            </div>

            <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 transition-all duration-500 ease-out ${stage !== 'IDLE' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
                <div className="w-full max-w-7xl h-auto min-h-[60vh] max-h-[90vh] rounded-3xl overflow-hidden border-2 border-[#DFFF00]/50 bg-zinc-950 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col items-center justify-center relative overflow-y-auto custom-scrollbar">
                    {stage === 'RUMBLE' && (
                        <div className="animate-rumble relative z-10 flex gap-4 flex-wrap justify-center p-8">
                            {Array.from({ length: packQuantity }).map((_, i) => (
                                <div key={i} className="w-32 h-44 md:w-48 md:h-64 foil-gradient rounded-xl border border-white/30 flex items-center justify-center shadow-[0_0_50px_rgba(223,255,0,0.5)]"><div className="w-12 h-12 md:w-16 md:h-16 text-white flex items-center justify-center"><currentConfig.icon size={64} /></div></div>
                            ))}
                        </div>
                    )}
                    {stage === 'SCROLLING' && (
                        <div className="flex gap-2 md:gap-4 z-10 overflow-hidden py-10 px-4">
                            {activeReels.map((reel, index) => (
                                <div key={index} className="reel-container relative h-40 md:h-64 w-28 md:w-48 overflow-hidden border-y-4 border-[#DFFF00] bg-zinc-900 rounded-lg shadow-2xl">
                                    <div className={`animate-scroll-${index + 1}`}>
                                        {reel.items.map((item, i) => (
                                            <div key={i} className={`h-32 md:h-48 w-full flex flex-col items-center justify-center border-b p-2 ${getScrollRarityStyle(item.rarity)}`}>
                                                <div className="w-16 h-16 md:w-28 md:h-28 opacity-90 drop-shadow-xl transform scale-90"><ItemImage name={item.name} rarity={item.rarity} className="w-full h-full" /></div>
                                                <div className="flex flex-col items-center mt-2 bg-black/50 px-2 py-1 rounded backdrop-blur-sm w-full"><span className="text-[9px] md:text-[12px] font-mono uppercase text-white font-black text-center leading-none truncate w-full">{item.name}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#DFFF00] z-20 -translate-y-1/2 shadow-[0_0_15px_#DFFF00] animate-pulse" />
                                </div>
                            ))}
                        </div>
                    )}
                    {stage === 'REVEAL' && results.length > 0 && (
                        <div className="relative z-10 w-full max-w-6xl mx-auto p-6 animate-in zoom-in-50 duration-500 flex flex-col items-center">
                            {results.some(r => r.isBonus) && (
                                <div className="mb-8 text-center animate-bounce">
                                    <h2 className="text-4xl font-black text-pink-500 uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]">COSMIC ANOMALY DETECTED</h2>
                                    <p className="text-white font-mono text-sm">HIDDEN STASH UNLOCKED</p>
                                </div>
                            )}
                            <div className="flex flex-wrap justify-center gap-6 mb-8 w-full">
                                {results.map((result, idx) => {
                                    const sourceItem = [...currentConfig.source, ...FLAIR_ITEMS_SOURCE].find(i => i.name === result.name);
                                    // UPDATED: Now falls back to the DB description if local source is missing
                                    const desc = sourceItem?.description || result.description || "A mysterious artifact.";
                                    return (
                                        <div key={idx} className={`relative w-64 h-auto bg-zinc-900 border-4 rounded-2xl p-4 text-center shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ${getRarityBorder(result.rarity)}`}>
                                            <div className="w-32 h-32 mx-auto mb-4 bg-zinc-950/50 rounded-xl p-2 border border-zinc-800 shadow-inner flex items-center justify-center relative z-10"><ItemImage name={result.name} rarity={result.rarity} className="w-full h-full shadow-lg" /></div>
                                            <h3 className="text-sm font-black uppercase text-white mb-2 tracking-tighter relative z-10">{result.name}</h3>
                                            <div className={`inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest mb-4 relative z-10 ${getRarityBadge(result.rarity)}`}>{result.rarity.replace('_', ' ')}</div>
                                            <div className="relative z-10 border-t border-white/10 pt-4 mt-2"><p className="text-zinc-400 font-mono text-[10px] leading-relaxed italic">"{desc}"</p></div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={reset} className="w-full max-w-sm bg-zinc-800 hover:bg-white hover:text-black text-white py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-xl border border-zinc-700 hover:border-white mb-8">Store Assets & Reset</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};