'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { 
    Wallet, TrendingUp, Activity, ArrowRight, 
    Trophy, Target, Zap, Clock, Coins, User
} from 'lucide-react';
import LivePulseHero from './LivePulseHero';
import NewsTicker from './NewsTicker';

export default function SportsDashboard() {
    const { profile } = useAuth();

    return (
        <div className="space-y-8 pb-24">
            
            {/* SECTION 1: HERO (Live Action) */}
            <section className="animate-in fade-in slide-in-from-top-4 duration-700">
                <LivePulseHero />
            </section>

            {/* SECTION 2: COMMAND ROW (Wallet & Quick Actions) */}
            <section className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                {/* Balance Card */}
                <div className="col-span-2 md:col-span-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 relative overflow-hidden text-white shadow-lg shadow-blue-500/20 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-8 -mt-8 group-hover:bg-white/20 transition-colors" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <Wallet size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Available Funds</span>
                        </div>
                        <div className="text-3xl font-black font-mono tracking-tighter mb-4">
                            {profile?.credits?.toLocaleString() || 0} <span className="text-sm opacity-60">CR</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <Link href="/market" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all">
                                Deposit
                            </Link>
                            <Link href="/sports/wagers" className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all">
                                History
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Nav Grid */}
                <div className="col-span-2 md:col-span-1 grid grid-cols-3 gap-3">
                    <Link href="/sports/nfl" className="bg-slate-900/50 border border-blue-500/10 hover:border-blue-500/40 hover:bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
                        <Zap size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400">NFL</span>
                    </Link>
                    <Link href="/sports/nba" className="bg-slate-900/50 border border-blue-500/10 hover:border-blue-500/40 hover:bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
                        <Trophy size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400">NBA</span>
                    </Link>
                    <Link href="/sports/golf" className="bg-slate-900/50 border border-blue-500/10 hover:border-blue-500/40 hover:bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
                        <Activity size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400">Golf</span>
                    </Link>
                </div>
            </section>

            {/* SECTION 3: THE FEED (News) */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <NewsTicker />
            </section>

            {/* SECTION 4: ACTIVE WAGERS TEASER */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Active Action</h3>
                </div>
                
                <Link href="/sports/wagers" className="block bg-slate-900/30 border border-white/5 p-1 rounded-[2rem] hover:bg-slate-900/50 transition-all group">
                    <div className="bg-[#020617] rounded-[1.8rem] p-6 border border-white/5 group-hover:border-blue-500/20 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <div className="text-lg font-black italic text-white uppercase tracking-tighter">Sportsbook</div>
                                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                                        View Live Lines & Slips
                                    </div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:border-blue-500 transition-all">
                                <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                        </div>
                    </div>
                </Link>
            </section>

        </div>
    );
}
