'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, Shield, Loader2, AlertTriangle, Trophy, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTeamData } from '../../actions'; 
import { NRL_TEAMS } from '../../data';

// [FIX] Required for static export

export default function TeamPage() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);

    const teamConfig = NRL_TEAMS.find((t: any) => t.id === id);

    useEffect(() => {
        const loadData = async () => {
            if (!teamConfig) return setError(true);
            const teamData = await getTeamData(teamConfig.id);
            if (teamData) {
                setData({ ...teamData, color: teamConfig.color, staticLogo: teamConfig.logo });
            } else {
                setError(true); // Fallback to static if API fails
            }
        };
        loadData();
    }, [teamConfig]);

    if (error) return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-mono text-xs">CLUB UPLINK FAILED.</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center gap-2 font-mono text-xs text-zinc-500"><Loader2 className="animate-spin text-[#DFFF00]"/> ACCESSING CLUB MAINFRAME...</div>;

    return (
        <div className="max-w-7xl mx-auto pb-40 px-4 md:px-0 pt-12 animate-in fade-in duration-700">
            
            {/* FIXED: Cleaned up hover classes. Now consistently black text on acid background. */}
            <Link href="/sports/nrl" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black hover:bg-[#DFFF00] px-4 py-2 mb-8 group transition-all font-mono font-black text-[10px] uppercase tracking-[0.2em] border border-zinc-800 hover:border-[#DFFF00]">
                <ArrowLeft size={12} /> RETURN TO LEAGUE
            </Link>

            <div className="border border-zinc-800 bg-zinc-900 shadow-[0_0_40px_rgba(0,0,0,0.5)] mb-12 relative overflow-hidden">
                <div className={`h-40 ${data.color} w-full relative opacity-30`}>
                     <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.5)_50%,transparent_75%,transparent_100%)] bg-[length:4px_4px]"></div>
                </div>
                
                <div className="p-8 relative -mt-16 flex flex-col md:flex-row items-end gap-8">
                    <div className="w-32 h-32 bg-black border-2 border-zinc-800 flex items-center justify-center p-4 shadow-2xl relative z-10">
                        <img src={data.staticLogo} className="w-full h-full object-contain" alt={data.name} />
                    </div>
                    <div className="flex-1 mb-2">
                        <div className="flex items-center gap-2 mb-2 text-[#DFFF00]">
                            <Shield size={16} />
                            <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">NRL PREMIERSHIP</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">{data.name}</h1>
                        <div className="flex gap-4 mt-4 text-zinc-400 font-mono text-xs uppercase tracking-widest">
                             <span className="flex items-center gap-2"><MapPin size={12} className="text-[#DFFF00]"/> {teamConfig?.city}</span>
                             <span className="flex items-center gap-2"><Users size={12} className="text-[#DFFF00]"/> {data.roster.length} SQUAD</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-black border border-zinc-800 p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
                            <Activity size={14} className="text-[#DFFF00]"/>
                            <span className="text-xs font-black tracking-widest uppercase text-white">SEASON RECORD</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-1">{data.record}</div>
                        <div className="text-xs font-mono text-zinc-500">{data.standing}</div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-black border border-zinc-800 p-6">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800">
                            <Users size={14} className="text-white"/>
                            <span className="text-xs font-black tracking-widest uppercase text-white">ACTIVE SQUAD</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                            {data.roster.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] transition-colors group">
                                    <div className="w-8 h-8 bg-black rounded-full overflow-hidden border border-zinc-700">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover scale-125 pt-1" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xs uppercase text-white truncate">{p.name}</div>
                                        <div className="text-[9px] font-mono text-zinc-500">#{p.number} • {p.pos}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}