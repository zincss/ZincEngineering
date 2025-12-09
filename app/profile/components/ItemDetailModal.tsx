'use client';

import React from 'react';
import { X, Hash, Globe, BarChart3, Calendar, RefreshCw, Hammer, Gem, Loader2 } from 'lucide-react';
import { InventoryItem } from '../types';
import { ItemImage } from './ItemImage';

interface ItemDetailModalProps {
    item: InventoryItem;
    onClose: () => void;
    onQuickSell: () => void;
    onBreakdown: () => void;
    onEquip?: () => void;
    getRarityColor: (rarity: string) => string;
    loadingSupply: boolean;
    totalSupply: number | null;
}

// Config constants needed for display
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
        case 'COSMIC': return { percent: '???', label: 'ANOMALY' };
        case 'ZENITH': return { percent: '0.1%', label: 'MYTHIC' };
        case 'ULTRA': return { percent: '0.9%', label: 'LEGENDARY' };
        case 'SUPER_RARE': return { percent: '4.0%', label: 'EPIC' };
        case 'RARE': return { percent: '15.0%', label: 'RARE' };
        case 'UNCOMMON': return { percent: '30.0%', label: 'UNCOMMON' };
        default: return { percent: '50.0%', label: 'COMMON' };
    }
};

export const ItemDetailModal = ({ 
    item, onClose, onQuickSell, onBreakdown, onEquip, 
    getRarityColor, loadingSupply, totalSupply 
}: ItemDetailModalProps) => {
    
    const yieldData = BREAKDOWN_YIELDS[item.item_templates.rarity];

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className={`relative w-full md:max-w-lg bg-zinc-950 border-t-2 md:border-4 rounded-t-3xl md:rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[85vh] md:max-h-none ${getRarityColor(item.item_templates.rarity)}`} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-10"><X size={24} /></button>
                {item.is_shiny && <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-blue-500/10 pointer-events-none animate-pulse" />}
                
                <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${item.item_templates.rarity === 'ZENITH' ? 'bg-[#DFFF00] text-black' : 'bg-black/30'}`}>{item.item_templates.rarity}</span>
                        {item.is_shiny && <span className="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">PRISMATIC</span>}
                    </div>
                    
                    <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-6">
                        <ItemImage name={item.item_templates.name} rarity={item.item_templates.rarity} className="w-full h-full" />
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 text-white">{item.item_templates.name}</h2>
                    <p className="text-zinc-400 font-mono text-xs md:text-sm leading-relaxed mb-6 border-b border-white/10 pb-6">"{item.item_templates.description}"</p>
                    
                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left mb-6">
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center md:block">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1"><Hash size={12} /><span className="text-[10px] font-mono uppercase tracking-widest">Serial</span></div>
                            <div className="text-lg md:text-xl font-black text-white">#{item.serial_number}</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center md:block">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1"><Globe size={12} /><span className="text-[10px] font-mono uppercase tracking-widest">Circulating</span></div>
                            <div className="text-lg md:text-xl font-black text-white">{loadingSupply ? <Loader2 size={16} className="animate-spin" /> : totalSupply?.toLocaleString()}</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center md:block">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1"><BarChart3 size={12} /><span className="text-[10px] font-mono uppercase tracking-widest">Drop Rate</span></div>
                            <div className="text-lg md:text-xl font-black text-white">{getRarityStats(item.item_templates.rarity).percent}</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center md:block">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1"><Calendar size={12} /><span className="text-[10px] font-mono uppercase tracking-widest">Acquired</span></div>
                            <div className="text-sm font-bold text-white mt-1">{new Date(item.obtained_at).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="space-y-3">
                        {item.item_templates.rarity === 'COSMIC' && onEquip && (
                            <button onClick={onEquip} className="w-full py-4 bg-[#DFFF00] hover:bg-white text-black rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(223,255,0,0.3)] animate-pulse">
                                <Gem size={16} />
                                <span>Equip Profile Flair</span>
                            </button>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={onQuickSell} className="py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white rounded-xl flex flex-col items-center justify-center gap-1 font-black uppercase tracking-widest transition-all group">
                                <div className="flex items-center gap-2">
                                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform" />
                                    <span>Quick Sell</span>
                                </div>
                                <span className="text-xs font-mono text-zinc-500">+{QUICK_SELL_VALUES[item.item_templates.rarity] || 2} CR</span>
                            </button>

                            <button onClick={onBreakdown} className="py-4 bg-orange-900/20 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/50 rounded-xl flex flex-col items-center justify-center gap-1 font-black uppercase tracking-widest transition-all group">
                                <div className="flex items-center gap-2">
                                    <Hammer size={14} className="group-hover:-rotate-45 transition-transform" />
                                    <span>Scrap Item</span>
                                </div>
                                <span className="text-xs font-mono opacity-80">
                                    +{yieldData?.amount || 0} {yieldData?.label?.split(' ')[0] || 'Parts'}
                                </span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};