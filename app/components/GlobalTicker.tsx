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

      <div className="relative w-full bg-[#DFFF00] py-1.5 overflow-hidden flex items-center z-30 shadow-2xl">

        

        {/* MARQUEE CONTENT */}

        <div className="w-full">

          <Marquee gradient={false} speed={50} className="flex items-center h-full">

             {tickerItems.map((item, i) => (

               <div key={i} className="flex items-center gap-4 mx-4 select-none">

                  

                  {/* SEPARATOR */}

                  <span className="text-black/30 text-[10px] font-black italic">//</span>

  

                  {/* CONTENT */}

                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-black italic">

                     

                     {/* LABELS & VALUES */}

                     {item.type === 'score' ? (

                        <span className="flex gap-3">

                           <span className="opacity-40">{item.sport}</span>

                           <span>{item.matchup}</span>

                           {item.isLive && (

                              <span className="flex items-center gap-1.5 bg-black text-[#DFFF00] px-2 py-0.5 rounded-sm scale-90 origin-left not-italic tracking-normal">

                                 <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />

                                 LIVE

                              </span>

                           )}

                           {item.isFinal && <span className="opacity-40">FINAL</span>}

                        </span>

                     ) : (

                        <span className="flex gap-3">

                           <span className="opacity-40">{item.label}</span>

                           <span>{item.value}</span>

                        </span>

                     )}

  

                  </div>

               </div>

             ))}

             

             {/* EMPTY STATE */}

             {tickerItems.length === 0 && (

                <span className="mx-10 text-[10px] font-black uppercase tracking-[0.3em] text-black italic animate-pulse">

                   INITIALIZING SYSTEM DATA // ESTABLISHING SECURE UPLINK //

                </span>

             )}

          </Marquee>

        </div>

  

      </div>

    );

  }

  