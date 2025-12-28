import React from 'react';
import Link from 'next/link';
// FIX: Use absolute import path
import { fetchSchedule } from '@/app/sports/nba/lib/espn';
import { ArrowLeft, Zap, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NBABreakdownSchedule() {
  const games = await fetchSchedule();

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 pb-24">
       <Link href="/sports/breakdown" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 font-mono text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} /> Return to Hub
       </Link>

       <header className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-2">
             NBA <span className="text-zinc-800 text-stroke-white">Schedule</span>
          </h1>
          <p className="text-zinc-500 font-mono">Select a matchup to initiate detailed analysis.</p>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game: any) => (
             <Link key={game.id} href={`/sports/breakdown/nba/${game.id}`} className="group relative bg-zinc-900/30 border border-white/5 hover:border-[#DFFF00] p-6 rounded-3xl transition-all duration-300 hover:bg-zinc-900/50">
                 <div className="flex justify-between items-start mb-8">
                     <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                        <Calendar size={12} />
                        {game.status === 'LIVE' ? <span className="text-red-500 animate-pulse">LIVE</span> : game.status}
                     </div>
                     <Zap size={16} className="text-zinc-700 group-hover:text-[#DFFF00] transition-colors" />
                 </div>

                 <div className="flex items-center justify-between gap-4 mb-8">
                     {/* Home */}
                     <div className="flex flex-col items-center gap-3 flex-1">
                        <img src={game.home.logo} alt={game.home.code} className="w-16 h-16 object-contain" />
                        <span className="font-black text-2xl tracking-tighter">{game.home.code}</span>
                        <span className="font-mono text-xs text-zinc-500">{game.home.score}</span>
                     </div>
                     
                     <div className="text-zinc-600 font-mono text-sm">VS</div>

                     {/* Away */}
                     <div className="flex flex-col items-center gap-3 flex-1">
                        <img src={game.away.logo} alt={game.away.code} className="w-16 h-16 object-contain" />
                        <span className="font-black text-2xl tracking-tighter">{game.away.code}</span>
                        <span className="font-mono text-xs text-zinc-500">{game.away.score}</span>
                     </div>
                 </div>

                 {/* FIX: Removed conflicting group-hover:text-white */}
                 <div className="w-full py-3 bg-zinc-950/50 rounded-xl border border-white/5 text-center text-xs font-mono font-bold text-zinc-400 group-hover:bg-[#DFFF00] group-hover:text-black transition-all uppercase tracking-widest">
                     View Breakdown
                 </div>
             </Link>
          ))}
       </div>
    </main>
  );
}