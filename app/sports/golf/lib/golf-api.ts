// app/sports/golf/lib/golf-api.ts

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

const API = {
  LEADERBOARD: 'https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga',
  RANKINGS: 'https://site.api.espn.com/apis/site/v2/sports/golf/rankings',
  SCHEDULE: 'https://site.api.espn.com/apis/site/v2/sports/golf/scoreboard', 
  PLAYER_BASE: 'https://site.web.api.espn.com/apis/common/v3/sports/golf/athletes',
  SEARCH: 'https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&sport=golf&limit=5&mode=prefix&type=player',
};

// --- HELPER: RANK PARSER ---
const parseRank = (rankStr: string): number => {
    if (!rankStr) return 999;
    if (rankStr === '-') return 999;
    if (rankStr === 'E') return 999; // sometimes used for Even par, not rank
    // Handle "T1", "T20"
    const clean = rankStr.replace('T', '').trim();
    const val = parseInt(clean);
    return isNaN(val) ? 999 : val;
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
    team?: string;
    movement?: number;
}

export interface Tournament {
    id: string;
    name: string;
    course: string;
    location: string;
    dates: string;
    status: string; 
    defendingChampion?: string;
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

// 1. World Rankings (OWGR)
export async function fetchWorldRankings() {
    try {
        const res = await fetch(API.RANKINGS, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        
        const rankings = data.rankings?.find((r: any) => r.name === 'Official World Golf Ranking') || data.rankings?.[0];
        
        return rankings?.ranks?.slice(0, 50).map((r: any) => ({
            id: r.athlete.id,
            rank: r.current,
            name: r.athlete.displayName,
            country: r.athlete.flag?.country || 'UNK',
            flag: r.athlete.flag?.href,
            image: r.athlete.headshot?.href,
            displayValue: `${r.points} pts`,
            movement: (r.previous - r.current) 
        })) || [];
    } catch (e) {
        return [];
    }
}

// 2. FedEx Cup Standings (Robust)
export async function fetchFedExCupStandings() {
    try {
        const res = await fetch(API.RANKINGS, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        
        // Try multiple keys for FedEx Cup
        const rankings = data.rankings?.find((r: any) => 
            r.name.includes('FedExCup') || r.name.includes('Season Points')
        ) || data.rankings?.[1];

        if (!rankings) return [];

        return rankings.ranks?.slice(0, 30).map((r: any) => ({
            id: r.athlete.id,
            rank: r.current,
            name: r.athlete.displayName,
            country: r.athlete.flag?.country || 'USA',
            flag: r.athlete.flag?.href,
            image: r.athlete.headshot?.href,
            displayValue: `${Math.round(r.points)} pts`,
            movement: (r.previous - r.current)
        })) || [];
    } catch (e) {
        return [];
    }
}

// 3. Live Tournament Leaderboard (SORTED)
export async function fetchLiveLeaderboard(): Promise<GolfLeaderboard | null> {
    try {
        const res = await fetch(API.LEADERBOARD, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        const event = data.events?.[0];

        if (!event) return null;

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
            image: c.athlete.headshot?.href,
            flag: c.athlete.flag?.href,
            isUnderPar: (c.score?.value || 0) < 0
        })) || [];

        // STRICT SORT: Rank (Asc) -> Name (Asc)
        players.sort((a: any, b: any) => {
            if (a.rankVal !== b.rankVal) return a.rankVal - b.rankVal;
            return a.name.localeCompare(b.name);
        });

        // Limit to top 50 for display
        players = players.slice(0, 50);

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
            players: players.map((p: any) => ({
                ...p,
                rank: p.rankStr // Use string for display (T1), sorted by val
            }))
        };
    } catch (e) {
        return null;
    }
}

// 4. Season Schedule (NEW)
export async function fetchSeasonSchedule(): Promise<GolfEvent[]> {
    try {
        const res = await fetch(API.SCHEDULE, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        
        // ESPN Schedule structure can vary, looking for events list
        const events = data.events || [];
        
        return events.map((e: any) => {
            const c = e.competitions?.[0];
            return {
                id: e.id,
                name: e.shortName || e.name,
                date: e.date, // ISO string
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

// 5. Detailed Player Profile
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
            image: ath.headshot?.href,
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
    } catch (e) {
        return null;
    }
}

// 6. Search
export async function searchGolfers(query: string) {
    if (!query || query.length < 2) return [];
    try {
        const res = await fetch(`${API.SEARCH}&query=${encodeURIComponent(query)}`, { headers: HEADERS });
        const data = await res.json();
        return (data.items || []).map((item: any) => ({
            id: item.id,
            name: item.displayName,
            tour: 'PGA', 
            image: item.images?.[0]?.url || null,
            url: `/sports/golf/player/${item.id}`
        }));
    } catch (e) {
        return [];
    }
}