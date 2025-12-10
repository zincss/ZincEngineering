'use client';

import React, { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  CloudHail, 
  Zap, 
  Globe,
  Activity
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function GlobalTicker() {
  const [tickerItems, setTickerItems] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Weather (Placeholder or Real if available)
      const weather = { type: 'weather', location: 'SYD', temp: '24°C', condition: 'Clear', icon: <CloudHail size={12} /> };

      // 2. F1 (Mock or latest DB)
      const f1 = { type: 'f1', label: 'NEXT GP', value: 'Monaco [T-minus 4d]', icon: <Trophy size={12} /> };

      // 3. Market (Mock or DB)
      const market = [
        { symbol: 'VOID', price: '450 CR', change: '+12%', trend: 'up' },
        { symbol: 'FADE', price: '120 CR', change: '-5%', trend: 'down' },
        { symbol: 'ZINC', price: '1,200 CR', change: '+2.4%', trend: 'up' },
      ];

      // 4. System Status
      const system = { type: 'system', label: 'SERVER', value: 'OPTIMAL 99.9%', icon: <Zap size={12} /> };

      // Combine
      const items = [
        system,
        weather,
        f1,
        ...market.map(m => ({ type: 'market', ...m }))
      ];
      
      setTickerItems(items);
    };

    fetchData();
  }, []);

  return (
    <div className="relative w-full h-10 bg-zinc-950/80 backdrop-blur-md border-y border-white/5 overflow-hidden flex items-center z-40">
      
      {/* LEFT ANCHOR: LABEL */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-zinc-950/90 backdrop-blur-xl pl-4 pr-6 flex items-center gap-3 border-r border-white/5 clip-path-slant">
         <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
               Live Wire
            </span>
         </div>
      </div>

      {/* MARQUEE CONTENT */}
      <div className="w-full mask-linear-fade">
        <Marquee gradient={false} speed={40} className="flex items-center h-full">
           {tickerItems.map((item, i) => (
             <div key={i} className="flex items-center gap-3 mx-6 select-none">
                
                {/* SEPARATOR */}
                <span className="text-zinc-800 text-[10px] font-black">///</span>

                {/* CONTENT */}
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                   
                   {/* ICONS */}
                   {item.type === 'weather' && <span className="text-blue-400">{item.icon}</span>}
                   {item.type === 'f1' && <span className="text-[#DFFF00]">{item.icon}</span>}
                   {item.type === 'system' && <span className="text-emerald-500">{item.icon}</span>}
                   {item.type === 'market' && (
                      item.trend === 'up' 
                        ? <TrendingUp size={12} className="text-emerald-500" />
                        : <TrendingDown size={12} className="text-rose-500" />
                   )}

                   {/* LABELS & VALUES */}
                   {item.type === 'market' ? (
                      <span className="flex gap-2">
                         <span className="font-bold text-zinc-400">{item.symbol}</span>
                         <span className="text-white">{item.price}</span>
                         <span className={item.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}>
                            {item.change}
                         </span>
                      </span>
                   ) : (
                      <span className="flex gap-2">
                         <span className="font-bold text-zinc-500">{item.label || item.location}</span>
                         <span className="text-zinc-200">{item.value || `${item.temp} ${item.condition}`}</span>
                      </span>
                   )}

                </div>
             </div>
           ))}
           
           {/* FILLER FOR EMPTY STATE */}
           {tickerItems.length === 0 && (
              <span className="mx-10 text-[10px] font-mono uppercase text-zinc-600 animate-pulse">
                 Establishing Secure Uplink...
              </span>
           )}
        </Marquee>
      </div>

      {/* RIGHT FADE OVERLAY */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none z-10" />

    </div>
  );
}