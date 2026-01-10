// app/sports/wagers/lib/odds.ts

function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0; 
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
}

/**
 * Calculates odds with a built-in house margin (overround).
 * @param fairProb The true probability of the outcome (0-1)
 * @param margin The house edge (e.g., 0.05 for 5%)
 */
function calculateLine(fairProb: number, margin: number = 0.05) {
    // Standardize prob to avoid 0 or 1
    const safeProb = Math.max(0.05, Math.min(0.95, fairProb));
    // Apply margin to the implied probability
    const juiceProb = safeProb * (1 + margin);
    // Convert to decimal odds
    const odds = 1 / juiceProb;
    return Number(Math.max(1.01, odds).toFixed(2));
}

export function generateOdds(homeRecord: string, awayRecord: string, league: 'nba' | 'nfl' = 'nba', matchId: string = "default") {
    const parseRecord = (rec: string) => {
        const [w, l] = rec.split('-').map(Number);
        if (isNaN(w) || isNaN(l)) return 0.5;
        if (w + l === 0) return 0.5;
        return w / (w + l);
    };

    const homeWinPct = parseRecord(homeRecord);
    const awayWinPct = parseRecord(awayRecord);
    
    // Calculate fair probability using a simple Elo-like gap
    // If teams are equal, fairHomeProb is 0.5
    let fairHomeProb = 0.5 + (homeWinPct - awayWinPct) * 0.6;
    fairHomeProb = Math.max(0.15, Math.min(0.85, fairHomeProb));
    const fairAwayProb = 1 - fairHomeProb;

    const rng = seededRandom(matchId);
    
    // MONEYLINE (H2H) - Standard 5% Margin
    const homeML = calculateLine(fairHomeProb, 0.05);
    const awayML = calculateLine(fairAwayProb, 0.05);

    // TOTALS & SPREADS - Juice Variation
    // Instead of fixed 1.91, we vary it slightly (e.g., 1.88 to 1.94)
    // while keeping the total margin consistent
    const baseJuice = 1.91;
    const juiceOffset = (rng * 0.06) - 0.03; // +/- 0.03
    const sideAOdds = Number((baseJuice + juiceOffset).toFixed(2));
    const sideBOdds = Number((baseJuice - juiceOffset).toFixed(2));

    // Seeded totals
    const totalBase = league === 'nfl' ? 44.5 : 222.5;
    const total = totalBase + (rng * 10 - 5);

    // Seeded spreads
    const spreadMultiplier = league === 'nfl' ? 14 : 20;
    const spread = Math.abs(Math.round((homeWinPct - awayWinPct) * spreadMultiplier * 2) / 2) || 1.5;

    return {
        moneyline: {
            home: homeML,
            away: awayML
        },
        spread: {
            value: spread,
            favorite: fairHomeProb > 0.5 ? 'home' : 'away',
            odds: sideAOdds, // One side gets offset A
            dogOdds: sideBOdds  // Other side gets offset B
        },
        total: {
            value: Math.round(total * 2) / 2,
            overOdds: sideAOdds,
            underOdds: sideBOdds
        }
    };
}
