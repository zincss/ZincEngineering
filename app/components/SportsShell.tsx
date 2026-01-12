'use client';

import React from 'react';
import { useSportsMode } from '@/app/context/SportsModeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Wallet, Activity, User, Target } from 'lucide-react';

export default function SportsShell({ children }: { children: React.ReactNode }) {
    const { isSportsMode } = useSportsMode();
    const pathname = usePathname();

    if (!isSportsMode) return <>{children}</>;

    const navItems = [
        { icon: Activity, label: 'Live', href: '/sports/match-center' },
        { icon: Trophy, label: 'Sports', href: '/sports' },
        { icon: Target, label: 'Wagers', href: '/sports/wagers' },
        { icon: User, label: 'Profile', href: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-blue-50 pb-24">
            
            {/* Main Content Area */}
            <main className="pt-24 px-4 max-w-md mx-auto md:max-w-4xl animate-in fade-in duration-500">
                {children}
            </main>

            {/* Bottom Navigation Bar (App Dock) */}
            <nav className="fixed bottom-6 left-6 right-6 h-16 bg-[#0f172a]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex justify-around items-center px-2 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`
                                flex flex-col items-center justify-center gap-1 w-16 h-full relative group
                                ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}
                            `}
                        >
                            {isActive && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-b-full shadow-[0_0_15px_#38bdf8]" />
                            )}
                            <item.icon size={20} className={`transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : ''}`} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
