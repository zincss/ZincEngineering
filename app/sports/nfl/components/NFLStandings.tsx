'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, RefreshCw } from 'lucide-react';

export default function NFLStandings({ afc, nfc }: { afc: any[], nfc: any[] }) {
    const [activeTab, setActiveTab] = useState<'AFC' | 'NFC'>('AFC');
    const data = activeTab === 'AFC' ? afc : nfc;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-[#DFFF00]" />
                    <h3 className="text-lg font-black uppercase text-white tracking-tight">Playoff Picture</h3>
                </div>
                <div className="flex bg-zinc-900 p-1 border border-zinc-800">
                    <button onClick={() => setActiveTab('AFC')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'AFC' ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}>AFC</button>
                    <button onClick={() => setActiveTab('NFC')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'NFC' ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}>NFC</button>
                </div>
            </div>

            <div className="border border-zinc-800 bg-zinc-900/10 min-h-[200px]">
                <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-widest flex justify-between">
                    <span>Rank / Team</span>
                    <div className="flex gap-4">
                        <span className="w-8 text-center">W</span>
                        <span className="w-8 text-center">L</span>
                        <span className="w-12 text-center">DIFF</span>
                        <span className="w-8 text-center">STRK</span>
                    </div>
                </div>
                
                {(!data || data.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
                        <RefreshCw size={24} className="animate-spin text-zinc-700" />
                        <span className="font-mono text-xs">SYNCHRONIZING STANDINGS...</span>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800/50">
                        {data.map((t) => (
                            <Link href={`/sports/nfl/team/${t.id}`} key={t.id} className="flex items-center justify-between p-3 hover:bg-zinc-900 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 flex items-center justify-center font-mono text-[10px] font-bold ${t.rank <= 7 ? 'bg-[#DFFF00] text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                        {t.rank}
                                    </div>
                                    <img src={t.logo} className="w-8 h-8 object-contain" alt={t.name} />
                                    <div>
                                        <div className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">{t.name}</div>
                                        {t.clinch && <div className="text-[9px] font-mono text-[#DFFF00] uppercase tracking-widest">{t.clinch}</div>}
                                    </div>
                                </div>
                                <div className="flex gap-4 font-mono text-xs text-zinc-400">
                                    <span className="w-8 text-center text-white font-bold">{t.stats.w}</span>
                                    <span className="w-8 text-center">{t.stats.l}</span>
                                    <span className={`w-12 text-center ${parseInt(t.stats.diff) > 0 ? 'text-[#DFFF00]' : 'text-red-500'}`}>{t.stats.diff}</span>
                                    <span className="w-8 text-center">{t.stats.streak}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}