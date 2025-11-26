'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Info, Loader2, Calendar, Ruler, Weight, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPlayerProfile, searchPlayers } from '../../actions'; 
import { NBA_TEAMS } from '../../data';

export default function PlayerPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
          // 1. Direct Fetch
          let profile = await getPlayerProfile(id as string);

          // 2. Smart Fallback: If ID is a name, search it
          if (!profile && isNaN(Number(id))) {
              const name = (id as string).replace(/_/g, ' ');
              const results = await searchPlayers(name);
              if (results.length > 0) {
                  profile = await getPlayerProfile(results[0].id);
              }
          }

          if (profile) {
              setData(profile);
          } else {
              setError(true);
          }
      } catch (e) {
          setError(true);
      } finally {
          setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center gap-2 font-mono text-xs"><Loader2 className="animate-spin"/> LOADING PLAYER ASSETS...</div>;
  
  if (error || !data) return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-500 font-mono">
          <User size={48} className="text-zinc-300" />
          <div className="text-xl font-black text-black dark:text-white">PROFILE NOT FOUND</div>
          <p className="text-xs">UNABLE TO LOCATE PLAYER RECORD.</p>
          <Link href="/sports/nba" className="px-6 py-3 bg-black text-white text-xs font-bold tracking-widest hover:bg-zinc-800">RETURN TO DATABASE</Link>
      </div>
  );

  const teamConfig = NBA_TEAMS.find(t => t.name.toLowerCase().includes(data.team.toLowerCase()));
  const teamColor = teamConfig ? teamConfig.color : 'bg-zinc-900';

  return (
    <div className="max-w-5xl mx-auto pb-40 px-4 md:px-0 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/sports/nba" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white mb-8 font-mono font-bold text-xs uppercase tracking-widest"><ArrowLeft size={14} /> PLAYER SEARCH</Link>

      {/* PROFILE HEADER */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-lg mb-12 overflow-hidden relative">
          <div className={`h-32 ${teamColor} w-full opacity-90 relative`}>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          </div>
          
          <div className="px-8 pb-8 flex flex-col md:flex-row gap-8 items-end -mt-16 relative z-10">
              <div className="w-48 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-full border-4 border-white dark:border-zinc-900 shadow-2xl overflow-hidden shrink-0">
                  <img src={data.headshot} className="w-full h-full object-cover object-top" alt={data.name} onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
              <div className="flex-1 mb-2">
                  <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black bg-black text-white px-2 py-1 uppercase tracking-widest">{data.team}</span>
                      <span className="text-[10px] font-bold border border-zinc-300 dark:border-zinc-600 px-2 py-1 uppercase text-zinc-500">#{data.jersey} • {data.pos}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter text-black dark:text-white">{data.name}</h1>
              </div>
          </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
              { label: 'PTS', value: data.stats.ppg },
              { label: 'REB', value: data.stats.rpg },
              { label: 'AST', value: data.stats.apg },
              { label: 'PER', value: data.stats.per }
          ].map((stat) => (
              <div key={stat.label} className="bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 p-6 text-center hover:border-black dark:hover:border-white transition-colors">
                  <div className="text-4xl font-black text-black dark:text-white mb-1">{stat.value}</div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</div>
              </div>
          ))}
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-8">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-black dark:text-white"><Info size={14}/> PLAYER DATA</h3>
              <div className="space-y-4 font-mono text-sm text-zinc-600 dark:text-zinc-300">
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-zinc-500 flex items-center gap-2"><Ruler size={12}/> HEIGHT</span>
                      <span className="font-bold text-black dark:text-white">{data.height}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-zinc-500 flex items-center gap-2"><Weight size={12}/> WEIGHT</span>
                      <span className="font-bold text-black dark:text-white">{data.weight}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-zinc-500 flex items-center gap-2"><Calendar size={12}/> BORN</span>
                      <span className="font-bold text-black dark:text-white">{data.dob}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-zinc-500 flex items-center gap-2"><Activity size={12}/> EXPERIENCE</span>
                      <span className="font-bold text-black dark:text-white">{data.exp} Years</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}