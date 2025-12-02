// app/sports/golf/player/[id]/page.tsx
import React from 'react';
import { getGolferProfile } from '../../actions';
import { notFound } from 'next/navigation';
import { ChevronLeft, MapPin, Trophy, User, Activity, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import Scorecard from '../../components/Scorecard';

export default async function PlayerProfile({ params }: { params: { id: string } }) {
    const player = await getGolferProfile(params.id);

    if (!player) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-20">
            
            {/* 1. HERO SECTION */}
            <div className="relative h-[400px] w-full overflow-hidden border-b border-zinc-800 bg-zinc-900">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900 via-zinc-950 to-zinc-950"></div>
                
                <div className="max-w-6xl mx-auto h-full px-6 relative z-10 flex items-end pb-12">
                     <Link href="/sports/golf" className="absolute top-8 left-6 flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-[#DFFF00] transition-colors uppercase tracking-widest">
                        <ChevronLeft size={14} /> Back to Dashboard
                     </Link>

                     <div className="flex flex-col md:flex-row items-end gap-8 w-full">
                        {/* Profile Image */}
                        <div className="relative">
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden shadow-2xl relative z-20">
                                {player.image ? (
                                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                            {player.flag && (
                                <img src={player.flag} className="absolute bottom-4 right-4 w-10 h-8 rounded border-2 border-zinc-950 z-30 shadow-lg" alt="Flag" />
                            )}
                        </div>

                        {/* Name & Info */}
                        <div className="flex-1 mb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-[#DFFF00] text-black text-[10px] font-black uppercase tracking-widest rounded-sm">
                                    PRO GOLFER
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                                    <MapPin size={10} /> {player.country}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                                {player.name}
                            </h1>
                        </div>

                        {/* Quick Stats (Rank) */}
                        <div className="mb-4 text-right">
                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">World Rank</div>
                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                                #{player.stats?.find((s:any) => s.label === 'Official World Golf Ranking')?.value || '-'}
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT GRID */}
            <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* LEFT COL: BIO & PHYSICAL */}
                <div className="space-y-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
                        <h3 className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs font-bold uppercase tracking-widest mb-6">
                            <User size={14} /> Athlete Profile
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-500 text-xs uppercase">Age</span>
                                <span className="text-white font-mono text-sm">{player.age || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-500 text-xs uppercase">Height</span>
                                <span className="text-white font-mono text-sm">{player.height || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-500 text-xs uppercase">Weight</span>
                                <span className="text-white font-mono text-sm">{player.weight || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-500 text-xs uppercase">Turned Pro</span>
                                <span className="text-white font-mono text-sm">{player.turnedPro || '-'}</span>
                            </div>
                        </div>
                        <div className="mt-6 text-xs text-zinc-400 leading-relaxed italic border-l-2 border-[#DFFF00] pl-4">
                            "{player.bio}"
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: PERFORMANCE & STATS */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* SEASON STATS */}
                    <div>
                        <h3 className="flex items-center gap-2 text-white font-black uppercase text-xl mb-6">
                            <BarChart2 size={20} className="text-[#DFFF00]" /> Season Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {player.stats.slice(0, 8).map((stat: any, i: number) => (
                                <div key={i} className="bg-zinc-900 p-4 border border-zinc-800 flex flex-col justify-between hover:border-zinc-600 transition-colors">
                                    <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mb-2 truncate" title={stat.label}>
                                        {stat.label}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-white font-mono">{stat.value}</span>
                                        {stat.rank && <span className="text-[10px] text-[#DFFF00]">#{stat.rank}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LATEST SCORECARD (Mock/Visual Only for now) */}
                    <div>
                        <h3 className="flex items-center gap-2 text-white font-black uppercase text-xl mb-6">
                            <Activity size={20} className="text-[#DFFF00]" /> Recent Form
                        </h3>
                        <Scorecard />
                    </div>

                </div>
            </div>
        </div>
    );
}