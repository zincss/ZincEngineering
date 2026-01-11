'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Gem, Sparkles, RefreshCcw, ExternalLink, Share2, Check, X, ThumbsUp, ThumbsDown, 
    Tent, Sword, Scroll, Map, Compass, Hammer, Ghost, Rocket, Crown, Cpu, History,
    LayoutGrid, ChevronRight, Play
} from 'lucide-react';
import Marquee from 'react-fast-marquee';
import { findGem, getGemsOfTheWeek } from './actions';
import { useSearchParams } from 'next/navigation';

const GENRE_MAP: Record<string, any> = {
    'Random': Sparkles,
    'Indie': Tent,
    'Action': Sword,
    'RPG': Scroll,
    'Strategy': Map,
    'Adventure': Compass,
    'Simulation': Hammer,
    'Horror': Ghost,
    'Sci-fi': Rocket,
    'Fantasy': Crown,
    'Cyberpunk': Cpu
};

function GemFinderContent() {
  const [gem, setGem] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [featuredGems, setFeaturedGems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Random');
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();

  // Load Gems of the Week
  useEffect(() => {
      getGemsOfTheWeek().then(setFeaturedGems);
  }, []);

  // Deeplink Handler
  useEffect(() => {
      const id = searchParams.get('id');
      if (id && !gem) {
          setLoading(true);
          findGem(undefined, id).then(result => {
              if (result) {
                  setGem(result);
                  setHistory(prev => [result, ...prev]);
              }
              setLoading(false);
          });
      }
  }, [searchParams, gem]);

  const handleFindGem = async () => {
    setLoading(true);
    setGem(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    
    try {
        const excludeIds = history.map(h => h.id);
        const result = await findGem(selectedGenre, undefined, excludeIds);
        
        if (result) {
            setGem(result);
            setHistory(prev => {
                if (prev.find(h => h.id === result.id)) return prev;
                return [result, ...prev].slice(0, 50);
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleShare = () => {
      if (!gem) return;
      const url = `${window.location.origin}/collections/gem-finder?id=${gem.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen bg-black text-white font-sans flex flex-col lg:flex-row overflow-hidden">
        
        {/* --- MOBILE HEADER --- */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 z-50">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#DFFF00] rounded flex items-center justify-center">
                    <Gem size={12} className="text-black" />
                </div>
                <span className="font-black text-sm italic tracking-tighter uppercase">Gem<span className="text-[#DFFF00]">Finder</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400 hover:text-white">
                {isSidebarOpen ? <X size={20} /> : <History size={20} />}
            </button>
        </div>

        {/* --- SIDEBAR: CONTROLS & HISTORY --- */}
        <aside className={`fixed inset-0 lg:relative lg:inset-auto w-full lg:w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col z-[60] shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="hidden lg:flex h-[180px] flex-col border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md shrink-0">
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-[#DFFF00] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(223,255,0,0.4)]">
                            <Gem size={16} className="text-black" />
                        </div>
                        <span className="font-black text-xl italic tracking-tighter">GEM<span className="text-[#DFFF00]">FINDER</span></span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-11 leading-none">
                        v2.0 // Discovery Engine
                    </div>
                </div>

                <div className="px-4 pb-6 mt-auto">
                    <button 
                        onClick={handleFindGem}
                        disabled={loading}
                        className="w-full py-5 bg-[#DFFF00] text-black rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:shadow-[0_0_40px_rgba(223,255,0,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex flex-col items-center justify-center gap-1 group/btn"
                    >
                        <div className="flex items-center gap-2">
                            {loading ? <RefreshCcw className="animate-spin" size={18} /> : <Sparkles size={18} className="group-hover/btn:rotate-12 transition-transform" />}
                            <span className="text-sm">{loading ? 'MINING...' : 'UNEARTH GEM'}</span>
                        </div>
                        {!loading && <span className="text-[8px] opacity-50 font-mono">STIMULATE_DATABASE</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Close / Header */}
            <div className="lg:hidden p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
                <span className="font-black uppercase tracking-widest text-xs text-zinc-500">Discovery Controls</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto scrollbar-hide space-y-8">
                <div>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2 flex justify-between items-center">
                        <span>Mining Parameters</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(GENRE_MAP).map(([g, Icon]) => (
                            <button 
                                key={g}
                                onClick={() => setSelectedGenre(g)}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${selectedGenre === g ? 'bg-zinc-800 border-[#DFFF00] text-[#DFFF00] shadow-[inset_0_0_10px_rgba(223,255,0,0.1)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white'}`}
                            >
                                <Icon size={16} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{g}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {history.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">
                            <History size={12} /> Recent Extractions
                        </div>
                        <div className="space-y-2 pb-12">
                            {history.map((h) => (
                                <div 
                                    key={h.id} 
                                    onClick={() => { setGem(h); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
                                    className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${gem?.id === h.id ? 'bg-[#DFFF00]/5 border-[#DFFF00]/20' : 'hover:bg-zinc-900 border-transparent hover:border-zinc-800'}`}
                                >
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black shrink-0">
                                        <img src={h.header_image} className="w-full h-full object-cover" />
                                        {gem?.id === h.id && <div className="absolute inset-0 bg-[#DFFF00]/20 animate-pulse" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-[11px] font-bold truncate ${gem?.id === h.id ? 'text-[#DFFF00]' : 'text-zinc-400 group-hover:text-white'}`}>{h.name}</div>
                                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">{h.price}</div>
                                    </div>
                                    <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${gem?.id === h.id ? 'text-[#DFFF00]' : 'text-zinc-700'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Mobile Mining Button */}
            <div className="lg:hidden p-4 bg-zinc-950 border-t border-zinc-800">
                <button onClick={handleFindGem} className="w-full py-4 bg-[#DFFF00] text-black rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_#DFFF0033]">
                    <Sparkles size={18} /> Unearth Gem
                </button>
            </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col relative bg-zinc-950 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#DFFF00]/5 blur-[150px] rounded-full pointer-events-none" />

            {/* FLUID MARQUEE FEATURED BAR (Aligned with Sidebar Action) */}
            <div className="h-[120px] lg:h-[180px] border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-xl relative z-10 overflow-hidden flex items-center shrink-0">
                <div className="absolute left-0 top-0 bottom-0 w-20 lg:w-40 bg-gradient-to-r from-zinc-950 to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 lg:w-40 bg-gradient-to-l from-zinc-950 to-transparent z-20 pointer-events-none" />
                
                <div className="hidden sm:flex items-center gap-4 lg:gap-8 pl-4 lg:pl-8 pr-6 lg:pr-12 shrink-0 z-30 bg-zinc-950/20 py-6 lg:py-10 border-r border-zinc-800 h-full">
                    <div className="flex flex-col gap-1 shrink-0">
                        <div className="flex items-center gap-2 text-[#DFFF00]">
                            <Crown size={14} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Top_Gems</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase">Weekly Selection</span>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <Marquee gradient={false} speed={50} pauseOnHover={true}>
                        {featuredGems.map((fg, i) => (
                            <button
                                key={fg.id + i}
                                onClick={() => setGem(fg)}
                                className="flex items-center gap-4 lg:gap-6 px-4 lg:px-8 group/f border-r border-zinc-800/50 hover:bg-zinc-800/20 transition-colors py-4 lg:py-10 h-full"
                            >
                                <div className="relative w-20 h-12 lg:w-28 lg:h-16 rounded-lg overflow-hidden border border-zinc-700 group-hover/f:border-[#DFFF00] transition-all duration-500 shadow-xl">
                                    <img src={fg.header_image} className="w-full h-full object-cover grayscale group-hover/f:grayscale-0 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-black/40 group-hover/f:bg-transparent transition-colors" />
                                </div>
                                <div className="flex flex-col min-w-[100px] lg:min-w-[120px] max-w-[150px] lg:max-w-[200px]">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[8px] lg:text-[9px] font-black text-green-500 uppercase tracking-widest truncate">{fg.reviews?.description || 'Positive'}</span>
                                    </div>
                                    <h3 className="text-xs lg:text-sm font-black uppercase italic leading-tight text-white group-hover/f:text-[#DFFF00] transition-colors truncate">{fg.name}</h3>
                                    <div className="flex items-center gap-2 mt-1 opacity-40 group-hover/f:opacity-100 transition-opacity">
                                        <span className="text-[7px] lg:text-[8px] font-mono text-zinc-400 uppercase">VOL_{fg.reviews?.total.toLocaleString()}</span>
                                        <span className="text-[7px] lg:text-[8px] font-bold text-[#DFFF00]">{fg.price}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </Marquee>
                </div>
            </div>

            {/* Viewport */}
            <div className="flex-1 relative overflow-y-auto scrollbar-hide p-4 lg:p-12 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center gap-8 relative"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#DFFF00] blur-2xl opacity-20 animate-pulse" />
                                <div className="w-24 h-24 lg:w-32 lg:h-32 border-2 border-zinc-800 rounded-full flex items-center justify-center relative bg-black/50 backdrop-blur-xl">
                                    <motion.div 
                                        animate={{ rotate: 360 }} 
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-t-2 border-[#DFFF00] rounded-full" 
                                    />
                                    <Gem size={32} className="text-[#DFFF00]" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl lg:text-2xl font-black uppercase italic text-white tracking-tight">Scanning Database</h3>
                                <div className="flex items-center gap-2 justify-center text-[10px] lg:text-xs font-mono text-zinc-500">
                                    <span>[SEARCHING]</span>
                                    <span className="w-12 lg:w-16 h-px bg-zinc-800 overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-[#DFFF00]" 
                                            initial={{ x: '-100%' }} 
                                            animate={{ x: '100%' }} 
                                            transition={{ duration: 1, repeat: Infinity }} 
                                        />
                                    </span>
                                    <span>{selectedGenre.toUpperCase()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : gem ? (
                        <motion.div 
                            key={gem.id}
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start"
                        >
                            <div className="lg:col-span-8 space-y-4 lg:space-y-6">
                                <div 
                                    className="relative aspect-video w-full rounded-2xl lg:rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl group cursor-pointer"
                                    onClick={() => setSelectedImage(gem.header_image)}
                                >
                                    <img src={gem.header_image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                    
                                    <div className="absolute bottom-0 left-0 p-4 lg:p-8 w-full">
                                        <motion.h1 
                                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                            className="text-2xl lg:text-6xl font-black italic uppercase text-white leading-none drop-shadow-lg mb-2 lg:mb-4"
                                        >
                                            {gem.name}
                                        </motion.h1>
                                        <div className="flex flex-wrap gap-1.5 lg:gap-2">
                                            {gem.genres?.split(', ').slice(0, 3).map((g: string) => (
                                                <span key={g} className="px-2 py-0.5 lg:px-3 lg:py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[8px] lg:text-[10px] font-bold text-white uppercase tracking-wider">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg lg:rounded-xl px-3 py-1 lg:px-4 lg:py-2 flex flex-col items-center">
                                        <span className="text-[7px] lg:text-[9px] font-mono text-zinc-400 uppercase leading-none">PRICE</span>
                                        <span className="text-xs lg:text-sm font-black text-[#DFFF00] leading-none mt-1">{gem.price}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 lg:gap-4">
                                    {gem.screenshots?.map((s: string, i: number) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, y: 20 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            transition={{ delay: 0.3 + (i * 0.1) }}
                                            onClick={() => setSelectedImage(s)}
                                            className="aspect-video rounded-lg lg:rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden cursor-pointer hover:border-[#DFFF00] transition-colors"
                                        >
                                            <img src={s} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-4 lg:space-y-6">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl lg:rounded-3xl p-4 lg:p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#DFFF00]/5 blur-3xl rounded-full" />
                                    
                                    <div className="relative z-10">
                                        <h3 className="text-[10px] lg:text-xs font-black uppercase text-zinc-500 tracking-widest mb-3 lg:mb-4">Analyst Report</h3>
                                        
                                        <div className="space-y-4 lg:space-y-6">
                                            <div>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-xl lg:text-2xl font-black text-white">{gem.reviews?.score || gem.metacritic || '?'}</span>
                                                    <span className={`text-[8px] lg:text-[10px] font-bold uppercase px-2 py-1 rounded bg-zinc-800 ${gem.reviews?.description?.includes('Positive') ? 'text-green-400' : 'text-zinc-400'}`}>
                                                        {gem.reviews?.description || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="h-1 lg:h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                                                    <div 
                                                        className="bg-[#DFFF00]" 
                                                        style={{ width: gem.reviews ? `${(gem.reviews.positive / gem.reviews.total) * 100}%` : '0%' }} 
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-1 text-[8px] lg:text-[9px] font-mono text-zinc-500">
                                                    <span>POS: {gem.reviews?.positive.toLocaleString()}</span>
                                                    <span>NEG: {gem.reviews?.negative.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="text-xs lg:text-sm text-zinc-400 leading-relaxed border-l-2 border-zinc-800 pl-4" dangerouslySetInnerHTML={{ __html: gem.description }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 lg:gap-3">
                                    <a 
                                        href={gem.storeUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full py-3 lg:py-4 bg-white text-black rounded-xl lg:rounded-2xl font-black uppercase tracking-widest hover:bg-[#DFFF00] transition-colors flex items-center justify-center gap-3 shadow-xl text-xs lg:text-base"
                                    >
                                        <Play size={16} fill="currentColor" />
                                        View on Steam
                                    </a>
                                    <button 
                                        onClick={handleShare}
                                        className="w-full py-3 lg:py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center gap-3 text-xs lg:text-base"
                                    >
                                        {copied ? <Check size={16} /> : <Share2 size={16} />}
                                        {copied ? 'Link Copied' : 'Share Discovery'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center opacity-20 hover:opacity-40 transition-opacity">
                            <LayoutGrid size={48} className="mx-auto mb-4 lg:size-64 lg:mb-6" />
                            <h2 className="text-lg lg:text-2xl font-black uppercase text-white tracking-widest">System Ready</h2>
                            <p className="font-mono text-[10px] lg:text-xs uppercase text-zinc-500 mt-2">Initiate search sequence to begin</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Lightbox Overlay */}
        <AnimatePresence>
            {selectedImage && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 cursor-pointer"
                >
                    <motion.img 
                        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                        src={selectedImage} 
                        className="max-w-full max-h-full rounded-lg shadow-2xl border border-zinc-800"
                    />
                    <button className="absolute top-6 right-6 p-3 bg-zinc-900 rounded-full text-white border border-zinc-800 hover:bg-[#DFFF00] hover:text-black transition-colors">
                        <X size={24} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}

export default function GemFinderPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-black flex items-center justify-center font-mono text-[#DFFF00]">INITIALIZING_DISCOVERY_ENGINE...</div>}>
            <GemFinderContent />
        </Suspense>
    );
}