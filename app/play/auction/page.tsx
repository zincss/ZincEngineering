'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import BackButton from '@/app/components/BackButton';
import { 
    Gavel, Coins, Clock, Plus, Search, Filter, 
    TrendingUp, ArrowUpRight, AlertCircle, Check, X, Loader2
} from 'lucide-react';

// --- TYPES ---
interface AuctionItem {
    id: string;
    seller_id: string;
    item_id: string;
    start_price: number;
    buyout_price: number;
    current_bid: number;
    ends_at: string;
    status: string;
    seller_name?: string; // Joined field
    item_details?: any;   // Joined field from user_items -> items
}

// --- HELPER: TIME REMAINING ---
const getTimeLeft = (endsAt: string) => {
    const total = Date.parse(endsAt) - Date.now();
    if (total <= 0) return { text: "ENDED", urgent: false };
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    
    if (hours === 0 && minutes < 5) return { text: `${minutes}m ${Math.floor((total / 1000) % 60)}s`, urgent: true };
    if (hours === 0) return { text: `${minutes}m`, urgent: true };
    return { text: `${hours}h ${minutes}m`, urgent: false };
};

export default function AuctionHouse() {
    const { user, profile, refreshProfile } = useAuth();
    const [auctions, setAuctions] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'BROWSE' | 'MY_BIDS' | 'MY_LISTINGS'>('BROWSE');
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchAuctions();
        
        // Realtime Subscription
        const channel = supabase
            .channel('public:auctions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => {
                fetchAuctions(); // Refresh on any change
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [view, user]);

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('auctions')
                .select(`
                    *,
                    item_details:user_items!inner(
                        id,
                        is_shiny,
                        serial_number,
                        item:items(name, rarity, description, image_url)
                    )
                `)
                .eq('status', 'ACTIVE')
                .order('ends_at', { ascending: true }); // Ending soonest first

            if (view === 'MY_LISTINGS' && user) {
                query = query.eq('seller_id', user.id);
            }
            // Note: 'MY_BIDS' would require a more complex join on the bids table, simpler for v1 to skip or filter client-side if small data

            const { data, error } = await query;
            if (error) throw error;
            setAuctions(data || []);
        } catch (err) {
            console.error("Auction Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBid = async (auction: AuctionItem, bidAmount: number) => {
        if (!user || !profile) return alert("Login required");
        if (profile.credits < bidAmount) return alert("Insufficient Credits");
        if (auction.seller_id === user.id) return alert("Cannot bid on own auction");

        const confirmMsg = bidAmount >= auction.buyout_price 
            ? `Buyout ${auction.item_details.item.name} for ${bidAmount} CR?`
            : `Place bid of ${bidAmount} CR on ${auction.item_details.item.name}?`;

        if (!confirm(confirmMsg)) return;

        try {
            // 1. Deduct Credits
            const { error: creditError } = await supabase.rpc('add_credits', { amount: -bidAmount });
            if (creditError) throw creditError;

            // 2. Place Bid Row
            const { error: bidError } = await supabase.from('bids').insert({
                auction_id: auction.id,
                bidder_id: user.id,
                amount: bidAmount
            });
            if (bidError) throw bidError;

            // 3. Update Auction State
            const newStatus = bidAmount >= auction.buyout_price ? 'SOLD' : 'ACTIVE';
            await supabase.from('auctions').update({ 
                current_bid: bidAmount,
                winner_id: user.id,
                status: newStatus 
            }).eq('id', auction.id);

            refreshProfile();
            alert("Bid Placed Successfully!");
        } catch (err) {
            console.error(err);
            alert("Bid Failed. Someone may have outbid you.");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20">
            <BackButton href="/play" label="ARCADE HUB" />

            {/* HEADER */}
            <div className="pt-32 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 pb-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-sm font-black tracking-widest uppercase mb-2">
                            <Gavel size={16} />
                            <span>GLOBAL_MARKET // AUCTION_HOUSE</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                            Black <span className="text-zinc-700">Market</span>
                        </h1>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsListingModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-widest rounded transition-all"
                        >
                            <Plus size={18} /> Start Auction
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-8 mt-12 border-b border-zinc-800">
                    {['BROWSE', 'MY_BIDS', 'MY_LISTINGS'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setView(tab as any)}
                            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${
                                view === tab 
                                    ? 'text-[#DFFF00] border-b-2 border-[#DFFF00]' 
                                    : 'text-zinc-500 hover:text-white'
                            }`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* GRID CONTENT */}
            <div className="max-w-[1600px] mx-auto px-6">
                {loading ? (
                    <div className="flex justify-center py-20 text-zinc-600 animate-pulse">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                ) : auctions.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                        <p className="text-zinc-500 font-mono">NO ACTIVE AUCTIONS FOUND</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {auctions.map((auction) => (
                            <AuctionCard 
                                key={auction.id} 
                                auction={auction} 
                                onBid={handleBid}
                                currentUserId={user?.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* CREATE LISTING MODAL */}
            {isListingModalOpen && (
                <CreateListingModal 
                    userId={user?.id} 
                    onClose={() => setIsListingModalOpen(false)} 
                    onSuccess={() => { setIsListingModalOpen(false); fetchAuctions(); }} 
                />
            )}
        </div>
    );
}

// --- SUB-COMPONENT: AUCTION CARD ---
const AuctionCard = ({ auction, onBid, currentUserId }: { auction: AuctionItem, onBid: any, currentUserId?: string }) => {
    const item = auction.item_details.item;
    const isOwner = currentUserId === auction.seller_id;
    const timeLeft = getTimeLeft(auction.ends_at);
    
    // Calculate Next Minimum Bid (e.g., +10%)
    const nextBid = Math.ceil(auction.current_bid * 1.1);

    return (
        <div className="group relative bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] transition-all duration-300 rounded-xl overflow-hidden flex flex-col">
            {/* Image Preview */}
            <div className="relative h-48 bg-black/50 p-4 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-black pointer-events-none" />
                <img 
                    src={`https://image.pollinations.ai/prompt/isometric%203d%20icon%20of%20${encodeURIComponent(item.name)},%20cyberpunk,%20dark%20background?width=300&height=300&nologo=true`} 
                    alt={item.name}
                    className="w-32 h-32 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Rarity Badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur border border-zinc-700 rounded text-[9px] font-bold uppercase text-zinc-400">
                    {item.rarity}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-lg uppercase leading-tight">{item.name}</h3>
                    <div className={`text-xs font-mono font-bold flex items-center gap-1 ${timeLeft.urgent ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                        <Clock size={12} /> {timeLeft.text}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">Current Bid</div>
                        <div className="text-[#DFFF00] font-mono font-black">{auction.current_bid.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">Buyout</div>
                        <div className="text-white font-mono font-black">{auction.buyout_price.toLocaleString()}</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                    {!isOwner ? (
                        <>
                            <button 
                                onClick={() => onBid(auction, nextBid)}
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded transition-colors"
                            >
                                Bid {nextBid}
                            </button>
                            <button 
                                onClick={() => onBid(auction, auction.buyout_price)}
                                className="flex-1 py-3 bg-[#DFFF00] hover:bg-white text-black text-[10px] font-black uppercase tracking-widest rounded transition-colors"
                            >
                                Buy {auction.buyout_price}
                            </button>
                        </>
                    ) : (
                        <div className="w-full py-3 bg-zinc-800/50 border border-dashed border-zinc-700 text-zinc-500 text-center text-[10px] font-mono rounded">
                            YOUR LISTING
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: CREATE LISTING MODAL ---
const CreateListingModal = ({ userId, onClose, onSuccess }: any) => {
    const [inventory, setInventory] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [startPrice, setStartPrice] = useState(100);
    const [buyoutPrice, setBuyoutPrice] = useState(1000);
    const [duration, setDuration] = useState(24); // Hours
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch eligible items (not currently auctioned)
        const fetchInv = async () => {
            if(!userId) return;
            const { data } = await supabase
                .from('user_items')
                .select('id, item:items(name, rarity)')
                .eq('user_id', userId);
            setInventory(data || []);
        };
        fetchInv();
    }, [userId]);

    const handleCreate = async () => {
        if (!selectedItem) return alert("Select an item");
        setLoading(true);

        const endDate = new Date();
        endDate.setHours(endDate.getHours() + duration);

        const { error } = await supabase.from('auctions').insert({
            seller_id: userId,
            item_id: selectedItem,
            start_price: startPrice,
            current_bid: startPrice,
            buyout_price: buyoutPrice,
            ends_at: endDate.toISOString()
        });

        setLoading(false);
        if (error) alert("Error creating auction");
        else onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                    <Plus className="text-[#DFFF00]" /> Create Listing
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Select Asset</label>
                        <select 
                            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-sm text-white"
                            onChange={(e) => setSelectedItem(e.target.value)}
                        >
                            <option value="">-- Choose Item --</option>
                            {inventory.map((i: any) => (
                                <option key={i.id} value={i.id}>
                                    {i.item.name} ({i.item.rarity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Start Bid</label>
                            <input 
                                type="number" 
                                value={startPrice} 
                                onChange={e => setStartPrice(Number(e.target.value))}
                                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-sm text-white font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Buyout</label>
                            <input 
                                type="number" 
                                value={buyoutPrice} 
                                onChange={e => setBuyoutPrice(Number(e.target.value))}
                                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-sm text-white font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Duration</label>
                        <div className="flex gap-2">
                            {[1, 6, 12, 24, 48].map(h => (
                                <button 
                                    key={h}
                                    onClick={() => setDuration(h)}
                                    className={`flex-1 py-2 text-xs font-bold rounded border ${duration === h ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
                                >
                                    {h}h
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 bg-zinc-800 text-white font-bold uppercase rounded">Cancel</button>
                    <button onClick={handleCreate} disabled={loading} className="flex-1 py-3 bg-[#DFFF00] text-black font-bold uppercase rounded">
                        {loading ? 'Processing...' : 'List Item'}
                    </button>
                </div>
            </div>
        </div>
    );
};