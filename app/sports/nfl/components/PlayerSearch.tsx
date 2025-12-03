'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { searchPlayers } from '../actions';

export default function PlayerSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const data = await searchPlayers(query);
                setResults(data);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="FIND ATHLETE..." 
                    className="w-full bg-zinc-900/50 border border-zinc-800 p-3 pl-10 text-sm text-white focus:outline-none focus:border-[#DFFF00] placeholder:text-zinc-600 font-mono uppercase"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Search size={14} className="absolute left-3 top-3.5 text-zinc-500" />
            </div>
            {results.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-zinc-950 border border-zinc-800 mt-1 z-50 max-h-64 overflow-y-auto shadow-xl">
                    {results.map((r) => (
                        <Link href={r.url} key={r.id} className="flex items-center gap-3 p-3 hover:bg-zinc-900 border-b border-zinc-900 last:border-0">
                            {r.image && <img src={r.image} className="w-8 h-8 rounded-full bg-zinc-900 object-cover" />}
                            <div>
                                <div className="text-xs font-bold text-white uppercase">{r.name}</div>
                                <div className="text-[10px] font-mono text-zinc-500">{r.team}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}