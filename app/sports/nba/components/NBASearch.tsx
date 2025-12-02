// app/sports/nba/components/NBASearch.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2, User, ChevronRight } from 'lucide-react';
import { searchPlayers } from '../actions';

export default function NBASearch() {
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
        setResults(data);
        setLoading(false);
    });
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-xl">
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {loading ? <Loader2 className="animate-spin text-[#DFFF00]" size={16}/> : <Search className="text-zinc-500 group-focus-within:text-[#DFFF00]" size={16} />}
            </div>
            <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH PLAYER DATABASE..."
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white text-xs font-mono py-4 pl-12 pr-4 focus:outline-none focus:border-[#DFFF00] focus:bg-zinc-900 transition-all uppercase placeholder:text-zinc-600 tracking-wider"
            />
            {/* Visual Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 pointer-events-none group-focus-within:border-[#DFFF00]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700 pointer-events-none group-focus-within:border-[#DFFF00]" />
        </div>

        {/* Results Dropdown */}
        {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 z-50 shadow-2xl">
                <div className="p-2 bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex justify-between">
                    <span>Database Matches</span>
                    <span>{results.length} Found</span>
                </div>
                <div className="divide-y divide-zinc-800">
                    {results.map((item) => (
                        <Link 
                            key={item.id} 
                            href={item.url}
                            className="flex items-center gap-4 p-3 hover:bg-zinc-900 transition-colors group"
                        >
                             <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={12} className="text-zinc-600" />
                                )}
                             </div>
                             <div className="flex-1">
                                 <div className="text-xs font-bold text-white uppercase group-hover:text-[#DFFF00] transition-colors">{item.name}</div>
                                 <div className="text-[10px] font-mono text-zinc-500">{item.team}</div>
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