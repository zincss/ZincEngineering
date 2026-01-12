'use client'

import React, { useRef, useState } from 'react';
import { RealAssetImage } from '@/app/market/components/shared';
import { Trophy, Wind, Activity, ScanLine, Lock, Star, Shield, Flame, Crown } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TradingCardProps {
  item: any;
  showDetails?: boolean;
  isLocked?: boolean;
}

const getRarityConfig = (rarity: string) => {
  switch (rarity) {
    case 'ZENITH': return { color: '#DFFF00', border: 'border-[#DFFF00]', bg: 'bg-[#DFFF00]/10', text: 'text-[#DFFF00]', glow: 'shadow-[0_0_30px_rgba(223,255,0,0.3)]' };
    case 'COSMIC': return { color: '#EC4899', border: 'border-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-500', glow: 'shadow-[0_0_30px_rgba(236,72,153,0.3)]' };
    case 'ULTRA': return { color: '#A855F7', border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' };
    case 'SUPER_RARE': return { color: '#F97316', border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' };
    case 'RARE': return { color: '#3B82F6', border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' };
    case 'UNCOMMON': return { color: '#10B981', border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', glow: 'shadow-none' };
    default: return { color: '#71717A', border: 'border-zinc-700', bg: 'bg-zinc-800/50', text: 'text-zinc-500', glow: 'shadow-none' };
  }
};

// --- 3D TILT WRAPPER ---
const TiltCard = ({ children, isLocked, rarity }: { children: React.ReactNode, isLocked: boolean, rarity: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);
    
    // Glare moves opposite to rotation
    const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isLocked) return;
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            const width = rect.width;
            const height = rect.height;
            const mouseXPos = e.clientX - rect.left;
            const mouseYPos = e.clientY - rect.top;
            
            // Normalize to -0.5 to 0.5
            const xPct = (mouseXPos / width) - 0.5;
            const yPct = (mouseYPos / height) - 0.5;
            
            x.set(xPct);
            y.set(yPct);
        }
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const isHolo = ['ZENITH', 'ULTRA', 'SUPER_RARE'].includes(rarity);

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                rotateX: isLocked ? 0 : rotateX,
                rotateY: isLocked ? 0 : rotateY,
                transformStyle: "preserve-3d"
            }}
            className="w-full h-full relative will-change-transform"
        >
            {children}
            
            {/* HOLOGRAPHIC OVERLAY */}
            {!isLocked && isHolo && (
                <motion.div 
                    style={{
                        background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.3) 0%, transparent 60%)`,
                        mixBlendMode: "overlay",
                        pointerEvents: "none"
                    }}
                    className="absolute inset-0 z-40 rounded-2xl opacity-60"
                />
            )}
            {!isLocked && isHolo && (
                 <motion.div 
                    className="absolute inset-0 z-30 opacity-30 rounded-2xl pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-color-dodge"
                 />
            )}
        </motion.div>
    );
};

// --- SPECIAL VARIANT: GRIDIRON LEGENDS ---
const GridironCard = ({ item, isLocked, serialNo, config }: any) => {
    const teamColor = item.color || '#333';
    
    // Split description to get position/team cleanly if possible
    const parts = item.description?.split('|') || [];
    const position = parts[0]?.trim() || 'PLY';
    const teamName = parts[1]?.trim() || 'LEGEND';
    
    return (
      <TiltCard isLocked={isLocked} rarity={item.rarity}>
          <div className={`
            relative w-full h-full rounded-2xl overflow-hidden flex flex-col backface-hidden
            transition-all duration-500 bg-zinc-950 border border-white/10
            ${isLocked ? 'grayscale opacity-60' : ''}
          `}
          style={{
              boxShadow: isLocked ? 'none' : `0 10px 30px -10px ${teamColor}80`
          }}>
              
              {/* Dynamic Background Pattern */}
              <div className="absolute inset-0 z-0" style={{ background: `linear-gradient(160deg, #09090b 40%, ${teamColor} 120%)` }} />
              <div className="absolute inset-0 opacity-10 pointer-events-none z-0" 
                   style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 11px)' }} 
              />

              {/* Top Bar: Team & Position */}
              <div className="relative z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                  <div className="flex flex-col leading-none">
                      <span className="text-[8px] text-zinc-400 font-mono uppercase tracking-widest mb-1">Team</span>
                      <span className="text-sm font-black italic uppercase text-white drop-shadow-md">{teamName}</span>
                  </div>
                  <div className="flex flex-col items-end leading-none">
                      <div className="px-2 py-1 rounded bg-white text-black font-black text-xs transform skew-x-[-10deg] shadow-lg">
                        <span className="transform skew-x-[10deg] block">{position}</span>
                      </div>
                  </div>
              </div>

              {/* Main Image Area */}
              <div className="relative flex-1 mx-2 my-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 group shadow-inner">
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
                  <div className="absolute bottom-3 left-3 right-3 z-20">
                      <h2 className="text-3xl font-black uppercase italic leading-none text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '1px rgba(0,0,0,0.5)' }}>
                          {item.name.split(' ').map((n:string, i:number) => (
                              <span key={i} className="block">{n}</span>
                          ))}
                      </h2>
                  </div>
              </div>

              {/* Stats / Info Bar */}
              <div className="relative z-10 px-3 py-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-black/40 backdrop-blur-md rounded-lg p-1.5 border border-white/5">
                      <div className="text-[7px] text-zinc-500 uppercase tracking-widest mb-0.5">ERA</div>
                      <div className="text-[10px] font-bold text-white">{parts[2]?.split('-')[0] || 'Unknown'}</div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md rounded-lg p-1.5 border border-white/5">
                      <div className="text-[7px] text-zinc-500 uppercase tracking-widest mb-0.5">Class</div>
                      <div className="text-[10px] font-bold" style={{ color: config.color }}>{item.rarity.substring(0,3)}</div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md rounded-lg p-1.5 border border-white/5">
                      <div className="text-[7px] text-zinc-500 uppercase tracking-widest mb-0.5">Serial</div>
                      <div className="text-[10px] font-bold text-zinc-300">#{serialNo}</div>
                  </div>
              </div>

              {isLocked && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <Lock className="text-zinc-600" size={32} />
                </div>
              )}
          </div>
      </TiltCard>
    );
};


// --- STANDARD ZINC VARIANT ---
const ZincCard = ({ item, isLocked, serialNo, config, description, isCar }: any) => (
    <TiltCard isLocked={isLocked} rarity={item.rarity}>
        <div className={`
          relative group w-full h-full aspect-[2/3] rounded-3xl 
          bg-zinc-950 border ${isLocked ? 'border-zinc-800' : config.border}
          flex flex-col overflow-hidden transition-all duration-500 
          ${isLocked ? 'opacity-60 grayscale' : ''}
        `}
        style={{
             boxShadow: isLocked ? 'none' : `0 0 40px -10px ${config.color}40`
        }}>
          
          {isLocked && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="p-4 rounded-full bg-zinc-900 border-2 border-zinc-700 mb-2">
                    <Lock size={24} className="text-zinc-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Undiscovered</span>
            </div>
          )}
          
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-${config.color === '#DFFF00' ? '[#DFFF00]' : config.color.replace('text-', '').replace('-500', '-500')}/20 to-transparent blur-2xl rounded-bl-[100%]`} />
          
          <div className="relative z-10 p-5 pb-0 flex justify-between items-start">
            <div className="flex flex-col">
               <div className="flex items-center gap-2 mb-1.5">
                 <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-zinc-700' : 'bg-white shadow-[0_0_10px_white]'}`} />
                 <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-[0.2em] uppercase">
                   {isLocked ? 'UNKNOWN' : `Z-ASSET // ${serialNo}`}
                 </span>
               </div>
               <div className={`
                 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-zinc-900/80 backdrop-blur-sm
                 ${isLocked ? 'border-zinc-800' : config.border}
               `}>
                 <Activity size={12} className={isLocked ? 'text-zinc-600' : config.text} />
                 <span className={`text-[10px] font-black uppercase tracking-wider ${isLocked ? 'text-zinc-600' : config.text}`}>
                   {item.rarity.replace('_', ' ')}
                 </span>
               </div>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 shadow-xl">
               {isCar ? <Wind size={18} /> : <Trophy size={18} />}
            </div>
          </div>

          <div className="relative z-10 px-5 py-5">
            <div className={`relative aspect-square w-full rounded-[20px] overflow-hidden border-2 bg-zinc-900 group-hover:border-white/20 transition-colors shadow-2xl ${isLocked ? 'border-zinc-800' : config.border}`}>
                <div className="absolute inset-0 p-1.5">
                   <div className="w-full h-full rounded-[14px] relative overflow-hidden bg-zinc-950">
                      <RealAssetImage 
                        name={item.name} 
                        searchQuery={item.searchQuery || item.name} 
                        className="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-700" 
                      />
                   </div>
                </div>
            </div>
          </div>

          <div className="relative z-10 flex-1 px-5 flex flex-col pb-5">
             <h3 className={`text-2xl font-black uppercase italic tracking-tighter leading-none mb-3 truncate ${isLocked ? 'text-zinc-700' : 'text-white'}`}>
                {item.name}
             </h3>

             <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 p-3 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-white/10" />
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed pl-2 line-clamp-3">
                  {isLocked ? "DATA_REDACTED // ACQUIRE TO DECRYPT LOGS." : description}
                </p>
             </div>
          </div>

          <div className="relative z-10 bg-zinc-950/80 border-t border-white/5 p-3 flex justify-between items-center text-[8px] font-mono text-zinc-600 uppercase tracking-widest backdrop-blur-sm">
             <span className="flex items-center gap-1.5">
                <ScanLine size={10} /> Verified
             </span>
             <span>Zinc Eng. © 2025</span>
          </div>
        </div>
    </TiltCard>
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