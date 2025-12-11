'use client'

import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';
import { CARS } from '@/app/automotive/data';

// --- DATA SOURCES ---
export const REEL_ITEMS_SOURCE = [
  { name: 'Plastic Spork', rarity: 'COMMON', description: 'Barely functional. The apex of disposable cutlery.', searchQuery: 'Spork' }, 
  { name: 'AA Battery', rarity: 'COMMON', description: 'Not included. Probably dead anyway.', searchQuery: 'AA battery' },
  { name: 'Red Brick', rarity: 'COMMON', description: "It's a brick. Good for throwing.", searchQuery: 'Brick' }, 
  { name: 'Left Sock', rarity: 'COMMON', description: 'Where is the right one? A mystery.', searchQuery: 'Sock' },
  { name: 'Vintage Toaster', rarity: 'UNCOMMON', description: 'A fire hazard that occasionally browns bread.', searchQuery: 'Toaster' }, 
  { name: 'Lava Lamp', rarity: 'UNCOMMON', description: 'Distracting goo. Do not drink.', searchQuery: 'Lava lamp' },
  { name: 'Gaming Chair', rarity: 'RARE', description: 'Racing bucket seat for sitting absolutely still.', searchQuery: 'Gaming chair' }, 
  { name: 'Mechanical Keyboard', rarity: 'RARE', description: 'Loud. Annoying. Tactile. Your coworkers hate you.', searchQuery: 'Mechanical keyboard' },
  { name: 'Espresso Machine', rarity: 'SUPER_RARE', description: 'Overcomplicated bean water extractor. PhD required.', searchQuery: 'Espresso machine' }, 
  { name: 'VR Headset', rarity: 'SUPER_RARE', description: 'Escape reality. Motion sickness included.', searchQuery: 'Virtual reality headset' },
  { name: 'Solid Gold Paperclip', rarity: 'ULTRA', description: 'It holds paper. But expensively.', searchQuery: 'Paperclip' }, 
  { name: 'The Zinc Cube', rarity: 'ZENITH', description: 'Dense. Heavy. Zinc. Perfection.', searchQuery: 'Zinc' },
  { name: 'Rubber Band', rarity: 'COMMON', description: 'Potential energy storage device. Snap.', searchQuery: 'Rubber band' }, 
  { name: 'Coffee Mug', rarity: 'UNCOMMON', description: 'Vessel for caffeine. Stain resistant (lies).', searchQuery: 'Mug' },
  { name: 'Drone', rarity: 'RARE', description: 'Buzzing annoyance. Battery life: 2 minutes.', searchQuery: 'Quadcopter' }, 
  { name: 'Diamond Ring', rarity: 'ULTRA', description: 'Compressed carbon. Depreciates instantly.', searchQuery: 'Diamond' },
  { name: 'Soda Can', rarity: 'COMMON', description: 'Aluminum cylinder. Contents: Liquid sugar.', searchQuery: 'Beverage can' }, 
  { name: 'Pizza Box', rarity: 'COMMON', description: 'Cardboard with grease stains. Pizza not included.', searchQuery: 'Pizza' },
  { name: 'Smart Watch', rarity: 'RARE', description: 'It tells time and steals your personal data.', searchQuery: 'Smartwatch' }, 
  { name: 'Succulent', rarity: 'UNCOMMON', description: 'A plant you might actually manage not to kill.', searchQuery: 'Succulent plant' }
];

export const FLAIR_ITEMS_SOURCE = [
    { name: 'Neon Samurai', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar.', searchQuery: 'Samurai' },
    { name: 'Cyber Skull', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar. Death is only a glitch.', searchQuery: 'Skull' },
    { name: 'Glitch Cat', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar. Purring in binary.', searchQuery: 'Cyberpunk cat' },
    { name: 'Void Eye', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar. It sees everything.', searchQuery: 'Eye' },
    { name: 'Golden Ticket', rarity: 'COSMIC', type: 'FLAIR', description: 'Animated profile avatar. Access granted.', searchQuery: 'Golden ticket' },
];

export const CAR_PACK_SOURCE = CARS.map(car => {
  let rarity = 'COMMON';
  if (car.id === '919-hybrid-evo') rarity = 'ZENITH'; 
  else if (car.class === 'Formula 1' || car.class === 'Hypercar' || car.class === 'Le Mans Prototype') rarity = 'ULTRA';
  else if (car.class === 'Supercar' || car.class === 'Group B') rarity = 'SUPER_RARE';
  else if (car.class === 'WRC' || car.class === 'JDM Legend') rarity = 'RARE';
  else if (car.manufacturer === 'Porsche' || car.manufacturer === 'Ferrari' || car.class === 'Touring' || car.class === 'Muscle') rarity = 'UNCOMMON';
  
  return {
    ...car,
    rarity,
    type: 'CAR',
    searchQuery: car.searchQuery || `${car.manufacturer} ${car.name}`
  };
});

// Helper to get fallback URL (AI generated)
export const getAssetUrl = (name: string, type?: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Determine context for better AI generation
    const isCar = CAR_PACK_SOURCE.some(c => c.name === name);
    let prompt = '';
    
    if (isCar) {
         prompt = encodeURIComponent(`professional automotive photography of ${name}, dark studio lighting, 8k, photorealistic`);
    } else {
         prompt = encodeURIComponent(`isometric 3d icon of ${name}, futuristic container, cyberpunk style, 8k`);
    }

    return `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1080&seed=${seed}&nologo=true&model=flux-realism`;
};

// --- REAL ASSET FETCHER COMPONENT ---
const IMAGE_CACHE = new Map<string, string>();

export const RealAssetImage = ({ name, searchQuery, className = "" }: { name: string, searchQuery: string, className?: string }) => {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            const query = searchQuery || name;
            
            if (IMAGE_CACHE.has(query)) {
                setSrc(IMAGE_CACHE.get(query)!);
                setLoading(false);
                return;
            }

            try {
                // 1. Try Wikipedia
                const response = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`
                );
                const data = await response.json();
                const pages = data.query?.pages;
                let foundUrl = null;

                if (pages) {
                    const pageId = Object.keys(pages)[0];
                    if (pageId !== '-1' && pages[pageId].thumbnail) {
                        foundUrl = pages[pageId].thumbnail.source;
                    }
                }

                if (foundUrl) {
                    IMAGE_CACHE.set(query, foundUrl);
                    setSrc(foundUrl);
                } else {
                    // 2. Fallback to AI Generator if Wiki fails
                    console.log(`Wiki image missing for ${query}, using fallback.`);
                    const fallbackUrl = getAssetUrl(name);
                    IMAGE_CACHE.set(query, fallbackUrl);
                    setSrc(fallbackUrl);
                }
            } catch (err) {
                console.error("Failed to fetch image for", query, err);
                // Error Fallback
                setSrc(getAssetUrl(name));
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [name, searchQuery]);

    if (loading) {
        return <div className={`flex items-center justify-center bg-zinc-900 ${className}`}><Loader2 className="animate-spin text-zinc-600" /></div>;
    }

    if (!src) {
        // Should rarely happen now due to fallback
        return (
            <div className={`flex flex-col items-center justify-center bg-zinc-800 text-zinc-600 ${className}`}>
                <ImageOff size={24} />
            </div>
        );
    }

    return <img src={src} alt={name} className={className} />;
};

// --- HELPER COMPONENTS & FUNCTIONS ---
export const BasePackIcon = ({ size = 24, style = {} }: { size?: number, style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M5 2H19V22H5V2Z" fill="#18181b" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 6H19" stroke="currentColor" strokeWidth="1"/>
    <path d="M5 18H19" stroke="currentColor" strokeWidth="1"/>
    <rect x="8" y="9" width="8" height="6" fill="currentColor" fillOpacity="0.2"/>
    <path d="M8 9L16 15" stroke="currentColor" strokeWidth="1"/>
    <path d="M16 9L8 15" stroke="currentColor" strokeWidth="1"/>
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

// RESTORED: AssetPreloader to prevent "undefined" error in MarketPage
export const AssetPreloader = () => null;

export const animationStyles = `
  @keyframes shine {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  .animate-shine {
    animation: shine 2s infinite linear;
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;

// RESTORED: Time Left Helper for Auction House
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
        urgent: total < 1000 * 60 * 60 
    };
};

// Alias ItemImage to RealAssetImage for backward compatibility
export const ItemImage = RealAssetImage;