import { COMPANIES, Company } from './data';

// --- PSEUDO-RANDOM NOISE GENERATOR ---
// Returns a value between -1 and 1 based on a seed.
// This is deterministic: same seed = same value.
function noise(index: number) {
    let n = Math.sin(index * 12.9898) * 43758.5453;
    return n - Math.floor(n);
}

// --- FRACTAL BROWNIAN MOTION (Smart Randomness) ---
// This combines multiple layers of noise ("octaves") to create realistic charts.
// Octave 1: Long term trend (Months)
// Octave 2: Mid term trend (Weeks)
// Octave 3: Short term trend (Days)
// Octave 4: Intraday volatility (Hours)
function getFractalNoise(tickerCode: number, timestamp: number, volatility: number) {
    const t = timestamp / 1000; // Convert to seconds
    
    // Create unique offset per stock so they don't all move identically
    const offset = tickerCode * 1000; 

    // Layer 1: The "Macro" Trend (Very slow moving)
    const trend = Math.sin((t + offset) / 100000) * 0.5;

    // Layer 2: The "Sector" Drift (Medium speed)
    // We use the tickerCode to simulate sector grouping roughly
    const drift = Math.sin((t + offset) / 10000) * 0.3;

    // Layer 3: The "Daily" Volatility (Fast noise)
    // Using a pseudo-random walk function here
    const dayBlock = Math.floor(t / 3600); // Hourly blocks
    const randomWalk = (noise(dayBlock + tickerCode) - 0.5) * 2; // -1 to 1

    // Combine them
    // Volatility scales the impact of the random walk
    return trend + drift + (randomWalk * volatility * 3);
}

export function getCurrentPrice(ticker: string) {
    return calculatePriceAtTime(ticker, Date.now());
}

export function getStockHistory(ticker: string, points = 24) {
    const history: number[] = [];
    const now = Date.now();
    const interval = 1000 * 60 * 60; // 1 Hour per data point for history
    
    for (let i = points; i >= 0; i--) {
        const time = now - (i * interval);
        history.push(calculatePriceAtTime(ticker, time));
    }
    return history;
}

function calculatePriceAtTime(ticker: string, timestamp: number) {
    const company = COMPANIES.find(c => c.ticker === ticker);
    if (!company) return 0;

    // Generate a numerical seed from the ticker string for deterministic randomness
    const tickerCode = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Get the smart noise value (-X to +X)
    const noiseValue = getFractalNoise(tickerCode, timestamp, company.volatility);

    // Apply to base price
    // We limit the downside so stocks rarely go to 0, but can skyrocket
    let multiplier = 1 + noiseValue;
    
    // Ensure minimal price of 1.00
    let price = Math.max(1, company.basePrice * multiplier);

    // Add a tiny bit of "Micro-Jitter" so it looks live when refreshing fast
    const jitter = (Math.random() - 0.5) * (company.basePrice * 0.005);

    return Number((price + jitter).toFixed(2));
}

export function getPercentageChange(current: number, base: number) {
    return ((current - base) / base) * 100;
}