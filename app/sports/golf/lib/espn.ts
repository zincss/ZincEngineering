// app/sports/golf/lib/espn.ts
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

const API = {
  LEADERBOARD: 'https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga',
  RANKINGS: 'https://site.api.espn.com/apis/site/v2/sports/golf/rankings',
  SCHEDULE: 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard'
};

// --- HELPER: FORMATTING ---
const formatMoney = (val: any) => {
    if (!val) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const getFlag = (iso: string) => `https://flagcdn.com/w40/${iso?.toLowerCase()}.png`;

// --- MAIN FETCHER ---
export async function fetchLiveGolfData() {
    try {
        const res = await fetch(API.LEADERBOARD, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        const event = data.events?.[0];
        const competition = event?.competitions?.[0];
        
        if (!event || !competition) return null;

        // 1. EXTRACT PLAYERS & IMAGES DIRECTLY
        // "Bulletproof" logic: We take the image URL directly from the API response
        // instead of guessing an ID.
        const leaderboard = competition.competitors?.map((c: any) => {
            const athlete = c.athlete || {};
            const score = c.score || {};
            const linescores = c.linescores || [];
            
            // DIRECT IMAGE EXTRACTION
            // ESPN usually provides 'headshot' object. We fallback to a generic placeholder if missing.
            const image = athlete.headshot?.href || 'https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_350,q_auto,w_280/headshots_default.png';
            
            // Safe Country Flag
            const countryIso = athlete.flag?.iso3 || athlete.countryCode || 'us';

            return {
                id: athlete.id,
                pos: c.status?.position?.displayName || '-',
                name: athlete.displayName || c.player?.displayName || 'Unknown Athlete',
                score: score.displayValue || 'E',
                thru: c.status?.displayThru || 'F',
                today: linescores[linescores.length - 1]?.displayValue || '-',
                image: image, // <--- THE KEY FIX
                country: getFlag(countryIso)
            };
        }) || [];

        return {
            event: {
                id: event.id,
                name: event.name,
                course: competition.venue?.fullName,
                location: `${competition.venue?.address?.city}, ${competition.venue?.address?.state || competition.venue?.address?.country}`,
                status: event.status?.type?.description === 'Scheduled' ? 'SCHEDULED' : event.status?.type?.state === 'in' ? 'LIVE' : 'FINAL',
                startTime: event.date, // ISO String for Countdown
                purse: formatMoney(competition.purse),
                par: 72, // Default or extract if available
                defendingChamp: { 
                    name: event.defendingChampion?.athlete?.displayName || 'TBD', 
                    score: '-' 
                },
                leaderboard: leaderboard.slice(0, 15) // Top 15 for display
            }
        };

    } catch (e) {
        console.error("ESPN GOLF FETCH ERROR:", e);
        return null;
    }
}

export async function fetchRankings() {
    try {
        const res = await fetch(API.RANKINGS, { headers: HEADERS, cache: 'no-store' });
        const data = await res.json();
        
        return data.rankings?.map((r: any) => {
            const ath = r.athlete;
            return {
                rank: r.current,
                name: ath.displayName,
                points: r.points?.toFixed(2) || '0.00',
                image: ath.headshot?.href || null, // Direct Image
                trend: r.current < r.previous ? 'up' : r.current > r.previous ? 'down' : 'flat'
            };
        }) || [];
    } catch (e) { return []; }
}

export async function fetchSchedule() {
    try {
        const res = await fetch(API.SCHEDULE, { headers: HEADERS, cache: 'no-store' });
        const data = await res.json();
        
        // Filter for future events
        const upcoming = data.events?.filter((e: any) => e.status?.type?.state === 'pre').slice(0, 5);
        
        return upcoming?.map((e: any) => {
            const date = new Date(e.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
            return {
                date: dateStr,
                name: e.name,
                course: e.competitions?.[0]?.venue?.fullName,
                def: e.defendingChampion?.athlete?.displayName || 'TBD'
            };
        }) || [];
    } catch (e) { return []; }
}