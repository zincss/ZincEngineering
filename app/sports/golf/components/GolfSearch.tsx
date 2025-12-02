// app/sports/golf/components/GolfSearch.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, User } from 'lucide-react';
import { searchPlayers } from '../actions'; // <--- UPDATED IMPORT
import { useDebounce } from 'use-debounce';

export default function GolfSearch() {
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounce(query, 300);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            const data = await searchPlayers(debouncedQuery); // <--- UPDATED CALL
            setResults(data);
            setLoading(false);
        };
        fetchResults();
    }, [debouncedQuery]);

    return (
        <div className="relative max-w-md w-full">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#DFFF00] transition-colors">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-md leading-5 bg-zinc-900 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-black focus:border-[#DFFF00] focus:text-white transition-all sm:text-sm font-mono uppercase tracking-wider"
                    placeholder="Find Player..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {results.length > 0 && (
                <div className="absolute z-50 mt-2 w-full bg-zinc-900 border border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-md overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                        {results.map((player) => (
                            <li key={player.id}>
                                <button
                                    onClick={() => router.push(player.url)}
                                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-black transition-colors group border-b border-zinc-800 last:border-0"
                                >
                                    {player.image ? (
                                        <img src={player.image} alt={player.name} className="w-8 h-8 rounded-full object-cover bg-zinc-800" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <User size={14} />
                                        </div>
                                    )}
                                    <div>
                                        <span className="block text-sm font-bold text-zinc-300 group-hover:text-white uppercase">
                                            {player.name}
                                        </span>
                                        <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                                            {player.tour || 'PGA'}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}