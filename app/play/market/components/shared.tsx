'use client'

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CARS } from '@/app/automotive/data';

// --- CONSTANTS ---
export const REEL_ITEMS_SOURCE = [
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

// [NEW] Rare Flair Items
export const FLAIR_ITEMS_SOURCE = [
    { name: 'Neon Samurai', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar. The way of the blade.' },
    { name: 'Cyber Skull', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar. Death is only a glitch.' },
    { name: 'Glitch Cat', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar. Purring in binary.' },
    { name: 'Void Eye', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar. It sees everything.' },
    { name: 'Golden Ticket', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar. Access granted.' },
];

export const CAR_PACK_SOURCE = CARS.map(car => {
  let rarity = 'COMMON';
  if (car.id === '919-hybrid-evo') rarity = 'ZENITH'; 
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

// --- HELPERS ---
export const getAssetUrl = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prompt = encodeURIComponent(
        `isometric 3d icon of ${name}, encased in a futuristic glass cube container, cyberpunk aesthetics, glowing neon edges, dark grey background, unreal engine 5 render, high fidelity, 8k, center focus`
    );
    return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${seed}&nologo=true&model=flux`;
};

export const AssetPreloader = () => (
    <div className="hidden">
        {[...REEL_ITEMS_SOURCE, ...CAR_PACK_SOURCE, ...FLAIR_ITEMS_SOURCE].map((item) => (
            <img key={item.name} src={getAssetUrl(item.name)} alt="preload" loading="eager" />
        ))}
    </div>
);

export const ItemImage = ({ name, rarity, className = "" }: { name: string, rarity: string, className?: string }) => {
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
        {rarity === 'COSMIC' && <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 to-transparent pointer-events-none mix-blend-overlay" />}
        {rarity === 'ULTRA' && <div className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent pointer-events-none mix-blend-overlay" />}
        {rarity === 'SUPER_RARE' && <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent pointer-events-none mix-blend-overlay" />}
    </div>
  );
};

export const BasePackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 2H19V22H5V2Z" fill="#18181b" stroke="#DFFF00" strokeWidth="2"/>
    <path d="M5 6H19" stroke="#DFFF00" strokeWidth="1"/>
    <path d="M5 18H19" stroke="#DFFF00" strokeWidth="1"/>
    <rect x="8" y="9" width="8" height="6" fill="#DFFF00" fillOpacity="0.2"/>
    <path d="M8 9L16 15" stroke="#DFFF00" strokeWidth="1"/>
    <path d="M16 9L8 15" stroke="#DFFF00" strokeWidth="1"/>
  </svg>
);

export const animationStyles = `
  .reel-container { --reel-offset: 128px; }
  @media (min-width: 768px) { .reel-container { --reel-offset: 192px; } }
  @keyframes shake {
    0% { transform: translate(1px, 1px) rotate(0deg); }
    50% { transform: translate(-1px, 2px) rotate(-1deg); }
    100% { transform: translate(1px, -2px) rotate(-1deg); }
  }
  @keyframes scroll-reel {
    0% { transform: translateY(0); }
    100% { transform: translateY(calc(-100% + var(--reel-offset))); }
  }
  .animate-rumble { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite; }
  .animate-scroll-1 { animation: scroll-reel 4.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
  .animate-scroll-2 { animation: scroll-reel 5.0s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
  .animate-scroll-3 { animation: scroll-reel 5.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
  .animate-scroll-4 { animation: scroll-reel 6.0s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
  .foil-gradient {
    background: linear-gradient(135deg, #18181b 0%, #000 100%);
    position: relative; overflow: hidden;
  }
  .foil-gradient::after {
    content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 30%, rgba(223, 255, 0, 0.2) 40%, rgba(255, 0, 255, 0.2) 50%, rgba(0, 255, 255, 0.2) 60%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0) 100%);
    transform: rotate(30deg); animation: foil-shine 6s linear infinite; pointer-events: none;
  }
  @keyframes foil-shine { 0% { transform: translate(-50%, -50%) rotate(30deg); } 100% { transform: translate(20%, 20%) rotate(30deg); } }
`;

export function getScrollRarityStyle(rarity: string) { 
    switch (rarity) { 
        case 'COSMIC': return 'bg-pink-900/30 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]';
        case 'ZENITH': return 'bg-[#DFFF00]/20 border-[#DFFF00]'; 
        case 'ULTRA': return 'bg-purple-900/30 border-purple-500'; 
        case 'SUPER_RARE': return 'bg-orange-900/30 border-orange-500'; 
        case 'RARE': return 'bg-blue-900/30 border-blue-500'; 
        case 'UNCOMMON': return 'bg-green-900/30 border-green-600'; 
        default: return 'bg-zinc-900 border-zinc-800'; 
    } 
}

export function getRarityBorder(rarity: string) { 
    switch (rarity) { 
        case 'COSMIC': return 'border-pink-500';
        case 'ZENITH': return 'border-[#DFFF00]'; 
        case 'ULTRA': return 'border-purple-500'; 
        case 'SUPER_RARE': return 'border-orange-500'; 
        case 'RARE': return 'border-blue-500'; 
        case 'UNCOMMON': return 'border-green-600'; 
        default: return 'border-zinc-700'; 
    } 
}

export function getRarityBadge(rarity: string) { 
    switch (rarity) { 
        case 'COSMIC': return 'bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse';
        case 'ZENITH': return 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.5)]'; 
        case 'ULTRA': return 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'; 
        case 'SUPER_RARE': return 'bg-orange-500 text-black'; 
        case 'RARE': return 'bg-blue-600 text-white'; 
        case 'UNCOMMON': return 'bg-green-700 text-white'; 
        default: return 'bg-zinc-800 text-zinc-400'; 
    } 
}

export const getTimeLeft = (endsAt: string) => {
    const total = Date.parse(endsAt) - Date.now();
    if (total <= 0) return { text: "ENDED", urgent: false };
    const minutes = Math.floor((total / 1000 / 60) % 60); const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    if (hours === 0 && minutes < 5) return { text: `${minutes}m ${Math.floor((total / 1000) % 60)}s`, urgent: true };
    return { text: hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`, urgent: hours === 0 };
};