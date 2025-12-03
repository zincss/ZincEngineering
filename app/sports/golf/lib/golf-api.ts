// app/sports/golf/lib/golf-api.ts
import { notFound } from "next/navigation";

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

const API = {
  SCHEDULE: 'https://site.web.api.espn.com/apis/site/v2/sports/golf/pga/tours/schedule',
  SCOREBOARD: 'https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga',
  RANKINGS: 'https://site.web.api.espn.com/apis/site/v2/sports/golf/rankings',
  PLAYER_STATS: 'https://site.web.api.espn.com/apis/common/v3/sports/golf/pga/statistics/byathlete',
  PLAYER_BASE: 'https://site.web.api.espn.com/apis/common/v3/sports/golf/athletes',
  SEARCH: 'https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&sport=golf&limit=5&mode=prefix&type=player',
};

export interface GolfLeaderboard {
    id: string;
    tournament: {
        name: string;
        course: string;
        location: string;
        dates: string;
        status: string;
        defendingChampion: string;
    };
    isLive: boolean;
    players: any[];
}

const resolveImage = (id: string) => {
    if (!id) return 'https://a.espncdn.com/i/headshots/golf/players/full/default.png';
    return `https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/${id}.png&w=350&h=350&scale=crop`;
};

// --- DATA FETCHERS ---

export async function fetchLiveLeaderboard(): Promise<GolfLeaderboard | null> {
    try {
        const res = await fetch(API.SCOREBOARD, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) throw new Error("Leaderboard Fetch Failed");
        const data = await res.json();
        
        const event = data.events?.[0];
        
        if (!event || event.status?.type?.state === 'pre') {
             const schedule = await fetchSchedule();
             const now = new Date();
             const nextEvent = schedule.find((e: any) => new Date(e.rawDate) > now);
             
             if (nextEvent) {
                 return {
                    id: nextEvent.id,
                    tournament: {
                        name: nextEvent.name,
                        course: nextEvent.location, 
                        location: '', 
                        dates: nextEvent.rawDate, 
                        status: 'Upcoming',
                        defendingChampion: 'TBD'
                    },
                    isLive: false,
                    players: []
                };
             }
        }

        if (!event) return null;
        const comp = event.competitions?.[0];
        
        return {
            id: event.id,
            tournament: {
                name: event.name,
                course: comp?.venue?.fullName,
                location: `${comp?.venue?.address?.city || ''}, ${comp?.venue?.address?.state || ''}`,
                dates: event.date,
                status: event.status?.type?.shortDetail || 'Scheduled',
                defendingChampion: comp?.competitors?.find((c:any) => c.winner)?.athlete?.displayName || 'TBD',
            },
            isLive: event.status?.type?.state === 'in',
            players: comp?.competitors?.slice(0, 15).map((c: any) => ({
                id: c.athlete.id,
                rank: c.status?.position?.displayName || '-',
                name: c.athlete.displayName,
                score: c.score?.displayValue || 'E',
                thru: c.status?.period?.toString() || '-',
                today: c.linescores?.[c.linescores.length - 1]?.displayValue || '-',
                flag: c.athlete.flag?.href,
                image: resolveImage(c.athlete.id),
                isUnderPar: (c.score?.displayValue || '').includes('-')
            })) || []
        };
    } catch (e) {
        return null;
    }
}

export async function fetchRankings() {
    try {
        const res = await fetch(API.RANKINGS, { headers: HEADERS, cache: 'no-store' });
        const data = await res.json();
        
        const processRankings = (ranks: any[]) => {
            return ranks?.slice(0, 15).map((r: any) => ({
                id: r.athlete.id,
                rank: r.current,
                name: r.athlete.displayName,
                points: r.points?.toFixed(2) || '-',
                flag: r.athlete.flag?.href,
                image: resolveImage(r.athlete.id),
                value: `${r.points?.toFixed(2) || '0'} PTS` 
            })) || [];
        };

        const owgr = data.rankings?.find((r: any) => r.name === 'Official World Golf Ranking')?.ranks;
        const fedex = data.rankings?.find((r: any) => r.name === 'FedExCup Season Points')?.ranks;
        
        return {
            owgr: processRankings(owgr),
            fedex: processRankings(fedex),
            r2d: [] 
        };
    } catch (e) {
        return { owgr: [], fedex: [], r2d: [] };
    }
}

export async function fetchSchedule() {
    try {
        // Updated to search for 2025/2026 coverage
        const res = await fetch(`${API.SCHEDULE}?season=2025`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        
        return (data.events || []).map((e: any) => ({
            id: e.id,
            name: e.shortName || e.name,
            date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            rawDate: e.date,
            location: e.competitions?.[0]?.venue?.fullName || 'TBD',
            purse: e.competitions?.[0]?.purse ? `$${(e.competitions[0].purse / 1000000).toFixed(1)}M` : '-',
            status: e.status?.type?.shortDetail,
            winner: e.competitions?.[0]?.competitors?.find((p:any)=>p.winner)?.athlete?.displayName
        }));
    } catch (e) {
        return [];
    }
}

// FIX: Robust Fetcher (Removed 'active: true' to fix off-season data loss)
export async function fetchSeasonStats() {
    const categories = [
        { id: 'earnings', title: 'Money List', sort: 'statistics.earnings:desc' },
        { id: 'scoring', title: 'Scoring Average', sort: 'statistics.scoringAverage:asc' },
        { id: 'driving', title: 'Driving Distance', sort: 'statistics.drivingDistance:desc' },
        { id: 'putting', title: 'SG: Putting', sort: 'statistics.sgPutting:desc' }
    ];

    const fetchForSeason = async (season: string) => {
        const seasonResults = [];
        for (const cat of categories) {
            try {
                // FIXED: Removed 'active: true' to ensure data returns even if season is over
                const params = new URLSearchParams({
                    region: 'us', lang: 'en', sort: cat.sort, limit: '5', season: season
                });
                const res = await fetch(`${API.PLAYER_STATS}?${params.toString()}`, { headers: HEADERS, cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    const players = (data.athletes || []).map((a: any) => ({
                        id: a.athlete.id,
                        name: a.athlete.displayName,
                        image: resolveImage(a.athlete.id),
                        value: a.statistics?.[0]?.displayValue || a.displayValue || '-'
                    }));
                    if (players.length > 0) seasonResults.push({ id: cat.id, title: cat.title, players, season });
                }
            } catch (e) { console.warn(`Error fetching ${season} stats`, e); }
        }
        return seasonResults;
    };

    // 1. Try 2025 (Current/Just Finished)
    let results = await fetchForSeason('2025');

    // 2. Fallback to 2024 if 2025 is empty
    if (results.length === 0) {
        console.log("⛳ [GOLF] 2025 Stats Empty. Falling back to 2024...");
        results = await fetchForSeason('2024');
    }

    return results;
}

export async function fetchGolferProfile(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        const ath = data.athlete;

        let history = [];
        try {
             const logRes = await fetch(`${API.PLAYER_BASE}/${id}/eventlog?season=2025`, { headers: HEADERS, cache: 'no-store' });
             if (logRes.ok) {
                 const logData = await logRes.json();
                 history = (logData.events || []).slice(0, 5).map((e: any) => ({
                     date: new Date(e.eventDate).toLocaleDateString('en-US', {month:'short', day:'numeric'}),
                     name: e.name || e.event?.name,
                     finish: e.gameResult || 'CUT',
                     score: e.score?.displayValue || '-',
                     earnings: e.earnings ? `$${Math.round(e.earnings).toLocaleString()}` : '-'
                }));
             }
        } catch(e) {}

        return {
            id: ath.id,
            name: ath.displayName,
            age: ath.age,
            country: ath.displayBirthPlace,
            flag: ath.flag?.href,
            image: resolveImage(ath.id),
            stats: ath.statsSummary?.statistics?.map((s: any) => ({
                label: s.displayName,
                value: s.displayValue,
                rank: s.rankDisplayValue
            })) || [],
            history,
            bio: ath.bio || `Professional golfer from ${ath.birthPlace?.city || 'Unknown'}.`
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
            image: resolveImage(item.id),
            url: `/sports/golf/player/${item.id}`
        }));
    } catch (e) { return []; }
}