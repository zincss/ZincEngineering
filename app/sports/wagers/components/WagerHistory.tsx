'use client';

import React, { useEffect, useState } from 'react';
import { getUserWagers } from '../actions';
import { getLiveScores } from '../../actions';
import { Clock, CheckCircle2, XCircle, AlertCircle, Coins, ExternalLink, ArrowUpCircle, ArrowDownCircle, Target } from 'lucide-react';
import Link from 'next/link';

export default function WagerHistory() {
  const [wagers, setWagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
        const [wagersData, scoresData] = await Promise.all([
            getUserWagers(),
            getLiveScores()
        ]);
        setWagers(wagersData);
        setScores(scoresData);
        setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="animate-pulse h-24 bg-zinc-900 rounded-3xl" />;
  if (wagers.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] border border-zinc-800 shadow-xl">
          <Clock size={18} />
        </div>
        <h3 className="text-xl font-black uppercase text-white tracking-tight italic">Wager History</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wagers.map(wager => (
          <div key={wager.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                        {wager.is_parlay ? 'Parlay' : 'Single Wager'}
                    </div>
                    <div className="text-lg font-black text-white">{wager.amount} <span className="text-xs text-zinc-600">CR</span></div>
                </div>
                <StatusBadge status={wager.status} />
            </div>

            <div className="space-y-4">
                {wager.wager_legs?.map((leg: any, i: number) => {
                    const matchId = leg.match_id.split('-')[0];
                    const match = scores.find(s => s.id === matchId);
                    const isPlayerProp = leg.match_name.includes('[');
                    
                    let mainText = leg.selection;
                    let subText = leg.match_name;
                    let Icon = Target;
                    let scoreText = '';

                    // Formatting
                    if (isPlayerProp) {
                        const playerName = leg.match_name.match(/\[(.*?)\]/)?.[1] || 'Player';
                        const cleanMatch = leg.match_name.replace(/\[.*?\]\s*/, '');
                        subText = `${playerName} • ${cleanMatch}`;
                        
                        if (leg.selection === 'YES') {
                            mainText = 'To Happen (Yes)';
                            Icon = CheckCircle2;
                        } else if (leg.selection.startsWith('O ')) {
                            mainText = `Over ${leg.selection.substring(2)}`;
                            Icon = ArrowUpCircle;
                        } else if (leg.selection.startsWith('U ')) {
                            mainText = `Under ${leg.selection.substring(2)}`;
                            Icon = ArrowDownCircle;
                        }
                    } else if (leg.type === 'total') {
                         if (leg.selection.includes(':')) {
                            const [side, line] = leg.selection.split(':');
                            mainText = `${side === 'over' ? 'Over' : 'Under'} ${line}`;
                            Icon = side === 'over' ? ArrowUpCircle : ArrowDownCircle;
                         } else {
                            // Legacy/Broken format fallback
                            mainText = leg.selection.toUpperCase(); 
                         }
                         subText = leg.match_name;

                         if (match) {
                             const total = parseInt(match.home.score) + parseInt(match.away.score);
                             scoreText = `${match.away.code} ${match.away.score} - ${match.home.code} ${match.home.score} (T: ${total})`;
                         }
                    } else if (leg.type === 'spread') {
                        const [side, line] = leg.selection.split(':');
                        mainText = `${side === 'home' ? 'Home' : 'Away'} ${line}`;
                        subText = leg.match_name;
                        if (match) {
                             scoreText = `${match.away.code} ${match.away.score} - ${match.home.code} ${match.home.score}`;
                        }
                    }

                    return (
                        <div key={i} className="flex justify-between items-start text-xs border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                            <div className="flex gap-3">
                                <div className="mt-1 text-zinc-600">
                                    <Icon size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-zinc-200 font-black uppercase tracking-tight">{mainText}</span>
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{subText}</span>
                                    {scoreText && (
                                        <span className="text-[8px] font-mono text-[#DFFF00] mt-0.5">{scoreText}</span>
                                    )}
                                </div>
                            </div>
                            <span className="text-zinc-500 font-mono bg-zinc-950 px-1.5 py-0.5 rounded">@{leg.odds}</span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex flex-col">
                    <div className="text-[10px] font-mono text-zinc-600 uppercase">Total Odds: {wager.odds}</div>
                    <Link 
                        href={`/sports/wagers/${wager.id}`}
                        className="text-[9px] font-black text-[#DFFF00] uppercase tracking-widest mt-1 flex items-center gap-1 hover:underline"
                    >
                        Track Live <ExternalLink size={10} />
                    </Link>
                </div>
                {wager.status === 'won' && (
                    <div className="flex items-center gap-2 text-[#DFFF00]">
                        <Coins size={12} />
                        <span className="text-xs font-black">+{wager.payout} CR</span>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'won': return <div className="flex items-center gap-1 text-green-500 text-[8px] font-black uppercase bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle2 size={10} /> Won</div>;
        case 'lost': return <div className="flex items-center gap-1 text-red-500 text-[8px] font-black uppercase bg-red-500/10 px-2 py-1 rounded-full"><XCircle size={10} /> Lost</div>;
        case 'pending': return <div className="flex items-center gap-1 text-[#DFFF00] text-[8px] font-black uppercase bg-[#DFFF00]/10 px-2 py-1 rounded-full"><Clock size={10} /> Pending</div>;
        default: return <div className="flex items-center gap-1 text-zinc-500 text-[8px] font-black uppercase bg-zinc-500/10 px-2 py-1 rounded-full"><AlertCircle size={10} /> {status}</div>;
    }
}