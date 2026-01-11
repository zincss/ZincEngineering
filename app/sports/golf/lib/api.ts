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
        // 1. Try finding a past event in the CURRENT season schedule
        const schedRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard', { headers: HEADERS, next: { revalidate: 3600 } });
        const schedData = await schedRes.json();
        
        let lastEvent = null;
        const calendar = schedData.leagues?.[0]?.calendar || [];
        
        // Find the last event that has passed
        const now = new Date();
        const ignoreTerms = ['Q-School', 'Qualifying', 'Korn Ferry'];
        
        const filterEvents = (list: any[]) => list.filter((e: any) => 
            new Date(e.endDate) < now && 
            !ignoreTerms.some(term => e.label.includes(term) || e.name?.includes(term))
        );

        let pastEvents = filterEvents(calendar);
        
        if (pastEvents.length > 0) {
            lastEvent = pastEvents[pastEvents.length - 1];
        } else {
            // 2. If no past events in current season, check PREVIOUS season
            const prevYear = new Date().getFullYear() - 1;
            const prevSchedRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${prevYear}`, { headers: HEADERS, next: { revalidate: 3600 } });
            const prevSchedData = await prevSchedRes.json();
            const prevCalendar = prevSchedData.leagues?.[0]?.calendar || [];
            
            pastEvents = filterEvents(prevCalendar);
            
            if (pastEvents.length > 0) {
                lastEvent = pastEvents[pastEvents.length - 1];
            }
        }

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
        if (res.ok) {
            const data = await res.json();
            const owgr = data.rankings?.find((r: any) => r.name === 'Official World Golf Ranking') || data.rankings?.[0];
            
            if (owgr && owgr.ranks) {
                return owgr.ranks.slice(0, 10).map((r: any) => ({
                    id: r.athlete.id,
                    rank: r.current,
                    name: r.athlete.displayName,
                    points: r.points,
                    value: `${r.points} PTS`, // For LeaderSlideshow
                    headshot: r.athlete.headshot?.href,
                    country: r.athlete.flag?.href,
                    team: r.athlete.flag?.caption || 'PGA', // For LeaderSlideshow
                    label: 'OWGR Rank' // For LeaderSlideshow
                }));
            }
        }
        throw new Error("Rankings API Failed");
    } catch (e) { 
        // Fallback Data (Verified IDs as of Jan 2026)
        return [
            { id: '9478', rank: 1, name: 'Scottie Scheffler', value: '1 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/9478.png', team: 'USA', label: 'OWGR Rank' },
            { id: '10140', rank: 2, name: 'Xander Schauffele', value: '2 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/10140.png', team: 'USA', label: 'OWGR Rank' },
            { id: '3470', rank: 3, name: 'Rory McIlroy', value: '3 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/3470.png', team: 'NIR', label: 'OWGR Rank' },
            { id: '10592', rank: 4, name: 'Collin Morikawa', value: '4 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/10592.png', team: 'USA', label: 'OWGR Rank' },
            { id: '4375972', rank: 5, name: 'Ludvig Aberg', value: '5 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/4375972.png', team: 'SWE', label: 'OWGR Rank' },
            { id: '11119', rank: 6, name: 'Wyndham Clark', value: '6 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/11119.png', team: 'USA', label: 'OWGR Rank' },
            { id: '4364873', rank: 7, name: 'Viktor Hovland', value: '7 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/4364873.png', team: 'NOR', label: 'OWGR Rank' },
            { id: '6007', rank: 8, name: 'Patrick Cantlay', value: '8 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/6007.png', team: 'USA', label: 'OWGR Rank' },
            { id: '9780', rank: 9, name: 'Jon Rahm', value: '9 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/9780.png', team: 'ESP', label: 'OWGR Rank' },
            { id: '5860', rank: 10, name: 'Hideki Matsuyama', value: '10 Rank', headshot: 'https://a.espncdn.com/i/headshots/golf/players/full/5860.png', team: 'JPN', label: 'OWGR Rank' }
        ];
    }
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
                id: a.athlete.id,
                name: a.athlete.displayName,
                value: a.displayValue,
                headshot: a.athlete.headshot?.href,
                rank: a.rank,
                team: a.athlete.flag?.caption || 'PGA', // Use country as team or 'PGA'
                label: cat.name
            })) || [];
        } catch (e) { stats[cat.name] = []; }
    }
    
    return stats;
}