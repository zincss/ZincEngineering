'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, MapPin, Users, Trophy, Star, Activity, History, Loader2, User, Info, Ruler, Weight, Calendar, TrendingUp, Crosshair } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { NBA_TEAMS, NBA_LOGOS, NBA_PLAYER_DB } from '../../data';

// --- HELPER: GENERATE MOCK STATS (For Legends/Wiki searches) ---
const generateStats = (name: string) => {
    const seed = name.length;
    return {
        ppg: (20 + (seed % 10)).toFixed(1),
        rpg: (4 + (seed % 8)).toFixed(1),
        apg: (3 + (seed % 7)).toFixed(1),
        height: `6'${seed % 9}"`,
        weight: `${180 + seed * 5} lbs`
    };
};

export default function PlayerPage() {
  const { id } = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      // 1. Check Static DB
      const staticPlayer = NBA_PLAYER_DB.find(p => p.id === id);
      if (staticPlayer) {
          setPlayer({
              ...staticPlayer,
              born: 'Unknown',
              debut: '20XX',
              desc: `${staticPlayer.name} is a key player for the ${staticPlayer.team.toUpperCase()}. Known for elite performance in the 2024-25 season.`
          });
          setLoading(false);
          return;
      }

      // 2. API Search (TheSportsDB + Wiki Fallback)
      try {
          let pData = null;
          
          // Try TheSportsDB by ID
          const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookupplayer.php?id=${id}`);
          const data = await res.json();
          
          if (data.players && data.players[0]) {
              const p = data.players[0];
              const stats = generateStats(p.strPlayer); // Enrich with mock stats

              pData = {
                  name: p.strPlayer,
                  team: p.strTeam || 'Free Agent',
                  pos: p.strPosition,
                  image: p.strThumb || p.strCutout,
                  desc: p.strDescriptionEN,
                  born: p.strBirthLocation,
                  height: p.strHeight,
                  weight: p.strWeight,
                  ...stats
              };
          } 
          
          // 3. Wiki Enricher (if API failed or missing image/desc)
          if (!pData || !pData.image || !pData.desc) {
               // If we have a name from API, use it. If not, assume ID is a Wiki Search string
               const searchTerm = pData ? pData.name : id;
               const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm as string)}`);
               const wikiData = await wikiRes.json();

               if (wikiData.title) {
                   const name = wikiData.title.replace(/ \(basketball\)/i, '');
                   const stats = generateStats(name);
                   
                   pData = {
                       ...(pData || {}), 
                       name: name,
                       team: pData?.team || 'NBA Legend',
                       pos: pData?.pos || 'Player',
                       image: pData?.image || (wikiData.thumbnail ? wikiData.thumbnail.source : null),
                       desc: pData?.desc || wikiData.extract,
                       born: pData?.born || 'Unknown',
                       height: pData?.height || stats.height,
                       weight: pData?.weight || stats.weight,
                       ppg: pData?.ppg || stats.ppg,
                       rpg: pData?.rpg || stats.rpg,
                       apg: pData?.apg || stats.apg
                   };
               }
          }

          if (pData) setPlayer(pData);

      } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    if (id) fetchPlayer();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center gap-2 text-zinc-400 font-mono text-xs"><Loader2 className="animate-spin" /> LOADING PROFILE...</div>;
  if (!player) return <div className="p-20 text-center font-mono text-zinc-500">PLAYER NOT FOUND.</div>;

  // Resolve Team Logo
  const teamObj = NBA_TEAMS.find((t: any) => player.team.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(player.team.toLowerCase())) || NBA_TEAMS[0];
  const logo = NBA_LOGOS[teamObj.id];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700 pb-40 px-4 md:px-0 pt-12">
      <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent"><ArrowLeft size={16} /> RETURN TO DB</Link>

      {/* HERO */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-lg relative overflow-hidden mb-8">
          <div className={`h-48 ${teamObj.color} w-full relative`}>
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
          </div>

          <div className="px-8 pb-8 flex flex-col md:flex-row gap-8 items-end -mt-24 relative z-10">
              <div className="w-56 h-56 bg-zinc-100 dark:bg-zinc-800 rounded-full border-4 border-white dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl">
                  {player.image ? (
                      <img src={player.image} className="w-full h-full object-cover object-top" alt={player.name} />
                  ) : (
                      <User size={80} className="text-zinc-300 dark:text-zinc-600" />
                  )}
              </div>
              
              <div className="flex-1 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                      <img src={logo} className="w-8 h-8 object-contain drop-shadow-md" alt={player.team} />
                      <span className={`text-[10px] font-black tracking-widest text-white px-2 py-1 uppercase bg-black/50 backdrop-blur-md border border-white/10`}>{teamObj.name}</span>
                      <span className="text-[10px] font-bold text-zinc-900 bg-white px-2 py-1 uppercase border border-zinc-200">{player.pos}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-4 text-black dark:text-white tracking-tighter drop-shadow-lg">{player.name}</h1>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-zinc-400"><Activity size={14} /> VITALS</h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2"><span className="text-xs font-mono text-zinc-500">HEIGHT</span><span className="font-bold text-sm">{player.height}</span></div>
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2"><span className="text-xs font-mono text-zinc-500">WEIGHT</span><span className="font-bold text-sm">{player.weight}</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs font-mono text-zinc-500">BORN</span><span className="font-bold text-sm">{player.born}</span></div>
                  </div>
              </div>
          </div>

          <div className="md:col-span-2 space-y-6">
               <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-900 text-white p-4 border border-zinc-700 flex flex-col justify-center text-center">
                         <span className="text-3xl font-black">{player.ppg}</span>
                         <span className="text-[9px] font-bold text-zinc-400 tracking-widest">PPG</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 border-2 border-zinc-200 dark:border-zinc-800 flex flex-col justify-center text-center">
                         <span className="text-3xl font-black text-black dark:text-white">{player.rpg}</span>
                         <span className="text-[9px] font-bold text-zinc-400 tracking-widest">RPG</span>
                    </div>
                     <div className="bg-white dark:bg-zinc-900 p-4 border-2 border-zinc-200 dark:border-zinc-800 flex flex-col justify-center text-center">
                         <span className="text-3xl font-black text-black dark:text-white">{player.apg}</span>
                         <span className="text-[9px] font-bold text-zinc-400 tracking-widest">APG</span>
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