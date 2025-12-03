'use client';
import React from 'react';
import { ArrowLeft, User, Ruler, Award, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';

export default function NFLPlayerClientView({ player }: { player: any }) {
    const hasLog = player.gameLog && player.gameLog.length > 0;
    
    // Dynamically decide which columns to show in the table
    // We grab keys from the first game's stats, filtering out generic/boring ones
    const tableKeys = hasLog ? player.gameLog[0].stats.filter((s:any) => {
        const k = (s.label || s.name).toUpperCase();
        // Filter out redundant or wide stats
        return !['GP', 'GS', 'AVG', 'LNG', 'RTG', 'QBR', 'SOLO', 'AST'].includes(k) && k.length < 5;
    }).slice(0, 6) : [];

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pt-24 pb-20">
            <div className="max-w-[1600px] mx-auto px-6">
                
                {/* NAV */}
                <Link href="/sports/nfl" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] transition-colors font-mono font-bold text-[10px] uppercase tracking-widest mb-8">
                    <ArrowLeft size={14} /> Back to Nexus
                </Link>

                {/* HERO SECTION */}
                <div className="relative border-b border-zinc-800 pb-12 mb-12 overflow-hidden">
                    {/* Dynamic Team Color Glow */}
                    <div 
                        className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[var(--team-color)] to-transparent opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" 
                        style={{ '--team-color': `#${player.teamColor || '333'}` } as React.CSSProperties}
                    ></div>

                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 relative z-10">
                        <div className="w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-[#DFFF00] text-black text-[10px] font-black font-mono uppercase tracking-widest rounded-sm">{player.team}</span>
                                <span className="px-3 py-1 border border-zinc-700 bg-zinc-900/50 text-[10px] font-bold font-mono uppercase text-zinc-300 rounded-sm">{player.pos}</span>
                                <span className="px-3 py-1 border border-zinc-700 bg-zinc-900/50 text-[10px] font-bold font-mono uppercase text-zinc-300 rounded-sm">#{player.number}</span>
                            </div>
                            
                            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] text-white mb-6">
                                {player.name}
                            </h1>
                            
                            <div className="inline-flex flex-wrap gap-x-8 gap-y-4 text-[11px] font-mono uppercase text-zinc-400 bg-zinc-900/30 p-4 border border-zinc-800/50 rounded-lg backdrop-blur-sm">
                                <span className="flex items-center gap-2"><Ruler size={14} className="text-[#DFFF00]"/> {player.height} • {player.weight} lbs</span>
                                <span className="w-px h-4 bg-zinc-700"></span>
                                <span className="flex items-center gap-2"><User size={14} className="text-[#DFFF00]"/> Age {player.age} • {player.exp} Exp</span>
                                <span className="w-px h-4 bg-zinc-700"></span>
                                <span className="flex items-center gap-2"><Award size={14} className="text-[#DFFF00]"/> {player.college}</span>
                            </div>
                        </div>
                        
                        {/* DYNAMIC SEASON TOTALS */}
                        <div className="flex gap-4 md:gap-2 min-w-fit">
                            {player.stats.map((s: any, i: number) => (
                                <div key={i} className="bg-zinc-900/80 border border-zinc-800 p-5 min-w-[120px] rounded-lg backdrop-blur-md flex flex-col justify-between group hover:border-[#DFFF00] transition-colors">
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-[#DFFF00] transition-colors">{s.name}</span>
                                    <span className="text-3xl font-black text-white">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COL: PORTRAIT */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="aspect-[3/4] relative rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl">
                             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
                             {player.headshot ? (
                                <img src={player.headshot} className="w-full h-full object-cover object-top relative z-10 hover:scale-105 transition-transform duration-700" alt={player.name} />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center relative z-10">
                                    <User size={64} className="text-zinc-700" />
                                </div>
                             )}
                        </div>
                        
                        {/* Quick Info Card */}
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity size={16} className="text-[#DFFF00]" />
                                <h3 className="text-sm font-black uppercase text-white">Status Report</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-500">Contract Status</span>
                                    <span className="text-white font-bold">Active</span>
                                </div>
                                <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-500">Next Opponent</span>
                                    <span className="text-white font-bold">{hasLog ? player.gameLog[0].opponent : 'TBD'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: GAME LOG */}
                    <div className="lg:col-span-8">
                        <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-[#DFFF00]" />
                                    <h2 className="text-lg font-black uppercase text-white tracking-tight">2024 Game Log</h2>
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 uppercase">Regular Season</div>
                            </div>

                            {hasLog ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-zinc-900/50 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                                                <th className="px-6 py-4 font-bold">Week</th>
                                                <th className="px-6 py-4 font-bold">Opponent</th>
                                                <th className="px-6 py-4 font-bold">Result</th>
                                                {/* Dynamic Headers */}
                                                {tableKeys.map((k: any, i: number) => (
                                                    <th key={i} className="px-6 py-4 font-bold text-right text-zinc-300">
                                                        {k.label || k.name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs font-mono font-medium text-zinc-300 divide-y divide-zinc-800/50">
                                            {player.gameLog.map((game: any, i: number) => (
                                                <tr key={i} className="hover:bg-zinc-900/60 transition-colors group">
                                                    <td className="px-6 py-4 text-zinc-500">{game.week?.text || `Week ${game.week}`}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {game.opponentLogo && <img src={game.opponentLogo} className="w-6 h-6 object-contain opacity-80" />}
                                                            <span className="text-white group-hover:text-[#DFFF00] transition-colors">{game.opponent}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`
                                                            inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border
                                                            ${game.result?.startsWith('W') 
                                                                ? 'bg-[#DFFF00]/10 border-[#DFFF00]/20 text-[#DFFF00]' 
                                                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'}
                                                        `}>
                                                            {game.result}
                                                        </span>
                                                    </td>
                                                    {/* Dynamic Cells */}
                                                    {tableKeys.map((k: any, j: number) => {
                                                        const stat = game.stats.find((s:any) => (s.label || s.name) === (k.label || k.name));
                                                        return (
                                                            <td key={j} className="px-6 py-4 text-right font-bold text-white tabular-nums">
                                                                {stat ? stat.value : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
                                        <Activity size={20} className="text-zinc-600" />
                                    </div>
                                    <p className="text-sm text-zinc-500 font-mono uppercase">No game data available for 2024</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}