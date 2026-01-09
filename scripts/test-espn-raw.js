const id = '3945274'; // Luka
const url = `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${id}/gamelog`;

async function run() {
    const res = await fetch(url);
    const json = await res.json();
    console.log("Root Labels:", json.labels);
    console.log("Root Names:", json.names);
    if (json.seasonTypes && json.seasonTypes[0].categories) {
        console.log("Cat[0] Names:", json.seasonTypes[0].categories[0].names);
    }
}

run();