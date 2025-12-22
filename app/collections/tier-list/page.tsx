'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  GripVertical, 
  Search,
  X,
  Download,
  Database,
  LayoutList,
  LayoutGrid,
  Image as ImageIcon,
  Copy,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// --- TYPES ---
type TierLabel = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
type TierItem = {
  id: string;
  name: string;
  image?: string; 
  category?: 'general' | 'gaming' | 'auto';
};

type TierData = {
  [key in TierLabel]: TierItem[];
};

// --- INITIAL STATE ---
const INITIAL_TIERS: TierData = {
  S: [],
  A: [],
  B: [],
  C: [],
  D: [],
  F: [],
};

const TIER_COLORS: Record<TierLabel, string> = {
  S: 'bg-red-500/20 border-red-500/50 text-red-200',
  A: 'bg-orange-500/20 border-orange-500/50 text-orange-200',
  B: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
  C: 'bg-green-500/20 border-green-500/50 text-green-200',
  D: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  F: 'bg-zinc-800/50 border-zinc-700 text-zinc-400',
};

export default function TierListCreator() {
  // State
  const [listTitle, setListTitle] = useState('Untitled Protocol');
  const [tiers, setTiers] = useState<TierData>(INITIAL_TIERS);
  const [pool, setPool] = useState<TierItem[]>([]);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  
  // Search / Provisioning State
  const [newItemName, setNewItemName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // "Re-Roll" Logic State
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [resultIndex, setResultIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<'IDLE' | 'FOUND' | 'NO_RESULTS' | 'NO_IMAGE'>('IDLE');

  // Selection
  const [selectedItem, setSelectedItem] = useState<{ id: string, origin: TierLabel | 'POOL' } | null>(null);
  const [copied, setCopied] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem('zinc_tier_data_v2');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTiers(parsed.tiers || INITIAL_TIERS);
        setPool(parsed.pool || []);
        setListTitle(parsed.listTitle || 'Untitled Protocol');
      } catch (e) {
        console.error("Failed to load tier data", e);
      }
    }
  }, []);

  // Save to LocalStorage
  const saveData = () => {
    localStorage.setItem('zinc_tier_data_v2', JSON.stringify({ tiers, pool, listTitle }));
    const btn = document.getElementById('save-btn');
    if (btn) {
       btn.style.borderColor = '#DFFF00';
       setTimeout(() => btn.style.borderColor = '', 500);
    }
  };

  // --- ARCHIVE ENGINE (Wikipedia) ---

  const fetchWikiImage = async (query: string, index: number): Promise<{url: string | null, title: string | null}> => {
    try {
        let titles = searchResults;

        // Step A: Search for titles if needed
        if (index === 0 || searchResults.length === 0) {
            const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=10&namespace=0&format=json&origin=*`);
            const searchJson = await searchRes.json();
            titles = searchJson[1] as string[];
            setSearchResults(titles);
        }

        if (titles.length === 0 || index >= titles.length) {
            return { url: null, title: null };
        }

        const targetTitle = titles[index];
        
        // Step B: Try Standard PageImage (Fast)
        let imageUrl = await getWikiPageImage(targetTitle);

        // Step C: Fallback to Page Files (Slow but finds Cover Arts)
        if (!imageUrl) {
             imageUrl = await getWikiDeepScanImage(targetTitle);
        }

        return { url: imageUrl, title: targetTitle };

    } catch (e) {
        console.error("Wiki Fetch Error", e);
        return { url: null, title: null };
    }
  };

  const getWikiPageImage = async (title: string): Promise<string | null> => {
      try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600&origin=*`);
        const json = await res.json();
        const pages = json.query.pages;
        const pageId = Object.keys(pages)[0];
        return pages[pageId]?.thumbnail?.source || null;
      } catch { return null; }
  };

  const getWikiDeepScanImage = async (title: string): Promise<string | null> => {
      try {
          // 1. Get list of images on page
          const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&format=json&imlimit=10&origin=*`);
          const json = await res.json();
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          const images = pages[pageId]?.images; // Array of { ns: 6, title: "File:..." }

          if (!images || images.length === 0) return null;

          // 2. Filter for potential valid images (skip svg icons, etc)
          const validImage = images.find((img: any) => {
              const t = img.title.toLowerCase();
              return (t.endsWith('.jpg') || t.endsWith('.png') || t.endsWith('.jpeg')) && 
                     !t.includes('icon') && !t.includes('logo') && !t.includes('stub');
          });

          if (!validImage) return null;

          // 3. Fetch URL for that specific file
          const fileRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(validImage.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`);
          const fileJson = await fileRes.json();
          const filePages = fileJson.query.pages;
          const filePageId = Object.keys(filePages)[0];
          return filePages[filePageId]?.imageinfo?.[0]?.url || null;

      } catch (e) {
          console.error("Deep scan failed", e);
          return null;
      }
  };

  // --- HANDLERS ---

  const handleSearch = async () => {
      if (!newItemName.trim()) return;
      setIsSearching(true);
      setSearchStatus('IDLE');
      setPreviewImage(null);
      setResultIndex(0);

      const { url, title } = await fetchWikiImage(newItemName, 0);
      if (title) {
          setPreviewImage(url); 
          setSearchStatus(url ? 'FOUND' : 'NO_IMAGE');
      } else {
          setSearchStatus('NO_RESULTS');
      }
      setIsSearching(false);
  };

  const handleReRoll = async () => {
      setIsSearching(true);
      const nextIndex = resultIndex + 1;
      const { url, title } = await fetchWikiImage(newItemName, nextIndex);
      
      if (title) {
          setResultIndex(nextIndex);
          setPreviewImage(url);
          setSearchStatus(url ? 'FOUND' : 'NO_IMAGE');
      } else {
          // Loop back to start
          const retry = await fetchWikiImage(newItemName, 0);
          setResultIndex(0);
          setPreviewImage(retry.url);
          setSearchStatus(retry.url ? 'FOUND' : 'NO_IMAGE');
      }
      setIsSearching(false);
  };

  const commitAsset = () => {
    if (!newItemName.trim() && searchResults.length === 0) return;
    
    // Use the Wiki Title if available, otherwise User Input
    const finalName = (searchResults[resultIndex]) 
        ? searchResults[resultIndex] 
        : newItemName;

    const newItem: TierItem = {
      id: Date.now().toString() + Math.random().toString(),
      name: finalName,
      category: 'general',
      image: previewImage || undefined
    };

    setPool(prev => [...prev, newItem]);
    
    // Reset visual state but keep textual input for rapid-fire
    setPreviewImage(null);
    setSearchStatus('IDLE');
  };

  // --- UTILS ---

  const deleteItem = (id: string, origin: TierLabel | 'POOL') => {
    if (origin === 'POOL') {
      setPool(prev => prev.filter(i => i.id !== id));
    } else {
      setTiers(prev => ({
        ...prev,
        [origin]: prev[origin].filter(i => i.id !== id)
      }));
    }
    setSelectedItem(null);
  };

  const clearBoard = () => {
    if (confirm('Declassify all assets? This cannot be undone.')) {
      setTiers(INITIAL_TIERS);
      setPool([]);
      localStorage.removeItem('zinc_tier_data_v2');
    }
  };

  const copyListToClipboard = () => {
    const lines = [`/// ${listTitle.toUpperCase()} ///`];
    (Object.keys(tiers) as TierLabel[]).forEach((tier) => {
        if (tiers[tier].length > 0) {
            lines.push(`\n[${tier}]`);
            tiers[tier].forEach(item => lines.push(`- ${item.name}`));
        }
    });
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- DRAG & DROP LOGIC ---

  const handleDragStart = (e: React.DragEvent, id: string, origin: TierLabel | 'POOL') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, origin }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTier: TierLabel | 'POOL') => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    
    const { id, origin } = JSON.parse(data);
    if (origin === targetTier) return; 

    moveItem(id, origin, targetTier);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const moveItem = (id: string, origin: TierLabel | 'POOL', target: TierLabel | 'POOL') => {
    let itemToMove: TierItem | undefined;

    if (origin === 'POOL') {
      itemToMove = pool.find(i => i.id === id);
      if (!itemToMove) return;
      setPool(prev => prev.filter(i => i.id !== id));
    } else {
      itemToMove = tiers[origin].find(i => i.id === id);
      if (!itemToMove) return;
      setTiers(prev => ({
        ...prev,
        [origin]: prev[origin].filter(i => i.id !== id)
      }));
    }

    if (target === 'POOL') {
      setPool(prev => [...prev, itemToMove!]);
    } else {
      setTiers(prev => ({
        ...prev,
        [target]: [...prev[target], itemToMove!]
      }));
    }
    
    setSelectedItem(null);
  };

  // --- RENDER HELPERS ---

  const renderItemCard = (item: TierItem, origin: TierLabel | 'POOL', index?: number) => {
    const isSelected = selectedItem?.id === item.id;
    
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => handleDragStart(e, item.id, origin)}
        onClick={(e) => {
            e.stopPropagation(); 
            if (isSelected) setSelectedItem(null);
            else setSelectedItem({ id: item.id, origin });
        }}
        className={`
          relative group flex items-center gap-3 px-3 py-2 
          bg-zinc-900 border ${isSelected ? 'border-[#DFFF00]' : 'border-zinc-800 hover:border-zinc-600'} 
          rounded-md cursor-grab active:cursor-grabbing transition-all select-none overflow-hidden
          ${isSelected ? 'shadow-[0_0_15px_rgba(223,255,0,0.15)] scale-[1.02]' : ''}
          ${viewMode === 'LIST' ? 'w-full mb-2' : ''}
        `}
      >
        {/* Background Image if available */}
        {item.image && (
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-20 transition-opacity">
                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent" />
            </div>
        )}

        <div className="relative z-10 flex items-center gap-3 w-full">
            {/* Index for List View */}
            {viewMode === 'LIST' && index !== undefined && (
                <span className="font-mono text-[#DFFF00] font-bold text-lg w-8 text-right">
                    {index + 1}.
                </span>
            )}
            
            <GripVertical size={12} className="text-zinc-600 shrink-0" />
            
            <div className="flex flex-col">
                <span className="text-xs md:text-sm font-medium text-zinc-200 truncate max-w-[120px] md:max-w-xs drop-shadow-md">
                {item.name}
                </span>
                {viewMode === 'LIST' && (
                    <span className={`text-[10px] font-mono ${origin === 'POOL' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Tier: <span className="text-[#DFFF00]">{origin}</span>
                    </span>
                )}
            </div>
        </div>
        
        {/* Quick Delete */}
        <button 
          onClick={(e) => { e.stopPropagation(); deleteItem(item.id, origin); }}
          className="relative z-20 ml-auto p-2 md:p-1 text-zinc-500 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-[#DFFF00] selection:text-black">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0" />

      {/* HEADER */}
      <div className="relative z-10 pt-24 pb-6 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6 border-b border-zinc-800/50">
        
        {/* TOP ROW: Title & Main Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 bg-[#DFFF00] rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-[#DFFF00] tracking-widest uppercase">Classification Protocol</span>
                </div>
                
                {/* Editable Title */}
                <input 
                    type="text"
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-3xl md:text-5xl font-black uppercase tracking-tight italic text-white placeholder-zinc-700 focus:outline-none focus:ring-0"
                    placeholder="ENTER PROJECT NAME..."
                />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <div className="flex bg-zinc-900 rounded-full border border-zinc-800 p-1 mr-2 shrink-0">
                    <button 
                        onClick={() => setViewMode('GRID')}
                        className={`p-2 rounded-full transition-all ${viewMode === 'GRID' ? 'bg-zinc-800 text-[#DFFF00]' : 'text-zinc-500 hover:text-white'}`}
                        title="Tier Grid View"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('LIST')}
                        className={`p-2 rounded-full transition-all ${viewMode === 'LIST' ? 'bg-zinc-800 text-[#DFFF00]' : 'text-zinc-500 hover:text-white'}`}
                        title="Ranked List View"
                    >
                        <LayoutList size={16} />
                    </button>
                </div>

                <button id="save-btn" onClick={saveData} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-[#DFFF00] rounded-full transition-all text-xs font-bold uppercase tracking-wider shrink-0">
                    <Save size={14} /> <span className="hidden md:inline">Save</span>
                </button>
                <button onClick={clearBoard} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-red-500 hover:text-red-500 rounded-full transition-colors text-xs font-bold uppercase tracking-wider shrink-0">
                    <RotateCcw size={14} /> <span className="hidden md:inline">Reset</span>
                </button>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* --- RIGHT: THE DOCK (ORDER FIRST ON MOBILE) --- */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-fit lg:sticky lg:top-8 order-1 lg:order-2">
          
          {/* SMART PROVISIONING PANEL */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl overflow-hidden relative">
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Database size={12} /> Smart Provisioning
             </h3>

             {/* Search Input */}
             <div className="relative mb-4">
                 <input 
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search global archive..."
                    className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl pl-4 pr-10 py-3 text-base md:text-sm focus:outline-none focus:border-[#DFFF00] transition-colors"
                 />
                 <button 
                   onClick={handleSearch}
                   disabled={isSearching}
                   className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#DFFF00]"
                 >
                    {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                 </button>
             </div>

             {/* PREVIEW AREA / SEARCH RESULTS */}
             {(searchStatus !== 'IDLE' && searchStatus !== 'NO_RESULTS') ? (
                 <div className="mb-4 animate-in fade-in zoom-in-95 duration-300">
                     <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-zinc-700 bg-black group">
                         
                         {previewImage ? (
                             <Image 
                                src={previewImage} 
                                alt="Preview" 
                                fill 
                                className="object-cover" 
                                unoptimized 
                             />
                         ) : (
                             // NO IMAGE FALLBACK STATE
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 p-4 text-center">
                                 <AlertCircle size={32} className="mb-2 text-zinc-700" />
                                 <span className="text-xs font-bold text-zinc-400">No Signal</span>
                                 <span className="text-[10px] text-zinc-600 mt-1">Image data redacted or unavailable for this file.</span>
                             </div>
                         )}
                         
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                         
                         {/* Controls Overlay */}
                         <div className="absolute bottom-0 left-0 w-full p-3 flex gap-2">
                             <button 
                               onClick={commitAsset}
                               className="flex-1 bg-[#DFFF00] hover:bg-white text-black font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                             >
                                 <Plus size={14} /> Add {previewImage ? '' : 'Text Only'}
                             </button>
                             <button 
                               onClick={handleReRoll}
                               className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg border border-zinc-600 transition-colors"
                               title="Next Result"
                             >
                                 <RefreshCw size={14} className={isSearching ? "animate-spin" : ""} />
                             </button>
                         </div>
                         
                         {/* Source Badge */}
                         <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 max-w-[80%]">
                            <span className="text-[10px] font-mono text-zinc-300 uppercase truncate block">
                                {searchResults.length > 0 ? (
                                    searchResults[resultIndex] || `Res ${resultIndex + 1}`
                                ) : 'Archive'}
                            </span>
                         </div>
                     </div>
                 </div>
             ) : (
                 // IDLE / EMPTY STATE
                 <div className="mb-4 aspect-video w-full rounded-xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 gap-2 bg-zinc-900/30">
                     {isSearching ? (
                         <>
                            <RefreshCw size={24} className="animate-spin text-[#DFFF00]" />
                            <span className="text-xs font-mono animate-pulse">Scanning Archive...</span>
                         </>
                     ) : (
                         <>
                            {searchStatus === 'NO_RESULTS' ? (
                                <>
                                    <X size={24} className="text-red-500/50" />
                                    <span className="text-xs font-mono text-zinc-500">No Data Found</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={24} />
                                    <span className="text-xs font-mono">
                                        Awaiting Query
                                    </span>
                                </>
                            )}
                         </>
                     )}
                 </div>
             )}

          </div>

          {/* UNRANKED POOL */}
          <div 
            onDrop={(e) => handleDrop(e, 'POOL')}
            onDragOver={handleDragOver}
            onClick={() => selectedItem && moveItem(selectedItem.id, selectedItem.origin, 'POOL')}
            className={`
               bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 min-h-[160px] flex flex-col
               ${selectedItem && selectedItem.origin !== 'POOL' ? 'ring-2 ring-zinc-600 cursor-pointer' : ''}
            `}
          >
             <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Unclassified</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{pool.length}</span>
             </div>

             <div className="flex-1 flex flex-col gap-2">
                {pool.length === 0 ? (
                  <div className="w-full flex flex-col items-center justify-center text-zinc-600 gap-2 mt-4">
                    <Download size={24} className="opacity-20" />
                    <span className="text-xs">Awaiting Input...</span>
                  </div>
                ) : (
                  pool.map(item => renderItemCard(item, 'POOL'))
                )}
             </div>
          </div>
          
          {selectedItem && (
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in">
                <span className="text-xs text-red-200 truncate max-w-[150px]">
                    Selected: <span className="font-bold">{selectedItem.origin === 'POOL' ? pool.find(i=>i.id===selectedItem.id)?.name : tiers[selectedItem.origin as TierLabel].find(i=>i.id===selectedItem.id)?.name}</span>
                </span>
                <button 
                  onClick={() => deleteItem(selectedItem.id, selectedItem.origin)}
                  className="text-red-400 hover:text-red-100 p-2"
                >
                  <Trash2 size={16} />
                </button>
             </div>
          )}

        </div>

        {/* --- LEFT: BOARD OR LIST (ORDER SECOND ON MOBILE) --- */}
        <div className="lg:col-span-3 order-2 lg:order-1">
           
           {/* VIEW MODE: GRID (TIERS) */}
           {viewMode === 'GRID' && (
             <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
                {(Object.keys(INITIAL_TIERS) as TierLabel[]).map((tier) => (
                    <div 
                        key={tier}
                        onDrop={(e) => handleDrop(e, tier)}
                        onDragOver={handleDragOver}
                        onClick={() => selectedItem && moveItem(selectedItem.id, selectedItem.origin, tier)}
                        className={`
                        flex min-h-[100px] rounded-lg overflow-hidden border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm transition-all
                        ${selectedItem && selectedItem.origin !== tier ? 'ring-2 ring-[#DFFF00]/30 hover:ring-[#DFFF00] cursor-pointer' : ''}
                        `}
                    >
                        {/* TIER LABEL */}
                        <div className={`w-16 md:w-24 flex items-center justify-center flex-shrink-0 ${TIER_COLORS[tier]}`}>
                            <span className="text-3xl md:text-4xl font-black italic">{tier}</span>
                        </div>

                        {/* TIER CONTENT */}
                        <div className="flex-1 p-3 flex flex-wrap content-center gap-3">
                            {tiers[tier].map(item => renderItemCard(item, tier))}
                            {tiers[tier].length === 0 && (
                                <div className="w-full h-full flex items-center justify-center opacity-10 pointer-events-none">
                                    <span className="text-[10px] uppercase tracking-[0.2em]">Empty Sector</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
             </div>
           )}

           {/* VIEW MODE: LIST (RANKED) */}
           {viewMode === 'LIST' && (
               <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 min-h-[60vh] animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                      <h2 className="text-xl md:text-2xl font-black uppercase italic text-zinc-100">{listTitle} <span className="text-zinc-600 text-base md:text-lg">// GLOBAL RANKING</span></h2>
                      <button 
                        onClick={copyListToClipboard}
                        className="flex items-center gap-2 text-xs font-mono text-[#DFFF00] hover:underline shrink-0"
                      >
                         {copied ? <Check size={14} /> : <Copy size={14} />}
                         {copied ? 'COPIED' : 'COPY TEXT'}
                      </button>
                  </div>
                  
                  <div className="space-y-1">
                     {(['S', 'A', 'B', 'C', 'D', 'F'] as TierLabel[]).reduce((acc: any[], tier) => {
                         // Collect all items in order S -> F
                         return [...acc, ...tiers[tier].map(i => ({...i, _origin: tier}))];
                     }, []).map((item, index) => (
                         renderItemCard(item, item._origin, index)
                     ))}

                     {/* EMPTY STATE */}
                     {Object.values(tiers).every(t => t.length === 0) && (
                         <div className="text-center py-20 text-zinc-600 font-mono">
                             NO DATA DEPLOYED TO TIERS
                         </div>
                     )}
                  </div>
               </div>
           )}
        </div>

      </div>
    </main>
  );
}