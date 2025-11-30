'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Cpu, Gauge, History, Wind, Zap, Loader2, Lock, Unlock, Edit3, Save, X, Image as ImageIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { CARS } from '../../data';
import { getDatabaseCars, updateCar } from '../../actions';

export default function CarDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Dev / Edit State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthInput, setShowAuthInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // --- FORCE SCROLL TO TOP (FIX) ---
  useLayoutEffect(() => {
      if (typeof window !== 'undefined' && window.history) {
          window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      return () => {
          if (typeof window !== 'undefined' && window.history) {
              window.history.scrollRestoration = 'auto';
          }
      };
  }, []);

  useEffect(() => {
      if (!loading) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
  }, [loading]);

  useEffect(() => {
    const fetchCarData = async () => {
      setLoading(true);

      // 1. Check Static Data First
      const staticCar = CARS.find((c) => c.id === id);
      if (staticCar) {
        setCar(staticCar);
        setEditData(JSON.parse(JSON.stringify(staticCar))); 
        setLoading(false);
        return;
      }

      // 2. Check Database
      try {
        const dbCars = await getDatabaseCars();
        const dbMatch = dbCars.find((c: any) => c.id === id);
        
        if (dbMatch) {
          setCar(dbMatch);
          setEditData(JSON.parse(JSON.stringify(dbMatch)));
        }
      } catch (e) {
        console.error("Failed to load vehicle data:", e);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCarData();
  }, [id]);

  const handleAuth = () => {
      if (accessCode === '1698') {
          setIsAuthenticated(true);
          setShowAuthInput(false);
          setAccessCode('');
      } else {
          alert('ACCESS DENIED');
      }
  };

  const handleSave = async () => {
      setCar(editData);
      setIsEditing(false);

      const res = await updateCar(editData);
      if (!res.success) {
          alert("SAVE FAILED: " + JSON.stringify(res.error));
      }
  };

  const extractNumber = (str: string) => {
      if (!str) return 0;
      const match = str.match(/[\d,]+(?:\.\d+)?/);
      if (!match) return 0;
      return parseFloat(match[0].replace(/,/g, ''));
  };

  const getPowerToWeight = (power: string, weight: string) => {
      const hp = extractNumber(power);
      const kg = extractNumber(weight);
      if (!hp || !kg) return "N/A";
      const tonnes = kg / 1000;
      const ratio = Math.round(hp / tonnes);
      return `${ratio} hp/tonne`;
  };

  // --- LOADING STATE ---
  if (loading) {
      return (
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-zinc-500 gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs tracking-widest uppercase">RETRIEVING VEHICLE TELEMETRY...</span>
          </div>
      );
  }

  // --- ERROR STATE ---
  if (!car) {
      return (
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-white">
              <div className="text-center space-y-4">
                 <div className="inline-block px-4 py-1 border border-red-500 text-red-500 text-xs">ERROR_404</div>
                 <h1 className="text-2xl font-bold">VEHICLE_DATA_CORRUPTED</h1>
                 <p className="text-zinc-500 text-xs uppercase">The requested chassis ID could not be found in the archive.</p>
                 <Link href="/automotive" className="text-zinc-500 hover:text-white underline underline-offset-4 text-xs mt-4 block">RETURN_TO_INDEX</Link>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* DEV CONTROLS (FIXED Top Right) */}
      <div className="fixed top-24 right-6 z-50 flex items-center gap-2">
          {isAuthenticated ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                  {isEditing ? (
                      <>
                        <button onClick={() => setIsEditing(false)} className="bg-red-500 text-white px-3 py-2 text-xs font-bold uppercase flex items-center gap-2 hover:bg-red-600">
                             <X size={14}/> CANCEL
                        </button>
                        <button onClick={handleSave} className="bg-[#DFFF00] text-black px-3 py-2 text-xs font-bold uppercase flex items-center gap-2 hover:bg-white">
                             <Save size={14}/> SAVE CHANGES
                        </button>
                      </>
                  ) : (
                      <button onClick={() => setIsEditing(true)} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-xs font-bold uppercase flex items-center gap-2 hover:bg-zinc-700 hover:border-white transition-all">
                          <Edit3 size={14}/> EDIT DATA
                      </button>
                  )}
                  <div className="px-3 py-2 bg-[#DFFF00]/10 border border-[#DFFF00] text-[#DFFF00] text-xs font-mono flex items-center gap-2">
                      <Unlock size={12}/> DEV_MODE
                  </div>
              </div>
          ) : showAuthInput ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                  <input 
                      type="password" 
                      value={accessCode} 
                      onChange={(e) => setAccessCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                      placeholder="CODE"
                      className="bg-black border border-zinc-700 px-3 py-2 text-xs font-mono text-[#DFFF00] outline-none w-24 text-center uppercase focus:border-[#DFFF00]"
                      autoFocus
                  />
                  <button onClick={handleAuth} className="bg-[#DFFF00] text-black px-3 py-2 text-xs font-bold uppercase">GO</button>
              </div>
          ) : (
               <button onClick={() => setShowAuthInput(true)} className="flex items-center gap-2 text-zinc-600 hover:text-[#DFFF00] transition-colors text-[10px] font-mono uppercase tracking-widest bg-black/50 backdrop-blur p-2 rounded">
                  <Lock size={12} /> DEV_ACCESS
              </button>
          )}
      </div>

      {/* BACK BUTTON (FIXED Top Left) - UPDATED STYLE */}
      <div className="fixed top-24 left-6 z-50">
         <Link href="/automotive" className="flex items-center gap-2 text-zinc-300 hover:text-[#DFFF00] transition-colors text-xs font-mono uppercase tracking-widest bg-black/50 backdrop-blur p-2 rounded w-fit border border-zinc-800 hover:border-[#DFFF00]">
            <ArrowLeft size={14} /> Back to Index
         </Link>
      </div>

      {/* HERO */}
      <div className="relative w-full h-[70vh] flex items-end group">
          <div className="absolute inset-0 z-0">
              <img 
                  src={isEditing ? editData.image : car.image} 
                  alt={car.name} 
                  className={`w-full h-full object-cover object-center transition-all ${isEditing ? 'opacity-50 blur-sm' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
              
              {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-black/80 p-4 border border-zinc-700 w-full max-w-xl space-y-2">
                          <label className="text-[10px] font-mono text-[#DFFF00] uppercase flex items-center gap-2">
                              <ImageIcon size={12}/> SOURCE IMAGE URL
                          </label>
                          <input 
                            value={editData.image}
                            onChange={(e) => setEditData({...editData, image: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-700 p-2 text-xs text-white font-mono outline-none focus:border-[#DFFF00]"
                          />
                      </div>
                  </div>
              )}
          </div>

          <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 pb-12 flex flex-col md:flex-row items-end justify-between gap-8">
              <div className="w-full max-w-3xl">
                  <div className="flex items-center gap-3 mb-4">
                      {isEditing ? (
                          <>
                             <input value={editData.manufacturer} onChange={e => setEditData({...editData, manufacturer: e.target.value})} className="bg-zinc-800 text-white px-2 py-1 text-xs border border-zinc-600 outline-none w-32" placeholder="MANUFACTURER"/>
                             <input value={editData.year} onChange={e => setEditData({...editData, year: e.target.value})} className="bg-zinc-800 text-white px-2 py-1 text-xs border border-zinc-600 outline-none w-16" placeholder="YEAR"/>
                             <input value={editData.class} onChange={e => setEditData({...editData, class: e.target.value})} className="bg-zinc-800 text-white px-2 py-1 text-xs border border-zinc-600 outline-none w-32" placeholder="CLASS"/>
                          </>
                      ) : (
                          <>
                            <span className="bg-[#DFFF00] text-black px-3 py-1 text-xs font-black uppercase tracking-widest">{car.manufacturer}</span>
                            <span className="bg-white/10 backdrop-blur text-white px-3 py-1 text-xs font-mono border border-white/20">{car.year}</span>
                            <span className="bg-white/10 backdrop-blur text-white px-3 py-1 text-xs font-mono border border-white/20">{car.class}</span>
                          </>
                      )}
                  </div>
                  
                  {isEditing ? (
                      <input 
                        value={editData.name} 
                        onChange={e => setEditData({...editData, name: e.target.value})}
                        className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter bg-transparent border-b-2 border-[#DFFF00] outline-none text-white w-full placeholder:text-zinc-700"
                        placeholder="VEHICLE MODEL NAME"
                      />
                  ) : (
                      <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-2">
                          {car.name}
                      </h1>
                  )}
              </div>
              
              <div className="hidden md:block text-right opacity-50">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Database ID</div>
                  <div className="text-2xl font-mono text-zinc-300">{car.id.toUpperCase()}</div>
              </div>
          </div>
      </div>

      {/* SPECS GRID */}
      <div className="max-w-[1600px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`bg-zinc-900/30 border p-8 transition-colors ${isEditing ? 'border-[#DFFF00]/50 bg-black' : 'border-zinc-800 hover:border-[#DFFF00]'}`}>
                      <div className="flex items-center gap-3 mb-6 text-zinc-500">
                          <Cpu size={20} className={isEditing ? 'text-[#DFFF00]' : ''}/>
                          <h3 className="text-sm font-black uppercase tracking-widest">Powertrain</h3>
                      </div>
                      <div className="space-y-4">
                          <EditableStat label="Engine Type" value={isEditing ? editData.specs.engine : car.specs.engine} isEditing={isEditing} onChange={(v) => setEditData({...editData, specs: {...editData.specs, engine: v}})} />
                          <EditableStat label="Horsepower" value={isEditing ? editData.specs.power : car.specs.power} isEditing={isEditing} onChange={(v) => setEditData({...editData, specs: {...editData.specs, power: v}})} />
                          <EditableStat label="Torque" value={isEditing ? editData.specs.torque : car.specs.torque} isEditing={isEditing} onChange={(v) => setEditData({...editData, specs: {...editData.specs, torque: v}})} />
                          <EditableStat label="Drivetrain" value={isEditing ? editData.specs.drivetrain : car.specs.drivetrain} isEditing={isEditing} onChange={(v) => setEditData({...editData, specs: {...editData.specs, drivetrain: v}})} />
                      </div>
                  </div>

                  <div className={`bg-zinc-900/30 border p-8 transition-colors ${isEditing ? 'border-[#DFFF00]/50 bg-black' : 'border-zinc-800 hover:border-[#DFFF00]'}`}>
                      <div className="flex items-center gap-3 mb-6 text-zinc-500">
                          <Gauge size={20} className={isEditing ? 'text-[#DFFF00]' : ''}/>
                          <h3 className="text-sm font-black uppercase tracking-widest">Performance</h3>
                      </div>
                      <div className="space-y-4">
                          <EditableStat label="0 - 100 km/h" value={isEditing ? editData.specs.acceleration : car.specs.acceleration} isEditing={isEditing} onChange={(v) => setEditData({...editData, specs: {...editData.specs, acceleration: v}})} />
                          <EditableStat label="Top Speed" value={isEditing ? editData.specs.topSpeed : car.specs.topSpeed} isEditing={isEditing} onChange={(v) => setEditData({...editData, specs: {...editData.specs, topSpeed: v}})} />
                          <EditableStat label="Curb Weight" value={isEditing ? editData.specs.weight : car.specs.weight} isEditing={isEditing} onChange={(v) => setEditData({...editData, specs: {...editData.specs, weight: v}})} />
                          <Stat label="Power/Weight" value={getPowerToWeight(isEditing ? editData.specs.power : car.specs.power, isEditing ? editData.specs.weight : car.specs.weight)} />
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6 text-[#DFFF00]">
                      <History size={20} />
                      <h3 className="text-sm font-black uppercase tracking-widest">Vehicle History</h3>
                  </div>
                  
                  {isEditing ? (
                      <textarea 
                        value={editData.history}
                        onChange={(e) => setEditData({...editData, history: e.target.value})}
                        className="flex-1 bg-black border border-[#DFFF00] p-4 text-xs font-mono text-zinc-300 outline-none resize-none leading-loose min-h-[400px]"
                      />
                  ) : (
                      <div className="flex-1 bg-zinc-900/30 border-l-2 border-[#DFFF00] p-6 relative">
                          <div className="absolute inset-0 bg-gradient-to-b from-[#DFFF00]/5 to-transparent pointer-events-none" />
                          <p className="text-zinc-300 font-mono text-sm leading-loose text-justify relative z-10 whitespace-pre-line">
                              {car.history}
                          </p>
                      </div>
                  )}
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-900 text-center border border-zinc-800">
                          <Wind className="mx-auto mb-2 text-zinc-500" size={16} />
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Aerodynamics</span>
                      </div>
                      <div className="p-4 bg-zinc-900 text-center border border-zinc-800">
                          <Zap className="mx-auto mb-2 text-zinc-500" size={16} />
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Electronics</span>
                      </div>
                  </div>
              </div>

          </div>
      </div>

    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col border-b border-zinc-800 pb-2 last:border-0">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1">{label}</span>
            <span className="text-base font-bold text-white">{value || "N/A"}</span>
        </div>
    );
}

function EditableStat({ label, value, isEditing, onChange }: { label: string, value: string, isEditing: boolean, onChange?: (val: string) => void }) {
    if (!isEditing) return <Stat label={label} value={value} />;
    
    return (
        <div className="flex flex-col border-b border-zinc-800 pb-2 last:border-0">
            <span className="text-[10px] text-[#DFFF00] font-mono uppercase tracking-wider mb-1">{label}</span>
            <input 
                value={value} 
                onChange={(e) => onChange && onChange(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 p-1 text-sm font-bold text-white outline-none focus:border-[#DFFF00]"
            />
        </div>
    );
}