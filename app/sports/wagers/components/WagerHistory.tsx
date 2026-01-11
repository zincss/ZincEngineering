'use client';

import React, { useEffect, useState } from 'react';
import { getUserWagers } from '../actions';
import { Clock, CheckCircle2, XCircle, AlertCircle, Coins, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function WagerHistory() {
  const [wagers, setWagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserWagers().then(data => {
      setWagers(data);
      setLoading(false);
    });
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

            <div className="space-y-3">
                {wager.wager_legs?.map((leg: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                            <span className="text-zinc-400 font-bold uppercase">{leg.selection}</span>
                            <span className="text-[8px] font-mono text-zinc-600 uppercase">{leg.match_name}</span>
                        </div>
                        <span className="text-zinc-500 font-mono">@{leg.odds}</span>
                    </div>
                ))}
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