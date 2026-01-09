'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchGameAnalysis } from '@/app/sports/nba/lib/espn';
import { ArrowLeft, TrendingUp, User, Swords, Info, AlertCircle, History, BrainCircuit, BarChart3, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function GameBreakdown() { 
  const params = useParams(); 
  const id = params?.id as string; 
  const [data, setData] = useState<any>(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => { 
    async function load() { 
      if(!id) return; 
      const d = await fetchGameAnalysis(id); 
      setData(d); 
      setLoading(false); 
    } 
    load(); 
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-xs uppercase animate-pulse">
        <Loader2 size={16} className="animate-spin" /> Analyzing Game Data...
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
        <AlertCircle size={48} className="mb-4 text-red-500" />
        <h1 className="text-xl font-bold text-white">Data Unavailable</h1>
        <Link href="/sports/breakdown/nba" className="mt-8 text-sm underline hover:text-white">Return to Hub</Link>
    </div>
  );

  const { game, home, away, analysis, leaders, comparison } = data;

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-[#DFFF00] selection:text-black">
        {/* --- HEADER --- */}
        <header className="relative py-8 md:py-12 px-6 border-b border-white/5 overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0" />
             <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950 z-0" />
             
             <div className="relative z-10 max-w-6xl mx-auto">
                 <Link href="/sports/breakdown/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 font-mono text-xs uppercase tracking-widest transition-colors">
                    <ArrowLeft size={14} /> Back to Schedule
                 </Link>

                 <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                     {/* HOME */}
                     <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 flex-1 order-2 md:order-1">
                         <div className="relative">
                            <img src={home.logo} alt={home.name} className="w-20 h-20 md:w-32 md:h-32 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.1)]" />
                            <div className="absolute -bottom-2 -right-2 bg-zinc-900 px-2 py-1 rounded text-[10px] font-mono border border-zinc-800">{home.record}</div>
                         </div>
                         <div>
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">{home.name}</h1>
                         </div>
                     </div>

                     {/* SCOREBOARD */}
                     <div className="flex flex-col items-center gap-2 min-w-[200px] order-1 md:order-2">
                         <div className="text-5xl md:text-7xl font-black font-mono tracking-tighter flex items-center justify-center gap-4">
                             <span className={Number(home.score) > Number(away.score) ? "text-white" : "text-zinc-600"}>{home.score}</span>
                             <span className="text-zinc-800 text-3xl">:</span>
                             <span className={Number(away.score) > Number(home.score) ? "text-white" : "text-zinc-600"}>{away.score}</span>
                         </div>
                         <div className="px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                             <span className={`w-2 h-2 rounded-full ${game.status === 'in' ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`} />
                             {game.statusDetail}
                         </div>
                     </div>

                     {/* AWAY */}
                     <div className="flex flex-col items-center md:items-end text-center md:text-right gap-4 flex-1 order-3">
                         <div className="relative">
                            <img src={away.logo} alt={away.name} className="w-20 h-20 md:w-32 md:h-32 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.1)]" />
                            <div className="absolute -bottom-2 -left-2 bg-zinc-900 px-2 py-1 rounded text-[10px] font-mono border border-zinc-800">{away.record}</div>
                         </div>
                         <div>
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">{away.name}</h1>
                         </div>
                     </div>
                 </div>
             </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
             
             {/* LEFT COLUMN */}
             <div className="md:col-span-8 flex flex-col gap-6">
                 
                 {/* ORACLE (With Dynamic Colors) */}
                 <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                     <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="text-[#DFFF00]" size={20} />
                            <h3 className="text-xl font-black uppercase tracking-tight">The Oracle</h3>
                            <span className="ml-auto text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded">WIN PROBABILITY</span>
                        </div>
                        
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-4xl font-black" style={{ color: `#${home.color}` }}>{analysis.probability.home}%</span>
                            <span className="text-4xl font-black" style={{ color: `#${away.color}` }}>{analysis.probability.away}%</span>
                        </div>
                        
                        {/* COLORED BAR */}
                        <div className="flex h-3 bg-zinc-800 rounded-full overflow-hidden mb-2">
                            <div className="h-full transition-all duration-1000" style={{ width: `${analysis.probability.home}%`, backgroundColor: `#${home.color}` }} />
                            <div className="h-full transition-all duration-1000" style={{ width: `${analysis.probability.away}%`, backgroundColor: `#${away.color}` }} />
                        </div>

                        <div className="text-[10px] font-mono text-zinc-500 uppercase flex justify-between">
                            <span>{home.abbr}</span>
                            <span>{away.abbr}</span>
                        </div>
                     </div>
                 </div>

                 {/* INSIGHTS */}
                 {analysis.insights.length > 0 && (
                     <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4 text-[#DFFF00]">
                            <BrainCircuit size={20} />
                            <h3 className="text-lg font-black uppercase tracking-tight text-white">Matchup Briefing</h3>
                        </div>
                        <div className="space-y-3">
                            {analysis.insights.map((insight: string, i: number) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="min-w-[4px] h-[4px] mt-2 rounded-full bg-zinc-600" />
                                    <p className="text-zinc-400 text-sm leading-relaxed">{insight}</p>
                                </div>
                            ))}
                        </div>
                     </div>
                 )}

                 {/* TALE OF THE TAPE */}
                 {comparison && comparison.length > 0 && (
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 className="text-[#DFFF00]" size={20} />
                            <h3 className="text-xl font-black uppercase tracking-tight">Tale of the Tape</h3>
                        </div>
                        <div className="space-y-6">
                            {comparison.map((stat: any, i: number) => (
                                <div key={i} className="relative">
                                    <div className="flex justify-between text-xs font-mono font-bold text-zinc-500 mb-2 uppercase">
                                        <span className={stat.better === 'home' ? 'text-[#DFFF00]' : ''}>{home.abbr} {stat.home}</span>
                                        <span>{stat.label}</span>
                                        <span className={stat.better === 'away' ? 'text-[#DFFF00]' : ''}>{stat.away} {away.abbr}</span>
                                    </div>
                                    <div className="flex h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-700 ${stat.better === 'home' ? 'bg-[#DFFF00]' : 'bg-zinc-600'}`} style={{ width: '50%' }} />
                                        <div className={`h-full transition-all duration-700 ${stat.better === 'away' ? 'bg-[#DFFF00]' : 'bg-zinc-600'}`} style={{ width: '50%' }} />
                                    </div>
                                    <div className="absolute top-6 bottom-0 left-1/2 w-px bg-zinc-950" />
                                </div>
                            ))}
                        </div>
                    </div>
                 )}

                 {/* ODDS & FORM */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6">
                         <div className="flex items-center gap-2 mb-4 text-zinc-500">
                             <Swords size={16} />
                             <span className="text-xs uppercase tracking-widest">Vegas Line</span>
                         </div>
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-zinc-400 text-sm">Spread</span>
                             <span className="text-xl font-bold">{analysis.odds.spread || '-'}</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <span className="text-zinc-400 text-sm">Total</span>
                             <span className="text-xl font-bold">{analysis.odds.overUnder || '-'}</span>
                         </div>
                     </div>

                     <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6">
                         <div className="flex items-center gap-2 mb-4 text-zinc-500">
                             <History size={16} />
                             <span className="text-xs uppercase tracking-widest">Recent Form</span>
                         </div>
                         <div className="flex justify-between items-center gap-4">
                            <div className="flex gap-1">
                                {analysis.homeForm?.map((r:string, i:number) => (
                                    <span key={i} className={`w-1 h-6 rounded-sm ${r === 'W' ? 'bg-[#DFFF00]' : 'bg-zinc-800'}`} />
                                ))}
                            </div>
                            <span className="text-xs font-mono text-zinc-600">L5</span>
                            <div className="flex gap-1">
                                {analysis.awayForm?.map((r:string, i:number) => (
                                    <span key={i} className={`w-1 h-6 rounded-sm ${r === 'W' ? 'bg-[#DFFF00]' : 'bg-zinc-800'}`} />
                                ))}
                            </div>
                         </div>
                     </div>
                 </div>
             </div>

             {/* RIGHT COLUMN */}
             <div className="md:col-span-4 flex flex-col gap-6">
                 <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 sticky top-6">
                     <div className="flex items-center gap-3 mb-6">
                         <User className="text-[#DFFF00]" size={20} />
                         <h3 className="text-xl font-black uppercase tracking-tight">{leaders.label}</h3>
                     </div>

                     {leaders.home?.[0] && leaders.away?.[0] ? (
                         <div className="space-y-8">
                             <LeaderCard player={leaders.home[0]} team={home} />
                             <div className="flex items-center justify-center gap-4">
                                 <div className="h-px bg-zinc-800 flex-1" />
                                 <span className="text-xs font-mono text-zinc-600 font-bold">VS</span>
                                 <div className="h-px bg-zinc-800 flex-1" />
                             </div>
                             <LeaderCard player={leaders.away[0]} team={away} />
                         </div>
                     ) : (
                         <div className="text-zinc-500 text-sm text-center py-10">
                            Leader data compiling...
                         </div>
                     )}
                 </div>
             </div>
        </div>
    </main>
  );
}

function LeaderCard({ player, team }: any) {
    if (!player?.athlete) return null;
    return (
        <div className="relative group">
            <div className="flex items-start gap-4">
                <img src={player.athlete.headshot?.href} className="w-16 h-16 rounded-2xl bg-zinc-800 object-cover border border-zinc-700 shadow-lg" alt="" />
                <div>
                    <div className="text-[10px] font-mono text-[#DFFF00] uppercase tracking-widest mb-1">{team.abbr} Star</div>
                    <div className="font-bold text-white text-lg leading-tight mb-1">{player.athlete.displayName}</div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700">
                        {player.displayValue} PTS
                    </div>
                </div>
            </div>
        </div>
    )
}