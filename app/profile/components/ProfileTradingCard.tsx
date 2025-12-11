'use client'

import React from 'react';
import { ItemImage } from './ItemImage';
import { Trophy, Wind, Activity, ScanLine, Hash, Gauge, Zap } from 'lucide-react';

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
  const description = item.sourceData?.description || item.item_templates?.description || "No data.";
  const isCar = item.sourceData?.type === 'CAR';
  const searchQuery = item.sourceData?.searchQuery || name;
  const config = getRarityConfig(rarity);
  
  const hp = isCar ? (description.length % 100) + 50 : 100;

  return (
    <div 
      onClick={onClick}
      className={`
        relative group w-full aspect-[2/3] rounded-2xl 
        bg-zinc-950 border ${config.border} ${config.glow}
        flex flex-col overflow-hidden transition-all duration-300 
        hover:scale-[1.02] hover:-translate-y-1 cursor-pointer
      `}
    >
      
      {/* HEADER */}
      <div className="relative z-10 p-3 flex justify-between items-start">
        <div className="flex flex-col">
           <div className="flex items-center gap-1.5 mb-1">
             <div className={`w-1.5 h-1.5 rounded-full ${config.bg.replace('/10', '')}`} />
             <span className="text-[8px] font-mono font-bold text-zinc-500 tracking-widest uppercase">
               #{String(item.serial_number).padStart(4, '0')}
             </span>
           </div>
           <div className={`
             inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
             ${config.bg} border ${config.border} border-opacity-30
           `}>
             <Activity size={10} className={config.text} />
             <span className={`text-[8px] font-black uppercase tracking-wider ${config.text}`}>
               {rarity.replace('_', ' ')}
             </span>
           </div>
        </div>
      </div>

      {/* IMAGE */}
      <div className="relative z-10 px-3 py-1 flex-1 min-h-0">
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group-hover:border-zinc-600 transition-colors">
            <div className="absolute inset-0 p-0.5">
               <div className="w-full h-full rounded-lg overflow-hidden relative">
                  <ItemImage 
                    name={name} 
                    searchQuery={searchQuery} 
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                  />
                  
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[size:100%_2px,3px_100%] opacity-30" />
               </div>
            </div>
        </div>
      </div>

      {/* INFO */}
      <div className="relative z-10 px-3 pb-3 pt-2">
         <h3 className="text-sm md:text-base font-black uppercase italic tracking-tighter text-white leading-none mb-2 truncate">
            {name}
         </h3>

         {isCar && (
            <div className="grid grid-cols-3 gap-1">
               {/* Updated Layout: Removed vertical flex centering and added minimal styling for clearer text */}
               <div className="bg-zinc-900 rounded p-1.5 border border-zinc-800 text-center">
                  <div className="text-[7px] font-mono text-zinc-500 uppercase mb-0.5">Speed</div>
                  <div className="flex items-center justify-center gap-1">
                      <Gauge size={8} className="text-zinc-400" />
                      <span className="text-[9px] font-bold text-white">200+</span>
                  </div>
               </div>
               <div className="bg-zinc-900 rounded p-1.5 border border-zinc-800 text-center">
                  <div className="text-[7px] font-mono text-zinc-500 uppercase mb-0.5">Accel</div>
                  <div className="flex items-center justify-center gap-1">
                      <Zap size={8} className="text-zinc-400" />
                      <span className="text-[9px] font-bold text-white">2.5s</span>
                  </div>
               </div>
               <div className="bg-zinc-900 rounded p-1.5 border border-zinc-800 text-center">
                  <div className="text-[7px] font-mono text-zinc-500 uppercase mb-0.5">Rate</div>
                  <div className="flex items-center justify-center gap-1">
                      <Hash size={8} className="text-zinc-400" />
                      <span className="text-[9px] font-bold text-white">{hp}</span>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};