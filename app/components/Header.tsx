'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
// FIX: Added 'LayoutGrid' to imports for the Hub button
import { Search, Loader2, Command, X, Trophy, ChevronRight, Gamepad2, LayoutGrid } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CDN_URL = "https://cdn.warframestat.us/img/";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Context Detection
  const isSports = pathname?.startsWith('/sports');
  const isHome = pathname === '/';

  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. WAKE UP DB (Global)
  useEffect(() => {
    const initSystem = async () => {
      try {
        await supabase.from('items').select('id').limit(1);
        console.log("ZINC SYSTEM: Database Connected.");
      } catch (e) {
        console.error("ZINC SYSTEM: Database Connection Failed", e);
      }
    };
    initSystem();
  }, []);

  // 2. SEARCH LOGIC (With Debugging)
  useEffect(() => {
    const searchItems = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      console.log(`Searching for: ${query}...`);

      try {
        const { data, error } = await supabase
          .from('items')
          .select('id, name, category, image_name')
          .ilike('name', `%${query}%`)
          .limit(5);

        if (error) throw error;

        console.log("Results found:", data?.length);
        setResults(data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => searchItems(), 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click Outside to Close
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
      // Always route to the gaming build page for now
      router.push(`/gaming/build/${id}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b-2 border-black dark:border-zinc-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-8">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="bg-black text-acid w-10 h-10 flex items-center justify-center font-black text-xl group-hover:bg-acid group-hover:text-black transition-colors border border-transparent dark:border-zinc-700">
            Z
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-black text-lg leading-none tracking-tighter text-black dark:text-white">ZINC</span>
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 tracking-widest">ENGINEERING</span>
          </div>
        </Link>

        {/* CENTER: Universal Search */}
        <div className="flex-1 flex justify-center md:justify-start relative">
            
            {/* Optional Context Title (Only show on Sports) */}
            {isSports && (
                <div className="hidden md:flex items-center gap-2 text-black dark:text-white mr-4">
                    <Trophy size={18} className="text-acid"/>
                    <span className="font-black text-xl tracking-tighter uppercase">ATHLETICS</span>
                </div>
            )}

            {/* UNIVERSAL SEARCH BAR */}
            <div className="relative w-full max-w-md group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                  {loading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
              </div>
              <input 
                  ref={inputRef}
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => { if(results.length > 0) setShowDropdown(true); }}
                  placeholder={isSports ? "SEARCH ATHLETES (COMING SOON)..." : "SEARCH DATABASE..."}
                  disabled={isSports} // Disable search on sports page for now
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-black dark:focus:border-zinc-600 px-10 py-2 font-mono text-xs font-bold uppercase outline-none text-black dark:text-white transition-all placeholder:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {query.length > 0 && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white">
                    <X size={14} />
                </button>
              )}

              {/* DROPDOWN RESULTS */}
              {showDropdown && results.length > 0 && (
                <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] animate-in fade-in slide-in-from-top-1 overflow-hidden z-50">
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
        </div>

        {/* NAV RIGHT */}
        <nav className="hidden md:flex items-center gap-6">
            {/* NEW: Main Hub Button */}
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-acid text-zinc-400 dark:text-zinc-500 transition-colors">
                <LayoutGrid size={14} /> MAIN HUB
            </Link>
            
            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-2"></div>

            <Link href="/gaming" className="text-[10px] font-black uppercase tracking-widest hover:text-acid text-zinc-400 dark:text-zinc-500">GAMING</Link>
            <Link href="/sports" className="text-[10px] font-black uppercase tracking-widest hover:text-acid text-zinc-400 dark:text-zinc-500">SPORTS</Link>
        </nav>
      </div>
    </header>
  );
}