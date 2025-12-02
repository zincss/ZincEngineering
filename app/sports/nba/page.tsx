// app/sports/nba/page.tsx
import React from 'react';
import Link from 'next/link';
import { Activity, Trophy, TrendingUp, Search as SearchIcon } from 'lucide-react';
import { getDashboardData } from './actions';
import GameTicker from './components/GameTicker';
import NBASearch from './components/NBASearch';

export const dynamic = 'force-dynamic';

export default async function NBAHub() {
  const { scores, standings, leaders } = await getDashboardData();

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-[#DFFF00] selection:text-black">
      
      {/* HERO SECTION */}
      {/* FIX 1: Added z-40 to sit above Ticker. Removed 'overflow-hidden' from here. */}
      <section className="relative pt-24 pb-12 px-6 border-b border-zinc-800 z-40">
        
        {/* FIX 2: Moved overflow-hidden to this wrapper so the background stays contained, but the dropdown can escape. */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-0 right-0 w-1/3 h-full bg-[#DFFF00]/5 -skew-x-12" />
        </div>
        
        <div className="max-w-[1600px] mx-auto relative z-10">
          <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-[10px] uppercase tracking-widest mb-4">
             <Activity size={12} className="animate-pulse" />
             <span>System Status: Monitoring</span>
          </div>
          
          <div className="flex flex-col xl:flex-row justify-between items-end gap-12">
            <div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none mb-2">
                NBA <span className="text-zinc-800 text-stroke-white">NEXUS</span>
              </h1>
              <p className="font-mono text-zinc-500 text-sm max-w-xl mb-8">
                /// LIVE OPERATIONS DASHBOARD<br/>
                Real-time ingestion of league telemetry, performance metrics, and tactical data snapshots.
              </p>
              
              {/* SEARCH MODULE INTEGRATION */}
              <div className="flex flex-col gap-2 relative z-50">
                 <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <SearchIcon size={10} /> Database Access
                 </div>
                 <NBASearch />
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="flex gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 min-w-[140px]">
                 <div className="text-[10px] text-zinc-500 font-mono uppercase">Active Games</div>
                 <div className="text-3xl font-black text-white">{scores?.length || 0}</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 min-w-[140px]">
                 <div className="text-[10px] text-zinc-500 font-mono uppercase">Season Phase</div>
                 <div className="text-3xl font-black text-[#DFFF00]">REG</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- LIVE TICKER --- */}
      <GameTicker scores={scores || []} />

      {/* --- MAIN GRID --- */}
      <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COL 1: STANDINGS (8 Spans) */}
        <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-[#DFFF00]" />
                <h3 className="text-lg font-black uppercase text-white tracking-tight">Conference Standings</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <StandingsTable conference="EASTERN" teams={standings?.east || []} />
                <StandingsTable conference="WESTERN" teams={standings?.west || []} />
            </div>
        </div>

        {/* COL 2: LEADERS (4 Spans) */}
        <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-[#DFFF00]" />
                <h3 className="text-lg font-black uppercase text-white tracking-tight">Daily Leaders</h3>
            </div>
            
            <div className="space-y-6">
                <LeaderModule title="Points" icon="PTS" players={leaders?.pts || []} />
                <LeaderModule title="Assists" icon="AST" players={leaders?.ast || []} />
                <LeaderModule title="Rebounds" icon="REB" players={leaders?.reb || []} />
            </div>
        </div>

      </div>
    </main>
  );
}

// --- SUB COMPONENTS ---

function StandingsTable({ conference, teams }: { conference: string, teams: any[] }) {
    if(!teams || teams.length === 0) return <div className="p-4 border border-zinc-800 text-zinc-500 font-mono text-xs">Loading Data...</div>

    const sortedTeams = [...teams].sort((a, b) => {
        const pctA = parseFloat(a.stats.pct || '0');
        const pctB = parseFloat(b.stats.pct || '0');
        return pctB - pctA; 
    });

    return (
        <div className="border border-zinc-800 bg-zinc-900/10">
            <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                {conference}
            </div>
            <div className="divide-y divide-zinc-800/50">
                {sortedTeams.map((t, index) => (
                    <Link href={`/sports/nba/team/${t.id}`} key={t.id} className="flex items-center justify-between p-3 hover:bg-zinc-900 transition-colors group">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-zinc-600 w-4">{index + 1}</span>
                            <img src={t.logo} className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" alt={t.name} />
                            <span className="font-bold text-xs text-zinc-300 group-hover:text-white group-hover:translate-x-1 transition-all">{t.abbr}</span>
                        </div>
                        <div className="font-mono text-xs text-zinc-500">
                            <span className="text-white mr-3">{t.stats.w}-{t.stats.l}</span>
                            <span className="text-zinc-600">{t.stats.gb} GB</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

function LeaderModule({ title, icon, players }: { title: string, icon: string, players: any[] }) {
    if (!players || players.length === 0) return null;
    const top = players[0];
    const rest = players.slice(1, 5);

    return (
        <div className="border border-zinc-800 bg-zinc-900/20 mb-4">
            {/* Top Leader */}
            <Link href={`/sports/nba/player/${top.id}`} className="block p-4 flex items-center gap-4 bg-zinc-900/40 border-b border-zinc-800 relative overflow-hidden group hover:bg-zinc-900 transition-colors">
                <div className="absolute top-0 right-0 p-2 opacity-10 font-black text-6xl text-white select-none">{icon}</div>
                <img src={top.headshot} className="w-16 h-16 rounded-full bg-zinc-800 object-cover border border-zinc-700 relative z-10" alt={top.name} />
                <div className="relative z-10">
                    <div className="text-[#DFFF00] font-mono text-xs mb-1">{title} Leader</div>
                    <div className="text-lg font-black uppercase leading-none text-white">{top.name}</div>
                    <div className="text-xs font-bold text-zinc-500 mt-1">{top.team} • <span className="text-white">{top.value}</span></div>
                </div>
            </Link>
            {/* List */}
            <div className="divide-y divide-zinc-800">
                {rest.map((p, i) => (
                    <Link href={`/sports/nba/player/${p.id}`} key={i} className="flex items-center justify-between p-3 text-xs hover:bg-zinc-900 transition-colors group">
                        <div className="flex items-center gap-2">
                             <span className="font-mono text-zinc-600">{i+2}</span>
                             <span className="font-bold text-zinc-400 group-hover:text-white transition-colors">{p.name}</span>
                             <span className="text-[9px] text-zinc-600 font-mono">{p.team}</span>
                        </div>
                        <div className="font-mono text-white">{p.value}</div>
                    </Link>
                ))}
            </div>
        </div>
    )
}