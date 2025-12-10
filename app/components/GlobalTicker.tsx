'use client';

import React, { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { 
  Trophy, 
  Zap, 
  Activity,
  CheckCircle2
} from 'lucide-react';
import { getLiveScores as getNBAScores } from '@/app/sports/nba/actions';
import { getDashboardData as getNFLData } from '@/app/sports/nfl/actions';
import { getF1DashboardData } from '@/app/sports/f1/actions';

export default function GlobalTicker() {
  const [tickerItems, setTickerItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
          const [nbaData, nflData, f1Data] = await Promise.all([
            getNBAScores(),
            getNFLData(),
            getF1DashboardData()
          ]);

          const items: any[] = [];

          // 1. F1 WINNER (From latest race)
          if (f1Data?.drivers) {
             const winner = f1Data.drivers.find((d: any) => d.stats?.latest?.pos === 'P1');
             if (winner) {
                 items.push({ 
                    type: 'f1', 
                    label: 'F1 WINNER', 
                    value: `${winner.givenName} ${winner.familyName} (${winner.stats.latest.race})`, 
                    icon: <Trophy size={12} /> 
                 });
             }
          }

          // 2. NFL SCORES (Logic: Show Finals until a Live game starts, then swap to Live)
          if (nflData?.scores && Array.isArray(nflData.scores)) {
             const allGames = nflData.scores;
             
             // Detect if there is any LIVE action right now
             const liveGames = allGames.filter((g: any) => 
                g.status === 'LIVE' || 
                g.status.includes('Q') || 
                g.status.includes('Halftime') ||
                g.status.includes('OT')
             );

             // Detect Final games
             const finalGames = allGames.filter((g: any) => g.status.includes('Final'));

             // DECISION: If Live games exist, prioritize them (Swap to Live). 
             // Otherwise, keep showing the week's results (Finals).
             const gamesToShow = liveGames.length > 0 ? liveGames : finalGames;

             gamesToShow.forEach((game: any) => {
                const isLive = game.status === 'LIVE' || game.status.includes('Q') || game.status.includes('OT');
                const isFinal = game.status.includes('Final');
                
                items.push({
                   type: 'score',
                   sport: 'NFL',
                   label: isFinal ? 'FINAL' : game.status,
                   matchup: `${game.home.code} ${game.home.score} - ${game.away.score} ${game.away.code}`,
                   isLive: isLive,
                   isFinal: isFinal
                });
             });
          }

          // 3. NBA SCORES
          if (nbaData && Array.isArray(nbaData)) {
             nbaData.forEach((game: any) => {
                const isLive = game.status === 'LIVE' || game.status.includes('Q');
                const isFinal = game.status.includes('Final');

                items.push({
                   type: 'score',
                   sport: 'NBA',
                   label: isFinal ? 'FINAL' : game.status,
                   matchup: `${game.home.code} ${game.home.score} - ${game.away.score} ${game.away.code}`,
                   isLive: isLive,
                   isFinal: isFinal
                });
             });
          }
          
          // 4. SYSTEM STATUS
          items.push({ type: 'system', label: 'SYSTEM', value: 'ONLINE', icon: <Zap size={12} /> });

          setTickerItems(items);
      } catch (e) {
          console.error("Ticker Error", e);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative w-full h-10 bg-zinc-950/80 backdrop-blur-md border-y border-white/5 overflow-hidden flex items-center z-40">
      
      {/* LEFT ANCHOR: LABEL */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-zinc-950/90 backdrop-blur-xl pl-4 pr-6 flex items-center gap-3 border-r border-white/5 clip-path-slant">
         <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
               Live Wire
            </span>
         </div>
      </div>

      {/* MARQUEE CONTENT */}
      <div className="w-full mask-linear-fade">
        <Marquee gradient={false} speed={40} className="flex items-center h-full">
           {tickerItems.map((item, i) => (
             <div key={i} className="flex items-center gap-3 mx-6 select-none">
                
                {/* SEPARATOR */}
                <span className="text-zinc-800 text-[10px] font-black">///</span>

                {/* CONTENT */}
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                   
                   {/* ICONS */}
                   {item.type === 'f1' && <span className="text-[#DFFF00]">{item.icon}</span>}
                   {item.type === 'system' && <span className="text-emerald-500">{item.icon}</span>}
                   {item.type === 'score' && (
                       item.isLive 
                        ? <Activity size={12} className="text-red-500 animate-pulse"/> 
                        : (item.isFinal ? <CheckCircle2 size={12} className="text-zinc-600"/> : <Activity size={12} className="text-zinc-600"/>)
                   )}

                   {/* LABELS & VALUES */}
                   {item.type === 'score' ? (
                      <span className="flex gap-2">
                         <span className="font-bold text-zinc-500">{item.sport}</span>
                         <span className={item.isLive ? "text-red-400 font-bold" : "text-zinc-300"}>{item.matchup}</span>
                         {item.isLive && <span className="text-red-500 font-black px-1 rounded bg-red-500/10">LIVE</span>}
                         {item.isFinal && <span className="text-zinc-600 font-bold">F</span>}
                      </span>
                   ) : (
                      <span className="flex gap-2">
                         <span className="font-bold text-zinc-500">{item.label}</span>
                         <span className="text-zinc-200">{item.value}</span>
                      </span>
                   )}

                </div>
             </div>
           ))}
           
           {/* EMPTY STATE */}
           {tickerItems.length === 0 && (
              <span className="mx-10 text-[10px] font-mono uppercase text-zinc-600 animate-pulse">
                 Establishing Secure Uplink...
              </span>
           )}
        </Marquee>
      </div>

      {/* RIGHT FADE OVERLAY */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none z-10" />

    </div>
  );
}