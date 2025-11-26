'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, MapPin, Users, Trophy, Calendar, User, ChevronRight, Loader2, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// FIX: Go up two levels to find data.ts
import { NBA_TEAMS } from '../../data';

export default function TeamPage() {
    const { id } = useParams();
    const [roster, setRoster] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // FIX: Added type (t: any) to prevent build error
    const team = NBA_TEAMS.find((t: any) => t.id === id);

    useEffect(() => {
        const fetchRoster = async () => {
            if (!team) return;
            try {
                const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team.espnId}/roster`);
                const data = await res.json();
                setRoster(data.athletes || []);
            } catch (e) {
                console.error("Roster Fetch Error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRoster();
    }, [team]);

    if (!team) return <div className="p-20 text-center font-mono text-zinc-500">TEAM NOT FOUND</div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-40 px-4 md:px-0 pt-12">
            <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent"><ArrowLeft size={16} /> NBA DATABASE</Link>

            {/* HERO HEADER */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-lg mb-12 relative overflow-hidden">
                <div className={`h-48 w-full relative overflow-hidden ${team.color}`}>
                     <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                </div>
                
                <div className="px-8 pb-8 relative -mt-16 flex flex-col md:flex-row gap-8 items-end">
                    {/* LOGO */}
                    <div className="w-40 h-40 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 flex items-center justify-center shadow-xl p-4 relative z-10">
                        <img src={team.logo} className="w-full h-full object-contain" alt={team.name} />
                    </div>

                    <div className="flex-1 mb-2">
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black dark:text-white leading-none mb-2">{team.name}</h1>
                        <div className="flex flex-wrap gap-6 text-xs font-mono font-bold text-zinc-500">
                            <span className="flex items-center gap-1"><MapPin size={14}/> {team.city.toUpperCase()}</span>
                            <span className="flex items-center gap-1"><Users size={14}/> ROSTER SIZE: {roster.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROSTER GRID */}
            <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8">
                <div className="flex items-center justify-between mb-8 border-b-2 border-zinc-100 dark:border-zinc-800 pb-4">
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-black dark:text-white" />
                        <span className="text-sm font-black tracking-widest uppercase text-black dark:text-white">ACTIVE ROSTER</span>
                    </div>
                    {loading && <Loader2 size={16} className="animate-spin text-zinc-400"/>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roster.map((player) => (
                        <Link href={`/sports/nba/player/${player.id}`} key={player.id} className="flex items-center gap-4 p-4 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex-shrink-0 border-2 border-zinc-200 dark:border-zinc-700 relative">
                                <img src={player.headshot ? player.headshot.href : `https://a.espncdn.com/i/headshots/nba/players/full/${player.id}.png`} 
                                     className="w-full h-full object-cover" 
                                     alt={player.displayName}
                                     onError={(e) => (e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png')} 
                                />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase text-black dark:text-white leading-none mb-1 group-hover:text-acid transition-colors">{player.displayName}</h4>
                                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-400">
                                    <span className="bg-zinc-100 dark:bg-zinc-900 px-1 border border-zinc-200 dark:border-zinc-700">#{player.jersey}</span>
                                    <span>{player.position.displayName}</span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-zinc-300 group-hover:text-black dark:group-hover:text-white" />
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}