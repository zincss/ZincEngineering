'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { Box, Wrench, Tent, Loader2, Briefcase } from 'lucide-react';
import BackButton from '@/app/components/BackButton';
import { InventoryItem, Material, SortOption } from './types';

// Components
import { ProfileHeader } from './components/ProfileHeader';
import { InventoryView } from './components/InventoryView';
import { MaterialsView } from './components/MaterialsView';
import { BaseCampView } from './components/BaseCampView';
import { ItemDetailModal } from './components/ItemDetailModal';
import { PortfolioView } from './components/PortfolioView';

// --- CONFIGURATION ---

const RARITY_WEIGHTS: Record<string, number> = { 'COSMIC': 7, 'ZENITH': 6, 'ULTRA': 5, 'SUPER_RARE': 4, 'RARE': 3, 'UNCOMMON': 2, 'COMMON': 1 };
const QUICK_SELL_VALUES: Record<string, number> = { 'COMMON': 2, 'UNCOMMON': 5, 'RARE': 20, 'SUPER_RARE': 100, 'ULTRA': 500, 'ZENITH': 2000, 'COSMIC': 5000 };

const BREAKDOWN_YIELDS: Record<string, { type: string, label: string, amount: number }> = {
    'COMMON': { type: 'BASIC_SCRAP', label: 'Basic Scrap', amount: 3 },
    'UNCOMMON': { type: 'UNCOMMON_CIRCUITS', label: 'Uncommon Circuits', amount: 2 },
    'RARE': { type: 'RARE_ALLOY', label: 'Rare Alloy', amount: 1 },
    'SUPER_RARE': { type: 'PLASMA_CORE', label: 'Plasma Core', amount: 1 },
    'ULTRA': { type: 'VOID_CRYSTAL', label: 'Void Crystal', amount: 1 },
    'ZENITH': { type: 'QUANTUM_SHARD', label: 'Quantum Shard', amount: 1 },
    'COSMIC': { type: 'COSMIC_DUST', label: 'Cosmic Dust', amount: 5 }
};

export default function ProfilePage() {
  const supabase = createClient();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  
  // Data State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<'ITEMS' | 'MATERIALS' | 'BASE_CAMP' | 'PORTFOLIO'>('BASE_CAMP'); 
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Modal Supply State
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [loadingSupply, setLoadingSupply] = useState(false);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    if (user) Promise.all([fetchInventory(), fetchMaterials()]).finally(() => setLoading(false));
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  // Modal Logic
  useEffect(() => {
    if (selectedItem) {
        setLoadingSupply(true);
        const fetchSupply = async () => {
            const { count, error } = await supabase.from('user_items').select('*', { count: 'exact', head: true }).eq('template_id', selectedItem.item_templates.id);
            if (!error) setTotalSupply(count);
            setLoadingSupply(false);
        };
        fetchSupply();
    } else setTotalSupply(null);
  }, [selectedItem]);

  const fetchInventory = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_items').select(`id, serial_number, is_shiny, obtained_at, item_templates!inner (id, name, rarity, description, image_url)`).eq('user_id', user.id).order('obtained_at', { ascending: false });
    if (data) setInventory(data as unknown as InventoryItem[]);
  };

  const fetchMaterials = async () => {
      if (!user) return;
      const { data } = await supabase.from('user_materials').select('*').eq('user_id', user.id);
      if (data) setMaterials(data as Material[]);
  };

  // --- 2. HELPERS ---
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'COSMIC': return 'text-pink-400 bg-pink-900/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]';
        case 'ZENITH': return 'text-[#DFFF00] bg-[#DFFF00]/10 border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.2)]';
        case 'ULTRA': return 'text-purple-400 bg-purple-900/20 border-purple-500';
        case 'SUPER_RARE': return 'text-orange-400 bg-orange-900/20 border-orange-500';
        case 'RARE': return 'text-blue-400 bg-blue-900/20 border-blue-500';
        case 'UNCOMMON': return 'text-green-400 bg-green-900/20 border-green-500';
        default: return 'text-zinc-400 bg-zinc-900 border-zinc-700';
    }
  };

  // --- 3. FILTER LOGIC ---
  const processedInventory = useMemo(() => {
    let result = [...inventory];
    const counts = new Map<string, number>();
    result.forEach(item => counts.set(item.item_templates.id, (counts.get(item.item_templates.id) || 0) + 1));
    if (filter !== 'ALL') {
        if (filter === 'DUPLICATES') result = result.filter(item => (counts.get(item.item_templates.id) || 0) > 1);
        else if (filter === 'SHINY') result = result.filter(item => item.is_shiny);
        else result = result.filter(item => item.item_templates.rarity === filter);
    }
    result.sort((a, b) => {
        if (sortBy === 'NEWEST') return new Date(b.obtained_at).getTime() - new Date(a.obtained_at).getTime();
        if (sortBy === 'OLDEST') return new Date(a.obtained_at).getTime() - new Date(b.obtained_at).getTime();
        if (sortBy === 'RARITY_DESC') return (RARITY_WEIGHTS[b.item_templates.rarity] || 0) - (RARITY_WEIGHTS[a.item_templates.rarity] || 0);
        if (sortBy === 'RARITY_ASC') return (RARITY_WEIGHTS[a.item_templates.rarity] || 0) - (RARITY_WEIGHTS[b.item_templates.rarity] || 0);
        return 0;
    });
    return result;
  }, [inventory, filter, sortBy]);

  // --- 4. ACTION HANDLERS ---

  const handleTrade = async (costMaterial: string, costAmount: number, rewardPackName: string) => {
      if (!user) return;
      
      // 1. Verify User has materials
      const userMat = materials.find(m => m.material_type === costMaterial);
      if (!userMat || userMat.quantity < costAmount) {
          alert(`Insufficient materials! Need ${costAmount}x ${costMaterial.replace('_', ' ')}`);
          return;
      }

      if (!window.confirm(`Exchange ${costAmount}x ${costMaterial.replace('_', ' ')} for 1x ${rewardPackName}?`)) return;

      try {
          // 2. Find the Pack Template ID
          const { data: templates, error: templateError } = await supabase
              .from('item_templates')
              .select('id')
              .eq('name', rewardPackName)
              .single();
          
          if (templateError || !templates) throw new Error(`Pack template '${rewardPackName}' not found in database.`);

          // 3. Deduct Materials
          // (Assuming add_material handles negatives, otherwise we update manually)
          const { error: matError } = await supabase.rpc('add_material', { 
              p_material_type: costMaterial, 
              p_amount: -costAmount 
          });
          if (matError) throw matError;

          // 4. Add Pack to Inventory
          const { data: newItem, error: itemError } = await supabase
              .from('user_items')
              .insert({
                  user_id: user.id,
                  template_id: templates.id,
                  is_shiny: Math.random() < 0.05, // 5% chance for a Shiny Pack
                  obtained_at: new Date().toISOString()
              })
              .select()
              .single();
          
          if (itemError) throw itemError;

          // 5. Refresh Data
          await Promise.all([fetchMaterials(), fetchInventory()]);
          alert("Trade Successful! Pack delivered to Assets.");

      } catch (err: any) {
          console.error(err);
          alert(`Trade Failed: ${err.message || "Unknown Error"}`);
      }
  };

  const handleQuickSell = async () => {
      if (!selectedItem) return;
      const sellValue = QUICK_SELL_VALUES[selectedItem.item_templates.rarity] || 2;
      if (!window.confirm(`Quick Sell ${selectedItem.item_templates.name} for ${sellValue} Credits?`)) return;

      try {
          const { error } = await supabase.from('user_items').delete().eq('id', selectedItem.id);
          if (error) throw error;
          await supabase.rpc('add_credits', { amount: sellValue });
          
          setInventory(prev => prev.filter(i => i.id !== selectedItem.id));
          setSelectedItem(null);
          if (refreshProfile) refreshProfile();
      } catch (err) { alert("Transaction Failed."); }
  };

  const handleBreakdown = async () => {
      if (!selectedItem) return;
      const yieldData = BREAKDOWN_YIELDS[selectedItem.item_templates.rarity];
      if (!yieldData) { alert("This item cannot be broken down."); return; }
      if (!window.confirm(`Scrap ${selectedItem.item_templates.name} into ${yieldData.amount}x ${yieldData.label}?`)) return;

      try {
          await supabase.from('user_items').delete().eq('id', selectedItem.id);
          await supabase.rpc('add_material', { p_material_type: yieldData.type, p_amount: yieldData.amount });
          setInventory(prev => prev.filter(i => i.id !== selectedItem.id));
          await fetchMaterials(); 
          setSelectedItem(null);
          alert(`Success! Acquired ${yieldData.amount}x ${yieldData.label}`);
      } catch (err) { alert("Breakdown Failed."); }
  };

  const handleEquip = async () => {
    if (!selectedItem || !user) return;
    try {
        await supabase.from('profiles').update({ avatar_image: selectedItem.item_templates.name }).eq('id', user.id);
        alert(`Equipped ${selectedItem.item_templates.name}!`);
        if (refreshProfile) refreshProfile();
    } catch (err) { alert("Failed to equip."); }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-[#DFFF00]"/></div>;
  if (!user) return <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-6"><BackButton href="/" label="MAIN TERMINAL" /><h2 className="text-2xl font-black text-white uppercase mb-2">Access Denied</h2></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black relative">
      <BackButton href="/" label="MAIN TERMINAL" />
      
      <ProfileHeader profile={profile} inventoryCount={inventory.length} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 overflow-x-auto">
                <button onClick={() => setViewMode('BASE_CAMP')} className={`flex items-center gap-2 px-6 py-3 font-bold uppercase rounded transition-all whitespace-nowrap ${viewMode === 'BASE_CAMP' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Tent size={16} /> <span>Base Camp</span></button>
                <button onClick={() => setViewMode('ITEMS')} className={`flex items-center gap-2 px-6 py-3 font-bold uppercase rounded transition-all whitespace-nowrap ${viewMode === 'ITEMS' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Box size={16} /> <span>Assets</span></button>
                <button onClick={() => setViewMode('MATERIALS')} className={`flex items-center gap-2 px-6 py-3 font-bold uppercase rounded transition-all whitespace-nowrap ${viewMode === 'MATERIALS' ? 'bg-blue-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Wrench size={16} /> <span>Parts</span></button>
                <button onClick={() => setViewMode('PORTFOLIO')} className={`flex items-center gap-2 px-6 py-3 font-bold uppercase rounded transition-all whitespace-nowrap ${viewMode === 'PORTFOLIO' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Briefcase size={16} /> <span>Portfolio</span></button>
            </div>
        </div>

        {viewMode === 'BASE_CAMP' && (
            <BaseCampView 
                materials={materials} 
                onTrade={handleTrade} 
            />
        )}
        
        {viewMode === 'ITEMS' && (
            <InventoryView 
                inventory={processedInventory} 
                loading={loading} 
                filter={filter} 
                setFilter={setFilter} 
                sortBy={sortBy} 
                setSortBy={setSortBy} 
                onSelectItem={setSelectedItem} 
                getRarityColor={getRarityColor} 
            />
        )}
        
        {viewMode === 'MATERIALS' && (
            <MaterialsView materials={materials} />
        )}

        {viewMode === 'PORTFOLIO' && user && (
            <PortfolioView userId={user.id} />
        )}
      </div>

      {selectedItem && (
          <ItemDetailModal 
              item={selectedItem} 
              onClose={() => setSelectedItem(null)} 
              getRarityColor={getRarityColor} 
              onQuickSell={handleQuickSell} 
              onBreakdown={handleBreakdown} 
              onEquip={handleEquip} 
              loadingSupply={loadingSupply} 
              totalSupply={totalSupply} 
          />
      )}
    </div>
  );
}