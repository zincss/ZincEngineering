'use client';

import { X, Box } from 'lucide-react';

interface InventoryItem {
    id: string;
    item_template: {
        name: string;
        rarity: string;
        image_url?: string;
    };
    rarity?: string; // fallback if flattened
}

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (itemId: string) => void;
    inventory: InventoryItem[];
}

export default function InventoryModal({ isOpen, onClose, onSelect, inventory }: InventoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 relative shadow-2xl">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-lg font-black uppercase italic mb-1 text-white">Select Asset</h3>
                <p className="text-xs text-zinc-500 mb-4">Choose an item from your inventory to display.</p>
                
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {inventory.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className="w-full p-3 bg-zinc-950 border border-white/5 hover:border-[#DFFF00] hover:bg-zinc-900 rounded-lg flex items-center gap-3 group transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-zinc-900 rounded border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-[#DFFF00]">
                                <Box size={16} />
                            </div>
                            
                            <div className="flex-1">
                                <div className="text-sm font-bold text-zinc-300 group-hover:text-white truncate">
                                    {item.item_template?.name || 'Unknown Item'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        {item.item_template?.rarity || 'Common'}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                    
                    {inventory.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
                            <Box className="mx-auto text-zinc-700 mb-2" />
                            <div className="text-zinc-500 text-sm font-bold">No Items Found</div>
                            <div className="text-zinc-600 text-xs">Your inventory is empty.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}