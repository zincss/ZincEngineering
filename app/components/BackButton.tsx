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
    <div className={`fixed top-24 left-6 z-50 animate-in fade-in slide-in-from-left-4 duration-700 pointer-events-auto ${className}`}>
         <Link 
            href={href} 
            className="flex items-center gap-2 text-zinc-400 hover:text-[#DFFF00] transition-colors text-[10px] font-mono uppercase tracking-widest bg-zinc-950/80 backdrop-blur-md px-3 py-2 border border-zinc-800 hover:border-[#DFFF00] group shadow-lg rounded-sm"
         >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
            {label}
         </Link>
    </div>
  );
}