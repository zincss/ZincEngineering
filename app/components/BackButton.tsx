// app/components/BackButton.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = 'RETURN', className = '' }: BackButtonProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // SMART LOGIC:
      // 1. Always show if we are near the very top (within 50px)
      // 2. Hide if scrolling DOWN (reading content)
      // 3. Show if scrolling UP (trying to navigate)
      
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
        className={`
            fixed z-50 transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
            ${isVisible 
               ? 'translate-y-0 opacity-100 pointer-events-auto' 
               : '-translate-y-4 opacity-0 pointer-events-none'
            }
            /* Position: Just below the header on mobile (top-20), more spacious on desktop (top-24) */
            top-20 left-4 md:top-24 md:left-8
            ${className}
        `}
    >
         <Link 
            href={href} 
            className="
                group relative flex items-center justify-center
                /* Size: Compact touch target on mobile (40px), slightly larger on desktop */
                w-10 h-10 md:w-12 md:h-12
                
                /* Glassmorphism Base Style */
                bg-zinc-950/40 backdrop-blur-xl
                border border-zinc-800
                
                /* Shape: Matching the Home Page 'Rounded Square' look */
                rounded-xl md:rounded-2xl
                
                /* Text/Icon Colors */
                text-zinc-400
                
                /* Hover Interactions: Pop to Acid Green */
                hover:text-black hover:bg-[#DFFF00] hover:border-[#DFFF00] hover:shadow-[0_0_20px_rgba(223,255,0,0.4)]
                
                /* Transitions */
                transition-all duration-300 ease-out
                hover:scale-110 active:scale-95
            "
            aria-label={label}
         >
            {/* Animated Icon */}
            <ArrowLeft size={20} className="md:w-5 md:h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            
            {/* Desktop Tooltip Label (Hidden on mobile to save space) */}
            <span className="
                absolute left-full ml-4 px-3 py-1.5
                bg-zinc-950/90 border border-zinc-800 rounded-lg
                text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400
                opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                transition-all duration-300 pointer-events-none whitespace-nowrap
                hidden md:block
                shadow-xl
            ">
                {label}
            </span>
         </Link>
    </div>
  );
}