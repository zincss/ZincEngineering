'use client';

import React, { useEffect, useState } from 'react';
import { getMarketStatus, buyStock, sellStock } from './actions';
import BackButton from '@/app/components/BackButton';
import { TrendingUp, TrendingDown, RefreshCw, Briefcase, Activity } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function StockMarketPage() {
  const { profile, refreshProfile } = useAuth();
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [amount, setAmount] = useState(1);
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [isTransacting, setIsTransacting] = useState(false);

  // Poll for price updates every 10 seconds
  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarket = async () => {
    const data = await getMarketStatus();
    setStocks(data);
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
      alert(`Trade Executed: ${tradeMode} ${amount} ${selectedStock.ticker} @ ${res.price}`);
      refreshProfile();
      fetchMarket();
      setSelectedStock(null);
    } else {
      alert('Transaction Failed: ' + res.error);
    }
    setIsTransacting(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-green-900/10 to-transparent pointer-events-none" />
      
      <BackButton href="/play" label="ARCADE" />
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto pt-20 mb-12 flex flex-col md:flex-row justify-between items-end border-b border-zinc-800 pb-6 relative z-10">
        <div>
           <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 flex items-center gap-4">
              ZNX Exchange
              <Activity className="text-[#DFFF00] animate-pulse" size={48} />
           </h1>
           <p className="text-zinc-400 font-mono">Real-time volatility simulation. Buy low, sell high, don't panic.</p>
        </div>
        <div className="text-right mt-6 md:mt-0">
           <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Liquid Capital</div>
           <div className="text-3xl font-mono text-[#DFFF00]">{profile?.credits.toLocaleString()} CR</div>
        </div>
      </div>

      {/* MARKET BOARD */}
      {loading ? (
        <div className="text-center text-[#DFFF00] font-mono animate-pulse">CONNECTING TO ZINC EXCHANGE...</div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {stocks.map((stock) => {
             const isPositive = stock.change >= 0;
             return (
               <button 
                  key={stock.ticker}
                  onClick={() => setSelectedStock(stock)}
                  className="group relative bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] p-6 rounded-xl text-left transition-all hover:-translate-y-1"
               >
                  <div className="flex justify-between items-start mb-4">
                      <div className="bg-black/50 p-2 rounded text-xl font-black font-mono">{stock.ticker}</div>
                      <div className={`flex items-center gap-1 font-mono text-sm ${isPositive ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          {stock.change.toFixed(2)}%
                      </div>
                  </div>
                  
                  <div className="mb-2">
                      <div className="text-zinc-400 text-xs uppercase font-bold tracking-widest">{stock.name}</div>
                      <div className="text-3xl font-black">{stock.currentPrice} <span className="text-sm text-zinc-600 font-normal">CR</span></div>
                  </div>

                  <div className="text-zinc-500 text-xs truncate font-mono">
                      {stock.description}
                  </div>
                  
                  {/* Hover Effect Bar */}
                  <div className={`absolute bottom-0 left-0 h-1 transition-all duration-300 w-0 group-hover:w-full ${isPositive ? 'bg-[#DFFF00]' : 'bg-red-500'}`} />
               </button>
             );
          })}
        </div>
      )}

      {/* TRADE MODAL */}
      {selectedStock && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-[#DFFF00] p-8 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(223,255,0,0.1)]">
               
               {/* Modal Header */}
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-4xl font-black uppercase mb-1">{selectedStock.ticker}</h3>
                    <p className="text-zinc-400">{selectedStock.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-mono text-[#DFFF00]">{selectedStock.currentPrice}</div>
                    <div className="text-xs text-zinc-500 uppercase">Current Price</div>
                  </div>
               </div>

               {/* Buy/Sell Toggle */}
               <div className="flex bg-black p-1 rounded-lg mb-8">
                  <button 
                    onClick={() => setTradeMode('BUY')}
                    className={`flex-1 py-3 font-black uppercase rounded transition-all ${tradeMode === 'BUY' ? 'bg-[#DFFF00] text-black' : 'text-zinc-500 hover:text-white'}`}
                  >
                    Buy
                  </button>
                  <button 
                    onClick={() => setTradeMode('SELL')}
                    className={`flex-1 py-3 font-black uppercase rounded transition-all ${tradeMode === 'SELL' ? 'bg-red-500 text-white' : 'text-zinc-500 hover:text-white'}`}
                  >
                    Sell
                  </button>
               </div>

               {/* Input */}
               <div className="mb-8">
                  <label className="text-xs font-bold uppercase text-zinc-500 mb-2 block">Quantity</label>
                  <div className="flex items-center gap-4">
                     <button onClick={() => setAmount(Math.max(1, amount - 1))} className="w-12 h-12 bg-zinc-800 rounded hover:bg-zinc-700 flex items-center justify-center font-bold text-xl">-</button>
                     <input 
                       type="number" 
                       value={amount} 
                       onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                       className="flex-1 bg-black border border-zinc-700 p-3 rounded text-center text-2xl font-mono focus:border-[#DFFF00] outline-none"
                     />
                     <button onClick={() => setAmount(amount + 1)} className="w-12 h-12 bg-zinc-800 rounded hover:bg-zinc-700 flex items-center justify-center font-bold text-xl">+</button>
                  </div>
               </div>

               {/* Summary */}
               <div className="bg-zinc-950 p-4 rounded border border-zinc-800 mb-8">
                  <div className="flex justify-between text-sm mb-2">
                     <span className="text-zinc-500">Transaction Value</span>
                     <span className="font-mono text-white">{(amount * selectedStock.currentPrice).toFixed(2)} CR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-zinc-500">Transaction Fee</span>
                     <span className="font-mono text-[#DFFF00]">0.00 CR</span>
                  </div>
               </div>

               {/* Actions */}
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setSelectedStock(null)} className="py-4 bg-zinc-800 font-bold uppercase rounded hover:bg-zinc-700 transition-colors">Cancel</button>
                  <button 
                    onClick={handleTrade} 
                    disabled={isTransacting}
                    className={`py-4 font-black uppercase rounded transition-all flex items-center justify-center gap-2 ${tradeMode === 'BUY' ? 'bg-[#DFFF00] text-black hover:bg-white' : 'bg-red-500 text-white hover:bg-red-400'}`}
                  >
                    {isTransacting ? <RefreshCw className="animate-spin" /> : `CONFIRM ${tradeMode}`}
                  </button>
               </div>

            </div>
         </div>
      )}
    </div>
  );
}