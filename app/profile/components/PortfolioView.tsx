'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Briefcase, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { getCurrentPrice } from '@/app/play/stocks/utils';
import { COMPANIES } from '@/app/play/stocks/data';
import Link from 'next/link';

export const PortfolioView = ({ userId }: { userId: string }) => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const supabase = createClient();
      
      // Fetch from 'portfolio' table (User's stock holdings)
      const { data, error } = await supabase.from('portfolio').select('*').eq('user_id', userId);
      
      if (data) {
        let currentTotal = 0;
        let costBasisTotal = 0;

        const processed = data.map((item: any) => {
            const company = COMPANIES.find(c => c.ticker === item.ticker);
            const currentPrice = getCurrentPrice(item.ticker);
            const value = currentPrice * item.quantity;
            const costBasis = (item.avg_price || currentPrice) * item.quantity;
            
            currentTotal += value;
            costBasisTotal += costBasis;
            
            // Individual Stock P/L
            const gainPercent = item.avg_price 
                ? ((currentPrice - item.avg_price) / item.avg_price) * 100 
                : 0;
            
            const gainValue = value - costBasis;

            return {
                ...item,
                name: company?.name || item.ticker,
                currentPrice,
                value,
                gainPercent,
                gainValue
            };
        });
        
        setPortfolio(processed);
        setTotalValue(currentTotal);
        
        // Calculate Total Portfolio P/L
        const totalPL = costBasisTotal > 0 ? ((currentTotal - costBasisTotal) / costBasisTotal) * 100 : 0;
        setTotalGain(totalPL);
      }
      setLoading(false);
    };

    fetchPortfolio();
  }, [userId]);

  if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse font-mono tracking-widest">LOADING ASSETS...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* HEADER SUMMARY SECTION */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            
            {/* TOTAL VALUE CARD */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex-1 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Equity</div>
                    <div className="text-4xl font-mono font-black text-white">{Math.floor(totalValue).toLocaleString()} <span className="text-sm text-zinc-500">CR</span></div>
                    
                    <div className={`flex items-center gap-2 mt-2 text-xs font-mono font-bold ${totalGain >= 0 ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                        {totalGain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{totalGain >= 0 ? '+' : ''}{totalGain.toFixed(2)}% All Time</span>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Briefcase size={100} />
                </div>
            </div>

            {/* EXCHANGE LINK CARD */}
            <Link href="/play/stocks" className="bg-zinc-900/50 border border-zinc-800 hover:border-[#DFFF00] p-6 rounded-2xl flex flex-col justify-center items-center gap-3 group transition-all cursor-pointer md:w-64">
                <div className="p-3 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-[#DFFF00] group-hover:text-black transition-colors">
                    <TrendingUp size={24} />
                </div>
                <div className="text-center">
                    <div className="font-bold text-white group-hover:text-[#DFFF00] transition-colors">ZINC EXCHANGE</div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mt-1">Trade Stocks & Assets</div>
                </div>
                <ExternalLink size={14} className="text-zinc-600 group-hover:text-white absolute top-4 right-4" />
            </Link>
        </div>

        {/* STOCK HOLDINGS LIST */}
        {portfolio.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
                <Briefcase size={48} className="text-zinc-700 mb-4" />
                <div className="text-zinc-500 font-mono text-sm">NO MARKET HOLDINGS DETECTED</div>
                <Link href="/play/stocks" className="mt-4 text-xs font-bold text-[#DFFF00] hover:underline uppercase tracking-widest">
                    Start Trading &rarr;
                </Link>
            </div>
        ) : (
            <div className="grid gap-3">
                <div className="flex items-center justify-between px-4 pb-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    <span>Asset</span>
                    <span className="text-right">Performance</span>
                </div>
                
                {portfolio.map((stock) => (
                    <div key={stock.ticker} className="group bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 p-4 rounded-xl flex items-center justify-between transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-black border border-zinc-800 p-3 rounded-lg text-[#DFFF00] font-black font-mono text-lg w-16 text-center group-hover:border-[#DFFF00]/50 transition-colors">
                                {stock.ticker}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm md:text-base">{stock.name}</div>
                                <div className="text-[10px] text-zinc-500 font-mono uppercase">
                                    {stock.quantity} Shares @ {stock.avg_price?.toFixed(2) ?? '0.00'} CR
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <div className="text-base md:text-lg font-mono font-bold text-white">{stock.value.toFixed(0)} CR</div>
                            <div className={`flex items-center justify-end gap-1 text-xs font-mono font-bold ${stock.gainPercent >= 0 ? 'text-[#DFFF00]' : 'text-red-500'}`}>
                                {stock.gainPercent >= 0 ? '+' : ''}{stock.gainPercent.toFixed(2)}%
                                ({stock.gainValue >= 0 ? '+' : ''}{stock.gainValue.toFixed(0)})
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};