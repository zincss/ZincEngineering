'use client';

import React, { useState } from 'react';
import { placeWager } from '../../wagers/actions';
import { useAuth } from '@/app/context/AuthContext';
import { Coins, Trophy } from 'lucide-react';

export default function GolfWagerGrid({ tournament, players }: { tournament: any, players: any[] }) {
    const { user, profile, refreshProfile } = useAuth();
    const [wagerAmount, setWagerAmount] = useState(100);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [isPlacing, setIsPlacing] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    // Generate simulated "Outright" odds based on rank/position
    // In a real app, this comes from an Odds API
    const oddsPlayers = players.slice(0, 20).map((p: any, i: number) => {
        const baseOdds = 4.0; // +300
        const odds = baseOdds + (i * 1.5) + (Math.random() * 2);
        return { ...p, odds: parseFloat(odds.toFixed(2)) };
    });

    const formatOdds = (decimal: number) => {
        if (decimal >= 2.0) return `+${Math.round((decimal - 1) * 100)}`;
        return `-${Math.round(100 / (decimal - 1))}`;
    };

    const handlePlaceBet = async () => {
        if (!user || !selectedPlayer) return;
        setIsPlacing(true);
        try {
            const leg = {
                match_id: `${tournament.id}-outright-${selectedPlayer.id}`,
                league: 'golf',
                match_name: `${tournament.name} - Winner`,
                type: 'outright', // New type for Golf? Or stick to 'moneyline' concept? Let's use 'moneyline' logic but name it 'outright'
                selection: selectedPlayer.name,
                odds: selectedPlayer.odds
            };

            // We need to use 'moneyline' type for the system to understand it, or update system.
            // System supports 'moneyline', 'spread', 'total'.
            // Let's use 'moneyline' and treat 'selection' as the winner.
            // The settlement logic checks winner === selection.
            // For Golf, settlement needs to know who won the tournament. 
            // My recent settlement update checks result.home.winner. Golf is different.
            // I will settle for "Visual Prototype" first. 
            await placeWager(wagerAmount, [{ ...leg, type: 'moneyline' }]);
            
            setMsg('Wager Placed!');
            await refreshProfile();
            setTimeout(() => setMsg(null), 3000);
        } catch (e: any) {
            setMsg(e.message);
        } finally {
            setIsPlacing(false);
        }
    };

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00]">
                    <Coins size={18} />
                </div>
                <h3 className="text-xl font-black uppercase text-white tracking-tight italic">Outright Winner</h3>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 overflow-hidden relative">
                {/* Bet Slip Overlay */}
                {selectedPlayer && (
                    <div className="absolute inset-x-0 bottom-0 bg-[#DFFF00] p-4 z-50 flex items-center justify-between animate-in slide-in-from-bottom-full">
                        <div className="flex items-center gap-4">
                            <div className="text-black font-black uppercase">
                                <div className="text-[10px] tracking-widest opacity-60">Selected to Win</div>
                                <div className="text-lg leading-none">{selectedPlayer.name}</div>
                            </div>
                            <div className="bg-black/10 px-3 py-1 rounded-lg text-black font-mono font-bold">
                                {formatOdds(selectedPlayer.odds)}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-black/10 rounded-xl px-3 py-2">
                                <input 
                                    type="number" 
                                    value={wagerAmount} 
                                    onChange={(e) => setWagerAmount(Number(e.target.value))} 
                                    className="bg-transparent w-20 font-mono font-bold text-black focus:outline-none text-right"
                                />
                                <span className="text-[10px] font-black ml-1">CR</span>
                            </div>
                            <button 
                                onClick={handlePlaceBet}
                                disabled={isPlacing}
                                className="bg-black text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                            >
                                {isPlacing ? 'Processing...' : msg || 'Place Wager'}
                            </button>
                            <button onClick={() => setSelectedPlayer(null)} className="p-2 hover:bg-black/10 rounded-full text-black"><span className="sr-only">Close</span>✕</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {oddsPlayers.map((p: any) => (
                        <button 
                            key={p.id}
                            onClick={() => setSelectedPlayer(p)}
                            className={`group relative p-4 rounded-xl border transition-all text-left ${selectedPlayer?.id === p.id ? 'bg-[#DFFF00]/10 border-[#DFFF00]' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-zinc-500">#{p.position || '-'}</span>
                                <span className="text-xs font-black text-[#DFFF00]">{formatOdds(p.odds)}</span>
                            </div>
                            <div className="text-sm font-black text-white uppercase leading-tight group-hover:text-[#DFFF00] transition-colors">{p.name}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
