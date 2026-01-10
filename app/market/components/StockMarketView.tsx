'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  PieChart, 
  ArrowRight, 
  Briefcase,
  X,
  ChevronRight,
  Activity,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getMarketStatus, getPortfolio, buyStock, sellStock } from '@/app/play/stocks/actions';
import { Category } from '@/app/play/stocks/data';

// --- ROLLING NUMBER COMPONENT ---
const RollingNumber = ({ value, prefix = "", suffix = "", className = "" }: { value: number, prefix?: string, suffix?: string, className?: string }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isIncreasing, setIsIncreasing] = useState<boolean | null>(null);

    useEffect(() => {
        if (value !== displayValue) {
            setIsIncreasing(value > displayValue);
            const timeout = setTimeout(() => setIsIncreasing(null), 1000);
            const diff = value - displayValue;
            const steps = 10;
            const stepVal = diff / steps;
            let current = 0;
            const interval = setInterval(() => {
                current++;
                setDisplayValue(prev => Number((prev + stepVal).toFixed(2)));
                if (current >= steps) { setDisplayValue(value); clearInterval(interval); }
            }, 300);
            return () => { clearTimeout(timeout); clearInterval(interval); };
        }
    }, [value]);

    return (
        <span className={`${className} transition-colors duration-500 ${isIncreasing === true ? 'text-emerald-400' : isIncreasing === false ? 'text-rose-400' : ''}`}>
            {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
        </span>
    );
};

// --- SIGNAL TRACE COMPONENT (PRO-TERMINAL UPGRADE) ---
const SignalTrace = ({ data, color: forceColor, isDetailed = false }: { data: number[], color?: string, isDetailed?: boolean }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = range * 0.15;
    
    // Smooth Bezier Curve Fitting
    const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (((val - min + padding) / (range + padding * 2)) * 100)
    }));

    let pathData = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const cpX1 = curr.x + (next.x - curr.x) / 3;
        const cpX2 = curr.x + (next.x - curr.x) * (2/3);
        pathData += ` C ${cpX1},${curr.y} ${cpX2},${next.y} ${next.x},${next.y}`;
    }

    const areaData = `${pathData} L 100,100 L 0,100 Z`;
    const lastPoint = points[points.length - 1];
    const color = forceColor || (data[data.length - 1] >= data[0] ? '#DFFF00' : '#ef4444');

    return (
        <div className="relative w-full h-full group/trace select-none">
            {/* TERMINAL GRID */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                <div className="absolute inset-0 opacity-[0.03]" 
                     style={{ backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`, backgroundSize: isDetailed ? '20px 20px' : '40px 40px' }} 
                />
                {/* Horizontal Level Markers */}
                <div className="absolute inset-0 flex flex-col justify-between py-2 opacity-10">
                    {[...Array(isDetailed ? 5 : 3)].map((_, i) => <div key={i} className="h-px w-full bg-white/20" />)}
                </div>
            </div>

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible relative z-10">
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={isDetailed ? 0.1 : 0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                
                {/* AREA FILL */}
                <motion.path 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    d={areaData} fill={`url(#grad-${color})`} 
                />
                
                {/* TRACKING BEAM (Vertical Anchor) */}
                <motion.line 
                    initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                    x1="100" y1={lastPoint.y} x2="100" y2="100" 
                    stroke={color} strokeWidth={isDetailed ? "0.2" : "0.5"} strokeDasharray="2,2" opacity="0.4"
                />

                {/* ATMOSPHERIC GLOW (Layer 3) */}
                <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    d={pathData} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                    style={{ filter: 'blur(6px)' }}
                />

                {/* SIGNAL GLOW (Layer 2) */}
                <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ filter: 'blur(2px)' }}
                />

                {/* SHARP CORE (Layer 1) */}
                <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    d={pathData} fill="none" stroke={isDetailed ? "white" : color} strokeWidth={isDetailed ? "0.75" : "1.5"} strokeLinecap="round" strokeLinejoin="round"
                />

                {/* SIGNAL HEAD (Lead Particle) */}
                <g>
                    <motion.circle 
                        cx="100" cy={lastPoint.y} r="3" fill={color}
                        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <circle cx="100" cy={lastPoint.y} r="1.5" fill="white" className="shadow-lg" />
                </g>
            </svg>

            {/* MIN/MAX AXIS LABELS (Detailed Only) */}
            {isDetailed && (
                <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none opacity-40">
                    <span className="text-[7px] font-mono text-white">HI {max.toFixed(0)}</span>
                    <span className="text-[7px] font-mono text-white">LO {min.toFixed(0)}</span>
                </div>
            )}
        </div>
    );
};

// --- STOCK CARD ---
const StockCard = ({ stock, owned, onSelect }: any) => {
    const isPositive = stock.change >= 0;
    return (
        <button onClick={() => onSelect(stock)} className="group relative bg-zinc-950 border border-white/5 hover:border-white/20 p-5 rounded-3xl text-left transition-all duration-500 hover:-translate-y-1 overflow-hidden h-[200px] flex flex-col justify-between">
            <div className="relative z-10 flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Asset</span>
                    <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black italic tracking-tighter text-white group-hover:text-[#DFFF00] transition-colors leading-none">{stock.ticker}</h4>
                        {owned && <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00]" />}
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Price</span>
                    <div className="text-lg font-black text-white italic tabular-nums leading-none"><RollingNumber value={stock.currentPrice} /></div>
                </div>
            </div>
            <div className="relative h-12 my-2 bg-zinc-900/30 rounded-xl overflow-hidden p-2 border border-white/[0.02]"><SignalTrace data={stock.history} /></div>
            <div className="relative z-10 flex items-center justify-between">
                <div className={`text-[10px] font-bold italic flex items-center gap-1.5 ${isPositive ? 'text-[#DFFF00]' : 'text-red-500'}`}>{isPositive ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}%</div>
                <ChevronRight size={14} className="text-zinc-800 group-hover:text-white transition-colors" />
            </div>
        </button>
    );
};

const SectionHeader = ({ title, sub, icon: Icon }: any) => (
    <div className="flex items-center gap-4 mb-8 px-2">
        <div className="p-2 bg-zinc-900 rounded-xl border border-white/5 text-zinc-500"><Icon size={16} /></div>
        <div className="flex flex-col">
            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">{sub}</span>
            <h3 className="text-xl font-black uppercase italic text-white tracking-tight">{title}</h3>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
    </div>
);

export function StockMarketView({ user, profile, refreshProfile }: StockMarketViewProps) {
  const [stocks, setStocks] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL' | 'PORTFOLIO'>('ALL');
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [amount, setAmount] = useState(1);
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [isTransacting, setIsTransacting] = useState(false);

  useEffect(() => { refreshMarket(); const interval = setInterval(refreshMarket, 30000); return () => clearInterval(interval); }, [user]);

  const refreshMarket = async () => {
    const [marketData, portfolioData] = await Promise.all([ getMarketStatus(), getPortfolio() ]);
    setStocks(marketData); setPortfolio(portfolioData); setLoading(false);
  };

  const marketLeaders = useMemo(() => {
    if (stocks.length === 0) return { gainer: null, loser: null };
    const sorted = [...stocks].sort((a, b) => b.change - a.change);
    return { gainer: sorted[0], loser: sorted[sorted.length - 1] };
  }, [stocks]);

  const handleTrade = async () => {
    if (!selectedStock) return;
    setIsTransacting(true);
    const res = tradeMode === 'BUY' ? await buyStock(selectedStock.ticker, amount) : await sellStock(selectedStock.ticker, amount);
    if (res.success) { await refreshProfile(); await refreshMarket(); setSelectedStock(null); setAmount(1); }
    else { alert('Transaction Failed: ' + res.error); }
    setIsTransacting(false);
  };

  const { portfolioCurrentValue, totalPL, percentPL, isProfitable } = useMemo(() => {
      const currentVal = portfolio.reduce((acc, item) => { const stock = stocks.find(s => s.ticker === item.ticker); return acc + (item.quantity * (stock?.currentPrice || 0)); }, 0);
      const costBasis = portfolio.reduce((acc, item) => acc + (item.quantity * (item.average_price || 0)), 0);
      const pl = currentVal - costBasis;
      return { portfolioCurrentValue: currentVal, totalPL: pl, percentPL: costBasis > 0 ? (pl / costBasis) * 100 : 0, isProfitable: pl >= 0 };
  }, [portfolio, stocks]);

  const ownedStocks = useMemo(() => stocks.filter(s => portfolio.some(p => p.ticker === s.ticker)), [stocks, portfolio]);
  const categories = ['TECH', 'FINANCE', 'ENERGY', 'CONSUMER', 'HEALTH', 'COMMODITIES'] as Category[];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-60 text-[#DFFF00] gap-8">
        <RefreshCw className="animate-spin" size={48} />
        <span className="text-xs tracking-[0.5em] font-black uppercase italic opacity-60">Synchronizing...</span>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 max-w-[1800px] mx-auto pb-40">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b border-white/5 pb-12">
          <div className="flex items-center gap-8">
              <div>
                  <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-2">
                      <span>Market Protocol // V4.2</span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
                          <div className="w-1 h-1 rounded-full bg-[#DFFF00] animate-pulse" />
                          <span className="text-[8px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest">Live</span>
                      </div>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic text-white">Stock<span className="text-[#DFFF00]">Z</span></h1>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-8 bg-zinc-900/50 border border-white/5 rounded-[3rem] p-12 backdrop-blur-3xl relative overflow-hidden shadow-2xl group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12 h-full">
                  <div className="space-y-8">
                      <div>
                          <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-4">
                              <span>Portfolio Overview</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                          </div>
                          <h2 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">Total <span className="text-zinc-800">Value</span></h2>
                          <div className="flex items-baseline gap-4">
                              <span className="text-7xl md:text-8xl font-black italic tracking-tighter text-white tabular-nums">{(profile?.credits + portfolioCurrentValue).toLocaleString()}</span>
                              <span className="text-2xl text-[#DFFF00] font-black tracking-[0.2em] italic">CR</span>
                          </div>
                      </div>
                      <div className="flex flex-wrap gap-8 pt-8 border-t border-white/5">
                          <div className="flex flex-col"><span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Liquid Balance</span><span className="text-2xl font-black text-white">{(profile?.credits || 0).toLocaleString()}</span></div>
                          <div className="flex flex-col"><span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Invested Assets</span><span className="text-2xl font-black text-[#DFFF00]">{portfolioCurrentValue.toLocaleString()}</span></div>
                          <div className="flex flex-col"><span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Lifetime Gain</span><div className={`flex items-center gap-2 text-2xl font-black ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>{isProfitable ? '+' : ''}{totalPL.toLocaleString()}<span className="text-sm opacity-60">({percentPL.toFixed(2)}%)</span></div></div>
                      </div>
                  </div>
                  <div className="hidden xl:flex flex-col items-end gap-4 opacity-20 group-hover:opacity-40 transition-opacity"><PieChart size={120} className="text-[#DFFF00]" /><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Asset Distribution</span></div>
              </div>
          </div>

          <div className="lg:col-span-4 bg-zinc-900/50 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                  <h3 className="font-black uppercase italic tracking-tight text-white flex items-center gap-3">Market Leaders</h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              </div>
              <div className="space-y-6">
                  {marketLeaders.gainer && (
                      <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] hover:bg-emerald-500/10 transition-all cursor-pointer group" onClick={() => setSelectedStock(marketLeaders.gainer)}>
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><TrendingUp size={20}/></div>
                                  <div><div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Top Gainer</div><div className="text-xl font-black text-white italic">{marketLeaders.gainer.ticker}</div></div>
                              </div>
                              <div className="text-right text-2xl font-black text-emerald-500 italic">+{marketLeaders.gainer.change.toFixed(1)}%</div>
                          </div>
                      </div>
                  )}
                  {marketLeaders.loser && (
                      <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-[2rem] hover:bg-red-500/10 transition-all cursor-pointer group" onClick={() => setSelectedStock(marketLeaders.loser)}>
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform"><TrendingDown size={20}/></div>
                                  <div><div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Top Loser</div><div className="text-xl font-black text-white italic">{marketLeaders.loser.ticker}</div></div>
                              </div>
                              <div className="text-right text-2xl font-black text-red-500 italic">{marketLeaders.loser.change.toFixed(1)}%</div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {ownedStocks.length > 0 && (
          <div className="mb-24">
              <SectionHeader title="Your Positions" sub="Portfolio Holdings" icon={Briefcase} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {ownedStocks.map(stock => <StockCard key={stock.ticker} stock={stock} owned={true} onSelect={setSelectedStock} />)}
              </div>
          </div>
      )}

      <div className="space-y-32">
          {categories.map(category => {
              const sectorStocks = stocks.filter(s => s.category === category);
              if (sectorStocks.length === 0) return null;
              return (
                  <div key={category}>
                      <SectionHeader title={`${category} Sector`} sub="Market Category" icon={BarChart3} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                          {sectorStocks.map(stock => <StockCard key={stock.ticker} stock={stock} owned={portfolio.some(p => p.ticker === stock.ticker)} onSelect={setSelectedStock} />)}
                      </div>
                  </div>
              );
          })}
      </div>

      <AnimatePresence>
        {selectedStock && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-6 z-[200]" onClick={() => setSelectedStock(null)}>
                <motion.div initial={{ y: "100%", scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: "100%", scale: 0.95 }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="bg-[#080808] border-t sm:border border-white/10 w-full max-w-4xl max-h-[92vh] sm:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                    <div className={`absolute top-0 left-0 w-full h-1 ${selectedStock.change >= 0 ? 'bg-[#DFFF00]' : 'bg-red-500'} shadow-[0_0_20px_currentColor] z-50`} />
                    <div className="p-10 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex flex-col gap-10">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-6xl font-black tracking-tighter text-white italic leading-none">{selectedStock.ticker}</h3>
                                        <span className="px-4 py-1.5 bg-[#DFFF00]/10 rounded-full text-[10px] text-[#DFFF00] font-bold tracking-widest border border-[#DFFF00]/20 uppercase italic">{selectedStock.category}</span>
                                    </div>
                                    <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs pl-1">{selectedStock.name}</p>
                                </div>
                                <button onClick={() => setSelectedStock(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-500 hover:text-white border border-white/5"><X size={24} /></button>
                            </div>
                            <div className="flex items-end justify-between border-t border-white/5 pt-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 pl-1">Market Price</span>
                                    <div className="flex items-baseline gap-3">
                                        <RollingNumber value={selectedStock.currentPrice} className="text-6xl font-black italic tracking-tighter text-white tabular-nums leading-none" />
                                        <span className="text-sm text-zinc-600 font-bold tracking-widest italic">CR</span>
                                    </div>
                                </div>
                                <div className={`flex flex-col items-end ${selectedStock.change >= 0 ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                                    <span className="text-3xl font-black italic tracking-tighter">{selectedStock.change >= 0 ? '▲' : '▼'} {Math.abs(selectedStock.change).toFixed(2)}%</span>
                                    <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest italic mt-2">Real-time update</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                        <div className="h-72 w-full bg-black border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group"><SignalTrace data={selectedStock.history} isDetailed={true} /></div>
                        <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-10">
                            <div className="flex bg-black/60 p-2 rounded-2xl mb-10 border border-white/5 relative">
                                <motion.div layoutId="mode-bg" className={`absolute inset-2 w-[calc(50%-8px)] rounded-xl shadow-xl ${tradeMode === 'BUY' ? 'left-2 bg-white' : 'left-[calc(50%+4px)] bg-red-600'}`} transition={{ type: "spring", damping: 25, stiffness: 300 }} />
                                <button onClick={() => setTradeMode('BUY')} className={`flex-1 py-4 font-black uppercase text-xs tracking-widest italic relative z-10 transition-colors ${tradeMode === 'BUY' ? 'text-black' : 'text-zinc-600 hover:text-white'}`}>Buy Asset</button>
                                <button onClick={() => setTradeMode('SELL')} className={`flex-1 py-4 font-black uppercase text-xs tracking-widest italic relative z-10 transition-colors ${tradeMode === 'SELL' ? 'text-white' : 'text-zinc-600 hover:text-white'}`}>Sell Asset</button>
                            </div>
                            <div className="space-y-10">
                                <div className="flex items-center justify-between px-2"><span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Select Quantity</span>{portfolio.find(p => p.ticker === selectedStock.ticker) && (<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#DFFF00] italic">Owned: {portfolio.find(p => p.ticker === selectedStock.ticker).quantity}</div>)}</div>
                                <div className="flex flex-col md:flex-row items-center gap-10"><div className="flex items-center flex-1 w-full bg-black border border-white/10 rounded-[2rem] p-3 px-6 shadow-inner"><button onClick={() => setAmount(Math.max(1, amount - 1))} className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-3xl text-zinc-500 hover:text-white transition-all">-</button><input type="number" value={amount} onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))} className="flex-1 bg-transparent text-center text-5xl font-black tracking-tighter outline-none text-white w-full min-w-0 italic" /><button onClick={() => setAmount(amount + 1)} className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-3xl text-zinc-500 hover:text-white transition-all">+</button></div><div className="flex flex-col items-center md:items-end min-w-[240px] border-l border-white/10 pl-10 hidden md:flex"><span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-2">Estimated Total</span><div className="flex items-baseline gap-3"><span className="text-5xl font-black italic tracking-tighter text-white">{(amount * selectedStock.currentPrice).toLocaleString()}</span><span className="text-xs font-bold text-zinc-600 italic">CR</span></div></div></div>
                            </div>
                        </div>
                    </div>
                    <div className="p-10 pt-6 bg-white/[0.02] border-t border-white/5 flex flex-col gap-6"><button onClick={handleTrade} disabled={isTransacting} className={`w-full py-7 font-black uppercase rounded-[2.5rem] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] text-sm tracking-widest italic ${tradeMode === 'BUY' ? 'bg-[#DFFF00] text-black hover:bg-white' : 'bg-red-600 text-white hover:bg-red-500'}`}>{isTransacting ? <RefreshCw className="animate-spin" size={24} /> : <>Confirm {tradeMode === 'BUY' ? 'Purchase' : 'Sale'} <ArrowRight size={20} /></>}</button></div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}