// app/play/bookies/utils.ts

// Convert Win % to Decimal Odds (e.g., 0.750 win rate -> 1.25 odds)
// We add a small "house edge" so odds aren't too generous.
export function calculateOdds(homePct: number, awayPct: number) {
  // Default to 0.500 if no data (season start)
  const h = homePct || 0.5;
  const a = awayPct || 0.5;

  // Calculate raw probability
  const total = h + a;
  const homeProb = h / total;
  const awayProb = a / total;

  // Convert to Decimal Odds (1 / Probability)
  // 0.95 is the "House Edge" (5% vig)
  let homeOdds = (1 / homeProb) * 0.95;
  let awayOdds = (1 / awayProb) * 0.95;

  // Clamp odds to keep them realistic (e.g., min 1.05, max 10.0)
  return {
    home: Number(Math.max(1.05, Math.min(10, homeOdds)).toFixed(2)),
    away: Number(Math.max(1.05, Math.min(10, awayOdds)).toFixed(2))
  };
}