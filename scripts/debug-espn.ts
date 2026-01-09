
const ID = '3139477'; // Mahomes

async function run() {
    console.log(`
Checking Mahomes Profile for Odds...`);
    const res = await fetch(`https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${ID}`);
    const data = await res.json();
    
    // Scan for odds
    const scan = (obj, path = '') => {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(obj).forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            if (key.toLowerCase().includes('odds') || key.toLowerCase().includes('bet')) {
                console.log(`Found "${key}" at ${currentPath}:`, obj[key]);
            }
            if (Array.isArray(obj[key])) {
                obj[key].forEach((item, i) => scan(item, `${currentPath}[${i}]`));
            } else {
                scan(obj[key], currentPath);
            }
        });
    };
    scan(data);
    console.log("Scan complete.");
}

run();
