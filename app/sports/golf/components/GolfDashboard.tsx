'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Globe, Activity, ArrowUpRight, Minus, ArrowDownRight, TrendingUp, Calendar, MapPin, Clock } from 'lucide-react';
import type { Golfer, GolfLeaderboard, GolfEvent } from '../lib/golf-api';
import GolfSearch from './GolfSearch';

interface DashboardProps {
    rankings: Golfer[];
    fedex: Golfer[];
    schedule: GolfEvent[];
    leaderboard: GolfLeaderboard | null;
}

export default function GolfDashboard({ rankings, fedex, leaderboard, schedule }: DashboardProps) {
    const [view, setView] = useState<'rankings' | 'fedex' | 'leaderboard'>('rankings');
    const router = useRouter();

    // Determine the "Next" or "Live" event from schedule
    const activeEvent = schedule?.find(e => e.status.includes('Live') || e.status.includes('Progress')) || schedule?.[0];

    const renderTrend = (movement: number) => {
        if (!movement || movement === 0) return <span className="text-zinc-600 flex items-center gap-1"><Minus size={12}/> EVEN</span>;
        if (movement > 0) return <span className="text-[#DFFF00] flex items-center gap-1"><ArrowUpRight size={12}/> +{movement}</span>;
        return <span className="text-red-500 flex items-center gap-1"><ArrowDownRight size={12}/> {movement}</span>;
    };

    return (
        <div>
            {/* CONTROLS ROW */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                <div className="flex gap-2 bg-zinc-900/50 p-1 border border-zinc-800 rounded-lg backdrop-blur-sm overflow-x-auto max-w-full">
                    <button onClick={() => setView('rankings')} className={`px-6 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-md whitespace-nowrap ${view === 'rankings' ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.3)]' : 'text-zinc-500 hover:text-white'}`}>
                        OWGR Rankings
                    </button>
                    {/* Only show FedEx if we have data */}
                    {fedex && fedex.length > 0 && (
                        <button onClick={() => setView('fedex')} className={`px-6 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-md whitespace-nowrap ${view === 'fedex' ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.3)]' : 'text-zinc-500 hover:text-white'}`}>
                            FedEx Cup
                        </button>
                    )}
                    <button onClick={() => setView('leaderboard')} className={`px-6 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-md whitespace-nowrap ${view === 'leaderboard' ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.3)]' : 'text-zinc-500 hover:text-white'}`}>
                        Live Tournament
                    </button>
                </div>

                <GolfSearch />
            </div>

            {/* DASHBOARD CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* LEFT COL: Main Content (Rankings/FedEx/Leaderboard) */}
                <div className="lg:col-span-3">
                    
                    {/* VIEW: LEADERBOARD TABLE */}
                    {view === 'leaderboard' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {leaderboard ? (
                                <div className="bg-zinc-900 border border-zinc-800 overflow-hidden rounded-lg">
                                    <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center bg-black/40 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse box-shadow-[0_0_10px_red]"></div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{leaderboard.tournament.name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono uppercase mt-1">
                                                    <Globe size={12}/> {leaderboard.tournament.course}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Leader</div>
                                            <div className="text-[#DFFF00] font-mono text-lg font-bold">{leaderboard.players[0]?.name || 'TBD'}</div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[600px]">
                                            <thead>
                                                <tr className="bg-zinc-950/50 text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                                                    <th className="p-4 w-20 text-center">Pos</th>
                                                    <th className="p-4">Player</th>
                                                    <th className="p-4 text-center">Thru</th>
                                                    <th className="p-4 text-center">Round</th>
                                                    <th className="p-4 text-right pr-6">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-800">
                                                {leaderboard.players.map((p: any) => (
                                                    <tr key={p.id} onClick={() => router.push(`/sports/golf/player/${p.id}`)} className="group hover:bg-zinc-800/50 cursor-pointer transition-colors">
                                                        <td className="p-4 text-center font-mono text-lg font-bold text-zinc-500 group-hover:text-white transition-colors">{p.rank}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-4">
                                                                {p.image ? (
                                                                    <img src={p.image} className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 object-cover" />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600"><Trophy size={16}/></div>
                                                                )}
                                                                <div>
                                                                    <div className="font-black text-zinc-300 group-hover:text-[#DFFF00] uppercase text-sm transition-colors">{p.name}</div>
                                                                    {p.flag && <img src={p.flag} className="w-4 h-3 mt-1 opacity-50" />}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center font-mono text-sm text-zinc-500">{p.thru}</td>
                                                        <td className="p-4 text-center font-mono text-sm text-zinc-400">{p.today}</td>
                                                        <td className={`p-4 text-right pr-6 font-mono text-xl font-black ${p.isUnderPar ? 'text-red-500' : 'text-zinc-300'}`}>{p.score}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center border border-zinc-800 bg-zinc-900/50 border-dashed rounded-lg">
                                    <Activity className="text-zinc-700 mb-4" size={48} />
                                    <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No Live Data</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VIEW: RANKINGS / FEDEX */}
                    {(view === 'rankings' || view === 'fedex') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {(view === 'rankings' ? rankings : fedex).map((golfer) => (
                                <div key={golfer.id} onClick={() => router.push(`/sports/golf/player/${golfer.id}`)} className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer overflow-hidden p-0 flex flex-col h-40">
                                    <div className="absolute -right-2 -bottom-6 text-[120px] font-black text-black/40 leading-none select-none z-0 group-hover:text-[#DFFF00]/10 transition-colors">{golfer.rank}</div>
                                    <div className="relative z-10 flex h-full">
                                        <div className="flex-1 p-5 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {golfer.flag && <img src={golfer.flag} alt={golfer.country} className="w-4 h-3 rounded-[1px] object-cover opacity-80" />}
                                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{golfer.country}</span>
                                                </div>
                                                <h3 className="text-xl font-black text-white uppercase italic leading-none group-hover:text-[#DFFF00] transition-colors truncate max-w-[200px]">{golfer.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-4 border-t border-zinc-800 pt-3">
                                                <div>
                                                    <div className="text-[8px] text-zinc-500 font-mono uppercase">Points</div>
                                                    <div className="text-sm font-bold text-white font-mono">{golfer.displayValue}</div>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className="text-[8px] text-zinc-500 font-mono uppercase">Trend</div>
                                                    <div className="text-xs font-bold font-mono">{renderTrend(golfer.movement || 0)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-32 relative overflow-hidden bg-gradient-to-l from-zinc-800/50 to-transparent">
                                            {golfer.image ? (
                                                <img src={golfer.image} alt={golfer.name} className="absolute bottom-0 right-0 h-[110%] w-auto object-contain object-bottom group-hover:scale-105 transition-transform duration-500 drop-shadow-xl" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-zinc-700"><Trophy size={48} strokeWidth={1} /></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT COL: SCHEDULE & INFO */}
                <div className="space-y-6">
                    
                    {/* ACTIVE EVENT CARD */}
                    {activeEvent && (
                        <div className="bg-[#DFFF00] text-black p-6 rounded-lg shadow-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity size={16} className="animate-pulse"/>
                                    <span className="font-mono text-xs font-bold uppercase tracking-widest">Active Tournament</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase leading-none mb-2">{activeEvent.name}</h3>
                                <div className="text-xs font-bold opacity-80 mb-6 flex items-center gap-1">
                                    <MapPin size={12}/> {activeEvent.location}
                                </div>
                                <div className="flex justify-between items-end border-t border-black/10 pt-4">
                                    <div>
                                        <div className="text-[9px] font-mono uppercase tracking-widest opacity-60">Status</div>
                                        <div className="font-bold text-sm">{activeEvent.status}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-mono uppercase tracking-widest opacity-60">Purse</div>
                                        <div className="font-bold text-sm">{activeEvent.purse || 'TBD'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-10 scale-150 group-hover:scale-125 transition-transform duration-700">
                                <Trophy size={120} />
                            </div>
                        </div>
                    )}

                    {/* SCHEDULE LIST */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 bg-black/40">
                            <h4 className="flex items-center gap-2 text-white font-bold uppercase text-xs tracking-wider">
                                <Calendar size={14} className="text-[#DFFF00]" /> Season Schedule
                            </h4>
                        </div>
                        <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto">
                            {schedule?.map(event => (
                                <div key={event.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[9px] font-mono text-[#DFFF00] uppercase tracking-wider">
                                            {new Date(event.date).toLocaleDateString('en-US', {month:'short', day:'numeric'})}
                                        </span>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase ${event.status.includes('Final') ? 'bg-zinc-800 text-zinc-500' : 'bg-red-900/20 text-red-500'}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="font-bold text-zinc-200 text-sm uppercase leading-tight mb-1">{event.name}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono truncate">{event.location}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}