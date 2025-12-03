'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Trophy, Globe, Activity, ArrowUpRight, ArrowDownRight, Minus, 
    Calendar, MapPin, ChevronRight, Star, TrendingUp, Flag
} from 'lucide-react';
import type { Golfer, GolfLeaderboard, GolfEvent } from '../lib/golf-api';
import GolfSearch from './GolfSearch';

interface DashboardProps {
    rankings: Golfer[];
    fedex: Golfer[];
    schedule: GolfEvent[];
    leaderboard: GolfLeaderboard | null;
}

export default function GolfDashboard({ rankings, fedex, leaderboard, schedule }: DashboardProps) {
    const router = useRouter();
    const [statView, setStatView] = useState<'owgr' | 'fedex'>('owgr');

    // --- DERIVED STATE ---
    const worldNo1 = rankings?.[0];
    
    // Check Status
    const status = leaderboard?.tournament.status?.toLowerCase() || '';
    const isLive = status.includes('live') || status.includes('progress') || status.includes('play');
    const isFinal = status.includes('final');
    
    // Sort schedule to show upcoming first (excluding the one we might be showing as 'last result')
    const upcomingEvents = schedule
        ?.filter(e => !e.status.includes('Final'))
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

    // Helper for trend arrows
    const renderTrend = (movement: number) => {
        if (!movement || movement === 0) return <span className="text-zinc-600 flex items-center gap-1 text-[10px]"><Minus size={10}/></span>;
        if (movement > 0) return <span className="text-[#DFFF00] flex items-center gap-1 text-[10px]"><ArrowUpRight size={10}/> +{movement}</span>;
        return <span className="text-red-500 flex items-center gap-1 text-[10px]"><ArrowDownRight size={10}/> {Math.abs(movement)}</span>;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* --- TOP ROW: HERO & LIVE ACTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* HERO: WORLD NO. 1 */}
                {worldNo1 && (
                    <div 
                        onClick={() => router.push(`/sports/golf/player/${worldNo1.id}`)}
                        className="lg:col-span-7 relative h-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group cursor-pointer hover:border-zinc-600 transition-all"
                    >
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-transparent z-10"></div>
                        
                        {/* Player Image (Right aligned) */}
                        {worldNo1.image && (
                            <img 
                                src={worldNo1.image} 
                                alt={worldNo1.name} 
                                className="absolute right-[-20px] bottom-0 h-[110%] w-auto object-contain z-0 group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl"
                            />
                        )}

                        {/* Content */}
                        <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DFFF00] text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-full w-fit mb-6">
                                <Star size={10} fill="black" /> World Number One
                            </div>
                            
                            <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-2 leading-[0.85]">
                                {worldNo1.name.split(' ')[0]}<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600">
                                    {worldNo1.name.split(' ').slice(1).join(' ')}
                                </span>
                            </h2>
                            
                            <div className="flex items-center gap-6 mt-6">
                                <div className="flex items-center gap-2">
                                    {worldNo1.flag && <img src={worldNo1.flag} className="w-6 h-4 rounded-[2px]" />}
                                    <span className="text-sm font-mono text-zinc-400 uppercase tracking-widest">{worldNo1.country}</span>
                                </div>
                                <div className="w-px h-8 bg-zinc-800"></div>
                                <div>
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Points</div>
                                    <div className="text-xl font-bold font-mono text-[#DFFF00]">{worldNo1.displayValue}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SIDE: LIVE OR RECENT EVENT */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* SEARCH BAR */}
                    <div className="w-full">
                        <GolfSearch />
                    </div>

                    {/* EVENT CARD */}
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                        {/* Header Row */}
                        <div className="flex justify-between items-start z-10">
                            {isLive ? (
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-red-500 font-mono text-xs font-bold uppercase tracking-widest">Live Now</span>
                                </div>
                            ) : isFinal ? (
                                <span className="text-[#DFFF00] font-mono text-xs font-bold uppercase tracking-widest">Recent Result</span>
                            ) : (
                                <span className="text-zinc-500 font-mono text-xs font-bold uppercase tracking-widest">Upcoming Event</span>
                            )}
                            
                            {leaderboard?.tournament.purse && (
                                <span className="text-zinc-500 font-mono text-xs">{leaderboard.tournament.purse}</span>
                            )}
                        </div>
                        
                        {/* Event Info */}
                        <div className="z-10 mt-4">
                            <h3 className="text-2xl font-black text-white uppercase leading-none mb-1">
                                {leaderboard?.tournament.name || 'PGA Tour'}
                            </h3>
                            <p className="text-zinc-500 font-mono text-xs uppercase flex items-center gap-1">
                                <MapPin size={12}/> {leaderboard?.tournament.location || 'TBD'}
                            </p>
                        </div>

                        {/* Leader/Winner Section */}
                        {leaderboard && leaderboard.players.length > 0 && (
                            <div className="mt-6 bg-black/40 rounded-xl p-4 border border-zinc-800/50 backdrop-blur-sm z-10">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                                    {isFinal ? 'Winner' : 'Current Leader'}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {leaderboard.players[0].image && (
                                            <img src={leaderboard.players[0].image} className="w-10 h-10 rounded-full bg-zinc-800 object-cover border border-zinc-700" />
                                        )}
                                        <div>
                                            <span className="font-bold text-white block leading-none">{leaderboard.players[0].name}</span>
                                            {leaderboard.players[0].flag && (
                                                <img src={leaderboard.players[0].flag} className="w-3 h-2 opacity-50 mt-1" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono text-xl font-black text-[#DFFF00] block leading-none">{leaderboard.players[0].score}</span>
                                        {isFinal && (
                                            <span className="text-[9px] text-zinc-500 uppercase">Final</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <Activity className="absolute -right-6 -bottom-6 text-zinc-800/50 w-48 h-48 z-0 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* --- MIDDLE ROW: STATS & RANKINGS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-zinc-800 pt-8">
                
                {/* LEFT COL: RANKINGS TOGGLE & LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <Trophy className="text-[#DFFF00]" size={20} /> Statistical Leaders
                        </h3>
                        <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                            <button 
                                onClick={() => setStatView('owgr')}
                                className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition-all ${statView === 'owgr' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                World Ranking
                            </button>
                            <button 
                                onClick={() => setStatView('fedex')}
                                className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition-all ${statView === 'fedex' ? 'bg-[#DFFF00] text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                FedEx Cup
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-h-[300px]">
                        {(statView === 'owgr' ? rankings : fedex)?.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-black/20 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                                        <th className="p-4 w-16 text-center">Rank</th>
                                        <th className="p-4">Golfer</th>
                                        <th className="p-4 text-center">Trend</th>
                                        <th className="p-4 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {(statView === 'owgr' ? rankings : fedex).slice(0, 10).map((player) => (
                                        <tr 
                                            key={player.id} 
                                            onClick={() => router.push(`/sports/golf/player/${player.id}`)}
                                            className="hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                                        >
                                            <td className="p-4 text-center font-mono font-bold text-zinc-400 group-hover:text-white">
                                                {player.rank}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {player.image ? (
                                                        <img src={player.image} className="w-8 h-8 rounded-full bg-zinc-950 object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">{player.name.charAt(0)}</div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-zinc-300 group-hover:text-[#DFFF00] transition-colors">{player.name}</div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            {player.flag && <img src={player.flag} className="w-3 h-2 opacity-60" />}
                                                            <span className="text-[9px] text-zinc-600 font-mono uppercase">{player.country}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center">{renderTrend(player.movement || 0)}</div>
                                            </td>
                                            <td className="p-4 text-right font-mono text-zinc-400 text-sm">
                                                {player.displayValue}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-zinc-500">
                                <Activity size={32} className="mb-2 opacity-50" />
                                <span className="text-xs font-mono uppercase tracking-widest">Ranking Data Unavailable</span>
                            </div>
                        )}
                        <div className="p-3 bg-black/20 border-t border-zinc-800 text-center">
                            <button className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-1 w-full">
                                View Full Standings <ChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: UPCOMING SCHEDULE (VERTICAL LIST) */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <Calendar className="text-zinc-600" size={20} /> Upcoming
                    </h3>
                    
                    <div className="space-y-3">
                        {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 5).map((event) => (
                            <div key={event.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-zinc-600 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-mono text-[#DFFF00] uppercase tracking-wider bg-[#DFFF00]/10 px-2 py-0.5 rounded-full">
                                        {new Date(event.date).toLocaleDateString('en-US', {month:'short', day:'numeric'})}
                                    </span>
                                    {event.purse && <span className="text-[9px] text-zinc-500 font-mono">{event.purse}</span>}
                                </div>
                                <div className="font-bold text-zinc-200 text-sm uppercase leading-tight mb-2">{event.name}</div>
                                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                                    <MapPin size={10} /> {event.location}
                                </div>
                            </div>
                        )) : (
                             <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest border border-zinc-800 rounded-xl p-6 text-center">
                                No Upcoming Events
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}