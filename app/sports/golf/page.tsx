import React from 'react';
import { Calendar, Globe, Trophy, Wind, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { getGolfHubData } from './actions';
import GolfHero from './components/GolfHero';
import LiveScoreTicker from './components/LiveScoreTicker';
import OWGRCards from './components/OWGRCards';

export const dynamic = 'force-dynamic';

export default async function GolfHub() {
  const data = await getGolfHubData();

  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-500">GOLF UPLINK FAILED</div>;

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20">
      
      <BackButton href="/sports" />
      
      {/* 1. HERO SECTION */}
      <div className="pt-20">
          <GolfHero event={data.event} />
      </div>

      {/* 2. LIVE TICKER */}
      <LiveScoreTicker data={data.event.leaderboard} status={data.event.status} />

      {/* 3. MAIN DASHBOARD GRID */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
          
          {/* TOP ROW: SEASON HIGHLIGHTS (Redesigned: Portrait Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {data.seasonStats.map((stat: any, i: number) => (
                  <div key={i} className="group relative h-96 rounded-[2rem] bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-[#DFFF00] transition-all duration-500 flex flex-col shadow-2xl">
                      
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/30 via-zinc-900/50 to-black z-0"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#DFFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>

                      {/* Top Label Badge */}
                      <div className="relative z-20 p-6 flex justify-between items-start">
                          <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-full px-4 py-2 shadow-lg group-hover:border-[#DFFF00]/50 transition-colors">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-[#DFFF00]">
                                  {i === 0 ? <Trophy size={12} /> : <Activity size={12} />}
                                  {stat.label}
                              </span>
                          </div>
                          {/* Trend indicator */}
                          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#DFFF00] group-hover:bg-[#DFFF00] group-hover:text-black transition-colors">
                              <ArrowUpRight size={14} />
                          </div>
                      </div>

                      {/* PLAYER IMAGE (Main Element) */}
                      <div className="absolute inset-x-0 bottom-24 top-16 z-10 flex items-end justify-center">
                          {stat.image ? (
                              // Using object-contain and centering to make the player 'pop'
                              <img 
                                  src={stat.image} 
                                  alt={stat.value} 
                                  className="h-[120%] w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] transform translate-y-4 group-hover:translate-y-2 group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform" 
                              />
                          ) : (
                              <Trophy size={100} className="text-zinc-800 mb-8 opacity-50" />
                          )}
                      </div>

                      {/* Bottom Info Container (Forms around the player base) */}
                      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                          <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] group-hover:border-zinc-700 transition-colors">
                              <div className="flex flex-col gap-1">
                                  {/* Player Name */}
                                  <div className="text-sm font-bold text-zinc-500 uppercase tracking-wide mb-1">
                                      {stat.value}
                                  </div>
                                  
                                  {/* Big Stat Value */}
                                  <div className="flex items-baseline justify-between">
                                      <span className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-[#DFFF00] transition-colors">
                                          {stat.sub}
                                      </span>
                                      
                                      {/* Rank/Trend Pill */}
                                      <span className="text-[10px] font-black bg-[#DFFF00] text-black px-2 py-1 rounded-md uppercase tracking-widest">
                                          {stat.trend}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>

                  </div>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* LEFT COL: RANKINGS & SCHEDULE (7 Cols) */}
              <div className="lg:col-span-7 space-y-12">
                  <OWGRCards rankings={data.rankings} />
                  
                  {/* SCHEDULE MODULE */}
                  <div className="border border-zinc-800 bg-zinc-900/30 rounded-2xl overflow-hidden">
                      <div className="p-6 border-b border-zinc-800 flex items-center gap-2 bg-zinc-950">
                          <Calendar size={16} className="text-[#DFFF00]" />
                          <span className="font-black text-xs text-white uppercase tracking-widest">UPCOMING OPERATIONS</span>
                      </div>
                      <div className="divide-y divide-zinc-800">
                          {data.schedule.map((evt: any, i: number) => (
                              <div key={i} className="p-5 hover:bg-zinc-900 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex items-start gap-5">
                                      <div className="flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 w-14 h-14 rounded-xl shrink-0 group-hover:border-[#DFFF00] transition-colors">
                                          <span className="text-[10px] font-mono text-zinc-500 uppercase">{evt.date.split(' ')[0]}</span>
                                          <span className="text-sm font-black text-white">{evt.date.split(' ')[1]}</span>
                                      </div>
                                      <div className="flex flex-col justify-center h-14">
                                          <div className="font-black text-sm text-white uppercase group-hover:text-[#DFFF00] transition-colors">{evt.name}</div>
                                          <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">{evt.course}</div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <span className="text-[9px] font-mono text-zinc-600 uppercase block mb-1">Defending Champion</span>
                                      <span className="text-xs font-bold text-zinc-400 uppercase bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                                          {evt.def}
                                      </span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* RIGHT COL: VISUALS (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                  
                  {/* FEDEX CUP PROMO */}
                  <div className="relative h-[450px] border border-zinc-800 bg-zinc-900 overflow-hidden group rounded-3xl">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628779238951-be2c9f2a59f4?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 p-8 w-full">
                          <div className="flex items-center gap-2 mb-4">
                              <span className="px-3 py-1 bg-[#DFFF00] text-black text-[10px] font-black uppercase tracking-widest rounded-full">CHAMPION</span>
                              <span className="text-zinc-400 font-mono text-xs bg-black/50 px-2 py-1 rounded-full border border-zinc-700">2025 SEASON</span>
                          </div>
                          <h3 className="text-5xl font-black text-white uppercase leading-[0.9] mb-4">
                              TOMMY<br/>FLEETWOOD
                          </h3>
                          <p className="text-zinc-400 text-xs font-mono max-w-xs leading-relaxed">
                              Claimed the FedEx Cup title after a stunning performance at East Lake, securing his legacy in the archives.
                          </p>
                      </div>
                  </div>

                  {/* WEATHER / COURSE CONDITIONS (MOCK) */}
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex items-center justify-between group hover:border-zinc-700 transition-colors">
                      <div>
                          {/* FIXED: Removed 'block' to resolve conflict with 'flex' */}
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Activity size={12} className="text-[#DFFF00] animate-pulse"/> CURRENT CONDITIONS
                          </span>
                          <span className="text-2xl font-black text-white uppercase">Albany, Bahamas</span>
                      </div>
                      <div className="text-right">
                          <div className="flex items-center gap-2 justify-end text-[#DFFF00]">
                              <Wind size={24} />
                              <span className="text-4xl font-black">12<span className="text-sm align-top ml-1">MPH</span></span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800 mt-2 inline-block">
                              SE • 78°F
                          </span>
                      </div>
                  </div>

              </div>

          </div>
      </div>
    </main>
  );
}