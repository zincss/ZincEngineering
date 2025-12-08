'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import { Package, Zap, Info, Star, ChevronDown, ChevronUp, Layers, Grid3X3, Coins, RefreshCw, AlertCircle } from 'lucide-react';
import BackButton from '@/app/components/BackButton';

// --- 1. CONFIGURATION ---
const REEL_ITEMS_SOURCE = [
  { name: 'Plastic Spork', rarity: 'COMMON' }, 
  { name: 'AA Battery', rarity: 'COMMON' },
  { name: 'Red Brick', rarity: 'COMMON' }, 
  { name: 'Left Sock', rarity: 'COMMON' },
  { name: 'Vintage Toaster', rarity: 'UNCOMMON' }, 
  { name: 'Lava Lamp', rarity: 'UNCOMMON' },
  { name: 'Gaming Chair', rarity: 'RARE' }, 
  { name: 'Mechanical Keyboard', rarity: 'RARE' },
  { name: 'Espresso Machine', rarity: 'SUPER_RARE' }, 
  { name: 'VR Headset', rarity: 'SUPER_RARE' },
  { name: 'Solid Gold Paperclip', rarity: 'ULTRA' }, 
  { name: 'The Zinc Cube', rarity: 'ZENITH' },
  { name: 'Rubber Band', rarity: 'COMMON' }, 
  { name: 'Coffee Mug', rarity: 'UNCOMMON' },
  { name: 'Drone', rarity: 'RARE' }, 
  { name: 'Diamond Ring', rarity: 'ULTRA' },
  { name: 'Soda Can', rarity: 'COMMON' }, 
  { name: 'Pizza Box', rarity: 'COMMON' },
  { name: 'Smart Watch', rarity: 'RARE' }, 
  { name: 'Succulent', rarity: 'UNCOMMON' }
];

const QUICK_SELL_VALUES: Record<string, number> = {
    'COMMON': 2,
    'UNCOMMON': 5,
    'RARE': 20,
    'SUPER_RARE': 100,
    'ULTRA': 500,
    'ZENITH': 2000
};

// --- PRELOADER ---
const getAssetUrl = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prompt = encodeURIComponent(
        `isometric 3d icon of ${name}, encased in a futuristic glass cube container, cyberpunk aesthetics, glowing neon edges, dark grey background, unreal engine 5 render, high fidelity, 8k, center focus`
    );
    return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${seed}&nologo=true&model=flux`;
};

const AssetPreloader = () => (
    <div className="hidden">
        {REEL_ITEMS_SOURCE.map((item) => (
            <img key={item.name} src={getAssetUrl(item.name)} alt="preload" loading="eager" />
        ))}
    </div>
);

// --- 2. GENERATIVE IMAGE SYSTEM ---
const ItemImage = ({ name, rarity, className = "" }: { name: string, rarity: string, className?: string }) => {
  const imageUrl = getAssetUrl(name);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-zinc-900 ${className}`}>
        <div className="absolute inset-0 bg-zinc-800 animate-pulse -z-10" />
        <img 
            src={imageUrl} 
            alt={name}
            className={`w-full h-full object-cover transform hover:scale-110 transition-transform duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            loading="eager"
        />
        {rarity === 'ZENITH' && <div className="absolute inset-0 bg-gradient-to-t from-[#DFFF00]/30 to-transparent pointer-events-none mix-blend-overlay" />}
        {rarity === 'ULTRA' && <div className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent pointer-events-none mix-blend-overlay" />}
        {rarity === 'SUPER_RARE' && <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent pointer-events-none mix-blend-overlay" />}
    </div>
  );
};

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

// --- 3. ANIMATION STYLES (MOBILE OPTIMIZED) ---
// Note: --reel-offset matches the item height (h-32 = 128px, h-48 = 192px)
const animationStyles = `
  .reel-container {
    --reel-offset: 128px;
  }
  @media (min-width: 768px) {
    .reel-container {
      --reel-offset: 192px;
    }
  }

  @keyframes shake {
    0% { transform: translate(1px, 1px) rotate(0deg); }
    50% { transform: translate(-1px, 2px) rotate(-1deg); }
    100% { transform: translate(1px, -2px) rotate(-1deg); }
  }
  @keyframes scroll-reel {
    0% { transform: translateY(0); }
    100% { transform: translateY(calc(-100% + var(--reel-offset))); }
  }
  .animate-rumble {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite;
  }
  .animate-scroll-1 { animation: scroll-reel 4.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
  .animate-scroll-2 { animation: scroll-reel 5.0s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
  .animate-scroll-3 { animation: scroll-reel 5.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }

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
  const [results, setResults] = useState<any[]>([]); 
  const [soldItems, setSoldItems] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [showOdds, setShowOdds] = useState(false);
  const [packQuantity, setPackQuantity] = useState<1 | 3>(1);
  
  // Reel State 
  const [activeReels, setActiveReels] = useState<{items: any[]}[]>([]);

  const handleOpenPack = async () => {
    const cost = packQuantity * 100;
    if (!profile || profile.credits < cost) {
        alert("INSUFFICIENT FUNDS");
        return;
    }

    setStage('RUMBLE');
    setError('');
    setResults([]);
    setSoldItems([]);

    try {
        const promises = Array(packQuantity).fill(null).map(() => supabase.rpc('open_base_set_pack'));
        const responses = await Promise.all(promises);

        const tempResults: any[] = [];
        
        for (const res of responses) {
            if (res.error) throw res.error;
            if (res.data && res.data.error === 'INSUFFICIENT_FUNDS') throw new Error("Insufficient Funds");
            tempResults.push(res.data);
        }

        // Patch: Fetch missing IDs
        let patchedResults = [...tempResults];
        
        if (user?.id) {
            const { data: latestItems } = await supabase
                .from('user_items')
                .select('id, item:items(name)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(packQuantity);

            if (latestItems && latestItems.length > 0) {
                 const pool = [...latestItems];
                 patchedResults = tempResults.map(rpcItem => {
                     const matchIndex = pool.findIndex(dbItem => {
                         const itemData = dbItem.item as any; 
                         const dbName = Array.isArray(itemData) ? itemData[0]?.name : itemData?.name;
                         return dbName === rpcItem.name;
                     });
                     if (matchIndex !== -1) {
                         const match = pool[matchIndex];
                         pool.splice(matchIndex, 1); 
                         return { ...rpcItem, id: match.id }; 
                     }
                     const fallback = pool.shift();
                     return { ...rpcItem, id: fallback?.id };
                 });
            }
        }

        const reels = patchedResults.map((result) => {
            const randomFillers = Array.from({ length: 30 }, () => 
                REEL_ITEMS_SOURCE[Math.floor(Math.random() * REEL_ITEMS_SOURCE.length)]
            );
            return {
                items: [...randomFillers, { name: result.name, rarity: result.rarity }]
            };
        });

        setActiveReels(reels);
        setResults(patchedResults); 
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

  const handleQuickSell = async (item: any) => {
      const itemId = item.id || item.item_id || (item.data && item.data.id);

      if (!itemId) {
          console.error("Sell Error: Item ID missing", item);
          alert("Error: Cannot sell this item because its ID is missing. The pack opening protocol may have glitched.");
          return; 
      }

      const sellValue = QUICK_SELL_VALUES[item.rarity] || 2;
      setSoldItems(prev => [...prev, itemId]);

      try {
          const { error: delError } = await supabase.from('user_items').delete().eq('id', itemId);
          if (delError) throw delError;
          await supabase.rpc('add_credits', { amount: sellValue });
          refreshProfile();
      } catch (err) {
          console.error("Quick Sell Failed:", err);
          setSoldItems(prev => prev.filter(id => id !== itemId));
          alert("Sale failed. Please try again.");
      }
  };

  const reset = () => {
      setResults([]);
      setStage('IDLE');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black flex flex-col relative overflow-hidden">
      <AssetPreloader />
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* HEADER */}
      <div className={`
          relative z-10 transition-all duration-700 ease-in-out
          ${stage !== 'IDLE' ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
      `}>
          <BackButton href="/play" label="ARCADE HUB" />
          <div className="pt-24 pb-8 px-4 md:pt-32 md:pb-12 md:px-6 max-w-[1600px] mx-auto border-b border-zinc-800">
            <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs md:text-sm font-black tracking-widest uppercase mb-4">
                <Package size={16} />
                <span>GLOBAL_MARKET // PACK_OPENING</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                Asset <span className="text-zinc-700">Acquisition</span>
            </h1>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full flex items-center justify-center relative z-20 min-h-[500px] mt-12 mb-20 px-4">
        
        {/* PACK CARD */}
        <div className={`
            w-full max-w-md transition-all duration-500 ease-in-out
            ${stage !== 'IDLE' ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
        `}>
            <div className="group relative border border-zinc-800 bg-zinc-900/30 rounded-3xl p-6 md:p-8 hover:border-[#DFFF00] transition-all duration-500">
                <div className="absolute top-4 right-4 bg-[#DFFF00] text-black font-bold font-mono text-[10px] px-3 py-1 rounded uppercase shadow-[0_0_15px_rgba(223,255,0,0.4)] z-20">
                    Series 1
                </div>

                <div className="flex justify-center py-8 md:py-10">
                    <div className="relative w-40 h-56 md:w-48 md:h-64 foil-gradient rounded-xl border border-white/20 shadow-2xl flex flex-col items-center justify-center p-4 transform group-hover:scale-105 transition-transform duration-500">
                        <div className="bg-black/80 backdrop-blur border border-[#DFFF00] rounded-lg p-3 mb-2 w-16 h-16 flex items-center justify-center">
                             <BasePackIcon />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black uppercase text-white italic tracking-tighter text-center leading-none mt-2">BASE<br/>PACK NO.1</h3>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* QUANTITY SELECTOR */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setPackQuantity(1)}
                            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${packQuantity === 1 ? 'border-[#DFFF00] bg-[#DFFF00]/10 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                        >
                            <Layers size={16} />
                            <span className="font-bold text-xs">SINGLE (100)</span>
                        </button>
                        <button 
                            onClick={() => setPackQuantity(3)}
                            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${packQuantity === 3 ? 'border-[#DFFF00] bg-[#DFFF00]/10 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                        >
                            <Grid3X3 size={16} />
                            <span className="font-bold text-xs">TRIPLE (300)</span>
                        </button>
                    </div>

                    {/* ODDS DROPDOWN */}
                    <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden transition-all duration-300">
                        <button 
                            onClick={() => setShowOdds(!showOdds)}
                            className="w-full flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                        >
                            <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <Info size={12}/> Odds Protocol
                            </span>
                            <span className="text-zinc-500 flex items-center gap-2 text-[10px] font-bold uppercase">
                                {showOdds ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </span>
                        </button>
                        
                        {showOdds && (
                            <div className="grid grid-cols-2 text-[10px] font-mono uppercase animate-in slide-in-from-top-2 duration-200">
                                <div className="p-2 border-r border-b border-zinc-800 text-zinc-400">Common</div>
                                <div className="p-2 border-b border-zinc-800 text-right text-zinc-400">50.0%</div>
                                <div className="p-2 border-r border-b border-zinc-800 text-green-500">Uncommon</div>
                                <div className="p-2 border-b border-zinc-800 text-right text-green-500">30.0%</div>
                                <div className="p-2 border-r border-b border-zinc-800 text-blue-500">Rare</div>
                                <div className="p-2 border-b border-zinc-800 text-right text-blue-500">15.0%</div>
                                <div className="p-2 border-r border-zinc-800 text-[#DFFF00] bg-[#DFFF00]/5 font-bold">Zenith</div>
                                <div className="p-2 text-right text-[#DFFF00] bg-[#DFFF00]/5 font-bold">0.1%</div>
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    onClick={handleOpenPack}
                    disabled={(profile?.credits || 0) < (packQuantity * 100)}
                    className="w-full mt-6 bg-white text-black font-black uppercase py-4 rounded-xl hover:bg-[#DFFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                    <span>Authorize ({packQuantity * 100})</span>
                    <Zap size={16} fill="currentColor" />
                </button>
                {error && <div className="text-red-500 text-center text-xs font-mono mt-4">{error}</div>}
            </div>
        </div>
      </div>

      {/* --- CENTER STAGE GLASS WINDOW (SCROLLABLE & RESPONSIVE) --- */}
      <div className={`
          fixed inset-0 z-[100] flex flex-col items-center justify-center p-4
          transition-all duration-500 ease-out
          ${stage !== 'IDLE' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
      `}>
          {/* Overlay Background */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

          <div className="w-full max-w-7xl h-auto min-h-[60vh] max-h-[90vh] rounded-3xl overflow-hidden border-2 border-[#DFFF00]/50 bg-zinc-950 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col items-center justify-center relative overflow-y-auto custom-scrollbar">
              
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-black pointer-events-none" />

              {/* RUMBLE STATE */}
              {stage === 'RUMBLE' && (
                  <div className="animate-rumble relative z-10 flex gap-4 flex-wrap justify-center p-8">
                      {Array.from({ length: packQuantity }).map((_, i) => (
                          <div key={i} className="w-32 h-44 md:w-48 md:h-64 foil-gradient rounded-xl border border-white/30 flex items-center justify-center shadow-[0_0_50px_rgba(223,255,0,0.5)]">
                              <div className="w-12 h-12 md:w-16 md:h-16"><BasePackIcon /></div>
                          </div>
                      ))}
                  </div>
              )}

              {/* SCROLLING STATE */}
              {stage === 'SCROLLING' && (
                  <div className="flex gap-2 md:gap-4 z-10 overflow-hidden py-10 px-4">
                      {activeReels.map((reel, index) => (
                          <div key={index} className="reel-container relative h-40 md:h-64 w-28 md:w-48 overflow-hidden border-y-4 border-[#DFFF00] bg-zinc-900 rounded-lg shadow-2xl">
                              <div className={`animate-scroll-${index + 1}`}>
                                  {reel.items.map((item, i) => (
                                      <div key={i} className={`
                                          h-32 md:h-48 w-full flex flex-col items-center justify-center border-b p-2
                                          ${getScrollRarityStyle(item.rarity)}
                                      `}>
                                          <div className="w-16 h-16 md:w-28 md:h-28 opacity-90 drop-shadow-xl transform scale-90">
                                              <ItemImage name={item.name} rarity={item.rarity} className="w-full h-full" />
                                          </div>
                                          <div className="flex flex-col items-center mt-2 bg-black/50 px-2 py-1 rounded backdrop-blur-sm w-full">
                                              <span className="text-[9px] md:text-[12px] font-mono uppercase text-white font-black text-center leading-none truncate w-full">{item.name}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#DFFF00] z-20 -translate-y-1/2 shadow-[0_0_15px_#DFFF00] animate-pulse" />
                          </div>
                      ))}
                  </div>
              )}

              {/* REVEAL STATE */}
              {stage === 'REVEAL' && results.length > 0 && (
                  <div className="relative z-10 w-full max-w-6xl mx-auto p-6 animate-in zoom-in-50 duration-500 flex flex-col items-center">
                      
                      <div className="flex flex-wrap justify-center gap-6 mb-8 w-full">
                          {results.map((result, idx) => {
                              const resultId = result.id || result.item_id || (result.data && result.data.id);
                              const isSold = resultId && soldItems.includes(resultId);
                              
                              if (isSold) {
                                  // SOLD CARD UI
                                  return (
                                      <div key={idx} className="relative w-64 h-80 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                          <div className="bg-green-900/20 p-4 rounded-full mb-4 border border-green-900">
                                              <Coins size={32} className="text-green-500" />
                                          </div>
                                          <h3 className="text-xl font-black text-green-500 mb-2">SOLD</h3>
                                          <div className="font-black text-white text-lg">+{QUICK_SELL_VALUES[result.rarity] || 2} CR</div>
                                      </div>
                                  );
                              }

                              return (
                                  <div key={idx} className={`
                                      relative w-64 h-auto bg-zinc-900 border-4 rounded-2xl p-4 text-center shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300
                                      ${getRarityBorder(result.rarity)}
                                      ${result.rarity === 'ZENITH' ? 'animate-glitch' : ''}
                                  `}>
                                      <div className={`absolute inset-0 z-0 opacity-30 blur-3xl pointer-events-none ${getRarityGlow(result.rarity)}`} />
                                      
                                      <div className="flex justify-between items-start mb-2 relative z-10">
                                          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                                              S/N {String(result.serial || 0).padStart(4, '0')}
                                          </span>
                                      </div>

                                      <div className="w-32 h-32 mx-auto mb-4 bg-zinc-950/50 rounded-xl p-2 border border-zinc-800 shadow-inner flex items-center justify-center relative z-10">
                                          <ItemImage name={result.name} rarity={result.rarity} className="w-full h-full shadow-lg" />
                                      </div>

                                      <h3 className="text-sm font-black uppercase text-white mb-2 tracking-tighter relative z-10">{result.name}</h3>
                                      <div className={`
                                          inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest mb-4 relative z-10
                                          ${getRarityBadge(result.rarity)}
                                      `}>
                                          {result.rarity.replace('_', ' ')}
                                      </div>

                                      <button 
                                          onClick={(e) => { e.stopPropagation(); handleQuickSell(result); }}
                                          className="relative z-10 w-full py-2 bg-red-950/50 hover:bg-red-900 border border-red-900 hover:border-red-500 text-red-200 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all group cursor-pointer"
                                      >
                                          <RefreshCw size={12} className="group-hover:rotate-180 transition-transform" />
                                          Quick Sell ({QUICK_SELL_VALUES[result.rarity] || 2}cr)
                                      </button>
                                  </div>
                              );
                          })}
                      </div>

                      <button 
                          onClick={reset}
                          className="w-full max-w-sm bg-zinc-800 hover:bg-white hover:text-black text-white py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-xl border border-zinc-700 hover:border-white mb-8"
                      >
                          Store Assets & Reset
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}

// --- HELPER STYLES ---
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