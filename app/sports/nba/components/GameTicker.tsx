'use client';

import React, { useState } from 'react';
import { X, Loader2, BarChart2, Clock, MapPin, Activity } from 'lucide-react';
import { getGameSummary } from '../actions';

export default function GameTicker({ scores }: { scores: any[] }) {
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const [gameData, setGameData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGameClick = async (gameId: string) => {
        setSelectedGameId(gameId);
        setLoading(true);
        const data = await getGameSummary(gameId);
        setGameData(data);
        setLoading(false);
    };

    const closePopout = () => {
        setSelectedGameId(null);
        setGameData(null);
    };

    // Duplicate scores for seamless ticker loop if few items
    const tickerItems = scores.length < 5 ? [...scores, ...scores, ...scores, ...scores] : [...scores, ...scores];

    return (
        <>
            {/* SCROLLING TICKER AREA */}
            <div className="w-full bg-black/80 backdrop-blur-md border-b border-zinc-800 h-16 flex items-center overflow-hidden relative z-20 group">
                {/* Static Label */}
                <div className="absolute left-0 h-full bg-black z-10 px-4 flex items-center border-r border-zinc-800 shadow-[10px_0_20px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2 text-[#DFFF00] font-black text-[10px] uppercase tracking-widest">
                        <Activity size={14} className={scores.some(s => s.isLive) ? "animate-pulse" : ""} />
                        <span>LIVE WIRE</span>
                    </div>
                </div>

                {/* Animated Track */}
                <div className="flex animate-ticker pl-32 hover:[animation-play-state:paused]">
                    {tickerItems.map((game, i) => (
                        <button 
                            key={`${game.id}-${i}`}
                            onClick={() => handleGameClick(game.id)}
                            className="flex items-center gap-6 px-8 border-r border-zinc-900 h-16 hover:bg-zinc-900/50 transition-colors shrink-0 group/item text-left"
                        >
                            <div className="flex flex-col items-center min-w-[60px]">
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${game.isLive ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                                    {game.status}
                                </span>
                                {game.isLive && <span className="text-[9px] font-mono text-zinc-300">{game.clock}</span>}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <img src={game.home.logo} className="w-6 h-6 object-contain" alt={game.home.name}/>
                                    <span className={`font-black text-sm ${parseInt(game.home.score) > parseInt(game.away.score) ? 'text-white' : 'text-zinc-400'}`}>
                                        {game.home.score}
                                    </span>
                                </div>
                                <span className="text-zinc-700 font-mono text-xs">vs</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-black text-sm ${parseInt(game.away.score) > parseInt(game.home.score) ? 'text-white' : 'text-zinc-400'}`}>
                                        {game.away.score}
                                    </span>
                                    <img src={game.away.logo} className="w-6 h-6 object-contain" alt={game.away.name}/>
                                </div>
                            </div>
                        </button>
                    ))}
                    {scores.length === 0 && (
                        <div className="px-8 flex items-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            No Active Games Scheduled
                        </div>
                    )}
                </div>
            </div>

            {/* GAME DETAILS POPOUT */}
            {selectedGameId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closePopout}>
                    <div className="bg-zinc-950 border-2 border-[#DFFF00] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(223,255,0,0.1)] relative" onClick={e => e.stopPropagation()}>
                        
                        {/* Close Button */}
                        <button onClick={closePopout} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10">
                            <X size={24} />
                        </button>

                        {loading || !gameData ? (
                            <div className="h-64 flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-xs uppercase tracking-widest">
                                <Loader2 size={24} className="animate-spin" /> Fetching Court Telemetry...
                            </div>
                        ) : (
                            <div>
                                {/* Header */}
                                <div className="p-8 border-b border-zinc-800 bg-zinc-900/50 text-center">
                                    <div className="inline-flex items-center gap-2 text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-widest mb-4">
                                        <MapPin size={12}/> {gameData.venue} <span className="text-zinc-700">|</span> {gameData.status}
                                    </div>
                                    
                                    <div className="flex justify-between items-center max-w-2xl mx-auto">
                                        {/* Home Team */}
                                        <div className="text-center w-1/3">
                                            <img src={gameData.home.logo} className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-2xl" />
                                            <h2 className="text-4xl font-black text-white leading-none mb-1">{gameData.home.score}</h2>
                                            <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{gameData.home.displayName}</div>
                                        </div>

                                        {/* VS / Clock */}
                                        <div className="flex flex-col items-center justify-center w-1/3">
                                            <div className="text-2xl font-black text-zinc-700 mb-2">VS</div>
                                            {gameData.status.includes('Final') ? (
                                                <span className="bg-[#DFFF00] text-black px-3 py-1 text-[10px] font-black uppercase">FINAL</span>
                                            ) : (
                                                <div className="flex items-center gap-1 text-red-500 font-mono text-sm font-bold animate-pulse">
                                                    <Clock size={14}/> LIVE
                                                </div>
                                            )}
                                        </div>

                                        {/* Away Team */}
                                        <div className="text-center w-1/3">
                                            <img src={gameData.away.logo} className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-2xl" />
                                            <h2 className="text-4xl font-black text-white leading-none mb-1">{gameData.away.score}</h2>
                                            <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{gameData.away.displayName}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Linescore Table */}
                                <div className="p-6 bg-black border-b border-zinc-800">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-center font-mono text-xs">
                                            <thead>
                                                <tr className="text-zinc-500">
                                                    <th className="text-left pl-4 pb-2">TEAM</th>
                                                    {gameData.home.linescores.map((_:any, i:number) => <th key={i} className="pb-2">Q{i+1}</th>)}
                                                    <th className="pb-2 text-[#DFFF00]">TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-white font-bold">
                                                <tr className="border-t border-zinc-900">
                                                    <td className="text-left pl-4 py-3 text-zinc-400 uppercase">{gameData.home.abbreviation}</td>
                                                    {gameData.home.linescores.map((s:any, i:number) => <td key={i} className="py-3">{s.displayValue}</td>)}
                                                    <td className="py-3 text-[#DFFF00]">{gameData.home.score}</td>
                                                </tr>
                                                <tr className="border-t border-zinc-900">
                                                    <td className="text-left pl-4 py-3 text-zinc-400 uppercase">{gameData.away.abbreviation}</td>
                                                    {gameData.away.linescores.map((s:any, i:number) => <td key={i} className="py-3">{s.displayValue}</td>)}
                                                    <td className="py-3 text-[#DFFF00]">{gameData.away.score}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Leaders Grid */}
                                <div className="p-8 bg-zinc-900/30">
                                    <h3 className="flex items-center gap-2 text-[#DFFF00] font-black uppercase text-sm mb-6">
                                        <BarChart2 size={16}/> Top Performers
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {gameData.leaders.map((cat: any, i: number) => (
                                            <div key={i} className="bg-black border border-zinc-800 p-4">
                                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center mb-4 border-b border-zinc-800 pb-2">
                                                    {cat.label}
                                                </div>
                                                <div className="flex justify-between items-center gap-4">
                                                    {/* Home Leader */}
                                                    <div className="text-center flex-1">
                                                        <img src={cat.homeLeader?.headshot?.href} className="w-12 h-12 rounded-full bg-zinc-800 mx-auto mb-2 object-cover object-top border border-zinc-700" />
                                                        <div className="text-[10px] font-black text-white uppercase truncate max-w-[80px] mx-auto">{cat.homeLeader?.displayName}</div>
                                                        <div className="text-lg font-mono font-bold text-[#DFFF00]">{cat.homeValue}</div>
                                                    </div>
                                                    
                                                    <div className="h-8 w-px bg-zinc-800"></div>

                                                    {/* Away Leader */}
                                                    <div className="text-center flex-1">
                                                        <img src={cat.awayLeader?.headshot?.href} className="w-12 h-12 rounded-full bg-zinc-800 mx-auto mb-2 object-cover object-top border border-zinc-700" />
                                                        <div className="text-[10px] font-black text-white uppercase truncate max-w-[80px] mx-auto">{cat.awayLeader?.displayName}</div>
                                                        <div className="text-lg font-mono font-bold text-[#DFFF00]">{cat.awayValue}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}