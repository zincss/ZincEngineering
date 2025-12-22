'use client';

import React, { useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  RotateCcw, 
  Coins, 
  ChevronLeft, 
  Smartphone, 
  RefreshCw, 
  Trophy, 
  X,
  AlertTriangle,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { spinRoulette } from './actions';
import { WHEEL_ORDER, getNumberColor, Bet, RED_NUMBERS } from './utils';

// --- SUB-COMPONENTS ---

const Chip = ({ amount, selected, onClick }: { amount: number, selected: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`
      relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0
      ${selected 
        ? 'scale-110 shadow-[0_0_15px_#DFFF00] bg-zinc-900 border-2 border-[#DFFF00]' 
        : 'scale-100 bg-zinc-900/80 border border-white/10 hover:border-white/40'
      }
    `}
  >
    <div className={`absolute inset-1 rounded-full border border-dashed ${selected ? 'border-[#DFFF00]/50' : 'border-white/10'}`} />
    <span className={`font-black text-[10px] md:text-xs ${selected ? 'text-[#DFFF00]' : 'text-zinc-500'}`}>
      {amount}
    </span>
  </button>
);

const BetCell = ({ 
  label, 
  subLabel,
  chipAmount, 
  onClick, 
  className, 
  colorType = 'default', 
  colSpan = 1,
  verticalText = false
}: { 
  label: React.ReactNode, 
  subLabel?: string,
  chipAmount?: number, 
  onClick: () => void, 
  className?: string, 
  colorType?: 'red' | 'black' | 'green' | 'default', 
  colSpan?: number,
  verticalText?: boolean
}) => {
  let bgStyle = "bg-zinc-900/40 border-zinc-700/30 hover:bg-zinc-800 text-zinc-400";
  if (colorType === 'red') bgStyle = "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-500";
  if (colorType === 'black') bgStyle = "bg-zinc-950/80 border-zinc-700/50 hover:bg-zinc-900 text-zinc-500";
  if (colorType === 'green') bgStyle = "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500";

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center border font-mono font-bold transition-all group overflow-hidden touch-manipulation active:scale-95
        ${bgStyle} ${className}
      `}
      style={{ gridColumn: `span ${colSpan}` }}
    >
      <div className={`relative z-10 flex flex-col items-center gap-0.5 ${verticalText ? 'rotate-180 [writing-mode:vertical-lr]' : ''}`}>
        <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">{label}</span>
        {subLabel && (
          <span className={`text-[8px] font-mono opacity-50 ${verticalText ? 'rotate-90 mt-1' : ''}`}>{subLabel}</span>
        )}
      </div>

      {/* Hover Shine */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Chip Overlay */}
      {chipAmount && (
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[1px]"
        >
          <div className="w-5 h-5 rounded-full bg-[#DFFF00] text-black flex items-center justify-center text-[8px] font-black border border-white shadow-lg">
            {chipAmount >= 1000 ? `${(chipAmount/1000).toFixed(0)}k` : chipAmount}
          </div>
        </motion.div>
      )}
    </button>
  );
};

export default function RoulettePage() {
  const { profile, refreshProfile } = useAuth();
  const [selectedChip, setSelectedChip] = useState(10);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [lastWinnings, setLastWinnings] = useState<number>(0);
  const [showResultModal, setShowResultModal] = useState(false);
  
  const controls = useAnimation();
  const rotationRef = useRef(0);
  const wheelRef = useRef<HTMLDivElement>(null); // Ref for auto-scroll

  // --- CONIC GRADIENT GENERATION ---
  const sliceAngle = 360 / 37;
  const wheelGradient = `conic-gradient(${
    WHEEL_ORDER.map((num, i) => {
      const isRed = RED_NUMBERS.includes(num);
      const color = num === 0 ? '#059669' : isRed ? '#dc2626' : '#18181b';
      const start = i * sliceAngle;
      const end = (i + 1) * sliceAngle;
      return `${color} ${start}deg ${end}deg`;
    }).join(', ')
  })`;

  // --- ACTIONS ---
  const placeBet = (type: any, value: string | number) => {
    if (isSpinning) return;
    setBets(prev => {
      const existing = prev.find(b => b.type === type && b.value === value);
      if (existing) return prev.map(b => b.id === existing.id ? { ...b, amount: b.amount + selectedChip } : b);
      return [...prev, { id: Math.random().toString(), type, value, amount: selectedChip }];
    });
  };

  const clearBets = () => !isSpinning && setBets([]);
  const undoLastBet = () => !isSpinning && setBets(prev => prev.slice(0, -1));

  const handleSpin = async () => {
    const totalBet = bets.reduce((acc, b) => acc + b.amount, 0);
    if (isSpinning || totalBet === 0 || !profile) return;
    if (totalBet > profile.credits) return alert("INSUFFICIENT FUNDS");

    // UX: Scroll to wheel on mobile so user sees the result
    if (wheelRef.current && window.innerWidth < 1024) {
        wheelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setIsSpinning(true);
    setShowResultModal(false);
    setLastResult(null);

    const response = await spinRoulette(bets);
    if (response.error || response.result === undefined) {
      alert(response.error);
      setIsSpinning(false);
      return;
    }

    const resultIndex = WHEEL_ORDER.indexOf(response.result);
    const randomOffset = (Math.random() - 0.5) * 4; 
    const targetRotation = 360 * 8 - ((resultIndex * sliceAngle) + (sliceAngle / 2)) + randomOffset;
    
    const relativeTarget = targetRotation % 360;
    const currentMod = rotationRef.current % 360;
    const diff = relativeTarget - currentMod + 360 * 8; 

    const newTotalRotation = rotationRef.current + diff;
    
    await controls.start({
      rotate: newTotalRotation,
      transition: { duration: 8, ease: [0.2, 0, 0, 1] }
    });

    rotationRef.current = newTotalRotation;
    setLastResult(response.result);
    setLastWinnings(response.winnings);
    await refreshProfile();
    setIsSpinning(false);
    
    // UX: Show result modal after spin completes
    setTimeout(() => setShowResultModal(true), 500);
  };

  const getBetAmount = (type: any, value: any) => bets.find(b => b.type === type && b.value === value)?.amount;

  return (
    <main className="min-h-screen w-full bg-zinc-950 text-white relative selection:bg-[#DFFF00] selection:text-black flex flex-col overflow-x-hidden">
      
      {/* --- MOBILE ORIENTATION LOCK --- */}
      <div className="md:hidden portrait:flex hidden fixed inset-0 z-[100] bg-zinc-950 flex-col items-center justify-center p-8 text-center gap-6">
         <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center animate-pulse">
            <Smartphone className="rotate-90 text-[#DFFF00]" size={32} />
         </div>
         <div>
            <h2 className="text-2xl font-black uppercase text-white mb-2">System Locked</h2>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
               Please Rotate Device
            </p>
         </div>
      </div>

      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/20 to-zinc-950 pointer-events-none z-0" />

      {/* --- HEADER --- */}
      <header className="relative z-50 px-4 md:px-6 py-4 flex items-center justify-between border-b border-white/5 bg-zinc-950/80 backdrop-blur-md shrink-0 h-16">
         <div className="flex items-center gap-4 md:gap-6">
            <Link href="/play" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
               <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
               <span className="font-mono text-xs font-bold uppercase tracking-widest hidden sm:inline">Exit</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <h1 className="font-black italic text-lg uppercase text-zinc-300 tracking-tighter">Roulette <span className="text-[#DFFF00]">Pro</span></h1>
         </div>

         <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Credits</span>
               <span className="text-sm font-black text-white tabular-nums">
                  {profile?.credits?.toLocaleString() ?? <Loader2 className="animate-spin inline" size={12} />}
               </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#DFFF00] flex items-center justify-center text-black shadow-[0_0_10px_rgba(223,255,0,0.3)]">
               <Coins size={16} />
            </div>
         </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-12 p-2 lg:px-12 relative z-10 h-auto w-full max-w-[1400px] mx-auto">
        
        {/* === LEFT: WHEEL === */}
        <div ref={wheelRef} className="flex-none flex flex-col items-center justify-center w-full max-w-[500px] lg:sticky lg:top-24">
           
           {/* SCALED DOWN WHEEL FOR MOBILE */}
           <div className="relative aspect-square w-[220px] xs:w-[260px] sm:w-[380px] lg:w-[480px] transition-transform">
              {/* Outer Housing */}
              <div className="absolute inset-0 rounded-full bg-zinc-950 border-[8px] sm:border-[12px] border-zinc-900 shadow-2xl flex items-center justify-center z-0 ring-1 ring-white/10">
                 <div className="absolute inset-[-4px] rounded-full border border-[#DFFF00]/20" />
              </div>
              {/* Indicator */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_6px_rgba(0,0,0,1)]">
                 <div className="w-4 h-6 sm:w-6 sm:h-8 bg-[#DFFF00] clip-path-triangle shadow-[0_0_20px_#DFFF00]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
              </div>

              {/* SPINNING WHEEL */}
              <motion.div 
                 animate={controls}
                 className="absolute inset-[10px] sm:inset-[16px] rounded-full overflow-hidden bg-zinc-900"
                 style={{ background: wheelGradient, rotate: rotationRef.current }}
              >
                 <div className="absolute inset-0 rounded-full">
                    {WHEEL_ORDER.map((num, i) => {
                       const angle = (sliceAngle * i) + (sliceAngle / 2);
                       return (
                          <div 
                             key={i}
                             className="absolute top-0 left-[calc(50%-1px)] h-[50%] w-[2px] origin-bottom flex justify-center pt-1 sm:pt-2"
                             style={{ transform: `rotate(${angle}deg)` }}
                          >
                             <span className="block text-white font-black text-[8px] sm:text-xs lg:text-sm transform" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{num}</span>
                          </div>
                       )
                    })}
                 </div>
                 {/* Hub */}
                 <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-zinc-800 to-black border-4 border-zinc-700 shadow-2xl flex items-center justify-center z-20">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full border border-white/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950 flex items-center justify-center">
                       <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#DFFF00] animate-pulse shadow-[0_0_15px_#DFFF00]" />
                    </div>
                 </div>
              </motion.div>
           </div>

           {/* STATUS */}
           <div className="mt-4 md:mt-8 h-12 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                 {isSpinning ? (
                    <motion.div 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                       className="flex items-center gap-3 px-6 py-2 rounded-full bg-zinc-900/50 border border-white/5"
                    >
                       <Loader2 className="animate-spin text-[#DFFF00]" size={16} />
                       <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Spinning...</span>
                    </motion.div>
                 ) : lastResult !== null && !showResultModal ? (
                     // Small result indicator if modal is closed but result exists
                    <motion.div 
                       initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                       className="flex items-center gap-2"
                    >
                       <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Last Roll:</span>
                       <span className={`font-black text-xl ${getNumberColor(lastResult) === 'red' ? 'text-red-500' : getNumberColor(lastResult) === 'black' ? 'text-white' : 'text-emerald-500'}`}>
                            {lastResult}
                       </span>
                    </motion.div>
                 ) : (
                    <span className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Place Your Bets</span>
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* === RIGHT: TABLE === */}
        <div className="flex-1 w-full max-w-[600px] flex flex-col pb-24 lg:pb-0">
           
           <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-2 sm:p-4 lg:p-6 backdrop-blur-md flex flex-col shadow-2xl">
              
              {/* CHIPS */}
              <div className="flex justify-center gap-2 md:gap-3 mb-4 pb-4 border-b border-white/5 overflow-x-auto no-scrollbar py-2">
                 {[10, 50, 100, 500, 1000].map(val => (
                    <Chip key={val} amount={val} selected={selectedChip === val} onClick={() => setSelectedChip(val)} />
                 ))}
              </div>

              {/* TABLE LAYOUT - COMPACT ON MOBILE */}
              <div className="flex-1 flex flex-col gap-1 select-none overflow-hidden h-[350px] sm:min-h-[400px]">
                 
                 <div className="flex-1 grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3rem_1fr] gap-1 h-[220px] sm:max-h-[400px]">
                    
                    {/* ZERO - STRICT WIDTH */}
                    <BetCell 
                        label="0" 
                        colorType="green" 
                        chipAmount={getBetAmount('STRAIGHT', 0)}
                        onClick={() => placeBet('STRAIGHT', 0)}
                        className="rounded-l-lg h-full"
                        verticalText={true}
                    />

                    {/* NUMBERS (12x3 Grid) */}
                    <div className="grid grid-cols-12 grid-rows-3 gap-1 h-full">
                        {Array.from({ length: 36 }).map((_, i) => {
                           let num = 0;
                           const row = Math.floor(i / 12); 
                           const col = i % 12; 
                           if (row === 0) num = (col + 1) * 3;
                           if (row === 1) num = (col + 1) * 3 - 1;
                           if (row === 2) num = (col + 1) * 3 - 2;
                           return (
                              <BetCell 
                                 key={num}
                                 label={num} 
                                 colorType={RED_NUMBERS.includes(num) ? 'red' : 'black'}
                                 chipAmount={getBetAmount('STRAIGHT', num)}
                                 onClick={() => placeBet('STRAIGHT', num)}
                                 className="h-full rounded-sm hover:brightness-125 min-h-[24px] sm:min-h-[32px] md:min-h-0"
                              />
                           )
                        })}
                    </div>
                 </div>

                 {/* DOZENS */}
                 <div className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3rem_1fr] gap-1 h-10 sm:h-12 shrink-0">
                    <div /> {/* Spacer for Zero */}
                    <div className="grid grid-cols-3 gap-1">
                       <BetCell label="1st 12" subLabel="2:1" chipAmount={getBetAmount('DOZEN_1', '1')} onClick={() => placeBet('DOZEN_1', '1')} />
                       <BetCell label="2nd 12" subLabel="2:1" chipAmount={getBetAmount('DOZEN_2', '2')} onClick={() => placeBet('DOZEN_2', '2')} />
                       <BetCell label="3rd 12" subLabel="2:1" chipAmount={getBetAmount('DOZEN_3', '3')} onClick={() => placeBet('DOZEN_3', '3')} />
                    </div>
                 </div>

                 {/* SIDE BETS */}
                 <div className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3rem_1fr] gap-1 h-10 sm:h-12 shrink-0">
                    <div /> {/* Spacer for Zero */}
                    <div className="grid grid-cols-6 gap-1">
                       <BetCell label="1-18" subLabel="1:1" chipAmount={getBetAmount('LOW', 'L')} onClick={() => placeBet('LOW', 'L')} className="rounded-bl-lg" />
                       <BetCell label="EVEN" subLabel="1:1" chipAmount={getBetAmount('EVEN', 'E')} onClick={() => placeBet('EVEN', 'E')} />
                       <BetCell label={<div className="w-3 h-3 bg-red-500 rounded-sm shadow-md" />} subLabel="1:1" chipAmount={getBetAmount('RED', 'R')} onClick={() => placeBet('RED', 'R')} />
                       <BetCell label={<div className="w-3 h-3 bg-zinc-800 rounded-sm border border-zinc-600 shadow-md" />} subLabel="1:1" chipAmount={getBetAmount('BLACK', 'B')} onClick={() => placeBet('BLACK', 'B')} />
                       <BetCell label="ODD" subLabel="1:1" chipAmount={getBetAmount('ODD', 'O')} onClick={() => placeBet('ODD', 'O')} />
                       <BetCell label="19-36" subLabel="1:1" chipAmount={getBetAmount('HIGH', 'H')} onClick={() => placeBet('HIGH', 'H')} className="rounded-br-lg" />
                    </div>
                 </div>

              </div>

              {/* CONTROLS */}
              <div className="mt-2 sm:mt-4 flex items-center gap-3 sticky bottom-0 z-10">
                 <button 
                    onClick={undoLastBet} disabled={isSpinning || bets.length === 0}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 disabled:opacity-50 border border-white/5 transition-colors"
                 >
                    <RotateCcw size={16} />
                 </button>
                 <button 
                    onClick={clearBets} disabled={isSpinning || bets.length === 0}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 disabled:opacity-50 border border-white/5 transition-colors"
                 >
                    <RefreshCw size={16} />
                 </button>

                 <button
                    onClick={handleSpin}
                    disabled={isSpinning || bets.length === 0}
                    className={`
                       flex-1 h-10 sm:h-12 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all flex items-center justify-center gap-2
                       ${isSpinning 
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                          : 'bg-[#DFFF00] text-black hover:bg-white hover:scale-[1.01] shadow-[0_0_20px_rgba(223,255,0,0.15)]'
                       }
                    `}
                 >
                    {isSpinning ? 'Running...' : `Spin • ${bets.reduce((a,b) => a+b.amount, 0)}`}
                 </button>
              </div>

           </div>
        </div>

      </div>

      {/* --- RESULT OVERLAY POPUP --- */}
      <AnimatePresence>
        {showResultModal && lastResult !== null && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                onClick={() => setShowResultModal(false)}
            >
                <motion.div 
                   initial={{ scale: 0.8, y: 50, opacity: 0 }} 
                   animate={{ scale: 1, y: 0, opacity: 1 }} 
                   exit={{ scale: 0.8, y: 50, opacity: 0 }}
                   transition={{ type: "spring", damping: 20 }}
                   className="relative bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden text-center"
                   onClick={e => e.stopPropagation()}
                >
                    {/* Background Glow */}
                    <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${lastWinnings > 0 ? 'from-[#DFFF00] to-transparent' : 'from-red-600 to-transparent'}`} />

                    {/* Close Button */}
                    <button onClick={() => setShowResultModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>

                    <div className="relative z-10 flex flex-col items-center gap-4">
                        
                        {/* Icon */}
                        <div className={`
                            w-20 h-20 rounded-full flex items-center justify-center border-[4px] shadow-2xl mb-2
                            ${lastWinnings > 0 ? 'bg-[#DFFF00] border-white text-black shadow-[0_0_40px_#DFFF00]' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}
                        `}>
                            {lastWinnings > 0 ? <Crown size={40} className="animate-bounce" /> : <AlertTriangle size={40} />}
                        </div>

                        {/* Text */}
                        <div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                {lastWinnings > 0 ? 'Jackpot' : 'System Failure'}
                            </h2>
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1">
                                {lastWinnings > 0 ? 'Funds Transferred' : 'No Payout Detected'}
                            </p>
                        </div>

                        {/* Result Display */}
                        <div className="bg-zinc-900/80 border border-white/10 px-8 py-3 rounded-xl flex items-center gap-4 shadow-inner">
                            <span className={`text-4xl font-black ${getNumberColor(lastResult) === 'red' ? 'text-red-500' : getNumberColor(lastResult) === 'black' ? 'text-white' : 'text-emerald-500'}`}>
                                {lastResult}
                            </span>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Result</span>
                                <span className="text-xs font-bold text-white uppercase">{getNumberColor(lastResult)}</span>
                            </div>
                        </div>

                        {/* Winnings or Loss */}
                        {lastWinnings > 0 && (
                            <div className="flex items-center gap-2 text-[#DFFF00] font-black text-xl bg-[#DFFF00]/10 px-4 py-2 rounded-lg border border-[#DFFF00]/20">
                                <Coins size={20} />
                                +{lastWinnings.toLocaleString()}
                            </div>
                        )}

                        <button 
                            onClick={() => setShowResultModal(false)}
                            className="w-full py-4 mt-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            {lastWinnings > 0 ? 'Collect & Continue' : 'Retry Sequence'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}