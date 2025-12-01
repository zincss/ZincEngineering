'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Calendar, Trophy, Users, Loader2, Search, LayoutGrid, Flag } from 'lucide-react';
import { getLiveScores, getStandings, getLeagueLeaders, getAllTeams, searchPlayers } from './actions';
import GameTicker from './components/GameTicker';

export default function NBAHub() {
  const router = useRouter();
  const [scores, setScores] = useState<any[]>([]);
  const [standings, setStandings] = useState<any>({ east: [], west: [] });
  const [leaders, setLeaders] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  
  const [activeConf, setActiveConf] = useState<'east' | 'west'>('east');
  const [loading, setLoading] = useState(true);
  const [playerSearch, setPlayerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
        try {
            // Parallel fetch for maximum speed
            const [s, st, l, t] = await Promise.all([
                getLiveScores(),
                getStandings(),
                getLeagueLeaders(),
                getAllTeams()
            ]);
            setScores(s || []);
            setStandings(st || { east: [], west: [] });
            setLeaders(l || []);
            setAllTeams(t || []);
        } catch (e) {
            console.error("NBA Init Failed", e);
        } finally {
            setLoading(false);
        }
    };
    init();
  }, []);

  // Live Player Search
  useEffect(() => {
      const runSearch = async () => {
          if (playerSearch.length > 2) {
              const res = await searchPlayers(playerSearch);
              setSearchResults(res);
          } else {
              setSearchResults([]);
          }
      };
      const debounce = setTimeout(runSearch, 300);
      return () => clearTimeout(debounce);
  }, [playerSearch]);

  if (loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4 text-zinc-500 font-mono text-xs">
          <Loader2 className="animate-spin text-[#DFFF00]" size={32}/>
          ESTABLISHING SECURE UPLINK...
      </div>
  );

  return (
    <div className="min-h-screen bg-black pb-20">
      
      {/* HERO HEADER */}
      <div className="pt-24 pb-8 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
              <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-[10px] font-bold tracking-widest uppercase mb-2">
                  <Activity size={14} /> BASKETBALL_OPERATIONS // 2025-26
              </div>
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">
                  HARDWOOD <span className="text-zinc-800">OPS</span>
              </h1>
          </div>
          
          {/* SEARCH BAR */}
          <div className="w-full md:w-auto relative group z-30">
              <input 
                type="text" 
                placeholder="SEARCH PLAYER DATABASE..." 
                className="bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-xs font-mono text-white outline-none focus:border-[#DFFF00] w-full md:w-72 transition-colors uppercase"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#DFFF00] transition-colors"/>
              
              {/* Search Dropdown */}
              {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-black border border-zinc-800 mt-1 shadow-2xl">
                      {searchResults.map(p => (
                          <Link href={p.url} key={p.id} className="flex items-center gap-3 p-3 hover:bg-zinc-900 transition-colors border-b border-zinc-900 last:border-0">
                              <img src={p.image} className="w-8 h-8 rounded-full bg-zinc-800 object-cover object-top" />
                              <div>
                                  <div className="text-xs font-bold text-white uppercase">{p.name}</div>
                                  <div className="text-[9px] text-zinc-500 font-mono">{p.team}</div>
                              </div>
                          </Link>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* TICKER */}
      <GameTicker scores={scores} />

      {/* MAIN CONTENT */}
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
                          {standings[activeConf]?.length > 0 ? standings[activeConf].map((team: any) => (
                              <tr key={team.id} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors group">
                                  <td className="p-3 pl-4 font-bold text-zinc-500 group-hover:text-white">{team.rank}</td>
                                  <td className="p-3">
                                      <Link href={`/sports/nba/team/${team.id}`} className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                                          <img src={team.logo} className="w-6 h-6 object-contain" alt={team.name} />
                                          <span className="font-bold text-white uppercase">{team.name}</span>
                                      </Link>
                                  </td>
                                  <td className="p-3 text-right text-white font-bold">{team.w}</td>
                                  <td className="p-3 text-right text-zinc-400">{team.l}</td>
                                  <td className="p-3 text-right text-zinc-500">{team.pct}</td>
                                  <td className="p-3 text-right text-zinc-500">{team.gb}</td>
                                  <td className={`p-3 text-right pr-4 font-bold ${team.streak?.includes('W') ? 'text-green-500' : 'text-red-500'}`}>{team.streak}</td>
                              </tr>
                          )) : (
                              <tr><td colSpan={7} className="p-8 text-center text-zinc-500 font-mono text-xs">OFF SEASON MODE / DATA UNAVAILABLE</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* RIGHT: LEADERS & NAV */}
          <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* LEAGUE LEADERS */}
              <div className="bg-zinc-900 border border-zinc-800 p-6">
                  <div className="flex items-center gap-2 mb-6 text-white pb-2 border-b border-zinc-800">
                      <Users size={16} className="text-[#DFFF00]"/>
                      <span className="text-xs font-black uppercase tracking-widest">TODAY'S STAT LEADERS</span>
                  </div>
                  <div className="space-y-4">
                      {leaders.length > 0 ? leaders.map((leader, i) => (
                          <div key={i} className="flex items-center gap-4 bg-black border border-zinc-800 p-3 hover:border-[#DFFF00] transition-colors group cursor-pointer">
                              <img src={leader.image} className="w-12 h-12 rounded-full bg-zinc-800 object-cover object-top border border-zinc-700" alt={leader.player}/>
                              <div className="flex-1">
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">{leader.category} LEADER</span>
                                  <span className="text-sm font-black text-white uppercase leading-none">{leader.player}</span>
                                  <span className="text-[9px] font-mono text-zinc-600 block mt-0.5">{leader.team}</span>
                              </div>
                              <div className="text-xl font-black text-[#DFFF00] font-mono">{leader.value}</div>
                          </div>
                      )) : (
                          <div className="text-center py-8 text-zinc-500 font-mono text-xs">LEADER DATA SYNCING...</div>
                      )}
                  </div>
              </div>

              {/* QUICK LINKS */}
              <div className="grid grid-cols-1 gap-4">
                  <Link href="#teams" className="bg-black border border-zinc-800 p-4 hover:border-[#DFFF00] transition-colors cursor-pointer group flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <LayoutGrid size={24} className="text-zinc-500 group-hover:text-[#DFFF00]"/>
                          <div>
                              <div className="text-xs font-black uppercase text-white">TEAMS DIRECTORY</div>
                              <div className="text-[9px] text-zinc-500 font-mono">{allTeams.length} FRANCHISES ACTIVE</div>
                          </div>
                      </div>
                  </Link>
              </div>

          </div>
      </div>

      {/* TEAMS DIRECTORY */}
      <div id="teams" className="max-w-[1600px] mx-auto px-6 py-12 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-8">
              <LayoutGrid size={20} className="text-[#DFFF00]"/>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">FRANCHISE DATABASE</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allTeams.map((team) => (
                  <Link key={team.id} href={`/sports/nba/team/${team.id}`} className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border border-zinc-800 hover:border-[#DFFF00] hover:bg-black transition-all group">
                      <img src={team.logo} className="w-16 h-16 object-contain mb-4 group-hover:scale-110 transition-transform" alt={team.name} />
                      <span className="text-xs font-black text-center text-zinc-400 group-hover:text-white uppercase leading-tight">{team.name}</span>
                  </Link>
              ))}
          </div>
      </div>

    </div>
  );
}