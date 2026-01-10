'use client';

import React, { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getMarketStatus } from '@/app/play/stocks/actions';

export default function StockTicker() {
  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
          const data = await getMarketStatus();
          setStocks(data);
      } catch (e) {
          console.error("Stock Ticker Error", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-[#DFFF00] py-1.5 overflow-hidden flex items-center z-30 shadow-2xl">
      <div className="w-full">
        <Marquee gradient={false} speed={40} className="flex items-center h-full">
           {stocks.map((stock, i) => {
             const isPositive = stock.change >= 0;
             return (
               <div key={i} className="flex items-center gap-4 mx-6 select-none">
                  <span className="text-black/30 text-[10px] font-black italic">//</span>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-black italic">
                     <span className="opacity-40">{stock.category}</span>
                     <span className="text-black">{stock.ticker}</span>
                     <span className="font-mono">{stock.currentPrice.toFixed(2)}</span>
                     <span className={`flex items-center gap-1 ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                     </span>
                  </div>
               </div>
             );
           })}
           
           {stocks.length === 0 && (
              <span className="mx-10 text-[10px] font-black uppercase tracking-[0.3em] text-black italic animate-pulse">
                 SYNCING_MARKET_TELEMETRY // STOCKZ_EXCHANGE_LIVE //
              </span>
           )}
        </Marquee>
      </div>
    </div>
  );
}
