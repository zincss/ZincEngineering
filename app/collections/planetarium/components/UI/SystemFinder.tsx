'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Orbit, Satellite } from 'lucide-react';
import { useSimulation } from '../../context';

type FilterType = 'all' | 'planet' | 'moon' | 'station';

export function SystemFinder({ 
    isOpen, 
    onClose, 
    onSelect 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (id: string) => void;
}) {
    const { currentData } = useSimulation();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    const allBodies = useMemo(() => {
        const bodies: any[] = [];
        currentData.forEach(p => {
            bodies.push(p);
            if (p.moons) bodies.push(...p.moons);
        });
        return bodies;
    }, [currentData]);

    if (!isOpen) return null;

    const filteredBodies = allBodies.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all'
            ? true
            : activeFilter === 'planet'
                ? (b.type === 'Planet' || b.type === 'Dwarf Planet' || b.type === 'Star')
                : b.type.toLowerCase() === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const filterTabs: { id: FilterType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'planet', label: 'Planets' },
        { id: 'moon', label: 'Moons' },
        { id: 'station', label: 'Stations' }
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col pt-safe-top">
            <div className="sticky top-0 z-10 w-full bg-black/50 border-b border-white/10 p-4 md:p-6 backdrop-blur-md">
                <div className="max-w-5xl mx-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                            System <span className="text-[#DFFF00]">Browser</span>
                        </h2>
                        <button 
                            onClick={onClose} 
                            className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#DFFF00] transition-colors"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id)}
                                    className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border ${
                                        activeFilter === tab.id
                                            ? 'bg-[#DFFF00] text-black border-[#DFFF00]'
                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {filteredBodies.length > 0 ? (
                        filteredBodies.map((body) => (
                            <button
                                key={body.id}
                                onClick={() => onSelect(body.id)}
                                className="group flex items-center gap-4 bg-zinc-900/50 border border-white/5 hover:border-[#DFFF00]/50 hover:bg-zinc-800/80 p-4 rounded-xl text-left transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                    body.type === 'Star' ? 'bg-orange-500/20 text-orange-500' :
                                    body.type === 'Planet' ? 'bg-blue-500/20 text-blue-500' :
                                    body.type === 'Station' ? 'bg-[#DFFF00]/20 text-[#DFFF00]' :
                                    'bg-zinc-700/50 text-zinc-400'
                                }`}>
                                    {body.type === 'Station' ? <Satellite size={20} /> : <Orbit size={20} />}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-0.5 truncate group-hover:text-[#DFFF00] transition-colors">
                                        {body.type}
                                    </div>
                                    <div className="text-white font-bold text-lg leading-none truncate">{body.name}</div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-600">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="uppercase tracking-widest text-sm">No Celestial Bodies Found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
