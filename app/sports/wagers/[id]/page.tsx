'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Trophy, Clock, CheckCircle2, XCircle, 
  AlertCircle, Coins, Barcode, Printer, Share2, Activity,
  ArrowUpCircle, ArrowDownCircle, Target
} from 'lucide-react';
import { getUserWagers } from '../actions';
import { getScoreboard, getLiveBoxScore } from '@/app/sports/services/espn';
import PageWrapper from '@/app/components/PageWrapper';

export default function WagerSlipPage() {
  const { id } = useParams();
  const router = useRouter();
  const [wager, setWager] = useState<any>(null);
  const [liveScores, setLiveScores] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const wagers = await getUserWagers();
      const found = wagers.find((w: any) => w.id === id);
      if (found) {
        setWager(found);
        const [nba, nfl] = await Promise.all([
            getScoreboard('nba'),
            getScoreboard('nfl')
        ]);
        const scores = [...nba, ...nfl];
        setLiveScores(scores);

        const gameIds = Array.from(new Set(found.wager_legs.map((l: any) => l.match_id.split('-')[0])));
        const statsMap: Record<string, any> = {};
        
        await Promise.all(gameIds.map(async (gid: any) => {
            const leg = found.wager_legs.find((l: any) => l.match_id.startsWith(gid));
            const stats = await getLiveBoxScore(leg.league as any, gid);
            if (stats) Object.assign(statsMap, stats);
        }));
        
        setPlayerStats(statsMap);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, id]);

  const getLegStatus = (leg: any) => {
    const matchId = leg.match_id.split('-')[0];
    const match = liveScores.find(m => m.id === matchId);
    
    if (!match) return 'pending';

    // 1. Check if the game has started
    // ESPN statuses for upcoming games usually contain a colon (time) or AM/PM
    const isPreGame = !match.isLive && (
        match.status.includes(':') || 
        match.status.includes('PM') || 
        match.status.includes('AM') ||
        match.status.toLowerCase().includes('sched')
    );

    if (isPreGame) return 'pending';

    const homeScore = parseInt(match.home.score) || 0;
    const awayScore = parseInt(match.away.score) || 0;

    // 2. Player Prop Logic
    const cleanPlayerName = leg.match_name.replace(/\[.*?\]\s*/, '');
    const stats = playerStats[cleanPlayerName];
    
    if (stats) {
        const parts = leg.selection.split(' ');
        const val = parseFloat(parts[1] || parts[0]);
        const isOver = leg.selection.startsWith('O') || leg.selection === 'YES';
        
        let actual = 0;
        if (leg.type === 'total') {
            if (stats.YDS) actual = parseInt(stats.YDS);
            else if (stats.PTS) actual = parseInt(stats.PTS);
            else if (stats.REB) actual = parseInt(stats.REB);
            else if (stats.AST) actual = parseInt(stats.AST);
            else if (stats.TD) actual = parseInt(stats.TD);
        }

        if (leg.selection === 'YES') return actual > 0 ? 'winning' : 'losing';
        if (leg.selection === 'NO') return actual === 0 ? 'winning' : 'losing';
        if (isOver) return actual > val ? 'winning' : 'losing';
        return actual < val ? 'winning' : 'losing';
    }

    // 3. Moneyline Logic
    if (leg.type === 'moneyline') {
        if (homeScore === awayScore && match.isLive) return 'pending'; // Tied during game
        if (leg.selection === 'home') return homeScore > awayScore ? 'winning' : 'losing';
        if (leg.selection === 'away') return awayScore > homeScore ? 'winning' : 'losing';
    }

    // 3. Totals Logic (Over/Under)
    if (leg.type === 'total') {
        const totalScore = homeScore + awayScore;
        // Selection format: "O 220.5" or "U 220.5" or "YES"/"NO"
        const parts = leg.selection.split(' ');
        if (parts.length === 2) {
            const threshold = parseFloat(parts[1]);
            if (parts[0] === 'O') return totalScore > threshold ? 'winning' : 'losing';
            if (parts[0] === 'U') return totalScore < threshold ? 'winning' : 'losing';
        }
    }
    
    return 'pending';
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-[#DFFF00]">LOADING_SECURE_TICKET...</div>;
  if (!wager) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-red-500">TICKET_NOT_FOUND</div>;

  return (
    <PageWrapper>
      <main className="min-h-screen bg-zinc-950 text-white pb-20 pt-24 px-6">
        <div className="max-w-xl mx-auto">
          
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Hub</span>
          </button>

          {/* PHYSICAL TICKET UI */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white text-black rounded-sm shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden relative"
          >
            {/* Ticket Header */}
            <div className="p-8 border-b-2 border-dashed border-zinc-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter leading-none mb-1">ZINC<span className="text-zinc-400">SPORTS</span></h1>
                        <p className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Digital Archive Receipt // # {wager.id.slice(0,12)}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Status</div>
                        <StatusBadge status={wager.status} />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Stake</div>
                        <div className="text-xl font-black">{wager.amount} <span className="text-xs">CR</span></div>
                    </div>
                    <div className="text-right">
                        <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Potential Payout</div>
                        <div className="text-xl font-black text-[#DFFF00] bg-black px-3 py-1 rounded inline-block">
                            {Math.floor(wager.amount * wager.odds)} <span className="text-xs">CR</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Content */}
            <div className="p-8 space-y-6">
                <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4 border-b border-zinc-100 pb-2 flex items-center gap-2">
                    <Activity size={10} /> Live Leg Tracking
                </div>

                {wager.wager_legs?.map((leg: any, i: number) => {
                    const status = getLegStatus(leg);
                    const match = liveScores.find(m => m.id === leg.match_id.split('-')[0]);
                    
                    // Resolve Selection Name (e.g. "home" -> "LAL")
                    let selectionDisplay = leg.selection;
                    let selectionLogo = null;
                    let SelectionIcon = null;

                    if (match) {
                        if (leg.selection === 'home') {
                            selectionDisplay = match.home.code;
                            selectionLogo = match.home.logo;
                        } else if (leg.selection === 'away') {
                            selectionDisplay = match.away.code;
                            selectionLogo = match.away.logo;
                        } else if (leg.selection.startsWith('O ')) {
                            SelectionIcon = ArrowUpCircle;
                        } else if (leg.selection.startsWith('U ')) {
                            SelectionIcon = ArrowDownCircle;
                        } else if (leg.selection === 'YES') {
                            SelectionIcon = CheckCircle2;
                        } else if (leg.selection === 'NO') {
                            SelectionIcon = XCircle;
                        } else {
                            SelectionIcon = Target;
                        }
                    }

                    return (
                        <div key={i} className="relative group pl-2">
                            <div className="flex justify-between items-center mb-3">
                                <div className="space-y-1">
                                    <div className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">{leg.match_name}</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            {selectionLogo ? (
                                                <img src={selectionLogo} className="w-5 h-5 object-contain" alt="" />
                                            ) : SelectionIcon ? (
                                                <SelectionIcon size={18} className="text-zinc-400" />
                                            ) : null}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black uppercase tracking-tight text-black flex items-center gap-2">
                                                {selectionDisplay}
                                                <span className="text-[10px] font-mono bg-black text-white px-1.5 py-0.5 rounded italic">PICK</span>
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{leg.type} Market</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black">@{leg.odds}</div>
                                    <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border mt-1 ${
                                        status === 'winning' ? 'text-green-600 border-green-200 bg-green-50' : 
                                        status === 'losing' ? 'text-red-600 border-red-200 bg-red-50' : 
                                        'text-zinc-400 border-zinc-200 bg-zinc-50'
                                    }`}>
                                        {status}
                                    </div>
                                </div>
                            </div>
                            
                            {match && (
                                <div className="bg-zinc-50/80 rounded-xl p-4 flex justify-between items-center border border-zinc-100 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className={`w-2 h-2 rounded-full ${match.isLive ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-zinc-300'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-zinc-900 uppercase">{match.status}</span>
                                            <span className="text-[8px] font-mono text-zinc-400 uppercase">Live Update</span>
                                        </div>
                                    </div>
                                    
                                    {/* DYNAMIC STAT DISPLAY */}
                                    {leg.match_name.replace(/\[.*?\]\s*/, '') in playerStats ? (
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="text-[8px] font-bold text-zinc-400 uppercase">Current Stat</div>
                                                <div className="text-lg font-black leading-none text-[#DFFF00] bg-black px-2 py-1 rounded">
                                                    {(() => {
                                                        const s = playerStats[leg.match_name.replace(/\[.*?\]\s*/, '')];
                                                        return s.YDS ? `${s.YDS} YDS` : s.PTS ? `${s.PTS} PTS` : s.REB ? `${s.REB} REB` : s.AST ? `${s.AST} AST` : s.TD ? `${s.TD} TD` : '0';
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-[8px] font-bold text-zinc-400 uppercase">{match.away.code}</div>
                                                <div className="text-lg font-black leading-none">{match.away.score}</div>
                                            </div>
                                            <div className="h-8 w-px bg-zinc-200" />
                                            <div>
                                                <div className="text-[8px] font-bold text-zinc-400 uppercase">{match.home.code}</div>
                                                <div className="text-lg font-black leading-none">{match.home.score}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Status Indicator on the left */}
                            <div className={`absolute -left-10 top-4 p-1.5 rounded-full border-2 ${
                                status === 'winning' ? 'bg-green-50 border-green-500 text-green-600' : 
                                status === 'losing' ? 'bg-red-50 border-red-500 text-red-600' : 
                                'bg-zinc-50 border-zinc-200 text-zinc-300'
                            }`}>
                                {status === 'winning' ? <CheckCircle2 size={14} /> : 
                                 status === 'losing' ? <XCircle size={14} /> : 
                                 <Clock size={14} />}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Ticket Footer */}
            <div className="p-8 bg-zinc-50 border-t-2 border-dashed border-zinc-200 space-y-6">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    <span>Combined Odds</span>
                    <span className="text-black">{wager.odds}</span>
                </div>
                
                <div className="flex flex-col items-center gap-4 pt-4">
                    <Barcode className="w-full h-16 text-zinc-300" />
                    <div className="text-[8px] font-mono text-zinc-400">ZINC_SECURE_PAYMENT_NODE_VAL_{wager.id.slice(-8)}</div>
                </div>

                <div className="flex gap-2 pt-4">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors">
                        <Printer size={14} /> Print Ticket
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-200 text-zinc-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-zinc-300 transition-colors">
                        <Share2 size={14} /> Share
                    </button>
                </div>
            </div>

            {/* Side punch-outs for authentic look */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-zinc-950 rounded-full" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-zinc-950 rounded-full" />
          </motion.div>

          <p className="mt-8 text-center text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em]">
            Wagers are final once committed to the archive.
          </p>
        </div>
      </main>
    </PageWrapper>
  );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'won': return <div className="text-green-600 text-xs font-black uppercase bg-green-100 px-3 py-1 rounded">Won</div>;
        case 'lost': return <div className="text-red-600 text-xs font-black uppercase bg-red-100 px-3 py-1 rounded">Lost</div>;
        case 'pending': return <div className="text-zinc-600 text-xs font-black uppercase bg-zinc-100 px-3 py-1 rounded">Pending</div>;
        default: return <div className="text-zinc-400 text-xs font-black uppercase">{status}</div>;
    }
}
