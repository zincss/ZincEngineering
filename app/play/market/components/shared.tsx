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
  else if (car.class === 'Formula 1' || car.class === 'Hypercar' || car.class === 'Le Mans Prototype') rarity = 'ULTRA';
  else if (car.class === 'Supercar' || car.class === 'Group B') rarity = 'SUPER_RARE';
  else if (car.class === 'WRC' || car.class === 'JDM Legend') rarity = 'RARE';
  else if (car.manufacturer === 'Porsche' || car.manufacturer === 'Ferrari' || car.class === 'Touring' || car.class === 'Muscle') rarity = 'UNCOMMON';
  else rarity = 'COMMON';

  return {
    name: car.name,
    rarity: rarity,
    description: car.history,
    type: 'CAR' 
  };
});

// --- HELPERS ---
export const getAssetUrl = (name: string, type?: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    let prompt = '';
    // UPDATED: High-Res Parameters & Realism Model
    // Width/Height increased to 1280 for 4K-ish quality on cards
    if (type === 'CAR') {
        prompt = encodeURIComponent(
            `professional studio photography of ${name}, 8k uhd, sharp focus, highly detailed, photorealistic, cinematic lighting, dark sleek showroom background, rim lighting, automotive photography masterpiece`
        );
    } else {
        prompt = encodeURIComponent(
            `isometric 3d icon of ${name}, encased in a futuristic glass cube container, cyberpunk aesthetics, glowing neon edges, dark grey background, unreal engine 5 render, high fidelity, 8k, center focus`
        );
    }

    // Using 'flux-realism' or just 'flux' with high dimensions
    return `https://image.pollinations.ai/prompt/${prompt}?width=1280&height=1280&seed=${seed}&nologo=true&model=flux-realism`;
};

export const AssetPreloader = () => (
    <div className="hidden">
        {[...REEL_ITEMS_SOURCE, ...CAR_PACK_SOURCE, ...FLAIR_ITEMS_SOURCE].map((item: any) => (
            <img key={item.name} src={getAssetUrl(item.name, item.type)} alt="preload" loading="eager" />
        ))}
    </div>
);

export const ItemImage = ({ name, rarity, className = "" }: { name: string, rarity: string, className?: string }) => {
  const isCar = CAR_PACK_SOURCE.some(c => c.name === name);
  const imageUrl = getAssetUrl(name, isCar ? 'CAR' : undefined);
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

export const getTimeLeft = (dateStr: string) => {
    const total = Date.parse(dateStr) - Date.now();
    if (total <= 0) return { text: 'ENDED', urgent: false };
    
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    let text = '';
    if (days > 0) text = `${days}d ${hours}h`;
    else if (hours > 0) text = `${hours}h ${minutes}m`;
    else text = `${minutes}m ${seconds}s`;

    return { 
        text, 
        urgent: total < 1000 * 60 * 60 // Considered urgent if less than 1 hour remains
    };
};