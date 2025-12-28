'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Activity } from 'lucide-react';

export default function BreakdownHub() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background FX */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10 text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 text-[#DFFF00] font-mono text-xs uppercase tracking-widest animate-pulse">
                <Activity size={14} />
                <span>Select Target Frequency</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-4">
                The <span className="text-zinc-800 text-stroke-white">Breakdown</span>
            </h1>
            <p className="text-zinc-500 font-mono text-sm max-w-lg mx-auto">
                Access detailed tactical analysis, predictive modeling, and historical matchup data.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl relative z-10">
            {/* NBA CARD */}
            <Link href="/sports/breakdown/nba" className="group relative min-h-[400px] rounded-[3rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00] transition-all duration-500">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                 
                 <div className="absolute bottom-0 left-0 p-12 w-full">
                     <h2 className="text-6xl font-black uppercase text-white mb-4 italic">NBA</h2>
                     <div className="flex items-center gap-4 text-zinc-400 group-hover:text-white transition-colors">
                        <span className="font-mono text-xs uppercase tracking-widest">Hardwood Analysis</span>
                        <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                     </div>
                 </div>
            </Link>

            {/* NFL CARD */}
            <Link href="/sports/breakdown/nfl" className="group relative min-h-[400px] rounded-[3rem] border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-[#DFFF00] transition-all duration-500">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=2626&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                 
                 <div className="absolute bottom-0 left-0 p-12 w-full">
                     <h2 className="text-6xl font-black uppercase text-white mb-4 italic">NFL</h2>
                     <div className="flex items-center gap-4 text-zinc-400 group-hover:text-white transition-colors">
                        <span className="font-mono text-xs uppercase tracking-widest">Gridiron Analysis</span>
                        <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                     </div>
                 </div>
            </Link>
        </div>
    </main>
  );
}