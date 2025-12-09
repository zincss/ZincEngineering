'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabaseClient'; 
import BackButton from '@/app/components/BackButton';
import { Coins, User, Trophy, Cpu, LogOut } from 'lucide-react';
import { createDeck, evaluateHand, getAIDecision, Card } from './poker-utils';

// --- VISUAL COMPONENTS ---
const CardView = ({ card, hidden, size = "md", highlight = false, dim = false }: { card?: Card, hidden?: boolean, size?: "sm"|"md"|"lg", highlight?: boolean, dim?: boolean }) => {
    if (hidden || !card) {
        return (
            <div className={`
                ${size === 'sm' ? 'w-10 h-14' : size === 'md' ? 'w-14 h-20' : 'w-20 h-28'} 
                bg-zinc-900 border border-zinc-700 rounded-md relative shadow-lg
                bg-[repeating-linear-gradient(45deg,#18181b_0,#18181b_5px,#27272a_5px,#27272a_10px)]
                ${dim ? 'opacity-20 grayscale' : 'opacity-100'}
                transition-all duration-500
            `}>
                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-black text-xs">ZINC</div>
            </div>
        );
    }

    const isRed = card.suit === 'H' || card.suit === 'D';
    const suitIcon = card.suit === 'H' ? '♥' : card.suit === 'D' ? '♦' : card.suit === 'C' ? '♣' : '♠';

    return (
        <div className={`
            ${size === 'sm' ? 'w-10 h-14 text-xs' : size === 'md' ? 'w-14 h-20 text-sm' : 'w-20 h-28 text-xl'} 
            bg-zinc-100 rounded-md flex flex-col items-center justify-between p-1 shadow-xl border-2 transition-all duration-500
            ${highlight ? 'border-[#DFFF00] shadow-[0_0_30px_#DFFF00] scale-110 z-20 opacity-100' : isRed ? 'text-red-600 border-red-200' : 'text-zinc-900 border-zinc-300'}
            ${dim && !highlight ? 'opacity-20 grayscale scale-90 blur-[1px]' : ''}
            animate-in zoom-in duration-300
        `}>
            <div className="self-start font-black leading-none">{card.rank}</div>
            <div className="text-2xl">{suitIcon}</div>
            <div className="self-end font-black leading-none rotate-180">{card.rank}</div>
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
    const [gameStatus, setGameStatus] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
    const [winnerMsg, setWinnerMsg] = useState('');
    const [winningCards, setWinningCards] = useState<Card[]>([]);

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
    };

    const startHand = () => {
        if (!table) return;

        const newDeck = createDeck();
        const updatedPlayers = players.map(p => ({
            ...p,
            hand: [newDeck.pop()!, newDeck.pop()!],
            currentBet: 0,
            folded: false,
            lastAction: undefined,
            status: 'WAITING' as const
        }));

        // Blinds
        const sbIdx = (dealerIdx + 1) % 4;
        const bbIdx = (dealerIdx + 2) % 4;
        
        updatedPlayers[sbIdx].chips -= table.blind / 2;
        updatedPlayers[sbIdx].currentBet = table.blind / 2;
        updatedPlayers[bbIdx].chips -= table.blind;
        updatedPlayers[bbIdx].currentBet = table.blind;

        setDeck(newDeck);
        setPlayers(updatedPlayers as Player[]);
        setCommunityCards([]);
        setPot(table.blind * 1.5);
        setCurrentBet(table.blind);
        setPhase('PRE-FLOP');
        setGameStatus('PLAYING');
        setTurnIdx((dealerIdx + 3) % 4); 
        setWinnerMsg('');
        setWinningCards([]);
    };

    // --- GAME LOOP ---
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
            }, 1000 + Math.random() * 1000); 
            return () => clearTimeout(timer);
        }
    }, [turnIdx, gameStatus, players]); 

    const handleAction = (action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE') => {
        const newPlayers = [...players];
        const p = newPlayers[turnIdx];
        const costToCall = currentBet - p.currentBet;

        if (action === 'FOLD') {
            p.folded = true;
            p.lastAction = 'FOLD';
        } 
        else if (action === 'CHECK') {
            if (costToCall > 0) {
                 action = 'FOLD';
                 p.folded = true;
                 p.lastAction = 'FOLD';
            } else {
                p.lastAction = 'CHECK';
            }
        }
        else if (action === 'CALL') {
            if (p.chips >= costToCall) {
                p.chips -= costToCall;
                p.currentBet += costToCall;
                setPot(prev => prev + costToCall);
                p.lastAction = 'CALL';
            } else {
                // All-In (simplified)
                const allIn = p.chips;
                p.chips = 0;
                p.currentBet += allIn;
                setPot(prev => prev + allIn);
                p.lastAction = 'ALL-IN';
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
                p.lastAction = 'RAISE';
            } else {
                p.lastAction = 'CALL'; 
            }
        }

        setPlayers(newPlayers);
        nextTurn();
    };

    const nextTurn = () => {
        const activePlayers = players.filter(p => !p.folded);
        if (activePlayers.length === 1) {
            distributePot(activePlayers[0], 'Default');
            return;
        }

        // Round ends if: Everyone has acted AND Everyone's bet matches the current high bet (or is all-in)
        const allMatched = activePlayers.every(p => 
            p.lastAction !== undefined && (p.currentBet === currentBet || p.chips === 0)
        );

        if (allMatched) {
            nextPhase();
        } else {
            // Find next non-folded player
            let nextIdx = (turnIdx + 1) % 4;
            while (players[nextIdx].folded) {
                nextIdx = (nextIdx + 1) % 4;
            }
            setTurnIdx(nextIdx);
        }
    };

    const nextPhase = () => {
        const deckCopy = [...deck];
        const resetPlayers = players.map(p => ({ ...p, currentBet: 0, lastAction: undefined }));
        setPlayers(resetPlayers);
        setCurrentBet(0);
        
        // Post-flop, dealer acts last (so SB acts first)
        let firstActor = (dealerIdx + 1) % 4;
        while (players[firstActor].folded) {
            firstActor = (firstActor + 1) % 4;
        }
        setTurnIdx(firstActor);

        if (phase === 'PRE-FLOP') {
            setPhase('FLOP');
            setCommunityCards([deckCopy.pop()!, deckCopy.pop()!, deckCopy.pop()!]);
        } else if (phase === 'FLOP') {
            setPhase('TURN');
            setCommunityCards([...communityCards, deckCopy.pop()!]);
        } else if (phase === 'TURN') {
            setPhase('RIVER');
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
        
        // Explicitly typed to prevent "never" error
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
             // Fallback
             distributePot(winner, 'Win');
        }
    };

    const distributePot = async (winner: Player, handName?: string) => {
        setWinnerMsg(`${winner.name} wins with ${handName || 'Fold Equity'}`);
        const newPlayers = [...players];
        newPlayers[winner.id].chips += pot;
        setPlayers(newPlayers);
        setGameStatus('FINISHED');
    };

    // FIXED: Robust Leave Function
    const leaveTable = async () => {
        try {
            const userChips = players[0]?.chips || 0;
            const netChange = userChips - (table?.buyIn || 0);
            
            if (netChange !== 0 && profile) {
                await supabase.rpc('add_credits', { amount: netChange });
                refreshProfile();
            }
        } catch (e) {
            console.error("Error saving chips:", e);
        } finally {
            // Always exit the table, even if save fails
            setTable(null);
        }
    };

    // --- RENDER ---
    if (!table) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <BackButton href="/play" label="ARCADE HUB" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-0"/>
                
                <h1 className="text-5xl font-black mb-8 relative z-10 uppercase tracking-tighter">Texas <span className="text-[#DFFF00]">Hold'em</span></h1>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
                    {TABLES.map(t => (
                        <div key={t.id} className="border border-zinc-800 bg-zinc-900/50 p-8 rounded-xl hover:border-[#DFFF00] hover:bg-zinc-900 transition-all group">
                            <div className="text-[#DFFF00] font-mono text-xs font-bold mb-2 flex items-center gap-2">
                                <Cpu size={14} /> {t.difficulty} AI
                            </div>
                            <h2 className="text-2xl font-black uppercase mb-4">{t.name}</h2>
                            <div className="space-y-2 font-mono text-sm text-zinc-400 mb-8">
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
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded hover:bg-[#DFFF00] transition-colors"
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
    
    // Check if card is part of winning hand AND if game is finished
    const isWinningCard = (card: Card) => {
        if (gameStatus !== 'FINISHED') return false;
        return winningCards.some(wc => wc.suit === card.suit && wc.rank === card.rank);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#18181b_0%,#000_80%)]" />
            
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
                <div className="flex flex-col gap-2">
                    <div className="text-center md:text-left">
                        <div className="text-[#DFFF00] font-black uppercase tracking-widest text-lg">{table.name}</div>
                        <div className="text-zinc-500 text-xs font-mono">BLINDS {table.blind/2}/{table.blind}</div>
                    </div>
                </div>
                
                <button 
                    onClick={leaveTable} 
                    className="flex items-center gap-2 text-xs font-bold font-mono bg-red-900/20 text-red-500 border border-red-900/50 px-6 py-3 rounded hover:bg-red-900/40 hover:text-white transition-all uppercase tracking-widest shadow-lg"
                >
                    <LogOut size={16} /> Cash Out & Leave
                </button>
            </div>

            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-zinc-900 px-6 py-2 rounded-full border border-zinc-800 shadow-xl">
                <Coins size={16} className="text-[#DFFF00]" />
                <span className="font-mono font-bold text-xl">{pot}</span>
            </div>

            <div className="flex-1 flex items-center justify-center relative z-10 mt-12">
                <div className="relative w-[95%] max-w-4xl aspect-[2/1] bg-zinc-900/80 border-8 border-zinc-800 rounded-[100px] shadow-2xl flex items-center justify-center">
                    <div className="absolute inset-4 border-2 border-dashed border-zinc-700/50 rounded-[80px]" />
                    
                    {/* COMMUNITY CARDS */}
                    <div className="flex gap-2 relative z-20">
                        {communityCards.map((c, i) => (
                            <CardView 
                                key={i} 
                                card={c} 
                                size="md" 
                                highlight={isWinningCard(c)} 
                                dim={gameStatus === 'FINISHED' && !isWinningCard(c)}
                            />
                        ))}
                        {Array.from({length: 5 - communityCards.length}).map((_, i) => (
                             <div key={i} className="w-14 h-20 border-2 border-dashed border-zinc-700 rounded-md opacity-20" />
                        ))}
                    </div>

                    {/* PLAYERS */}
                    {players.map((p, i) => {
                        const positions = [
                            'bottom-[-60px] left-1/2 -translate-x-1/2', 
                            'left-[-40px] top-1/2 -translate-y-1/2', 
                            'top-[-60px] left-1/2 -translate-x-1/2', 
                            'right-[-40px] top-1/2 -translate-y-1/2', 
                        ];
                        const isActive = i === turnIdx && gameStatus === 'PLAYING';
                        const revealCards = !p.isBot || (isShowdown && !p.folded);

                        return (
                            <div key={p.id} className={`absolute ${positions[i]} flex flex-col items-center transition-all duration-300 ${p.folded ? 'opacity-40 grayscale' : ''}`}>
                                <div className="flex -space-x-4 mb-2">
                                    {p.hand.map((c, ci) => (
                                        <div key={ci} className={`transform ${ci === 1 ? 'rotate-6 translate-y-1' : '-rotate-6'}`}>
                                            <CardView 
                                                card={c} 
                                                hidden={!revealCards} 
                                                size="sm" 
                                                highlight={revealCards && isWinningCard(c)} 
                                                dim={gameStatus === 'FINISHED' && revealCards && !isWinningCard(c)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className={`relative bg-zinc-950 border-2 px-4 py-2 rounded-xl flex flex-col items-center min-w-[100px] shadow-xl ${isActive ? 'border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.3)] scale-110 z-30' : 'border-zinc-800'} ${p.folded ? 'border-zinc-800 bg-zinc-900' : ''}`}>
                                    {dealerIdx === i && <div className="absolute -top-3 -right-2 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">D</div>}
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1">
                                        {p.isBot ? <Cpu size={10}/> : <User size={10}/>} {p.name}
                                    </div>
                                    <div className={`font-mono font-bold text-sm flex items-center gap-1 ${p.chips === 0 && !p.folded ? 'text-red-500' : 'text-[#DFFF00]'}`}>
                                        <Coins size={10} /> {p.chips}
                                    </div>
                                    {p.lastAction && (
                                        <div className="absolute -bottom-6 bg-zinc-800 text-white text-[9px] px-2 py-1 rounded font-black uppercase tracking-widest animate-in slide-in-from-top-2 whitespace-nowrap border border-zinc-700">
                                            {p.lastAction}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {winnerMsg && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-[100px] animate-in fade-in duration-300">
                             <Trophy size={48} className="text-[#DFFF00] mb-4 animate-bounce" />
                             <div className="text-2xl font-black uppercase text-center max-w-md px-4 leading-tight mb-2 text-white">
                                {winnerMsg.split(' with ')[0]}
                             </div>
                             <div className="text-[#DFFF00] font-mono text-sm uppercase tracking-widest mb-8">
                                {winnerMsg.split(' with ')[1]}
                             </div>
                             <div className="flex gap-4">
                                 <button onClick={startHand} className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded hover:bg-[#DFFF00] transition-colors shadow-lg">
                                     Next Hand
                                 </button>
                                 <button onClick={leaveTable} className="px-8 py-3 bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest rounded hover:text-white border border-zinc-700 transition-colors">
                                     Leave
                                 </button>
                             </div>
                        </div>
                    )}

                    {gameStatus === 'IDLE' && table && (
                        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center rounded-[100px]">
                            <button onClick={startHand} className="px-10 py-4 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded shadow-[0_0_20px_rgba(223,255,0,0.4)] hover:scale-105 transition-transform">
                                Deal Cards
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-24 bg-zinc-900 border-t border-zinc-800 p-4 relative z-30">
                <div className="max-w-4xl mx-auto flex items-center justify-between h-full">
                    <div className="text-xs text-zinc-500 font-mono hidden md:block">
                        <div>YOUR BET: {userPlayer?.currentBet}</div>
                        <div>TO CALL: {Math.max(0, currentBet - (userPlayer?.currentBet || 0))}</div>
                    </div>
                    <div className="flex gap-2 md:gap-4 w-full md:w-auto justify-center">
                        {gameStatus === 'PLAYING' && turnIdx === 0 && !userPlayer?.folded ? (
                            <>
                                <button onClick={() => handleAction('FOLD')} className="flex-1 md:flex-none px-6 py-3 bg-red-900/30 text-red-500 border border-red-900 rounded font-black uppercase hover:bg-red-900/50">Fold</button>
                                <button onClick={() => handleAction('CHECK')} className="flex-1 md:flex-none px-6 py-3 bg-zinc-800 text-white border border-zinc-700 rounded font-black uppercase hover:bg-zinc-700">{currentBet > userPlayer.currentBet ? 'Fold' : 'Check'}</button>
                                <button onClick={() => handleAction('CALL')} className="flex-1 md:flex-none px-6 py-3 bg-blue-900/30 text-blue-400 border border-blue-900 rounded font-black uppercase hover:bg-blue-900/50">Call {Math.max(0, currentBet - userPlayer.currentBet)}</button>
                                <button onClick={() => handleAction('RAISE')} className="flex-1 md:flex-none px-6 py-3 bg-[#DFFF00] text-black border border-[#DFFF00] rounded font-black uppercase hover:bg-white">Raise</button>
                            </>
                        ) : (
                            <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                                {gameStatus === 'PLAYING' ? 'Waiting for opponents...' : 'Waiting for next hand'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}