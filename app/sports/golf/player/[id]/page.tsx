'use client';

import React from 'react';
import { ArrowLeft, Flag, MapPin, Loader2, Trophy, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getOrFetchResource } from '@/lib/data-manager'; 
import { getPlayerProfile } from '../../actions';

// Ensure fresh data
export const dynamic = 'force-dynamic';

export default async function GolfPlayerPage({ params }: { params: { id: string } }) {
  
  // Uses the robust manager (won't crash if DB is missing)
  const data = await getOrFetchResource(
    { table: 'golf_profiles', keyField: 'player_id', id: params.id },
    () => getPlayerProfile(params.id)
  );

  if (!data) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-500">
        ATHLETE NOT FOUND IN ARCHIVES.
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20 pt-8 px-4 md:px-0">
       <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
           
           <Link href="/sports/golf" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] mb-8 font-mono text-[10px] font-bold tracking-widest uppercase hover:border-b border-[#DFFF00] pb-1 transition-all">
               <ArrowLeft size={12} /> RETURN TO CLUBHOUSE
           </Link>

           <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border border-zinc-800 bg-zinc-900/50 p-8 md:p-12 relative overflow-hidden">
               
               {/* IMAGE */}
               <div className="md:col-span-4 relative flex items-center justify-center border border-zinc-800 bg-black p-4 rotate-1 shadow-2xl">
                   {data.image ? (
                       <img src={data.image} alt={data.name} className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                   ) : (
                       <div className="h-64 w-full bg-zinc-900 flex items-center justify-center text-zinc-700 font-mono text-xs">NO VISUAL</div>
                   )}
                   <div className="absolute -bottom-3 -right-3 bg-[#DFFF00] text-black font-black text-xl px-4 py-2 font-mono">
                       {data.rank > 0 ? `#${data.rank}` : 'PRO'}
                   </div>
               </div>

               {/* INFO */}
               <div className="md:col-span-8 flex flex-col justify-between">
                   <div>
                       <div className="flex items-center gap-3 text-zinc-500 mb-2">
                           <Flag size={14} className="text-[#DFFF00]" />
                           <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">{data.country}</span>
                       </div>
                       <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">{data.name}</h1>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-zinc-800 pt-6">
                           <div>
                               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">AGE</span>
                               <span className="text-xl font-mono font-bold text-white">{data.bio.age}</span>
                           </div>
                           <div>
                               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">TURNED PRO</span>
                               <span className="text-xl font-mono font-bold text-white">{data.bio.turnedPro}</span>
                           </div>
                           <div className="col-span-2">
                               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">COLLEGE</span>
                               <span className="text-xl font-mono font-bold text-white truncate block">{data.bio.college}</span>
                           </div>
                       </div>
                   </div>

                   <div className="mt-8 flex gap-4">
                       <div className="px-4 py-2 bg-[#DFFF00] text-black font-black font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                           <TrendingUp size={14} /> FULL STATS
                       </div>
                       <div className="px-4 py-2 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                           <Award size={14} /> TROPHY ROOM
                       </div>
                   </div>
               </div>
           </div>

       </div>
    </div>
  );
}