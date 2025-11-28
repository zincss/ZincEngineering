'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Loader2, Command, X, Trophy, ChevronRight, LayoutGrid, User, Circle, Gamepad2, Menu, Film } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CDN_URL = "https://cdn.warframestat.us/img/";

// --- UNIVERSAL ATHLETE INDEX ---
const ATHLETE_DB = [
    // F1
    { id: 'max_verstappen', name: 'Max Verstappen', team: 'Red Bull Racing', sport: 'F1', url: '/sports/f1/driver/max_verstappen' },
    { id: 'hamilton', name: 'Lewis Hamilton', team: 'Mercedes-AMG', sport: 'F1', url: '/sports/f1/driver/hamilton' },
    { id: 'leclerc', name: 'Charles Leclerc', team: 'Ferrari', sport: 'F1', url: '/sports/f1/driver/leclerc' },
    { id: 'norris', name: 'Lando Norris', team: 'McLaren', sport: 'F1', url: '/sports/f1/driver/norris' },
    
    // NRL
    { id: 'p1', name: 'Jamayne Isaako', team: 'Dolphins', sport: 'NRL', url: '/sports/nrl/player/p1' },
    { id: 'p3', name: 'Nathan Cleary', team: 'Penrith Panthers', sport: 'NRL', url: '/sports/nrl/player/p3' },
    { id: 'p9', name: 'Reece Walsh', team: 'Brisbane Broncos', sport: 'NRL', url: '/sports/nrl/player/p9' },
    
    // NBA
    { id: 'lebron_james', name: 'LeBron James', team: 'LA Lakers', sport: 'NBA', url: '/sports/nba/player/lebron_james' },
    { id: 'stephen_curry', name: 'Stephen Curry', team: 'Golden State', sport: 'NBA', url: '/sports/nba/player/stephen_curry' },
    { id: 'nikola_jokic', name: 'Nikola Jokic', team: 'Denver Nuggets', sport: 'NBA', url: '/sports/nba/player/nikola_jokic' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const isSports = pathname?.startsWith('/sports');
  const isGaming = pathname?.startsWith('/gaming');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSports && !isHome) {
        const initSystem = async () => {
            try { await supabase.from('items').select('id').limit(1); } catch (e) {}
        };
        initSystem();
    }
  }, [isSports, isHome]);

  useEffect(() => {
    if (isHome) return; 

    const performSearch = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);

      if (isSports) {
          const matches = ATHLETE_DB.filter(a => 
              a.name.toLowerCase().includes(query.toLowerCase()) || 
              a.team.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5);
          setResults(matches);
          setShowDropdown(true);
          setLoading(false);
      } else {
          try {
            const { data } = await supabase
              .from('items')
              .select('id, name, category, image_name')
              .ilike('name', `%${query}%`)
              .limit(5);
            setResults(data || []);
            setShowDropdown(true);
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
      }
    };

    const timeoutId = setTimeout(() => performSearch(), 300);
    return () => clearTimeout(timeoutId);
  }, [query, isSports, isHome]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !inputRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSelect = (item: any) => {
      setShowDropdown(false);
      setQuery('');
      if (isSports) {
          window.location.href = item.url;
      } else {
          window.location.href = `/gaming/build/${item.id}`;
      }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800 shadow-sm transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-6">
          
          {/* LEFT: LOGO */}
          <div className="flex items-center gap-6">
              <a href="/" className="flex items-center gap-3 group shrink-0">
                  <div className="bg-[#DFFF00] w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-lg md:text-xl text-black transition-all shadow-[0_0_15px_rgba(223,255,0,0.3)] group-hover:shadow-[0_0_25px_rgba(223,255,0,0.6)]">
                      Z
                  </div>
                  <div className="hidden lg:flex flex-col">
                      <span className="font-black text-lg leading-none tracking-tighter text-white">ZINC</span>
                      <span className="font-mono text-[9px] text-zinc-400 tracking-widest">ENGINEERING</span>
                  </div>
              </a>
              <div className="h-8 w-px bg-zinc-800 hidden lg:block"></div>
              <div className="hidden lg:flex items-center gap-2 text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                  <Circle size={8} className="fill-[#DFFF00] text-[#DFFF00] animate-pulse" />
                  <span>System Online</span>
              </div>
          </div>

          {/* CENTER: SEARCH */}
          <div className={`flex-1 max-w-2xl flex justify-center md:justify-start relative transition-opacity duration-500 ${isHome ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              {!isHome && (
              <div className="relative w-full group">
                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#DFFF00] transition-colors">
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
                </div>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if(results.length > 0) setShowDropdown(true); }}
                    placeholder={isSports ? "SEARCH ATHLETES..." : "SEARCH ENTERTAINMENT ARCHIVES..."}
                    className="w-full h-10 bg-zinc-900 border border-zinc-700 focus:border-[#DFFF00] pl-10 md:pl-12 pr-10 font-mono text-[10px] md:text-xs font-bold uppercase outline-none text-white transition-all placeholder:text-zinc-600 focus:bg-black rounded-none"
                />
                {query.length > 0 && (
                  <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                      <X size={14} />
                  </button>
                )}
                
                {/* Context Badge */}
                <div className="absolute right-0 top-[-20px] hidden lg:flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    {isSports ? <span className="flex items-center gap-1"><Trophy size={10}/> ATHLETICS_MODE</span> : <span className="flex items-center gap-1"><Film size={10}/> ENTERTAINMENT_MODE</span>}
                </div>

                {/* DROPDOWN */}
                {showDropdown && results.length > 0 && (
                  <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-black border border-zinc-700 shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
                      <div className="bg-zinc-900 px-3 py-1.5 border-b border-zinc-800 flex justify-between items-center sticky top-0">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Matches Found: {results.length}</span>
                          <Command size={10} className="text-zinc-600"/>
                      </div>
                      {results.map((item) => (
                          <div
                              key={item.id}
                              onClick={() => handleSelect(item)}
                              className="flex items-center gap-3 p-3 hover:bg-zinc-900 cursor-pointer border-b border-zinc-900 last:border-0 group transition-colors"
                          >
                              <div className={`h-8 w-8 border border-zinc-700 ${isSports ? 'rounded-full' : ''} bg-black p-0.5 shrink-0 flex items-center justify-center overflow-hidden`}>
                                  {isSports ? (
                                      <User size={16} className="text-zinc-500"/>
                                  ) : (
                                      <img src={`${CDN_URL}${item.image_name}`} className="w-full h-full object-contain" />
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="font-black text-xs uppercase truncate text-zinc-200 group-hover:text-[#DFFF00]">{item.name}</div>
                                  <div className="text-[9px] font-mono text-zinc-500 uppercase">
                                      {isSports ? (
                                          <span className="flex items-center gap-1">
                                              <span className={`px-1 text-white font-bold ${item.sport === 'F1' ? 'bg-red-900' : item.sport === 'NBA' ? 'bg-orange-800' : 'bg-blue-900'}`}>{item.sport}</span>
                                              {item.team}
                                          </span>
                                      ) : item.category}
                                  </div>
                              </div>
                              <ChevronRight size={14} className="text-[#DFFF00] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"/>
                          </div>
                      ))}
                  </div>
                )}
              </div>
              )}
          </div>

          {/* RIGHT: DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-6">
              <nav className="flex items-center gap-8">
                  <a 
                      href="/" 
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#DFFF00] transition-colors ${pathname === '/' ? 'text-[#DFFF00]' : 'text-zinc-500'}`}
                  >
                      <LayoutGrid size={14} /> HUB
                  </a>
                  <a 
                      href="/gaming" 
                      className={`text-[10px] font-black uppercase tracking-widest hover:text-[#DFFF00] transition-colors ${isGaming ? 'text-white underline decoration-2 underline-offset-8 decoration-[#DFFF00]' : 'text-zinc-500'}`}
                  >
                      ENTERTAINMENT
                  </a>
                  <a 
                      href="/sports" 
                      className={`text-[10px] font-black uppercase tracking-widest hover:text-[#DFFF00] transition-colors ${isSports ? 'text-white underline decoration-2 underline-offset-8 decoration-[#DFFF00]' : 'text-zinc-500'}`}
                  >
                      SPORTS
                  </a>
              </nav>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button 
            className="lg:hidden text-zinc-400 hover:text-[#DFFF00] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-black/95 backdrop-blur-xl border-t border-zinc-800 animate-in fade-in slide-in-from-top-4 flex flex-col p-6 lg:hidden">
          <div className="flex flex-col gap-6">
            <a 
              href="/" 
              className={`flex items-center gap-4 text-xl font-black uppercase tracking-widest p-4 border border-zinc-800 bg-zinc-900/50 ${pathname === '/' ? 'text-[#DFFF00] border-[#DFFF00]' : 'text-zinc-500'}`}
            >
              <LayoutGrid size={20} /> HUB
            </a>
            <a 
              href="/gaming" 
              className={`flex items-center gap-4 text-xl font-black uppercase tracking-widest p-4 border border-zinc-800 bg-zinc-900/50 ${isGaming ? 'text-[#DFFF00] border-[#DFFF00]' : 'text-zinc-500'}`}
            >
              <Film size={20} /> ENTERTAINMENT
            </a>
            <a 
              href="/sports" 
              className={`flex items-center gap-4 text-xl font-black uppercase tracking-widest p-4 border border-zinc-800 bg-zinc-900/50 ${isSports ? 'text-[#DFFF00] border-[#DFFF00]' : 'text-zinc-500'}`}
            >
              <Trophy size={20} /> SPORTS
            </a>
          </div>
          
          <div className="mt-auto border-t border-zinc-800 pt-6">
             <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-zinc-600 uppercase">
                  <Circle size={8} className="fill-[#DFFF00] text-[#DFFF00]" />
                  <span>Mobile Uplink Active</span>
              </div>
          </div>
        </div>
      )}
    </>
  );
}