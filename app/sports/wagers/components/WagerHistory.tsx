'use client';

import React, { useEffect, useState } from 'react';
import { getUserWagers } from '../actions';
import { getLiveScores } from '../../actions';
import { Clock, CheckCircle2, XCircle, AlertCircle, Coins, ExternalLink, ArrowUpCircle, ArrowDownCircle, Target, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useSportsMode } from '@/app/context/SportsModeContext';

export default function WagerHistory() {
  const { isSportsMode } = useSportsMode();
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

  // Theme Variables
  const theme = isSportsMode ? {
      cardBg: 'bg-slate-900/50',
      cardBorder: 'border-blue-500/10',
      accent: 'text-blue-400',
      accentBg: 'bg-blue-500',
      subText: 'text-slate-400',
      iconBg: 'bg-slate-800',
      heading: 'text-white'
  } : {
      cardBg: 'bg-zinc-900/50',
      cardBorder: 'border-zinc-800',
      accent: 'text-[#DFFF00]',
      accentBg: 'bg-[#DFFF00]',
      subText: 'text-zinc-500',
      iconBg: 'bg-zinc-900',
      heading: 'text-white'
  };

  if (loading) return <div className={`animate-pulse h-24 rounded-3xl ${isSportsMode ? 'bg-slate-900' : 'bg-zinc-900'}`} />;
  if (wagers.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border shadow-xl ${theme.iconBg} ${theme.cardBorder} ${theme.accent}`}>
                <Clock size={18} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight italic text-white">Wager History</h3>
        </div>
        <button 
            onClick={() => { setLoading(true); getUserWagers().then(data => { setWagers(data); setLoading(false); }); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSportsMode ? 'bg-slate-900 border-blue-500/20 text-slate-400 hover:text-white hover:border-blue-500/50' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:border-[#DFFF00]/50'}`}
        >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wagers.map(wager => (
          <div key={wager.id} className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-6 relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${theme.subText}`}>
                        {wager.is_parlay ? 'Parlay' : 'Single Wager'}
                    </div>
                    <div className="text-lg font-black text-white">{wager.amount} <span className={`text-xs ${theme.subText}`}>CR</span></div>
                </div>
                <StatusBadge status={wager.status} theme={theme} />
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
                        <div key={i} className={`flex justify-between items-start text-xs border-b pb-2 last:border-0 last:pb-0 ${isSportsMode ? 'border-slate-800' : 'border-zinc-800/50'}`}>
                            <div className="flex gap-3">
                                <div className={`mt-1 ${theme.subText}`}>
                                    <Icon size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-zinc-200 font-black uppercase tracking-tight">{mainText}</span>
                                    <span className={`text-[9px] font-mono uppercase ${theme.subText}`}>{subText}</span>
                                    {scoreText && (
                                        <span className={`text-[8px] font-mono mt-0.5 ${theme.accent}`}>{scoreText}</span>
                                    )}
                                </div>
                            </div>
                            <span className={`font-mono px-1.5 py-0.5 rounded ${isSportsMode ? 'bg-slate-950 text-slate-400' : 'bg-zinc-950 text-zinc-500'}`}>@{leg.odds}</span>
                        </div>
                    );
                })}
            </div>

            <div className={`mt-6 pt-4 border-t flex justify-between items-center ${theme.cardBorder}`}>
                <div className="flex flex-col">
                    <div className={`text-[10px] font-mono uppercase ${theme.subText}`}>Total Odds: {wager.odds}</div>
                    <Link 
                        href={`/sports/wagers/${wager.id}`}
                        className={`text-[9px] font-black uppercase tracking-widest mt-1 flex items-center gap-1 hover:underline ${theme.accent}`}
                    >
                        Track Live <ExternalLink size={10} />
                    </Link>
                </div>
                {wager.status === 'won' && (
                    <div className={`flex items-center gap-2 ${theme.accent}`}>
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

function StatusBadge({ status, theme }: { status: string, theme: any }) {
    switch (status) {
        case 'won': return <div className="flex items-center gap-1 text-green-500 text-[8px] font-black uppercase bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle2 size={10} /> Won</div>;
        case 'lost': return <div className="flex items-center gap-1 text-red-500 text-[8px] font-black uppercase bg-red-500/10 px-2 py-1 rounded-full"><XCircle size={10} /> Lost</div>;
        case 'pending': return <div className={`flex items-center gap-1 text-[8px] font-black uppercase px-2 py-1 rounded-full ${theme.accent} ${theme.accentBg}/10`}><Clock size={10} /> Pending</div>;
        default: return <div className={`flex items-center gap-1 text-[8px] font-black uppercase px-2 py-1 rounded-full ${theme.subText} bg-zinc-500/10`}><AlertCircle size={10} /> {status}</div>;
    }
}