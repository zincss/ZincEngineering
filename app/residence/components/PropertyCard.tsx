'use client';

import { purchaseProperty } from '../actions'; 
import { useTransition } from 'react';
import { Loader2, Star, Zap, Box, Car } from 'lucide-react';
import Link from 'next/link';
import { PropertyTemplate } from '../types';

interface PropertyCardProps {
    property: PropertyTemplate;
    flavor: any;
    isOwned: boolean;
    ownedId?: string; // New Prop
    isPrimary: boolean;
}

export default function PropertyCard({ property, flavor, isOwned, ownedId, isPrimary }: PropertyCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleBuy = () => {
    if(!confirm(`Purchase ${property.name} for ${property.price.toLocaleString()} Credits?`)) return;
    startTransition(async () => {
      await purchaseProperty(property.id, property.price);
    });
  };

  return (
    <div className={`
        group relative flex flex-col bg-zinc-900 rounded-3xl overflow-hidden border transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)]
        ${isPrimary ? 'border-[#DFFF00] shadow-[0_0_30px_rgba(223,255,0,0.1)]' : 'border-white/5 hover:border-white/20'}
    `}>
      
      {/* IMAGE AREA */}
      <div className={`h-56 relative bg-gradient-to-br ${flavor?.gradient || 'from-zinc-900 to-black'} overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-xl">
                {property.rarity}
            </span>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pt-12">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{property.name}</h3>
            <p className="text-xs text-zinc-400 font-medium tracking-wide">{flavor?.tagline}</p>
        </div>
      </div>

      {/* DETAILS AREA */}
      <div className="p-6 flex flex-col flex-1 gap-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-black/20 rounded-xl border border-white/5">
            <div className="flex flex-col items-center justify-center p-2 text-center">
                <span className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Yield</span>
                <div className="flex items-center gap-1 text-[#DFFF00] font-mono text-xs font-bold">
                    <Zap size={12} fill="currentColor" />
                    {property.base_yield_rate}/hr
                </div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border-l border-white/5 text-center">
                <span className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Slots</span>
                <div className="flex items-center gap-1 text-white font-mono text-xs font-bold">
                    <Box size={12} />
                    {property.max_display_slots}
                </div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border-l border-white/5 text-center">
                <span className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Garage</span>
                <div className="flex items-center gap-1 text-white font-mono text-xs font-bold">
                    <Car size={12} />
                    {property.max_garage_slots}
                </div>
            </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
             {flavor?.features?.map((feat: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                    <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                    {feat}
                </div>
            ))}
        </div>

        {/* ACTION BUTTON */}
        <div className="mt-auto pt-4 border-t border-white/5">
            {isOwned && ownedId ? (
              <div className="flex gap-2">
                  {/* LINK USES THE CORRECT OWNED ID NOW */}
                  <Link href={`/residence/${ownedId}`} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/5">
                      Enter Property
                  </Link>
                  {isPrimary && (
                      <div className="w-12 flex items-center justify-center bg-[#DFFF00]/10 border border-[#DFFF00]/20 rounded-xl text-[#DFFF00]">
                          <Star size={16} fill="currentColor" />
                      </div>
                  )}
              </div>
            ) : (
              <button 
                onClick={handleBuy} 
                disabled={isPending}
                className="w-full py-3 bg-[#DFFF00] hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(223,255,0,0.1)] hover:shadow-[0_0_30px_rgba(223,255,0,0.4)] flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="animate-spin" size={14} /> : 'PURCHASE DEED'}
                <span className="opacity-30">|</span> 
                {property.price.toLocaleString()} CR
              </button>
            )}
        </div>
      </div>
    </div>
  );
}