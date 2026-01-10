'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Plus, X, Clock, Check, Anchor, Globe, Package, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetUrl, getTimeLeft } from './shared';

interface AuctionItem { id: string; seller_id: string; item_id: string; start_price: number; buyout_price: number; current_bid: number; ends_at: string; status: string; item_details?: any; }

export const AuctionHouseView = ({ user, profile, refreshProfile }: any) => {
    const [auctions, setAuctions] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'BROWSE' | 'MY_LISTINGS'>('BROWSE');
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);

    const fetchAuctions = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase.from('auctions').select(`*, item_details:user_items!inner(id, is_shiny, serial_number, item:items(name, rarity, description, image_url))`).eq('status', 'ACTIVE').order('ends_at', { ascending: true });
            if (view === 'MY_LISTINGS' && user) query = query.eq('seller_id', user.id);
            const { data } = await query;
            setAuctions(data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [view, user]);

    useEffect(() => {
        fetchAuctions();
        const channel = supabase.channel('public:auctions').on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => fetchAuctions()).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchAuctions]);

    const handleBid = async (auction: AuctionItem, bidAmount: number) => {
        if (!user || !profile) return alert("Login required");
        if (profile.credits < bidAmount) return alert("Insufficient Credits");
        if (auction.seller_id === user.id) return alert("Cannot bid on own auction");
        const confirmMsg = bidAmount >= auction.buyout_price ? `Buyout ${auction.item_details.item.name} for ${bidAmount} CR?` : `Place bid of ${bidAmount} CR on ${auction.item_details.item.name}?`;
        if (!confirm(confirmMsg)) return;
        try {
            const { error: creditError } = await supabase.rpc('add_credits', { amount: -bidAmount });
            if (creditError) throw creditError;
            await supabase.from('bids').insert({ auction_id: auction.id, bidder_id: user.id, amount: bidAmount });
            const newStatus = bidAmount >= auction.buyout_price ? 'SOLD' : 'ACTIVE';
            await supabase.from('auctions').update({ current_bid: bidAmount, winner_id: user.id, status: newStatus }).eq('id', auction.id);
            refreshProfile();
            alert("Bid Placed Successfully!");
        } catch (err) { alert("Bid Failed. Someone may have outbid you."); }
    };

    return (
        <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 pb-32 pt-6">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8 border-b border-white/5 pb-12">
            <div className="flex items-center gap-8 w-full lg:w-auto">
                <div>
                    <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-2">
                        <span>Zinc_Market_Protocol // V4.2</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
                            <div className="w-1 h-1 rounded-full bg-[#DFFF00] animate-pulse" />
                            <span className="text-[8px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest">Global_Liquidity_Online</span>
                        </div>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic text-white">
                        Auction <span className="text-zinc-800">House</span>
                    </h1>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="flex gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl w-full sm:w-fit">
                    <button 
                        onClick={() => setView('BROWSE')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'BROWSE' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        Browse
                    </button>
                    <button 
                        onClick={() => setView('MY_LISTINGS')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'MY_LISTINGS' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        Listings
                    </button>
                </div>
                <button 
                    onClick={() => setIsListingModalOpen(true)} 
                    className="group flex items-center gap-4 px-8 py-4 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-[0.25em] rounded-[2rem] transition-all text-xs w-full sm:w-auto justify-center shadow-[0_10px_30px_rgba(223,255,0,0.2)] active:scale-[0.98]"
                >
                    <Plus size={18} className="transition-transform group-hover:rotate-90 duration-500" /> 
                    <span>Authorize Sale</span>
                </button>
            </div>
        </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-zinc-600 gap-6">
                    <div className="relative">
                        <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
                        <div className="absolute inset-0 blur-xl bg-[#DFFF00]/20 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-60">Synchronizing Bidding Data...</span>
                </div>
            ) : auctions.length === 0 ? (
                <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                    <Clock className="w-12 h-12 text-zinc-800 mx-auto mb-6 opacity-40" />
                    <p className="text-zinc-600 font-mono text-sm uppercase tracking-[0.3em]">No Active Auction Signatures Detected</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} onBid={handleBid} currentUserId={user?.id} />
                    ))}
                </div>
            )}

            {isListingModalOpen && (
                <CreateListingModal 
                    userId={user?.id} 
                    onClose={() => setIsListingModalOpen(false)} 
                    onSuccess={() => { setIsListingModalOpen(false); fetchAuctions(); }} 
                />
            )}
        </div>
    );
};

const AuctionCard = ({ auction, onBid, currentUserId }: any) => {
    const item = auction.item_details.item; 
    const isOwner = currentUserId === auction.seller_id;
    const timeLeft = getTimeLeft(auction.ends_at); 
    const nextBid = Math.ceil(auction.current_bid * 1.1);

    return (
        <div className="group relative bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-500 rounded-[2.5rem] overflow-hidden flex flex-col backdrop-blur-3xl hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]">
            <div className="relative aspect-square bg-[#0a0a0a] p-8 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
                <img 
                    src={getAssetUrl(item.name)} 
                    alt={item.name} 
                    className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-6 right-6 px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-400">
                    {item.rarity}
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="font-sans font-black tracking-tighter text-2xl text-white leading-none group-hover:text-[#DFFF00] transition-colors uppercase">{item.name}</h3>
                    <div className={`text-[9px] font-mono font-bold flex items-center gap-2 px-2 py-1 rounded-full border bg-black/40 transition-colors ${timeLeft.urgent ? 'text-rose-500 border-rose-500/30 animate-pulse' : 'text-zinc-500 border-white/5'}`}>
                        <Clock size={10} /> {timeLeft.text}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                        <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Current Bid</div>
                        <div className="text-[#DFFF00] font-sans font-black tracking-tighter text-xl tabular-nums">{auction.current_bid.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-right">
                        <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1 text-right">Buyout</div>
                        <div className="text-white font-sans font-black tracking-tighter text-xl tabular-nums">{auction.buyout_price.toLocaleString()}</div>
                    </div>
                </div>

                <div className="mt-auto flex gap-2">
                    {!isOwner ? (
                        <>
                            <button 
                                onClick={() => onBid(auction, nextBid)} 
                                className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-[0.98]"
                            >
                                Bid {nextBid}
                            </button>
                            <button 
                                onClick={() => onBid(auction, auction.buyout_price)} 
                                className="flex-1 py-4 bg-[#DFFF00] hover:bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-[0.98] shadow-[#DFFF00]/10"
                            >
                                Buyout
                            </button>
                        </>
                    ) : (
                        <div className="w-full py-4 bg-white/5 border border-dashed border-white/10 text-zinc-500 text-center text-[10px] font-mono font-bold tracking-[0.2em] rounded-2xl uppercase">
                            Your Asset Listing
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CreateListingModal = ({ userId, onClose, onSuccess }: any) => {
    const [inventory, setInventory] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [startPrice, setStartPrice] = useState(100);
    const [buyoutPrice, setBuyoutPrice] = useState(1000);
    const [duration, setDuration] = useState(24);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInv = async () => {
            if(!userId) return;
            try {
                const { data: items } = await supabase.from('user_items').select('id, item:items(name, rarity)').eq('user_id', userId);
                const { data: activeAuctions } = await supabase.from('auctions').select('item_id').eq('seller_id', userId).eq('status', 'ACTIVE');
                const listedItemIds = new Set(activeAuctions?.map(a => a.item_id));
                setInventory(items?.filter(i => !listedItemIds.has(i.id)) || []);
            } catch (err) { console.error(err); }
        };
        fetchInv();
    }, [userId]);

    const handleCreate = async () => {
        if (!selectedItem) return alert("Select an item");
        setLoading(true);
        const endDate = new Date(); endDate.setHours(endDate.getHours() + duration);
        const { error } = await supabase.from('auctions').insert({ seller_id: userId, item_id: selectedItem, start_price: startPrice, current_bid: startPrice, buyout_price: buyoutPrice, ends_at: endDate.toISOString() });
        setLoading(false);
        if (error) alert("Error creating auction"); else onSuccess();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full h-[92vh] sm:h-auto max-w-2xl bg-[#080808] border-t sm:border border-white/10 sm:rounded-[3rem] p-8 sm:p-12 shadow-2xl flex flex-col shadow-black relative"
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <div className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.3em] mb-2">Inventory Sync</div>
                        <h2 className="text-4xl font-black uppercase text-white tracking-tighter leading-none flex items-center gap-4">
                            <Plus className="text-[#DFFF00]" size={32} /> 
                            Create Listing
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 text-zinc-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-10 custom-scrollbar pr-2 pb-6">
                    {/* Item Picker */}
                    <div className="space-y-4">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Select Asset from Storage</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {inventory.map((i: any) => (
                                <div 
                                    key={i.id} 
                                    onClick={() => setSelectedItem(i.id)} 
                                    className={`group relative cursor-pointer border-2 rounded-[2rem] p-4 transition-all duration-500 active:scale-[0.98] ${selectedItem === i.id ? 'border-[#DFFF00] bg-[#DFFF00]/5' : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'}`}
                                >
                                    <div className="aspect-square bg-black/40 rounded-2xl mb-4 flex items-center justify-center p-4">
                                        <img src={getAssetUrl(i.item.name)} alt="icon" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest truncate text-zinc-400 group-hover:text-white transition-colors text-center px-2">{i.item.name}</div>
                                    {selectedItem === i.id && (
                                        <motion.div layoutId="item-selected" className="absolute -top-2 -right-2 bg-[#DFFF00] rounded-full p-1.5 shadow-lg shadow-[#DFFF00]/20">
                                            <Check size={14} className="text-black font-black"/>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {inventory.length === 0 && (
                            <div className="py-12 text-center rounded-[2rem] border border-dashed border-white/5 bg-white/[0.01]">
                                <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest leading-relaxed">No tradable assets detected in primary storage.</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Starting Reserve</label>
                            <div className="relative">
                                <input type="number" value={startPrice} onChange={e => setStartPrice(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-xl text-white font-sans font-black tracking-tighter focus:border-[#DFFF00] focus:outline-none transition-all shadow-inner tabular-nums pl-12" />
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">$</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Buyout Price</label>
                            <div className="relative">
                                <input type="number" value={buyoutPrice} onChange={e => setBuyoutPrice(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-xl text-white font-sans font-black tracking-tighter focus:border-[#DFFF00] focus:outline-none transition-all shadow-inner tabular-nums pl-12" />
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">$</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Listing Duration</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {[1, 6, 12, 24, 48].map(h => (
                                <button 
                                    key={h} 
                                    onClick={() => setDuration(h)} 
                                    className={`flex-1 min-w-[80px] py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all duration-300 active:scale-[0.95] ${duration === h ? 'bg-white text-black border-white shadow-lg' : 'bg-white/[0.02] text-zinc-500 border-white/5 hover:border-white/20 hover:text-white'}`}
                                >
                                    {h} Hours
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <button 
                        onClick={handleCreate} 
                        disabled={loading || !selectedItem} 
                        className="w-full py-6 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-[0.3em] rounded-[2rem] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl transition-all active:scale-[0.98] text-sm shadow-[#DFFF00]/10"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Authorize Protocol Listing'}
                    </button>
                    <p className="text-center mt-6 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] opacity-60">Listing Fee: 50 CR // Verified Authentication Required</p>
                </div>
            </motion.div>
        </div>
    );
};
