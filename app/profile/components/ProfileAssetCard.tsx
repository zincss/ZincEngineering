'use client'

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Gavel, Hammer, RefreshCw, X } from 'lucide-react';
import { TradingCard } from '@/app/market/components/TradingCard';

interface ProfileAssetCardProps {
    item: any;
    onQuickSell: (id: string, rarity: string) => void;
    onBreakdown: (id: string, rarity: string) => void;
    onAuction: (item: any) => void;
    onView: (item: any) => void;
}

export const ProfileAssetCard = ({ item, onQuickSell, onBreakdown, onAuction, onView }: ProfileAssetCardProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        setIsMenuOpen(false);
    };

    return (
        <div className="group relative w-full aspect-[2/3] transition-all duration-300 hover:z-20">
            
            {/* MAIN CARD INTERACTION WRAPPER */}
            <div 
                onClick={() => onView(item)}
                className="w-full h-full cursor-pointer transition-transform duration-300 active:scale-95 group-hover:scale-[1.02] group-hover:-translate-y-2"
            >
                <TradingCard item={item} showDetails={false} />
            </div>

            {/* --- 3 DOTS MENU TOGGLE --- */}
            <button 
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                className={`
                    absolute top-3 right-3 z-30 p-2 rounded-full 
                    bg-black/60 backdrop-blur-md border border-white/10 text-white 
                    transition-all duration-200 hover:bg-white hover:text-black hover:scale-110
                    ${isMenuOpen ? 'opacity-100 bg-white text-black' : 'opacity-0 group-hover:opacity-100 md:opacity-0'} 
                    /* Mobile: Always visible if needed, or use group-hover for touch devices that support it */
                    touch-manipulation
                `}
            >
                {isMenuOpen ? <X size={14} /> : <MoreVertical size={14} />}
            </button>

            {/* --- DROPDOWN MENU --- */}
            {isMenuOpen && (
                <div 
                    ref={menuRef}
                    className="absolute top-12 right-3 z-40 w-48 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col"
                >
                    <div className="px-3 py-2 bg-zinc-900/50 border-b border-zinc-800">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Asset Options</span>
                    </div>
                    
                    <button 
                        onClick={(e) => handleAction(e, () => onAuction(item))}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                        <Gavel size={14} className="text-[#DFFF00]" />
                        List Auction
                    </button>

                    <button 
                        onClick={(e) => handleAction(e, () => onBreakdown(item.id, item.item_templates.rarity))}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                        <Hammer size={14} className="text-orange-500" />
                        Salvage Parts
                    </button>

                    <div className="h-px bg-zinc-800 mx-2" />

                    <button 
                        onClick={(e) => handleAction(e, () => onQuickSell(item.id, item.item_templates.rarity))}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-200 hover:bg-red-950/30 transition-colors text-left"
                    >
                        <RefreshCw size={14} />
                        Quick Sell
                    </button>
                </div>
            )}
        </div>
    );
};