// app/sports/golf/components/Scorecard.tsx
'use client';

import React from 'react';

// Mock data generator for holes if real data isn't deep enough
const HOLES = Array.from({ length: 18 }, (_, i) => i + 1);

export default function Scorecard({ roundScores }: { roundScores?: string[] }) {
    // If no specific hole data, we simulate a visual representation or show totals
    // In a real deep integration, this would take an array of 18 scores.
    
    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[80px_1fr] border-b border-zinc-800">
                    <div className="p-3 bg-zinc-950 text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-center border-r border-zinc-800">
                        Hole
                    </div>
                    <div className="grid grid-cols-9 md:grid-cols-18">
                        {HOLES.map(h => (
                            <div key={h} className="p-3 text-center text-[10px] font-mono text-zinc-500 border-r border-zinc-800 last:border-0 bg-zinc-950">
                                {h}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Par Row (Simulated Standard Par 72) */}
                <div className="grid grid-cols-[80px_1fr] border-b border-zinc-800">
                    <div className="p-3 bg-zinc-900 text-[10px] font-mono text-zinc-400 uppercase flex items-center justify-center border-r border-zinc-800 font-bold">
                        Par
                    </div>
                    <div className="grid grid-cols-9 md:grid-cols-18">
                        {HOLES.map(h => (
                            <div key={h} className="p-3 text-center text-[10px] font-mono text-zinc-600 border-r border-zinc-800 last:border-0">
                                {h % 2 === 0 ? 4 : (h % 3 === 0 ? 5 : 3)} {/* Random Par Gen for visual */}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Score Row (Placeholder visualizer) */}
                <div className="grid grid-cols-[80px_1fr] bg-black/20">
                    <div className="p-3 text-[10px] font-mono text-[#DFFF00] uppercase flex items-center justify-center border-r border-zinc-800 font-bold">
                        Score
                    </div>
                    <div className="grid grid-cols-9 md:grid-cols-18">
                        {HOLES.map(h => {
                            // Simulating "Birdie", "Par", "Bogey" visualization styles
                            const style = h % 4 === 0 ? 'bg-red-900/20 text-red-500' : (h % 3 === 0 ? 'text-white' : 'text-zinc-500');
                            return (
                                <div key={h} className={`p-3 text-center text-xs font-mono font-bold border-r border-zinc-800 last:border-0 ${style}`}>
                                    -
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="mt-2 text-[9px] font-mono text-zinc-600 uppercase text-right">
                * Hole-by-hole data requires deeper API integration level
            </div>
        </div>
    );
}