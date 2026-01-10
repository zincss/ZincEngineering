import { COMPANIES } from './data';

// --- PSEUDO-RANDOM NUMBER GENERATOR (Seeded) ---
// We need this so the "Random Walk" is the same on every server instance for a given time.
function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

// --- MARKET SIMULATION CONSTANTS ---
const DAY_MS = 24 * 60 * 60 * 1000;
const INTERVAL_MS = 15 * 60 * 1000; // 15 Minute resolution for "Macro" steps

// --- DETERMINISTIC PRICE CALCULATOR ---
function getPriceAtTimestamp(ticker: string, basePrice: number, volatility: number, timestamp: number) {
    // 1. Determine the "Trading Day" (Integer ID of the day)
    const dayID = Math.floor(timestamp / DAY_MS);
    
    // 2. Generate a unique seed for this Stock + Day combination
    // String hash + DayID
    const tickerCode = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const daySeed = dayID * 10000 + tickerCode;
    
    // 3. Initialize Random Generator for the Day
    const rng = mulberry32(daySeed);

    // 4. Determine "Day Parameters" (The story of the day)
    // - Trend: -1 (Bear), 0 (Flat), 1 (Bull)
    const trendRoll = rng(); 
    const dayTrend = trendRoll > 0.6 ? 1 : trendRoll < 0.4 ? -1 : 0;
    
    // - Volatility Multiplier for today (Some days are wild, some calm)
    const dayVol = volatility * (0.5 + rng()); 

    // 5. Calculate "Open" Price
    // To ensure continuity, Open Price *should* be yesterday's close.
    // However, for pure stateless simulation without a DB history of *all* time,
    // we cheat slightly: We base the "Day Open" on a macro-trend wave so stocks drift over months.
    const macroTrend = Math.sin((dayID + tickerCode) / 30) * 0.2; // Monthly drift +/- 20%
    const dayOpen = basePrice * (1 + macroTrend);

    // 6. Calculate Intraday Movement (The Random Walk)
    // We simulate the "walk" from the start of the day (00:00) to the current `timestamp`.
    const timeIntoDay = timestamp % DAY_MS;
    const steps = Math.floor(timeIntoDay / INTERVAL_MS); // How many 15-min steps passed?
    
    let currentPrice = dayOpen;
    let currentWalk = 0;

    // We can't loop 1000 times for every request. We need a closed-form approximation 
    // or a simplified walk. 
    // Optimization: We use a "Cumulative Noise" function based on sine waves + noise 
    // which effectively *looks* like a random walk but is O(1) to calculate.
    
    const t = timeIntoDay / DAY_MS; // 0.0 to 1.0 (Progress through day)

    // A. Trend Component (Linear drift based on dayTrend)
    const trendComponent = dayTrend * (dayVol * 2) * t; 

    // B. Random Walk Component (Simulated via layered sines for determinism)
    // High frequency noise
    const noise1 = Math.sin(t * 20 + rng() * 100) * dayVol * 0.5;
    // Medium frequency
    const noise2 = Math.sin(t * 5 + rng() * 50) * dayVol * 1.5;
    // Market shock (rare spikes)
    const shock = (Math.sin(t * 50 + tickerCode) > 0.95) ? (dayVol * 2) : 0;

    const totalChangePercent = trendComponent + noise1 + noise2 + shock;
    currentPrice = dayOpen * (1 + totalChangePercent);

    // 7. Micro-Jitter (Live Ticker feel)
    // Add tiny noise based on exact second to make it feel "live"
    const microJitter = (Math.sin(timestamp / 5000) * 0.002);
    currentPrice = currentPrice * (1 + microJitter);

    return Math.max(0.01, Number(currentPrice.toFixed(2)));
}

export function getCurrentPrice(ticker: string) {
    const company = COMPANIES.find(c => c.ticker === ticker);
    if (!company) return 0;
    return getPriceAtTimestamp(ticker, company.basePrice, company.volatility, Date.now());
}

export function getStockHistory(ticker: string, points = 24) {
    const company = COMPANIES.find(c => c.ticker === ticker);
    if (!company) return [];

    const history: number[] = [];
    const now = Date.now();
    const interval = 60 * 60 * 1000; // 1 Hour interval for chart history
    
    // Generate last 24 points
    for (let i = points; i >= 0; i--) {
        const time = now - (i * interval);
        history.push(getPriceAtTimestamp(ticker, company.basePrice, company.volatility, time));
    }
    return history;
}

export function getPercentageChange(current: number, base: number) {
    if (base === 0) return 0;
    return ((current - base) / base) * 100;
}