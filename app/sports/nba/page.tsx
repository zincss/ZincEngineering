'use client';

import React, { useState, useEffect } from 'react';
import { Search, Trophy, LayoutGrid, ChevronRight, Loader2, User, Activity } from 'lucide-react';
import Link from 'next/link';
import { NBA_TEAMS, NBA_LOGOS, NBA_PLAYER_DB } from './data';

// ... (Keep TeamCard and PlayerCard components from previous turn, they were fine)
// Ensure PlayerCard has the ChevronRight import fixed if you copy-paste from older version
const TeamCard = ({ team }: { team: any }) => (
    <Link href={`/sports/nba/team/${team.id}`} className="group border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] dark:hover:shadow-[8px_8px_0px_0px_#333] transition-all duration-200 flex flex-col h-56 relative overflow-hidden">
        <div className={`h-32 bg-zinc-50 dark:bg-zinc-950 relative flex items-center justify-center p-6 overflow-hidden border-b-2 border-inherit`}>
            <img src={NBA_LOGOS[team.id]} className="h-20 w-auto object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500" alt={team.name} />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
            <h3 className="text-lg font-black uppercase leading-none text-black dark:text-white">{team.name}</h3>
            <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-zinc-400">
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 uppercase">NBA FRANCHISE</span>
            </div>
        </div>
    </Link>
);

const PlayerCard = ({ player }: { player: any }) => {
    const logo = NBA_LOGOS[player.team];
    return (
        <Link href={`/sports/nba/player/${player.id}`} className="group border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#333] transition-all flex items-center p-4 gap-4">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden relative">
                <img src={player.image || player.thumb} className="w-full h-full object-cover object-top" alt={player.name} onError={(e) => (e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png')} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {logo && <img src={logo} className="w-4 h-4 object-contain opacity-70" alt={player.team}/>}
                    <span className="text-[9px] font-bold text-zinc-400 uppercase truncate">{player.team}</span>
                </div>
                <h3 className="text-lg font-black uppercase leading-none truncate text-black dark:text-white group-hover:text-acid transition-colors">{player.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">{player.pos}</span>
                    {player.ppg && <span className="text-[9px] font-mono font-bold text-zinc-400 flex items-center gap-1"><Activity size={10} /> {player.ppg} PPG</span>}
                </div>
            </div>
            <ChevronRight size={16} className="text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors"/>
        </Link>
    );
};

export default function NBAHub() {
    const [viewMode, setViewMode] = useState<'teams' | 'players'>('teams');
    const [search, setSearch] = useState('');
    const [dynamicPlayers, setDynamicPlayers] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // --- LIVE API SEARCH ---
    useEffect(() => {
        const fetchPlayers = async () => {
            if (search.length < 3) {
                setDynamicPlayers([]); 
                return;
            }
            
            setIsSearching(true);
            try {
                // Search TheSportsDB
                const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(search)}`);
                const data = await res.json();
                
                if (data.player) {
                    const nbaPlayers = data.player.filter((p: any) => p.strSport === 'Basketball');
                    const mappedPlayers = nbaPlayers.map((p: any) => ({
                        id: p.idPlayer, 
                        name: p.strPlayer,
                        team: p.strTeam || 'Free Agent',
                        pos: p.strPosition,
                        thumb: p.strThumb || p.strCutout,
                        ppg: 0 // Stats unavailable in basic search
                    }));
                    setDynamicPlayers(mappedPlayers);
                } else {
                    setDynamicPlayers([]);
                }
            } catch (e) { console.error("Search Error:", e); } 
            finally { setIsSearching(false); }
        };

        const timeoutId = setTimeout(() => fetchPlayers(), 600);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const displayPlayers = search.length >= 3 ? dynamicPlayers : NBA_PLAYER_DB;

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 pt-12 pb-20">
            <div className="mb-12 border-b-2 border-black dark:border-zinc-700 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                        <Trophy size={14} />
                        <span className="font-mono text-[10px] font-bold tracking-widest">NATIONAL BASKETBALL ASSOCIATION</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none text-black dark:text-white transition-all duration-300">
                        {viewMode === 'teams' ? 'LEAGUE DATABASE' : 'PLAYER ROSTER'}
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
                    placeholder={viewMode === 'teams' ? "SEARCH FRANCHISES..." : "SEARCH PLAYERS (E.G. 'JORDAN')..."}
                    className="w-full h-14 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-500 pl-12 font-bold font-mono text-sm uppercase focus:outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                 />
            </div>

            {viewMode === 'teams' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {NBA_TEAMS.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map(team => (
                        <TeamCard key={team.id} team={team} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayPlayers.length > 0 ? (
                        displayPlayers.map(player => (
                            <PlayerCard key={player.id} player={player} />
                        ))
                    ) : (
                         <div className="col-span-full py-12 text-center text-zinc-400 font-mono text-xs border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                             PLAYER NOT FOUND.
                         </div>
                    )}
                </div>
            )}
        </div>
    );
}