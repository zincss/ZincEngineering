'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Trophy, Timer, ChevronRight, Filter, 
    RefreshCw, Globe, ArrowRight, Zap, Target, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { getLiveMatchCenterData, getMatchDetails } from './actions';
import Link from 'next/link';

export default function MatchCenter() {
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
        else setExpanded({ nba: false, nfl: false, golf: false }); // Collapse all on ALL by default? Or keep previous?
        // Request says "minimized by default", so resetting to false on ALL seems appropriate or just initial load.
        // If user switches back to ALL, maybe keep them closed.
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

    return (
        <main className="min-h-screen bg-zinc-950 text-white pb-32 pt-24 px-4 md:px-8 font-sans selection:bg-[#DFFF00] selection:text-black">
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
            
            <div className="max-w-[1600px] mx-auto relative z-10">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                            <Activity size={24} className="text-[#DFFF00]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                                <span>ZincSports // Live Feed</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
                                    <div className="w-1 h-1 rounded-full bg-[#DFFF00] animate-pulse" />
                                    <span className="text-[8px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest">Real-Time Telemetry</span>
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">
                                Match <span className="text-zinc-800">Center</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                            Last Sync: {lastUpdated.toLocaleTimeString()}
                        </div>
                        
                        <div className="flex gap-1 p-1 bg-zinc-900/50 border border-white/5 rounded-2xl w-full md:w-auto">
                            {['ALL', 'NBA', 'NFL', 'GOLF'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
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
                        <RefreshCw size={48} className="animate-spin text-[#DFFF00]" />
                        <span className="font-mono text-xs uppercase tracking-[0.4em] animate-pulse text-zinc-500">Establishing Secure Uplink...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        
                        {/* GOLF SECTION */}
                        {showGolf && (
                            <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden">
                                <button 
                                    onClick={() => toggleSection('golf')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] border border-white/5 shadow-xl"><Trophy size={16} /></div>
                                        <h3 className="text-lg font-black uppercase italic tracking-tight">PGA Tour // Live</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{golfData.isLive ? 'LIVE' : golfData.status}</span>
                                        {expanded.golf ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expanded.golf && (
                                        <motion.div 
                                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 border-t border-white/5 bg-zinc-900/10">
                                                <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group mt-4">
                                                    <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
                                                        <div>
                                                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-4">Live Tournament Analytics</div>
                                                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-4">{golfData.name}</h2>
                                                            <div className="flex items-center gap-6">
                                                                <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase">
                                                                    <Globe size={14} className="text-[#DFFF00]" /> {golfData.venue}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1 lg:max-w-2xl">
                                                            {golfData.leaders?.map((p: any, i: number) => (
                                                                <div key={i} className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className="text-[9px] font-mono text-zinc-600 uppercase">POS: {p.pos}</span>
                                                                        <span className="text-sm font-black text-[#DFFF00] font-mono">{p.score}</span>
                                                                    </div>
                                                                    <span className="text-xs font-black uppercase truncate text-white">{p.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="mt-8 pt-4 border-t border-white/5">
                                                        <Link href="/sports/golf" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#DFFF00] hover:translate-x-2 transition-all">
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
                            <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden">
                                <button 
                                    onClick={() => toggleSection('nfl')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] border border-white/5 shadow-xl"><Target size={16} /></div>
                                        <h3 className="text-lg font-black uppercase italic tracking-tight">NFL // Match Center</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{nflMatches.length} Matches</span>
                                        {expanded.nfl ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expanded.nfl && (
                                        <motion.div 
                                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 border-t border-white/5 bg-zinc-900/10">
                                                {nflMatches.length === 0 ? (
                                                     <div className="py-12 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">No Active NFL Matches</div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                                                        {nflMatches.map((match: any) => (
                                                            <MatchCard key={match.id} match={match} onClick={() => handleMatchClick(match)} />
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
                            <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden">
                                <button 
                                    onClick={() => toggleSection('nba')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] border border-white/5 shadow-xl"><Target size={16} /></div>
                                        <h3 className="text-lg font-black uppercase italic tracking-tight">NBA // Match Center</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{nbaMatches.length} Matches</span>
                                        {expanded.nba ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expanded.nba && (
                                        <motion.div 
                                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 border-t border-white/5 bg-zinc-900/10">
                                                {nbaMatches.length === 0 ? (
                                                     <div className="py-12 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">No Active NBA Matches</div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                                                        {nbaMatches.map((match: any) => (
                                                            <MatchCard key={match.id} match={match} onClick={() => handleMatchClick(match)} />
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
                                className="fixed inset-4 md:inset-20 z-50 bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto"
                            >
                                <button onClick={closeDetails} className="absolute top-8 right-8 z-50 p-4 bg-zinc-900 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                    <X size={20} />
                                </button>

                                {loadingDetails || !matchDetails ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                                        <RefreshCw size={48} className="animate-spin text-[#DFFF00]" />
                                        <span className="font-mono text-xs uppercase tracking-[0.4em] animate-pulse text-zinc-500">Decrypting Match Data...</span>
                                    </div>
                                ) : (
                                    <div className="w-full h-full overflow-y-auto flex flex-col md:flex-row">
                                        
                                        {/* LEFT PANEL: TEAMS & SCORE */}
                                        <div className="w-full md:w-1/3 bg-zinc-900/30 border-r border-white/5 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-[#DFFF00]" />
                                            
                                            <div className="text-center mb-12">
                                                <div className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                                                    {matchDetails.venue}
                                                </div>
                                                <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{matchDetails.status}</div>
                                            </div>

                                            <div className="space-y-12">
                                                <div className="flex flex-col items-center gap-4">
                                                    <img src={matchDetails.away.logo} alt={matchDetails.away.code} className="w-24 h-24 object-contain" />
                                                    <div className="text-center">
                                                        <div className="text-4xl font-black uppercase italic leading-none mb-1">{matchDetails.away.code}</div>
                                                        <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{matchDetails.away.name}</div>
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
                                                        <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{matchDetails.home.name}</div>
                                                    </div>
                                                    <img src={matchDetails.home.logo} alt={matchDetails.home.code} className="w-24 h-24 object-contain" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT PANEL: STATS & DETAILS */}
                                        <div className="flex-1 p-8 md:p-12 bg-[#050505]">
                                            
                                            {/* Quarter Scores */}
                                            <div className="mb-12">
                                                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">Scoring Summary</h4>
                                                <div className="grid grid-cols-[1fr_repeat(4,1fr)_1fr] gap-4 text-center max-w-xl mx-auto md:mx-0">
                                                    <div className="text-left font-black uppercase text-zinc-600 text-xs">Team</div>
                                                    {[1,2,3,4].map(q => <div key={q} className="text-zinc-600 font-mono text-xs">Q{q}</div>)}
                                                    <div className="text-white font-black uppercase text-xs">Total</div>

                                                    {/* Away */}
                                                    <div className="text-left font-bold uppercase text-white text-sm">{matchDetails.away.code}</div>
                                                    {matchDetails.away.linescores.map((s: string, i: number) => (
                                                        <div key={i} className="text-zinc-400 font-mono text-sm">{s}</div>
                                                    ))}
                                                    <div className="text-[#DFFF00] font-black font-mono text-sm">{matchDetails.away.score}</div>

                                                    {/* Home */}
                                                    <div className="text-left font-bold uppercase text-white text-sm">{matchDetails.home.code}</div>
                                                    {matchDetails.home.linescores.map((s: string, i: number) => (
                                                        <div key={i} className="text-zinc-400 font-mono text-sm">{s}</div>
                                                    ))}
                                                    <div className="text-[#DFFF00] font-black font-mono text-sm">{matchDetails.home.score}</div>
                                                </div>
                                            </div>

                                            {/* Leaders */}
                                            <div className="mb-12">
                                                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">Top Performers</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {matchDetails.leaders.slice(0, 6).map((leader: any, i: number) => (
                                                        <div key={i} className="bg-zinc-900/20 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                                                                <img src={leader.headshot} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div>
                                                                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">{leader.category}</div>
                                                                <div className="font-black text-sm uppercase text-white">{leader.athlete} <span className="text-zinc-600 text-xs ml-1">{leader.teamAbbr}</span></div>
                                                                <div className="text-[#DFFF00] font-mono font-bold text-xs mt-1">{leader.value}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Team Stats Comparison */}
                                            <div>
                                                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">Team Statistics</h4>
                                                <div className="space-y-4 max-w-2xl">
                                                    {matchDetails.away.stats.map((stat: any, i: number) => {
                                                        const homeStat = matchDetails.home.stats[i];
                                                        return (
                                                            <div key={i} className="flex items-center justify-between text-xs">
                                                                <div className="w-12 text-right font-mono font-bold text-white">{stat.value}</div>
                                                                <div className="flex-1 text-center font-bold text-zinc-500 uppercase tracking-widest px-4">{stat.label}</div>
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
        </main>
    );
}

function MatchCard({ match, onClick }: { match: any, onClick: () => void }) {
    return (
        <div 
            onClick={onClick}
            className="group bg-zinc-900/50 border border-white/5 hover:border-[#DFFF00]/30 rounded-[2.5rem] p-8 backdrop-blur-xl transition-all duration-500 flex flex-col relative overflow-hidden cursor-pointer hover:shadow-2xl"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl -mr-16 -mt-16 group-hover:bg-[#DFFF00]/5 transition-colors" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${match.isLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`} />
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{match.league} // {match.status}</span>
                </div>
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">{match.period ? `Period ${match.period}` : ''}</div>
            </div>

            <div className="flex items-center justify-between gap-6 mb-8 relative z-10">
                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center p-3 border border-white/5 shadow-xl group-hover:scale-110 transition-transform">
                        <img src={match.away.logo} alt={match.away.code} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-black uppercase text-center">{match.away.code}</span>
                    <span className="text-2xl md:text-4xl font-mono font-black text-white italic">{match.away.score}</span>
                </div>
                
                <div className="text-zinc-800 font-black text-2xl italic flex flex-col items-center gap-2">
                    <div className="h-12 w-px bg-zinc-800" />
                    VS
                    <div className="h-12 w-px bg-zinc-800" />
                </div>

                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center p-3 border border-white/5 shadow-xl group-hover:scale-110 transition-transform">
                        <img src={match.home.logo} alt={match.home.code} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-black uppercase text-center">{match.home.code}</span>
                    <span className="text-2xl md:text-4xl font-mono font-black text-white italic">{match.home.score}</span>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Venue Telemetry</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase truncate max-w-[150px]">{match.venue}</span>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl text-zinc-500 hover:text-[#DFFF00] border border-white/5 transition-all group-hover:scale-110">
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
    );
}
