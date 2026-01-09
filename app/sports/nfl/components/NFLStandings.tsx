// app/sports/nfl/components/NFLStandings.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function NFLStandings({ afc, nfc }: { afc: any[], nfc: any[] }) {
    const [activeTab, setActiveTab] = useState<'AFC' | 'NFC'>('AFC');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-[#DFFF00]" />
                    <h3 className="text-lg font-black uppercase text-white tracking-tight">Conference Standings</h3>
                </div>

                <div className="flex md:hidden bg-zinc-900 p-1 border border-zinc-800">
                    <button 
                        onClick={() => setActiveTab('AFC')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'AFC' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        AFC
                    </button>
                    <button 
                        onClick={() => setActiveTab('NFC')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'NFC' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        NFC
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className={activeTab === 'AFC' ? 'block' : 'hidden md:block'}>
                    <StandingsTable conference="AFC" teams={afc} />
                </div>
                <div className={activeTab === 'NFC' ? 'block' : 'hidden md:block'}>
                    <StandingsTable conference="NFC" teams={nfc} />
                </div>
            </div>
        </div>
    );
}

function StandingsTable({ conference, teams }: { conference: string, teams: any[] }) {
    if(!teams || teams.length === 0) return <div className="p-4 border border-zinc-800 text-zinc-500 font-mono text-xs">Awaiting Data...</div>

    return (
        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl overflow-hidden">
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest flex justify-between items-center">
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00]" />
                    {conference} Conference
                </span>
                <span>W-L-T / STRK</span>
            </div>
            <div className="divide-y divide-zinc-800/50">
                {teams.map((t, index) => (
                    <Link href={`/sports/nfl/team/${t.id}`} key={t.id} className="flex items-center justify-between p-4 hover:bg-black transition-all group border-l-2 border-transparent hover:border-[#DFFF00]">
                        <div className="flex items-center gap-4">
                            <span className={`font-mono text-[10px] w-4 font-bold ${index < 7 ? 'text-[#DFFF00]' : 'text-zinc-600'}`}>
                                {index + 1}
                            </span>
                            <img src={t.logo} className="w-8 h-8 object-contain grayscale group-hover:grayscale-0 transition-all" alt={t.name} />
                            <span className="font-bold text-xs text-zinc-400 group-hover:text-white transition-all uppercase tracking-wider">
                                {t.abbr}
                                {t.clinch && <span className="ml-2 text-[9px] text-[#DFFF00] opacity-50 font-mono">{t.clinch.charAt(0)}</span>}
                            </span>
                        </div>
                        <div className="font-mono text-xs text-zinc-500 flex gap-4">
                            <span className="text-white font-bold">{t.stats.w}-{t.stats.l}-{t.stats.t}</span>
                            <span className="text-zinc-600 w-8 text-right">{t.stats.streak}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}