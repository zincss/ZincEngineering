
import fetch from 'node-fetch';

const playersToFind = [
    'Scottie Scheffler',
    'Xander Schauffele',
    'Rory McIlroy',
    'Collin Morikawa',
    'Ludvig Aberg',
    'Wyndham Clark',
    'Viktor Hovland',
    'Patrick Cantlay',
    'Jon Rahm',
    'Hideki Matsuyama'
];

async function main() {
    console.log("🔍 Searching for Player IDs...");
    
    for (const name of playersToFind) {
        const url = `https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&query=${encodeURIComponent(name)}&limit=1&mode=prefix&type=player&sport=golf&league=pga`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            const player = data.items?.[0];
            
            if (player) {
                console.log(`✅ ${name}: ID=${player.id}, Image=${player.images?.[0]?.url || 'NONE'}`);
            } else {
                console.log(`❌ ${name}: Not Found`);
            }
        } catch (e) {
            console.error(`Error searching ${name}:`, e);
        }
    }
}

main();
