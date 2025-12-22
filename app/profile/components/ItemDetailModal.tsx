'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/utils/supabase/client';
import { X, Hash, Globe, RefreshCw, Hammer, Gem, Loader2, ScanLine, Sparkles } from 'lucide-react';
import { InventoryItem } from '../types';
import { TradingCard } from '@/app/market/components/TradingCard';

interface EnrichedItem extends InventoryItem {
    sourceData?: {
        type?: string;
        searchQuery?: string;
        description?: string;
    };
}

interface ItemDetailModalProps {
    item: InventoryItem;
    onClose: () => void;
    onQuickSell: () => void;
    onBreakdown: () => void;
    onEquip?: () => void;
    getRarityColor: (rarity: string) => string;
}

// Config constants
const QUICK_SELL_VALUES: Record<string, number> = {
    'COMMON': 2, 'UNCOMMON': 5, 'RARE': 20, 'SUPER_RARE': 100, 
    'ULTRA': 500, 'ZENITH': 2000, 'COSMIC': 5000
};

const BREAKDOWN_YIELDS: Record<string, { type: string, label: string, amount: number }> = {
    'COMMON': { type: 'BASIC_SCRAP', label: 'Basic Scrap', amount: 3 },
    'UNCOMMON': { type: 'UNCOMMON_CIRCUITS', label: 'Uncommon Circuits', amount: 2 },
    'RARE': { type: 'RARE_ALLOY', label: 'Rare Alloy', amount: 1 },
    'SUPER_RARE': { type: 'PLASMA_CORE', label: 'Plasma Core', amount: 1 },
    'ULTRA': { type: 'VOID_CRYSTAL', label: 'Void Crystal', amount: 1 },
    'ZENITH': { type: 'QUANTUM_SHARD', label: 'Quantum Shard', amount: 1 },
    'COSMIC': { type: 'COSMIC_DUST', label: 'Cosmic Dust', amount: 5 }
};

const getRarityStats = (rarity: string) => {
    switch (rarity) {
        case 'COSMIC': return { percent: '???', label: 'ANOMALY', color: 'text-pink-500' };
        case 'ZENITH': return { percent: '0.1%', label: 'MYTHIC', color: 'text-[#DFFF00]' };
        case 'ULTRA': return { percent: '0.9%', label: 'LEGENDARY', color: 'text-purple-500' };
        case 'SUPER_RARE': return { percent: '4.0%', label: 'EPIC', color: 'text-orange-500' };
        case 'RARE': return { percent: '15.0%', label: 'RARE', color: 'text-blue-500' };
        case 'UNCOMMON': return { percent: '30.0%', label: 'UNCOMMON', color: 'text-emerald-500' };
        default: return { percent: '50.0%', label: 'COMMON', color: 'text-zinc-500' };
    }
};

export const ItemDetailModal = ({ 
    item, onClose, onQuickSell, onBreakdown, onEquip
}: ItemDetailModalProps) => {
    
    // --- PORTAL STATE ---
    const [mounted, setMounted] = useState(false);

    const [globalSupply, setGlobalSupply] = useState<number | null>(null);
    const [loadingSupply, setLoadingSupply] = useState(true);
    const supabase = createClient();

    const enrichedItem = item as EnrichedItem;
    const yieldData = BREAKDOWN_YIELDS[item.item_templates.rarity];
    const rarityStats = getRarityStats(item.item_templates.rarity);

    useEffect(() => {
        setMounted(true); // Signal that we are on client and can portal
        const fetchSupply = async () => {
            setLoadingSupply(true);
            const { count, error } = await supabase
                .from('user_items')
                .select('*', { count: 'exact', head: true })
                .eq('template_id', item.item_templates.id);
            
            if (!error) setGlobalSupply(count);
            setLoadingSupply(false);
        };
        fetchSupply();
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; }
    }, [item.item_templates.id]);

    // Map to TradingCard format
    const cardItem = {
        name: item.item_templates.name,
        rarity: item.item_templates.rarity,
        type: enrichedItem.sourceData?.type || 'ITEM',
        searchQuery: enrichedItem.sourceData?.searchQuery,
        description: enrichedItem.sourceData?.description || item.item_templates.description,
        serial_number: item.serial_number,
        isShiny: item.is_shiny
    };

    if (!mounted) return null;

    // --- RENDER VIA PORTAL ---
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 md:p-4" onClick={onClose}>
            
            <div 
                className="relative w-full h-full md:h-auto md:max-w-5xl bg-zinc-950 md:border border-zinc-800 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row md:max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button - Now GUARANTEED to be on top via Portal */}
                <div className="absolute top-4 right-4 z-[10000]">
                    <button onClick={onClose} className="p-3 bg-black/80 hover:bg-white hover:text-black text-zinc-400 rounded-full transition-all border border-zinc-700 backdrop-blur-md shadow-2xl">
                        <X size={20} />
                    </button>
                </div>

                {/* LEFT: CARD VISUAL */}
                <div className="w-full md:w-1/2 lg:w-5/12 bg-zinc-900/50 p-8 pt-16 md:pt-8 flex items-center justify-center relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent" />
                    
                    <div className="w-[60vw] md:w-full max-w-[280px] md:max-w-[320px] aspect-[2/3] relative z-10 animate-in zoom-in-95 duration-500 shadow-2xl">
                        <TradingCard item={cardItem} showDetails={false} />
                    </div>

                    {item.is_shiny && (
                         <div className="absolute inset-0 bg-gradient-to-tr from-[#DFFF00]/10 via-purple-500/10 to-blue-500/10 animate-pulse pointer-events-none mix-blend-overlay" />
                    )}
                </div>

                {/* RIGHT: INTEL & ACTIONS */}
                <div className="w-full md:w-1/2 lg:w-7/12 p-6 md:p-10 overflow-y-auto custom-scrollbar flex flex-col flex-1 bg-zinc-950 pb-24 md:pb-10">
                    
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                             <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-zinc-800 bg-zinc-900 ${rarityStats.color}`}>
                                {item.item_templates.rarity.replace('_', ' ')}
                             </div>
                             {item.is_shiny && (
                                 <div className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-yellow-500/50 bg-yellow-500/10 text-yellow-500 flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                     <Sparkles size={10} /> Prismatic Foil
                                 </div>
                             )}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-[0.9] break-words">
                            {item.item_templates.name}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1">
                                <Hash size={12} /> Serial
                            </div>
                            <div className="text-xl font-black text-white">
                                #{String(item.serial_number).padStart(4, '0')}
                            </div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1">
                                <Globe size={12} /> Global Count
                            </div>
                            <div className="text-xl font-black text-white">
                                {loadingSupply ? <Loader2 size={16} className="animate-spin" /> : globalSupply?.toLocaleString() ?? '-'}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-8 min-h-[100px]">
                        <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                             <ScanLine size={12} /> Asset Log
                        </div>
                        <p className="text-zinc-400 text-xs font-mono leading-relaxed">
                            {enrichedItem.sourceData?.description || item.item_templates.description || "No archival data found for this asset."}
                        </p>
                    </div>

                    <div className="mt-auto space-y-3">
                        {item.item_templates.rarity === 'COSMIC' && onEquip && (
                            <button onClick={onEquip} className="w-full py-4 bg-[#DFFF00] hover:bg-white text-black rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(223,255,0,0.3)] animate-pulse">
                                <Gem size={16} />
                                <span>Equip Flair</span>
                            </button>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={onQuickSell} className="py-4 bg-black border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 text-white rounded-xl flex flex-col items-center justify-center gap-1 transition-all group active:scale-95">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform text-zinc-500 group-hover:text-white" />
                                    <span>Quick Sell</span>
                                </div>
                                <span className="text-[10px] font-mono text-[#DFFF00]">+{QUICK_SELL_VALUES[item.item_templates.rarity] || 2} CR</span>
                            </button>

                            <button onClick={onBreakdown} className="py-4 bg-orange-950/10 border border-orange-900/30 hover:border-orange-500 hover:bg-orange-900/20 text-orange-500 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group active:scale-95">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                    <Hammer size={14} className="group-hover:-rotate-45 transition-transform" />
                                    <span>Scrap</span>
                                </div>
                                <span className="text-[10px] font-mono opacity-80">
                                    +{yieldData?.amount || 0} {yieldData?.label?.split(' ')[0] || 'Parts'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>,
        document.body // PORTAL TARGET
    );
};