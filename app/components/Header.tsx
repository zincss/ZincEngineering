'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useSportsMode } from '@/app/context/SportsModeContext';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { 
  Trophy, Gamepad2, Package, Activity,
  ChevronDown, ChevronRight, User as UserIcon,
  LogIn, LogOut, X, LayoutGrid, Zap, Terminal, Target,
  Wallet as WalletIcon
} from 'lucide-react';
import Link from 'next/link';
import Wallet from './Wallet';

// --- NAVIGATION CONFIGURATIONS ---

const STANDARD_NAV = [
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
    id: 'archive', label: 'ARCHIVE', href: '/collections', icon: <Terminal size={16} />,
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

const SPORTS_NAV = [
    { id: 'home', label: 'LIVE', href: '/sports/match-center', icon: <Activity size={16} />, subItems: [] },
    { id: 'nfl', label: 'NFL', href: '/sports/nfl', icon: <Zap size={16} />, subItems: [] },
    { id: 'nba', label: 'NBA', href: '/sports/nba', icon: <Trophy size={16} />, subItems: [] },
    { id: 'golf', label: 'GOLF', href: '/sports/golf', icon: <Target size={16} />, subItems: [] },
    { id: 'wagers', label: 'WAGERS', href: '/sports/wagers', icon: <WalletIcon size={16} />, subItems: [] },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, isAdmin } = useAuth();
  const { isSportsMode, toggleSportsMode } = useSportsMode();
  
  const [activeMenu, setActiveMenu] = useState<'NONE' | 'MOBILE' | 'WALLET' | 'BRAND'>('NONE');
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  // Navigation Logic
  const navItems = isSportsMode ? SPORTS_NAV : STANDARD_NAV;
  const brandColor = isSportsMode ? 'text-blue-400' : 'text-[#DFFF00]';
  const brandBg = isSportsMode ? 'bg-blue-500' : 'bg-[#DFFF00]';
  const brandShadow = isSportsMode ? 'shadow-blue-500/20' : 'shadow-[#DFFF00]/20';

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

  // Handle Mode Switch
  const handleModeSwitch = () => {
      toggleSportsMode();
      setActiveMenu('NONE');
      // Redirect to appropriate landing
      if (!isSportsMode) {
          router.push('/sports'); // Switching TO Sports
      } else {
          router.push('/'); // Switching TO Standard
      }
  };

  const isElevated = isAdmin || profile?.role === 'owner';
  const isOwner = profile?.role === 'owner';

  const getActiveState = (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname?.startsWith(href);
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
            
            {/* LEFT: BRAND SWITCHER */}
            <div className="flex items-center gap-8 md:gap-12 relative z-10">
                <div className="relative flex items-center gap-4">
                    {/* LOGO ICON - LINKS TO HOME */}
                    <Link 
                        href={isSportsMode ? '/sports' : '/'} 
                        className={`relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl shadow-lg transition-all duration-500 ${brandBg} ${brandShadow} hover:scale-110 hover:rotate-3`}
                    >
                        {isSportsMode ? (
                            // ZS Connected Logo
                            <div className="font-black text-xl text-black leading-none tracking-tighter flex">
                                <span>Z</span><span className="-ml-0.5">S</span>
                            </div>
                        ) : (
                            <span className="font-black text-xl md:text-2xl relative z-10 text-black">Z</span>
                        )}
                    </Link>

                    {/* TEXT - TOGGLES MENU */}
                    <button 
                        onClick={() => setActiveMenu(activeMenu === 'BRAND' ? 'NONE' : 'BRAND')}
                        className="hidden md:flex flex-col leading-none items-start group"
                    >
                        <div className="font-black text-2xl tracking-tighter uppercase text-white transition-colors flex items-center gap-1 group-hover:opacity-80">
                            {isSportsMode ? (
                                // ZINC SPORTS (Styled)
                                <>
                                    <span className="text-blue-400">Z</span>
                                    <span className="text-white">INC</span>
                                    <span className="ml-1 text-blue-400">S</span>
                                    <span className="text-white">PORTS</span>
                                </>
                            ) : (
                                // ZINC (Standard)
                                <>
                                    <span className="text-[#DFFF00]">Z</span>
                                    <span className="text-white">INC</span>
                                </>
                            )}
                            <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ml-1 ${activeMenu === 'BRAND' ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                           <div className={`w-1 h-1 rounded-full animate-pulse ${brandBg}`} />
                           <span className="font-mono text-[7px] font-black text-zinc-500 tracking-[0.4em] uppercase">
                               {isSportsMode ? 'Live Uplink' : 'Standard OS'}
                           </span>
                        </div>
                    </button>

                    <AnimatePresence>
                        {activeMenu === 'BRAND' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 mt-4 w-64 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 shadow-2xl z-50 flex flex-col gap-1"
                            >
                                <button onClick={() => { if(isSportsMode) handleModeSwitch(); }} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${!isSportsMode ? 'bg-zinc-900 border border-white/5 cursor-default' : 'hover:bg-zinc-900/50'}`}>
                                    <div className="w-8 h-8 rounded-xl bg-[#DFFF00] flex items-center justify-center text-black font-black">Z</div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-black text-white uppercase">Standard</span>
                                        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Original Exp</span>
                                    </div>
                                    {!isSportsMode && <div className="ml-auto w-2 h-2 rounded-full bg-[#DFFF00]" />}
                                </button>
                                <button onClick={() => { if(!isSportsMode) handleModeSwitch(); }} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isSportsMode ? 'bg-blue-900/20 border border-blue-500/20 cursor-default' : 'hover:bg-blue-900/10'}`}>
                                    <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-black font-black text-sm tracking-tighter">ZS</div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-black text-white uppercase">ZincSports</span>
                                        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Dedicated Hub</span>
                                    </div>
                                    {isSportsMode && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* DESKTOP NAV */}
                <nav className="hidden xl:flex items-center gap-1">
                    {navItems.map((item) => (
                        <NavLink key={item.id} {...item} active={getActiveState(item.href)} isSports={isSportsMode} />
                    ))}
                </nav>
            </div>

            {/* RIGHT: USER ACTIONS */}
            <div className="flex items-center gap-2 md:gap-4 relative z-10">
                {user && profile ? (
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden md:block">
                            <Wallet />
                        </div>
                        
                        <div className="flex items-center gap-2 md:gap-3 ml-2">
                            <Link href="/profile" className="flex items-center gap-3 p-1.5 md:p-2 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/20 transition-all group">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors relative overflow-hidden">
                                    <UserIcon size={18} />
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
                    <Link href="/login" className={`relative group px-6 md:px-8 py-3 ${brandBg} text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all flex items-center gap-3 overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <LogIn size={16} className="relative z-10" /> 
                        <span className="relative z-10 italic uppercase">Sign In</span>
                    </Link>
                )}

                <button 
                    className={`p-3 md:p-4 rounded-2xl border transition-all active:scale-90 ${activeMenu !== 'NONE' && activeMenu !== 'BRAND' ? `${brandBg} text-black border-transparent` : `bg-zinc-900 ${brandColor} border-white/5`}`}
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
        {activeMenu === 'MOBILE' && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99] bg-black/95 backdrop-blur-3xl flex flex-col pt-24 overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                
                <div className="flex-1 overflow-y-auto px-6 pb-40">
                    <div className="max-w-2xl mx-auto w-full space-y-6">
                        <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-white/5">
                            <button onClick={() => setActiveMenu('MOBILE')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMenu === 'MOBILE' ? `${brandBg} text-black shadow-lg` : 'text-zinc-500'}`}>Navigation</button>
                            {user && <button onClick={() => setActiveMenu('WALLET')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMenu === 'WALLET' ? `${brandBg} text-black shadow-lg` : 'text-zinc-500'}`}>Wallet</button>}
                        </div>

                        <div className="space-y-2 pb-8">
                            {navItems.map((item) => (
                                <MobileNavLink key={item.id} {...item} active={getActiveState(item.href)} isSports={isSportsMode} onClick={() => setActiveMenu('NONE')} />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
        {activeMenu === 'WALLET' && (
             <motion.div key="wallet" className="fixed inset-0 z-[99] bg-black/95 pt-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="h-full overflow-y-auto px-6">
                    <Wallet isMobile={true} onClose={() => setActiveMenu('NONE')} />
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const NavLink = ({ href, active, icon, label, subItems, isSports }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const activeClass = isSports ? 'bg-blue-500 text-black shadow-blue-500/20' : 'bg-[#DFFF00] text-black shadow-[#DFFF00]/20';
    const textClass = isSports ? 'group-hover/item:text-blue-400' : 'group-hover/item:text-[#DFFF00]';

    return (
        <div className="relative group flex items-center h-16" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Link href={href} className={`flex items-center gap-3 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-xl relative z-10 italic ${active ? `${activeClass} shadow-lg` : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                {icon} {label}
            </Link>

            <AnimatePresence>
                {isHovered && subItems && subItems.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-[calc(100%-8px)] left-0 w-72 pt-4 z-[110]">
                        <div className="p-2 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col gap-1 ring-1 ring-white/5">
                            {subItems.map((item: any) => (
                                <Link key={item.href} href={item.href} className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all hover:bg-white/5 group/item">
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black uppercase tracking-widest text-white ${textClass} transition-colors`}>{item.label}</span>
                                        <span className="text-[8px] font-mono text-zinc-600 uppercase mt-0.5">{item.desc}</span>
                                    </div>
                                    <ChevronRight size={14} className={`opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-white`} />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MobileNavLink = ({ href, icon, label, subItems, active, onClick, isSports }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const activeClass = isSports ? 'bg-blue-500 border-blue-500' : 'bg-[#DFFF00] border-[#DFFF00]';
    
    return (
        <div className="flex flex-col gap-1">
            <div className={`flex items-center justify-between rounded-2xl border transition-all duration-300 ${active ? activeClass : 'bg-zinc-900/50 border-white/5'}`}>
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
                                className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 last:border-0 hover:text-white transition-colors flex justify-between items-center group"
                            >
                                <span>{item.label}</span>
                                <ChevronRight size={12} className="text-zinc-800 group-hover:text-white transition-colors" />
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};