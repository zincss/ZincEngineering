'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Activity, TrendingUp, Loader2, AlertTriangle, RefreshCw, CalendarClock } from 'lucide-react';
import { getLeagueLeaders } from '../actions';

export default function SeasonLeaders() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [seasonLabel, setSeasonLabel] = useState('LOADING...');

    const fetchRankings = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await getLeagueLeaders();
            
            setSeasonLabel(data.seasonLabel);

            const ranked = data.players.map((p: any) => {
                const s = p.stats;
                const ppg = parseFloat(s.ppg) || 0;
                const rpg = parseFloat(s.rpg) || 0;
                const apg = parseFloat(s.apg) || 0;
                const spg = parseFloat(s.spg) || 0;
                const bpg = parseFloat(s.bpg) || 0;
                const topg = parseFloat(s.topg) || 0;
                
                // Weighted Efficiency Formula
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
            
            <div className="bg-zinc-900 border-2 border-black dark:border-zinc-700 p-6 mb-8 flex flex-col justify-between gap-4">
                <div className="flex items-center gap-2 text-acid mb-2">
                    <Activity size={16}/>
                    <span className="font-bold font-mono text-xs tracking-widest">ZINC ELO ENGINE // <span className="text-white uppercase">{seasonLabel}</span></span>
                </div>
                <p className="text-zinc-400 font-mono text-xs leading-relaxed">
                    <span className="text-white font-bold">REAL-TIME RATINGS.</span> 
                    Official league leaders ranked by weighted efficiency.
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
            ) : players.length === 0 ? (
                 <div className="p-8 border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 font-mono text-xs flex flex-col items-center justify-center gap-2 text-center">
                    <CalendarClock size={24} className="mb-2 opacity-50"/>
                    <span className="font-bold text-black dark:text-white">NO ACTIVE DATA</span>
                    <p className="max-w-xs mx-auto">System could not retrieve data for the current or previous season.</p>
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
                                    <div className="mt-2 grid grid-cols-3 gap-4 border-t border-white/20 pt-2">
                                        <div>
                                            <span className="text-[9px] text-zinc-400 uppercase">PTS</span>
                                            <div className="text-lg font-bold font-mono">{King.stats.ppg}</div>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-zinc-400 uppercase">REB</span>
                                            <div className="text-lg font-bold font-mono">{King.stats.rpg}</div>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-zinc-400 uppercase">AST</span>
                                            <div className="text-lg font-bold font-mono">{King.stats.apg}</div>
                                        </div>
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
        </div>
    );
}