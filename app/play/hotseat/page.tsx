'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Flame, 
  RefreshCw, 
  ShieldAlert, 
  Coins, 
  Trophy, 
  ShieldCheck, 
  Zap,
  Terminal,
  AlertTriangle, 
  LogOut
} from 'lucide-react';
import { PRIZE_LADDER, SAFETY_NETS, ENTRY_FEE } from './game-config';
import { fetchGameQuestions, Question } from './trivia-api';
import { processHotseatTransaction } from './actions';

// --- VISUAL COMPONENTS ---

const Scanlines = () => (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden opacity-10">
        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_3px)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scan" />
    </div>
);

const TypewriterText = ({ text, speed = 30, onComplete }: { text: string, speed?: number, onComplete?: () => void }) => {
    const [displayLength, setDisplayLength] = useState(0);

    useEffect(() => {
        setDisplayLength(0); // Reset
        let i = 0;
        
        const timer = setInterval(() => {
            if (i < text.length) {
                i++;
                setDisplayLength(i);
            } else {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return (
        <span>
            {text.slice(0, displayLength)}
            <span className="animate-pulse inline-block w-2 h-4 bg-[#DFFF00] ml-1 align-middle opacity-70" />
        </span>
    );
};

const LifelineBtn = ({ 
    icon: Icon, 
    label, 
    used, 
    onClick, 
    disabled 
}: { 
    icon: any, 
    label: string, 
    used: boolean, 
    onClick: () => void,
    disabled: boolean
}) => (
    <button 
        onClick={onClick}
        disabled={used || disabled}
        className={`
            relative group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 overflow-hidden
            ${used 
                ? 'bg-zinc-950/80 border-zinc-900 text-zinc-700 scale-95' 
                : 'bg-zinc-900/50 border-zinc-700 hover:border-[#DFFF00] hover:bg-zinc-800 text-zinc-400 hover:text-[#DFFF00]'
            }
            ${disabled && !used ? 'opacity-50 cursor-not-allowed' : ''}
        `}
    >
        <div className={`absolute inset-0 bg-[#DFFF00]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${used ? 'hidden' : ''}`} />
        <Icon size={20} className="mb-2 z-10" />
        <span className="text-[9px] font-mono uppercase tracking-widest z-10">{used ? 'OFFLINE' : label}</span>
    </button>
);

const LadderItem = ({ index, amount, current, safe }: { index: number, amount: number, current: boolean, safe: boolean }) => (
    <div className={`
        flex items-center justify-between px-4 py-1.5 font-mono text-xs border-l-2 transition-all duration-300
        ${current 
            ? 'bg-[#DFFF00]/20 border-[#DFFF00] text-[#DFFF00] pl-6' 
            : safe 
                ? 'border-white/50 text-white' 
                : 'border-zinc-800 text-zinc-600'
        }
    `}>
        <span className="w-8 flex items-center gap-2">
            {index + 1}
            {safe && <ShieldAlert size={10} className={current ? 'text-[#DFFF00]' : 'text-white'} />}
        </span>
        <span className="font-bold">{amount.toLocaleString()}</span>
    </div>
);

// --- MAIN PAGE ---

export default function HotseatPage() {
    const { profile, refreshProfile } = useAuth();
    
    // Game State
    const [status, setStatus] = useState<'INTRO' | 'LOADING' | 'PLAYING' | 'VICTORY' | 'GAME_OVER' | 'CASHOUT'>('INTRO');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [qIndex, setQIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [gameStateClass, setGameStateClass] = useState(''); 
    
    // Lifelines
    const [lifelines, setLifelines] = useState({
        fiftyFifty: false,
        addTime: false,
        swap: false
    });
    const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

    const currentQuestion = questions[qIndex];
    const currentPrize = qIndex > 0 ? PRIZE_LADDER[qIndex - 1] : 0;
    
    // --- INITIALIZATION ---
    const startGame = async () => {
        if (!profile || profile.credits < ENTRY_FEE) {
            alert(`Insufficient funds. Need ${ENTRY_FEE} Credits.`);
            return;
        }

        setStatus('LOADING');
        
        // Transaction
        const res = await processHotseatTransaction(-ENTRY_FEE);
        if (res.error) {
            setStatus('INTRO');
            alert("Payment declined by server.");
            return;
        }
        refreshProfile();

        // Fetch Questions
        const newQuestions = await fetchGameQuestions();
        setQuestions(newQuestions);
        setQIndex(0);
        setLifelines({ fiftyFifty: false, addTime: false, swap: false });
        setHiddenOptions([]);
        setTimeLeft(30);
        setStatus('PLAYING');
    };

    // --- TIMER LOGIC ---
    useEffect(() => {
        if (status !== 'PLAYING') return;
        
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, qIndex]);

    // --- GAMEPLAY HANDLERS ---
    
    const handleAnswer = async (idx: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(idx);
        
        // Suspense Moment
        await new Promise(r => setTimeout(r, 1500));

        if (idx === currentQuestion.answerIdx) {
            // CORRECT
            setGameStateClass('animate-flash-green'); 
            setTimeout(() => setGameStateClass(''), 500);

            if (qIndex === 14) {
                setStatus('VICTORY');
                await payout(PRIZE_LADDER[14]);
            } else {
                setQIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setHiddenOptions([]);
                setTimeLeft(30);
            }
        } else {
            // WRONG
            setGameStateClass('animate-shake bg-red-900/10'); 
            await new Promise(r => setTimeout(r, 500));
            handleGameOver(false);
        }
    };

    const handleGameOver = async (isTimeout: boolean) => {
        setStatus('GAME_OVER');
        
        // Calculate Safety Net
        let winAmount = 0;
        if (qIndex > SAFETY_NETS[1]) winAmount = PRIZE_LADDER[SAFETY_NETS[1]];
        else if (qIndex > SAFETY_NETS[0]) winAmount = PRIZE_LADDER[SAFETY_NETS[0]];

        if (winAmount > 0) {
            await payout(winAmount);
        }
    };

    const handleCashout = async () => {
        setStatus('CASHOUT');
        await payout(currentPrize);
    };

    const payout = async (amount: number) => {
        if (amount <= 0) return;
        await processHotseatTransaction(amount);
        refreshProfile();
    };

    // --- LIFELINES ---

    const useFiftyFifty = () => {
        if (lifelines.fiftyFifty) return;
        const correct = currentQuestion.answerIdx;
        const wrongs = [0, 1, 2, 3].filter(i => i !== correct);
        const toHide = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
        setHiddenOptions(toHide);
        setLifelines(prev => ({ ...prev, fiftyFifty: true }));
    };

    const useAddTime = () => {
        if (lifelines.addTime) return;
        setTimeLeft(prev => prev + 30); 
        setLifelines(prev => ({ ...prev, addTime: true }));
    };

    const useSwap = async () => {
        if (lifelines.swap) return;
        setLifelines(prev => ({ ...prev, swap: true }));
        
        // Visual indicator of swap
        const tempQ = { ...currentQuestion, text: "REROUTING NEURAL NET...", options: ["...", "...", "...", "..."] };
        const oldQs = [...questions];
        oldQs[qIndex] = tempQ as Question;
        setQuestions(oldQs);

        // Fetch replacement
        const replacement = await fetchGameQuestions();
        const newQs = [...questions];
        newQs[qIndex] = replacement[0]; // Take first from new batch
        setQuestions(newQs);
        setTimeLeft(30);
    };

    // --- RENDER HELPERS ---
    const getButtonColor = (idx: number) => {
        if (selectedAnswer === null) return 'bg-zinc-900/60 border-zinc-700 hover:border-[#DFFF00] hover:bg-zinc-800 hover:shadow-[0_0_15px_rgba(223,255,0,0.2)]';
        
        if (idx === currentQuestion.answerIdx) return 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_30px_rgba(223,255,0,0.5)] scale-105 z-10'; // Correct
        
        if (idx === selectedAnswer) return 'bg-red-600 text-white border-red-600 animate-pulse'; // Wrong selection
        
        return 'bg-zinc-950 border-zinc-800 opacity-30 blur-[1px]'; // Others
    };

    return (
        // FIX: Changed 'h-screen' to 'min-h-screen' to prevent content clipping on mobile
        <main className={`min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black overflow-x-hidden relative ${gameStateClass} transition-colors duration-500`}>
            <div className="bg-grid-pattern opacity-20 absolute inset-0 fixed" />
            <Scanlines />
            
            {/* --- HEADER --- */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-40">
                {/* CUSTOM ABORT BUTTON */}
                <Link 
                    href="/play" 
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-700 rounded-full text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg"
                >
                    <LogOut size={14} /> <span className="hidden sm:inline">Abort Sequence</span><span className="sm:hidden">Exit</span>
                </Link>

                <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-full border border-zinc-800 shadow-xl">
                    <Coins size={14} className="text-[#DFFF00]" />
                    <span className="font-mono font-bold text-sm text-[#DFFF00]">{profile?.credits.toLocaleString() || 0}</span>
                </div>
            </div>

            {/* --- INTRO SCREEN --- */}
            {status === 'INTRO' && (
                <div className="relative z-30 flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in zoom-in-95 duration-700">
                    <div className="mb-12 relative group">
                        <div className="absolute inset-0 bg-[#DFFF00] blur-[120px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />
                        <div className="relative border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-12 rounded-3xl shadow-2xl">
                            <Flame size={64} className="text-[#DFFF00] mx-auto mb-6 animate-pulse" />
                            <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter italic mb-2 text-white">
                                Hotseat
                            </h1>
                            <div className="flex items-center justify-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">
                                <Terminal size={12} />
                                Neural Trivia Network
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm w-full">
                         <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col items-center">
                            <span className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Entry Fee</span>
                            <span className="text-2xl font-black text-white">{ENTRY_FEE}</span>
                         </div>
                         <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col items-center">
                            <span className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Jackpot</span>
                            <span className="text-2xl font-black text-[#DFFF00]">5,000</span>
                         </div>
                    </div>

                    <button 
                        onClick={startGame}
                        className="group relative px-10 py-5 bg-[#DFFF00] text-black font-black uppercase tracking-widest text-lg rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(223,255,0,0.4)] hover:shadow-[0_0_60px_rgba(223,255,0,0.6)]"
                    >
                        <span className="flex items-center gap-2">
                            Initialize <Zap size={20} className="fill-black" />
                        </span>
                    </button>
                </div>
            )}

            {/* --- LOADING SCREEN --- */}
            {status === 'LOADING' && (
                <div className="relative z-30 h-screen flex flex-col items-center justify-center font-mono text-[#DFFF00]">
                    <div className="mb-4 animate-spin"><RefreshCw size={48} /></div>
                    <TypewriterText text="ESTABLISHING SECURE CONNECTION..." speed={50} />
                    <div className="text-xs text-zinc-500 mt-2">DOWNLOADING QUESTION PACKETS</div>
                </div>
            )}

            {/* --- GAMEPLAY SCREEN --- */}
            {status === 'PLAYING' && (
                // FIX: Added 'pb-20' to account for mobile scrolling and spacing
                <div className="relative z-30 grid grid-cols-1 lg:grid-cols-12 min-h-screen pt-20 pb-20 px-4 lg:px-12 gap-6 w-full max-w-[1600px] mx-auto">
                    
                    {/* LEFT COLUMN: GAME BOARD */}
                    <div className="lg:col-span-9 flex flex-col h-full mx-auto w-full">
                        
                        {/* HUD */}
                        <div className="flex items-end justify-between mb-8">
                            <div className="flex items-center gap-6">
                                {/* Timer */}
                                <div className="relative w-16 h-16 md:w-20 md:h-20">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="50%" cy="50%" r="45%" stroke="#333" strokeWidth="4" fill="none" />
                                        <circle 
                                            cx="50%" cy="50%" r="45%" stroke={timeLeft < 10 ? '#ef4444' : '#DFFF00'} strokeWidth="4" fill="none" 
                                            // Approximate circumference for r=45% is ~280% of radius unit
                                            strokeDasharray="226" 
                                            strokeDashoffset={226 - (226 * timeLeft) / 30}
                                            className="transition-all duration-1000 ease-linear"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-xl md:text-2xl">
                                        {timeLeft}
                                    </div>
                                </div>
                                
                                {/* Prize Info */}
                                <div>
                                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Current Value</div>
                                    <div className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-2">
                                        {currentPrize.toLocaleString()} <span className="text-sm text-zinc-600 font-normal">ZINC</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleCashout} className="group flex flex-col items-center text-zinc-500 hover:text-white transition-colors">
                                <ShieldCheck size={20} className="mb-1 group-hover:text-[#DFFF00]" />
                                <span className="text-[9px] uppercase tracking-widest font-bold">Secure Funds</span>
                            </button>
                        </div>

                        {/* QUESTION CARD */}
                        <div className="flex-1 flex flex-col justify-center mb-8">
                            <div className="bg-zinc-900/80 border border-zinc-700 p-6 lg:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden backdrop-blur-xl min-h-[160px] md:min-h-[200px] flex flex-col justify-center">
                                {/* Decorative elements */}
                                <div className="absolute top-4 left-6 flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                </div>
                                <div className="absolute top-4 right-6 text-[10px] font-mono text-zinc-500 uppercase">
                                    Sector: {currentQuestion.category}
                                </div>

                                {/* FIX: Responsive text size for questions */}
                                <h2 className="text-lg md:text-3xl font-bold text-center leading-snug font-mono mt-4">
                                    <TypewriterText key={currentQuestion.id} text={currentQuestion.text} speed={30} />
                                </h2>
                            </div>
                        </div>

                        {/* ANSWERS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
                            {currentQuestion.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => !hiddenOptions.includes(i) && handleAnswer(i)}
                                    disabled={selectedAnswer !== null || hiddenOptions.includes(i)}
                                    className={`
                                        relative p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200
                                        flex items-center gap-4 group overflow-hidden active:scale-95
                                        ${hiddenOptions.includes(i) ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                                        ${getButtonColor(i)}
                                    `}
                                >
                                    <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center font-mono font-bold text-zinc-500 group-hover:text-white transition-colors shrink-0">
                                        {['A', 'B', 'C', 'D'][i]}
                                    </div>
                                    {/* FIX: Smaller text on mobile for answers */}
                                    <span className="font-bold text-xs md:text-lg">{opt}</span>
                                </button>
                            ))}
                        </div>

                        {/* MOBILE LIFELINES */}
                        <div className="lg:hidden grid grid-cols-3 gap-3">
                            <LifelineBtn icon={ShieldAlert} label="50:50" used={lifelines.fiftyFifty} onClick={useFiftyFifty} disabled={selectedAnswer !== null} />
                            <LifelineBtn icon={Flame} label="Time+" used={lifelines.addTime} onClick={useAddTime} disabled={selectedAnswer !== null} />
                            <LifelineBtn icon={RefreshCw} label="Swap" used={lifelines.swap} onClick={useSwap} disabled={selectedAnswer !== null} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LADDER (Desktop) */}
                    <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 h-full pl-6 border-l border-zinc-800/50">
                        <div className="grid grid-cols-3 gap-2">
                            <LifelineBtn icon={ShieldAlert} label="Hack" used={lifelines.fiftyFifty} onClick={useFiftyFifty} disabled={selectedAnswer !== null} />
                            <LifelineBtn icon={Flame} label="Dilate" used={lifelines.addTime} onClick={useAddTime} disabled={selectedAnswer !== null} />
                            <LifelineBtn icon={RefreshCw} label="Reroute" used={lifelines.swap} onClick={useSwap} disabled={selectedAnswer !== null} />
                        </div>

                        <div className="flex-1 bg-black/40 rounded-2xl border border-zinc-800 p-4 flex flex-col-reverse justify-end gap-0.5 overflow-hidden">
                            {PRIZE_LADDER.map((amount, i) => (
                                <LadderItem 
                                    key={i} 
                                    index={i} 
                                    amount={amount} 
                                    current={i === qIndex} 
                                    safe={SAFETY_NETS.includes(i) || i === 14} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- RESULTS OVERLAY --- */}
            {(status === 'VICTORY' || status === 'GAME_OVER' || status === 'CASHOUT') && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 overflow-y-auto">
                    
                    <div className="mb-8 relative">
                        <div className={`absolute inset-0 blur-[80px] opacity-20 ${status === 'GAME_OVER' ? 'bg-red-500' : 'bg-[#DFFF00]'}`} />
                        {status === 'VICTORY' && <Trophy size={100} className="text-[#DFFF00] animate-bounce relative z-10" />}
                        {status === 'GAME_OVER' && <AlertTriangle size={100} className="text-red-500 relative z-10" />}
                        {status === 'CASHOUT' && <ShieldCheck size={100} className="text-blue-400 relative z-10" />}
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black uppercase mb-2 tracking-tighter text-white">
                        {status === 'VICTORY' ? 'System Conquered' : status === 'GAME_OVER' ? 'Connection Lost' : 'Funds Secured'}
                    </h2>
                    
                    <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl mb-10 min-w-[320px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="text-zinc-500 font-mono uppercase text-xs tracking-[0.2em] mb-4">Total Payout</div>
                        <div className="text-5xl md:text-6xl font-black text-white flex items-center justify-center gap-4">
                            <Coins size={40} className={status === 'GAME_OVER' ? 'text-zinc-700' : 'text-[#DFFF00]'} />
                            {status === 'CASHOUT' ? currentPrize.toLocaleString() : 
                             status === 'VICTORY' ? PRIZE_LADDER[14].toLocaleString() : 
                             (qIndex > SAFETY_NETS[1] ? PRIZE_LADDER[SAFETY_NETS[1]] : qIndex > SAFETY_NETS[0] ? PRIZE_LADDER[SAFETY_NETS[0]] : 0).toLocaleString()}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                        <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-[#DFFF00] text-black font-black uppercase rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(223,255,0,0.3)]">
                            Reboot System
                        </button>
                        <Link href="/play" className="flex-1 flex items-center justify-center py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold uppercase rounded-xl">
                            Exit to Lobby
                        </Link>
                    </div>
                </div>
            )}

        </main>
    );
}