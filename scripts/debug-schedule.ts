async function check(id: string, label: string) {
    console.log(`
Checking ${label} (${id})...`);
    // Try ONLY seasontype=2
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${id}/schedule?seasontype=2`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Events Found: ${data.events?.length}`);
    if (data.events?.length > 0) {
        console.log(`First Game: ${data.events[0].shortName}`);
        console.log(`Season: ${data.events[0].season?.year}`);
    }
}

async function run() {
    await check('14', 'Rams (Playoff)');
}

run();