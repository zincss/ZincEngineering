// app/sports/nba/lib/espn.ts
import { notFound } from "next/navigation";

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

// --- ENDPOINTS ---
const API = {
  SCOREBOARD: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  STANDINGS: 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings',
  TEAMS: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams',
  ATHLETES: 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete',
  PLAYER_BASE: 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes',
  SUMMARY: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary',
};

// --- HELPER: Format Stats ---
const formatStat = (val: any) => {
    // FIX: Handle undefined, null, or empty string specifically
    if (val === undefined || val === null || val === '') return '-';
    
    const num = parseFloat(val);
    
    // If it's not a number (and not handled above), return original string
    if (isNaN(num)) return val;
    
    // If it's an integer (35.0), return "35"
    if (Number.isInteger(num)) return num.toString();
    
    // Otherwise return 1 decimal place "35.1"
    return num.toFixed(1);
};

// --- FETCHERS ---

export async function fetchLiveScoreboard() {
  const res = await fetch(API.SCOREBOARD, { headers: HEADERS, cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  
  return data.events?.map((e: any) => {
    const c = e.competitions[0];
    return {
      id: e.id,
      name: e.name,
      status: e.status.type.state === 'in' ? 'LIVE' : e.status.type.shortDetail,
      clock: e.status.displayClock,
      period: e.status.period,
      home: {
        code: c.competitors[0].team.abbreviation,
        logo: c.competitors[0].team.logo,
        score: c.competitors[0].score,
        winner: c.competitors[0].winner
      },
      away: {
        code: c.competitors[1].team.abbreviation,
        logo: c.competitors[1].team.logo,
        score: c.competitors[1].score,
        winner: c.competitors[1].winner
      }
    };
  }) || [];
}

export async function fetchStandings() {
  const res = await fetch(API.STANDINGS, { headers: HEADERS, cache: 'no-store' });
  const data = await res.json();
  
  const processConference = (children: any[]) => {
    return children?.map((c: any) => ({
       id: c.team.id,
       rank: c.team.seed,
       name: c.team.displayName,
       abbr: c.team.abbreviation,
       logo: c.team.logos?.[0]?.href,
       stats: {
         w: c.stats?.find((s:any) => s.name === 'wins')?.value,
         l: c.stats?.find((s:any) => s.name === 'losses')?.value,
         pct: c.stats?.find((s:any) => s.name === 'winPercent')?.displayValue,
         gb: c.stats?.find((s:any) => s.name === 'gamesBehind')?.displayValue,
         streak: c.stats?.find((s:any) => s.name === 'streak')?.displayValue,
       }
    })) || [];
  };

  return {
    east: processConference(data.children?.find((c:any) => c.name === 'Eastern Conference')?.standings?.entries),
    west: processConference(data.children?.find((c:any) => c.name === 'Western Conference')?.standings?.entries),
  };
}

export async function fetchDailyLeaders() {
  const categories = [
      { key: 'pts', sort: 'offensive.avgPoints:desc' },
      { key: 'ast', sort: 'offensive.avgAssists:desc' },
      { key: 'reb', sort: 'general.avgRebounds:desc' }
  ];

  const results: any = {};

  for (const cat of categories) {
    const params = new URLSearchParams({
       region: 'us', lang: 'en', contentorigin: 'espn', isqualified: 'false', 
       page: '1', limit: '5', sort: cat.sort
    });
    
    // FIX: Use cache: 'no-store' to ensure we get fresh data for the DB snapshot
    const res = await fetch(`${API.ATHLETES}?${params}`, { headers: HEADERS, cache: 'no-store' });
    const data = await res.json();
    
    // Resolve correct stat index dynamically
    const sortKey = cat.sort.split(':')[0]; // e.g. "offensive.avgPoints"
    const [catName, statName] = sortKey.split('.'); 
    
    const categoryMeta = data.categories?.find((c: any) => c.name === catName);
    const statIndex = categoryMeta?.names?.indexOf(statName);

    results[cat.key] = data.athletes?.map((a: any) => {
      let val = a.statistics?.[0]?.displayValue;

      // Fallback: Read raw value from categories array if displayValue is missing
      if (!val && statIndex !== undefined && statIndex !== -1) {
          const athleteCat = a.categories?.find((c: any) => c.name === catName);
          val = athleteCat?.values?.[statIndex];
      }

      return {
        id: a.athlete.id,
        name: a.athlete.displayName,
        team: a.athlete.team?.abbreviation,
        headshot: a.athlete.headshot?.href,
        value: formatStat(val) // Updated to use robust formatter
      };
    }) || [];
  }
  return results;
}

export async function fetchTeamProfile(id: string) {
  const res = await fetch(`${API.TEAMS}/${id}`, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const t = data.team;

  return {
    id: t.id,
    location: t.location,
    name: t.name,
    abbr: t.abbreviation,
    color: t.color,
    logo: t.logos?.[0]?.href,
    record: t.record?.items?.[0]?.summary,
    standing: t.standingSummary,
    nextEvent: t.nextEvent?.[0] ? {
      name: t.nextEvent[0].name,
      date: t.nextEvent[0].date,
      opponent: t.nextEvent[0].competitions?.[0]?.competitors?.find((c:any) => c.team.id !== t.id)?.team?.abbreviation
    } : null,
    links: t.links?.map((l:any) => ({ text: l.text, href: l.href }))
  };
}

// --- NEW: FETCH PLAYER PROFILE ---
export async function fetchPlayerProfile(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}`, { headers: HEADERS, next: { revalidate: 3600 } });
        if (!res.ok) return null;
        
        const data = await res.json();
        const ath = data.athlete;

        return {
            id: ath.id,
            name: ath.displayName,
            headshot: ath.headshot?.href,
            team: ath.team?.abbreviation || 'NBA',
            number: ath.jersey,
            pos: ath.position?.abbreviation,
            height: ath.displayHeight,
            weight: ath.displayWeight,
            experience: ath.experience?.years || 'R',
            stats: ath.statsSummary?.statistics?.map((s: any) => ({
                name: s.displayName, 
                displayValue: s.displayValue
            })) || []
        };
    } catch (e) {
        return null;
    }
}

// --- NEW: FETCH GAME SUMMARY ---
export async function fetchGameSummary(gameId: string) {
    try {
        const res = await fetch(`${API.SUMMARY}?event=${gameId}`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        
        const data = await res.json();
        const header = data.header;
        const comp = header.competitions[0];
        const box = data.boxscore;
        const home = comp.competitors.find((c:any) => c.homeAway === 'home');
        const away = comp.competitors.find((c:any) => c.homeAway === 'away');

        return {
            id: header.id,
            venue: comp.venue?.fullName || 'Unknown Arena',
            status: header.timeValid ? header.status.type.shortDetail : 'Scheduled',
            home: {
                id: home.id,
                abbreviation: home.team.abbreviation,
                displayName: home.team.displayName,
                logo: home.team.logos[0].href,
                score: home.score,
                linescores: home.linescores || []
            },
            away: {
                id: away.id,
                abbreviation: away.team.abbreviation,
                displayName: away.team.displayName,
                logo: away.team.logos[0].href,
                score: away.score,
                linescores: away.linescores || []
            },
            leaders: [
                { 
                    label: 'PTS Leader', 
                    homeLeader: data.leaders?.find((l:any)=>l.team.id === home.id)?.leaders?.[0]?.athlete,
                    homeValue: data.leaders?.find((l:any)=>l.team.id === home.id)?.leaders?.[0]?.displayValue,
                    awayLeader: data.leaders?.find((l:any)=>l.team.id === away.id)?.leaders?.[0]?.athlete,
                    awayValue: data.leaders?.find((l:any)=>l.team.id === away.id)?.leaders?.[0]?.displayValue,
                }
            ]
        };
    } catch (e) {
        return null;
    }
}