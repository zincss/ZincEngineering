import React from 'react';
import { getGolferProfile } from '../../actions';
import { notFound } from 'next/navigation';
import { ChevronLeft, MapPin, Trophy, BarChart2, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default async function PlayerProfile({ params }: { params: { id: string } }) {
    const player = await getGolferProfile(params.id);

    if (!player) return notFound();

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-20 pt-24">
            
            <div className="max-w-6xl mx-auto px-6">
                <Link href="/sports/golf" className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-[#DFFF00] uppercase tracking-widest mb-8">
                    <ChevronLeft size={14} /> Back to Golf Hub
                </Link>

                {/* HERO CARD */}
                <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-12">
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-transparent z-10"></div>
                    
                    {player.image && (
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 z-0">
                            <img src={player.image} className="w-full h-full object-cover grayscale" />
                        </div>
                    )}

                    <div className="relative z-20 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center md:items-end">
                        <div className="w-40 h-40 rounded-full border-4 border-[#DFFF00] overflow-hidden bg-zinc-800 shadow-2xl">
                             {player.image && <img src={player.image} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                {player.flag && <img src={player.flag} className="w-6 h-4 rounded shadow-sm" />}
                                <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">{player.country}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-4">
                                {player.name}
                            </h1>
                            <p className="text-zinc-400 text-sm max-w-xl italic border-l-2 border-[#DFFF00] pl-4">
                                {player.bio}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COL: SEASON STATS */}
                    <div className="space-y-8">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="p-4 bg-zinc-950/50 border-b border-zinc-800 flex items-center gap-2">
                                <BarChart2 size={16} className="text-[#DFFF00]" />
                                <h3 className="text-xs font-bold font-mono uppercase text-white">Season Stats</h3>
                            </div>
                            <div className="divide-y divide-zinc-800">
                                {player.stats && player.stats.length > 0 ? player.stats.map((stat: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-4 hover:bg-zinc-800/50 transition-colors">
                                        <span className="text-xs text-zinc-400 uppercase font-mono">{stat.label}</span>
                                        <div className="text-right">
                                            <div className="font-bold text-white">{stat.value}</div>
                                            {stat.rank && <div className="text-[10px] text-[#DFFF00] font-mono">Rank: #{stat.rank}</div>}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-zinc-500 text-xs font-mono">No stats available for current season.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: TOURNAMENT LOG */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="p-4 bg-zinc-950/50 border-b border-zinc-800 flex items-center gap-2">
                                <Calendar size={16} className="text-[#DFFF00]" />
                                <h3 className="text-xs font-bold font-mono uppercase text-white">Recent Tournaments</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-950/30 text-[10px] text-zinc-500 font-mono uppercase">
                                        <tr>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Event</th>
                                            <th className="p-4 text-right">Finish</th>
                                            <th className="p-4 text-right">Score</th>
                                            <th className="p-4 text-right">Earnings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {player.history && player.history.length > 0 ? player.history.map((e: any, i: number) => (
                                            <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                                                <td className="p-4 text-xs font-mono text-zinc-500">{e.date}</td>
                                                <td className="p-4 text-sm font-bold text-white">{e.name}</td>
                                                <td className={`p-4 text-sm font-mono font-bold text-right ${['1', 'T1'].includes(e.finish) ? 'text-[#DFFF00]' : 'text-white'}`}>
                                                    {['1', 'T1'].includes(e.finish) && <Trophy size={12} className="inline mr-1 text-[#DFFF00]"/>}
                                                    {e.finish}
                                                </td>
                                                <td className="p-4 text-sm font-mono text-zinc-400 text-right">{e.score}</td>
                                                <td className="p-4 text-sm font-mono text-[#DFFF00] text-right">{e.earnings}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono text-xs">No recent tournament data found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}