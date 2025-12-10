'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabaseClient'; 
import BackButton from '@/app/components/BackButton';
import { Coins, User, Trophy, Cpu, LogOut, Loader2, RefreshCw, AlertTriangle, Smartphone } from 'lucide-react';
import { createDeck, evaluateHand, getAIDecision, Card } from './poker-utils';

// --- VISUAL COMPONENTS ---

// Helper for haptics
const vibrate = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

const CardView = ({ 
    card, 
    hidden, 
    size = "md", 
    highlight = false, 
    dim = false 
}: { 
    card?: Card, 
    hidden?: boolean, 
    size?: "sm"|"md"|"lg", 
    highlight?: boolean, 
    dim?: boolean 
}) => {
    const dims = size === 'sm' 
        ? 'w-10 h-14 md:w-11 md:h-16 text-xs' 
        : size === 'md' 
        ? 'w-10 h-[60px] md:w-16 md:h-24 text-xs md:text-base'
        : 'w-20 h-28 md:w-24 md:h-36 text-xl md:text-2xl';

    if (hidden || !card) {
        return (
            <div className={`
                ${dims}
                bg-zinc-900 border border-zinc-700 rounded-lg relative shadow-lg
                bg-[repeating-linear-gradient(45deg,#18181b_0,#18181b_5px,#27272a_5px,#27272a_10px)]
                ${dim ? 'opacity-20 blur-[1px]' : 'opacity-100'}
                transition-all duration-500 flex-shrink-0
            `}>
                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-black text-[10px] md:text-xs tracking-wider">ZINC</div>
            </div>
        );
    }

    const isRed = card.suit === 'H' || card.suit === 'D';
    const suitIcon = card.suit === 'H' ? '♥' : card.suit === 'D' ? '♦' : card.suit === 'C' ? '♣' : '♠';
    const textColorClass = isRed ? 'text-red-500' : 'text-zinc-900';
    
    const borderClass = highlight 
        ? 'border-[#DFFF00] ring-2 ring-[#DFFF00]/50 z-50' 
        : (isRed ? 'border-red-200' : 'border-zinc-300');

    const effectClass = highlight 
        ? 'shadow-[0_0_20px_rgba(223,255,0,0.6)] scale-110 z-[50] opacity-100' 
        : '';

    return (
        <div className={`
            ${dims}
            bg-zinc-100 rounded-lg flex flex-col items-center justify-between p-1 shadow-xl border-2 transition-all duration-300 relative flex-shrink-0
            ${textColorClass} ${borderClass} ${effectClass}
            ${dim && !highlight ? 'opacity-20 grayscale scale-95 blur-[1px]' : ''}
            animate-in zoom-in duration-300 select-none
        `}>
            <div className="self-start font-black leading-none">{card.rank}</div>
            <div className="text-xl md:text-3xl">{suitIcon}</div>
            <div className="self-end font-black leading-none rotate-180">{card.rank}</div>
            
            {highlight && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#DFFF00] text-black text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-md z-[60] border border-black/10 animate-in slide-in-from-bottom-2">
                     WIN
                 </div>
            )}
        </div>
    );
};

const ActionBubble = ({ action, amount }: { action: string, amount?: number }) => {
    const colorClass = 
        action === 'FOLD' ? 'bg-red-600 text-white' :
        action === 'CHECK' ? 'bg-zinc-700 text-zinc-200' :
        action === 'CALL' ? 'bg-blue-600 text-white' :
        'bg-[#DFFF00] text-black'; 

    return (
        <div className={`
            absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 z-50 
            px-3 py-1 md:px-4 md:py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl
            animate-in zoom-in slide-in-from-bottom-2 duration-200
            whitespace-nowrap ${colorClass} border border-black/20
        `}>
            {action} {amount ? amount : ''}
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${colorClass} border-b border-r border-black/20`} />
        </div>
    );
};

// --- GAME CONFIG ---
const TABLES = [
    { id: 'ROOKIE', name: 'The Basement', blind: 50, buyIn: 500, difficulty: 'ROOKIE' },
    { id: 'PRO', name: 'High Rollers', blind: 200, buyIn: 2000, difficulty: 'PRO' },
    { id: 'ELITE', name: 'The Zenith', blind: 1000, buyIn: 10000, difficulty: 'ELITE' }
] as const;

type Player = {
    id: number;
    name: string;
    chips: number;
    hand: Card[];
    currentBet: number;
    folded: boolean;
    isBot: boolean;
    lastAction?: string;
    lastActionTimestamp?: number;
    status: 'WAITING' | 'THINKING' | 'ACTED';
};

export default function PokerPage() {
    const { profile, refreshProfile } = useAuth();
    
    // --- STATE ---
    const [table, setTable] = useState<typeof TABLES[number] | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [communityCards, setCommunityCards] = useState<Card[]>([]);
    const [deck, setDeck] = useState<Card[]>([]);
    const [pot, setPot] = useState(0);
    const [currentBet, setCurrentBet] = useState(0); 
    const [dealerIdx, setDealerIdx] = useState(0);
    const [turnIdx, setTurnIdx] = useState(0);
    const [phase, setPhase] = useState<'PRE-FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN'>('PRE-FLOP');
    const [gameStatus, setGameStatus] = useState<'IDLE' | 'PLAYING' | 'FINISHED' | 'BANKRUPT'>('IDLE');
    const [winnerMsg, setWinnerMsg] = useState('');
    const [winnerId, setWinnerId] = useState<number | null>(null);
    const [winningCards, setWinningCards] = useState<Card[]>([]);
    
    const [userRevealedHand, setUserRevealedHand] = useState(false);
    const [aiRevealedHand, setAiRevealedHand] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [gameLog, setGameLog] = useState<string[]>([]);

    // --- LOGIC ---
    const joinTable = (selectedTable: typeof TABLES[number]) => {
        vibrate();
        if (!profile || profile.credits < selectedTable.buyIn) {
            alert("Insufficient Funds");
            return;
        }
        setTable(selectedTable);
        setPlayers([
            { id: 0, name: profile.username, chips: selectedTable.buyIn, hand: [], currentBet: 0, folded: false, isBot: false, status: 'WAITING' },
            { id: 1, name: 'Bot Alpha', chips: selectedTable.buyIn, hand: [], currentBet: 0, folded: false, isBot: true, status: 'WAITING' },
            { id: 2, name: 'Bot Beta', chips: selectedTable.buyIn, hand: [], currentBet: 0, folded: false, isBot: true, status: 'WAITING' },
            { id: 3, name: 'Bot Gamma', chips: selectedTable.buyIn, hand: [], currentBet: 0, folded: false, isBot: true, status: 'WAITING' },
        ]);
        setGameLog([`Joined ${selectedTable.name}.`]);
    };

    const addToLog = (msg: string) => {
        setGameLog(prev => [msg, ...prev].slice(0, 3)); 
    };

    const startHand = () => {
        vibrate();
        if (!table) return;

        // 1. RESET UI STATE
        setWinnerMsg('');
        setWinnerId(null);
        setWinningCards([]);
        setUserRevealedHand(false);
        setAiRevealedHand(false);
        setGameLog([]);

        // 2. CHECK BANKRUPTCY
        const solventPlayers = players.map(p => {
            if (p.isBot && p.chips < table.blind) {
                return { ...p, chips: table.buyIn }; 
            }
            return p;
        });

        if (solventPlayers[0].chips < table.blind) {
            setPlayers(solventPlayers);
            setGameStatus('BANKRUPT'); 
            return;
        }

        // 3. START NEW HAND
        const newDeck = createDeck();
        
        const updatedPlayers: Player[] = solventPlayers.map(p => ({
            ...p,
            hand: [newDeck.pop()!, newDeck.pop()!],
            currentBet: 0,
            folded: false,
            lastAction: undefined,
            lastActionTimestamp: undefined,
            status: 'WAITING'
        }));

        const nextDealer = gameStatus === 'IDLE' ? 0 : (dealerIdx + 1) % 4;
        setDealerIdx(nextDealer);

        const sbIdx = (nextDealer + 1) % 4;
        const bbIdx = (nextDealer + 2) % 4;
        
        updatedPlayers[sbIdx].chips -= table.blind / 2;
        updatedPlayers[sbIdx].currentBet = table.blind / 2;
        updatedPlayers[sbIdx].lastAction = 'SB'; 
        
        updatedPlayers[bbIdx].chips -= table.blind;
        updatedPlayers[bbIdx].currentBet = table.blind;
        updatedPlayers[bbIdx].lastAction = 'BB';

        setDeck(newDeck);
        setPlayers(updatedPlayers);
        setCommunityCards([]);
        setPot(table.blind * 1.5);
        setCurrentBet(table.blind);
        setPhase('PRE-FLOP');
        setGameStatus('PLAYING');
        setTurnIdx((nextDealer + 3) % 4); 
        addToLog("Cards Dealt");
    };

    const handleRebuy = async () => {
        vibrate();
        if (!profile || !table) return;
        const rebuyCost = table.buyIn;

        if (profile.credits < rebuyCost) {
            alert("Not enough credits to rebuy!");
            leaveTable();
            return;
        }

        const newPlayers = [...players];
        newPlayers[0].chips += rebuyCost;
        setPlayers(newPlayers);
        setGameStatus('IDLE');
        addToLog("Rebuy successful!");
        startHand();
    };

    useEffect(() => {
        if (gameStatus !== 'PLAYING') return;

        const currentPlayer = players[turnIdx];
        if (currentPlayer.folded) {
            nextTurn();
            return;
        }

        if (currentPlayer.isBot) {
            // Randomize thinking time to feel more human (0.8s - 2.5s)
            const thinkTime = 800 + Math.random() * 1700;
            
            const timer = setTimeout(() => {
                const decision = getAIDecision(
                    table!.difficulty, 
                    currentPlayer.hand, 
                    communityCards, 
                    currentBet, 
                    currentPlayer.currentBet,
                    phase === 'PRE-FLOP',
                    table!.blind,
                    pot,                // NEW: Passed Pot
                    currentPlayer.chips // NEW: Passed Chips
                );
                handleAction(decision);
            }, thinkTime); 
            return () => clearTimeout(timer);
        }
    }, [turnIdx, gameStatus, players, communityCards, currentBet, phase, pot]);

    const handleAction = (action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE') => {
        if (!players[turnIdx].isBot) vibrate(20);
        
        const newPlayers = [...players];
        const p = newPlayers[turnIdx];
        const costToCall = currentBet - p.currentBet;
        
        let actionStr: string = action;

        if (action === 'FOLD') {
            p.folded = true;
            addToLog(`${p.name} Folds`);
        } 
        else if (action === 'CHECK') {
            if (costToCall > 0) {
                 actionStr = 'FOLD';
                 p.folded = true;
                 addToLog(`${p.name} Folds (Can't Call)`);
            } else {
                addToLog(`${p.name} Checks`);
            }
        }
        else if (action === 'CALL') {
            if (p.chips >= costToCall) {
                p.chips -= costToCall;
                p.currentBet += costToCall;
                setPot(prev => prev + costToCall);
                addToLog(`${p.name} Calls`);
            } else {
                const allIn = p.chips;
                p.chips = 0;
                p.currentBet += allIn;
                setPot(prev => prev + allIn);
                actionStr = 'ALL-IN';
                addToLog(`${p.name} All-In!`);
            }
        }
        else if (action === 'RAISE') {
            // Determine decent raise size (Min raise = 2x previous bet or 1 BB)
            const minRaise = table!.blind;
            const raiseAmt = currentBet + minRaise; 
            const totalCost = raiseAmt - p.currentBet;
            
            if (p.chips >= totalCost) {
                p.chips -= totalCost;
                p.currentBet += totalCost;
                setPot(prev => prev + totalCost);
                setCurrentBet(raiseAmt);
                addToLog(`${p.name} Raises to ${raiseAmt}`);
            } else {
                // Not enough to raise, just call/shove
                actionStr = 'CALL'; 
                const callCost = currentBet - p.currentBet;
                const actualCost = Math.min(callCost, p.chips);
                p.chips -= actualCost;
                p.currentBet += actualCost;
                setPot(prev => prev + actualCost);
                if(p.chips === 0) actionStr = 'ALL-IN';
            }
        }

        p.lastAction = actionStr;
        p.lastActionTimestamp = Date.now();
        setPlayers(newPlayers);
        
        setTimeout(() => nextTurn(), 400);
    };

    const nextTurn = () => {
        const activePlayers = players.filter(p => !p.folded);
        if (activePlayers.length === 1) {
            distributePot(activePlayers[0], 'Default');
            return;
        }

        const allMatched = activePlayers.every(p => 
            p.lastAction !== undefined && (p.currentBet === currentBet || p.chips === 0)
        );

        if (allMatched && activePlayers.filter(p => p.chips > 0).length > 0) {
            nextPhase();
        } else if (allMatched && activePlayers.every(p => p.chips === 0 || p.currentBet === currentBet)) {
             nextPhase();
        } else {
            let nextIdx = (turnIdx + 1) % 4;
            let loops = 0;
            while (players[nextIdx].folded && loops < 4) {
                nextIdx = (nextIdx + 1) % 4;
                loops++;
            }
            setTurnIdx(nextIdx);
        }
    };

    const nextPhase = () => {
        const deckCopy = [...deck];
        const resetPlayers = players.map(p => ({ 
            ...p, 
            currentBet: 0, 
            lastAction: undefined, 
            lastActionTimestamp: undefined 
        }));
        
        setPlayers(resetPlayers);
        setCurrentBet(0);
        
        let firstActor = (dealerIdx + 1) % 4;
        while (players[firstActor].folded) {
            firstActor = (firstActor + 1) % 4;
        }
        setTurnIdx(firstActor);

        if (phase === 'PRE-FLOP') {
            setPhase('FLOP');
            addToLog("Flop");
            setCommunityCards([deckCopy.pop()!, deckCopy.pop()!, deckCopy.pop()!]);
        } else if (phase === 'FLOP') {
            setPhase('TURN');
            addToLog("Turn");
            setCommunityCards([...communityCards, deckCopy.pop()!]);
        } else if (phase === 'TURN') {
            setPhase('RIVER');
            addToLog("River");
            setCommunityCards([...communityCards, deckCopy.pop()!]);
        } else if (phase === 'RIVER') {
            setPhase('SHOWDOWN');
            determineWinner();
            return;
        }
        setDeck(deckCopy);
    };

    const determineWinner = () => {
        const active = players.filter(p => !p.folded);
        let bestScore = -1;
        let winner = active[0];
        
        let winResult: { type: string; score: number; name: string; winningCards: Card[] } | null = null;

        for (const p of active) {
            const result = evaluateHand(p.hand, communityCards);
            if (result.score > bestScore) {
                bestScore = result.score;
                winner = p;
                winResult = result;
            }
        }

        if (winResult && winResult.winningCards) {
            setWinningCards(winResult.winningCards);
            distributePot(winner, winResult.name);
        } else {
             distributePot(winner, 'Win');
        }
    };

    const distributePot = async (winner: Player, handName?: string) => {
        const isDefaultWin = handName === 'Default';
        setWinnerId(winner.id);
        const winMsg = `${winner.name} wins with ${handName === 'Default' ? 'Fold Equity' : handName}`;
        setWinnerMsg(winMsg);
        addToLog(winMsg);
        
        const newPlayers = [...players];
        newPlayers[winner.id].chips += pot;
        setPlayers(newPlayers);
        setGameStatus('FINISHED');
        vibrate([50, 50, 50]);

        if (winner.isBot && isDefaultWin) {
            if (Math.random() < 0.3) {
                setTimeout(() => setAiRevealedHand(true), 500);
            }
        }
    };

    const leaveTable = async () => {
        vibrate();
        if (!table) return;
        setIsLeaving(true);
        addToLog("Saving...");

        const currentChips = players[0]?.chips || 0;
        const buyIn = table.buyIn;
        const netChange = currentChips - buyIn;

        const saveOperation = async () => {
            if (netChange !== 0 && profile) {
                try {
                    const { error } = await supabase.rpc('add_credits', { amount: netChange });
                    if (error) console.error("Save error:", error);
                    else refreshProfile();
                } catch (e) {
                    console.error("Save exception:", e);
                }
            }
        };

        const timeoutOperation = new Promise(resolve => setTimeout(resolve, 1500));
        await Promise.race([saveOperation(), timeoutOperation]);

        setTable(null);
        setIsLeaving(false);
    };

    // --- RENDER HELPERS ---
    const userPlayer = players[0];
    const isShowdown = phase === 'SHOWDOWN' || gameStatus === 'FINISHED';
    
    const isWinningCard = (card: Card) => {
        if (gameStatus !== 'FINISHED') return false;
        return winningCards.some(wc => wc.suit === card.suit && wc.rank === card.rank);
    };

    const hasWinner = winningCards.length > 0;

    // --- LOBBY VIEW ---
    if (!table) {
        return (
            <div className="min-h-[100dvh] bg-zinc-950 text-white flex flex-col items-center p-4 relative overflow-hidden">
                <BackButton href="/play" label="ARCADE HUB" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-0"/>
                
                <div className="z-10 w-full max-w-md flex flex-col items-center mt-12 mb-8">
                    <h1 className="text-5xl font-black mb-2 relative z-10 uppercase tracking-tighter text-center">Texas <span className="text-[#DFFF00]">Hold'em</span></h1>
                    <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                         <Smartphone size={14} /> Optimized for Mobile
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full max-w-md relative z-10 pb-20">
                    {TABLES.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => joinTable(t)}
                            className="group relative border border-zinc-800 bg-zinc-900/80 p-6 rounded-2xl hover:border-[#DFFF00] hover:bg-zinc-900 transition-all text-left overflow-hidden active:scale-95 duration-200"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                <Coins className="text-[#DFFF00]" size={24} />
                            </div>
                            <div className="text-[#DFFF00] font-mono text-[10px] font-bold mb-1 flex items-center gap-2 uppercase tracking-wider">
                                {t.difficulty}
                            </div>
                            <h2 className="text-2xl font-black uppercase mb-1 text-white">{t.name}</h2>
                            <div className="flex gap-4 text-xs font-mono text-zinc-400 mt-2">
                                <span>Buy-In: <span className="text-white">{t.buyIn}</span></span>
                                <span>Blinds: <span className="text-white">{t.blind/2}/{t.blind}</span></span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] text-white flex flex-col overflow-hidden touch-none">
            {/* BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#18181b_0%,#000_80%)]" />
            
            {/* TOP BAR - COMPACT */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-30 pointer-events-none">
                <div className="flex flex-col gap-0.5 pointer-events-auto bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                    <div className="text-[#DFFF00] font-black uppercase tracking-widest text-xs">{table.name}</div>
                    <div className="text-zinc-500 text-[10px] font-mono">BLINDS {table.blind/2}/{table.blind}</div>
                </div>
                
                <button 
                    onClick={leaveTable}
                    disabled={isLeaving}
                    className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-red-900 hover:text-white hover:border-red-500 transition-colors shadow-lg active:scale-90"
                >
                    {isLeaving ? <Loader2 size={14} className="animate-spin"/> : <LogOut size={14} />} 
                </button>
            </div>

            {/* MAIN GAME AREA - ADAPTIVE LAYOUT */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full overflow-hidden">
                
                {/* TABLE CONTAINER */}
                <div className="relative w-[95%] md:w-[80%] max-w-5xl max-h-[60vh] md:max-h-none transition-all duration-500
                    aspect-[3/5] md:aspect-[2/1]
                    bg-zinc-900/90 border-4 border-zinc-800 rounded-[100px] md:rounded-[150px] shadow-2xl flex items-center justify-center">
                    
                    <div className="absolute inset-2 md:inset-4 border-2 border-dashed border-zinc-700/50 rounded-[90px] md:rounded-[130px]" />
                    
                    {/* POT DISPLAY */}
                    <div className="absolute top-[28%] md:top-[15%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                         <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Pot</div>
                         <div className="flex items-center gap-1.5 bg-zinc-950/90 px-4 py-1.5 rounded-full border border-zinc-800 backdrop-blur-sm shadow-xl">
                            <Coins size={14} className="text-[#DFFF00]" />
                            <span className="font-mono font-bold text-lg text-white">{pot}</span>
                        </div>
                    </div>

                    {/* COMMUNITY CARDS */}
                    <div className={`absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 md:gap-2 ${gameStatus === 'FINISHED' && hasWinner ? 'z-[130]' : 'z-20'}`}>
                        {communityCards.map((c, i) => (
                            <CardView 
                                key={i} 
                                card={c} 
                                size="md" 
                                highlight={isWinningCard(c)} 
                                dim={gameStatus === 'FINISHED' && hasWinner && !isWinningCard(c)}
                            />
                        ))}
                        {Array.from({length: 5 - communityCards.length}).map((_, i) => (
                             <div key={i} className="w-10 h-[60px] md:w-16 md:h-24 border-2 border-dashed border-zinc-800 rounded-lg bg-black/20" />
                        ))}
                    </div>

                    {/* PLAYERS */}
                    {players.map((p, i) => {
                        const portraitPos = [
                            'bottom-24 left-1/2 -translate-x-1/2', 
                            'left-[-20px] top-1/2 -translate-y-1/2', 
                            'top-[-30px] left-1/2 -translate-x-1/2', 
                            'right-[-20px] top-1/2 -translate-y-1/2', 
                        ];
                        
                        const landscapePos = [
                            'md:bottom-[-50px] md:left-1/2 md:-translate-x-1/2 md:top-auto md:right-auto',
                            'md:left-[-30px] md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:right-auto',
                            'md:top-[-50px] md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:right-auto',
                            'md:right-[-30px] md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:left-auto',
                        ];

                        const isActive = i === turnIdx && gameStatus === 'PLAYING';
                        const isWinner = winnerId === p.id;
                        const winnerRevealed = isWinner && (p.isBot ? aiRevealedHand : userRevealedHand);
                        const revealCards = !p.isBot || (isShowdown && !p.folded) || winnerRevealed;
                        const showAction = p.lastAction && p.lastActionTimestamp && (Date.now() - p.lastActionTimestamp < 2500);
                        
                        let borderColor = isActive ? 'border-[#DFFF00]' : 'border-zinc-800';
                        if (p.lastAction === 'FOLD') borderColor = 'border-red-900 opacity-50';
                        
                        const zLevel = (isWinner && gameStatus === 'FINISHED') ? 'z-[140]' : isActive ? 'z-40' : 'z-30';
                        const isDimmed = gameStatus === 'FINISHED' && !isWinner;

                        return (
                            <div key={p.id} className={`absolute ${portraitPos[i]} ${landscapePos[i]} flex flex-col items-center transition-all duration-300 ${zLevel} ${isDimmed ? 'opacity-30 grayscale blur-[1px]' : 'opacity-100'}`}>
                                
                                {showAction && p.lastAction && (
                                    <ActionBubble action={p.lastAction} />
                                )}

                                {/* CARDS */}
                                <div className="flex -space-x-4 mb-2 relative">
                                    {p.hand.map((c, ci) => (
                                        <div key={ci} className={`transform transition-transform duration-300 ${ci === 1 ? 'rotate-6 translate-y-1' : '-rotate-6'} ${isActive ? 'scale-105' : ''}`}>
                                            <CardView 
                                                card={c} 
                                                hidden={!revealCards} 
                                                size="sm" 
                                                highlight={revealCards && isWinningCard(c)} 
                                                dim={gameStatus === 'FINISHED' && hasWinner && revealCards && !isWinningCard(c)}
                                            />
                                        </div>
                                    ))}
                                    {dealerIdx === i && (
                                         <div className="absolute -right-2 -top-2 w-5 h-5 bg-white text-black text-[10px] font-black rounded-full flex items-center justify-center border border-black shadow-md z-50">D</div>
                                    )}
                                </div>

                                {/* PLAYER INFO PILL */}
                                <div className={`
                                    relative bg-zinc-950 px-3 py-1.5 rounded-xl flex flex-col items-center min-w-[90px] shadow-xl border-2 transition-colors duration-300
                                    ${borderColor}
                                `}>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                                        {p.isBot ? <Cpu size={10}/> : <User size={10}/>} 
                                        {p.name.length > 8 ? p.name.substring(0,6)+'..' : p.name}
                                    </div>
                                    <div className={`font-mono font-bold text-xs flex items-center gap-1 ${p.chips === 0 && !p.folded ? 'text-red-500' : 'text-[#DFFF00]'}`}>
                                        <Coins size={10} /> {p.chips}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* START BUTTON OVERLAY */}
                    {gameStatus === 'IDLE' && table && (
                        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center rounded-[100px] backdrop-blur-sm">
                            <button onClick={startHand} className="px-10 py-4 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_40px_rgba(223,255,0,0.4)] hover:scale-105 active:scale-95 transition-all animate-in zoom-in">
                                Deal Cards
                            </button>
                        </div>
                    )}

                    {/* REBUY MODAL - HIGH Z-INDEX */}
                    {gameStatus === 'BANKRUPT' && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-[150] flex flex-col items-center justify-center rounded-[90px] animate-in fade-in duration-300 p-6 text-center">
                             <AlertTriangle size={48} className="text-red-500 mb-4 animate-bounce" />
                             <div className="text-3xl font-black uppercase text-white mb-2">BUSTED</div>
                             <button onClick={handleRebuy} className="w-full max-w-[200px] py-3 bg-[#DFFF00] text-black font-black uppercase rounded-lg mb-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                 <RefreshCw size={16} /> Rebuy {table.buyIn}
                             </button>
                             <button onClick={leaveTable} className="text-zinc-500 uppercase text-xs font-bold tracking-widest hover:text-white p-2">
                                 Return to Lobby
                             </button>
                        </div>
                    )}
                </div>
            </div>

            {/* WINNER OVERLAY */}
            {winnerMsg && (
                <div className="absolute inset-0 z-[145] flex flex-col items-center justify-end pb-[20vh] pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                     <div className="pointer-events-auto bg-zinc-900/90 p-6 rounded-3xl border border-[#DFFF00]/30 shadow-2xl backdrop-blur-xl flex flex-col items-center animate-in slide-in-from-bottom-10 mx-4 max-w-sm w-full">
                         <Trophy size={32} className="text-[#DFFF00] mb-2 animate-bounce" />
                         <div className="text-2xl font-black uppercase text-center text-white mb-1 leading-none">
                            {winnerMsg.split(' with ')[0]}
                         </div>
                         <div className="text-[#DFFF00] font-mono text-xs uppercase tracking-widest mb-6">
                            {winnerMsg.split(' with ')[1]}
                         </div>

                         <div className="flex flex-wrap gap-2 w-full">
                             {winnerId === 0 && !userRevealedHand && !isShowdown && (
                                 <button onClick={() => setUserRevealedHand(true)} className="flex-1 py-3 bg-zinc-800 text-white font-bold uppercase rounded-xl border border-zinc-700 active:scale-95 text-xs">
                                     Show
                                 </button>
                             )}
                             <button onClick={startHand} className="flex-[2] min-w-[120px] py-3 bg-[#DFFF00] text-black font-black uppercase rounded-xl shadow-lg active:scale-95 text-xs">
                                 Next Hand
                             </button>
                             <button onClick={leaveTable} className="flex-1 py-3 bg-red-900/30 text-red-400 font-bold uppercase rounded-xl border border-red-900/50 hover:bg-red-900/50 active:scale-95 text-xs">
                                 Leave
                             </button>
                         </div>
                     </div>
                </div>
            )}

            {/* ACTION DRAWER */}
            <div className="h-auto md:min-h-[140px] bg-zinc-900 border-t border-zinc-800 p-4 pt-6 relative z-[60] flex flex-col justify-end pb-safe">
                <div className="absolute -top-4 left-0 right-0 flex justify-center pointer-events-none">
                     <div className="bg-black/80 backdrop-blur px-4 py-1.5 rounded-full text-zinc-300 text-[10px] font-mono shadow-xl border border-white/5 truncate max-w-[80%]">
                        {gameLog[0] || "Waiting for action..."}
                     </div>
                </div>

                <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
                    <div className="flex justify-between items-end px-2 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                        <div>
                            <span className="text-zinc-600">You:</span> {userPlayer?.currentBet || 0}
                        </div>
                        <div>
                            <span className="text-zinc-600">Call:</span> <span className="text-white font-bold">{Math.max(0, currentBet - (userPlayer?.currentBet || 0))}</span>
                        </div>
                    </div>

                    {gameStatus === 'PLAYING' && turnIdx === 0 && !userPlayer?.folded ? (
                        <div className="grid grid-cols-4 gap-2 h-14 md:h-16">
                            <button onClick={() => handleAction('FOLD')} className="bg-red-950/40 text-red-500 border border-red-900/50 rounded-xl font-black uppercase text-xs active:bg-red-900/80 active:scale-95 transition-all">
                                Fold
                            </button>
                            <button onClick={() => handleAction('CHECK')} className="bg-zinc-800 text-white border border-zinc-700 rounded-xl font-black uppercase text-xs active:bg-zinc-700 active:scale-95 transition-all">
                                {currentBet > userPlayer.currentBet ? 'Fold' : 'Check'}
                            </button>
                            <button onClick={() => handleAction('CALL')} className="bg-blue-900/20 text-blue-400 border border-blue-900/50 rounded-xl font-black uppercase text-xs active:bg-blue-900/40 active:scale-95 transition-all flex flex-col items-center justify-center leading-none gap-0.5">
                                <span>Call</span>
                                <span className="text-[10px] opacity-70">{Math.max(0, currentBet - userPlayer.currentBet)}</span>
                            </button>
                            <button onClick={() => handleAction('RAISE')} className="bg-[#DFFF00] text-black border border-[#DFFF00] rounded-xl font-black uppercase text-xs active:bg-white active:scale-95 transition-all shadow-[0_0_15px_rgba(223,255,0,0.3)]">
                                Raise
                            </button>
                        </div>
                    ) : (
                        <div className="h-14 md:h-16 flex items-center justify-center bg-zinc-950/50 rounded-xl border border-dashed border-zinc-800">
                             <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                                {gameStatus === 'PLAYING' ? (
                                    <><Loader2 size={12} className="animate-spin"/> Opponents thinking...</>
                                ) : 'Waiting for next hand'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}