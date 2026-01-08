'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentShowroom, getNextRotationTime, DealershipCar } from '../lib/dealership';
import { purchaseVehicle } from '../actions';
import { CarFront, Timer, Wallet, AlertCircle, CheckCircle2, Info, ArrowUpCircle, X, ArrowRight, Loader2 } from 'lucide-react';
import { RealAssetImage } from './shared';

export function CarDealershipView({ user, profile, refreshProfile }: { user: any, profile: any, refreshProfile: () => void }) {
  const [showroom, setShowroom] = useState<DealershipCar[]>([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [selectedCar, setSelectedCar] = useState<DealershipCar | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Initial Load
    setShowroom(getCurrentShowroom());

    // Timer Logic
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const next = getNextRotationTime().getTime();
      const diff = next - now;

      if (diff <= 0) {
        setShowroom(getCurrentShowroom()); // Rotate!
      } else {
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBuy = async () => {
    if (!selectedCar) return;
    setPurchasing(true);
    setMessage(null);

    const result = await purchaseVehicle(selectedCar.id, selectedCar.price, selectedCar.name);

    if (result.success) {
      setMessage({ type: 'success', text: `Successfully purchased ${selectedCar.name}!` });
      refreshProfile();
      setSelectedCar(null);
    } else {
      setMessage({ type: 'error', text: result.error || 'Transaction failed' });
    }
    setPurchasing(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 border-b border-white/5 pb-10">
        <div>
          <div className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
            Limited Rotation
            <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">
            Prestige <span className="text-zinc-800">Imports</span>
          </h2>
          <div className="flex flex-wrap items-center gap-6 text-zinc-500 font-mono text-xs mt-6">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Timer size={14} className="text-[#DFFF00]" />
              <span>STOCK REFRESH: <span className="text-white font-bold">{timeLeft}</span></span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Global Inventory Updates Every Hour</div>
          </div>
        </div>

        {/* User Balance (Mobile Friendly) */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col items-end gap-1 backdrop-blur-3xl min-w-[200px]">
          <div className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">
            Available Purchasing Power
          </div>
          <div className="text-3xl font-sans font-black tracking-tighter text-white tabular-nums flex items-baseline gap-2">
             {profile?.credits?.toLocaleString() || 0}
             <span className="text-xs text-zinc-600 font-bold tracking-widest">CR</span>
          </div>
        </div>
      </div>

      {/* SHOWROOM GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {showroom.map((car) => (
          <div 
            key={car.rotationId}
            onClick={() => setSelectedCar(car)}
            className="group relative bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-3xl cursor-pointer"
          >
            {/* Rarity Glow */}
            <div className={`absolute -top-12 -left-12 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-700
              ${car.rarity === 'ZENITH' ? 'bg-purple-500' : 
                car.rarity === 'ULTRA' ? 'bg-amber-400' :
                car.rarity === 'SUPER_RARE' ? 'bg-rose-500' :
                car.rarity === 'RARE' ? 'bg-blue-500' : 'bg-zinc-700'
              }
            `}></div>

            {/* Image Container */}
            <div className="aspect-[4/3] relative overflow-hidden bg-[#0a0a0a]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10 opacity-80 group-hover:opacity-40 transition-opacity duration-700"></div>
              <RealAssetImage 
                name={car.name} 
                searchQuery={`${car.manufacturer} ${car.name} car`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
              />
              
              {/* Manufacturer Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-black/60 backdrop-blur-xl text-[9px] font-black px-3 py-1.5 rounded-full text-white border border-white/10 uppercase tracking-[0.2em]">
                  {car.manufacturer}
                </span>
              </div>

              {/* Rarity Badge */}
              <div className="absolute top-4 right-4 z-20">
                <div className={`text-[8px] font-black px-3 py-1 rounded-full border shadow-lg
                  ${car.rarity === 'ZENITH' ? 'border-purple-500/50 text-purple-400 bg-purple-500/20' : 
                    car.rarity === 'ULTRA' ? 'border-amber-500/50 text-amber-400 bg-amber-500/20' :
                    'border-white/10 text-zinc-400 bg-black/40'
                  }
                `}>
                  {car.rarity.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-8">
              <div className="flex flex-col gap-1 mb-6">
                <h3 className="font-sans font-black tracking-tighter text-2xl text-white leading-none group-hover:text-[#DFFF00] transition-colors">{car.name}</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-2">{car.year} // {car.class} Division</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 text-[9px] text-zinc-500 font-mono border-y border-white/5 py-4">
                <div className="flex justify-between border-r border-white/5 pr-4"><span>OUTPUT</span> <span className="text-white font-bold">{car.specs.power}</span></div>
                <div className="flex justify-between pl-2"><span>MAX_V</span> <span className="text-white font-bold">{car.specs.topSpeed}</span></div>
                <div className="flex justify-between border-r border-white/5 pr-4"><span>0-100</span> <span className="text-white font-bold">{car.specs.acceleration}</span></div>
                <div className="flex justify-between pl-2"><span>MASS</span> <span className="text-white font-bold">{car.specs.weight}</span></div>
              </div>

              {/* Price & Action */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Market Value</span>
                    <div className="font-sans font-black tracking-tighter text-[#DFFF00] text-2xl tabular-nums">
                      {car.price.toLocaleString()}
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-[#DFFF00] group-hover:text-black group-hover:border-white transition-all">
                    <ArrowUpCircle size={20} className="rotate-45" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PURCHASE MODAL - MOBILE OPTIMIZED */}
      <AnimatePresence>
        {selectedCar && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-2xl"
                onClick={() => { setSelectedCar(null); setMessage(null); }}
            >
                <motion.div 
                    initial={{ y: "100%", scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: "100%", scale: 0.95 }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="bg-[#080808] border-t sm:border border-white/10 w-full max-w-4xl max-h-[92vh] sm:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative shadow-black"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button 
                        onClick={() => { setSelectedCar(null); setMessage(null); }}
                        className="absolute top-6 right-6 z-50 bg-white/5 hover:bg-white/10 p-3 rounded-full text-white transition-all border border-white/5"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Image Section */}
                            <div className="relative aspect-square lg:aspect-auto lg:h-[600px] bg-zinc-950 overflow-hidden">
                                <RealAssetImage 
                                    name={selectedCar.name} 
                                    searchQuery={`${selectedCar.manufacturer} ${selectedCar.name} car`} 
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <div className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.4em] mb-3">Origin Confirmed</div>
                                    <h3 className="text-5xl sm:text-6xl font-sans font-black tracking-tighter text-white leading-none">{selectedCar.name}</h3>
                                    <p className="text-zinc-500 font-medium tracking-[0.2em] uppercase text-sm mt-4">{selectedCar.manufacturer}</p>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="p-8 sm:p-12 flex flex-col">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-8">
                                        <span className="text-[10px] font-mono font-bold bg-white/5 text-zinc-400 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-white/10">
                                            {selectedCar.class} Class
                                        </span>
                                        <span className="text-[10px] font-mono font-bold bg-white/5 text-zinc-400 px-4 py-1.5 rounded-full border border-white/10">
                                            Year {selectedCar.year}
                                        </span>
                                    </div>

                                    <div className="space-y-8">
                                        <section>
                                            <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Historical Record</h4>
                                            <p className="text-zinc-400 text-sm leading-relaxed italic border-l-2 border-white/5 pl-6">
                                                {selectedCar.history}
                                            </p>
                                        </section>

                                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Engine Unit</span>
                                                <span className="text-xs text-white font-mono uppercase tracking-tight">{selectedCar.specs.engine}</span>
                                            </div>
                                            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Drivetrain</span>
                                                <span className="text-xs text-white font-mono uppercase tracking-tight">{selectedCar.specs.drivetrain}</span>
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="mt-12 pt-10 border-t border-white/5">
                                    <div className="flex justify-between items-end mb-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-1">Acquisition Cost</span>
                                            <div className="flex items-baseline gap-2 text-white">
                                                <span className="text-5xl font-sans font-black tracking-tighter tabular-nums">{selectedCar.price.toLocaleString()}</span>
                                                <span className="text-xs text-zinc-600 font-bold tracking-[0.2em]">CREDITS</span>
                                            </div>
                                        </div>
                                    </div>

                                    {message && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`mb-8 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                            {message.text}
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={handleBuy}
                                        disabled={purchasing || (profile?.credits || 0) < selectedCar.price}
                                        className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98]
                                            ${(profile?.credits || 0) < selectedCar.price 
                                                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                                                : 'bg-[#DFFF00] text-black hover:bg-white hover:shadow-[#DFFF00]/20'
                                            }
                                        `}
                                    >
                                        {purchasing ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (profile?.credits || 0) < selectedCar.price ? (
                                            <>Insufficient Credits</>
                                        ) : (
                                            <>Authorize Acquisition <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                    <p className="text-center mt-6 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] opacity-60">Transaction Subject to Interstellar Import Duties</p>
                                </div>
                            </div>
                        </div>
                    </div >
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}