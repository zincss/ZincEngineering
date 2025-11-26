'use client';

import React, { useState, useEffect } from 'react';
import { Search, Trophy, Loader2, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { NBA_TEAMS } from './data';
import { searchPlayers, getLiveScores } from './actions'; 

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
    if (games.length === 0) return null;

    return (
        <div className="mb-8 overflow-x-auto no-scrollbar border-b border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950">
            <div className="flex divide-x divide-zinc-200 dark:divide-zinc-800 min-w-max">
                <div className="px-4 py-3 flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest bg-white dark:bg-zinc-900 sticky left-0 z-10 border-r border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"/> LIVE
                </div>
                {games.map((game: any) => (
                    <div key={game.id} className="px-6 py-3 flex flex-col justify-center min-w-[140px] hover:bg-white dark:hover:bg-zinc-900 transition-colors group cursor-default">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-xs text-black dark:text-white">{game.home.name}</span>
                            <span className="font-mono font-bold text-sm text-black dark:text-white">{game.home.score}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-black dark:text-white">{game.away.name}</span>
                            <span className="font-mono font-bold text-sm text-black dark:text-white">{game.away.score}</span>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-400 mt-1 uppercase tracking-widest group-hover:text-acid transition-colors">{game.clock}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function NBAHub() {
    const [viewMode, setViewMode] = useState<'teams' | 'players'>('teams');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (search.length < 2) { setSearchResults([]); return; }
        
        setIsSearching(true);
        const timer = setTimeout(async () => {
            const results = await searchPlayers(search);
            setSearchResults(results);
            setIsSearching(false);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 pt-0 pb-20">
            <LiveScoreboard />
            
            <div className="mb-12 border-b-2 border-black dark:border-zinc-700 pb-8 flex flex-col md:flex-row justify-between items-end gap-6 pt-8">
                <div>
                    <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                        <Trophy size={14} />
                        <span className="font-mono text-[10px] font-bold tracking-widest">NATIONAL BASKETBALL ASSOCIATION</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none text-black dark:text-white transition-all duration-300">
                        {viewMode === 'teams' ? 'LEAGUE DATA' : 'PLAYER ROSTER'}
                    </h1>
                </div>
                <div className="flex gap-2">
                     <button onClick={() => setViewMode('teams')} className={`px-6 py-3 font-black font-mono text-xs uppercase tracking-widest border-2 transition-all ${viewMode === 'teams' ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_#000]' : 'text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'}`}>TEAMS</button>
                     <button onClick={() => setViewMode('players')} className={`px-6 py-3 font-black font-mono text-xs uppercase tracking-widest border-2 transition-all ${viewMode === 'players' ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_#000]' : 'text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'}`}>PLAYERS</button>
                </div>
            </div>

            <div className="mb-8 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    {isSearching ? <Loader2 size={20} className="animate-spin"/> : <Search size={20} />}
                 </div>
                 <input 
                    type="text" 
                    placeholder={viewMode === 'teams' ? "SEARCH FRANCHISES..." : "SEARCH PLAYERS (E.G. 'LEBRON')..."}
                    className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-12 font-bold font-mono text-lg uppercase focus:outline-none focus:border-acid transition-colors text-black dark:text-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                 />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {viewMode === 'teams' ? (
                    NBA_TEAMS.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map(team => (
                        <Link href={`/sports/nba/team/${team.id}`} key={team.id} className="group border-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white bg-white dark:bg-zinc-900 p-6 flex items-center gap-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div className={`w-16 h-16 rounded-full ${team.color} flex items-center justify-center shrink-0 shadow-md`}>
                                <span className="text-white font-black text-xl">{team.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase leading-none mb-1 text-black dark:text-white">{team.name}</h3>
                                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">{team.city}</span>
                            </div>
                        </Link>
                    ))
                ) : (
                    searchResults.length > 0 ? (
                        searchResults.map(player => (
                            <Link href={`/sports/nba/player/${player.id}`} key={player.id} className="group border-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white bg-white dark:bg-zinc-900 p-4 flex items-center gap-4 transition-all">
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative border border-zinc-200 dark:border-zinc-700 shrink-0">
                                    <img src={player.image} className="w-full h-full object-cover object-top" alt={player.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-sm uppercase truncate text-black dark:text-white">{player.name}</h3>
                                    <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase truncate">{player.team}</div>
                                </div>
                                <ChevronRight size={16} className="text-zinc-300 group-hover:text-black dark:group-hover:text-white"/>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <User size={32} className="mx-auto text-zinc-300 mb-4" />
                            <span className="font-mono text-xs text-zinc-400 uppercase">{isSearching ? 'SEARCHING ARCHIVES...' : 'ENTER PLAYER NAME TO INITIALIZE SEARCH'}</span>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}