'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  PieChart, 
  ArrowRight, 
  Briefcase,
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getMarketStatus, getPortfolio, buyStock, sellStock } from '@/app/play/stocks/actions';
import { Category } from '@/app/play/stocks/data';

// --- CANDLESTICK CHART COMPONENT ---
const CandlestickChart = ({ data }: { data: number[] }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    return (
        <div className="flex items-end justify-between gap-[2px] h-12 w-full mt-3 opacity-90">
            {data.map((close, i) => {
                if (i === 0) return null; // Need previous close to determine open
                const open = data[i-1];
                
                const isGreen = close >= open;
                const color = isGreen ? '#DFFF00' : '#ef4444'; // Zinc Green or Red
                
                // Simulate wicks (High/Low) based on volatility
                const candleTop = Math.max(open, close);
                const candleBottom = Math.min(open, close);
                const high = candleTop + (Math.random() * (range * 0.1)); 
                const low = candleBottom - (Math.random() * (range * 0.1));

                // Normalize for % height
                const getY = (val: number) => ((val - min) / range) * 100;
                
                const topPct = getY(high);
                const bottomPct = getY(low);
                const bodyTopPct = getY(candleTop);
                const bodyBottomPct = getY(candleBottom);
                const bodyHeight = Math.max(2, bodyTopPct - bodyBottomPct); // Min 2px body

                return (
                    <div key={i} className="relative flex-1 group h-full">
                        {/* WICK */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-[1px] bg-zinc-600"
                            style={{ 
                                bottom: `${bottomPct}%`, 
                                height: `${topPct - bottomPct}%` 
                            }} 
                        />
                        {/* BODY */}
                        <div 
                            className="absolute left-[1px] right-[1px] rounded-[1px] transition-all"
                            style={{ 
                                bottom: `${bodyBottomPct}%`, 
                                height: `${bodyHeight}%`,
                                backgroundColor: color,
                                boxShadow: isGreen ? `0 0 2px ${color}` : 'none'
                            }} 
                        />
                    </div>
                );
            })}
        </div>
    );
};

interface StockMarketViewProps {
    user: any;
    profile: any;
    refreshProfile: () => Promise<void>;
}

export function StockMarketView({ user, profile, refreshProfile }: StockMarketViewProps) {
  // Data State
  const [stocks, setStocks] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL' | 'PORTFOLIO'>('ALL');
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [amount, setAmount] = useState(1);
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [isTransacting, setIsTransacting] = useState(false);

  // Poll for price updates
  useEffect(() => {
    refreshMarket();
    const interval = setInterval(refreshMarket, 30000); 
    return () => clearInterval(interval);
  }, [user]);

  const refreshMarket = async () => {
    const [marketData, portfolioData] = await Promise.all([
        getMarketStatus(),
        getPortfolio()
    ]);
    setStocks(marketData);
    setPortfolio(portfolioData);
    setLoading(false);
  };

  const handleTrade = async () => {
    if (!selectedStock) return;
    setIsTransacting(true);

    let res;
    if (tradeMode === 'BUY') {
      res = await buyStock(selectedStock.ticker, amount);
    } else {
      res = await sellStock(selectedStock.ticker, amount);
    }

    if (res.success) {
      await refreshProfile();
      await refreshMarket();
      setSelectedStock(null);
      setAmount(1);
    } else {
      alert('Transaction Failed: ' + res.error);
    }
    setIsTransacting(false);
  };

  // --- MEMOIZED CALCULATIONS ---
  const { netWorth, totalPL, percentPL, isProfitable } = useMemo(() => {
      const currentVal = portfolio.reduce((acc, item) => {
          const stock = stocks.find(s => s.ticker === item.ticker);
          return acc + (item.quantity * (stock?.currentPrice || 0));
      }, 0);

      const costBasis = portfolio.reduce((acc, item) => {
          return acc + (item.quantity * (item.average_price || 0));
      }, 0);

      const pl = currentVal - costBasis;
      const perPl = costBasis > 0 ? (pl / costBasis) * 100 : 0;
      
      return {
          portfolioCurrentValue: currentVal,
          totalPL: pl,
          percentPL: perPl,
          isProfitable: pl >= 0,
          netWorth: (profile?.credits || 0) + currentVal
      };
  }, [portfolio, stocks, profile]);

  const marketHighlights = useMemo(() => {
      if (stocks.length === 0) return null;
      const sorted = [...stocks].sort((a, b) => b.change - a.change);
      return {
          topGainer: sorted[0],
          topLoser: sorted[sorted.length - 1],
      };
  }, [stocks]);

  // --- FILTERING ---
  const displayedStocks = selectedCategory === 'ALL' 
    ? stocks 
    : selectedCategory === 'PORTFOLIO' 
        ? stocks.filter(s => portfolio.some(p => p.ticker === s.ticker))
        : stocks.filter(s => s.category === selectedCategory);

  const categories = ['ALL', 'PORTFOLIO', 'TECH', 'FINANCE', 'ENERGY', 'CONSUMER', 'HEALTH', 'COMMODITIES'];

  return (
    <div className="animate-in fade-in duration-500 max-w-[1800px] mx-auto px-4 md:px-8 pb-32 pt-6">
      
      {/* MARKET STATS HEADER */}
      <div className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-3xl shadow-xl flex flex-col justify-between">
                <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Net Worth</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">{netWorth.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-600 font-bold tracking-widest">CR</span>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-3xl shadow-xl sm:col-span-2 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-colors ${isProfitable ? 'bg-[#DFFF00]' : 'bg-red-500'}`} />
                <div className="relative z-10 flex justify-between items-end h-full">
                    <div>
                        <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            Lifetime P/L
                            <div className={`w-1.5 h-1.5 rounded-full ${isProfitable ? 'bg-[#DFFF00]' : 'bg-red-500'} animate-pulse`} />
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className={`text-4xl font-black tracking-tighter ${isProfitable ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                                {isProfitable ? '+' : ''}{totalPL.toLocaleString()}
                            </span>
                            <span className={`text-sm font-mono font-bold ${isProfitable ? 'text-[#DFFF00]/60' : 'text-red-500/60'}`}>
                                ({percentPL.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                    <PieChart className={`opacity-10 transition-transform group-hover:scale-110 duration-700 ${isProfitable ? 'text-[#DFFF00]' : 'text-red-500'}`} size={60} />
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-3xl shadow-xl hidden lg:flex flex-col justify-between">
                 <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Active Assets</div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">{portfolio.length}</span>
                    <span className="text-[10px] text-zinc-600 font-bold tracking-widest">Positions</span>
                 </div>
            </div>
        </div>

        {/* MARKET HIGHLIGHTS */}
        {marketHighlights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                {/* Top Gainer */}
                <div 
                    className="group relative bg-white/[0.02] border border-white/5 hover:border-[#DFFF00]/30 p-6 rounded-3xl backdrop-blur-3xl flex items-center justify-between transition-all cursor-pointer overflow-hidden" 
                    onClick={() => setSelectedStock(marketHighlights.topGainer)}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#DFFF00]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-12 h-12 bg-zinc-950/50 rounded-2xl flex items-center justify-center text-[#DFFF00] border border-[#DFFF00]/20 group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Market Surge</div>
                            <div className="font-sans font-black tracking-tighter text-2xl text-white">{marketHighlights.topGainer.ticker} <span className="text-zinc-600 font-sans font-medium text-xs tracking-widest uppercase ml-2">{marketHighlights.topGainer.name}</span></div>
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <div className="text-[#DFFF00] font-sans font-black tracking-tighter text-3xl">+{marketHighlights.topGainer.change.toFixed(2)}%</div>
                        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">{marketHighlights.topGainer.currentPrice} Credits</div>
                    </div>
                </div>

                {/* Top Loser */}
                <div 
                    className="group relative bg-white/[0.02] border border-white/5 hover:border-red-500/30 p-6 rounded-3xl backdrop-blur-3xl flex items-center justify-between transition-all cursor-pointer overflow-hidden" 
                    onClick={() => setSelectedStock(marketHighlights.topLoser)}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-12 h-12 bg-zinc-950/50 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Market Correction</div>
                            <div className="font-sans font-black tracking-tighter text-2xl text-white">{marketHighlights.topLoser.ticker} <span className="text-zinc-600 font-sans font-medium text-xs tracking-widest uppercase ml-2">{marketHighlights.topLoser.name}</span></div>
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <div className="text-red-500 font-sans font-black tracking-tighter text-3xl">{marketHighlights.topLoser.change.toFixed(2)}%</div>
                        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">{marketHighlights.topLoser.currentPrice} Credits</div>
                    </div>
                </div>
            </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex overflow-x-auto gap-3 py-12 no-scrollbar scroll-smooth">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`
                        px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border
                        ${selectedCategory === cat 
                            ? 'bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.1)] scale-[1.05]' 
                            : 'bg-white/[0.03] border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/20'}
                    `}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* MARKET GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 text-[#DFFF00] gap-6">
             <div className="relative">
                <RefreshCw className="animate-spin text-[#DFFF00]" size={48} />
                <div className="absolute inset-0 blur-xl bg-[#DFFF00]/20 animate-pulse" />
             </div>
             <span className="text-xs tracking-[0.4em] font-black uppercase opacity-60">Synchronizing Exchange Protocols...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {displayedStocks.map((stock) => {
             const isPositive = stock.change >= 0;
             const owned = portfolio.find(p => p.ticker === stock.ticker);
             
             return (
               <button 
                  key={stock.ticker}
                  onClick={() => setSelectedStock(stock)}
                  className="group relative bg-white/[0.02] border border-white/5 hover:border-white/20 p-6 rounded-[2.5rem] text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl"
               >
                  <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                              <span className="text-2xl font-sans font-black tracking-tighter text-white group-hover:text-[#DFFF00] transition-colors">{stock.ticker}</span>
                              {owned && (
                                <div className="relative">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                    <div className="absolute inset-[-4px] border border-blue-500/20 rounded-full animate-ping" />
                                </div>
                              )}
                          </div>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] truncate max-w-[140px]">{stock.name}</span>
                      </div>
                      <div className={`flex flex-col items-end ${isPositive ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                          <span className="text-2xl font-sans font-black tracking-tighter leading-none">{stock.currentPrice}</span>
                          <div className="flex items-center gap-1 text-[10px] font-mono font-bold mt-2 opacity-80">
                              {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                          </div>
                      </div>
                  </div>

                  <div className="relative z-10">
                    <CandlestickChart data={stock.history} />
                  </div>

                  {/* Glass Hover Glow */}
                  <div className={`absolute bottom-0 left-0 h-1 transition-all duration-700 w-0 group-hover:w-full blur-[2px] ${isPositive ? 'bg-[#DFFF00]' : 'bg-red-500'}`} />
                  <div className={`absolute -bottom-12 -left-12 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${isPositive ? 'bg-[#DFFF00]' : 'bg-red-500'}`} />
               </button>
             );
          })}
        </div>
      )}

      {/* DETAILED TRADE MODAL - HIGH END MOBILE OPTIMIZED */}
      <AnimatePresence>
        {selectedStock && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-6 z-[100]"
                onClick={() => setSelectedStock(null)}
            >
                <motion.div 
                    initial={{ y: "100%", scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: "100%", scale: 0.95 }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="bg-[#080808] border-t sm:border border-white/10 w-full max-w-2xl max-h-[92vh] sm:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative shadow-black"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top Accent */}
                    <div className={`absolute top-0 left-0 w-full h-[2px] ${selectedStock.change >= 0 ? 'bg-[#DFFF00]' : 'bg-red-500'} shadow-[0_0_20px_currentColor] z-50`} />

                    {/* Header */}
                    <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex flex-col gap-8">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-5xl sm:text-6xl font-sans font-black tracking-tighter text-white leading-none">{selectedStock.ticker}</h3>
                                        <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] text-zinc-400 font-mono font-bold tracking-[0.2em] border border-white/10 uppercase">{selectedStock.category}</span>
                                    </div>
                                    <p className="text-zinc-500 font-medium tracking-wide uppercase text-sm">{selectedStock.name}</p>
                                </div>
                                <button onClick={() => setSelectedStock(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white border border-white/5">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex items-end justify-between border-t border-white/5 pt-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-1">Current Valuation</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-sans font-black tracking-tighter text-white tabular-nums">{selectedStock.currentPrice}</span>
                                        <span className="text-xs text-zinc-600 font-bold tracking-[0.2em]">CR</span>
                                    </div>
                                </div>
                                <div className={`flex flex-col items-end ${selectedStock.change >= 0 ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                                    <span className="text-xl font-mono font-bold">{selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}%</span>
                                    <span className="text-[9px] uppercase tracking-widest font-black opacity-60">Volatility Level High</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* CHART SECTION */}
                        <div className="p-8 sm:p-10 pb-4">
                            <div className="h-48 w-full bg-black/40 rounded-[2rem] p-6 flex items-end gap-1.5 border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
                                {selectedStock.history.map((val: number, i: number) => {
                                    const min = Math.min(...selectedStock.history);
                                    const max = Math.max(...selectedStock.history);
                                    const h = ((val - min) / (max - min || 1)) * 100;
                                    return (
                                        <div key={i} className={`flex-1 transition-all duration-500 rounded-t-sm relative group/bar ${selectedStock.change >= 0 ? 'bg-white/10 hover:bg-[#DFFF00]' : 'bg-white/10 hover:bg-red-500'}`} style={{ height: `${Math.max(8, h)}%` }}>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-zinc-900 text-white text-[10px] px-3 py-1.5 rounded-xl border border-white/10 opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-50 pointer-events-none font-mono font-bold shadow-2xl">
                                                {val} CR
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between mt-4 px-2 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
                                <span>Session Start</span>
                                <span>Trading Frequency: 30s</span>
                                <span>Real-time Update</span>
                            </div>
                        </div>

                        {/* TRADING SECTION */}
                        <div className="p-8 sm:p-10 pt-4">
                            {/* Mode Toggle */}
                            <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5 relative">
                                <div 
                                    className={`absolute inset-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-500 ease-out shadow-xl ${tradeMode === 'BUY' ? 'left-1.5 bg-white' : 'left-[calc(50%+3px)] bg-red-600'}`} 
                                />
                                <button 
                                    onClick={() => setTradeMode('BUY')}
                                    className={`flex-1 py-4 font-black uppercase text-xs tracking-[0.2em] relative z-10 transition-colors duration-500 ${tradeMode === 'BUY' ? 'text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Purchase
                                </button>
                                <button 
                                    onClick={() => setTradeMode('SELL')}
                                    className={`flex-1 py-4 font-black uppercase text-xs tracking-[0.2em] relative z-10 transition-colors duration-500 ${tradeMode === 'SELL' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Liquidate
                                </button>
                            </div>

                            {/* Order Quantity */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Quantity Selector</span>
                                    {portfolio.find(p => p.ticker === selectedStock.ticker) && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#DFFF00]/60">
                                            <Briefcase size={12} />
                                            Owned: {portfolio.find(p => p.ticker === selectedStock.ticker).quantity}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                                    <div className="flex items-center flex-1 w-full bg-black/40 border border-white/5 rounded-3xl p-2 px-4 focus-within:border-white/20 transition-all shadow-inner">
                                        <button 
                                            onClick={() => setAmount(Math.max(1, amount - 1))} 
                                            className="w-14 h-14 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-2xl text-zinc-400 hover:text-white transition-all active:scale-90"
                                        >-</button>
                                        <input 
                                            type="number" 
                                            value={amount} 
                                            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                                            className="flex-1 bg-transparent text-center text-4xl font-sans font-black tracking-tighter outline-none text-white w-full min-w-0"
                                        />
                                        <button 
                                            onClick={() => setAmount(amount + 1)} 
                                            className="w-14 h-14 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-2xl text-zinc-400 hover:text-white transition-all active:scale-90"
                                        >+</button>
                                    </div>

                                    <div className="flex flex-col items-center sm:items-end min-w-[160px] border-l border-white/5 pl-8 hidden sm:flex">
                                        <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-1">Estimated Total</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-sans font-black tracking-tighter text-white">{(amount * selectedStock.currentPrice).toLocaleString()}</span>
                                            <span className="text-[10px] font-black text-zinc-600">CR</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:hidden w-full h-px bg-white/5 my-4" />
                                <div className="sm:hidden flex justify-between items-end px-2">
                                    <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">Total Order Value</span>
                                    <span className="text-3xl font-sans font-black tracking-tighter text-white">{(amount * selectedStock.currentPrice).toLocaleString()} <span className="text-[10px] font-sans">CR</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 sm:p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <button 
                            onClick={handleTrade} 
                            disabled={isTransacting}
                            className={`w-full py-6 font-black uppercase rounded-[2rem] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] text-sm tracking-[0.25em] ${tradeMode === 'BUY' ? 'bg-[#DFFF00] text-black hover:shadow-[#DFFF00]/20' : 'bg-red-600 text-white hover:shadow-red-600/20'}`}
                        >
                            {isTransacting ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <>Authorize {tradeMode} Protocol <ArrowRight size={18} /></>
                            )}
                        </button>
                        <p className="text-center mt-6 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] opacity-60">Zinc Economic Security Encrypted Link // End-to-End Auth</p>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
