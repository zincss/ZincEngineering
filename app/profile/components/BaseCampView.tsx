'use client';

import React from 'react';
import { Package, ShieldAlert, Cpu, Hammer, Zap, Radio, Signal, Wifi, Activity } from 'lucide-react';
import { Material } from '../types';

interface TradeOffer {
    id: string;
    packName: string;
    costMaterial: string;
    costAmount: number;
    description: string;
    rarity: string;
}

interface Vendor {
    id: string;
    name: string;
    role: string;
    description: string;
    color: string;     // Tailwind border/text color class
    bgGradient: string; // Tailwind background gradient class
    icon: React.ElementType;
    trades: TradeOffer[];
}

// --- CONFIGURATION ---

const VENDORS: Vendor[] = [
    {
        id: 'SCRAPPER',
        name: 'The Scavenger',
        role: 'Salvage Specialist',
        description: 'Trades bulk junk for standard field supplies.',
        color: 'text-orange-500',
        bgGradient: 'from-orange-900/20 to-zinc-900',
        icon: Hammer,
        trades: [
            { id: 't1', packName: 'Basic Supply Crate', costMaterial: 'BASIC_SCRAP', costAmount: 50, description: 'Contains common essentials.', rarity: 'COMMON' },
            { id: 't2', packName: 'Reinforced Box', costMaterial: 'BASIC_SCRAP', costAmount: 150, description: 'Higher chance of uncommons.', rarity: 'UNCOMMON' }
        ]
    },
    {
        id: 'TECHIE',
        name: 'Circuit Breaker',
        role: 'Tech Broker',
        description: 'Exchanges electronic components for high-tech caches.',
        color: 'text-blue-500',
        bgGradient: 'from-blue-900/20 to-zinc-900',
        icon: Cpu,
        trades: [
            { id: 't3', packName: 'Electronics Kit', costMaterial: 'UNCOMMON_CIRCUITS', costAmount: 25, description: 'Parts for advanced gear.', rarity: 'RARE' },
            { id: 't4', packName: 'Data Cache', costMaterial: 'RARE_ALLOY', costAmount: 10, description: 'Contains rare blueprints.', rarity: 'SUPER_RARE' }
        ]
    },
    {
        id: 'SMUGGLER',
        name: 'Void Walker',
        role: 'Black Market Dealer',
        description: 'Demands exotic matter. Rewards are... significant.',
        color: 'text-purple-500',
        bgGradient: 'from-purple-900/20 to-zinc-900',
        icon: Zap,
        trades: [
            { id: 't5', packName: 'Anomaly Container', costMaterial: 'VOID_CRYSTAL', costAmount: 5, description: 'Unstable cosmic items.', rarity: 'ULTRA' },
            { id: 't6', packName: 'Zenith Vault', costMaterial: 'QUANTUM_SHARD', costAmount: 3, description: 'The pinnacle of tech.', rarity: 'ZENITH' }
        ]
    }
];

interface BaseCampViewProps {
    materials: Material[];
    onTrade: (costMat: string, costAmt: number, reward: string) => void;
}

export const BaseCampView = ({ materials, onTrade }: BaseCampViewProps) => {

    const getMaterialCount = (type: string) => {
        return materials.find(m => m.material_type === type)?.quantity || 0;
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite_linear]" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                            <Radio className="text-orange-500 animate-pulse" /> Forward Operating Base
                        </h2>
                        <p className="text-zinc-400 font-mono text-sm max-w-xl mt-2">
                            Establishing secure comms with local vendors. Trade scavenged resources for supply drops.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-900/50 rounded text-green-400 text-xs font-mono">
                        <Wifi size={12} className="animate-pulse" /> SIGNAL: STRONG
                    </div>
                </div>
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {VENDORS.map((vendor) => (
                    <div key={vendor.id} className="bg-zinc-950 border-2 border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-600 transition-colors shadow-2xl group">
                        
                        {/* Vendor "Comms" Header */}
                        <div className={`h-32 relative overflow-hidden bg-gradient-to-b ${vendor.bgGradient}`}>
                            {/* Animated Grid Background */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.2)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
                            
                            {/* Animated Signal Line */}
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10">
                                <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-full h-8 ${vendor.color} blur-xl opacity-20 animate-pulse`} />
                            </div>

                            {/* Center Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`p-4 rounded-full border-2 border-white/10 bg-black/50 backdrop-blur-sm ${vendor.color} shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500`}>
                                    <vendor.icon size={32} />
                                </div>
                            </div>

                            {/* Online Status */}
                            <div className="absolute top-3 right-3 flex gap-1 items-center">
                                <div className={`w-2 h-2 rounded-full ${vendor.color} bg-current animate-pulse`} />
                                <span className={`text-[9px] font-mono font-bold ${vendor.color} uppercase opacity-80`}>Online</span>
                            </div>
                        </div>

                        {/* Vendor Info */}
                        <div className="px-6 py-4 border-b border-zinc-900 relative">
                            <h3 className="text-xl font-black uppercase text-white tracking-wide">{vendor.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={12} className={vendor.color} />
                                <p className={`text-xs font-mono font-bold ${vendor.color} uppercase`}>{vendor.role}</p>
                            </div>
                            <p className="text-xs text-zinc-500 italic">"{vendor.description}"</p>
                        </div>

                        {/* Trade List */}
                        <div className="p-4 flex-1 flex flex-col gap-3 bg-zinc-900/30">
                            {vendor.trades.map((trade) => {
                                const userHas = getMaterialCount(trade.costMaterial);
                                const canAfford = userHas >= trade.costAmount;

                                return (
                                    <div key={trade.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg hover:border-zinc-700 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <Package size={16} className={trade.rarity === 'ZENITH' ? 'text-[#DFFF00]' : 'text-zinc-400'} />
                                                <span className="text-sm font-bold uppercase text-white">{trade.packName}</span>
                                            </div>
                                            {trade.rarity === 'ZENITH' && <span className="text-[9px] px-1 bg-[#DFFF00] text-black font-black rounded">MYTHIC</span>}
                                        </div>

                                        <div className="flex justify-between items-center bg-black/40 p-2 rounded mb-3 border border-white/5">
                                            <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                                REQ: <span className="text-zinc-300 font-mono">{trade.costMaterial.replace('_', ' ')}</span>
                                            </div>
                                            <div className={`text-xs font-mono font-bold ${canAfford ? 'text-white' : 'text-red-500'}`}>
                                                {userHas}/{trade.costAmount}
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => onTrade(trade.costMaterial, trade.costAmount, trade.packName)}
                                            disabled={!canAfford}
                                            className={`w-full py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2
                                                ${canAfford 
                                                    ? 'bg-zinc-100 text-black hover:bg-[#DFFF00] hover:scale-[1.02] shadow-lg' 
                                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}
                                            `}
                                        >
                                            {canAfford ? <><Signal size={12} /> INITIATE TRADE</> : 'INSUFFICIENT RESOURCES'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};