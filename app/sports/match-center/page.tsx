'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Trophy, Timer, ChevronRight, Filter, 
    RefreshCw, Globe, ArrowRight, Zap, Target
} from 'lucide-react';
import { getLiveMatchCenterData } from './actions';
import Link from 'next/link';

export default function MatchCenter() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'NBA' | 'NFL' | 'GOLF'>('ALL');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchData = async () => {
        const res = await getLiveMatchCenterData();
        setData(res);
        setLoading(false);
        setLastUpdated(new Date());
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const filteredMatches = data?.matches?.filter((m: any) => {
        if (filter === 'ALL') return true;
        return m.league.toUpperCase() === filter;
    }) || [];

    const showGolf = (filter === 'ALL' || filter === 'GOLF') && data?.golf;

    return (
        <main className="min-h-screen bg-zinc-950 text-white pb-32 pt-24 px-4 md:px-8 font-sans selection:bg-[#DFFF00] selection:text-black">
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
            
            <div className="max-w-[1600px] mx-auto relative z-10">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                            <Activity size={24} className="text-[#DFFF00]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                                <span>ZincSports // Live Feed</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
                                    <div className="w-1 h-1 rounded-full bg-[#DFFF00] animate-pulse" />
                                    <span className="text-[8px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest">Real-Time Telemetry</span>
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">
                                Match <span className="text-zinc-800">Center</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                            Last Sync: {lastUpdated.toLocaleTimeString()}
                        </div>
                        
                        <div className="flex gap-1 p-1 bg-zinc-900/50 border border-white/5 rounded-2xl w-full md:w-auto">
                            {['ALL', 'NBA', 'NFL', 'GOLF'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CONTENT GRID */}
                {loading && !data ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6">
                        <RefreshCw size={48} className="animate-spin text-[#DFFF00]" />
                        <span className="font-mono text-xs uppercase tracking-[0.4em] animate-pulse text-zinc-500">Establishing Secure Uplink...</span>
                    </div>
                ) : (
                    <div className="space-y-12">
                        
                        {/* GOLF SECTION */}
                        {showGolf && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] border border-white/5 shadow-xl"><Trophy size={18} /></div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight">PGA Tour // Live</h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                                </div>
                                <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] p-10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#DFFF00]/5 blur-[120px] rounded-full pointer-events-none -mr-32 -mt-32 transition-colors group-hover:bg-[#DFFF00]/10" />
                                    <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
                                        <div>
                                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-4">Live Tournament Analytics</div>
                                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">{data.golf.name}</h2>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase">
                                                    <Globe size={14} className="text-[#DFFF00]" /> {data.golf.venue}
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${data.golf.isLive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-white/5'}`}>
                                                    {data.golf.status}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1 lg:max-w-2xl">
                                            {data.golf.leaders?.map((p: any, i: number) => (
                                                <div key={i} className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[9px] font-mono text-zinc-600 uppercase">POS: {p.pos}</span>
                                                        <span className="text-sm font-black text-[#DFFF00] font-mono">{p.score}</span>
                                                    </div>
                                                    <span className="text-xs font-black uppercase truncate text-white">{p.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-10 pt-8 border-t border-white/5">
                                        <Link href="/sports/golf" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#DFFF00] hover:translate-x-2 transition-all group/link">
                                            Full Tour Leaderboard <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* MATCHES SECTION */}
                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] border border-white/5 shadow-xl"><Target size={18} /></div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Active Arenas // NBA & NFL</h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                            </div>

                            {filteredMatches.length === 0 ? (
                                <div className="py-32 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-900/10">
                                    <Timer size={48} className="mx-auto mb-6 text-zinc-800" />
                                    <p className="text-zinc-600 font-mono text-sm uppercase tracking-[0.3em]">No active match signatures detected</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredMatches.map((match: any) => (
                                        <div key={match.id} className="group bg-zinc-900/50 border border-white/5 hover:border-[#DFFF00]/30 rounded-[2.5rem] p-8 backdrop-blur-xl transition-all duration-500 flex flex-col relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl -mr-16 -mt-16 group-hover:bg-[#DFFF00]/5 transition-colors" />
                                            
                                            <div className="flex justify-between items-center mb-8 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${match.isLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`} />
                                                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{match.league} // {match.status}</span>
                                                </div>
                                                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">{match.period ? `Period ${match.period}` : ''}</div>
                                            </div>

                                            <div className="flex items-center justify-between gap-6 mb-8 relative z-10">
                                                <div className="flex flex-col items-center gap-3 flex-1">
                                                    <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center p-3 border border-white/5 shadow-xl group-hover:scale-110 transition-transform">
                                                        <img src={match.away.logo} alt={match.away.code} className="w-full h-full object-contain" />
                                                    </div>
                                                    <span className="text-sm font-black uppercase text-center">{match.away.code}</span>
                                                    <span className="text-2xl md:text-4xl font-mono font-black text-white italic">{match.away.score}</span>
                                                </div>
                                                
                                                <div className="text-zinc-800 font-black text-2xl italic flex flex-col items-center gap-2">
                                                    <div className="h-12 w-px bg-zinc-800" />
                                                    VS
                                                    <div className="h-12 w-px bg-zinc-800" />
                                                </div>

                                                <div className="flex flex-col items-center gap-3 flex-1">
                                                    <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center p-3 border border-white/5 shadow-xl group-hover:scale-110 transition-transform">
                                                        <img src={match.home.logo} alt={match.home.code} className="w-full h-full object-contain" />
                                                    </div>
                                                    <span className="text-sm font-black uppercase text-center">{match.home.code}</span>
                                                    <span className="text-2xl md:text-4xl font-mono font-black text-white italic">{match.home.score}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Venue Telemetry</span>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase truncate max-w-[150px]">{match.venue}</span>
                                                </div>
                                                <Link 
                                                    href={`/sports/${match.league}`}
                                                    className="p-3 bg-zinc-950 rounded-xl text-zinc-500 hover:text-[#DFFF00] border border-white/5 transition-all active:scale-90"
                                                >
                                                    <ArrowRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                    </div>
                )}

            </div>
        </main>
    );
}
