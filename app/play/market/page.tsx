'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import { 
    Package, Zap, Info, ChevronDown, ChevronUp, Layers, Grid3X3, Loader2, Wallet,
    Gavel, Coins, Clock, Plus, Filter, TrendingUp, AlertCircle, Check, X, Search,
    CarFront, Lock // Imported Lock for the teaser
} from 'lucide-react';
import BackButton from '@/app/components/BackButton';
import { CARS } from '@/app/automotive/data'; // Importing Car Data

// --- CONFIGURATION: BASE PACK ITEMS ---
const REEL_ITEMS_SOURCE = [
  { name: 'Plastic Spork', rarity: 'COMMON', description: 'Barely functional. The apex of disposable cutlery.' }, 
  { name: 'AA Battery', rarity: 'COMMON', description: 'Not included. Probably dead anyway.' },
  { name: 'Red Brick', rarity: 'COMMON', description: "It's a brick. Good for throwing." }, 
  { name: 'Left Sock', rarity: 'COMMON', description: 'Where is the right one? A mystery.' },
  { name: 'Vintage Toaster', rarity: 'UNCOMMON', description: 'A fire hazard that occasionally browns bread.' }, 
  { name: 'Lava Lamp', rarity: 'UNCOMMON', description: 'Distracting goo. Do not drink.' },
  { name: 'Gaming Chair', rarity: 'RARE', description: 'Racing bucket seat for sitting absolutely still.' }, 
  { name: 'Mechanical Keyboard', rarity: 'RARE', description: 'Loud. Annoying. Tactile. Your coworkers hate you.' },
  { name: 'Espresso Machine', rarity: 'SUPER_RARE', description: 'Overcomplicated bean water extractor. PhD required.' }, 
  { name: 'VR Headset', rarity: 'SUPER_RARE', description: 'Escape reality. Motion sickness included.' },
  { name: 'Solid Gold Paperclip', rarity: 'ULTRA', description: 'It holds paper. But expensively.' }, 
  { name: 'The Zinc Cube', rarity: 'ZENITH', description: 'Dense. Heavy. Zinc. Perfection.' },
  { name: 'Rubber Band', rarity: 'COMMON', description: 'Potential energy storage device. Snap.' }, 
  { name: 'Coffee Mug', rarity: 'UNCOMMON', description: 'Vessel for caffeine. Stain resistant (lies).' },
  { name: 'Drone', rarity: 'RARE', description: 'Buzzing annoyance. Battery life: 2 minutes.' }, 
  { name: 'Diamond Ring', rarity: 'ULTRA', description: 'Compressed carbon. Depreciates instantly.' },
  { name: 'Soda Can', rarity: 'COMMON', description: 'Aluminum cylinder. Contents: Liquid sugar.' }, 
  { name: 'Pizza Box', rarity: 'COMMON', description: 'Cardboard with grease stains. Pizza not included.' },
  { name: 'Smart Watch', rarity: 'RARE', description: 'It tells time and steals your personal data.' }, 
  { name: 'Succulent', rarity: 'UNCOMMON', description: 'A plant you might actually manage not to kill.' }
];

// --- CONFIGURATION: CAR PACK ITEMS ---
const CAR_PACK_SOURCE = CARS.map(car => {
  let rarity = 'COMMON';
  
  // Custom Rarity Logic for the Car Pack
  if (car.id === '919-hybrid-evo') rarity = 'ZENITH'; // The 1/5 Chase Card
  else if (car.class === 'Formula 1' || car.class === 'Hypercar') rarity = 'ULTRA';
  else if (car.class === 'Supercar' || car.class === 'Group B') rarity = 'SUPER_RARE';
  else if (car.class === 'WRC') rarity = 'RARE';
  else if (car.manufacturer === 'Porsche' || car.manufacturer === 'Ferrari') rarity = 'UNCOMMON';

  return {
    name: car.name,
    rarity: rarity,
    description: car.history.length > 80 ? car.history.substring(0, 80) + "..." : car.history
  };
});

// --- HELPER: ASSETS ---
const getAssetUrl = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prompt = encodeURIComponent(
        `isometric 3d icon of ${name}, encased in a futuristic glass cube container, cyberpunk aesthetics, glowing neon edges, dark grey background, unreal engine 5 render, high fidelity, 8k, center focus`
    );
    return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${seed}&nologo=true&model=flux`;
};

const AssetPreloader = () => (
    <div className="hidden">
        {[...REEL_ITEMS_SOURCE, ...CAR_PACK_SOURCE].map((item) => (
            <img key={item.name} src={getAssetUrl(item.name)} alt="preload" loading="eager" />
        ))}
    </div>
);

const ItemImage = ({ name, rarity, className = "" }: { name: string, rarity: string, className?: string }) => {
  const imageUrl = getAssetUrl(name);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 ${className}`}>
        {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <Loader2 className="animate-spin text-zinc-700" size={24} />
            </div>
        )}
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

// --- ANIMATION STYLES ---
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

// ==========================================
// MAIN COMPONENT: MARKET HUB
// ==========================================
export default function MarketPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'PACKS' | 'AUCTION'>('PACKS');

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black flex flex-col relative overflow-hidden">
      <AssetPreloader />
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <BackButton href="/play" label="ARCADE HUB" />

      {/* HEADER SECTION */}
      <div className="pt-24 pb-8 px-4 md:pt-32 md:pb-8 md:px-6 max-w-[1600px] mx-auto border-b border-zinc-800 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs md:text-sm font-black tracking-widest uppercase mb-4">
                    {activeTab === 'PACKS' ? <Package size={16} /> : <Gavel size={16} />}
                    <span>GLOBAL_MARKET // {activeTab}</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
                    {activeTab === 'PACKS' ? (
                        <>Asset <span className="text-zinc-700">Acquisition</span></>
                    ) : (
                        <>Black <span className="text-zinc-700">Market</span></>
                    )}
                </h1>
            </div>

            {/* BALANCE DISPLAY */}
            <div className="text-right w-full md:w-auto border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Liquid Credits</div>
                <div className="text-2xl font-mono font-black text-[#DFFF00] flex items-center gap-2 justify-end">
                    <Wallet size={20} />
                    {profile?.credits?.toLocaleString() || 0}
                </div>
            </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-8 overflow-x-auto pb-1 no-scrollbar">
            <button 
                onClick={() => setActiveTab('PACKS')}
                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === 'PACKS' 
                        ? 'text-[#DFFF00] border-b-2 border-[#DFFF00]' 
                        : 'text-zinc-500 hover:text-white'
                }`}
            >
                Acquisition
            </button>
            <button 
                onClick={() => setActiveTab('AUCTION')}
                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === 'AUCTION' 
                        ? 'text-[#DFFF00] border-b-2 border-[#DFFF00]' 
                        : 'text-zinc-500 hover:text-white'
                }`}
            >
                Auction House
            </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 w-full relative z-20">
          {activeTab === 'PACKS' ? (
              <PackOpeningView 
                  user={user} 
                  profile={profile} 
                  authLoading={authLoading} 
                  refreshProfile={refreshProfile} 
              />
          ) : (
              <AuctionHouseView 
                  user={user} 
                  profile={profile} 
                  refreshProfile={refreshProfile}
              />
          )}
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: PACK OPENING VIEW
// ==========================================
const PackOpeningView = ({ user, profile, authLoading, refreshProfile }: any) => {
    const [stage, setStage] = useState<'IDLE' | 'RUMBLE' | 'SCROLLING' | 'REVEAL'>('IDLE');
    const [results, setResults] = useState<any[]>([]); 
    const [error, setError] = useState('');
    const [showOdds, setShowOdds] = useState(false);
    const [packQuantity, setPackQuantity] = useState<1 | 3>(1);
    const [activeReels, setActiveReels] = useState<{items: any[]}[]>([]);
    
    // NEW: Track selected pack
    const [selectedPack, setSelectedPack] = useState<'BASE' | 'CARS'>('BASE');

    const PACK_CONFIG = {
        BASE: { 
            cost: 100, 
            name: 'Series 1', 
            label: 'BASE PACK NO.1', 
            icon: BasePackIcon, 
            source: REEL_ITEMS_SOURCE,
            desc: null,
            comingSoon: false
        },
        CARS: { 
            cost: 250, 
            name: 'Legends', 
            label: 'AUTOMOTIVE PACK', 
            icon: CarFront, 
            source: CAR_PACK_SOURCE,
            comingSoon: true, // FLAG AS COMING SOON
            desc: "The ultimate collection for petrolheads. Collect 100+ unique vehicles including WRC Legends, F1 icons, and Hypercars. Chase the 1/5 Zenith 919 Evo.\n\nFEATURE PREVIEW: Unlocking cars will grant access to the new 'Profile Garage', a dedicated 3D showroom to display your rarest pulls to the community."
        }
    };

    const currentConfig = PACK_CONFIG[selectedPack];
    const cost = packQuantity * currentConfig.cost;
    const canAfford = (profile?.credits || 0) >= cost;
    const isReady = !authLoading && user;

    let buttonText = `Authorize Payment (${cost})`;
    if (currentConfig.comingSoon) buttonText = "DROPPING SOON";
    else if (authLoading) buttonText = "CONNECTING...";
    else if (!user) buttonText = "LOGIN REQUIRED";
    else if (!canAfford) buttonText = "INSUFFICIENT CREDITS";

    const handleOpenPack = async () => {
        if (authLoading || !profile || profile.credits < cost || currentConfig.comingSoon) return;

        setStage('RUMBLE');
        setError('');
        setResults([]);

        try {
            // Note: In a real implementation, you would pass the 'pack_type' to the RPC function
            const promises = Array(packQuantity).fill(null).map(() => supabase.rpc('open_base_set_pack'));
            const responses = await Promise.all(promises);

            const tempResults: any[] = [];
            for (const res of responses) {
                if (res.error) throw res.error;
                if (res.data && res.data.error === 'INSUFFICIENT_FUNDS') throw new Error("Insufficient Funds");
                
                // --- SIMULATION FOR CAR PACK (Until Backend RPC is Updated) ---
                // If Car Pack is selected, we override the RPC result with a random car
                if (selectedPack === 'CARS') {
                    const rand = Math.random();
                    let item;
                    if (rand > 0.98) item = CAR_PACK_SOURCE.find(i => i.rarity === 'ZENITH') || CAR_PACK_SOURCE[0];
                    else if (rand > 0.90) item = CAR_PACK_SOURCE.find(i => i.rarity === 'ULTRA') || CAR_PACK_SOURCE[0];
                    else item = CAR_PACK_SOURCE[Math.floor(Math.random() * CAR_PACK_SOURCE.length)];
                    tempResults.push({ ...item, id: Math.random().toString() }); // Fake ID for sim
                } else {
                    tempResults.push(res.data);
                }
            }

            const reels = tempResults.map((result) => {
                const source = currentConfig.source;
                const randomFillers = Array.from({ length: 30 }, () => 
                    source[Math.floor(Math.random() * source.length)]
                );
                return { items: [...randomFillers, { name: result.name, rarity: result.rarity }] };
            });

            setActiveReels(reels);
            setResults(tempResults); 
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
        setResults([]);
        setStage('IDLE');
    };

    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-4 relative min-h-[600px]">
            
            {/* PACK SELECTOR */}
            <div className={`flex gap-4 mb-8 transition-all duration-500 ${stage !== 'IDLE' ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'}`}>
                {/* BASE PACK OPTION */}
                <button 
                    onClick={() => setSelectedPack('BASE')}
                    className={`group relative w-36 md:w-48 p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedPack === 'BASE' ? 'border-[#DFFF00] bg-zinc-900' : 'border-zinc-800 bg-zinc-950 opacity-60 hover:opacity-100'}`}
                >
                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Series 1</div>
                    <div className="text-white font-black uppercase text-sm md:text-base">Base Set</div>
                    <div className="text-xs font-mono text-zinc-400 mt-1">100 CR</div>
                </button>

                {/* CAR PACK OPTION */}
                <button 
                    onClick={() => setSelectedPack('CARS')}
                    className={`group relative w-36 md:w-48 p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedPack === 'CARS' ? 'border-[#DFFF00] bg-zinc-900' : 'border-zinc-800 bg-zinc-950 opacity-60 hover:opacity-100'}`}
                >
                     <div className="absolute -top-2 -right-2 bg-orange-500 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase shadow-lg animate-pulse">SOON</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Legends</div>
                    <div className="text-white font-black uppercase text-sm md:text-base">Automotive</div>
                    <div className="text-xs font-mono text-zinc-400 mt-1">??? CR</div>
                </button>
            </div>

            {/* PACK CARD */}
            <div className={`
                w-full max-w-md transition-all duration-500 ease-in-out px-4
                ${stage !== 'IDLE' ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
            `}>
                <div className="group relative border border-zinc-800 bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 md:p-8 hover:border-[#DFFF00] transition-all duration-500 shadow-2xl">
                    <div className="absolute top-4 right-4 bg-[#DFFF00] text-black font-bold font-mono text-[10px] px-3 py-1 rounded uppercase shadow-[0_0_15px_rgba(223,255,0,0.4)] z-20">
                        {currentConfig.name}
                    </div>

                    <div className="flex justify-center py-8 md:py-10">
                        <div className={`relative w-40 h-56 md:w-48 md:h-64 foil-gradient rounded-xl border border-white/20 shadow-2xl flex flex-col items-center justify-center p-4 transform group-hover:scale-105 transition-transform duration-500 ${currentConfig.comingSoon ? 'grayscale brightness-75' : ''}`}>
                            <div className="bg-black/80 backdrop-blur border border-[#DFFF00] rounded-lg p-3 mb-4 w-20 h-20 flex items-center justify-center text-[#DFFF00]">
                                 <currentConfig.icon size={40} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black uppercase text-white italic tracking-tighter text-center leading-none mt-2">
                                {currentConfig.label.split(' ').map((word, i) => <div key={i}>{word}</div>)}
                            </h3>
                            {currentConfig.comingSoon && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
                                    <Lock size={48} className="text-white/50" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DYNAMIC DESCRIPTION FOR PACKS */}
                    {currentConfig.desc && (
                        <div className="mb-6 text-center bg-black/40 p-4 rounded-lg border border-zinc-800">
                            <p className="text-[#DFFF00] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                {currentConfig.comingSoon ? <><Lock size={12}/> Locked Intel</> : "Pack Contents"}
                            </p>
                            <p className="text-zinc-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                                {currentConfig.desc}
                            </p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className={`grid grid-cols-2 gap-3 ${currentConfig.comingSoon ? 'opacity-50 pointer-events-none' : ''}`}>
                            <button 
                                onClick={() => setPackQuantity(1)}
                                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${packQuantity === 1 ? 'border-[#DFFF00] bg-[#DFFF00]/10 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                            >
                                <Layers size={16} />
                                <span className="font-bold text-xs">SINGLE ({currentConfig.cost})</span>
                            </button>
                            <button 
                                onClick={() => setPackQuantity(3)}
                                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${packQuantity === 3 ? 'border-[#DFFF00] bg-[#DFFF00]/10 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                            >
                                <Grid3X3 size={16} />
                                <span className="font-bold text-xs">TRIPLE ({currentConfig.cost * 3})</span>
                            </button>
                        </div>

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
                                    <div className="p-2 border-r border-b border-zinc-800 text-orange-500">Super Rare</div>
                                    <div className="p-2 border-b border-zinc-800 text-right text-orange-500">4.0%</div>
                                    <div className="p-2 border-r border-b border-zinc-800 text-purple-500">Ultra</div>
                                    <div className="p-2 border-b border-zinc-800 text-right text-purple-500">0.9%</div>
                                    <div className="p-2 border-r border-zinc-800 text-[#DFFF00] bg-[#DFFF00]/5 font-bold">Zenith</div>
                                    <div className="p-2 text-right text-[#DFFF00] bg-[#DFFF00]/5 font-bold">0.1%</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <button 
                            onClick={handleOpenPack}
                            disabled={!isReady || !canAfford || currentConfig.comingSoon}
                            className={`
                                w-full font-black uppercase py-4 rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg
                                ${currentConfig.comingSoon 
                                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' 
                                    : 'bg-white text-black hover:bg-[#DFFF00] disabled:opacity-50'
                                }
                            `}
                        >
                            {authLoading ? <Loader2 size={16} className="animate-spin" /> : currentConfig.comingSoon ? <Lock size={16} /> : <Zap size={16} fill="currentColor" />}
                            <span>{buttonText}</span>
                        </button>
                    </div>
                    {error && <div className="text-red-500 text-center text-xs font-mono mt-4">{error}</div>}
                </div>
            </div>

            {/* FULLSCREEN ANIMATION OVERLAY */}
            <div className={`
                fixed inset-0 z-[100] flex flex-col items-center justify-center p-4
                transition-all duration-500 ease-out
                ${stage !== 'IDLE' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
            `}>
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

                <div className="w-full max-w-7xl h-auto min-h-[60vh] max-h-[90vh] rounded-3xl overflow-hidden border-2 border-[#DFFF00]/50 bg-zinc-950 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col items-center justify-center relative overflow-y-auto custom-scrollbar">
                    
                    {stage === 'RUMBLE' && (
                        <div className="animate-rumble relative z-10 flex gap-4 flex-wrap justify-center p-8">
                            {Array.from({ length: packQuantity }).map((_, i) => (
                                <div key={i} className="w-32 h-44 md:w-48 md:h-64 foil-gradient rounded-xl border border-white/30 flex items-center justify-center shadow-[0_0_50px_rgba(223,255,0,0.5)]">
                                    <div className="w-12 h-12 md:w-16 md:h-16 text-white flex items-center justify-center">
                                        <currentConfig.icon size={64} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {stage === 'SCROLLING' && (
                        <div className="flex gap-2 md:gap-4 z-10 overflow-hidden py-10 px-4">
                            {activeReels.map((reel, index) => (
                                <div key={index} className="reel-container relative h-40 md:h-64 w-28 md:w-48 overflow-hidden border-y-4 border-[#DFFF00] bg-zinc-900 rounded-lg shadow-2xl">
                                    <div className={`animate-scroll-${index + 1}`}>
                                        {reel.items.map((item, i) => (
                                            <div key={i} className={`h-32 md:h-48 w-full flex flex-col items-center justify-center border-b p-2 ${getScrollRarityStyle(item.rarity)}`}>
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

                    {stage === 'REVEAL' && results.length > 0 && (
                        <div className="relative z-10 w-full max-w-6xl mx-auto p-6 animate-in zoom-in-50 duration-500 flex flex-col items-center">
                            <div className="flex flex-wrap justify-center gap-6 mb-8 w-full">
                                {results.map((result, idx) => {
                                    // Dynamically find description from the current active source
                                    const sourceItem = currentConfig.source.find(i => i.name === result.name);
                                    const desc = sourceItem?.description || "A mysterious artifact.";

                                    return (
                                        <div key={idx} className={`relative w-64 h-auto bg-zinc-900 border-4 rounded-2xl p-4 text-center shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ${getRarityBorder(result.rarity)}`}>
                                            <div className="w-32 h-32 mx-auto mb-4 bg-zinc-950/50 rounded-xl p-2 border border-zinc-800 shadow-inner flex items-center justify-center relative z-10">
                                                <ItemImage name={result.name} rarity={result.rarity} className="w-full h-full shadow-lg" />
                                            </div>
                                            <h3 className="text-sm font-black uppercase text-white mb-2 tracking-tighter relative z-10">{result.name}</h3>
                                            <div className={`inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest mb-4 relative z-10 ${getRarityBadge(result.rarity)}`}>
                                                {result.rarity.replace('_', ' ')}
                                            </div>
                                            <div className="relative z-10 border-t border-white/10 pt-4 mt-2">
                                                <p className="text-zinc-400 font-mono text-[10px] leading-relaxed italic">"{desc}"</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={reset} className="w-full max-w-sm bg-zinc-800 hover:bg-white hover:text-black text-white py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-xl border border-zinc-700 hover:border-white mb-8">
                                Store Assets & Reset
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// SUB-COMPONENT: AUCTION HOUSE VIEW
// ==========================================
interface AuctionItem {
    id: string; seller_id: string; item_id: string; start_price: number;
    buyout_price: number; current_bid: number; ends_at: string; status: string;
    item_details?: any; 
}

const AuctionHouseView = ({ user, profile, refreshProfile }: any) => {
    const [auctions, setAuctions] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'BROWSE' | 'MY_LISTINGS'>('BROWSE');
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);

    // FIX: Optimized fetch logic and added detailed error logging
    const fetchAuctions = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase.from('auctions')
                .select(`*, item_details:user_items!inner(id, is_shiny, serial_number, item:items(name, rarity, description, image_url))`)
                .eq('status', 'ACTIVE')
                .order('ends_at', { ascending: true });

            if (view === 'MY_LISTINGS' && user) {
                query = query.eq('seller_id', user.id);
            }
            
            const { data, error } = await query;
            if (error) {
                console.error("Supabase Auction Fetch Error:", error);
                throw error;
            }
            setAuctions(data || []);
        } catch (err) {
            console.error("Auction Fetch Critical Failure:", err);
        } finally {
            setLoading(false);
        }
    }, [view, user]);

    // FIX: Dependency array only tracks user.id to prevent loops
    useEffect(() => {
        fetchAuctions();
        const channel = supabase.channel('public:auctions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => fetchAuctions())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchAuctions]);

    const handleBid = async (auction: AuctionItem, bidAmount: number) => {
        if (!user || !profile) return alert("Login required");
        if (profile.credits < bidAmount) return alert("Insufficient Credits");
        if (auction.seller_id === user.id) return alert("Cannot bid on own auction");

        const confirmMsg = bidAmount >= auction.buyout_price 
            ? `Buyout ${auction.item_details.item.name} for ${bidAmount} CR?`
            : `Place bid of ${bidAmount} CR on ${auction.item_details.item.name}?`;

        if (!confirm(confirmMsg)) return;

        try {
            const { error: creditError } = await supabase.rpc('add_credits', { amount: -bidAmount });
            if (creditError) throw creditError;

            await supabase.from('bids').insert({ auction_id: auction.id, bidder_id: user.id, amount: bidAmount });
            
            const newStatus = bidAmount >= auction.buyout_price ? 'SOLD' : 'ACTIVE';
            await supabase.from('auctions').update({ 
                current_bid: bidAmount, winner_id: user.id, status: newStatus 
            }).eq('id', auction.id);

            refreshProfile();
            alert("Bid Placed Successfully!");
        } catch (err) {
            alert("Bid Failed. Someone may have outbid you.");
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto px-6 pb-20">
            {/* AUCTION ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-zinc-800 pb-4">
                <div className="flex gap-4">
                    <button onClick={() => setView('BROWSE')} className={`text-xs font-black uppercase tracking-widest ${view === 'BROWSE' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>Browse Listings</button>
                    <button onClick={() => setView('MY_LISTINGS')} className={`text-xs font-black uppercase tracking-widest ${view === 'MY_LISTINGS' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>My Listings</button>
                </div>
                <button 
                    onClick={() => setIsListingModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-widest rounded transition-all text-xs w-full md:w-auto justify-center"
                >
                    <Plus size={14} /> Sell Item
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-zinc-600 animate-pulse"><Loader2 size={32} className="animate-spin" /></div>
            ) : auctions.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-500 font-mono">NO ACTIVE AUCTIONS FOUND</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} onBid={handleBid} currentUserId={user?.id} />
                    ))}
                </div>
            )}

            {isListingModalOpen && (
                <CreateListingModal 
                    userId={user?.id} 
                    onClose={() => setIsListingModalOpen(false)} 
                    onSuccess={() => { setIsListingModalOpen(false); fetchAuctions(); }} 
                />
            )}
        </div>
    );
};

// --- HELPER: AUCTION CARD ---
const AuctionCard = ({ auction, onBid, currentUserId }: any) => {
    const item = auction.item_details.item;
    const isOwner = currentUserId === auction.seller_id;
    const timeLeft = getTimeLeft(auction.ends_at);
    const nextBid = Math.ceil(auction.current_bid * 1.1);

    return (
        <div className="group relative bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] transition-all duration-300 rounded-xl overflow-hidden flex flex-col">
            <div className="relative h-40 bg-black/50 p-4 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-black pointer-events-none" />
                <img src={getAssetUrl(item.name)} alt={item.name} className="w-24 h-24 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur border border-zinc-700 rounded text-[9px] font-bold uppercase text-zinc-400">{item.rarity}</div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-sm uppercase leading-tight">{item.name}</h3>
                    <div className={`text-[10px] font-mono font-bold flex items-center gap-1 ${timeLeft.urgent ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                        <Clock size={10} /> {timeLeft.text}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold">Current Bid</div>
                        <div className="text-[#DFFF00] font-mono font-black text-xs">{auction.current_bid.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                        <div className="text-[8px] text-zinc-500 uppercase font-bold">Buyout</div>
                        <div className="text-white font-mono font-black text-xs">{auction.buyout_price.toLocaleString()}</div>
                    </div>
                </div>
                <div className="mt-auto flex gap-2">
                    {!isOwner ? (
                        <>
                            <button onClick={() => onBid(auction, nextBid)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded transition-colors active:scale-95">Bid {nextBid}</button>
                            <button onClick={() => onBid(auction, auction.buyout_price)} className="flex-1 py-3 bg-[#DFFF00] hover:bg-white text-black text-[10px] font-black uppercase tracking-widest rounded transition-colors active:scale-95">Buy</button>
                        </>
                    ) : (
                        <div className="w-full py-3 bg-zinc-800/50 border border-dashed border-zinc-700 text-zinc-500 text-center text-[10px] font-mono rounded">YOUR LISTING</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- HELPER: CREATE LISTING MODAL ---
const CreateListingModal = ({ userId, onClose, onSuccess }: any) => {
    const [inventory, setInventory] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [startPrice, setStartPrice] = useState(100);
    const [buyoutPrice, setBuyoutPrice] = useState(1000);
    const [duration, setDuration] = useState(24);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        const fetchInv = async () => {
            if(!userId) return;
            try {
                // 1. Fetch User Items
                const { data: items, error: itemError } = await supabase
                    .from('user_items')
                    .select('id, item:items(name, rarity)')
                    .eq('user_id', userId);
                
                if (itemError) throw itemError;

                // 2. Fetch Active Auctions to Exclude items already listed
                const { data: activeAuctions, error: auctionError } = await supabase
                    .from('auctions')
                    .select('item_id')
                    .eq('seller_id', userId)
                    .eq('status', 'ACTIVE');
                
                if (auctionError) throw auctionError;

                // 3. Filter Inventory
                const listedItemIds = new Set(activeAuctions?.map(a => a.item_id));
                const availableItems = items?.filter(i => !listedItemIds.has(i.id)) || [];

                setInventory(availableItems);
            } catch (err: any) {
                console.error("Inventory Fetch Error:", err);
                setFetchError("Could not retrieve inventory.");
            }
        };
        fetchInv();
    }, [userId]);

    const handleCreate = async () => {
        if (!selectedItem) return alert("Select an item");
        setLoading(true);
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + duration);
        const { error } = await supabase.from('auctions').insert({
            seller_id: userId, item_id: selectedItem, start_price: startPrice, current_bid: startPrice,
            buyout_price: buyoutPrice, ends_at: endDate.toISOString()
        });
        setLoading(false);
        if (error) alert("Error creating auction");
        else onSuccess();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="w-full h-[90vh] md:h-auto max-w-lg bg-zinc-950 border-t md:border border-zinc-800 rounded-t-3xl md:rounded-2xl p-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase flex items-center gap-2"><Plus className="text-[#DFFF00]" /> Create Listing</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full"><X size={20} className="text-zinc-500" /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                    {/* ASSET SELECTOR GRID */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Select Asset to Sell</label>
                        {fetchError ? (
                            <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-500 text-xs font-mono text-center rounded">{fetchError}</div>
                        ) : inventory.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-zinc-800 rounded-xl text-center">
                                <p className="text-zinc-600 font-mono text-xs">NO TRADEABLE ASSETS FOUND</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {inventory.map((i: any) => {
                                    const isSelected = selectedItem === i.id;
                                    return (
                                        <div 
                                            key={i.id} 
                                            onClick={() => setSelectedItem(i.id)}
                                            className={`
                                                relative cursor-pointer border-2 rounded-xl p-2 transition-all active:scale-95
                                                ${isSelected ? 'border-[#DFFF00] bg-[#DFFF00]/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}
                                            `}
                                        >
                                            <div className="aspect-square bg-black/40 rounded-lg mb-2 flex items-center justify-center p-2">
                                                <img src={getAssetUrl(i.item.name)} alt="icon" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="text-[9px] font-black uppercase truncate text-zinc-300">{i.item.name}</div>
                                            <div className="text-[8px] font-mono text-zinc-500">{i.item.rarity}</div>
                                            {isSelected && <div className="absolute top-1 right-1 bg-[#DFFF00] rounded-full p-0.5"><Check size={10} className="text-black"/></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Start Bid</label>
                            <input type="number" value={startPrice} onChange={e => setStartPrice(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-sm text-white font-mono focus:border-[#DFFF00] focus:outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Buyout Price</label>
                            <input type="number" value={buyoutPrice} onChange={e => setBuyoutPrice(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-sm text-white font-mono focus:border-[#DFFF00] focus:outline-none transition-colors" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Duration</label>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {[1, 6, 12, 24, 48].map(h => (
                                <button key={h} onClick={() => setDuration(h)} className={`flex-1 min-w-[60px] py-3 text-xs font-bold rounded border transition-all ${duration === h ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>{h}h</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-6 pt-4 border-t border-zinc-800">
                    <button onClick={handleCreate} disabled={loading || !selectedItem} className="w-full py-4 bg-[#DFFF00] text-black font-black uppercase rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:bg-white transition-colors">
                        {loading ? 'Processing...' : 'Confirm Listing'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- HELPER: TIME LEFT ---
const getTimeLeft = (endsAt: string) => {
    const total = Date.parse(endsAt) - Date.now();
    if (total <= 0) return { text: "ENDED", urgent: false };
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    if (hours === 0 && minutes < 5) return { text: `${minutes}m ${Math.floor((total / 1000) % 60)}s`, urgent: true };
    if (hours === 0) return { text: `${minutes}m`, urgent: true };
    return { text: `${hours}h ${minutes}m`, urgent: false };
};

// --- STYLING HELPERS ---
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