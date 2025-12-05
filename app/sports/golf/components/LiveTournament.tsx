'use client';

import React from 'react';
import { Trophy, MapPin, Activity, Calendar, Flag, Hash, User, Crown } from 'lucide-react';

export default function LiveTournament({ data }: { data: any }) {
  if (!data) return null;

  const isLive = data.status === 'in';
  const isPost = data.status === 'post';
  const isPre = data.status === 'pre';
  
  const leader = data.leaderboard?.[0];
  const featured = isPre && data.defendingChamp ? data.defendingChamp : leader;
  
  // Dynamic Labels based on state
  let featuredRank = `LEADER // ${leader?.position || 'P1'}`;
  let featuredScore = leader?.toPar;
  let statusLabel = 'LIVE BROADCAST';

  if (isPost) {
      featuredRank = 'TOURNAMENT WINNER';
      featuredScore = 'CHAMPION';
      statusLabel = 'TOURNAMENT COMPLETE';
  } else if (isPre) {
      featuredRank = 'DEFENDING CHAMPION';
      featuredScore = 'PREVIOUS';
      statusLabel = 'UPCOMING EVENT';
  }

  const tickerItems = data.leaderboard && data.leaderboard.length > 0 
    ? [...data.leaderboard, ...data.leaderboard, ...data.leaderboard] 
    : [];

  return (
    <div className="relative w-full h-full bg-black border border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
        
        {/* --- 1. TOP TICKER --- */}
        <div className="h-14 bg-black/80 border-b border-zinc-800 flex items-center overflow-hidden relative z-30 shrink-0 backdrop-blur-md">
            <div className="bg-[#DFFF00] h-full px-5 flex items-center justify-center z-20 shrink-0 shadow-[0_0_30px_rgba(223,255,0,0.15)]">
                <Hash size={18} className="text-black"/>
            </div>
            
            {tickerItems.length > 0 ? (
                <div className="flex animate-ticker hover:[animation-play-state:paused] items-center h-full">
                    {tickerItems.map((p: any, i: number) => (
                        <div key={`${p.id}-${i}`} className="flex items-center gap-4 px-8 border-r border-zinc-800/50 h-full shrink-0">
                            <span className={`font-mono font-black text-sm ${p.position === '1' ? 'text-[#DFFF00]' : 'text-zinc-500'}`}>
                                {p.position}
                            </span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                                {p.name}
                            </span>
                            <span className={`text-xs font-mono font-bold ${p.toPar.includes('-') ? 'text-[#DFFF00]' : 'text-white'}`}>
                                {p.toPar}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="px-6 text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12} className="animate-pulse"/> WAITING FOR DATA...
                </div>
            )}
        </div>

        {/* --- 2. MAIN HERO BODY --- */}
        <div className="flex-1 relative flex flex-col md:flex-row items-center justify-center p-8 md:p-12 gap-12 overflow-hidden">
            
            {/* VIDEO BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover grayscale opacity-60"
                >
                    <source src="/golf.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Ambient Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[180px] opacity-20 pointer-events-none z-0 ${isLive ? 'bg-[#DFFF00]' : 'bg-emerald-500'}`} />

            {/* LEFT: INTEL */}
            <div className="flex-1 text-center md:text-left z-20 space-y-10 animate-in slide-in-from-left-8 duration-1000 ease-out">
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700/50 bg-black/60 backdrop-blur-md text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300 shadow-lg">
                    {isLive ? <Activity size={12} className="text-[#DFFF00] animate-pulse"/> : <Calendar size={12}/>}
                    <span>{statusLabel}</span>
                </div>
                
                <div>
                    <h2 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                        {data.name}
                    </h2>
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mt-8 text-zinc-200 font-mono text-xs uppercase tracking-widest text-shadow-sm font-bold">
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-[#DFFF00]"/> {data.location}</span>
                        <span className="hidden md:inline w-px h-3 bg-zinc-500"></span>
                        <span className="flex items-center gap-2"><Flag size={14}/> {data.venue}</span>
                        <span className="hidden md:inline w-px h-3 bg-zinc-500"></span>
                        <span className="flex items-center gap-2"><Calendar size={14}/> {data.date}</span>
                    </div>
                </div>

                {data.purse && (
                    <div className="inline-flex items-center gap-4 border-l-2 border-[#DFFF00] pl-6 py-2 bg-black/40 backdrop-blur-sm pr-6 rounded-r-md">
                        <div>
                            <span className="text-[9px] text-zinc-400 uppercase block mb-1 font-bold tracking-wider">PRIZE POOL</span>
                            <span className="text-2xl font-mono font-black text-white flex items-center gap-2">
                                {data.purse}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: PLAYER CARD */}
            <div className="relative z-20 w-full max-w-[420px] animate-in slide-in-from-right-8 duration-1000 delay-100">
                <div className="border border-zinc-800 bg-black rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] group relative">
                    
                    <div className="absolute top-0 left-0 w-full p-6 z-30 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-[#DFFF00] uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                                {isPre ? <Crown size={12}/> : <Flag size={12}/>} {featuredRank}
                            </span>
                            <h3 className="text-3xl font-black text-white uppercase leading-none tracking-tight shadow-black drop-shadow-md">
                                {featured?.name}
                            </h3>
                        </div>
                        {featured?.country && (
                            <img src={featured.country} className="h-4 w-auto opacity-80 drop-shadow-md" alt="Flag" />
                        )}
                    </div>

                    <div className="h-[500px] relative flex items-end justify-center overflow-hidden bg-zinc-900">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
                        
                        {/* Player Image */}
                        {featured?.headshot ? (
                            <img 
                                src={featured.headshot} 
                                alt={featured.name} 
                                className="h-[110%] w-auto object-cover object-top relative z-10 drop-shadow-2xl grayscale-[0.3] contrast-[1.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out"
                            />
                        ) : (
                            <User size={200} className="text-zinc-800 mb-20 opacity-50 relative z-10"/>
                        )}
                        
                        {/* Gradient Masks */}
                        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black via-black/90 to-transparent z-20"></div>
                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20 opacity-80"></div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-6 z-30">
                        <div className="flex justify-between items-end border-t border-white/10 pt-4">
                            <div>
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                                    Current Status
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#DFFF00] animate-pulse' : 'bg-zinc-500'}`}></span>
                                    <span className="text-xs font-bold text-zinc-300 uppercase">
                                        {isLive ? 'On Course' : isPost ? 'Finished' : 'Waiting'}
                                    </span>
                                </div>
                            </div>
                            <span className="text-6xl font-mono font-black text-white tracking-tighter leading-none">
                                {featuredScore}
                            </span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
  );
}