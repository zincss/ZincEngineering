'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Loader2, Filter, Database, ChevronRight, Shield, Zap, Sword, Crosshair } from 'lucide-react';
import Link from 'next/link';

const CDN_BASE = "https://cdn.warframestat.us/img/";

export default function DatabasePage() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name', { ascending: true });
      
      if (data) {
        setItems(data);
        setFilteredItems(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = items;
    if (activeCategory !== 'All') {
      if (activeCategory === 'Primary' || activeCategory === 'Secondary' || activeCategory === 'Melee') {
         result = result.filter(i => i.category === activeCategory || (i.category === 'Weapons' && i.type === activeCategory));
      } else {
         result = result.filter(i => i.category === activeCategory);
      }
    }
    if (search) {
      result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredItems(result);
  }, [search, activeCategory, items]);

  return (
    <div className="min-h-screen pb-20 px-6 max-w-[1600px] mx-auto pt-8">
      
      {/* HEADER SECTION */}
      <div className="mb-8 border-b-2 border-black dark:border-zinc-700 pb-6">
        <div className="flex items-center gap-2 text-acid mb-2">
            <Database size={14} />
            <span className="font-mono text-[10px] font-bold tracking-widest text-black dark:text-white">SYSTEM REGISTRY // V.2.0.4</span>
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-black dark:text-white">GLOBAL DATABASE</h1>
      </div>

      {/* CONTROLS TOOLBAR */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 sticky top-24 z-30">
        
        {/* SEARCH INPUT */}
        <div className="relative flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search size={16} />
            </div>
            <input 
                type="text" 
                placeholder="SEARCH REGISTRY..." 
                className="w-full h-10 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-10 pr-4 font-bold font-mono text-sm uppercase focus:outline-none focus:border-acid transition-colors text-black dark:text-white placeholder:text-zinc-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {['All', 'Warframes', 'Primary', 'Secondary', 'Melee'].map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`h-10 px-4 border-2 border-black dark:border-zinc-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 ${activeCategory === cat ? 'bg-black text-acid dark:bg-acid dark:text-black' : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                >
                    {cat === 'All' && <Filter size={12}/>}
                    {cat === 'Warframes' && <Shield size={12}/>}
                    {cat === 'Primary' && <Crosshair size={12}/>}
                    {cat === 'Secondary' && <Zap size={12}/>}
                    {cat === 'Melee' && <Sword size={12}/>}
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* RESULTS GRID */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-black dark:text-white"/></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.slice(0, 50).map((item) => (
                <Link key={item.id} href={`/build/${item.id}`} className="group">
                    <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 h-full hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all duration-200 flex flex-col">
                        
                        {/* IMAGE CONTAINER */}
                        <div className="relative h-32 border-b-2 border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-4 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(0deg,transparent_24%,rgba(0,0,0,.3)_25%,rgba(0,0,0,.3)_26%,transparent_27%,transparent_74%,rgba(0,0,0,.3)_75%,rgba(0,0,0,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,0,0,.3)_25%,rgba(0,0,0,.3)_26%,transparent_27%,transparent_74%,rgba(0,0,0,.3)_75%,rgba(0,0,0,.3)_76%,transparent_77%,transparent)] bg-[length:30px_30px]"></div>
                            
                            <img 
                                src={`${CDN_BASE}${item.image_name}`} 
                                alt={item.name}
                                className="h-full w-full object-contain z-10 mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                            />
                            
                            <div className="absolute top-2 left-2 bg-black text-white text-[8px] font-black px-1.5 py-0.5 uppercase">
                                {item.category === 'Warframes' ? 'FRAME' : item.category}
                            </div>
                            {item.name.includes('Prime') && (
                                <div className="absolute top-2 right-2 bg-acid text-black border border-black text-[8px] font-black px-1.5 py-0.5 uppercase">
                                    PRIME
                                </div>
                            )}
                        </div>

                        {/* TEXT CONTENT */}
                        <div className="p-3 flex flex-col justify-between flex-1">
                            <div>
                                <h3 className="font-black text-sm uppercase leading-tight mb-1 line-clamp-1 text-black dark:text-white">{item.name}</h3>
                                <div className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 font-bold flex items-center gap-2">
                                    {item.category === 'Warframes' ? (
                                        <span>MR {item.stats?.mastery || 0}</span>
                                    ) : (
                                        <>
                                            <span>CRIT: {(item.stats?.crit_chance * 100).toFixed(0)}%</span>
                                            <span className="text-zinc-300 dark:text-zinc-600">|</span>
                                            <span>STAT: {(item.stats?.proc_chance * 100).toFixed(0)}%</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between bg-black dark:bg-zinc-800 text-white py-1.5 px-3 text-[9px] font-bold tracking-widest uppercase hover:bg-acid hover:text-black transition-colors">
                                <span>CONFIGURE</span>
                                <ChevronRight size={10} />
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      )}
      
      {!loading && filteredItems.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 font-mono text-sm">
              NO RECORDS FOUND IN REGISTRY.
          </div>
      )}

    </div>
  );
}