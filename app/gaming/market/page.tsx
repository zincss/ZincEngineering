'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Activity, RefreshCw, AlertTriangle, Search, ArrowRight, TrendingDown, Filter } from 'lucide-react';

const SCAN_TARGETS = [
  { name: 'Gauss Prime Set', url: 'gauss_prime_set' },
  { name: 'Wisp Prime Set', url: 'wisp_prime_set' },
  { name: 'Revenant Prime Set', url: 'revenant_prime_set' },
  { name: 'Glaive Prime Set', url: 'glaive_prime_set' },
  { name: 'Energize (Max)', url: 'arcane_energize', rank: 5 },
  { name: 'Grace (Max)', url: 'arcane_grace', rank: 5 },
  { name: 'Volt Prime Set', url: 'volt_prime_set' },
  { name: 'Saryn Prime Set', url: 'saryn_prime_set' },
  { name: 'Ignis Wraith', url: 'ignis_wraith' },
  { name: 'Primed Flow', url: 'primed_flow' }
];

interface MarketResult {
  name: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  volume: number;
  rating: 'S' | 'A' | 'B' | 'C' | 'F';
  tax: number;
  roi: number;
}

export default function MarketScannerPage() {
  const [results, setResults] = useState<MarketResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [tradeTaxRate, setTradeTaxRate] = useState(8000);
  const [minProfit, setMinProfit] = useState(10);

  const calculateRating = (spread: number, roi: number, volume: number): MarketResult['rating'] => {
    if (spread > 100 && roi > 50) return 'S';
    if (spread > 50 && roi > 30) return 'A';
    if (spread > 20 && roi > 15) return 'B';
    if (spread > 10) return 'C';
    return 'F';
  };

  const scanMarket = async () => {
    setIsScanning(true);
    setResults([]);
    setScanProgress(0);

    let scannedData: MarketResult[] = [];

    for (let i = 0; i < SCAN_TARGETS.length; i++) {
      const target = SCAN_TARGETS[i];
      setScanProgress(((i + 1) / SCAN_TARGETS.length) * 100);

      try {
        // Simulate data for demo (Replace with real API in production)
        const variance = Math.floor(Math.random() * 20);
        const basePrice = 40 + Math.floor(Math.random() * 100);
        
        const bestBuyOrder = basePrice - 10 - variance; 
        const bestSellOrder = basePrice + 10 + variance; 
        
        const potentialProfit = bestSellOrder - bestBuyOrder;
        const roi = (potentialProfit / bestBuyOrder) * 100;
        
        const rating = calculateRating(potentialProfit, roi, 10);

        scannedData.push({
          name: target.name,
          buyPrice: bestBuyOrder,
          sellPrice: bestSellOrder,
          spread: potentialProfit,
          volume: Math.floor(Math.random() * 50),
          rating: rating,
          tax: tradeTaxRate,
          roi: roi
        });

        await new Promise(r => setTimeout(r, 500));

      } catch (e) {
        console.error(`Failed to scan ${target.name}`, e);
      }
    }
    setResults(scannedData.sort((a, b) => b.spread - a.spread));
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto pb-20 pt-8 px-4">
      
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-acid bg-black px-3 py-1 font-mono text-xs font-bold mb-4">
           <Activity size={14} /> ECONOMY SURVEILLANCE
        </div>
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">MARKET SCANNER</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Automated arbitrage detection system. Identifies price disparities between buy and sell orders for maximum credit yield.
        </p>
      </div>

      {/* CONTROLS DASHBOARD */}
      <div className="border-4 border-black dark:border-zinc-600 bg-white dark:bg-zinc-900 p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] mb-12">
        <div className="border-2 border-zinc-100 dark:border-zinc-700 p-6 flex flex-col md:flex-row gap-8 items-end">
            
            <div className="flex-1 w-full">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-zinc-400">TRADE TAX (CREDITS)</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><DollarSign size={16}/></div>
                    <input 
                        type="number" 
                        value={tradeTaxRate}
                        onChange={(e) => setTradeTaxRate(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-600 p-3 pl-10 font-mono font-bold focus:border-acid focus:outline-none text-black dark:text-white"
                    />
                </div>
                <div className="flex gap-2 mt-2">
                    <button onClick={() => setTradeTaxRate(8000)} className="text-[9px] bg-zinc-200 dark:bg-zinc-700 px-2 py-1 font-bold hover:bg-zinc-300 dark:hover:bg-zinc-600 text-black dark:text-white">PRIME SET (8k)</button>
                    <button onClick={() => setTradeTaxRate(1000000)} className="text-[9px] bg-zinc-200 dark:bg-zinc-700 px-2 py-1 font-bold hover:bg-zinc-300 dark:hover:bg-zinc-600 text-black dark:text-white">LEGENDARY (1M)</button>
                </div>
            </div>

            <div className="flex-1 w-full">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-zinc-400">MIN PROFIT TARGET (PLATINUM)</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><TrendingUp size={16}/></div>
                    <input 
                        type="number" 
                        value={minProfit}
                        onChange={(e) => setMinProfit(Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-600 p-3 pl-10 font-mono font-bold focus:border-acid focus:outline-none text-black dark:text-white"
                    />
                </div>
            </div>

            <button 
                onClick={scanMarket}
                disabled={isScanning}
                className={`px-8 py-4 font-black uppercase tracking-widest flex items-center gap-3 transition-all ${isScanning ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-black text-white hover:bg-acid hover:text-black hover:shadow-lg'}`}
            >
                {isScanning ? (
                    <><RefreshCw size={18} className="animate-spin"/> SCANNING PROTOCOL {scanProgress.toFixed(0)}%</>
                ) : (
                    <><Filter size={18} /> INITIATE SCAN</>
                )}
            </button>
        </div>
      </div>

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.filter(r => r.spread >= minProfit).map((item, i) => (
            <div key={i} className="group bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-600 p-6 relative hover:-translate-y-1 transition-transform duration-300">
                <div className={`absolute top-0 right-0 px-4 py-2 font-black text-xl border-b-2 border-l-2 border-black dark:border-zinc-600 ${
                    item.rating === 'S' ? 'bg-acid text-black' : 
                    item.rating === 'A' ? 'bg-green-500 text-white' :
                    item.rating === 'B' ? 'bg-blue-500 text-white' : 'bg-zinc-300 text-zinc-500'
                }`}>
                    {item.rating}-TIER
                </div>

                <h3 className="text-xl font-black uppercase mb-6 pr-12 text-black dark:text-white">{item.name}</h3>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase">BUY ORDER (MAX)</span>
                        <span className="font-mono font-bold text-lg text-black dark:text-white">{item.buyPrice} <span className="text-xs text-zinc-400">p</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase">SELL ORDER (MIN)</span>
                        <span className="font-mono font-bold text-lg text-black dark:text-white">{item.sellPrice} <span className="text-xs text-zinc-400">p</span></span>
                    </div>
                    <div className="h-px w-full bg-zinc-200 dark:bg-zinc-700"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-black dark:text-white uppercase flex items-center gap-1"><TrendingUp size={12}/> POTENTIAL PROFIT</span>
                        <span className="font-mono font-black text-2xl text-acid bg-black px-2 py-1">+{item.spread}</span>
                    </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 border border-zinc-100 dark:border-zinc-700 flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500 uppercase">
                    <span>ROI: {item.roi.toFixed(0)}%</span>
                    <span>TAX: {item.tax.toLocaleString()}cr</span>
                </div>
                
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                        href={`https://warframe.market/items/${item.name.toLowerCase().replace(/ /g, '_')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full text-center bg-black text-white py-2 font-bold text-xs uppercase hover:bg-acid hover:text-black"
                    >
                        EXECUTE TRADE
                    </a>
                </div>
            </div>
        ))}
      </div>

      {!isScanning && results.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 font-mono text-sm">
              NO ACTIVE SCAN DATA. INITIATE PROTOCOL TO BEGIN.
          </div>
      )}

      <div className="mt-12 p-4 bg-zinc-950 text-zinc-500 text-[10px] font-mono flex gap-3 items-start border-l-4 border-acid">
          <AlertTriangle size={16} className="shrink-0 text-acid" />
          <p>
              MARKET DATA WARNING: This tool estimates potential arbitrage opportunities based on current "Online In-Game" buy and sell orders. 
              Actual profits may vary based on market volatility and trade tax. Always verify prices on Warframe.market before committing assets.
              High-Value trades (1M credit tax) require significant credit reserves.
          </p>
      </div>

    </div>
  );
}