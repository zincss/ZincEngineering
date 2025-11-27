'use client';

import React, { useState, useEffect } from 'react';
import { getLiveScores } from '../sports/nba/actions';
import { Activity, Globe, Zap } from 'lucide-react';

export default function GlobalTicker() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initFeed = async () => {
            const feed = [];

            // 1. FETCH NBA SCORES
            try {
                const nbaGames = await getLiveScores();
                if (nbaGames && nbaGames.length > 0) {
                    nbaGames.forEach((g: any) => {
                        feed.push({
                            sport: 'NBA',
                            color: 'text-orange-500 border-orange-500',
                            text: `${g.home.name} ${g.home.score} vs ${g.away.name} ${g.away.score} [${g.status}]`,
                            isLive: g.isLive
                        });
                    });
                } else {
                    feed.push({ sport: 'NBA', color: 'text-orange-500 border-orange-500', text: 'NO LIVE GAMES DETECTED' });
                }
            } catch (e) { console.error('Ticker NBA Error', e); }

            // 2. FETCH F1 LATEST
            try {
                const f1Res = await fetch('https://api.jolpi.ca/ergast/f1/current/last/results.json');
                const f1Data = await f1Res.json();
                const race = f1Data.MRData.RaceTable.Races[0];
                const winner = race.Results[0].Driver.familyName.toUpperCase();
                const team = race.Results[0].Constructor.name.toUpperCase();
                
                feed.push({
                    sport: 'F1',
                    color: 'text-red-500 border-red-500',
                    text: `LATEST: ${race.raceName.toUpperCase()} // WINNER: ${winner} (${team})`
                });
            } catch (e) { console.error('Ticker F1 Error', e); }

            setItems(feed);
            setLoading(false);
        };

        initFeed();
    }, []);

    if (loading || items.length === 0) return null;

    // Duplicate list for seamless loop
    const loopItems = [...items, ...items, ...items];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-10 bg-black border-t-2 border-[#DFFF00] z-40 flex items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            
            {/* STATIC LABEL */}
            <div className="h-full bg-[#DFFF00] text-black px-6 flex items-center gap-2 font-black text-[10px] tracking-widest uppercase z-20 relative">
                <Activity size={14} className="animate-pulse" />
                <span className="hidden md:inline">GLOBAL WIRE</span>
                {/* Slanted Cut */}
                <div className="absolute right-[-12px] top-0 h-full w-6 bg-[#DFFF00] transform skew-x-[-20deg] z-[-1]"></div>
            </div>

            {/* SCROLLING AREA */}
            <div className="flex-1 overflow-hidden h-full flex items-center relative pl-8">
                <div className="animate-ticker flex gap-12 items-center">
                    {loopItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 font-mono text-xs uppercase whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${item.color}`}>
                                {item.sport}
                            </span>
                            <span className={`text-zinc-400 font-bold ${item.isLive ? 'text-white' : ''}`}>
                                {item.text}
                            </span>
                            {item.isLive && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}