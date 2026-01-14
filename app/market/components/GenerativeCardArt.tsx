'use client'

import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

// --- PROMPT ENGINEERING ---
const getPrompt = (name: string, type: string) => {
    switch (type) {
        case 'CAR':
            // "Showroom" Aesthetic: Clean, reflection-heavy, dark environment
            return `cinematic shot of a ${name} car in a dark futuristic showroom, sleek reflections, rim lighting, 8k resolution, photorealistic, automotive photography, wide angle, volumetric fog`;
        
        case 'NFL_PLAYER':
            // "Digital Hero" Aesthetic: Action-oriented, painterly but realistic
            return `epic digital painting of ${name} american football player, dynamic action pose, stadium lights background, particle effects, dramatic lighting, detailed texture, concept art style, 8k`;
        
        case 'ITEM':
        default:
            // "Cyber Archive" Aesthetic: Isometric, glowing, tech-heavy
            return `isometric 3d render of a ${name}, cyberpunk sci-fi item, floating in void, glowing neon edges, dark background, unreal engine 5, high fidelity, octane render`;
    }
};

export const GenerativeCardArt = ({ 
    name, 
    type = 'ITEM', 
    className = "" 
}: { 
    name: string, 
    type?: string, 
    className?: string 
}) => {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Deterministic seed based on name to ensure the same item always gets the same image
        const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const prompt = getPrompt(name, type);
        
        // Cache buster to ensure we don't get stuck with a cached 'moved' image
        // enhance=true instructs the model to prettify the prompt
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=1200&seed=${seed}&nologo=true&model=flux&enhance=true&_t=${Date.now()}`;
        
        setSrc(url);
    }, [name, type]);

    const handleLoad = () => setLoading(false);
    const handleError = () => { setLoading(false); setSrc(null); };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                    <Loader2 className="animate-spin text-zinc-600" />
                </div>
            )}
            
            {src ? (
                <img 
                    src={src} 
                    alt={name}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`w-full h-full object-cover transition-all duration-700 ${loading ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
                    style={{ 
                        // Subtle color grading per type
                        filter: type === 'CAR' ? 'contrast(1.1) saturate(0.9)' : 
                               type === 'NFL_PLAYER' ? 'contrast(1.1) saturate(1.2)' : 
                               'contrast(1.2) hue-rotate(-5deg)' 
                    }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full bg-zinc-800 text-zinc-600">
                    <ImageOff size={24} />
                </div>
            )}
            
            {/* Vignette Overlay for Depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
        </div>
    );
};