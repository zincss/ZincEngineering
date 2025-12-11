'use client'

import React from 'react';
import { RealAssetImage } from './shared';
import { Trophy, Wind, Activity, ScanLine, Lock } from 'lucide-react';

interface TradingCardProps {
  item: any;
  showDetails?: boolean;
  isLocked?: boolean; // NEW PROP
}

const getRarityConfig = (rarity: string) => {
  switch (rarity) {
    case 'ZENITH': return { color: '#DFFF00', border: 'border-[#DFFF00]', bg: 'bg-[#DFFF00]/10', text: 'text-[#DFFF00]', glow: 'shadow-[0_0_30px_rgba(223,255,0,0.15)]' };
    case 'COSMIC': return { color: '#EC4899', border: 'border-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-500', glow: 'shadow-[0_0_30px_rgba(236,72,153,0.15)]' };
    case 'ULTRA': return { color: '#A855F7', border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]' };
    case 'SUPER_RARE': return { color: '#F97316', border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]' };
    case 'RARE': return { color: '#3B82F6', border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' };
    case 'UNCOMMON': return { color: '#10B981', border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', glow: 'shadow-none' };
    default: return { color: '#71717A', border: 'border-zinc-700', bg: 'bg-zinc-800/50', text: 'text-zinc-500', glow: 'shadow-none' };
  }
};

export const TradingCard = ({ item, showDetails = true, isLocked = false }: TradingCardProps) => {
  const isCar = item.type === 'CAR';
  const config = getRarityConfig(item.rarity);
  
  const description = item.description || item.history || "No data available.";
  
  // If locked, show generic serial placeholder
  const serialNo = isLocked 
    ? '????' 
    : item.serial_number 
        ? String(item.serial_number).padStart(4, '0') 
        : Math.floor(Math.random() * 9000) + 1000;

  return (
    <div className={`
      relative group w-full h-full aspect-[2/3] rounded-3xl 
      bg-zinc-950 border ${isLocked ? 'border-zinc-800' : config.border} ${isLocked ? '' : config.glow}
      flex flex-col overflow-hidden transition-all duration-500 
      ${isLocked ? 'opacity-60 grayscale' : 'hover:scale-[1.02] hover:-translate-y-2'}
    `}>
      
      {/* LOCKED OVERLAY */}
      {isLocked && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <div className="p-4 rounded-full bg-zinc-900 border-2 border-zinc-700 mb-2">
                <Lock size={24} className="text-zinc-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Undiscovered</span>
        </div>
      )}

      {/* SHINY EFFECT */}
      {item.isShiny && !isLocked && (
        <div className="absolute inset-0 z-30 pointer-events-none opacity-40 mix-blend-overlay bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-shine" />
      )}
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      <div className="relative z-10 p-5 pb-0 flex justify-between items-start">
        <div className="flex flex-col">
           <div className="flex items-center gap-2 mb-1">
             <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-zinc-700' : config.bg.replace('/10', '')}`} />
             <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">
               {isLocked ? 'UNKNOWN' : `Z-ASSET // ${serialNo}`}
             </span>
           </div>
           <div className={`
             inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full 
             ${isLocked ? 'bg-zinc-900 border-zinc-800' : config.bg + ' border ' + config.border} border-opacity-30
           `}>
             <Activity size={12} className={isLocked ? 'text-zinc-600' : config.text} />
             <span className={`text-[10px] font-black uppercase tracking-wider ${isLocked ? 'text-zinc-600' : config.text}`}>
               {item.rarity.replace('_', ' ')}
             </span>
           </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-zinc-400">
           {isCar ? <Wind size={18} /> : <Trophy size={18} />}
        </div>
      </div>

      <div className="relative z-10 px-5 py-4">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group-hover:border-zinc-600 transition-colors shadow-inner">
            <div className="absolute inset-0 p-1">
               <div className="w-full h-full rounded-xl overflow-hidden relative">
                  {/* We still render image but it will be blurred by the parent container grayscale/opacity */}
                  <RealAssetImage 
                    name={item.name} 
                    searchQuery={item.searchQuery || item.name} 
                    className="w-full h-full object-cover opacity-90" 
                  />
               </div>
            </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 px-5 flex flex-col pb-4">
         <h3 className={`text-2xl font-black uppercase italic tracking-tighter leading-none mb-3 truncate ${isLocked ? 'text-zinc-700' : 'text-white'}`}>
            {item.name}
         </h3>

         <div className="flex-1 bg-zinc-900/50 rounded-xl border border-zinc-800 p-3 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800" />
            <p className="text-[10px] font-mono text-zinc-500 leading-relaxed pl-2 line-clamp-4">
              {isLocked ? "DATA_REDACTED // ACQUIRE TO DECRYPT LOGS." : description}
            </p>
         </div>
      </div>

      <div className="relative z-10 bg-zinc-900 border-t border-zinc-800 p-3 flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
         <span className="flex items-center gap-1">
            <ScanLine size={10} /> Verified Asset
         </span>
         <span>Zinc Eng. © 2025</span>
      </div>

    </div>
  );
};