'use client';

import React, { useEffect, useState } from 'react';
// Updated import to use the new action
import { getLiveScores, LiveScore } from '../../actions'; 
import { Loader2 } from 'lucide-react';

export function LiveLeaderboard() {
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [tournamentName, setTournamentName] = useState("ESTABLISHING LINK...");
  const [status, setStatus] = useState("LIVE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLiveScores();
        setScores(data.scores);
        setTournamentName(data.tournamentName);
        setStatus(data.status);
      } catch (e) {
        console.error("Failed to fetch live scores", e);
      } finally {
        setLoading(false);
      }
    };
    
    // Poll every 60 seconds
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
      <div className="w-full h-12 bg-black border-y border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
          <Loader2 className="animate-spin" size={12} /> ESTABLISHING SATELLITE LINK...
      </div>
  );

  return (
    <div className="w-full bg-black border-y border-zinc-800 h-12 flex items-center overflow-hidden relative group">
       {/* DYNAMIC LABEL */}
       <div className="absolute left-0 top-0 bottom-0 bg-zinc-900 z-20 px-4 flex items-center gap-2 border-r border-zinc-800 max-w-[200px] shadow-xl">
          <div className={`w-2 h-2 rounded-full ${status === 'LIVE' ? 'bg-red-600 animate-pulse' : 'bg-zinc-500'}`}></div>
          <div className="flex flex-col justify-center min-w-0">
             <span className="text-[10px] font-black uppercase tracking-widest text-white truncate leading-none">{tournamentName}</span>
             <span className="text-[9px] font-mono text-[#DFFF00] uppercase leading-none mt-0.5">{status}</span>
          </div>
       </div>
       
       {/* SCROLLING TICKER */}
       {scores.length > 0 ? (
           <div className="flex animate-ticker whitespace-nowrap pl-48 hover:[animation-play-state:paused]">
              {[...scores, ...scores, ...scores].map((s, i) => (
                 <div key={i} className="inline-flex items-center gap-4 px-6 border-r border-zinc-900 text-xs font-mono">
                    <span className="text-zinc-500 font-bold">{s.position}</span>
                    <span className="text-white font-black uppercase">{s.player}</span>
                    <span className={`${s.score.includes('-') ? 'text-[#DFFF00]' : 'text-zinc-400'}`}>{s.score}</span>
                    <span className="text-zinc-600 text-[10px]">{s.thru === 'F' ? 'FINAL' : `THRU ${s.thru}`}</span>
                 </div>
              ))}
           </div>
       ) : (
           <div className="flex-1 flex items-center justify-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
               NO ACTIVE SCORING DATA AVAILABLE
           </div>
       )}
    </div>
  );
}