'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, ChevronRight, X, Plus, Info, Wallet, Globe2, Layers, Search, ArrowRightLeft, Clock, ExternalLink } from 'lucide-react';
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

export default function WagerGrid({ 
  matches, 
  league, 
  fetchRoster 
}: { 
  matches: Match[], 
  league: 'nba' | 'nfl', 
  fetchRoster: (teamId: string) => Promise<any> 
}) {
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
  const [isMobileSlipOpen, setIsMobileSlipOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const upcomingMatches = matches.filter(m => m.status.includes(':') || m.status.includes('PM') || m.status.includes('AM'));

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

  const formatOdds = (decimal: number) => {
    if (format === 'AU') return decimal.toFixed(2);
    if (decimal >= 2.0) return `+${Math.round((decimal - 1) * 100)}`;
    return `-${Math.round(100 / (decimal - 1))}`;
  };

  const formatMatchTime = (dateStr: string, status: string) => {
    if (status === 'LIVE' || status.includes('HALFTIME') || status.includes('END')) return status;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return status;

    if (format === 'AU') {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
            hour12: true, timeZone: 'Australia/Sydney'
        };
        return date.toLocaleString('en-AU', options).replace(',', ' -') + ' AET';
    } else {
        const options: Intl.DateTimeFormatOptions = {
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
            hour12: true, timeZone: 'America/New_York'
        };
        return date.toLocaleString('en-US', options).replace(',', ' -') + ' EST';
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
            match_id: legId, league,
            match_name: `${labelPrefix ? `[${labelPrefix}] ` : ''}${match.away.code} @ ${match.home.code}`,
            type, selection, odds
        }]);
    }
  };

  const removeFromSlip = (matchId: string) => setBetSlip(prev => prev.filter(l => l.match_id !== matchId));
  const totalOdds = Number(betSlip.reduce((acc, leg) => acc * leg.odds, 1).toFixed(2));
  const potentialPayout = Math.floor(wagerAmount * totalOdds);

  const handlePlaceBet = async () => {
    if (!user || wagerAmount <= 0) return;
    if (profile && profile.credits < wagerAmount) {
        setMessage({ type: 'error', text: 'Insufficient credits' });
        return;
    }
    setIsPlacing(true);
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
    <div className="relative mb-12">
        <div 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="group cursor-pointer bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 mb-4 flex items-center justify-between hover:border-[#DFFF00]/50 transition-all shadow-2xl overflow-hidden relative"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-[#DFFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-[#DFFF00] transition-colors shadow-inner">
                    <Trophy size={20} className="text-[#DFFF00]" />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-mono font-black text-[#DFFF00] uppercase tracking-[0.3em]">ZincSports</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
                            <div className="w-1 h-1 rounded-full bg-[#DFFF00] animate-pulse" />
                            <span className="text-[8px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest">Live_Betting</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white group-hover:text-[#DFFF00] transition-colors leading-none">Match Center</h2>
                </div>
            </div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Available Markets</span>
                    <span className="text-xl font-black text-white">{upcomingMatches.length * 15}+</span>
                </div>
                <div className={`p-2 rounded-full border transition-all ${isExpanded ? 'bg-[#DFFF00] border-[#DFFF00] text-black rotate-180' : 'bg-zinc-950 border-zinc-800 text-zinc-500 group-hover:border-zinc-600'}`}>
                    <ChevronRight size={20} />
                </div>
            </div>
        </div>

        <AnimatePresence>
            {isExpanded && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ type: "spring", damping: 25, stiffness: 200 }} 
                    className="overflow-hidden"
                >
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-4 pb-12">
                        <div className="xl:col-span-8 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] border border-zinc-800 shadow-xl">
                                        <Layers size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-white tracking-tight italic">Active Boards</h3>
                                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sector_09 // Sportsbook</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800 self-start sm:self-auto">
                                    <button onClick={() => setFormat('AU')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${format === 'AU' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>AU Mode</button>
                                    <button onClick={() => setFormat('US')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${format === 'US' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>US Mode</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcomingMatches.slice(0, 8).map(match => {
                                    const odds = matchOdds[match.id];
                                    if (!odds) return null;
                                    const isInSlip = (type: string, selection: string) => betSlip.some(l => l.match_id.startsWith(match.id) && l.type === type && l.selection === selection);
                                    return (
                                        <div key={match.id} className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-5 md:p-6 hover:border-zinc-700 transition-all group relative overflow-hidden">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-[9px] md:text-[10px] font-mono text-zinc-500 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                                                    {formatMatchTime(match.date, match.status)}
                                                </span>
                                                <button onClick={() => handleExpandMatch(match)} className="text-[10px] font-black uppercase tracking-widest text-[#DFFF00] flex items-center gap-1 hover:underline">
                                                    More Markets <ChevronRight size={12} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between gap-4 mb-8">
                                                <div className="flex flex-col items-center gap-2 flex-1 text-center">
                                                    <img src={match.away.logo} className="w-10 h-10 md:w-12 md:h-12 object-contain" alt="" />
                                                    <span className="text-xs md:text-sm font-black uppercase truncate w-full">{match.away.code}</span>
                                                </div>
                                                <div className="text-zinc-800 font-black text-xl md:text-2xl italic">@</div>
                                                <div className="flex flex-col items-center gap-2 flex-1 text-center">
                                                    <img src={match.home.logo} className="w-10 h-10 md:w-12 md:h-12 object-contain" alt="" />
                                                    <span className="text-xs md:text-sm font-black uppercase truncate w-full">{match.home.code}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between bg-zinc-950/50 p-1.5 md:p-2 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-all">
                                                        <div className="flex items-center gap-2 pl-2"><span className="text-[10px] font-bold text-zinc-500">{match.away.code}</span></div>
                                                        <div className="flex gap-1.5 md:gap-2">
                                                            <button onClick={() => addToSlip(match, 'moneyline', 'away', odds.moneyline.away)} className={`w-16 md:w-20 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all border ${isInSlip('moneyline', 'away') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-600'}`}>{formatOdds(odds.moneyline.away)}</button>
                                                            <button onClick={() => addToSlip(match, 'spread', 'away', odds.spread.favorite === 'away' ? odds.spread.odds : odds.spread.dogOdds)} className={`w-16 md:w-20 py-2 rounded-xl text-[9px] md:text-[10px] font-black transition-all border ${isInSlip('spread', 'away') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>{odds.spread.favorite === 'away' ? '-' : '+'}{odds.spread.value} ({formatOdds(odds.spread.favorite === 'away' ? odds.spread.odds : odds.spread.dogOdds)})</button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-zinc-950/50 p-1.5 md:p-2 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-all">
                                                        <div className="flex items-center gap-2 pl-2"><span className="text-[10px] font-bold text-zinc-500">{match.home.code}</span></div>
                                                        <div className="flex gap-1.5 md:gap-2">
                                                            <button onClick={() => addToSlip(match, 'moneyline', 'home', odds.moneyline.home)} className={`w-16 md:w-20 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all border ${isInSlip('moneyline', 'home') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-600'}`}>{formatOdds(odds.moneyline.home)}</button>
                                                            <button onClick={() => addToSlip(match, 'spread', 'home', odds.spread.favorite === 'home' ? odds.spread.odds : odds.spread.dogOdds)} className={`w-16 md:w-20 py-2 rounded-xl text-[9px] md:text-[10px] font-black transition-all border ${isInSlip('spread', 'home') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>{odds.spread.favorite === 'home' ? '-' : '+'}{odds.spread.value} ({formatOdds(odds.spread.favorite === 'home' ? odds.spread.odds : odds.spread.dogOdds)})</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pt-1">
                                                    <button onClick={() => addToSlip(match, 'total', 'over', odds.total.overOdds)} className={`py-2 rounded-xl text-[9px] md:text-[10px] font-black transition-all border flex justify-between px-3 md:px-4 items-center ${isInSlip('total', 'over') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>
                                                        <span className="opacity-50 text-[8px]">OVER {odds.total.value}</span>
                                                        <span>{formatOdds(odds.total.overOdds)}</span>
                                                    </button>
                                                    <button onClick={() => addToSlip(match, 'total', 'under', odds.total.underOdds)} className={`py-2 rounded-xl text-[9px] md:text-[10px] font-black transition-all border flex justify-between px-3 md:px-4 items-center ${isInSlip('total', 'under') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>
                                                        <span className="opacity-50 text-[8px]">UNDER {odds.total.value}</span>
                                                        <span>{formatOdds(odds.total.underOdds)}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="hidden xl:block xl:col-span-4">
                            <BetSlipContent betSlip={betSlip} wagerAmount={wagerAmount} setWagerAmount={setWagerAmount} isPlacing={isPlacing} message={message} profile={profile} totalOdds={totalOdds} potentialPayout={potentialPayout} formatOdds={formatOdds} removeFromSlip={removeFromSlip} handlePlaceBet={handlePlaceBet} />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {isMobileSlipOpen && (
                <div className="fixed inset-0 z-[130] xl:hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileSlipOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-zinc-900 rounded-t-[3rem] border-t border-white/10 flex flex-col overflow-hidden">
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-4 mb-2" />
                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <BetSlipContent betSlip={betSlip} wagerAmount={wagerAmount} setWagerAmount={setWagerAmount} isPlacing={isPlacing} message={message} profile={profile} totalOdds={totalOdds} potentialPayout={potentialPayout} formatOdds={formatOdds} removeFromSlip={removeFromSlip} handlePlaceBet={handlePlaceBet} onMobileClose={() => setIsMobileSlipOpen(false)} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {betSlip.length > 0 && !isMobileSlipOpen && (
            <motion.button initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={() => setIsMobileSlipOpen(true)} className="fixed bottom-8 right-6 z-[100] xl:hidden bg-[#DFFF00] text-black px-6 py-4 rounded-2xl font-black shadow-[0_20px_50px_rgba(223,255,0,0.3)] flex items-center gap-3 active:scale-95 transition-transform">
                <div className="relative"><Layers size={20} /><span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-[#DFFF00] text-[10px] flex items-center justify-center rounded-full border-2 border-[#DFFF00]">{betSlip.length}</span></div>
                <span className="uppercase tracking-widest text-xs">View Slip</span>
            </motion.button>
        )}

        <AnimatePresence>
            {expandedMatch && (
                <div className="fixed inset-0 z-[140] flex items-center justify-center p-0 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setExpandedMatch(null)} className="absolute inset-0 bg-black/95 md:bg-black/90 backdrop-blur-md" />
                    <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} className="relative w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] bg-zinc-900 border-x md:border border-zinc-800 rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 md:p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50 sticky top-0 z-10 backdrop-blur-xl">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="flex items-center gap-2 md:gap-3"><img src={expandedMatch.away.logo} className="w-8 h-8 md:w-10 md:h-10 object-contain" alt="" /><span className="text-lg md:text-xl font-black italic">{expandedMatch.away.code}</span></div>
                                <span className="text-zinc-700 font-black">@</span>
                                <div className="flex items-center gap-2 md:gap-3"><img src={expandedMatch.home.logo} className="w-8 h-8 md:w-10 md:h-10 object-contain" alt="" /><span className="text-lg md:text-xl font-black italic">{expandedMatch.home.code}</span></div>
                            </div>
                            <button onClick={() => setExpandedMatch(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-white"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 md:space-y-12 scrollbar-hide pb-32 md:pb-8">
                            <MarketSection title="Full Match" match={expandedMatch} odds={generateOdds(expandedMatch.home.record, expandedMatch.away.record, league, expandedMatch.id)} addToSlip={addToSlip} formatOdds={formatOdds} labels={labels} betSlip={betSlip} prefix="" />
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3"><h4 className="text-xs font-mono text-[#DFFF00] uppercase tracking-[0.3em] pl-2 border-l-2 border-[#DFFF00]">Player Props</h4>{loadingProps && <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#DFFF00] border-t-transparent" />}</div>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">{(['ALL', 'AWAY', 'HOME'] as const).map(f => (<button key={f} onClick={() => setPropTeamFilter(f)} className={`px-3 py-1 rounded text-[8px] font-black uppercase transition-all ${propTeamFilter === f ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}>{f === 'AWAY' ? expandedMatch.away.code : f === 'HOME' ? expandedMatch.home.code : 'ALL'}</button>))}</div>
                                        <select value={propTypeFilter} onChange={(e) => setPropTypeFilter(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-[8px] font-black text-white uppercase outline-none focus:border-[#DFFF00] appearance-none cursor-pointer">{propCategories.map(cat => (<option key={cat} value={cat}>{cat.replace('_', ' ')}</option>))}</select>
                                    </div>
                                </div>
                                {filteredProps.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredProps.map((prop, i) => {
                                            const selOver = `${prop.type === 'ANYTIME_TD' ? 'YES' : `O ${prop.value.toFixed(1)}`}`;
                                            const selUnder = `${prop.type === 'ANYTIME_TD' ? 'NO' : `U ${prop.value.toFixed(1)}`}`;
                                            const isInSlip = (selection: string) => betSlip.some(l => l.match_id.startsWith(expandedMatch.id) && l.selection === selection && l.match_name.includes(prop.name));
                                            return (
                                                <div key={i} className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-[#DFFF00]/30 transition-all">
                                                    <div><div className="flex items-center gap-2 mb-1"><span className="text-[8px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-800 uppercase">{prop.team}</span><span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{prop.name}</span></div><div className="text-sm font-black uppercase text-white">{prop.type.replace('_', ' ')}</div></div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => addToSlip(expandedMatch, 'total', selOver, prop.odds, `${prop.name}`)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all border min-w-[80px] ${isInSlip(selOver) ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}>{prop.type === 'ANYTIME_TD' ? 'YES' : `O ${prop.value.toFixed(1)}`} @{formatOdds(prop.odds)}</button>
                                                        <button onClick={() => addToSlip(expandedMatch, 'total', selUnder, prop.odds, `${prop.name}`)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all border min-w-[80px] ${isInSlip(selUnder) ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}>{prop.type === 'ANYTIME_TD' ? 'NO' : `U ${prop.value.toFixed(1)}`} @{formatOdds(prop.odds)}</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (<div className="text-center py-12 text-zinc-600 font-mono text-xs uppercase tracking-widest border-2 border-dashed border-zinc-800 rounded-3xl">{loadingProps ? 'Accessing team rosters...' : 'No props match current filter'}</div>)}
                            </div>
                            <MarketSection title="1st Half" match={expandedMatch} odds={generateOdds(expandedMatch.home.record, expandedMatch.away.record, league, expandedMatch.id + "-h1")} addToSlip={addToSlip} formatOdds={formatOdds} labels={labels} betSlip={betSlip} prefix="H1" />
                            <MarketSection title="1st Quarter" match={expandedMatch} odds={generateOdds(expandedMatch.home.record, expandedMatch.away.record, league, expandedMatch.id + "-q1")} addToSlip={addToSlip} formatOdds={formatOdds} labels={labels} betSlip={betSlip} prefix="Q1" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
}

function BetSlipContent({ betSlip, wagerAmount, setWagerAmount, isPlacing, message, profile, totalOdds, potentialPayout, formatOdds, removeFromSlip, handlePlaceBet, onMobileClose }: any) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 sticky top-24 shadow-2xl overflow-hidden flex flex-col h-full xl:max-h-[85vh]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#DFFF00] opacity-[0.03] blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-950 rounded-lg text-[#DFFF00] border border-zinc-800"><Coins size={18} /></div>
                    <h3 className="font-black uppercase tracking-tight text-white">Wager Slip</h3>
                </div>
                <div className="flex items-center gap-2">
                    {betSlip.length > 0 && <span className="bg-[#DFFF00] text-black text-[10px] font-black px-2 py-0.5 rounded-full">{betSlip.length}</span>}
                    {onMobileClose && <button onClick={onMobileClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500"><X size={20}/></button>}
                </div>
            </div>
            <div className="flex-1 space-y-4 mb-8 overflow-y-auto pr-2 scrollbar-hide relative z-10">
                {betSlip.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl"><Layers size={24} className="mx-auto text-zinc-800 mb-3" /><p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Selection Required</p></div>
                ) : (
                    betSlip.map((leg: WagerLeg) => (
                        <div key={leg.match_id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 relative group">
                            <button onClick={() => removeFromSlip(leg.match_id)} className="absolute -top-2 -right-2 p-1 bg-zinc-800 text-zinc-400 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl"><X size={12} /></button>
                            <div className="text-[9px] font-mono text-[#DFFF00] uppercase tracking-widest mb-1">{leg.match_name}</div>
                            <div className="flex justify-between items-end">
                                <div><div className="text-xs font-black uppercase text-white">{leg.selection}</div><div className="text-[10px] text-zinc-600 uppercase font-bold">{leg.type}</div></div>
                                <div className="text-sm font-black text-[#DFFF00]">{formatOdds(leg.odds)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {betSlip.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-zinc-800 relative z-10">
                    <div className="flex justify-between text-xs"><span className="text-zinc-500 font-mono uppercase tracking-widest">Combined Odds</span><span className="text-white font-black">{formatOdds(totalOdds)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-zinc-500 font-mono uppercase tracking-widest">Potential Payout</span><span className="text-[#DFFF00] font-black">{potentialPayout} <span className="text-[10px]">CR</span></span></div>
                    <div className="relative pt-4"><Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={14} /><input type="number" value={wagerAmount} onChange={(e) => setWagerAmount(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-[#DFFF00] transition-colors" placeholder="Wager amount..." /></div>
                    <button onClick={handlePlaceBet} disabled={isPlacing || wagerAmount <= 0} className="w-full bg-[#DFFF00] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_10px_30px_rgba(223,255,0,0.2)] disabled:opacity-50">{isPlacing ? 'Placing Wager...' : 'Place Wager'}</button>
                    {message && <div className={`text-center text-[10px] font-bold uppercase tracking-widest p-2 rounded-lg ${message.type === 'success' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{message.text}</div>}
                </div>
            )}
            {profile && <div className="mt-6 flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800"><div className="flex items-center gap-2"><Coins size={12} className="text-[#DFFF00]" /><span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Balance</span></div><span className="text-[10px] font-black text-white">{profile.credits} CR</span></div>}
        </div>
    );
}

function MarketSection({ title, match, odds, addToSlip, formatOdds, labels, prefix, betSlip }: any) {
    const isInSlip = (type: string, selection: string) => {
        const legId = `${match.id}-${type}-${selection}-${prefix}`;
        return betSlip.some((l: any) => l.match_id === legId);
    };

    // Helper to format selection strings with lines
    const getSpreadSelection = (side: 'home' | 'away') => {
        const isFav = odds.spread.favorite === side;
        const line = isFav ? `-${odds.spread.value}` : `+${odds.spread.value}`;
        return `${side}:${line}`;
    };

    const getTotalSelection = (side: 'over' | 'under') => {
        return `${side}:${odds.total.value}`;
    };

    return (
        <div className="space-y-4">
            <h4 className="text-xs font-mono text-[#DFFF00] uppercase tracking-[0.3em] pl-2 border-l-2 border-[#DFFF00]">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="text-[9px] font-mono text-zinc-600 uppercase mb-3">{labels.moneyline}</div>
                    <div className="space-y-2">
                        <button onClick={() => addToSlip(match, 'moneyline', 'away', odds.moneyline.away, prefix)} className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('moneyline', 'away') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}><span>{match.away.code}</span><span>{formatOdds(odds.moneyline.away)}</span></button>
                        <button onClick={() => addToSlip(match, 'moneyline', 'home', odds.moneyline.home, prefix)} className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('moneyline', 'home') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-950 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}><span>{match.home.code}</span><span>{formatOdds(odds.moneyline.home)}</span></button>
                    </div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="text-[9px] font-mono text-zinc-600 uppercase mb-3">{labels.spread}</div>
                    <div className="space-y-2">
                        <button onClick={() => addToSlip(match, 'spread', getSpreadSelection('away'), odds.spread.favorite === 'away' ? odds.spread.odds : odds.spread.dogOdds, prefix)} className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('spread', getSpreadSelection('away')) ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}><span>{match.away.code} {odds.spread.favorite === 'away' ? '-' : '+'}{odds.spread.value}</span><span>{formatOdds(odds.spread.favorite === 'away' ? odds.spread.odds : odds.spread.dogOdds)}</span></button>
                        <button onClick={() => addToSlip(match, 'spread', getSpreadSelection('home'), odds.spread.favorite === 'home' ? odds.spread.odds : odds.spread.dogOdds, prefix)} className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('spread', getSpreadSelection('home')) ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}><span>{match.home.code} {odds.spread.favorite === 'home' ? '-' : '+'}{odds.spread.value}</span><span>{formatOdds(odds.spread.favorite === 'home' ? odds.spread.odds : odds.spread.dogOdds)}</span></button>
                    </div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="text-[9px] font-mono text-zinc-600 uppercase mb-3">{labels.total}</div>
                    <div className="space-y-2">
                        <button onClick={() => addToSlip(match, 'total', getTotalSelection('over'), odds.total.overOdds, prefix)} className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('total', getTotalSelection('over')) ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}><span>OVER {odds.total.value}</span><span>{formatOdds(odds.total.overOdds)}</span></button>
                        <button onClick={() => addToSlip(match, 'total', getTotalSelection('under'), odds.total.underOdds, prefix)} className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-between px-4 border ${isInSlip('total', getTotalSelection('under')) ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-white border-zinc-800 hover:bg-[#DFFF00] hover:text-black'}`}><span>UNDER {odds.total.value}</span><span>{formatOdds(odds.total.underOdds)}</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
}