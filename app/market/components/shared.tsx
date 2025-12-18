// app/market/components/shared.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';
import { CARS } from '@/app/automotive/data';

// --- DATA SOURCES ---

// 125 Unique Base Items
const BASE_ITEMS_LIST = [
    // COMMON
    'Paperclip', 'Stapler', 'Rubber Band', 'Post-it Note', 'Ballpoint Pen', 'Pencil', 'Eraser', 'Sharpie', 'Highlighter', 'Notebook',
    'Coffee Mug', 'Teaspoon', 'Fork', 'Knife', 'Spoon', 'Plate', 'Bowl', 'Napkin', 'Straw', 'Coaster',
    'Water Bottle', 'Soda Can', 'Juice Box', 'Milk Carton', 'Cereal Box', 'Pizza Box', 'Burger Wrapper', 'Fries Container', 'Ketchup Packet', 'Mustard Packet',
    'Toothbrush', 'Toothpaste', 'Floss', 'Soap Bar', 'Shampoo Bottle', 'Towel', 'Toilet Paper', 'Tissue Box', 'Hand Sanitizer', 'Band-Aid',
    'AA Battery', 'AAA Battery', '9V Battery', 'Light Bulb', 'Extension Cord', 'Power Strip', 'USB Cable', 'HDMI Cable', 'Ethernet Cable', 'Phone Charger',
    'Mouse', 'Mousepad', 'Keyboard', 'Webcam', 'Microphone', 'Headphones', 'Earbuds', 'Flash Drive', 'SD Card', 'CD-ROM',
    'Floppy Disk', 'Cassette Tape', 'VHS Tape', 'Remote Control', 'Calculator', 'Ruler', 'Scissors', 'Tape', 'Glue Stick', 'Staples',
    'Thumbtacks', 'Safety Pin', 'Matchbox', 'Lighter', 'Candle', 'String', 'Wire', 'Nail', 'Screw', 'Bolt',
    'Nut', 'Washer', 'Allen Key', 'Screwdriver', 'Hammer',

    // UNCOMMON
    'Plant Pot', 'Cactus', 'Succulent', 'Fern', 'Bonsai Tree', 'Vase', 'Picture Frame', 'Painting', 'Poster', 'Wall Clock',
    'Alarm Clock', 'Desk Lamp', 'Floor Lamp', 'Lava Lamp', 'Plasma Ball', 'Newton Cradle', 'Hourglass', 'Globe', 'Map', 'Compass',
    'Binoculars', 'Telescope', 'Microscope', 'Magnifying Glass', 'Camera Lens', 'Film Roll', 'Tripod', 'Drone', 'Controller', 'Console',

    // RARE
    'Gold Watch', 'Silver Ring', 'Diamond Earring', 'Pearl Necklace', 'Ruby Brooch', 'Sapphire Pendant', 'Emerald Bracelet', 'Platinum Chain', 'Titanium Ring', 'Obsidian Amulet',
    'Crystal Skull', 'Golden Idol', 'Ancient Coin', 'Fossil', 'Meteorite',

    // SUPER RARE
    'Quantum Chip', 'Flux Capacitor', 'Anti-Gravity Module', 'Dark Matter Vial',

    // ULTRA
    'The Zinc Cube' 
];

export const REEL_ITEMS_SOURCE = BASE_ITEMS_LIST.map((name, i) => {
    let rarity = 'COMMON';
    if (i >= 124) rarity = 'ZENITH'; // The Zinc Cube
    else if (i >= 120) rarity = 'ULTRA';
    else if (i >= 105) rarity = 'SUPER_RARE';
    else if (i >= 75) rarity = 'RARE';
    else if (i >= 50) rarity = 'UNCOMMON'; 

    if (name === 'The Zinc Cube') rarity = 'ZENITH';
    else if (['Quantum Chip', 'Flux Capacitor', 'Anti-Gravity Module', 'Dark Matter Vial'].includes(name)) rarity = 'ULTRA';
    
    return {
        name,
        rarity,
        type: 'ITEM',
        description: `Standard issue item #${1000 + i}. Collected from the Zinc Archives.`,
        searchQuery: name
    };
});

export const CAR_PACK_SOURCE = CARS.map(car => {
  let rarity = 'COMMON';
  if (car.id === '919-hybrid-evo') rarity = 'ZENITH'; 
  else if (car.class === 'Formula 1' || car.class === 'Hypercar' || car.class === 'Le Mans Prototype') rarity = 'ULTRA';
  else if (car.class === 'Supercar' || car.class === 'Group B') rarity = 'SUPER_RARE';
  else if (car.class === 'WRC' || car.class === 'JDM Legend' || car.class === 'Track Special') rarity = 'RARE';
  else if (car.class === 'Touring' || car.class === 'Muscle' || car.class === 'JDM') rarity = 'UNCOMMON';
  
  return {
    ...car,
    rarity,
    type: 'CAR',
    searchQuery: `${car.manufacturer} ${car.name}` 
  };
});

// --- FALLBACK AI ---
export const getAssetUrl = (name: string, type?: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prompt = encodeURIComponent(`high quality photo of ${name}, isolated on black background, 8k`);
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
                let searchContext = query;
                const isCar = CAR_PACK_SOURCE.some(c => c.name === name);
                
                if (isCar && !query.toLowerCase().includes('car')) {
                    searchContext = `${query} car`; 
                }

                // Search Wikimedia Commons
                const response = await fetch(
                    `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(searchContext)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`
                );
                
                const data = await response.json();
                let foundUrl = null;

                if (data.query?.pages) {
                    const pages = Object.values(data.query.pages);
                    // @ts-ignore
                    if (pages.length > 0 && pages[0].imageinfo && pages[0].imageinfo.length > 0) {
                        // @ts-ignore
                        foundUrl = pages[0].imageinfo[0].url;
                    }
                }

                if (foundUrl) {
                    IMAGE_CACHE.set(query, foundUrl);
                    setSrc(foundUrl);
                } else {
                    const fallbackUrl = getAssetUrl(name);
                    IMAGE_CACHE.set(query, fallbackUrl);
                    setSrc(fallbackUrl);
                }
            } catch (err) {
                console.error("Failed to fetch image for", query, err);
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
        return (
            <div className={`flex flex-col items-center justify-center bg-zinc-800 text-zinc-600 ${className}`}>
                <ImageOff size={24} />
            </div>
        );
    }

    return <img src={src} alt={name} className={className} />;
};

// --- HELPERS ---
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

export const CarFront = ({ size = 24, style = {} }: { size?: number, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
);

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

    return { text, urgent: total < 1000 * 60 * 60 };
};

export const AssetPreloader = () => null;

export const animationStyles = `
  @keyframes shine {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  .animate-shine {
    animation: shine 2s infinite linear;
  }
`;

export const ItemImage = RealAssetImage;