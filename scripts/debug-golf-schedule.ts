import fetch from 'node-fetch';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function main() {
    console.log("⛳️ Fetching Golf Schedule...");
    
    // Check default schedule (current season?)
    const url = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/schedule'; // Note: pga added to path might be needed? Previous code had sports/golf/schedule
    // The previous code used: 'https://site.api.espn.com/apis/site/v2/sports/golf/schedule'
    // Let's try the specific PGA one first as it's more likely to be used in the app context.
    // Actually let's check what the code uses.
    
    const codeUrl = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/schedule';
    
    console.log(`Fetching: ${codeUrl}`);
    const res = await fetch(codeUrl, { headers: HEADERS });
    const data = await res.json();
    
    const events = data.events || [];
    console.log(`Total Events found: ${events.length}`);
    
    // List last 3 'post' events and first 3 'pre' events
    const postEvents = events.filter((e: any) => e.status.type.state === 'post');
    const preEvents = events.filter((e: any) => e.status.type.state === 'pre');
    
    console.log("\n--- Last 3 Completed Events ---");
    postEvents.slice(-3).forEach((e: any) => {
        console.log(`${e.date} | ${e.name} | ID: ${e.id} | Status: ${e.status.type.state}`);
    });

    console.log("\n--- Next 3 Upcoming Events ---");
    preEvents.slice(0, 3).forEach((e: any) => {
        console.log(`${e.date} | ${e.name} | ID: ${e.id} | Status: ${e.status.type.state}`);
    });
}

main();
