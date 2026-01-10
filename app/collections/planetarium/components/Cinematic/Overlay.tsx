'use client';

import React from 'react';
import { OverlayData } from './types';

export function CinematicOverlay({ data }: { data: OverlayData }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <div className={`
                flex flex-col items-center justify-center 
                duration-5000 ease-in-out
                ${data.show ? 'opacity-100' : 'opacity-0'}
            `}>
                <div className="relative flex flex-col items-center">
                    <h1 className={`
                        text-6xl md:text-8xl font-black text-white uppercase tracking-tighter
                        transition-all duration-5000 ease-out transform
                        ${data.show ? 'scale-100 blur-0 translate-z-0' : 'scale-105 blur-lg translate-z-10'}
                    `}
                    style={{ 
                        fontFamily: 'system-ui, -apple-system, sans-serif', 
                        textShadow: '0 0 50px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5)' 
                    }}>
                        {data.title}
                    </h1>
                    
                    <div className={`
                        h-[2px] bg-white mx-auto mt-2 shadow-[0_0_10px_white]
                        transition-all duration-3000 ease-out delay-200
                        ${data.show ? 'w-[120%] opacity-100' : 'w-0 opacity-0'}
                    `} />

                    {data.subtitle && (
                        <p className={`
                            text-sm md:text-xl font-mono text-[#DFFF00] mt-4 tracking-[0.5em] uppercase text-center
                            transition-all duration-3000 delay-300
                            ${data.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                        style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                        >
                            {data.subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}