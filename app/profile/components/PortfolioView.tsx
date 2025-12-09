'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Briefcase, TrendingUp } from 'lucide-react';
import { getCurrentPrice } from '@/app/play/stocks/utils';
import { COMPANIES } from '@/app/play/stocks/data';

export const PortfolioView = ({ userId }: { userId: string }) => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const supabase = createClient();
      // Fetch user's stocks
      const { data, error } = await supabase.from('user_stocks').select('*').eq('user_id', userId);
      
      if (data) {
        let total = 0;
        const processed = data.map((item: any) => {
            const company = COMPANIES.find(c => c.ticker === item.ticker);
            const currentPrice = getCurrentPrice(item.ticker);
            const value = currentPrice * item.quantity;
            total += value;
            
            return {
                ...item,
                name: company?.name || item.ticker,
                currentPrice,
                value,
                // Simple Gain/Loss logic assuming we track avg_price in DB, 
                // otherwise fallback to 0
                gain: item.avg_price ? ((currentPrice - item.avg_price) / item.avg_price) * 100 : 0
            };
        });
        setPortfolio(processed);
        setTotalValue(total);
      }
      setLoading(false);
    };

    fetchPortfolio();
  }, [userId]);

  if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">LOADING ASSETS...</div>;

  if (portfolio.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-xl">
              <Briefcase size={48} className="text-zinc-700 mb-4" />
              <div className="text-zinc-500 font-mono">NO MARKET HOLDINGS DETECTED</div>
          </div>
      );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                <div className="text-xs font-bold text-zinc-500 uppercase mb-2">Total Portfolio Value</div>
                <div className="text-3xl font-mono text-[#DFFF00]">{Math.floor(totalValue).toLocaleString()} CR</div>
            </div>
        </div>

        <div className="grid gap-4">
            {portfolio.map((stock) => (
                <div key={stock.ticker} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-black p-3 rounded text-[#DFFF00] font-black font-mono text-xl w-16 text-center">
                            {stock.ticker}
                        </div>
                        <div>
                            <div className="font-bold text-white">{stock.name}</div>
                            <div className="text-xs text-zinc-500 font-mono">{stock.quantity} SHARES</div>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-xl font-mono font-bold">{stock.value.toFixed(0)} CR</div>
                        <div className={`text-xs font-mono ${stock.gain >= 0 ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                            {stock.gain >= 0 ? '+' : ''}{stock.gain.toFixed(2)}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};