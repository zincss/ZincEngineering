
import fetch from 'node-fetch';

const STEAM_SEARCH_API = 'https://store.steampowered.com/api/storesearch/';

async function main() {
    console.log("🔍 Testing Steam Search Pagination...");
    
    const term = "Sci-fi";
    
    // Request 1: Standard
    const url1 = `${STEAM_SEARCH_API}?term=${encodeURIComponent(term)}&l=english&cc=US&count=20`;
    console.log(`Fetching 1: ${url1}`);
    const res1 = await fetch(url1);
    const data1 = await res1.json();
    const ids1 = data1.items.map((i: any) => i.id);
    
    // Request 2: With 'start' parameter (common convention)
    const url2 = `${STEAM_SEARCH_API}?term=${encodeURIComponent(term)}&l=english&cc=US&count=20&start=20`;
    console.log(`Fetching 2: ${url2}`);
    const res2 = await fetch(url2);
    const data2 = await res2.json();
    const ids2 = data2.items.map((i: any) => i.id);
    
    // Request 3: With 'page' parameter
    const url3 = `${STEAM_SEARCH_API}?term=${encodeURIComponent(term)}&l=english&cc=US&count=20&page=2`;
    console.log(`Fetching 3: ${url3}`);
    const res3 = await fetch(url3);
    const data3 = await res3.json();
    const ids3 = data3.items.map((i: any) => i.id);

    console.log(`\nBatch 1 IDs: ${ids1.slice(0, 5).join(', ')}...`);
    console.log(`Batch 2 IDs (start=20): ${ids2.slice(0, 5).join(', ')}...`);
    console.log(`Batch 3 IDs (page=2): ${ids3.slice(0, 5).join(', ')}...`);
    
    // Check for overlap
    const overlap1_2 = ids1.filter(id => ids2.includes(id)).length;
    const overlap1_3 = ids1.filter(id => ids3.includes(id)).length;
    
    console.log(`\nOverlap 1 vs 2: ${overlap1_2} / 20`);
    console.log(`Overlap 1 vs 3: ${overlap1_3} / 20`);
}

main();
