import { COMPANIES, Company } from './data';

// --- PSEUDO-RANDOM NOISE GENERATOR ---
function noise(index: number) {
    let n = Math.sin(index * 12.9898) * 43758.5453;
    return n - Math.floor(n);
}

// --- FRACTAL BROWNIAN MOTION (Smart Randomness) ---
function getFractalNoise(tickerCode: number, timestamp: number, volatility: number) {
    const t = timestamp / 1000; // Convert to seconds
    const offset = tickerCode * 1000; 

    // Layer 1: The "Macro" Trend
    const trend = Math.sin((t + offset) / 100000) * 0.5;

    // Layer 2: The "Sector" Drift
    const drift = Math.sin((t + offset) / 10000) * 0.3;

    // Layer 3: The "Daily" Volatility
    const dayBlock = Math.floor(t / 3600); // Hourly blocks
    const randomWalk = (noise(dayBlock + tickerCode) - 0.5) * 2; // -1 to 1

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

    const tickerCode = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const noiseValue = getFractalNoise(tickerCode, timestamp, company.volatility);

    let multiplier = 1 + noiseValue;
    let price = Math.max(1, company.basePrice * multiplier);
    
    // Add "Micro-Jitter"
    const jitter = (Math.random() - 0.5) * (company.basePrice * 0.005);

    return Number((price + jitter).toFixed(2));
}

export function getPercentageChange(current: number, base: number) {
    return ((current - base) / base) * 100;
}