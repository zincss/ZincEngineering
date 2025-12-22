'use client'

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Gavel, Hammer, RefreshCw, X, Hash, ScanLine } from 'lucide-react';
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
        <div className={`group relative w-full aspect-[2/3] flex flex-col rounded-2xl bg-zinc-950 border transition-all duration-300 ${colors.border} ${isMenuOpen ? 'z-40 ring-2 ring-white/20' : 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:z-20'}`}>
            
            {/* --- CARD CLICK AREA (View Details) --- */}
            <div onClick={() => onView(item)} className="flex-1 flex flex-col relative overflow-hidden rounded-2xl cursor-pointer">
                
                {/* Header: Serial & Rarity Indicator */}
                <div className="absolute top-0 left-0 w-full p-3 z-10 flex justify-between items-start">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-1 rounded text-[9px] font-mono text-zinc-400 border border-white/5">
                        <Hash size={10} />
                        <span>{String(item.serial_number).padStart(4, '0')}</span>
                    </div>
                </div>

                {/* Main Image Container */}
                <div className="relative flex-1 bg-gradient-to-b from-zinc-900/50 to-zinc-950/80 overflow-hidden">
                    <div className="absolute inset-0 p-4 md:p-6 flex items-center justify-center">
                         <RealAssetImage 
                            name={item.name} 
                            searchQuery={item.searchQuery || item.name} 
                            className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" 
                        />
                    </div>
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[size:100%_4px,3px_100%] opacity-10" />
                </div>

                {/* Footer: Name & Info */}
                <div className="relative z-10 bg-zinc-950 p-3 md:p-4 border-t border-zinc-800">
                    <div className={`w-8 h-0.5 mb-2 rounded-full ${colors.bg}`} />
                    <h3 className="text-xs md:text-sm font-black uppercase text-white leading-tight line-clamp-2 tracking-tight">
                        {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${colors.text}`}>
                            {item.rarity.replace('_', ' ')}
                        </span>
                    </div>
                    
                    {/* Shiny Effect Overlay */}
                    {item.isShiny && (
                        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 bg-gradient-to-tr from-transparent via-white/40 to-transparent" />
                    )}
                </div>
            </div>

            {/* --- 3-DOTS ACTION MENU --- */}
            {/* Positioned absolute but safe from overflow clipping due to z-index management */}
            <div className="absolute top-2 right-2 z-30">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                    className={`
                        p-2 rounded-full transition-all duration-200 backdrop-blur-md border shadow-lg
                        ${isMenuOpen 
                            ? 'bg-white text-black border-white rotate-90' 
                            : 'bg-black/40 text-zinc-300 border-white/10 hover:bg-zinc-800 hover:text-white'
                        }
                    `}
                >
                    {isMenuOpen ? <X size={14} /> : <MoreVertical size={14} />}
                </button>

                {isMenuOpen && (
                    <div 
                        ref={menuRef}
                        className="absolute top-full right-0 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right"
                    >
                        <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Actions</span>
                        </div>
                        
                        <button onClick={(e) => handleAction(e, () => onAuction(item))} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-300 hover:text-black hover:bg-[#DFFF00] transition-colors text-left border-b border-zinc-800/50">
                            <Gavel size={14} /> List Auction
                        </button>

                        <button onClick={(e) => handleAction(e, () => onBreakdown(item.id, item.rarity))} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-300 hover:text-white hover:bg-orange-500/20 transition-colors text-left border-b border-zinc-800/50">
                            <Hammer size={14} /> Salvage Parts
                        </button>

                        <button onClick={(e) => handleAction(e, () => onQuickSell(item.id, item.rarity))} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600 transition-colors text-left">
                            <RefreshCw size={14} /> Quick Sell
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};