'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getMarketStatus, getPortfolio, buyStock, sellStock } from './actions';
import BackButton from '@/app/components/BackButton';
import { TrendingUp, TrendingDown, RefreshCw, Activity, Wallet, PieChart, ArrowRight, BarChart3 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { Category } from './data';

// --- MINI CHART COMPONENT ---
const MiniChart = ({ data, color }: { data: number[], color: string }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    return (
        <div className="flex items-end gap-[2px] h-10 w-full mt-3 opacity-80">
            {data.map((val, i) => {
                const height = ((val - min) / range) * 100;
                return (
                    <div 
                        key={i} 
                        style={{ height: `${Math.max(10, height)}%`, backgroundColor: color }} 
                        className="flex-1 rounded-t-[1px]" 
                    />
                );
            })}
        </div>
    );
};

export default function StockMarketPage() {
  const { user, profile, refreshProfile } = useAuth();
  
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
      {/* BACKGROUND FIX: pointer-events-none allows clicks to pass through */}
      <div className="bg-grid-pattern opacity-5 absolute inset-0 fixed pointer-events-none" />
      
      <BackButton href="/play" label="ARCADE HUB" />
      
      {/* HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto pt-20 mb-8">
        <div className="flex flex-col xl:flex-row justify-between items-end border-b border-zinc-800/50 pb-8 gap-8">
            
            {/* BRANDING */}
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-[#DFFF00]/10 rounded-xl border border-[#DFFF00]/20">
                        <Activity className="text-[#DFFF00]" size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                        Zinc <span className="text-zinc-600">Exchange</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse shadow-[0_0_10px_#DFFF00]" />
                        Market Live
                    </span>
                    <span>|</span>
                    <span>Volatile Simulation Protocol</span>
                </div>
            </div>

            {/* GLOBAL STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Liquid Capital</div>
                    <div className="text-lg font-black text-[#DFFF00]">{profile?.credits.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Net Worth</div>
                    <div className="text-lg font-black text-white">{netWorth.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm col-span-2 md:col-span-2 relative overflow-hidden group">
                    <div className={`absolute inset-0 opacity-10 transition-colors ${isProfitable ? 'bg-[#DFFF00]' : 'bg-red-500'}`} />
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Lifetime P/L</div>
                            <div className={`text-xl font-black ${isProfitable ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                                {isProfitable ? '+' : ''}{totalPL.toLocaleString()} <span className="text-xs opacity-70">({percentPL.toFixed(2)}%)</span>
                            </div>
                        </div>
                        <PieChart className={`opacity-20 ${isProfitable ? 'text-[#DFFF00]' : 'text-red-500'}`} size={40} />
                    </div>
                </div>
            </div>
        </div>

        {/* MARKET HIGHLIGHTS */}
        {marketHighlights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Top Gainer */}
                <div className="group bg-zinc-900/30 border border-zinc-800 hover:border-[#DFFF00]/50 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer" onClick={() => setSelectedStock(marketHighlights.topGainer)}>
                    <div className="flex items-center gap-4">
                        <div className="bg-zinc-950 p-2 rounded-lg text-[#DFFF00]">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Top Gainer</div>
                            <div className="font-black text-lg text-white">{marketHighlights.topGainer.ticker} <span className="text-zinc-500 font-normal text-xs">{marketHighlights.topGainer.name}</span></div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[#DFFF00] font-bold text-xl">+{marketHighlights.topGainer.change.toFixed(2)}%</div>
                        <div className="text-zinc-500 text-xs font-mono">{marketHighlights.topGainer.currentPrice} CR</div>
                    </div>
                </div>

                {/* Top Loser */}
                <div className="group bg-zinc-900/30 border border-zinc-800 hover:border-red-900/50 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer" onClick={() => setSelectedStock(marketHighlights.topLoser)}>
                    <div className="flex items-center gap-4">
                        <div className="bg-zinc-950 p-2 rounded-lg text-red-500">
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Top Loser</div>
                            <div className="font-black text-lg text-white">{marketHighlights.topLoser.ticker} <span className="text-zinc-500 font-normal text-xs">{marketHighlights.topLoser.name}</span></div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-red-500 font-bold text-xl">{marketHighlights.topLoser.change.toFixed(2)}%</div>
                        <div className="text-zinc-500 text-xs font-mono">{marketHighlights.topLoser.currentPrice} CR</div>
                    </div>
                </div>
            </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex overflow-x-auto gap-2 py-8 custom-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`
                        px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                        ${selectedCategory === cat 
                            ? 'bg-zinc-100 text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 hover:border-zinc-600'}
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
             <span className="text-sm tracking-widest font-bold">ESTABLISHING SECURE UPLINK...</span>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {displayedStocks.map((stock) => {
             const isPositive = stock.change >= 0;
             const owned = portfolio.find(p => p.ticker === stock.ticker);
             
             return (
               <button 
                  key={stock.ticker}
                  onClick={() => setSelectedStock(stock)}
                  className="group relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 p-5 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-2xl overflow-hidden backdrop-blur-sm"
               >
                  <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-white group-hover:text-[#DFFF00] transition-colors">{stock.ticker}</span>
                              {owned && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate max-w-[120px]">{stock.name}</span>
                      </div>
                      <div className={`flex flex-col items-end ${isPositive ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                          <span className="text-lg font-black">{stock.currentPrice}</span>
                          <div className="flex items-center gap-1 text-[10px] font-bold bg-black/40 px-1.5 py-0.5 rounded">
                              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {stock.change.toFixed(2)}%
                          </div>
                      </div>
                  </div>

                  {/* HISTORY CHART */}
                  <MiniChart data={stock.history} color={isPositive ? '#DFFF00' : '#ef4444'} />

                  {/* Hover Effect */}
                  <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-300 w-0 group-hover:w-full ${isPositive ? 'bg-[#DFFF00]' : 'bg-red-500'}`} />
               </button>
             );
          })}
        </div>
      )}

      {/* DETAILED TRADE MODAL */}
      {selectedStock && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-200">
            <div 
                className="bg-zinc-950 border border-zinc-800 p-0 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
            >
               {/* Modal Header */}
               <div className="p-8 pb-4 border-b border-zinc-800 bg-zinc-900/50">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-5xl font-black uppercase tracking-tighter text-white">{selectedStock.ticker}</h3>
                            <span className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] text-zinc-400 font-bold tracking-widest border border-zinc-700">{selectedStock.category}</span>
                        </div>
                        <p className="text-zinc-400 text-sm font-bold">{selectedStock.name}</p>
                        <p className="text-zinc-600 text-xs mt-1 italic max-w-sm">{selectedStock.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-white">{selectedStock.currentPrice}</div>
                        <div className={`text-sm font-bold flex justify-end items-center gap-1 mt-1 ${selectedStock.change >= 0 ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                             {selectedStock.change.toFixed(2)}% Today
                        </div>
                      </div>
                   </div>

                   {/* BIG CHART */}
                   <div className="h-40 w-full bg-black/40 rounded-xl p-4 flex items-end gap-1 mb-4 border border-zinc-800/50">
                        {selectedStock.history.map((val: number, i: number) => {
                            const min = Math.min(...selectedStock.history);
                            const max = Math.max(...selectedStock.history);
                            const h = ((val - min) / (max - min || 1)) * 100;
                            return (
                                <div key={i} className="flex-1 bg-zinc-700 hover:bg-[#DFFF00] transition-colors rounded-t-sm relative group" style={{ height: `${Math.max(5, h)}%` }}>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded border border-zinc-700 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none font-bold shadow-xl">
                                        {val} CR
                                    </div>
                                </div>
                            )
                        })}
                   </div>
               </div>

               {/* TRADING INTERFACE */}
               <div className="p-8">
                   
                   {/* Toggle */}
                   <div className="flex bg-zinc-900 p-1.5 rounded-xl mb-8 border border-zinc-800">
                      <button 
                        onClick={() => setTradeMode('BUY')}
                        className={`flex-1 py-3 font-black uppercase rounded-lg transition-all text-sm tracking-widest ${tradeMode === 'BUY' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                      >
                        Buy
                      </button>
                      <button 
                        onClick={() => setTradeMode('SELL')}
                        className={`flex-1 py-3 font-black uppercase rounded-lg transition-all text-sm tracking-widest ${tradeMode === 'SELL' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                      >
                        Sell
                      </button>
                   </div>

                   {/* User Stats */}
                   {portfolio.find(p => p.ticker === selectedStock.ticker) ? (
                       <div className="mb-6 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex justify-between items-center text-sm">
                           <div className="flex flex-col">
                               <span className="text-zinc-500 text-xs uppercase font-bold">Your Position</span>
                               <span className="font-bold text-white text-lg flex items-center gap-2">
                                   <Briefcase size={16} className="text-blue-400" />
                                   {portfolio.find(p => p.ticker === selectedStock.ticker).quantity} Shares
                               </span>
                           </div>
                           <div className="flex flex-col text-right">
                               <span className="text-zinc-500 text-xs uppercase font-bold">Avg Price</span>
                               <span className="font-mono text-zinc-300">{portfolio.find(p => p.ticker === selectedStock.ticker).average_price.toFixed(2)}</span>
                           </div>
                       </div>
                   ) : (
                        <div className="mb-6 bg-zinc-900/30 border border-dashed border-zinc-800 p-4 rounded-xl text-center text-xs text-zinc-600 uppercase font-bold tracking-widest">
                            You do not own this asset
                        </div>
                   )}

                   {/* Quantity Input */}
                   <div className="mb-8">
                      <div className="flex justify-between mb-2">
                          <label className="text-xs font-bold uppercase text-zinc-500">Order Quantity</label>
                          <label className="text-xs font-bold uppercase text-zinc-500">Total {tradeMode === 'BUY' ? 'Cost' : 'Value'}</label>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-2 focus-within:border-[#DFFF00] transition-colors">
                             <button onClick={() => setAmount(Math.max(1, amount - 1))} className="w-12 h-12 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-2xl text-zinc-400 hover:text-white transition-colors">-</button>
                             <input 
                               type="number" 
                               value={amount} 
                               onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                               className="flex-1 bg-transparent text-center text-3xl font-black outline-none text-white"
                             />
                             <button onClick={() => setAmount(amount + 1)} className="w-12 h-12 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-2xl text-zinc-400 hover:text-white transition-colors">+</button>
                         </div>
                         <div className="text-right min-w-[120px]">
                             <div className="text-3xl font-black text-white">{(amount * selectedStock.currentPrice).toFixed(0)}</div>
                             <div className="text-xs text-zinc-500 font-bold tracking-widest">CREDITS</div>
                         </div>
                      </div>
                   </div>

                   {/* Action Buttons */}
                   <div className="grid grid-cols-3 gap-4">
                      <button onClick={() => setSelectedStock(null)} className="col-span-1 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase rounded-xl hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all text-xs tracking-widest">
                          Cancel
                      </button>
                      <button 
                        onClick={handleTrade} 
                        disabled={isTransacting}
                        className={`col-span-2 py-4 font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 text-sm tracking-widest ${tradeMode === 'BUY' ? 'bg-[#DFFF00] text-black hover:bg-white' : 'bg-red-600 text-white hover:bg-red-500'}`}
                      >
                        {isTransacting ? <RefreshCw className="animate-spin" /> : `CONFIRM ${tradeMode}`} <ArrowRight size={16} />
                      </button>
                   </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}