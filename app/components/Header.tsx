'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Circle, Menu, X, FolderOpen, Coins,
  LogIn, LogOut, Shield, Gamepad2, Package, Activity,
  ChevronDown, ChevronRight, Orbit, User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import Wallet from './Wallet';

const NAV_CONFIG = [
  {
    id: 'astro', label: 'ASTRO', href: '/collections/astro', icon: <Orbit size={14} />,
    subItems: [
        { label: 'Overview', href: '/collections/astro' },
        { label: 'Weather Station', href: '/collections/weather' },
        { label: 'Planetarium', href: '/collections/planetarium' },
    ]
  },
  {
    id: 'play', label: 'PLAY', href: '/play', icon: <Gamepad2 size={14} />,
    subItems: [
        { label: 'Cyphers', href: '/play/cyphers' },
        { label: 'Hotseat', href: '/play/hotseat' },
        { label: 'Poker', href: '/play/poker' },
        { label: 'Blackjack', href: '/play/blackjack' },
        { label: 'Roulette', href: '/play/roulette' },
        { label: 'Trivia Matrix', href: '/collections/trivia' },
    ]
  },
  { id: 'market', label: 'MARKET', href: '/market', icon: <Package size={14} />, subItems: [] },
  {
    id: 'archive', label: 'ARCHIVE', href: '/collections', icon: <FolderOpen size={14} />,
    subItems: [
       { label: 'The Library', href: '/collections/library' },
       { label: 'Gaming DB', href: '/gaming' },
       { label: 'Automotive', href: '/automotive' },
       { label: 'Recipes', href: '/collections/recipes' },
       { label: 'Zinc Search', href: '/collections/search' },
       { label: 'Tier Lists', href: '/collections/tier-list' },
       { label: 'Golf Cards', href: '/collections/golf' },
    ]
  },
  {
    id: 'sports', label: 'SPORTS', href: '/sports', icon: <Trophy size={14} />,
    subItems: [
       { label: 'The Breakdown', href: '/sports/breakdown' },
       { label: 'NFL Hub', href: '/sports/nfl' },
       { label: 'NBA Hub', href: '/sports/nba' },
       { label: 'Formula 1', href: '/sports/f1' },
       { label: 'NRL Matrix', href: '/sports/nrl' },
       { label: 'PGA Golf', href: '/sports/golf' },
    ]
  }
];

export default function Header() {
  const pathname = usePathname();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const getActiveState = (id: string) => {
      switch(id) {
          case 'astro': return pathname?.includes('/astro') || pathname?.includes('/weather') || pathname?.includes('/planetarium');
          case 'play': return pathname?.startsWith('/play') || pathname?.includes('/trivia');
          case 'market': return pathname?.startsWith('/market');
          case 'archive': return (pathname?.startsWith('/collections') && !pathname?.includes('/astro') && !pathname?.includes('/weather') && !pathname?.includes('/planetarium') && !pathname?.includes('/trivia')) || pathname?.startsWith('/gaming') || pathname?.startsWith('/automotive');
          case 'sports': return pathname?.startsWith('/sports');
          default: return false;
      }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsVisible(true);
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (isMobileMenuOpen) { setIsVisible(true); return; }
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) { setIsVisible(true); lastScrollY = 0; return; }
      const isScrollingDown = currentScrollY > lastScrollY;
      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        setIsVisible(!(isScrollingDown && currentScrollY > 80));
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  if (pathname === '/play/poker' || pathname === '/collections/planetarium') return null;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 transition-all duration-500 transform ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between gap-8">
          
          {/* LEFT: BRANDING */}
          <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center gap-4 group">
                  <div className="relative w-12 h-12 flex items-center justify-center bg-[#DFFF00] rounded-2xl shadow-[0_0_30px_rgba(223,255,0,0.2)] group-hover:shadow-[0_0_50px_rgba(223,255,0,0.4)] group-hover:scale-105 transition-all duration-500 overflow-hidden">
                      <span className="font-black text-2xl text-black relative z-10">Z</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                  </div>
                  <div className="hidden md:flex flex-col">
                      <span className="font-black text-2xl leading-none text-white tracking-tighter italic uppercase group-hover:text-[#DFFF00] transition-colors">Zinc</span>
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                         <span className="font-mono text-[8px] font-black text-zinc-500 tracking-[0.4em] uppercase">Uplink_Active</span>
                      </div>
                  </div>
              </Link>

              <nav className="hidden xl:flex items-center gap-1">
                  {NAV_CONFIG.map((item) => (
                      <NavLink key={item.id} href={item.href} active={getActiveState(item.id)} icon={item.icon} subItems={item.subItems}>
                        {item.label}
                      </NavLink>
                  ))}
              </nav>
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="flex items-center gap-2 md:gap-6">
              {user && profile && (
                <div className="xl:hidden">
                  <Wallet />
                </div>
              )}

              <div className="hidden lg:flex items-center gap-8">
                  {user && profile ? (
                      <div className="flex items-center gap-6 animate-in fade-in duration-700">
                          <div className="hidden 2xl:flex flex-col items-end">
                             <span className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Status</span>
                             <span className="text-[10px] font-black text-[#DFFF00] uppercase tracking-tighter italic">Zinc_OS_v4.2</span>
                          </div>

                          <Wallet />
                          
                          <div className="flex items-center gap-5 pl-6 border-l border-white/10">
                              {isAdmin && (
                                <Link href="/admin" className="p-2.5 bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all relative">
                                  <Shield size={18} />
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /></span>
                                </Link>
                              )}

                              <Link href="/profile" className="flex flex-col items-end group">
                                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-[#DFFF00] transition-colors leading-none mb-1">Operator</span>
                                  <span className="text-sm font-black text-white uppercase tracking-tight italic">{profile.username}</span>
                              </Link>
                              
                              <button onClick={signOut} className="p-2.5 bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all border border-white/5">
                                <LogOut size={18} />
                              </button>
                          </div>
                      </div>
                  ) : (
                      <Link href="/login" className="px-8 py-3 bg-[#DFFF00] text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all flex items-center gap-3 italic">
                        <LogIn size={16} /> Login_Entry
                      </Link>
                  )}
              </div>

              <button className="xl:hidden p-3 bg-zinc-900 text-[#DFFF00] rounded-xl border border-white/5 shadow-lg active:scale-95 transition-all" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div 
                initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-0 z-[99] bg-zinc-950 flex flex-col p-6 pt-32 gap-4 overflow-y-auto"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                
                {NAV_CONFIG.map((item) => (
                    <MobileNavLink key={item.id} {...item} active={getActiveState(item.id)} onClick={() => setIsMobileMenuOpen(false)} />
                ))}
                
                <div className="mt-auto pt-8 border-t border-white/5 flex flex-col gap-4">
                    {user ? (
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Current User</span>
                                    <span className="text-xl font-black italic text-white uppercase tracking-tighter">{profile?.username}</span>
                                </div>
                                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-zinc-800 rounded-2xl text-[#DFFF00]"><UserIcon size={20}/></Link>
                            </div>
                            <button onClick={signOut} className="w-full py-4 bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl border border-red-500/20">Disconnect_Uplink</button>
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-5 bg-[#DFFF00] text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl text-center shadow-[0_0_30px_rgba(223,255,0,0.2)]">Login_Access</Link>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const NavLink = ({ href, active, icon, children, subItems }: any) => (
    <div className="relative group flex items-center h-20">
        <Link href={href} className={`flex items-center gap-3 px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-xl relative z-10 italic ${active ? 'text-black bg-[#DFFF00] shadow-[0_0_25px_rgba(223,255,0,0.2)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            {icon} {children}
        </Link>

        {subItems && subItems.length > 0 && (
            <div className="absolute top-full left-0 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 z-[110]">
                 <div className="pt-4 pb-2 px-2 bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl flex flex-col gap-1 ring-1 ring-white/5 mt-2">
                    {subItems.map((item: any) => (
                        <Link key={item.href} href={item.href} className="flex items-center justify-between px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-[#DFFF00]/10 rounded-xl transition-all group/item">
                            <span>{item.label}</span>
                            <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-[#DFFF00]" />
                        </Link>
                    ))}
                 </div>
            </div>
        )}
    </div>
);

const MobileNavLink = ({ href, icon, label, subItems, active, onClick }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="flex flex-col gap-2">
            <div className={`flex items-center justify-between p-1.5 rounded-2xl border transition-all ${active ? 'bg-[#DFFF00] border-[#DFFF00]' : 'bg-zinc-900/50 border-white/5'}`}>
                <Link href={href} onClick={onClick} className={`flex-1 py-3 px-4 font-black text-xs uppercase tracking-[0.2em] italic ${active ? 'text-black' : 'text-zinc-400'}`}>{label}</Link>
                {subItems?.length > 0 && (
                    <button onClick={() => setIsOpen(!isOpen)} className={`p-3 rounded-xl transition-colors ${active ? 'bg-black/10 text-black' : 'text-zinc-600 hover:bg-white/5'}`}>
                        <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={18} />
                    </button>
                )}
            </div>
            {isOpen && subItems?.length > 0 && (
                <div className="flex flex-col gap-1 pl-4 border-l border-zinc-800 ml-6 my-2">
                    {subItems.map((item: any) => (
                        <Link key={item.href} href={item.href} onClick={onClick} className="py-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-[#DFFF00] transition-colors">{item.label}</Link>
                    ))}
                </div>
            )}
        </div>
    );
};
