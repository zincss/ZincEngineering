// app/sports/page.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Trophy, Wind, Shield, Flag, Zap } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function SportsHub() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20">
      <BackButton href="/" label="HOME" />
      
      {/* HERO SECTION */}
      <section className="relative h-[40vh] min-h-[400px] flex items-center overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10" />
           {/* Stadium Background */}
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale" />
        </div>
        
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-6">
          
          {/* BADGE MOVED TO RIGHT SIDE */}
          <div className="absolute top-0 right-4 md:right-6 animate-in fade-in slide-in-from-right-4 duration-1000">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-full text-[10px] font-mono text-[#DFFF00] tracking-widest uppercase">
               <span className="w-2 h-2 bg-[#DFFF00] rounded-full animate-pulse" />
               Athletics Division
             </div>
          </div>

          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-4 uppercase animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
              League <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-800 text-stroke-white">Telemetry</span>
            </h1>
            
            <p className="max-w-xl text-zinc-400 font-mono text-sm md:text-base leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <span className="text-[#DFFF00] mr-2">///</span>
              Real-time tracking, historical archives, and performance analytics for global professional leagues. Access raw data streams below.
            </p>
          </div>
        </div>
      </section>

      {/* MODULE GRID */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* NFL MODULE */}
            <Link href="/sports/nfl" className="group relative h-64 md:h-96 overflow-hidden border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-all duration-500 lg:col-span-2">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=2626&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <div className="flex items-center justify-between mb-4">
                        <Zap size={32} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors" />
                        <ArrowRight size={24} className="text-zinc-500 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black uppercase text-white mb-2 tracking-tight">NFL Nexus</h2>
                    <p className="text-zinc-500 font-mono text-xs max-w-sm group-hover:text-zinc-400 transition-colors">
                        National Football League. RedZone wire, playoff picture, and live scoring telemetry.
                    </p>
                </div>
            </Link>

            {/* NBA MODULE */}
            <Link href="/sports/nba" className="group relative h-64 md:h-96 overflow-hidden border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-all duration-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <div className="flex items-center justify-between mb-4">
                        <Trophy size={32} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors" />
                        <ArrowRight size={24} className="text-zinc-500 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-2 tracking-tight">NBA Ops</h2>
                    <p className="text-zinc-500 font-mono text-xs max-w-sm group-hover:text-zinc-400 transition-colors">
                        Live court telemetry & rosters.
                    </p>
                </div>
            </Link>

            {/* F1 MODULE */}
            <Link href="/sports/f1" className="group relative h-64 md:h-96 overflow-hidden border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-all duration-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <div className="flex items-center justify-between mb-4">
                        <Wind size={32} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors" />
                        <ArrowRight size={24} className="text-zinc-500 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-2 tracking-tight">Formula 1</h2>
                    <p className="text-zinc-500 font-mono text-xs max-w-sm group-hover:text-zinc-400 transition-colors">
                        Grand Prix data & analytics.
                    </p>
                </div>
            </Link>

            {/* NRL MODULE */}
            <Link href="/sports/nrl" className="group relative h-64 md:h-96 overflow-hidden border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-all duration-500">
                <div className="absolute inset-0 bg-[url('https://www.rlpa.com.au/wp-content/themes/yootheme/cache/5a/Erin-Clark-Named-2025-RLPA-NRL-Recruit-of-the-Year-5a22c256.jpeg')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <div className="flex items-center justify-between mb-4">
                        <Shield size={32} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors" />
                        <ArrowRight size={24} className="text-zinc-500 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-2 tracking-tight">NRL League</h2>
                    <p className="text-zinc-500 font-mono text-xs max-w-sm group-hover:text-zinc-400 transition-colors">
                        Premiership match statistics.
                    </p>
                </div>
            </Link>

            {/* GOLF MODULE */}
            <Link href="/sports/golf" className="group relative h-64 md:h-96 overflow-hidden border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-all duration-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <div className="flex items-center justify-between mb-4">
                        <Flag size={32} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors" />
                        <ArrowRight size={24} className="text-zinc-500 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-2 tracking-tight">Golf</h2>
                    <p className="text-zinc-500 font-mono text-xs max-w-sm group-hover:text-zinc-400 transition-colors">
                        PGA Tour scoring & rankings.
                    </p>
                </div>
            </Link>

        </div>
      </section>
    </main>
  );
}