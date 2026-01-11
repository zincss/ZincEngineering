'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { useDebounce } from 'use-debounce'; // Ensure this is installed
import { Coins, Send, ArrowUpRight, ArrowDownLeft, RefreshCw, Loader2, History, ShoppingBag, Globe, User } from 'lucide-react';
import { Transaction } from '../types';

interface WalletViewProps {
    profile: any;
    onRefresh: () => void;
}

export function WalletView({ profile, onRefresh }: WalletViewProps) {
    const supabase = createClient();
    const { user } = useAuth();
    
    // State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Form State
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    
    // Suggestions State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [debouncedRecipient] = useDebounce(recipient, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTransactions();
        
        // Click outside handler to close suggestions
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [user]);

    // FETCH SUGGESTIONS WHEN TYPING
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedRecipient.length < 2) {
                setSuggestions([]);
                return;
            }

            // Don't search if we clicked a completed name (exact match logic optional)
            
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .ilike('username', `%${debouncedRecipient}%`)
                .neq('id', user?.id) // Don't suggest yourself
                .limit(5);

            if (!error && data) {
                setSuggestions(data.map((p: any) => p.username));
                setShowSuggestions(true);
            }
        };

        fetchSuggestions();
    }, [debouncedRecipient, user]);

    const fetchTransactions = async () => {
        if (!user) return;
        setLoading(true);
        
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                sender:profiles!sender_id(username),
                receiver:profiles!receiver_id(username)
            `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (!error && data) {
            setTransactions(data as any);
        }
        setLoading(false);
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !amount || !recipient) return;
        
        const transferAmount = parseInt(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        if (transferAmount > profile.credits) {
            alert("Insufficient funds.");
            return;
        }
        if (recipient.toLowerCase() === profile.username.toLowerCase()) {
            alert("You cannot transfer credits to yourself.");
            return;
        }

        setSending(true);

        try {
            const { error } = await supabase.rpc('transfer_credits', {
                recipient_username: recipient,
                amount: transferAmount
            });

            if (error) throw error;

            alert(`Successfully sent ${transferAmount} credits to ${recipient}!`);
            setRecipient('');
            setAmount('');
            setSuggestions([]);
            onRefresh(); 
            fetchTransactions(); 
            
        } catch (err: any) {
            console.error(err);
            alert(`Transfer Failed: ${err.message || 'Unknown Error'}`);
        } finally {
            setSending(false);
        }
    };

    const selectSuggestion = (username: string) => {
        setRecipient(username);
        setShowSuggestions(false);
    };

    const getTransactionDetails = (tx: Transaction) => {
        const isReceived = tx.receiver_id === user?.id;
        
        let label = '';
        let partyName = '';
        let icon = null;

        if (isReceived) {
            if (!tx.sender_id) {
                label = 'System Reward';
                partyName = 'ZINC NETWORK';
                icon = <Globe size={18} />;
            } else {
                label = 'Received from';
                partyName = tx.sender?.username || 'Unknown';
                icon = <ArrowDownLeft size={18} />;
            }
        } else {
            if (!tx.receiver_id) {
                label = 'Market Purchase';
                partyName = 'ZINC EXCHANGE';
                icon = <ShoppingBag size={18} />;
            } else {
                label = 'Sent to';
                partyName = tx.receiver?.username || 'Unknown';
                icon = <ArrowUpRight size={18} />;
            }
        }

        return { isReceived, label, partyName, icon };
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            
            {/* LEFT COLUMN: BALANCE & TRANSFER */}
            <div className="lg:col-span-5 space-y-8">
                
                {/* BALANCE CARD */}
                <div className="relative overflow-hidden rounded-[3rem] bg-zinc-950 border border-zinc-800 p-8 md:p-10 shadow-2xl group">
                    {/* Animated Glow */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#DFFF00] rounded-full blur-[120px] opacity-10 group-hover:opacity-20 transition-opacity" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-zinc-900 rounded-lg text-[#DFFF00] border border-zinc-800 shadow-lg">
                                <Coins size={18} />
                            </div>
                            <h3 className="text-zinc-500 font-mono text-[10px] font-black uppercase tracking-[0.3em]">Network_Credits // Balance</h3>
                        </div>

                        <div className="flex items-baseline gap-3 text-white">
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-6xl md:text-7xl font-black tracking-tighter italic"
                            >
                                {profile?.credits?.toLocaleString() ?? 0}
                            </motion.span>
                            <span className="text-2xl font-black text-[#DFFF00] italic">CR</span>
                        </div>

                        <div className="mt-8 flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-900/50 w-fit px-4 py-2 rounded-full border border-zinc-800">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                                NODE_ACTIVE // SECURE_SYNC
                            </div>
                        </div>
                    </div>
                </div>

                {/* TRANSFER FORM */}
                <div className="rounded-[3rem] bg-zinc-900/20 border border-zinc-800 p-8 md:p-10 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#DFFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400">
                            <Send size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter italic leading-none">Wire Transfer</h3>
                            <p className="text-[9px] font-mono text-zinc-600 uppercase mt-1 tracking-widest">P2P_Registry // Transmission</p>
                        </div>
                    </div>

                    <form onSubmit={handleTransfer} className="space-y-6">
                        
                        {/* USERNAME INPUT WITH AUTOCOMPLETE */}
                        <div className="space-y-3 relative" ref={wrapperRef}>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Recipient_Node</label>
                            <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within/input:text-[#DFFF00] transition-colors" size={16} />
                                <input 
                                    type="text" 
                                    value={recipient}
                                    onChange={(e) => {
                                        setRecipient(e.target.value);
                                        if (e.target.value.length < 2) setShowSuggestions(false);
                                    }}
                                    onFocus={() => {
                                        if (suggestions.length > 0) setShowSuggestions(true);
                                    }}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl p-4 pl-12 text-white font-mono text-sm focus:outline-none focus:border-[#DFFF00] transition-all placeholder:text-zinc-800 uppercase focus:bg-black shadow-inner"
                                    placeholder="OPERATOR_TAG"
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            
                            {/* SUGGESTIONS DROPDOWN */}
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10"
                                    >
                                        <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                            Identified Nodes
                                        </div>
                                        {suggestions.map((username) => (
                                            <button
                                                key={username}
                                                type="button"
                                                onClick={() => selectSuggestion(username)}
                                                className="w-full text-left px-4 py-4 text-xs font-black font-mono text-zinc-400 hover:text-black hover:bg-[#DFFF00] transition-all flex items-center gap-3 border-b border-zinc-800 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] group-hover:border-black/20">
                                                    <Fingerprint size={14} />
                                                </div>
                                                {username}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Transmission_Value</label>
                            <div className="relative group/input">
                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within/input:text-[#DFFF00] transition-colors" size={16} />
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl p-4 pl-12 pr-16 text-white font-mono text-sm focus:outline-none focus:border-[#DFFF00] transition-all placeholder:text-zinc-800 focus:bg-black shadow-inner"
                                    placeholder="0.00"
                                    min="1"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-[10px] uppercase tracking-widest">Credits</div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={sending || !amount || !recipient}
                            className="w-full bg-[#DFFF00] hover:bg-white text-black font-black uppercase py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4 shadow-[0_10px_30px_rgba(223,255,0,0.2)]"
                        >
                            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            {sending ? 'TRANSMITTING...' : 'AUTHORIZE_WIRE'}
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT COLUMN: HISTORY */}
            <div className="lg:col-span-7">
                <div className="h-full rounded-[3rem] bg-zinc-900/10 border border-zinc-800 p-8 md:p-10 flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500">
                                <History size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic leading-none">Activity Log</h3>
                                <p className="text-[9px] font-mono text-zinc-600 uppercase mt-1 tracking-widest">Credit_Flow // Archive</p>
                            </div>
                        </div>
                        <button 
                            onClick={fetchTransactions} 
                            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-[#DFFF00] hover:border-[#DFFF00] transition-all active:scale-90"
                            title="Sync Log"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[600px] relative z-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 text-zinc-700 gap-4">
                                <Loader2 size={32} className="animate-spin text-[#DFFF00]" />
                                <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] animate-pulse">Scanning Archive...</span>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-32 text-zinc-700 font-mono flex flex-col items-center border-2 border-dashed border-zinc-900 rounded-[2rem]">
                                <Globe size={48} className="mb-4 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Transactions Detected</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((tx) => {
                                    const { isReceived, label, partyName, icon } = getTransactionDetails(tx);
                                    return (
                                        <motion.div 
                                            key={tx.id} 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="group flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-zinc-800/50 hover:border-zinc-600 transition-all hover:bg-zinc-900 shadow-sm"
                                        >
                                            <div className="flex items-center gap-4 lg:gap-5">
                                                <div className={`p-3 rounded-xl border transition-colors ${isReceived ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black' : 'bg-red-500/10 text-red-500 border-red-500/20 group-hover:bg-red-500 group-hover:text-black'}`}>
                                                    {icon}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-white uppercase tracking-wide leading-none mb-1.5 flex items-center gap-2">
                                                        {label} <span className="text-zinc-500 font-mono text-[10px] group-hover:text-zinc-300 transition-colors">@{partyName}</span>
                                                    </div>
                                                    <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                                        <Clock size={10} />
                                                        {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className={`text-right`}>
                                                <div className={`font-mono font-black text-lg md:text-xl leading-none ${isReceived ? 'text-emerald-500' : 'text-zinc-400 group-hover:text-white transition-colors'}`}>
                                                    {isReceived ? '+' : '-'}{tx.amount.toLocaleString()}
                                                </div>
                                                <div className="text-[8px] font-mono text-zinc-700 uppercase mt-1 tracking-tighter">Verified</div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}