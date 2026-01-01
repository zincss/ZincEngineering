'use client';

import { useState } from 'react';
import { Plus, Box, Server, Crown, X } from 'lucide-react';
import { equipItemToSlot } from '../actions';
import InventoryModal from './InventoryModal';
import { PropertySlot, SlotType } from '../types';

interface SlotGridProps {
    maxSlots: number;
    currentSlots: PropertySlot[];
    propertyId: string;
    availableInventory: any[];
    type: SlotType; // 'DISPLAY' | 'OPERATIONS' | 'GARAGE'
}

export default function SlotGrid({ maxSlots, currentSlots, propertyId, availableInventory, type }: SlotGridProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // Generate the grid
  const slots = Array.from({ length: maxSlots }, (_, i) => {
    // Find the slot in the DB that matches this index AND type
    const filled = currentSlots.find((s) => s.slot_index === i && s.type === type);
    return { index: i, filled };
  });

  const handleUnequip = async (slotIndex: number) => {
      if(!confirm('Unequip this item?')) return;
      await equipItemToSlot(propertyId, null, slotIndex, type);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slots.map((slot) => (
          <div 
            key={slot.index}
            onClick={() => !slot.filled ? setSelectedSlotIndex(slot.index) : handleUnequip(slot.index)}
            className={`
              aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer relative overflow-hidden
              ${slot.filled 
                ? 'border-[#DFFF00]/30 bg-[#DFFF00]/5 hover:bg-[#DFFF00]/10' 
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'
              }
            `}
          >
            {slot.filled ? (
              <div className="text-center p-2 z-10 w-full">
                 <div className="w-12 h-12 mx-auto bg-zinc-900 rounded-lg mb-2 flex items-center justify-center shadow-lg border border-white/5">
                    {/* Icon based on Type */}
                    {type === 'OPERATIONS' ? <Server className="text-emerald-500"/> : <Box className="text-[#DFFF00]" />}
                 </div>
                 <div className="text-[10px] font-bold text-white uppercase tracking-tight truncate w-full px-2">
                     {slot.filled.inventory_item?.item_template?.name || 'Item'}
                 </div>
              </div>
            ) : (
              <>
                <Plus className="text-zinc-600 group-hover:text-white transition-colors" />
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                    {type === 'OPERATIONS' ? 'Install Node' : 'Empty Slot'}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      <InventoryModal 
        isOpen={selectedSlotIndex !== null}
        onClose={() => setSelectedSlotIndex(null)}
        inventory={availableInventory}
        onSelect={async (itemId) => {
            if (selectedSlotIndex !== null) {
                await equipItemToSlot(propertyId, itemId, selectedSlotIndex, type);
                setSelectedSlotIndex(null);
            }
        }}
      />
    </>
  );
}