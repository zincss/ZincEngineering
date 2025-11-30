'use client';

import React, { useState } from 'react';
import { Save, Loader2, Search, X, DownloadCloud, CheckCircle2, AlertCircle, ChevronRight, Car } from 'lucide-react';
import { searchWikipedia, fetchCarDetails, saveCarToDatabase } from '../actions';

interface AddCarFormProps {
    onCarAdded: () => void;
    onCancel: () => void;
}

export default function AddCarForm({ onCarAdded, onCancel }: AddCarFormProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  
  // Status State
  const [status, setStatus] = useState<'IDLE' | 'SEARCHING' | 'SELECTING' | 'FETCHING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  
  const [formData, setFormData] = useState({
      name: '', manufacturer: '', year: '', class: '',
      engine: '', power: '', torque: '', weight: '', acceleration: '', topSpeed: '', drivetrain: '',
      history: '', image: '', accentColor: '#DFFF00'
  });

  // Step 1: Search for Candidates
  const handleSearch = async () => {
      if (!searchQuery) return;
      setLoading(true);
      setStatus('SEARCHING');
      setStatusMessage('SCANNING ARCHIVES...');
      setCandidates([]);

      // This is the function call that was failing
      const results = await searchWikipedia(searchQuery);
      
      if (results && results.length > 0) {
          setCandidates(results);
          setStatus('SELECTING');
          setStatusMessage('MULTIPLE ENTITIES DETECTED. SELECT TARGET.');
      } else {
          setStatus('ERROR');
          setStatusMessage('NO DATA FOUND.');
      }
      setLoading(false);
  };

  // Step 2: Fetch Details for Selected Candidate
  const handleSelectCandidate = async (title: string) => {
      setLoading(true);
      setStatus('FETCHING');
      setStatusMessage(`DOWNLOADING TELEMETRY FOR: ${title}...`);
      
      const data = await fetchCarDetails(title);
      
      if (data) {
          setStatus('SUCCESS');
          setStatusMessage('TELEMETRY ACQUIRED. READY FOR REVIEW.');
          setCandidates([]); // Clear selection list
          setFormData(prev => ({
              ...prev,
              name: data.name,
              manufacturer: data.manufacturer,
              year: data.year,
              class: data.class,
              engine: data.specs.engine,
              power: data.specs.power,
              torque: data.specs.torque,
              weight: data.specs.weight,
              acceleration: data.specs.acceleration,
              topSpeed: data.specs.topSpeed,
              drivetrain: data.specs.drivetrain,
              history: data.history,
              image: data.image
          }));
      } else {
          setStatus('ERROR');
          setStatusMessage('DATA CORRUPTION. MANUAL ENTRY REQUIRED.');
      }
      setLoading(false);
  };

  const handleSubmit = async () => {
      if (!formData.name) return;
      setLoading(true);
      setStatus('FETCHING');
      setStatusMessage('UPLOADING TO SECURE STORAGE...');
      
      const newCar = {
          id: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
          name: formData.name,
          manufacturer: formData.manufacturer || 'Unknown',
          year: formData.year || new Date().getFullYear().toString(),
          class: formData.class || 'Concept',
          specs: {
              engine: formData.engine || 'N/A',
              power: formData.power || 'N/A',
              torque: formData.torque || 'N/A',
              weight: formData.weight || 'N/A',
              acceleration: formData.acceleration || 'N/A',
              topSpeed: formData.topSpeed || 'N/A',
              drivetrain: formData.drivetrain || 'N/A'
          },
          history: formData.history,
          image: formData.image,
          accent_color: formData.accentColor
      };

      const res = await saveCarToDatabase(newCar);
      if (res.success) {
          onCarAdded();
      } else {
          setStatus('ERROR');
          setStatusMessage('DATABASE WRITE FAILED');
      }
      setLoading(false);
  };

  return (
      <div className="mb-12 border-2 border-[#DFFF00] bg-black p-6 relative animate-in fade-in slide-in-from-top-4 shadow-[0_0_20px_rgba(223,255,0,0.1)]">
          {/* Status Bar */}
          <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border-l-2 border-b-2 transition-colors ${
              status === 'ERROR' ? 'bg-red-500 text-white border-red-500' :
              status === 'SUCCESS' ? 'bg-green-500 text-white border-green-500' :
              (status === 'SEARCHING' || status === 'FETCHING') ? 'bg-[#DFFF00] text-black border-[#DFFF00]' :
              'bg-zinc-800 text-zinc-500 border-zinc-700'
          }`}>
              {(status === 'SEARCHING' || status === 'FETCHING') && <Loader2 size={10} className="animate-spin"/>}
              {status === 'SUCCESS' && <CheckCircle2 size={10} />}
              {status === 'ERROR' && <AlertCircle size={10} />}
              {statusMessage || 'AWAITING INPUT'}
          </div>
          
          <h3 className="text-[#DFFF00] font-black uppercase text-xl mb-4 tracking-tighter">New Vehicle Protocol</h3>

          {/* Search Section */}
          <div className="flex gap-2 mb-4 bg-zinc-900/50 p-2 border border-zinc-800">
              <div className="flex-1 relative">
                  <input 
                      type="text" 
                      placeholder="ENTER MODEL NAME (e.g. 'PORSCHE 918')..." 
                      className="w-full bg-black border border-zinc-700 p-3 pl-10 text-white font-mono text-sm focus:border-[#DFFF00] outline-none uppercase placeholder:text-zinc-600 transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
              <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-[#DFFF00] text-black px-6 font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {loading && status === 'SEARCHING' ? <Loader2 size={14} className="animate-spin"/> : <DownloadCloud size={14}/>} 
                  <span className="hidden md:inline">INITIATE SCAN</span>
              </button>
          </div>

          {/* Candidate Selection List */}
          {status === 'SELECTING' && (
              <div className="mb-8 border border-zinc-700 max-h-60 overflow-y-auto">
                  {candidates.map((c, i) => (
                      <button 
                          key={i}
                          onClick={() => handleSelectCandidate(c.title)}
                          className="w-full text-left p-3 flex items-center justify-between border-b border-zinc-800 hover:bg-zinc-900 group transition-colors"
                      >
                          <div className="flex items-center gap-3">
                              <Car size={16} className="text-zinc-600 group-hover:text-[#DFFF00]" />
                              <div>
                                  <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] uppercase">{c.title}</div>
                                  <div className="text-[10px] text-zinc-500 truncate max-w-[300px]">{c.snippet}</div>
                              </div>
                          </div>
                          <ChevronRight size={14} className="text-zinc-700 group-hover:text-white" />
                      </button>
                  ))}
              </div>
          )}

          {/* Form Grid */}
          <div className={`space-y-4 transition-opacity ${status === 'SELECTING' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              {/* Row 1: Identity */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Model Name</label>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00] font-bold" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Manufacturer</label>
                      <input value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Year</label>
                      <input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Class</label>
                      <input value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
              </div>

              {/* Row 2: Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Power</label>
                      <input value={formData.power} onChange={e => setFormData({...formData, power: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">0-100 km/h</label>
                      <input value={formData.acceleration} onChange={e => setFormData({...formData, acceleration: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Top Speed</label>
                      <input value={formData.topSpeed} onChange={e => setFormData({...formData, topSpeed: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Weight</label>
                      <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
              </div>
              
              {/* Row 3: Engine & Drivetrain */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Engine</label>
                      <input value={formData.engine} onChange={e => setFormData({...formData, engine: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Torque</label>
                      <input value={formData.torque} onChange={e => setFormData({...formData, torque: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Drivetrain</label>
                      <input value={formData.drivetrain} onChange={e => setFormData({...formData, drivetrain: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00]" />
                  </div>
              </div>

              {/* Image Preview & URL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Image URL (High Res)</label>
                      <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-[#DFFF00] font-mono truncate" />
                  </div>
                  <div className="md:col-span-1 h-20 bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                      {formData.image ? (
                          <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                          <span className="text-[9px] font-mono text-zinc-600">NO VISUAL</span>
                      )}
                  </div>
              </div>

              {/* History */}
              <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Brief History</label>
                  <textarea 
                      value={formData.history}
                      onChange={e => setFormData({...formData, history: e.target.value})}
                      className="w-full h-24 bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-300 font-mono outline-none focus:border-[#DFFF00] resize-none"
                  />
              </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800">
              <button onClick={onCancel} className="text-zinc-500 hover:text-white text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-colors">
                  <X size={14}/> CANCEL_OP
              </button>
              <button 
                  onClick={handleSubmit} 
                  disabled={loading || !formData.name || status === 'SELECTING'}
                  className="bg-[#DFFF00] text-black px-8 py-3 font-black uppercase tracking-widest hover:bg-white transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                  <Save size={16}/> CONFIRM ENTRY
              </button>
          </div>
      </div>
  );
}