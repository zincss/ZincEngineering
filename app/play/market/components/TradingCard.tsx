'use client'

import React from 'react';
import { RealAssetImage } from './shared';
import { Trophy, Wind, Activity, ScanLine, Hash, Gauge, Zap } from 'lucide-react';

interface TradingCardProps {
  item: any;
  showDetails?: boolean;
}

const getRarityConfig = (rarity: string) => {
  switch (rarity) {
    case 'ZENITH': return { 
      color: '#DFFF00', 
      border: 'border-[#DFFF00]', 
      bg: 'bg-[#DFFF00]/10',
      text: 'text-[#DFFF00]',
      glow: 'shadow-[0_0_30px_rgba(223,255,0,0.15)]'
    };
    case 'COSMIC': return { 
      color: '#EC4899', 
      border: 'border-pink-500', 
      bg: 'bg-pink-500/10',
      text: 'text-pink-500',
      glow: 'shadow-[0_0_30px_rgba(236,72,153,0.15)]'
    };
    case 'ULTRA': return { 
      color: '#A855F7', 
      border: 'border-purple-500', 
      bg: 'bg-purple-500/10',
      text: 'text-purple-500',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]'
    };
    case 'SUPER_RARE': return { 
      color: '#F97316', 
      border: 'border-orange-500', 
      bg: 'bg-orange-500/10',
      text: 'text-orange-500',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]'
    };
    case 'RARE': return { 
      color: '#3B82F6', 
      border: 'border-blue-500', 
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]'
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

export const TradingCard = ({ item, showDetails = true }: TradingCardProps) => {
  const isCar = item.type === 'CAR';
  const config = getRarityConfig(item.rarity);
  
  const description = item.description || item.history || "No data available.";
  const hp = isCar ? (description.length % 100) + 50 : 100;
  const serialNo = Math.floor(Math.random() * 9000) + 1000;

  return (
    <div className={`
      relative group w-[320px] h-[520px] rounded-3xl 
      bg-zinc-950 border ${config.border} ${config.glow}
      flex flex-col overflow-hidden transition-all duration-500 
      hover:scale-105 hover:-translate-y-2
    `}>
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      <div className="relative z-10 p-5 pb-0 flex justify-between items-start">
        <div className="flex flex-col">
           <div className="flex items-center gap-2 mb-1">
             <div className={`w-2 h-2 rounded-full ${config.bg.replace('/10', '')}`} />
             <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">
               Z-ASSET // {serialNo}
             </span>
           </div>
           <div className={`
             inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full 
             ${config.bg} border ${config.border} border-opacity-30
           `}>
             <Activity size={12} className={config.text} />
             <span className={`text-[10px] font-black uppercase tracking-wider ${config.text}`}>
               {item.rarity.replace('_', ' ')}
             </span>
           </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-zinc-400">
           {isCar ? <Wind size={18} /> : <Trophy size={18} />}
        </div>
      </div>

      <div className="relative z-10 px-5 py-4">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group-hover:border-zinc-600 transition-colors">
            
            <div className="absolute inset-0 p-1">
               <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <RealAssetImage 
                    name={item.name} 
                    searchQuery={item.searchQuery || item.name} 
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                  />
                  
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[size:100%_2px,3px_100%] opacity-30" />
                  
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/20" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/20" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/20" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/20" />
               </div>
            </div>

            {(item.rarity === 'ZENITH' || item.rarity === 'ULTRA') && (
               <div className={`absolute inset-0 bg-gradient-to-tr from-${config.color}/20 to-transparent opacity-30 animate-pulse pointer-events-none`} />
            )}
        </div>
      </div>

      <div className="relative z-10 flex-1 px-5 flex flex-col">
         <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none mb-3 truncate">
            {item.name}
         </h3>

         <div className="flex-1 bg-zinc-900/50 rounded-xl border border-zinc-800 p-3 mb-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800" />
            <p className="text-[10px] font-mono text-zinc-400 leading-relaxed pl-2 line-clamp-4">
              <span className="text-zinc-600 mr-2">LOG.ENTRY:</span>
              {description}
            </p>
         </div>

         {isCar && (
            <div className="grid grid-cols-3 gap-2 mb-5">
               <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-800 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">Speed</span>
                  <div className="flex items-center gap-1">
                      <Gauge size={10} className="text-zinc-400" />
                      <span className="text-xs font-bold text-white">200+</span>
                  </div>
               </div>
               <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-800 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">Accel</span>
                  <div className="flex items-center gap-1">
                      <Zap size={10} className="text-zinc-400" />
                      <span className="text-xs font-bold text-white">2.5s</span>
                  </div>
               </div>
               <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-800 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">Rating</span>
                  <div className="flex items-center gap-1">
                      <Hash size={10} className="text-zinc-400" />
                      <span className="text-xs font-bold text-white">{hp}</span>
                  </div>
               </div>
            </div>
         )}
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