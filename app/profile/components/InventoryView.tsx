'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Search, Box, Grid, BookOpen, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'; // Added CheckCircle2
import { ItemDetailModal } from './ItemDetailModal';
import { TradingCard } from '@/app/market/components/components/TradingCard'; 

// Import Source Data
import { CARS } from '@/app/automotive/data';
import { REEL_ITEMS_SOURCE, FLAIR_ITEMS_SOURCE, CAR_PACK_SOURCE } from '@/app/market/components/components/shared';

// Rarity Ranker for Sorting
const RARITY_RANK: Record<string, number> = {
    'ZENITH': 6, 'COSMIC': 5, 'ULTRA': 4, 'SUPER_RARE': 3, 'RARE': 2, 'UNCOMMON': 1, 'COMMON': 0
};

export default function InventoryView({ user }: { user: any }) {
  const [viewMode, setViewMode] = useState<'VAULT' | 'COLLECTIONS'>('VAULT');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Collapsible State for Collections
  const [collapsedSets, setCollapsedSets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchInventory = async () => {
      if (!user) return;
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_items')
        .select(`
            id, serial_number, is_shiny, obtained_at, 
            item_templates (id, name, rarity, description, image_url)
        `)
        .eq('user_id', user.id)
        .order('obtained_at', { ascending: false });

      if (data) {
          const enriched = data.map((item: any) => {
               const name = item.item_templates.name;
               let sourceData = { type: 'ITEM', searchQuery: name, description: item.item_templates.description };
               
               const carMatch = CARS.find(c => c.name === name);
               if (carMatch) {
                  sourceData = { type: 'CAR', searchQuery: carMatch.searchQuery || `${carMatch.manufacturer} ${carMatch.name}`, description: carMatch.history };
               } else {
                  const flairMatch = FLAIR_ITEMS_SOURCE.find(f => f.name === name);
                  if (flairMatch) sourceData = { type: 'FLAIR', searchQuery: flairMatch.searchQuery, description: flairMatch.description };
               }
               return { ...item, sourceData };
          });
          setItems(enriched);
      }
      setLoading(false);
    };
    fetchInventory();
  }, [user]);

  // --- COLLECTION LOGIC ---
  const generateCollection = (title: string, sourceList: any[], type: string) => {
      const total = sourceList.length;
      let collected = 0;

      const grid = sourceList.map(sourceItem => {
          const ownedItem = items.find(i => i.item_templates.name === sourceItem.name);
          if (ownedItem) collected++;
          
          return {
              ...sourceItem,
              type: type,
              isLocked: !ownedItem,
              serial_number: ownedItem ? ownedItem.serial_number : null,
              isShiny: ownedItem ? ownedItem.is_shiny : false,
          };
      });

      grid.sort((a, b) => {
         if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1;
         return RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity];
      });

      return { id: title, title, total, collected, grid };
  };

  const COLLECTIONS = [
      generateCollection("Base Set // Series 1", REEL_ITEMS_SOURCE, 'ITEM'),
      generateCollection("Automotive Legends", CAR_PACK_SOURCE, 'CAR'),
      generateCollection("Profile Flair", FLAIR_ITEMS_SOURCE, 'FLAIR'),
  ];

  const toggleSet = (id: string) => {
      setCollapsedSets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-[#DFFF00] font-mono text-xs tracking-widest"><Loader2 className="animate-spin mr-2" /> SYNCING SECURE VAULT...</div>;

  return (
    <div className="w-full">
      
      {/* VIEW TOGGLE */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md pt-2 pb-6 mb-6 flex flex-col gap-4 border-b border-zinc-800/50">
         <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start">
             <button 
                onClick={() => setViewMode('VAULT')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'VAULT' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
             >
                <Grid size={14}/> My Vault ({items.length})
             </button>
             <button 
                onClick={() => setViewMode('COLLECTIONS')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'COLLECTIONS' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
             >
                <BookOpen size={14}/> Collections
             </button>
         </div>
         
         {viewMode === 'VAULT' && (
             <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                    type="text" placeholder="SEARCH INVENTORY..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-sm font-mono text-white focus:border-[#DFFF00] focus:outline-none transition-colors placeholder:text-zinc-600"
                />
            </div>
         )}
      </div>

      {/* --- VIEW: VAULT --- */}
      {viewMode === 'VAULT' && (
          items.filter(i => i.item_templates.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
            <div className="text-center py-20 text-zinc-600 font-mono flex flex-col items-center border-2 border-dashed border-zinc-900 rounded-3xl">
                <Box size={48} className="mb-4 opacity-30" />
                <p className="text-xs uppercase tracking-widest">No Assets Found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                {items.filter(i => i.item_templates.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
                    <div key={item.id} onClick={() => setSelectedItem(item)} className="cursor-pointer hover:scale-105 transition-transform duration-300">
                        <TradingCard item={{
                            name: item.item_templates.name,
                            rarity: item.item_templates.rarity,
                            description: item.sourceData.description,
                            type: item.sourceData.type,
                            searchQuery: item.sourceData.searchQuery,
                            serial_number: item.serial_number,
                            isShiny: item.is_shiny
                        }} />
                    </div>
                ))}
            </div>
          )
      )}

      {/* --- VIEW: COLLECTIONS --- */}
      {viewMode === 'COLLECTIONS' && (
          <div className="space-y-8 pb-20">
              {COLLECTIONS.map((col) => {
                  const isCollapsed = collapsedSets[col.id];
                  const percent = Math.round((col.collected / col.total) * 100);

                  return (
                    <div key={col.id} className="relative bg-zinc-900/20 border border-zinc-800 rounded-2xl overflow-hidden">
                        {/* Section Header */}
                        <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-900/50 transition-colors"
                            onClick={() => toggleSet(col.id)}
                        >
                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    {col.title}
                                    {percent === 100 && <CheckCircle2 size={16} className="text-[#DFFF00]" />}
                                </h3>
                                <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-zinc-500 uppercase">
                                    <span className={percent === 100 ? "text-[#DFFF00]" : ""}>{col.collected} / {col.total} FOUND</span>
                                    <span>•</span>
                                    <span>{percent}% COMPLETE</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Progress Bar */}
                                <div className="hidden md:block w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                    <div className={`h-full transition-all duration-1000 ${percent === 100 ? 'bg-[#DFFF00]' : 'bg-zinc-600'}`} style={{ width: `${percent}%` }} />
                                </div>
                                
                                <div className={`p-2 rounded-full bg-zinc-900 border border-zinc-800 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                                    <ChevronUp size={16} className="text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        
                        {/* The Grid (Collapsible) */}
                        {!isCollapsed && (
                            <div className="p-4 pt-0 border-t border-zinc-800/50 bg-zinc-950/30 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-4">
                                    {col.grid.map((item: any, idx: number) => (
                                        <div 
                                            key={`${col.id}-${idx}`} 
                                            className={`${item.isLocked ? 'opacity-60 pointer-events-none grayscale' : 'cursor-pointer hover:scale-105 transition-transform duration-300'}`} 
                                            onClick={() => !item.isLocked && setSelectedItem(items.find(i => i.item_templates.name === item.name))}
                                        >
                                            <TradingCard item={item} isLocked={item.isLocked} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                  );
              })}
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
        />
      )}
    </div>
  );
}