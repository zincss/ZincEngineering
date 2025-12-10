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
// Returns a numeric score to rank hands against each other
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

// --- HELPER: DETECT DRAWS (Improves AI "Smartness") ---
// Checks if we have 4 cards to a flush or open straight
const getDrawStrength = (hand: Card[], community: Card[]): number => {
    if (community.length === 0) return 0;
    const all = [...hand, ...community];
    
    // Flush Draw (4 same suit)
    const suits = { H: 0, D: 0, C: 0, S: 0 };
    all.forEach(c => suits[c.suit]++);
    const hasFlushDraw = Object.values(suits).some(count => count === 4);

    // Straight Draw (simplified: 4 unique values in a 5-range)
    // This is computationally lighter than a full straight check but decent for AI approximation
    const vals = Array.from(new Set(all.map(c => c.value))).sort((a,b) => a-b);
    let hasStraightDraw = false;
    for(let i=0; i<vals.length-3; i++) {
        if(vals[i+3] - vals[i] <= 4) hasStraightDraw = true;
    }

    let strength = 0;
    if (hasFlushDraw) strength += 0.25; // Roughly 20-35% equity
    if (hasStraightDraw) strength += 0.15; // Roughly 15-30% equity
    return strength;
};

// --- HUMANIZED AI BRAIN ---
export const getAIDecision = (
  difficulty: 'ROOKIE' | 'PRO' | 'ELITE', 
  hand: Card[], 
  community: Card[], 
  currentBet: number, 
  botCurrentBet: number,
  isPreFlop: boolean,
  blind: number,
  potSize: number, // NEW: Needed for Pot Odds
  botChips: number // NEW: Needed for Stack Commitment
): 'FOLD' | 'CALL' | 'RAISE' | 'CHECK' => {
  
  const callCost = currentBet - botCurrentBet;
  const totalPotAfterCall = potSize + callCost;
  
  // 1. CALCULATE POT ODDS (The "Price" of the call)
  // 0.1 means we only need 10% equity to call. 0.8 means we need 80%.
  // If callCost is 0, odds are 0 (free card).
  const potOdds = totalPotAfterCall > 0 ? callCost / totalPotAfterCall : 0;

  // 2. ASSESS HAND EQUITY (0.0 - 1.0)
  // We approximate win chance based on score tier
  const result = evaluateHand(hand, community);
  const score = result.score;
  let estimatedEquity = 0.0;

  if (score > 8000000) estimatedEquity = 0.99; // Straight Flush
  else if (score > 7000000) estimatedEquity = 0.95; // Quads
  else if (score > 6000000) estimatedEquity = 0.85; // Full House
  else if (score > 5000000) estimatedEquity = 0.80; // Flush
  else if (score > 4000000) estimatedEquity = 0.70; // Straight
  else if (score > 3000000) estimatedEquity = 0.60; // Trips
  else if (score > 2000000) estimatedEquity = 0.50; // Two Pair
  else if (score > 1000000) estimatedEquity = 0.35; // One Pair (varies wildly, avg 35-50)
  else estimatedEquity = 0.10; // High Card

  // Adjust Pre-Flop Equity specifically
  if (isPreFlop) {
      const v1 = hand[0].value;
      const v2 = hand[1].value;
      const high = Math.max(v1, v2);
      const isPair = v1 === v2;
      const isSuited = hand[0].suit === hand[1].suit;

      // Tiered Preflop Strength
      if (isPair) {
          if (high >= 10) estimatedEquity = 0.8; // TT+ (Monster)
          else estimatedEquity = 0.6; // 22-99 (Decent)
      } else if (high >= 12 && v2 >= 10) {
          estimatedEquity = 0.55; // AJ+ (Strong)
      } else if (isSuited && high >= 10) {
          estimatedEquity = 0.45; // Speculative
      } else {
          estimatedEquity = 0.15; // Trash
      }
  } else {
      // Add Draw Potential Post-Flop
      estimatedEquity += getDrawStrength(hand, community);
  }

  // 3. ADD "HUMAN NOISE" (Fuzziness)
  // This prevents robots from always folding 49% and calling 50%.
  // ELITE has less noise (more precise), ROOKIE has high noise.
  const noiseFactor = difficulty === 'ROOKIE' ? 0.20 : difficulty === 'PRO' ? 0.10 : 0.05;
  const humanEquity = estimatedEquity + (Math.random() * noiseFactor * 2 - noiseFactor); // +/- noise

  // 4. DETERMINE VALUE RATIO
  // Ratio > 1.0 means Positive Expected Value (+EV)
  // If Pot Odds are 0 (Check), Ratio is Infinity (Always check unless bluffing)
  const valueRatio = potOdds > 0 ? humanEquity / potOdds : 999;

  // 5. SAFETY VALVES (Prevent Infinite Loops)
  // If we are already deep in the pot (e.g. 50% of stack committed) or bet is huge
  const isCommitted = (callCost / botChips) > 0.4; 
  const isMonster = score > 3000000 || (isPreFlop && hand[0].value === hand[1].value && hand[0].value >= 12); // Trips+ or QQ+
  
  // --- DECISION LOGIC BY PERSONALITY ---

  if (difficulty === 'ROOKIE') {
      // Volatile. Chases draws too much.
      if (potOdds === 0) return 'CHECK';
      
      // Calls if ratio is barely okay, or just feels lucky (random 15%)
      if (valueRatio > 0.8 || Math.random() < 0.15) return 'CALL';
      return 'FOLD';
  }

  if (difficulty === 'PRO') {
      // Solid Math.
      if (potOdds === 0) return 'CHECK';

      // Raise Value: Strong +EV and not just trying to trap
      if (valueRatio > 2.0 && !isCommitted) return 'RAISE';
      
      // Call Value: Decent +EV
      if (valueRatio > 1.0) return 'CALL';
      
      return 'FOLD';
  }

  if (difficulty === 'ELITE') {
      // Aggressive but Smart.
      const bluffChance = 0.15; 
      
      // Prevent infinite raising wars:
      // If the bet is already high relative to stack, just CALL unless we have the absolute nuts.
      const isHighStakes = currentBet > (blind * 10);
      
      if (potOdds === 0) {
          // Check-Raise Bluff Opportunity
          if (Math.random() < bluffChance) return 'RAISE';
          return 'CHECK';
      }

      // If we have a monster, mix up calling and raising (trapping)
      if (isMonster) {
          // If stakes are already high, just call to keep them in.
          if (isHighStakes) return 'CALL';
          return Math.random() > 0.3 ? 'RAISE' : 'CALL';
      }

      // Strong Hand
      if (valueRatio > 1.3) {
          // If committed or high stakes, just call (stop re-raising loops)
          if (isCommitted || isHighStakes) return 'CALL';
          return 'RAISE';
      }

      // Marginal / Draw Hand
      if (valueRatio > 0.95) return 'CALL';

      // Bluff Raise (Only if not expensive)
      if (potOdds < 0.3 && Math.random() < bluffChance) return 'RAISE';

      return 'FOLD';
  }

  return 'CHECK';
};