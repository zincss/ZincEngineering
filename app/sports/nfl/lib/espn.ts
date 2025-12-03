// app/sports/nfl/lib/espn.ts
import { notFound } from "next/navigation";

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

const API = {
  SCOREBOARD: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  STANDINGS: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/standings',
  TEAMS: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
  ATHLETES: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete',
  PLAYER_BASE: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes',
  // NEW ENDPOINT: Gives us the "Big" stats card (Passing/Rushing/etc) instead of just bio
  PLAYER_OVERVIEW: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{id}/overview',
  // NEW ENDPOINT: Specific game log endpoint
  PLAYER_GAMELOG: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{id}/gamelog'
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
    // Added 'level=3' to ensure we get Division-grouped standings
    const res = await fetch(`${API.STANDINGS}?level=3`, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error("Standings fetch failed");
    
    const data = await res.json();
    
    const processConference = (targetConf: 'AFC' | 'NFC') => {
      const conf = data.children?.find((c: any) => {
        const n = (c.name || '').toUpperCase();
        const s = (c.shortName || '').toUpperCase();
        const a = (c.abbreviation || '').toUpperCase();
        
        if (targetConf === 'AFC') return n.includes('AMERICAN') || s === 'AFC' || a === 'AFC';
        if (targetConf === 'NFC') return n.includes('NATIONAL') || s === 'NFC' || a === 'NFC';
        return false;
      });
      
      if (!conf) return [];

      const divisions = conf.children || [];
      
      const allTeams = divisions.flatMap((div: any) => {
        const entries = div.standings?.entries || [];
        
        return entries.map((e: any) => {
             const stats = e.stats || [];
             const getStat = (n: string) => stats.find((s:any) => s.name === n)?.displayValue || '-';
             
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
        });
      });

      return (allTeams || []).sort((a: any, b: any) => {
          if (a.rank !== 99 && b.rank !== 99) return a.rank - b.rank;
          const pctA = parseFloat(a.stats.pct) || 0;
          const pctB = parseFloat(b.stats.pct) || 0;
          return pctB - pctA;
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

// REWRITTEN to use Overview endpoint (better stats)
export async function fetchPlayerProfile(id: string) {
    try {
        const res = await fetch(API.PLAYER_OVERVIEW.replace('{id}', id), { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        
        const data = await res.json();
        const ath = data.athlete;
        
        return {
            id: ath.id,
            name: ath.displayName,
            headshot: ath.headshot?.href,
            team: ath.team?.abbreviation || 'NFL',
            teamColor: ath.team?.color || '27272a', // Zinc-800 default if missing
            number: ath.jersey,
            pos: ath.position?.abbreviation,
            height: ath.displayHeight,
            weight: ath.displayWeight,
            exp: ath.experience?.years || 'R',
            college: ath.college?.name || 'None',
            age: ath.age,
            stats: [] // We calculate these from game log now for accuracy
        };
    } catch (e) { return null; }
}

// REWRITTEN to force 2024 season and parse stats correctly
export async function fetchPlayerGameLog(id: string) {
    try {
        // Force season 2024 to ensure we get data even if off-season
        const res = await fetch(`${API.PLAYER_GAMELOG.replace('{id}', id)}?season=2024&seasontype=2`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        
        return data.events?.map((evt: any) => {
            const gameId = evt.id;
            
            // Flatten the nested 'stats' structure from ESPN
            let flatStats: any[] = [];
            
            if (evt.stats) {
                // If stats are in categories (Passing, Rushing, etc)
                if (Array.isArray(evt.stats)) {
                    evt.stats.forEach((cat: any) => {
                        // Check if this category has stats object
                        if (cat.stats) {
                            Object.keys(cat.stats).forEach(k => {
                                 flatStats.push({ 
                                     name: cat.name || 'stat',
                                     label: k, 
                                     value: cat.stats[k] 
                                 });
                            });
                        }
                    });
                }
            }

            return {
                id: gameId,
                date: evt.gameDate,
                week: evt.week,
                opponent: evt.opponent?.abbreviation || 'BYE',
                opponentLogo: evt.opponent?.logo,
                result: evt.gameResult || '-',
                stats: flatStats
            };
        }) || [];

    } catch (e) { return []; }
}

// NEW ORCHESTRATOR
export async function fetchPlayerFullProfile(id: string) {
    const [profile, gameLog] = await Promise.all([
        fetchPlayerProfile(id),
        fetchPlayerGameLog(id)
    ]);

    if (!profile) return null;
    
    // Calculate Season Totals manually from Game Log for the Hero Section
    let seasonStats: any = {};
    
    if (gameLog && gameLog.length > 0) {
        gameLog.forEach((game: any) => {
            game.stats.forEach((stat: any) => {
                const key = (stat.label || stat.name).toUpperCase();
                const val = parseFloat(stat.value);
                if (!isNaN(val)) {
                    if (!seasonStats[key]) seasonStats[key] = 0;
                    seasonStats[key] += val;
                }
            });
        });
    }

    // Define Hero Stats based on Position
    let heroStats: any[] = [];
    const s = seasonStats;
    const p = profile.pos || '';
    
    if (p === 'QB') {
        heroStats = [
            { name: 'Passing Yds', value: s['YDS'] || 0 },
            { name: 'Touchdowns', value: s['TD'] || 0 },
            { name: 'Interceptions', value: s['INT'] || 0 },
        ];
    } else if (p === 'RB') {
        heroStats = [
            { name: 'Rushing Yds', value: s['YDS'] || 0 },
            { name: 'Carries', value: s['CAR'] || 0 },
            { name: 'Avg', value: s['CAR'] ? (s['YDS']/s['CAR']).toFixed(1) : 0 },
        ];
    } else if (p === 'WR' || p === 'TE') {
        heroStats = [
            { name: 'Rec Yards', value: s['YDS'] || 0 },
            { name: 'Receptions', value: s['REC'] || 0 },
            { name: 'Touchdowns', value: s['TD'] || 0 },
        ];
    } else {
         // Defense / Other
         heroStats = [
            { name: 'Tackles', value: (s['TOT'] || s['TACKLES'] || 0) },
            { name: 'Sacks', value: s['SACKS'] || 0 },
            { name: 'INTs', value: s['INT'] || 0 },
         ];
    }

    return {
        ...profile,
        stats: heroStats,
        gameLog: gameLog
    };
}