'use client';

import React, { useState, useEffect } from 'react';
import { useSportsMode } from '@/app/context/SportsModeContext';
import { getLiveScores } from '../../actions';
import { placeWager } from '../actions';
import { ArrowUpRight, Plus, Minus, Trophy, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SportsBettingInterface() {
    const { isSportsMode } = useSportsMode();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'NBA' | 'NFL'>('ALL');
    
    // Bet Slip State
    const [slip, setSlip] = useState<any[]>([]);
    const [wagerAmount, setWagerAmount] = useState<number>(100);
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        getLiveScores().then(data => {
            setMatches(data);
            setLoading(false);
        });
    }, []);

    const addToSlip = (match: any, type: string, selection: string, odds: number) => {
        const id = `${match.id}-${type}-${selection}`;
        if (slip.find(s => s.id === id)) return;
        
        setSlip([...slip, {
            id,
            match_id: match.id,
            match_name: match.name,
            league: match.league,
            type,
            selection,
            odds
        }]);
    };

    const removeFromSlip = (id: string) => {
        setSlip(slip.filter(s => s.id !== id));
    };

    const handlePlaceBet = async () => {
        setPlacing(true);
        try {
            const legs = slip.map(s => ({
                match_id: s.match_id + '-' + s.type + '-' + s.selection + '-' + Date.now(), // Unique ID for settlement logic
                league: s.league,
                match_name: s.match_name,
                type: s.type,
                selection: s.selection,
                odds: s.odds
            }));
            
            await placeWager(wagerAmount, legs);
            setSlip([]);
            alert("Bet Placed Successfully!");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setPlacing(false);
        }
    };

    const theme = isSportsMode ? {
        bg: 'bg-slate-900/50',
        border: 'border-blue-500/10',
        text: 'text-slate-400',
        active: 'bg-blue-500 text-white',
        button: 'bg-slate-800 hover:bg-slate-700',
        accent: 'text-blue-400'
    } : {
        bg: 'bg-zinc-900/50',
        border: 'border-zinc-800',
        text: 'text-zinc-500',
        active: 'bg-[#DFFF00] text-black',
        button: 'bg-zinc-900 hover:bg-zinc-800',
        accent: 'text-[#DFFF00]'
    };

    const filtered = matches.filter(m => filter === 'ALL' || m.league?.toUpperCase() === filter);
    const totalOdds = slip.reduce((acc, s) => acc * s.odds, 1);
    const potentialPayout = Math.floor(wagerAmount * totalOdds);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MATCH LIST */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex gap-2">
                    {['ALL', 'NBA', 'NFL'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f ? theme.active : `${theme.bg} ${theme.text} border ${theme.border}`}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {filtered.map(match => {
                        // Mock Odds if missing (for demo)
                        const spread = match.odds?.details || '-3.5';
                        const total = match.odds?.overUnder || '220.5';
                        const moneylineHome = 1.90; // Default
                        const moneylineAway = 1.90;

                        return (
                            <div key={match.id} className={`${theme.bg} border ${theme.border} rounded-3xl p-6`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-mono font-bold uppercase ${theme.text}`}>{match.league}</span>
                                        {match.isLive && <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded font-black uppercase animate-pulse">Live</span>}
                                    </div>
                                    <span className={`text-xs font-mono ${theme.text}`}>{match.date}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="col-span-1"></div>
                                    <div className={`text-center text-[9px] font-black uppercase tracking-widest ${theme.text}`}>Spread</div>
                                    <div className={`text-center text-[9px] font-black uppercase tracking-widest ${theme.text}`}>Moneyline</div>
                                </div>

                                {/* AWAY TEAM */}
                                <div className="grid grid-cols-3 gap-4 items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <img src={match.away.logo} className="w-8 h-8 object-contain" alt="" />
                                        <span className="font-black uppercase text-sm text-white">{match.away.code}</span>
                                    </div>
                                    <button onClick={() => addToSlip(match, 'spread', `away:${spread}`, 1.91)} className={`py-3 rounded-xl font-mono text-xs font-bold transition-all ${theme.button} ${theme.text} hover:text-white`}>
                                        {spread}
                                    </button>
                                    <button onClick={() => addToSlip(match, 'moneyline', 'away', moneylineAway)} className={`py-3 rounded-xl font-mono text-xs font-bold transition-all ${theme.button} ${theme.text} hover:text-white`}>
                                        {moneylineAway.toFixed(2)}
                                    </button>
                                </div>

                                {/* HOME TEAM */}
                                <div className="grid grid-cols-3 gap-4 items-center">
                                    <div className="flex items-center gap-3">
                                        <img src={match.home.logo} className="w-8 h-8 object-contain" alt="" />
                                        <span className="font-black uppercase text-sm text-white">{match.home.code}</span>
                                    </div>
                                    <button onClick={() => addToSlip(match, 'spread', `home:${spread}`, 1.91)} className={`py-3 rounded-xl font-mono text-xs font-bold transition-all ${theme.button} ${theme.text} hover:text-white`}>
                                        {spread}
                                    </button>
                                    <button onClick={() => addToSlip(match, 'moneyline', 'home', moneylineHome)} className={`py-3 rounded-xl font-mono text-xs font-bold transition-all ${theme.button} ${theme.text} hover:text-white`}>
                                        {moneylineHome.toFixed(2)}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* BET SLIP */}
            <div className="lg:col-span-1">
                <div className={`sticky top-24 ${theme.bg} border ${theme.border} rounded-3xl p-6`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${theme.active}`}>
                            <Trophy size={16} />
                        </div>
                        <h3 className="font-black uppercase italic text-white text-lg">Bet Slip</h3>
                        <span className={`ml-auto font-mono text-xs ${theme.text}`}>{slip.length} Selections</span>
                    </div>

                    <div className="space-y-3 mb-6">
                        {slip.length === 0 ? (
                            <div className={`py-8 text-center border-2 border-dashed ${theme.border} rounded-xl`}>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.text}`}>Slip Empty</p>
                            </div>
                        ) : (
                            slip.map((s, i) => (
                                <div key={i} className={`p-4 rounded-xl border ${theme.border} bg-black/20 flex justify-between items-start`}>
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-white mb-1">{s.selection}</div>
                                        <div className={`text-[9px] font-mono uppercase ${theme.text}`}>{s.match_name}</div>
                                        <div className={`text-[9px] font-mono uppercase ${theme.text} mt-1`}>{s.type} @ {s.odds}</div>
                                    </div>
                                    <button onClick={() => removeFromSlip(s.id)} className="text-red-500 hover:text-red-400"><X size={14} /></button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text}`}>Wager Amount</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setWagerAmount(Math.max(10, wagerAmount - 10))} className={`p-1 rounded ${theme.button}`}><Minus size={12}/></button>
                                <span className="font-mono font-black text-white w-12 text-center">{wagerAmount}</span>
                                <button onClick={() => setWagerAmount(wagerAmount + 10)} className={`p-1 rounded ${theme.button}`}><Plus size={12}/></button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text}`}>Total Odds</span>
                            <span className="font-mono font-black text-white">{totalOdds.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text}`}>Potential Payout</span>
                            <span className={`font-mono font-black ${theme.accent}`}>{potentialPayout.toLocaleString()} CR</span>
                        </div>

                        <button 
                            onClick={handlePlaceBet}
                            disabled={slip.length === 0 || placing}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${slip.length === 0 ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : theme.active}`}
                        >
                            {placing ? 'Processing...' : 'Place Bet'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
