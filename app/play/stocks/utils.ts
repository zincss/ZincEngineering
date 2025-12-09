import { COMPANIES } from './data';

// Deterministic random number generator based on time
// This ensures all users see roughly the same price at the same time
function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function getCurrentPrice(ticker: string) {
    const company = COMPANIES.find(c => c.ticker === ticker);
    if (!company) return 0;

    const now = Date.now();
    // Create a time block of 10 seconds to keep price stable briefly
    const timeBlock = Math.floor(now / 10000); 
    
    // Generate a noise factor using sine waves for realistic "market" movement
    // We combine a slow wave (trend) and a fast wave (noise)
    const slowWave = Math.sin(now / 100000); // Daily trend
    const fastWave = Math.sin(now / 5000);   // Minute fluctuations
    
    const noise = (slowWave * 0.5 + fastWave * 0.5) * company.volatility;
    
    // Calculate new price
    let price = company.basePrice + (company.basePrice * noise);
    
    // Add a randomized jitter that changes every refresh but stays within logic
    const jitter = (seededRandom(timeBlock + company.basePrice) - 0.5) * 5;
    
    return Number(Math.max(1, price + jitter).toFixed(2));
}

export function getPercentageChange(currentPrice: number, basePrice: number) {
    const change = ((currentPrice - basePrice) / basePrice) * 100;
    return change.toFixed(2);
}