import React from 'react';
import { ArrowLeft, Flag, MapPin, Trophy, Award, TrendingUp, DollarSign, Calendar, Target, Briefcase, Activity, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getOrFetchResource } from '@/lib/data-manager'; 
import { getPlayerProfile } from '../../actions';

// Ensure fresh data on every visit
export const dynamic = 'force-dynamic';

export default async function GolfPlayerPage({ params }: { params: { id: string } }) {
  
  // Fetch Rich Profile Data
  const data = await getOrFetchResource(
    { 
      table: 'golf_profiles', 
      keyField: 'player_id', 
      id: params.id,
      expirationHours: 0 // Force fresh data
    },
    () => getPlayerProfile(params.id)
  );

  if (!data) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-500">
        ATHLETE NOT FOUND IN ARCHIVES.
    </div>
  );

  // Helper to colorize positions
  const getPosColor = (pos: string) => {
      if (pos === '1') return 'text-[#DFFF00]'; // Win
      if (pos.startsWith('T') && parseInt(pos.substring(1)) <= 10) return 'text-white'; // Top 10
      if (pos === 'MC') return 'text-red-500'; // Missed Cut
      return 'text-zinc-400';
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20 pt-8 px-4 md:px-6">
       <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
           
           {/* 1. BREADCRUMB NAV */}
           <Link href="/sports/golf" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] mb-8 font-mono text-[10px] font-bold tracking-widest uppercase hover:border-b border-[#DFFF00] pb-1 transition-all">
               <ArrowLeft size={12} /> RETURN TO CLUBHOUSE
           </Link>

           {/* 2. HERO SECTION */}
           <div className="relative border-2 border-zinc-800 bg-zinc-900/50 mb-8 overflow-hidden">
               {/* Background Pattern */}
               <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,rgba(0,0,0,0.3)_1px,transparent_1px),linear-gradient(-45deg,rgba(0,0,0,0.3)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
               
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12">
                   
                   {/* Left: Player Image */}
                   <div className="lg:col-span-4 relative bg-black border-b lg:border-b-0 lg:border-r border-zinc-800 flex items-end justify-center pt-8">
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                            <span className="bg-[#DFFF00] text-black px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                                {data.rank > 0 ? `OWGR #${data.rank}` : 'PRO'}
                            </span>
                            <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <Flag size={10} /> {data.country}
                            </span>
                        </div>
                        {data.image ? (
                            <img src={data.image} alt={data.name} className="w-auto h-[300px] lg:h-[400px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="h-[400px] w-full flex items-center justify-center text-zinc-700 font-mono text-xs">NO VISUAL</div>
                        )}
                   </div>

                   {/* Right: Key Info & Vitals */}
                   <div className="lg:col-span-8 p-8 flex flex-col justify-between">
                       <div>
                           <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-2 text-white">
                               {data.name.split(' ')[0]}<br/>
                               <span className="text-zinc-600">{data.name.split(' ').slice(1).join(' ')}</span>
                           </h1>
                           <div className="flex flex-wrap gap-4 mt-6">
                               <div className="px-4 py-2 border border-zinc-700 bg-black/50 text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                                   <Calendar size={12} className="text-[#DFFF00]"/> PRO SINCE {data.bio.turnedPro}
                               </div>
                               <div className="px-4 py-2 border border-zinc-700 bg-black/50 text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                                   <MapPin size={12} className="text-[#DFFF00]"/> {data.bio.college}
                               </div>
                           </div>
                       </div>

                       {/* Vitals Grid */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t border-zinc-800 pt-8">
                           <div className="bg-black p-4 border border-zinc-800">
                               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">HEIGHT</span>
                               <span className="text-xl font-mono font-bold text-white">{data.bio.height}</span>
                           </div>
                           <div className="bg-black p-4 border border-zinc-800">
                               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">WEIGHT</span>
                               <span className="text-xl font-mono font-bold text-white">{data.bio.weight}</span>
                           </div>
                           <div className="bg-black p-4 border border-zinc-800">
                               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">AGE</span>
                               <span className="text-xl font-mono font-bold text-white">{data.bio.age}</span>
                           </div>
                           <div className="bg-black p-4 border border-zinc-800 flex flex-col justify-center">
                               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">AVG PTS</span>
                               <span className="text-xl font-mono font-bold text-[#DFFF00]">{data.points}</span>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

           {/* 3. MAIN CONTENT GRID */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* COLUMN 1: RECENT FORM (Takes up 2/3 width) */}
               <div className="lg:col-span-2 space-y-8">
                   
                   {/* Results Table */}
                   <div className="border border-zinc-800 bg-zinc-900">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <Activity size={18} className="text-[#DFFF00]" />
                                <h3 className="text-lg font-black uppercase tracking-tighter">TOURNAMENT LOG</h3>
                            </div>
                            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-1 uppercase">LAST 5 EVENTS</span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead>
                                    <tr className="bg-black text-zinc-500 border-b border-zinc-800 uppercase text-[9px] tracking-widest">
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Event</th>
                                        <th className="p-4 text-center">Pos</th>
                                        <th className="p-4 text-center">Score</th>
                                        <th className="p-4 text-right">Earnings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {data.recentResults && data.recentResults.length > 0 ? (
                                        data.recentResults.map((result: any, i: number) => (
                                            <tr key={i} className="hover:bg-zinc-800/50 transition-colors group">
                                                <td className="p-4 text-zinc-400">{result.date}</td>
                                                <td className="p-4 font-bold text-white uppercase">{result.eventName}</td>
                                                <td className={`p-4 text-center font-black ${getPosColor(result.position)}`}>
                                                    {result.position}
                                                </td>
                                                <td className={`p-4 text-center ${result.score.includes('-') ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                                    {result.score}
                                                </td>
                                                <td className="p-4 text-right text-[#DFFF00]">{result.earnings}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-zinc-500">NO RECENT DATA AVAILABLE</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-zinc-800 bg-zinc-900 p-6 flex flex-col justify-between h-32 hover:border-[#DFFF00] transition-colors group">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                <TrendingUp size={14} className="group-hover:text-[#DFFF00]" /> Driving Dist
                            </div>
                            <div className="text-4xl font-black text-white">{data.stats.driving_dist} <span className="text-sm font-mono text-zinc-500">YDS</span></div>
                        </div>
                        <div className="border border-zinc-800 bg-zinc-900 p-6 flex flex-col justify-between h-32 hover:border-[#DFFF00] transition-colors group">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                <Target size={14} className="group-hover:text-[#DFFF00]" /> GIR %
                            </div>
                            <div className="text-4xl font-black text-white">{data.stats.gir_pct}%</div>
                            <div className="w-full h-1 bg-zinc-800 mt-2 overflow-hidden">
                                <div className="h-full bg-[#DFFF00]" style={{ width: `${data.stats.gir_pct}%` }}></div>
                            </div>
                        </div>
                        <div className="border border-zinc-800 bg-zinc-900 p-6 flex flex-col justify-between h-32 hover:border-[#DFFF00] transition-colors group">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                <Flag size={14} className="group-hover:text-[#DFFF00]" /> Putting Avg
                            </div>
                            <div className="text-4xl font-black text-white">{data.stats.putting_avg}</div>
                        </div>
                   </div>

               </div>

               {/* COLUMN 2: SIDEBAR (Equipment & Achievements) */}
               <div className="space-y-8">
                   
                   {/* Equipment / In The Bag */}
                   <div className="border border-zinc-800 bg-black p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4 text-white">
                            <Briefcase size={16} />
                            <h3 className="text-sm font-black uppercase tracking-widest">IN THE BAG</h3>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(data.bio.bag || {}).map(([key, value]: any) => (
                                <div key={key} className="flex flex-col">
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{key}</span>
                                    <span className="text-sm font-bold text-white font-mono uppercase">{value}</span>
                                </div>
                            ))}
                        </div>
                   </div>

                   {/* Career Highlights Mockup */}
                   <div className="border border-zinc-800 bg-zinc-900 p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4 text-[#DFFF00]">
                            <Trophy size={16} />
                            <h3 className="text-sm font-black uppercase tracking-widest">TROPHY CABINET</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black p-3 text-center border border-zinc-800 hover:border-zinc-600 transition-colors">
                                <Award size={20} className="mx-auto mb-2 text-yellow-600" />
                                <span className="text-[10px] font-bold text-zinc-400 block">PGA WINS</span>
                                <span className="text-lg font-black text-white">6</span>
                            </div>
                            <div className="bg-black p-3 text-center border border-zinc-800 hover:border-zinc-600 transition-colors">
                                <DollarSign size={20} className="mx-auto mb-2 text-green-600" />
                                <span className="text-[10px] font-bold text-zinc-400 block">CAREER ($)</span>
                                <span className="text-lg font-black text-white">42M</span>
                            </div>
                        </div>
                   </div>

                   <div className="bg-zinc-800/30 p-4 border-l-2 border-[#DFFF00]">
                       <span className="text-[9px] font-bold text-[#DFFF00] uppercase tracking-widest block mb-2">BIO INTEL</span>
                       <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                           {data.desc || "No biographical data available for this athlete."}
                       </p>
                   </div>

               </div>

           </div>

       </div>
    </div>
  );
}