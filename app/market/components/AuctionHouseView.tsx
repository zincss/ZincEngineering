'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Plus, X, Clock, Check } from 'lucide-react';
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
        <div className="w-full max-w-[1600px] mx-auto px-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-zinc-800 pb-4">
                <div className="flex gap-4">
                    <button onClick={() => setView('BROWSE')} className={`text-xs font-black uppercase tracking-widest ${view === 'BROWSE' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>Browse Listings</button>
                    <button onClick={() => setView('MY_LISTINGS')} className={`text-xs font-black uppercase tracking-widest ${view === 'MY_LISTINGS' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>My Listings</button>
                </div>
                <button onClick={() => setIsListingModalOpen(true)} className="flex items-center gap-2 px-4 py-3 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-widest rounded transition-all text-xs w-full md:w-auto justify-center"><Plus size={14} /> Sell Item</button>
            </div>
            {loading ? <div className="flex justify-center py-20 text-zinc-600 animate-pulse"><Loader2 size={32} className="animate-spin" /></div> : auctions.length === 0 ? <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl"><p className="text-zinc-500 font-mono">NO ACTIVE AUCTIONS FOUND</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{auctions.map((auction) => <AuctionCard key={auction.id} auction={auction} onBid={handleBid} currentUserId={user?.id} />)}</div>}
            {isListingModalOpen && <CreateListingModal userId={user?.id} onClose={() => setIsListingModalOpen(false)} onSuccess={() => { setIsListingModalOpen(false); fetchAuctions(); }} />}
        </div>
    );
};

const AuctionCard = ({ auction, onBid, currentUserId }: any) => {
    const item = auction.item_details.item; const isOwner = currentUserId === auction.seller_id;
    const timeLeft = getTimeLeft(auction.ends_at); const nextBid = Math.ceil(auction.current_bid * 1.1);
    return (
        <div className="group relative bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] transition-all duration-300 rounded-xl overflow-hidden flex flex-col">
            <div className="relative h-40 bg-black/50 p-4 flex items-center justify-center overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-black pointer-events-none" /><img src={getAssetUrl(item.name)} alt={item.name} className="w-24 h-24 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" /><div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur border border-zinc-700 rounded text-[9px] font-bold uppercase text-zinc-400">{item.rarity}</div></div>
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4"><h3 className="font-black text-sm uppercase leading-tight">{item.name}</h3><div className={`text-[10px] font-mono font-bold flex items-center gap-1 ${timeLeft.urgent ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}><Clock size={10} /> {timeLeft.text}</div></div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800"><div className="text-[8px] text-zinc-500 uppercase font-bold">Current Bid</div><div className="text-[#DFFF00] font-mono font-black text-xs">{auction.current_bid.toLocaleString()}</div></div>
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800"><div className="text-[8px] text-zinc-500 uppercase font-bold">Buyout</div><div className="text-white font-mono font-black text-xs">{auction.buyout_price.toLocaleString()}</div></div>
                </div>
                <div className="mt-auto flex gap-2">
                    {!isOwner ? <><button onClick={() => onBid(auction, nextBid)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded transition-colors active:scale-95">Bid {nextBid}</button><button onClick={() => onBid(auction, auction.buyout_price)} className="flex-1 py-3 bg-[#DFFF00] hover:bg-white text-black text-[10px] font-black uppercase tracking-widest rounded transition-colors active:scale-95">Buy</button></> : <div className="w-full py-3 bg-zinc-800/50 border border-dashed border-zinc-700 text-zinc-500 text-center text-[10px] font-mono rounded">YOUR LISTING</div>}
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
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="w-full h-[90vh] md:h-auto max-w-lg bg-zinc-950 border-t md:border border-zinc-800 rounded-t-3xl md:rounded-2xl p-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black uppercase flex items-center gap-2"><Plus className="text-[#DFFF00]" /> Create Listing</h2><button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full"><X size={20} className="text-zinc-500" /></button></div>
                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {inventory.map((i: any) => (<div key={i.id} onClick={() => setSelectedItem(i.id)} className={`relative cursor-pointer border-2 rounded-xl p-2 transition-all active:scale-95 ${selectedItem === i.id ? 'border-[#DFFF00] bg-[#DFFF00]/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}><div className="aspect-square bg-black/40 rounded-lg mb-2 flex items-center justify-center p-2"><img src={getAssetUrl(i.item.name)} alt="icon" className="w-full h-full object-contain" /></div><div className="text-[9px] font-black uppercase truncate text-zinc-300">{i.item.name}</div>{selectedItem === i.id && <div className="absolute top-1 right-1 bg-[#DFFF00] rounded-full p-0.5"><Check size={10} className="text-black"/></div>}</div>))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Start Bid</label><input type="number" value={startPrice} onChange={e => setStartPrice(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-sm text-white font-mono focus:border-[#DFFF00] focus:outline-none transition-colors" /></div>
                        <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Buyout Price</label><input type="number" value={buyoutPrice} onChange={e => setBuyoutPrice(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-sm text-white font-mono focus:border-[#DFFF00] focus:outline-none transition-colors" /></div>
                    </div>
                    <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Duration</label><div className="flex gap-2 overflow-x-auto pb-1">{[1, 6, 12, 24, 48].map(h => (<button key={h} onClick={() => setDuration(h)} className={`flex-1 min-w-[60px] py-3 text-xs font-bold rounded border transition-all ${duration === h ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>{h}h</button>))}</div></div>
                </div>
                <div className="flex gap-4 mt-6 pt-4 border-t border-zinc-800"><button onClick={handleCreate} disabled={loading || !selectedItem} className="w-full py-4 bg-[#DFFF00] text-black font-black uppercase rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:bg-white transition-colors">{loading ? 'Processing...' : 'Confirm Listing'}</button></div>
            </div>
        </div>
    );
};