'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Zap, ArrowRight, ExternalLink, MoreHorizontal, TrendingUp, BookOpen, Cpu, Terminal, ChevronDown, Activity, Calendar, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ZincReaderOverlay from './ZincReaderOverlay';

// --- 1. INTERNAL DATABASE ---
const INTERNAL_DB = [
  {
    id: 'zinc-weather',
    url: '/collections/weather',
    displayUrl: 'zinc.network/collections/weather',
    title: 'Atmospheric Scanner [S.O.S. Module]',
    desc: 'Advanced weather tracking systems linked to global satellites. Internal Module.',
    tags: ['INTERNAL', 'UTILITY'],
    type: 'internal'
  },
  {
    id: 'zinc-market',
    url: '/play/market',
    displayUrl: 'zinc.network/market',
    title: 'Black Market // Underground Exchange',
    desc: 'Trade serialized assets, commodities, and rare items in the Zinc Economy.',
    tags: ['INTERNAL', 'ECONOMY'],
    type: 'internal'
  },
  {
    id: 'zinc-recipes',
    url: '/collections/recipes',
    displayUrl: 'zinc.network/collections/recipes',
    title: 'Culinary Database // Random Generator',
    desc: 'Access thousands of culinary schematics. Categories include: Breakfast, Lunch, Dinner, Treats & Bakes.',
    tags: ['INTERNAL', 'LIFESTYLE'],
    type: 'internal'
  }
];

// --- 2. SUGGESTIONS ---
const SUGGESTIONS_LIST = [
  "NFL Standings", "Formula 1 Racing", "Quantum Physics", 
  "Zinc Market", "Weather Scanner", "SpaceX", "Cyberpunk", "React (software)"
];

// --- 3. HELPER COMPONENTS ---
const ScrambleText = ({ text, loading }: { text: string; loading: boolean }) => {
  const [display, setDisplay] = useState(text);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        let scrambled = "";
        for (let i = 0; i < text.length; i++) {
          scrambled += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setDisplay(scrambled);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplay(text);
    }
  }, [loading, text]);

  return <span className="font-mono tracking-widest">{display}</span>;
};

// --- RESULT CARD COMPONENT ---
const ResultCard = ({ result, onOpenArticle }: { result: any, onOpenArticle: (res: any) => void }) => {
  // CHANGED: Set to true by default
  const [isExpanded, setIsExpanded] = useState(true);
  const relevance = useRef(Math.floor(Math.random() * (99 - 85) + 85)); 

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="group relative p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm transition-all duration-300 overflow-hidden hover:border-zinc-700"
    >
        {/* HEADER SECTION */}
        <div 
            onClick={() => onOpenArticle(result)}
            className="cursor-pointer relative z-10"
        >
            <div className="flex items-center gap-3 text-xs md:text-sm text-zinc-500 mb-3 group-hover:text-[#DFFF00] transition-colors font-mono">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${result.type === 'wiki' ? 'bg-zinc-800 text-zinc-400 group-hover:bg-[#DFFF00] group-hover:text-black' : 'bg-zinc-900 border border-[#DFFF00]/20 text-[#DFFF00]'}`}>
                    {result.type === 'wiki' ? <BookOpen size={14} /> : <span className="font-black text-xs">Z</span>}
                </div>
                <span className="truncate uppercase tracking-wider">{result.displayUrl}</span>
                <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>

            <h3 className="text-xl md:text-2xl text-zinc-100 font-bold decoration-zinc-500 group-hover:text-[#DFFF00] transition-colors mb-4">
                {result.title}
            </h3>
        </div>

        {/* INTERACTIVE TLDR MODULE */}
        <div className={`relative border-l-2 ${isExpanded ? 'border-[#DFFF00] bg-zinc-900/80' : 'border-zinc-700 bg-zinc-900/30'} rounded-r-lg transition-all duration-300`}>
            
            {/* Trigger */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Activity size={14} className={isExpanded ? "text-[#DFFF00]" : "text-zinc-500"} />
                    {/* CHANGED LABEL */}
                    <span className={`text-[10px] font-black font-mono uppercase tracking-widest ${isExpanded ? "text-[#DFFF00]" : "text-zinc-500"}`}>
                        /// TLDR: INTELLIGENCE REPORT
                    </span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#DFFF00]' : ''}`} 
                />
            </button>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0">
                            {/* THE FULL SUMMARY */}
                            <p className="text-zinc-300 text-sm leading-relaxed mb-4 border-b border-zinc-800 pb-4">
                                {result.tldr || result.desc}
                            </p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-[10px] text-zinc-600 font-mono uppercase mb-1">Relevance</div>
                                    <div className="text-[#DFFF00] font-bold text-xs flex items-center gap-1">
                                        <Zap size={10} /> {relevance.current}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-zinc-600 font-mono uppercase mb-1">Source</div>
                                    <div className="text-zinc-300 font-bold text-xs flex items-center gap-1">
                                        <Database size={10} /> VERIFIED
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-zinc-600 font-mono uppercase mb-1">Updated</div>
                                    <div className="text-zinc-300 font-bold text-xs flex items-center gap-1">
                                        <Calendar size={10} /> 24H
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onOpenArticle(result)}
                                className="w-full mt-4 py-2 bg-[#DFFF00]/10 border border-[#DFFF00]/50 text-[#DFFF00] text-xs font-mono uppercase hover:bg-[#DFFF00] hover:text-black transition-all rounded"
                            >
                                Open Full File
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Collapsed Preview */}
            {!isExpanded && (
                 <div 
                    onClick={() => setIsExpanded(true)}
                    className="px-4 pb-3 cursor-pointer"
                 >
                    <p className="text-zinc-500 text-xs line-clamp-1 italic">
                        "{result.tldr || result.desc}"
                    </p>
                 </div>
            )}
        </div>
    </motion.div>
  );
};


export default function ZincSearchInterface() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  // READER MODE STATE
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0 && !hasSearched) {
      const matches = SUGGESTIONS_LIST.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [query, hasSearched]);

  // --- SEARCH HANDLER ---
  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const searchTerm = overrideQuery || query;
    if (!searchTerm.trim()) return;

    if (overrideQuery) setQuery(overrideQuery);
    setShowSuggestions(false);
    setIsSearching(true);
    setHasSearched(true);
    setResults([]); 
    setActiveArticle(null);

    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerQ = searchTerm.toLowerCase();
    const internalMatches = INTERNAL_DB.filter(item => 
      item.title.toLowerCase().includes(lowerQ) || 
      item.desc.toLowerCase().includes(lowerQ) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQ))
    );

    try {
      // 1. INITIAL SEARCH
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*&srlimit=8`
      );
      const searchData = await searchResponse.json();
      const searchResults = searchData.query?.search || [];

      if (searchResults.length > 0) {
          // 2. FETCH FULL SENTENCES (High Quality Extract)
          const pageIds = searchResults.map((r: any) => r.pageid).join('|');
          const extractsResponse = await fetch(
              `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&pageids=${pageIds}&format=json&origin=*&exintro&explaintext&exsentences=3`
          );
          const extractsData = await extractsResponse.json();
          const pages = extractsData.query?.pages || {};

          // 3. MERGE
          const externalMatches = searchResults.map((item: any) => {
              const pageDetails = pages[item.pageid];
              const highQualitySummary = pageDetails?.extract 
                  ? pageDetails.extract 
                  : item.snippet.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

              return {
                id: item.pageid,
                url: `https://en.wikipedia.org/?curid=${item.pageid}`,
                displayUrl: 'wikipedia.org/wiki',
                title: item.title,
                tldr: highQualitySummary, 
                tags: ['DATABASE', 'ARCHIVE'],
                type: 'wiki'
              };
          });

          setResults([...internalMatches, ...externalMatches]);
      } else {
          setResults([...internalMatches]);
      }

    } catch (error) {
      setResults([...internalMatches]);
    } finally {
      setIsSearching(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // --- OPEN WIKI ARTICLE ---
  const openWikiArticle = async (result: any) => {
    if (result.type !== 'wiki') {
      window.location.href = result.url;
      return;
    }

    setIsLoadingArticle(true);
    try {
      const response = await fetch(
         `https://en.wikipedia.org/w/api.php?action=parse&pageid=${result.id}&format=json&origin=*&prop=text`
      );
      const data = await response.json();
      const rawHtml = data.parse.text['*'];
      
      const wordCount = rawHtml.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);

      setActiveArticle({
        title: result.title,
        content: rawHtml, 
        url: result.url,
        readTime: readTime
      });
      
      document.body.style.overflow = 'hidden';

    } catch (error) {
      console.error("Failed to load article stream", error);
      window.open(result.url, '_blank');
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const closeArticle = () => {
    setActiveArticle(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className={`
        relative z-10 w-full transition-all duration-700 ease-in-out
        ${hasSearched 
           ? 'min-h-screen bg-zinc-950/80 flex flex-col justify-start' 
           : 'h-screen flex flex-col items-center justify-center'
        }
    `}>
      
      <AnimatePresence>
        {activeArticle && (
          <ZincReaderOverlay 
            article={activeArticle} 
            onClose={closeArticle} 
          />
        )}
      </AnimatePresence>

      {/* --- SEARCH HEADER --- */}
      <motion.div 
         layout
         className={`
            w-full px-6 z-40 transition-all duration-700
            ${hasSearched 
                ? 'relative bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800 pb-6 pt-24 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]' 
                : 'max-w-3xl flex flex-col items-center relative'
            }
         `}
      >
        <div className={`flex flex-col md:flex-row items-center gap-6 ${hasSearched ? 'max-w-[1600px] mx-auto w-full justify-start' : 'w-full justify-center'}`}>
          {/* LOGO */}
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className={`flex items-center gap-2 font-black tracking-tighter text-white select-none cursor-pointer group ${hasSearched ? 'text-3xl mr-6' : 'text-6xl md:text-9xl mb-8'}`}
            onClick={() => { setHasSearched(false); setQuery(''); setResults([]); setIsSearching(false); setActiveArticle(null); }}
          >
             <span className="text-[#DFFF00] group-hover:animate-pulse shadow-[#DFFF00] drop-shadow-[0_0_15px_rgba(223,255,0,0.5)]">Z</span>
             <span className="group-hover:text-zinc-300 transition-colors">INC</span>
          </motion.div>

          {/* INPUT CONTAINER */}
          <motion.div 
            layout
            className={`relative group w-full transition-all duration-700 ${hasSearched ? 'max-w-xl' : 'max-w-2xl'}`} 
            ref={containerRef}
          >
             <form onSubmit={(e) => handleSearch(e)}>
                 <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                    {isSearching ? (
                        <Cpu className="text-[#DFFF00] animate-spin" size={20} />
                    ) : (
                        <Search className="text-zinc-500 group-focus-within:text-[#DFFF00] transition-colors" size={20} />
                    )}
                 </div>
                 
                 <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 bottom-0 left-0 w-2 bg-[#DFFF00]/20 blur-md animate-[ticker_3s_linear_infinite]" />
                 </div>

                 <input
                   ref={inputRef}
                   type="text"
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder={hasSearched ? "" : "ACCESS GLOBAL ARCHIVE..."}
                   className={`
                      w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder:text-zinc-600
                      focus:outline-none focus:bg-black focus:border-[#DFFF00] focus:shadow-[0_0_30px_rgba(223,255,0,0.15)]
                      transition-all duration-300 rounded-2xl font-mono uppercase tracking-wider relative z-10
                      ${hasSearched ? 'h-12 pl-12 pr-4 text-sm' : 'h-16 md:h-20 pl-14 pr-6 text-lg md:text-xl shadow-2xl'}
                   `}
                 />
                 
                 <div className="absolute inset-y-0 right-4 flex items-center gap-3 z-20">
                    {query.length > 0 && !isSearching && (
                       <button type="submit" className="p-2 bg-[#DFFF00] rounded-full text-black hover:scale-110 transition-transform shadow-[0_0_15px_#DFFF00]">
                          <ArrowRight size={hasSearched ? 16 : 20} strokeWidth={3} />
                       </button>
                    )}
                 </div>
             </form>

             {/* SUGGESTIONS */}
             <AnimatePresence>
               {showSuggestions && !hasSearched && (
                 <motion.div 
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    className="absolute top-full left-0 w-full mt-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-50"
                 >
                    {filteredSuggestions.map((suggestion, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSearch(undefined, suggestion)}
                        className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-zinc-800 hover:pl-8 hover:text-[#DFFF00] text-zinc-400 font-mono text-sm transition-all border-b border-zinc-800/50 last:border-0"
                      >
                         <Terminal size={14} />
                         <span>{suggestion}</span>
                      </motion.div>
                    ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        </div>

        {/* HERO BUTTONS */}
        <AnimatePresence>
        {!hasSearched && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 20 }}
             transition={{ delay: 0.2 }}
             className="flex flex-wrap justify-center gap-4 mt-8"
           >
              <button 
                onClick={(e) => handleSearch(e)}
                className="px-8 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs hover:border-[#DFFF00] hover:text-white hover:shadow-[0_0_20px_rgba(223,255,0,0.2)] transition-all duration-300 uppercase tracking-widest"
              >
                Initiate Search
              </button>
              <button 
                 onClick={() => window.location.href = 'https://www.google.com'}
                 className="px-8 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs hover:border-[#DFFF00] hover:text-white hover:shadow-[0_0_20px_rgba(223,255,0,0.2)] transition-all duration-300 uppercase tracking-widest"
              >
                Feeling Lucky
              </button>
           </motion.div>
        )}
        </AnimatePresence>
      </motion.div>

      {/* --- RESULTS GRID --- */}
      {hasSearched && (
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-8 md:grid md:grid-cols-12 gap-10">
           
           {/* LEFT SIDEBAR (Sources) */}
           <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block md:col-span-3 lg:col-span-2 space-y-6"
           >
              <div className="space-y-2 sticky top-40">
                 <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs font-bold uppercase mb-6 tracking-widest">
                    <Globe size={12} /> Data Streams
                 </div>
                 {['Global Web', 'Internal', 'Images', 'Intel'].map((item, i) => (
                    <div key={i} className={`cursor-pointer px-4 py-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 ${i === 0 ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
                       {item}
                    </div>
                 ))}
              </div>
           </motion.div>

           {/* MAIN RESULTS FEED */}
           <div className="md:col-span-9 lg:col-span-8 space-y-6 pb-20">
              
              {/* META INFO */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-8 flex items-center gap-3 text-xs font-mono text-zinc-500 mb-8 border-b border-zinc-800 pb-4"
              >
                 {isSearching || isLoadingArticle ? (
                    <>
                       <Terminal size={14} className="text-[#DFFF00] animate-pulse" />
                       <ScrambleText text={isLoadingArticle ? "DOWNLOADING PROTOCOL..." : "ESTABLISHING SECURE CONNECTION..."} loading={true} />
                    </>
                 ) : (
                    <>
                       <Zap size={14} className="text-[#DFFF00]" />
                       <span className="text-[#DFFF00]">
                          <ScrambleText text={`${results.length} PROTOCOLS FOUND`} loading={false} />
                       </span>
                    </>
                 )}
              </motion.div>

              {/* RENDER RESULTS */}
              <AnimatePresence mode="wait">
              {!isSearching && results.map((result, i) => (
                 <ResultCard 
                    key={result.id} 
                    result={result} 
                    onOpenArticle={openWikiArticle} 
                 />
              ))}
              </AnimatePresence>

              {/* EMPTY STATE */}
              {!isSearching && results.length === 0 && (
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-12 border border-zinc-800 rounded-3xl bg-zinc-900/30 text-center flex flex-col items-center"
                 >
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                        <Search className="text-zinc-600" size={32} />
                    </div>
                    <p className="text-zinc-400 mb-6 font-mono">Archive search yielded no results for <span className="text-white">"{query}"</span>.</p>
                    <a 
                       href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                       className="inline-flex items-center gap-3 px-8 py-4 bg-[#DFFF00] text-black font-black text-sm uppercase tracking-widest rounded-full hover:scale-105 hover:shadow-[0_0_30px_#DFFF00] transition-all duration-300"
                    >
                       <Globe size={18} />
                       <span>Engage Google Search</span>
                    </a>
                 </motion.div>
              )}
              
           </div>
        </div>
      )}

    </div>
  );
}