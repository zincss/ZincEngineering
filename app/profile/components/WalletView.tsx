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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* LEFT COLUMN: BALANCE & TRANSFER */}
            <div className="lg:col-span-5 space-y-6">
                
                {/* BALANCE CARD */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Coins size={120} />
                    </div>
                    
                    <div className="relative z-10">
                        <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Available Balance</h3>
                        <div className="flex items-baseline gap-2 text-[#DFFF00]">
                            <span className="text-5xl md:text-6xl font-black tracking-tight">
                                {profile?.credits?.toLocaleString() ?? 0}
                            </span>
                            <span className="text-xl font-bold">CR</span>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-zinc-400 text-xs font-mono">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            NETWORK ACTIVE // SYNCED
                        </div>
                    </div>
                </div>

                {/* TRANSFER FORM */}
                <div className="rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 backdrop-blur-sm relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-full bg-[#DFFF00]/10 text-[#DFFF00]">
                            <Send size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Wire Transfer</h3>
                    </div>

                    <form onSubmit={handleTransfer} className="space-y-4">
                        
                        {/* USERNAME INPUT WITH AUTOCOMPLETE */}
                        <div className="space-y-2 relative" ref={wrapperRef}>
                            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-2">Recipient Username</label>
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
                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-[#DFFF00] transition-colors placeholder:text-zinc-800 uppercase"
                                placeholder="START TYPING..."
                                required
                                autoComplete="off"
                            />
                            
                            {/* SUGGESTIONS DROPDOWN */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-2 bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                                        Suggested Users
                                    </div>
                                    {suggestions.map((username) => (
                                        <button
                                            key={username}
                                            type="button"
                                            onClick={() => selectSuggestion(username)}
                                            className="w-full text-left px-4 py-3 text-sm font-mono text-zinc-300 hover:text-black hover:bg-[#DFFF00] transition-colors flex items-center gap-3 border-b border-zinc-800/50 last:border-0"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                                                {username.charAt(0).toUpperCase()}
                                            </div>
                                            {username}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-2">Amount</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-xl p-4 pr-12 text-white font-mono text-sm focus:outline-none focus:border-[#DFFF00] transition-colors placeholder:text-zinc-800"
                                    placeholder="0"
                                    min="1"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-xs">CR</div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={sending || !amount || !recipient}
                            className="w-full bg-[#DFFF00] hover:bg-white text-black font-black uppercase py-4 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {sending ? 'Processing...' : 'Initiate Transfer'}
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT COLUMN: HISTORY */}
            <div className="lg:col-span-7">
                <div className="h-full rounded-[2rem] bg-zinc-900/30 border border-zinc-800 p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-zinc-800 text-zinc-400">
                                <History size={18} />
                            </div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Recent Activity</h3>
                        </div>
                        <button 
                            onClick={fetchTransactions} 
                            className="p-2 text-zinc-600 hover:text-[#DFFF00] transition-colors"
                            title="Refresh History"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[500px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-2">
                                <Loader2 size={24} className="animate-spin text-[#DFFF00]" />
                                <span className="text-xs font-mono uppercase">Fetching Data...</span>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-20 text-zinc-600 font-mono text-xs uppercase tracking-widest border border-dashed border-zinc-800 rounded-xl">
                                No recent transactions found.
                            </div>
                        ) : (
                            transactions.map((tx) => {
                                const { isReceived, label, partyName, icon } = getTransactionDetails(tx);
                                return (
                                    <div 
                                        key={tx.id} 
                                        className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 transition-all hover:bg-zinc-900"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${isReceived ? 'bg-emerald-900/20 text-emerald-500' : 'bg-red-900/20 text-red-500'}`}>
                                                {icon}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">
                                                    {label} <span className="text-zinc-400">{partyName}</span>
                                                </div>
                                                <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">
                                                    {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`font-mono font-black text-lg ${isReceived ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                            {isReceived ? '+' : '-'}{tx.amount.toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}