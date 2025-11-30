'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Loader2, Command, X, Trophy, ChevronRight, LayoutGrid, User, Circle, Menu, FolderOpen, Terminal, Activity } from 'lucide-react';
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
  
  // Route Detection
  const isHome = pathname === '/';
  const isSports = pathname?.startsWith('/sports');
  const isCollections = pathname?.startsWith('/collections') || pathname?.startsWith('/gaming') || pathname?.startsWith('/automotive');

  // Context Detection for Search Priority
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
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // --- UNIFIED SEARCH ENGINE ---
  useEffect(() => {
    // Disable search logic entirely on Home page
    if (isHome) return;

    const performSearch = async () => {
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
              const [nba, nrl, f1, golf] = await Promise.all([
                  searchNBA(query).catch(() => []),
                  searchNRL(query).catch(() => []),
                  searchF1(query).catch(() => []),
                  searchGolf(query).catch(() => [])
              ]);
              
              const f1Norm = (f1 || []).map((d: any) => ({ 
                  id: d.driverId, 
                  name: `${d.givenName} ${d.familyName}`, 
                  team: d.nationality, 
                  sport: 'F1', 
                  url: d.url 
              }));

              hits = [...(nba || []), ...(nrl || []), ...f1Norm, ...(golf || [])];

              // Sort by context relevance
              hits.sort((a, b) => {
                  if (contextSport) {
                      if (a.sport === contextSport && b.sport !== contextSport) return -1;
                      if (b.sport === contextSport && a.sport !== contextSport) return 1;
                  }
                  return 0; 
              });

              hits = hits.slice(0, 10);

          } else {
              // COLLECTIONS / GENERAL SEARCH
              const { data } = await supabase
                .from('items')
                .select('id, name, category, image_name')
                .ilike('name', `%${query}%`)
                .limit(5);
              
              hits = (data || []).map(item => ({
                  ...item,
                  sport: 'CODEX',
                  team: item.category,
                  url: `/gaming/build/${item.id}`
              }));
          }

          setResults(hits);
      } catch (err) {
          console.error("Search Error", err);
          setResults([]);
      } finally {
          setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => performSearch(), 500); 
    return () => clearTimeout(timeoutId);
  }, [query, isSports, isHome, contextSport]);

  // Click Outside Handler
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

  return (
    <>
      {isNavigating && <NavigationLoader />}

      {/* Changed bg-black/90 to bg-black/80 for more transparency */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 transition-all duration-300">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
          
          {/* LEFT: IDENTITY & NAV */}
          <div className="flex items-center gap-10">
              <a href="/" className="flex items-center gap-4 group">
                  <div className="bg-[#DFFF00] w-10 h-10 flex items-center justify-center font-black text-xl text-black shadow-[0_0_25px_rgba(223,255,0,0.15)] group-hover:shadow-[0_0_35px_rgba(223,255,0,0.4)] transition-all duration-500 rounded-sm">
                      Z
                  </div>
                  <div className="hidden md:flex flex-col justify-center">
                      <span className="font-black text-xl leading-none text-white tracking-tighter group-hover:text-[#DFFF00] transition-colors">ZINC</span>
                      <span className="font-mono text-[9px] text-zinc-500 tracking-[0.35em] group-hover:text-zinc-400 transition-colors uppercase">Engineering</span>
                  </div>
              </a>

              {/* DESKTOP NAV */}
              <nav className="hidden lg:flex items-center">
                  <NavLink href="/" active={isHome} icon={<LayoutGrid size={14} />}>HUB</NavLink>
                  <div className="w-px h-4 bg-zinc-800 mx-3"></div>
                  <NavLink href="/collections" active={isCollections} icon={<FolderOpen size={14} />}>COLLECTIONS</NavLink>
                  <div className="w-px h-4 bg-zinc-800 mx-3"></div>
                  <NavLink href="/sports" active={isSports} icon={<Trophy size={14} />}>SPORTS</NavLink>
              </nav>
          </div>

          {/* CENTER: SEARCH BAR (HIDDEN ON HOME PAGE) */}
          {!isHome ? (
              <div className="flex-1 max-w-xl relative hidden md:block animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#DFFF00] transition-colors">
                          {loading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
                      </div>
                      <input 
                          ref={inputRef}
                          type="text" 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={isSports ? "SEARCH LEAGUE DATABASE..." : "SEARCH COLLECTIONS..."}
                          className="w-full bg-zinc-900/50 border border-zinc-700 group-focus-within:border-[#DFFF00] h-10 pl-12 pr-10 text-xs font-mono font-bold text-white placeholder:text-zinc-600 outline-none uppercase transition-all rounded-sm focus:bg-black"
                      />
                      
                      {query && (
                        <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                      )}
                      
                      {/* DROPDOWN */}
                      {showDropdown && (results.length > 0 || loading) && (
                          <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-black border border-zinc-700 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                              {results.map((item) => (
                                  <div
                                      key={item.id}
                                      onClick={() => handleSelect(item)}
                                      className="flex items-center gap-4 p-3 hover:bg-zinc-900 cursor-pointer border-b border-zinc-900 last:border-0 group transition-colors"
                                  >
                                      {item.sport !== 'CODEX' ? (
                                          <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                                              {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                                          </div>
                                      ) : (
                                          <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                                              <img src={`${CDN_URL}${item.image_name}`} className="w-6 h-6 object-contain" />
                                          </div>
                                      )}
                                      
                                      <div className="flex-1 min-w-0">
                                          <div className="text-xs font-black text-white group-hover:text-[#DFFF00] uppercase truncate">{item.name}</div>
                                          <div className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-2">
                                              <span className={`font-bold ${item.sport === 'CODEX' ? 'text-zinc-400' : 'text-[#DFFF00]'}`}>{item.sport}</span>
                                              <span className="text-zinc-700">/</span>
                                              <span>{item.team}</span>
                                          </div>
                                      </div>
                                      <ChevronRight size={14} className="text-zinc-600 group-hover:text-[#DFFF00] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          ) : (
              <div className="flex-1"></div> /* Spacer when search is hidden */
          )}

          {/* RIGHT: SYSTEM STATUS & MOBILE TOGGLE */}
          <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2 text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                  <Circle size={6} className="fill-[#DFFF00] text-[#DFFF00] animate-pulse" />
                  <span>System Online</span>
              </div>
              <button className="lg:hidden text-white hover:text-[#DFFF00] transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>

        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 top-20 z-40 bg-black/95 backdrop-blur-xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 border-t border-zinc-800">
              <MobileLink href="/" active={isHome} icon={<LayoutGrid size={18}/>} label="HUB" />
              <MobileLink href="/collections" active={isCollections} icon={<FolderOpen size={18}/>} label="COLLECTIONS" />
              <MobileLink href="/sports" active={isSports} icon={<Trophy size={18}/>} label="SPORTS" />
          </div>
      )}
    </>
  );
}

// --- HELPER NAV COMPONENTS ---

const NavLink = ({ href, active, icon, children }: { href: string, active: boolean, icon: React.ReactNode, children: React.ReactNode }) => (
    <a 
        href={href} 
        className={`
            flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm
            ${active ? 'text-[#DFFF00] bg-[#DFFF00]/10 border border-[#DFFF00]/20' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}
        `}
    >
        {icon}
        {children}
    </a>
);

const MobileLink = ({ href, active, icon, label }: any) => (
    <a 
        href={href} 
        className={`
            flex items-center gap-4 p-4 text-sm font-black uppercase tracking-widest border transition-all rounded-sm
            ${active ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}
        `}
    >
        {icon}
        {label}
    </a>
);