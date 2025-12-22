'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import { 
    Coins, 
    Layers, 
    RotateCcw, 
    ShieldAlert, 
    Trophy, 
    Wallet, 
    Loader2,
    Hand,
} from 'lucide-react';

// --- VISUAL HELPERS ---

const vibrate = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  isHidden?: boolean;
  key?: string; 
}

// --- CARD COMPONENT ---
const CardView = ({ 
    card, 
    index, 
    total,
    isDealer = false 
}: { 
    card: Card; 
    index: number; 
    total: number;
    isDealer?: boolean;
}) => {
    // Dynamic overlapping
    const overlap = index === 0 ? 0 : -35; // Increased overlap slightly
    
    if (card.isHidden) {
        return (
            <div 
                className="w-20 h-28 md:w-24 md:h-36 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center relative shadow-2xl z-10"
                style={{ 
                    transform: `translateX(${index * overlap}px)`,
                    zIndex: index
                }}
            >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#18181b_0,#18181b_10px,#27272a_10px,#27272a_20px)] opacity-50 rounded-xl" />
                <div className="relative z-10 text-zinc-700 font-black text-xs tracking-wider">ZINC</div>
            </div>
        );
    }

    const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
    
    // Maximized contrast colors
    const textColor = isRed ? 'text-red-600' : 'text-black';
    const borderColor = ['J', 'Q', 'K'].includes(card.rank) ? 'border-[#DFFF00]/50' : 'border-zinc-300';
    
    const SuitIcon = () => {
        switch(card.suit) {
            case 'HEARTS': return <span>♥</span>;
            case 'DIAMONDS': return <span>♦</span>;
            case 'SPADES': return <span>♠</span>;
            case 'CLUBS': return <span>♣</span>;
        }
    };

    return (
        <div 
            className={`
                w-20 h-28 md:w-24 md:h-36 bg-zinc-100 rounded-xl flex flex-col justify-between p-2 shadow-2xl transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in
                border-2 ${borderColor}
                ${card.rank === 'A' ? 'shadow-[0_0_15px_rgba(168,85,247,0.3)] border-purple-400' : ''}
            `}
            style={{ 
                transform: `translateX(${index * overlap}px) rotate(${index * 2 - (total * 1)}deg)`,
                zIndex: index
            }}
        >
            {/* Top Left */}
            <div className={`flex flex-col items-center leading-none ${textColor}`}>
                <span className="text-xl font-black font-mono">
                    {card.rank}
                </span>
                <div className="text-sm font-bold"><SuitIcon /></div>
            </div>

            {/* Center Watermark - Increased Opacity for Visibility */}
            <div className={`absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none text-5xl ${textColor}`}>
                <SuitIcon />
            </div>

            {/* Bottom Right */}
            <div className={`flex flex-col items-center leading-none rotate-180 ${textColor}`}>
                <span className="text-xl font-black font-mono">
                    {card.rank}
                </span>
                <div className="text-sm font-bold"><SuitIcon /></div>
            </div>
        </div>
    );
};

// --- GAME LOGIC ---

const getCardValue = (rank: Rank): number => {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank);
};

const createDeck = (): Card[] => {
  const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, value: getCardValue(rank), key: Math.random().toString(36) });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calculateHandValue = (hand: Card[]) => {
  let value = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.isHidden) continue;
    value += card.value;
    if (card.rank === 'A') aces += 1;
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }
  return value;
};

// --- CONFIGURATION ---
const BET_AMOUNTS = [10, 50, 100, 500, 1000];
type GameState = 'BETTING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'GAME_OVER';

export default function BlackjackPage() {
  const { profile, refreshProfile } = useAuth();
  
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>('BETTING');
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState<'WIN' | 'LOSE' | 'PUSH' | 'BJ' | null>(null);

  // --- ACTIONS ---

  const startGame = async (amount: number) => {
    vibrate(10);
    if (!profile || profile.credits < amount) {
        alert("INSUFFICIENT FUNDS");
        return;
    }

    setProcessing(true);
    setOutcome(null);
    
    try {
        const { error } = await supabase.rpc('add_credits', { amount: -amount });
        if (error) throw error;
        
        await refreshProfile(); 
        
        const newDeck = createDeck();
        const pHand = [newDeck.pop()!, newDeck.pop()!];
        const dHand = [newDeck.pop()!, { ...newDeck.pop()!, isHidden: true }];

        setBet(amount);
        setDeck(newDeck);
        setPlayerHand(pHand);
        setDealerHand(dHand);
        setGameState('PLAYER_TURN');
        setMessage('');
        
        // Auto-check for Blackjack
        const pVal = calculateHandValue(pHand);
        if (pVal === 21) {
            handleStand(pHand, dHand, newDeck);
        }

    } catch (e) {
        console.error(e);
        alert("Transaction Error");
    } finally {
        setProcessing(false);
    }
  };

  const handleHit = () => {
    vibrate(20);
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];
    
    setPlayerHand(newHand);
    setDeck(newDeck);

    if (calculateHandValue(newHand) > 21) {
        endGame(newHand, dealerHand, 'BUST');
    }
  };

  const handleStand = async (currentPHand = playerHand, currentDHand = dealerHand, currentDeck = deck) => {
    vibrate(20);
    setGameState('DEALER_TURN');
    
    let newDHand: Card[] = currentDHand.map(c => ({ ...c, isHidden: false }));
    let newDeck = [...currentDeck];

    setDealerHand([...newDHand]); // Reveal first
    
    const playDealer = async () => {
        await new Promise(r => setTimeout(r, 600));

        while (calculateHandValue(newDHand) < 17) {
            const card = newDeck.pop()!;
            newDHand = [...newDHand, card];
            setDealerHand([...newDHand]);
            setDeck(newDeck);
            vibrate(10);
            await new Promise(r => setTimeout(r, 800)); 
        }
        
        determineWinner(currentPHand, newDHand);
    };

    playDealer();
  };

  const determineWinner = (pHand: Card[], dHand: Card[]) => {
    const pVal = calculateHandValue(pHand);
    const dVal = calculateHandValue(dHand);

    if (dVal > 21) {
        endGame(pHand, dHand, 'WIN'); // Dealer Bust
    } else if (pVal > dVal) {
        endGame(pHand, dHand, 'WIN');
    } else if (pVal < dVal) {
        endGame(pHand, dHand, 'LOSE');
    } else {
        endGame(pHand, dHand, 'PUSH');
    }
  };

  const endGame = async (pHand: Card[], dHand: Card[], result: 'WIN' | 'LOSE' | 'PUSH' | 'BUST' | 'BLACKJACK') => {
    setGameState('GAME_OVER');
    
    let payout = 0;
    let msg = "";
    let out: typeof outcome = null;

    if (result === 'BUST') {
        msg = "BUST";
        out = 'LOSE';
        vibrate([50, 100]);
    } else if (result === 'LOSE') {
        msg = "DEALER WINS";
        out = 'LOSE';
        vibrate([50, 100]);
    } else if (result === 'PUSH') {
        msg = "PUSH";
        payout = bet;
        out = 'PUSH';
    } else if (result === 'WIN') {
        msg = "VICTORY";
        payout = bet * 2;
        out = 'WIN';
        vibrate([50, 50, 50]);
    } else if (result === 'BLACKJACK') {
        msg = "BLACKJACK";
        payout = bet * 2.5;
        out = 'BJ';
        vibrate([50, 50, 50, 50]);
    }

    setMessage(msg);
    setOutcome(out);

    if (payout > 0) {
        try {
            await supabase.rpc('add_credits', { amount: payout });
            refreshProfile();
        } catch (e) {
            console.error("Payout Failed", e);
        }
    }
  };

  const resetGame = () => {
      setGameState('BETTING');
      setPlayerHand([]);
      setDealerHand([]);
      setMessage('');
      setOutcome(null);
  }

  // --- RENDER ---

  const playerTotal = calculateHandValue(playerHand);
  const dealerTotal = calculateHandValue(dealerHand);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] text-white flex flex-col overflow-hidden touch-none">
      
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#18181b_0%,#000_80%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-30 pointer-events-none">
          <div className="flex flex-col gap-0.5 pointer-events-auto bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                <div className="text-[#DFFF00] font-black uppercase tracking-widest text-xs flex items-center gap-2 justify-end">
                    <Wallet size={12} />
                    {profile?.credits.toLocaleString() || 0}
                </div>
                <div className="text-zinc-500 text-[10px] font-mono text-right">BALANCE</div>
          </div>
      </div>

      {/* Main Game Surface */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full overflow-hidden pb-[140px] md:pb-0 pt-16 md:pt-0">
         
         <div className="relative w-[95%] md:w-[80%] max-w-5xl aspect-[3/5] md:aspect-[2/1] bg-zinc-900/90 border-4 border-zinc-800 rounded-[60px] md:rounded-[150px] shadow-2xl flex flex-col items-center justify-between py-12 md:py-16">
            
            <div className="absolute inset-2 md:inset-4 border-2 border-dashed border-zinc-700/50 rounded-[50px] md:rounded-[130px] pointer-events-none" />
            
            {/* Center Message - Layered ON TOP (z-50) when active */}
            <div className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all duration-300
                ${message ? 'z-50 scale-110' : 'z-0'}
            `}>
                {message ? (
                    <div className="relative">
                        {/* Text Shadow Layer for Readability over Cards */}
                        <div className={`
                            text-4xl md:text-6xl font-black uppercase tracking-tighter animate-in zoom-in duration-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]
                            ${outcome === 'WIN' || outcome === 'BJ' ? 'text-[#DFFF00]' : outcome === 'LOSE' ? 'text-red-500' : 'text-white'}
                        `} style={{ textShadow: '0 0 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8)' }}>
                            {message}
                        </div>
                        {outcome === 'BJ' && <div className="text-white font-mono text-xs uppercase tracking-[0.5em] mt-2 animate-pulse">Critical Hit</div>}
                    </div>
                ) : (
                    <div className="opacity-50 transition-opacity duration-500">
                        <Layers className="mx-auto text-zinc-800 mb-2 w-16 h-16 md:w-24 md:h-24" />
                        <div className="text-zinc-800 font-black text-4xl md:text-6xl uppercase">BLACKJACK</div>
                    </div>
                )}
            </div>

            {/* Dealer Zone */}
            <div className="relative z-10 flex flex-col items-center min-h-[160px] pt-4 md:pt-0">
                <div className="flex items-center justify-center mb-4 pl-4">
                    {dealerHand.length > 0 && (
                        dealerHand.map((card, i) => (
                            <CardView key={card.key || i} card={card} index={i} total={dealerHand.length} isDealer />
                        ))
                    )}
                    {dealerHand.length === 0 && (
                        <div className="w-20 h-28 md:w-24 md:h-36 border-2 border-dashed border-zinc-800 rounded-xl opacity-20 flex items-center justify-center">
                            <ShieldAlert className="text-zinc-700" />
                        </div>
                    )}
                </div>
                {dealerHand.length > 0 && (
                    <div className="bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest z-20">
                        Dealer {gameState === 'GAME_OVER' ? dealerTotal : '?'}
                    </div>
                )}
            </div>

            {/* Player Zone */}
            <div className="relative z-10 flex flex-col items-center min-h-[160px]">
                <div className="flex items-center justify-center mb-4 pl-4">
                    {playerHand.length > 0 && (
                        playerHand.map((card, i) => (
                            <CardView key={card.key || i} card={card} index={i} total={playerHand.length} />
                        ))
                    )}
                    {playerHand.length === 0 && (
                        <div className="w-20 h-28 md:w-24 md:h-36 border-2 border-dashed border-zinc-800 rounded-xl opacity-20 flex items-center justify-center">
                            <Trophy className="text-zinc-700" />
                        </div>
                    )}
                </div>
                {playerHand.length > 0 && (
                    <div className="bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-widest shadow-[0_0_15px_rgba(223,255,0,0.1)] z-20">
                        Player {playerTotal}
                    </div>
                )}
            </div>

         </div>
      </div>

      {/* BOTTOM ACTION DRAWER */}
      <div className="h-auto md:min-h-[140px] bg-zinc-900 border-t border-zinc-800 p-4 pt-6 relative z-[60] flex flex-col justify-end pb-safe">
            {/* Status Ticker */}
            <div className="absolute -top-4 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur px-4 py-1.5 rounded-full text-zinc-300 text-[10px] font-mono shadow-xl border border-white/5 uppercase tracking-wider">
                    {gameState === 'BETTING' ? 'Place your bet' : gameState === 'PLAYER_TURN' ? 'Your Turn' : gameState === 'DEALER_TURN' ? 'Dealer Acting...' : 'Round Over'}
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto">
                {gameState === 'BETTING' ? (
                    <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4">
                        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest text-center">Select Wager</div>
                        <div className="flex justify-center gap-3 flex-wrap">
                            {BET_AMOUNTS.map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => startGame(amount)}
                                    disabled={processing}
                                    className="group relative bg-zinc-950 border border-zinc-700 hover:border-[#DFFF00] w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_rgba(223,255,0,0.2)]"
                                >
                                    <Coins size={16} className="text-zinc-500 group-hover:text-[#DFFF00] mb-1" />
                                    <span className="font-black font-mono text-sm md:text-base text-white group-hover:text-[#DFFF00]">{amount}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : gameState === 'PLAYER_TURN' ? (
                    <div className="grid grid-cols-2 gap-4 h-16 md:h-20 animate-in slide-in-from-bottom-4">
                        <button 
                            onClick={handleHit}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 rounded-xl font-black uppercase text-lg tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <Hand size={20} /> Hit
                        </button>
                        <button 
                            onClick={() => handleStand()}
                            className="bg-[#DFFF00] hover:bg-white text-black rounded-xl font-black uppercase text-lg tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(223,255,0,0.3)]"
                        >
                             Stand <ShieldAlert size={20} />
                        </button>
                    </div>
                ) : gameState === 'GAME_OVER' ? (
                    <div className="flex justify-center animate-in slide-in-from-bottom-4">
                         <button 
                            onClick={resetGame}
                            className="w-full md:w-auto px-12 py-4 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} /> New Round
                        </button>
                    </div>
                ) : (
                    <div className="h-16 flex items-center justify-center text-zinc-500 font-mono text-xs animate-pulse border border-dashed border-zinc-800 rounded-xl">
                        <Loader2 size={16} className="animate-spin mr-2" /> PROCESSING...
                    </div>
                )}
            </div>
      </div>
    </div>
  );
}