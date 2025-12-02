'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, User, ChevronRight, Terminal, Activity } from 'lucide-react';
import { searchF1Drivers } from '../actions';

// --- LOADER COMPONENT (Visual Feedback) ---
const NavigationLoader = () => (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-[#DFFF00] blur-2xl opacity-20 animate-pulse"></div>
           <div className="w-16 h-16 border-2 border-zinc-800 border-t-[#DFFF00] rounded-full animate-spin relative z-10"></div>
           <div className="absolute inset-0 flex items-center justify-center z-10">
               <Activity size={24} className="text-[#DFFF00]" />
           </div>
        </div>
        <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-sm font-black tracking-[0.2em] uppercase">
                <Terminal size={14} />
                <span>ESTABLISHING UPLINK</span>
            </div>
            <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-widest animate-pulse">
                SYNCING DRIVER DATABASE...
            </span>
        </div>
    </div>
);

export default function F1Search() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // New state for full-screen loader
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
        setResults([]);
        return;
    }
    setLoading(true);
    searchF1Drivers(debouncedQuery).then((data) => {
        setResults(data);
        setLoading(false);
    });
  }, [debouncedQuery]);

  // Handle click to show loader immediately
  const handleSelect = (url: string) => {
      setIsNavigating(true);
      router.push(url);
  };

  return (
    <>
        {/* Full Screen Loader when a driver is clicked */}
        {isNavigating && <NavigationLoader />}

        <div className="relative w-full max-w-xl z-50">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {loading ? <Loader2 className="animate-spin text-[#DFFF00]" size={16}/> : <Search className="text-zinc-500 group-focus-within:text-[#DFFF00]" size={16} />}
                </div>
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SEARCH DRIVER DATABASE (HISTORY INCLUDED)..."
                    className="w-full bg-zinc-900/90 backdrop-blur-md border-2 border-zinc-800 text-white text-xs font-mono py-4 pl-12 pr-4 focus:outline-none focus:border-[#DFFF00] transition-all uppercase placeholder:text-zinc-600 tracking-wider shadow-xl"
                />
                {/* Visual Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 pointer-events-none group-focus-within:border-[#DFFF00]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700 pointer-events-none group-focus-within:border-[#DFFF00]" />
            </div>

            {/* Results Dropdown */}
            {results.length > 0 && !isNavigating && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex justify-between">
                        <span>Global Archives</span>
                        <span>{results.length} Found</span>
                    </div>
                    <div className="divide-y divide-zinc-800 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {results.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => handleSelect(item.url)}
                                className="flex items-center gap-4 p-3 hover:bg-zinc-900 transition-colors group cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={16} className="text-zinc-700" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-white uppercase group-hover:text-[#DFFF00] transition-colors truncate">{item.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {item.flag && <img src={item.flag} alt="flag" className="h-2 w-auto opacity-60" />}
                                        <span className="text-[10px] font-mono text-zinc-500 truncate">{item.team}</span>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </>
  );
}