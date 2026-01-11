'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, Send, History, X, Search, CheckCircle2, 
    AlertCircle, ArrowRightLeft, Clock, ExternalLink, 
    Coins, TrendingUp, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { getUserWagers, transferCredits, searchUsers, getTransactions } from '@/app/sports/wagers/actions';
import { getPortfolioValue } from '@/app/play/stocks/actions';

interface WalletProps {
    isMobile?: boolean;
    onClose?: () => void;
}

export default function Wallet({ isMobile = false, onClose }: WalletProps) {
  const { profile, refreshProfile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'transfer' | 'history'>('status');
  const [pendingWagers, setPendingWagers] = useState<any[]>([]);
  const [settledWagers, setSettledWagers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  
  // Transfer state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen || isMobile) {
        getUserWagers().then(data => {
            setPendingWagers(data.filter((w: any) => w.status === 'pending'));
            setSettledWagers(data.filter((w: any) => w.status !== 'pending'));
        });
        getTransactions().then(setTransactions);
        getPortfolioValue().then(setPortfolioValue);
    }
  }, [isOpen, isMobile]);

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

  const historyItems = [
      ...transactions.map(t => ({ ...t, type: 'transaction' })), 
      ...settledWagers.map(w => ({ ...w, type: 'wager', created_at: w.created_at }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (!profile) return null;

  const toggleOpen = () => setIsOpen(!isOpen);

  if (isMobile) {
      return <WalletContent 
                profile={profile} 
                portfolioValue={portfolioValue} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                pendingWagers={pendingWagers}
                recipient={recipient}
                setRecipient={setRecipient}
                amount={amount}
                setAmount={setAmount}
                suggestions={suggestions}
                setSuggestions={setSuggestions}
                handleTransfer={handleTransfer}
                isTransferring={isTransferring}
                msg={msg}
                historyItems={historyItems}
                user={user}
                onClose={onClose}
                isMobile={true}
             />;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={toggleOpen}
        className={`group flex items-center gap-3 px-4 py-2 transition-all duration-300 rounded-2xl border cursor-pointer relative overflow-hidden ${
            isOpen 
                ? 'bg-[#DFFF00] border-[#DFFF00] text-black shadow-[0_0_30px_rgba(223,255,0,0.3)]' 
                : 'bg-zinc-900/50 border-white/5 text-white hover:border-[#DFFF00]/50'
        }`}
      >
          <WalletIcon size={16} className={`${isOpen ? 'text-black' : 'text-[#DFFF00]'} transition-colors`} />
          <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black font-mono tracking-tight uppercase">{profile.credits.toLocaleString()} <span className="opacity-50">CR</span></span>
          </div>
          {pendingWagers.length > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-black' : 'bg-[#DFFF00]'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 border-zinc-950 ${isOpen ? 'bg-black' : 'bg-[#DFFF00]'}`}></span>
              </span>
          )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[110] bg-black/20"
            />
            <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                className="absolute top-[calc(100%+12px)] right-0 w-[400px] bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[120] overflow-hidden flex flex-col ring-1 ring-white/5"
            >
                <WalletContent 
                    profile={profile} 
                    portfolioValue={portfolioValue} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab}
                    pendingWagers={pendingWagers}
                    recipient={recipient}
                    setRecipient={setRecipient}
                    amount={amount}
                    setAmount={setAmount}
                    suggestions={suggestions}
                    setSuggestions={setSuggestions}
                    handleTransfer={handleTransfer}
                    isTransferring={isTransferring}
                    msg={msg}
                    historyItems={historyItems}
                    user={user}
                    onClose={() => setIsOpen(false)}
                    isMobile={false}
                />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function WalletContent({ 
    profile, portfolioValue, activeTab, setActiveTab, pendingWagers, 
    recipient, setRecipient, amount, setAmount, suggestions, setSuggestions,
    handleTransfer, isTransferring, msg, historyItems, user, onClose, isMobile 
}: any) {
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-8 pb-6 border-b border-white/5">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900 rounded-2xl text-[#DFFF00] border border-white/5 shadow-xl">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase text-white tracking-tighter italic">My Wallet</h3>
                            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Manage Credits & Wagers</p>
                        </div>
                    </div>
                    {!isMobile && <button onClick={onClose} className="p-2.5 bg-zinc-900/50 hover:bg-white hover:text-black rounded-xl transition-all border border-white/5"><X size={18}/></button>}
                </div>

                <div className="bg-zinc-900/30 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#DFFF00] opacity-[0.02] blur-3xl -mr-16 -mt-16" />
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2 text-center">Total Net Worth</div>
                    <div className="flex items-baseline justify-center gap-3">
                        <span className="text-4xl font-black text-white font-mono tracking-tighter italic">{(profile.credits + portfolioValue).toLocaleString()}</span>
                        <span className="text-sm font-black text-[#DFFF00] italic">CR</span>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Available</span>
                            <span className="text-sm font-black text-white">{profile.credits.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Invested</span>
                            <span className="text-sm font-black text-[#DFFF00]">{portfolioValue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-8 py-4 flex gap-2">
                {[
                    { id: 'status', icon: Clock, label: 'Pending' },
                    { id: 'transfer', icon: Send, label: 'Transfer' },
                    { id: 'history', icon: History, label: 'History' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeTab === tab.id ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-lg shadow-[#DFFF00]/10' : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white'}`}
                    >
                        <tab.icon size={12} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar max-h-[450px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="py-4"
                    >
                        {activeTab === 'status' && (
                            <div className="space-y-4">
                                {pendingWagers.length === 0 ? (
                                    <div className="py-12 text-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/20">
                                        <Clock size={32} className="mx-auto mb-4 text-zinc-800" />
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 font-bold">No active wagers</p>
                                    </div>
                                ) : (
                                    pendingWagers.map(wager => (
                                        <div key={wager.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 group hover:border-[#DFFF00]/30 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Live Wager</span>
                                                </div>
                                                <span className="text-sm font-black text-[#DFFF00] font-mono">{wager.amount}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {wager.wager_legs?.map((leg: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center text-[10px]">
                                                        <span className="text-zinc-500 font-bold uppercase truncate pr-4">{leg.match_name}</span>
                                                        <span className="text-white font-black shrink-0">{leg.selection}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                                <Link 
                                                    href={`/sports/wagers/${wager.id}`}
                                                    onClick={onClose}
                                                    className="text-[9px] font-black text-[#DFFF00] uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform"
                                                >
                                                    View Match <ArrowRightLeft size={10} />
                                                </Link>
                                                <span className="text-[8px] text-zinc-600 font-mono uppercase">ID: {wager.id.slice(0, 6)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'transfer' && (
                            <div className="space-y-6">
                                <div className="space-y-5">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1 italic">Recipient Username</label>
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#DFFF00] transition-colors" size={16} />
                                            <input 
                                                value={recipient}
                                                onChange={(e) => setRecipient(e.target.value)}
                                                className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-[#DFFF00] transition-all uppercase placeholder:text-zinc-800"
                                                placeholder="Username..."
                                            />
                                            <AnimatePresence>
                                                {suggestions.length > 0 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 ring-1 ring-white/5"
                                                    >
                                                        {suggestions.map(s => (
                                                            <button 
                                                                key={s}
                                                                onClick={() => { setRecipient(s); setSuggestions([]); }}
                                                                className="w-full text-left px-5 py-4 text-xs font-black text-zinc-400 hover:bg-[#DFFF00] hover:text-black transition-all border-b border-white/5 last:border-0 uppercase italic"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1 italic">Amount</label>
                                        <div className="relative">
                                            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                            <input 
                                                type="number"
                                                value={amount || ''}
                                                onChange={(e) => setAmount(Number(e.target.value))}
                                                className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-lg font-black text-white focus:outline-none focus:border-[#DFFF00] transition-all font-mono"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleTransfer}
                                        disabled={isTransferring || !recipient || amount <= 0}
                                        className="w-full bg-[#DFFF00] text-black font-black py-5 rounded-[2rem] flex items-center justify-center gap-4 hover:bg-white transition-all shadow-2xl active:scale-95 disabled:opacity-30 disabled:grayscale"
                                    >
                                        {isTransferring ? 'Sending Credits...' : 'Send Credits'}
                                        <ArrowRightLeft size={18} />
                                    </button>

                                    {msg && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                            className={`p-5 rounded-3xl flex items-start gap-4 border ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                        >
                                            {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                            <span className="text-xs font-black uppercase leading-tight italic tracking-wide">{msg.text}</span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-3">
                                {historyItems.length === 0 ? (
                                    <div className="py-12 text-center opacity-30">
                                        <History size={32} className="mx-auto mb-4" />
                                        <p className="text-[10px] font-mono uppercase tracking-widest font-black">No recent history</p>
                                    </div>
                                ) : (
                                    historyItems.map((item: any) => {
                                        if (item.type === 'transaction') {
                                            const isSender = item.sender_id === user?.id;
                                            return (
                                                <div key={item.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2.5 rounded-xl ${isSender ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                            {isSender ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                                        </div>
                                                        <div>
                                                            <div className="text-[11px] font-black text-white uppercase leading-none mb-1.5 italic">
                                                                {isSender ? `Sent to @${item.metadata?.recipient}` : `Received from @${item.metadata?.sender}`}
                                                            </div>
                                                            <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                                                                {new Date(item.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-sm font-black font-mono ${isSender ? 'text-red-500' : 'text-emerald-500'}`}>
                                                        {isSender ? '-' : '+'}{item.amount.toLocaleString()}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            const isWin = item.status === 'won';
                                            const isLoss = item.status === 'lost';
                                            
                                            return (
                                                <div key={item.id} className={`bg-zinc-900/50 p-5 rounded-2xl border relative overflow-hidden group transition-all hover:border-white/10 ${isWin ? 'border-emerald-500/20 bg-emerald-500/5' : isLoss ? 'border-red-500/20 bg-red-500/5' : 'border-white/5'}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="text-[10px] font-black text-white uppercase tracking-widest italic mb-1">Sport Wager</div>
                                                            <div className="text-[8px] font-mono text-zinc-600 font-bold uppercase">{new Date(item.created_at).toLocaleDateString()} // {item.status}</div>
                                                        </div>
                                                        <div className={`text-base font-black font-mono ${isWin ? 'text-emerald-500' : isLoss ? 'text-red-500' : 'text-zinc-500'}`}>
                                                            {isWin ? `+${item.payout}` : isLoss ? `-${item.amount}` : 'REFUNDED'}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 mb-1">
                                                        {item.wager_legs?.slice(0, 2).map((leg: any, i: number) => (
                                                            <div key={i} className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-2">
                                                                <div className={`w-1 h-1 rounded-full ${leg.status === 'won' ? 'bg-emerald-500' : leg.status === 'lost' ? 'bg-red-500' : 'bg-zinc-700'}`} />
                                                                {leg.selection.replace(':', ' ')} @ {leg.match_name}
                                                            </div>
                                                        ))}
                                                        {item.wager_legs?.length > 2 && <div className="text-[8px] text-zinc-700 uppercase font-black pl-3">+ {item.wager_legs.length - 2} More</div>}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="p-6 bg-zinc-950/50 border-t border-white/5 flex items-center justify-center gap-4">
                <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.5em] font-black italic">Network Protocol v4.2 // Secure Session</span>
            </div>
        </div>
    );
}
