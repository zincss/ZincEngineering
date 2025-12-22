'use client';

import React, { useEffect, useState } from 'react';
import { getBookieBoard, placeWager } from './actions';
import { DollarSign, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function BookiesPage() {
  const { profile, refreshProfile } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState<any | null>(null);
  const [wagerAmount, setWagerAmount] = useState(100);

  useEffect(() => {
    getBookieBoard().then(data => {
      setGames(data);
      setLoading(false);
    });
  }, []);

  const handlePlaceBet = async () => {
    if (!selectedBet) return;
    const res = await placeWager(selectedBet.game, selectedBet.side, wagerAmount);
    if (res.success) {
      alert(`Wager Placed! Potential Payout: ${Math.floor(wagerAmount * selectedBet.odds)}`);
      refreshProfile();
      setSelectedBet(null);
    } else {
      alert('Bet Failed: ' + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto pt-20 mb-12 flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
           <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">The Bookie</h1>
           <p className="text-zinc-400 font-mono">High-stakes wagering on live feeds.</p>
        </div>
        <div className="text-right">
           <div className="text-xs font-bold text-zinc-500 uppercase">Current Balance</div>
           <div className="text-2xl font-mono text-[#DFFF00]">{profile?.credits.toLocaleString()} CR</div>
        </div>
      </div>

      {/* BETTING BOARD */}
      {loading ? <Loader2 className="animate-spin mx-auto" /> : (
        <div className="max-w-4xl mx-auto grid gap-4">
          {games.map((g) => (
             <div key={g.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
                {/* MATCH INFO */}
                <div className="flex items-center gap-4">
                   <div className={`text-xs font-bold px-2 py-1 rounded ${g.sport === 'NBA' ? 'bg-orange-900/20 text-orange-500' : 'bg-blue-900/20 text-blue-500'}`}>
                      {g.sport}
                   </div>
                   <div>
                      <div className="font-black text-xl">{g.home.code} vs {g.away.code}</div>
                      <div className="text-xs text-zinc-500 font-mono">{g.status}</div>
                   </div>
                </div>

                {/* ODDS BUTTONS */}
                <div className="flex gap-3">
                   <button 
                      onClick={() => setSelectedBet({ game: g, side: 'HOME', odds: g.odds.home })}
                      className="group flex flex-col items-center px-4 py-2 bg-black border border-zinc-700 hover:border-[#DFFF00] rounded hover:bg-zinc-800 transition-all"
                   >
                      <span className="text-[10px] text-zinc-500 font-bold">{g.home.code}</span>
                      <span className="text-lg font-mono text-[#DFFF00]">x{g.odds.home}</span>
                   </button>
                   
                   <button 
                      onClick={() => setSelectedBet({ game: g, side: 'AWAY', odds: g.odds.away })}
                      className="group flex flex-col items-center px-4 py-2 bg-black border border-zinc-700 hover:border-[#DFFF00] rounded hover:bg-zinc-800 transition-all"
                   >
                      <span className="text-[10px] text-zinc-500 font-bold">{g.away.code}</span>
                      <span className="text-lg font-mono text-[#DFFF00]">x{g.odds.away}</span>
                   </button>
                </div>
             </div>
          ))}
        </div>
      )}

      {/* BET SLIP MODAL */}
      {selectedBet && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border-2 border-[#DFFF00] p-8 rounded-2xl w-full max-w-md relative">
               <h3 className="text-2xl font-black uppercase mb-6">Confirm Wager</h3>
               
               <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                     <span className="text-zinc-400">Matchup</span>
                     <span className="font-bold">{selectedBet.game.home.code} vs {selectedBet.game.away.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-zinc-400">Prediction</span>
                     <span className="font-bold text-[#DFFF00]">{selectedBet.side === 'HOME' ? selectedBet.game.home.code : selectedBet.game.away.code} to WIN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-zinc-400">Odds</span>
                     <span className="font-mono">{selectedBet.odds}</span>
                  </div>
               </div>

               <div className="mb-8">
                  <label className="text-xs font-bold uppercase text-zinc-500 mb-2 block">Wager Amount</label>
                  <input 
                    type="number" 
                    value={wagerAmount} 
                    onChange={(e) => setWagerAmount(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 p-4 rounded text-2xl font-mono focus:border-[#DFFF00] outline-none"
                  />
                  <div className="mt-2 text-right text-xs text-zinc-400">
                     Potential Return: <span className="text-[#DFFF00] font-bold">{Math.floor(wagerAmount * selectedBet.odds)} CR</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setSelectedBet(null)} className="py-3 bg-zinc-800 font-bold uppercase rounded hover:bg-zinc-700">Cancel</button>
                  <button onClick={handlePlaceBet} className="py-3 bg-[#DFFF00] text-black font-black uppercase rounded hover:opacity-90">Place Bet</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}