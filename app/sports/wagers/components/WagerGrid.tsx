'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, ChevronRight, X, Plus, Info, Wallet, Globe2, Layers } from 'lucide-react';
import { generateOdds } from '../lib/odds';
import { placeWager, WagerLeg } from '../actions';
import { useAuth } from '@/app/context/AuthContext';

interface Match {
  id: string;
  date: string;
  name: string;
  status: string;
  home: { id: string; code: string; name: string; logo: string; record: string };
  away: { id: string; code: string; name: string; logo: string; record: string };
}

type OddsFormat = 'US' | 'AU';

export default function WagerGrid({ matches, league, fetchRoster }: { matches: Match[], league: 'nba' | 'nfl', fetchRoster: (teamId: string) => Promise<any> }) {
  const { user, profile, refreshProfile } = useAuth();
  const [betSlip, setBetSlip] = useState<WagerLeg[]>([]);
  const [wagerAmount, setWagerAmount] = useState<number>(100);
  const [isPlacing, setIsPlacing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [format, setFormat] = useState<OddsFormat>('AU'); 
  const [expandedMatch, setExpandedMatch] = useState<Match | null>(null);
  const [matchProps, setMatchProps] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [propTeamFilter, setPropTeamFilter] = useState<'ALL' | 'HOME' | 'AWAY'>('ALL');
  const [propTypeFilter, setPropTypeFilter] = useState<string>('ALL');

  const upcomingMatches = matches.filter(m => m.status.includes(':') || m.status.includes('PM') || m.status.includes('AM'));

  const filteredProps = useMemo(() => {
    return matchProps.filter(p => {
        const teamMatch = propTeamFilter === 'ALL' || p.side === propTeamFilter;
        const typeMatch = propTypeFilter === 'ALL' || p.type === propTypeFilter;
        return teamMatch && typeMatch;
    });
  }, [matchProps, propTeamFilter, propTypeFilter]);

  const propCategories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(matchProps.map(p => p.type)))];
  }, [matchProps]);

  const matchOdds = useMemo(() => {
    const oddsMap: Record<string, any> = {};
    upcomingMatches.forEach(match => {
        oddsMap[match.id] = generateOdds(match.home.record, match.away.record, league, match.id);
    });
    return oddsMap;
  }, [upcomingMatches, league]);

  const handleExpandMatch = async (match: Match) => {
    setExpandedMatch(match);
    setLoadingProps(true);
    setMatchProps([]);
    setPropTeamFilter('ALL');
    setPropTypeFilter('ALL');
    
    try {
        const [homeData, awayData] = await Promise.all([
            fetchRoster(match.home.id),
            fetchRoster(match.away.id)
        ]);

        const props: any[] = [];
        
        const processRoster = (roster: any[], teamSide: 'HOME' | 'AWAY', teamCode: string) => {
            roster.slice(0, 15).forEach((p: any) => {
                const pos = p.pos?.toUpperCase() || "";
                const isNFL = league === 'nfl';
                
                if (isNFL) {
                    if (pos === 'QB' || pos.includes('QB')) {
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'PASS_YDS', value: 245.5 + (Math.random() * 40), odds: 1.91 });
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'ANYTIME_TD', value: 0.5, odds: 3.50 });
                    } else if (pos === 'RB' || pos.includes('RB')) {
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'RUSH_YDS', value: 68.5 + (Math.random() * 25), odds: 1.91 });
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'ANYTIME_TD', value: 0.5, odds: 1.85 });
                    } else if (pos === 'WR' || pos === 'TE' || pos.includes('WR') || pos.includes('TE')) {
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'REC_YDS', value: 52.5 + (Math.random() * 35), odds: 1.91 });
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'ANYTIME_TD', value: 0.5, odds: 2.10 });
                    }
                } else {
                    // Specific NBA Position Abbreviation Logic
                    if (pos === 'PG' || pos === 'SG' || pos.includes('G')) {
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'POINTS', value: 18.5 + (Math.random() * 8), odds: 1.91 });
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'ASSISTS', value: 5.5 + (Math.random() * 4), odds: 1.91 });
                    } else if (pos === 'SF' || pos === 'PF' || pos.includes('F')) {
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'POINTS', value: 16.5 + (Math.random() * 6), odds: 1.91 });
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'REBOUNDS', value: 6.5 + (Math.random() * 4), odds: 1.91 });
                    } else if (pos === 'C') {
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'POINTS', value: 14.5 + (Math.random() * 5), odds: 1.91 });
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'REBOUNDS', value: 9.5 + (Math.random() * 5), odds: 1.91 });
                    } else {
                        // Stronger fallback for unknown positions
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'POINTS', value: 12.5 + (Math.random() * 5), odds: 1.91 });
                        props.push({ team: teamCode, side: teamSide, name: p.name, type: 'REBOUNDS', value: 4.5 + (Math.random() * 3), odds: 1.91 });
                    }
                }
            });
        };

        if (homeData?.roster) processRoster(homeData.roster, 'HOME', match.home.code);
        if (awayData?.roster) processRoster(awayData.roster, 'AWAY', match.away.code);
        
        setMatchProps(props.map(p => ({ ...p, value: Math.round(p.value * 2) / 2 })));
    } catch (e) { console.error(e); }
    setLoadingProps(false);
  };

  const formatOdds = (decimal: number) => {
    if (format === 'AU') return decimal.toFixed(2);
    if (decimal >= 2.0) {
        return `+${Math.round((decimal - 1) * 100)}`;
    } else {
        return `-${Math.round(100 / (decimal - 1))}`;
    }
  };

  const labels = {
    moneyline: format === 'AU' ? 'H2H' : 'Moneyline',
    spread: format === 'AU' ? 'Line' : 'Spread',
    total: 'Total'
  };

  const addToSlip = (match: Match, type: WagerLeg['type'], selection: string, odds: number, labelPrefix: string = "") => {
    if (!user) return alert("Please sign in to place wagers.");
    
    const legId = `${match.id}-${type}-${selection}-${labelPrefix}`;
    const exists = betSlip.find(l => l.match_id === legId);
    
    if (exists) {
        setBetSlip(prev => prev.filter(l => l.match_id !== legId));
    } else {
        setBetSlip(prev => [...prev, {
            match_id: legId,
            league,
            match_name: `${labelPrefix ? `[${labelPrefix}] ` : ''}${match.away.code} @ ${match.home.code}`,
            type,
            selection,
            odds
        }]);
    }
  };

  const removeFromSlip = (matchId: string) => {
    setBetSlip(prev => prev.filter(l => l.match_id !== matchId));
  };

  const totalOdds = Number(betSlip.reduce((acc, leg) => acc * leg.odds, 1).toFixed(2));
  const potentialPayout = Math.floor(wagerAmount * totalOdds);

  const handlePlaceBet = async () => {
    if (!user) return;
    if (wagerAmount <= 0) return;
    if (profile && profile.credits < wagerAmount) {
        setMessage({ type: 'error', text: 'Insufficient credits' });
        return;
    }

    setIsPlacing(true);
    setMessage(null);

    try {
        await placeWager(wagerAmount, betSlip);
        setMessage({ type: 'success', text: 'Wager placed successfully!' });
        setBetSlip([]);
        await refreshProfile();
        setTimeout(() => setMessage(null), 5000);
    } catch (e: any) {
        setMessage({ type: 'error', text: e.message || 'Failed to place wager' });
    } finally {
        setIsPlacing(false);
    }
  };

  if (upcomingMatches.length === 0) return null;

  return (
    <div className="relative grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
        {/* MATCHES LIST */}
        <div className="xl:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] border border-zinc-800 shadow-xl">
                        <Trophy size={18} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase text-white tracking-tight italic">Match Center</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Digital Sportsbook // V2.0</p>
                    </div>
                </div>

                <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
                    <button 
                        onClick={() => setFormat('AU')}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${format === 'AU' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        AU Mode
                    </button>
                    <button 
                        onClick={() => setFormat('US')}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${format === 'US' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        US Mode
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.slice(0, 6).map(match => {
                    const odds = matchOdds[match.id];
                    if (!odds) return null;
                    const isInSlip = (type: string, selection: string) => betSlip.some(l => l.match_id.startsWith(match.id) && l.type === type && l.selection === selection);

                    return (
                        <div key={match.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">{match.status}</span>
                                <button 
                                    onClick={() => handleExpandMatch(match)}
                                    className="text-[10px] font-black uppercase tracking-widest text-[#DFFF00] flex items-center gap-1 hover:underline"
                                >
                                    More Markets <ChevronRight size={12} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 mb-8">
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <img src={match.away.logo} className="w-12 h-12 object-contain" alt={match.away.name} />
                                    <span className="text-sm font-black uppercase">{match.away.code}</span>
                                </div>
                                <div className="text-zinc-800 font-black text-2xl italic">@</div>
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <img src={match.home.logo} className="w-12 h-12 object-contain" alt={match.home.name} />
                                    <span className="text-sm font-black uppercase">{match.home.code}</span>
                                </div>
                            </div>

                            {/* ODDS GRID - REDESIGNED */}
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between px-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                                        <span>Select Outcome</span>
                                        <div className="flex gap-12 mr-8">
                                            <span>{labels.moneyline}</span>
                                            <span>{labels.spread}</span>
                                        </div>
                                    </div>
                                    
                                    {/* AWAY TEAM ROW */}
                                    <div className="flex items-center justify-between bg-zinc-950/50 p-2 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-all">
                                        <div className="flex items-center gap-3 pl-2">
                                            <img src={match.away.logo} className="w-6 h-6 object-contain opacity-50" alt="" />
                                            <span className="text-xs font-bold text-zinc-400">{match.away.code}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => addToSlip(match, 'moneyline', 'away', odds.moneyline.away)}
                                                className={`w-20 py-2 rounded-xl text-xs font-black transition-all border ${isInSlip('moneyline', 'away') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-600'}`}
                                            >
                                                {formatOdds(odds.moneyline.away)}
                                            </button>
                                            <button 
                                                onClick={() => addToSlip(match, 'spread', 'away', odds.spread.favorite === 'away' ? odds.spread.odds : odds.spread.dogOdds)}
                                                className={`w-20 py-2 rounded-xl text-[10px] font-black transition-all border ${isInSlip('spread', 'away') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
                                            >
                                                {odds.spread.favorite === 'away' ? '-' : '+'}{odds.spread.value} ({formatOdds(odds.spread.favorite === 'away' ? odds.spread.odds : odds.spread.dogOdds)})
                                            </button>
                                        </div>
                                    </div>

                                    {/* HOME TEAM ROW */}
                                    <div className="flex items-center justify-between bg-zinc-950/50 p-2 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-all">
                                        <div className="flex items-center gap-3 pl-2">
                                            <img src={match.home.logo} className="w-6 h-6 object-contain opacity-50" alt="" />
                                            <span className="text-xs font-bold text-zinc-400">{match.home.code}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => addToSlip(match, 'moneyline', 'home', odds.moneyline.home)}
                                                className={`w-20 py-2 rounded-xl text-xs font-black transition-all border ${isInSlip('moneyline', 'home') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-600'}`}
                                            >
                                                {formatOdds(odds.moneyline.home)}
                                            </button>
                                            <button 
                                                onClick={() => addToSlip(match, 'spread', 'home', odds.spread.favorite === 'home' ? odds.spread.odds : odds.spread.dogOdds)}
                                                className={`w-20 py-2 rounded-xl text-[10px] font-black transition-all border ${isInSlip('spread', 'home') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
                                            >
                                                {odds.spread.favorite === 'home' ? '-' : '+'}{odds.spread.value} ({formatOdds(odds.spread.favorite === 'home' ? odds.spread.odds : odds.spread.dogOdds)})
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button 
                                        onClick={() => addToSlip(match, 'total', 'over', odds.total.overOdds)}
                                        className={`py-2 rounded-xl text-[10px] font-black transition-all border flex justify-between px-4 items-center ${isInSlip('total', 'over') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                                    >
                                        <span className="opacity-50">OVER {odds.total.value}</span>
                                        <span>{formatOdds(odds.total.overOdds)}</span>
                                    </button>
                                    <button 
                                        onClick={() => addToSlip(match, 'total', 'under', odds.total.underOdds)}
                                        className={`py-2 rounded-xl text-[10px] font-black transition-all border flex justify-between px-4 items-center ${isInSlip('total', 'under') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                                    >
                                        <span className="opacity-50">UNDER {odds.total.value}</span>
                                        <span>{formatOdds(odds.total.underOdds)}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* BET SLIP */}
        <div className="xl:col-span-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 sticky top-24 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#DFFF00] opacity-[0.03] blur-3xl -mr-16 -mt-16" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-950 rounded-lg text-[#DFFF00] border border-zinc-800">
                            <Coins size={18} />
                        </div>
                        <h3 className="font-black uppercase tracking-tight text-white">Wager Slip</h3>
                    </div>
                    {betSlip.length > 0 && (
                        <span className="bg-[#DFFF00] text-black text-[10px] font-black px-2 py-0.5 rounded-full">{betSlip.length}</span>
                    )}
                </div>

                <div className="flex-1 space-y-4 mb-8 overflow-y-auto pr-2 scrollbar-hide relative z-10">
                    {betSlip.length === 0 ? (
                        <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                            <Layers size={24} className="mx-auto text-zinc-800 mb-3" />
                            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Selection Required</p>
                        </div>
                    ) : (
                        betSlip.map(leg => (
                            <div key={leg.match_id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 relative group">
                                <button 
                                    onClick={() => removeFromSlip(leg.match_id)}
                                    className="absolute -top-2 -right-2 p-1 bg-zinc-800 text-zinc-400 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                                >
                                    <X size={12} />
                                </button>
                                <div className="text-[9px] font-mono text-[#DFFF00] uppercase tracking-widest mb-1">{leg.match_name}</div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-xs font-black uppercase text-white">{leg.selection}</div>
                                        <div className="text-[10px] text-zinc-600 uppercase font-bold">{leg.type}</div>
                                    </div>
                                    <div className="text-sm font-black text-[#DFFF00]">{formatOdds(leg.odds)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {betSlip.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-zinc-800 relative z-10">
                        <div className="flex justify-between text-xs">
                            <span className="text-zinc-500 font-mono uppercase tracking-widest">Combined Odds</span>
                            <span className="text-white font-black">{formatOdds(totalOdds)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-zinc-500 font-mono uppercase tracking-widest">Potential Payout</span>
                            <span className="text-[#DFFF00] font-black">{potentialPayout} <span className="text-[10px]">CR</span></span>
                        </div>

                        <div className="relative pt-4">
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={14} />
                            <input 
                                type="number"
                                value={wagerAmount}
                                onChange={(e) => setWagerAmount(Number(e.target.value))}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-[#DFFF00] transition-colors"
                                placeholder="Wager amount..."
                            />
                        </div>

                        <button 
                            onClick={handlePlaceBet}
                            disabled={isPlacing || wagerAmount <= 0}
                            className="w-full bg-[#DFFF00] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_10px_30px_rgba(223,255,0,0.2)] disabled:opacity-50"
                        >
                            {isPlacing ? 'Placing Wager...' : 'Place Wager'}
                        </button>

                        {message && (
                            <div className={`text-center text-[10px] font-bold uppercase tracking-widest p-2 rounded-lg ${message.type === 'success' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                )}

                {profile && (
                    <div className="mt-6 flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Coins size={12} className="text-[#DFFF00]" />
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Balance</span>
                        </div>
                        <span className="text-[10px] font-black text-white">{profile.credits} CR</span>
                    </div>
                )}
            </div>
        </div>

        {/* MODAL: ALL MARKETS */}
        <AnimatePresence>
            {expandedMatch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setExpandedMatch(null)}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <img src={expandedMatch.away.logo} className="w-10 h-10 object-contain" alt="" />
                                    <span className="text-xl font-black italic">{expandedMatch.away.code}</span>
                                </div>
                                <span className="text-zinc-700 font-black">@</span>
                                <div className="flex items-center gap-3">
                                    <img src={expandedMatch.home.logo} className="w-10 h-10 object-contain" alt="" />
                                    <span className="text-xl font-black italic">{expandedMatch.home.code}</span>
                                </div>
                            </div>
                            <button onClick={() => setExpandedMatch(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><X /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide">
                            <MarketSection 
                                title="Full Match" 
                                match={expandedMatch} 
                                odds={generateOdds(expandedMatch.home.record, expandedMatch.away.record, league, expandedMatch.id)} 
                                addToSlip={addToSlip} 
                                formatOdds={formatOdds}
                                labels={labels}
                                betSlip={betSlip}
                                prefix=""
                            />

                            {/* PLAYER PROPS */}
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-xs font-mono text-[#DFFF00] uppercase tracking-[0.3em] pl-2 border-l-2 border-[#DFFF00]">Player Props</h4>
                                        {loadingProps && <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#DFFF00] border-t-transparent" />}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                                            {(['ALL', 'AWAY', 'HOME'] as const).map(f => (
                                                <button 
                                                    key={f} 
                                                    onClick={() => setPropTeamFilter(f)}
                                                    className={`px-3 py-1 rounded text-[8px] font-black uppercase transition-all ${propTeamFilter === f ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}
                                                >
                                                    {f === 'AWAY' ? expandedMatch.away.code : f === 'HOME' ? expandedMatch.home.code : 'ALL'}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <select 
                                            value={propTypeFilter}
                                            onChange={(e) => setPropTypeFilter(e.target.value)}
                                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-[8px] font-black text-white uppercase outline-none focus:border-[#DFFF00] appearance-none cursor-pointer"
                                        >
                                            {propCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                {filteredProps.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredProps.map((prop, i) => {
                                            const selOver = `${prop.type === 'ANYTIME_TD' ? 'YES' : `O ${prop.value.toFixed(1)}`}`;
                                            const selUnder = `${prop.type === 'ANYTIME_TD' ? 'NO' : `U ${prop.value.toFixed(1)}`}`;
                                            
                                            const isInSlip = (selection: string) => {
                                                return betSlip.some(l => l.match_id.startsWith(expandedMatch.id) && l.selection === selection && l.match_name.includes(prop.name));
                                            };

                                            return (
                                                <div key={i} className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-[#DFFF00]/30 transition-all">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[8px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-800 uppercase">{prop.team}</span>
                                                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{prop.name}</span>
                                                        </div>
                                                        <div className="text-sm font-black uppercase text-white">{prop.type.replace('_', ' ')}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => addToSlip(expandedMatch, 'total', selOver, prop.odds, `${prop.name}`)}
                                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border min-w-[80px] ${isInSlip(selOver) ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}
                                                        >
                                                            {prop.type === 'ANYTIME_TD' ? 'YES' : `O ${prop.value.toFixed(1)}`} @{formatOdds(prop.odds)}
                                                        </button>
                                                        <button 
                                                            onClick={() => addToSlip(expandedMatch, 'total', selUnder, prop.odds, `${prop.name}`)}
                                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border min-w-[80px] ${isInSlip(selUnder) ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}
                                                        >
                                                            {prop.type === 'ANYTIME_TD' ? 'NO' : `U ${prop.value.toFixed(1)}`} @{formatOdds(prop.odds)}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-zinc-600 font-mono text-xs uppercase tracking-widest border-2 border-dashed border-zinc-800 rounded-3xl">
                                        {loadingProps ? 'Accessing team rosters...' : 'No props match current filter'}
                                    </div>
                                )}
                            </div>

                            <MarketSection 
                                title="1st Half" 
                                match={expandedMatch} 
                                odds={generateOdds(expandedMatch.home.record, expandedMatch.away.record, league, expandedMatch.id + "-h1")} 
                                addToSlip={addToSlip} 
                                formatOdds={formatOdds}
                                labels={labels}
                                betSlip={betSlip}
                                prefix="H1"
                            />
                            <MarketSection 
                                title="1st Quarter" 
                                match={expandedMatch} 
                                odds={generateOdds(expandedMatch.home.record, expandedMatch.away.record, league, expandedMatch.id + "-q1")} 
                                addToSlip={addToSlip} 
                                formatOdds={formatOdds}
                                labels={labels}
                                betSlip={betSlip}
                                prefix="Q1"
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
}

function MarketSection({ title, match, odds, addToSlip, formatOdds, labels, prefix, betSlip }: any) {
    const isInSlip = (type: string, selection: string) => {
        const legId = `${match.id}-${type}-${selection}-${prefix}`;
        return betSlip.some((l: any) => l.match_id === legId);
    };

    return (
        <div className="space-y-4">
            <h4 className="text-xs font-mono text-[#DFFF00] uppercase tracking-[0.3em] pl-2 border-l-2 border-[#DFFF00]">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="text-[9px] font-mono text-zinc-600 uppercase mb-3">{labels.moneyline}</div>
                    <div className="space-y-2">
                        <button 
                            onClick={() => addToSlip(match, 'moneyline', 'away', odds.moneyline.away, prefix)} 
                            className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('moneyline', 'away') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}
                        >
                            <span>{match.away.code}</span>
                            <span>{formatOdds(odds.moneyline.away)}</span>
                        </button>
                        <button 
                            onClick={() => addToSlip(match, 'moneyline', 'home', odds.moneyline.home, prefix)} 
                            className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('moneyline', 'home') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}
                        >
                            <span>{match.home.code}</span>
                            <span>{formatOdds(odds.moneyline.home)}</span>
                        </button>
                    </div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="text-[9px] font-mono text-zinc-600 uppercase mb-3">{labels.spread}</div>
                    <div className="space-y-2">
                        <button 
                            onClick={() => addToSlip(match, 'spread', 'away', odds.spread.odds, prefix)} 
                            className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('spread', 'away') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}
                        >
                            <span>{match.away.code} {odds.spread.favorite === 'away' ? '-' : '+'}{odds.spread.value}</span>
                            <span>{formatOdds(odds.spread.favorite === 'away' ? odds.spread.odds : odds.spread.dogOdds)}</span>
                        </button>
                        <button 
                            onClick={() => addToSlip(match, 'spread', 'home', odds.spread.odds, prefix)} 
                            className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('spread', 'home') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}
                        >
                            <span>{match.home.code} {odds.spread.favorite === 'home' ? '-' : '+'}{odds.spread.value}</span>
                            <span>{formatOdds(odds.spread.favorite === 'home' ? odds.spread.odds : odds.spread.dogOdds)}</span>
                        </button>
                    </div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="text-[9px] font-mono text-zinc-600 uppercase mb-3">{labels.total}</div>
                    <div className="space-y-2">
                        <button 
                            onClick={() => addToSlip(match, 'total', 'over', odds.total.overOdds, prefix)} 
                            className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('total', 'over') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-950 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}
                        >
                            <span>OVER {odds.total.value}</span>
                            <span>{formatOdds(odds.total.overOdds)}</span>
                        </button>
                        <button 
                            onClick={() => addToSlip(match, 'total', 'under', odds.total.underOdds, prefix)} 
                            className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('total', 'under') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-950 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}
                        >
                            <span>UNDER {odds.total.value}</span>
                            <span>{formatOdds(odds.total.underOdds)}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
