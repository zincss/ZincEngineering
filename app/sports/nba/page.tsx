// app/sports/nba/page.tsx
import React from 'react';
import Link from 'next/link';
import { Activity, TrendingUp, Search as SearchIcon } from 'lucide-react';
import { getDashboardData } from './actions';
import GameTicker from './components/GameTicker';
import NBASearch from './components/NBASearch';
import ConferenceStandings from './components/ConferenceStandings';
import LeaderSlideshow from '../components/LeaderSlideshow';
import MVPPredictor from '../components/MVPPredictor';
import WagerGrid from '../wagers/components/WagerGrid';
import WagerHistory from '../wagers/components/WagerHistory';
import { getPlayerProfile, getTeamSnapshot } from './actions';

export const dynamic = 'force-dynamic';

export default async function NBAHub() {
  const { scores, standings, leaders } = await getDashboardData();

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-[#DFFF00] selection:text-black font-sans">
...
      {/* --- LIVE TICKER --- */}
      <GameTicker scores={scores || []} />

      {/* --- MAIN GRID --- */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        {/* WAGERING SECTION */}
        <WagerGrid matches={scores || []} league="nba" fetchRoster={getTeamSnapshot} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1px] bg-zinc-800 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
            
            {/* COL 1: STANDINGS (8 Spans) */}
            <div className="lg:col-span-8 bg-zinc-950 p-8">
                {/* Redundant header removed */}
                <ConferenceStandings east={standings?.groupA || []} west={standings?.groupB || []} />

                <MVPPredictor leaders={leaders} league="nba" standings={standings} getProfile={getPlayerProfile} />
            </div>

            {/* COL 2: LEADERS (4 Spans) */}
            <div className="lg:col-span-4 bg-zinc-950 p-8 border-l border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00]">
                        <Activity size={18} />
                    </div>
                    <h3 className="text-xl font-black uppercase text-white tracking-tight">Daily Leaders</h3>
                </div>
                
                <div className="space-y-6">
                    <LeaderModule title="Points" icon="PTS" players={leaders?.pts || []} />
                    <LeaderModule title="Assists" icon="AST" players={leaders?.ast || []} />
                    <LeaderModule title="Rebounds" icon="REB" players={leaders?.reb || []} />
                    <LeaderModule title="Steals" icon="STL" players={leaders?.stl || []} />
                    <LeaderModule title="Blocks" icon="BLK" players={leaders?.blk || []} />
                </div>
            </div>

        </div>

        <WagerHistory />
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
            <Link href={`/sports/nba/player/${top.id}`} className="group block relative bg-zinc-950 hover:bg-[#DFFF00] transition-colors p-6 border-b border-zinc-800">
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
                    <Link href={`/sports/nba/player/${p.id}`} key={i} className="flex items-center justify-between p-3 px-4 text-xs hover:bg-zinc-800 transition-colors group">
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