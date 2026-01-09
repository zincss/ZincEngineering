// app/sports/nba/components/ConferenceStandings.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function ConferenceStandings({ east, west }: { east: any[], west: any[] }) {
    const [activeTab, setActiveTab] = useState<'EAST' | 'WEST'>('EAST');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-[#DFFF00]" />
                    <h3 className="text-lg font-black uppercase text-white tracking-tight">Conference Standings</h3>
                </div>

                {/* Mobile Toggle - Squared Off */}
                <div className="flex md:hidden bg-zinc-900 p-1 border border-zinc-800">
                    <button 
                        onClick={() => setActiveTab('EAST')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'EAST' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Eastern
                    </button>
                    <button 
                        onClick={() => setActiveTab('WEST')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'WEST' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Western
                    </button>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* East Table */}
                <div className={activeTab === 'EAST' ? 'block' : 'hidden md:block'}>
                    <StandingsTable conference="EASTERN" teams={east} />
                </div>

                {/* West Table */}
                <div className={activeTab === 'WEST' ? 'block' : 'hidden md:block'}>
                    <StandingsTable conference="WESTERN" teams={west} />
                </div>
            </div>
        </div>
    );
}

function StandingsTable({ conference, teams }: { conference: string, teams: any[] }) {
    if(!teams || teams.length === 0) return <div className="p-4 border border-zinc-800 text-zinc-500 font-mono text-xs">Loading Data...</div>

    const sortedTeams = [...teams].sort((a, b) => {
        const pctA = parseFloat(a.stats.pct || '0');
        const pctB = parseFloat(b.stats.pct || '0');
        return pctB - pctA; 
    });

    return (
        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl overflow-hidden">
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-widest flex justify-between items-center">
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00]" />
                    {conference}
                </span>
                <span>W-L / GB</span>
            </div>
            <div className="divide-y divide-zinc-800/50">
                {sortedTeams.map((t, index) => (
                    <Link href={`/sports/nba/team/${t.id}`} key={t.id} className="flex items-center justify-between p-4 hover:bg-black transition-all group border-l-2 border-transparent hover:border-[#DFFF00]">
                        <div className="flex items-center gap-4">
                            <span className={`font-mono text-[10px] w-4 font-bold ${index < 6 ? 'text-[#DFFF00]' : index < 10 ? 'text-zinc-500' : 'text-zinc-700'}`}>
                                {index + 1}
                            </span>
                            <img src={t.logo} className="w-8 h-8 object-contain grayscale group-hover:grayscale-0 transition-all" alt={t.name} />
                            <span className="font-bold text-xs text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all">
                                {t.abbr}
                            </span>
                        </div>
                        <div className="font-mono text-xs text-zinc-500 flex gap-4">
                            <span className="text-white font-bold">{t.stats.w}-{t.stats.l}</span>
                            <span className="text-zinc-600 w-8 text-right">{t.stats.gb === '-' ? '--' : t.stats.gb}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}