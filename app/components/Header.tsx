'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Trophy, Circle, Menu, X, FolderOpen, Coins,
  LogIn, LogOut, Shield, Gamepad2, Package, Activity,
  ChevronDown, ChevronRight, Orbit
} from 'lucide-react';
import Link from 'next/link';

// --- NAVIGATION CONFIGURATION ---
const NAV_CONFIG = [
  {
    id: 'astro',
    label: 'ASTRO',
    href: '/collections/astro', 
    icon: <Orbit size={14} />,
    subItems: [
        { label: 'Overview', href: '/collections/astro' },
        { label: 'Weather Station', href: '/collections/weather' },
        { label: 'Planetarium', href: '/collections/planetarium' },
    ]
  },
  {
    id: 'play',
    label: 'PLAY',
    href: '/play',
    icon: <Gamepad2 size={14} />,
    subItems: [
        { label: 'Cyphers', href: '/play/cyphers' },
        { label: 'Hotseat', href: '/play/hotseat' },
        { label: 'Poker', href: '/play/poker' },
        { label: 'Blackjack', href: '/play/blackjack' },
        { label: 'Roulette', href: '/play/roulette' },
        { label: 'Trivia Matrix', href: '/collections/trivia' },
    ]
  },
  {
    id: 'market',
    label: 'MARKET',
    href: '/market',
    icon: <Package size={14} />,
    subItems: [] 
  },
  {
    id: 'archive',
    label: 'ARCHIVE',
    href: '/collections',
    icon: <FolderOpen size={14} />,
    subItems: [
       { label: 'Gaming DB', href: '/gaming' },
       { label: 'Automotive', href: '/automotive' },
       { label: 'Recipes', href: '/collections/recipes' },
       { label: 'Zinc Search', href: '/collections/search' },
       { label: 'Tier Lists', href: '/collections/tier-list' },
       { label: 'Golf Cards', href: '/collections/golf' },
    ]
  },
  {
    id: 'sports',
    label: 'SPORTS',
    href: '/sports',
    icon: <Trophy size={14} />,
    subItems: [
       { label: 'The Breakdown', href: '/sports/breakdown' },
       { label: 'NFL', href: '/sports/nfl' },
       { label: 'NBA', href: '/sports/nba' },
       { label: 'Formula 1', href: '/sports/f1' },
       { label: 'NRL', href: '/sports/nrl' },
       { label: 'PGA Golf', href: '/sports/golf' },
    ]
  }
];

export default function Header() {
  const pathname = usePathname();
  const { user, profile, signOut, isAdmin } = useAuth();
  
  // Logic to determine active state
  const getActiveState = (id: string) => {
      switch(id) {
          case 'astro': return pathname?.startsWith('/collections/weather') || pathname?.startsWith('/collections/planetarium') || pathname?.startsWith('/collections/astro');
          case 'play': return pathname?.startsWith('/play') && !pathname?.startsWith('/play/poker');
          case 'market': return pathname?.startsWith('/market');
          case 'archive': return (pathname?.startsWith('/collections') && !pathname?.startsWith('/collections/weather') && !pathname?.startsWith('/collections/planetarium')) || pathname?.startsWith('/gaming') || pathname?.startsWith('/automotive');
          case 'sports': return pathname?.startsWith('/sports');
          default: return false;
      }
  };

  const isPoker = pathname === '/play/poker';
  // Also hide header on Planetarium for immersive view
  const isPlanetarium = pathname === '/collections/planetarium';
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsVisible(true);
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsVisible(true);
        return;
      }
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setIsVisible(true);
        lastScrollY = 0;
        return;
      }
      const isScrollingDown = currentScrollY > lastScrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);
      if (scrollDifference > 5) {
        setIsVisible(!(isScrollingDown && currentScrollY > 50));
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Return null if Poker OR Planetarium
  if (isPoker || isPlanetarium) return null;

  return (
    <>
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 
          bg-zinc-950/90 backdrop-blur-md border-b border-white/5 
          transition-transform duration-300 ease-in-out
          supports-[backdrop-filter]:bg-zinc-950/60
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          
          {/* LEFT: IDENTITY & NAV */}
          <div className="flex items-center gap-4 md:gap-10">
              <Link href="/" className="flex items-center gap-3 md:gap-4 group select-none">
                  <div className="relative bg-[#DFFF00] w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-lg md:text-xl text-black shadow-[0_0_15px_rgba(223,255,0,0.15)] md:shadow-[0_0_20px_rgba(223,255,0,0.2)] group-hover:shadow-[0_0_35px_rgba(223,255,0,0.5)] transition-all duration-500 rounded-lg md:rounded-xl group-hover:scale-105 group-active:scale-95">
                      Z
                      <div className="absolute inset-0 bg-white/20 rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="hidden md:flex flex-col justify-center">
                      <span className="font-black text-xl leading-none text-white tracking-tighter group-hover:text-[#DFFF00] transition-colors">ZINC</span>
                      <span className="font-mono text-[9px] text-zinc-500 tracking-[0.35em] group-hover:text-zinc-400 transition-colors uppercase">Engineering</span>
                  </div>
              </Link>

              <nav className="hidden xl:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-full border border-white/5">
                  {NAV_CONFIG.map((item) => (
                      <NavLink 
                        key={item.id}
                        href={item.href} 
                        active={getActiveState(item.id)} 
                        icon={item.icon}
                        subItems={item.subItems}
                      >
                        {item.label}
                      </NavLink>
                  ))}
              </nav>
          </div>

          {/* RIGHT: USER STATS & MOBILE TOGGLE */}
          <div className="flex items-center gap-4 md:gap-6">
              
              <div className="hidden lg:flex items-center gap-6">
                  {user && profile ? (
                      <div className="flex items-center gap-5 animate-in fade-in duration-500">
                          
                          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-white/5">
                             <Activity size={12} className="text-zinc-500" />
                             <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Sys.Normal</span>
                          </div>

                          <Link 
                            href="/profile?view=WALLET" 
                            className="group flex items-center gap-3 px-4 py-1.5 bg-black/40 border border-zinc-800 hover:border-[#DFFF00] transition-colors rounded-full shadow-inner cursor-pointer"
                            title="Open Wallet"
                          >
                              <Coins size={14} className="text-[#DFFF00] group-hover:rotate-12 transition-transform" />
                              <span className="text-sm font-black text-white font-mono tracking-tight">{profile.credits.toLocaleString()}</span>
                          </Link>
                          
                          <div className="flex items-center gap-4 pl-4 border-l border-zinc-800/50">
                              
                              {isAdmin && (
                                <Link 
                                  href="/admin" 
                                  className="p-2 text-red-500 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors relative group"
                                  title="Admin Dashboard"
                                >
                                  <Shield size={16} />
                                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                  </span>
                                </Link>
                              )}

                              <Link href="/profile" className="text-right hidden md:block leading-tight group hover:opacity-80 transition-opacity cursor-pointer">
                                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-[#DFFF00] transition-colors">Operator</div>
                                  <div className="text-xs font-black text-white uppercase tracking-tight">{profile.username}</div>
                              </Link>
                              
                              <button 
                                onClick={signOut} 
                                className="p-2 text-zinc-600 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                                title="Sign Out"
                              >
                                <LogOut size={16} />
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                            <Circle size={6} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                            <span>System Online</span>
                        </div>
                        <Link 
                            href="/login" 
                            className="group flex items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-[#DFFF00] text-black hover:bg-white transition-all rounded-md shadow-[0_0_15px_rgba(223,255,0,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                        >
                            <LogIn size={14} /> Login
                        </Link>
                      </div>
                  )}
              </div>

              <button 
                className="xl:hidden p-2 text-zinc-400 hover:text-[#DFFF00] hover:bg-zinc-900 rounded-lg transition-all z-50" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
          </div>

        </div>
      </header>

      {isMobileMenuOpen && (
          <div className="fixed inset-0 top-0 pt-20 z-[49] bg-zinc-950/95 backdrop-blur-xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 border-t border-zinc-800 overflow-y-auto">
              
              {NAV_CONFIG.map((item) => (
                  <MobileLink 
                    key={item.id}
                    onClick={closeMenu} 
                    href={item.href} 
                    active={getActiveState(item.id)} 
                    icon={React.cloneElement(item.icon, { size: 16 })} 
                    label={item.label}
                    subItems={item.subItems}
                  />
              ))}
              
              <div className="w-full h-px bg-zinc-800 my-2"></div>
              
              {user ? (
                 <>
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Balance</span>
                            <div className="flex items-center gap-2 text-[#DFFF00]">
                                <Coins size={14} />
                                <span className="font-mono font-black text-base">{profile?.credits?.toLocaleString() ?? 0}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Operator</span>
                            <div className="font-bold text-white text-base">{profile?.username}</div>
                        </div>
                    </div>

                    <MobileLink onClick={closeMenu} href="/profile" active={pathname === '/profile'} icon={<UserIcon size={16}/>} label="MY PROFILE" />
                    {isAdmin && (
                        <MobileLink onClick={closeMenu} href="/admin" active={pathname === '/admin'} icon={<Shield size={16} className="text-red-500"/>} label="ADMIN CONSOLE" />
                    )}
                    <button onClick={() => { closeMenu(); signOut(); }} className="flex items-center gap-3 p-4 text-xs font-black uppercase tracking-widest border border-zinc-800 bg-red-950/10 text-red-400 hover:text-white hover:bg-red-900/50 rounded-lg w-full transition-colors mt-2">
                        <LogOut size={16} /> Disconnect
                    </button>
                 </>
              ) : (
                 <MobileLink onClick={closeMenu} href="/login" active={false} icon={<LogIn size={16}/>} label="LOGIN / REGISTER" />
              )}
          </div>
      )}
    </>
  );
}

// --- DESKTOP NAV COMPONENT ---
const NavLink = ({ href, active, icon, children, subItems }: { href: string, active: boolean, icon: React.ReactNode, children: React.ReactNode, subItems?: any[] }) => (
    <div className="relative group">
        <Link 
            href={href} 
            className={`
                relative flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-full overflow-hidden
                ${active 
                    ? 'text-black bg-[#DFFF00] shadow-[0_0_20px_rgba(223,255,0,0.3)]' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }
            `}
        >
            <span className="relative z-10 flex items-center gap-2">
                {icon}
                {children}
            </span>
        </Link>

        {/* Desktop Dropdown */}
        {subItems && subItems.length > 0 && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 pointer-events-none group-hover:pointer-events-auto">
                 <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-xl p-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col gap-1 ring-1 ring-white/5">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[5px] w-2 h-2 bg-zinc-800 rotate-45 border-t border-l border-zinc-700"></div>
                    
                    {subItems.map((item: any) => (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className="flex items-center justify-between px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group/item"
                        >
                            <span>{item.label}</span>
                            <ChevronRight size={12} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-[#DFFF00]" />
                        </Link>
                    ))}
                 </div>
            </div>
        )}
    </div>
);

// --- MOBILE NAV COMPONENT ---
const MobileLink = ({ href, active, icon, label, onClick, subItems }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    
    if (!subItems || subItems.length === 0) {
        return (
            <Link 
                href={href} 
                onClick={onClick}
                className={`
                    flex items-center gap-3 p-3 text-xs font-black uppercase tracking-widest border transition-all rounded-xl
                    ${active 
                        ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_20px_rgba(223,255,0,0.2)]' 
                        : 'bg-zinc-900/30 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }
                `}
            >
                {icon}
                {label}
            </Link>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className={`
                flex items-center gap-2 text-xs font-black uppercase tracking-widest border transition-all rounded-xl p-0.5
                ${active 
                    ? 'bg-[#DFFF00] border-[#DFFF00]' 
                    : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                }
            `}>
                 <Link 
                    href={href} 
                    onClick={onClick} 
                    className={`flex-1 flex items-center gap-3 p-2.5 pl-3 rounded-lg ${active ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
                 >
                     {icon}
                     {label}
                 </Link>
                 
                 <button 
                    onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
                    className={`p-2.5 rounded-lg transition-colors ${active ? 'text-black hover:bg-black/10' : 'text-zinc-500 hover:bg-white/10 hover:text-white'}`}
                 >
                     <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                 </button>
            </div>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden flex flex-col gap-2 pl-4 border-l-2 border-zinc-800 ml-4">
                    {subItems.map((item: any) => (
                        <Link 
                            key={item.href}
                            href={item.href}
                            onClick={onClick}
                            className="flex items-center gap-2 py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-[#DFFF00] hover:bg-zinc-900/50 rounded-lg transition-colors"
                        >
                            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

const UserIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);