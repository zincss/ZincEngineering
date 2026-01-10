import { COMPANIES, Company } from './data';

// --- DETERMINISTIC NOISE GENERATOR ---
// Returns a value between -1 and 1 based on a seed.
// No Math.random() allowed to ensure continuity across deployments.
function noise(index: number) {
    let n = Math.sin(index * 12.9898 + 0.123) * 43758.5453;
    return n - Math.floor(n);
}

// --- FRACTAL BROWNIAN MOTION ---
// Strictly deterministic based on wall-clock time.
function getFractalNoise(tickerCode: number, timestamp: number, volatility: number) {
    const t = timestamp / 1000; // Convert to seconds
    const offset = tickerCode * 1337.42; 

    // Layer 1: The "Macro" Trend (Changes over weeks/months)
    const trend = Math.sin((t + offset) / 500000) * 0.6;

    // Layer 2: The "Sector" Drift (Changes over days)
    const drift = Math.sin((t + offset) / 20000) * 0.3;

    // Layer 3: Intraday Volatility (Hourly blocks)
    // We use a deterministic pseudo-random walk based on the hour
    const hourBlock = Math.floor(t / 3600);
    const hourNoise = (noise(hourBlock + tickerCode) - 0.5) * 2;

    // Layer 4: Minute Jitter
    const minBlock = Math.floor(t / 60);
    const minNoise = (noise(minBlock + tickerCode * 2) - 0.5) * 0.5;

    return trend + drift + (hourNoise * volatility * 2) + (minNoise * volatility);
}

export function getCurrentPrice(ticker: string) {
    return calculatePriceAtTime(ticker, Date.now());
}

export function getStockHistory(ticker: string, points = 24) {
    const history: number[] = [];
    const now = Date.now();
    const interval = 1000 * 60 * 60; // 1 Hour per data point
    
    for (let i = points; i >= 0; i--) {
        const time = now - (i * interval);
        history.push(calculatePriceAtTime(ticker, time, true));
    }
    return history;
}

function calculatePriceAtTime(ticker: string, timestamp: number, isHistory = false) {
    const company = COMPANIES.find(c => c.ticker === ticker);
    if (!company) return 0;

    const tickerCode = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const noiseValue = getFractalNoise(tickerCode, timestamp, company.volatility);

    let multiplier = 1 + noiseValue;
    let price = Math.max(1, company.basePrice * multiplier);

    // DETERMINISTIC JITTER:
    // Only apply if not calculating history to keep charts clean, 
    // but give "Live" prices a tiny deterministic pulse.
    if (!isHistory) {
        const pulse = Math.sin(timestamp / 1000) * (price * 0.001);
        price += pulse;
    }

    return Number(price.toFixed(2));
}

export function getPercentageChange(current: number, base: number) {
    return ((current - base) / base) * 100;
}
