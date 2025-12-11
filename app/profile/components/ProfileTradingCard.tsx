'use client'

import React from 'react';
import { ItemImage } from './ItemImage';
import { Activity } from 'lucide-react';

interface ProfileTradingCardProps {
  item: any; 
  onClick?: () => void;
}

const getRarityConfig = (rarity: string) => {
  switch (rarity) {
    case 'ZENITH': return { 
      color: '#DFFF00', 
      border: 'border-[#DFFF00]', 
      bg: 'bg-[#DFFF00]/10',
      text: 'text-[#DFFF00]',
      glow: 'shadow-[0_0_20px_rgba(223,255,0,0.15)]'
    };
    case 'COSMIC': return { 
      color: '#EC4899', 
      border: 'border-pink-500', 
      bg: 'bg-pink-500/10',
      text: 'text-pink-500',
      glow: 'shadow-[0_0_20px_rgba(236,72,153,0.15)]'
    };
    case 'ULTRA': return { 
      color: '#A855F7', 
      border: 'border-purple-500', 
      bg: 'bg-purple-500/10',
      text: 'text-purple-500',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]'
    };
    case 'SUPER_RARE': return { 
      color: '#F97316', 
      border: 'border-orange-500', 
      bg: 'bg-orange-500/10',
      text: 'text-orange-500',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)]'
    };
    case 'RARE': return { 
      color: '#3B82F6', 
      border: 'border-blue-500', 
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      glow: 'shadow-[0_0_10px_rgba(59,130,246,0.15)]'
    };
    case 'UNCOMMON': return { 
      color: '#10B981', 
      border: 'border-emerald-500', 
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-500',
      glow: 'shadow-none'
    };
    default: return { 
      color: '#71717A', 
      border: 'border-zinc-700', 
      bg: 'bg-zinc-800/50',
      text: 'text-zinc-500',
      glow: 'shadow-none'
    };
  }
};

export const ProfileTradingCard = ({ item, onClick }: ProfileTradingCardProps) => {
  const rarity = item.item_templates?.rarity || 'COMMON';
  const name = item.item_templates?.name || 'Unknown Item';
  const searchQuery = item.sourceData?.searchQuery || name;
  const config = getRarityConfig(rarity);

  return (
    <div 
      onClick={onClick}
      className={`
        relative group w-full aspect-[2/3] rounded-2xl 
        bg-zinc-950 border ${config.border} ${config.glow}
        overflow-hidden transition-all duration-300 
        hover:scale-[1.02] hover:-translate-y-1 cursor-pointer
        shadow-xl
      `}
    >
      
      {/* MAIN IMAGE LAYER */}
      <div className="absolute inset-0">
          <ItemImage 
            name={name} 
            searchQuery={searchQuery} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
          />
          {/* Subtle Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[size:100%_4px,3px_100%] opacity-20" />
          
          {/* Gradient Fade for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
      </div>

      {/* TOP HEADER: RARITY & SERIAL */}
      <div className="relative z-20 p-3 flex justify-between items-start">
         <div className={`
             inline-flex items-center gap-1.5 px-2 py-1 rounded-md 
             ${config.bg} border ${config.border} border-opacity-40 backdrop-blur-md
           `}>
             <Activity size={10} className={config.text} />
             <span className={`text-[8px] font-black uppercase tracking-wider ${config.text}`}>
               {rarity.replace('_', ' ')}
             </span>
         </div>
         
         <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
             <span className="text-[8px] font-mono font-bold text-zinc-400 tracking-widest">
               #{String(item.serial_number).padStart(4, '0')}
             </span>
         </div>
      </div>

      {/* BOTTOM INFO: NAME */}
      <div className="absolute bottom-0 left-0 w-full p-4 z-20">
         <div className="h-px w-8 bg-[#DFFF00] mb-2 opacity-50 group-hover:w-full transition-all duration-500" />
         <h3 className="text-lg font-black uppercase italic tracking-tighter text-white leading-none truncate drop-shadow-md">
            {name}
         </h3>
      </div>

      {/* HOVER GLOW FOR HIGH TIERS */}
      {(rarity === 'ZENITH' || rarity === 'COSMIC' || rarity === 'ULTRA') && (
         <div className={`absolute inset-0 border-2 ${config.border} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]`} />
      )}
      
    </div>
  );
};