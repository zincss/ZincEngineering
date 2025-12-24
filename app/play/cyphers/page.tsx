'use client';

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { getDailyWords, checkGuess, LetterStatus, WORDS_4, WORDS_5, WORDS_6 } from './lib';
import { 
    Brain, 
    Delete, 
    HelpCircle, 
    Trophy,
    ArrowLeft,
    XCircle,
    Loader2,
    Clock,
    Lock,
    ShieldCheck,
    Share2,
    Check,
    Cpu,
    Unlock,
    Timer
} from 'lucide-react';
import Link from 'next/link';

// --- CONFIG ---
const MAX_GUESSES = 6;
const REWARD_AMOUNT = 300;

// --- TYPES ---
type GameLevel = 4 | 5 | 6;
type GameState = 'PLAYING' | 'TRANSITION' | 'MEMORY_PHASE' | 'WON_DAILY' | 'LOST';

interface DailyProgress {
    dayId: number;
    currentLevel: GameLevel;
    guesses: string[];
    history: string[]; 
    isDailyComplete: boolean;
    gameState?: GameState;
    startTime: number;
    completionTime?: number;
}

// --- SUB-COMPONENTS ---

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); 
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

const GameRow = memo(({ 
    guess, 
    target, 
    level, 
    isCurrentRow, 
    isRevealed, 
    shake 
}: { 
    guess: string, 
    target: string, 
    level: number, 
    isCurrentRow: boolean, 
    isRevealed: boolean, 
    shake: boolean 
}) => {
    const colors = isRevealed ? checkGuess(guess, target) : [];

    return (
        <div 
            className={`grid gap-1 md:gap-2 ${isCurrentRow && shake ? 'animate-shake' : ''}`} 
            style={{ gridTemplateColumns: `repeat(${level}, 1fr)` }}
        >
            {Array.from({ length: level }).map((_, colIndex) => {
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
                    <div 
                        key={colIndex}
                        className={`
                            aspect-square border-2 rounded-md md:rounded-lg flex items-center justify-center 
                            text-2xl md:text-3xl font-black uppercase select-none 
                            ${borderClass} ${textClass} ${revealClass}
                            will-change-transform
                        `}
                        style={{ animationDelay: delay }}
                        data-status={statusData}
                    >
                        <div className="card-face">{letter}</div>
                    </div>
                );
            })}
        </div>
    );
}, (prev, next) => {
    return (
        prev.guess === next.guess &&
        prev.isCurrentRow === next.isCurrentRow &&
        prev.isRevealed === next.isRevealed &&
        prev.shake === next.shake &&
        prev.level === next.level &&
        prev.target === next.target
    );
});

GameRow.displayName = 'GameRow';

// --- MAIN COMPONENT ---

export default function ZincCyphers() {
    const { user, refreshProfile } = useAuth();
    const supabase = createClient();
    
    // --- STATE ---
    const [targetWords, setTargetWords] = useState<{ word4: string, word5: string, word6: string, dayId: number } | null>(null);
    const [currentLevel, setCurrentLevel] = useState<GameLevel>(4);
    
    // Memory Phase State
    const [memoryLevel, setMemoryLevel] = useState<GameLevel>(4);

    const [guesses, setGuesses] = useState<string[]>([]);
    const [history, setHistory] = useState<string[]>([]); 
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameState, setGameState] = useState<GameState>('PLAYING');
    
    // Timing State
    const [startTime, setStartTime] = useState<number>(0);
    const [finalTimeStr, setFinalTimeStr] = useState<string>('');

    // Transition State
    const [transitionData, setTransitionData] = useState<{ msg: string, sub: string } | null>(null);

    const [shakeRow, setShakeRow] = useState(false);
    const [revealedRows, setRevealedRows] = useState<number[]>([]); 
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const [showHelp, setShowHelp] = useState(false);
    const [showIntro, setShowIntro] = useState(false);
    const [processingReward, setProcessingReward] = useState(false);
    const [justCopied, setJustCopied] = useState(false);

    // --- INITIALIZATION ---
    useEffect(() => {
        const daily = getDailyWords();
        setTargetWords(daily);

        const introShown = localStorage.getItem('zinc_cyphers_intro_shown');
        if (!introShown) {
            setShowIntro(true);
        }

        const saved = localStorage.getItem('zinc_cyphers_progress');
        if (saved) {
            const progress: DailyProgress = JSON.parse(saved);
            if (progress.dayId !== daily.dayId) {
                // New Day: Reset Progress
                localStorage.removeItem('zinc_cyphers_progress');
                setStartTime(Date.now());
            } else {
                // Load Saved Progress
                setCurrentLevel(progress.currentLevel);
                setHistory(progress.history || []);
                setStartTime(progress.startTime || Date.now());
                
                if (progress.isDailyComplete) {
                    setGameState('WON_DAILY');
                    setGuesses([]);
                    if (progress.completionTime) {
                        setFinalTimeStr(formatDuration(progress.completionTime));
                    }
                } else if (progress.gameState === 'LOST') {
                     setGameState('LOST');
                     setGuesses([]);
                     if (progress.completionTime) {
                         setFinalTimeStr(formatDuration(progress.completionTime));
                     }
                } else if (progress.gameState === 'MEMORY_PHASE') {
                     setGameState('MEMORY_PHASE');
                     setMemoryLevel(4);
                     setGuesses([]);
                } else {
                    setGuesses(progress.guesses);
                    setRevealedRows(progress.guesses.map((_, i) => i));
                }
            }
        } else {
            // First time load for this day
            setStartTime(Date.now());
        }
    }, []);

    // Save progress to local storage
    useEffect(() => {
        if (!targetWords) return;
        
        const stateToSave = gameState === 'TRANSITION' ? 'PLAYING' : gameState;
        
        const progress: DailyProgress = {
            dayId: targetWords.dayId,
            currentLevel,
            guesses,
            history,
            isDailyComplete: gameState === 'WON_DAILY',
            gameState: stateToSave,
            startTime,
            // If game is over, calculate and save the elapsed time
            completionTime: (gameState === 'WON_DAILY' || gameState === 'LOST') 
                ? (Date.now() - startTime) 
                : undefined
        };
        localStorage.setItem('zinc_cyphers_progress', JSON.stringify(progress));
    }, [guesses, currentLevel, gameState, targetWords, history, startTime]);

    const handleCloseIntro = () => {
        setShowIntro(false);
        localStorage.setItem('zinc_cyphers_intro_shown', 'true');
    };

    // --- HELPERS ---
    const formatDuration = (ms: number) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / 1000 / 60));
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getTargetWord = (level: GameLevel, words: any) => {
        if (level === 4) return words.word4;
        if (level === 5) return words.word5;
        return words.word6;
    };

    const getCurrentTarget = () => {
        if (!targetWords) return '';
        if (gameState === 'MEMORY_PHASE') {
            return getTargetWord(memoryLevel, targetWords);
        }
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

    // --- SHARE FUNCTIONALITY ---
    const generateEmojiGrid = (lvlGuesses: string[], lvlTarget: string) => {
        return lvlGuesses.map(g => {
            const status = checkGuess(g, lvlTarget);
            return status.map(s => {
                if (s === 'CORRECT') return '🟩';
                if (s === 'PRESENT') return '🟨';
                return '⬛';
            }).join('');
        }).join('\n');
    };

    const handleShare = async () => {
        if (!targetWords) return;
        
        let shareText = `Zinc Cyphers II #${targetWords.dayId}\n`;
        if (finalTimeStr) shareText += `Time: ${finalTimeStr}\n\n`;
        else shareText += `\n`;

        // Add history
        if (history.length > 0) {
            shareText += history.join('\n\n');
        }

        // Add final status
        if (gameState === 'WON_DAILY') {
            shareText += `\n\nProtocol Secured 🛡️`;
        } else if (gameState === 'LOST') {
            shareText += `\n\nProtocol Failed 💀`;
        }

        try {
            await navigator.clipboard.writeText(shareText);
            setJustCopied(true);
            showStatus("RESULTS COPIED");
            setTimeout(() => setJustCopied(false), 2000);
        } catch (err) {
            showStatus("COPY FAILED");
        }
    };

    // --- INPUT HANDLING ---
    const handleKey = useCallback((key: string) => {
        if ((gameState !== 'PLAYING' && gameState !== 'MEMORY_PHASE') || !targetWords || isValidating) return;

        if (key === 'ENTER') {
            if (gameState === 'MEMORY_PHASE') {
                submitMemoryGuess();
            } else {
                submitGuess();
            }
        } else if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < (gameState === 'MEMORY_PHASE' ? memoryLevel : currentLevel) && /^[A-Z]$/.test(key)) {
            setCurrentGuess(prev => prev + key);
        }
    }, [currentGuess, currentLevel, memoryLevel, gameState, targetWords, isValidating]);

    // --- MEMORY PHASE LOGIC ---
    const submitMemoryGuess = () => {
        const target = getTargetWord(memoryLevel, targetWords);
        
        if (currentGuess !== target) {
            // CRITICAL FAILURE - SUDDEN DEATH
            setShakeRow(true);
            showStatus("MEMORY MISMATCH");
            setTimeout(() => {
                setShakeRow(false);
                setHistory(prev => [...prev, `Memory Check Failed 🧠💀`]);
                handleLoss([], true); // True indicates memory failure
            }, 600);
            return;
        }

        // Correct Guess
        setCurrentGuess('');
        if (memoryLevel === 4) {
            setMemoryLevel(5);
            showStatus("4-CHAR VERIFIED");
        } else if (memoryLevel === 5) {
            setMemoryLevel(6);
            showStatus("5-CHAR VERIFIED");
        } else {
            handleDailyWin();
        }
    };

    // --- STANDARD GAME LOGIC ---
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
            setTimeout(() => handleLevelWin(newGuesses), 2000);
        } else if (newGuesses.length >= MAX_GUESSES) {
            setTimeout(() => handleLoss(newGuesses), 1500);
        }
    };

    const handleLevelWin = async (winningGuesses: string[]) => {
        // Record history
        const grid = generateEmojiGrid(winningGuesses, getCurrentTarget());
        const entry = `Lv.${currentLevel} ${winningGuesses.length}/${MAX_GUESSES}\n${grid}`;
        setHistory(prev => [...prev, entry]);

        // Trigger Transition Animation
        if (currentLevel === 4) {
            triggerTransition(5, "Sequence 1/3 Complete", "Initializing Level 5...");
        } else if (currentLevel === 5) {
            triggerTransition(6, "Sequence 2/3 Complete", "Initializing Level 6...");
        } else {
            // Transition to Memory Phase
            triggerTransition('MEMORY', "All Sequences Cracked", "Entering Security Verification...");
        }
    };

    const triggerTransition = (nextStage: number | 'MEMORY', title: string, sub: string) => {
        setGameState('TRANSITION');
        setTransitionData({ msg: title, sub });

        setTimeout(() => {
            setGuesses([]);
            setRevealedRows([]);
            setTransitionData(null);

            if (nextStage === 'MEMORY') {
                setGameState('MEMORY_PHASE');
                setMemoryLevel(4);
            } else {
                setCurrentLevel(nextStage as GameLevel);
                setGameState('PLAYING');
            }
        }, 3000); // 3 Second transition
    };

    const handleLoss = (finalGuesses: string[], isMemoryFail = false) => {
        if (!isMemoryFail) {
            const grid = generateEmojiGrid(finalGuesses, getCurrentTarget());
            const entry = `Lv.${currentLevel} X/${MAX_GUESSES}\n${grid}`;
            setHistory(prev => [...prev, entry]);
        }
        
        setFinalTimeStr(formatDuration(Date.now() - startTime));
        setGameState('LOST');
    };

    const handleDailyWin = async () => {
        setFinalTimeStr(formatDuration(Date.now() - startTime));
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
        if (!targetWords || gameState === 'MEMORY_PHASE' || gameState === 'TRANSITION') return 'DEFAULT';
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
                            <span className={gameState === 'MEMORY_PHASE' || currentLevel >= 4 ? "text-[#DFFF00]" : ""}>Lv.4</span>
                            <span>•</span>
                            <span className={gameState === 'MEMORY_PHASE' || currentLevel >= 5 ? "text-[#DFFF00]" : ""}>Lv.5</span>
                            <span>•</span>
                            <span className={gameState === 'MEMORY_PHASE' || currentLevel >= 6 ? "text-[#DFFF00]" : ""}>Lv.6</span>
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
                    {justCopied ? <Check size={14} className="text-green-600"/> : <XCircle size={14} className="text-red-500" />}
                    {statusMessage}
                </div>
            </div>

            {/* GAME AREA */}
            <div className="flex-1 flex flex-col items-center justify-start pt-4 md:pt-8 pb-4 px-4 w-full max-w-lg mx-auto relative overflow-y-auto">
                {gameState === 'WON_DAILY' ? (
                    <div className="flex flex-col items-center justify-center flex-1 animate-in zoom-in duration-500 w-full">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-[#DFFF00] blur-[40px] opacity-20 animate-pulse" />
                            <Trophy size={80} className="text-[#DFFF00] relative z-10" />
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Cypher Cracked</h2>
                        <p className="text-zinc-400 font-mono text-sm mb-6">Daily Protocol Complete</p>
                        
                        <div className="flex items-center gap-2 font-mono text-zinc-300 mb-8 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                            <Timer size={14} className="text-[#DFFF00]" />
                            <span className="text-sm tracking-widest">{finalTimeStr}</span>
                        </div>

                        {user && (
                            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-6 flex flex-col items-center min-w-[200px]">
                                <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1">Reward</span>
                                <span className="text-3xl font-black text-white">+{REWARD_AMOUNT} CR</span>
                            </div>
                        )}

                        <div className="flex gap-3 mb-8 w-full max-w-[280px]">
                            <button 
                                onClick={handleShare}
                                className="flex-1 bg-[#DFFF00] text-black font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-[#ccee00] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#DFFF00]/10"
                            >
                                {justCopied ? <Check size={16} /> : <Share2 size={16} />}
                                Share Protocol
                            </button>
                        </div>

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
                    <div className="flex flex-col items-center justify-center flex-1 animate-in zoom-in duration-500 w-full">
                        <div className="text-6xl mb-6 grayscale">💀</div>
                        <h2 className="text-3xl font-black uppercase text-red-500 mb-2">Protocol Failed</h2>
                        
                        <div className="flex items-center gap-2 font-mono text-zinc-300 mb-6 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                            <Timer size={14} className="text-red-500" />
                            <span className="text-sm tracking-widest">{finalTimeStr}</span>
                        </div>

                        <div className="flex flex-col gap-2 mb-8 w-full max-w-[280px] bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <div className="text-xs font-mono text-zinc-500 uppercase text-center mb-2 tracking-widest">Decrypted Sequence</div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-zinc-600 text-[10px] font-bold uppercase">Lvl 4</span>
                                <span className="text-[#DFFF00] font-bold tracking-[0.2em]">{targetWords.word4}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-zinc-600 text-[10px] font-bold uppercase">Lvl 5</span>
                                <span className="text-[#DFFF00] font-bold tracking-[0.2em]">{targetWords.word5}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-zinc-600 text-[10px] font-bold uppercase">Lvl 6</span>
                                <span className="text-[#DFFF00] font-bold tracking-[0.2em]">{targetWords.word6}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-8 w-full max-w-[280px]">
                            <button 
                                onClick={handleShare}
                                className="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {justCopied ? <Check size={16} /> : <Share2 size={16} />}
                                Share Failure
                            </button>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4 font-mono text-center min-w-[200px] border border-zinc-700">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase mb-1">
                                <Clock size={12} /> Next Cypher In
                            </div>
                            <div className="text-xl text-white">
                                <CountdownTimer />
                            </div>
                        </div>
                    </div>
                ) : gameState === 'TRANSITION' ? (
                    <div className="flex flex-col items-center justify-center flex-1 w-full animate-in fade-in duration-300">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-[#DFFF00] blur-xl opacity-20 animate-pulse" />
                            <Unlock size={48} className="text-[#DFFF00] animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2 text-center">{transitionData?.msg}</h2>
                        <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-xs uppercase tracking-widest">
                            <Loader2 size={12} className="animate-spin" />
                            {transitionData?.sub}
                        </div>
                    </div>
                ) : gameState === 'MEMORY_PHASE' ? (
                    <div className="flex flex-col items-center justify-center flex-1 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 text-center">
                            <div className="relative inline-block">
                                <ShieldCheck size={48} className="text-[#DFFF00] mx-auto mb-4 relative z-10" />
                                <div className="absolute inset-0 bg-[#DFFF00] blur-xl opacity-30 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Security Verification</h2>
                            <p className="text-red-400 font-bold text-xs md:text-sm max-w-xs mx-auto animate-pulse">
                                WARNING: 1 ATTEMPT ONLY.
                            </p>
                            <p className="text-zinc-500 text-xs mt-1">
                                Re-enter <span className="text-white">{memoryLevel}-char</span> cypher to proceed.
                            </p>
                        </div>
                        
                        <div className="mb-12">
                             <div 
                                className={`flex gap-2 ${shakeRow ? 'animate-shake' : ''}`} 
                            >
                                {Array.from({ length: memoryLevel }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`
                                            w-12 h-14 md:w-16 md:h-20 border-2 rounded-lg flex items-center justify-center 
                                            text-3xl font-black uppercase transition-colors
                                            ${currentGuess[i] ? 'border-[#DFFF00] bg-zinc-900 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-700'}
                                        `}
                                    >
                                        {currentGuess[i] || ''}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 justify-center mb-8">
                            <div className={`h-2 w-12 rounded-full transition-colors ${memoryLevel >= 4 ? 'bg-[#DFFF00]' : 'bg-zinc-800'}`} />
                            <div className={`h-2 w-12 rounded-full transition-colors ${memoryLevel >= 5 ? 'bg-[#DFFF00]' : 'bg-zinc-800'}`} />
                            <div className={`h-2 w-12 rounded-full transition-colors ${memoryLevel >= 6 ? 'bg-[#DFFF00]' : 'bg-zinc-800'}`} />
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-1.5 md:gap-2 mb-4 w-full max-w-[320px] md:max-w-[350px]" style={{ gridTemplateRows: `repeat(${MAX_GUESSES}, minmax(0, 1fr))` }}>
                        {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
                            const isCurrentRow = rowIndex === guesses.length;
                            const rowGuess = guesses[rowIndex] || (isCurrentRow ? currentGuess : '');
                            const isRevealed = revealedRows.includes(rowIndex);
                            
                            return (
                                <GameRow 
                                    key={rowIndex}
                                    guess={rowGuess}
                                    target={getCurrentTarget()}
                                    level={currentLevel}
                                    isCurrentRow={isCurrentRow}
                                    isRevealed={isRevealed}
                                    shake={isCurrentRow && shakeRow}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {(gameState === 'PLAYING' || gameState === 'MEMORY_PHASE') && (
                <div className="w-full max-w-2xl mx-auto p-1.5 pb-6 md:pb-8 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800">
                    <div className="flex flex-col gap-1.5 w-full">
                        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, i) => (
                            <div key={i} className="flex justify-center gap-1 md:gap-1.5 w-full">
                                {i === 2 && (
                                    <button onClick={() => handleKey('ENTER')} className="h-14 px-2 md:px-4 bg-zinc-800 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors flex items-center justify-center flex-grow-[1.5]">ENT</button>
                                )}
                                {row.split('').map(char => {
                                    const status = getKeyStatus(char);
                                    let bg = 'bg-zinc-800 text-white';
                                    if (status === 'CORRECT') bg = 'bg-[#DFFF00] text-black border-black';
                                    if (status === 'PRESENT') bg = 'bg-yellow-600 text-white border-transparent';
                                    if (status === 'ABSENT') bg = 'bg-zinc-900 text-zinc-600 border-transparent';
                                    return (
                                        <button key={char} onClick={() => handleKey(char)} className={`${bg} h-14 flex-1 rounded font-bold transition-all active:scale-90 active:bg-zinc-200 active:text-black touch-manipulation`}>{char}</button>
                                    );
                                })}
                                {i === 2 && (
                                    <button onClick={() => handleKey('BACKSPACE')} className="h-14 px-2 md:px-4 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors flex items-center justify-center flex-grow-[1.5]"><Delete size={18} /></button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showIntro && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={handleCloseIntro}>
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DFFF00] to-transparent opacity-50" />
                        
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-[#DFFF00] border border-zinc-700">
                                <Cpu size={32} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Cyphers II</h3>
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1">Daily Security Protocol</p>
                        </div>

                        <div className="space-y-4 text-sm text-zinc-400 mb-8">
                            <div className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-zinc-800 text-[#DFFF00] font-bold flex-shrink-0 flex items-center justify-center text-xs border border-zinc-700">1</span>
                                <p>Hack the <strong className="text-white">4, 5, and 6</strong> letter passwords.</p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-zinc-800 text-[#DFFF00] font-bold flex-shrink-0 flex items-center justify-center text-xs border border-zinc-700">2</span>
                                <p>Memorize them. You must <strong className="text-white">re-enter them blindly</strong> at the end.</p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-red-900 text-red-100 font-bold flex-shrink-0 flex items-center justify-center text-xs border border-red-800">!</span>
                                <p className="text-red-300">Final verification is <strong className="text-white">Sudden Death</strong>. One mistake, and you fail.</p>
                            </div>
                        </div>

                        <button onClick={handleCloseIntro} className="w-full bg-[#DFFF00] text-black font-black py-4 rounded-xl uppercase text-sm tracking-widest hover:bg-[#ccee00] transition-transform active:scale-95 shadow-lg shadow-[#DFFF00]/10">
                            Initialize System
                        </button>
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
                        <button onClick={() => setShowHelp(false)} className="w-full bg-white text-black font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-[#DFFF00] transition-colors">Resume</button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
                .animate-shake { animation: shake 0.4s ease-in-out; }
                
                @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
                .animate-pop { animation: pop 0.1s ease-out forwards; }
                
                .reveal-card { animation: flip-reveal 0.6s ease-in-out forwards; backface-visibility: hidden; }
                
                @keyframes flip-reveal { 0% { transform: rotateX(0); background-color: transparent; border-color: #27272a; } 49% { background-color: transparent; border-color: #27272a; } 50% { transform: rotateX(90deg); } 100% { transform: rotateX(0); } }
                
                .reveal-card[data-status='CORRECT'] { animation-name: flip-green; }
                .reveal-card[data-status='PRESENT'] { animation-name: flip-yellow; }
                .reveal-card[data-status='ABSENT'] { animation-name: flip-gray; }
                
                @keyframes flip-green { 0% { transform: rotateX(0); background-color: #18181b; } 50% { transform: rotateX(90deg); background-color: #18181b; } 51% { background-color: #DFFF00; border-color: #DFFF00; color: black; } 100% { transform: rotateX(0); background-color: #DFFF00; border-color: #DFFF00; color: black; } }
                @keyframes flip-yellow { 0% { transform: rotateX(0); background-color: #18181b; } 50% { transform: rotateX(90deg); background-color: #18181b; } 51% { background-color: #ca8a04; border-color: #ca8a04; } 100% { transform: rotateX(0); background-color: #ca8a04; border-color: #ca8a04; } }
                @keyframes flip-gray { 0% { transform: rotateX(0); background-color: #18181b; } 50% { transform: rotateX(90deg); background-color: #18181b; } 51% { background-color: #27272a; border-color: #27272a; color: #71717a; } 100% { transform: rotateX(0); background-color: #27272a; border-color: #27272a; color: #71717a; } }

                .will-change-transform {
                    will-change: transform;
                    backface-visibility: hidden;
                }
            `}</style>
        </main>
    );
}