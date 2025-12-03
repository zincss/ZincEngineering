// app/sports/golf/lib/golf-api.ts

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

// --- CONSTANTS: HERO IMAGE DATABASE (F1 STYLE) ---
const GOLFER_IMAGE_MAP: Record<string, string> = {
    'scottie_scheffler': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/9478.png&w=350&h=254',
    'rory_mcilroy': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/3470.png&w=350&h=254',
    'jon_rahm': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/9780.png&w=350&h=254',
    'viktor_hovland': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/4364873.png&w=350&h=254',
    'xander_schauffele': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/10140.png&w=350&h=254',
    'patrick_cantlay': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/6007.png&w=350&h=254',
    'max_homa': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/8973.png&w=350&h=254',
    'collin_morikawa': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/4405063.png&w=350&h=254',
    'ludvig_aberg': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/4692633.png&w=350&h=254',
    'wyndham_clark': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/11101.png&w=350&h=254',
    'jordan_spieth': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/5467.png&w=350&h=254',
    'tiger_woods': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/462.png&w=350&h=254',
    'justin_thomas': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/8900.png&w=350&h=254',
    'bryson_dechambeau': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/10046.png&w=350&h=254',
    'brooks_koepka': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/6798.png&w=350&h=254',
    'hideki_matsuyama': 'https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/5860.png&w=350&h=254',
};

const API = {
  // Use 'schedule' (calendar) instead of 'scoreboard' (weekly) to get the full list
  SCHEDULE: 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/tours/schedule?season=2024', 
  LEADERBOARD: 'https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga',
  RANKINGS: 'https://site.api.espn.com/apis/site/v2/sports/golf/rankings',
  PLAYER_BASE: 'https://site.web.api.espn.com/apis/common/v3/sports/golf/athletes',
  SEARCH: 'https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&sport=golf&limit=5&mode=prefix&type=player',
};

// --- HELPERS ---
const parseRank = (rankStr: string): number => {
    if (!rankStr) return 999;
    if (rankStr === '-') return 999;
    if (rankStr === 'E') return 999; 
    const clean = rankStr.replace('T', '').trim();
    const val = parseInt(clean);
    return isNaN(val) ? 999 : val;
};

// Recursive finder for rankings (ESPN changes keys often)
const findRankingList = (data: any, keywords: string[]): any => {
    if (!data) return null;
    if (data.rankings) {
        return data.rankings.find((r: any) => 
            keywords.some(k => r.name?.toLowerCase().includes(k.toLowerCase()))
        );
    }
    return null;
};

// Helper to resolve images
const resolveImage = (name: string, apiImage?: string) => {
    if (!name) return apiImage;
    const slug = name.toLowerCase().replace(/[.\s]+/g, '_');
    return GOLFER_IMAGE_MAP[slug] || apiImage || null;
};

// --- TYPES ---
export interface Golfer {
    id: string;
    name: string;
    rank: number; 
    country: string;
    flag?: string;
    image?: string;
    displayValue?: string; 
    movement?: number;
}

export interface Tournament {
    id: string;
    name: string;
    course: string;
    location: string;
    dates: string;
    status: string; 
    purse?: string;
}

export interface GolfLeaderboard {
    tournament: Tournament;
    players: any[]; 
}

export interface GolfEvent {
    id: string;
    name: string;
    date: string;
    location: string;
    status: string;
    defending?: string;
    purse?: string;
}

// --- FETCHERS ---

// 1. World Rankings (OWGR) - Robust Parser
export async function fetchWorldRankings() {
    try {
        const res = await fetch(API.RANKINGS, { headers: HEADERS, next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        
        const rankingObj = findRankingList(data, ['Official World Golf Ranking', 'OWGR', 'World']);
        
        return rankingObj?.ranks?.slice(0, 50).map((r: any) => ({
            id: r.athlete.id,
            rank: r.current,
            name: r.athlete.displayName,
            country: r.athlete.flag?.country || 'UNK',
            flag: r.athlete.flag?.href,
            image: resolveImage(r.athlete.displayName, r.athlete.headshot?.href),
            displayValue: `${r.points} pts`,
            movement: (r.previous - r.current) 
        })) || [];
    } catch (e) {
        console.error("Golf OWGR Error:", e);
        return [];
    }
}

// 2. FedEx Cup Standings - Robust Parser
export async function fetchFedExCupStandings() {
    try {
        const res = await fetch(API.RANKINGS, { headers: HEADERS, next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        
        const rankingObj = findRankingList(data, ['FedExCup', 'FedEx', 'Season Points']);

        return rankingObj?.ranks?.slice(0, 30).map((r: any) => ({
            id: r.athlete.id,
            rank: r.current,
            name: r.athlete.displayName,
            country: r.athlete.flag?.country || 'USA',
            flag: r.athlete.flag?.href,
            image: resolveImage(r.athlete.displayName, r.athlete.headshot?.href),
            displayValue: `${Math.round(r.points)} pts`,
            movement: (r.previous - r.current)
        })) || [];
    } catch (e) {
        return [];
    }
}

// 3. Leaderboard (Live or Specific Event)
export async function fetchLiveLeaderboard(eventId?: string): Promise<GolfLeaderboard | null> {
    try {
        // If eventId provided, force that event. Else default to current.
        const url = eventId 
            ? `${API.LEADERBOARD}&event=${eventId}` 
            : API.LEADERBOARD;

        const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        
        // Data structure differs slightly if filtering by event ID vs default
        const event = data.events?.[0] || data;

        if (!event || !event.competitions) return null;

        const competition = event.competitions?.[0];
        const course = competition?.venue;
        
        // Process Players
        let players = competition?.competitors?.map((c: any) => ({
            id: c.athlete.id,
            rankStr: c.status?.position?.displayName || '-',
            rankVal: parseRank(c.status?.position?.displayName),
            name: c.athlete.displayName,
            score: c.statistics?.find((s:any) => s.name === 'score')?.displayValue || c.score?.displayValue || 'E',
            thru: c.status?.period === 4 && c.status?.type?.state === 'post' ? 'F' : (c.status?.period || '-'),
            today: c.linescores?.slice(-1)[0]?.displayValue || '-', 
            image: resolveImage(c.athlete.displayName, c.athlete.headshot?.href),
            flag: c.athlete.flag?.href,
            isUnderPar: (c.score?.value || 0) < 0
        })) || [];

        // STRICT SORT: Rank (Asc) -> Name (Asc)
        players.sort((a: any, b: any) => {
            if (a.rankVal !== b.rankVal) return a.rankVal - b.rankVal;
            return a.name.localeCompare(b.name);
        });

        return {
            tournament: {
                id: event.id,
                name: event.name,
                course: course?.fullName || 'Unknown Course',
                location: `${course?.address?.city || ''}, ${course?.address?.state || ''}`,
                dates: event.date,
                status: event.status?.type?.state === 'in' ? 'LIVE' : event.status?.type?.shortDetail,
                purse: competition?.purse ? `$${(competition.purse / 1000000).toFixed(1)}M` : undefined
            },
            players: players.slice(0, 50)
        };
    } catch (e) {
        console.error("Golf Leaderboard Error:", e);
        return null;
    }
}

// 4. Season Schedule - Full List (Not just weekly)
export async function fetchSeasonSchedule(): Promise<GolfEvent[]> {
    try {
        const res = await fetch(API.SCHEDULE, { headers: HEADERS, next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        
        // Extract events from the "tours" > "events" structure
        const events = data.events || [];
        
        return events
            .filter((e: any) => e.status?.type?.description !== 'Canceled')
            .map((e: any) => {
                const c = e.competitions?.[0];
                return {
                    id: e.id,
                    name: e.shortName || e.name,
                    date: e.date, 
                    location: c?.venue?.fullName || 'TBD',
                    status: e.status?.type?.shortDetail || 'Scheduled',
                    defending: e.competitions?.[0]?.competitors?.find((p:any) => p.winner === true)?.athlete?.displayName,
                    purse: c?.purse ? `$${(c.purse / 1000000).toFixed(1)}M` : undefined
                };
            });
    } catch (e) {
        return [];
    }
}

// 5 & 6 (Profile/Search) - Unchanged but included for completeness
export async function fetchGolferProfile(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        const ath = data.athlete;
        return {
            id: ath.id,
            name: ath.displayName,
            age: ath.age,
            country: ath.birthPlace?.country || ath.displayBirthPlace,
            flag: ath.flag?.href,
            image: resolveImage(ath.displayName, ath.headshot?.href),
            height: ath.displayHeight,
            weight: ath.displayWeight,
            turnedPro: ath.debutYear,
            stats: ath.statsSummary?.statistics?.map((s: any) => ({
                label: s.displayName,
                value: s.displayValue,
                rank: s.rankDisplayValue
            })) || [],
            bio: `One of the top talents from ${ath.birthPlace?.country || 'the tour'}.`
        };
    } catch (e) { return null; }
}

export async function searchGolfers(query: string) {
    if (!query || query.length < 2) return [];
    try {
        const res = await fetch(`${API.SEARCH}&query=${encodeURIComponent(query)}`, { headers: HEADERS });
        const data = await res.json();
        return (data.items || []).map((item: any) => ({
            id: item.id,
            name: item.displayName,
            tour: 'PGA', 
            image: resolveImage(item.displayName, item.images?.[0]?.url),
            url: `/sports/golf/player/${item.id}`
        }));
    } catch (e) { return []; }
}