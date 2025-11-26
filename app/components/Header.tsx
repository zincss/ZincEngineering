'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Loader2, Command, X, Trophy, ChevronRight, LayoutGrid, User } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CDN_URL = "https://cdn.warframestat.us/img/";

// --- UNIVERSAL ATHLETE INDEX (STATIC + FAST) ---
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
    { id: 'p10', name: 'Kalyn Ponga', team: 'Newcastle Knights', sport: 'NRL', url: '/sports/nrl/player/p10' },
    
    // NBA (NEW)
    { id: 'lebron_james', name: 'LeBron James', team: 'LA Lakers', sport: 'NBA', url: '/sports/nba/player/lebron_james' },
    { id: 'stephen_curry', name: 'Stephen Curry', team: 'Golden State', sport: 'NBA', url: '/sports/nba/player/stephen_curry' },
    { id: 'nikola_jokic', name: 'Nikola Jokic', team: 'Denver Nuggets', sport: 'NBA', url: '/sports/nba/player/nikola_jokic' },
    { id: 'luka_doncic', name: 'Luka Doncic', team: 'Dallas Mavericks', sport: 'NBA', url: '/sports/nba/player/luka_doncic' },
    { id: 'giannis_antetokounmpo', name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', sport: 'NBA', url: '/sports/nba/player/giannis_antetokounmpo' },
    { id: 'kevin_durant', name: 'Kevin Durant', team: 'Phoenix Suns', sport: 'NBA', url: '/sports/nba/player/kevin_durant' },
    { id: 'jayson_tatum', name: 'Jayson Tatum', team: 'Boston Celtics', sport: 'NBA', url: '/sports/nba/player/jayson_tatum' },
    { id: 'anthony_edwards', name: 'Anthony Edwards', team: 'Minnesota Timberwolves', sport: 'NBA', url: '/sports/nba/player/anthony_edwards' },
    { id: 'victor_wembanyama', name: 'Victor Wembanyama', team: 'San Antonio Spurs', sport: 'NBA', url: '/sports/nba/player/victor_wembanyama' },
    { id: 'shai_gilgeous-alexander', name: 'Shai Gilgeous-Alexander', team: 'OKC Thunder', sport: 'NBA', url: '/sports/nba/player/shai_gilgeous-alexander' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  
  const isSports = pathname?.startsWith('/sports');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // DB INIT
  useEffect(() => {
    if (!isSports) {
        const initSystem = async () => {
            try { await supabase.from('items').select('id').limit(1); } catch (e) {}
        };
        initSystem();
    }
  }, [isSports]);

  // SEARCH LOGIC
  useEffect(() => {
    const performSearch = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);

      if (isSports) {
          // ATHLETE SEARCH (Local Index)
          const matches = ATHLETE_DB.filter(a => 
              a.name.toLowerCase().includes(query.toLowerCase()) || 
              a.team.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5);
          setResults(matches);
          setShowDropdown(true);
          setLoading(false);
      } else {
          // GAMING SEARCH (Supabase)
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
  }, [query, isSports]);

  // Click Outside
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
      if (isSports) {
          router.push(item.url);
      } else {
          router.push(`/gaming/build/${item.id}`);
      }
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
            
            {/* Context Badge */}
            <div className="hidden md:flex items-center gap-2 text-black dark:text-white mr-4">
                {isSports ? <Trophy size={18} className="text-acid"/> : <LayoutGrid size={18} className="text-acid"/>}
                <span className="font-black text-xl tracking-tighter uppercase hidden lg:block">{isSports ? 'ATHLETICS' : 'GAMING'}</span>
            </div>

            {/* INPUT */}
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
                  placeholder={isSports ? "SEARCH GLOBAL ATHLETE DATABASE..." : "SEARCH GAMING ARCHIVES..."}
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-black dark:focus:border-zinc-600 px-10 py-2 font-mono text-xs font-bold uppercase outline-none text-black dark:text-white transition-all placeholder:text-zinc-400"
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
                            onClick={() => handleSelect(item)}
                            className="flex items-center gap-3 p-3 hover:bg-acid dark:hover:bg-acid cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0 group transition-colors"
                        >
                            <div className={`h-8 w-8 border border-zinc-300 dark:border-zinc-700 ${isSports ? 'rounded-full' : ''} bg-white dark:bg-zinc-950 p-0.5 shrink-0 flex items-center justify-center overflow-hidden`}>
                                {isSports ? (
                                    <User size={16} className="text-zinc-400"/>
                                ) : (
                                    <img src={`${CDN_URL}${item.image_name}`} className="w-full h-full object-contain" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-black text-xs uppercase truncate text-black dark:text-zinc-200 group-hover:text-black">{item.name}</div>
                                <div className="text-[9px] font-mono text-zinc-500 uppercase group-hover:text-black/70">
                                    {isSports ? (
                                        <span className="flex items-center gap-1">
                                            <span className={`px-1 text-white font-bold ${item.sport === 'F1' ? 'bg-red-600' : item.sport === 'NBA' ? 'bg-orange-500' : 'bg-blue-600'}`}>{item.sport}</span>
                                            {item.team}
                                        </span>
                                    ) : item.category}
                                </div>
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
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-acid text-zinc-400 dark:text-zinc-500 transition-colors">
                <LayoutGrid size={14} /> MAIN HUB
            </Link>
            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-2"></div>
            <Link href="/gaming" className={`text-[10px] font-black uppercase tracking-widest hover:text-acid transition-colors ${!isSports ? 'text-black dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>GAMING</Link>
            <Link href="/sports" className={`text-[10px] font-black uppercase tracking-widest hover:text-acid transition-colors ${isSports ? 'text-black dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>SPORTS</Link>
        </nav>
      </div>
    </header>
  );
}