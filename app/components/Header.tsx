'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Trophy, 
  LayoutGrid, 
  Circle, 
  Menu, 
  X, 
  FolderOpen
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  
  // Route Detection
  const isHome = pathname === '/';
  const isSports = pathname?.startsWith('/sports');
  const isCollections = pathname?.startsWith('/collections') || pathname?.startsWith('/gaming') || pathname?.startsWith('/automotive');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
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