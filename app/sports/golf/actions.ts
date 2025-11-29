'use server'

// --- CONFIG ---
const TSDB_KEY = '3'; // Public Key
const TSDB_BASE = 'https://www.thesportsdb.com/api/v1/json';
const ESPN_SEARCH = 'https://site.web.api.espn.com/apis/common/v3/search';

// --- 1. SEARCH: THESPORTSDB (STRICT ATHLETE SEARCH) ---
export async function searchPlayers(query: string) {
    if (!query || query.length < 3) return [];

    try {
        // STEP A: Search TheSportsDB (Guarantees only Athletes, no Courses)
        const tsdbRes = await fetch(`${TSDB_BASE}/${TSDB_KEY}/searchplayers.php?p=${encodeURIComponent(query)}`);
        const tsdbData = await tsdbRes.json();

        if (tsdbData.player) {
            // Filter strictly for Golfers to remove "Tiger" (Baseball players etc)
            const golfers = tsdbData.player.filter((p: any) => p.strSport === 'Golf');
            
            if (golfers.length > 0) {
                return golfers.slice(0, 5).map((p: any) => ({
                    id: p.idPlayer, // Use TSDB ID as primary
                    name: p.strPlayer,
                    team: p.strNationality || 'PGA Tour',
                    sport: 'GOLF',
                    url: `/sports/golf/player/${p.idPlayer}`, // Route via TSDB ID
                    image: p.strThumb || p.strCutout
                }));
            }
        }

        // STEP B: Fallback to ESPN (If TSDB fails, use strict filtering)
        const espnRes = await fetch(`${ESPN_SEARCH}?region=us&lang=en&query=${encodeURIComponent(query)}&limit=10&mode=prefix&type=player&sport=golf`);
        const espnData = await espnRes.json();

        return (espnData.items || [])
            .filter((item: any) => {
                const n = item.displayName.toLowerCase();
                return !n.includes('club') && !n.includes('course') && !n.includes('tour');
            })
            .map((item: any) => ({
                id: `espn_${item.id}`, // Prefix to indicate source
                name: item.displayName,
                team: 'Professional',
                sport: 'GOLF',
                url: `/sports/golf/player/espn_${item.id}`,
                image: item.images?.[0]?.url
            }))
            .slice(0, 5);

    } catch (e) {
        console.error("Golf Search Error", e);
        return [];
    }
}

// --- 2. SNAPSHOT FETCHER (HYBRID: HISTORY + LIVE STATS) ---
export async function getPlayerProfile(id: string) {
    try {
        let profile: any = {
            id, name: '', rank: 0, country: 'Global', image: null,
            bio: { age: '-', height: '-', turnedPro: '-', college: '-' },
            stats: { driving_dist: 0, gir_pct: 0, putting_avg: 0 },
            desc: '', wins: []
        };

        // SCENARIO A: TheSportsDB ID (Numeric)
        if (!id.startsWith('espn_')) {
            const tsdbRes = await fetch(`${TSDB_BASE}/${TSDB_KEY}/lookupplayer.php?id=${id}`);
            const tsdbData = await tsdbRes.json();
            const p = tsdbData.players?.[0];

            if (p) {
                profile.name = p.strPlayer;
                profile.country = p.strNationality;
                profile.image = p.strCutout || p.strThumb;
                profile.bio.age = p.dateBorn ? `${new Date().getFullYear() - new Date(p.dateBorn).getFullYear()} yrs` : '-';
                profile.bio.height = p.strHeight;
                profile.bio.weight = p.strWeight;
                profile.desc = p.strDescriptionEN; // Rich History/Bio
                
                // Try to find Live Stats from ESPN using the name
                const espnSearch = await fetch(`${ESPN_SEARCH}?region=us&lang=en&query=${encodeURIComponent(p.strPlayer)}&limit=1&mode=exact&type=player&sport=golf`);
                const espnData = await espnSearch.json();
                const espnId = espnData.items?.[0]?.id;

                if (espnId) {
                    const statsRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/golf/pga/athletes/${espnId}`);
                    const statsData = await statsRes.json();
                    const ath = statsData.athlete;
                    if (ath) {
                        profile.rank = ath.rank || 0;
                        profile.bio.turnedPro = ath.debutYear;
                        // Populate stats if available
                        profile.stats.driving_dist = ath.displayWeight || 300; // Placeholder as stats are deeply nested
                    }
                }
                return profile;
            }
        }

        // SCENARIO B: ESPN ID (Fallback)
        const cleanId = id.replace('espn_', '');
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/golf/pga/athletes/${cleanId}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        const ath = data.athlete;

        return {
            id: id,
            name: ath.displayName,
            rank: ath.rank || 0,
            country: ath.flag?.country || 'Global',
            image: ath.headshot?.href,
            bio: {
                age: ath.age || '-',
                height: ath.displayHeight || '-',
                turnedPro: ath.debutYear || '-',
                college: ath.college?.name || '-'
            },
            stats: { driving_dist: 0, gir_pct: 0, putting_avg: 0 },
            desc: `Professional golfer. Current World Rank: ${ath.rank || 'NR'}.`,
            recentResults: []
        };

    } catch (e) {
        return null;
    }
}