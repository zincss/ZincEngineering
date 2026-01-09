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
        <div className="relative w-full max-w-md z-[100]">
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="ACCESS PLAYER DATABASE..." 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-12 text-sm text-white focus:outline-none focus:border-[#DFFF00] placeholder:text-zinc-600 font-mono uppercase tracking-widest transition-all shadow-lg focus:shadow-[0_0_20px_rgba(223,255,0,0.1)] relative z-20"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#DFFF00] transition-colors z-30" />
                
                {/* Decorative scanning line */}
                {loading && (
                    <div className="absolute bottom-0 left-0 h-[2px] bg-[#DFFF00] animate-scan w-full z-30 rounded-b-xl" />
                )}
            </div>
            
            {results.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-xl border border-zinc-700 rounded-xl mt-2 z-[100] max-h-96 overflow-y-auto shadow-2xl custom-scrollbar p-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-white/10 text-[9px] font-mono text-[#DFFF00] uppercase tracking-widest flex justify-between items-center mb-2">
                        <span>Search Results</span>
                        <span>{results.length} Matches</span>
                    </div>
                    <div className="space-y-1">
                        {results.map((r) => (
                            <Link href={r.url} key={r.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10 group">
                                <div className="relative">
                                    {r.image ? (
                                        <img src={r.image} className="w-10 h-10 rounded-lg bg-zinc-900 object-cover border border-zinc-700 group-hover:border-[#DFFF00] transition-colors" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                                            <Search size={14} className="text-zinc-600"/>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs font-black text-zinc-300 uppercase group-hover:text-white group-hover:translate-x-1 transition-all">{r.name}</div>
                                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-[#DFFF00] transition-colors">{r.team}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}