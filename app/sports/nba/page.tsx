'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Loader2, AlertTriangle, TrendingUp, LayoutGrid, Users, Activity } from 'lucide-react';
import Link from 'next/link';
import { NBA_TEAMS } from './data';
import { getLiveScores, getStandings } from './actions'; 
import SeasonLeaders from './components/SeasonLeaders';
import PlayerSearch from './components/PlayerSearch';
import RosterExplorer from './components/RosterExplorer';

// --- LIVE SCOREBOARD ---
const LiveScoreboard = () => {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLiveScores().then((data) => {
            setGames(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="h-12 flex items-center justify-center text-[9px] font-mono animate-pulse text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">INITIALIZING LIVE FEED...</div>;
    
    if (games.length === 0) return (
        <div className="h-12 flex items-center justify-center text-[9px] font-mono text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            NO ACTIVE GAMES
        </div>
    );

    const loopGames = [...games, ...games, ...games, ...games]; 

    return (
        <div className="mb-8 border-b border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative flex items-center h-16">
            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-6 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-[4px_0_20px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"/> LIVE
                </div>
            </div>
            <div className="flex animate-scroll hover:[animation-play-state:paused] pl-28 w-max">
                <div className="flex divide-x divide-zinc-200 dark:divide-zinc-800">
                    {loopGames.map((game: any, i: number) => (
                        <div key={`${game.id}-${i}`} className="px-8 py-1 flex flex-col justify-center min-w-[220px] hover:bg-white dark:hover:bg-zinc-900 transition-colors group cursor-default">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <img src={game.home.logo} className="w-4 h-4 object-contain" />
                                    <span className="font-black text-xs text-black dark:text-white">{game.home.name}</span>
                                </div>
                                <span className="font-mono font-bold text-sm text-black dark:text-white">{game.home.score}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <img src={game.away.logo} className="w-4 h-4 object-contain" />
                                    <span className="font-black text-xs text-black dark:text-white">{game.away.name}</span>
                                </div>
                                <span className="font-mono font-bold text-sm text-black dark:text-white">{game.away.score}</span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest group-hover:text-acid transition-colors">{game.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- STANDINGS MODULE ---
const StandingsModule = () => {
    const [standings, setStandings] = useState<{east: any[], west: any[]}>({ east: [], west: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStandings().then((data) => {
            setStandings(data);
            setLoading(false);
        });
    }, []);

    const ConferenceTable = ({ title, teams }: { title: string, teams: any[] }) => (
        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <TrendingUp size={14} className="text-black dark:text-white"/>
                <span className="text-xs font-black tracking-widest uppercase">{title}</span>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-zinc-400 font-mono text-[10px] animate-pulse">
                    <Loader2 size={12} className="animate-spin"/> SYNCING STANDINGS...
                </div>
            ) : teams.length === 0 ? (
                <div className="flex items-center justify-center py-12 gap-2 text-zinc-400 font-mono text-[10px]">
                    <AlertTriangle size={12}/> DATA UNAVAILABLE
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[300px]">
                        <thead>
                            <tr className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                <th className="pb-2">Team</th>
                                <th className="pb-2 text-right">W</th>
                                <th className="pb-2 text-right">L</th>
                                <th className="pb-2 text-right">DIFF</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                            {teams.map((t, i) => (
                                <tr key={t.id} className="border-b border-zinc-50 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    <td className="py-2 flex items-center gap-2 font-bold text-black dark:text-white">
                                        <span className={`text-[9px] w-4 text-zinc-400`}>{i + 1}</span>
                                        <img src={t.logo} className="w-4 h-4 object-contain" />
                                        <span className="truncate max-w-[100px]">{t.name}</span>
                                    </td>
                                    <td className="py-2 text-right">{t.wins}</td>
                                    <td className="py-2 text-right">{t.losses}</td>
                                    <td className={`py-2 text-right ${t.diff > 0 ? 'text-green-500' : 'text-red-500'}`}>{t.diff > 0 ? '+' : ''}{t.diff}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <ConferenceTable title="EASTERN CONFERENCE" teams={standings.east} />
            <ConferenceTable title="WESTERN CONFERENCE" teams={standings.west} />
        </div>
    );
};

export default function NBAHub() {
    const [activeTab, setActiveTab] = useState<'league' | 'elo' | 'players'>('league');

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 pt-0 pb-20">
            <LiveScoreboard />
            
            {/* --- HEADER --- */}
            <div className="mb-12 border-b-2 border-black dark:border-zinc-700 pb-8 pt-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                        <Trophy size={14} />
                        <span className="font-mono text-[10px] font-bold tracking-widest">NATIONAL BASKETBALL ASSOCIATION</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black dark:text-white">
                        {activeTab === 'league' ? 'LEAGUE DATA' : activeTab === 'elo' ? 'ELO RANKINGS' : 'PLAYER DATABASE'}
                    </h1>
                </div>

                {/* --- TAB NAVIGATION --- */}
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setActiveTab('league')}
                            className={`px-4 py-3 font-black font-mono text-xs uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                                activeTab === 'league' 
                                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_#DFFF00]' 
                                : 'bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                            }`}
                        >
                            <LayoutGrid size={14} className="inline mr-2 mb-0.5"/> LEAGUE
                        </button>
                        <button 
                            onClick={() => setActiveTab('elo')}
                            className={`px-4 py-3 font-black font-mono text-xs uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                                activeTab === 'elo' 
                                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_#DFFF00]' 
                                : 'bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                            }`}
                        >
                            <Activity size={14} className="inline mr-2 mb-0.5"/> ELO RANKINGS
                        </button>
                        <button 
                            onClick={() => setActiveTab('players')}
                            className={`px-4 py-3 font-black font-mono text-xs uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                                activeTab === 'players' 
                                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_#DFFF00]' 
                                : 'bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                            }`}
                        >
                            <Users size={14} className="inline mr-2 mb-0.5"/> PLAYER DB
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* 1. LEAGUE VIEW (DEFAULT) */}
                {activeTab === 'league' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-12">
                            <StandingsModule />
                            
                            <div className="flex items-center gap-2 text-black dark:text-white mb-6">
                                <Users size={20} />
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Active Franchises</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {NBA_TEAMS.map(team => (
                                    <Link href={`/sports/nba/team/${team.id}`} key={team.id} className="group border-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white bg-white dark:bg-zinc-900 p-6 flex items-center gap-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                                        <div className={`w-16 h-16 rounded-full ${team.color} flex items-center justify-center shrink-0 shadow-md p-3 bg-white dark:bg-zinc-800`}>
                                            <img src={team.logo} className="w-full h-full object-contain" alt={team.name} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase leading-none mb-1 text-black dark:text-white">{team.name}</h3>
                                            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">{team.city}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. ELO RANKINGS VIEW */}
                {activeTab === 'elo' && (
                    <div className="max-w-4xl mx-auto">
                        <SeasonLeaders />
                    </div>
                )}

                {/* 3. PLAYER DATABASE VIEW */}
                {activeTab === 'players' && (
                    <div className="max-w-5xl mx-auto space-y-12">
                        <div>
                            <div className="flex items-center gap-2 text-black dark:text-white mb-4">
                                <Users size={20} />
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Global Athlete Search</h2>
                            </div>
                            <PlayerSearch />
                        </div>
                        
                        <RosterExplorer />
                    </div>
                )}

            </div>
        </div>
    );
}