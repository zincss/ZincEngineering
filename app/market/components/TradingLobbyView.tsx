'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Plus, Users, Search, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TradingLobbyView = ({ user }: { user: any }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'PUBLIC' | 'DIRECT'>('PUBLIC');
    
    const [publicTrades, setPublicTrades] = useState<any[]>([]);
    const [myTrades, setMyTrades] = useState<any[]>([]);
    const [incomingInvites, setIncomingInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const fetchTrades = useCallback(async () => {
        if (!user) return;
        
        // A. Public Pending Trades
        const { data: publicData } = await supabase
            .from('market_trades')
            .select('*, initiator:profiles(username)')
            .is('receiver_id', null)
            .eq('status', 'pending')
            .neq('initiator_id', user.id)
            .order('created_at', { ascending: false });

        // B. My Trades (Sent OR Received)
        const { data: myData } = await supabase
            .from('market_trades')
            .select('*, other:profiles!receiver_id(username)') 
            .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .in('status', ['pending', 'active', 'invited'])
            .order('created_at', { ascending: false });

        if (publicData) setPublicTrades(publicData);
        if (myData) {
            const invites = myData.filter(t => t.receiver_id === user.id && t.status === 'invited');
            const active = myData.filter(t => !(t.receiver_id === user.id && t.status === 'invited'));
            setIncomingInvites(invites);
            setMyTrades(active);
        }
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        fetchTrades();
        const channel = supabase.channel('market_lobby_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'market_trades' }, () => fetchTrades())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchTrades]); 

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        const { data, error } = await supabase.rpc('search_players', { search_term: searchQuery });
        if (error) console.error(error);
        if (data) setSearchResults(data.filter((p: any) => p.id !== user.id)); 
        setIsSearching(false);
    };

    const createPublicTrade = async () => {
        const { data } = await supabase.from('market_trades').insert([{ initiator_id: user.id, status: 'pending' }]).select().single();
        if (data) router.push(`/play/market/trade/${data.id}`);
    };

    const sendInvite = async (targetUserId: string) => {
        const { data, error } = await supabase
            .from('market_trades')
            .insert([{ initiator_id: user.id, receiver_id: targetUserId, status: 'invited' }])
            .select().single();
        if (error) alert('Could not send invite.');
        else router.push(`/play/market/trade/${data.id}`);
    };

    const acceptInvite = async (tradeId: string) => {
        const { error } = await supabase.from('market_trades').update({ status: 'active' }).eq('id', tradeId);
        if (!error) router.push(`/play/market/trade/${tradeId}`);
    };

    return (
        <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 pb-32 pt-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8 border-b border-white/5 pb-10">
                <div>
                    <div className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                        P2P Exchange Protocol
                        <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">
                        Trading <span className="text-zinc-800">Floor</span>
                    </h2>
                </div>
                <div className="flex gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl w-full lg:w-auto">
                    <button 
                        onClick={() => setActiveTab('PUBLIC')} 
                        className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'PUBLIC' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        Public Market
                    </button>
                    <button 
                        onClick={() => setActiveTab('DIRECT')} 
                        className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'DIRECT' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        Direct Invite
                    </button>
                </div>
            </div>

            {incomingInvites.length > 0 && (
                <div className="mb-12 animate-in slide-in-from-top-4">
                    <div className="bg-[#DFFF00]/5 border border-[#DFFF00]/20 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#DFFF00]/[0.02] to-transparent pointer-events-none" />
                        <h3 className="text-[#DFFF00] font-black uppercase text-xs tracking-[0.3em] mb-6 flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DFFF00]"></span>
                            </span>
                            Incoming Trade Requests
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {incomingInvites.map(invite => (
                                <div key={invite.id} className="bg-black/40 border border-white/10 p-6 rounded-2xl flex justify-between items-center group hover:border-[#DFFF00]/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#DFFF00] border border-white/5 group-hover:scale-110 transition-transform">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm tracking-wide">Verification Required</div>
                                            <div className="text-zinc-500 font-mono text-[10px] uppercase mt-1">SIG: {invite.id.slice(0,8)}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => acceptInvite(invite.id)} 
                                        className="bg-[#DFFF00] hover:bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]"
                                    >
                                        Accept & Join
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'PUBLIC' && (
                <div className="animate-in fade-in duration-500">
                    <div className="flex justify-between items-end mb-10 px-2">
                        <div className="text-zinc-500 text-[10px] font-mono font-bold uppercase tracking-[0.3em]">
                            Open Listings <span className="text-white ml-2">[{publicTrades.length}]</span>
                        </div>
                        <button 
                            onClick={createPublicTrade} 
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                        >
                            <Plus size={16} /> 
                            <span>Initiate Public Session</span>
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-50 gap-4">
                            <Loader2 className="animate-spin text-[#DFFF00]" size={32} />
                            <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Querying Public Nodes...</span>
                        </div>
                    ) : publicTrades.length === 0 ? (
                        <div className="border-2 border-dashed border-white/5 rounded-[3rem] p-24 text-center bg-white/[0.01]">
                            <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.3em]">No Active Trade Signatures Detected</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {publicTrades.map(trade => (
                                <div 
                                    key={trade.id} 
                                    className="group relative bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] flex flex-col justify-between backdrop-blur-3xl"
                                >
                                    <div className="mb-8">
                                        <div className="text-[10px] text-zinc-600 font-mono font-bold mb-2 uppercase tracking-widest">Session Start: {new Date(trade.created_at).toLocaleTimeString()}</div>
                                        <div className="font-sans font-black tracking-tighter text-2xl text-white group-hover:text-[#DFFF00] transition-colors leading-tight">Anonymous Trade Room</div>
                                        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-2 opacity-60 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Live Connection
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => router.push(`/play/market/trade/${trade.id}`)} 
                                        className="w-full py-4 bg-white/5 hover:bg-white hover:text-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] transition-all active:scale-[0.98]"
                                    >
                                        Authorize Link
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'DIRECT' && (
                <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                        <h3 className="text-white font-black uppercase text-sm tracking-[0.3em] mb-8 relative z-10">Scan Player Alias</h3>
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10 relative z-10">
                            <div className="relative flex-1">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Enter unique identifier..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium focus:outline-none focus:border-[#DFFF00] transition-all shadow-inner placeholder:text-zinc-700" 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSearching} 
                                className="bg-white text-black font-black uppercase tracking-widest px-10 py-4 rounded-2xl hover:bg-[#DFFF00] transition-all disabled:opacity-30 active:scale-[0.98] shadow-xl text-xs"
                            >
                                {isSearching ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
                            </button>
                        </form>
                        
                        {searchResults.length > 0 && (
                            <div className="space-y-3 relative z-10">
                                <div className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4 ml-2">Verification Results</div>
                                {searchResults.map(player => (
                                    <div key={player.id} className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-sans font-black tracking-tighter text-lg text-zinc-400 border border-white/5 group-hover:text-white transition-colors">
                                                {player.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="text-white font-bold text-sm tracking-wide uppercase">{player.username}</div>
                                        </div>
                                        <button 
                                            onClick={() => sendInvite(player.id)} 
                                            className="bg-[#DFFF00] hover:bg-white text-black text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-lg shadow-[#DFFF00]/10 active:scale-[0.95] transition-all"
                                        >
                                            Invite
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.length === 0 && searchQuery && !isSearching && (
                            <div className="text-center text-zinc-600 text-[10px] font-mono uppercase tracking-[0.3em] py-8 border border-dashed border-white/5 rounded-2xl relative z-10">
                                No agents detected with that signature.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {myTrades.length > 0 && (
                <div className="mt-20 border-t border-white/5 pt-12">
                    <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 ml-2">Active Encrypted Sessions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myTrades.map(trade => (
                            <div 
                                key={trade.id} 
                                onClick={() => router.push(`/play/market/trade/${trade.id}`)} 
                                className="group cursor-pointer bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex justify-between items-center hover:bg-white/[0.05] hover:border-[#DFFF00]/30 transition-all duration-500 backdrop-blur-3xl"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-2 h-2 rounded-full ${trade.status === 'invited' ? 'bg-orange-500 animate-pulse' : 'bg-[#DFFF00] shadow-[0_0_8px_#DFFF00]'}`} />
                                    <div>
                                        <div className="text-white font-bold text-sm uppercase tracking-wide group-hover:text-[#DFFF00] transition-colors">{trade.status === 'invited' ? `Pending Response...` : 'Authorized Session'}</div>
                                        <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest mt-1">NODE: {trade.id.slice(0,8)}</div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-600 group-hover:bg-[#DFFF00] group-hover:text-black group-hover:border-white transition-all">
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
