'use client'

import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff, Trophy } from 'lucide-react';
import { createClient } from '@/utils/supabase/client'; // Ensure this exists
import { CARS } from '@/app/automotive/data';
import { NFL_PLAYERS } from '@/app/market/lib/nfl_data';

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

export const GRIDIRON_PACK_SOURCE = NFL_PLAYERS.map((player, i) => {
    let rarity = 'COMMON';
    if (player.name === 'Tom Brady') rarity = 'ZENITH';
    else if (i < 15) rarity = 'ULTRA';      
    else if (i < 40) rarity = 'SUPER_RARE'; 
    else if (i < 75) rarity = 'RARE';       
    else if (i < 115) rarity = 'UNCOMMON';  
    else rarity = 'COMMON';                 

    return {
        ...player,
        rarity,
        type: 'NFL_PLAYER',
        description: `${player.position} | ${player.team} | ${player.era} - ${player.history}`,
        searchQuery: player.searchQuery || `${player.name} NFL`,
        color: player.accentColor 
    };
});

// --- FLAIR ITEMS ---
const FLAIR_LIST = [
    'Neon Genesis', 'Cyber Angel', 'Void Walker', 'Chrome Heart', 'Solar Flare', 
    'Lunar Eclipse', 'Star Dust', 'Net Runner', 'Data Wraith', 'System Shock',
    'Zinc Operator', 'Core Dev', 'Bug Hunter', 'Early Access', 'Founder'
];

export const FLAIR_ITEMS_SOURCE = FLAIR_LIST.map((name, i) => {
    let rarity = 'RARE';
    if (name === 'Zinc Operator' || name === 'Founder') rarity = 'COSMIC';
    else if (i < 5) rarity = 'ZENITH';
    else if (i < 10) rarity = 'ULTRA';

    return {
        name,
        rarity,
        type: 'FLAIR',
        description: `Digital signature profile flair: ${name}.`,
        searchQuery: `${name} aesthetic abstract 3d render`
    };
});


// --- FALLBACK AI ---
export const getAssetUrl = (name: string, type: string = 'ITEM') => {
    // We add a random component to the seed to ensure variation if called multiple times, 
    // but typically we want stable images for the same item name. 
    // However, to fix the 'moved' issue, we might need to ensure the URL is fresh or clean.
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let prompt = '';
    
    // DISTINCT ART STYLES
    switch (type) {
        case 'CAR':
            // Style 1: Photorealistic Automotive Studio
            prompt = `photorealistic studio photography of ${name} car, side profile, dramatic rim lighting, dark background, 8k resolution, highly detailed, automotive magazine style`;
            break;
        case 'NFL_PLAYER':
            // Style 2: Digital Oil Painting / Concept Art
            prompt = `digital oil painting of ${name} american football player, dynamic action pose, stadium lights background, expressive brushstrokes, dramatic lighting, heroic composition, concept art`;
            break;
        case 'FLAIR':
            prompt = `abstract 3d render of ${name}, cyberpunk aesthetic, neon glowing shapes, dark background, digital art, octane render`;
            break;
        case 'ITEM':
        default:
            // Style 3: Isometric 3D Cyberpunk
            prompt = `isometric 3d render of ${name} object, cyberpunk sci-fi aesthetic, glowing neon edges, mechanical details, dark background, unreal engine 5, high fidelity`;
            break;
    }

    // Using the /p/ format which is often more reliable for direct embedding
    return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=800&height=1200&seed=${seed}&nologo=true&model=flux`;
};

// --- REAL ASSET FETCHER COMPONENT (UPDATED) ---
const IMAGE_CACHE = new Map<string, string>();

export const RealAssetImage = ({ 
    name, 
    searchQuery, 
    className = "", 
    forcedUrl,
    type = 'ITEM'
}: { 
    name: string, 
    searchQuery: string, 
    className?: string, 
    forcedUrl?: string,
    type?: string 
}) => {
    const [src, setSrc] = useState<string | null>(forcedUrl || null);
    const [loading, setLoading] = useState(!forcedUrl);

    useEffect(() => {
        if (forcedUrl) {
            setSrc(forcedUrl);
            setLoading(false);
            return;
        }

        const fetchImage = async () => {
            const query = searchQuery || name;
            const cacheKey = `${query}_${type}_v3`; // Bump version to v3 to invalidate previous 'moved' images
            
            if (IMAGE_CACHE.has(cacheKey)) {
                setSrc(IMAGE_CACHE.get(cacheKey)!);
                setLoading(false);
                return;
            }

            try {
                const supabase = createClient();
                
                // 1. Check for Admin Override
                const { data: override } = await supabase
                    .from('asset_overrides')
                    .select('image_url')
                    .eq('name', name)
                    .single();

                if (override && override.image_url) {
                    IMAGE_CACHE.set(cacheKey, override.image_url);
                    setSrc(override.image_url);
                    setLoading(false);
                    return;
                }

                // 2. Wiki Fallback (Only for Cars/Players where real photos exist)
                // We SKIP wiki for ITEMS to ensure the 3D Cyberpunk style is consistent
                let searchContext = query;
                const isCar = type === 'CAR';
                const isPlayer = type === 'NFL_PLAYER';
                
                if (isCar || isPlayer) {
                    if (isCar && !query.toLowerCase().includes('car')) searchContext = `${query} car`; 
                    if (isPlayer && !query.toLowerCase().includes('nfl')) searchContext = `${query} NFL`;

                    try {
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
                            IMAGE_CACHE.set(cacheKey, foundUrl);
                            setSrc(foundUrl);
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        // Ignore wiki error, fall through to AI
                    }
                }

                // 3. AI Generation (The fallback for everything)
                const fallbackUrl = getAssetUrl(name, type);
                IMAGE_CACHE.set(cacheKey, fallbackUrl);
                setSrc(fallbackUrl);

            } catch (err) {
                console.error("Failed to fetch image for", query, err);
                setSrc(getAssetUrl(name, type));
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [name, searchQuery, forcedUrl, type]);

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

    return (
        <img 
            src={src} 
            alt={name} 
            className={`${className} transition-opacity duration-500`} 
            style={{ 
                // Subtle grading to unify different sources
                filter: type === 'ITEM' ? 'contrast(1.2) saturate(1.1)' : 'contrast(1.05)'
            }}
        />
    );
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