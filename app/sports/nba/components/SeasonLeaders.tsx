'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Activity, TrendingUp, Loader2, Users, AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react';
import { getLeagueLeaders, getTeamData } from '../actions';
import { NBA_TEAMS } from '../data';

// --- ROSTER EXPLORER COMPONENT ---
const RosterExplorer = () => {
    const [selectedTeam, setSelectedTeam] = useState(NBA_TEAMS[0].espnId);
    const [roster, setRoster] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getTeamData(selectedTeam).then((data) => {
            if (data) setRoster(data.roster);
            setLoading(false);
        });
    }, [selectedTeam]);

    return (
        <div className="mt-8 border-t-2 border-zinc-100 dark:border-zinc-800 pt-8">
            <div className="flex items-center gap-2 text-black dark:text-white mb-6">
                <Users size={18} />
                <h3 className="text-xl font-black uppercase tracking-tighter">Roster Explorer</h3>
            </div>
            
            {/* Team Selector */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                {NBA_TEAMS.map(team => (
                    <button
                        key={team.id}
                        onClick={() => setSelectedTeam(team.espnId)}
                        className={`flex-shrink-0 w-12 h-12 rounded-full p-2 border-2 transition-all ${
                            selectedTeam === team.espnId 
                            ? 'border-acid bg-black' 
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 opacity-60 hover:opacity-100'
                        }`}
                    >
                        <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>

            {/* Roster Grid */}
            {loading ? (
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <Loader2 className="animate-spin text-zinc-400" size={20}/>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {roster.map((player: any) => (
                        <Link 
                            href={`/sports/nba/player/${player.id}`} 
                            key={player.id}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-500 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                                <img src={player.image} alt={player.name} className="w-full h-full object-cover scale-125 pt-2" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs uppercase text-black dark:text-white truncate">{player.name}</div>
                                <div className="text-[10px] font-mono text-zinc-500">
                                    #{player.number} • {player.pos} • {player.height}
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-zinc-300 group-hover:text-acid" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function SeasonLeaders() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchRankings = async () => {
        setLoading(true);
        setError(false);
        try {
            const candidates = await getLeagueLeaders();
            
            if (!candidates || candidates.length === 0) {
                throw new Error("No data returned");
            }

            // --- ZINC NBA ELO ENGINE ---
            const ranked = candidates.map((p: any) => {
                const s = p.stats;
                const ppg = parseFloat(s.ppg) || 0;
                const rpg = parseFloat(s.rpg) || 0;
                const apg = parseFloat(s.apg) || 0;
                const spg = parseFloat(s.spg) || 0;
                const bpg = parseFloat(s.bpg) || 0;
                const topg = parseFloat(s.topg) || 0;
                
                let score = 0;
                score += ppg * 1.0;
                score += rpg * 1.3;
                score += apg * 1.6;
                score += spg * 3.5;
                score += bpg * 3.5;
                score -= topg * 2.0;

                let tier = 'ROTOR';
                if (score >= 60) tier = 'GOD TIER';
                else if (score >= 50) tier = 'MVP FAVORITE';
                else if (score >= 45) tier = 'ALL-NBA';
                else if (score >= 35) tier = 'ALL-STAR';
                else if (score >= 25) tier = 'STARTER';

                return { ...p, elo: score.toFixed(1), tier, rawScore: score };
            }).sort((a: any, b: any) => b.rawScore - a.rawScore);

            setPlayers(ranked);
        } catch (err) {
            console.error("ELO Error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, []);

    const King = players[0];
    const Rest = players.slice(1);

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-8">
            
            {/* ELO HEADER */}
            <div className="bg-zinc-900 border-2 border-black dark:border-zinc-700 p-6 mb-8 flex flex-col justify-between gap-4">
                <div className="flex items-center gap-2 text-acid mb-2">
                    <Activity size={16}/>
                    <span className="font-bold font-mono text-xs tracking-widest">ZINC ELO ENGINE</span>
                </div>
                <p className="text-zinc-400 font-mono text-xs leading-relaxed">
                    <span className="text-white font-bold">LIVE PERFORMANCE RATINGS.</span> 
                    Updates daily based on weighted efficiency stats.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                    <Loader2 className="animate-spin text-acid" size={32}/>
                    <span className="font-mono text-xs animate-pulse text-zinc-400">ANALYZING LEAGUE DATA...</span>
                </div>
            ) : error ? (
                <div className="p-8 border-2 border-red-200 bg-red-50 dark:bg-red-900/10 text-red-600 font-mono text-xs flex flex-col items-center justify-center gap-4 text-center">
                    <div className="flex items-center gap-2">
                         <AlertTriangle size={16} /> UNABLE TO CALCULATE RANKINGS
                    </div>
                    <button 
                        onClick={fetchRankings}
                        className="px-4 py-2 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={12} /> RETRY CONNECTION
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* KING CARD */}
                    {King && (
                        <Link href={`/sports/nba/player/${King.id}`} className="block relative bg-black overflow-hidden border-b-4 border-acid group hover:opacity-95 transition-opacity mb-8">
                            <div className="absolute top-0 right-0 p-8 text-zinc-800 opacity-20">
                                <Crown size={300} strokeWidth={1} />
                            </div>
                            <div className="relative z-10 flex flex-col">
                                <div className="bg-zinc-900 flex items-end justify-center pt-8 overflow-hidden relative h-56">
                                    <div className="absolute top-4 left-4 z-20 bg-acid text-black font-black text-[10px] px-2 py-1 uppercase tracking-widest flex items-center gap-1">
                                        <Crown size={10} fill="currentColor"/> #1 RANKED
                                    </div>
                                    <img src={King.image} alt={King.name} className="h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-6 text-white">
                                    <h1 className="text-3xl font-black uppercase leading-none mb-2 tracking-tighter">{King.name}</h1>
                                    <div className="flex items-center gap-2 text-acid font-mono font-black text-2xl">
                                        <TrendingUp size={20} /> {King.elo}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* REST OF LIST */}
                    <div className="grid grid-cols-1 gap-2">
                        {Rest.map((p: any, i: number) => (
                            <Link 
                                href={`/sports/nba/player/${p.id}`} 
                                key={p.id} 
                                className="flex items-center gap-4 bg-white dark:bg-zinc-900 border-l-4 border-transparent hover:border-acid p-3 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 group"
                            >
                                <div className="w-6 font-mono font-black text-zinc-300 text-lg italic text-center">{i + 2}</div>
                                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                                    <img src={p.image} className="w-full h-full object-cover scale-125 pt-2" alt={p.name}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm uppercase leading-none text-black dark:text-white truncate mb-1">{p.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-bold px-1 rounded-sm uppercase tracking-widest ${
                                            p.tier.includes('GOD') ? 'bg-acid text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                                        }`}>{p.tier}</span>
                                        <span className="text-acid font-mono font-bold text-xs">{p.elo}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* NEW PLAYERS SECTION (ROSTER EXPLORER) */}
            <RosterExplorer />
        </div>
    );
}