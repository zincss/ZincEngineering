'use client'

import React from 'react';
import { RealAssetImage } from '@/app/market/components/shared';
import { Trophy, Wind, Activity, ScanLine, Lock, Star, Shield, Flame, Crown } from 'lucide-react';

interface TradingCardProps {
  item: any;
  showDetails?: boolean;
  isLocked?: boolean;
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

// --- SPECIAL VARIANT: GRIDIRON LEGENDS ---
const GridironCard = ({ item, isLocked, serialNo, config }: any) => {
    const teamColor = item.color || '#333';
    
    // Split description to get position/team cleanly if possible
    const parts = item.description?.split('|') || [];
    const position = parts[0]?.trim() || 'PLY';
    const teamName = parts[1]?.trim() || 'LEGEND';
    
    return (
      <div className={`
        relative w-full h-full rounded-2xl overflow-hidden flex flex-col
        transition-all duration-500
        ${isLocked ? 'grayscale opacity-60' : 'hover:scale-[1.02] hover:-translate-y-2'}
      `}
      style={{
          background: isLocked ? '#18181b' : `linear-gradient(145deg, #09090b 0%, ${teamColor}40 100%)`,
          boxShadow: isLocked ? 'none' : `0 0 20px -5px ${teamColor}60`
      }}>
          
          {/* Dynamic Background Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff10 10px, #ffffff10 11px)' }} 
          />

          {/* Rarity Stripe */}
          <div className="absolute top-0 left-0 w-full h-1 z-50" style={{ backgroundColor: config.color }} />

          {/* Top Bar: Team & Position */}
          <div className="relative z-10 p-3 flex justify-between items-center bg-black/40 backdrop-blur-sm border-b border-white/10">
              <div className="flex flex-col leading-none">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest">Team</span>
                  <span className="text-xs font-black italic uppercase text-white shadow-black drop-shadow-md">{teamName}</span>
              </div>
              <div className="flex flex-col items-end leading-none">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest">Pos</span>
                  <span className="text-xl font-black text-white" style={{ textShadow: `0 0 10px ${teamColor}` }}>{position}</span>
              </div>
          </div>

          {/* Main Image Area */}
          <div className="relative flex-1 m-2 my-0 overflow-hidden rounded-lg border border-white/10 bg-black/20 group">
              {/* Image */}
              <div className="absolute inset-0">
                   <RealAssetImage 
                        name={item.name} 
                        searchQuery={item.searchQuery} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                   />
              </div>
              
              {/* Gradient Overlay for Text Visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              
              {/* Player Name (Bottom of Image) */}
              <div className="absolute bottom-2 left-2 right-2 z-20">
                  <h2 className="text-2xl font-black uppercase italic leading-none text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      {item.name.split(' ').map((n:string, i:number) => (
                          <span key={i} className="block">{n}</span>
                      ))}
                  </h2>
              </div>
          </div>

          {/* Stats / Info Bar */}
          <div className="relative z-10 px-3 py-2 grid grid-cols-3 gap-1 text-center bg-black/20">
              <div className="bg-black/40 rounded p-1 border border-white/5">
                  <div className="text-[8px] text-zinc-500 uppercase">ERA</div>
                  <div className="text-[9px] font-bold text-white">{parts[2]?.split('-')[0] || 'Unknown'}</div>
              </div>
              <div className="bg-black/40 rounded p-1 border border-white/5">
                  <div className="text-[8px] text-zinc-500 uppercase">Rarity</div>
                  <div className="text-[9px] font-bold" style={{ color: config.color }}>{item.rarity.substring(0,3)}</div>
              </div>
              <div className="bg-black/40 rounded p-1 border border-white/5">
                  <div className="text-[8px] text-zinc-500 uppercase">Serial</div>
                  <div className="text-[9px] font-bold text-zinc-300">#{serialNo}</div>
              </div>
          </div>

          {/* Decorative Footer */}
          <div className="relative z-10 h-6 bg-zinc-950 flex items-center justify-between px-3">
               <div className="flex gap-1">
                   {[...Array(5)].map((_, i) => (
                       <div key={i} className={`w-1 h-1 rounded-full ${i < 3 ? 'bg-zinc-600' : 'bg-zinc-800'}`} />
                   ))}
               </div>
               <div className="text-[8px] font-black italic text-zinc-600 uppercase">
                   GRIDIRON LEGENDS // 2025
               </div>
          </div>

          {/* Shiny Overlay for Premium Cards */}
          {!isLocked && ['ZENITH', 'ULTRA', 'SUPER_RARE'].includes(item.rarity) && (
              <div className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shine opacity-50 mix-blend-overlay" />
          )}

          {isLocked && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <Lock className="text-zinc-600" size={32} />
            </div>
          )}
      </div>
    );
};


// --- STANDARD ZINC VARIANT ---
const ZincCard = ({ item, isLocked, serialNo, config, description, isCar }: any) => (
    <div className={`
      relative group w-full h-full aspect-[2/3] rounded-3xl 
      bg-zinc-950 border ${isLocked ? 'border-zinc-800' : config.border} ${isLocked ? '' : config.glow}
      flex flex-col overflow-hidden transition-all duration-500 
      ${isLocked ? 'opacity-60 grayscale' : 'hover:scale-[1.02] hover:-translate-y-2'}
    `}>
      
      {isLocked && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <div className="p-4 rounded-full bg-zinc-900 border-2 border-zinc-700 mb-2">
                <Lock size={24} className="text-zinc-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Undiscovered</span>
        </div>
      )}

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
        <div className="relative aspect-square w-full rounded-[16px] overflow-hidden border border-zinc-800 bg-zinc-900 group-hover:border-zinc-600 transition-colors shadow-inner">
            <div className="absolute inset-0 p-1">
               <div className="w-full h-full rounded-[12px] relative" style={{ overflow: 'hidden' }}>
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
         <span className="flex items-[center] gap-1">
            <ScanLine size={10} /> Verified Asset
         </span>
         <span>Zinc Eng. © 2025</span>
      </div>
    </div>
);


// --- MAIN COMPONENT ---
export const TradingCard = ({ item, showDetails = true, isLocked = false }: TradingCardProps) => {
  const isCar = item.type === 'CAR';
  const isGridiron = item.type === 'NFL_PLAYER';
  const config = getRarityConfig(item.rarity);
  
  const description = item.description || item.history || "No data available.";
  
  const serialNo = isLocked 
    ? '????' 
    : item.serial_number 
        ? String(item.serial_number).padStart(4, '0') 
        : Math.floor(Math.random() * 9000) + 1000;

  if (isGridiron) {
      return <GridironCard item={item} isLocked={isLocked} serialNo={serialNo} config={config} />;
  }

  return <ZincCard item={item} isLocked={isLocked} serialNo={serialNo} config={config} description={description} isCar={isCar} />;
};