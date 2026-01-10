'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Send, History, X, Search, CheckCircle2, AlertCircle, ArrowRightLeft, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { getUserWagers, transferCredits, searchUsers, getTransactions } from '@/app/sports/wagers/actions';
import { getPortfolioValue } from '@/app/play/stocks/actions';

export default function Wallet() {
  const { profile, refreshProfile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'transfer' | 'history'>('status');
  const [pendingWagers, setPendingWagers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  
  // Transfer state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
        getUserWagers().then(data => {
            setPendingWagers(data.filter((w: any) => w.status === 'pending'));
        });
        getTransactions().then(setTransactions);
        getPortfolioValue().then(setPortfolioValue);
    }
  }, [isOpen]);

  useEffect(() => {
    if (recipient.length > 1) {
        searchUsers(recipient).then(setSuggestions);
    } else {
        setSuggestions([]);
    }
  }, [recipient]);

  const handleTransfer = async () => {
    if (amount <= 0 || !recipient) return;
    setIsTransferring(true);
    try {
        await transferCredits(recipient, amount);
        setMsg({ type: 'success', text: `Sent ${amount} CR to ${recipient}` });
        setRecipient('');
        setAmount(0);
        await refreshProfile();
        setTimeout(() => setMsg(null), 5000);
    } catch (e: any) {
        setMsg({ type: 'error', text: e.message });
    } finally {
        setIsTransferring(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] transition-colors rounded-full cursor-pointer relative"
      >
          <Coins size={14} className="text-[#DFFF00] group-hover:rotate-12 transition-transform" />
          <span className="text-xs md:text-sm font-black text-white font-mono tracking-tight">{profile.credits.toLocaleString()}</span>
          {pendingWagers.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 flex h-2.5 w-2.5 md:h-3 md:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-[#DFFF00] border-2 border-zinc-950"></span>
              </span>
          )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm lg:bg-transparent"
            />
            <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed md:absolute top-[70px] md:top-full right-4 md:right-0 w-[calc(100vw-32px)] md:w-96 bg-zinc-950 border border-zinc-800 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[120] overflow-hidden flex flex-col ring-1 ring-white/5"
            >
                {/* Wallet Header */}
                <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-950 rounded-xl text-[#DFFF00] border border-zinc-800 shadow-lg">
                            <Coins size={18} />
                        </div>
                        <div>
                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Total Net Worth</div>
                            <div className="text-xl font-black text-white font-mono tracking-tighter">{(profile.credits + portfolioValue).toLocaleString()} <span className="text-xs text-zinc-600">CR</span></div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"><X size={18}/></button>
                </div>

                {/* Sub-header Stats */}
                <div className="grid grid-cols-2 gap-px bg-zinc-800 border-b border-zinc-800">
                    <div className="bg-zinc-950 p-3 px-6 flex flex-col">
                        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Liquid Credits</span>
                        <span className="text-xs font-black text-white">{profile.credits.toLocaleString()}</span>
                    </div>
                    <div className="bg-zinc-950 p-3 px-6 flex flex-col items-end">
                        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Market Assets</span>
                        <span className="text-xs font-black text-[#DFFF00]">{portfolioValue.toLocaleString()}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-2 bg-zinc-950 border-b border-zinc-800">
                    {[
                        { id: 'status', icon: Clock, label: 'Pending' },
                        { id: 'transfer', icon: Send, label: 'Wire' },
                        { id: 'history', icon: History, label: 'Log' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                        >
                            <tab.icon size={12} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {activeTab === 'status' && (
                        <div className="space-y-4">
                            {pendingWagers.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed border-zinc-900 rounded-3xl opacity-50">
                                    <Clock size={24} className="mx-auto mb-3 text-zinc-700" />
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">No Pending Slips</p>
                                </div>
                            ) : (
                                pendingWagers.map(wager => (
                                    <div key={wager.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 group">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[9px] font-mono text-[#DFFF00] uppercase tracking-widest">Active Slip</span>
                                            <span className="text-xs font-black text-white">{wager.amount} CR</span>
                                        </div>
                                        <div className="space-y-2">
                                            {wager.wager_legs?.map((leg: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center text-[10px]">
                                                    <span className="text-zinc-500 uppercase">{leg.match_name}</span>
                                                    <span className="text-white font-bold">{leg.selection}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-600">Total Odds: {wager.odds}</span>
                                                <Link 
                                                    href={`/sports/wagers/${wager.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="text-[8px] font-black text-[#DFFF00] uppercase tracking-widest mt-0.5 flex items-center gap-1 hover:underline"
                                                >
                                                    Track Live <ExternalLink size={8} />
                                                </Link>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 uppercase font-mono">#{wager.id.slice(0, 6)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'transfer' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-2 pl-1">Recipient Operator</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                                        <input 
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-[#DFFF00] transition-all"
                                            placeholder="USERNAME_ENTRY"
                                        />
                                        {suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-50">
                                                {suggestions.map(s => (
                                                    <button 
                                                        key={s}
                                                        onClick={() => { setRecipient(s); setSuggestions([]); }}
                                                        className="w-full text-left px-4 py-3 text-xs text-zinc-400 hover:bg-[#DFFF00] hover:text-black transition-colors border-b border-zinc-800 last:border-0"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-2 pl-1">Credit Amount</label>
                                    <div className="relative">
                                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                                        <input 
                                            type="number"
                                            value={amount || ''}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-[#DFFF00] transition-all font-mono"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleTransfer}
                                    disabled={isTransferring || !recipient || amount <= 0}
                                    className="w-full bg-[#DFFF00] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all shadow-[0_10px_30px_rgba(223,255,0,0.2)] disabled:opacity-50"
                                >
                                    {isTransferring ? 'INITIALIZING_WIRE...' : 'AUTHORIZE_WIRE'}
                                    <ArrowRightLeft size={16} />
                                </button>

                                {msg && (
                                    <div className={`p-4 rounded-2xl flex items-start gap-3 ${msg.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                        {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        <span className="text-[10px] font-bold uppercase leading-tight">{msg.text}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-3">
                            {transactions.length === 0 ? (
                                <div className="py-12 text-center opacity-30">
                                    <History size={24} className="mx-auto mb-3" />
                                    <p className="text-[10px] font-mono uppercase tracking-widest">No Recent Activity</p>
                                </div>
                            ) : (
                                transactions.map(tx => {
                                    const isSender = tx.sender_id === user?.id;
                                    return (
                                        <div key={tx.id} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isSender ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                    {isSender ? <Send size={12} /> : <Coins size={12} />}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-white uppercase leading-none mb-1">
                                                        {isSender ? `To ${tx.metadata?.recipient}` : `From ${tx.metadata?.sender}`}
                                                    </div>
                                                    <div className="text-[8px] font-mono text-zinc-600 uppercase">
                                                        {new Date(tx.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`text-xs font-black font-mono ${isSender ? 'text-red-500' : 'text-green-500'}`}>
                                                {isSender ? '-' : '+'}{tx.amount}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-zinc-900/30 text-center">
                    <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Secure Zinc Protocol v4.2</p>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
