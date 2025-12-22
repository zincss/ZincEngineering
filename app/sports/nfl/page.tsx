// app/sports/nfl/page.tsx
import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { getDashboardData } from './actions';
import GameTicker from './components/GameTicker';
import NFLStandings from './components/NFLStandings';
import PlayerSearch from './components/PlayerSearch';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NFLHub() {
  const { scores, standings, leaders } = await getDashboardData();

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-[#DFFF00] selection:text-black">
      
      {/* HERO SECTION */}
      <section className="relative h-[40vh] min-h-[400px] flex items-center overflow-hidden border-b border-zinc-800">
         <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10" />
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=2626&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale" />
         </div>

         <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6">
            <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-[10px] uppercase tracking-widest mb-6 animate-pulse">
                <Activity size={12} />
                <span>Uplink Active</span>
            </div>
            
            <div className="flex flex-col xl:flex-row justify-between items-end gap-12">
                <div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none mb-4">
                        NFL <span className="text-zinc-800 text-stroke-white">NEXUS</span>
                    </h1>
                    <div className="mt-6">
                        <PlayerSearch />
                    </div>
                </div>

                {/* QUICK STATS */}
                <div className="flex gap-4">
                  <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 p-4 min-w-[140px]">
                     <div className="text-[10px] text-zinc-500 font-mono uppercase">Live Events</div>
                     <div className="text-3xl font-black text-white">{scores?.length || 0}</div>
                  </div>
                  <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 p-4 min-w-[140px]">
                     <div className="text-[10px] text-zinc-500 font-mono uppercase">Season Phase</div>
                     <div className="text-3xl font-black text-[#DFFF00]">REG</div>
                  </div>
                </div>
            </div>
         </div>
      </section>

      {/* TICKER */}
      <GameTicker scores={scores || []} />

      {/* MAIN GRID */}
      <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COL 1: STANDINGS */}
        <div className="lg:col-span-8">
            <NFLStandings afc={standings?.afc || []} nfc={standings?.nfc || []} />
        </div>

        {/* COL 2: LEADERS */}
        <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
                <Zap size={16} className="text-[#DFFF00]" />
                <h3 className="text-lg font-black uppercase text-white tracking-tight">League Leaders</h3>
            </div>
            
            <div className="space-y-6">
                <LeaderModule title="Passing Yards" icon="PASS" players={leaders?.pass || []} />
                <LeaderModule title="Rushing Yards" icon="RUSH" players={leaders?.rush || []} />
                <LeaderModule title="Receiving Yards" icon="REC" players={leaders?.rec || []} />
                <LeaderModule title="Sacks" icon="SACK" players={leaders?.def || []} />
            </div>
        </div>

      </div>
    </main>
  );
}

// ... Sub Component LeaderModule stays the same
function LeaderModule({ title, icon, players }: { title: string, icon: string, players: any[] }) {
    if (!players || players.length === 0) return null;
    const top = players[0];
    const rest = players.slice(1, 5);

    return (
        <div className="border border-zinc-800 bg-zinc-900/20 mb-4">
            <Link href={`/sports/nfl/player/${top.id}`} className="flex p-4 items-center gap-4 bg-zinc-900/40 border-b border-zinc-800 relative overflow-hidden group hover:bg-zinc-900 transition-colors">
                <div className="absolute top-0 right-0 p-2 opacity-5 font-black text-6xl text-white select-none">{icon}</div>
                <img src={top.headshot} className="w-16 h-16 rounded-full bg-zinc-800 object-cover border border-zinc-700 relative z-10" alt={top.name} />
                <div className="relative z-10">
                    <div className="text-[#DFFF00] font-mono text-[10px] mb-1 uppercase">{title} Leader</div>
                    <div className="text-lg font-black uppercase leading-none text-white">{top.name}</div>
                    <div className="text-xs font-bold text-zinc-500 mt-1">{top.team} • <span className="text-white">{top.value}</span></div>
                </div>
            </Link>
            <div className="divide-y divide-zinc-800">
                {rest.map((p, i) => (
                    <Link href={`/sports/nfl/player/${p.id}`} key={i} className="flex items-center justify-between p-3 text-xs hover:bg-zinc-900 transition-colors group">
                        <div className="flex items-center gap-3">
                             <span className="font-mono text-zinc-600 text-[10px]">{i+2}</span>
                             <span className="font-bold text-zinc-400 group-hover:text-white transition-colors uppercase">{p.name}</span>
                             <span className="text-[9px] text-zinc-600 font-mono">{p.team}</span>
                        </div>
                        <div className="font-mono text-white">{p.value}</div>
                    </Link>
                ))}
            </div>
        </div>
    )
}