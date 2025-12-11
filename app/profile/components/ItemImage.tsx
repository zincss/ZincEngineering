'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface ItemImageProps {
    name: string;
    searchQuery?: string;
    rarity?: string;
    className?: string;
}

const IMAGE_CACHE = new Map<string, string>();

export const ItemImage = ({ name, searchQuery, className = "" }: ItemImageProps) => {
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
                    // 2. Fallback to AI
                    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    // Determine prompt type based on name hints (simple heuristic)
                    const isLikelyCar = /Ferrari|Porsche|Lamborghini|Ford|BMW|Mercedes|Nissan|Toyota|Honda|McLaren|Bugatti/i.test(name);
                    const prompt = encodeURIComponent(
                        isLikelyCar 
                        ? `professional automotive photography of ${name}, dark studio lighting, 8k, photorealistic`
                        : `isometric 3d icon of ${name}, futuristic container, cyberpunk style, 8k`
                    );
                    const fallbackUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1080&seed=${seed}&nologo=true&model=flux-realism`;
                    
                    IMAGE_CACHE.set(query, fallbackUrl);
                    setSrc(fallbackUrl);
                }
            } catch (err) {
                console.error("Failed to fetch image for", query, err);
                // Fallback on error
                setSrc(`https://image.pollinations.ai/prompt/${encodeURIComponent(name)}?nologo=true`);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [name, searchQuery]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-zinc-900 border border-zinc-800 ${className}`}>
                <Loader2 className="animate-spin text-zinc-600" size={24} />
            </div>
        );
    }

    if (!src) {
        return (
            <div className={`flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-700 ${className}`}>
                <ImageOff size={24} />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden bg-zinc-900 border border-zinc-800 ${className}`}>
            <img 
                src={src} 
                alt={name} 
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
};