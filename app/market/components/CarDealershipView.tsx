'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentShowroom, getNextRotationTime, DealershipCar } from '../lib/dealership';
import { purchaseVehicle } from '../actions';
import { CarFront, Timer, Wallet, AlertCircle, CheckCircle2, Info } from 'lucide-react';
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
    <div className="p-4 md:p-6 max-w-[1800px] mx-auto min-h-screen">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
            Prestige <span className="text-[#DFFF00]">Imports</span>
          </h2>
          <div className="flex items-center gap-4 text-zinc-400 font-mono text-sm">
            <div className="flex items-center gap-2">
              <Timer size={16} className="text-[#DFFF00]" />
              <span>NEXT ROTATION: <span className="text-white font-bold">{timeLeft}</span></span>
            </div>
            <div className="h-4 w-[1px] bg-zinc-700"></div>
            <div className="text-xs uppercase tracking-widest">Global Stock Refreshes Hourly</div>
          </div>
        </div>

        {/* User Balance (Mobile Friendly) */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 flex items-center gap-3">
          <div className="text-xs text-zinc-500 uppercase font-bold text-right">
            Purchasing<br/>Power
          </div>
          <div className="text-2xl font-mono font-black text-[#DFFF00]">
             {profile?.credits?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* SHOWROOM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {showroom.map((car) => (
          <div 
            key={car.rotationId}
            onClick={() => setSelectedCar(car)}
            className="group relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 rounded-xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-[#DFFF00]/10 cursor-pointer"
          >
            {/* Rarity Stripe */}
            <div className={`absolute top-0 left-0 w-1 h-full z-10
              ${car.rarity === 'ZENITH' ? 'bg-gradient-to-b from-purple-500 via-pink-500 to-red-500 animate-pulse' : 
                car.rarity === 'ULTRA' ? 'bg-amber-400' :
                car.rarity === 'SUPER_RARE' ? 'bg-rose-500' :
                car.rarity === 'RARE' ? 'bg-blue-500' : 'bg-zinc-700'
              }
            `}></div>

            {/* Image Container */}
            <div className="aspect-video relative overflow-hidden bg-zinc-950">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10 opacity-60"></div>
              <RealAssetImage 
                name={car.name} 
                searchQuery={`${car.manufacturer} ${car.name} car`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              />
              
              {/* Manufacturer Logo/Name */}
              <div className="absolute top-3 right-3 z-20">
                <span className="bg-black/50 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded text-white border border-white/10 uppercase tracking-widest">
                  {car.manufacturer}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4 pl-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">{car.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1">{car.year} // {car.class}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 my-4 text-[10px] text-zinc-400 font-mono border-t border-b border-zinc-800/50 py-2">
                <div>HP: <span className="text-white">{car.specs.power}</span></div>
                <div>Top: <span className="text-white">{car.specs.topSpeed}</span></div>
                <div>0-60: <span className="text-white">{car.specs.acceleration}</span></div>
                <div>Wt: <span className="text-white">{car.specs.weight}</span></div>
              </div>

              {/* Price & Action */}
              <div className="flex justify-between items-center mt-2">
                <div className={`text-xs font-bold px-2 py-0.5 rounded border
                  ${car.rarity === 'ZENITH' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' : 
                    car.rarity === 'ULTRA' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                    'border-zinc-700 text-zinc-500'
                  }
                `}>
                  {car.rarity.replace('_', ' ')}
                </div>
                <div className="font-mono font-bold text-[#DFFF00] text-lg">
                  {car.price.toLocaleString()} CR
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PURCHASE MODAL */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            
            {/* Modal Close Button */}
            <button 
              onClick={() => { setSelectedCar(null); setMessage(null); }}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
            >
              ✕
            </button>

            <div className="grid md:grid-cols-2">
              {/* Left: Image */}
              <div className="relative h-48 md:h-full bg-zinc-950">
                <RealAssetImage 
                   name={selectedCar.name} 
                   searchQuery={`${selectedCar.manufacturer} ${selectedCar.name} car`} 
                   className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <h3 className="text-2xl font-black text-white italic">{selectedCar.name}</h3>
                  <p className="text-[#DFFF00] font-mono text-sm">{selectedCar.manufacturer}</p>
                </div>
              </div>

              {/* Right: Details */}
              <div className="p-6 md:p-8 flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase tracking-wider">
                      {selectedCar.class}
                    </span>
                    <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono">
                      {selectedCar.year}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    {selectedCar.history}
                  </p>

                  <div className="space-y-2 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 uppercase">Engine</span>
                      <span className="text-white font-mono">{selectedCar.specs.engine}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 uppercase">Drivetrain</span>
                      <span className="text-white font-mono">{selectedCar.specs.drivetrain}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 uppercase">Weight</span>
                      <span className="text-white font-mono">{selectedCar.specs.weight}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-8 border-t border-zinc-800 pt-6">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-zinc-500 text-sm font-bold uppercase">Total Cost</span>
                    <span className="text-3xl font-black text-white font-mono tracking-tighter">
                      {selectedCar.price.toLocaleString()} <span className="text-[#DFFF00] text-lg">CR</span>
                    </span>
                  </div>

                  {message && (
                    <div className={`mb-4 p-3 rounded text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {message.text}
                    </div>
                  )}

                  <button
                    onClick={handleBuy}
                    disabled={purchasing || (profile?.credits || 0) < selectedCar.price}
                    className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2
                      ${(profile?.credits || 0) < selectedCar.price 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-[#DFFF00] text-black hover:bg-white hover:scale-[1.02] shadow-lg shadow-[#DFFF00]/20'
                      }
                    `}
                  >
                    {purchasing ? (
                       <span className="animate-pulse">Processing Transaction...</span>
                    ) : (profile?.credits || 0) < selectedCar.price ? (
                       <>Insufficient Credits</>
                    ) : (
                       <>Confirm Purchase</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}