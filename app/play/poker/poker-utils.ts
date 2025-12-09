// app/play/poker/poker-utils.ts

export type Suit = 'H' | 'D' | 'C' | 'S';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export const createDeck = (): Card[] => {
  const suits: Suit[] = ['H', 'D', 'C', 'S'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];
  ranks.forEach((rank, i) => {
    suits.forEach(suit => {
      deck.push({ suit, rank, value: i + 2 });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

// --- HAND EVALUATION ---
export const evaluateHand = (holeCards: Card[], communityCards: Card[]): { type: string, score: number, name: string, winningCards: Card[] } => {
  const allCards = [...holeCards, ...communityCards].sort((a, b) => b.value - a.value);
  
  // 1. Flush Check
  const suits = { H: [] as Card[], D: [] as Card[], C: [] as Card[], S: [] as Card[] };
  allCards.forEach(c => suits[c.suit].push(c));
  const flushSuit = (Object.keys(suits) as Suit[]).find(s => suits[s].length >= 5);
  const flushCards = flushSuit ? suits[flushSuit] : [];

  // 2. Straight Check Helper
  const getStraight = (cards: Card[]): Card[] | null => {
      const uniqueVals = Array.from(new Set(cards.map(c => c.value))).sort((a, b) => b - a);
      let streak: number[] = [];
      
      for (const val of uniqueVals) {
          if (streak.length === 0 || streak[streak.length - 1] - val === 1) {
              streak.push(val);
              if (streak.length === 5) break;
          } else {
              streak = [val];
          }
      }

      // Wheel Check (A, 5, 4, 3, 2)
      if (streak.length < 5 && uniqueVals.includes(14) && uniqueVals.includes(2) && uniqueVals.includes(3) && uniqueVals.includes(4) && uniqueVals.includes(5)) {
          streak = [5, 4, 3, 2, 14];
      }

      if (streak.length === 5) {
          return streak.map(val => cards.find(c => c.value === val)!);
      }
      return null;
  };

  const straightCards = getStraight(allCards);

  // 3. Counts for Pairs/Trips
  const counts: Record<number, Card[]> = {};
  allCards.forEach(c => {
      if (!counts[c.value]) counts[c.value] = [];
      counts[c.value].push(c);
  });
  
  const quads = Object.values(counts).find(c => c.length === 4);
  const trips = Object.values(counts).filter(c => c.length === 3).sort((a,b) => b[0].value - a[0].value);
  const pairs = Object.values(counts).filter(c => c.length === 2).sort((a,b) => b[0].value - a[0].value);

  // --- HIERARCHY ---

  // Straight Flush
  if (flushCards.length >= 5) {
      const straightFlush = getStraight(flushCards);
      if (straightFlush) {
          return { type: 'STRAIGHT_FLUSH', score: 8000000 + straightFlush[0].value, name: 'Straight Flush', winningCards: straightFlush };
      }
  }

  // Quads
  if (quads) {
      const kicker = allCards.find(c => c.value !== quads[0].value)!;
      return { type: 'QUADS', score: 7000000 + quads[0].value, name: 'Four of a Kind', winningCards: [...quads, kicker] };
  }

  // Full House
  if (trips.length > 0 && pairs.length > 0) {
      return { type: 'FULL_HOUSE', score: 6000000 + trips[0][0].value, name: 'Full House', winningCards: [...trips[0], ...pairs[0]] };
  }
  if (trips.length > 1) {
      return { type: 'FULL_HOUSE', score: 6000000 + trips[0][0].value, name: 'Full House', winningCards: [...trips[0], ...trips[1].slice(0, 2)] };
  }

  // Flush
  if (flushCards.length >= 5) {
      return { type: 'FLUSH', score: 5000000 + flushCards[0].value, name: 'Flush', winningCards: flushCards.slice(0, 5) };
  }

  // Straight
  if (straightCards) {
      return { type: 'STRAIGHT', score: 4000000 + straightCards[0].value, name: 'Straight', winningCards: straightCards };
  }

  // Trips
  if (trips.length > 0) {
      const kickers = allCards.filter(c => c.value !== trips[0][0].value).slice(0, 2);
      return { type: 'TRIPS', score: 3000000 + trips[0][0].value, name: 'Three of a Kind', winningCards: [...trips[0], ...kickers] };
  }

  // Two Pair
  if (pairs.length >= 2) {
      const kicker = allCards.find(c => c.value !== pairs[0][0].value && c.value !== pairs[1][0].value)!;
      return { type: 'TWO_PAIR', score: 2000000 + pairs[0][0].value, name: 'Two Pair', winningCards: [...pairs[0], ...pairs[1], kicker] };
  }

  // Pair
  if (pairs.length === 1) {
      const kickers = allCards.filter(c => c.value !== pairs[0][0].value).slice(0, 3);
      return { type: 'PAIR', score: 1000000 + pairs[0][0].value, name: 'Pair', winningCards: [...pairs[0], ...kickers] };
  }
  
  // High Card
  return { type: 'HIGH_CARD', score: allCards[0].value, name: 'High Card', winningCards: allCards.slice(0, 5) };
};

// --- IMPROVED AI BRAIN ---
export const getAIDecision = (
  difficulty: 'ROOKIE' | 'PRO' | 'ELITE', 
  hand: Card[], 
  community: Card[], 
  currentBet: number, 
  botCurrentBet: number,
  isPreFlop: boolean
): 'FOLD' | 'CALL' | 'RAISE' | 'CHECK' => {
  
  const costToCall = currentBet - botCurrentBet;
  const handStrength = evaluateHand(hand, community);
  const score = handStrength.score;
  const random = Math.random();
  
  // Basic Hand Analysis
  const isPair = hand[0].value === hand[1].value;
  const isSuited = hand[0].suit === hand[1].suit;
  const highCard = Math.max(hand[0].value, hand[1].value);
  const lowCard = Math.min(hand[0].value, hand[1].value);
  const isConnected = highCard - lowCard === 1;

  // --- ROOKIE AI ---
  // Loose-Passive. Calls too much. Rarely raises unless monster. Folds only garbage.
  if (difficulty === 'ROOKIE') {
      if (costToCall === 0) return 'CHECK';
      
      if (isPreFlop) {
          // Calls almost any face card or pair
          if (highCard >= 10 || isPair || isSuited) return 'CALL';
          // Randomly calls with trash 30% of time
          return random > 0.7 ? 'CALL' : 'FOLD';
      } else {
          // Post-flop: Calls with any pair or draw
          if (score >= 1000000) return 'CALL'; // Pair or better
          // Chase any flush/straight draw (naive check: just random call frequency)
          if (random > 0.6) return 'CALL'; 
          return 'FOLD';
      }
  }

  // --- PRO AI ---
  // Tight-Aggressive (TAG). Folds weak hands. Raises strong hands. Value bets.
  if (difficulty === 'PRO') {
      if (isPreFlop) {
          // Raise Pairs 10+, AK, AQ
          if (isPair && highCard >= 10) return 'RAISE';
          if (highCard === 14 && lowCard >= 12) return 'RAISE';
          
          // Call Small Pairs, Suited Connectors, High Cards
          if (isPair) return 'CALL';
          if (isSuited && isConnected) return 'CALL';
          if (highCard >= 12) return 'CALL';

          if (costToCall === 0) return 'CHECK';
          return 'FOLD';
      } else {
          // Post-Flop
          if (score >= 3000000) return 'RAISE'; // Trips or better
          if (score >= 2000000) return 'RAISE'; // Two Pair (Aggressive)
          if (score >= 1000000) {
              // Top Pair check (approximate)
              if (handStrength.winningCards[0].value >= 12) return 'RAISE';
              return 'CALL';
          }
          
          if (costToCall === 0) return 'CHECK';
          return 'FOLD';
      }
  }

  // --- ELITE AI ---
  // Loose-Aggressive / Balanced (LAG). Mixes it up. Bluffs. Defends blinds.
  if (difficulty === 'ELITE') {
    // Bluff chance
    const bluff = random < 0.15; 

    if (isPreFlop) {
        // Aggressive Raising
        if (isPair || (highCard >= 13) || (isSuited && highCard >= 10)) return 'RAISE';
        
        // Defend wide
        if (highCard >= 10 || isConnected || isSuited) return 'CALL';
        
        // 3-bet bluff light
        if (bluff && costToCall > 0) return 'RAISE';

        if (costToCall === 0) return 'CHECK';
        return 'FOLD';
    } else {
        // Monster: Slow play or Fast play mixed
        if (score >= 4000000) { // Straight or better
             return random > 0.7 ? 'CALL' : 'RAISE'; // Trapping 30% of time
        }

        // Strong Value
        if (score >= 2000000) return 'RAISE'; 

        // Marginal / Draws
        if (score >= 1000000) return 'CALL'; // Pair
        
        // Bluff at pot if checked to
        if (costToCall === 0 && bluff) return 'RAISE';

        if (costToCall === 0) return 'CHECK';
        
        // Float occasionally
        if (random > 0.8 && highCard >= 13) return 'CALL';

        return 'FOLD';
    }
  }

  return 'CHECK';
};