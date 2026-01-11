'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Gavel, Hammer, RefreshCw, X, Hash, ScanLine, Activity } from 'lucide-react';
import { RealAssetImage } from '@/app/market/components/shared';

interface ProfileAssetCardProps {
    item: any;
    onQuickSell: (id: string, rarity: string) => void;
    onBreakdown: (id: string, rarity: string) => void;
    onAuction: (item: any) => void;
    onView: (item: any) => void;
}

const getRarityColors = (rarity: string) => {
    switch (rarity) {
        case 'ZENITH': return { border: 'border-[#DFFF00]', text: 'text-[#DFFF00]', bg: 'bg-[#DFFF00]', glow: 'shadow-[0_0_15px_rgba(223,255,0,0.2)]' };
        case 'COSMIC': return { border: 'border-pink-500', text: 'text-pink-500', bg: 'bg-pink-500', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.2)]' };
        case 'ULTRA': return { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]' };
        case 'SUPER_RARE': return { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]' };
        case 'RARE': return { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500', glow: 'shadow-none' };
        case 'UNCOMMON': return { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-none' };
        default: return { border: 'border-zinc-700', text: 'text-zinc-500', bg: 'bg-zinc-700', glow: 'shadow-none' };
    }
};

export const ProfileAssetCard = ({ item, onQuickSell, onBreakdown, onAuction, onView }: ProfileAssetCardProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const colors = getRarityColors(item.rarity);

    // Handle clicks outside menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        setIsMenuOpen(false);
    };

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={`group relative w-full aspect-[2/3.5] flex flex-col rounded-[2rem] bg-zinc-950 border transition-all duration-500 ${colors.border} ${isMenuOpen ? 'z-40 ring-4 ring-white/10' : 'hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]'}`}
        >
            
            {/* --- CARD CLICK AREA (View Details) --- */}
            <div onClick={() => onView(item)} className="flex-1 flex flex-col relative overflow-hidden rounded-[2rem] cursor-pointer">
                
                {/* Background Glow */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 transition-opacity group-hover:opacity-40 ${colors.bg}`} />

                {/* Header: Serial & Rarity Indicator */}
                <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black font-mono text-zinc-400 border border-white/5 shadow-xl">
                            <Hash size={10} className={colors.text} />
                            <span>{String(item.serial_number).padStart(4, '0')}</span>
                        </div>
                        {item.isShiny && (
                            <div className="flex items-center gap-1.5 bg-[#DFFF00]/10 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black font-mono text-[#DFFF00] border border-[#DFFF00]/20 shadow-xl">
                                <ScanLine size={10} />
                                <span>SHINY</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Image Container */}
                <div className="relative flex-1 flex items-center justify-center p-6 mt-4">
                    {/* Perspective Image */}
                    <div className="w-full h-full relative z-10 perspective-1000">
                         <RealAssetImage 
                            name={item.name} 
                            searchQuery={item.searchQuery || item.name} 
                            className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-all duration-700 group-hover:scale-110 group-hover:rotate-2" 
                        />
                    </div>
                    
                    {/* Scanline & Grid Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 pointer-events-none bg-[size:100%_4px,3px_100%] opacity-20" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
                </div>

                {/* Footer: Name & Info */}
                <div className="relative z-10 bg-zinc-900/40 backdrop-blur-xl p-5 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentcolor] ${colors.bg}`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${colors.text}`}>
                            {item.rarity.replace('_', ' ')}
                        </span>
                    </div>
                    
                    <h3 className="text-sm font-black uppercase text-white leading-[1.1] line-clamp-2 tracking-tighter italic">
                        {item.name}
                    </h3>
                    
                    {/* Progress Bar (Visual Flavor) */}
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-1 bg-black rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`h-full opacity-50 ${colors.bg}`} 
                            />
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600 uppercase">Synced</span>
                    </div>
                </div>

                {/* Holographic Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.4)_40%,transparent_60%)] bg-[length:200%_100%] animate-[shimmer_3s_infinite_linear]" />
            </div>

            {/* --- ACTION BUTTON --- */}
            <div className="absolute top-3 right-3 z-30">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                    className={`
                        w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 backdrop-blur-xl border
                        ${isMenuOpen 
                            ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_20px_rgba(223,255,0,0.4)]' 
                            : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white'
                        }
                    `}
                >
                    {isMenuOpen ? <X size={14} /> : <MoreVertical size={14} />}
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.9, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 10 }}
                            className="absolute top-0 right-10 w-48 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50 ring-1 ring-white/10"
                        >
                            <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset_Actions</span>
                                <Activity size={10} className="text-zinc-700" />
                            </div>
                            
                            <div className="p-1.5">
                                <button onClick={(e) => handleAction(e, () => onAuction(item))} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-300 hover:text-black hover:bg-[#DFFF00] rounded-xl transition-all text-left">
                                    <Gavel size={14} /> List Auction
                                </button>

                                <button onClick={(e) => handleAction(e, () => onBreakdown(item.id, item.rarity))} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-300 hover:text-white hover:bg-orange-500/20 rounded-xl transition-all text-left">
                                    <Hammer size={14} /> Salvage Parts
                                </button>

                                <button onClick={(e) => handleAction(e, () => onQuickSell(item.id, item.rarity))} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition-all text-left mt-1">
                                    <RefreshCw size={14} /> Quick Sell
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </motion.div>
    );
};