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
    if (val === undefined || val === null || val === '') return '-';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(1);
};

// --- FETCHERS ---
// (Keep fetchLiveScoreboard, fetchStandings, fetchDailyLeaders, fetchTeamProfile as is)
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
    
    const res = await fetch(`${API.ATHLETES}?${params}`, { headers: HEADERS, cache: 'no-store' });
    const data = await res.json();
    
    const sortKey = cat.sort.split(':')[0]; 
    const [catName, statName] = sortKey.split('.'); 
    
    const categoryMeta = data.categories?.find((c: any) => c.name === catName);
    const statIndex = categoryMeta?.names?.indexOf(statName);

    results[cat.key] = data.athletes?.map((a: any) => {
      let val = a.statistics?.[0]?.displayValue;

      if (!val && statIndex !== undefined && statIndex !== -1) {
          const athleteCat = a.categories?.find((c: any) => c.name === catName);
          val = athleteCat?.values?.[statIndex];
      }

      return {
        id: a.athlete.id,
        name: a.athlete.displayName,
        team: a.athlete.team?.abbreviation,
        headshot: a.athlete.headshot?.href,
        value: formatStat(val) 
      };
    }) || [];
  }
  return results;
}

export async function fetchTeamProfile(id: string) {
  const res = await fetch(`${API.TEAMS}/${id}?enable=roster`, { headers: HEADERS });
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
    roster: t.roster?.entries?.map((e: any) => ({
        id: e.athlete.id,
        name: e.athlete.displayName,
        jersey: e.athlete.jersey,
        pos: e.athlete.position?.abbreviation,
        height: e.athlete.displayHeight,
        headshot: e.athlete.headshot?.href
    })) || [],
    links: t.links?.map((l:any) => ({ text: l.text, href: l.href }))
  };
}

// --- UPDATE: FETCH PLAYER PROFILE (Robust) ---
export async function fetchPlayerProfile(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        
        const data = await res.json();
        const ath = data.athlete;

        // Helper to format draft string
        const getDraftInfo = () => {
            if (ath.draft) {
                return `${ath.draft.year} • Rd ${ath.draft.round} • Pk ${ath.draft.selection}`;
            }
            // Sometimes it's in displayDraft
            if (ath.displayDraft) return ath.displayDraft;
            return 'Undrafted';
        };

        // Helper to format Birthplace
        const getBirthPlace = () => {
            if (ath.birthPlace) {
                const city = ath.birthPlace.city || '';
                const state = ath.birthPlace.state || ath.birthPlace.country || '';
                if (city && state) return `${city}, ${state}`;
                return city || state || 'Unknown';
            }
            return 'Unknown';
        };

        return {
            id: ath.id,
            name: ath.displayName,
            headshot: ath.headshot?.href,
            team: ath.team?.abbreviation || 'NBA',
            teamId: ath.team?.id,
            number: ath.jersey,
            pos: ath.position?.abbreviation,
            height: ath.displayHeight,
            weight: ath.displayWeight,
            experience: ath.experience?.years || 'R',
            
            // IMPROVED MAPPING
            age: ath.age || '-',
            birthPlace: getBirthPlace(),
            college: ath.college?.name || ath.displayCollege || 'None',
            draft: getDraftInfo(),
            status: ath.status?.name || 'Active',
            
            stats: ath.statsSummary?.statistics?.map((s: any) => ({
                name: s.displayName, 
                displayValue: s.displayValue
            })) || []
        };
    } catch (e) {
        return null;
    }
}

// --- UPDATE: FETCH PLAYER GAME LOG (Deep Search) ---
export async function fetchPlayerGameLog(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}/gamelog`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        
        let events = [];

        // 1. Try flat events
        if (data.events && data.events.length > 0) {
            events = data.events;
        } 
        // 2. Try nested seasonTypes (Common in NBA API)
        else if (data.seasonTypes) {
            // Find Regular Season (usually type 2) or Postseason (3)
            const season = data.seasonTypes.find((s: any) => s.id === '2' || s.name === 'Regular Season') 
                        || data.seasonTypes[0];
            
            if (season && season.categories) {
                // Usually events are inside the first category
                events = season.categories.flatMap((c: any) => c.events || []);
            } else if (season && season.events) {
                events = season.events;
            }
        }

        // Get last 5 games
        return events.slice(0, 5).map((e: any) => {
             const stats = e.stats || [];
             // STANDARD NBA STATS INDEX (Approximate)
             // 0:MIN, 1:FGM-A, 2:FG%, 3:3PM-A, 4:3P%, 5:FTM-A, 6:FT%, 7:REB, 8:AST, 9:BLK, 10:STL, 11:PF, 12:TO, 13:PTS
             // We use the last element for PTS to be safe, or specific indices if array length is standard (14-15)
             
             const pts = stats.length > 10 ? stats[stats.length - 1] : (stats[13] || '-');
             const reb = stats.length > 7 ? stats[7] : '-';
             const ast = stats.length > 8 ? stats[8] : '-';
             const blk = stats.length > 9 ? stats[9] : '-';
             const stl = stats.length > 10 ? stats[10] : '-';

             return {
                 date: e.gameDate ? new Date(e.gameDate).toLocaleDateString(undefined, {month:'numeric', day:'numeric'}) : '-',
                 opponent: e.opponent?.abbreviation || 'OPP',
                 result: e.gameResult || '-',
                 pts: pts,
                 reb: reb,
                 ast: ast,
                 blk: blk,
                 stl: stl,
             };
        });
    } catch (e) {
        console.error("Game Log Error:", e);
        return [];
    }
}

export async function fetchGameSummary(gameId: string) {
    try {
        const res = await fetch(`${API.SUMMARY}?event=${gameId}`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        
        const data = await res.json();
        const header = data.header;
        const comp = header.competitions[0];
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