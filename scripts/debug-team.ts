const ID = '14'; // Rams

async function run() {
    console.log(`Checking Roster for ${ID}...`);
    const rosterRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${ID}/roster`);
    const rData = await rosterRes.json();
    
    // Check keys
    console.log("Root Keys:", Object.keys(rData));
    
    if (rData.athletes) {
        console.log("Athletes Array Length:", rData.athletes.length);
        console.log("First Item:", JSON.stringify(rData.athletes[0], null, 2));
    }
}

run();