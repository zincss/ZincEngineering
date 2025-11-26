'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, Activity, ChevronRight, Loader2, Trophy, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTeamData } from '../../actions'; 
import { NBA_TEAMS } from '../../data';

export default function TeamPage() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'roster' | 'schedule'>('roster');
    const [error, setError] = useState(false);

    const teamConfig = NBA_TEAMS.find((t: any) => t.id === id);

    useEffect(() => {
        const loadData = async () => {
            if (!teamConfig) { setError(true); return; }
            
            // Ensure we clear previous error state on new load
            setError(false);
            setData(null);

            try {
                const teamData = await getTeamData(teamConfig.espnId);
                if (teamData) {
                    setData(teamData);
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error(e);
                setError(true);
            }
        };
        loadData();
    }, [teamConfig]);

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-500 font-mono">
            <AlertTriangle size={48} className="text-red-500" />
            <div className="text-xl font-black text-black dark:text-white">FRANCHISE DATA OFFLINE</div>
            <p className="text-xs">UNABLE TO ESTABLISH UPLINK TO ESPN DATABASE.</p>
            <Link href="/sports/nba" className="px-6 py-3 bg-black text-white text-xs font-bold tracking-widest mt-4 hover:bg-zinc-800">RETURN TO HUB</Link>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center gap-2 font-mono text-xs text-zinc-500">
            <Loader2 className="animate-spin text-black dark:text-white"/> 
            INITIALIZING {teamConfig?.name?.toUpperCase() || 'TEAM'} PROTOCOLS...
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-40 px-4 md:px-0 pt-12 animate-in fade-in duration-500">
            <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white mb-6 font-mono font-bold text-xs uppercase tracking-widest transition-colors"><ArrowLeft size={14} /> LEAGUE HUB</Link>

            {/* HEADER */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-lg mb-8 overflow-hidden">
                <div className="h-40 w-full relative" style={{ backgroundColor: data.color || '#000' }}>
                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                </div>
                <div className="px-8 pb-8 relative -mt-12 flex flex-col md:flex-row gap-8 items-end">
                    <div className="w-32 h-32 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 flex items-center justify-center shadow-xl p-4 relative z-10">
                        <img src={data.logo} className="w-full h-full object-contain" alt={data.name} />
                    </div>
                    <div className="flex-1 mb-2">
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2 text-black dark:text-white">{data.name}</h1>
                        <div className="flex flex-wrap gap-4 text-xs font-mono font-bold text-zinc-500">
                            <span className="flex items-center gap-1 text-black dark:text-white"><Activity size={14}/> {data.record}</span>
                            <span className="hidden md:inline text-zinc-300">|</span>
                            <span className="flex items-center gap-1"><Trophy size={14}/> {data.standing}</span>
                            <span className="hidden md:inline text-zinc-300">|</span>
                            <span className="flex items-center gap-1"><Users size={14}/> ROSTER: {data.roster?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                {['roster', 'schedule'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 font-black font-mono text-xs uppercase tracking-widest border-b-4 transition-all ${activeTab === tab ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ROSTER */}
            {activeTab === 'roster' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.roster?.map((p: any) => (
                        <Link href={`/sports/nba/player/${p.id}`} key={p.id} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all group hover:shadow-md">
                            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 relative">
                                <img src={p.headshot} className="w-full h-full object-cover object-top" alt={p.name} onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-sm uppercase leading-none mb-1 text-black dark:text-white group-hover:text-acid transition-colors">{p.name}</h4>
                                <div className="text-[10px] font-mono text-zinc-500">#{p.jersey} | {p.pos}</div>
                            </div>
                            <ChevronRight size={16} className="text-zinc-300 group-hover:text-black dark:group-hover:text-white" />
                        </Link>
                    ))}
                </div>
            )}

            {/* SCHEDULE */}
            {activeTab === 'schedule' && (
                <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900">
                    {data.schedule?.length > 0 ? data.schedule.map((game: any) => (
                        <div key={game.id} className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`font-black font-mono text-lg w-8 text-center ${game.result === 'W' ? 'text-green-600' : game.result === 'L' ? 'text-red-600' : 'text-zinc-400'}`}>
                                    {game.result || '-'}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-zinc-500 uppercase">{new Date(game.date).toLocaleDateString()}</div>
                                    <div className="font-black text-sm uppercase flex items-center gap-2 text-black dark:text-white">
                                        <span className="text-zinc-400 font-mono text-xs">VS</span> 
                                        {game.oppLogo && <img src={game.oppLogo} className="w-6 h-6 object-contain"/>}
                                        {game.opponent}
                                    </div>
                                </div>
                            </div>
                            <div className="font-mono font-bold text-lg text-black dark:text-white">{game.score}</div>
                        </div>
                    )) : (
                        <div className="p-8 text-center font-mono text-xs text-zinc-400">NO SCHEDULE DATA AVAILABLE</div>
                    )}
                </div>
            )}
        </div>
    );
}