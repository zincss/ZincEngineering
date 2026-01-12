'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Trophy, Timer, ChevronRight, Filter, 
    RefreshCw, Globe, ArrowRight, Zap, Target, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { getLiveMatchCenterData, getMatchDetails } from './actions';
import Link from 'next/link';
import { useSportsMode } from '@/app/context/SportsModeContext';

export default function MatchCenter() {
    const { isSportsMode } = useSportsMode();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'NBA' | 'NFL' | 'GOLF'>('ALL');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    
    // Collapsible State
    const [expanded, setExpanded] = useState<{nba: boolean, nfl: boolean, golf: boolean}>({
        nba: false,
        nfl: false,
        golf: false
    });

    // Selected Match State
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [matchDetails, setMatchDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchData = async () => {
        const res = await getLiveMatchCenterData();
        setData(res);
        setLoading(false);
        setLastUpdated(new Date());
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); 
        return () => clearInterval(interval);
    }, []);

    // Auto-expand based on filter
    useEffect(() => {
        if (filter === 'NBA') setExpanded({ nba: true, nfl: false, golf: false });
        else if (filter === 'NFL') setExpanded({ nba: false, nfl: true, golf: false });
        else if (filter === 'GOLF') setExpanded({ nba: false, nfl: false, golf: true });
        else setExpanded({ nba: false, nfl: false, golf: false }); 
    }, [filter]);

    const toggleSection = (section: 'nba' | 'nfl' | 'golf') => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleMatchClick = async (match: any) => {
        setSelectedMatch(match);
        setLoadingDetails(true);
        const details = await getMatchDetails(match.league, match.id);
        setMatchDetails(details);
        setLoadingDetails(false);
    };

    const closeDetails = () => {
        setSelectedMatch(null);
        setMatchDetails(null);
    };

    const matches = data?.matches || [];
    const nbaMatches = matches.filter((m: any) => m.league === 'nba');
    const nflMatches = matches.filter((m: any) => m.league === 'nfl');
    const golfData = data?.golf;

    const showGolf = (filter === 'ALL' || filter === 'GOLF') && golfData;
    const showNBA = (filter === 'ALL' || filter === 'NBA');
    const showNFL = (filter === 'ALL' || filter === 'NFL');

    // Theme Variables
    const theme = isSportsMode ? {
        bg: 'bg-[#020617]',
        cardBg: 'bg-slate-900/50',
        cardBorder: 'border-blue-500/10',
        accent: 'text-blue-400',
        accentBg: 'bg-blue-500',
        subText: 'text-slate-400',
        heading: 'text-white'
    } : {
        bg: 'bg-zinc-950',
        cardBg: 'bg-zinc-900/50',
        cardBorder: 'border-white/5',
        accent: 'text-[#DFFF00]',
        accentBg: 'bg-[#DFFF00]',
        subText: 'text-zinc-500',
        heading: 'text-white'
    };

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.heading} pb-32 font-sans selection:bg-blue-500 selection:text-white`}>
            
            <div className="max-w-[1600px] mx-auto relative z-10">
                
                {/* HEADER */}
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-8 border-b ${theme.cardBorder} pb-8`}>
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-2xl ${isSportsMode ? 'bg-slate-900 border-blue-500/20 shadow-blue-500/10' : 'bg-zinc-900 border-zinc-800'}`}>
                            <Activity size={24} className={theme.accent} />
                        </div>
                        <div>
                            <div className={`flex items-center gap-3 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2 ${theme.subText}`}>
                                <span>ZincSports // Live Feed</span>
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isSportsMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-[#DFFF00]/10 border-[#DFFF00]/20'}`}>
                                    <div className={`w-1 h-1 rounded-full animate-pulse ${theme.accentBg}`} />
                                    <span className={`text-[8px] font-mono font-bold uppercase tracking-widest ${theme.accent}`}>Real-Time Telemetry</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                                Match <span className={isSportsMode ? 'text-slate-700' : 'text-zinc-800'}>Center</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                        <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-full border backdrop-blur-md ${theme.cardBg} ${theme.cardBorder} ${theme.subText}`}>
                            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                            Last Sync: {lastUpdated.toLocaleTimeString()}
                        </div>
                        
                        <div className={`flex gap-1 p-1 rounded-2xl w-full md:w-auto ${theme.cardBg} ${theme.cardBorder} border`}>
                            {['ALL', 'NBA', 'NFL', 'GOLF'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? `${theme.accentBg} text-black shadow-lg` : `${theme.subText} hover:text-white`}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CONTENT GRID */}
                {loading && !data ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6">
                        <RefreshCw size={48} className={`animate-spin ${theme.accent}`} />
                        <span className={`font-mono text-xs uppercase tracking-[0.4em] animate-pulse ${theme.subText}`}>Establishing Secure Uplink...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        
                        {/* GOLF SECTION */}
                        {showGolf && (
                            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl overflow-hidden`}>
                                <button 
                                    onClick={() => toggleSection('golf')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg border shadow-xl ${isSportsMode ? 'bg-slate-800 border-blue-500/20 text-blue-400' : 'bg-zinc-900 border-white/5 text-[#DFFF00]'}`}><Trophy size={16} /></div>
                                        <h3 className="text-lg font-black uppercase italic tracking-tight">PGA Tour // Live</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-mono uppercase tracking-widest ${theme.subText}`}>{golfData.isLive ? 'LIVE' : golfData.status}</span>
                                        {expanded.golf ? <ChevronUp size={20} className={theme.subText} /> : <ChevronDown size={20} className={theme.subText} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expanded.golf && (
                                        <motion.div 
                                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`p-6 pt-0 border-t ${theme.cardBorder} ${isSportsMode ? 'bg-slate-950/30' : 'bg-zinc-900/10'}`}>
                                                <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-[2rem] p-8 relative overflow-hidden group mt-4`}>
                                                    <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
                                                        <div>
                                                            <div className={`text-[10px] font-mono uppercase tracking-[0.4em] mb-4 ${theme.subText}`}>Live Tournament Analytics</div>
                                                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-4">{golfData.name}</h2>
                                                            <div className="flex items-center gap-6">
                                                                <div className={`flex items-center gap-2 font-mono text-xs uppercase ${theme.subText}`}>
                                                                    <Globe size={14} className={theme.accent} /> {golfData.venue}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1 lg:max-w-2xl">
                                                            {golfData.leaders?.map((p: any, i: number) => (
                                                                <div key={i} className={`${isSportsMode ? 'bg-slate-950/50' : 'bg-zinc-950/50'} p-4 rounded-2xl border ${theme.cardBorder} flex flex-col justify-center`}>
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className={`text-[9px] font-mono uppercase ${theme.subText}`}>POS: {p.pos}</span>
                                                                        <span className={`text-sm font-black font-mono ${theme.accent}`}>{p.score}</span>
                                                                    </div>
                                                                    <span className="text-xs font-black uppercase truncate text-white">{p.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className={`mt-8 pt-4 border-t ${theme.cardBorder}`}>
                                                        <Link href="/sports/golf" className={`inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] hover:translate-x-2 transition-all ${theme.accent}`}>
                                                            Full Leaderboard <ArrowRight size={14} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* NFL SECTION */}
                        {showNFL && (
                            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl overflow-hidden`}>
                                <button 
                                    onClick={() => toggleSection('nfl')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg border shadow-xl ${isSportsMode ? 'bg-slate-800 border-blue-500/20 text-blue-400' : 'bg-zinc-900 border-white/5 text-[#DFFF00]'}`}><Target size={16} /></div>
                                        <h3 className="text-lg font-black uppercase italic tracking-tight">NFL // Match Center</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-mono uppercase tracking-widest ${theme.subText}`}>{nflMatches.length} Matches</span>
                                        {expanded.nfl ? <ChevronUp size={20} className={theme.subText} /> : <ChevronDown size={20} className={theme.subText} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expanded.nfl && (
                                        <motion.div 
                                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`p-6 pt-0 border-t ${theme.cardBorder} ${isSportsMode ? 'bg-slate-950/30' : 'bg-zinc-900/10'}`}>
                                                {nflMatches.length === 0 ? (
                                                     <div className={`py-12 text-center font-mono text-xs uppercase tracking-widest ${theme.subText}`}>No Active NFL Matches</div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                                                        {nflMatches.map((match: any) => (
                                                            <MatchCard key={match.id} match={match} onClick={() => handleMatchClick(match)} theme={theme} isSportsMode={isSportsMode} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* NBA SECTION */}
                        {showNBA && (
                            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl overflow-hidden`}>
                                <button 
                                    onClick={() => toggleSection('nba')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg border shadow-xl ${isSportsMode ? 'bg-slate-800 border-blue-500/20 text-blue-400' : 'bg-zinc-900 border-white/5 text-[#DFFF00]'}`}><Target size={16} /></div>
                                        <h3 className="text-lg font-black uppercase italic tracking-tight">NBA // Match Center</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-mono uppercase tracking-widest ${theme.subText}`}>{nbaMatches.length} Matches</span>
                                        {expanded.nba ? <ChevronUp size={20} className={theme.subText} /> : <ChevronDown size={20} className={theme.subText} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expanded.nba && (
                                        <motion.div 
                                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`p-6 pt-0 border-t ${theme.cardBorder} ${isSportsMode ? 'bg-slate-950/30' : 'bg-zinc-900/10'}`}>
                                                {nbaMatches.length === 0 ? (
                                                     <div className={`py-12 text-center font-mono text-xs uppercase tracking-widest ${theme.subText}`}>No Active NBA Matches</div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                                                        {nbaMatches.map((match: any) => (
                                                            <MatchCard key={match.id} match={match} onClick={() => handleMatchClick(match)} theme={theme} isSportsMode={isSportsMode} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                    </div>
                )}

                {/* MATCH DETAIL MODAL */}
                <AnimatePresence>
                    {selectedMatch && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                onClick={closeDetails}
                                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-12 cursor-pointer"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className={`fixed inset-4 md:inset-20 z-50 ${isSportsMode ? 'bg-slate-950 border-blue-500/20' : 'bg-[#0A0A0A] border-white/10'} border rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto`}
                            >
                                <button onClick={closeDetails} className={`absolute top-8 right-8 z-50 p-4 rounded-full transition-colors ${isSportsMode ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
                                    <X size={20} />
                                </button>

                                {loadingDetails || !matchDetails ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                                        <RefreshCw size={48} className={`animate-spin ${theme.accent}`} />
                                        <span className={`font-mono text-xs uppercase tracking-[0.4em] animate-pulse ${theme.subText}`}>Decrypting Match Data...</span>
                                    </div>
                                ) : (
                                    <div className="w-full h-full overflow-y-auto flex flex-col md:flex-row">
                                        
                                        {/* LEFT PANEL: TEAMS & SCORE */}
                                        <div className={`w-full md:w-1/3 ${isSportsMode ? 'bg-slate-900/30' : 'bg-zinc-900/30'} border-r ${theme.cardBorder} p-8 md:p-12 flex flex-col justify-center relative overflow-hidden`}>
                                            <div className={`absolute top-0 left-0 w-full h-1 ${theme.accentBg}`} />
                                            
                                            <div className="text-center mb-12">
                                                <div className={`inline-block px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-4 ${isSportsMode ? 'bg-slate-900 border-blue-500/20 text-slate-400' : 'bg-zinc-900 border-white/10 text-zinc-400'}`}>
                                                    {matchDetails.venue}
                                                </div>
                                                <div className={`font-mono text-xs uppercase tracking-widest ${theme.subText}`}>{matchDetails.status}</div>
                                            </div>

                                            <div className="space-y-12">
                                                <div className="flex flex-col items-center gap-4">
                                                    <img src={matchDetails.away.logo} alt={matchDetails.away.code} className="w-24 h-24 object-contain" />
                                                    <div className="text-center">
                                                        <div className="text-4xl font-black uppercase italic leading-none mb-1">{matchDetails.away.code}</div>
                                                        <div className={`text-xs font-mono uppercase tracking-widest ${theme.subText}`}>{matchDetails.away.name}</div>
                                                    </div>
                                                    <div className="text-6xl font-black font-mono text-white">{matchDetails.away.score}</div>
                                                </div>

                                                <div className="flex items-center justify-center gap-4 opacity-30">
                                                    <div className="h-px w-12 bg-white" />
                                                    <span className="font-black italic text-2xl">VS</span>
                                                    <div className="h-px w-12 bg-white" />
                                                </div>

                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="text-6xl font-black font-mono text-white">{matchDetails.home.score}</div>
                                                    <div className="text-center">
                                                        <div className="text-4xl font-black uppercase italic leading-none mb-1">{matchDetails.home.code}</div>
                                                        <div className={`text-xs font-mono uppercase tracking-widest ${theme.subText}`}>{matchDetails.home.name}</div>
                                                    </div>
                                                    <img src={matchDetails.home.logo} alt={matchDetails.home.code} className="w-24 h-24 object-contain" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT PANEL: STATS & DETAILS */}
                                        <div className={`flex-1 p-8 md:p-12 ${isSportsMode ? 'bg-[#020617]' : 'bg-[#050505]'}`}>
                                            
                                            {/* Quarter Scores */}
                                            <div className="mb-12">
                                                <h4 className={`text-[10px] font-mono uppercase tracking-[0.4em] mb-6 border-b ${theme.cardBorder} pb-2 ${theme.subText}`}>Scoring Summary</h4>
                                                <div className="grid grid-cols-[1fr_repeat(4,1fr)_1fr] gap-4 text-center max-w-xl mx-auto md:mx-0">
                                                    <div className={`text-left font-black uppercase text-xs ${isSportsMode ? 'text-slate-500' : 'text-zinc-600'}`}>Team</div>
                                                    {[1,2,3,4].map(q => <div key={q} className={`font-mono text-xs ${isSportsMode ? 'text-slate-500' : 'text-zinc-600'}`}>Q{q}</div>)}
                                                    <div className="text-white font-black uppercase text-xs">Total</div>

                                                    {/* Away */}
                                                    <div className="text-left font-bold uppercase text-white text-sm">{matchDetails.away.code}</div>
                                                    {matchDetails.away.linescores.map((s: string, i: number) => (
                                                        <div key={i} className={`font-mono text-sm ${isSportsMode ? 'text-slate-400' : 'text-zinc-400'}`}>{s}</div>
                                                    ))}
                                                    <div className={`font-black font-mono text-sm ${theme.accent}`}>{matchDetails.away.score}</div>

                                                    {/* Home */}
                                                    <div className="text-left font-bold uppercase text-white text-sm">{matchDetails.home.code}</div>
                                                    {matchDetails.home.linescores.map((s: string, i: number) => (
                                                        <div key={i} className={`font-mono text-sm ${isSportsMode ? 'text-slate-400' : 'text-zinc-400'}`}>{s}</div>
                                                    ))}
                                                    <div className={`font-black font-mono text-sm ${theme.accent}`}>{matchDetails.home.score}</div>
                                                </div>
                                            </div>

                                            {/* Leaders */}
                                            <div className="mb-12">
                                                <h4 className={`text-[10px] font-mono uppercase tracking-[0.4em] mb-6 border-b ${theme.cardBorder} pb-2 ${theme.subText}`}>Top Performers</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {matchDetails.leaders.slice(0, 6).map((leader: any, i: number) => (
                                                        <div key={i} className={`${isSportsMode ? 'bg-slate-900/20' : 'bg-zinc-900/20'} border ${theme.cardBorder} p-4 rounded-xl flex items-center gap-4`}>
                                                            <div className={`w-12 h-12 rounded-full overflow-hidden border ${isSportsMode ? 'bg-slate-800 border-blue-500/10' : 'bg-zinc-800 border-white/10'}`}>
                                                                <img src={leader.headshot} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div>
                                                                <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${theme.subText}`}>{leader.category}</div>
                                                                <div className="font-black text-sm uppercase text-white">{leader.athlete} <span className={`text-xs ml-1 ${isSportsMode ? 'text-slate-600' : 'text-zinc-600'}`}>{leader.teamAbbr}</span></div>
                                                                <div className={`font-mono font-bold text-xs mt-1 ${theme.accent}`}>{leader.value}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Team Stats Comparison */}
                                            <div>
                                                <h4 className={`text-[10px] font-mono uppercase tracking-[0.4em] mb-6 border-b ${theme.cardBorder} pb-2 ${theme.subText}`}>Team Statistics</h4>
                                                <div className="space-y-4 max-w-2xl">
                                                    {matchDetails.away.stats.map((stat: any, i: number) => {
                                                        const homeStat = matchDetails.home.stats[i];
                                                        return (
                                                            <div key={i} className="flex items-center justify-between text-xs">
                                                                <div className="w-12 text-right font-mono font-bold text-white">{stat.value}</div>
                                                                <div className={`flex-1 text-center font-bold uppercase tracking-widest px-4 ${theme.subText}`}>{stat.label}</div>
                                                                <div className="w-12 text-left font-mono font-bold text-white">{homeStat?.value || '-'}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

function MatchCard({ match, onClick, theme, isSportsMode }: { match: any, onClick: () => void, theme: any, isSportsMode: boolean }) {
    return (
        <div 
            onClick={onClick}
            className={`group ${theme.cardBg} border ${theme.cardBorder} hover:border-opacity-50 rounded-[2.5rem] p-8 backdrop-blur-xl transition-all duration-500 flex flex-col relative overflow-hidden cursor-pointer hover:shadow-2xl ${isSportsMode ? 'hover:shadow-blue-500/10' : 'hover:shadow-[#DFFF00]/10'}`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl -mr-16 -mt-16 transition-colors ${isSportsMode ? 'group-hover:bg-blue-500/10' : 'group-hover:bg-[#DFFF00]/5'}`} />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${match.isLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : isSportsMode ? 'bg-slate-700' : 'bg-zinc-700'}`} />
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${theme.subText}`}>{match.league} // {match.status}</span>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest italic ${isSportsMode ? 'text-slate-500' : 'text-zinc-600'}`}>{match.period ? `Period ${match.period}` : ''}</div>
            </div>

            <div className="flex items-center justify-between gap-6 mb-8 relative z-10">
                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center p-3 border shadow-xl group-hover:scale-110 transition-transform ${isSportsMode ? 'bg-slate-950 border-blue-500/10' : 'bg-zinc-950 border-white/5'}`}>
                        <img src={match.away.logo} alt={match.away.code} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-black uppercase text-center">{match.away.code}</span>
                    <span className="text-2xl md:text-4xl font-mono font-black text-white italic">{match.away.score}</span>
                </div>
                
                <div className={`font-black text-2xl italic flex flex-col items-center gap-2 ${isSportsMode ? 'text-slate-700' : 'text-zinc-800'}`}>
                    <div className={`h-12 w-px ${isSportsMode ? 'bg-slate-800' : 'bg-zinc-800'}`} />
                    VS
                    <div className={`h-12 w-px ${isSportsMode ? 'bg-slate-800' : 'bg-zinc-800'}`} />
                </div>

                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center p-3 border shadow-xl group-hover:scale-110 transition-transform ${isSportsMode ? 'bg-slate-950 border-blue-500/10' : 'bg-zinc-950 border-white/5'}`}>
                        <img src={match.home.logo} alt={match.home.code} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-black uppercase text-center">{match.home.code}</span>
                    <span className="text-2xl md:text-4xl font-mono font-black text-white italic">{match.home.score}</span>
                </div>
            </div>

            <div className={`mt-auto pt-6 border-t ${theme.cardBorder} flex justify-between items-center`}>
                <div className="flex flex-col">
                    <span className={`text-[8px] font-mono uppercase tracking-widest ${isSportsMode ? 'text-slate-500' : 'text-zinc-600'}`}>Venue Telemetry</span>
                    <span className={`text-[10px] font-bold uppercase truncate max-w-[150px] ${isSportsMode ? 'text-slate-400' : 'text-zinc-400'}`}>{match.venue}</span>
                </div>
                <div className={`p-3 rounded-xl transition-all group-hover:scale-110 border ${isSportsMode ? 'bg-slate-950 text-slate-500 hover:text-blue-400 border-blue-500/10' : 'bg-zinc-950 text-zinc-500 hover:text-[#DFFF00] border-white/5'}`}>
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
    );
}
