
const API = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete';
const PARAMS = 'region=us&lang=en&contentorigin=espn&isqualified=false&page=1&limit=1&sort=general.plusMinus:desc';

async function run() {
    console.log("Checking PlusMinus...");
    const res = await fetch(`${API}?${PARAMS}`);
    const data = await res.json();
    if (data.athletes) {
        console.log("Found PlusMinus!");
        console.log(data.athletes[0].athlete.displayName, data.athletes[0].displayValue);
    } else {
        console.log("PlusMinus failed.");
    }
}

run();
