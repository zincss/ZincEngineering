'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Cpu, ExternalLink, Loader2, AlertCircle, ChevronRight, ShoppingCart } from 'lucide-react';

const getModDescription = (item: any) => {
  if (item.levelStats && item.levelStats.length > 0) {
    const maxRank = item.levelStats[item.levelStats.length - 1];
    if (maxRank.stats && maxRank.stats.length > 0) {
      return maxRank.stats;
    }
  }
  if (item.description && item.description.length > 0) {
    return [item.description];
  }
  return ["No effect data available in archives."];
};

export default function ModulesPage() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://api.warframestat.us/items/search/${query.toLowerCase()}`);
        const data = await res.json();
        const matches = data
          .filter((d: any) => d.category === 'Mods' && !d.name.includes(' Riven Mod'))
          .slice(0, 5);
        setSuggestions(matches);
        setShowSuggestions(true);
      } catch (e) {
        console.error(e);
      }
    };
    const timer = setTimeout(() => {
      if (!result || query !== result.name) fetchSuggestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [query, result]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    setResult(null);
    setError(false);
    setShowSuggestions(false);
    setQuery(searchTerm);

    try {
      const res = await fetch(`https://api.warframestat.us/items/search/${searchTerm.toLowerCase()}`);
      const data = await res.json();
      const match = data.find((d: any) => d.category === 'Mods' && d.name.toLowerCase() === searchTerm.toLowerCase()) 
                   || data.find((d: any) => d.category === 'Mods' && d.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (match) setResult(match);
      else setError(true);
    } catch (err) {
      setError(true);
    }
    setLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) performSearch(query);
  };

  return (
    <div className="min-h-[70vh] max-w-4xl mx-auto pb-20 pt-12">
      
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 text-acid bg-black px-3 py-1 font-mono text-xs font-bold mb-4">
           <Cpu size={14} /> NEURAL LINK REGISTRY
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">MODULES</h1>
        <p className="text-zinc-500 text-lg">Locate acquisition data for system enhancements.</p>
      </div>

      <div className="relative mb-12" ref={dropdownRef}>
        <form onSubmit={handleFormSubmit} className="relative z-20">
           <input 
             type="text" 
             placeholder="ENTER MOD NAME (E.G. 'BLIND RAGE')..." 
             className="w-full text-2xl font-black uppercase border-b-4 border-black dark:border-zinc-600 py-4 px-2 focus:outline-none focus:border-acid bg-transparent placeholder:text-zinc-300 text-black dark:text-white"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
             autoComplete="off"
           />
           <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white hover:bg-acid hover:text-black px-6 py-2 font-bold uppercase text-sm transition-colors">
             {loading ? <Loader2 className="animate-spin" /> : 'SCAN'}
           </button>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] z-30">
             {suggestions.map((suggestion) => (
               <div 
                 key={suggestion.uniqueName}
                 onClick={() => performSearch(suggestion.name)}
                 className="px-4 py-3 hover:bg-acid dark:hover:bg-acid cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0 flex justify-between items-center group transition-colors"
               >
                 <span className="font-bold font-mono uppercase text-black dark:text-zinc-300 group-hover:text-black">{suggestion.name}</span>
                 <ChevronRight size={16} className="text-black opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200"/>
               </div>
             ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-8 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold font-mono flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
           <AlertCircle size={24} />
           <span>ERROR: MODULE_NOT_FOUND</span>
        </div>
      )}

      {result && (
        <div className="border-2 border-black dark:border-zinc-600 bg-white dark:bg-zinc-900 p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] animate-in fade-in slide-in-from-bottom-4">
           
           <div className="flex justify-between items-start mb-8 border-b-2 border-black dark:border-zinc-700 pb-4">
              <div>
                 <h2 className="text-4xl font-black uppercase mb-2 text-black dark:text-white">{result.name}</h2>
                 <div className="flex gap-2 text-xs font-mono font-bold text-black">
                    <span className="bg-zinc-200 dark:bg-zinc-700 dark:text-white px-2 py-1">{result.polarity ? result.polarity.toUpperCase() : 'UNIVERSAL'}</span>
                    <span className="bg-zinc-200 dark:bg-zinc-700 dark:text-white px-2 py-1">COST: {result.baseDrain} - {result.baseDrain + (result.fusionLimit || 5)}</span>
                    <span className="bg-zinc-200 dark:bg-zinc-700 dark:text-white px-2 py-1">RARITY: {result.rarity ? result.rarity.toUpperCase() : 'COMMON'}</span>
                 </div>
              </div>
              {result.imageName && (
                 <img src={`https://cdn.warframestat.us/img/${result.imageName}`} className="h-24 w-24 object-contain" alt={result.name} />
              )}
           </div>

           <div className="grid md:grid-cols-2 gap-8">
              <div>
                 <div className="flex items-center gap-2 text-black dark:text-white font-bold mb-4">
                    <MapPin size={18} /> ACQUISITION SOURCES
                 </div>
                 <div className="space-y-3 font-mono text-sm h-64 overflow-y-auto custom-scrollbar pr-2 text-zinc-800 dark:text-zinc-300">
                    {result.drops && result.drops.length > 0 ? (
                       result.drops.slice(0, 10).map((drop: any, i: number) => (
                          <div key={i} className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1">
                             <span className="font-bold text-xs leading-tight">{drop.location}</span>
                             <span className="text-zinc-500 text-[10px] min-w-[40px] text-right">{drop.chance ? `${(drop.chance * 100).toFixed(2)}%` : ''}</span>
                          </div>
                       ))
                    ) : (
                       <div className="text-zinc-500 italic">No drop data found. Likely Baro Ki'Teer or Quest Reward. Check Wiki.</div>
                    )}
                 </div>
              </div>

              <div className="flex flex-col h-full">
                 <div className="bg-zinc-50 dark:bg-zinc-800 p-6 border border-zinc-200 dark:border-zinc-700 flex-1 mb-4">
                    <span className="block text-xs font-bold text-zinc-400 mb-3 tracking-widest">MODULE EFFECTS (MAX RANK)</span>
                    <div className="space-y-2">
                      {getModDescription(result).map((line: string, i: number) => (
                        <p key={i} className="font-bold text-lg leading-tight text-black dark:text-white">
                          {line}
                        </p>
                      ))}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={`https://warframe.market/items/${result.name.toLowerCase().replace(/ /g, '_')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white py-4 font-black hover:bg-acid dark:hover:bg-acid hover:text-black dark:hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all text-xs tracking-widest uppercase group"
                    >
                      <ShoppingCart size={14} className="group-hover:fill-black" /> TRADE SIGNAL
                    </a>

                    <a 
                      href={`https://warframe.fandom.com/wiki/${result.name.replace(/ /g, '_')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 font-bold hover:bg-zinc-800 transition-colors text-xs tracking-widest uppercase"
                    >
                       VIEW ON WIKI <ExternalLink size={14} />
                    </a>
                 </div>
              </div>
           </div>

        </div>
      )}

    </div>
  );
}