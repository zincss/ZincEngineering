
import fetch from 'node-fetch';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function main() {
    console.log("⛳️ Debugging Golf Rankings...");
    
    const url = 'https://site.web.api.espn.com/apis/common/v3/sports/golf/rankings';
    console.log(`Fetching: ${url}`);
    
    try {
        const res = await fetch(url, { headers: HEADERS });
        const data = await res.json();
        console.log("Root Keys:", Object.keys(data));
        if (data.rankings) {
            console.log("Rankings Array Length:", data.rankings.length);
            data.rankings.forEach((r: any, i: number) => console.log(`[${i}] Name: ${r.name}`));
        } else {
            console.log("Full Data:", JSON.stringify(data, null, 2).slice(0, 500));
        }
        
        const owgr = data.rankings?.find((r: any) => r.name === 'Official World Golf Ranking') || data.rankings?.[0];
        
        if (!owgr) {
            console.error("❌ No OWGR data found.");
            return;
        }

        console.log(`✅ Found Ranking List: ${owgr.name}`);
        
        const ranks = owgr.ranks?.slice(0, 3).map((r: any) => ({
            id: r.athlete.id,
            rank: r.current,
            name: r.athlete.displayName,
            points: r.points,
            value: `${r.points} PTS`,
            headshot: r.athlete.headshot?.href,
            country: r.athlete.flag?.href,
            team: r.athlete.flag?.caption || 'PGA',
            label: 'OWGR Rank'
        }));

        console.log("Top 3 Processed Ranks:", JSON.stringify(ranks, null, 2));

        if (ranks.length === 0) {
            console.warn("⚠️ Ranks array is empty.");
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

main();
