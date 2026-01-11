import fetch from 'node-fetch';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function main() {
    // Try the scoreboard for 2025
    const url = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=2025';
    console.log(`Fetching: ${url}`);
    const res = await fetch(url, { headers: HEADERS });
    const data = await res.json();
    
    const season = data.leagues?.[0]?.season;
    console.log("Current Season:", season);
    
    const calendar = data.leagues?.[0]?.calendar;
    console.log("Calendar Entries:", calendar?.length);
    
    if (calendar) {
        console.log("First 3 Calendar Entries:");
        calendar.slice(0, 3).forEach((c: any) => console.log(`  ${c.label} (${c.startDate} - ${c.endDate})`));
        
        console.log("Last 3 Calendar Entries:");
        calendar.slice(-3).forEach((c: any) => console.log(`  ${c.label} (${c.startDate} - ${c.endDate})`));
        
        // Try to find PNC Championship
        const pnc = calendar.find((c: any) => c.label.includes('PNC') || c.label.includes('Championship'));
        if (pnc) {
            console.log("\nFound PNC:", JSON.stringify(pnc, null, 2));
        }
    }
}

main();
