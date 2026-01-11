'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Briefcase, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* HEADER SUMMARY SECTION */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
            
            {/* TOTAL VALUE CARD */}
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] flex-1 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#DFFF00]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-zinc-500 font-mono text-[10px] font-black uppercase tracking-[0.3em]">
                        <Briefcase size={14} />
                        <span>Aggregated_Equity</span>
                    </div>
                    <div className="text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-none mb-4">
                        {Math.floor(totalValue).toLocaleString()} <span className="text-xl text-[#DFFF00] not-italic">CR</span>
                    </div>
                    
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono font-black ${totalGain >= 0 ? 'bg-[#DFFF00]/10 border-[#DFFF00]/30 text-[#DFFF00]' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                        {totalGain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{totalGain >= 0 ? '+' : ''}{totalGain.toFixed(2)}% ALL_TIME</span>
                    </div>
                </div>
            </div>

            {/* EXCHANGE LINK CARD */}
            <Link href="/play/stocks" className="bg-zinc-900/30 border border-zinc-800 hover:border-[#DFFF00] p-8 rounded-[2.5rem] flex md:flex-col items-center justify-between md:justify-center gap-6 group transition-all cursor-pointer w-full md:w-72 shadow-xl">
                <div className="flex items-center gap-6 md:flex-col">
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:bg-[#DFFF00] group-hover:border-[#DFFF00] group-hover:text-black transition-all group-hover:scale-110 shadow-lg">
                        <TrendingUp size={32} />
                    </div>
                    <div className="text-left md:text-center">
                        <div className="font-black text-white group-hover:text-[#DFFF00] transition-colors uppercase tracking-widest text-sm">Zinc Exchange</div>
                        <div className="text-[9px] text-zinc-600 font-mono uppercase mt-1 tracking-widest">Live Asset Trading</div>
                    </div>
                </div>
                <div className="p-2 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-700 group-hover:text-white md:absolute md:top-6 md:right-6 transition-all">
                    <ExternalLink size={14} />
                </div>
            </Link>
        </div>

        {/* STOCK HOLDINGS LIST */}
        <div className="space-y-6">
            <div className="flex items-center justify-between px-6 pb-2 text-[10px] font-black font-mono text-zinc-600 uppercase tracking-[0.4em]">
                <span>Holding // Asset</span>
                <span className="text-right">Performance // Value</span>
            </div>

            {portfolio.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/20">
                    <Briefcase size={64} className="text-zinc-800 mb-6 opacity-20" />
                    <div className="text-zinc-600 font-mono text-xs font-black uppercase tracking-[0.3em]">No Market Holdings Detected</div>
                    <Link href="/play/stocks" className="mt-6 px-8 py-3 bg-zinc-900 border border-zinc-800 text-xs font-black text-[#DFFF00] hover:bg-[#DFFF00] hover:text-black rounded-full transition-all uppercase tracking-widest">
                        Initialize Trade
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {portfolio.map((stock) => (
                        <motion.div 
                            key={stock.ticker} 
                            whileHover={{ scale: 1.01, x: 5 }}
                            className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-600 p-6 rounded-3xl flex items-center justify-between transition-all shadow-lg"
                        >
                            <div className="flex items-center gap-6">
                                <div className="bg-zinc-900 border-2 border-zinc-800 p-4 rounded-2xl text-[#DFFF00] font-black font-mono text-xl w-20 text-center group-hover:border-[#DFFF00] transition-colors shadow-inner">
                                    {stock.ticker}
                                </div>
                                <div>
                                    <div className="font-black text-white text-lg tracking-tight uppercase italic">{stock.name}</div>
                                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono font-bold uppercase mt-1">
                                        <span>{stock.quantity} SHARES</span>
                                        <span className="opacity-20">|</span>
                                        <span>AVG: {stock.avg_price?.toFixed(2) ?? '0.00'} CR</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="text-2xl font-mono font-black text-white leading-none mb-2">{stock.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-zinc-600">CR</span></div>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-black ${stock.gainPercent >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {stock.gainPercent >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {stock.gainPercent >= 0 ? '+' : ''}{stock.gainPercent.toFixed(2)}%
                                    <span className="opacity-50">({stock.gainValue >= 0 ? '+' : ''}{stock.gainValue.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};