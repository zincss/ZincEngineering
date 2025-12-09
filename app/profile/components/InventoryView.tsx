import React from 'react';
import { Box, Zap, ArrowUpDown, Filter, Loader2 } from 'lucide-react';
import { InventoryItem, SortOption } from '../types';
import Link from 'next/link';

// You can move the getAssetUrl helper to a shared utils file or pass it down
// For now, assuming you have the ItemImage component or similar available
const ItemImage = ({ name, rarity, className }: any) => {
    // ... (Use your existing ItemImage logic here or import it)
    return <div className={`bg-zinc-800 ${className}`} />; // Placeholder for brevity
};

interface InventoryViewProps {
    inventory: InventoryItem[];
    loading: boolean;
    filter: string;
    setFilter: (f: string) => void;
    sortBy: SortOption;
    setSortBy: (s: SortOption) => void;
    onSelectItem: (item: InventoryItem) => void;
    getRarityColor: (r: string) => void;
}

export const InventoryView = ({ 
    inventory, loading, filter, setFilter, sortBy, setSortBy, onSelectItem, getRarityColor 
}: InventoryViewProps) => {
    const [showSortMenu, setShowSortMenu] = React.useState(false);

    if (loading) return <div className="py-20 text-center text-zinc-500 font-mono text-sm">LOADING ASSETS...</div>;

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter size={14} className="text-zinc-600" />
                    {['ALL', 'DUPLICATES', 'ZENITH', 'COSMIC', 'ULTRA', 'SHINY', 'COMMON'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-[10px] font-bold uppercase rounded ${filter === f ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'}`}>
                            {f}
                        </button>
                    ))}
                </div>
                
                <div className="relative">
                    <button onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold uppercase text-zinc-400">
                        <ArrowUpDown size={14} /> Sort: {sortBy}
                    </button>
                    {showSortMenu && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-10 flex flex-col p-1">
                            {['NEWEST', 'OLDEST', 'RARITY_DESC', 'RARITY_ASC'].map((opt: any) => (
                                <button key={opt} onClick={() => { setSortBy(opt); setShowSortMenu(false); }} className="px-3 py-2 text-left text-[10px] font-bold uppercase hover:bg-zinc-800 text-zinc-400">
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Grid */}
            {inventory.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <p className="text-zinc-500 font-mono text-sm mb-4">NO ASSETS FOUND</p>
                    <Link href="/play/market" className="px-6 py-3 bg-[#DFFF00] text-black font-black uppercase text-xs rounded">Visit Black Market</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {inventory.map((item) => (
                        <button key={item.id} onClick={() => onSelectItem(item)} className={`group relative bg-zinc-900 border-2 rounded-xl p-3 text-left overflow-hidden ${getRarityColor(item.item_templates.rarity)}`}>
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className="text-[8px] font-mono opacity-50">#{String(item.serial_number).padStart(4, '0')}</span>
                                {item.is_shiny && <Zap size={10} className="text-yellow-400 fill-current" />}
                            </div>
                            {/* Insert Image Component Here */}
                            <h3 className="text-[10px] font-black uppercase truncate mb-1 relative z-10">{item.item_templates.name}</h3>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};