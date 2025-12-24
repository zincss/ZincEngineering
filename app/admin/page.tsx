'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Shield, Users, Coins, Save, Lock, Search, AlertTriangle, Database, Image as ImageIcon, X, ChevronLeft, ChevronRight, DownloadCloud, Loader2, Sparkles, Brain, RefreshCw, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { REEL_ITEMS_SOURCE, CAR_PACK_SOURCE, GRIDIRON_PACK_SOURCE, RealAssetImage } from '@/app/market/components/shared';
import { getDailyWords } from '@/app/play/wordle/lib';

export default function AdminPage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'USERS' | 'ASSETS' | 'CYPHERS'>('USERS');

  // Dashboard State
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Asset Management State
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedPack, setSelectedPack] = useState<'BASE' | 'CARS' | 'GRIDIRON'>('GRIDIRON');
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Image Fetcher State
  const [fetchQuery, setFetchQuery] = useState('');
  const [fetchedImages, setFetchedImages] = useState<string[]>([]);
  const [currentFetchIndex, setCurrentFetchIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Cypher Manager State
  const [cypherOffset, setCypherOffset] = useState(0);
  const [currentCyphers, setCurrentCyphers] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/'); 
      } else {
        fetchUsers();
        fetchOverrides();
        fetchCypherConfig();
      }
    }
  }, [isAdmin, authLoading, router]);

  // Reset fetcher when opening modal
  useEffect(() => {
    if (editingItem) {
        setFetchQuery(editingItem.name);
        setFetchedImages([]);
        setCurrentFetchIndex(0);
    }
  }, [editingItem]);

  // Recalculate cyphers whenever offset changes locally (preview)
  useEffect(() => {
    const words = getDailyWords(cypherOffset);
    setCurrentCyphers(words);
  }, [cypherOffset]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false } as any);
    if (data) setAllUsers(data);
    setLoadingUsers(false);
  };

  const fetchOverrides = async () => {
      const { data } = await supabase.from('asset_overrides').select('*');
      if (data) {
          const map: Record<string, string> = {};
          data.forEach((item: any) => { map[item.name] = item.image_url });
          setOverrides(map);
      }
  };

  const fetchCypherConfig = async () => {
      // Assuming we store a 'cypher_offset' in a table (e.g., app_config or similar)
      // For now, we utilize 'asset_overrides' as a generic kv store if needed, 
      // or assume a 'game_config' table exists. 
      // Note: User requested implementation, assuming we can use 'asset_overrides' 
      // with a reserved key to avoid migration complexity for them, 
      // OR a dedicated table 'game_settings'.
      
      // Let's use 'asset_overrides' with a special key 'CYPHER_OFFSET' for simplest integration
      const { data } = await supabase.from('asset_overrides').select('*').eq('name', 'CYPHER_OFFSET').single();
      if (data && data.image_url) {
          const offset = parseInt(data.image_url);
          if (!isNaN(offset)) setCypherOffset(offset);
      }
  };

  const saveCypherOffset = async (newOffset: number) => {
      const { error } = await supabase
        .from('asset_overrides')
        .upsert({ name: 'CYPHER_OFFSET', image_url: newOffset.toString() });
      
      if (error) {
          alert("Failed to update cypher offset.");
      } else {
          setCypherOffset(newOffset);
          alert("Cyphers Updated. Players will see new words on refresh.");
      }
  };

  const handleUpdateCredits = async (userId: string, currentCredits: number, amountToAdd: number) => {
    const newTotal = currentCredits + amountToAdd;
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: newTotal } : u));
    const { error } = await supabase.from('profiles').update({ credits: newTotal }).eq('id', userId);
    if (error) { alert('Failed: ' + error.message); fetchUsers(); }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setPasswordMsg("Password must be 6+ characters."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPasswordMsg("Error: " + error.message);
    else { setPasswordMsg("Success! Password updated."); setNewPassword(''); }
  };

  const handleSaveAsset = async () => {
      if (!editingItem || !newImageUrl) return;
      
      const { error } = await supabase
        .from('asset_overrides')
        .upsert({ name: editingItem.name, image_url: newImageUrl });

      if (error) {
          alert('Error saving asset: ' + error.message);
      } else {
          setOverrides(prev => ({ ...prev, [editingItem.name]: newImageUrl }));
          setEditingItem(null);
          setNewImageUrl('');
          setFetchedImages([]);
      }
  };

  const handleFetchImages = async (overrideQuery?: string) => {
    const queryToUse = overrideQuery || fetchQuery;
    if (!queryToUse) return;
    
    setLoadingImages(true);
    setFetchedImages([]);
    
    try {
        const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(queryToUse)}&gsrlimit=20&prop=imageinfo&iiprop=url&format=json&origin=*`);
        const data = await res.json();
        
        const images: string[] = [];
        if (data.query?.pages) {
            Object.values(data.query.pages).forEach((page: any) => {
                if (page.imageinfo && page.imageinfo[0]?.url) {
                    images.push(page.imageinfo[0].url);
                }
            });
        }

        if (images.length > 0) {
            setFetchedImages(images);
            setCurrentFetchIndex(0);
            setNewImageUrl(images[0]); 
        } else {
            alert("No images found for this query.");
        }
    } catch (err) {
        console.error(err);
        alert("Failed to fetch images.");
    } finally {
        setLoadingImages(false);
    }
  };

  const cycleImage = (direction: 'next' | 'prev') => {
      if (fetchedImages.length === 0) return;
      let newIndex = direction === 'next' ? currentFetchIndex + 1 : currentFetchIndex - 1;
      
      if (newIndex >= fetchedImages.length) newIndex = 0;
      if (newIndex < 0) newIndex = fetchedImages.length - 1;

      setCurrentFetchIndex(newIndex);
      setNewImageUrl(fetchedImages[newIndex]);
  };

  const getSuggestedSearches = () => {
      if (!editingItem) return [];
      const base = editingItem.name;
      const suggestions = [base];

      if (selectedPack === 'GRIDIRON') {
          const team = editingItem.team ? editingItem.team.split('/')[0] : '';
          if (team) suggestions.push(`${base} ${team}`);
          suggestions.push(`${base} NFL`);
          suggestions.push(`${base} american football`);
      } else if (selectedPack === 'CARS') {
          if (editingItem.manufacturer) suggestions.push(`${editingItem.manufacturer} ${base}`);
          suggestions.push(`${base} car`);
      } else {
          suggestions.push(`${base} object`);
          suggestions.push(`${base} icon`);
      }
      return Array.from(new Set(suggestions));
  };

  const getSource = () => {
      if (selectedPack === 'BASE') return REEL_ITEMS_SOURCE;
      if (selectedPack === 'CARS') return CAR_PACK_SOURCE;
      return GRIDIRON_PACK_SOURCE;
  };

  const filteredAssets = getSource().filter(item => item.name.toLowerCase().includes(assetSearch.toLowerCase()));
  const filteredUsers = allUsers.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (authLoading || !isAdmin) return <div className="min-h-screen bg-black flex items-center justify-center text-[#DFFF00] font-mono animate-pulse">VERIFYING CLEARANCE...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-12 md:pt-32 pt-24">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 md:mb-12 border-b border-zinc-800 pb-8 text-center md:text-left">
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-2xl">
                <Shield size={32} className="text-red-500 md:w-12 md:h-12" />
            </div>
            <div>
                <div className="text-red-500 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Restricted Area</div>
                <h1 className="text-2xl md:text-5xl font-black uppercase">Command Console</h1>
                <p className="text-zinc-500 font-mono text-xs md:text-sm">Welcome, Admin {profile?.username}</p>
            </div>
        </div>

        {/* MOBILE NAV TABS */}
        <div className="flex overflow-x-auto gap-2 md:gap-4 mb-8 pb-2 scrollbar-hide">
            {[
                { id: 'USERS', icon: Users, label: 'Database' },
                { id: 'ASSETS', icon: Database, label: 'Assets' },
                { id: 'CYPHERS', icon: Brain, label: 'Cyphers' }
            ].map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`
                        flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-[10px] md:text-xs border transition-all whitespace-nowrap
                        ${activeTab === tab.id ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white'}
                    `}
                >
                    <tab.icon size={14} />
                    {tab.label}
                </button>
            ))}
        </div>

        {activeTab === 'USERS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* USER MANAGEMENT */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <h2 className="text-lg md:text-xl font-black uppercase flex items-center gap-2">
                            <Users className="text-[#DFFF00]" /> User Database
                        </h2>
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                            <input type="text" placeholder="SEARCH USERS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono uppercase focus:border-[#DFFF00] outline-none"
                            />
                        </div>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div className="block md:hidden space-y-3">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold">{u.username || 'Unknown'}</div>
                                    <span className={`text-[10px] px-2 py-1 rounded border ${u.role === 'admin' ? 'border-red-500 text-red-500 bg-red-950/20' : 'border-zinc-700 text-zinc-500'}`}>{u.role || 'USER'}</span>
                                </div>
                                <div className="text-xs font-mono text-[#DFFF00] mb-4">{u.credits} Credits</div>
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleUpdateCredits(u.id, u.credits, 100)} className="p-2 bg-zinc-800 hover:bg-[#DFFF00] hover:text-black rounded transition-colors"><Coins size={14} /> +100</button>
                                    <button onClick={() => handleUpdateCredits(u.id, u.credits, 1000)} className="p-2 bg-zinc-800 hover:bg-[#DFFF00] hover:text-black rounded transition-colors"><Coins size={14} /> +1k</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden md:block bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                                <tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Credits</th><th className="p-4 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-zinc-900/80 transition-colors">
                                        <td className="p-4 font-bold">{u.username || 'Unknown'}</td>
                                        <td className="p-4"><span className={`text-[10px] px-2 py-1 rounded border ${u.role === 'admin' ? 'border-red-500 text-red-500 bg-red-950/20' : 'border-zinc-700 text-zinc-500'}`}>{u.role || 'USER'}</span></td>
                                        <td className="p-4 font-mono text-[#DFFF00]">{u.credits}</td>
                                        <td className="p-4 flex justify-end gap-2">
                                            <button onClick={() => handleUpdateCredits(u.id, u.credits, 100)} className="p-2 bg-zinc-800 hover:bg-[#DFFF00] hover:text-black rounded transition-colors"><Coins size={14} /> +100</button>
                                            <button onClick={() => handleUpdateCredits(u.id, u.credits, 1000)} className="p-2 bg-zinc-800 hover:bg-[#DFFF00] hover:text-black rounded transition-colors"><Coins size={14} /> +1k</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TOOLS */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h2 className="text-lg font-black uppercase flex items-center gap-2 mb-4"><Lock className="text-red-500" size={18} /> Admin Security</h2>
                        <div className="space-y-3">
                            <input type="password" placeholder="NEW PASSWORD" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 rounded text-sm font-mono focus:border-red-500 outline-none" />
                            <button onClick={handleChangePassword} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase py-3 rounded text-xs tracking-widest transition-colors">Update Password</button>
                            {passwordMsg && <div className="text-[10px] font-mono text-[#DFFF00] text-center pt-2">{passwordMsg}</div>}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'CYPHERS' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <Brain className="w-16 h-16 text-[#DFFF00] mx-auto mb-4" />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Cypher Control</h2>
                    <p className="text-zinc-500">Manipulate the daily protocol seed.</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
                    <div className="flex flex-col gap-8">
                        {/* CURRENT STATUS */}
                        <div>
                            <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-4">Current Protocol</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['word4', 'word5', 'word6'].map((key) => (
                                    <div key={key} className="bg-black border border-zinc-800 p-4 rounded-xl text-center">
                                        <div className="text-[10px] text-zinc-600 font-bold uppercase mb-1">{key.replace('word', 'Level ')}</div>
                                        <div className="text-xl md:text-2xl font-black text-[#DFFF00] tracking-widest">
                                            {currentCyphers?.[key] || '....'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CONTROLS */}
                        <div className="border-t border-zinc-800 pt-8">
                            <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-4">Override Controls</div>
                            
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                                    <span className="font-mono text-sm">Current Offset</span>
                                    <span className="font-black text-xl text-white">{cypherOffset}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => saveCypherOffset(cypherOffset + 1)}
                                        className="bg-[#DFFF00] text-black font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ccee00] transition-colors"
                                    >
                                        <RefreshCw size={18} /> Regenerate
                                    </button>
                                    <button 
                                        onClick={() => saveCypherOffset(0)}
                                        className="bg-zinc-800 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
                                    >
                                        <RotateCcw size={18} /> Reset Default
                                    </button>
                                </div>
                                <p className="text-[10px] text-zinc-500 text-center mt-2">
                                    Clicking Regenerate increments the daily seed offset, instantly changing words for all users upon their next refresh.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'ASSETS' && (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {['BASE', 'CARS', 'GRIDIRON'].map(pack => (
                            <button key={pack} onClick={() => setSelectedPack(pack as any)} className={`px-4 py-2 rounded font-bold uppercase text-[10px] md:text-xs border ${selectedPack === pack ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
                                {pack}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                        <input type="text" placeholder="SEARCH ASSETS..." value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)}
                            className="w-full md:w-[300px] bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono uppercase focus:border-[#DFFF00] outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {filteredAssets.map((item, i) => (
                        <div key={i} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-[#DFFF00] transition-colors"
                             onClick={() => { setEditingItem(item); setNewImageUrl(overrides[item.name] || ''); }}>
                            <div className="aspect-[2/3] w-full relative">
                                <RealAssetImage name={item.name} searchQuery={item.searchQuery || item.name} className="w-full h-full object-cover" forcedUrl={overrides[item.name]} />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <div className="bg-[#DFFF00] text-black text-xs font-bold px-3 py-1 rounded">EDIT</div>
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="text-[10px] text-zinc-500 font-mono mb-1 uppercase truncate">{item.rarity}</div>
                                <div className="text-xs font-bold truncate">{item.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* EDIT MODAL */}
        {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 relative flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
                    <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10"><X size={20} /></button>
                    
                    {/* LEFT: PREVIEW */}
                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden border border-zinc-700 relative bg-black shrink-0">
                             {newImageUrl ? (
                                <img src={newImageUrl} className="w-full h-full object-cover" onError={() => setNewImageUrl('')} />
                             ) : (
                                <div className="flex items-center justify-center h-full text-zinc-600 text-[10px] uppercase">No Image Preview</div>
                             )}
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold">{editingItem.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono uppercase">{editingItem.rarity}</div>
                        </div>
                    </div>

                    {/* RIGHT: CONTROLS */}
                    <div className="w-full md:w-2/3 space-y-6">
                        <div>
                            <h3 className="text-xl font-black uppercase mb-1 flex items-center gap-2">
                                <Database className="text-[#DFFF00]" /> Edit Asset
                            </h3>
                            <p className="text-xs text-zinc-500">Update the visual representation of this asset.</p>
                        </div>

                        {/* AUTO FETCH SECTION */}
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                                    <DownloadCloud size={10} /> Auto-Fetch Images
                                </label>
                                {fetchedImages.length > 0 && (
                                    <span className="text-[10px] text-[#DFFF00] font-mono">
                                        {currentFetchIndex + 1}/{fetchedImages.length} Found
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    value={fetchQuery} 
                                    onChange={(e) => setFetchQuery(e.target.value)}
                                    className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-xs focus:border-[#DFFF00] outline-none"
                                />
                                <button 
                                    onClick={() => handleFetchImages()} 
                                    disabled={loadingImages}
                                    className="px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded border border-zinc-700"
                                >
                                    {loadingImages ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                </button>
                            </div>

                            {/* SUGGESTIONS */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {getSuggestedSearches().map((query, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => { setFetchQuery(query); handleFetchImages(query); }}
                                        className="text-[10px] px-2 py-1 bg-zinc-900 hover:bg-[#DFFF00] hover:text-black border border-zinc-800 rounded transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            <Sparkles size={8} /> {query}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {fetchedImages.length > 0 && (
                                <div className="flex items-center justify-between bg-zinc-900 rounded p-2 border border-zinc-800">
                                    <button onClick={() => cycleImage('prev')} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"><ChevronLeft size={16} /></button>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Cycle Results</span>
                                    <button onClick={() => cycleImage('next')} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"><ChevronRight size={16} /></button>
                                </div>
                            )}
                        </div>

                        {/* MANUAL OVERRIDE */}
                        <div>
                            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Image URL (Manual)</label>
                            <input 
                                type="text" 
                                value={newImageUrl} 
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded text-xs font-mono focus:border-[#DFFF00] outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                            <button onClick={() => setEditingItem(null)} className="px-6 py-3 rounded font-bold uppercase text-xs border border-zinc-700 text-zinc-400 hover:bg-zinc-800">Cancel</button>
                            <button onClick={handleSaveAsset} className="px-6 py-3 rounded font-bold uppercase text-xs bg-[#DFFF00] text-black hover:bg-[#ccee00]">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}