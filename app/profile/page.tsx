'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import { 
    User, Shield, Coins, Calendar, Loader2, Box, Zap, X, Globe, Hash, BarChart3, 
    AlertTriangle, RefreshCw, PenTool, Gem
} from 'lucide-react';
import BackButton from '@/app/components/BackButton';
import Link from 'next/link';

const QUICK_SELL_VALUES: Record<string, number> = {
    'COMMON': 2,
    'UNCOMMON': 5,
    'RARE': 20,
    'SUPER_RARE': 100,
    'ULTRA': 500,
    'ZENITH': 2000,
    'COSMIC': 5000 // [NEW] Value for cosmic items
};

// --- PRELOADER (Cached Images) ---
const getAssetUrl = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prompt = encodeURIComponent(
        `isometric 3d icon of ${name}, encased in a futuristic glass cube container, cyberpunk aesthetics, glowing neon edges, dark grey background, unreal engine 5 render, high fidelity, 8k, center focus`
    );
    return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${seed}&nologo=true&model=flux`;
};

// List of all items for preloading
const KNOWN_ITEMS = [
  'Plastic Spork', 'AA Battery', 'Red Brick', 'Left Sock', 'Vintage Toaster', 
  'Lava Lamp', 'Gaming Chair', 'Mechanical Keyboard', 'Espresso Machine', 
  'VR Headset', 'Solid Gold Paperclip', 'The Zinc Cube', 'Rubber Band', 
  'Coffee Mug', 'Drone', 'Diamond Ring', 'Soda Can', 'Pizza Box', 
  'Smart Watch', 'Succulent',
  'Neon Samurai', 'Cyber Skull', 'Glitch Cat', 'Void Eye', 'Golden Ticket' // [NEW]
];

const AssetPreloader = () => (
    <div className="hidden">
        {KNOWN_ITEMS.map((item) => (
            <img key={item} src={getAssetUrl(item)} alt="preload" loading="eager" />
        ))}
    </div>
);

const ItemImage = ({ name, rarity, className = "" }: { name: string, rarity: string, className?: string }) => {
  const imageUrl = getAssetUrl(name);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 ${className} group`}>
        {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <Loader2 className="animate-spin text-zinc-700" size={24} />
            </div>
        )}
        <img 
            src={imageUrl} 
            alt={name}
            className={`w-full h-full object-cover transform transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} group-hover:scale-110`}
            onLoad={() => setLoaded(true)}
            loading="eager"
        />
        {rarity === 'ZENITH' && <div className="absolute inset-0 bg-gradient-to-t from-[#DFFF00]/20 to-transparent pointer-events-none mix-blend-overlay" />}
        {rarity === 'COSMIC' && <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent pointer-events-none mix-blend-overlay" />}
        {rarity === 'ULTRA' && <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none mix-blend-overlay" />}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [loadingSupply, setLoadingSupply] = useState(false);

  useEffect(() => {
    if (user) {
        fetchInventory();
    } else if (!authLoading) {
        setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (selectedItem) {
        setLoadingSupply(true);
        const fetchSupply = async () => {
            const { count, error } = await supabase
                .from('user_items')
                .select('*', { count: 'exact', head: true })
                .eq('template_id', selectedItem.item_templates.id);
            if (!error) setTotalSupply(count);
            setLoadingSupply(false);
        };
        fetchSupply();
    } else {
        setTotalSupply(null);
    }
  }, [selectedItem]);

  const fetchInventory = async () => {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_items')
        .select(`id, serial_number, is_shiny, obtained_at, item_templates!inner (id, name, rarity, description, image_url)`)
        .eq('user_id', user.id)
        .order('obtained_at', { ascending: false });
      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
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
      } catch (err) {
          alert("Transaction Failed.");
      }
  };

  // [NEW] Function to Equip Avatar
  const handleEquip = async () => {
      if (!selectedItem || !user) return;
      
      try {
          // This assumes an 'avatar_image' column exists in your profiles table
          const { error } = await supabase
            .from('profiles')
            .update({ avatar_image: selectedItem.item_templates.name })
            .eq('id', user.id);
            
          if (error) throw error;
          
          alert(`Equipped ${selectedItem.item_templates.name} as Avatar!`);
          if (refreshProfile) refreshProfile();
          setSelectedItem(null);
      } catch (err) {
          console.error(err);
          alert("Failed to equip avatar.");
      }
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'SHINY') return item.is_shiny;
    return item.item_templates.rarity === filter;
  });

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

  const getRarityStats = (rarity: string) => {
      switch (rarity) {
          case 'COSMIC': return { percent: '???', label: 'ANOMALY' };
          case 'ZENITH': return { percent: '0.1%', label: 'MYTHIC' };
          case 'ULTRA': return { percent: '0.9%', label: 'LEGENDARY' };
          case 'SUPER_RARE': return { percent: '4.0%', label: 'EPIC' };
          case 'RARE': return { percent: '15.0%', label: 'RARE' };
          case 'UNCOMMON': return { percent: '30.0%', label: 'UNCOMMON' };
          default: return { percent: '50.0%', label: 'COMMON' };
      }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#DFFF00]"><Loader2 className="animate-spin"/></div>;

  if (!user) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-6">
            <BackButton href="/" label="MAIN TERMINAL" />
            <AlertTriangle className="text-[#DFFF00] mb-4" size={48} />
            <h2 className="text-2xl font-black text-white uppercase mb-2">Access Denied</h2>
            <Link href="/login" className="px-8 py-4 bg-[#DFFF00] text-black font-black uppercase rounded-xl hover:bg-white transition-colors">Initialize Login</Link>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black relative">
      <AssetPreloader />
      <BackButton href="/" label="MAIN TERMINAL" />

      {/* HEADER */}
      <div className="pt-24 pb-8 px-6 max-w-[1600px] mx-auto border-b border-zinc-800">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 border-2 border-zinc-800 rounded-full flex items-center justify-center relative overflow-hidden group">
                    <User size={40} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                    {profile?.role === 'admin' && <div className="absolute inset-0 border-4 border-red-500/50 rounded-full animate-pulse" />}
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">{profile?.username || 'Unknown Operator'}</h1>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs font-mono text-zinc-500">
                        <div className="flex items-center gap-1.5"><Calendar size={12} /> JOINED: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</div>
                        <div className="flex items-center gap-1.5 text-[#DFFF00]"><Coins size={12} /> BALANCE: {profile?.credits.toLocaleString()}</div>
                    </div>
                </div>
            </div>
            {/* Desktop Stats */}
            <div className="hidden md:flex flex-1 justify-end items-center gap-12">
                <div className="text-right">
                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Assets</div>
                    <div className="text-2xl font-black">{inventory.length}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Zenith Grade</div>
                    <div className="text-2xl font-black text-[#DFFF00]">{inventory.filter(i => i.item_templates.rarity === 'ZENITH').length}</div>
                </div>
            </div>
        </div>
      </div>

      {/* INVENTORY */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col gap-6 mb-8">
            <h2 className="text-xl font-black uppercase flex items-center gap-2"><Box className="text-[#DFFF00]" size={20} /> Asset Collection</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['ALL', 'ZENITH', 'COSMIC', 'ULTRA', 'SHINY', 'COMMON'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all whitespace-nowrap ${filter === f ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800'}`}>{f}</button>
                ))}
            </div>
        </div>

        {loading ? (
            <div className="py-20 text-center text-zinc-500 font-mono text-sm">LOADING ASSETS...</div>
        ) : filteredInventory.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                <p className="text-zinc-500 font-mono text-sm mb-4">NO ASSETS FOUND</p>
                <Link href="/play/market" className="px-6 py-3 bg-[#DFFF00] text-black font-black uppercase text-xs rounded hover:bg-white transition-colors">Visit Black Market</Link>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {filteredInventory.map((item) => (
                    <button key={item.id} onClick={() => setSelectedItem(item)} className={`group relative bg-zinc-900 border-2 rounded-xl p-3 md:p-4 transition-all hover:-translate-y-1 hover:shadow-xl text-left overflow-hidden ${getRarityColor(item.item_templates.rarity)}`}>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className="text-[8px] font-mono opacity-50">#{String(item.serial_number).padStart(4, '0')}</span>
                            {item.is_shiny && <Zap size={10} className="text-yellow-400 fill-current" />}
                        </div>
                        <div className="aspect-square mb-2">
                             <ItemImage name={item.item_templates.name} rarity={item.item_templates.rarity} className="w-full h-full" />
                        </div>
                        <h3 className="text-[10px] md:text-xs font-black uppercase truncate mb-1 relative z-10">{item.item_templates.name}</h3>
                        <span className="text-[8px] font-mono font-bold opacity-75">{item.item_templates.rarity}</span>
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* MOBILE OPTIMIZED MODAL */}
      {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
              <div className={`relative w-full md:max-w-lg bg-zinc-950 border-t-2 md:border-4 rounded-t-3xl md:rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[85vh] md:max-h-none ${getRarityColor(selectedItem.item_templates.rarity)}`} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-10"><X size={24} /></button>
                  {selectedItem.is_shiny && <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-blue-500/10 pointer-events-none animate-pulse" />}
                  
                  <div className="relative z-10 text-center">
                      <div className="flex items-center justify-center gap-2 mb-6">
                          <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${selectedItem.item_templates.rarity === 'ZENITH' ? 'bg-[#DFFF00] text-black' : 'bg-black/30'}`}>{selectedItem.item_templates.rarity}</span>
                          {selectedItem.is_shiny && <span className="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">PRISMATIC</span>}
                      </div>
                      <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-6">
                          <ItemImage name={selectedItem.item_templates.name} rarity={selectedItem.item_templates.rarity} className="w-full h-full" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 text-white">{selectedItem.item_templates.name}</h2>
                      <p className="text-zinc-400 font-mono text-xs md:text-sm leading-relaxed mb-6 border-b border-white/10 pb-6">"{selectedItem.item_templates.description}"</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center md:block">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1"><Hash size={12} /><span className="text-[10px] font-mono uppercase tracking-widest">Serial</span></div>
                              <div className="text-lg md:text-xl font-black text-white">#{selectedItem.serial_number}</div>
                          </div>
                          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center md:block">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1"><Globe size={12} /><span className="text-[10px] font-mono uppercase tracking-widest">Circulating</span></div>
                              <div className="text-lg md:text-xl font-black text-white">{loadingSupply ? <Loader2 size={16} className="animate-spin" /> : totalSupply?.toLocaleString()}</div>
                          </div>
                          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center md:block">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1"><BarChart3 size={12} /><span className="text-[10px] font-mono uppercase tracking-widest">Drop Rate</span></div>
                              <div className="text-lg md:text-xl font-black text-white">{getRarityStats(selectedItem.item_templates.rarity).percent}</div>
                          </div>
                          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center md:block">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1"><Calendar size={12} /><span className="text-[10px] font-mono uppercase tracking-widest">Acquired</span></div>
                              <div className="text-sm font-bold text-white mt-1">{new Date(selectedItem.obtained_at).toLocaleDateString()}</div>
                          </div>
                      </div>

                      {/* [NEW] EQUIP BUTTON FOR COSMIC ITEMS */}
                      {selectedItem.item_templates.rarity === 'COSMIC' && (
                          <button onClick={handleEquip} className="w-full mt-6 py-4 bg-[#DFFF00] hover:bg-white text-black rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(223,255,0,0.3)] animate-pulse">
                              <Gem size={16} />
                              <span>Equip Profile Flair</span>
                          </button>
                      )}

                      <button onClick={handleQuickSell} className="w-full mt-4 py-4 bg-red-950/50 hover:bg-red-900 border border-red-900 hover:border-red-500 text-red-200 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all group">
                          <RefreshCw size={16} className="group-hover:rotate-180 transition-transform" />
                          <span>Quick Sell ({QUICK_SELL_VALUES[selectedItem.item_templates.rarity] || 2} CR)</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}