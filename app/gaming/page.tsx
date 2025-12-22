'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Ghost, ArrowRight, Plus, Lock, KeyRound, AlertCircle, Loader2 } from "lucide-react";

export default function EntertainmentHub() {
  // --- SECURITY LOGIC ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if previously unlocked
    const auth = localStorage.getItem('zinc_ent_auth');
    if (auth === 'true') {
      setIsUnlocked(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(false);

    // SIMULATE NETWORK DELAY
    setTimeout(() => {
        if (code.toUpperCase() === 'ZINC') {
            setIsUnlocked(true);
            localStorage.setItem('zinc_ent_auth', 'true');
        } else {
            setError(true);
            setCode('');
        }
        setVerifying(false);
    }, 800);
  };

  // --- RENDERING ---
  
  // 1. Loading State (prevent flicker)
  if (checkingAuth) return <div className="min-h-screen bg-black" />;

  // 2. Lock Screen
  if (!isUnlocked) {
    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center relative px-4">
             <div className="bg-starfield">
                <div className="stars-1"></div>
            </div>

            <div className="max-w-md w-full bg-black/50 backdrop-blur-md border border-zinc-800 p-8 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                    <Lock size={24} className="text-zinc-500" />
                </div>
                
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">RESTRICTED ACCESS</h1>
                <p className="font-mono text-xs text-zinc-500 mb-8 leading-relaxed">
                    This division requires Level 2 security clearance. <br/>
                    Please enter your authorization code to proceed.
                </p>

                <form onSubmit={handleUnlock} className="w-full relative">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                            <KeyRound size={16} />
                        </div>
                        <input 
                            type="password" 
                            value={code}
                            onChange={(e) => { setError(false); setCode(e.target.value); }}
                            placeholder="ENTER ACCESS CODE..."
                            className="w-full h-12 bg-zinc-900/50 border border-zinc-700 focus:border-[#DFFF00] pl-12 pr-4 font-mono text-sm font-bold tracking-widest outline-none text-white transition-all uppercase placeholder:text-zinc-700 text-center"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="flex items-center justify-center gap-2 text-red-500 text-[10px] font-mono font-bold mt-3 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={12} />
                            <span>ACCESS DENIED // INVALID CODE</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={verifying}
                        className="w-full mt-4 h-12 bg-[#DFFF00] hover:bg-white text-black font-black font-mono text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {verifying ? <Loader2 size={16} className="animate-spin" /> : "AUTHENTICATE"}
                    </button>
                </form>
            </div>
        </div>
    )
  }

  // 3. Main Content (Entertainment Hub)
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center relative px-4 pb-20">
      
      {/* ADD BACK BUTTON HERE */}

      {/* BACKGROUND */}
      <div className="bg-starfield">
          <div className="stars-1"></div>
          <div className="stars-2"></div>
          <div className="stars-3"></div>
      </div>

      {/* HERO */}
      <div className="text-center mt-12 md:mt-24 mb-20 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-3 text-zinc-500 text-[10px] font-mono font-bold tracking-[0.2em] mb-10 uppercase border border-zinc-800 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-sm">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
           </span>
           <span>ZINC_ENGINEERING // ENTERTAINMENT_DIVISION</span>
        </div>

        <div className="flex flex-col items-center">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-sm">
              SELECT
            </h1>
            <div className="h-1 w-24 bg-[#DFFF00] my-4"></div>
            <h2 className="text-3xl md:text-5xl font-black tracking-[0.2em] text-zinc-500 uppercase">
              PROTOCOL
            </h2>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl relative z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        
        {/* WARFRAME */}
        <Link href="/gaming/warframe" className="group relative h-80 border border-zinc-800 bg-black/50 hover:bg-zinc-900/80 p-8 flex flex-col justify-between hover:border-[#DFFF00] transition-all duration-300 overflow-hidden backdrop-blur-sm">
            <div className="absolute -right-8 -top-8 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 duration-500 group-hover:scale-110">
                <Ghost size={200} className="text-white" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                   <div className="w-10 h-10 bg-[#DFFF00] text-black flex items-center justify-center font-bold border border-black">
                       WF
                   </div>
                   <span className="text-[9px] font-mono text-[#DFFF00] border border-[#DFFF00]/30 px-2 py-1 rounded-full">ONLINE</span>
                </div>
                
                <h2 className="text-3xl font-black uppercase mb-2 text-white tracking-tighter">WARFRAME</h2>
                <p className="font-mono text-[10px] text-zinc-400 leading-relaxed max-w-[200px]">
                    Tactical database, market analytics, and build optimization.
                </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                INITIALIZE <ArrowRight size={14} className="text-[#DFFF00]" />
            </div>
        </Link>

        {/* COMING SOON */}
        <div className="group relative h-80 border border-dashed border-zinc-800 bg-black/30 p-8 flex flex-col justify-center items-center text-center transition-all duration-300 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-zinc-900 text-zinc-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={24} />
            </div>
            <h2 className="text-xl font-black uppercase text-zinc-600 tracking-tighter">ADDITIONAL<br/>PROTOCOLS</h2>
            <p className="font-mono text-[10px] text-zinc-700 mt-2 uppercase tracking-widest">Coming Soon</p>
        </div>

      </div>
    </div>
  );
}