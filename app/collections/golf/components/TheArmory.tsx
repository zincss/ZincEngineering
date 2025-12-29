'use client';

import React, { useState } from 'react';
import { Crosshair, Save, X, RefreshCw } from 'lucide-react';
import { Club, saveUserBag } from '../actions';

interface TheArmoryProps {
  initialBag: Club[];
  onClose: () => void;
  onUpdate: (newBag: Club[]) => void;
}

export default function TheArmory({ initialBag, onClose, onUpdate }: TheArmoryProps) {
  const [bag, setBag] = useState<Club[]>(initialBag);
  const [isSaving, setIsSaving] = useState(false);

  const updateDist = (index: number, val: number) => {
    const newBag = [...bag];
    newBag[index].dist = val;
    setBag(newBag);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveUserBag(bag);
    
    if (result.success) {
      onUpdate(bag);
      onClose();
    } else {
      alert(result.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
          <div>
            <div className="text-[#DFFF00] font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 mb-1">
              <Crosshair size={12} className="animate-pulse" /> Ballistics Config
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">The Armory</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {bag.map((club, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl group hover:border-[#DFFF00]/50 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border text-xs font-black shadow-inner ${
                club.type === 'WOOD' ? 'bg-amber-950/30 border-amber-900/50 text-amber-500' :
                club.type === 'IRON' ? 'bg-zinc-800/50 border-zinc-700 text-zinc-300' :
                club.type === 'WEDGE' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-500' :
                'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}>
                {club.name.substring(0, 2)}
              </div>

              <div className="flex-1">
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-0.5">{club.type}</div>
                <div className="text-lg font-black text-white">{club.name}</div>
              </div>

              <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-lg border border-zinc-800 focus-within:border-[#DFFF00] transition-colors">
                <input 
                  type="number" 
                  value={club.dist}
                  onChange={(e) => updateDist(i, Number(e.target.value))}
                  className="w-16 bg-transparent text-right text-[#DFFF00] font-mono font-bold text-lg outline-none"
                />
                <span className="text-[10px] font-bold text-zinc-600 uppercase pr-2">YDS</span>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-[0_0_20px_rgba(223,255,0,0.2)] disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />}
            {isSaving ? 'Syncing...' : 'Save Loadout'}
          </button>
        </div>
      </div>
    </div>
  );
}