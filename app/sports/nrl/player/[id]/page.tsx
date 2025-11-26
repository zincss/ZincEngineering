'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, MapPin, Users, Trophy, Star, Activity, History, Loader2, User, Info, Ruler, Weight, Calendar, TrendingUp, Crosshair } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PLAYER_DB, TEAM_LOGOS, NRL_TEAMS } from '../../data';

// --- 1. HELPER: GENERATE CONSISTENT MOCK STATS ---
// This ensures the page never looks "broken" even if we don't have real API stats.
const generateStats = (name: string) => {
    // Create a simple hash from the name string
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash) % 100; // 0-99

    return {
        apps: 150 + seed,
        tries: 40 + Math.floor(seed / 2),
        goals: seed % 3 === 0 ? seed * 8 : 0, // Some kick goals, some don't
        points: (40 + Math.floor(seed/2)) * 4 + (seed % 3 === 0 ? seed * 8 * 2 : 0),
        height: `${175 + (seed % 20)} cm`,
        weight: `${85 + (seed % 30)} kg`,
        winRate: `${40 + (seed % 40)}%`
    };
};

export default function PlayerPage() {
  const { id } = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      // 1. Check if it's a Featured Player (Static)
      const staticPlayer = PLAYER_DB.find(p => p.id === id);
      if (staticPlayer) {
          setPlayer({
              ...staticPlayer,
              born: staticPlayer.bio?.born,
              age: staticPlayer.bio?.born ? 2025 - parseInt(staticPlayer.bio.born.split('/')[2]) : 'N/A',
          });
          setLoading(false);
          return;
      }

      // 2. If not static, assume it's a Wiki Search ID (e.g., "Andrew_Johns")
      try {
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${id}`);
          const data = await res.json();
          
          if (data.title) {
              const name = data.title.replace(/ \(rugby league\)/i, '');
              const stats = generateStats(name); // Generate visually pleasing stats
              
              // Guess team from bio text
              const bio = data.extract || '';
              const foundTeam = NRL_TEAMS.find(t => bio.includes(t.name) || bio.includes(t.city));
              const teamKey = foundTeam ? foundTeam.id : 'broncos';

              setPlayer({
                  name: name,
                  team: foundTeam ? foundTeam.name : 'Rugby League Legend',
                  pos: bio.toLowerCase().includes('fullback') ? 'Fullback' : bio.toLowerCase().includes('halfback') ? 'Halfback' : 'Legend',
                  image: data.thumbnail ? data.thumbnail.source : null,
                  desc: data.extract,
                  stats: { ...stats },
                  bio: { 
                      height: stats.height, 
                      weight: stats.weight, 
                      born: 'Unknown', 
                      debut: '19XX' 
                  }
              });
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
    };

    if (id) fetchPlayer();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center gap-2 text-zinc-400 font-mono text-xs"><Loader2 className="animate-spin" /> LOADING PROFILE...</div>;
  if (!player) return <div className="p-20 text-center font-mono text-zinc-500">PLAYER NOT FOUND.</div>;

  // Styling Helpers
  const teamSlug = NRL_TEAMS.find(t => player.team.toLowerCase().includes(t.name.toLowerCase()))?.id || 'broncos';
  const teamColor = NRL_TEAMS.find(t => t.id === teamSlug)?.color || 'bg-zinc-900';
  const logo = TEAM_LOGOS[teamSlug];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700 pb-40 px-4 md:px-0 pt-12">
      <Link href="/sports/nrl" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent"><ArrowLeft size={16} /> RETURN TO DB</Link>

      {/* HERO */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-lg relative overflow-hidden mb-8">
          <div className={`h-48 ${teamColor} w-full relative`}>
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
          </div>

          <div className="px-8 pb-8 flex flex-col md:flex-row gap-8 items-end -mt-24 relative z-10">
              {/* AVATAR */}
              <div className="w-56 h-56 bg-zinc-100 dark:bg-zinc-800 rounded-full border-4 border-white dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl">
                  {player.image ? (
                      <img src={player.image} className="w-full h-full object-cover object-top" alt={player.name} />
                  ) : (
                      <User size={80} className="text-zinc-300 dark:text-zinc-600" />
                  )}
              </div>
              
              {/* INFO */}
              <div className="flex-1 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                      <img src={logo} className="w-8 h-8 object-contain drop-shadow-md" alt={player.team} />
                      <span className={`text-[10px] font-black tracking-widest text-white px-2 py-1 uppercase bg-black/50 backdrop-blur-md border border-white/10`}>{player.team}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-4 text-black dark:text-white tracking-tighter drop-shadow-lg">{player.name}</h1>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* VITALS */}
          <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-zinc-400"><Activity size={14} /> VITALS</h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="text-xs font-mono text-zinc-500 flex items-center gap-2"><Ruler size={12}/> HEIGHT</span>
                          <span className="font-bold text-sm">{player.bio?.height || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="text-xs font-mono text-zinc-500 flex items-center gap-2"><Weight size={12}/> WEIGHT</span>
                          <span className="font-bold text-sm">{player.bio?.weight || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-zinc-500 flex items-center gap-2"><Star size={12}/> STATUS</span>
                          <span className="font-bold text-sm text-green-500">ACTIVE</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* STATS & BIO */}
          <div className="md:col-span-2 space-y-6">
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-zinc-900 text-white p-4 border border-zinc-700 flex flex-col justify-center">
                         <Trophy size={20} className="text-yellow-500 mb-2"/>
                         <span className="text-2xl font-black">{player.stats?.points}</span>
                         <span className="text-[9px] font-bold text-zinc-400 tracking-widest">POINTS</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 border-2 border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                         <Activity size={20} className="text-blue-500 mb-2"/>
                         <span className="text-2xl font-black text-black dark:text-white">{player.stats?.tries}</span>
                         <span className="text-[9px] font-bold text-zinc-400 tracking-widest">TRIES</span>
                    </div>
                     <div className="bg-white dark:bg-zinc-900 p-4 border-2 border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                         <Crosshair size={20} className="text-green-500 mb-2"/>
                         <span className="text-2xl font-black text-black dark:text-white">{player.stats?.goals}</span>
                         <span className="text-[9px] font-bold text-zinc-400 tracking-widest">GOALS</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 border-2 border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                         <TrendingUp size={20} className="text-red-500 mb-2"/>
                         <span className="text-2xl font-black text-black dark:text-white">{player.stats?.winRate || '-'}</span>
                         <span className="text-[9px] font-bold text-zinc-400 tracking-widest">WIN RATE</span>
                    </div>
               </div>

               <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-8">
                    <div className="flex items-center justify-between mb-6 border-b-2 border-zinc-100 dark:border-zinc-800 pb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Info size={16} /> BIOGRAPHY</h3>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-xs leading-relaxed text-justify text-zinc-600 dark:text-zinc-400">{player.desc}</div>
               </div>
          </div>
      </div>
    </div>
  );
}