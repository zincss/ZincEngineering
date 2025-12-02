'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, TrendingUp, Crown, Medal, Info, ChevronDown, Percent } from 'lucide-react';

// --- THE GOLDEN ARCHIVE: VERIFIED CAREER STATS ---
// (Keep the existing LEGEND_STATS object exactly as is to save space in this response)
const LEGEND_STATS: Record<string, any> = {
    'michael_schumacher': { name: 'Michael Schumacher', wins: 91, podiums: 155, poles: 68, entries: 308, titles: 7 },
    'hamilton': { name: 'Lewis Hamilton', wins: 105, podiums: 201, poles: 104, entries: 350, titles: 7 },
    'max_verstappen': { name: 'Max Verstappen', wins: 62, podiums: 111, poles: 40, entries: 206, titles: 4 },
    'vettel': { name: 'Sebastian Vettel', wins: 53, podiums: 122, poles: 57, entries: 299, titles: 4 },
    'prost': { name: 'Alain Prost', wins: 51, podiums: 106, poles: 33, entries: 202, titles: 4 },
    'senna': { name: 'Ayrton Senna', wins: 41, podiums: 80, poles: 65, entries: 162, titles: 3 },
    'alonso': { name: 'Fernando Alonso', wins: 32, podiums: 106, poles: 22, entries: 398, titles: 2 },
    'mansell': { name: 'Nigel Mansell', wins: 31, podiums: 59, poles: 32, entries: 187, titles: 1 },
    'stewart': { name: 'Jackie Stewart', wins: 27, podiums: 43, poles: 17, entries: 99, titles: 3 },
    'clark': { name: 'Jim Clark', wins: 25, podiums: 32, poles: 33, entries: 73, titles: 2 },
    'lauda': { name: 'Niki Lauda', wins: 25, podiums: 54, poles: 24, entries: 177, titles: 3 },
    'fangio': { name: 'Juan Manuel Fangio', wins: 24, podiums: 35, poles: 29, entries: 52, titles: 5 },
    'piquet': { name: 'Nelson Piquet', wins: 23, podiums: 60, poles: 24, entries: 207, titles: 3 },
    'rosberg': { name: 'Nico Rosberg', wins: 23, podiums: 57, poles: 30, entries: 206, titles: 1 },
    'raikkonen': { name: 'Kimi Raikkonen', wins: 21, podiums: 103, poles: 18, entries: 353, titles: 1 },
    'hakkinen': { name: 'Mika Hakkinen', wins: 20, podiums: 51, poles: 26, entries: 161, titles: 2 },
    'moss': { name: 'Stirling Moss', wins: 16, podiums: 24, poles: 16, entries: 67, titles: 0 },
    'button': { name: 'Jenson Button', wins: 15, podiums: 50, poles: 8, entries: 306, titles: 1 },
    'jack_brabham': { name: 'Jack Brabham', wins: 14, podiums: 31, poles: 13, entries: 123, titles: 3 },
    'graham_hill': { name: 'Graham Hill', wins: 14, podiums: 36, poles: 13, entries: 175, titles: 2 },
    'emerson_fittipaldi': { name: 'Emerson Fittipaldi', wins: 14, podiums: 35, poles: 6, entries: 144, titles: 2 },
    'ascari': { name: 'Alberto Ascari', wins: 13, podiums: 17, poles: 14, entries: 33, titles: 2 },
    'coulthard': { name: 'David Coulthard', wins: 13, podiums: 62, poles: 12, entries: 246, titles: 0 },
    'mario_andretti': { name: 'Mario Andretti', wins: 12, podiums: 19, poles: 18, entries: 128, titles: 1 },
    'reutemann': { name: 'Carlos Reutemann', wins: 12, podiums: 45, poles: 6, entries: 146, titles: 0 },
    'jones': { name: 'Alan Jones', wins: 12, podiums: 24, poles: 6, entries: 116, titles: 1 },
    'jacques_villeneuve': { name: 'Jacques Villeneuve', wins: 11, podiums: 23, poles: 13, entries: 163, titles: 1 },
    'massa': { name: 'Felipe Massa', wins: 11, podiums: 41, poles: 16, entries: 269, titles: 0 },
    'barrichello': { name: 'Rubens Barrichello', wins: 11, podiums: 68, poles: 14, entries: 322, titles: 0 },
    'peterson': { name: 'Ronnie Peterson', wins: 10, podiums: 26, poles: 14, entries: 123, titles: 0 },
    'hunt': { name: 'James Hunt', wins: 10, podiums: 23, poles: 14, entries: 92, titles: 1 },
    'jody_scheckter': { name: 'Jody Scheckter', wins: 10, podiums: 33, poles: 3, entries: 112, titles: 1 },
    'berger': { name: 'Gerhard Berger', wins: 10, podiums: 48, poles: 12, entries: 210, titles: 0 },
    'bottas': { name: 'Valtteri Bottas', wins: 10, podiums: 67, poles: 20, entries: 232, titles: 0 },
    'webber': { name: 'Mark Webber', wins: 9, podiums: 42, poles: 13, entries: 215, titles: 0 },
    'leclerc': { name: 'Charles Leclerc', wins: 8, podiums: 41, poles: 26, entries: 144, titles: 0 },
    'ricciardo': { name: 'Daniel Ricciardo', wins: 8, podiums: 32, poles: 3, entries: 257, titles: 0 },
};

export default function EloLeaderboard() {
    const [ratings, setRatings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(15);

    useEffect(() => {
        const calculateElo = async () => {
            let calculatedRatings: any[] = [];
            const driverIds = Object.keys(LEGEND_STATS);
            
            for (const id of driverIds) {
                const stats = LEGEND_STATS[id];
                
                // --- ZINC ELO ENGINE V6.0 ---
                let score = 1000;
                score += (stats.titles * 2500); 
                score += (stats.wins * 75);
                score += (stats.poles * 40);
                
                // Efficiency Bonus
                if (stats.entries > 10) {
                    const winRate = (stats.wins / stats.entries);
                    score += (winRate * 6000); 
                    const podiumRate = (stats.podiums / stats.entries);
                    score += (podiumRate * 1000);
                }
                
                // "Uncrowned King" Bonus
                if (stats.titles === 0 && stats.wins >= 10) {
                    score += 3000;
                }

                let tier = 'ROOKIE';
                if (score > 18000) tier = 'GOD TIER';
                else if (score > 12000) tier = 'GRANDMASTER';
                else if (score > 8000) tier = 'LEGEND';
                else if (score > 5000) tier = 'CHAMPION';
                else if (score > 2000) tier = 'ELITE';
                else if (score > 1200) tier = 'PRO';

                calculatedRatings.push({
                    id,
                    name: stats.name,
                    elo: Math.floor(score),
                    ...stats,
                    tier,
                    winRate: ((stats.wins / stats.entries) * 100).toFixed(1)
                });
            }
            
            // Sort by ELO High -> Low
            setRatings(calculatedRatings.sort((a, b) => b.elo - a.elo));
            setLoading(false);
        };

        calculateElo();
    }, []);

    const handleLoadMore = () => setVisibleCount(prev => prev + 15);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            
            {/* HEADER */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 mb-8">
                <div className="flex items-center gap-2 text-[#DFFF00] mb-2">
                    <Info size={14}/>
                    <span className="font-bold font-mono text-xs tracking-widest">ZINC ELO ENGINE // 1.0 BETA</span>
                </div>
                <p className="text-zinc-400 font-mono text-xs max-w-3xl leading-relaxed">
                    <span className="text-[#DFFF00] font-bold">WORK IN PROGRESS.</span> This experimental system calculates a Skill Rating based on weighted factors: 
                    <span className="text-white"> Championships (2500)</span>, <span className="text-white">Win Dominance (6000)</span>, <span className="text-white">Wins (75)</span>, and <span className="text-white">Poles (40)</span>. 
                    Includes logic to boost 'Uncrowned Kings' like Stirling Moss.
                </p>
            </div>
            
            {/* LOADING STATE */}
            {loading && (
                 <div className="flex flex-col items-center justify-center py-20 gap-4">
                     <Loader2 className="animate-spin text-[#DFFF00]" size={32}/>
                     <span className="font-mono text-xs animate-pulse text-zinc-500">CALCULATING LEGACY RATINGS...</span>
                 </div>
            )}

            {/* GRID */}
            <div className="flex flex-col gap-2">
                {ratings.slice(0, visibleCount).map((r, i) => (
                    <Link 
                        href={`/sports/f1/driver/${r.id}`} 
                        key={r.id} 
                        className="flex items-center justify-between bg-zinc-900/50 border border-transparent hover:border-[#DFFF00] hover:bg-zinc-900 p-4 group transition-all duration-300"
                    >
                        {/* Left: Rank & Name */}
                        <div className="flex items-center gap-6">
                            <div className={`w-10 h-10 flex items-center justify-center font-black font-mono text-lg ${i < 3 ? 'bg-[#DFFF00] text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                {i + 1}
                            </div>
                            <div>
                                <h3 className="font-black text-xl uppercase leading-none text-white mb-1 group-hover:text-[#DFFF00] transition-colors">
                                    {r.name}
                                </h3>
                                <div className="flex gap-3 items-center">
                                    <span className={`text-[10px] font-bold font-mono uppercase tracking-widest ${r.tier === 'GOD TIER' ? 'text-[#DFFF00] bg-black border border-[#DFFF00] px-1' : r.tier === 'GRANDMASTER' ? 'text-yellow-500' : 'text-zinc-500'}`}>
                                        {r.tier}
                                    </span>
                                    {r.titles > 0 && (
                                        <span className="text-[10px] font-bold font-mono text-yellow-500 flex items-center gap-1">
                                            <Crown size={12} /> {r.titles}x WDC
                                        </span>
                                    )}
                                    {r.titles === 0 && r.wins >= 10 && (
                                        <span className="text-[10px] font-bold font-mono text-zinc-500 flex items-center gap-1">
                                            <Medal size={12} /> UNCROWNED KING
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end text-white mb-1">
                                <TrendingUp size={20} className={i < 3 ? "text-[#DFFF00]" : "text-zinc-600"} />
                                <span className="text-3xl font-black font-mono">{r.elo.toLocaleString()}</span>
                            </div>
                            
                            {/* CLEARER STATS LABEL */}
                            <div className="flex gap-3 justify-end text-[10px] font-mono text-zinc-500 font-bold">
                                <span className="flex items-center gap-1">
                                    {r.wins} CAREER WINS
                                </span>
                                <span className="text-zinc-700">|</span>
                                <span className="flex items-center gap-1">
                                    <Percent size={10}/> {r.winRate}% WIN RATE
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            {ratings.length > visibleCount && (
                <button onClick={handleLoadMore} className="w-full py-4 mt-4 bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] hover:text-[#DFFF00] text-zinc-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                    LOAD MORE DRIVERS <ChevronDown size={14}/>
                </button>
            )}
        </div>
    );
}