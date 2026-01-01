'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Car, Box, Shield, Zap, DollarSign, 
    Warehouse, Lock 
} from 'lucide-react';
import SlotGrid from '../components/SlotGrid';
import { collectPropertyYield, purchaseUpgrade } from '../actions';
import { UPGRADES } from '../lib/data';

const TABS = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'inventory', label: 'Trophy Room', icon: Box },
    { id: 'garage', label: 'Garage', icon: Car },
    { id: 'upgrades', label: 'Upgrades', icon: Zap },
];

export default function PropertyDashboard({ property, inventory, vehicles, flavor }: any) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isCollecting, setIsCollecting] = useState(false);
    const [purchasingUpgrade, setPurchasingUpgrade] = useState<string | null>(null);

    // 1. Calculate Real-Time Yield
    const lastCol = new Date(property.last_yield_collection || property.purchased_at).getTime();
    
    // Base rate + Upgrades
    let currentRate = property.template.base_yield_rate || 10;
    const installedUpgrades = property.upgrades || [];
    
    installedUpgrades.forEach((slug: string) => {
        const def = UPGRADES.find(u => u.slug === slug);
        if (def && def.type === 'INCOME') currentRate += def.modifier;
    });

    // Amount = Hours Passed * Hourly Rate
    const yieldAmount = Math.floor(((Date.now() - lastCol) / 3600000) * currentRate);

    // 2. Actions
    const handleCollect = async () => {
        setIsCollecting(true);
        await collectPropertyYield(property.id, yieldAmount);
        setIsCollecting(false);
        // Refresh handled by server action revalidatePath
    };

    const handleBuyUpgrade = async (slug: string, cost: number) => {
        if(!confirm(`Install this upgrade for ${cost.toLocaleString()} Credits?`)) return;
        setPurchasingUpgrade(slug);
        await purchaseUpgrade(property.id, slug, cost);
        setPurchasingUpgrade(null);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 overflow-hidden">
            
            {/* IMMERSIVE BACKGROUND */}
            <div className={`fixed inset-0 z-0 ${flavor.interior_image} bg-cover bg-center opacity-20`} />
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-black" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
                
                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-white/10 pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs uppercase tracking-widest mb-2">
                            <Warehouse size={14} />
                            <span>{property.template.rarity} Residence // {property.template.name}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                            {flavor.tagline}
                        </h1>
                    </div>
                    
                    {/* YIELD COLLECTOR BUTTON */}
                    <button 
                        onClick={handleCollect}
                        disabled={yieldAmount <= 0 || isCollecting}
                        className="group relative overflow-hidden bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-4 min-w-[220px] transition-all"
                    >
                        <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <div className="relative z-10 text-left">
                            <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex justify-between">
                                <span>Pending Revenue</span>
                                <span className="text-white/50">{currentRate}/hr</span>
                            </div>
                            <div className="text-3xl font-mono font-black text-white flex items-center gap-2">
                                <DollarSign size={24} className="text-emerald-400" />
                                {isCollecting ? 'SYNCING...' : yieldAmount.toLocaleString()}
                            </div>
                        </div>
                    </button>
                </header>

                {/* NAVIGATION TABS */}
                <nav className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-3 px-6 py-3 rounded-xl border font-bold text-sm uppercase tracking-wide transition-all whitespace-nowrap
                                    ${isActive 
                                        ? 'bg-[#DFFF00] border-[#DFFF00] text-black shadow-[0_0_20px_rgba(223,255,0,0.3)]' 
                                        : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }
                                `}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>

                {/* MAIN CONTENT AREA */}
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 min-h-[600px] relative shadow-2xl">
                    <AnimatePresence mode="wait">
                        
                        {/* 1. COMMAND CENTER (Overview) */}
                        {activeTab === 'overview' && (
                            <motion.div 
                                key="overview"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                            >
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-xl font-bold uppercase italic text-white flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
                                        System Status
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Security Status */}
                                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                                            <div className="text-zinc-500 text-xs uppercase font-bold mb-2">Security Level</div>
                                            <div className="text-2xl font-mono text-emerald-400 flex items-center gap-2">
                                                <Shield size={24} /> 
                                                {installedUpgrades.some((u:string) => u.includes('security')) ? 'FORTIFIED' : 'STANDARD'}
                                            </div>
                                            <div className="mt-2 text-xs text-zinc-600">
                                                {installedUpgrades.some((u:string) => u.includes('security')) 
                                                    ? 'Active countermeasures engaged.' 
                                                    : 'Basic perimeter monitoring only.'}
                                            </div>
                                        </div>

                                        {/* Power / Yield Status */}
                                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                                            <div className="text-zinc-500 text-xs uppercase font-bold mb-2">Power Output</div>
                                            <div className="text-2xl font-mono text-[#DFFF00] flex items-center gap-2">
                                                <Zap size={24} /> {currentRate} CR/HR
                                            </div>
                                            <div className="mt-2 text-xs text-zinc-600">Operational efficiency at 100%.</div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="p-6 bg-zinc-950/50 rounded-2xl border border-white/5">
                                        <h4 className="text-sm font-bold text-zinc-300 mb-2">Property Details</h4>
                                        <p className="text-zinc-500 text-sm leading-relaxed">{flavor.description}</p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {flavor.features?.map((feat: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400 uppercase tracking-wider">
                                                    {feat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Preview */}
                                <div className="space-y-6">
                                    <div className="aspect-[4/5] rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
                                        <div className={`absolute inset-0 ${flavor.interior_image} bg-cover bg-center`} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="text-xs text-zinc-400 font-bold uppercase mb-1">Current Location</div>
                                            <div className="text-white font-black text-xl italic uppercase">Sector 7 // High-Rise</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. TROPHY ROOM (Inventory Display) */}
                        {activeTab === 'inventory' && (
                            <motion.div 
                                key="inventory"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold uppercase italic text-white">Asset Display Configuration</h3>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-zinc-400 uppercase tracking-widest border border-white/10">
                                        Slots: {property.template.max_display_slots || 4}
                                    </span>
                                </div>
                                
                                <SlotGrid 
                                    maxSlots={property.template.max_display_slots || 4} 
                                    currentSlots={property.slots} 
                                    propertyId={property.id}
                                    availableInventory={inventory}
                                    type="DISPLAY"
                                />
                            </motion.div>
                        )}

                        {/* 3. GARAGE */}
                        {activeTab === 'garage' && (
                            <motion.div 
                                key="garage"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {vehicles && vehicles.length > 0 ? vehicles.map((car: any) => (
                                    <div key={car.id} className="group relative bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden hover:border-[#DFFF00] transition-colors shadow-lg">
                                        <div className="aspect-video bg-zinc-900 relative flex items-center justify-center">
                                            <Car size={48} className="text-zinc-700 group-hover:text-white transition-colors" />
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-[10px] font-bold text-white uppercase">
                                                Stored
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="font-bold text-white text-lg">{car.model_name || 'Unknown Vehicle'}</div>
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="text-xs text-zinc-500 uppercase tracking-widest">Class A Transport</div>
                                                <div className="text-[#DFFF00] text-xs font-bold">READY</div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-24 text-center bg-black/20 rounded-2xl border border-white/5 border-dashed">
                                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                            <Lock className="text-zinc-600" />
                                        </div>
                                        <h3 className="text-zinc-500 font-bold uppercase mb-1">Garage Empty</h3>
                                        <p className="text-zinc-600 text-sm">Visit the Automotive Market to purchase vehicles.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                         {/* 4. UPGRADES STORE */}
                         {activeTab === 'upgrades' && (
                            <motion.div 
                                key="upgrades"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {UPGRADES.map((ug, i) => {
                                        const isOwned = installedUpgrades.includes(ug.slug);
                                        return (
                                            <div key={i} className={`
                                                relative p-6 rounded-2xl flex flex-col transition-all
                                                ${isOwned 
                                                    ? 'bg-emerald-950/20 border border-emerald-500/30' 
                                                    : 'bg-zinc-950 border border-white/10'
                                                }
                                            `}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-3 rounded-lg ${isOwned ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-900 text-zinc-400'}`}>
                                                        {ug.type === 'SECURITY' ? <Shield size={20}/> : 
                                                         ug.type === 'INCOME' ? <Zap size={20}/> : 
                                                         <Box size={20}/>}
                                                    </div>
                                                    <div className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-zinc-400 uppercase">{ug.type}</div>
                                                </div>
                                                
                                                <h4 className="font-bold text-white mb-1 text-lg">{ug.name}</h4>
                                                <p className="text-xs text-zinc-500 mb-6 flex-1 leading-relaxed">{ug.description}</p>
                                                
                                                {isOwned ? (
                                                    <div className="w-full py-3 bg-emerald-500/10 text-emerald-500 font-bold text-xs uppercase tracking-widest rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2">
                                                        <Shield size={14} /> Installed
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleBuyUpgrade(ug.slug, ug.cost)}
                                                        disabled={!!purchasingUpgrade}
                                                        className="w-full py-3 bg-white/5 hover:bg-[#DFFF00] hover:text-black text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 group"
                                                    >
                                                        {purchasingUpgrade === ug.slug ? 'Installing...' : `Purchase // ${ug.cost.toLocaleString()} CR`}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}