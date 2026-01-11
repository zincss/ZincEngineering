'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Search, Box, Grid, BookOpen, ChevronUp, CheckCircle2, Gavel, X, DollarSign, Trophy } from 'lucide-react';
import { ProfileAssetCard } from './ProfileAssetCard'; 
import { ItemDetailModal } from './ItemDetailModal';
import { TradingCard } from '@/app/market/components/TradingCard';
import { quickSellItem, breakdownItem, listAuctionItem } from '@/app/profile/actions'; // Adjust path if needed
import { motion, AnimatePresence } from 'framer-motion';

// Import Source Data
import { CARS } from '@/app/automotive/data';
import { 
    REEL_ITEMS_SOURCE, 
    FLAIR_ITEMS_SOURCE, 
    CAR_PACK_SOURCE,
    GRIDIRON_PACK_SOURCE 
} from '@/app/market/components/shared';

const RARITY_RANK: Record<string, number> = {
    'ZENITH': 6, 'COSMIC': 5, 'ULTRA': 4, 'SUPER_RARE': 3, 'RARE': 2, 'UNCOMMON': 1, 'COMMON': 0
};

export default function InventoryView({ user }: { user: any }) {
  const [viewMode, setViewMode] = useState<'VAULT' | 'COLLECTIONS'>('VAULT');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Auction Modal State
  const [auctionItem, setAuctionItem] = useState<any | null>(null);
  const [auctionPrice, setAuctionPrice] = useState(100);
  const [auctionBuyout, setAuctionBuyout] = useState(1000);
  const [auctionDuration, setAuctionDuration] = useState(24);
  const [isProcessing, setIsProcessing] = useState(false);

  // Collapsible State for Collections
  const [collapsedSets, setCollapsedSets] = useState<Record<string, boolean>>({});

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
                const flairMatch = FLAIR_ITEMS_SOURCE.find((f: any) => f.name === name);
                if (flairMatch) sourceData = { type: 'FLAIR', searchQuery: flairMatch.searchQuery, description: flairMatch.description };
             }
             return { ...item, sourceData };
        });
        setItems(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  // --- ACTIONS ---
  const handleQuickSell = async (id: string, rarity: string) => {
      if(!confirm("Are you sure you want to sell this item? This cannot be undone.")) return;
      setIsProcessing(true);
      const res = await quickSellItem(id, rarity);
      setIsProcessing(false);
      if(res.success) {
          fetchInventory(); // Refresh local list
          setSelectedItem(null); // Close modal if open
      } else {
          alert(res.error);
      }
  };

  const handleBreakdown = async (id: string, rarity: string) => {
      if(!confirm("Breakdown this item for parts? The item will be destroyed.")) return;
      setIsProcessing(true);
      const res = await breakdownItem(id, rarity);
      setIsProcessing(false);
      if(res.success) {
          fetchInventory();
          setSelectedItem(null);
      } else {
          alert(res.error);
      }
  };

  const handleListAuction = async () => {
      if(!auctionItem) return;
      setIsProcessing(true);
      const res = await listAuctionItem(auctionItem.id, auctionPrice, auctionBuyout, auctionDuration);
      setIsProcessing(false);
      if(res.success) {
          fetchInventory();
          setAuctionItem(null); // Close auction modal
      } else {
          alert(res.error);
      }
  };

  // --- COLLECTION LOGIC ---
  const generateCollection = (title: string, sourceList: any[], type: string) => {
      if (!sourceList) return { id: title, title, total: 0, collected: 0, grid: [] };
      const total = sourceList.length;
      let collected = 0;
      const grid = sourceList.map(sourceItem => {
          const ownedItem = items.find(i => i.item_templates.name === sourceItem.name);
          if (ownedItem) collected++;
          return {
              ...sourceItem, type, isLocked: !ownedItem,
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
      generateCollection("Gridiron Legends", GRIDIRON_PACK_SOURCE, 'GRIDIRON'),
      generateCollection("Profile Flair", FLAIR_ITEMS_SOURCE, 'FLAIR'),
  ];

  const toggleSet = (id: string) => setCollapsedSets(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center text-zinc-700 gap-4">
        <Loader2 className="animate-spin text-[#DFFF00]" size={32} />
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing Secure Vault...</span>
    </div>
  );

  const filteredItems = items.filter(i => i.item_templates.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isProcessing && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-[#DFFF00]" size={48} />
                  <span className="font-mono text-xs font-black text-white uppercase tracking-widest">Processing Transaction...</span>
              </div>
          </div>
      )}

      {/* VIEW TOGGLE & SEARCH */}
      <div className="sticky top-[-2px] z-30 bg-black/90 backdrop-blur-xl pt-2 pb-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-800/50">
         <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 w-full md:w-auto">
             <button onClick={() => setViewMode('VAULT')} className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'VAULT' ? 'bg-[#DFFF00] text-black shadow-lg shadow-[#DFFF00]/10' : 'text-zinc-500 hover:text-white'}`}>
                <Grid size={14}/> My Vault
             </button>
             <button onClick={() => setViewMode('COLLECTIONS')} className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'COLLECTIONS' ? 'bg-[#DFFF00] text-black shadow-lg shadow-[#DFFF00]/10' : 'text-zinc-500 hover:text-white'}`}>
                <BookOpen size={14}/> Collections
             </button>
         </div>
         
         <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#DFFF00] transition-colors" size={16} />
            <input 
                type="text" 
                placeholder="Search Secure Registry..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-mono text-white focus:border-[#DFFF00] focus:bg-black focus:outline-none transition-all placeholder:text-zinc-700 shadow-inner" 
            />
            {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                    <X size={14} />
                </button>
            )}
        </div>
      </div>

      {/* --- VIEW: VAULT --- */}
      {viewMode === 'VAULT' && (
          filteredItems.length === 0 ? (
            <div className="text-center py-32 text-zinc-700 font-mono flex flex-col items-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
                <Box size={64} className="mb-6 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Vault Inventory Empty</p>
                <p className="text-[9px] mt-2 text-zinc-800">Clear filters or obtain new assets via Market</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 pb-32">
                {filteredItems.map((item) => (
                    <ProfileAssetCard 
                        key={item.id} 
                        item={{
                            ...item,
                            name: item.item_templates.name,
                            rarity: item.item_templates.rarity,
                            description: item.sourceData.description,
                            type: item.sourceData.type,
                            searchQuery: item.sourceData.searchQuery,
                            serial_number: item.serial_number,
                            isShiny: item.is_shiny
                        }}
                        onQuickSell={handleQuickSell}
                        onBreakdown={handleBreakdown}
                        onAuction={(itm) => setAuctionItem(item)}
                        onView={() => setSelectedItem(item)}
                    />
                ))}
            </div>
          )
      )}

      {/* --- VIEW: COLLECTIONS --- */}
      {viewMode === 'COLLECTIONS' && (
          <div className="space-y-8 md:space-y-12 pb-32">
              {COLLECTIONS.map((col) => {
                  const isCollapsed = collapsedSets[col.id];
                  const percent = col.total > 0 ? Math.round((col.collected / col.total) * 100) : 0;
                  return (
                    <div key={col.id} className="relative bg-zinc-900/10 border border-zinc-800 rounded-[2.5rem] overflow-hidden group hover:border-zinc-700 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-8 cursor-pointer hover:bg-zinc-900/30 transition-colors gap-6" onClick={() => toggleSet(col.id)}>
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-zinc-800 transition-all ${percent === 100 ? 'bg-[#DFFF00] border-[#DFFF00] text-black shadow-[0_0_30px_rgba(223,255,0,0.3)]' : 'bg-black text-zinc-600'}`}>
                                    <Trophy size={28} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                        {col.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-[10px] font-mono font-black text-zinc-500 uppercase">
                                        <span className={percent === 100 ? "text-[#DFFF00]" : ""}>{col.collected} / {col.total} Extracted</span>
                                        <span className="opacity-20 text-white">|</span>
                                        <span>{percent}% Affinity</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 flex-1 md:max-w-xs">
                                <div className="flex-1 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full transition-all duration-1000 ${percent === 100 ? 'bg-[#DFFF00] shadow-[0_0_15px_#DFFF00]' : 'bg-zinc-700'}`} 
                                    />
                                </div>
                                <div className={`p-3 rounded-full bg-zinc-900 border border-zinc-800 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''} shrink-0`}>
                                    <ChevronUp size={18} className="text-zinc-500" />
                                </div>
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="p-8 pt-0 border-t border-zinc-800/50 bg-zinc-950/20 animate-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8">
                                    {col.grid.map((item: any, idx: number) => (
                                        <div key={`${col.id}-${idx}`} className={`${item.isLocked ? 'opacity-30 grayscale saturate-0 transition-all hover:opacity-50' : 'cursor-pointer'}`} onClick={() => !item.isLocked && setSelectedItem(items.find(i => i.item_templates.name === item.name))}>
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

      {/* --- AUCTION LISTING MODAL --- */}
      <AnimatePresence>
          {auctionItem && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
              >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#DFFF00]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                      
                      <div className="flex justify-between items-start mb-10 relative z-10">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 text-[#DFFF00]">
                                  <Gavel size={24} />
                              </div>
                              <div>
                                  <h3 className="text-2xl font-black uppercase text-white italic leading-none">Auction House</h3>
                                  <p className="text-[10px] font-mono text-zinc-500 uppercase mt-2 tracking-widest">Asset // <span className="text-white">{auctionItem.item_templates.name}</span></p>
                              </div>
                          </div>
                          <button onClick={() => setAuctionItem(null)} className="p-2.5 hover:bg-zinc-900 rounded-xl transition-all border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-white"><X size={20}/></button>
                      </div>
                      
                      <div className="space-y-6 relative z-10">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-3">
                                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Reserve_Price</label>
                                  <div className="relative group/input">
                                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within/input:text-[#DFFF00] transition-colors" />
                                      <input type="number" value={auctionPrice} onChange={e => setAuctionPrice(Number(e.target.value))} className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white font-mono focus:border-[#DFFF00] outline-none transition-all shadow-inner" />
                                  </div>
                              </div>
                              <div className="space-y-3">
                                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Buyout_Price</label>
                                  <div className="relative group/input">
                                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within/input:text-[#DFFF00] transition-colors" />
                                      <input type="number" value={auctionBuyout} onChange={e => setAuctionBuyout(Number(e.target.value))} className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white font-mono focus:border-[#DFFF00] outline-none transition-all shadow-inner" />
                                  </div>
                              </div>
                          </div>
                          
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Listing_Duration</label>
                              <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 gap-1">
                                  {[6, 12, 24, 48].map(h => (
                                      <button key={h} onClick={() => setAuctionDuration(h)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${auctionDuration === h ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>{h}H</button>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <button onClick={handleListAuction} className="w-full mt-10 py-5 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_40px_rgba(223,255,0,0.2)] active:scale-95">
                          Authorize Listing
                      </button>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* DETAIL MODAL (Existing) */}
      {selectedItem && (
        <ItemDetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onQuickSell={() => handleQuickSell(selectedItem.id, selectedItem.item_templates.rarity)} 
            onBreakdown={() => handleBreakdown(selectedItem.id, selectedItem.item_templates.rarity)} 
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