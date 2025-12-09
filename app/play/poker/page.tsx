'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabaseClient'; 
import BackButton from '@/app/components/BackButton';
import { Coins, User, Trophy, Cpu, LogOut, Eye, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { createDeck, evaluateHand, getAIDecision, Card } from './poker-utils';

// --- VISUAL COMPONENTS ---
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
    // Optimized Mobile Dimensions
    const dims = size === 'sm' 
        ? 'w-9 h-14 md:w-10 md:h-14 text-[10px] md:text-xs' 
        : size === 'md' 
        ? 'w-11 h-[68px] md:w-14 md:h-20 text-xs md:text-sm' 
        : 'w-16 h-24 md:w-20 md:h-28 text-lg md:text-xl';

    if (hidden || !card) {
        return (
            <div className={`
                ${dims}
                bg-zinc-900 border border-zinc-700 rounded-md relative shadow-lg
                bg-[repeating-linear-gradient(45deg,#18181b_0,#18181b_5px,#27272a_5px,#27272a_10px)]
                ${dim ? 'opacity-10 grayscale blur-[1px]' : 'opacity-100'}
                transition-all duration-500 flex-shrink-0
            `}>
                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-black text-[8px] md:text-xs">ZINC</div>
            </div>
        );
    }

    const isRed = card.suit === 'H' || card.suit === 'D';
    const suitIcon = card.suit === 'H' ? '♥' : card.suit === 'D' ? '♦' : card.suit === 'C' ? '♣' : '♠';
    const textColorClass = isRed ? 'text-red-600' : 'text-black';
    
    const borderClass = highlight 
        ? 'border-[#DFFF00] ring-2 ring-[#DFFF00]/50' 
        : (isRed ? 'border-red-200' : 'border-zinc-300');

    // On mobile, scale winning cards slightly less to avoid screen overflow
    const effectClass = highlight 
        ? 'shadow-[0_0_20px_rgba(223,255,0,0.6)] scale-110 md:scale-125 z-[100] opacity-100' 
        : '';

    return (
        <div className={`
            ${dims}
            bg-zinc-100 rounded-md flex flex-col items-center justify-between p-0.5 md:p-1 shadow-xl border-2 transition-all duration-500 relative flex-shrink-0
            ${textColorClass} ${borderClass} ${effectClass}
            ${dim && !highlight ? 'opacity-10 grayscale scale-95 blur-[2px]' : ''}
            animate-in zoom-in duration-300
        `}>
            <div className="self-start font-black leading-none pl-0.5 pt-0.5">{card.rank}</div>
            <div className="text-base md:text-2xl">{suitIcon}</div>
            <div className="self-end font-black leading-none rotate-180 pr-0.5 pb-0.5">{card.rank}</div>
            
            {highlight && (
                 <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-[#DFFF00] text-black text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-lg z-[101] border border-black/20 animate-in slide-in-from-bottom-2">
                     WINNER
                 </div>
            )}
        </div>
    );
};

// --- ACTION BUBBLE COMPONENT ---
const ActionBubble = ({ action, amount }: { action: string, amount?: number }) => {
    const colorClass = 
        action === 'FOLD' ? 'bg-red-600 text-white' :
        action === 'CHECK' ? 'bg-zinc-700 text-zinc-200' :
        action === 'CALL' ? 'bg-blue-600 text-white' :
        'bg-[#DFFF00] text-black'; 

    return (
        <div className={`
            absolute -top-10 md:-top-14 left-1/2 -translate-x-1/2 z-50 
            px-3 py-1 md:px-4 md:py-2 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl
            animate-in zoom-in slide-in-from-bottom-2 duration-200
            whitespace-nowrap ${colorClass} border-2 border-black/20
        `}>
            {action} {amount ? amount : ''}
            <div className={`absolute bottom-[-6px] md:bottom-[-8px] left-1/2 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 rotate-45 ${colorClass} border-b-2 border-r-2 border-black/20`} />
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

    // --- INITIALIZATION ---
    const joinTable = (selectedTable: typeof TABLES[number]) => {
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
        if (!table) return;

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
        setWinnerMsg('');
        setWinnerId(null);
        setWinningCards([]);
        setUserRevealedHand(false);
        setAiRevealedHand(false);
        setGameLog([]);
        addToLog("Dealing cards...");
    };

    const handleRebuy = async () => {
        if (!profile || !table) return;
        const rebuyCost = table.buyIn;

        if (profile.credits < rebuyCost) {
            alert("Not enough credits in account to rebuy!");
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
            const timer = setTimeout(() => {
                const decision = getAIDecision(
                    table!.difficulty, 
                    currentPlayer.hand, 
                    communityCards, 
                    currentBet, 
                    currentPlayer.currentBet,
                    phase === 'PRE-FLOP'
                );
                handleAction(decision);
            }, 1000 + Math.random() * 800); 
            return () => clearTimeout(timer);
        }
    }, [turnIdx, gameStatus, players]);

    const handleAction = (action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE') => {
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
            const raiseAmt = currentBet + (table?.blind || 100); 
            const totalCost = raiseAmt - p.currentBet;
            
            if (p.chips >= totalCost) {
                p.chips -= totalCost;
                p.currentBet += totalCost;
                setPot(prev => prev + totalCost);
                setCurrentBet(raiseAmt);
                addToLog(`${p.name} Raises to ${raiseAmt}`);
            } else {
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
        
        setTimeout(() => nextTurn(), 600);
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

        if (winner.isBot && isDefaultWin) {
            if (Math.random() < 0.3) {
                setTimeout(() => setAiRevealedHand(true), 500);
            }
        }
    };

    const leaveTable = async () => {
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

    if (!table) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
                <BackButton href="/play" label="ARCADE HUB" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-0"/>
                
                <h1 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 relative z-10 uppercase tracking-tighter text-center">Texas <span className="text-[#DFFF00]">Hold'em</span></h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl w-full relative z-10">
                    {TABLES.map(t => (
                        <div key={t.id} className="border border-zinc-800 bg-zinc-900/50 p-6 md:p-8 rounded-xl hover:border-[#DFFF00] hover:bg-zinc-900 transition-all group">
                            <div className="text-zinc-500 font-mono text-xs font-bold mb-2 flex items-center gap-2">
                                <Cpu size={14} /> NO LIMIT HOLD'EM
                            </div>
                            <h2 className="text-xl md:text-2xl font-black uppercase mb-4">{t.name}</h2>
                            <div className="space-y-2 font-mono text-xs md:text-sm text-zinc-400 mb-6 md:mb-8">
                                <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span>Buy-In</span>
                                    <span className="text-white">{t.buyIn} CR</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span>Blinds</span>
                                    <span className="text-white">{t.blind/2} / {t.blind}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => joinTable(t)}
                                className="w-full py-3 md:py-4 bg-white text-black font-black uppercase tracking-widest rounded hover:bg-[#DFFF00] transition-colors text-sm md:text-base"
                            >
                                Sit Down
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const userPlayer = players[0];
    const isShowdown = phase === 'SHOWDOWN' || gameStatus === 'FINISHED';
    
    const isWinningCard = (card: Card) => {
        if (gameStatus !== 'FINISHED') return false;
        return winningCards.some(wc => wc.suit === card.suit && wc.rank === card.rank);
    };

    const hasWinner = winningCards.length > 0;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#18181b_0%,#000_80%)]" />
            
            {/* TOP BAR */}
            <div className="absolute top-0 left-0 right-0 p-3 md:p-4 flex justify-between items-start z-30">
                <div className="flex flex-col gap-1">
                    <div className="text-center md:text-left">
                        <div className="text-[#DFFF00] font-black uppercase tracking-widest text-sm md:text-lg">{table.name}</div>
                        <div className="text-zinc-500 text-[10px] md:text-xs font-mono">BLINDS {table.blind/2}/{table.blind}</div>
                    </div>
                </div>
                
                <button 
                    onClick={leaveTable}
                    disabled={isLeaving}
                    className="flex items-center gap-2 text-[10px] md:text-xs font-bold font-mono bg-red-900/20 text-red-500 border border-red-900/50 px-4 py-2 md:px-6 md:py-3 rounded hover:bg-red-900/40 hover:text-white transition-all uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLeaving ? <Loader2 size={14} className="animate-spin"/> : <LogOut size={14} />} 
                    {isLeaving ? "Saving..." : "Cash Out"}
                </button>
            </div>

            {/* MAIN GAME AREA */}
            <div className="flex-1 flex items-center justify-center relative z-10 mt-12 md:mt-0">
                <div className="relative w-[95%] max-w-4xl aspect-[2/1] bg-zinc-900/80 border-4 md:border-8 border-zinc-800 rounded-[60px] md:rounded-[100px] shadow-2xl flex items-center justify-center">
                    <div className="absolute inset-2 md:inset-4 border-2 border-dashed border-zinc-700/50 rounded-[50px] md:rounded-[80px]" />
                    
                    {/* POT DISPLAY */}
                    <div className="absolute top-[32%] md:top-[35%] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-zinc-950/80 px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-zinc-800 backdrop-blur-sm">
                        <Coins size={14} className="text-[#DFFF00]" />
                        <span className="font-mono font-bold text-lg md:text-xl text-white">{pot}</span>
                    </div>

                    {/* COMMUNITY CARDS */}
                    <div className={`flex gap-1 md:gap-2 relative mt-6 md:mt-8 ${gameStatus === 'FINISHED' && hasWinner ? 'z-[130]' : 'z-20'}`}>
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
                             <div key={i} className="w-10 h-16 md:w-14 md:h-20 border-2 border-dashed border-zinc-700 rounded-md opacity-20" />
                        ))}
                    </div>

                    {/* PLAYERS */}
                    {players.map((p, i) => {
                        const positions = [
                            'bottom-[-40px] md:bottom-[-60px] left-1/2 -translate-x-1/2', 
                            'left-[-12px] md:left-[-40px] top-1/2 -translate-y-1/2', 
                            'top-[-50px] md:top-[-60px] left-1/2 -translate-x-1/2', 
                            'right-[-12px] md:right-[-40px] top-1/2 -translate-y-1/2', 
                        ];
                        const isActive = i === turnIdx && gameStatus === 'PLAYING';
                        
                        const isWinner = winnerId === p.id;
                        const winnerRevealed = isWinner && (p.isBot ? aiRevealedHand : userRevealedHand);
                        const revealCards = !p.isBot || (isShowdown && !p.folded) || winnerRevealed;

                        const showAction = p.lastAction && p.lastActionTimestamp && (Date.now() - p.lastActionTimestamp < 2000);
                        
                        let borderColor = isActive ? 'border-[#DFFF00]' : 'border-zinc-800';
                        if (p.lastAction === 'FOLD') borderColor = 'border-red-900';
                        else if (p.lastAction === 'RAISE' || p.lastAction === 'ALL-IN') borderColor = 'border-green-500';
                        else if (p.lastAction === 'CALL') borderColor = 'border-blue-500';
                        
                        const zLevel = (isWinner && gameStatus === 'FINISHED') ? 'z-[140]' : isActive ? 'z-40' : 'z-30';

                        // FOCUS MODE: If game is finished, dim everyone except winner
                        const isDimmed = gameStatus === 'FINISHED' && !isWinner;

                        if (isWinner && gameStatus === 'FINISHED') borderColor = 'border-[#DFFF00] shadow-[0_0_30px_rgba(223,255,0,0.5)] bg-zinc-900';

                        return (
                            <div key={p.id} className={`absolute ${positions[i]} flex flex-col items-center transition-all duration-300 ${p.folded ? 'opacity-40 grayscale' : ''} ${zLevel} ${isDimmed ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}>
                                
                                {showAction && p.lastAction && (
                                    <ActionBubble action={p.lastAction} />
                                )}

                                <div className="flex -space-x-3 md:-space-x-4 mb-1 md:mb-2">
                                    {p.hand.map((c, ci) => (
                                        <div key={ci} className={`transform ${ci === 1 ? 'rotate-6 translate-y-1' : '-rotate-6'}`}>
                                            <CardView 
                                                card={c} 
                                                hidden={!revealCards} 
                                                size="sm" 
                                                highlight={revealCards && isWinningCard(c)} 
                                                dim={gameStatus === 'FINISHED' && hasWinner && revealCards && !isWinningCard(c)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className={`
                                    relative bg-zinc-950 border-2 px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl flex flex-col items-center min-w-[80px] md:min-w-[100px] shadow-xl 
                                    transition-all duration-300
                                    ${borderColor}
                                    ${isActive ? 'scale-110' : ''}
                                `}>
                                    {dealerIdx === i && <div className="absolute -top-2 -right-1 md:-top-3 md:-right-2 bg-white text-black text-[8px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border border-black">D</div>}
                                    
                                    <div className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase mb-0.5 flex items-center gap-1">
                                        {p.isBot ? <Cpu size={10}/> : <User size={10}/>} {p.name.split(' ')[0]}
                                    </div>
                                    <div className={`font-mono font-bold text-xs md:text-sm flex items-center gap-1 ${p.chips === 0 && !p.folded ? 'text-red-500' : 'text-[#DFFF00]'}`}>
                                        <Coins size={10} /> {p.chips}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* REBUY MODAL */}
                    {gameStatus === 'BANKRUPT' && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-[150] flex flex-col items-center justify-center rounded-[60px] md:rounded-[100px] animate-in fade-in duration-300 border-4 border-red-900/50 p-4">
                             <AlertTriangle size={32} className="text-red-500 mb-2 md:mb-4 animate-bounce" />
                             <div className="text-2xl md:text-3xl font-black uppercase text-center text-white mb-1">BUSTED</div>
                             <div className="text-zinc-400 font-mono text-xs md:text-sm uppercase tracking-widest mb-6 md:mb-8 text-center max-w-xs">
                                Insufficient chips for blinds.
                             </div>
                             <div className="flex flex-col md:flex-row gap-3 w-full max-w-xs">
                                 <button onClick={handleRebuy} className="w-full py-3 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded hover:bg-white transition-colors shadow-lg flex items-center justify-center gap-2 text-xs md:text-sm">
                                     <RefreshCw size={14} /> Rebuy
                                 </button>
                                 <button onClick={leaveTable} className="w-full py-3 bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest rounded hover:text-white border border-zinc-700 transition-colors text-xs md:text-sm">
                                     Leave
                                 </button>
                             </div>
                        </div>
                    )}

                    {/* WINNER OVERLAY - MOBILE OPTIMIZED */}
                    {winnerMsg && (
                        <div className="absolute inset-0 z-[120] flex flex-col justify-between py-6 md:py-12 rounded-[60px] md:rounded-[100px] animate-in fade-in duration-300 pointer-events-auto bg-transparent">
                             <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-[60px] md:rounded-[100px] -z-10" />
                             
                             <div className="flex flex-col items-center">
                                 <div className="bg-black/80 px-4 py-2 md:px-8 md:py-4 rounded-full border border-[#DFFF00]/30 shadow-2xl backdrop-blur-md flex flex-col items-center mx-4">
                                     <Trophy size={20} className="text-[#DFFF00] mb-1 animate-bounce md:w-8 md:h-8" />
                                     <div className="text-sm md:text-2xl font-black uppercase text-center max-w-md leading-none text-white mb-0.5 md:mb-1">
                                        {winnerMsg.split(' with ')[0]}
                                     </div>
                                     <div className="text-[#DFFF00] font-mono text-[9px] md:text-xs uppercase tracking-widest">
                                        {winnerMsg.split(' with ')[1]}
                                     </div>
                                 </div>
                             </div>

                             <div className="flex justify-center gap-2 md:gap-4 px-4 pb-2 md:pb-0">
                                 {winnerId === 0 && !userRevealedHand && !isShowdown && (
                                     <button onClick={() => setUserRevealedHand(true)} className="px-4 py-3 md:px-8 md:py-3 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-lg hover:bg-zinc-700 transition-colors shadow-lg border border-zinc-600 flex items-center gap-2 text-[10px] md:text-xs">
                                         <Eye size={14} /> Show
                                     </button>
                                 )}

                                 <button onClick={startHand} className="flex-1 max-w-[140px] px-4 py-3 md:px-8 md:py-3 bg-white text-black font-black uppercase tracking-widest rounded-lg hover:bg-[#DFFF00] hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] text-[10px] md:text-xs text-center">
                                     Next Hand
                                 </button>
                                 <button 
                                    onClick={leaveTable} 
                                    disabled={isLeaving}
                                    className="px-4 py-3 md:px-8 md:py-3 bg-zinc-900/90 text-zinc-400 font-black uppercase tracking-widest rounded-lg hover:text-white border border-zinc-700 hover:bg-zinc-800 transition-colors flex items-center gap-2 backdrop-blur-md text-[10px] md:text-xs"
                                >
                                     {isLeaving ? <Loader2 size={14} className="animate-spin"/> : <LogOut size={14} />}
                                     {isLeaving ? '' : 'Leave'}
                                 </button>
                             </div>
                        </div>
                    )}

                    {/* START BUTTON */}
                    {gameStatus === 'IDLE' && table && (
                        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center rounded-[60px] md:rounded-[100px]">
                            <button onClick={startHand} className="px-8 py-3 md:px-10 md:py-4 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded shadow-[0_0_20px_rgba(223,255,0,0.4)] hover:scale-105 transition-transform text-xs md:text-base">
                                Deal Cards
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION & LOG BAR - RESPONSIVE */}
            <div className="h-auto md:h-32 bg-zinc-900 border-t border-zinc-800 p-3 md:p-4 relative z-30 flex flex-col justify-between pb-8 md:pb-4">
                <div className="absolute -top-8 md:-top-10 left-0 right-0 flex justify-center pointer-events-none">
                     <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-zinc-400 text-[10px] md:text-xs font-mono truncate max-w-[90%] text-center">
                        {gameLog[0]}
                     </div>
                </div>

                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between h-full w-full gap-3">
                    <div className="text-[10px] text-zinc-500 font-mono hidden md:block w-48">
                        <div>YOUR BET: {userPlayer?.currentBet}</div>
                        <div>TO CALL: {Math.max(0, currentBet - (userPlayer?.currentBet || 0))}</div>
                    </div>
                    
                    {/* MOBILE: 2x2 Grid, DESKTOP: Flex Row */}
                    <div className="w-full md:w-auto">
                        {gameStatus === 'PLAYING' && turnIdx === 0 && !userPlayer?.folded ? (
                            <div className="grid grid-cols-2 md:flex gap-2 md:gap-4 w-full">
                                <button onClick={() => handleAction('FOLD')} className="px-4 py-3 md:px-6 md:py-3 bg-red-900/30 text-red-500 border border-red-900 rounded font-black uppercase hover:bg-red-900/50 transition-colors text-xs">Fold</button>
                                <button onClick={() => handleAction('CHECK')} className="px-4 py-3 md:px-6 md:py-3 bg-zinc-800 text-white border border-zinc-700 rounded font-black uppercase hover:bg-zinc-700 transition-colors text-xs">
                                    {currentBet > userPlayer.currentBet ? 'Fold' : 'Check'}
                                </button>
                                <button onClick={() => handleAction('CALL')} className="px-4 py-3 md:px-6 md:py-3 bg-blue-900/30 text-blue-400 border border-blue-900 rounded font-black uppercase hover:bg-blue-900/50 transition-colors text-xs">
                                    Call {Math.max(0, currentBet - userPlayer.currentBet)}
                                </button>
                                <button onClick={() => handleAction('RAISE')} className="px-4 py-3 md:px-6 md:py-3 bg-[#DFFF00] text-black border border-[#DFFF00] rounded font-black uppercase hover:bg-white transition-colors text-xs">
                                    Raise
                                </button>
                            </div>
                        ) : (
                            <div className="text-zinc-500 font-mono text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 h-12">
                                {gameStatus === 'PLAYING' ? (
                                    <><Loader2 size={12} className="animate-spin"/> Waiting...</>
                                ) : 'Next hand'}
                            </div>
                        )}
                    </div>
                    
                    <div className="hidden md:block w-48" />
                </div>
            </div>
        </div>
    );
}