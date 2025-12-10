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
  Package 
} from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const { user, profile, signOut, isAdmin } = useAuth();
  
  // Route Detection
  const isWeather = pathname?.startsWith('/collections/weather');
  // Exclude weather from collections highlighting so they have distinct tabs
  const isCollections = (pathname?.startsWith('/collections') && !isWeather) || pathname?.startsWith('/gaming') || pathname?.startsWith('/automotive');
  
  // Exclude poker from "isPlay" highlighting if needed
  const isPlay = pathname?.startsWith('/play') && !pathname?.startsWith('/play/market') && !pathname?.startsWith('/play/poker');
  const isMarket = pathname?.startsWith('/play/market');
  const isSports = pathname?.startsWith('/sports');

  // SPECIAL CASE: HIDE HEADER ON POKER GAME
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 transition-all duration-300">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
          
          {/* LEFT: IDENTITY & NAV */}
          <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-4 group">
                  <div className="bg-[#DFFF00] w-10 h-10 flex items-center justify-center font-black text-xl text-black shadow-[0_0_25px_rgba(223,255,0,0.15)] group-hover:shadow-[0_0_35px_rgba(223,255,0,0.4)] transition-all duration-500 rounded-sm">
                      Z
                  </div>
                  <div className="hidden md:flex flex-col justify-center">
                      <span className="font-black text-xl leading-none text-white tracking-tighter group-hover:text-[#DFFF00] transition-colors">ZINC</span>
                      <span className="font-mono text-[9px] text-zinc-500 tracking-[0.35em] group-hover:text-zinc-400 transition-colors uppercase">Engineering</span>
                  </div>
              </Link>

              {/* DESKTOP NAV */}
              <nav className="hidden lg:flex items-center">
                  <NavLink href="/collections/weather" active={isWeather} icon={<CloudHail size={14} />}>WEATHER</NavLink>
                  <div className="w-px h-4 bg-zinc-800 mx-3"></div>
                  <NavLink href="/play" active={isPlay} icon={<Gamepad2 size={14} />}>PLAY</NavLink>
                  <div className="w-px h-4 bg-zinc-800 mx-3"></div>
                  <NavLink href="/play/market" active={isMarket} icon={<Package size={14} />}>MARKET</NavLink>
                  <div className="w-px h-4 bg-zinc-800 mx-3"></div>
                  <NavLink href="/collections" active={isCollections} icon={<FolderOpen size={14} />}>COLLECTIONS</NavLink>
                  <div className="w-px h-4 bg-zinc-800 mx-3"></div>
                  <NavLink href="/sports" active={isSports} icon={<Trophy size={14} />}>SPORTS</NavLink>
              </nav>
          </div>

          {/* RIGHT: USER STATS & MOBILE TOGGLE */}
          <div className="flex items-center gap-6">
              {/* AUTH & CURRENCY SECTION */}
              <div className="hidden lg:flex items-center gap-6">
                  {user && profile ? (
                      <div className="flex items-center gap-4 animate-in fade-in duration-500">
                          {/* Currency Display */}
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full shadow-inner">
                              <Coins size={14} className="text-[#DFFF00]" />
                              <span className="text-sm font-black text-white font-mono">{profile.credits.toLocaleString()}</span>
                          </div>
                          
                          {/* User Menu */}
                          <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                              
                              {isAdmin && (
                                <Link 
                                  href="/admin" 
                                  className="p-2 text-red-500 hover:text-white hover:bg-red-900/50 rounded-full transition-colors relative group"
                                  title="Admin Dashboard"
                                >
                                  <Shield size={16} />
                                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                  </span>
                                </Link>
                              )}

                              <Link href="/profile" className="text-right hidden md:block leading-tight group hover:opacity-80 transition-opacity cursor-pointer">
                                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-[#DFFF00]">Operator</div>
                                  <div className="text-xs font-black text-white uppercase tracking-tight">{profile.username}</div>
                              </Link>
                              
                              <button 
                                onClick={signOut} 
                                className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-900"
                                title="Sign Out"
                              >
                                <LogOut size={16} />
                              </button>
                          </div>
                      </div>
                  ) : (
                      /* LOGGED OUT STATE */
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                            <Circle size={6} className="fill-[#DFFF00] text-[#DFFF00] animate-pulse" />
                            <span>System Online</span>
                        </div>
                        <Link 
                            href="/login" 
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-white hover:bg-[#DFFF00] hover:text-black hover:border-[#DFFF00] transition-all rounded-sm"
                        >
                            <LogIn size={14} /> Login
                        </Link>
                      </div>
                  )}
              </div>

              {/* MOBILE MENU TOGGLE */}
              <button className="lg:hidden text-white hover:text-[#DFFF00] transition-colors z-50" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>

        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 top-0 pt-24 z-40 bg-black/95 backdrop-blur-xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 border-t border-zinc-800 overflow-y-auto">
              <MobileLink onClick={closeMenu} href="/collections/weather" active={isWeather} icon={<CloudHail size={18}/>} label="WEATHER" />
              <MobileLink onClick={closeMenu} href="/play" active={isPlay} icon={<Gamepad2 size={18}/>} label="PLAY" />
              <MobileLink onClick={closeMenu} href="/play/market" active={isMarket} icon={<Package size={18}/>} label="MARKET" />
              <MobileLink onClick={closeMenu} href="/collections" active={isCollections} icon={<FolderOpen size={18}/>} label="COLLECTIONS" />
              <MobileLink onClick={closeMenu} href="/sports" active={isSports} icon={<Trophy size={18}/>} label="SPORTS" />
              
              <div className="w-full h-px bg-zinc-800 my-2"></div>
              
              {user ? (
                 <>
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-sm border border-zinc-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Balance</span>
                            <div className="flex items-center gap-2 text-[#DFFF00]">
                                <Coins size={14} />
                                <span className="font-mono font-black">{profile?.credits?.toLocaleString() ?? 0}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Operator</span>
                            <div className="font-bold text-white">{profile?.username}</div>
                        </div>
                    </div>

                    <MobileLink onClick={closeMenu} href="/profile" active={pathname === '/profile'} icon={<UserIcon size={18}/>} label="MY PROFILE" />
                    {isAdmin && (
                        <MobileLink onClick={closeMenu} href="/admin" active={pathname === '/admin'} icon={<Shield size={18} className="text-red-500"/>} label="ADMIN CONSOLE" />
                    )}
                    <button onClick={() => { closeMenu(); signOut(); }} className="flex items-center gap-4 p-4 text-sm font-black uppercase tracking-widest border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-sm w-full">
                        <LogOut size={18} /> Logout
                    </button>
                 </>
              ) : (
                 <MobileLink onClick={closeMenu} href="/login" active={false} icon={<LogIn size={18}/>} label="LOGIN / REGISTER" />
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
            flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm
            ${active ? 'text-[#DFFF00] bg-[#DFFF00]/10 border border-[#DFFF00]/20' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}
        `}
    >
        {icon}
        {children}
    </Link>
);

const MobileLink = ({ href, active, icon, label, onClick }: any) => (
    <Link 
        href={href} 
        onClick={onClick}
        className={`
            flex items-center gap-4 p-4 text-sm font-black uppercase tracking-widest border transition-all rounded-sm
            ${active ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}
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