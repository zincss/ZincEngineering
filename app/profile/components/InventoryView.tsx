'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Search, Box } from 'lucide-react';
import { ItemDetailModal } from './ItemDetailModal';
import { ProfileTradingCard } from './ProfileTradingCard';

// Import Source Data to map features
import { CARS } from '@/app/automotive/data';
import { REEL_ITEMS_SOURCE, FLAIR_ITEMS_SOURCE } from '@/app/play/market/components/shared';

interface InventoryItem {
    id: string;
    serial_number: number;
    is_shiny: boolean;
    obtained_at: string;
    item_templates: {
        id: string;
        name: string;
        rarity: string;
        description: string;
        image_url?: string;
    };
    sourceData?: any; // Enriched data from local constants
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
          // ENRICH DATA: Map DB items to Source Data to get search queries/types
          const enrichedData = data.map((item: any) => {
              const name = item.item_templates.name;
              
              // Try to find in CARS first
              const carMatch = CARS.find(c => c.name === name);
              if (carMatch) {
                  return { 
                      ...item, 
                      sourceData: { 
                          type: 'CAR', 
                          // Use the specific search query we defined in automotive/data.ts, or fallback
                          searchQuery: carMatch.searchQuery || `${carMatch.manufacturer} ${carMatch.name}`,
                          description: carMatch.history
                      } 
                  };
              }

              // Try Reel Items
              const reelMatch = REEL_ITEMS_SOURCE.find(r => r.name === name);
              if (reelMatch) {
                  return { ...item, sourceData: { type: 'ITEM', searchQuery: reelMatch.searchQuery } };
              }

              // Try Flair
              const flairMatch = FLAIR_ITEMS_SOURCE.find(f => f.name === name);
              if (flairMatch) {
                  return { ...item, sourceData: { type: 'FLAIR', searchQuery: flairMatch.searchQuery } };
              }

              return item;
          });

          setItems(enrichedData);
      }
      setLoading(false);
    };
    fetchInventory();
  }, [user]);

  // Filtering Logic
  const filteredItems = items.filter(item => {
    if (!item.item_templates) return false;
    const matchesSearch = item.item_templates.name.toLowerCase().includes(search.toLowerCase());
    const matchesRarity = filterRarity === 'ALL' || item.item_templates.rarity === filterRarity;
    return matchesSearch && matchesRarity;
  });

  if (loading) return <div className="flex h-64 items-center justify-center text-[#DFFF00] font-mono text-xs tracking-widest"><Loader2 className="animate-spin mr-2" /> SYNCING SECURE VAULT...</div>;

  return (
    <div className="w-full">
      
      {/* HEADER CONTROLS */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md pt-2 pb-6 mb-6 flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH INVENTORY PROTOCOL..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-sm font-mono text-white focus:border-[#DFFF00] focus:outline-none transition-colors placeholder:text-zinc-600"
          />
        </div>
        
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

      {/* ASSET GRID - USING NEW CARD DESIGN */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 text-zinc-600 font-mono flex flex-col items-center border-2 border-dashed border-zinc-900 rounded-3xl">
            <Box size={48} className="mb-4 opacity-30" />
            <p className="text-xs uppercase tracking-widest">No Assets Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
          {filteredItems.map((item) => (
            <ProfileTradingCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItem(item)} 
            />
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedItem && (
        <ItemDetailModal 
            item={selectedItem} 
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