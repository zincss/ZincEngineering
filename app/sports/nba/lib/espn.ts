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
  // Fetches Top 5 PTS/AST/REB
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
    
    const res = await fetch(`${API.ATHLETES}?${params}`, { headers: HEADERS, next: { revalidate: 3600 }});
    const data = await res.json();
    
    results[cat.key] = data.athletes?.map((a: any) => ({
      id: a.athlete.id,
      name: a.athlete.displayName,
      team: a.athlete.team?.abbreviation,
      headshot: a.athlete.headshot?.href,
      value: a.statistics?.[0]?.displayValue
    })) || [];
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

// --- NEW: FETCH PLAYER PROFILE (On Demand) ---
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
                name: s.displayName, // e.g., "PPG"
                displayValue: s.displayValue
            })) || []
        };
    } catch (e) {
        console.error("ESPN Player Fetch Error", e);
        return null;
    }
}