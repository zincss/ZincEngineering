'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, TrendingUp, Users, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPlayerProfile } from '../../actions';
import { getOrFetchResource } from '@/lib/data-manager';

export default function PlayerPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const d = await getOrFetchResource(
        { table: 'nrl_profiles', keyField: 'player_id', id: id },
        () => getPlayerProfile(id)
      );
      setData(d);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-xs uppercase animate-pulse">
        <Loader2 size={16} className="animate-spin" /> Fetching Player Dossier...
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-mono uppercase">PLAYER_NOT_FOUND</div>;

  return (
    <div className="max-w-5xl mx-auto pb-40 px-4 md:px-0 pt-8 animate-in fade-in duration-700">
      
      <Link href="/sports/nrl" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black hover:bg-[#DFFF00] px-4 py-2 mb-8 group transition-all font-mono font-black text-[10px] uppercase tracking-[0.2em] border border-zinc-800 hover:border-black">
          <ArrowLeft size={12} /> RETURN TO SQUAD
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-zinc-800 bg-zinc-900 shadow-[0_0_40px_rgba(0,0,0,0.5)] mb-12 relative overflow-hidden">
          {/* HERO CONTENT */}
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
                      <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">HEIGHT</span><span className="text-xl font-mono font-bold text-[#DFFF00]">{data.bio.height}</span></div>
                      <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">WEIGHT</span><span className="text-xl font-mono font-bold text-[#DFFF00]">{data.bio.weight}</span></div>
                      <div><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">AGE</span><span className="text-xl font-mono font-bold text-white">{data.bio.age}</span></div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
