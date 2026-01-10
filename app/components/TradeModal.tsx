'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Briefcase, RefreshCw, ArrowRight, TrendingUp, TrendingDown,
  Info, BarChart2, Building2, Users, Calendar, MapPin, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StockChart } from './StockChart';

interface TradeModalProps {
  stock: any;
  portfolio: any[];
  onClose: () => void;
  onTrade: (type: 'BUY' | 'SELL', quantity: number) => Promise<void>;
  isTransacting: boolean;
}

export function TradeModal({ stock, portfolio, onClose, onTrade, isTransacting }: TradeModalProps) {
  const [activeTab, setActiveTab] = useState<'TRADE' | 'PROFILE'>('TRADE');
  const [amount, setAmount] = useState<number | ''>(1);
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [ownedQuantity, setOwnedQuantity] = useState(0);

  useEffect(() => {
    const asset = portfolio.find(p => p.ticker === stock.ticker);
    setOwnedQuantity(asset ? asset.quantity : 0);
  }, [portfolio, stock]);

  const handleExecute = () => {
    if (typeof amount === 'number' && amount > 0) {
      onTrade(tradeMode, amount);
    }
  };

  // Safe numeric display
  const displayAmount = amount === '' ? '' : amount;
  const numericAmount = amount === '' ? 0 : amount;
  const totalValue = numericAmount * stock.currentPrice;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Window */}
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex flex-col bg-zinc-900/50 border-b border-zinc-800">
            <div className="flex justify-between items-start p-6 pb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-black text-white tracking-tighter">{stock.ticker}</h3>
                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-700">{stock.category}</span>
                    </div>
                    <div className="text-sm font-bold text-zinc-500 mt-1">{stock.name}</div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-white">{stock.currentPrice}</div>
                    <div className={`text-xs font-bold flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(stock.change).toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex px-6 gap-6">
                <button 
                    onClick={() => setActiveTab('TRADE')}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'TRADE' ? 'text-[#DFFF00] border-[#DFFF00]' : 'text-zinc-600 border-transparent hover:text-white'}`}
                >
                    Trade
                </button>
                <button 
                    onClick={() => setActiveTab('PROFILE')}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'PROFILE' ? 'text-[#DFFF00] border-[#DFFF00]' : 'text-zinc-600 border-transparent hover:text-white'}`}
                >
                    Profile
                </button>
            </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            
            {activeTab === 'TRADE' ? (
                <>
                    {/* Chart */}
                    <div className="h-48 w-full bg-zinc-900/30 border-b border-zinc-800 p-4">
                        <StockChart data={stock.history} type="step" height="100%" showTooltip />
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Trade Mode Selector */}
                        <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                            <button 
                                onClick={() => setTradeMode('BUY')}
                                className={`py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tradeMode === 'BUY' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Buy Asset
                            </button>
                            <button 
                                onClick={() => setTradeMode('SELL')}
                                className={`py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tradeMode === 'SELL' ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Sell Asset
                            </button>
                        </div>

                        {/* Input Section */}
                        <div>
                            <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                <span>Quantity</span>
                                <span>{tradeMode === 'BUY' ? 'Cost' : 'Value'}: {totalValue.toLocaleString()} CR</span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setAmount(Math.max(1, numericAmount - 1))}
                                    className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-95 transition-all text-xl font-bold"
                                >
                                    -
                                </button>

                                <div className="flex-1 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center relative focus-within:border-[#DFFF00] transition-colors overflow-hidden">
                                    <input 
                                        type="number" 
                                        value={displayAmount}
                                        onChange={(e) => setAmount(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value)))}
                                        onFocus={(e) => e.target.select()} 
                                        className="w-full h-full bg-transparent text-center text-3xl font-black text-white outline-none placeholder-zinc-700"
                                        placeholder="0"
                                    />
                                </div>

                                <button 
                                    onClick={() => setAmount(numericAmount + 1)}
                                    className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-95 transition-all text-xl font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Position Info */}
                        {ownedQuantity > 0 && (
                            <div className="bg-zinc-900/50 rounded-xl p-4 flex items-center justify-between border border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                                        <Briefcase size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Owned</span>
                                        <span className="text-sm font-black text-white">{ownedQuantity} Shares</span>
                                    </div>
                                </div>
                                {tradeMode === 'SELL' && (
                                    <button 
                                        onClick={() => setAmount(ownedQuantity)}
                                        className="text-[10px] font-bold text-[#DFFF00] uppercase tracking-widest hover:underline"
                                    >
                                        Max
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="p-6 space-y-8">
                    {/* Y2D Statement */}
                    <div className="relative p-6 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#DFFF00]" />
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                            <BarChart2 size={12} className="text-[#DFFF00]" />
                            Y2D_Performance_Log
                        </div>
                        <p className="text-lg font-black text-white italic relative z-10 leading-snug">{stock.y2dStatement}</p>
                    </div>

                    {/* About */}
                    <div>
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Info size={12} /> About
                        </h4>
                        <p className="text-sm text-zinc-300 leading-relaxed font-medium mb-4">{stock.description}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#DFFF00] italic uppercase tracking-widest bg-zinc-900/50 w-fit px-3 py-1 rounded-full border border-zinc-800">
                            <Quote size={10} /> {stock.slogan}
                        </div>
                    </div>

                    {/* Corp Data Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Building2 size={10} /> CEO</div>
                            <div className="text-xs font-bold text-white">{stock.ceo}</div>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin size={10} /> HQ</div>
                            <div className="text-xs font-bold text-white">{stock.hq}</div>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={10} /> Founded</div>
                            <div className="text-xs font-bold text-white">{stock.founded}</div>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Users size={10} /> Workforce</div>
                            <div className="text-xs font-bold text-white">{stock.employees}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions (Only for Trade Tab) */}
        {activeTab === 'TRADE' && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur pb-8 sm:pb-6">
                <button 
                    onClick={handleExecute}
                    disabled={isTransacting || numericAmount <= 0}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                        tradeMode === 'BUY' 
                        ? 'bg-[#DFFF00] text-black hover:bg-white shadow-[0_0_20px_rgba(223,255,0,0.3)]' 
                        : 'bg-red-500 text-white hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    } disabled:opacity-50 disabled:pointer-events-none`}
                >
                    {isTransacting ? (
                        <>Processing <RefreshCw className="animate-spin" size={18} /></>
                    ) : (
                        <>Confirm {tradeMode} <ArrowRight size={18} /></>
                    )}
                </button>
                <button 
                    onClick={onClose}
                    className="w-full mt-3 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                    Cancel Transaction
                </button>
            </div>
        )}
      </div>
    </div>
  );
}