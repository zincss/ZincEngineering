'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Loader2, Command, X, Trophy, ChevronRight, LayoutGrid, User, Circle, Gamepad2, Menu, Film, Terminal, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// Import search actions
import { searchPlayers as searchNBA } from '../sports/nba/actions';
import { searchPlayers as searchNRL } from '../sports/nrl/actions';
import { searchF1Archive as searchF1 } from '../sports/f1/actions'; 
import { searchPlayers as searchGolf } from '../sports/golf/actions';

const CDN_URL = "https://cdn.warframestat.us/img/";

// --- LOADER OVERLAY COMPONENT ---
const NavigationLoader = () => (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-[#DFFF00] blur-2xl opacity-20 animate-pulse"></div>
           <div className="w-16 h-16 border-2 border-zinc-800 border-t-[#DFFF00] rounded-full animate-spin relative z-10"></div>
           <div className="absolute inset-0 flex items-center justify-center z-10">
               <Activity size={24} className="text-[#DFFF00]" />
           </div>
        </div>
        <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-sm font-black tracking-[0.2em] uppercase">
                <Terminal size={14} />
                <span>ACCESSING DATABASE</span>
            </div>
            <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-widest animate-pulse">
                RETRIEVING SECURE DATA...
            </span>
        </div>
    </div>
);

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  
  const isSports = pathname?.startsWith('/sports') || pathname === '/';
  const isGaming = pathname?.startsWith('/gaming');

  // Detect Context to Boost Results
  const contextSport = pathname?.includes('/nba') ? 'NBA' 
                     : pathname?.includes('/nrl') ? 'NRL'
                     : pathname?.includes('/f1') ? 'F1'
                     : pathname?.includes('/golf') ? 'GOLF'
                     : null;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // --- UNIFIED SEARCH ENGINE ---
  useEffect(() => {
    if (isGaming && !isHome) return; 

    const performSearch = async () => {
      // Don't search for tiny queries to save API calls
      if (query.length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setShowDropdown(true);

      try {
          let hits: any[] = [];

          if (isSports) {
              // 1. SAFELY EXECUTE PARALLEL SEARCHES (Catch errors individually)
              // If one sport fails, it returns empty array instead of crashing everything
              const [nba, nrl, f1, golf] = await Promise.all([
                  searchNBA(query).catch(err => { console.error('NBA Search Error:', err); return []; }),
                  searchNRL(query).catch(err => { console.error('NRL Search Error:', err); return []; }),
                  searchF1(query).catch(err => { console.error('F1 Search Error:', err); return []; }),
                  searchGolf(query).catch(err => { console.error('Golf Search Error:', err); return []; })
              ]);
              
              // 2. NORMALIZE F1 DATA (The F1 action returns 'driverId' but we need 'id' for the list)
              const f1Norm = (f1 || []).map((d: any) => ({ 
                  id: d.driverId, 
                  name: `${d.givenName} ${d.familyName}`, 
                  team: d.nationality, 
                  sport: 'F1', 
                  url: d.url // URL is already correct from action
              }));

              // 3. COMBINE ALL RESULTS
              hits = [...(nba || []), ...(nrl || []), ...f1Norm, ...(golf || [])];

              // 4. INTELLIGENT SORTING (Context > Relevance)
              const lowerQ = query.toLowerCase();
              hits.sort((a, b) => {
                  const na = a.name.toLowerCase();
                  const nb = b.name.toLowerCase();
                  
                  // Priority 1: Context Boost (If you are on /nba page, show NBA players first)
                  if (contextSport) {
                      if (a.sport === contextSport && b.sport !== contextSport) return -1;
                      if (b.sport === contextSport && a.sport !== contextSport) return 1;
                  }

                  // Priority 2: Exact Match
                  if (na === lowerQ && nb !== lowerQ) return -1;
                  if (nb === lowerQ && na !== lowerQ) return 1;
                  
                  // Priority 3: Starts With
                  const aStart = na.startsWith(lowerQ);
                  const bStart = nb.startsWith(lowerQ);
                  if (aStart && !bStart) return -1;
                  if (bStart && !aStart) return 1;

                  return 0;
              });

              // 5. SLICE (Top 10)
              hits = hits.slice(0, 10);

          } else {
              // GAMING SEARCH
              const { data } = await supabase
                .from('items')
                .select('id, name, category, image_name')
                .ilike('name', `%${query}%`)
                .limit(5);
              
              hits = (data || []).map(item => ({
                  ...item,
                  sport: 'WARFRAME',
                  team: item.category,
                  url: `/gaming/build/${item.id}`
              }));
          }

          setResults(hits);
      } catch (err) {
          console.error("Global Search Error", err);
          // Fallback to empty results instead of breaking UI
          setResults([]);
      } finally {
          setLoading(false);
      }
    };

    // Debounce: Wait 500ms after typing stops before searching
    const timeoutId = setTimeout(() => performSearch(), 500); 
    return () => clearTimeout(timeoutId);
  }, [query, isSports, isHome, isGaming, contextSport]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !inputRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
      setShowDropdown(false);
      setQuery('');
      setIsNavigating(true);
      router.push(item.url);
  };

  const getPlaceholder = () => {
      if (contextSport) return `SEARCH ${contextSport} ARCHIVES...`;
      if (isSports) return "SEARCH GLOBAL SPORTS...";
      return "SEARCH ENTERTAINMENT...";
  };

  return (
    <>
      {isNavigating && <NavigationLoader />}

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
          <div className={`flex-1 max-w-2xl flex justify-center md:justify-start relative transition-opacity duration-500 ${isGaming && !isHome ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="relative w-full group">
                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#DFFF00] transition-colors">
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
                </div>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if(results.length > 0 || query.length > 1) setShowDropdown(true); }}
                    placeholder={getPlaceholder()}
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
                {showDropdown && (results.length > 0 || loading || (query.length >= 3 && !loading)) && (
                  <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-black border border-zinc-700 shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
                      <div className="bg-zinc-900 px-3 py-1.5 border-b border-zinc-800 flex justify-between items-center sticky top-0">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                              {loading ? "SEARCHING ARCHIVES..." : `MATCHES FOUND: ${results.length}`}
                          </span>
                          <Command size={10} className="text-zinc-600"/>
                      </div>

                      {/* NO RESULTS STATE */}
                      {!loading && results.length === 0 && query.length >= 3 && (
                          <div className="p-8 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
                              NO MATCHES FOUND IN DATABASE
                          </div>
                      )}

                      {/* LOADING STATE */}
                      {loading && (
                          <div className="p-4 flex items-center justify-center gap-3 text-zinc-500">
                              <Loader2 size={16} className="animate-spin text-[#DFFF00]" />
                              <span className="text-[10px] font-mono font-bold tracking-widest animate-pulse">SCANNING...</span>
                          </div>
                      )}

                      {/* RESULTS LIST */}
                      {!loading && results.map((item) => (
                          <div
                              key={item.id}
                              onClick={() => handleSelect(item)}
                              className="flex items-center gap-3 p-3 hover:bg-zinc-900 cursor-pointer border-b border-zinc-900 last:border-0 group transition-colors"
                          >
                              <div className={`h-8 w-8 border border-zinc-700 ${isSports ? 'rounded-full' : ''} bg-black p-0.5 shrink-0 flex items-center justify-center overflow-hidden`}>
                                  {isSports ? (
                                      item.image ? (
                                        <img src={item.image} className="w-full h-full object-cover rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                      ) : (
                                        <User size={16} className="text-zinc-500"/>
                                      )
                                  ) : (
                                      <img src={`${CDN_URL}${item.image_name}`} className="w-full h-full object-contain" />
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="font-black text-xs uppercase truncate text-zinc-200 group-hover:text-[#DFFF00]">{item.name}</div>
                                  <div className="text-[9px] font-mono text-zinc-500 uppercase">
                                      <span className="flex items-center gap-1">
                                          <span className={`px-1 text-white font-bold ${item.sport === 'F1' ? 'bg-red-900' : item.sport === 'NBA' ? 'bg-orange-800' : item.sport === 'NRL' ? 'bg-green-800' : 'bg-blue-900'}`}>{item.sport}</span>
                                          {item.team}
                                      </span>
                                  </div>
                              </div>
                              <ChevronRight size={14} className="text-[#DFFF00] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"/>
                          </div>
                      ))}
                  </div>
                )}
              </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
              <nav className="flex items-center gap-8">
                  <a href="/" className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#DFFF00] transition-colors ${pathname === '/' ? 'text-[#DFFF00]' : 'text-zinc-500'}`}><LayoutGrid size={14} /> HUB</a>
                  <a href="/gaming" className={`text-[10px] font-black uppercase tracking-widest hover:text-[#DFFF00] transition-colors ${isGaming ? 'text-white underline decoration-2 underline-offset-8 decoration-[#DFFF00]' : 'text-zinc-500'}`}>ENTERTAINMENT</a>
                  <a href="/sports" className={`text-[10px] font-black uppercase tracking-widest hover:text-[#DFFF00] transition-colors ${isSports ? 'text-white underline decoration-2 underline-offset-8 decoration-[#DFFF00]' : 'text-zinc-500'}`}>SPORTS</a>
              </nav>
          </div>

          <button className="lg:hidden text-zinc-400 hover:text-[#DFFF00] transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </header>
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-black/95 backdrop-blur-xl border-t border-zinc-800 animate-in fade-in slide-in-from-top-4 flex flex-col p-6 lg:hidden">
          <div className="flex flex-col gap-6">
            <a href="/" className="flex items-center gap-4 text-xl font-black uppercase tracking-widest p-4 border border-zinc-800 bg-zinc-900/50 text-zinc-500"><LayoutGrid size={20} /> HUB</a>
            <a href="/gaming" className="flex items-center gap-4 text-xl font-black uppercase tracking-widest p-4 border border-zinc-800 bg-zinc-900/50 text-zinc-500"><Film size={20} /> ENTERTAINMENT</a>
            <a href="/sports" className="flex items-center gap-4 text-xl font-black uppercase tracking-widest p-4 border border-zinc-800 bg-zinc-900/50 text-zinc-500"><Trophy size={20} /> SPORTS</a>
          </div>
        </div>
      )}
    </>
  );
}