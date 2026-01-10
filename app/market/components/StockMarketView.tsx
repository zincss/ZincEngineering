'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import { useSearchParams } from 'next/navigation';

import { getMarketStatus, getPortfolio, buyStock, sellStock } from '@/app/play/stocks/actions';
import { Category } from '@/app/play/stocks/data';
import { StockChart } from '@/app/components/StockChart';

// --- PROPS INTERFACE ---
interface StockMarketViewProps {
    user: any;
    profile: any;
    refreshProfile: () => Promise<void>;
}

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
            }, 30);
            return () => { clearTimeout(timeout); clearInterval(interval); };
        }
    }, [value]);

    return (
        <span className={`${className} transition-colors duration-500 ${isIncreasing === true ? 'text-emerald-400' : isIncreasing === false ? 'text-rose-400' : ''}`}>
            {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
        </span>
    );
};

// --- STOCK CARD ---
const StockCard = ({ stock, owned, onSelect }: any) => {
    const isPositive = stock.change >= 0;
    return (
        <button onClick={() => onSelect(stock)} className="group relative bg-zinc-950 border border-white/5 hover:border-white/20 p-5 rounded-3xl text-left transition-all duration-500 hover:-translate-y-1 overflow-hidden h-[200px] flex flex-col justify-between shadow-lg">
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
            <div className="relative h-12 my-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <StockChart data={stock.history} type="candle" height="100%" />
            </div>
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
  const searchParams = useSearchParams();
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

    const ticker = searchParams.get('ticker');
    if (ticker && marketData.length > 0) {
        const found = marketData.find((s: any) => s.ticker === ticker.toUpperCase());
        if (found) setSelectedStock(found);
    }
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
        <span className="text-xs tracking-[0.5em] font-black uppercase italic opacity-60">Connecting to Exchange...</span>
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
          <div className="lg:col-span-8 bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 backdrop-blur-3xl relative overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col justify-between h-full gap-8">
                  <div className="space-y-6">
                      <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.4em] uppercase">
                          <span>Portfolio Snapshot</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                      </div>
                      
                      <div>
                          <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 md:mb-4">Total <span className="text-zinc-700">Value</span></h2>
                          <div className="flex flex-wrap items-baseline gap-2 md:gap-4">
                              <span className="text-6xl md:text-8xl font-black italic tracking-tighter text-white tabular-nums leading-none">{(profile?.credits + portfolioCurrentValue).toLocaleString()}</span>
                              <span className="text-xl md:text-2xl text-[#DFFF00] font-black tracking-[0.2em] italic">CR</span>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                      <div className="flex flex-col p-4 bg-black/20 rounded-2xl border border-white/5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Liquid Balance</span>
                          <span className="text-xl md:text-2xl font-black text-white">{(profile?.credits || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col p-4 bg-black/20 rounded-2xl border border-white/5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Market Assets</span>
                          <span className="text-xl md:text-2xl font-black text-[#DFFF00]">{portfolioCurrentValue.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col p-4 bg-black/20 rounded-2xl border border-white/5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Overall Return</span>
                          <div className={`flex items-center gap-2 text-xl md:text-2xl font-black ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                              {isProfitable ? '+' : ''}{totalPL.toLocaleString()}
                              <span className="text-xs opacity-60">({percentPL.toFixed(2)}%)</span>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none hidden xl:block">
                  <PieChart size={180} className="text-[#DFFF00]" />
              </div>
          </div>

          <div className="lg:col-span-4 bg-zinc-900/50 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                  <h3 className="font-black uppercase italic tracking-tight text-white flex items-center gap-3">Top Movers</h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              </div>
              <div className="space-y-6">
                  {marketLeaders.gainer && (
                      <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] hover:bg-emerald-500/10 transition-all cursor-pointer group" onClick={() => setSelectedStock(marketLeaders.gainer)}>
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><TrendingUp size={20}/></div>
                                  <div><div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Gain Leader</div><div className="text-xl font-black text-white italic">{marketLeaders.gainer.ticker}</div></div>
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
                                  <div><div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Loss Leader</div><div className="text-xl font-black text-white italic">{marketLeaders.loser.ticker}</div></div>
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
              <SectionHeader title="Owned Assets" sub="Personal Portfolio" icon={Briefcase} />
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
                      <SectionHeader title={`${category} Market`} sub="Sector Intelligence" icon={BarChart3} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                          {sectorStocks.map(stock => <StockCard key={stock.ticker} stock={stock} owned={portfolio.some(p => p.ticker === stock.ticker)} onSelect={setSelectedStock} />)}
                      </div>
                  </div>
              );
          })}
      </div>

      <AnimatePresence>
        {selectedStock && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-6" 
                onClick={() => setSelectedStock(null)}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />

                <motion.div 
                    initial={{ y: "100%", scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: "100%", scale: 0.95 }} 
                    transition={{ type: "spring", damping: 30, stiffness: 300 }} 
                    className="relative bg-[#080808] border-t sm:border border-white/10 w-full max-w-4xl max-h-[92vh] sm:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl shadow-black" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`absolute top-0 left-0 w-full h-1 ${selectedStock.change >= 0 ? 'bg-[#DFFF00]' : 'bg-red-500'} shadow-[0_0_20px_currentColor] z-50`} />
                    
                    {/* Header */}
                    <div className="p-6 sm:p-10 border-b border-white/5 bg-white/[0.02] relative">
                        <button onClick={() => setSelectedStock(null)} className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-500 hover:text-white border border-white/5 z-20"><X size={20} /></button>
                        
                        <div className="flex flex-col gap-6 sm:gap-10">
                            <div className="flex justify-between items-start pr-12">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <h3 className="text-4xl sm:text-6xl font-black tracking-tighter text-white italic leading-none">{selectedStock.ticker}</h3>
                                        <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-[#DFFF00]/10 rounded-full text-[9px] sm:text-[10px] text-[#DFFF00] font-bold tracking-widest border border-[#DFFF00]/20 uppercase italic">{selectedStock.category}</span>
                                    </div>
                                    <p className="text-zinc-500 font-bold tracking-widest uppercase text-[10px] sm:text-xs pl-1">{selectedStock.name}</p>
                                </div>
                            </div>
                            <div className="flex items-end justify-between border-t border-white/5 pt-6 sm:pt-10">
                                <div className="flex flex-col">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 sm:mb-2 pl-1">Live Price</span>
                                    <div className="flex items-baseline gap-2 sm:gap-3">
                                        <RollingNumber value={selectedStock.currentPrice} className="text-4xl sm:text-6xl font-black italic tracking-tighter text-white tabular-nums leading-none" />
                                        <span className="text-xs sm:text-sm text-zinc-600 font-bold tracking-widest italic">CR</span>
                                    </div>
                                </div>
                                <div className={`flex flex-col items-end ${selectedStock.change >= 0 ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                                    <span className="text-2xl sm:text-3xl font-black italic tracking-tighter">{selectedStock.change >= 0 ? '▲' : '▼'} {Math.abs(selectedStock.change).toFixed(2)}%</span>
                                    <span className="text-[8px] sm:text-[9px] uppercase font-bold text-zinc-600 tracking-widest italic mt-1 sm:mt-2">Real-time update</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-8 sm:space-y-12">
                        <div className="h-60 sm:h-80 w-full bg-black border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 relative overflow-hidden group shadow-inner">
                            <StockChart 
                                data={selectedStock.history} 
                                type="step" 
                                showTooltip 
                                className="w-full h-full" 
                            />
                        </div>
                        <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10">
                            <div className="flex bg-black/60 p-1.5 sm:p-2 rounded-2xl mb-8 sm:mb-10 border border-white/5 relative">
                                <motion.div layoutId="mode-bg" className={`absolute inset-1.5 sm:inset-2 w-[calc(50%-6px)] sm:w-[calc(50%-8px)] rounded-xl shadow-xl ${tradeMode === 'BUY' ? 'left-1.5 sm:left-2 bg-white' : 'left-[calc(50%+3px)] sm:left-[calc(50%+4px)] bg-red-600'}`} transition={{ type: "spring", damping: 25, stiffness: 300 }} />
                                <button onClick={() => setTradeMode('BUY')} className={`flex-1 py-3 sm:py-4 font-black uppercase text-[10px] sm:text-xs tracking-widest italic relative z-10 transition-colors ${tradeMode === 'BUY' ? 'text-black' : 'text-zinc-600 hover:text-white'}`}>Purchase Asset</button>
                                <button onClick={() => setTradeMode('SELL')} className={`flex-1 py-3 sm:py-4 font-black uppercase text-[10px] sm:text-xs tracking-widest italic relative z-10 transition-colors ${tradeMode === 'SELL' ? 'text-white' : 'text-zinc-600 hover:text-white'}`}>Sell Asset</button>
                            </div>
                            <div className="space-y-8 sm:space-y-10">
                                <div className="flex items-center justify-between px-2"><span className="text-[9px] sm:text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Select Quantity</span>{portfolio.find(p => p.ticker === selectedStock.ticker) && (<div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#DFFF00] italic">Owned: {portfolio.find(p => p.ticker === selectedStock.ticker).quantity}</div>)}</div>
                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-10">
                                    <div className="flex items-center flex-1 w-full bg-black border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-2 sm:p-3 px-4 sm:px-6 shadow-inner">
                                        <button onClick={() => setAmount(Math.max(1, amount - 1))} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-2xl sm:text-3xl text-zinc-500 hover:text-white transition-all active:scale-95">-</button>
                                        <input type="number" value={amount} onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))} className="flex-1 bg-transparent text-center text-4xl md:text-5xl font-black tracking-tighter outline-none text-white w-full min-w-0 italic" />
                                        <button onClick={() => setAmount(amount + 1)} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-2xl sm:text-3xl text-zinc-500 hover:text-white transition-all active:scale-95">+</button>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end min-w-[240px] md:border-l border-white/10 md:pl-10 p-4 md:p-0 bg-zinc-900/30 md:bg-transparent rounded-2xl md:rounded-none">
                                        <span className="text-[9px] sm:text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-2">Estimated Total</span>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">{(amount * selectedStock.currentPrice).toLocaleString()}</span>
                                            <span className="text-xs font-bold text-zinc-600 italic">CR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="p-6 sm:p-10 pt-4 sm:pt-6 bg-white/[0.02] border-t border-white/5 flex flex-col gap-6 safe-area-pb">
                        <button onClick={handleTrade} disabled={isTransacting} className={`w-full py-5 sm:py-7 font-black uppercase rounded-[2rem] sm:rounded-[2.5rem] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] text-sm tracking-widest italic ${tradeMode === 'BUY' ? 'bg-[#DFFF00] text-black hover:bg-white' : 'bg-red-600 text-white hover:bg-red-500'}`}>{isTransacting ? <RefreshCw className="animate-spin" size={24} /> : <>Confirm {tradeMode === 'BUY' ? 'Purchase' : 'Sale'} <ArrowRight size={20} /></>}</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}