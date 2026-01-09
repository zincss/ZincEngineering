'use client';

import React, { useState, useEffect } from 'react';
// Added 'CornerUpRight' to imports
import { ArrowLeft, Activity, Terminal, BarChart3, Flag, MapPin, Loader2, Trophy, History, Crown, Star, Map as MapIcon, Timer, RotateCw, Ruler, CornerUpRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- ROBUST MAPPING FOR FLAGS (Same as Dashboard) ---
const COUNTRY_TO_CODE: Record<string, string> = {
    'Australia': 'au', 'Austria': 'at', 'Azerbaijan': 'az', 'Bahrain': 'bh',
    'Belgium': 'be', 'Brazil': 'br', 'Canada': 'ca', 'China': 'cn',
    'France': 'fr', 'Germany': 'de', 'Hungary': 'hu', 'Italy': 'it',
    'Japan': 'jp', 'Mexico': 'mx', 'Monaco': 'mc', 'Netherlands': 'nl',
    'Portugal': 'pt', 'Qatar': 'qa', 'Russia': 'ru', 'Saudi Arabia': 'sa',
    'Singapore': 'sg', 'Spain': 'es', 'Turkey': 'tr', 'UAE': 'ae',
    'UK': 'gb', 'USA': 'us', 'United States': 'us', 'United Arab Emirates': 'ae', 
    'Korea': 'kr', 'India': 'in', 'Malaysia': 'my'
};

const COUNTRY_COLORS: Record<string, string> = {
    'Australia': 'from-green-500/20 to-yellow-500/20',
    'Austria': 'from-red-600/20 to-white/10',
    'Azerbaijan': 'from-blue-500/20 to-green-500/20',
    'Bahrain': 'from-red-600/20 to-white/10',
    'Belgium': 'from-yellow-500/20 to-red-500/20',
    'Brazil': 'from-green-600/20 to-yellow-500/20',
    'Canada': 'from-red-600/20 to-white/10',
    'China': 'from-red-600/20 to-yellow-500/20',
    'France': 'from-blue-600/20 to-red-600/20',
    'Germany': 'from-yellow-500/20 to-red-500/20',
    'Hungary': 'from-green-600/20 to-red-600/20',
    'Italy': 'from-green-600/20 to-red-600/20',
    'Japan': 'from-white/10 to-red-600/20',
    'Mexico': 'from-green-600/20 to-red-600/20',
    'Monaco': 'from-red-600/20 to-white/10',
    'Netherlands': 'from-orange-500/20 to-blue-600/20',
    'Portugal': 'from-green-600/20 to-red-600/20',
    'Qatar': 'from-purple-800/20 to-white/10',
    'Russia': 'from-blue-600/20 to-red-600/20',
    'Saudi Arabia': 'from-green-600/20 to-white/10',
    'Singapore': 'from-red-600/20 to-white/10',
    'Spain': 'from-red-600/20 to-yellow-500/20',
    'Turkey': 'from-red-600/20 to-white/10',
    'UAE': 'from-green-600/20 to-red-600/20',
    'United Arab Emirates': 'from-green-600/20 to-red-600/20',
    'UK': 'from-blue-700/20 to-red-600/20',
    'USA': 'from-blue-600/20 to-red-600/20',
    'United States': 'from-blue-600/20 to-red-600/20',
};

// Tech Specs for Details
const TRACK_SPECS: Record<string, { len: string, turns: number, record: string, laps: number }> = {
    'bahrain': { len: '5.412 km', turns: 15, record: '1:31.447', laps: 57 },
    'jeddah': { len: '6.174 km', turns: 27, record: '1:30.734', laps: 50 },
    'albert_park': { len: '5.278 km', turns: 14, record: '1:20.260', laps: 58 },
    'suzuka': { len: '5.807 km', turns: 18, record: '1:30.983', laps: 53 },
    'shanghai': { len: '5.451 km', turns: 16, record: '1:31.095', laps: 56 },
    'miami': { len: '5.412 km', turns: 19, record: '1:29.708', laps: 57 },
    'imola': { len: '4.909 km', turns: 19, record: '1:15.484', laps: 63 },
    'monaco': { len: '3.337 km', turns: 19, record: '1:12.909', laps: 78 },
    'villeneuve': { len: '4.361 km', turns: 14, record: '1:13.078', laps: 70 },
    'catalunya': { len: '4.657 km', turns: 14, record: '1:16.330', laps: 66 },
    'red_bull_ring': { len: '4.318 km', turns: 10, record: '1:05.619', laps: 71 },
    'silverstone': { len: '5.891 km', turns: 18, record: '1:27.097', laps: 52 },
    'hungaroring': { len: '4.381 km', turns: 14, record: '1:16.627', laps: 70 },
    'spa': { len: '7.004 km', turns: 19, record: '1:46.286', laps: 44 },
    'zandvoort': { len: '4.259 km', turns: 14, record: '1:11.097', laps: 72 },
    'monza': { len: '5.793 km', turns: 11, record: '1:21.046', laps: 53 },
    'baku': { len: '6.003 km', turns: 20, record: '1:43.009', laps: 51 },
    'singapore': { len: '4.940 km', turns: 19, record: '1:35.867', laps: 62 },
    'americas': { len: '5.513 km', turns: 20, record: '1:36.169', laps: 56 },
    'rodriguez': { len: '4.304 km', turns: 17, record: '1:17.774', laps: 71 },
    'interlagos': { len: '4.309 km', turns: 15, record: '1:10.540', laps: 71 },
    'vegas': { len: '6.201 km', turns: 17, record: '1:35.490', laps: 50 },
    'losail': { len: '5.419 km', turns: 16, record: '1:24.319', laps: 57 },
    'yas_marina': { len: '5.281 km', turns: 16, record: '1:26.103', laps: 58 },
};

// [FIX] Required for static export

export default function CircuitPage() {
  const { id } = useParams();
  const [circuit, setCircuit] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const circuitRes = await fetch(`https://api.jolpi.ca/ergast/f1/circuits/${id}.json`);
        const circuitData = await circuitRes.json();
        const circuitInfo = circuitData.MRData.CircuitTable.Circuits[0];

        if (!circuitInfo) throw new Error("Circuit not found");

        const historyRes = await fetch(`https://api.jolpi.ca/ergast/f1/circuits/${id}/results/1.json?limit=1000`);
        const historyData = await historyRes.json();
        const races = historyData.MRData.RaceTable.Races;

        const driverWins: Record<string, number> = {};
        const teamWins: Record<string, number> = {};
        
        races.forEach((race: any) => {
            const driverName = `${race.Results[0].Driver.givenName} ${race.Results[0].Driver.familyName}`;
            const teamName = race.Results[0].Constructor.name;
            driverWins[driverName] = (driverWins[driverName] || 0) + 1;
            teamWins[teamName] = (teamWins[teamName] || 0) + 1;
        });

        const topDriver = Object.keys(driverWins).reduce((a, b) => driverWins[a] > driverWins[b] ? a : b, "N/A");
        const topTeam = Object.keys(teamWins).reduce((a, b) => teamWins[a] > teamWins[b] ? a : b, "N/A");
        
        setCircuit(circuitInfo);
        setStats({
            totalGPs: races.length,
            topDriver,
            topDriverCount: driverWins[topDriver] || 0,
            topTeam,
            topTeamCount: teamWins[topTeam] || 0,
        });
        setWinners(races.reverse().slice(0, 10)); // Top 10 recent
        setLoading(false);

      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white gap-2 font-mono text-xs animate-pulse">
        <Loader2 className="animate-spin text-[#DFFF00]" /> UPLINKING TO CIRCUIT DATABASE...
    </div>
  );

  if (!circuit) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-zinc-500">CIRCUIT_NOT_FOUND</div>;

  const isoCode = COUNTRY_TO_CODE[circuit.Location.country] || 'xx';
  const flagUrl = `https://flagcdn.com/w640/${isoCode.toLowerCase()}.png`;
  const gradient = COUNTRY_COLORS[circuit.Location.country] || 'from-zinc-800/20 to-zinc-900/20';
  
  // Resolve Specs
  const specKey = Object.keys(TRACK_SPECS).find(k => (id as string).toLowerCase().includes(k)) || 'bahrain'; 
  const specs = TRACK_SPECS[specKey] || { len: '---', turns: 0, record: '---', laps: 0 };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 pt-24">
      
      {/* ATMOSPHERIC GLOW */}
      <div className={`fixed inset-0 bg-gradient-to-br ${gradient} opacity-5 pointer-events-none z-0`} />

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <Link href="/sports/f1" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] transition-colors font-mono font-bold text-[10px] uppercase tracking-widest mb-8">
              <ArrowLeft size={14} /> Back to Global Map
          </Link>

          {/* HERO SECTION */}
          <div className="border-b border-zinc-800 pb-12 mb-12">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                          <span className="px-2 py-1 bg-[#DFFF00] text-black text-[10px] font-black font-mono uppercase tracking-widest">FIA GRADE 1</span>
                          <span className="px-2 py-1 border border-zinc-800 text-[10px] font-bold font-mono uppercase text-zinc-400">{circuit.Location.locality}, {circuit.Location.country}</span>
                      </div>
                      {/* OPTIMIZED TEXT SIZE FOR MOBILE */}
                      <h1 className="text-4xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.85] text-white">
                          {circuit.circuitName.replace('International', '').replace('Circuit', '').trim()}
                      </h1>
                  </div>
                  
                  {/* FLAG HERO */}
                  {isoCode !== 'xx' && (
                      <div className="w-48 h-32 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zinc-800 bg-zinc-900 transform rotate-3">
                          <img src={flagUrl} className="w-full h-full object-cover opacity-80" alt="Flag" />
                          <div className="absolute inset-0 ring-1 ring-white/10"></div>
                      </div>
                  )}
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* LEFT COL: TECH SPECS */}
              <div className="lg:col-span-4 space-y-8">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                      <h3 className="text-sm font-black uppercase text-white mb-6 flex items-center gap-2">
                          <Terminal size={14} className="text-[#DFFF00]" /> Technical Layout
                      </h3>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2"><Ruler size={12}/> Length</span>
                              <span className="text-sm font-bold text-white uppercase">{specs.len}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2"><CornerUpRight size={12}/> Turns</span>
                              <span className="text-sm font-bold text-white uppercase">{specs.turns}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2"><RotateCw size={12}/> Laps</span>
                              <span className="text-sm font-bold text-white uppercase">{specs.laps}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2"><Timer size={12}/> Lap Record</span>
                              <span className="text-sm font-bold text-[#DFFF00] uppercase">{specs.record}</span>
                          </div>
                      </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                      <h3 className="text-sm font-black uppercase text-white mb-6 flex items-center gap-2">
                          <Crown size={14} className="text-[#DFFF00]" /> Circuit Legends
                      </h3>
                      <div className="space-y-4">
                          <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Most Successful Driver</span>
                              <span className="text-xl font-black text-white uppercase leading-none block">{stats.topDriver}</span>
                              <span className="text-[10px] font-mono text-[#DFFF00]">{stats.topDriverCount} Wins</span>
                          </div>
                          <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Most Successful Team</span>
                              <span className="text-xl font-black text-white uppercase leading-none block">{stats.topTeam}</span>
                              <span className="text-[10px] font-mono text-[#DFFF00]">{stats.topTeamCount} Wins</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* RIGHT COL: HISTORY LOG */}
              <div className="lg:col-span-8">
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800">
                       <History size={14} className="text-[#DFFF00]"/> 
                       <span className="text-xs font-black tracking-widest uppercase text-white">Winner's Circle (Last 10 Events)</span>
                  </div>
                  
                  <div className="grid gap-2">
                      {winners.map((race: any) => {
                          const driver = race.Results[0].Driver;
                          const team = race.Results[0].Constructor;
                          return (
                              <div key={race.season} className="flex justify-between items-center p-4 bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] transition-colors group">
                                  <div className="flex flex-col">
                                      <span className="text-lg font-black text-white uppercase group-hover:text-[#DFFF00] transition-colors">{driver.givenName} {driver.familyName}</span>
                                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{team.name}</span>
                                  </div>
                                  <span className="text-3xl font-black text-zinc-800 group-hover:text-white transition-colors">{race.season}</span>
                              </div>
                          )
                      })}
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
}