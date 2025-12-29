'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, AlertTriangle, Ghost, XCircle, RefreshCw, 
  TrendingDown, Banknote 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// --- ROSTER DATA ---
const PLAYERS = [
  { id: '3992', name: 'James Harden', pos: 'G' },
  { id: '6450', name: 'Kawhi Leonard', pos: 'F' },
  { id: '4017837', name: 'Ivica Zubac', pos: 'C' },
  { id: '2531367', name: 'Norman Powell', pos: 'G' },
  { id: '4278049', name: 'Terance Mann', pos: 'G' },
  { id: '4065697', name: 'Derrick Jones Jr', pos: 'F' },
  { id: '4395625', name: 'Kevin Porter Jr', pos: 'G' },
  { id: '3416', name: 'Nicolas Batum', pos: 'F' },
  { id: '4065735', name: 'Amir Coffey', pos: 'G' },
  { id: '3059318', name: 'Kris Dunn', pos: 'G' },
  { id: '4432823', name: 'Bones Hyland', pos: 'G' },
  { id: '4065743', name: 'Jordan Miller', pos: 'G' },
];

// --- HATER QUOTES ---
const HATER_QUOTES = [
  "Hang the banner for 'Play-In Tournament Participants 2024'.",
  "Steve Ballmer is currently crying...",
  "Calculated using the 'We traded Shai Gilgeous-Alexander for this' algorithm.",
  "CP3 deserved better...",
  "If knees were a currency, this franchise would be bankrupt.",
  "Intuit Dome: 1,100 toilets, 0 championships. Prioritizing the right things.",
  "Load Management Merchants",
  "This performance would be legendary anywhere else.",
  "Optimized for a second-round exit.",
  "Converting to Lakers...",
  "We'll pay you to come watch.",
  "Even Adjusted for inflation, this is still 0 rings since 1970.",
  "Streetlights over Spotlights... because we can't afford the electricity bill.",
  "The Buffalo Braves would run this team better.",
  "Imagine building a $2B arena just to watch James Harden dribble for 18 seconds.",
  "Fun Fact: The Clippers have never played in an NBA Finals.",
];

// --- FINANCIAL SHAME DATA ---
const BAD_CONTRACTS = [
  { name: "Kawhi Leonard", amount: "$49,205,800", label: "Part-Time Employee of the Month" },
  { name: "James Harden", amount: "$35,653,846", label: "Collect a paycheck" },
  { name: "P.J. Tucker", amount: "$11,539,000", label: "P.J. Tucker" },
  { name: "Norm Powell", amount: "$19,241,379", label: "6th Man on a 10th Seed" },
];

export default function ClipflationPage() {
  const [stats, setStats] = useState({ pts: '', reb: '', ast: '' });
  const [result, setResult] = useState<null | { pts: number, reb: number, ast: number, quote: string }>(null);
  const [calculating, setCalculating] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(PLAYERS[0]);
  
  // Tax Bill State: Starts at ~20M
  const [taxBill, setTaxBill] = useState(20587828.00);

  // Increase by $0.01 every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTaxBill(prev => prev + 0.01);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCalculate = () => {
    setCalculating(true);
    setResult(null);
    
    const randomQuote = HATER_QUOTES[Math.floor(Math.random() * HATER_QUOTES.length)];

    setTimeout(() => {
      setCalculating(false);
      setResult({
        pts: Math.ceil(Number(stats.pts || 0) * 2.2),
        reb: Math.ceil(Number(stats.reb || 0) * 1.8), 
        ast: Math.ceil(Number(stats.ast || 0) * 2.5), 
        quote: randomQuote
      });
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-red-500 selection:text-white overflow-x-hidden relative font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-blue-950/80 mix-blend-multiply z-10" />
         <div className="absolute inset-0 bg-[url('https://cdn.nba.com/manage/2021/09/intuit-dome-rendering.jpg')] bg-cover bg-center opacity-40 grayscale contrast-125 scale-105" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-20" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center min-h-screen">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative w-full max-w-2xl"
        >
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-2 shadow-[0_0_40px_rgba(255,255,255,0.2)] z-10">
              <Image 
                src="https://cdn.nba.com/logos/nba/1610612746/global/L/logo.svg" 
                alt="Clippers Logo" 
                width={80} 
                height={80} 
                className="w-full h-full object-contain"
              />
          </div>

          <div className="mt-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 backdrop-blur-md">
            <AlertTriangle size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Intuit Dome Protocol v2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-2 drop-shadow-2xl">
            Clip<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-red-500">flation</span>
          </h1>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm inline-block">
            Adjusting stats for the "Cursed Franchise" Tax
          </p>
        </motion.div>

        {/* Player Selector */}
        <div className="w-full mb-8 overflow-x-auto pb-4 no-scrollbar mask-linear-fade">
            <div className="flex gap-3 justify-start md:justify-center w-max px-4 mx-auto">
                {PLAYERS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedPlayer(p)}
                        className={`
                            relative flex flex-col items-center gap-2 p-2 rounded-xl border transition-all duration-300 min-w-[80px] group
                            ${selectedPlayer.id === p.id 
                                ? 'bg-blue-600/20 border-blue-500 scale-110 z-10 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                                : 'bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-800/40'
                            }
                        `}
                    >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-white/10">
                            <Image 
                                src={`https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png&w=350&h=254`}
                                alt={p.name}
                                width={100}
                                height={100}
                                className="object-cover scale-125 translate-y-2"
                            />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider max-w-[70px] truncate text-center">
                            {p.name.split(' ').pop()}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          
          {/* LEFT: CALCULATOR */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 bg-zinc-950/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          >
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            <div className="relative z-10 grid gap-6">
               
               {/* Selected Player Header */}
               <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                   <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-900 to-zinc-900 flex items-center justify-center border-2 border-blue-500 overflow-hidden shadow-lg shrink-0">
                        <Image 
                           src={`https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${selectedPlayer.id}.png&w=350&h=254`}
                           alt={selectedPlayer.name}
                           width={150}
                           height={150}
                           className="scale-125 translate-y-3"
                        />
                   </div>
                   <div>
                       <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Analysing Subject</p>
                       <h2 className="text-xl font-black italic uppercase">{selectedPlayer.name}</h2>
                       <div className="flex gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              #{selectedPlayer.id.slice(0,2)} // {selectedPlayer.pos}
                          </span>
                       </div>
                   </div>
               </div>

               {/* Description (RESTORED COPE METRICS) */}
               <div className="flex gap-3 items-start px-2">
                  <Ghost className="text-zinc-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Clippers statistics are notoriously deflated due to playing in a cursed environment. 
                    This tool uses proprietary "Cope-Metrics" to calculate what that statline would look like on a serious franchise.
                  </p>
               </div>

               {/* Inputs */}
               <div className="grid grid-cols-3 gap-4">
                  <StatInput label="Points" value={stats.pts} onChange={(v) => setStats({...stats, pts: v})} icon="PTS" delay={0.3} />
                  <StatInput label="Rebounds" value={stats.reb} onChange={(v) => setStats({...stats, reb: v})} icon="REB" delay={0.4} />
                  <StatInput label="Assists" value={stats.ast} onChange={(v) => setStats({...stats, ast: v})} icon="AST" delay={0.5} />
               </div>

               {/* Action Button */}
               <button
                 onClick={handleCalculate}
                 disabled={calculating}
                 className="group relative w-full h-16 bg-gradient-to-r from-blue-600 to-red-600 rounded-xl overflow-hidden font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait mt-4 shadow-lg shadow-blue-900/20"
               >
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                 <span className="relative z-10 flex items-center justify-center gap-3">
                   {calculating ? (
                     <>
                       <RefreshCw className="animate-spin" size={18} /> Processing Excuse Algorithms...
                     </>
                   ) : (
                     <>
                       <Calculator size={18} /> Inflate Statistics
                     </>
                   )}
                 </span>
               </button>

               {/* Results View */}
               <AnimatePresence>
                 {result && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="pt-6 border-t border-white/5 mt-2">
                        <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest mb-6">
                          ADJUSTED "REAL WORLD" VALUE
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <ResultBox label="PTS" value={result.pts} color="text-blue-400" />
                          <ResultBox label="REB" value={result.reb} color="text-white" />
                          <ResultBox label="AST" value={result.ast} color="text-red-400" />
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg border border-red-500/20 text-center">
                           <span className="text-xs font-bold text-red-200 italic">
                             "{result.quote}"
                           </span>
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.div>

          {/* RIGHT: FINANCIAL SHAME BOARD */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
             {/* 1. LUXURY TAX TICKER (UPDATED) */}
             <div className="bg-zinc-900/80 border border-red-500/20 p-6 rounded-[2rem] relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-600 blur-[80px] opacity-20" />
                
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                      <TrendingDown size={20} />
                   </div>
                   <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Est. Tax Bill</h3>
                </div>
                
                <div className="text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight">
                   ${taxBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {/* VIBES TEXT REMOVED */}
             </div>

             {/* 2. OVERPAID CONTRACTS LIST */}
             <div className="flex-1 bg-zinc-900/60 border border-white/5 p-6 rounded-[2rem] backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                   <Banknote size={18} className="text-green-500" />
                   <h3 className="text-xs font-bold text-white uppercase tracking-widest">Financial "Assets"</h3>
                </div>

                <div className="space-y-3">
                   {BAD_CONTRACTS.map((contract, i) => (
                      <div key={i} className="group relative p-4 bg-black/20 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors">
                         <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-white">{contract.name}</span>
                            <span className="font-mono text-xs text-red-400">{contract.amount}</span>
                         </div>
                         <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider group-hover:text-red-300 transition-colors">
                            Role: {contract.label}
                         </div>
                      </div>
                   ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                   <p className="text-[10px] text-zinc-600 italic">
                      "We are legally obligated to pay these people." — Front Office
                   </p>
                </div>
             </div>
          </motion.div>

        </div>

        <div className="mt-12">
            <Link href="/" className="text-xs font-mono font-bold text-zinc-600 hover:text-white transition-colors uppercase flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                <XCircle size={14} /> Return to Reality
            </Link>
        </div>

      </div>
    </main>
  );
}

// --- SUB-COMPONENTS ---

interface StatInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: string;
  delay: number;
}

const StatInput = ({ label, value, onChange, icon, delay }: StatInputProps) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="relative group"
  >
    <label className="absolute -top-2.5 left-3 px-1 bg-[#09090b] text-[9px] font-bold text-zinc-500 uppercase tracking-widest z-10 group-focus-within:text-blue-400 transition-colors">
      {label}
    </label>
    <div className="relative">
        <input 
          type="number" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-2xl font-black text-center focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-800 text-white"
          placeholder="0"
        />
        <span className="absolute bottom-2 right-3 text-[10px] font-black text-zinc-700 select-none pointer-events-none">
          {icon}
        </span>
    </div>
  </motion.div>
);

const ResultBox = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col items-center">
     <motion.span 
       initial={{ scale: 0.5, filter: "blur(10px)" }}
       animate={{ scale: 1, filter: "blur(0px)" }}
       className={`text-4xl md:text-5xl font-black ${color} drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]`}
     >
       {value}
     </motion.span>
     <span className="text-[10px] font-bold text-zinc-600 mt-1">{label}</span>
  </div>
);