'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Zap, Database, Terminal, Loader2, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; 
import { useRouter } from 'next/navigation';

const CDN_URL = "https://cdn.warframestat.us/img/";

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemReady, setSystemReady] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. WAKE UP THE DATABASE ON MOUNT
  useEffect(() => {
    const initSystem = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('id, name, category, image_name')
        .eq('category', 'Warframes') 
        .limit(10);

      if (data) {
        setSystemReady(true);
        setResults(data); 
      }
    };

    initSystem();
  }, []);

  // 2. HANDLE TYPING SEARCH
  useEffect(() => {
    const searchItems = async () => {
      if (query.length < 2) {
        if (query.length === 0 && systemReady) {
           return; 
        }
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
  }, [query, systemReady]);

  // Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto z-50 px-4 md:px-0" ref={dropdownRef}>
      
      {/* Search Container */}
      <div className="relative group">
        {/* Status Indicator */}
        <div className="absolute top-0 left-0 -translate-y-full flex items-center gap-2 mb-1 pl-4 md:pl-0">
           <div className={`text-[10px] font-mono font-bold px-2 py-0.5 transition-colors duration-500 ${systemReady ? 'bg-acid text-black' : 'bg-red-500 text-white animate-pulse'}`}>
             {systemReady ? 'SYSTEM_ONLINE' : 'CONNECTING...'}
           </div>
           {loading && <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> QUERYING_ARCHIVES</div>}
        </div>
        
        <div className="absolute inset-y-0 left-4 md:left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
          <Search size={20} className={`md:w-6 md:h-6 ${systemReady ? "text-black" : "text-zinc-300"}`} strokeWidth={3} />
        </div>
        
        <input
          type="text"
          className="w-full bg-white border-2 border-black rounded-none py-4 md:py-6 pl-14 md:pl-16 pr-4 text-lg md:text-2xl font-bold tracking-tight text-black placeholder:text-zinc-300 focus:outline-none focus:ring-0 focus:bg-zinc-50 transition-all uppercase"
          placeholder={systemReady ? "ENTER SUBJECT NAME..." : "INITIALIZING..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          disabled={!systemReady}
        />
        
        {/* Decorative corner accent - Hidden on tiny screens if needed, but safe here */}
        <div className={`absolute bottom-0 right-4 md:right-0 w-4 h-4 border-t-2 border-l-2 border-black transition-colors ${systemReady ? 'bg-acid' : 'bg-zinc-300'}`} />
      </div>

      {/* Results Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-4 right-4 md:left-0 md:right-0 mt-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 z-50">
          
          <div className="flex justify-between items-center bg-zinc-100 border-b-2 border-black px-4 py-2">
             <span className="text-[10px] font-mono font-bold text-zinc-500">
                {query.length < 2 ? "RECOMMENDED PROTOCOLS" : `MATCHES FOUND: ${results.length}`}
             </span>
             <Database size={12} className="text-zinc-500" />
          </div>

          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/build/${item.id}`)}
              className="group flex items-center justify-between p-3 md:p-4 cursor-pointer hover:bg-acid transition-colors border-b border-zinc-200 last:border-0"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="h-10 w-10 md:h-12 md:w-12 border border-black bg-zinc-50 p-1 relative flex items-center justify-center overflow-hidden">
                   <img 
                     src={`${CDN_URL}${item.image_name}`} 
                     alt={item.name}
                     className="object-contain h-full w-full grayscale group-hover:grayscale-0 transition-all"
                   />
                </div>
                
                <div className="min-w-0">
                  <h4 className="text-lg md:text-xl font-black uppercase leading-none group-hover:text-black truncate">{item.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-black">TYPE: {item.category.toUpperCase()}</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-black opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}