// app/sports/golf/components/GolfDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Calendar, Flag, MapPin, BarChart2, RefreshCw, Award, Clock, DollarSign } from 'lucide-react';
import GolfSearch from './GolfSearch';
import LiveTicker from './LiveTicker';

const Countdown = ({ targetDate }: { targetDate?: string }) => {
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

    useEffect(() => {
        if (!targetDate) return;
        const target = new Date(targetDate).getTime();
        if (isNaN(target)) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = target - now;
            
            if (distance < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex gap-4 font-mono text-[#DFFF00]">
            <div className="flex flex-col items-center"><span className="text-2xl font-black">{timeLeft.d}</span><span className="text-[9px] uppercase text-zinc-500">Day</span></div>
            <div className="text-2xl font-black">:</div>
            <div className="flex flex-col items-center"><span className="text-2xl font-black">{timeLeft.h.toString().padStart(2, '0')}</span><span className="text-[9px] uppercase text-zinc-500">Hr</span></div>
            <div className="text-2xl font-black">:</div>
            <div className="flex flex-col items-center"><span className="text-2xl font-black">{timeLeft.m.toString().padStart(2, '0')}</span><span className="text-[9px] uppercase text-zinc-500">Min</span></div>
        </div>
    );
};

const StatCard = ({ title, players, router }: any) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
            <h3 className="text-xs font-mono font-bold text-[#DFFF00] uppercase tracking-widest">{title}</h3>
            <BarChart2 size={12} className="text-zinc-500" />
        </div>
        <div className="flex-1 divide-y divide-zinc-800/50">
            {players && players.length > 0 ? (
                players.slice(0, 5).map((p: any, i: number) => (
                    <div 
                        key={p.id} 
                        onClick={() => router.push(`/sports/golf/player/${p.id}`)}
                        className="flex items-center justify-between p-3 hover:bg-zinc-800 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-zinc-600 w-3">{i + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-800 group-hover:border-zinc-600">
                                {p.image && <img src={p.image} className="w-full h-full object-cover" alt={p.name} />}
                            </div>
                            <span className="text-sm font-bold text-white group-hover:text-[#DFFF00] transition-colors">{p.name}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white">{p.value}</span>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-zinc-600 text-[10px] font-mono uppercase">Data Unavailable</div>
            )}
        </div>
    </div>
);

const EventCard = ({ event }: any) => {
    const isFinished = event.status === 'Final' || event.winner;
    return (
        <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${isFinished ? 'bg-zinc-800 text-zinc-500' : 'bg-[#DFFF00] text-black'}`}>
                    {isFinished ? 'FINISHED' : 'UPCOMING'}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">{event.date}</span>
            </div>
            <h3 className="font-bold text-base text-white mb-1 line-clamp-1">{event.name}</h3>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase mb-4">
                <MapPin size={10} /> {event.location || 'TBD'}
            </div>
            
            <div className="mt-auto pt-3 border-t border-zinc-800">
                {isFinished ? (
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500 uppercase">Winner</span>
                        <span className="text-xs font-bold text-[#DFFF00]">{event.winner}</span>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500 uppercase">Purse</span>
                        <span className="text-xs font-mono text-white">{event.purse || '-'}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function GolfDashboard({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [view, setView] = useState<'overview' | 'rankings' | 'schedule'>('overview');
    const [leaderTab, setLeaderTab] = useState('earnings');
    const [rankingTab, setRankingTab] = useState<'owgr' | 'fedex'>('owgr');
    
    const data = initialData || { owgr: [], fedex: [], schedule: [], stats: [], live: null };
    
    const activeEvent = data.live;
    const activeStats = data.stats?.find((s: any) => s.id === leaderTab) || data.stats?.[0];
    const topGridStats = data.stats?.filter((s: any) => s.id !== 'earnings') || []; 
    const rankingsList = rankingTab === 'owgr' ? data.owgr : data.fedex;
    
    // DYNAMIC SEASON: Grabs the season from the data, defaults to 2025
    const displaySeason = data.stats?.[0]?.season || '2025';

    const formattedDate = activeEvent?.tournament?.dates 
        ? new Date(activeEvent.tournament.dates).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          })
        : 'TBD';

    return (
        <div className="max-w-[1600px] mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* HERO / LIVE HEADER */}
            <div className="mb-12 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900 relative group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-900/20 via-zinc-950 to-zinc-950"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 justify-between">
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                            {activeEvent?.status === 'Upcoming' ? (
                                <span className="flex items-center gap-2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 text-[10px] font-mono uppercase tracking-widest">
                                    <Clock size={12} /> UPCOMING
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 px-2 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> LIVE NOW
                                </span>
                            )}
                            <span className="text-zinc-500 text-[10px] font-mono uppercase">PGA TOUR</span>
                        </div>
                        
                        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2 leading-[0.9]">
                            {activeEvent?.tournament?.name || 'Season Overview'}
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 uppercase">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {formattedDate}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {activeEvent?.tournament?.location || activeEvent?.tournament?.course || 'Location TBD'}</span>
                        </div>
                    </div>

                    <div className="w-full md:w-auto min-w-[300px]">
                        {activeEvent?.status === 'Upcoming' ? (
                            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
                                <div>
                                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block mb-1">T-Minus to Tee Off</span>
                                    <Countdown targetDate={activeEvent.tournament?.dates} />
                                </div>
                            </div>
                        ) : activeEvent?.players?.length > 0 ? (
                            <div className="bg-black/40 backdrop-blur-sm border border-zinc-800 rounded-xl p-4">
                                <h3 className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase mb-3 flex items-center justify-between">
                                    <span>Leaderboard</span>
                                    <span className="w-2 h-2 bg-[#DFFF00] rounded-full animate-pulse"></span>
                                </h3>
                                <div className="space-y-2">
                                    {activeEvent.players.slice(0, 3).map((l: any) => (
                                        <div key={l.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-zinc-500 w-4">{l.rank}</span>
                                                <span className="font-bold text-white">{l.name}</span>
                                            </div>
                                            <span className="font-mono font-bold text-[#DFFF00]">{l.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
                
                {/* LIVE TICKER COMPONENT */}
                <div className="border-t border-zinc-800">
                    <LiveTicker data={activeEvent} />
                </div>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    {['overview', 'rankings', 'schedule'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setView(t as any)}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                                view === t ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <GolfSearch />
            </div>

            {/* VIEWS */}
            
            {view === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    
                    {/* TOP STATS GRID */}
                    {topGridStats.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {topGridStats.map((cat: any, i: number) => (
                                <StatCard key={i} title={cat.title} players={cat.players} router={router} />
                            ))}
                        </div>
                    )}

                    {/* STATS LEADERBOARD (FULL WIDTH) */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                         <div className="flex flex-col md:flex-row md:items-center justify-between p-2 bg-zinc-950/50 border-b border-zinc-800 gap-2">
                            <div className="px-3 py-2 flex items-center gap-2">
                                <DollarSign size={14} className="text-[#DFFF00]" />
                                {/* UPDATED: Uses displaySeason variable */}
                                <h3 className="font-black text-white uppercase italic tracking-tight hidden md:block">Season Statistics <span className="text-zinc-600 not-italic">({displaySeason})</span></h3>
                            </div>
                            <div className="flex bg-zinc-900 p-1 rounded border border-zinc-800 overflow-x-auto no-scrollbar">
                                <button onClick={() => setLeaderTab('earnings')} className={`px-3 py-1 text-[9px] font-bold uppercase rounded ${leaderTab === 'earnings' ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}>Earnings</button>
                                <button onClick={() => setLeaderTab('driving')} className={`px-3 py-1 text-[9px] font-bold uppercase rounded ${leaderTab === 'driving' ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}>Driving</button>
                                <button onClick={() => setLeaderTab('scoring')} className={`px-3 py-1 text-[9px] font-bold uppercase rounded ${leaderTab === 'scoring' ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}>Scoring</button>
                                <button onClick={() => setLeaderTab('putting')} className={`px-3 py-1 text-[9px] font-bold uppercase rounded ${leaderTab === 'putting' ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}>Putting</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/50">
                            {activeStats && activeStats.players && activeStats.players.length > 0 ? (
                                activeStats.players.slice(0, 10).map((p: any, i: number) => (
                                    <div key={p.id} onClick={() => router.push(`/sports/golf/player/${p.id}`)} className="flex items-center p-3 hover:bg-zinc-800 cursor-pointer gap-4 group">
                                        <div className="w-8 font-mono text-lg font-black text-zinc-600 text-center group-hover:text-[#DFFF00]">{i + 1}</div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-800 group-hover:border-zinc-600">
                                                {p.image && <img src={p.image} className="w-full h-full object-cover" alt={p.name} />}
                                            </div>
                                            <div className="font-bold text-white text-sm">{p.name}</div>
                                        </div>
                                        <div className="text-xs font-mono font-bold text-[#DFFF00]">{p.value}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-zinc-500 font-mono text-xs col-span-2">Data Unavailable for {displaySeason} Season.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {view === 'schedule' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
                    {data.schedule?.map((e: any) => (
                        <EventCard key={e.id} event={e} />
                    ))}
                </div>
            )}

            {view === 'rankings' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                     <div className="flex items-center gap-2 p-4 border-b border-zinc-800 bg-zinc-950/50">
                        <div className="flex bg-zinc-800 p-1 rounded border border-zinc-700">
                            <button onClick={() => setRankingTab('owgr')} className={`px-4 py-1 text-[10px] font-bold uppercase rounded ${rankingTab === 'owgr' ? 'bg-[#DFFF00] text-black' : 'text-zinc-400 hover:text-white'}`}>OWGR</button>
                            <button onClick={() => setRankingTab('fedex')} className={`px-4 py-1 text-[10px] font-bold uppercase rounded ${rankingTab === 'fedex' ? 'bg-[#DFFF00] text-black' : 'text-zinc-400 hover:text-white'}`}>FedEx Cup</button>
                        </div>
                     </div>
                     <div className="divide-y divide-zinc-800/50">
                        {rankingsList?.map((p: any) => (
                            <div key={p.id} onClick={() => router.push(`/sports/golf/player/${p.id}`)} className="flex items-center p-3 hover:bg-zinc-800 cursor-pointer gap-4 group">
                                <div className="w-12 font-mono text-xl font-black text-zinc-600 text-center group-hover:text-[#DFFF00]">{p.rank}</div>
                                <div className="flex-1 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-zinc-800 group-hover:border-white transition-colors">
                                        {p.image && <img src={p.image} className="w-full h-full object-cover" alt={p.name} />}
                                    </div>
                                    <div className="font-bold text-white text-lg">{p.name}</div>
                                </div>
                                <div className="text-sm font-mono font-bold text-[#DFFF00] pr-4">{p.points} PTS</div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
}