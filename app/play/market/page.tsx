'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import { Package, Loader2, Sparkles, Star, Zap, Box, Info } from 'lucide-react';
import BackButton from '@/app/components/BackButton';

// --- 1. EXPANDED VISUAL DB (For the Reel Animation Only) ---
// This list populates the spinning reel to show the diversity of the new 120-item set.
const REEL_ITEMS_SOURCE = [
  { name: 'Plastic Spork', rarity: 'COMMON' }, { name: 'AA Battery', rarity: 'COMMON' },
  { name: 'Red Brick', rarity: 'COMMON' }, { name: 'Left Sock', rarity: 'COMMON' },
  { name: 'Vintage Toaster', rarity: 'UNCOMMON' }, { name: 'Lava Lamp', rarity: 'UNCOMMON' },
  { name: 'Gaming Chair', rarity: 'RARE' }, { name: 'Mechanical Keyboard', rarity: 'RARE' },
  { name: 'Espresso Machine', rarity: 'SUPER_RARE' }, { name: 'VR Headset', rarity: 'SUPER_RARE' },
  { name: 'Solid Gold Paperclip', rarity: 'ULTRA' }, { name: 'The Zinc Cube', rarity: 'ZENITH' },
  { name: 'Rubber Band', rarity: 'COMMON' }, { name: 'Coffee Mug', rarity: 'UNCOMMON' },
  { name: 'Drone', rarity: 'RARE' }, { name: 'Diamond Ring', rarity: 'ULTRA' },
  { name: 'Soda Can', rarity: 'COMMON' }, { name: 'Pizza Box', rarity: 'COMMON' },
  { name: 'Smart Watch', rarity: 'RARE' }, { name: 'Succulent', rarity: 'UNCOMMON' }
];

// --- 2. SMART PIXEL ICON SYSTEM ---
const BasePackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 2H19V22H5V2Z" fill="#18181b" stroke="#DFFF00" strokeWidth="2"/>
    <path d="M5 6H19" stroke="#DFFF00" strokeWidth="1"/>
    <path d="M5 18H19" stroke="#DFFF00" strokeWidth="1"/>
    <rect x="8" y="9" width="8" height="6" fill="#DFFF00" fillOpacity="0.2"/>
    <path d="M8 9L16 15" stroke="#DFFF00" strokeWidth="1"/>
    <path d="M16 9L8 15" stroke="#DFFF00" strokeWidth="1"/>
  </svg>
);

const PixelIcon = ({ name }: { name: string }) => {
  // A. Hand-Coded Heroes (For the Top Tier Items)
  const heroIcons: Record<string, React.ReactNode> = {
    'The Zinc Cube': <svg viewBox="0 0 24 24" className="w-full h-full text-zinc-900" fill="currentColor"><path d="M4 4h16v16H4V4z" className="text-black"/><path d="M8 8h8v8H8V8z" className="text-[#DFFF00] animate-pulse"/><path d="M10 10h4v4h-4v-4z" className="text-white"/></svg>,
    'Solid Gold Paperclip': <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-400" fill="currentColor"><path d="M8 6h2v12H8V6zm4-2h2v16h-2V4zm4 4h2v8h-2V8z"/><path d="M8 18h8v2H8v-2zM12 2h4v2h-4V2z"/></svg>,
    'Diamond Ring': <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M8 14a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" className="text-yellow-500"/><path d="M10 8l2-4l2 4l-2 2z" className="text-blue-300 animate-pulse"/></svg>,
    'Meteorite Chunk': <svg viewBox="0 0 24 24" className="w-full h-full text-zinc-600" fill="currentColor"><path d="M4 8l4-4l8 2l4 6l-2 8l-8 2l-6-6z"/><circle cx="8" cy="10" r="1" className="text-zinc-800"/><circle cx="14" cy="14" r="2" className="text-zinc-800"/></svg>,
  };

  if (heroIcons[name]) return heroIcons[name];

  // B. Procedural Categorizer
  const lowerName = name.toLowerCase();
  let type = 'misc';
  let colorClass = 'text-zinc-500';

  if (/(battery|phone|watch|camera|drone|printer|vacuum|router|drive|card|monitor|console|game|keyboard|mouse|headphone|webcam)/.test(lowerName)) { type = 'tech'; colorClass = 'text-blue-500'; }
  else if (/(spork|fork|spoon|knife|whisk|peeler|can|opener|cup|mug|thermos|bottle|plate|tray|toaster|espresso|blender)/.test(lowerName)) { type = 'kitchen'; colorClass = 'text-orange-400'; }
  else if (/(sock|shirt|beanie|cap|sneaker|bag|coat|jacket|shoe|boot|backpack|duffel)/.test(lowerName)) { type = 'clothing'; colorClass = 'text-red-400'; }
  else if (/(plant|succulent|leaf|flower|tree|cactus|dirt|rock|marble|stone)/.test(lowerName)) { type = 'nature'; colorClass = 'text-green-500'; }
  else if (/(paper|receipt|napkin|note|ticket|tag|cardboard|box|envelope)/.test(lowerName)) { type = 'paper'; colorClass = 'text-yellow-100'; }
  else if (/(brick|block|dice|cube|lego)/.test(lowerName)) { type = 'block'; colorClass = 'text-red-700'; }
  else if (/(tool|hammer|wrench|driver|tape|ruler|measure|compass|flashlight|knife)/.test(lowerName)) { type = 'tool'; colorClass = 'text-slate-400'; }
  else if (/(lamp|light|bulb|fan|switch|outlet|cord|plug)/.test(lowerName)) { type = 'electric'; colorClass = 'text-yellow-500'; }
  
  // C. Archetype Paths
  const paths: Record<string, React.ReactNode> = {
    tech: <path d="M6 4h12v14H6z M8 18h8v2H8z M9 8h6v6H9z" />, // Gadget Shape
    kitchen: <path d="M8 2h8v12h-2v8h-4v-8h-2z" />, // Utensil/Bottle Shape
    clothing: <path d="M4 6h16v4h-2v10H6V10H4z" />, // T-Shirt Shape
    nature: <path d="M12 2l4 6h-2v8h4v4H6v-4h4V8H8z" />, // Tree/Plant Shape
    paper: <path d="M6 2h12v20H6z M14 2v6h4" />, // Document Shape
    block: <path d="M4 4h16v16H4z M8 8h2v2H8z M14 14h2v2h-2z" />, // Cube Shape
    tool: <path d="M16 2l4 4l-4 4l-2-2l-8 8l-4 4l-2-2l4-4l8-8z" />, // Wrench Shape
    electric: <path d="M8 2h8v2h-2v4h4v6h-4v8H10v-8H6V8h4V4H8z" />, // Bulb Shape
    misc: <path d="M8 6h8v2h2v8h-2v2H8v-2H6V8h2z" /> // Orb Shape
  };

  return (
    <svg viewBox="0 0 24 24" className={`w-full h-full ${colorClass}`} fill="currentColor">
       {paths[type] || paths['misc']}
       <rect x="0" y="0" width="24" height="24" fill="url(#noise)" opacity="0.1" />
    </svg>
  );
};

// --- 3. ANIMATION STYLES ---
const animationStyles = `
  @keyframes shake {
    0% { transform: translate(1px, 1px) rotate(0deg); }
    10% { transform: translate(-1px, -2px) rotate(-1deg); }
    20% { transform: translate(-3px, 0px) rotate(1deg); }
    30% { transform: translate(3px, 2px) rotate(0deg); }
    40% { transform: translate(1px, -1px) rotate(1deg); }
    50% { transform: translate(-1px, 2px) rotate(-1deg); }
    60% { transform: translate(-3px, 1px) rotate(0deg); }
    70% { transform: translate(3px, 1px) rotate(-1deg); }
    80% { transform: translate(-1px, -1px) rotate(1deg); }
    90% { transform: translate(1px, 2px) rotate(0deg); }
    100% { transform: translate(1px, -2px) rotate(-1deg); }
  }
  @keyframes scroll-reel {
    0% { transform: translateY(0); }
    100% { transform: translateY(calc(-100% + 192px)); }
  }
  .animate-rumble {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite;
  }
  .animate-scroll {
    animation: scroll-reel 6s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .animate-glitch {
    animation: shake 0.2s steps(2) infinite;
    filter: hue-rotate(90deg);
  }
  .foil-gradient {
    background: linear-gradient(135deg, #18181b 0%, #000 100%);
    position: relative;
    overflow: hidden;
  }
  .foil-gradient::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to right, 
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.1) 30%, 
      rgba(223, 255, 0, 0.2) 40%,
      rgba(255, 0, 255, 0.2) 50%,
      rgba(0, 255, 255, 0.2) 60%,
      rgba(255,255,255,0.1) 70%,
      rgba(255,255,255,0) 100%
    );
    transform: rotate(30deg);
    animation: foil-shine 6s linear infinite;
    pointer-events: none;
  }
  @keyframes foil-shine {
    0% { transform: translate(-50%, -50%) rotate(30deg); }
    100% { transform: translate(20%, 20%) rotate(30deg); }
  }
`;

export default function MarketPage() {
  const { user, profile, refreshProfile } = useAuth();
  
  // States
  const [stage, setStage] = useState<'IDLE' | 'RUMBLE' | 'SCROLLING' | 'REVEAL'>('IDLE');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Reel State
  const [scrollItems, setScrollItems] = useState<{name: string, rarity: string}[]>([]);

  const handleOpenPack = async () => {
    if (!profile || profile.credits < 100) {
        alert("INSUFFICIENT FUNDS");
        return;
    }

    setStage('RUMBLE');
    setError('');

    try {
        const { data, error } = await supabase.rpc('open_base_set_pack');
        
        if (error) throw error;
        if (data && data.error === 'INSUFFICIENT_FUNDS') throw new Error("Insufficient Funds");

        // 1. Prepare Reel
        const randomFillers = Array.from({ length: 60 }, () => 
            REEL_ITEMS_SOURCE[Math.floor(Math.random() * REEL_ITEMS_SOURCE.length)]
        );
        setScrollItems([...randomFillers, { name: data.name, rarity: data.rarity }]);

        setResult(data);
        refreshProfile();

        setTimeout(() => {
            setStage('SCROLLING');
            setTimeout(() => {
                setStage('REVEAL');
            }, 6000);
        }, 1500);

    } catch (err: any) {
        setError(err.message);
        setStage('IDLE');
    }
  };

  const reset = () => {
      setResult(null);
      setStage('IDLE');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* 1. GLOBAL BACKDROP DIMMER */}
      <div className={`
          fixed inset-0 z-[90] bg-black/95 transition-all duration-700
          ${stage !== 'IDLE' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
      `} />

      {/* HEADER */}
      <div className={`
          relative z-10 transition-all duration-700 ease-in-out
          ${stage !== 'IDLE' ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
      `}>
          <BackButton href="/play" label="ARCADE HUB" />
          <div className="pt-32 pb-12 px-6 max-w-[1600px] mx-auto border-b border-zinc-800">
            <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-sm font-black tracking-widest uppercase mb-4">
                <Package size={16} />
                <span>GLOBAL_MARKET // PACK_OPENING</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                Asset <span className="text-zinc-700">Acquisition</span>
            </h1>
          </div>
      </div>

      {/* MAIN CONTENT (Centered Pack Selection) */}
      <div className="flex-1 w-full flex items-center justify-center relative z-20 min-h-[500px]">
        
        {/* PACK CARD */}
        <div className={`
            w-full max-w-md transition-all duration-500 ease-in-out px-4
            ${stage !== 'IDLE' ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
        `}>
            <div className="group relative border border-zinc-800 bg-zinc-900/30 rounded-3xl p-8 hover:border-[#DFFF00] transition-all duration-500">
                <div className="absolute top-4 right-4 bg-[#DFFF00] text-black font-bold font-mono text-[10px] px-3 py-1 rounded uppercase shadow-[0_0_15px_rgba(223,255,0,0.4)] z-20">
                    Series 1
                </div>

                <div className="flex justify-center py-10">
                    <div className="relative w-48 h-64 foil-gradient rounded-xl border border-white/20 shadow-2xl flex flex-col items-center justify-center p-4 transform group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/20 to-transparent opacity-50 border-b border-white/10" />
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/20 to-transparent opacity-50 border-t border-white/10" />
                        <div className="bg-black/80 backdrop-blur border border-[#DFFF00] rounded-lg p-3 mb-2 w-16 h-16 flex items-center justify-center">
                             <BasePackIcon />
                        </div>
                        <h3 className="text-2xl font-black uppercase text-white italic tracking-tighter text-center leading-none mt-2">BASE<br/>PACK NO.1</h3>
                        <div className="mt-4 text-[8px] font-mono uppercase bg-white text-black px-2 py-0.5 rounded-sm">
                            120 Collectibles
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-zinc-400 font-mono text-xs leading-relaxed">
                            Standard issue household artifacts. Includes chance for <span className="text-[#DFFF00] font-bold">Prismatic (Shiny)</span> variants.
                        </p>
                    </div>

                    <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden">
                        <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                                <Info size={12}/> Odds Protocol
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Per Pack</span>
                        </div>
                        <div className="grid grid-cols-2 text-[10px] font-mono uppercase">
                             <div className="p-2 border-r border-b border-zinc-800 text-zinc-400">Common</div>
                             <div className="p-2 border-b border-zinc-800 text-right text-zinc-400">50.0%</div>
                             <div className="p-2 border-r border-b border-zinc-800 text-green-500">Uncommon</div>
                             <div className="p-2 border-b border-zinc-800 text-right text-green-500">30.0%</div>
                             <div className="p-2 border-r border-b border-zinc-800 text-blue-500">Rare</div>
                             <div className="p-2 border-b border-zinc-800 text-right text-blue-500">15.0%</div>
                             <div className="p-2 border-r border-b border-zinc-800 text-orange-500">Super Rare</div>
                             <div className="p-2 border-b border-zinc-800 text-right text-orange-500">4.0%</div>
                             <div className="p-2 border-r border-b border-zinc-800 text-purple-500">Ultra</div>
                             <div className="p-2 border-b border-zinc-800 text-right text-purple-500">0.9%</div>
                             <div className="p-2 border-r border-zinc-800 text-[#DFFF00] bg-[#DFFF00]/5 font-bold">Zenith</div>
                             <div className="p-2 text-right text-[#DFFF00] bg-[#DFFF00]/5 font-bold">0.1%</div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleOpenPack}
                    disabled={(profile?.credits || 0) < 100}
                    className="w-full mt-6 bg-white text-black font-black uppercase py-4 rounded-xl hover:bg-[#DFFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                    <span>Authorize Payment (100)</span>
                    <Zap size={16} fill="currentColor" />
                </button>
                {error && <div className="text-red-500 text-center text-xs font-mono mt-4">{error}</div>}
            </div>
        </div>
      </div>

      {/* --- CENTER STAGE GLASS WINDOW --- */}
      <div className={`
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] 
          w-[95vw] max-w-lg md:max-w-2xl h-[60vh] md:h-[700px]
          transition-all duration-500 ease-out flex flex-col items-center justify-center
          ${stage !== 'IDLE' ? 'scale-100 opacity-100 visible' : 'scale-90 opacity-0 invisible pointer-events-none'}
      `}>
          <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-[#DFFF00]/50 bg-zinc-950 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col items-center justify-center relative">
              
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-black pointer-events-none" />

              {/* RUMBLE STATE */}
              {stage === 'RUMBLE' && (
                  <div className="animate-rumble relative z-10 scale-75 md:scale-100">
                      <div className="w-48 h-64 foil-gradient rounded-xl border border-white/30 flex items-center justify-center shadow-[0_0_50px_rgba(223,255,0,0.5)]">
                          <div className="w-16 h-16"><BasePackIcon /></div>
                      </div>
                  </div>
              )}

              {/* SCROLLING STATE */}
              {stage === 'SCROLLING' && (
                  <div className="relative h-64 md:h-96 w-64 md:w-80 overflow-hidden border-y-4 border-[#DFFF00] bg-zinc-900 rounded-lg shadow-2xl z-10">
                      <div className="animate-scroll">
                          {scrollItems.map((item, i) => (
                              <div key={i} className={`
                                  h-32 md:h-48 w-full flex flex-col items-center justify-center border-b p-4
                                  ${getScrollRarityStyle(item.rarity)}
                              `}>
                                  <div className="w-16 h-16 md:w-20 md:h-20 opacity-90 drop-shadow-xl transform scale-110">
                                      <PixelIcon name={item.name} />
                                  </div>
                                  <div className="flex flex-col items-center mt-3 bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
                                      <span className="text-[10px] md:text-[12px] font-mono uppercase text-white font-black text-center leading-none">{item.name}</span>
                                      <span className={`text-[8px] md:text-[9px] font-mono uppercase font-bold mt-1 ${getScrollRarityTextColor(item.rarity)}`}>
                                          {item.rarity.replace('_', ' ')}
                                      </span>
                                  </div>
                              </div>
                          ))}
                      </div>
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#DFFF00] z-20 -translate-y-1/2 shadow-[0_0_15px_#DFFF00] animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90 z-10 pointer-events-none" />
                  </div>
              )}

              {/* REVEAL STATE */}
              {stage === 'REVEAL' && result && (
                  <div className="relative z-10 w-full max-w-sm mx-auto p-6 animate-in zoom-in-50 duration-500">
                      
                      <div className={`absolute inset-0 z-0 opacity-30 blur-3xl pointer-events-none ${getRarityGlow(result.rarity)}`} />

                      {result.is_shiny && (
                          <>
                              <div className="absolute top-0 left-0 animate-ping"><Star size={24} className="text-yellow-400" /></div>
                              <div className="absolute bottom-10 right-10 animate-pulse delay-100"><Star size={32} className="text-yellow-400" /></div>
                              <div className="absolute top-20 right-20 animate-spin"><Sparkles size={24} className="text-white" /></div>
                          </>
                      )}

                      <div className={`
                          relative bg-zinc-900 border-4 rounded-2xl p-6 text-center shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 scale-90 md:scale-100
                          ${getRarityBorder(result.rarity)}
                          ${result.rarity === 'ZENITH' ? 'animate-glitch' : ''}
                      `}> 
                          <div className="flex justify-between items-start mb-6">
                              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                                  S/N {String(result.serial).padStart(4, '0')}
                              </span>
                              {result.is_shiny && (
                                  <span className="flex items-center gap-1 text-[9px] font-black uppercase text-yellow-900 bg-yellow-400 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                                      <Zap size={10} fill="currentColor" /> Prismatic
                                  </span>
                              )}
                          </div>

                          <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-6 bg-zinc-950/50 rounded-xl p-4 border border-zinc-800 shadow-inner flex items-center justify-center">
                              <PixelIcon name={result.name} />
                          </div>

                          <h3 className="text-xl md:text-2xl font-black uppercase text-white mb-2 tracking-tighter">{result.name}</h3>
                          <div className={`
                              inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-6
                              ${getRarityBadge(result.rarity)}
                          `}>
                              {result.rarity.replace('_', ' ')}
                          </div>

                          <p className="text-zinc-400 font-mono text-xs leading-relaxed border-t border-zinc-800 pt-4">
                              "{result.description}"
                          </p>
                      </div>

                      <button 
                          onClick={reset}
                          className="relative z-10 w-full mt-8 bg-zinc-800 hover:bg-white hover:text-black text-white py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-xl border border-zinc-700 hover:border-white"
                      >
                          Store Asset & Reset
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}

// --- HELPERS ---

function getScrollRarityStyle(rarity: string) {
    switch (rarity) {
        case 'ZENITH': return 'bg-[#DFFF00]/20 border-[#DFFF00]';
        case 'ULTRA': return 'bg-purple-900/30 border-purple-500';
        case 'SUPER_RARE': return 'bg-orange-900/30 border-orange-500';
        case 'RARE': return 'bg-blue-900/30 border-blue-500';
        case 'UNCOMMON': return 'bg-green-900/30 border-green-600';
        default: return 'bg-zinc-900 border-zinc-800';
    }
}

function getScrollRarityTextColor(rarity: string) {
    switch (rarity) {
        case 'ZENITH': return 'text-[#DFFF00]';
        case 'ULTRA': return 'text-purple-400';
        case 'SUPER_RARE': return 'text-orange-400';
        case 'RARE': return 'text-blue-400';
        case 'UNCOMMON': return 'text-green-400';
        default: return 'text-zinc-500';
    }
}

function getRarityBorder(rarity: string) {
    switch (rarity) {
        case 'ZENITH': return 'border-[#DFFF00]';
        case 'ULTRA': return 'border-purple-500';
        case 'SUPER_RARE': return 'border-orange-500';
        case 'RARE': return 'border-blue-500';
        case 'UNCOMMON': return 'border-green-600';
        default: return 'border-zinc-700';
    }
}

function getRarityGlow(rarity: string) {
    switch (rarity) {
        case 'ZENITH': return 'bg-[#DFFF00]';
        case 'ULTRA': return 'bg-purple-600';
        case 'SUPER_RARE': return 'bg-orange-500';
        case 'RARE': return 'bg-blue-600';
        default: return 'bg-transparent';
    }
}

function getRarityBadge(rarity: string) {
    switch (rarity) {
        case 'ZENITH': return 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.5)]';
        case 'ULTRA': return 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]';
        case 'SUPER_RARE': return 'bg-orange-500 text-black';
        case 'RARE': return 'bg-blue-600 text-white';
        case 'UNCOMMON': return 'bg-green-700 text-white';
        default: return 'bg-zinc-800 text-zinc-400';
    }
}