'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { 
  Trophy, Circle, Menu, X, FolderOpen, Coins,
  LogIn, LogOut, Shield, Gamepad2, Package, Activity,
  ChevronDown, ChevronRight, Orbit, User as UserIcon,
  Search, Bell, Terminal, Command, LayoutGrid, Zap, Wallet as WalletIcon
} from 'lucide-react';
import Link from 'next/link';
import Wallet from './Wallet';

const NAV_CONFIG = [
  {
    id: 'latest', label: 'LATEST', href: '/collections/astro', icon: <Zap size={16} />,
    subItems: [
        { label: 'Astro Hub', href: '/collections/astro', desc: 'Space & Astronomy' },
        { label: 'Weather', href: '/collections/weather', desc: 'Local Forecasts' },
        { label: 'Planetarium', href: '/collections/planetarium', desc: 'Solar System Map' },
    ]
  },
  {
    id: 'play', label: 'PLAY', href: '/play', icon: <Gamepad2 size={16} />,
    subItems: [
        { label: 'Cyphers', href: '/play/cyphers', desc: 'Daily Puzzles' },
        { label: 'Hotseat', href: '/play/hotseat', desc: 'Trivia Challenge' },
        { label: 'Poker', href: '/play/poker', desc: 'Texas Hold\'em' },
        { label: 'Arcade', href: '/play', desc: 'All Games' },
    ]
  },
  { id: 'market', label: 'MARKET', href: '/market', icon: <Package size={16} />, subItems: [] },
  {
    id: 'archive', label: 'ARCHIVE', href: '/collections', icon: <FolderOpen size={16} />,
    subItems: [
       { label: 'Gem Finder', href: '/collections/gem-finder', desc: 'Steam Discoveries' },
       { label: 'Automotive', href: '/automotive', desc: 'Vehicle Database' },
       { label: 'Tier Lists', href: '/collections/tier-list', desc: 'Rankings' },
       { label: 'The Library', href: '/collections/library', desc: 'Knowledge Base' },
    ]
  },
  {
    id: 'sports', label: 'SPORTS', href: '/sports', icon: <Trophy size={16} />,
    subItems: [
       { label: 'Match Center', href: '/sports/match-center', desc: 'Live Scores' },
       { label: 'PGA Golf', href: '/sports/golf', desc: 'Tour Updates' },
       { label: 'NBA Hub', href: '/sports/nba', desc: 'Basketball' },
       { label: 'NFL Hub', href: '/sports/nfl', desc: 'Football' },
    ]
  }
];

export default function Header() {
  const pathname = usePathname();
  const { user, profile, signOut, isAdmin, refreshProfile } = useAuth();
  const [activeMenu, setActiveMenu] = useState<'NONE' | 'MOBILE' | 'WALLET'>('NONE');
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (activeMenu !== 'NONE') {
      setHidden(false);
      return;
    }
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 20);
  });

  // Body Scroll Lock
  useEffect(() => {
    if (activeMenu !== 'NONE') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeMenu]);

  const isElevated = isAdmin || profile?.role === 'owner';
  const isOwner = profile?.role === 'owner';

  const getActiveState = (id: string) => {
      switch(id) {
          case 'latest': return pathname?.includes('/astro') || pathname?.includes('/weather') || pathname?.includes('/planetarium');
          case 'play': return pathname?.startsWith('/play') || pathname?.includes('/trivia');
          case 'market': return pathname?.startsWith('/market');
          case 'archive': return (pathname?.startsWith('/collections') && !pathname?.includes('/astro') && !pathname?.includes('/weather') && !pathname?.includes('/planetarium') && !pathname?.includes('/trivia')) || pathname?.startsWith('/gaming') || pathname?.startsWith('/automotive');
          case 'sports': return pathname?.startsWith('/sports');
          default: return false;
      }
  };

  useEffect(() => {
    setActiveMenu('NONE');
  }, [pathname]);

  if (pathname === '/play/poker' || pathname === '/collections/planetarium') return null;

  return (
    <>
      <motion.header
        variants={{ visible: { y: 0 }, hidden: { y: -100 } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-3' : 'py-6'}`}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className={`relative flex items-center justify-between gap-4 p-2 md:p-3 rounded-[2rem] border transition-all duration-500 shadow-2xl ${isScrolled ? 'bg-black/60 backdrop-blur-2xl border-white/10' : 'bg-transparent border-transparent'} ${isElevated && isScrolled ? 'border-red-500/30 bg-red-950/10' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
            
            {/* LEFT: BRANDING */}
            <div className="flex items-center gap-8 md:gap-12 relative z-10">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className={`relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl shadow-lg transition-all duration-500 bg-[#DFFF00] shadow-[#DFFF00]/20 group-hover:scale-110 group-hover:rotate-3`}>
                        <span className={`font-black text-xl md:text-2xl relative z-10 text-black`}>Z</span>
                    </div>
                    <div className="hidden md:flex flex-col leading-none">
                        <span className="font-black text-2xl tracking-tighter uppercase text-white transition-colors">
                            <span className="text-[#DFFF00]">Z</span>inc
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                           <div className={`w-1 h-1 rounded-full animate-pulse bg-[#DFFF00]`} />
                           <span className="font-mono text-[7px] font-black text-zinc-500 tracking-[0.4em] uppercase">{isOwner ? 'Owner' : isElevated ? 'Administrator' : 'Active'}</span>
                        </div>
                    </div>
                </Link>

                <nav className="hidden xl:flex items-center gap-1">
                    {NAV_CONFIG.map((item) => (
                        <NavLink key={item.id} {...item} active={getActiveState(item.id)} />
                    ))}
                </nav>
            </div>

            {/* RIGHT: COMMAND CENTER */}
            <div className="flex items-center gap-2 md:gap-4 relative z-10">
                {user && profile ? (
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden md:block">
                            <Wallet />
                        </div>
                        
                        <div className="flex items-center gap-2 md:gap-3 ml-2">
                            <Link href="/profile" className="flex items-center gap-3 p-1.5 md:p-2 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-[#DFFF00]/50 transition-all group">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-500 group-hover:text-[#DFFF00] transition-colors relative overflow-hidden">
                                    <UserIcon size={18} />
                                    <div className="absolute inset-0 bg-[#DFFF00]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="hidden sm:flex flex-col pr-4 text-right">
                                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1 group-hover:text-zinc-400 uppercase">{profile.username}</span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter italic leading-none">Profile</span>
                                </div>
                            </Link>

                            <button onClick={signOut} className="hidden sm:block p-3 md:p-4 bg-zinc-950 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-white/5">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link href="/login" className="relative group px-6 md:px-8 py-3 bg-[#DFFF00] text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all flex items-center gap-3 overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <LogIn size={16} className="relative z-10" /> 
                        <span className="relative z-10 italic uppercase">Sign In</span>
                    </Link>
                )}

                <button 
                    className={`p-3 md:p-4 rounded-2xl border transition-all active:scale-90 ${activeMenu !== 'NONE' ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-[#DFFF00] border-white/5'}`}
                    onClick={() => setActiveMenu(activeMenu === 'MOBILE' ? 'NONE' : 'MOBILE')}
                >
                    {activeMenu === 'MOBILE' ? <X size={20} /> : <LayoutGrid size={20} />}
                </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* --- MOBILE OVERLAY --- */}
      <AnimatePresence mode="wait">
        {activeMenu !== 'NONE' && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99] bg-black/95 backdrop-blur-3xl flex flex-col pt-24 overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#DFFF00]/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex-1 overflow-y-auto px-6 pb-40">
                    <div className="max-w-2xl mx-auto w-full space-y-6">
                        
                        {/* MENU SWITCHER */}
                        <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-white/5">
                            <button onClick={() => setActiveMenu('MOBILE')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMenu === 'MOBILE' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500'}`}>Navigation</button>
                            {user && <button onClick={() => setActiveMenu('WALLET')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMenu === 'WALLET' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500'}`}>Wallet</button>}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeMenu === 'MOBILE' && (
                                <motion.div key="nav" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <Link href="/play" onClick={() => setActiveMenu('NONE')} className="p-4 bg-zinc-900/50 border border-white/5 rounded-[2rem] flex flex-col gap-3 group active:scale-95 transition-all">
                                            <div className="p-2 bg-zinc-950 rounded-xl w-fit text-[#DFFF00] border border-white/5 group-hover:bg-[#DFFF00] group-hover:text-black transition-colors"><Gamepad2 size={20} /></div>
                                            <span className="font-black text-lg italic tracking-tighter uppercase">Play</span>
                                        </Link>
                                        <Link href="/market" onClick={() => setActiveMenu('NONE')} className="p-4 bg-zinc-900/50 border border-white/5 rounded-[2rem] flex flex-col gap-3 group active:scale-95 transition-all">
                                            <div className="p-2 bg-zinc-950 rounded-xl w-fit text-[#DFFF00] border border-white/5 group-hover:bg-[#DFFF00] group-hover:text-black transition-colors"><Package size={20} /></div>
                                            <span className="font-black text-lg italic tracking-tighter uppercase">Market</span>
                                        </Link>
                                    </div>
                                    <div className="space-y-2 pb-8">
                                        {NAV_CONFIG.filter(n => n.id !== 'play' && n.id !== 'market').map((item) => (
                                            <MobileNavLink key={item.id} {...item} active={getActiveState(item.id)} onClick={() => setActiveMenu('NONE')} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeMenu === 'WALLET' && (
                                <motion.div key="wallet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <Wallet isMobile={true} onClose={() => setActiveMenu('NONE')} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                
                {/* COMPACT MOBILE FOOTER */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent pt-10 z-50">
                    <div className="max-w-lg mx-auto w-full">
                        {user ? (
                            <div className="bg-zinc-900/90 p-4 rounded-[2rem] border border-white/10 flex items-center justify-between backdrop-blur-xl shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#DFFF00] flex items-center justify-center text-black shadow-lg shadow-[#DFFF00]/20"><UserIcon size={20}/></div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-mono font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">{isElevated ? 'Admin' : 'Active'}</span>
                                        <span className="text-sm font-black italic text-white uppercase tracking-tight leading-none truncate max-w-[100px]">{profile?.username}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href="/profile" onClick={() => setActiveMenu('NONE')} className="px-4 py-2 bg-zinc-800 rounded-xl text-white text-[9px] font-black uppercase tracking-widest border border-white/5 active:scale-95 transition-all">Profile</Link>
                                    <button onClick={signOut} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 active:bg-red-500 active:text-white transition-all"><LogOut size={16}/></button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setActiveMenu('NONE')} className="w-full py-4 bg-[#DFFF00] text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl text-center shadow-[0_0_50px_rgba(223,255,0,0.3)] active:scale-95 transition-all">Sign In</Link>
                        )}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const NavLink = ({ href, active, icon, label, subItems }: any) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative group flex items-center h-16" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Link href={href} className={`flex items-center gap-3 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-xl relative z-10 italic ${active ? 'text-black bg-[#DFFF00] shadow-lg shadow-[#DFFF00]/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                {icon} {label}
            </Link>

            <AnimatePresence>
                {isHovered && subItems && subItems.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-[calc(100%-8px)] left-0 w-72 pt-4 z-[110]">
                        <div className="p-2 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col gap-1 ring-1 ring-white/5">
                            <div className="px-4 py-2 border-b border-white/5 mb-1 flex items-center justify-between">
                                <span className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-widest">Categories</span>
                                <Terminal size={10} className="text-zinc-700" />
                            </div>
                            {subItems.map((item: any) => (
                                <Link key={item.href} href={item.href} className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all hover:bg-[#DFFF00]/10 group/item">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover/item:text-[#DFFF00] transition-colors">{item.label}</span>
                                        <span className="text-[8px] font-mono text-zinc-600 uppercase mt-0.5">{item.desc}</span>
                                    </div>
                                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-[#DFFF00]" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MobileNavLink = ({ href, icon, label, subItems, active, onClick }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="flex flex-col gap-1">
            <div className={`flex items-center justify-between rounded-2xl border transition-all duration-300 ${active ? 'bg-[#DFFF00] border-[#DFFF00]' : 'bg-zinc-900/50 border-white/5'}`}>
                <Link 
                    href={href} 
                    onClick={onClick} 
                    className={`flex-1 py-3 px-4 font-black text-base uppercase tracking-tight italic flex items-center gap-3 ${active ? 'text-black' : 'text-zinc-400'}`}
                >
                    <span className={`p-2 rounded-xl transition-colors ${active ? 'bg-black/10 text-black' : 'bg-zinc-950 text-zinc-600'}`}>{icon}</span>
                    {label}
                </Link>
                {subItems?.length > 0 && (
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }} 
                        className={`p-4 rounded-r-2xl transition-all border-l ${active ? 'border-black/10 text-black' : 'border-white/5 text-zinc-600'}`}
                    >
                        <ChevronDown className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} size={20} />
                    </button>
                )}
            </div>
            <AnimatePresence>
                {isOpen && subItems?.length > 0 && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="flex flex-col gap-1 pl-4 pr-2 overflow-hidden bg-white/[0.02] rounded-2xl border border-white/5 mt-1"
                    >
                        {subItems.map((item: any) => (
                            <Link 
                                key={item.href} 
                                href={item.href} 
                                onClick={onClick} 
                                className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 last:border-0 hover:text-[#DFFF00] transition-colors flex justify-between items-center group"
                            >
                                <span>{item.label}</span>
                                <ChevronRight size={12} className="text-zinc-800 group-hover:text-[#DFFF00] transition-colors" />
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};