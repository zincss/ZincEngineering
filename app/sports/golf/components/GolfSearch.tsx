'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2, User, ChevronRight } from 'lucide-react';
import { searchPlayers } from '../actions';

export default function GolfSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
    searchPlayers(debouncedQuery).then((data) => {
        setResults(data || []);
        setLoading(false);
    });
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-xl z-[100]">
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-30">
                <Search className="text-zinc-500 group-focus-within:text-[#DFFF00] transition-colors" size={16} />
            </div>
            <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH_ATHLETES // TOUR_DATABASE..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs font-mono py-4 pl-12 pr-4 focus:outline-none focus:border-[#DFFF00] transition-all uppercase placeholder:text-zinc-600 tracking-wider rounded-xl shadow-lg focus:shadow-[0_0_20px_rgba(223,255,0,0.1)] relative z-20"
            />
            {loading && (
                <div className="absolute bottom-0 left-0 h-[2px] bg-[#DFFF00] animate-scan w-full z-30 rounded-b-xl overflow-hidden" />
            )}
        </div>

        {/* Results Dropdown */}
        {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/95 backdrop-blur-xl border border-zinc-700 rounded-xl z-[100] shadow-2xl overflow-hidden p-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-white/10 text-[9px] font-mono text-[#DFFF00] uppercase tracking-widest flex justify-between items-center mb-2">
                    <span>Pro Intel</span>
                    <span>{results.length} Matches</span>
                </div>
                <div className="space-y-1">
                    {results.map((item) => (
                        <Link 
                            key={item.id} 
                            href={item.url}
                            className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10 group"
                        >
                             <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden group-hover:border-[#DFFF00]/50 transition-colors">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={12} className="text-zinc-600" />
                                )}
                             </div>
                             <div className="flex-1">
                                 <div className="text-xs font-black text-zinc-300 uppercase group-hover:text-white group-hover:translate-x-1 transition-all">{item.name}</div>
                                 <div className="text-[10px] font-mono text-zinc-500 group-hover:text-[#DFFF00] transition-colors">{item.team}</div>
                             </div>
                             <ChevronRight size={14} className="text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
