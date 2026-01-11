
import fetch from 'node-fetch';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function main() {
    console.log("⛳️ Debugging Golf Stats...");
    
    // FedEx Cup Standings
    // Using the URL from api.ts
    const url = 'https://site.web.api.espn.com/apis/common/v3/sports/golf/pga/statistics/byathlete?sort=cupPoints:desc&limit=5';
    
    console.log(`Fetching: ${url}`);
    
    try {
        const res = await fetch(url, { headers: HEADERS });
        const data = await res.json();
        
        console.log("Root Keys:", Object.keys(data));
        if (data.athletes) {
            console.log("Athletes Found:", data.athletes.length);
            data.athletes.forEach((a: any, i: number) => console.log(`[${i}] ${a.athlete.displayName} - ${a.displayValue}`));
        } else {
            console.log("No athletes found.");
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

main();
