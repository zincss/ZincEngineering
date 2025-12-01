'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, User, BarChart3, Shield } from 'lucide-react';
import { getPlayerProfile } from '../../actions';

export default function PlayerPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getPlayerProfile(params.id).then(setData);
  }, [params.id]);

  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">LOADING PLAYER PROFILE...</div>;

  return (
    <div className="min-h-screen bg-black pb-20">
        <div className="max-w-5xl mx-auto pt-12 px-6">
            <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] mb-8 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors">
               <ArrowLeft size={12} /> BACK TO COURT
            </Link>

            <div className="bg-zinc-900 border border-zinc-800 overflow-hidden relative mb-8">
                <div className="absolute top-0 right-0 p-32 bg-[#DFFF00] blur-[150px] opacity-10 rounded-full pointer-events-none"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 relative z-10">
                    {/* LEFT: IMAGE */}
                    <div className="md:col-span-4 flex justify-center md:justify-start">
                        <div className="w-64 h-64 bg-black border-2 border-zinc-800 rounded-full overflow-hidden relative shadow-2xl">
                            <img src={data.headshot} className="w-full h-full object-cover object-top scale-110 pt-4" alt={data.name} />
                        </div>
                    </div>

                    {/* RIGHT: INFO */}
                    <div className="md:col-span-8 flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-zinc-400 mb-2">
                            <Shield size={16} className="text-[#DFFF00]"/>
                            <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">{data.team} // #{data.number}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase text-white leading-none tracking-tighter mb-6">{data.name}</h1>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-800 pt-6">
                            <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">POS</span><span className="text-xl font-mono font-bold text-white">{data.pos}</span></div>
                            <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">HEIGHT</span><span className="text-xl font-mono font-bold text-white">{data.height}</span></div>
                            <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">WEIGHT</span><span className="text-xl font-mono font-bold text-white">{data.weight}</span></div>
                            <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">EXP</span><span className="text-xl font-mono font-bold text-white">{data.experience} YRS</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS LOG */}
            <div className="bg-black border border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800">
                    <BarChart3 size={16} className="text-[#DFFF00]"/>
                    <span className="text-xs font-black tracking-widest uppercase text-white">SEASON AVERAGES</span>
                </div>
                
                {data.stats && data.stats.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {data.stats.map((stat: any, i: number) => (
                            <div key={i} className="bg-zinc-900 p-4 border border-zinc-800 text-center">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">{stat.name}</span>
                                <span className="text-2xl font-black text-white font-mono">{stat.displayValue}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-zinc-500 font-mono text-xs">NO SEASON STATS AVAILABLE</div>
                )}
            </div>
        </div>
    </div>
  );
}