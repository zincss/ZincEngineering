'use client';

import React, { useEffect, useState } from 'react';
// FIX: Import from the parent directory since this file is in lib/components
import { getLiveScores, LiveScore } from '../golf-api';
import { Loader2 } from 'lucide-react';

export function LiveLeaderboard() {
  const [scores, setScores] = useState<LiveScore[]>([]);
  // NEW: State for the dynamic tournament header
  const [tournamentName, setTournamentName] = useState("ESTABLISHING LINK...");
  const [status, setStatus] = useState("LIVE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // The API now returns { tournamentName, status, scores }
        const data = await getLiveScores();
        
        // FIX: Extract only the scores array for the scores state
        setScores(data.scores);
        
        // Set the other new details
        setTournamentName(data.tournamentName);
        setStatus(data.status);
      } catch (e) {
        console.error("Failed to fetch live scores", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
      <div className="w-full h-12 bg-black border-y border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
          <Loader2 className="animate-spin" size={12} /> ESTABLISHING SATELLITE LINK...
      </div>
  );

  return (
    <div className="w-full bg-black border-y border-zinc-800 h-12 flex items-center overflow-hidden relative group">
       {/* DYNAMIC LABEL */}
       <div className="absolute left-0 top-0 bottom-0 bg-zinc-900 z-20 px-4 flex items-center gap-2 border-r border-zinc-800 max-w-[200px]">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          <div className="flex flex-col justify-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-white truncate leading-none">{tournamentName}</span>
             <span className="text-[9px] font-mono text-[#DFFF00] uppercase leading-none mt-0.5">{status}</span>
          </div>
       </div>
       
       {/* SCROLLING TICKER */}
       <div className="flex animate-ticker whitespace-nowrap pl-48">
          {[...scores, ...scores, ...scores].map((s, i) => (
             <div key={i} className="inline-flex items-center gap-4 px-6 border-r border-zinc-900 text-xs font-mono">
                <span className="text-zinc-500 font-bold">{s.position}</span>
                <span className="text-white font-black uppercase">{s.player}</span>
                <span className={`${s.score.includes('-') ? 'text-[#DFFF00]' : 'text-zinc-400'}`}>{s.score}</span>
                <span className="text-zinc-600 text-[10px]">{s.thru === 'F' ? 'FINAL' : `THRU ${s.thru}`}</span>
             </div>
          ))}
       </div>
    </div>
  );
}