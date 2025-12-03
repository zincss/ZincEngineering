// app/sports/nfl/lib/espn.ts
import { notFound } from "next/navigation";

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

const API = {
  // FIXED: Added '/site' to the path
  SCOREBOARD: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  STANDINGS: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/standings',
  TEAMS: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
  ATHLETES: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete',
  PLAYER_BASE: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes',
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
        isLive: e.status.type.state === 'in',
        home: {
          code: c.competitors[0].team.abbreviation,
          logo: c.competitors[0].team.logo,
          score: c.competitors[0].score,
          record: c.competitors[0].records?.[0]?.summary
        },
        away: {
          code: c.competitors[1].team.abbreviation,
          logo: c.competitors[1].team.logo,
          score: c.competitors[1].score,
          record: c.competitors[1].records?.[0]?.summary
        }
      };
    }) || [];
  } catch (e) { return []; }
}

export async function fetchStandings() {
  try {
    const res = await fetch(API.STANDINGS, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error("Standings fetch failed");
    
    const data = await res.json();
    
    const processConference = (targetConf: 'AFC' | 'NFC') => {
      // Robust find: Check full name OR abbreviation (Case Insensitive)
      const conf = data.children?.find((c: any) => {
        const n = (c.name || '').toUpperCase();
        const s = (c.shortName || '').toUpperCase();
        const a = (c.abbreviation || '').toUpperCase();
        
        if (targetConf === 'AFC') return n.includes('AMERICAN') || s === 'AFC' || a === 'AFC';
        if (targetConf === 'NFC') return n.includes('NATIONAL') || s === 'NFC' || a === 'NFC';
        return false;
      });
      
      if (!conf) return [];

      // Flatten divisions (Conference -> Divisions -> Standings -> Entries)
      const allTeams = conf.children?.flatMap((div: any) => {
        return div.standings?.entries?.map((e: any) => {
             const stats = e.stats || [];
             const getStat = (n: string) => stats.find((s:any) => s.name === n)?.displayValue || '-';
             
             // Extract Seed: Try 'playoffSeed' stat first, then 'seed' property
             let seed = parseInt(getStat('playoffSeed'));
             if (isNaN(seed)) seed = e.seed;
             if (!seed) seed = 99;

             return {
                 id: e.team.id,
                 rank: seed, 
                 name: e.team.displayName,
                 abbr: e.team.abbreviation,
                 logo: e.team.logos?.[0]?.href,
                 clinch: e.clincher?.displayName, 
                 stats: {
                   w: getStat('wins'),
                   l: getStat('losses'),
                   t: getStat('ties'),
                   pct: getStat('winPercent'),
                   diff: getStat('pointDifferential'),
                   streak: getStat('streak'),
                 }
             };
        }) || [];
      }) || [];

      // Sort by seed (ascending), then by win %
      return allTeams.sort((a: any, b: any) => {
          if (a.rank !== 99 && b.rank !== 99) return a.rank - b.rank;
          return parseFloat(b.stats.pct) - parseFloat(a.stats.pct);
      });
    };

    return {
      afc: processConference('AFC'),
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
      
      const catName = cat.sort.split('.')[0];
      const statName = cat.sort.split('.')[1].split(':')[0];
      const categoryMeta = data.categories?.find((c: any) => c.name === catName);
      const statIndex = categoryMeta?.names?.indexOf(statName);

      results[cat.key] = data.athletes?.map((a: any) => {
        let val = '-';
        if (a.statistics?.[0]?.displayValue) {
             val = a.statistics[0].displayValue;
        } else if (statIndex !== undefined && statIndex !== -1) {
            const athleteCat = a.categories?.find((c: any) => c.name === catName);
            val = athleteCat?.values?.[statIndex] || '-';
        }
        
        if (val === '-') val = a.displayValue || '-';

        return {
          id: a.athlete.id,
          name: a.athlete.displayName,
          team: a.athlete.team?.abbreviation,
          headshot: a.athlete.headshot?.href,
          value: val
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

        return {
            id: ath.id,
            name: ath.displayName,
            headshot: ath.headshot?.href,
            team: ath.team?.abbreviation || 'NFL',
            number: ath.jersey,
            pos: ath.position?.abbreviation,
            height: ath.displayHeight,
            weight: ath.displayWeight,
            exp: ath.experience?.years || 'R',
            college: ath.college?.name || 'None',
            age: ath.age,
            stats: ath.statsSummary?.statistics?.map((s: any) => ({
                name: s.displayName, 
                value: s.displayValue
            })) || []
        };
    } catch (e) { return null; }
}