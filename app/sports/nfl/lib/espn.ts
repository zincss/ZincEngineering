// app/sports/nfl/lib/espn.ts
import { notFound } from "next/navigation";

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

// --- ENDPOINTS ---
const API = {
  SCOREBOARD: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  // FIX: Switched from 'site/v2' to 'v2' to correctly support the level=3 param
  STANDINGS: 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings',
  TEAMS: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
  ATHLETES: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete',
  PLAYER_BASE: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes',
};

// --- HELPER: Format Stats ---
const formatStat = (val: any) => {
    if (val === undefined || val === null || val === '') return '-';
    return val.toString();
};

// --- FETCHERS ---
export async function fetchLiveScoreboard() {
  try {
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
  } catch (e) { return []; }
}

export async function fetchStandings() {
  try {
    // level=3 gets us League -> Conference -> Division -> Team
    const res = await fetch(`${API.STANDINGS}?level=3`, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error("Standings fetch failed");
    
    const data = await res.json();
    
    const processConference = (targetConf: string) => {
        // 1. Find Conference (matches 'AFC', 'American Football Conference', etc)
        const conf = data.children?.find((c: any) => {
            const name = (c.name || '').toUpperCase();
            const abbr = (c.abbreviation || '').toUpperCase();
            const target = targetConf.toUpperCase();
            return name.includes(target) || abbr === target;
        });

        if(!conf || !conf.children) return [];

        // 2. Flatten Divisions to get all teams
        const allTeams = conf.children.flatMap((div: any) => {
            return div.standings?.entries?.map((e: any) => {
                const stats = e.stats || [];
                const getVal = (name: string) => stats.find((s:any) => s.name === name)?.displayValue || '-';
                const getIntVal = (name: string) => stats.find((s:any) => s.name === name)?.value || 0;
                
                return {
                    id: e.team.id,
                    rank: e.seed || parseInt(getVal('playoffSeed')) || 99,
                    name: e.team.displayName,
                    abbr: e.team.abbreviation,
                    logo: e.team.logos?.[0]?.href,
                    clinch: e.clincher?.displayName,
                    stats: {
                        w: getIntVal('wins'),
                        l: getIntVal('losses'),
                        t: getIntVal('ties'),
                        pct: getVal('winPercent'),
                        diff: getVal('pointDifferential'),
                        streak: getVal('streak'),
                    }
                };
            }) || [];
        });

        // 3. Sort by Seed
        return allTeams.sort((a: any, b: any) => {
            if (a.rank !== 99 && b.rank !== 99) return a.rank - b.rank;
            return parseFloat(b.stats.pct) - parseFloat(a.stats.pct);
        });
    };

    return {
        afc: processConference('AFC'), // Changed from 'AMERICAN' to 'AFC' for broader matching
        nfc: processConference('NFC'),
    };
  } catch (e) {
      console.error("NFL Standings Error:", e);
      return { afc: [], nfc: [] };
  }
}

export async function fetchDailyLeaders() {
  const categories = [
      { key: 'pass', sort: 'passing.passingYards:desc' },
      { key: 'rush', sort: 'rushing.rushingYards:desc' },
      { key: 'rec', sort: 'receiving.receivingYards:desc' },
      { key: 'def', sort: 'defensive.sacks:desc' }
  ];

  const results: any = {};

  for (const cat of categories) {
    try {
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
        
        if (!val) val = a.displayValue;

        return {
          id: a.athlete.id,
          name: a.athlete.displayName,
          team: a.athlete.team?.abbreviation,
          headshot: a.athlete.headshot?.href,
          value: formatStat(val)
        };
      }) || [];
    } catch (e) { 
        results[cat.key] = []; 
    }
  }
  return results;
}

export async function fetchTeamProfile(id: string) {
  try {
      const res = await fetch(`${API.TEAMS}/${id}`, { headers: HEADERS, cache: 'no-store' });
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
        stadium: t.franchise?.venue?.fullName || 'Unknown Stadium',
        links: t.links?.map((l:any) => ({ text: l.text, href: l.href }))
      };
  } catch (e) { return null; }
}

export async function fetchPlayerProfile(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        
        const data = await res.json();
        const ath = data.athlete;

        const getDraftInfo = () => {
             if (ath.draft) return `${ath.draft.year} • Rd ${ath.draft.round} • Pk ${ath.draft.selection}`;
             return ath.displayDraft || 'Undrafted';
        };

        return {
            id: ath.id,
            name: ath.displayName,
            headshot: ath.headshot?.href,
            team: ath.team?.abbreviation || 'NFL',
            teamId: ath.team?.id,
            number: ath.jersey,
            pos: ath.position?.abbreviation,
            height: ath.displayHeight,
            weight: ath.displayWeight,
            experience: ath.experience?.years || 'R',
            age: ath.age || '-',
            college: ath.college?.name || ath.displayCollege || 'None',
            draft: getDraftInfo(),
            status: ath.status?.name || 'Active',
            stats: ath.statsSummary?.statistics?.map((s: any) => ({
                name: s.displayName, 
                displayValue: s.displayValue
            })) || []
        };
    } catch (e) { return null; }
}

export async function fetchPlayerGameLog(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}/gamelog`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return []; 
        
        const data = await res.json();
        let events = [];

        if (data.events) {
            events = data.events;
        } else if (data.seasonTypes) {
             const season = data.seasonTypes.find((s: any) => s.name === 'Regular Season' || s.id === '2') || data.seasonTypes[0];
             if (season?.events) events = season.events;
             else if (season?.categories) events = season.categories.flatMap((c:any) => c.events || []);
        }

        return events.slice(0, 8).map((e: any) => {
             let dateStr = '-';
             if (e.gameDate) {
                 const d = new Date(e.gameDate);
                 if (!isNaN(d.getTime())) dateStr = d.toLocaleDateString('en-US', {month:'numeric', day:'numeric'});
             }

             let opponent = 'OPP';
             if (e.opponent) opponent = e.opponent.abbreviation || e.opponent.displayName || 'OPP';
             else if (e.game?.opponent) opponent = e.game.opponent.abbreviation || 'OPP';

             let safeStats = [];
             if (Array.isArray(e.stats)) {
                 safeStats = e.stats.map((s: any) => {
                     if (typeof s === 'object' && s !== null) return s.displayValue || s.value || '-';
                     return s;
                 });
             }

             return {
                 date: dateStr,
                 opponent: opponent,
                 result: e.gameResult || (e.game ? e.game.result : '-'),
                 stats: safeStats
             };
        });
    } catch (e) { return []; }
}