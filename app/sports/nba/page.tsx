'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Loader2, AlertTriangle, TrendingUp, LayoutGrid, Users, Activity, Terminal } from 'lucide-react';
import Link from 'next/link';
import { NBA_TEAMS } from './data';
import { getLiveScores, getStandings } from './actions'; 
import SeasonLeaders from './components/SeasonLeaders';
import PlayerSearch from './components/PlayerSearch';
import RosterExplorer from './components/RosterExplorer';

// --- LOADER OVERLAY ---
const NavigationLoader = () => (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-[#DFFF00] blur-2xl opacity-20 animate-pulse"></div>
           <div className="w-16 h-16 border-2 border-zinc-800 border-t-[#DFFF00] rounded-full animate-spin relative z-10"></div>
           <div className="absolute inset-0 flex items-center justify-center z-10">
               <Activity size={24} className="text-[#DFFF00]" />
           </div>
        </div>
        <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-sm font-black tracking-[0.2em] uppercase">
                <Terminal size={14} />
                <span>ACCESSING DATABASE</span>
            </div>
            <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-widest animate-pulse">
                RETRIEVING SECURE DATA...
            </span>
        </div>
    </div>
);

// --- LIVE SCOREBOARD (DARK MODE ONLY) ---
const LiveScoreboard = () => {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLiveScores().then((data) => {
            setGames(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="h-12 flex items-center justify-center text-[9px] font-mono animate-pulse text-zinc-500 border-b border-zinc-800 bg-black">INITIALIZING LIVE FEED...</div>;
    
    if (games.length === 0) return (
        <div className="h-12 flex items-center justify-center text-[9px] font-mono text-zinc-500 border-b border-zinc-800 bg-black">
            NO ACTIVE GAMES
        </div>
    );

    // Create a loop for seamless scrolling
    const loopGames = [...games, ...games, ...games, ...games]; 

    return (
        <div className="mb-12 border-b border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden relative flex items-center h-16">
            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-6 bg-black border-r border-zinc-800">
                <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"/> LIVE
                </div>
            </div>
            {/* FIXED: Changed 'animate-scroll' to 'animate-ticker' to match tailwind.config.js */}
            <div className="flex animate-ticker hover:[animation-play-state:paused] pl-28 w-max">
                <div className="flex divide-x divide-zinc-800">
                    {loopGames.map((game: any, i: number) => (
                        <div key={`${game.id}-${i}`} className="px-8 py-1 flex flex-col justify-center min-w-[220px] hover:bg-zinc-900 transition-colors group cursor-default">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <img src={game.home.logo} className="w-4 h-4 object-contain" />
                                    <span className="font-black text-xs text-white">{game.home.name}</span>
                                </div>
                                <span className="font-mono font-bold text-sm text-white">{game.home.score}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <img src={game.away.logo} className="w-4 h-4 object-contain" />
                                    <span className="font-black text-xs text-white">{game.away.name}</span>
                                </div>
                                <span className="font-mono font-bold text-sm text-white">{game.away.score}</span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-[#DFFF00] transition-colors">{game.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- STANDINGS MODULE (DARK) ---
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
        <div className="bg-black border border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
                <TrendingUp size={14} className="text-white"/>
                <span className="text-xs font-black tracking-widest uppercase text-white">{title}</span>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-zinc-500 font-mono text-[10px] animate-pulse">
                    <Loader2 size={12} className="animate-spin"/> SYNCING STANDINGS...
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[300px]">
                        <thead>
                            <tr className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                <th className="pb-2">Team</th>
                                <th className="pb-2 text-right">W</th>
                                <th className="pb-2 text-right">L</th>
                                <th className="pb-2 text-right">DIFF</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-xs text-zinc-300">
                            {teams.map((t, i) => (
                                <tr key={t.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900 transition-colors">
                                    <td className="py-2 flex items-center gap-2 font-bold text-white">
                                        <span className={`text-[9px] w-4 text-zinc-600`}>{i + 1}</span>
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
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'league' | 'elo' | 'players'>('league');
    const [isNavigating, setIsNavigating] = useState(false);

    const handleNavigate = (url: string) => {
        setIsNavigating(true);
        router.push(url);
    };

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 pt-0 pb-20">
            {/* BACKGROUND */}
            <div className="bg-starfield">
                <div className="stars-1"></div>
                <div className="stars-2"></div>
                <div className="stars-3"></div>
            </div>

            {/* NAVIGATION LOADER */}
            {isNavigating && <NavigationLoader />}

            <LiveScoreboard />
            
            {/* --- HEADER --- */}
            <div className="mb-12 border-b border-zinc-800 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Trophy size={14} className="text-[#DFFF00]" />
                        <span className="font-mono text-[10px] font-bold tracking-widest text-[#DFFF00]">NATIONAL BASKETBALL ASSOCIATION</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white">
                        {activeTab === 'league' ? 'LEAGUE DATA' : activeTab === 'elo' ? 'ELO RANKINGS' : 'PLAYER DATABASE'}
                    </h1>
                </div>

                {/* --- TAB NAVIGATION --- */}
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                    <div className="flex gap-2">
                        {['league', 'elo', 'players'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-3 font-black font-mono text-xs uppercase tracking-widest border transition-all whitespace-nowrap ${
                                    activeTab === tab 
                                    ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.3)]' 
                                    : 'bg-black/50 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white backdrop-blur-sm'
                                }`}
                            >
                                {tab === 'league' && <LayoutGrid size={14} className="inline mr-2 mb-0.5"/>}
                                {tab === 'elo' && <Activity size={14} className="inline mr-2 mb-0.5"/>}
                                {tab === 'players' && <Users size={14} className="inline mr-2 mb-0.5"/>}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'league' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-12">
                            <StandingsModule />
                            
                            <div className="flex items-center gap-2 text-white mb-6">
                                <Users size={20} />
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Active Franchises</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {NBA_TEAMS.map(team => (
                                    <div 
                                        key={team.id} 
                                        onClick={() => handleNavigate(`/sports/nba/team/${team.id}`)}
                                        className="group cursor-pointer border border-zinc-800 hover:border-[#DFFF00] bg-black/50 backdrop-blur-sm p-6 flex items-center gap-6 transition-all hover:-translate-y-1"
                                    >
                                        <div className={`w-16 h-16 rounded-full ${team.color} flex items-center justify-center shrink-0 shadow-md p-3 bg-zinc-900 border border-zinc-700`}>
                                            <img src={team.logo} className="w-full h-full object-contain" alt={team.name} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase leading-none mb-1 text-white group-hover:text-[#DFFF00] transition-colors">{team.name}</h3>
                                            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{team.city}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'elo' && (
                    <div className="max-w-4xl mx-auto">
                        <SeasonLeaders />
                    </div>
                )}

                {activeTab === 'players' && (
                    <div className="max-w-5xl mx-auto space-y-12">
                        <div>
                            <div className="flex items-center gap-2 text-white mb-4">
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