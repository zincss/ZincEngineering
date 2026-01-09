const NFL_LEADERS_URL = 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete?region=us&lang=en&contentorigin=espn&isqualified=false&page=1&limit=1&sort=passing.adjQBR:desc';

async function run() {
    const lRes = await fetch(NFL_LEADERS_URL);
    const leaders = await lRes.json();
    console.log("Full Leader Object:", JSON.stringify(leaders.athletes[0], null, 2));
}

run();