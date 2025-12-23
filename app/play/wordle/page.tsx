'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { getDailyWords, checkGuess, LetterStatus, WORDS_4, WORDS_5, WORDS_6 } from './lib';
import { 
    Brain, 
    Delete, 
    HelpCircle, 
    Trophy,
    ArrowLeft,
    RotateCcw,
    XCircle,
    Loader2,
    Clock
} from 'lucide-react';
import Link from 'next/link';

// --- CONFIG ---
const MAX_GUESSES = 6;
const REWARD_AMOUNT = 300;

// --- TYPES ---
type GameLevel = 4 | 5 | 6;
type GameState = 'PLAYING' | 'WON_LEVEL' | 'WON_DAILY' | 'LOST';

interface DailyProgress {
    dayId: number;
    currentLevel: GameLevel;
    guesses: string[];
    isDailyComplete: boolean;
}

// --- COUNTDOWN COMPONENT ---
const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); // Set to next midnight
            const diff = tomorrow.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('00:00:00');
            } else {
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / (1000 * 60)) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeLeft(
                    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
                );
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    return <span className="font-mono">{timeLeft}</span>;
};

export default function ZincCyphers() {
    const { user, refreshProfile } = useAuth();
    const supabase = createClient();
    
    // --- STATE ---
    const [targetWords, setTargetWords] = useState<{ word4: string, word5: string, word6: string, dayId: number } | null>(null);
    const [currentLevel, setCurrentLevel] = useState<GameLevel>(4);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameState, setGameState] = useState<GameState>('PLAYING');
    
    // Animation & Feedback
    const [shakeRow, setShakeRow] = useState(false);
    const [revealedRows, setRevealedRows] = useState<number[]>([]); 
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    // UI State
    const [showHelp, setShowHelp] = useState(false);
    const [processingReward, setProcessingReward] = useState(false);

    // --- INITIALIZATION ---
    useEffect(() => {
        const daily = getDailyWords();
        setTargetWords(daily);

        const saved = localStorage.getItem('zinc_cyphers_progress'); // Renamed key
        if (saved) {
            const progress: DailyProgress = JSON.parse(saved);
            if (progress.dayId !== daily.dayId) {
                localStorage.removeItem('zinc_cyphers_progress');
            } else {
                setCurrentLevel(progress.currentLevel);
                if (progress.isDailyComplete) {
                    setGameState('WON_DAILY');
                    setGuesses([]);
                } else {
                    setGuesses(progress.guesses);
                    setRevealedRows(progress.guesses.map((_, i) => i));
                    
                    const target = getTargetWord(progress.currentLevel, daily);
                    if (progress.guesses.length >= MAX_GUESSES && 
                        progress.guesses[progress.guesses.length - 1] !== target) {
                        setGameState('LOST');
                    }
                }
            }
        }
    }, []);

    useEffect(() => {
        if (!targetWords) return;
        const progress: DailyProgress = {
            dayId: targetWords.dayId,
            currentLevel,
            guesses,
            isDailyComplete: gameState === 'WON_DAILY'
        };
        localStorage.setItem('zinc_cyphers_progress', JSON.stringify(progress));
    }, [guesses, currentLevel, gameState, targetWords]);

    // --- HELPERS ---
    const getTargetWord = (level: GameLevel, words: any) => {
        if (level === 4) return words.word4;
        if (level === 5) return words.word5;
        return words.word6;
    };

    const getCurrentTarget = () => {
        if (!targetWords) return '';
        return getTargetWord(currentLevel, targetWords);
    };

    const showStatus = (msg: string) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(null), 2000);
    };

    const checkWordValidity = async (word: string, level: GameLevel): Promise<boolean> => {
        const localList = level === 4 ? WORDS_4 : level === 5 ? WORDS_5 : WORDS_6;
        if (localList.includes(word)) return true;
        if (word === getCurrentTarget()) return true;

        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (res.ok) return true;
        } catch (e) {
            console.warn("Dictionary API offline, allowing guess.");
            return true; 
        }
        return false;
    };

    // --- INPUT HANDLING ---
    const handleKey = useCallback((key: string) => {
        if (gameState !== 'PLAYING' || !targetWords || isValidating) return;

        if (key === 'ENTER') {
            submitGuess();
        } else if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < currentLevel && /^[A-Z]$/.test(key)) {
            setCurrentGuess(prev => prev + key);
        }
    }, [currentGuess, currentLevel, gameState, targetWords, isValidating]);

    const submitGuess = async () => {
        const target = getCurrentTarget();
        
        if (currentGuess.length !== currentLevel) {
            setShakeRow(true);
            showStatus("NOT ENOUGH LETTERS");
            setTimeout(() => setShakeRow(false), 500);
            return;
        }

        setIsValidating(true);
        const isValid = await checkWordValidity(currentGuess, currentLevel);
        setIsValidating(false);

        if (!isValid) {
            setShakeRow(true);
            showStatus("UNKNOWN PROTOCOL");
            setTimeout(() => {
                setShakeRow(false);
                setCurrentGuess('');
            }, 600);
            return;
        }

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess('');
        setRevealedRows(prev => [...prev, newGuesses.length - 1]);

        if (currentGuess === target) {
            setTimeout(() => handleLevelWin(), 2000);
        } else if (newGuesses.length >= MAX_GUESSES) {
            setTimeout(() => setGameState('LOST'), 1500);
        }
    };

    const handleLevelWin = async () => {
        if (currentLevel === 4) {
            setCurrentLevel(5);
            setGuesses([]);
            setRevealedRows([]);
        } else if (currentLevel === 5) {
            setCurrentLevel(6);
            setGuesses([]);
            setRevealedRows([]);
        } else {
            handleDailyWin();
        }
    };

    const handleDailyWin = async () => {
        setGameState('WON_DAILY');
        if (user) {
            setProcessingReward(true);
            try {
                const hasClaimed = localStorage.getItem(`zinc_cyphers_claimed_${targetWords?.dayId}`);
                if (!hasClaimed) {
                    const { error } = await supabase.rpc('add_credits', { amount: REWARD_AMOUNT });
                    if (!error) {
                        localStorage.setItem(`zinc_cyphers_claimed_${targetWords?.dayId}`, 'true');
                        refreshProfile();
                    }
                }
            } catch (err) {
                console.error("Reward error", err);
            } finally {
                setProcessingReward(false);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
                handleKey(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKey]);

    const getKeyStatus = (key: string): LetterStatus | 'DEFAULT' => {
        if (!targetWords) return 'DEFAULT';
        const target = getCurrentTarget();
        let bestStatus: LetterStatus | 'DEFAULT' = 'DEFAULT';
        guesses.forEach(g => {
            const gArr = g.split('');
            const tArr = target.split('');
            const idx = gArr.indexOf(key);
            if (idx > -1) {
                let currentStatus: LetterStatus = 'ABSENT';
                for(let i=0; i<gArr.length; i++) {
                    if (gArr[i] === key) {
                        if (gArr[i] === tArr[i]) {
                            currentStatus = 'CORRECT'; break; 
                        } else if (target.includes(key)) {
                            currentStatus = 'PRESENT';
                        }
                    }
                }
                if (currentStatus === 'CORRECT') bestStatus = 'CORRECT';
                else if (currentStatus === 'PRESENT' && bestStatus !== 'CORRECT') bestStatus = 'PRESENT';
                else if (currentStatus === 'ABSENT' && bestStatus === 'DEFAULT') bestStatus = 'ABSENT';
            }
        });
        return bestStatus;
    };

    if (!targetWords) return <div className="bg-zinc-950 min-h-screen" />;

    return (
        <main className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-[#DFFF00] selection:text-black touch-manipulation">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#18181b_0%,#09090b_60%)] -z-10" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10 pointer-events-none" />

            {/* HEADER */}
            <header className="px-4 py-3 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link href="/play" className="p-2 -ml-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                            Cyphers <span className="text-[#DFFF00]">II</span>
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            <span className={currentLevel >= 4 ? "text-[#DFFF00]" : ""}>Lv.4</span>
                            <span>•</span>
                            <span className={currentLevel >= 5 ? "text-[#DFFF00]" : ""}>Lv.5</span>
                            <span>•</span>
                            <span className={currentLevel >= 6 ? "text-[#DFFF00]" : ""}>Lv.6</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isValidating && <Loader2 size={16} className="animate-spin text-[#DFFF00]" />}
                    <button onClick={() => setShowHelp(!showHelp)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                        <HelpCircle size={20} className="text-zinc-400" />
                    </button>
                </div>
            </header>

            {/* STATUS TOAST */}
            <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${statusMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="bg-zinc-100 text-black font-black uppercase tracking-widest text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 border border-zinc-300">
                    <XCircle size={14} className="text-red-500" />
                    {statusMessage}
                </div>
            </div>

            {/* GAME AREA */}
            <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-4 px-4 w-full max-w-lg mx-auto relative overflow-y-auto">
                {gameState === 'WON_DAILY' ? (
                    <div className="flex flex-col items-center justify-center flex-1 animate-in zoom-in duration-500">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-[#DFFF00] blur-[40px] opacity-20 animate-pulse" />
                            <Trophy size={80} className="text-[#DFFF00] relative z-10" />
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Cypher Cracked</h2>
                        <p className="text-zinc-400 font-mono text-sm mb-8">Daily Protocol Complete</p>
                        {user && (
                            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8 flex flex-col items-center min-w-[200px]">
                                <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1">Reward</span>
                                <span className="text-3xl font-black text-white">+{REWARD_AMOUNT} CR</span>
                            </div>
                        )}
                        <div className="bg-zinc-800/50 rounded-lg p-4 font-mono text-center min-w-[200px] border border-zinc-700">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase mb-1">
                                <Clock size={12} /> Next Cypher In
                            </div>
                            <div className="text-xl text-[#DFFF00]">
                                <CountdownTimer />
                            </div>
                        </div>
                    </div>
                ) : gameState === 'LOST' ? (
                    <div className="flex flex-col items-center justify-center flex-1 animate-in zoom-in duration-500">
                        <div className="text-6xl mb-6 grayscale">💀</div>
                        <h2 className="text-3xl font-black uppercase text-red-500 mb-2">Protocol Failed</h2>
                        <p className="text-zinc-400 mb-8">
                            Sequence was: <span className="text-white font-bold ml-1">{getCurrentTarget()}</span>
                        </p>
                        <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#DFFF00] transition-colors">
                            <RotateCcw size={16} /> Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-2 mb-4 w-full max-w-[350px]" style={{ gridTemplateRows: `repeat(${MAX_GUESSES}, minmax(0, 1fr))` }}>
                        {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
                            const isCurrentRow = rowIndex === guesses.length;
                            const guess = guesses[rowIndex] || (isCurrentRow ? currentGuess : '');
                            const isRevealed = revealedRows.includes(rowIndex);
                            const colors = guesses[rowIndex] ? checkGuess(guesses[rowIndex], getCurrentTarget()) : [];
                            return (
                                <div key={rowIndex} className={`grid gap-2 ${isCurrentRow && shakeRow ? 'animate-shake' : ''}`} style={{ gridTemplateColumns: `repeat(${currentLevel}, 1fr)` }}>
                                    {Array.from({ length: currentLevel }).map((_, colIndex) => {
                                        const letter = guess[colIndex] || '';
                                        const color = colors[colIndex];
                                        const delay = `${colIndex * 150}ms`;
                                        let borderClass = 'border-zinc-800 bg-zinc-900/50';
                                        let textClass = 'text-white';
                                        if (isCurrentRow && letter) {
                                            borderClass = 'border-zinc-600 bg-zinc-800 animate-pop';
                                        }
                                        const revealClass = isRevealed ? 'reveal-card' : '';
                                        const statusData = isRevealed ? color : 'EMPTY';
                                        return (
                                            <div key={colIndex} className={`aspect-square border-2 rounded-lg flex items-center justify-center text-2xl md:text-3xl font-black uppercase select-none ${borderClass} ${textClass} ${revealClass}`} style={{ animationDelay: delay }} data-status={statusData}>
                                                <div className="card-face">{letter}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {gameState === 'PLAYING' && (
                <div className="w-full max-w-2xl mx-auto p-2 pb-6 md:pb-8 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800">
                    <div className="flex flex-col gap-2 w-full">
                        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, i) => (
                            <div key={i} className="flex justify-center gap-1.5 w-full">
                                {i === 2 && (
                                    <button onClick={() => handleKey('ENTER')} className="h-12 px-2 md:px-4 bg-zinc-800 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors flex items-center justify-center flex-grow-[1.5]">ENT</button>
                                )}
                                {row.split('').map(char => {
                                    const status = getKeyStatus(char);
                                    let bg = 'bg-zinc-800 text-white';
                                    if (status === 'CORRECT') bg = 'bg-[#DFFF00] text-black border-black';
                                    if (status === 'PRESENT') bg = 'bg-yellow-600 text-white border-transparent';
                                    if (status === 'ABSENT') bg = 'bg-zinc-900 text-zinc-600 border-transparent';
                                    return (
                                        <button key={char} onClick={() => handleKey(char)} className={`${bg} h-12 flex-1 rounded font-bold transition-all active:scale-90 active:bg-zinc-200 active:text-black touch-manipulation`}>{char}</button>
                                    );
                                })}
                                {i === 2 && (
                                    <button onClick={() => handleKey('BACKSPACE')} className="h-12 px-2 md:px-4 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors flex items-center justify-center flex-grow-[1.5]"><Delete size={18} /></button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showHelp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4 text-[#DFFF00]">
                            <Brain size={24} />
                            <h3 className="text-xl font-black uppercase">Cyphers Protocol</h3>
                        </div>
                        <ul className="space-y-4 text-sm text-zinc-400 font-mono mb-6">
                            <li className="flex gap-3"><span className="w-6 h-6 rounded bg-[#DFFF00] text-black font-bold flex items-center justify-center text-xs">A</span><span><strong className="text-white">Correct.</strong> Letter is in the correct position.</span></li>
                            <li className="flex gap-3"><span className="w-6 h-6 rounded bg-yellow-600 text-white font-bold flex items-center justify-center text-xs">B</span><span><strong className="text-white">Present.</strong> Letter is in the word but wrong spot.</span></li>
                            <li className="flex gap-3"><span className="w-6 h-6 rounded bg-zinc-800 text-zinc-500 font-bold flex items-center justify-center text-xs">C</span><span><strong className="text-white">Absent.</strong> Letter is not in the word.</span></li>
                        </ul>
                        <button onClick={() => setShowHelp(false)} className="w-full bg-white text-black font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-[#DFFF00] transition-colors">Initialize</button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
                .animate-shake { animation: shake 0.4s ease-in-out; }
                @keyframes pop { 0% { transform: scale(1); border-color: #52525b; } 50% { transform: scale(1.1); border-color: #DFFF00; } 100% { transform: scale(1); border-color: #52525b; } }
                .animate-pop { animation: pop 0.1s ease-out forwards; }
                .reveal-card { animation: flip-reveal 0.6s ease-in-out forwards; backface-visibility: hidden; }
                @keyframes flip-reveal { 0% { transform: rotateX(0); background-color: transparent; border-color: #27272a; } 49% { background-color: transparent; border-color: #27272a; } 50% { transform: rotateX(90deg); } 100% { transform: rotateX(0); } }
                .reveal-card[data-status='CORRECT'] { animation-name: flip-green; }
                .reveal-card[data-status='PRESENT'] { animation-name: flip-yellow; }
                .reveal-card[data-status='ABSENT'] { animation-name: flip-gray; }
                @keyframes flip-green { 0% { transform: rotateX(0); background-color: #18181b; } 50% { transform: rotateX(90deg); background-color: #18181b; } 51% { background-color: #DFFF00; border-color: #DFFF00; color: black; } 100% { transform: rotateX(0); background-color: #DFFF00; border-color: #DFFF00; color: black; } }
                @keyframes flip-yellow { 0% { transform: rotateX(0); background-color: #18181b; } 50% { transform: rotateX(90deg); background-color: #18181b; } 51% { background-color: #ca8a04; border-color: #ca8a04; } 100% { transform: rotateX(0); background-color: #ca8a04; border-color: #ca8a04; } }
                @keyframes flip-gray { 0% { transform: rotateX(0); background-color: #18181b; } 50% { transform: rotateX(90deg); background-color: #18181b; } 51% { background-color: #27272a; border-color: #27272a; color: #71717a; } 100% { transform: rotateX(0); background-color: #27272a; border-color: #27272a; color: #71717a; } }
            `}</style>
        </main>
    );
}