'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Calendar, Trophy, Users, Loader2, TrendingUp, Flag } from 'lucide-react';
import { getLiveScores, getStandings, getLeagueLeaders } from './actions';
import GameTicker from './components/GameTicker';

export default function NBAHub() {
  const [scores, setScores] = useState<any[]>([]);
  const [standings, setStandings] = useState<any>({ east: [], west: [] });
  const [leaders, setLeaders] = useState<any[]>([]);
  const [activeConf, setActiveConf] = useState<'east' | 'west'>('east');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
        const [s, st, l] = await Promise.all([
            getLiveScores(),
            getStandings(),
            getLeagueLeaders()
        ]);
        setScores(s);
        setStandings(st);
        setLeaders(l);
        setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4 text-zinc-500 font-mono text-xs">
          <Loader2 className="animate-spin text-[#DFFF00]" size={32}/>
          ESTABLISHING 2025-26 UPLINK...
      </div>
  );

  return (
    <div className="min-h-screen bg-black pb-20">
      
      {/* 1. HERO HEADER */}
      <div className="pt-24 pb-8 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
              <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-[10px] font-bold tracking-widest uppercase mb-2">
                  <Activity size={14} /> BASKETBALL_OPERATIONS // 2025-26 SEASON
              </div>
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">
                  HARDWOOD <span className="text-zinc-800">OPS</span>
              </h1>
          </div>
          <div className="flex gap-4">
              <div className="text-right">
                  <div className="text-3xl font-black text-[#DFFF00]">{scores.length}</div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Active Games</div>
              </div>
          </div>
      </div>

      {/* 2. INTERACTIVE TICKER (NEW) */}
      <GameTicker scores={scores} />

      {/* 3. MAIN GRID */}
      <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: STANDINGS */}
          <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                      <Trophy size={20} className="text-[#DFFF00]"/> CONFERENCE STANDINGS
                  </h3>
                  <div className="flex gap-1 bg-zinc-900 p-1 rounded-sm">
                      <button onClick={() => setActiveConf('east')} className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${activeConf === 'east' ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}>EAST</button>
                      <button onClick={() => setActiveConf('west')} className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${activeConf === 'west' ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}>WEST</button>
                  </div>
              </div>

              <div className="overflow-x-auto border border-zinc-800 bg-zinc-900/20">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="bg-zinc-900/50 text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                              <th className="p-3 pl-4">Rank</th>
                              <th className="p-3">Team</th>
                              <th className="p-3 text-right">W</th>
                              <th className="p-3 text-right">L</th>
                              <th className="p-3 text-right">PCT</th>
                              <th className="p-3 text-right">GB</th>
                              <th className="p-3 text-right pr-4">STRK</th>
                          </tr>
                      </thead>
                      <tbody className="font-mono text-xs">
                          {standings[activeConf]?.length > 0 ? (
                              standings[activeConf].map((team: any) => (
                                  <tr key={team.id} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors group">
                                      <td className="p-3 pl-4 font-bold text-zinc-500 group-hover:text-white">{team.rank}</td>
                                      <td className="p-3">
                                          <Link href={`/sports/nba/team/${team.id}`} className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                                              <img src={team.logo} className="w-6 h-6 object-contain" />
                                              <span className="font-bold text-white uppercase">{team.name}</span>
                                          </Link>
                                      </td>
                                      <td className="p-3 text-right text-white font-bold">{team.w}</td>
                                      <td className="p-3 text-right text-zinc-400">{team.l}</td>
                                      <td className="p-3 text-right text-zinc-500">{team.pct}</td>
                                      <td className="p-3 text-right text-zinc-500">{team.gb}</td>
                                      <td className={`p-3 text-right pr-4 font-bold ${team.streak?.includes('W') ? 'text-green-500' : 'text-red-500'}`}>{team.streak}</td>
                                  </tr>
                              ))
                          ) : (
                              <tr><td colSpan={7} className="p-8 text-center text-zinc-500">STANDINGS DATA UNAVAILABLE FOR 2025-26</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* RIGHT: LEADERS & QUICK LINKS */}
          <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* LEAGUE LEADERS */}
              <div className="bg-zinc-900 border border-zinc-800 p-6">
                  <div className="flex items-center gap-2 mb-6 text-white pb-2 border-b border-zinc-800">
                      <Users size={16} className="text-[#DFFF00]"/>
                      <span className="text-xs font-black uppercase tracking-widest">2025-26 STAT LEADERS</span>
                  </div>
                  <div className="space-y-4">
                      {leaders.map((leader, i) => (
                          <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-black p-2 rounded-sm transition-colors border border-transparent hover:border-zinc-800">
                              <img src={leader.image} className="w-10 h-10 rounded-full bg-zinc-800 object-cover object-top border border-zinc-700" />
                              <div className="flex-1">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">{leader.category} LEADER</span>
                                  <span className="text-sm font-black text-white uppercase leading-none">{leader.player}</span>
                              </div>
                              <div className="text-xl font-black text-[#DFFF00] font-mono">{leader.value}</div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* QUICK NAV */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black border border-zinc-800 p-4 hover:border-[#DFFF00] transition-colors cursor-pointer group">
                      <Calendar size={24} className="text-zinc-600 group-hover:text-[#DFFF00] mb-2 transition-colors"/>
                      <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-white">FULL SCHEDULE</span>
                  </div>
                  <div className="bg-black border border-zinc-800 p-4 hover:border-[#DFFF00] transition-colors cursor-pointer group">
                      <Flag size={24} className="text-zinc-600 group-hover:text-[#DFFF00] mb-2 transition-colors"/>
                      <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-white">POWER RANKINGS</span>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
}