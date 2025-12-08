'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import { User, Shield, Coins, Calendar, Loader2, Box, Zap, X, Globe, Hash, BarChart3, Search } from 'lucide-react';
import BackButton from '@/app/components/BackButton';
import Link from 'next/link';

// --- SMART PIXEL ICON SYSTEM (Synced with Market) ---
const PixelIcon = ({ name }: { name: string }) => {
  // A. Hand-Coded Heroes
  const heroIcons: Record<string, React.ReactNode> = {
    'The Zinc Cube': <svg viewBox="0 0 24 24" className="w-full h-full text-zinc-900" fill="currentColor"><path d="M4 4h16v16H4V4z" className="text-black"/><path d="M8 8h8v8H8V8z" className="text-[#DFFF00] animate-pulse"/><path d="M10 10h4v4h-4v-4z" className="text-white"/></svg>,
    'Solid Gold Paperclip': <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-400" fill="currentColor"><path d="M8 6h2v12H8V6zm4-2h2v16h-2V4zm4 4h2v8h-2V8z"/><path d="M8 18h8v2H8v-2zM12 2h4v2h-4V2z"/></svg>,
    'Diamond Ring': <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M8 14a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" className="text-yellow-500"/><path d="M10 8l2-4l2 4l-2 2z" className="text-blue-300 animate-pulse"/></svg>,
    'Meteorite Chunk': <svg viewBox="0 0 24 24" className="w-full h-full text-zinc-600" fill="currentColor"><path d="M4 8l4-4l8 2l4 6l-2 8l-8 2l-6-6z"/><circle cx="8" cy="10" r="1" className="text-zinc-800"/><circle cx="14" cy="14" r="2" className="text-zinc-800"/></svg>,
  };

  if (heroIcons[name]) return heroIcons[name];

  // B. Procedural Categorizer
  const lowerName = name.toLowerCase();
  let type = 'misc';
  let colorClass = 'text-zinc-500';

  if (/(battery|phone|watch|camera|drone|printer|vacuum|router|drive|card|monitor|console|game|keyboard|mouse|headphone|webcam)/.test(lowerName)) { type = 'tech'; colorClass = 'text-blue-500'; }
  else if (/(spork|fork|spoon|knife|whisk|peeler|can|opener|cup|mug|thermos|bottle|plate|tray|toaster|espresso|blender)/.test(lowerName)) { type = 'kitchen'; colorClass = 'text-orange-400'; }
  else if (/(sock|shirt|beanie|cap|sneaker|bag|coat|jacket|shoe|boot|backpack|duffel)/.test(lowerName)) { type = 'clothing'; colorClass = 'text-red-400'; }
  else if (/(plant|succulent|leaf|flower|tree|cactus|dirt|rock|marble|stone)/.test(lowerName)) { type = 'nature'; colorClass = 'text-green-500'; }
  else if (/(paper|receipt|napkin|note|ticket|tag|cardboard|box|envelope)/.test(lowerName)) { type = 'paper'; colorClass = 'text-yellow-100'; }
  else if (/(brick|block|dice|cube|lego)/.test(lowerName)) { type = 'block'; colorClass = 'text-red-700'; }
  else if (/(tool|hammer|wrench|driver|tape|ruler|measure|compass|flashlight|knife)/.test(lowerName)) { type = 'tool'; colorClass = 'text-slate-400'; }
  else if (/(lamp|light|bulb|fan|switch|outlet|cord|plug)/.test(lowerName)) { type = 'electric'; colorClass = 'text-yellow-500'; }
  
  // C. Archetype Paths
  const paths: Record<string, React.ReactNode> = {
    tech: <path d="M6 4h12v14H6z M8 18h8v2H8z M9 8h6v6H9z" />,
    kitchen: <path d="M8 2h8v12h-2v8h-4v-8h-2z" />,
    clothing: <path d="M4 6h16v4h-2v10H6V10H4z" />,
    nature: <path d="M12 2l4 6h-2v8h4v4H6v-4h4V8H8z" />,
    paper: <path d="M6 2h12v20H6z M14 2v6h4" />,
    block: <path d="M4 4h16v16H4z M8 8h2v2H8z M14 14h2v2h-2z" />,
    tool: <path d="M16 2l4 4l-4 4l-2-2l-8 8l-4 4l-2-2l4-4l8-8z" />,
    electric: <path d="M8 2h8v2h-2v4h4v6h-4v8H10v-8H6V8h4V4H8z" />,
    misc: <path d="M8 6h8v2h2v8h-2v2H8v-2H6V8h2z" />
  };

  return (
    <svg viewBox="0 0 24 24" className={`w-full h-full ${colorClass}`} fill="currentColor">
       {paths[type] || paths['misc']}
       <rect x="0" y="0" width="24" height="24" fill="white" opacity="0.1" />
    </svg>
  );
};

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Modal State
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [loadingSupply, setLoadingSupply] = useState(false);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user]);

  // Fetch Supply when item selected
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
      const { data, error } = await supabase
        .from('user_items')
        .select(`
          id,
          serial_number,
          is_shiny,
          obtained_at,
          item_templates!inner (
            id,
            name,
            rarity,
            description,
            image_url
          )
        `)
        .eq('user_id', user?.id)
        .order('obtained_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'SHINY') return item.is_shiny;
    return item.item_templates.rarity === filter;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'ZENITH': return 'text-[#DFFF00] bg-[#DFFF00]/10 border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.2)]';
        case 'ULTRA': return 'text-purple-400 bg-purple-900/20 border-purple-500';
        case 'SUPER_RARE': return 'text-orange-400 bg-orange-900/20 border-orange-500';
        case 'RARE': return 'text-blue-400 bg-blue-900/20 border-blue-500';
        case 'UNCOMMON': return 'text-green-400 bg-green-900/20 border-green-500';
        default: return 'text-zinc-400 bg-zinc-900 border-zinc-700';
    }
  };

  // Convert Rarity to Percentage Text
  const getRarityStats = (rarity: string) => {
      switch (rarity) {
          case 'ZENITH': return { percent: '0.1%', label: 'MYTHIC' };
          case 'ULTRA': return { percent: '0.9%', label: 'LEGENDARY' };
          case 'SUPER_RARE': return { percent: '4.0%', label: 'EPIC' };
          case 'RARE': return { percent: '15.0%', label: 'RARE' };
          case 'UNCOMMON': return { percent: '30.0%', label: 'UNCOMMON' };
          default: return { percent: '50.0%', label: 'COMMON' };
      }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#DFFF00]"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black relative">
      <BackButton href="/" label="MAIN TERMINAL" />

      {/* HEADER / PROFILE CARD */}
      <div className="pt-32 pb-12 px-6 max-w-[1600px] mx-auto border-b border-zinc-800">
        <div className="flex flex-col md:flex-row items-start gap-8">
            
            {/* AVATAR & IDENTITY */}
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-zinc-900 border-2 border-zinc-800 rounded-full flex items-center justify-center relative overflow-hidden group">
                    <User size={48} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                    {profile?.role === 'admin' && (
                        <div className="absolute inset-0 border-4 border-red-500/50 rounded-full animate-pulse" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-black uppercase tracking-tight">{profile?.username || 'Unknown Operator'}</h1>
                        {profile?.role === 'admin' && (
                            <span className="px-2 py-0.5 bg-red-900/30 text-red-500 border border-red-500/50 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                <Shield size={10} /> Admin
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>JOINED: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#DFFF00]">
                            <Coins size={12} />
                            <span>BALANCE: {profile?.credits.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="hidden md:flex flex-1 justify-end items-center gap-12">
                <div className="text-right">
                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Assets</div>
                    <div className="text-2xl font-black">{inventory.length}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Zenith Grade</div>
                    <div className="text-2xl font-black text-[#DFFF00]">
                        {inventory.filter(i => i.item_templates.rarity === 'ZENITH').length}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* INVENTORY SECTION */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        
        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h2 className="text-xl font-black uppercase flex items-center gap-2">
                <Box className="text-[#DFFF00]" size={20} /> Asset Collection
            </h2>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {['ALL', 'ZENITH', 'ULTRA', 'SHINY', 'COMMON'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`
                            px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all whitespace-nowrap
                            ${filter === f ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800'}
                        `}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        {/* GRID */}
        {loading ? (
            <div className="py-20 text-center text-zinc-500 font-mono text-sm">LOADING ASSETS...</div>
        ) : filteredInventory.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                <Box size={48} className="mx-auto mb-4 text-zinc-700" />
                <p className="text-zinc-500 font-mono text-sm mb-4">NO ASSETS FOUND MATCHING QUERY</p>
                <Link href="/play/market" className="px-6 py-3 bg-[#DFFF00] text-black font-black uppercase text-xs rounded hover:bg-white transition-colors">
                    Visit Black Market
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredInventory.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`
                            group relative bg-zinc-900 border-2 rounded-xl p-4 transition-all hover:-translate-y-1 hover:shadow-xl text-left
                            ${getRarityColor(item.item_templates.rarity)}
                        `}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[8px] font-mono opacity-50">#{String(item.serial_number).padStart(4, '0')}</span>
                            {item.is_shiny && <Zap size={10} className="text-yellow-400 fill-current" />}
                        </div>

                        <div className="aspect-square bg-black/20 rounded-lg mb-4 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                             <PixelIcon name={item.item_templates.name} />
                        </div>

                        <h3 className="text-xs font-black uppercase truncate mb-1">{item.item_templates.name}</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono font-bold opacity-75">{item.item_templates.rarity}</span>
                        </div>
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* --- INSPECTION MODAL --- */}
      {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
              <div 
                className={`
                    relative w-full max-w-lg bg-zinc-900 border-4 rounded-3xl p-8 shadow-2xl overflow-hidden
                    ${getRarityColor(selectedItem.item_templates.rarity)}
                `}
                onClick={e => e.stopPropagation()}
              >
                  <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-10">
                      <X size={24} />
                  </button>

                  {selectedItem.is_shiny && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-blue-500/10 pointer-events-none animate-pulse" />
                  )}

                  <div className="relative z-10 text-center">
                      <div className="flex items-center justify-center gap-2 mb-8">
                          <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${selectedItem.item_templates.rarity === 'ZENITH' ? 'bg-[#DFFF00] text-black' : 'bg-black/30'}`}>
                              {selectedItem.item_templates.rarity}
                          </span>
                          {selectedItem.is_shiny && (
                              <span className="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                                  PRISMATIC FOIL
                              </span>
                          )}
                      </div>

                      <div className="w-48 h-48 mx-auto mb-8 bg-black/20 rounded-2xl p-6 border border-white/10 shadow-inner flex items-center justify-center">
                          <div className="w-full h-full transform hover:scale-110 transition-transform duration-500">
                             <PixelIcon name={selectedItem.item_templates.name} />
                          </div>
                      </div>

                      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-white">
                          {selectedItem.item_templates.name}
                      </h2>
                      <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-8 border-b border-white/10 pb-8">
                          "{selectedItem.item_templates.description}"
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                  <Hash size={12} />
                                  <span className="text-[10px] font-mono uppercase tracking-widest">Print Issue</span>
                              </div>
                              <div className="text-xl font-black text-white">
                                  #{selectedItem.serial_number}
                              </div>
                          </div>

                          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                  <Globe size={12} />
                                  <span className="text-[10px] font-mono uppercase tracking-widest">Circulating</span>
                              </div>
                              <div className="text-xl font-black text-white">
                                  {loadingSupply ? <Loader2 size={16} className="animate-spin" /> : totalSupply?.toLocaleString()}
                              </div>
                          </div>

                          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                  <BarChart3 size={12} />
                                  <span className="text-[10px] font-mono uppercase tracking-widest">Drop Rate</span>
                              </div>
                              <div className="text-xl font-black text-white">
                                  {getRarityStats(selectedItem.item_templates.rarity).percent}
                              </div>
                          </div>

                          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                  <Calendar size={12} />
                                  <span className="text-[10px] font-mono uppercase tracking-widest">Acquired</span>
                              </div>
                              <div className="text-sm font-bold text-white mt-1">
                                  {new Date(selectedItem.obtained_at).toLocaleDateString()}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}