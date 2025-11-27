'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Loader2, AlertTriangle, TrendingUp, LayoutGrid, Users, Activity, Shield, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { NRL_TEAMS, TEAM_LOGOS } from './data';
import { getLiveScores, getStandings, getLeagueLeaders } from './actions'; 

// --- COMPONENT: LIVE FIXTURES (Redesigned) ---
const LiveScoreboard = () => {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLiveScores().then((data) => {
            setGames(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="h-12 flex items-center justify-center text-[9px] font-mono animate-pulse text-zinc-500 border-b border-zinc-800 bg-black">LOADING FIXTURES...</div>;

    return (
        <div className="mb-12 border-b border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden relative flex items-center h-20">
            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-6 bg-black border-r border-zinc-800">
                <div className="flex items-center gap-2 text-[#DFFF00] font-black text-[10px] uppercase tracking-widest">
                    <Calendar size={14} /> ROUND 1
                </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar pl-32 items-center h-full">
                <div className="flex divide-x divide-zinc-800 h-full">
                    {games.map((game: any, i: number) => (
                        <div key={`${game.id}-${i}`} className="px-8 py-2 flex flex-col justify-center min-w-[240px] hover:bg-zinc-900 transition-colors group cursor-default h-full">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <img src={game.home.logo} className="w-5 h-5 object-contain" />
                                    <span className="font-black text-xs text-white">{game.home.name}</span>
                                </div>
                                <span className="font-mono font-bold text-xs text-zinc-500">VS</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-xs text-white">{game.away.name}</span>
                                    <img src={game.away.logo} className="w-5 h-5 object-contain" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[9px] font-mono text-[#DFFF00] uppercase tracking-widest">{game.status}</span>
                                <span className="text-[8px] font-bold text-zinc-600 uppercase flex items-center gap-1 truncate max-w-[100px]">
                                   <MapPin size={8}/> {game.venue || 'TBA'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: ROUND 1 FIXTURE LIST (Replaces Bracket) ---
const FixtureModule = () => {
    const [games, setGames] = useState<any[]>([]);

    useEffect(() => {
        getLiveScores().then(setGames);
    }, []);

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 mb-12">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800">
                <Calendar size={16} className="text-[#DFFF00]"/>
                <span className="text-xs font-black tracking-widest uppercase text-white">UPCOMING MATCHES</span>
            </div>
            <div className="grid gap-3">
                {games.map((game) => (
                    <div key={game.id} className="flex items-center justify-between bg-black p-4 border border-zinc-800 hover:border-zinc-600 transition-colors">
                        <div className="flex items-center gap-4 w-1/3">
                            <img src={game.home.logo} className="w-8 h-8 object-contain" />
                            <span className="font-black text-sm text-white hidden md:inline">{game.home.name}</span>
                        </div>
                        
                        <div className="text-center flex-1">
                            <div className="text-[10px] font-mono font-bold text-[#DFFF00] mb-1">{game.status}</div>
                            <div className="text-[9px] font-bold text-zinc-500 uppercase">{game.venue}</div>
                        </div>

                        <div className="flex items-center gap-4 w-1/3 justify-end">
                            <span className="font-black text-sm text-white hidden md:inline">{game.away.name}</span>
                            <img src={game.away.logo} className="w-8 h-8 object-contain" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMPONENT: 2025 LADDER ---
const StandingsModule = () => {
    const [ladder, setLadder] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStandings().then((data) => {
            setLadder(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="bg-black border border-zinc-800 p-4 mb-12">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
                <TrendingUp size={14} className="text-white"/>
                <span className="text-xs font-black tracking-widest uppercase text-white">2025 PREMIERSHIP LADDER</span>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-zinc-500 font-mono text-[10px] animate-pulse">
                    <Loader2 size={12} className="animate-spin"/> INITIALIZING SEASON...
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[300px]">
                        <thead>
                            <tr className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                <th className="pb-2 pl-2">POS</th>
                                <th className="pb-2">CLUB</th>
                                <th className="pb-2 text-right">P</th>
                                <th className="pb-2 text-right">W</th>
                                <th className="pb-2 text-right">L</th>
                                <th className="pb-2 text-right">PTS</th>
                                <th className="pb-2 text-right pr-2">DIFF</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-xs text-zinc-300">
                            {ladder.map((t, i) => (
                                <tr key={t.id} className={`border-b border-zinc-900 last:border-0 hover:bg-zinc-900 transition-colors`}>
                                    <td className="py-3 pl-2 font-black text-zinc-600">{t.rank}</td>
                                    <td className="py-3 flex items-center gap-3 font-bold text-white">
                                        <img src={t.logo} className="w-6 h-6 object-contain" />
                                        <span className="truncate max-w-[150px]">{t.name}</span>
                                    </td>
                                    <td className="py-3 text-right text-zinc-500">0</td>
                                    <td className="py-3 text-right text-zinc-500">0</td>
                                    <td className="py-3 text-right text-zinc-500">0</td>
                                    <td className="py-3 text-right font-black text-white">0</td>
                                    <td className="py-3 text-right pr-2 text-zinc-500">0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// --- COMPONENT: LEADERS ---
const LeadersModule = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeagueLeaders().then(d => {
            setData(d);
            setLoading(false);
        })
    }, []);

    if (loading) return null;

    return (
        <div className="bg-zinc-900 border-2 border-black p-6 mb-8">
             <div className="flex items-center gap-2 text-[#DFFF00] mb-2">
                <Activity size={16}/>
                <span className="font-bold font-mono text-xs tracking-widest">PLAYER WATCHLIST // <span className="text-white uppercase">{data.seasonLabel}</span></span>
            </div>
            <div className="grid gap-2 mt-4">
                 {data.players.map((p: any, i: number) => (
                     <Link href={`/sports/nrl/player/${p.id}`} key={p.id} className="flex items-center gap-4 bg-black border border-zinc-800 hover:border-[#DFFF00] p-3 transition-all group">
                         <div className="text-zinc-600 font-black font-mono text-lg w-6 text-center">{i + 1}</div>
                         <div className="flex-1">
                             <div className="font-bold text-sm text-white uppercase group-hover:text-[#DFFF00] transition-colors">{p.name}</div>
                             <div className="text-[10px] font-mono text-zinc-500 uppercase">{p.team}</div>
                         </div>
                         <div className="text-right">
                             <div className="text-[10px] font-black text-[#DFFF00] font-mono">{p.tier}</div>
                         </div>
                     </Link>
                 ))}
            </div>
        </div>
    )
}

export default function NRLHub() {
    const [activeTab, setActiveTab] = useState<'league' | 'leaders'>('league');

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 pt-0 pb-20">
            {/* BACKGROUND */}
            <div className="bg-starfield">
                <div className="stars-1"></div>
                <div className="stars-2"></div>
                <div className="stars-3"></div>
            </div>

            <LiveScoreboard />
            
            {/* HEADER */}
            <div className="mb-12 border-b border-zinc-800 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Shield size={14} className="text-[#DFFF00]" />
                        <span className="font-mono text-[10px] font-bold tracking-widest text-[#DFFF00]">NATIONAL RUGBY LEAGUE</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white">
                        PREMIERSHIP
                    </h1>
                </div>

                {/* TABS */}
                <div className="flex gap-2">
                     <button 
                        onClick={() => setActiveTab('league')}
                        className={`px-4 py-3 font-black font-mono text-xs uppercase tracking-widest border transition-all ${activeTab === 'league' ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.3)]' : 'bg-black/50 text-zinc-500 border-zinc-800 hover:text-white'}`}
                    >
                        LEAGUE DATA
                    </button>
                     <button 
                        onClick={() => setActiveTab('leaders')}
                        className={`px-4 py-3 font-black font-mono text-xs uppercase tracking-widest border transition-all ${activeTab === 'leaders' ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.3)]' : 'bg-black/50 text-zinc-500 border-zinc-800 hover:text-white'}`}
                    >
                        PLAYER WATCH
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'league' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8">
                            <StandingsModule />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {NRL_TEAMS.map(team => (
                                    <Link href={`/sports/nrl/team/${team.id}`} key={team.id} className="group border border-zinc-800 hover:border-[#DFFF00] bg-black/50 backdrop-blur-sm p-6 flex items-center gap-6 transition-all hover:-translate-y-1">
                                        <div className={`w-16 h-16 flex items-center justify-center shrink-0 bg-zinc-900 border border-zinc-700 rounded-full p-2`}>
                                            <img src={team.logo} className="w-full h-full object-contain" alt={team.name} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase leading-none mb-1 text-white group-hover:text-[#DFFF00] transition-colors">{team.name}</h3>
                                            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{team.stadium}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-4">
                            <FixtureModule />
                        </div>
                    </div>
                )}

                {activeTab === 'leaders' && (
                    <div className="max-w-4xl mx-auto">
                        <LeadersModule />
                    </div>
                )}
            </div>
        </div>
    );
}