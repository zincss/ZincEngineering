'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Info, Loader2, Ruler, Weight, Users, TrendingUp, Shield, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPlayerProfile } from '../../actions'; 

export default function PlayerPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
          const profile = await getPlayerProfile(id as string);
          setData(profile);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center gap-2 font-mono text-xs text-zinc-500"><Loader2 className="animate-spin text-[#DFFF00]"/> LOADING DOSSIER...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-mono text-sm">PLAYER NOT FOUND.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-40 px-4 md:px-0 pt-8 animate-in fade-in duration-700">
      
      {/* FIXED: Removed conflicting hover:text-white. Now consistently black text on acid hover. */}
      <Link href="/sports/nrl" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black hover:bg-[#DFFF00] px-4 py-2 mb-8 group transition-all font-mono font-black text-[10px] uppercase tracking-[0.2em] border border-zinc-800 hover:border-black">
          <ArrowLeft size={12} /> RETURN TO SQUAD
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-zinc-800 bg-zinc-900 shadow-[0_0_40px_rgba(0,0,0,0.5)] mb-12 relative overflow-hidden">
          <div className="lg:col-span-5 relative h-[400px] lg:h-auto bg-black overflow-hidden flex items-center justify-center">
               {data.image ? (
                   <img src={data.image} className="absolute bottom-0 h-[90%] w-auto object-contain z-10" alt={data.name} />
               ) : (
                   <Users size={100} className="text-zinc-800"/>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
          </div>

          <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-black text-white relative">
              <div>
                  <div className="flex items-center gap-3 mb-2 text-zinc-400">
                      <Shield size={16} />
                      <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">{data.pos} // {data.team}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-6">{data.name}</h1>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-800 pt-6">
                      <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">HEIGHT</span>
                          <span className="text-xl font-mono font-bold text-[#DFFF00]">{data.bio.height}</span>
                      </div>
                      <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">WEIGHT</span>
                          <span className="text-xl font-mono font-bold text-[#DFFF00]">{data.bio.weight}</span>
                      </div>
                      <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">AGE</span>
                          <span className="text-xl font-mono font-bold text-white">{data.bio.age}</span>
                      </div>
                       <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">DEBUT</span>
                          <span className="text-xl font-mono font-bold text-white">{data.bio.debut}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-8">
                <div className="flex items-center gap-2 mb-4 text-[#DFFF00]">
                    <FileText size={16} />
                    <span className="font-bold font-mono text-xs tracking-widest">BIO INTEL</span>
                </div>
                <p className="text-xs leading-relaxed font-mono text-zinc-400 whitespace-pre-line">{data.desc}</p>
           </div>

           <div className="bg-black border border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800">
                    <TrendingUp size={14} className="text-[#DFFF00]"/>
                    <span className="text-xs font-black tracking-widest uppercase text-white">CAREER STATS</span>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-zinc-500">APPS</span>
                        <span className="font-black text-white">{data.stats.apps}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-zinc-500">TRIES</span>
                        <span className="font-black text-white">{data.stats.tries}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-zinc-500">WIN %</span>
                        <span className="font-black text-[#DFFF00]">{data.stats.winRate}</span>
                    </div>
                </div>
           </div>
      </div>
    </div>
  );
}