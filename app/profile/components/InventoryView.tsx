'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Search, Box } from 'lucide-react';
import { ItemDetailModal } from './ItemDetailModal';
import { ItemImage } from './ItemImage';

// Define the shape of the data coming from Supabase
interface InventoryItem {
    id: string;
    serial_number: number;
    is_shiny: boolean;
    obtained_at: string;
    // Nesting matches the join query
    item_templates: {
        id: string;
        name: string;
        rarity: string;
        description: string;
        image_url?: string;
    };
}

export default function InventoryView({ user }: { user: any }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!user) return;
      const supabase = createClient();
      
      // CORRECTED QUERY: Uses 'user_items' and joins 'item_templates'
      const { data, error } = await supabase
        .from('user_items')
        .select(`
            id, 
            serial_number, 
            is_shiny, 
            obtained_at, 
            item_templates (
                id, 
                name, 
                rarity, 
                description, 
                image_url
            )
        `)
        .eq('user_id', user.id)
        .order('obtained_at', { ascending: false });

      if (error) {
          console.error('Error fetching inventory:', error);
      } else if (data) {
          // Cast data to our interface
          setItems(data as any[]);
      }
      setLoading(false);
    };
    fetchInventory();
  }, [user]);

  // Filtering Logic
  const filteredItems = items.filter(item => {
    // Safety check for item_templates existence
    if (!item.item_templates) return false;
    
    const matchesSearch = item.item_templates.name.toLowerCase().includes(search.toLowerCase());
    const matchesRarity = filterRarity === 'ALL' || item.item_templates.rarity === filterRarity;
    return matchesSearch && matchesRarity;
  });

  const getRarityColor = (rarity: string) => {
      switch (rarity) {
          case 'ZENITH': return '#DFFF00';
          case 'COSMIC': return '#ec4899'; // Pink
          case 'ULTRA': return '#a855f7'; // Purple
          case 'SUPER_RARE': return '#f97316'; // Orange
          case 'RARE': return '#3b82f6'; // Blue
          default: return '#52525b'; // Zinc-600
      }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-[#DFFF00] font-mono text-xs tracking-widest"><Loader2 className="animate-spin mr-2" /> ACCESSING SECURE VAULT...</div>;

  return (
    <div className="w-full">
      
      {/* HEADER CONTROLS */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md pt-2 pb-6 mb-6 flex flex-col gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH ASSETS..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-sm font-mono text-white focus:border-[#DFFF00] focus:outline-none transition-colors placeholder:text-zinc-600"
          />
        </div>
        
        {/* Rarity Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['ALL', 'ZENITH', 'ULTRA', 'SUPER_RARE', 'RARE', 'COMMON'].map(rarity => (
                <button
                    key={rarity}
                    onClick={() => setFilterRarity(rarity)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                        filterRarity === rarity 
                        ? 'bg-[#DFFF00] text-black border-[#DFFF00]' 
                        : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                >
                    {rarity.replace('_', ' ')}
                </button>
            ))}
        </div>
      </div>

      {/* ASSET GRID */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 text-zinc-600 font-mono flex flex-col items-center border-2 border-dashed border-zinc-900 rounded-3xl">
            <Box size={48} className="mb-4 opacity-30" />
            <p className="text-xs uppercase tracking-widest">No Assets Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 pb-20">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-zinc-500 transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              {/* IMAGE LAYER */}
              <div className="absolute inset-0 p-4">
                  <ItemImage name={item.item_templates.name} rarity={item.item_templates.rarity} className="w-full h-full object-contain drop-shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              </div>
              
              {/* GRADIENT OVERLAY FOR TEXT READABILITY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

              {/* RARITY DOT INDICATOR */}
              <div 
                className="absolute top-3 right-3 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
                style={{ backgroundColor: getRarityColor(item.item_templates.rarity), color: getRarityColor(item.item_templates.rarity) }} 
              />

              {/* SERIAL NUMBER */}
              <div className="absolute top-3 left-3 text-[9px] font-mono text-zinc-500 font-bold">
                  #{String(item.serial_number).padStart(3, '0')}
              </div>

              {/* CARD FOOTER */}
              <div className="absolute bottom-0 left-0 w-full p-4">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{item.item_templates.rarity.replace('_', ' ')}</p>
                <h3 className="text-white font-black text-sm leading-none uppercase line-clamp-2">{item.item_templates.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedItem && (
        <ItemDetailModal 
            // We cast here because the Modal expects 'InventoryItem' from types.ts which matches our local interface structurally
            item={selectedItem as any} 
            onClose={() => setSelectedItem(null)} 
            onQuickSell={() => {}} 
            onBreakdown={() => {}} 
            getRarityColor={(r) => {
                switch(r) {
                    case 'ZENITH': return 'border-[#DFFF00] shadow-[0_0_50px_-12px_#DFFF00]';
                    case 'COSMIC': return 'border-pink-500 shadow-[0_0_50px_-12px_#ec4899]';
                    case 'ULTRA': return 'border-purple-500 shadow-[0_0_50px_-12px_#a855f7]';
                    case 'SUPER_RARE': return 'border-orange-500 shadow-[0_0_50px_-12px_#f97316]';
                    default: return 'border-zinc-700';
                }
            }}
            loadingSupply={false}
            totalSupply={0}
        />
      )}
    </div>
  );
}