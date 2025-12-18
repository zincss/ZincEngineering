'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Music2, Activity, Disc, PlayCircle, ArrowDown } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { searchTracks, generateFlow } from './actions';

export default function ResonanceModule() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const tracks = await searchTracks(query);
    setResults(tracks);
    setLoading(false);
    setPlaylist([]); // Reset playlist on new search
  };

  const handleSelect = async (track: any) => {
    setSelectedTrack(track);
    setResults([]); // Clear results to clean up UI
    setLoading(true);
    
    // Generate the chain
    const chain = await generateFlow(track.id);
    setPlaylist(chain);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-400 selection:text-black pb-20 relative overflow-hidden">
      
      <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950 fixed inset-0 z-0" />
      <BackButton href="/collections" label="COLLECTIONS" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Activity className="text-emerald-400" size={32} />
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                    Resonance <span className="text-zinc-600">Engine</span>
                </h1>
                <p className="text-emerald-400/80 font-mono text-xs uppercase tracking-widest mt-1">
                    Harmonic Mixing Protocol
                </p>
            </div>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="relative mb-12 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
            </div>
            <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter seed frequency (Song Name)..."
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400/50 focus:bg-zinc-900/80 transition-all font-mono"
            />
            {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin" />
                </div>
            )}
        </form>

        {/* SEARCH RESULTS */}
        {results.length > 0 && (
            <div className="grid gap-2 mb-12 animate-in fade-in slide-in-from-top-4">
                <p className="text-zinc-500 text-xs font-mono mb-2 uppercase tracking-widest pl-2">Signal Detected</p>
                {results.map((track) => (
                    <button 
                        key={track.id}
                        onClick={() => handleSelect(track)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all text-left group"
                    >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800">
                            {track.image && <Image src={track.image} alt={track.name} fill className="object-cover" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">{track.name}</h3>
                            <p className="text-xs text-zinc-500">{track.artist}</p>
                        </div>
                        <PlayCircle className="text-zinc-700 group-hover:text-white transition-colors" size={20} />
                    </button>
                ))}
            </div>
        )}

        {/* SELECTED SEED & CHAIN */}
        {selectedTrack && !loading && (
            <div className="space-y-0 animate-in fade-in zoom-in-95 duration-500">
                
                {/* SEED NODE */}
                <div className="relative z-10 bg-zinc-900/80 border border-emerald-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700">
                            {selectedTrack.image && <Image src={selectedTrack.image} alt={selectedTrack.name} fill className="object-cover" />}
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Disc className="text-white/80 animate-[spin_3s_linear_infinite]" size={32} />
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-3">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Source Locked</span>
                            </div>
                            <h2 className="text-2xl font-black text-white leading-none mb-1">{selectedTrack.name}</h2>
                            <p className="text-zinc-400 font-mono text-sm">{selectedTrack.artist}</p>
                        </div>
                    </div>
                </div>

                {/* CONNECTOR LINE */}
                <div className="flex justify-center h-12 relative">
                   <div className="w-px bg-gradient-to-b from-emerald-500/50 to-zinc-800" />
                   <div className="absolute top-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800 p-1.5 rounded-full z-10">
                      <ArrowDown size={14} className="text-zinc-500" />
                   </div>
                </div>

                {/* GENERATED CHAIN */}
                <div className="space-y-3">
                    {playlist.map((track, idx) => (
                        <div key={track.id} className="group relative">
                            {/* Connector for items */}
                            {idx !== playlist.length - 1 && (
                                <div className="absolute left-8 top-16 bottom-0 w-px bg-zinc-800 -z-10 group-hover:bg-zinc-700 transition-colors" />
                            )}

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 hover:bg-zinc-900/60 hover:border-emerald-500/30 transition-all">
                                
                                {/* Track Info */}
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {track.image && <Image src={track.image} alt={track.name} fill className="object-cover" />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-zinc-300 group-hover:text-emerald-300 truncate transition-colors">
                                        {track.name}
                                    </h3>
                                    <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                                </div>

                                {/* Tech Stats (BPM/KEY) */}
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 bg-black/40 rounded border border-zinc-800 group-hover:border-zinc-700">
                                            <span className="text-[10px] font-mono text-zinc-400">
                                                {track.camelot}
                                            </span>
                                        </div>
                                        <div className="px-2 py-1 bg-black/40 rounded border border-zinc-800 group-hover:border-zinc-700">
                                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                                {track.bpm} BPM
                                            </span>
                                        </div>
                                    </div>
                                    {idx > 0 && Math.abs(track.bpm - playlist[idx-1].bpm) > 0 && (
                                        <span className="text-[9px] font-mono text-zinc-600">
                                           {track.bpm > playlist[idx-1].bpm ? '+' : ''}{track.bpm - playlist[idx-1].bpm} shift
                                        </span>
                                    )}
                                </div>

                            </div>
                            
                            {/* Transition Arrow between list items */}
                            {idx !== playlist.length - 1 && (
                                <div className="h-4" /> 
                            )}
                        </div>
                    ))}
                </div>

                <div className="h-12 flex justify-center items-center">
                    <span className="text-zinc-600 font-mono text-[10px] uppercase">End of Signal</span>
                </div>

            </div>
        )}

      </div>
    </main>
  );
}