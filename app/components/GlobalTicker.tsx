'use client';

import React, { useState, useEffect } from 'react';
// Correct import path for the global component location
import { getLiveScores as getNBAScores } from '../sports/nba/actions';

const fetchJson = async (url: string) => {
    try {
        const res = await fetch(url, { next: { revalidate: 30 } });
        return res.ok ? await res.json() : null;
    } catch { return null; }
};

export default function GlobalTicker() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initFeed = async () => {
            const feed: any[] = [];

            // 1. NBA SCORES
            try {
                const nbaGames = await getNBAScores();
                if (nbaGames && nbaGames.length > 0) {
                    nbaGames.forEach((g: any) => {
                        feed.push({
                            sport: 'NBA',
                            color: 'text-[#DFFF00]',
                            text: `${g.home.code} ${g.home.score} - ${g.away.code} ${g.away.score}`,
                            isLive: g.isLive
                        });
                    });
                }
            } catch (e) {}

            // 2. NFL SCORES
            try {
                const nflData = await fetchJson('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
                if (nflData && nflData.events) {
                    const activeGames = nflData.events.filter((e: any) => e.status.type.state !== 'pre');
                    if (activeGames.length > 0) {
                        activeGames.forEach((e: any) => {
                            const h = e.competitions[0].competitors.find((c:any)=>c.homeAway==='home');
                            const a = e.competitions[0].competitors.find((c:any)=>c.homeAway==='away');
                            const isLive = e.status.type.state === 'in';
                            feed.push({
                                sport: 'NFL',
                                color: 'text-blue-400',
                                text: `${h.team.abbreviation} ${h.score} - ${a.team.abbreviation} ${a.score}`,
                                isLive: isLive
                            });
                        });
                    }
                }
            } catch (e) {}

            // 3. F1 LATEST
            try {
                const f1Res = await fetch('https://api.jolpi.ca/ergast/f1/current/last/results.json');
                const f1Data = await f1Res.json();
                const race = f1Data.MRData.RaceTable.Races[0];
                const winner = race.Results[0].Driver.familyName.toUpperCase();
                feed.push({
                    sport: 'F1',
                    color: 'text-red-500',
                    text: `${race.raceName.toUpperCase()} // ${winner}`,
                    isLive: false
                });
            } catch (e) {}

            setItems(feed);
            setLoading(false);
        };

        initFeed();
    }, []);

    if (loading || items.length === 0) return null;

    // Duplicate enough items to ensure smooth scrolling
    const loopItems = [...items, ...items, ...items, ...items, ...items, ...items];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-10 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 z-50 flex items-center">
            
            {/* STATIC LABEL */}
            <div className="h-full bg-white dark:bg-black px-4 flex items-center gap-3 font-mono text-[10px] font-bold tracking-widest uppercase z-20 border-r border-zinc-200 dark:border-zinc-800">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
                </span>
                <span className="text-black dark:text-white">LIVE WIRE</span>
            </div>

            {/* SCROLLING AREA */}
            <div className="flex-1 overflow-hidden h-full flex items-center">
                <div className="animate-ticker flex items-center">
                    {loopItems.map((item, i) => (
                        <div key={i} className="flex items-center whitespace-nowrap px-6 h-full">
                            <span className={`text-[10px] font-black mr-2 ${item.color}`}>
                                {item.sport}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 font-bold uppercase">
                                {item.text}
                            </span>
                            <span className="ml-6 text-zinc-300 dark:text-zinc-800">/</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}