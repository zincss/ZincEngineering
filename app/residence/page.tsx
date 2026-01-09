'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Building2, Sparkles, Search, Filter, Loader2 } from 'lucide-react';
import PropertyCard from './components/PropertyCard';
import { PROPERTY_FLAVOR } from './lib/data';
import { PropertyTemplate } from './types';

export default function ResidencePage() {
  const [listings, setListings] = useState<PropertyTemplate[]>([]);
  const [ownershipMap, setOwnershipMap] = useState<Map<string, string>>(new Map());
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Fetch Templates
      const { data: templates } = await supabase
        .from('property_templates')
        .select('*')
        .order('price', { ascending: true });

      // 2. Fetch Owned
      const { data: owned } = await supabase
        .from('user_properties')
        .select('id, template_id, is_primary')
        .eq('user_id', user.id);

      if (templates) setListings(templates);
      if (owned) {
        const map = new Map(owned.map(o => [o.template_id, o.id]));
        setOwnershipMap(map);
        setPrimaryId(owned.find(o => o.is_primary)?.template_id || null);
      }
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-xs uppercase animate-pulse">
        <Loader2 size={16} className="animate-spin" /> Accessing Real Estate Database...
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-white pt-24 pb-20">
      
      {/* HEADER SECTION */}
      <div className="relative border-b border-white/10 bg-zinc-900/50 pb-12 mb-12 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#DFFF00] font-mono text-xs font-bold tracking-widest uppercase mb-2">
                    <Building2 size={16} />
                    <span>Zinc Real Estate Group</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.8]">
                    EXECUTIVE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DFFF00] to-emerald-500">LIFESTYLE</span>
                </h1>
                <p className="text-zinc-400 max-w-xl text-lg font-light leading-relaxed border-l-2 border-[#DFFF00] pl-6 mt-6">
                    Secure your base of operations. From efficiency pods to orbital stations, 
                    find a sanctuary that matches your ambition.
                </p>
            </div>

            {/* MARKET STATS */}
            <div className="hidden md:flex gap-8 text-right">
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Listings</div>
                    <div className="text-2xl font-mono font-bold text-white">{listings?.length || 0}</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Market Status</div>
                    <div className="text-2xl font-mono font-bold text-emerald-500 flex items-center justify-end gap-1">
                        OPEN <Sparkles size={14} />
                    </div>
                </div>
            </div>
            </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="bg-black/40 p-2 rounded-lg text-zinc-400">
                    <Search size={18} />
                </div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Browsing Catalog...</span>
            </div>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors">
                    <Filter size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* LISTINGS GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {!listings || listings.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
                <Building2 className="mx-auto text-zinc-700 mb-4" size={48} />
                <h3 className="text-zinc-500 font-bold uppercase">Database Empty</h3>
                <p className="text-zinc-600">No properties found in the network.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((prop) => {
                const flavor = PROPERTY_FLAVOR[prop.name] || PROPERTY_FLAVOR['The Pod'];
                const ownedPropertyId = ownershipMap.get(prop.id); // Get the USER property ID

                return (
                    <PropertyCard 
                        key={prop.id} 
                        property={prop as PropertyTemplate} 
                        flavor={flavor}
                        isOwned={!!ownedPropertyId}
                        ownedId={ownedPropertyId} // Pass the correct ID to the card
                        isPrimary={primaryId === prop.id}
                    />
                );
            })}
            </div>
        )}
      </div>
    </div>
  );
}