'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// IMPORT IMAGE COMPONENT
import Image from 'next/image';
import { ArrowLeft, Lock, Unlock, Key, Plus, LogOut, Trash2, Database, AlertCircle } from 'lucide-react';
import { CARS as STATIC_CARS } from './data';
import { getDatabaseCars, deleteCar, seedCars } from './actions';
import AddCarForm from './components/AddCarForm';

export default function AutomotiveIndex() {
  const [cars, setCars] = useState<any[]>(STATIC_CARS);
  const [dbCount, setDbCount] = useState(0);
  const [isDbMode, setIsDbMode] = useState(false);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthInput, setShowAuthInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const refreshCars = async () => {
      const dbCars = await getDatabaseCars(); // Now returns Oldest -> Newest
      setDbCount(dbCars.length);

      const staticIds = new Set(STATIC_CARS.map(c => c.id));
      const hasMigrated = dbCars.some((c: any) => staticIds.has(c.id));

      if (hasMigrated || dbCars.length > 0) {
          // DATABASE MODE: Since dbCars is sorted Ascending (Old -> New), 
          // the new cars will naturally appear at the end.
          setCars(dbCars);
          setIsDbMode(true);
      } else {
          // STATIC MODE: No DB cars, show static.
          setCars(STATIC_CARS);
          setIsDbMode(false);
      }
  };

  useEffect(() => {
      refreshCars();
  }, []);

  const handleAuth = () => {
      if (accessCode === '1698') {
          setIsAuthenticated(true);
          setShowAuthInput(false);
          setAccessCode('');
      } else {
          alert('ACCESS DENIED');
      }
  };

  const handleSeed = async () => {
      if (!confirm(`CONFIRM MIGRATION?\n\nThis will copy ${STATIC_CARS.length} static cars into your live database.`)) return;
      const res = await seedCars(STATIC_CARS);
      if (res.success) {
          alert('MIGRATION SUCCESSFUL.');
          refreshCars();
      } else {
          alert('MIGRATION FAILED.');
      }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!isDbMode) {
          alert('SYSTEM ALERT: CANNOT DELETE STATIC ENTRIES.\n\nPlease click "MIGRATE TO DB" first.');
          return;
      }
      
      if (confirm(`CONFIRM SCRAPPING PROTOCOL: ${name}?`)) {
          setCars(prev => prev.filter(c => c.id !== id));
          const res = await deleteCar(id);
          if (!res.success) {
              alert(`ERROR: ${res.message || 'DELETION FAILED'}`);
              refreshCars();
          }
      }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* HEADER */}
      <div className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-sm font-black tracking-widest uppercase mb-4">
                    <Link href="/collections" className="hover:underline flex items-center gap-2">
                        <ArrowLeft size={14} /> COLLECTIONS
                    </Link>
                    <span className="text-zinc-600">/</span>
                    <span>GARAGE_PROTOCOL</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">
                    Automotive <span className="text-zinc-800 text-stroke-white">Index</span>
                </h1>
                <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                    <span className="text-zinc-500">SYSTEM STATUS:</span>
                    {isDbMode ? (
                        <span className="text-[#DFFF00] flex items-center gap-1"><Database size={12}/> LIVE DATABASE ({cars.length})</span>
                    ) : (
                        <span className="text-zinc-500 flex items-center gap-1"><AlertCircle size={12}/> STATIC ARCHIVE</span>
                    )}
                </div>
            </div>

            {/* DEV CONTROLS */}
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <div className="flex flex-wrap items-center gap-4 justify-end">
                        <span className="text-[10px] font-mono text-[#DFFF00] flex items-center gap-2 border border-[#DFFF00] px-3 py-1 bg-[#DFFF00]/10">
                            <Unlock size={12}/> DEV_ACTIVE
                        </span>
                        
                        {!isDbMode && (
                            <button 
                                onClick={handleSeed}
                                className="flex items-center gap-2 bg-zinc-800 text-white border border-zinc-700 px-4 py-2 font-black text-xs uppercase tracking-widest hover:bg-zinc-700 hover:border-white transition-colors"
                            >
                                <Database size={14}/> MIGRATE TO DB
                            </button>
                        )}

                        <button 
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2 bg-[#DFFF00] text-black px-4 py-2 font-black text-xs uppercase tracking-widest hover:bg-white transition-colors"
                        >
                            <Plus size={14}/> ADD VEHICLE
                        </button>
                        <button onClick={() => { setIsAuthenticated(false); setShowAddForm(false); }} className="text-zinc-500 hover:text-white">
                            <LogOut size={16}/>
                        </button>
                    </div>
                ) : showAuthInput ? (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                        <input 
                            type="password" 
                            value={accessCode} 
                            onChange={(e) => setAccessCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                            placeholder="CODE"
                            className="bg-black border border-zinc-700 px-3 py-2 text-xs font-mono text-[#DFFF00] outline-none placeholder:text-zinc-700 uppercase w-24 text-center"
                            autoFocus
                        />
                        <button onClick={handleAuth} className="bg-[#DFFF00] text-black px-3 py-2 text-xs font-bold uppercase">GO</button>
                    </div>
                ) : (
                    <button onClick={() => setShowAuthInput(true)} className="flex items-center gap-2 text-zinc-600 hover:text-[#DFFF00] transition-colors text-[10px] font-mono uppercase tracking-widest">
                        <Lock size={12} /> DEV_ACCESS
                    </button>
                )}
            </div>
        </div>

        {isAuthenticated && showAddForm && (
            <AddCarForm onCarAdded={() => { refreshCars(); setShowAddForm(false); }} onCancel={() => setShowAddForm(false)} />
        )}
      </div>

      {/* CAR GRID */}
      <div className="max-w-[1600px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car, index) => (
                <Link 
                    href={`/automotive/car/${car.id}`} 
                    key={car.id}
                    className="group relative h-[400px] overflow-hidden border border-zinc-800 bg-zinc-900 block"
                >
                    {/* OPTIMIZED IMAGE COMPONENT */}
                    <div className="absolute inset-0">
                        <Image 
                            src={car.image} 
                            alt={car.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index < 4} // Load top 4 instantly
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />
                    </div>

                    {isAuthenticated && (
                        <button 
                            onClick={(e) => handleDelete(e, car.id, car.name)}
                            className="absolute top-4 right-4 z-30 bg-red-600 text-white p-2 hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Vehicle"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}

                    <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono font-bold text-[#DFFF00] bg-black/50 backdrop-blur-md px-2 py-1 border border-zinc-800 max-w-[70%] truncate">
                                {car.class}
                            </span>
                            <span className="text-4xl font-black text-zinc-800/50 group-hover:text-white/20 transition-colors">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                                <span className="text-[10px] font-mono text-white bg-zinc-800 px-2 py-0.5">{car.year}</span>
                                <span className="text-[10px] font-mono text-white bg-zinc-800 px-2 py-0.5">{car.manufacturer}</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2 group-hover:text-[#DFFF00] transition-colors line-clamp-2">
                                {car.name}
                            </h2>
                            
                            <div className="flex gap-4 border-t border-white/20 pt-4 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-zinc-400 font-mono uppercase">Power</span>
                                    <span className="text-xs font-bold">{car.specs.power}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-zinc-400 font-mono uppercase">0-100</span>
                                    <span className="text-xs font-bold">{car.specs.acceleration}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}