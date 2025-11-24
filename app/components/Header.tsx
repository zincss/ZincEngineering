'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Loader2, Database, ChevronRight, Command, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CDN_URL = "https://cdn.warframestat.us/img/";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  useEffect(() => {
    const initSystem = async () => {
      await supabase.from('items').select('id').limit(1);
    };
    initSystem();
  }, []);

  useEffect(() => {
    const searchItems = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('items')
        .select('id, name, category, image_name')
        .ilike('name', `%${query}%`)
        .limit(5);

      setResults(data || []);
      setLoading(false);
    };

    const timeoutId = setTimeout(() => searchItems(), 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !inputRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
      setShowDropdown(false);
      setQuery('');
      router.push(`/build/${id}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b-2 border-black dark:border-zinc-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-8">
        
        {/* LOGO LEFT */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="bg-black text-acid w-10 h-10 flex items-center justify-center font-black text-xl group-hover:bg-acid group-hover:text-black transition-colors border border-transparent dark:border-zinc-700">
            Z
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-black text-lg leading-none tracking-tighter text-black dark:text-white">ZINC</span>
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 tracking-widest">ENGINEERING</span>
          </div>
        </Link>

        {/* --- GLOBAL SEARCH BAR --- */}
        <div className="flex-1 max-w-xl relative">
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
                </div>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="SEARCH DATABASE..."
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-black dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-black px-10 py-2.5 font-mono text-xs font-bold uppercase outline-none transition-all placeholder:text-zinc-400 text-black dark:text-white"
                />
                {query.length > 0 && (
                    <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* DROPDOWN RESULTS */}
            {showDropdown && results.length > 0 && (
                <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] animate-in fade-in slide-in-from-top-1 overflow-hidden">
                    <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Matches Found: {results.length}</span>
                        <Command size={10} className="text-zinc-400"/>
                    </div>
                    {results.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className="flex items-center gap-3 p-3 hover:bg-acid dark:hover:bg-acid cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0 group transition-colors"
                        >
                            <div className="h-8 w-8 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-0.5 shrink-0">
                                <img src={`${CDN_URL}${item.image_name}`} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-black text-xs uppercase truncate text-black dark:text-zinc-200 group-hover:text-black">{item.name}</div>
                                <div className="text-[9px] font-mono text-zinc-500 uppercase group-hover:text-black/70">{item.category}</div>
                            </div>
                            <ChevronRight size={14} className="text-black opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"/>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* NAV RIGHT */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/database" 
            className={`text-[10px] font-black uppercase tracking-widest hover:text-acid transition-colors ${isActive('/database') ? 'text-black dark:text-white decoration-acid underline decoration-2 underline-offset-4' : 'text-zinc-400 dark:text-zinc-500'}`}
          >
            DATABASE
          </Link>

          <Link 
            href="/modules" 
            className={`text-[10px] font-black uppercase tracking-widest hover:text-acid transition-colors ${isActive('/modules') ? 'text-black dark:text-white decoration-acid underline decoration-2 underline-offset-4' : 'text-zinc-400 dark:text-zinc-500'}`}
          >
            MODULES
          </Link>

          <Link 
            href="/market" 
            className={`text-[10px] font-black uppercase tracking-widest hover:text-acid transition-colors ${isActive('/market') ? 'text-black dark:text-white decoration-acid underline decoration-2 underline-offset-4' : 'text-zinc-400 dark:text-zinc-500'}`}
          >
            MARKET
          </Link>
        </nav>
      </div>
    </header>
  );
}