// app/sports/golf/components/GolfSearch.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { searchGolfersAction } from '../actions';

export default function GolfSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                const data = await searchGolfersAction(query);
                setResults(data);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [query]);

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search players..." 
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[#DFFF00]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                    {results.map((r) => (
                        <div 
                            key={r.id}
                            onClick={() => router.push(r.url)}
                            className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer"
                        >
                            <img src={r.image || '/placeholder.png'} className="w-8 h-8 rounded-full bg-zinc-800 object-cover" />
                            <span className="text-sm font-bold text-white">{r.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}