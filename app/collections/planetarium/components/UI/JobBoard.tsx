'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, Wifi, UploadCloud, ArrowUpCircle, Container, DollarSign, 
    Fuel, Zap, Briefcase, Pickaxe, ChevronDown, ChevronUp
} from 'lucide-react';
import { useSimulation, HaulingJob, MINING_RESOURCES } from '../../context';
import { FUEL_COST_PER_UNIT, BOOST_COST_PER_UNIT } from '../../constants';
import { Dealership } from '../Dealership';
import { Hangar } from './Hangar';

export function JobBoard({ onClose }: { onClose: () => void }) {
    const {
        availableJobs, acceptJob, activeJob, completeJob, credits, dockedAt, 
        findBody, fuel, buyFuel, boost, buyBoost, currentShip,
        inventory, sellResource, buyResource, getMarketForStation
    } = useSimulation();
    
    const locationBody = findBody(dockedAt);
    const marketData = dockedAt ? getMarketForStation(dockedAt) : null;

    const [viewState, setViewState] = useState<'docking' | 'board' | 'accepting' | 'launching'>('docking');
    const [acceptedJobDetails, setAcceptedJobDetails] = useState<HaulingJob | null>(null);

    // Tab State
    const [activeTab, setActiveTab] = useState<'jobs' | 'hangar' | 'dealership'>('jobs');
    const isDealershipAvailable = dockedAt === 'dreadnaught';

    // Market UI State
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const [tradeRowId, setTradeRowId] = useState<string | null>(null);
    const [tradeQty, setTradeQty] = useState<number>(1);

    const toggleTradeRow = (resId: string) => {
        if (tradeRowId === resId) {
            setTradeRowId(null);
            setTradeQty(1);
        } else {
            setTradeRowId(resId);
            setTradeQty(1);
        }
    };

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
                        <div className="w-24 h-24 border-2 border-dashed border-[#DFFF00] rounded-full flex items-center justify-center animate-spin-slow mb-6 relative">
                            <div className="absolute inset-2 border border-[#DFFF00]/30 rounded-full animate-ping-slow" />
                            <Lock size={32} className="text-[#DFFF00]" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 animate-pulse">
                            Docking Sequence
                        </h2>
                        <div className="text-[#DFFF00] font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                            <Wifi size={14} className="animate-pulse" />
                            Handshake Complete
                        </div>
                        <div className="mt-8 w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.8, ease: "easeInOut" }}
                                className="h-full bg-[#DFFF00]"
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
                        className="bg-zinc-900 border border-[#DFFF00] rounded-2xl p-10 flex flex-col items-center text-center max-w-lg w-full shadow-[0_0_50px_rgba(223,255,0,0.2)]"
                    >
                        <div className="w-16 h-16 bg-[#DFFF00] text-black rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
                            <UploadCloud size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
                            Contract <span className="text-[#DFFF00]">Secured</span>
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
                                <span className="text-[#DFFF00] font-mono font-bold text-lg">
                                    {findBody(acceptedJobDetails.destId)?.name || "Unknown"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Payment</span>
                                <span className="text-white font-mono font-bold text-lg">{acceptedJobDetails.reward} CR</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-[#DFFF00] font-mono text-xs uppercase tracking-widest opacity-80 animate-pulse">
                            <div className="w-2 h-2 bg-[#DFFF00] rounded-full" />
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
                            <ArrowUpCircle size={64} className="text-[#DFFF00] animate-bounce" />
                            <div className="absolute inset-0 bg-[#DFFF00] blur-xl opacity-30 animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                            Launching
                        </h2>
                        <div className="flex flex-col gap-1 text-[#DFFF00] font-mono text-xs uppercase tracking-widest opacity-80">
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Releasing Clamps...</motion.span>
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>Pressurizing Thrusters...</motion.span>
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>Guidance Internal...</motion.span>
                        </div>
                        <div className="mt-8 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.5, ease: "linear" }}
                                className="h-full bg-[#DFFF00]"
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
                        className="bg-zinc-900 border border-white/20 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col h-[80vh]"
                    >
                        <div className="bg-zinc-800 p-6 flex justify-between items-center border-b border-white/10 shrink-0">
                            <div>
                                <div className="text-[#DFFF00] font-mono text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#DFFF00] rounded-full animate-pulse" />
                                    Trading Terminal Online
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase">
                                    {locationBody?.name} <span className="text-zinc-500">Logistics</span>
                                </h2>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* TABS */}
                                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                                    <button
                                        onClick={() => setActiveTab('jobs')}
                                        className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'jobs' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Market
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('hangar')}
                                        className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'hangar' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Hangar
                                    </button>
                                    {isDealershipAvailable && (
                                        <button
                                            onClick={() => setActiveTab('dealership')}
                                            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'dealership' ? 'bg-[#DFFF00] text-black shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            <Container size={12} /> Shipyard
                                        </button>
                                    )}
                                </div>

                                <div className="text-right pl-6 border-l border-white/10">
                                    <div className="text-zinc-500 text-xs uppercase tracking-wider">Account Balance</div>
                                    <div className="text-xl font-mono text-[#DFFF00] flex items-center gap-1 justify-end">
                                        <DollarSign size={16} /> {credits.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">

                            {activeTab === 'dealership' && isDealershipAvailable ? (
                                <Dealership onClose={onClose} />
                            ) : activeTab === 'hangar' ? (
                                <Hangar onClose={onClose} />
                            ) : (
                                <div className="p-6 space-y-6">
                                    {/* Active Job Section */}
                                    {canDeliverActiveJob && (
                                        <div className="animate-in slide-in-from-left duration-500">
                                            <div className="text-[#DFFF00] text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                                <Briefcase size={14} className="animate-bounce" /> Incoming Delivery
                                            </div>
                                            <div className="bg-[#DFFF00]/10 border border-[#DFFF00] rounded-xl p-6 flex items-center justify-between">
                                                <div>
                                                    <div className="text-2xl font-black text-white uppercase">{activeJob?.description}</div>
                                                    <div className="text-[#DFFF00] font-mono text-sm mt-1">Cargo: {activeJob?.cargo}</div>
                                                </div>
                                                <button
                                                    onClick={() => { completeJob(); onClose(); }}
                                                    className="px-8 py-4 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl shadow-[0_0_30px_rgba(223,255,0,0.3)] transition-all hover:scale-105 active:scale-95"
                                                >
                                                    Complete Contract
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* REFUEL & REPAIR GRID */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Fuel Card */}
                                        <div className="bg-black/20 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFuelLow ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                                    <Fuel size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm">Reactor Fuel</div>
                                                    <div className="text-zinc-500 text-xs font-mono">
                                                        Level: <span className={isFuelLow ? "text-red-400" : "text-emerald-400"}>{Math.floor((fuel / currentShip.maxFuel) * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {fuelMissing > 10 ? (
                                                <button onClick={buyFuel} disabled={!canAffordFuel} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${canAffordFuel ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>Refuel (-{refuelCost} CR)</button>
                                            ) : (
                                                <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest opacity-60 px-4">Full</div>
                                            )}
                                        </div>

                                        {/* Boost Card */}
                                        <div className="bg-black/20 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isBoostLow ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                                    <Zap size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm">Injector Fluid</div>
                                                    <div className="text-zinc-500 text-xs font-mono">
                                                        Level: <span className={isBoostLow ? "text-orange-400" : "text-blue-400"}>{Math.floor((boost / currentShip.maxBoost) * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {boostMissing > 5 ? (
                                                <button onClick={buyBoost} disabled={!canAffordBoost} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${canAffordBoost ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>Refill (-{boostCost} CR)</button>
                                            ) : (
                                                <div className="text-blue-500 text-xs font-bold uppercase tracking-widest opacity-60 px-4">Full</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* DYNAMIC MARKET TABLE */}
                                    <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
                                        <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex justify-between items-center">
                                            <div className="flex items-center gap-6">
                                                <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <Pickaxe size={14} /> Local Commodities Market
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const el = document.getElementById('contracts-section');
                                                        el?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-[#DFFF00] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                                                >
                                                    <Briefcase size={12} /> Contracts Available
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Cargo Hold</div>
                                                    <div className="text-xs font-mono text-white">
                                                        {Object.values(inventory).reduce((a,b) => a+b, 0)} / {currentShip.miningCap} Units
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-zinc-600 font-mono uppercase">Prices update every 30m</div>
                                            </div>
                                        </div>
                                        
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/5 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                                                    <th className="px-6 py-3">Resource</th>
                                                    <th className="px-6 py-3 text-right">Market Price</th>
                                                    <th className="px-6 py-3">Saturation / Trend</th>
                                                    <th className="px-6 py-3 text-right">My Cargo</th>
                                                    <th className="px-6 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(MINING_RESOURCES).map(([resId, meta]: [string, any]) => {
                                                    const marketItem = marketData?.[resId];
                                                    const basePrice = meta.price;
                                                    const currentPrice = marketItem?.price || basePrice;
                                                    const saturation = marketItem?.saturation || 0;
                                                    const myQty = inventory[resId] || 0;
                                                    
                                                    const isHighPrice = currentPrice > basePrice;
                                                    const isSaturated = saturation >= 100;

                                                    const currentLoad = Object.values(inventory).reduce((a, b) => a + b, 0);
                                                    const maxLoad = currentShip.miningCap || 0;
                                                    const canFitMore = currentLoad < maxLoad;
                                                    
                                                    return (
                                                        <tr key={resId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                                                                    <span className="text-white font-bold text-sm">{meta.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 text-right font-mono">
                                                                <div className={isHighPrice ? "text-emerald-400" : "text-rose-400"}>
                                                                    {currentPrice} CR
                                                                </div>
                                                                <div className="text-[10px] text-zinc-600 uppercase tracking-tighter">
                                                                    Avg: {basePrice}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden min-w-[60px]">
                                                                        <div 
                                                                            className={`h-full ${isSaturated ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                                            style={{ width: `${Math.min(100, saturation)}%` }} 
                                                                        />
                                                                    </div>
                                                                    <div className="text-[10px] font-mono whitespace-nowrap">
                                                                        {isHighPrice ? (
                                                                            <span className="text-emerald-500 flex items-center gap-0.5"><ChevronUp size={10} /> +{Math.round(((currentPrice-basePrice)/basePrice)*100)}%</span>
                                                                        ) : (
                                                                            <span className="text-rose-500 flex items-center gap-0.5"><ChevronDown size={10} /> {Math.round(((currentPrice-basePrice)/basePrice)*100)}%</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                {myQty > 0 ? (
                                                                    <span className="text-white font-bold">{myQty}</span>
                                                                ) : (
                                                                    <span className="text-zinc-600">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <div className="flex items-center justify-end gap-3">
                                                                    {/* BUY TOOLS */}
                                                                    <div className="flex bg-black/40 rounded overflow-hidden border border-white/5">
                                                                        <button
                                                                            onClick={() => buyResource(resId, 1)}
                                                                            disabled={credits < currentPrice || !canFitMore}
                                                                            className="px-2 py-1 text-[9px] font-bold text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                        >
                                                                            BUY 1
                                                                        </button>
                                                                        <button
                                                                            onClick={() => buyResource(resId, 10)}
                                                                            disabled={credits < currentPrice * 10 || currentLoad + 10 > maxLoad}
                                                                            className="px-2 py-1 text-[9px] font-bold text-emerald-500 hover:bg-emerald-500/10 border-l border-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                        >
                                                                            10
                                                                        </button>
                                                                    </div>

                                                                    {/* SELL TOOLS */}
                                                                    <div className="flex bg-black/40 rounded overflow-hidden border border-white/5">
                                                                        <button
                                                                            onClick={() => sellResource(resId, 1)}
                                                                            disabled={myQty < 1 || isSaturated}
                                                                            className="px-2 py-1 text-[9px] font-bold text-purple-400 hover:bg-purple-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                        >
                                                                            SELL 1
                                                                        </button>
                                                                        <button
                                                                            onClick={() => sellResource(resId, 10)}
                                                                            disabled={myQty < 10 || isSaturated}
                                                                            className="px-2 py-1 text-[9px] font-bold text-purple-400 hover:bg-purple-500/10 border-l border-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                        >
                                                                            10
                                                                        </button>
                                                                        <button
                                                                            onClick={() => sellResource(resId, myQty)}
                                                                            disabled={myQty <= 0 || isSaturated}
                                                                            className="px-2 py-1 text-[9px] font-bold text-white bg-purple-600 hover:bg-purple-500 border-l border-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                        >
                                                                            ALL
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {!canDeliverActiveJob && availableJobs.length > 0 && (
                                        <div id="contracts-section">
                                            <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold mt-8 mb-3">
                                                <span>Hauling Contracts</span>
                                            </div>
                                            <div className="grid gap-3">
                                                {availableJobs.map(job => (
                                                    <div key={job.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-white/5 transition-colors group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-[#DFFF00]/10 flex items-center justify-center text-[#DFFF00]">
                                                                <Briefcase size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-bold text-sm group-hover:text-[#DFFF00] transition-colors">{job.description}</div>
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
                                                                className="bg-[#DFFF00] hover:bg-white text-black font-bold uppercase text-xs px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(223,255,0,0.1)]"
                                                            >
                                                                Accept
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-800/50 p-4 border-t border-white/10 flex justify-end gap-3 shrink-0">
                            <button onClick={handleLaunch} className="bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 text-sm font-bold uppercase tracking-wider px-6 py-2 rounded-lg transition-all">
                                Undock & Launch
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
