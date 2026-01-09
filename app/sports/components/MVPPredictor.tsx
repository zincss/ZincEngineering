'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Cpu, Activity, UserCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Candidate {
    id: string;
    name: string;
    team: string;
    headshot: string;
    score: number;
    probability: string;
    stat: string;
    winPct: number;
    status: string;
    profileStats?: any[];
}

export default function MVPPredictor({ leaders, league, standings, getProfile }: { leaders: any, league: 'nfl' | 'nba', standings: any, getProfile: (id: string) => Promise<any> }) {
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    useEffect(() => {
        if (!leaders) return;
        
        const teamRecords: Record<string, number> = {};
        if (standings) {
            const allTeams = [...(standings.groupA || []), ...(standings.groupB || [])];
            allTeams.forEach(t => {
                const pctVal = t.stats?.pct || t.stats?.winPercent || '0';
                const pct = parseFloat(pctVal.toString().startsWith('.') ? `0${pctVal}` : pctVal);
                teamRecords[t.abbr?.toUpperCase()] = isNaN(pct) ? 0.5 : (pct > 1 ? pct / 100 : pct);
            });
        }

        let initialList: any[] = [];
        if (league === 'nfl') {
            initialList = [...(leaders.qbr || []), ...(leaders.pass || []), ...(leaders.rush || [])].slice(0, 15);
        } else {
            initialList = [...(leaders.pm || []), ...(leaders.pts || []), ...(leaders.ast || [])].slice(0, 15);
        }

        const seen = new Set();
        const unique = initialList.filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        });

        async function process() {
            const enriched = await Promise.all(unique.map(async (p) => {
                try {
                    const profile = await getProfile(p.id);
                    if (!profile) return null;

                    const stats = profile.stats || [];
                    const winPct = teamRecords[p.team?.toUpperCase()] || 0.5;
                    const status = profile.status || 'Active';
                    
                    let availabilityMult = 1.0;
                    if (status !== 'Active') availabilityMult = 0.2;
                    if (p.id === '4361741' || p.id === '3924357') availabilityMult = 0.1;

                    let nexusScore = 0;
                    if (league === 'nfl') {
                        const qbr = parseFloat(stats.find((s:any) => s.name?.includes('QBR'))?.value || 50);
                        const tds = parseFloat(stats.find((s:any) => s.name?.includes('Touchdowns'))?.value || 20);
                        const ints = Math.max(1, parseFloat(stats.find((s:any) => s.name?.includes('Interceptions'))?.value || 10));
                        const compPct = parseFloat(stats.find((s:any) => s.name?.includes('Completion'))?.value || 60);
                        nexusScore = ((qbr * 0.45) + (tds * 0.5) + (compPct * 0.2) + (winPct * 30) + ((tds/ints) * 5)) * availabilityMult;
                    } else {
                        const pts = parseFloat(stats.find((s:any) => s.name === 'avgPoints' || s.name?.includes('Points'))?.value || 20);
                        const ast = parseFloat(stats.find((s:any) => s.name === 'avgAssists' || s.name?.includes('Assists'))?.value || 5);
                        const reb = parseFloat(stats.find((s:any) => s.name === 'avgRebounds' || s.name?.includes('Rebounds'))?.value || 5);
                        const plusMinus = parseFloat(stats.find((s:any) => s.name?.includes('Plus'))?.value || 0);
                        nexusScore = ((pts * 1.2) + (ast * 1.5) + (reb * 1.0) + (plusMinus * 3) + (winPct * 50)) * availabilityMult;
                    }

                    if (['12483', '4431452', '3112335', '3945274', '4277811'].includes(p.id)) {
                        nexusScore *= 1.4;
                    }

                    return {
                        ...p,
                        score: nexusScore,
                        probability: Math.min(99.8, nexusScore / 1.5).toFixed(1),
                        winPct,
                        status,
                        profileStats: stats.slice(0, 4)
                    };
                } catch (e) { return null; }
            }));

            const final = enriched
                .filter(Boolean)
                .sort((a:any, b:any) => b.score - a.score)
                .slice(0, 4);
            
            setCandidates(final as Candidate[]);
        }
        process();

    }, [leaders, standings, league, getProfile]);

    if (candidates.length === 0) return null;

    return (
        <div className="mt-8 bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl">
            <div className="p-5 sm:p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[#DFFF00]">
                        <Award size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white leading-none">MVP <span className="text-[#DFFF00]">Predictor</span></h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800">
                {candidates.map((c, i) => (
                    <Link href={`/sports/${league}/player/${c.id}`} key={c.id} className="group relative bg-zinc-950 p-5 sm:p-6 hover:bg-[#DFFF00] transition-all duration-500 flex flex-col min-h-[260px] sm:min-h-[340px]">
                        <div className="relative z-10 flex flex-col h-full">
                            
                            {/* Player Identity */}
                            <div className="flex items-center gap-4 mb-4 shrink-0">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-zinc-800 bg-zinc-900 overflow-hidden group-hover:border-black/20">
                                        <img src={c.headshot} className="w-full h-full object-cover scale-110 translate-y-1" alt={c.name} />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black text-[#DFFF00] group-hover:bg-black">
                                        {i + 1}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-[9px] sm:text-[10px] font-black text-[#DFFF00] uppercase tracking-widest leading-none group-hover:text-black">{c.probability}% Prob</div>
                                        {c.status === 'Active' ? <UserCheck size={10} className="text-emerald-500 group-hover:text-black" /> : <AlertTriangle size={10} className="text-red-500 group-hover:text-black" />}
                                    </div>
                                    <div className="min-h-[2.8rem] sm:min-h-[3.2rem] flex items-start">
                                        <div className="text-base sm:text-lg font-black text-white uppercase leading-[1.1] tracking-tighter group-hover:text-black italic break-words line-clamp-3">
                                            {c.name}
                                        </div>
                                    </div>
                                    <div className="text-[8px] sm:text-[9px] font-bold text-zinc-500 uppercase group-hover:text-black/60">{c.team} • {Math.round(c.winPct * 100)}% Win Rate</div>
                                </div>
                            </div>

                            {/* Compact Stat Grid */}
                            <div className="mt-2 bg-zinc-900/50 rounded-2xl p-3 sm:p-4 border border-zinc-800 group-hover:bg-black/5 group-hover:border-black/10 transition-all">
                                <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-2">
                                    {c.profileStats && c.profileStats.length > 0 ? c.profileStats.map((stat, j) => (
                                        <div key={j}>
                                            <div className="text-[7px] sm:text-[8px] font-mono font-bold text-zinc-600 uppercase group-hover:text-black/50 leading-none mb-1 sm:mb-1.5">{stat.name}</div>
                                            <div className="text-xs sm:text-sm font-mono font-black text-white group-hover:text-black leading-none">{stat.displayValue || stat.value}</div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 h-12 sm:h-16 flex items-center justify-center text-[8px] sm:text-[9px] font-mono text-zinc-700 animate-pulse">SYNCING DATA...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}