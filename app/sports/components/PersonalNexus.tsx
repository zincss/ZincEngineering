'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, Activity, User, Search, Zap, Loader2, Target, BarChart3, CloudCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { updateSportsPrefs, getSportsPrefs, getAllTeams, searchNexusAthletes, getNexusTeamStats, getNexusPlayerStats } from '../actions';

interface SavedEntity {
    id: string;
    name: string;
    image: string;
    league: 'nfl' | 'nba';
    type: 'team' | 'player';
    recentStats?: any;
}

interface SportsPrefs {
    nfl: { team: SavedEntity | null, players: SavedEntity[] };
    nba: { team: SavedEntity | null, players: SavedEntity[] };
}

export default function PersonalNexus() {
    const { user } = useAuth();
    const [isMinimized, setIsMinimized] = useState(true);
    const [league, setLeague] = useState<'nfl' | 'nba'>('nfl');
    const [prefs, setPrefs] = useState<SportsPrefs>({
        nfl: { team: null, players: [] },
        nba: { team: null, players: [] }
    });

    const [isAdding, setIsAdding] = useState<'team' | 'player' | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [allTeams, setAllTeams] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const favTeam = prefs[league].team;
    const favPlayers = prefs[league].players;

    useEffect(() => {
        if (!user) return;
        async function load() {
            const data = await getSportsPrefs();
            if (data) {
                const normalized: SportsPrefs = {
                    nfl: data.nfl || (data.league === 'nfl' ? { team: data.team, players: data.players } : { team: null, players: [] }),
                    nba: data.nba || (data.league === 'nba' ? { team: data.team, players: data.players } : { team: null, players: [] })
                };
                setPrefs(normalized);
            }
        }
        load();
    }, [user]);

    const syncStats = useCallback(async () => {
        if (!user) return;
        const currentLeaguePrefs = prefs[league];
        if (!currentLeaguePrefs.team && currentLeaguePrefs.players.length === 0) return;

        if (currentLeaguePrefs.team && (!currentLeaguePrefs.team.recentStats || typeof currentLeaguePrefs.team.recentStats === 'string')) {
            const stats = await getNexusTeamStats(league, currentLeaguePrefs.team.id);
            if (stats) {
                setPrefs(prev => ({
                    ...prev,
                    [league]: { ...prev[league], team: { ...prev[league].team!, recentStats: stats } }
                }));
            }
        }

        const updatedPlayers = await Promise.all(currentLeaguePrefs.players.map(async (p) => {
            if (p.recentStats && typeof p.recentStats === 'object') return p;
            const stats = await getNexusPlayerStats(league, p.id);
            return { ...p, recentStats: stats };
        }));

        if (JSON.stringify(updatedPlayers) !== JSON.stringify(currentLeaguePrefs.players)) {
            setPrefs(prev => ({
                ...prev,
                [league]: { ...prev[league], players: updatedPlayers }
            }));
        }
    }, [user, league, prefs[league].team?.id, prefs[league].players.length]);

    useEffect(() => {
        syncStats();
    }, [syncStats]);

    const saveToDb = async (newPrefs: SportsPrefs) => {
        if (!user) return;
        setSyncing(true);
        await updateSportsPrefs(newPrefs);
        setSyncing(false);
    };

    const handleSelect = async (id: string, name: string, img?: string) => {
        const entity: SavedEntity = {
            id,
            name,
            image: img || (isAdding === 'team' ? `https://a.espncdn.com/i/teamlogos/${league}/500/${id}.png` : `https://a.espncdn.com/i/headshots/${league}/players/full/${id}.png`),
            league,
            type: isAdding as 'team' | 'player',
            recentStats: 'Syncing...'
        };

        let newPrefs = { ...prefs };
        if (isAdding === 'team') {
            newPrefs[league].team = entity;
        } else {
            if (newPrefs[league].players.length < 5) {
                newPrefs[league].players = [...newPrefs[league].players, entity];
            }
        }
        setPrefs(newPrefs);
        await saveToDb(newPrefs);
        setIsAdding(null);
        setSearchQuery('');
    };

    const removePlayer = async (id: string) => {
        const newPlayers = prefs[league].players.filter(p => p.id !== id);
        const newPrefs = { ...prefs, [league]: { ...prefs[league], players: newPlayers } };
        setPrefs(newPrefs);
        await saveToDb(newPrefs);
    };

    const dismissTeam = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newPrefs = { ...prefs, [league]: { ...prefs[league], team: null } };
        setPrefs(newPrefs);
        await saveToDb(newPrefs);
    };

    useEffect(() => {
        if (isAdding !== 'team') return;
        async function fetchTeams() {
            setSearching(true);
            const teams = await getAllTeams(league);
            setAllTeams(teams);
            setSearching(false);
        }
        fetchTeams();
    }, [isAdding, league]);

    useEffect(() => {
        if (isAdding !== 'player' || !searchQuery || searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            const results = await searchNexusAthletes(league, searchQuery);
            setSearchResults(results);
            setSearching(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, league, isAdding]);

    if (!user) return (
        <div className="mt-8 bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8 sm:p-12 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-[0.3em]">Personal Favourites // Standby</div>
            <div className="absolute inset-0 bg-[#DFFF00] blur-[150px] opacity-[0.03] rounded-full" />
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 mb-6 relative z-10"><Star size={24} /></div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tighter italic relative z-10">Personal <span className="text-[#DFFF00]">Favourites</span></h3>
            <p className="text-zinc-500 text-xs sm:text-sm max-w-sm mt-3 mb-8 font-mono uppercase tracking-[0.2em] leading-relaxed relative z-10">Save your favourite team and players for quick access.</p>
            <Link href="/login" className="relative z-10 px-8 py-3 bg-[#DFFF00] text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(223,255,0,0.2)]">Initialize Favourites</Link>
        </div>
    );

    return (
        <div className="mt-8 bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-32 bg-[#DFFF00] blur-[150px] opacity-[0.02] rounded-full pointer-events-none" />
            
            <div className="p-5 sm:p-6 border-b border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[#DFFF00] shadow-inner hover:border-[#DFFF00]/50 transition-colors"
                    >
                        {isMinimized ? <ChevronRight size={20} className="rotate-90" /> : <ChevronRight size={20} className="-rotate-90" />}
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white italic leading-none flex items-center gap-3">Personal <span className="text-[#DFFF00]">Favourites</span> {syncing && <Loader2 size={14} className="animate-spin text-zinc-600" />}</h2>
                        <p className="hidden sm:flex text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mt-1.5 items-center gap-2"><CloudCheck size={12} className="text-emerald-500" /> Cloud Synchronized</p>
                    </div>
                </div>
                {!isMinimized && (
                    <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner w-full sm:w-auto">
                        <button onClick={() => setLeague('nfl')} className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${league === 'nfl' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>NFL</button>
                        <button onClick={() => setLeague('nba')} className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${league === 'nba' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>NBA</button>
                    </div>
                )}
                {isMinimized && (
                    <div className="flex items-center gap-4">
                        {favTeam && <img src={favTeam.image} className="w-8 h-8 object-contain opacity-50" alt="" />}
                        <div className="flex -space-x-3">
                            {favPlayers.map(p => (
                                <div key={p.id} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-900 overflow-hidden opacity-50">
                                    <img src={p.image} className="w-full h-full object-cover" alt="" />
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => setIsMinimized(false)}
                            className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all"
                        >
                            Expand
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {!isMinimized && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative z-10 border-t border-zinc-800">
                            <div className="lg:col-span-4 flex flex-col">
                                <div className="flex items-center justify-between mb-4 h-4">
                                    <div className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em]">Favourite Team</div>
                                    {favTeam && <button onClick={dismissTeam} className="text-[9px] font-mono font-bold text-zinc-600 hover:text-red-500 uppercase">Dismiss</button>}
                                </div>
                                {favTeam ? (
                                    <div className="group relative block bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-[#DFFF00]/50 transition-all overflow-hidden h-[180px] shadow-lg flex flex-col cursor-pointer" onClick={() => setIsAdding('team')}>
                                        <div className="absolute top-0 right-0 p-12 bg-[#DFFF00] blur-3xl opacity-5 group-hover:opacity-10 transition-opacity" />
                                        <div className="relative z-10 flex items-center gap-5 mb-4">
                                            <div className="w-14 h-14 bg-zinc-950 rounded-2xl border border-zinc-800 p-2.5 group-hover:border-[#DFFF00]/30 shadow-2xl transition-all shrink-0"><img src={favTeam.image} className="w-full h-full object-contain" alt="" /></div>
                                            <div className="min-w-0">
                                                <div className="text-lg font-black text-white uppercase tracking-tighter italic group-hover:text-[#DFFF00] transition-colors leading-none mb-1 truncate">{favTeam.name}</div>
                                                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Click to Reassign</div>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-zinc-800/50 flex justify-between items-center relative z-10">
                                            {favTeam.recentStats && typeof favTeam.recentStats === 'object' ? (
                                                <>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">vs {favTeam.recentStats.opponent}</span>
                                                        <span className="text-xl font-mono font-black text-white group-hover:text-[#DFFF00] leading-none tracking-tighter italic">{favTeam.recentStats.score}</span>
                                                    </div>
                                                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-mono font-black text-base ${favTeam.recentStats.result === 'W' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                                        {favTeam.recentStats.result}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-3 text-zinc-700 animate-pulse font-mono text-[9px] uppercase tracking-widest">
                                                    <Loader2 size={12} className="animate-spin" /> Uplink Active...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => setIsAdding('team')} className="bg-zinc-900/30 border-2 border-zinc-800 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center h-[180px] group hover:bg-zinc-900/50 hover:border-[#DFFF00]/30 transition-all cursor-pointer">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover:text-[#DFFF00] mb-4 transition-all"><Plus size={24} /></div>
                                        <div className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em] group-hover:text-zinc-400">Assign Favourite Team</div>
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-8 flex flex-col">
                                <div className="flex items-center mb-4 h-4">
                                    <div className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em]">Favourite Players (0{favPlayers.length}/05)</div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                                    {favPlayers.map(player => (
                                        <div key={player.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 hover:border-[#DFFF00]/50 transition-all flex flex-col items-center text-center shadow-lg h-[180px]">
                                            <button onClick={(e) => { e.stopPropagation(); removePlayer(player.id); }} className="absolute top-3 right-3 p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 z-20"><X size={12} /></button>
                                            
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-zinc-800 bg-zinc-950 overflow-hidden mb-3 group-hover:border-[#DFFF00]/30 shadow-2xl transition-all mx-auto relative shrink-0">
                                                <img src={player.image} className="w-full h-full object-cover translate-y-1 scale-110" alt="" />
                                            </div>
                                            <div className="text-[10px] sm:text-[11px] font-black text-white uppercase leading-tight truncate w-full mb-3 group-hover:text-[#DFFF00] transition-colors">{player.name}</div>
                                            
                                            <div className="mt-auto w-full border-t border-zinc-800/50 pt-3 flex gap-px bg-zinc-800/50 rounded-xl overflow-hidden shrink-0">
                                                {player.recentStats && typeof player.recentStats === 'object' ? (
                                                    <>
                                                        <div className="flex-1 bg-zinc-950/50 py-1.5 flex flex-col items-center">
                                                            <span className="text-[6px] sm:text-[7px] font-mono font-bold text-zinc-600 uppercase leading-none mb-1">{player.recentStats.s1.l}</span>
                                                            <span className="text-[9px] sm:text-[11px] font-mono font-black text-white group-hover:text-[#DFFF00] leading-none">{player.recentStats.s1.v}</span>
                                                        </div>
                                                        <div className="flex-1 bg-zinc-950/50 py-1.5 flex flex-col items-center">
                                                            <span className="text-[6px] sm:text-[7px] font-mono font-bold text-zinc-600 uppercase leading-none mb-1">{player.recentStats.s2.l}</span>
                                                            <span className="text-[9px] sm:text-[11px] font-mono font-black text-white group-hover:text-[#DFFF00] leading-none">{player.recentStats.s2.v}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full py-2 text-[8px] font-mono font-black text-zinc-700 animate-pulse uppercase tracking-tighter">Syncing...</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {favPlayers.length < 5 && Array.from({ length: 5 - favPlayers.length }).map((_, i) => (
                                        <div key={i} onClick={() => setIsAdding('player')} className="bg-zinc-900/30 border-2 border-zinc-800 border-dashed rounded-3xl h-[180px] flex flex-col items-center justify-center group hover:bg-zinc-900/50 hover:border-[#DFFF00]/30 transition-all cursor-pointer">
                                            <Plus size={18} className="text-zinc-700 group-hover:text-[#DFFF00] mb-3" />
                                            <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] group-hover:text-zinc-500">Vacant</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl p-4 sm:p-8 flex flex-col items-center justify-center">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] w-full max-w-4xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[#DFFF00]"><Search size={20} /></div>
                                    <h3 className="text-xl sm:text-2xl font-black uppercase italic text-white tracking-tighter">Assign <span className="text-[#DFFF00]">{isAdding === 'team' ? `${league.toUpperCase()} Favourite` : 'Favourite Player'}</span></h3>
                                </div>
                                <button onClick={() => { setIsAdding(null); setSearchQuery(''); }} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all"><X size={20} /></button>
                            </div>

                            {isAdding === 'player' && (
                                <div className="relative mb-6 sm:mb-8 shrink-0">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                    <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ENTER PLAYER NAME IDENTIFIER..." className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 sm:py-5 pl-14 pr-6 text-white font-mono text-sm focus:outline-none focus:border-[#DFFF00]/50 transition-all placeholder:text-zinc-700" />
                                    {searching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 text-[#DFFF00] animate-spin" size={20} />}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {isAdding === 'team' ? (
                                    searching ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-zinc-700 gap-4">
                                            <Loader2 size={40} className="animate-spin text-[#DFFF00]" />
                                            <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Decoding League Matrix...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 pb-8">
                                            {allTeams.length > 0 ? allTeams.map((team: any) => (
                                                <button key={team.id} onClick={() => handleSelect(team.id, team.displayName)} className="group flex flex-col items-center gap-3 p-3 sm:p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-[#DFFF00] hover:border-[#DFFF00] transition-all">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                                                        <img src={`https://a.espncdn.com/i/teamlogos/${league}/500/${team.id}.png`} className="w-full h-full object-contain" alt="" />
                                                    </div>
                                                    <div className="text-[7px] sm:text-[8px] font-black uppercase text-center text-zinc-500 group-hover:text-black leading-tight line-clamp-2">{team.displayName}</div>
                                                </button>
                                            )) : (
                                                <div className="col-span-full py-20 text-center text-zinc-700 font-mono text-[10px] uppercase tracking-[0.3em]">No League Assets Detected // Check Connection</div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 pb-8">
                                        {searchResults.map((result: any) => (
                                            <button key={result.id} onClick={() => handleSelect(result.id, result.displayName, result.image)} className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-[#DFFF00] hover:border-[#DFFF00] group transition-all text-left">
                                                <div className="w-12 h-12 bg-black rounded-lg border border-zinc-800 p-2 flex items-center justify-center overflow-hidden group-hover:border-black/20"><img src={result.image || `https://a.espncdn.com/i/headshots/${league}/players/full/${result.id}.png`} className="w-full h-full object-contain translate-y-1" alt="" /></div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-black uppercase text-white group-hover:text-black transition-colors">{result.displayName}</div>
                                                    <div className="text-[10px] font-mono text-zinc-500 group-hover:text-black/60 transition-colors">{result.id} // ACTIVE_PLAYER</div>
                                                </div>
                                                <Plus size={18} className="text-zinc-700 group-hover:text-black transition-colors" />
                                            </button>
                                        ))}
                                        {searchQuery.length >= 3 && !searching && searchResults.length === 0 && (
                                            <div className="text-center py-12 text-zinc-600 font-mono text-xs uppercase tracking-[0.2em]">No Field Agents Detected</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
