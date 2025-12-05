const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

const API = {
  LEADERBOARD: 'https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga',
  RANKINGS: 'https://site.api.espn.com/apis/site/v2/sports/golf/rankings',
  SCHEDULE: 'https://site.api.espn.com/apis/site/v2/sports/golf/schedule',
  STATS: 'https://site.web.api.espn.com/apis/common/v3/sports/golf/pga/statistics/byathlete',
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBA';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        });
    } catch (e) {
        return dateStr;
    }
};

export async function fetchLiveTournament() {
  try {
    // 1. Fetch Current Default Leaderboard
    const res = await fetch(API.LEADERBOARD, { headers: HEADERS, next: { revalidate: 60 } });
    const data = await res.json();
    let event = data.events?.[0];
    
    // 2. INTELLIGENT FALLBACK LOGIC
    // Check if the current event actually has scores yet.
    // If status is 'pre' OR no competitors have a 'score' stat, it's empty.
    const competition = event?.competitions?.[0];
    const hasScores = competition?.competitors?.some((c: any) => 
        c.statistics?.some((s: any) => s.name === 'totalScore' && s.displayValue)
    );

    // If NO scores (Tournament hasn't started), fetch the LAST COMPLETED event instead.
    if (!hasScores) {
        const schedRes = await fetch(API.SCHEDULE, { headers: HEADERS, next: { revalidate: 3600 } });
        const schedData = await schedRes.json();
        
        // Find the most recent 'post' (completed) event
        const pastEvents = schedData.events?.filter((e: any) => e.status.type.state === 'post');
        const lastEvent = pastEvents?.[pastEvents.length - 1];

        if (lastEvent) {
             // Fetch leaderboard for that specific past event
             const lastRes = await fetch(`${API.LEADERBOARD}&event=${lastEvent.id}`, { headers: HEADERS, next: { revalidate: 3600 } });
             const lastData = await lastRes.json();
             event = lastData.events?.[0]; // Swap the event data
        }
    }

    if (!event) return null;

    const comp = event.competitions?.[0];
    const status = event.status?.type?.state; 
    
    // Competitors logic
    const competitors = comp?.competitors || [];
    const leaderboard = competitors
        .sort((a: any, b: any) => parseInt(a.sortOrder) - parseInt(b.sortOrder))
        .slice(0, 30) // Top 30 for ticker
        .map((c: any) => ({
            id: c.id,
            name: c.athlete.displayName,
            position: c.status?.positionDisplayName || '-',
            score: c.statistics?.find((s:any) => s.name === 'totalScore')?.displayValue || '-',
            toPar: c.statistics?.find((s:any) => s.name === 'score')?.displayValue || 'E',
            thru: c.status?.period || 'F', // Default to F if post-tourney
            country: c.athlete.flag?.href,
            headshot: c.athlete.headshot?.href || null,
            isAmateur: c.athlete.amateur
        }));

    return {
        id: event.id,
        name: event.name,
        date: formatDate(event.date),
        venue: comp?.venue?.fullName,
        location: `${comp?.venue?.address?.city}, ${comp?.venue?.address?.state}`,
        status: status, // 'pre', 'in', 'post'
        leaderboard,
        purse: event.purposes?.find((p:any) => p.type === 'purse')?.value || 'TBA',
        defendingChamp: event.defendingChampion ? {
            name: event.defendingChampion.athlete.displayName,
            headshot: event.defendingChampion.athlete.headshot?.href
        } : null
    };
  } catch (e) {
    console.error("Golf Leaderboard Error", e);
    return null;
  }
}

export async function fetchRankings() {
    try {
        const res = await fetch(API.RANKINGS, { headers: HEADERS, next: { revalidate: 3600 } });
        const data = await res.json();
        const owgr = data.rankings?.find((r: any) => r.name === 'Official World Golf Ranking') || data.rankings?.[0];
        
        return owgr?.ranks?.slice(0, 30).map((r: any) => ({
            rank: r.current,
            name: r.athlete.displayName,
            points: r.points,
            headshot: r.athlete.headshot?.href,
            country: r.athlete.flag?.href
        })) || [];
    } catch (e) { return []; }
}

export async function fetchSchedule() {
    try {
        const res = await fetch(API.SCHEDULE, { headers: HEADERS, next: { revalidate: 86400 } });
        const data = await res.json();
        const upcoming = data.events?.filter((e: any) => e.status.type.state === 'pre').slice(0, 5);
        
        return upcoming?.map((e: any) => ({
            id: e.id,
            name: e.name,
            dates: formatDate(e.date),
            venue: e.competitions?.[0]?.venue?.fullName,
            defending: e.defendingChampion?.athlete?.displayName || 'TBA'
        })) || [];
    } catch (e) { return []; }
}

export async function fetchStatLeaders() {
    const categories = [
        { name: 'FedEx Cup', sort: 'cupPoints:desc' },
        { name: 'Scoring Avg', sort: 'scoringAverage:asc' },
        { name: 'Driving Dist', sort: 'drivingDistance:desc' },
        { name: 'Driving Acc', sort: 'drivingAccuracy:desc' },
        { name: 'GIR %', sort: 'greensInRegulation:desc' },
        { name: 'Putting Avg', sort: 'puttingAverage:asc' }
    ];

    const stats: any = {};

    for (const cat of categories) {
        try {
            const res = await fetch(`${API.STATS}?sort=${cat.sort}&limit=5`, { headers: HEADERS, next: { revalidate: 3600 } });
            const data = await res.json();
            stats[cat.name] = data.athletes?.map((a: any) => ({
                name: a.athlete.displayName,
                value: a.displayValue,
                headshot: a.athlete.headshot?.href,
                rank: a.rank
            })) || [];
        } catch (e) { stats[cat.name] = []; }
    }
    
    return stats;
}