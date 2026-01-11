'use server';

const STEAM_SEARCH_API = 'https://store.steampowered.com/api/storesearch/';
const STEAM_DETAILS_API = 'https://store.steampowered.com/api/appdetails/';

const TAGS = [
    'Indie', 'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 
    'Casual', 'Sports', 'Racing', 'Puzzle', 'Arcade', 'Platformer',
    'Metroidvania', 'Roguelike', 'Survival', 'Horror', 'Sci-fi', 'Fantasy'
];

// Sub-tags to force variety in results
const MODIFIERS = [
    '', 'Indie', 'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation',
    'Story', 'Open World', 'Singleplayer', 'Atmospheric', '2D', '3D',
    'Retro', 'Pixel', 'Difficult', 'Cute', 'Dark', 'Funny', 'Classic',
    'Masterpiece', 'Great', 'Best', 'New', 'Popular', 'Multiplayer', 'Co-op'
];

export async function findGem(genre?: string, directId?: string, excludeIds: any[] = []) {
    // 0. Direct Lookup Mode
    if (directId) {
        try {
            const game = await fetchGameDetails(directId);
            if (game) {
                const reviewStats = await fetchReviewStats(directId);
                return processGameData(game, reviewStats);
            }
        } catch (e) { return null; }
    }

    // 1. Pick a tag (Genre)
    let term = genre && genre !== 'Random' ? genre : TAGS[Math.floor(Math.random() * TAGS.length)];
    const originalTerm = term; // Keep track of base genre

    // 1.5 Smart Variety: Append a random modifier
    if (genre && genre !== 'Random') {
        const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
        if (modifier && modifier !== term) {
            term = `${term} ${modifier}`;
        }
    }

    // 2. Search Steam for that tag
    try {
        // Increase count to widen the pool
        const searchUrl = `${STEAM_SEARCH_API}?term=${encodeURIComponent(term)}&l=english&cc=US&count=350`; 
        
        const res = await fetch(searchUrl, { next: { revalidate: 0 } });
        const data = await res.json();
        
        // RECURSIVE FALLBACK: If "Sci-fi Cute" returns nothing, try "Sci-fi"
        if (!data.items || data.items.length === 0) {
            if (term !== originalTerm) {
                 console.log(`[GemFinder] No results for "${term}", falling back to "${originalTerm}"`);
                 return findGem(originalTerm, undefined, excludeIds); 
            }
            throw new Error('No games found');
        }

        // 3. Pick candidates & Verify Quality via Review API FIRST
        // Filter out games we've already seen in this session
        let candidates = data.items.filter((item: any) => !excludeIds.includes(String(item.id)));
        
        // If we filtered everything out (unlikely), reset to full list
        if (candidates.length === 0) candidates = data.items;

        // Shuffle
        candidates = candidates.sort(() => 0.5 - Math.random());
        
        // Try up to 25 candidates
        for (const candidate of candidates.slice(0, 25)) {
            const reviews = await fetchReviewStats(candidate.id);
            
            if (!reviews) continue;

            // QUALITY FILTER
            const validDescriptions = [
                'Overwhelmingly Positive', 
                'Very Positive', 
                'Positive', 
                'Mostly Positive'
            ];
            
            // Logic: Must be Positive+ AND have decent volume (>50)
            const isQuality = validDescriptions.includes(reviews.review_score_desc) && reviews.total_reviews > 50;

            if (isQuality) {
                // Now fetch heavy details
                const game = await fetchGameDetails(candidate.id);
                
                // DLC FILTER:
                // 1. Must exist
                // 2. Must NOT be free
                // 3. Must be type 'game' (filters out dlc, music, movie, series, etc.)
                // 4. Name check for common dlc strings as a safety net
                const isDlc = game?.name?.toLowerCase().includes(' dlc') || 
                              game?.name?.toLowerCase().includes(' pack') ||
                              game?.type === 'dlc' ||
                              game?.type === 'music';

                if (game && !game.is_free && game.type === 'game' && !isDlc) {
                    return processGameData(game, reviews);
                }
            }
        }
        
        // ULTIMATE FALLBACK: If we still haven't found anything after trying specific term and base term
        // Try one last desperate attempt with a completely random popular tag to guarantee a result
        if (term === originalTerm) {
             const randomTag = TAGS[Math.floor(Math.random() * TAGS.length)];
             console.log(`[GemFinder] Desperate fallback to random tag: "${randomTag}"`);
             // Clear excludeIds for the desperate attempt to ensure SOMETHING returns
             return findGem(randomTag, undefined, []);
        }
        
        throw new Error('No gems found matching criteria.');

    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getGemsOfTheWeek() {
    // Pick 5 distinct genres for variety
    const genres = ['Indie', 'Action', 'RPG', 'Strategy', 'Horror'];
    
    try {
        // Fetch in parallel
        const promises = genres.map(g => findGem(g));
        const results = await Promise.all(promises);
        
        // Filter out nulls
        return results.filter(g => g !== null);
    } catch (e) {
        console.error("Failed to fetch gems of the week", e);
        return [];
    }
}

async function fetchReviewStats(appId: string) {
    try {
        const res = await fetch(`https://store.steampowered.com/appreviews/${appId}?json=1&language=all`);
        const data = await res.json();
        return data.query_summary;
    } catch (e) {
        return null;
    }
}

async function fetchGameDetails(appId: string) {
    try {
        const res = await fetch(`${STEAM_DETAILS_API}?appids=${appId}`);
        const data = await res.json();
        return data[appId]?.data;
    } catch (e) {
        return null;
    }
}

function processGameData(game: any, reviewStats: any) {
    return {
        id: game.steam_appid,
        name: game.name,
        description: game.short_description,
        header_image: game.header_image,
        price: game.price_overview?.final_formatted || 'Free',
        metacritic: game.metacritic?.score,
        recommendations: game.recommendations?.total,
        genres: game.genres?.map((g: any) => g.description).join(', '),
        screenshots: game.screenshots?.slice(0, 3).map((s: any) => s.path_thumbnail),
        storeUrl: `https://store.steampowered.com/app/${game.steam_appid}/`,
        reviews: reviewStats ? {
            description: reviewStats.review_score_desc,
            total: reviewStats.total_reviews,
            positive: reviewStats.total_positive,
            negative: reviewStats.total_negative,
            score: reviewStats.review_score
        } : null
    };
}
