'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ItemImageProps {
    name: string;
    rarity: string;
    className?: string;
}

export const ItemImage = ({ name, rarity, className = "" }: ItemImageProps) => {
    // Generate deterministic seed for the image
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // UPDATED: High-Resolution & Realism Prompt
    const prompt = encodeURIComponent(
        `isometric 3d icon of ${name}, futuristic glass cube container, cyberpunk aesthetics, glowing neon edges, dark grey background, unreal engine 5 render, high fidelity, 8k, center focus`
    );
    // UPDATED: URL Parameters for higher quality
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1280&height=1280&seed=${seed}&nologo=true&model=flux-realism`;
    
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 ${className} group`}>
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                    <Loader2 className="animate-spin text-zinc-700" size={24} />
                </div>
            )}
            <img 
                src={imageUrl} 
                alt={name}
                className={`w-full h-full object-cover transform transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} group-hover:scale-110`}
                onLoad={() => setLoaded(true)}
                loading="eager"
            />
            {/* Rarity Effects */}
            {rarity === 'ZENITH' && <div className="absolute inset-0 bg-gradient-to-t from-[#DFFF00]/20 to-transparent pointer-events-none mix-blend-overlay" />}
            {rarity === 'COSMIC' && <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent pointer-events-none mix-blend-overlay" />}
            {rarity === 'ULTRA' && <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none mix-blend-overlay" />}
            
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
};