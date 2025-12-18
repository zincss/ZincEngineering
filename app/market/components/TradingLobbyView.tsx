'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Plus, Users, Search, ArrowRight } from 'lucide-react';

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
        <div className="w-full max-w-[1600px] mx-auto px-6 pb-20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-zinc-800 pb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Trading Floor</h2>
                    <p className="text-zinc-500 text-xs font-mono mt-1">Global Asset Exchange Protocol</p>
                </div>
                <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('PUBLIC')} className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${activeTab === 'PUBLIC' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Public Market</button>
                    <button onClick={() => setActiveTab('DIRECT')} className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${activeTab === 'DIRECT' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Direct Invite</button>
                </div>
            </div>

            {incomingInvites.length > 0 && (
                <div className="mb-8 animate-in slide-in-from-top-4">
                    <div className="bg-[#DFFF00]/10 border border-[#DFFF00] rounded-xl p-4">
                        <h3 className="text-[#DFFF00] font-black uppercase text-sm mb-3 flex items-center gap-2">
                            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[#DFFF00]"></span></span>
                            Incoming Trade Requests
                        </h3>
                        <div className="grid gap-3">
                            {incomingInvites.map(invite => (
                                <div key={invite.id} className="bg-zinc-950 p-4 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500"><Users size={20} /></div>
                                        <div><div className="text-white font-bold text-sm">Trade Request</div><div className="text-zinc-500 text-xs">ID: {invite.id.slice(0,8)}</div></div>
                                    </div>
                                    <button onClick={() => acceptInvite(invite.id)} className="bg-[#DFFF00] hover:bg-white text-black px-6 py-2 rounded font-black text-xs uppercase">Accept & Join</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'PUBLIC' && (
                <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-zinc-400 text-xs font-mono uppercase">Open Listings ({publicTrades.length})</div>
                        <button onClick={createPublicTrade} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-4 py-2 rounded font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> Create Public Listing</button>
                    </div>
                    {loading ? <div className="text-center py-20 opacity-50"><Loader2 className="animate-spin mx-auto mb-2" /></div> : publicTrades.length === 0 ? <div className="border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center"><p className="text-zinc-600 font-mono text-sm uppercase">No public trades available.</p></div> : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {publicTrades.map(trade => (
                                <div key={trade.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-600 transition-all flex flex-col justify-between">
                                    <div className="mb-4"><div className="text-xs text-zinc-500 font-mono mb-1">{new Date(trade.created_at).toLocaleTimeString()}</div><div className="font-bold text-white">Public Trade Room</div></div>
                                    <button onClick={() => router.push(`/play/market/trade/${trade.id}`)} className="w-full bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 py-2 rounded font-bold text-xs uppercase transition-colors">Join Room</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'DIRECT' && (
                <div className="animate-in fade-in duration-300 max-w-2xl mx-auto">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 uppercase text-sm">Find Player</h3>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                <input type="text" placeholder="Search by username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#DFFF00] transition-colors" />
                            </div>
                            <button type="submit" disabled={isSearching} className="bg-white text-black font-bold uppercase px-6 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50">{isSearching ? <Loader2 className="animate-spin" /> : 'Search'}</button>
                        </form>
                        {searchResults.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-zinc-500 text-[10px] font-bold uppercase mb-2">Results</div>
                                {searchResults.map(player => (
                                    <div key={player.id} className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-400">{player.username?.[0]?.toUpperCase() || '?'}</div>
                                            <div className="text-white font-bold text-sm">{player.username}</div>
                                        </div>
                                        <button onClick={() => sendInvite(player.id)} className="bg-[#DFFF00] hover:bg-[#bfff00] text-black text-[10px] font-black uppercase px-3 py-2 rounded">Invite to Trade</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.length === 0 && searchQuery && !isSearching && <div className="text-center text-zinc-600 text-xs py-4">No agents found with that alias.</div>}
                    </div>
                </div>
            )}

            {myTrades.length > 0 && (
                <div className="mt-12 border-t border-zinc-800 pt-8">
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Your Active Sessions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myTrades.map(trade => (
                            <div key={trade.id} onClick={() => router.push(`/play/market/trade/${trade.id}`)} className="cursor-pointer bg-zinc-900 border-l-2 border-[#DFFF00] p-4 flex justify-between items-center hover:bg-zinc-800 transition-colors">
                                <div>
                                    <div className="text-white font-bold text-sm uppercase">{trade.status === 'invited' ? `Waiting for invitee...` : 'Session Active'}</div>
                                    <div className="text-zinc-600 text-xs font-mono">{trade.id.slice(0,8)}</div>
                                </div>
                                <ArrowRight className="text-zinc-600" size={16} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};