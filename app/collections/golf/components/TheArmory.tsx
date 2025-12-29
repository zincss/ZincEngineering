'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Gauge, LayoutGrid } from 'lucide-react';
import { Club, GolfProfile, saveUserProfile } from '../actions';

interface TheArmoryProps {
  initialProfile: GolfProfile;
  onUpdate: (profile: GolfProfile) => void;
}

export default function TheArmory({ initialProfile, onUpdate }: TheArmoryProps) {
  const [profile, setProfile] = useState<GolfProfile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const updateClub = (id: string, field: keyof Club, value: any) => {
    const newClubs = profile.clubs.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        // Auto-detect type based on name if name changes
        if (field === 'name') {
            const up = value.toUpperCase();
            if (up.includes('WOOD') || up.includes('DRIVER') || up.includes('HYBRID')) updated.type = 'WOOD';
            else if (up.includes('IRON')) updated.type = 'IRON';
            else if (up.includes('WEDGE') || up.includes('SAND') || up.includes('GAP')) updated.type = 'WEDGE';
            else if (up.includes('PUTTER')) updated.type = 'SPECIAL';
        }
        return updated;
    });
    setProfile({ ...profile, clubs: newClubs });
  };

  const addClub = () => {
    const newClub: Club = {
        id: Date.now().toString(),
        name: 'NEW CLUB',
        dist: 150,
        type: 'IRON'
    };
    setProfile({ ...profile, clubs: [...profile.clubs, newClub] });
  };

  const removeClub = (id: string) => {
    setProfile({ ...profile, clubs: profile.clubs.filter(c => c.id !== id) });
  };

  const toggleUnits = () => {
      const isMetric = profile.units === 'METRIC';
      const newUnit = isMetric ? 'IMPERIAL' : 'METRIC';
      
      const convertedClubs = profile.clubs.map(c => ({
          ...c,
          dist: isMetric 
            ? Math.round(c.dist * 1.09361) // Meters -> Yards
            : Math.round(c.dist * 0.9144)  // Yards -> Meters
      }));

      setProfile({ clubs: convertedClubs, units: newUnit });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Sort clubs before saving to ensure database consistency
    const sortedClubs = [...profile.clubs].sort((a, b) => b.dist - a.dist);
    const sortedProfile = { ...profile, clubs: sortedClubs };

    const result = await saveUserProfile(sortedProfile);
    if (result.success) {
      onUpdate(sortedProfile);
      setProfile(sortedProfile); // Update local state to sorted version
      alert("ARMORY UPDATED");
    } else {
      alert(result.message);
    }
    setIsSaving(false);
  };

  // Create a sorted copy for rendering so the UI updates position immediately
  const sortedDisplayClubs = [...profile.clubs].sort((a, b) => b.dist - a.dist);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs uppercase tracking-widest mb-3">
                    <LayoutGrid size={14} /> Modular Loadout
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">The Armory</h2>
                <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest mt-2">
                    Configure Ballistics & Carry Distances
                </p>
            </div>

            {/* UNIT TOGGLE */}
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button 
                    onClick={() => profile.units !== 'IMPERIAL' && toggleUnits()}
                    className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                        profile.units === 'IMPERIAL' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                    }`}
                >
                    YARDS
                </button>
                <button 
                    onClick={() => profile.units !== 'METRIC' && toggleUnits()}
                    className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                        profile.units === 'METRIC' ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                    }`}
                >
                    METERS
                </button>
            </div>
        </div>

        {/* CLUBS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
            {sortedDisplayClubs.map((club) => (
                <div key={club.id} className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-[#DFFF00] transition-colors relative">
                    {/* Header Row: Type Icon & Delete */}
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black border ${
                            club.type === 'WOOD' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            club.type === 'IRON' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                            club.type === 'WEDGE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        }`}>
                            {club.name.substring(0,1)}
                        </div>
                        <button onClick={() => removeClub(club.id)} className="text-zinc-700 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest block mb-1">Designation</label>
                            <input 
                                value={club.name}
                                onChange={(e) => updateClub(club.id, 'name', e.target.value)}
                                className="w-full bg-transparent text-xl font-black text-white uppercase outline-none border-b border-zinc-800 focus:border-[#DFFF00] py-1 transition-colors"
                                placeholder="CLUB NAME"
                            />
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest block mb-1">
                                Carry ({profile.units})
                            </label>
                            <div className="flex items-center gap-2">
                                <Gauge size={18} className="text-zinc-600" />
                                <input 
                                    type="number"
                                    value={club.dist}
                                    onChange={(e) => updateClub(club.id, 'dist', Number(e.target.value))}
                                    className="w-full bg-transparent text-3xl font-black text-[#DFFF00] font-mono outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button 
                onClick={addClub}
                className="bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4 min-h-[200px] text-zinc-600 hover:text-white hover:border-zinc-600 transition-all group"
            >
                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-[#DFFF00] group-hover:text-black transition-colors">
                    <Plus size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Register New Hardware</span>
            </button>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 w-full bg-zinc-950/90 backdrop-blur border-t border-zinc-800 p-4 flex justify-end">
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#DFFF00] text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(223,255,0,0.2)]"
            >
                {isSaving ? <Gauge className="animate-spin" /> : <Save />}
                {isSaving ? 'SYNCING DATABASE...' : 'SAVE CONFIGURATION'}
            </button>
        </div>
    </div>
  );
}