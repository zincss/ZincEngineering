'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import BackButton from '@/app/components/BackButton';
import { Coins, Layers, RotateCcw, Shield, ShieldAlert, Trophy, Wallet } from 'lucide-react';

// --- TYPES ---
type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  isHidden?: boolean;
}

type GameState = 'BETTING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'GAME_OVER';

// --- CONFIGURATION ---
const BET_AMOUNTS = [10, 50, 100, 500, 1000];

// --- HELPER FUNCTIONS ---
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
      deck.push({ suit, rank, value: getCardValue(rank) });
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

// --- COMPONENTS ---

const CardDisplay = ({ card, index }: { card: Card; index: number }) => {
  if (card.isHidden) {
    return (
      <div 
        className="w-24 h-36 md:w-32 md:h-48 bg-zinc-900 border-2 border-zinc-800 rounded-xl flex items-center justify-center relative overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105"
        style={{ 
            zIndex: index, 
            marginLeft: index > 0 ? '-3rem' : '0',
            backgroundImage: 'repeating-linear-gradient(45deg, #18181b 0, #18181b 10px, #27272a 10px, #27272a 20px)'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Shield size={48} />
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
  const SuitIcon = () => {
      switch(card.suit) {
          case 'HEARTS': return <span className="text-red-500">♥</span>;
          case 'DIAMONDS': return <span className="text-red-500">♦</span>;
          case 'SPADES': return <span className="text-zinc-200">♠</span>;
          case 'CLUBS': return <span className="text-zinc-200">♣</span>;
      }
  };

  return (
    <div 
      className={`
        relative w-24 h-36 md:w-32 md:h-48 bg-zinc-950 border-2 rounded-xl flex flex-col justify-between p-3 shadow-2xl transform transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in
        ${['J', 'Q', 'K'].includes(card.rank) ? 'border-[#DFFF00]/50' : 'border-zinc-800'}
        ${card.rank === 'A' ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}
      `}
      style={{ zIndex: index, marginLeft: index > 0 ? '-3rem' : '0' }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black rounded-xl z-0" />
      
      {/* Top Left */}
      <div className="relative z-10 flex flex-col items-center w-6">
        <span className={`text-xl md:text-2xl font-black font-mono leading-none ${isRed ? 'text-red-500' : 'text-white'}`}>
            {card.rank}
        </span>
        <div className="text-sm"><SuitIcon /></div>
      </div>

      {/* Center Art (Text based for now, could be icons) */}
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-10 font-black text-6xl select-none pointer-events-none">
         <SuitIcon />
      </div>

      {/* Bottom Right */}
      <div className="relative z-10 flex flex-col items-center w-6 self-end rotate-180">
        <span className={`text-xl md:text-2xl font-black font-mono leading-none ${isRed ? 'text-red-500' : 'text-white'}`}>
            {card.rank}
        </span>
        <div className="text-sm"><SuitIcon /></div>
      </div>
    </div>
  );
};

export default function BlackjackPage() {
  const { user, profile, refreshProfile } = useAuth();
  
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>('BETTING');
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  // --- AUDIO / SFX (Placeholder for now) ---
  const playSound = (type: 'deal' | 'chip' | 'win') => {
      // Future implementation
  };

  // --- GAME LOGIC ---

  const startGame = async (amount: number) => {
    if (!profile || profile.credits < amount) {
        alert("INSUFFICIENT FUNDS");
        return;
    }

    setProcessing(true);
    
    // 1. Deduct Credits Optimistically (or via RPC)
    try {
        const { error } = await supabase.rpc('add_credits', { amount: -amount });
        if (error) throw error;
        
        await refreshProfile(); // Sync UI
        
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
    setGameState('DEALER_TURN');
    
    // Reveal Dealer Card
    // FIX: We explicitly type this variable as Card[] to prevent Type narrowing issues
    let newDHand: Card[] = currentDHand.map(c => ({ ...c, isHidden: false }));
    let newDeck = [...currentDeck];

    // Dealer AI (Hit until 17)
    // We use a small delay loop for dramatic effect
    const playDealer = async () => {
        setDealerHand([...newDHand]); // Show reveal
        
        // Small delay before drawing
        await new Promise(r => setTimeout(r, 600));

        while (calculateHandValue(newDHand) < 17) {
            const card = newDeck.pop()!;
            newDHand = [...newDHand, card];
            setDealerHand([...newDHand]);
            setDeck(newDeck);
            await new Promise(r => setTimeout(r, 800)); // Animation delay
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

    if (result === 'BUST') {
        msg = "SYSTEM FAILURE // BUST";
    } else if (result === 'LOSE') {
        msg = "DEALER WINS // CREDITS LOST";
    } else if (result === 'PUSH') {
        msg = "PUSH // CREDITS REFUNDED";
        payout = bet;
    } else if (result === 'WIN') {
        msg = "VICTORY // CREDITS ACQUIRED";
        payout = bet * 2;
    } else if (result === 'BLACKJACK') {
        msg = "CRITICAL SUCCESS // BLACKJACK";
        payout = bet * 2.5;
    }

    setMessage(msg);

    if (payout > 0) {
        try {
            await supabase.rpc('add_credits', { amount: payout });
            refreshProfile();
        } catch (e) {
            console.error("Payout Failed", e);
        }
    }
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black flex flex-col relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10">
          <BackButton href="/play" label="ARCADE HUB" />
          <div className="pt-32 px-6 max-w-7xl mx-auto flex justify-between items-end border-b border-zinc-800 pb-6">
            <div>
                <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-sm font-black tracking-widest uppercase mb-2">
                    <Layers size={16} />
                    <span>TACTICAL_OPERATIONS // BLACKJACK</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    Table <span className="text-zinc-600">Protocol</span>
                </h1>
            </div>
            
            <div className="text-right">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Balance</div>
                <div className="text-2xl font-mono font-black text-[#DFFF00] flex items-center gap-2 justify-end">
                    <Wallet size={20} />
                    {profile?.credits.toLocaleString() || 0}
                </div>
            </div>
          </div>
      </div>

      {/* MAIN GAME AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-20 min-h-[600px]">
        
        {/* DEALER AREA */}
        <div className="mb-12 flex flex-col items-center">
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ShieldAlert size={12} />
                DEALER HAND {gameState === 'GAME_OVER' && `(${calculateHandValue(dealerHand)})`}
            </div>
            <div className="flex justify-center h-36 md:h-48">
                {dealerHand.map((card, i) => (
                    <CardDisplay key={i} card={card} index={i} />
                ))}
                {dealerHand.length === 0 && (
                    <div className="w-24 h-36 md:w-32 md:h-48 border-2 border-dashed border-zinc-800 rounded-xl opacity-20" />
                )}
            </div>
        </div>

        {/* CENTER STATUS / MESSAGE */}
        <div className="h-16 mb-8 flex items-center justify-center">
            {message && (
                <div className="bg-[#DFFF00] text-black px-6 py-2 rounded-full font-black font-mono text-sm md:text-base uppercase tracking-widest animate-in zoom-in slide-in-from-bottom-4 shadow-[0_0_20px_rgba(223,255,0,0.4)]">
                    {message}
                </div>
            )}
        </div>

        {/* PLAYER AREA */}
        <div className="mb-12 flex flex-col items-center">
            <div className="flex justify-center h-36 md:h-48">
                {playerHand.map((card, i) => (
                    <CardDisplay key={i} card={card} index={i} />
                ))}
                {playerHand.length === 0 && (
                    <div className="w-24 h-36 md:w-32 md:h-48 border-2 border-dashed border-zinc-800 rounded-xl opacity-20" />
                )}
            </div>
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
                <Trophy size={12} />
                PLAYER HAND {playerHand.length > 0 && `(${calculateHandValue(playerHand)})`}
            </div>
        </div>

        {/* CONTROLS */}
        <div className="w-full max-w-2xl mx-auto">
            {gameState === 'BETTING' ? (
                <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in">
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6">Select Buy-In Amount</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {BET_AMOUNTS.map(amount => (
                            <button
                                key={amount}
                                onClick={() => startGame(amount)}
                                disabled={processing}
                                className="group relative bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(223,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Coins size={24} className="text-zinc-600 group-hover:text-[#DFFF00] mb-2 transition-colors" />
                                <span className="font-black font-mono text-lg text-white group-hover:text-[#DFFF00]">{amount}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : gameState === 'PLAYER_TURN' ? (
                <div className="flex justify-center gap-6 animate-in slide-in-from-bottom-8 fade-in">
                    <button 
                        onClick={handleHit}
                        className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest rounded-xl border border-zinc-700 hover:border-white transition-all min-w-[140px]"
                    >
                        HIT
                    </button>
                    <button 
                        onClick={() => handleStand()}
                        className="px-8 py-4 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(223,255,0,0.3)] transition-all min-w-[140px]"
                    >
                        STAND
                    </button>
                </div>
            ) : gameState === 'GAME_OVER' ? (
                <div className="flex justify-center animate-in slide-in-from-bottom-8 fade-in">
                    <button 
                        onClick={() => {
                            setGameState('BETTING');
                            setPlayerHand([]);
                            setDealerHand([]);
                            setMessage('');
                        }}
                        className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#DFFF00] transition-all shadow-lg"
                    >
                        <RotateCcw size={18} />
                        New Hand
                    </button>
                </div>
            ) : (
                <div className="h-12 flex items-center justify-center text-zinc-500 font-mono text-xs animate-pulse">
                    PROCESSING DEALER PROTOCOL...
                </div>
            )}
        </div>

      </div>
    </div>
  );
}