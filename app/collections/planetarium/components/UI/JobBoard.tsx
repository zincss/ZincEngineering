'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, Wifi, UploadCloud, ArrowUpCircle, Container, DollarSign, 
    Fuel, Zap, Briefcase, Pickaxe, ChevronDown, ChevronUp, Package, CheckCircle,
    Shield, Hexagon, Anchor, Zap as Lightning, Globe, Fish, Hammer, Gem
} from 'lucide-react';
import { useSimulation, HaulingJob, FulfillmentContract, MINING_RESOURCES } from '../../context';
import { FUEL_COST_PER_UNIT, BOOST_COST_PER_UNIT } from '../../constants';
import { Dealership } from '../Dealership';
import { Hangar } from './Hangar';

// Manufacturer Colors
const FACTION_THEMES: Record<string, string> = {
    'Zinc Aerospace': '#DFFF00',
    'Australian Dynamics': '#fbbf24',
    'Ares-Miltech': '#ef4444',
    'Titan Industries': '#f59e0b',
    'inTAKE racing': '#06b6d4',
    'Orbital Mechanics': '#d8b4fe',
    'Fishworx Staryard': '#EAB308',
    'Marse Movement': '#D4AF37',
    'Unknown': '#DFFF00'
};

const ManufacturerLogo = ({ owner, color, className = "" }: { owner: string, color: string, className?: string }) => {
    if (owner === 'Zinc Aerospace') return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="w-8 h-8 border-2 border-[#DFFF00] rounded-lg flex items-center justify-center font-black text-white text-sm bg-[#DFFF00]/10 shadow-lg shadow-[#DFFF00]/10">Z</div>
            <div className="flex flex-col leading-none text-white font-bold uppercase text-[9px] tracking-widest"><span>Zinc</span><span className="text-[7px] text-[#DFFF00]">Aero</span></div>
        </div>
    );
    if (owner === 'Australian Dynamics') return (
        <div className={`flex items-center gap-2 bg-zinc-900 border border-white/10 p-1.5 pr-4 rounded-lg ${className}`}>
            <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center text-black font-black text-[10px]">AD</div>
            <span className="text-[10px] font-black text-white tracking-widest uppercase">Aussie_Dyn</span>
        </div>
    );
    if (owner === 'Ares-Miltech') return (
        <div className={`flex items-center gap-2 bg-black/40 p-1.5 pr-6 border border-red-600/30 skew-x-[-12deg] ${className}`}>
            <div className="w-7 h-7 bg-red-600 flex items-center justify-center text-white"><Shield size={14} fill="currentColor" /></div>
            <span className="text-[10px] font-black italic text-white tracking-tighter uppercase">Ares_Mil</span>
        </div>
    );
    if (owner === 'Titan Industries') return (
        <div className={`flex items-center gap-2 bg-zinc-900/90 p-1.5 pr-6 border-l-4 border-orange-600 ${className}`}>
            <div className="w-8 h-8 bg-orange-600 flex items-center justify-center text-black font-black italic text-sm">T</div>
            <span className="text-sm font-black uppercase text-white tracking-tighter">TITAN</span>
        </div>
    );
    if (owner === 'inTAKE racing') return (
        <div className={`flex items-baseline gap-1 bg-black/40 p-2 px-6 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl ${className}`}>
            <span className="text-xl font-black italic text-cyan-400">in</span><span className="text-xl font-black italic text-white">TAKE</span>
        </div>
    );
    if (owner === 'Orbital Mechanics') return (
        <div className={`flex flex-col items-center bg-white/5 p-2 px-6 rounded-2xl border border-white/10 shadow-2xl ${className}`}>
            <div className="w-8 h-4 border-t border-x border-purple-400 rounded-t-full" />
            <span className="text-[8px] font-serif italic tracking-[0.4em] text-purple-200 mt-1 uppercase leading-none">Orbital</span>
        </div>
    );
    if (owner === 'Fishworx Staryard') return (
        <div className={`flex items-center gap-2 bg-slate-900/80 border border-yellow-500/30 p-1.5 pr-4 rounded-sm ${className}`}>
            <div className="w-7 h-7 bg-yellow-500 flex items-center justify-center text-black border border-yellow-600"><Hammer size={16} strokeWidth={2.5} /></div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tight">FISHWORX</span>
                <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-[0.1em]">HEAVY IND.</span>
            </div>
        </div>
    );
    if (owner === 'Marse Movement') return (
        <div className={`flex items-center gap-3 bg-black border border-yellow-400/30 p-2 px-4 rounded-full ${className}`}>
            <Gem size={16} className="text-yellow-400" />
            <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-serif font-bold text-white tracking-wider">MARSE</span>
                <span className="text-[5px] font-sans font-light text-yellow-400 tracking-[0.3em] uppercase">MOVEMENT</span>
            </div>
        </div>
    );
    
    // Default / Unknown
    return <Hexagon size={24} color={color} className={className} />;
};

// --- MARKET ROW COMPONENT ---
const MarketRow = ({ 
    resId, meta, basePrice, currentPrice, saturation, myQty, 
    credits, inventory, maxLoad, buyResource, sellResource, accentColor 
}: any) => {
    const [tradeQty, setTradeQty] = useState(1);
    const currentLoad = Object.values(inventory).reduce((a: number, b: any) => a + (b as number), 0);
    const freeSpace = Math.max(0, maxLoad - currentLoad);
    const maxAffordable = Math.floor(credits / (currentPrice || 1));
    const maxBuy = Math.min(freeSpace, maxAffordable);
    
    const isHighPrice = currentPrice > basePrice;
    const isLowPrice = currentPrice < basePrice;
    const isSaturated = saturation >= 100;

    // Reset qty if bounds change significantly
    useEffect(() => {
        if (tradeQty > Math.max(maxBuy, myQty) && Math.max(maxBuy, myQty) > 0) {
            setTradeQty(Math.max(1, Math.min(tradeQty, Math.max(maxBuy, myQty))));
        }
    }, [maxBuy, myQty]);

    const adjustQty = (amt: number) => {
        setTradeQty(prev => Math.max(1, Math.min(prev + amt, 999)));
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-sm shadow-[0_0_10px_currentColor]" style={{ backgroundColor: meta.color, color: meta.color }} />
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">{meta.name}</span>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-tighter">Refined Ore</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-center font-mono text-zinc-500 text-xs">
                {basePrice} CR
            </td>
            <td className="px-6 py-4 text-center font-mono text-sm">
                <div className={`flex flex-col items-center leading-none ${isLowPrice ? "text-emerald-400" : isHighPrice ? "text-rose-400" : "text-white"}`}>
                    <span>{currentPrice} CR</span>
                    <span className="text-[8px] mt-1 opacity-60 font-bold uppercase tracking-widest">
                        {isLowPrice ? '−' : isHighPrice ? '+' : ''}{Math.abs(((currentPrice-basePrice)/basePrice)*100).toFixed(0)}%
                    </span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden min-w-[60px] border border-white/5">
                        <div 
                            className={`h-full transition-all duration-1000 ${isSaturated ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(100, saturation)}%` }} 
                        />
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">{saturation}%</div>
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                {myQty > 0 ? (
                    <div className="flex flex-col items-center">
                        <span className="text-white font-bold text-sm">{myQty}</span>
                        <span className="text-[8px] text-zinc-500 uppercase">Stored</span>
                    </div>
                ) : (
                    <span className="text-zinc-800 font-mono">-</span>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-3">
                    {/* QUANTITY PICKER */}
                    <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-1 group-hover:border-white/20 transition-colors">
                        <button 
                            onClick={() => adjustQty(-1)} 
                            className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                        >
                            <ChevronDown size={14} />
                        </button>
                        <input 
                            type="number" 
                            value={tradeQty}
                            onChange={(e) => setTradeQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-10 bg-transparent text-center text-xs font-bold font-mono text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                            onClick={() => adjustQty(1)} 
                            className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                        >
                            <ChevronUp size={14} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button 
                            onClick={() => setTradeQty(Math.max(1, Math.max(maxBuy, myQty)))}
                            className="text-[8px] font-bold text-zinc-500 hover:text-[#DFFF00] transition-colors px-2"
                        >
                            MAX
                        </button>
                    </div>

                    {/* TRADE BUTTONS */}
                    <div className="flex flex-col items-end gap-1 min-w-[120px]">
                        <div className="flex gap-1.5 w-full">
                            <button
                                onClick={() => { buyResource(resId, tradeQty); setTradeQty(1); }}
                                disabled={credits < currentPrice * tradeQty || freeSpace < tradeQty}
                                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    credits >= currentPrice * tradeQty && freeSpace >= tradeQty
                                    ? 'bg-emerald-500 text-black hover:bg-white shadow-lg shadow-emerald-500/10'
                                    : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                                }`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => { sellResource(resId, tradeQty); setTradeQty(1); }}
                                disabled={myQty < tradeQty || isSaturated}
                                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    myQty >= tradeQty && !isSaturated
                                    ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/10'
                                    : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                                }`}
                            >
                                Sell
                            </button>
                        </div>
                        <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-tighter">
                            Total: <span className="text-zinc-300">{(currentPrice * tradeQty).toLocaleString()} CR</span>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
};

export function JobBoard({ onClose }: { onClose: () => void }) {
    const {
        availableJobs, acceptJob, activeJob, completeJob, credits, dockedAt, 
        findBody, fuel, buyFuel, boost, buyBoost, currentShip,
        inventory, sellResource, buyResource, getMarketForStation,
        contracts, generateContractsForLocation, fulfillContract
    } = useSimulation();
    
    const locationBody = findBody(dockedAt);
    const marketData = dockedAt ? getMarketForStation(dockedAt) : null;
    
    // Determine Station Theme
    const stationOwner = locationBody?.owner || 'Unknown';
    const accentColor = FACTION_THEMES[stationOwner] || FACTION_THEMES['Unknown'];

    const [viewState, setViewState] = useState<'docking' | 'board' | 'accepting' | 'launching'>('docking');
    const [acceptedJobDetails, setAcceptedJobDetails] = useState<HaulingJob | null>(null);

    // Tab State
    const [activeTab, setActiveTab] = useState<'market' | 'contracts' | 'hangar' | 'dealership'>('market');
    const isDealershipAvailable = dockedAt === 'dreadnaught' || dockedAt === 'earth' || dockedAt === 'mars' || dockedAt === 'fishworx_staryard';

    // Generate contracts when docking
    useEffect(() => {
        if (dockedAt && contracts.length === 0) {
            generateContractsForLocation(dockedAt);
        }
    }, [dockedAt, contracts.length, generateContractsForLocation]);

    useEffect(() => {
        if (viewState === 'docking') {
            const timer = setTimeout(() => setViewState('board'), 2000);
            return () => clearTimeout(timer);
        }
    }, [viewState]);

    const handleAccept = (job: HaulingJob) => {
        setAcceptedJobDetails(job);
        setViewState('accepting');

        setTimeout(() => {
            setViewState('launching');
            setTimeout(() => {
                acceptJob(job);
            }, 3000);
        }, 3500);
    };

    const handleLaunch = () => {
        setViewState('launching');
        setTimeout(() => {
            onClose();
        }, 2500);
    };

    // Use currentShip stats for calculations
    const fuelMissing = Math.max(0, currentShip.maxFuel - fuel);
    const refuelCost = Math.floor(fuelMissing * FUEL_COST_PER_UNIT);
    const canAffordFuel = credits >= refuelCost;
    const isFuelLow = fuel < (currentShip.maxFuel * 0.3);

    const boostMissing = Math.max(0, currentShip.maxBoost - boost);
    const boostCost = Math.floor(boostMissing * BOOST_COST_PER_UNIT);
    const canAffordBoost = credits >= boostCost;
    const isBoostLow = boost < (currentShip.maxBoost * 0.3);

    const canDeliverActiveJob = activeJob && activeJob.destId === dockedAt;

    // --- SUB-COMPONENTS ---

    const SidebarItem = ({ id, label, icon: Icon, active }: any) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm uppercase font-bold tracking-wider mb-1 group relative overflow-hidden ${
                active 
                ? 'text-black shadow-lg' 
                : 'text-zinc-500 hover:text-white'
            }`}
            style={active ? { backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}20` } : {}}
        >
            {!active && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
            <Icon size={16} /> {label}
        </button>
    );

    const ContractCard = ({ contract }: { contract: FulfillmentContract }) => {
        const canFulfill = Object.entries(contract.requirements).every(([res, qty]) => (inventory[res] || 0) >= qty);
        
        return (
            <div className="bg-black/40 border border-white/10 rounded-xl p-5 hover:bg-white/5 transition-colors relative overflow-hidden group">
                {/* Subtle hover glow based on faction color */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" style={{ backgroundColor: accentColor }} />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{contract.issuer}</div>
                        <h3 className="text-white font-bold text-lg">{contract.title}</h3>
                        <p className="text-zinc-400 text-xs mt-1 max-w-sm">{contract.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Reward</div>
                        <div className="font-mono font-bold text-xl" style={{ color: accentColor }}>{contract.reward.toLocaleString()} CR</div>
                    </div>
                </div>

                <div className="bg-black/40 rounded-lg p-3 border border-white/5 mb-4 relative z-10">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Required Resources</div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(contract.requirements).map(([res, qty]) => {
                            const have = inventory[res] || 0;
                            const isMet = have >= qty;
                            const meta = (MINING_RESOURCES as any)[res];
                            return (
                                <div key={res} className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-mono border ${isMet ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta?.color || '#fff' }} />
                                    <span>{res}: {have}/{qty}</span>
                                    {isMet && <CheckCircle size={10} />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end relative z-10">
                    <button 
                        onClick={() => fulfillContract(contract.id)}
                        disabled={!canFulfill}
                        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                            canFulfill 
                            ? 'text-black hover:bg-white' 
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                        style={canFulfill ? { backgroundColor: accentColor, boxShadow: `0 0 15px ${accentColor}40` } : {}}
                    >
                        {canFulfill ? 'Fulfill Contract' : 'Missing Resources'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <AnimatePresence mode="wait">

                {/* 1. DOCKING SEQUENCE */}
                {viewState === 'docking' && (
                    <motion.div
                        key="docking"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        className="flex flex-col items-center justify-center text-center max-w-md w-full"
                    >
                        <div 
                            className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center animate-spin-slow mb-6 relative"
                            style={{ borderColor: accentColor }}
                        >
                            <div className="absolute inset-2 border rounded-full animate-ping-slow" style={{ borderColor: `${accentColor}40` }} />
                            <Lock size={32} style={{ color: accentColor }} />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 animate-pulse">
                            Docking Sequence
                        </h2>
                        <div className="font-mono text-sm uppercase tracking-widest flex items-center gap-2" style={{ color: accentColor }}>
                            <Wifi size={14} className="animate-pulse" />
                            Handshake Complete
                        </div>
                        <div className="mt-8 w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.8, ease: "easeInOut" }}
                                className="h-full"
                                style={{ backgroundColor: accentColor }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* 2. JOB ACCEPTED ANIMATION */}
                {viewState === 'accepting' && acceptedJobDetails && (
                    <motion.div
                        key="accepting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        className="bg-zinc-900 border rounded-2xl p-10 flex flex-col items-center text-center max-w-lg w-full shadow-2xl"
                        style={{ borderColor: accentColor, boxShadow: `0 0 50px ${accentColor}20` }}
                    >
                        <div className="w-16 h-16 text-black rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce" style={{ backgroundColor: accentColor }}>
                            <UploadCloud size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
                            Contract <span style={{ color: accentColor }}>Secured</span>
                        </h2>
                        <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest mb-8">
                            Upload Complete // Manifest Updated
                        </p>

                        <div className="w-full bg-black/40 rounded-xl p-6 border border-white/10 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Cargo</span>
                                <span className="text-white font-mono font-bold text-lg">{acceptedJobDetails.cargo}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Destination</span>
                                <span className="font-mono font-bold text-lg" style={{ color: accentColor }}>
                                    {findBody(acceptedJobDetails.destId)?.name || "Unknown"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Payment</span>
                                <span className="text-white font-mono font-bold text-lg">{acceptedJobDetails.reward} CR</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest opacity-80 animate-pulse" style={{ color: accentColor }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                            Preparing for Departure...
                        </div>
                    </motion.div>
                )}

                {/* 3. LAUNCH SEQUENCE */}
                {viewState === 'launching' && (
                    <motion.div
                        key="launching"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
                        className="flex flex-col items-center justify-center text-center max-w-md w-full"
                    >
                        <div className="mb-6 relative">
                            <ArrowUpCircle size={64} className="animate-bounce" style={{ color: accentColor }} />
                            <div className="absolute inset-0 blur-xl opacity-30 animate-pulse" style={{ backgroundColor: accentColor }} />
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                            Launching
                        </h2>
                        <div className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest opacity-80" style={{ color: accentColor }}>
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Releasing Clamps...</motion.span>
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>Pressurizing Thrusters...</motion.span>
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>Guidance Internal...</motion.span>
                        </div>
                        <div className="mt-8 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.5, ease: "linear" }}
                                className="h-full"
                                style={{ backgroundColor: accentColor }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* 4. MAIN BOARD */}
                {viewState === 'board' && (
                    <motion.div
                        key="board"
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] overflow-hidden shadow-2xl flex relative"
                    >
                        {/* SIDEBAR */}
                        <div className="w-64 bg-zinc-900/80 backdrop-blur-md border-r border-white/10 p-6 flex flex-col justify-between shrink-0 relative z-10">
                            <div>
                                <div className="mb-8 border-b border-white/5 pb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <ManufacturerLogo owner={stationOwner} color={accentColor} />
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-4">
                                        Docked At
                                    </div>
                                    <h2 className="text-2xl font-black text-white leading-tight uppercase mb-1">{locationBody?.name}</h2>
                                    <div className="text-xs font-bold flex items-center gap-2" style={{ color: accentColor }}>
                                        {stationOwner} Station
                                    </div>
                                </div>

                                <nav>
                                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-3 px-2">Services</div>
                                    <SidebarItem id="market" label="Commodities" icon={Pickaxe} active={activeTab === 'market'} />
                                    <SidebarItem id="contracts" label="Contracts" icon={Briefcase} active={activeTab === 'contracts'} />
                                    <SidebarItem id="hangar" label="Hangar Bay" icon={Container} active={activeTab === 'hangar'} />
                                    {isDealershipAvailable && (
                                        <SidebarItem id="dealership" label="Shipyard" icon={Rocket} active={activeTab === 'dealership'} />
                                    )}
                                </nav>
                            </div>

                            <div className="space-y-4">
                                {/* Mini Status Cards */}
                                <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Fuel</span>
                                        <span className={`text-[10px] font-mono ${isFuelLow ? 'text-red-500' : 'text-emerald-500'}`}>{Math.floor((fuel/currentShip.maxFuel)*100)}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${isFuelLow ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(fuel/currentShip.maxFuel)*100}%` }} />
                                    </div>
                                    {fuelMissing > 10 && (
                                        <button onClick={buyFuel} disabled={!canAffordFuel} className="w-full mt-2 text-[9px] font-bold bg-white/5 hover:bg-white/10 text-zinc-300 py-1 rounded transition-colors">
                                            Refuel (-{refuelCost})
                                        </button>
                                    )}
                                </div>

                                <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Boost</span>
                                        <span className={`text-[10px] font-mono ${isBoostLow ? 'text-orange-500' : 'text-blue-500'}`}>{Math.floor((boost/currentShip.maxBoost)*100)}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${isBoostLow ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${(boost/currentShip.maxBoost)*100}%` }} />
                                    </div>
                                    {boostMissing > 5 && (
                                        <button onClick={buyBoost} disabled={!canAffordBoost} className="w-full mt-2 text-[9px] font-bold bg-white/5 hover:bg-white/10 text-zinc-300 py-1 rounded transition-colors">
                                            Recharge (-{boostCost})
                                        </button>
                                    )}
                                </div>

                                <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Cargo</span>
                                        <span className={`text-[10px] font-mono ${Object.values(inventory).reduce((a: number, b: any) => a + (b as number), 0) >= (currentShip.miningCap || 0) ? 'text-orange-500' : 'text-zinc-400'}`}>
                                            {Object.values(inventory).reduce((a: number, b: any) => a + (b as number), 0)} / {currentShip.miningCap || 0}
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#DFFF00]/60 transition-all duration-500" 
                                            style={{ width: `${(Object.values(inventory).reduce((a: number, b: any) => a + (b as number), 0) / (currentShip.miningCap || 1)) * 100}%` }} 
                                        />
                                    </div>
                                </div>

                                <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Balance</span>
                                        <span className="text-[10px] font-mono" style={{ color: accentColor }}>{credits.toLocaleString()} CR</span>
                                    </div>
                                </div>

                                <button onClick={handleLaunch} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <ArrowUpCircle size={14} /> Undock
                                </button>
                            </div>
                        </div>

                        {/* MAIN CONTENT */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950/50 relative z-10">
                            {/* Header / Top Bar */}
                            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/50 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    {activeTab === 'market' && <h1 className="text-xl font-bold text-white uppercase tracking-widest">Marketplace</h1>}
                                    {activeTab === 'contracts' && <h1 className="text-xl font-bold text-white uppercase tracking-widest">Fulfillment Contracts</h1>}
                                    {activeTab === 'hangar' && <h1 className="text-xl font-bold text-white uppercase tracking-widest">My Hangar</h1>}
                                    {activeTab === 'dealership' && <h1 className="text-xl font-bold text-white uppercase tracking-widest">Ship Dealership</h1>}
                                </div>
                                <div className="text-zinc-500 font-mono text-xs">
                                    System Time: {new Date().toLocaleTimeString()}
                                </div>
                            </div>

                            {/* Scrollable Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                                
                                {activeTab === 'dealership' && isDealershipAvailable ? (
                                    <Dealership onClose={onClose} />
                                ) : activeTab === 'hangar' ? (
                                    <Hangar onClose={onClose} />
                                ) : activeTab === 'contracts' ? (
                                    <div className="space-y-4 max-w-3xl mx-auto">
                                        {canDeliverActiveJob && (
                                            <div className="bg-opacity-10 border rounded-xl p-6 flex items-center justify-between mb-8 animate-in slide-in-from-top duration-500" style={{ backgroundColor: `${accentColor}10`, borderColor: accentColor }}>
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest font-bold mb-1 flex items-center gap-2" style={{ color: accentColor }}>
                                                        <Briefcase size={14} className="animate-bounce" /> Active Hauling Job
                                                    </div>
                                                    <div className="text-2xl font-black text-white uppercase">{activeJob?.description}</div>
                                                    <div className="text-zinc-400 font-mono text-sm mt-1">Cargo: {activeJob?.cargo}</div>
                                                </div>
                                                <button
                                                    onClick={() => { completeJob(); onClose(); }}
                                                    className="px-8 py-3 hover:bg-white text-black font-black uppercase tracking-widest text-sm rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                                                    style={{ backgroundColor: accentColor, boxShadow: `0 0 30px ${accentColor}30` }}
                                                >
                                                    Complete Delivery
                                                </button>
                                            </div>
                                        )}

                                        <div className="grid gap-4">
                                            {contracts.length > 0 ? contracts.map(c => (
                                                <ContractCard key={c.id} contract={c} />
                                            )) : (
                                                <div className="text-center py-12 text-zinc-600 font-mono uppercase">
                                                    No contracts available at this time.
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-white/10">
                                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Available Hauling Jobs (Transport)</h3>
                                            <div className="grid gap-3">
                                                {availableJobs.map(job => (
                                                    <div key={job.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-white/5 transition-colors group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                                                                <Package size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-bold text-sm group-hover:text-opacity-100 transition-colors" style={{ color: 'white' }}>{job.description}</div>
                                                                <div className="text-zinc-500 text-xs font-mono uppercase mt-1">Cargo: {job.cargo}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <div className="text-white font-mono font-bold">{job.reward} CR</div>
                                                                <div className="text-zinc-600 text-[10px] uppercase">Reward</div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAccept(job)}
                                                                className="hover:bg-white text-black font-bold uppercase text-xs px-4 py-2 rounded-lg transition-colors"
                                                                style={{ backgroundColor: accentColor }}
                                                            >
                                                                Accept
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                // MARKET TAB
                                <div className="max-w-5xl mx-auto pb-20">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <h2 className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">Trading Hub</h2>
                                            <div className="text-white text-sm font-medium">Local Market Dynamics active. Prices fluctuate based on station demand.</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#DFFF00]" />
                                                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Hold Space</span>
                                            </div>
                                            <div className="text-white font-mono font-bold text-sm">
                                                {Object.values(inventory).reduce((a: number, b: any) => a + (b as number), 0)} / {currentShip.miningCap || 0} <span className="text-[10px] text-zinc-500 font-normal ml-1">Units</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-white/5 text-zinc-500 text-[10px] uppercase font-bold tracking-wider bg-black/40">
                                                        <th className="px-6 py-4">Resource</th>
                                                        <th className="px-6 py-4 text-center">System Avg</th>
                                                        <th className="px-6 py-4 text-center">Local Price</th>
                                                        <th className="px-6 py-4">Demand</th>
                                                        <th className="px-6 py-4 text-center">My Cargo</th>
                                                        <th className="px-6 py-4 text-right min-w-[280px]">Trade Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(MINING_RESOURCES).map(([resId, meta]: [string, any]) => {
                                                        const marketItem = marketData?.[resId];
                                                        const basePrice = meta.price;
                                                        const currentPrice = marketItem?.price || basePrice;
                                                        const saturation = marketItem?.saturation || 0;
                                                        const myQty = inventory[resId] || 0;
                                                        
                                                        return (
                                                            <MarketRow 
                                                                key={resId}
                                                                resId={resId}
                                                                meta={meta}
                                                                basePrice={basePrice}
                                                                currentPrice={currentPrice}
                                                                saturation={saturation}
                                                                myQty={myQty}
                                                                credits={credits}
                                                                inventory={inventory}
                                                                maxLoad={currentShip.miningCap || 0}
                                                                buyResource={buyResource}
                                                                sellResource={sellResource}
                                                                accentColor={accentColor}
                                                            />
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper icon component since 'Rocket' was missing in imports
const Rocket = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
);