// app/components/BackButton.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = 'RETURN', className = '' }: BackButtonProps) {
  return (
    // Changed top-20 to top-28 for mobile to give space from header
    <div className={`fixed top-28 left-4 md:top-24 md:left-6 z-50 animate-in fade-in slide-in-from-left-4 duration-700 pointer-events-auto ${className}`}>
         <Link 
            href={href} 
            // Changed rounded-full to rounded-md
            className="flex items-center justify-center md:justify-start gap-0 md:gap-2 text-zinc-400 hover:text-[#DFFF00] transition-colors text-[10px] font-mono uppercase tracking-widest bg-zinc-950/80 backdrop-blur-md w-10 h-10 md:w-auto md:h-auto md:px-3 md:py-2 border border-zinc-800 hover:border-[#DFFF00] group shadow-lg rounded-md md:rounded-sm"
         >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden md:inline">{label}</span>
         </Link>
    </div>
  );
}