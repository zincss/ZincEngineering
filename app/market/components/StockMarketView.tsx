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
import { TradeModal } from '@/app/components/TradeModal';

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

  const handleTrade = async (type: 'BUY' | 'SELL', quantity: number) => {
    if (!selectedStock) return;
    setIsTransacting(true);
    const res = type === 'BUY' ? await buyStock(selectedStock.ticker, quantity) : await sellStock(selectedStock.ticker, quantity);
    if (res.success) { await refreshProfile(); await refreshMarket(); setSelectedStock(null); setAmount(1); }
    else { alert('Transaction Failed: ' + res.error); }
    setIsTransacting(false);
  };

  const { portfolioCurrentValue, totalPL, percentPL, isProfitable, dailyPL } = useMemo(() => {
      const currentVal = portfolio.reduce((acc, item) => { const stock = stocks.find(s => s.ticker === item.ticker); return acc + (item.quantity * (stock?.currentPrice || 0)); }, 0);
      const costBasis = portfolio.reduce((acc, item) => acc + (item.quantity * (item.average_price || 0)), 0);
      
      const dayPL = portfolio.reduce((acc, item) => {
          const stock = stocks.find(s => s.ticker === item.ticker);
          if (!stock) return acc;
          const openPrice = stock.currentPrice / (1 + (stock.change / 100));
          const gain = (stock.currentPrice - openPrice) * item.quantity;
          return acc + gain;
      }, 0);

      const pl = currentVal - costBasis;
      return { 
          portfolioCurrentValue: currentVal, 
          totalPL: pl, 
          percentPL: costBasis > 0 ? (pl / costBasis) * 100 : 0, 
          isProfitable: pl >= 0,
          dailyPL: dayPL
      };
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20">
          {/* LEFT: PORTFOLIO SNAPSHOT */}
          <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <div className="flex flex-col h-full justify-between gap-8">
                  <div>
                      <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">My Portfolio</h3>
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                          <span className="text-5xl md:text-7xl font-black text-white tabular-nums tracking-tight">{(profile?.credits + portfolioCurrentValue).toLocaleString()}</span>
                          <span className="text-xl font-bold text-zinc-500">Credits</span>
                      </div>
                      <div className={`mt-2 text-sm font-bold flex items-center gap-2 ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isProfitable ? '+' : ''}{totalPL.toLocaleString()} CR ({percentPL.toFixed(2)}%)
                          <span className="text-zinc-600 font-normal">All Time</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                          <div>
                              <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Cash Balance</div>
                              <div className="text-xl font-black text-white">{(profile?.credits || 0).toLocaleString()}</div>
                          </div>
                          <Briefcase className="text-zinc-700" size={20} />
                      </div>
                      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                          <div>
                              <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Invested</div>
                              <div className="text-xl font-black text-[#DFFF00]">{portfolioCurrentValue.toLocaleString()}</div>
                          </div>
                          <BarChart3 className="text-zinc-700" size={20} />
                      </div>
                      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                          <div>
                              <div className="text-xs font-bold text-zinc-500 uppercase mb-1">24h Return</div>
                              <div className={`text-xl font-black ${dailyPL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {dailyPL >= 0 ? '+' : ''}{Math.floor(dailyPL).toLocaleString()}
                              </div>
                          </div>
                          <Activity className={dailyPL >= 0 ? 'text-emerald-500' : 'text-red-500'} size={20} />
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT: TOP MOVERS */}
          <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Market Movers</h3>
                  <Activity size={16} className="text-zinc-600" />
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                  {marketLeaders.gainer ? (
                      <button onClick={() => setSelectedStock(marketLeaders.gainer)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors group text-left">
                          <div className="flex justify-between items-start mb-2">
                              <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
                                  <TrendingUp size={18} />
                              </div>
                              <span className="text-emerald-500 font-black text-xl">+{marketLeaders.gainer.change.toFixed(1)}%</span>
                          </div>
                          <div>
                              <div className="font-bold text-zinc-500 text-xs uppercase mb-0.5">Top Gainer</div>
                              <div className="font-black text-2xl text-white group-hover:text-emerald-400 transition-colors">{marketLeaders.gainer.ticker}</div>
                          </div>
                      </button>
                  ) : (
                      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-center text-zinc-600 text-xs font-bold uppercase">No Gainers</div>
                  )}

                  {marketLeaders.loser ? (
                      <button onClick={() => setSelectedStock(marketLeaders.loser)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-red-500/50 transition-colors group text-left">
                          <div className="flex justify-between items-start mb-2">
                              <div className="bg-red-500/10 text-red-500 p-2 rounded-lg">
                                  <TrendingDown size={18} />
                              </div>
                              <span className="text-red-500 font-black text-xl">{marketLeaders.loser.change.toFixed(1)}%</span>
                          </div>
                          <div>
                              <div className="font-bold text-zinc-500 text-xs uppercase mb-0.5">Top Loser</div>
                              <div className="font-black text-2xl text-white group-hover:text-red-400 transition-colors">{marketLeaders.loser.ticker}</div>
                          </div>
                      </button>
                  ) : (
                      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-center text-zinc-600 text-xs font-bold uppercase">No Losers</div>
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
            <TradeModal 
                stock={selectedStock}
                portfolio={portfolio}
                onClose={() => setSelectedStock(null)}
                onTrade={handleTrade}
                isTransacting={isTransacting}
            />
        )}
      </AnimatePresence>
    </div>
  );
}
