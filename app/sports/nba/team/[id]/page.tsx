'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, Calendar, Activity, ChevronRight, Loader2, AlertTriangle, TrendingUp, Trophy, Hash, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTeamData } from '../../actions'; 
import { NBA_TEAMS } from '../../data';

export default function TeamPage() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);

    const teamConfig = NBA_TEAMS.find((t: any) => t.id === id);

    useEffect(() => {
        const loadData = async () => {
            if (!teamConfig) return setError(true);
            const teamData = await getTeamData(teamConfig.espnId);
            if (teamData) {
                setData({ ...teamData, color: teamConfig.color, staticLogo: teamConfig.logo });
            } else {
                setError(true);
            }
        };
        loadData();
    }, [teamConfig]);

    if (error) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-500 font-mono p-8 text-center"><AlertTriangle size={48} className="text-red-500" /><div className="text-xl font-black text-black dark:text-white">FRANCHISE UPLINK FAILED</div><Link href="/sports/nba" className="px-6 py-3 bg-black text-white text-xs font-bold tracking-widest mt-4 hover:bg-zinc-800">RETURN TO HUB</Link></div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center gap-2 font-mono text-xs text-zinc-500"><Loader2 className="animate-spin text-acid"/> SYNCING FRANCHISE DATA...</div>;

    const lastGames = data.schedule.filter((g: any) => g.status === 'Final').slice(0, 5);
    const nextGame = data.schedule.find((g: any) => g.status !== 'Final');

    return (
        <div className="max-w-7xl mx-auto pb-40 px-4 md:px-0 pt-12 animate-in fade-in duration-700">
            <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-acid px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent hover:border-black"><ArrowLeft size={16} /> RETURN TO LEAGUE</Link>

            {/* HERO HEADER - ACID STYLE */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#DFFF00] mb-12 relative overflow-hidden">
                
                {/* Background Pattern */}
                <div className={`absolute inset-0 ${data.color} opacity-10`}>
                     <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                </div>

                {/* Content */}
                <div className="p-8 relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-32 h-32 bg-white dark:bg-zinc-950 border-4 border-black dark:border-zinc-700 flex items-center justify-center p-4 shadow-xl">
                            <img src={data.staticLogo} className="w-full h-full object-contain" alt={data.name} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-black text-acid px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-widest border border-acid">{data.standing}</span>
                                <span className="text-black dark:text-white text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> {teamConfig?.city}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.85] tracking-tighter text-black dark:text-white">{data.name}</h1>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-1">
                        <div className="bg-black p-4 min-w-[100px] border-l-4 border-acid">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">RECORD</span>
                            <span className="text-3xl font-black text-white leading-none">{data.record}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COL: SCHEDULE & FORM */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* RECENT FORM */}
                    <div className="bg-zinc-50 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-zinc-200 dark:border-zinc-800">
                            <Activity size={14} className="text-black dark:text-white"/>
                            <span className="text-xs font-black tracking-widest uppercase text-black dark:text-white">RECENT RESULTS</span>
                        </div>
                        <div className="space-y-2">
                            {lastGames.map((g: any) => (
                                <div key={g.id} className="flex justify-between items-center p-2 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-mono font-black text-sm ${g.result === 'W' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{g.result}</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase">VS {g.opponent.name}</span>
                                            <span className="text-xs font-black text-black dark:text-white">{g.score} - {g.opponent.score}</span>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-mono text-zinc-400">{new Date(g.date).toLocaleDateString('en-US', {month:'numeric', day:'numeric'})}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NEXT GAME */}
                    {nextGame && (
                        <div className="bg-black text-white p-6 border-2 border-acid relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4 text-acid">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">NEXT MATCHUP</span>
                                </div>
                                <div className="text-3xl font-black uppercase mb-1">{nextGame.shortName}</div>
                                <div className="font-mono text-xs text-zinc-400 mb-4">{new Date(nextGame.date).toLocaleString()}</div>
                                <div className="inline-block px-3 py-1 bg-acid text-black text-[10px] font-black uppercase tracking-widest">PREVIEW</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COL: ROSTER */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-black dark:border-zinc-700">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-black dark:text-white"/>
                            <span className="text-xs font-black tracking-widest uppercase text-black dark:text-white">ACTIVE ROSTER</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-acid text-black px-2 py-1">{data.roster.length} PLAYERS</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.roster.map((p: any) => (
                            <Link href={`/sports/nba/player/${p.id}`} key={p.id} className="group flex items-center gap-4 bg-white dark:bg-zinc-900 border-2 border-transparent hover:border-black dark:hover:border-zinc-500 p-3 transition-all shadow-sm hover:shadow-md">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                                    <img src={p.image} className="w-full h-full object-cover object-top transform scale-110 pt-1" alt={p.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[9px] font-black bg-black text-white px-1.5 py-0.5">{p.pos}</span>
                                        <span className="text-[9px] font-mono font-bold text-zinc-400">#{p.number}</span>
                                    </div>
                                    <div className="font-black text-sm uppercase truncate text-black dark:text-white group-hover:text-acid transition-colors">{p.name}</div>
                                    <div className="text-[9px] font-mono text-zinc-500 truncate">{p.height}, {p.weight} • {p.college}</div>
                                </div>
                                <ChevronRight size={16} className="text-zinc-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}