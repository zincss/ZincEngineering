'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2, ChevronRight } from 'lucide-react';
import { searchPlayers } from '../actions';

// Custom Hook to prevent excessive API calls while typing
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function PlayerSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Use our custom hook instead of an external library
    const debouncedQuery = useDebounceValue(query, 500);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await searchPlayers(debouncedQuery);
                setResults(data);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    return (
        <div className="relative z-50">
            <div className="relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Search size={20} />
                </div>
                <input 
                    type="text" 
                    placeholder="SEARCH GLOBAL ATHLETE DATABASE..."
                    className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-12 font-bold font-mono text-lg uppercase focus:outline-none focus:border-acid transition-colors text-black dark:text-white"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-acid" size={20} />
                    </div>
                )}
            </div>

            {(results.length > 0 || (query.length > 2 && !loading)) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 shadow-xl max-h-96 overflow-y-auto">
                    {results.length === 0 ? (
                        <div className="p-4 text-center font-mono text-xs text-zinc-500">
                            NO ATHLETES FOUND MATCHING "{query}"
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 divide-y divide-zinc-100 dark:divide-zinc-800">
                            {results.map((player) => (
                                <Link 
                                    href={`/sports/nba/player/${player.id}`} 
                                    key={player.id}
                                    className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0">
                                        <img src={player.image} alt={player.name} className="w-full h-full object-cover scale-110 pt-1" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-black text-sm uppercase text-black dark:text-white">{player.name}</div>
                                        <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                                            <span>{player.team}</span>
                                            {player.number && <span>#{player.number}</span>}
                                            {player.pos && <span>{player.pos}</span>}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-acid" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}