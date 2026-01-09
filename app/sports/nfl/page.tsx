// app/sports/nfl/page.tsx
import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { getDashboardData } from './actions';
import GameTicker from './components/GameTicker';
import NFLStandings from './components/NFLStandings';
import PlayerSearch from './components/PlayerSearch';
import Link from 'next/link';
import LeaderSlideshow from '../components/LeaderSlideshow';
import MVPPredictor from '../components/MVPPredictor';
import { getPlayerProfile } from './actions';

export const dynamic = 'force-dynamic';

export default async function NFLHub() {
  const { scores, standings, leaders } = await getDashboardData();

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-[#DFFF00] selection:text-black font-sans">
      
      {/* HEADER */}
      <div className="relative z-50 pt-24 pb-8 px-6 max-w-[1600px] mx-auto w-full border-b border-zinc-800">
        <div className="flex flex-col xl:flex-row justify-between items-center xl:items-end gap-4 sm:gap-12 mb-6 sm:mb-12">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                    <Zap size={24} className="text-[#DFFF00]" />
                </div>
                <div>
                    <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                        <span>LEAGUE_OPS // NFL</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">
                        GRID<span className="text-[#DFFF00]">IRON</span>
                    </h1>
                </div>
            </div>

            <LeaderSlideshow leaders={leaders} league="nfl" />
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-xl">
            <PlayerSearch />
        </div>
      </div>

      {/* TICKER */}
      <GameTicker scores={scores || []} />

      {/* MAIN GRID */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1px] bg-zinc-800 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
            
            {/* COL 1: STANDINGS */}
            <div className="lg:col-span-8 bg-zinc-950 p-8">
                {/* Redundant header removed */}
                <NFLStandings afc={standings?.groupA || []} nfc={standings?.groupB || []} />
                
                <MVPPredictor leaders={leaders} league="nfl" standings={standings} getProfile={getPlayerProfile} />
            </div>

            {/* COL 2: LEADERS */}
            <div className="lg:col-span-4 bg-zinc-950 p-8 border-l border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00]">
                        <Zap size={18} />
                    </div>
                    <h3 className="text-xl font-black uppercase text-white tracking-tight">League Leaders</h3>
                </div>
                
                <div className="space-y-6">
                    <LeaderModule title="Passing Yards" icon="PASS" players={leaders?.pass || []} />
                    <LeaderModule title="Rushing Yards" icon="RUSH" players={leaders?.rush || []} />
                    <LeaderModule title="Receiving Yards" icon="REC" players={leaders?.rec || []} />
                    <LeaderModule title="Sacks" icon="SACK" players={leaders?.def || []} />
                    <LeaderModule title="Interceptions" icon="INT" players={leaders?.int || []} />
                    <LeaderModule title="Total Tackles" icon="TCKL" players={leaders?.tackles || []} />
                </div>
            </div>

        </div>
      </div>
    </main>
  );
}

function LeaderModule({ title, icon, players }: { title: string, icon: string, players: any[] }) {
    if (!players || players.length === 0) return null;
    const top = players[0];
    const rest = players.slice(1, 5);

    return (
        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl overflow-hidden">
            <Link href={`/sports/nfl/player/${top.id}`} className="group block relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors p-6 border-b border-zinc-800">
                <div className="flex items-center gap-4 relative z-10">
                    <img src={top.headshot} className="w-16 h-16 rounded-2xl bg-zinc-900 object-cover border border-zinc-800 group-hover:border-black/20" alt={top.name} />
                    <div>
                        <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1 group-hover:text-black/60">{title} Leader</div>
                        <div className="text-lg font-black uppercase leading-none text-white group-hover:text-black mb-1">{top.name}</div>
                        <div className="text-xs font-bold text-zinc-600 group-hover:text-black/70">{top.team} • <span className="text-white group-hover:text-black">{top.value}</span></div>
                    </div>
                </div>
            </Link>
            <div className="divide-y divide-zinc-800/50 bg-zinc-900/50">
                {rest.map((p, i) => (
                    <Link href={`/sports/nfl/player/${p.id}`} key={i} className="flex items-center justify-between p-3 px-4 text-xs hover:bg-zinc-800 transition-colors group">
                        <div className="flex items-center gap-3">
                             <span className="font-mono text-zinc-600 w-4">{i+2}</span>
                             <span className="font-bold text-zinc-400 group-hover:text-white transition-colors uppercase">{p.name}</span>
                        </div>
                        <div className="font-mono text-white">{p.value}</div>
                    </Link>
                ))}
            </div>
        </div>
    )
}