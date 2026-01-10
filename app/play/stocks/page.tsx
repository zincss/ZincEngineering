'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getMarketStatus, getPortfolio, buyStock, sellStock } from './actions';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Activity, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { Category } from './data';
import { StockChart } from '@/app/components/StockChart';
import { TradeModal } from '@/app/components/TradeModal';

export default function StockMarketPage() {
  const { user, profile, refreshProfile } = useAuth();
  
  // Data State
  const [stocks, setStocks] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL' | 'PORTFOLIO'>('ALL');
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
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

  const handleTrade = async (type: 'BUY' | 'SELL', quantity: number) => {
    if (!selectedStock) return;
    setIsTransacting(true);

    let res;
    if (type === 'BUY') {
      res = await buyStock(selectedStock.ticker, quantity);
    } else {
      res = await sellStock(selectedStock.ticker, quantity);
    }

    if (res.success) {
      await refreshProfile();
      await refreshMarket();
      setSelectedStock(null);
    } else {
      alert('Transaction Failed: ' + res.error);
    }
    setIsTransacting(false);
  };

  // --- MEMOIZED CALCULATIONS ---
  const { netWorth, portfolioCurrentValue, totalPL, percentPL, isProfitable } = useMemo(() => {
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
    <div className="min-h-screen bg-zinc-950 text-white p-4 pb-32 relative overflow-x-hidden font-mono">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>
      
      {/* HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto pt-20 mb-12">
        <div className="flex flex-col xl:flex-row justify-between items-end border-b border-zinc-800 pb-12 gap-8">
            
            {/* BRANDING */}
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                    <Activity size={24} className="text-[#DFFF00]" />
                </div>
                <div>
                    <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                        <span>MARKET_PROTOCOL // v2.0</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">
                        Zinc <span className="text-zinc-800">Exchange</span>
                    </h1>
                </div>
            </div>

            {/* GLOBAL STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl w-full xl:w-auto">
                <div className="bg-zinc-900 p-6 flex flex-col justify-center">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Liquid Capital</div>
                    <div className="text-lg font-black text-[#DFFF00]">{profile?.credits.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-900 p-6 flex flex-col justify-center">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Net Worth</div>
                    <div className="text-lg font-black text-white">{netWorth.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-900 p-6 col-span-2 md:col-span-2 relative overflow-hidden group">
                    <div className={`absolute inset-0 opacity-10 transition-colors ${isProfitable ? 'bg-[#DFFF00]' : 'bg-red-500'}`} />
                    <div className="relative z-10 flex justify-between items-center h-full">
                        <div>
                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Lifetime P/L</div>
                            <div className={`text-xl font-black ${isProfitable ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                                {isProfitable ? '+' : ''}{totalPL.toLocaleString()} <span className="text-xs opacity-70">({percentPL.toFixed(2)}%)</span>
                            </div>
                        </div>
                        <Activity className={`opacity-20 ${isProfitable ? 'text-[#DFFF00]' : 'text-red-500'}`} size={32} />
                    </div>
                </div>
            </div>
        </div>

        {/* MARKET HIGHLIGHTS */}
        {marketHighlights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Top Gainer */}
                <div className="group bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] p-6 rounded-2xl flex items-center justify-between transition-all cursor-pointer shadow-lg" onClick={() => setSelectedStock(marketHighlights.topGainer)}>
                    <div className="flex items-center gap-4">
                        <div className="bg-zinc-950 p-3 rounded-xl text-[#DFFF00] border border-zinc-800">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Top Gainer</div>
                            <div className="font-black text-2xl text-white tracking-tight">{marketHighlights.topGainer.ticker} <span className="text-zinc-600 font-medium text-xs tracking-normal ml-2">{marketHighlights.topGainer.name}</span></div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[#DFFF00] font-black text-xl tracking-tighter">+{marketHighlights.topGainer.change.toFixed(2)}%</div>
                        <div className="text-zinc-500 text-xs font-mono">{marketHighlights.topGainer.currentPrice} CR</div>
                    </div>
                </div>

                {/* Top Loser */}
                <div className="group bg-zinc-900 border border-zinc-800 hover:border-red-500 p-6 rounded-2xl flex items-center justify-between transition-all cursor-pointer shadow-lg" onClick={() => setSelectedStock(marketHighlights.topLoser)}>
                    <div className="flex items-center gap-4">
                        <div className="bg-zinc-950 p-3 rounded-xl text-red-500 border border-zinc-800">
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Top Loser</div>
                            <div className="font-black text-2xl text-white tracking-tight">{marketHighlights.topLoser.ticker} <span className="text-zinc-600 font-medium text-xs tracking-normal ml-2">{marketHighlights.topLoser.name}</span></div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-red-500 font-black text-xl tracking-tighter">{marketHighlights.topLoser.change.toFixed(2)}%</div>
                        <div className="text-zinc-500 text-xs font-mono">{marketHighlights.topLoser.currentPrice} CR</div>
                    </div>
                </div>
            </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex overflow-x-auto gap-2 py-8 custom-scrollbar no-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`
                        px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border
                        ${selectedCategory === cat 
                            ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_20px_rgba(223,255,0,0.3)]' 
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600'}
                    `}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* MARKET GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#DFFF00] gap-4">
             <RefreshCw className="animate-spin" size={32} />
             <span className="text-xs font-mono uppercase tracking-widest">ESTABLISHING SECURE UPLINK...</span>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[1px] bg-zinc-800 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
          {displayedStocks.map((stock) => {
             const isPositive = stock.change >= 0;
             const owned = portfolio.find(p => p.ticker === stock.ticker);
             
             return (
               <button 
                  key={stock.ticker}
                  onClick={() => setSelectedStock(stock)}
                  className="group relative bg-zinc-950 hover:bg-[#DFFF00] p-6 text-left transition-colors duration-200 overflow-hidden h-48 flex flex-col justify-between"
               >
                  <div className="flex justify-between items-start relative z-10 w-full">
                      <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl font-black text-white group-hover:text-black transition-colors tracking-tighter">{stock.ticker}</span>
                              {owned && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />}
                          </div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest truncate max-w-[120px] group-hover:text-black/60">{stock.name}</span>
                      </div>
                      <div className={`flex flex-col items-end ${isPositive ? 'text-[#DFFF00] group-hover:text-black' : 'text-red-500 group-hover:text-red-700'}`}>
                          <span className="text-xl font-black tracking-tighter">{stock.currentPrice}</span>
                          <div className="flex items-center gap-1 text-[9px] font-bold bg-zinc-900/50 px-1.5 py-0.5 rounded group-hover:bg-black/10 transition-colors">
                              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {stock.change.toFixed(2)}%
                          </div>
                      </div>
                  </div>

                  {/* SMALL CHART */}
                  <div className="w-full h-16 opacity-50 group-hover:opacity-100 transition-opacity">
                     <StockChart data={stock.history} type="candle" height="100%" />
                  </div>
               </button>
             );
          })}
        </div>
      )}

      {/* DETAILED TRADE MODAL */}
      {selectedStock && (
         <TradeModal 
            stock={selectedStock}
            portfolio={portfolio}
            onClose={() => setSelectedStock(null)}
            onTrade={handleTrade}
            isTransacting={isTransacting}
         />
      )}
    </div>
  );
}
