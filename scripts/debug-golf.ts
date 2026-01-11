
import fetch from 'node-fetch';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function main() {
    console.log("⛳️ Fetching Golf Data...");
    
    // Switch to WEB API leaderboard endpoint
    const url = 'https://site.web.api.espn.com/apis/v2/sports/golf/leaderboard?league=pga';
    const res = await fetch(url, { headers: HEADERS });
    const data = await res.json();
    
    // Check structure
    console.log("Season:", data.season?.year);
    // Usually 'events' or 'competitions'
    const event = data.events?.[0];
    console.log("Event:", event?.name);
    
    const competitors = event?.competitions?.[0]?.competitors;
    console.log("Competitors Count:", competitors?.length);
    if (competitors && competitors.length > 0) {
        console.log("First Competitor:", JSON.stringify(competitors[0], null, 2));
    }
}

main();
