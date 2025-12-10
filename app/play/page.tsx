'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  ChevronRight, 
  Construction, 
  Dna, 
  Spade, 
  Trophy, 
  Package, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Info,
  X,
  LogIn,
  Flame
} from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';

export default function PlayHub() {
  const { user, loading } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    // Show modal if not loading and no user found
    // Uses sessionStorage to prevent spamming the user if they've already closed it this session
    if (!loading && !user) {
      const hasSeenIntro = sessionStorage.getItem('zinc_play_intro_seen');
      if (!hasSeenIntro) {
        setShowInfoModal(true);
      }
    }
  }, [loading, user]);

  const closeInfoModal = () => {
    setShowInfoModal(false);
    sessionStorage.setItem('zinc_play_intro_seen', 'true');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      
      {/* BACKGROUND: Deep Space (Matches Home) */}
      <div className="bg-starfield" />

      {/* GLOBAL BACK BUTTON */}
      <BackButton href="/" label="MAIN TERMINAL" />

      {/* --- NOT AUTHENTICATED POPUP MODAL --- */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500"
            onClick={closeInfoModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-zinc-900 border border-[#DFFF00]/30 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(223,255,0,0.1)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
            
            {/* Close Button */}
            <button 
              onClick={closeInfoModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#DFFF00]/10 rounded-full border border-[#DFFF00]/20">
                <Info className="text-[#DFFF00]" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  Ecosystem Access
                </h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Guest Mode Detected
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4 font-mono text-sm text-zinc-400 leading-relaxed border-t border-b border-zinc-800 py-6 mb-6">
              <p>
                <strong className="text-white">Welcome to the Zinc Arcade.</strong> 
              </p>
              <p>
                This platform is designed to work with our proprietary <span className="text-[#DFFF00]">currency system</span>. 
                Signing in unlocks the full persistence ecosystem, including:
              </p>
              <ul className="grid grid-cols-2 gap-2 mt-2">
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <span className="w-1 h-1 bg-[#DFFF00] rounded-full" /> Pack Openings
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <span className="w-1 h-1 bg-[#DFFF00] rounded-full" /> Zinc Exchange
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <span className="w-1 h-1 bg-[#DFFF00] rounded-full" /> Persistent Profiles
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <span className="w-1 h-1 bg-[#DFFF00] rounded-full" /> Global Stat Tracking
                </li>
              </ul>
              <p className="text-xs italic opacity-70 mt-2">
                ...and more modules currently in development.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/login"
                className="flex-1 flex items-center justify-center gap-2 bg-[#DFFF00] hover:bg-[#cce600] text-black font-bold py-3 px-4 rounded-xl transition-all uppercase text-xs tracking-widest"
              >
                <LogIn size={16} />
                Initialize Session
              </Link>
              <button 
                onClick={closeInfoModal}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-xl transition-all uppercase text-xs tracking-widest border border-zinc-700"
              >
                Continue as Guest
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- HEADER SECTION --- */}
      <section className="relative pt-32 pb-12 px-6 border-b border-zinc-800/50">
        <div className="max-w-[1600px] mx-auto relative">
          
          {/* Breadcrumb / Status */}
          <div className="absolute top-0 right-0 hidden md:flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-1000">
             <div className="bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800 backdrop-blur-md flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  Arcade Protocols Online
                </span>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-white">
                    System <span className="text-zinc-800">Arcade</span>
                </h1>
                <p className="text-zinc-400 font-mono text-sm md:text-base max-w-2xl leading-relaxed">
                   <span className="text-[#DFFF00] font-black mr-2">///</span>
                   Interactive entertainment modules and cognitive assessment tools. 
                   Wager credits and test probability algorithms.
                </p>
            </div>

            {/* MARKET ACCESS BUTTON */}
            <Link 
                href="/play/market"
                className="group flex items-center gap-3 px-6 py-3 bg-[#DFFF00] hover:bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(223,255,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95"
            >
                <Package size={16} className="group-hover:rotate-12 transition-transform" />
                <span>Access Black Market</span>
                <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- MODULE GRID --- */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-12">
        
        {/* DECORATIVE HEADER */}
        <div className="flex items-center gap-4 mb-10 px-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-md">
                 <Activity size={16} className="text-[#DFFF00]" />
                 <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Active Simulations</span>
            </div>
            <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">
            
            {/* 1. TEXAS HOLD'EM (FEATURED - WIDE) - NOW WITH VIDEO */}
            <Link 
                href="/play/poker" 
                className="group md:col-span-8 relative min-h-[360px] rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                {/* VIDEO BACKGROUND */}
                <div className="absolute inset-0 overflow-hidden">
                   <video 
                     autoPlay 
                     loop 
                     muted 
                     playsInline 
                     className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700 group-hover:scale-105"
                   >
                      {/* IMPORTANT: You must download the video from Pexels and place it in your public folder.
                          Recommended path: public/videos/casino-bg.mp4 
                      */}
                      <source src="/videos/casino-bg.mp4" type="video/mp4" />
                   </video>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 group-hover:border-[#DFFF00] transition-colors">
                    <Trophy className="text-[#DFFF00]" size={24} />
                </div>

                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-black uppercase tracking-widest group-hover:bg-[#DFFF00] group-hover:text-black group-hover:border-[#DFFF00] transition-colors">
                          Elite Stakes
                       </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4 italic tracking-tight">Texas Hold&apos;em</h2>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed group-hover:text-zinc-200 transition-colors">
                        No-Limit Protocol. Compete against neural network agents in a high-stakes environment.
                    </p>
                </div>
            </Link>

            {/* 2. BLACKJACK (STANDARD) */}
            <Link 
                href="/play/blackjack" 
                className="group md:col-span-4 relative min-h-[360px] rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2674&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                
                <div className="absolute top-8 left-8">
                   <Spade size={32} className="text-zinc-700 group-hover:text-[#DFFF00] transition-colors duration-500" />
                </div>

                <div className="absolute bottom-0 left-0 p-10 w-full">
                   <h2 className="text-3xl font-black uppercase text-white mb-2 leading-none">Tactical<br/>Blackjack</h2>
                   <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6 group-hover:text-zinc-300 transition-colors">
                     Probability Sim
                   </p>
                   
                   <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-[#DFFF00] transition-colors">
                        Enter Table <ChevronRight size={12} />
                   </div>
                </div>
            </Link>

            {/* 3. HOTSEAT (UPDATED IMAGE) */}
            <Link 
                href="/play/hotseat" 
                className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500"
            >
                {/* Updated Background: Paper taped on wall */}
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3826581/pexels-photo-3826581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                
                <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                   <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20 group-hover:border-red-500 group-hover:bg-red-500 text-red-500 group-hover:text-black transition-all">
                       <Flame size={24} />
                   </div>
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                   <h2 className="text-2xl font-black uppercase text-white mb-2 italic">Protocol: Hotseat</h2>
                   <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-zinc-300 transition-colors">
                      15 Questions. 5,000 Credits. High voltage trivia.
                   </p>
                </div>
            </Link>

            {/* 4. TRIVIA */}
            <Link 
                href="/collections/trivia" 
                className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 to-transparent" />
                
                <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                   <Brain size={32} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                   <h2 className="text-2xl font-black uppercase text-white mb-2">Trivia Matrix</h2>
                   <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-zinc-300 transition-colors">
                      Standard assessment generator.
                   </p>
                </div>
            </Link>

            {/* 5. STOCKS (UPDATED IMAGE) */}
            <Link 
                href="/play/stocks" 
                className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500"
            >
                {/* Updated Background: Stock Exchange Board */}
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 to-transparent" />
                
                <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
                   <TrendingUp size={32} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                   <h2 className="text-2xl font-black uppercase text-white mb-2">Zinc Exchange</h2>
                   <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-zinc-300 transition-colors">
                      Volatile market simulation.
                   </p>
                </div>
            </Link>

            {/* 6. COMING SOON */}
            <div className="group md:col-span-12 relative h-40 rounded-[2.5rem] border border-dashed border-zinc-800 bg-zinc-950/30 flex flex-col items-center justify-center text-center p-8 opacity-60 hover:opacity-100 transition-all hover:border-zinc-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                    <Construction size={10} />
                    In Development
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-700 group-hover:text-zinc-400">
                    Memory Core
                </h3>
            </div>
        </div>
      </section>
    </main>
  );
}