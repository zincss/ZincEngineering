'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Trophy, 
  CloudHail, 
  Circle, 
  Menu, 
  X, 
  FolderOpen,
  Coins,
  LogIn,
  LogOut,
  Shield,
  Gamepad2,
  Package,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const { user, profile, signOut, isAdmin } = useAuth();
  
  // Route Detection
  const isWeather = pathname?.startsWith('/collections/weather');
  const isCollections = (pathname?.startsWith('/collections') && !isWeather) || pathname?.startsWith('/gaming') || pathname?.startsWith('/automotive');
  
  // Play Routes
  const isPlay = pathname?.startsWith('/play') && !pathname?.startsWith('/play/market') && !pathname?.startsWith('/play/poker');
  const isMarket = pathname?.startsWith('/play/market');
  const isSports = pathname?.startsWith('/sports');

  // SPECIAL CASE: HIDE HEADER ON POKER GAME (Immersive Mode)
  const isPoker = pathname === '/play/poker';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  if (isPoker) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 transition-all duration-300 supports-[backdrop-filter]:bg-zinc-950/60">
        {/* CONTAINER: h-14 on mobile (56px), h-20 on desktop (80px) */}
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          
          {/* LEFT: IDENTITY & NAV */}
          <div className="flex items-center gap-4 md:gap-10">
              <Link href="/" className="flex items-center gap-3 md:gap-4 group select-none">
                  {/* LOGO BOX - Scaled for Mobile */}
                  <div className="relative bg-[#DFFF00] w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-lg md:text-xl text-black shadow-[0_0_15px_rgba(223,255,0,0.15)] md:shadow-[0_0_20px_rgba(223,255,0,0.2)] group-hover:shadow-[0_0_35px_rgba(223,255,0,0.5)] transition-all duration-500 rounded-lg md:rounded-xl group-hover:scale-105 group-active:scale-95">
                      Z
                      <div className="absolute inset-0 bg-white/20 rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {/* TEXT STACK - Hidden on Mobile to save space */}
                  <div className="hidden md:flex flex-col justify-center">
                      <span className="font-black text-xl leading-none text-white tracking-tighter group-hover:text-[#DFFF00] transition-colors">ZINC</span>
                      <span className="font-mono text-[9px] text-zinc-500 tracking-[0.35em] group-hover:text-zinc-400 transition-colors uppercase">Engineering</span>
                  </div>
              </Link>

              {/* DESKTOP NAV - TERMINAL STYLE */}
              <nav className="hidden xl:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-full border border-white/5">
                  <NavLink href="/collections/weather" active={isWeather} icon={<CloudHail size={14} />}>WEATHER</NavLink>
                  <NavLink href="/play" active={isPlay} icon={<Gamepad2 size={14} />}>PLAY</NavLink>
                  <NavLink href="/play/market" active={isMarket} icon={<Package size={14} />}>MARKET</NavLink>
                  <NavLink href="/collections" active={isCollections} icon={<FolderOpen size={14} />}>ARCHIVE</NavLink>
                  <NavLink href="/sports" active={isSports} icon={<Trophy size={14} />}>SPORTS</NavLink>
              </nav>
          </div>

          {/* RIGHT: USER STATS & MOBILE TOGGLE */}
          <div className="flex items-center gap-4 md:gap-6">
              
              {/* AUTH & CURRENCY SECTION (Desktop Only) */}
              <div className="hidden lg:flex items-center gap-6">
                  {user && profile ? (
                      <div className="flex items-center gap-5 animate-in fade-in duration-500">
                          
                          {/* SYSTEM STATUS INDICATOR */}
                          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-white/5">
                             <Activity size={12} className="text-zinc-500" />
                             <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Sys.Normal</span>
                          </div>

                          {/* Currency Pill - NOW LINKED TO WALLET */}
                          <Link 
                            href="/profile?view=WALLET" 
                            className="group flex items-center gap-3 px-4 py-1.5 bg-black/40 border border-zinc-800 hover:border-[#DFFF00] transition-colors rounded-full shadow-inner cursor-pointer"
                            title="Open Wallet"
                          >
                              <Coins size={14} className="text-[#DFFF00] group-hover:rotate-12 transition-transform" />
                              <span className="text-sm font-black text-white font-mono tracking-tight">{profile.credits.toLocaleString()}</span>
                          </Link>
                          
                          {/* User Menu */}
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
                      /* LOGGED OUT STATE */
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

              {/* MOBILE MENU TOGGLE */}
              <button 
                className="xl:hidden p-2 text-zinc-400 hover:text-[#DFFF00] hover:bg-zinc-900 rounded-lg transition-all z-50" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
          </div>

        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 top-0 pt-20 z-40 bg-zinc-950/95 backdrop-blur-xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 border-t border-zinc-800 overflow-y-auto">
              <MobileLink onClick={closeMenu} href="/collections/weather" active={isWeather} icon={<CloudHail size={16}/>} label="WEATHER" />
              <MobileLink onClick={closeMenu} href="/play" active={isPlay} icon={<Gamepad2 size={16}/>} label="PLAY" />
              <MobileLink onClick={closeMenu} href="/play/market" active={isMarket} icon={<Package size={16}/>} label="MARKET" />
              <MobileLink onClick={closeMenu} href="/collections" active={isCollections} icon={<FolderOpen size={16}/>} label="COLLECTIONS" />
              <MobileLink onClick={closeMenu} href="/sports" active={isSports} icon={<Trophy size={16}/>} label="SPORTS" />
              
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

// --- HELPER NAV COMPONENTS ---

const NavLink = ({ href, active, icon, children }: { href: string, active: boolean, icon: React.ReactNode, children: React.ReactNode }) => (
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
);

const MobileLink = ({ href, active, icon, label, onClick }: any) => (
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

const UserIcon = ({ size }: { size: number }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);