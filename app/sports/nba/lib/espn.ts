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

// --- PROPRIETARY ALGORITHMS ---

// 1. The Oracle (Win Probability)
function calculateNBAWinProbability(homeScoreStr: string, awayScoreStr: string, period: number, clockStr: string, statusState: string) {
    const homeScore = parseInt(homeScoreStr || '0');
    const awayScore = parseInt(awayScoreStr || '0');

    if (statusState === 'post' || statusState.includes('Final')) {
        return homeScore > awayScore ? '100.0' : homeScore < awayScore ? '0.0' : '50.0';
    }
    if (statusState === 'pre') return '55.0'; // Slight Home Court Advantage

    let minutesLeftInPeriod = 12.0;
    if (clockStr) {
        if (clockStr.includes(':')) {
            const parts = clockStr.split(':');
            minutesLeftInPeriod = parseInt(parts[0]) + (parseInt(parts[1]) / 60);
        } else {
            minutesLeftInPeriod = parseFloat(clockStr) / 60;
        }
    }

    let totalMinutesRemaining = 0;
    if (period <= 4) {
        totalMinutesRemaining = ((4 - period) * 12) + minutesLeftInPeriod;
    } else {
        totalMinutesRemaining = minutesLeftInPeriod; 
    }

    const T = Math.max(totalMinutesRemaining / 48, 0.02); 
    const stdDev = 13.5 * Math.sqrt(T);
    const diff = homeScore - awayScore;
    const z = diff / stdDev;
    const p = 1 / (1 + Math.exp(-1.7 * z));

    return (p * 100).toFixed(1);
}

// 2. Form Engine
async function fetchTeamLastFive(teamId: string) {
    try {
        const res = await fetch(`${API.TEAMS}/${teamId}/schedule`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        const events = data.events?.filter((e: any) => e.competitions?.[0]?.status?.type?.completed) || [];
        const last5 = events.slice(-5).reverse();
        
        return last5.map((e: any) => {
            const c = e.competitions[0];
            const competitor = c.competitors?.find((t:any) => t.team?.id === teamId);
            const winner = c.competitors?.find((t:any) => t.winner);
            if (winner) return winner.team.id === teamId ? 'W' : 'L';
            const score = parseInt(competitor?.score?.value || '0');
            const oppScore = parseInt(c.competitors?.find((t:any) => t.team?.id !== teamId)?.score?.value || '0');
            return score > oppScore ? 'W' : 'L';
        });
    } catch (e) { return []; }
}

// 3. Stats Engine (For Comparison)
async function getTeamSeasonStats(teamId: string) {
    try {
        const res = await fetch(`${API.TEAMS}/${teamId}`, { headers: HEADERS, cache: 'no-store' });
        const data = await res.json();
        const record = data.team?.record?.items?.[0]; 
        const stats = record?.stats; 

        const findStat = (name: string) => stats?.find((s:any) => s.name === name)?.value || 0;
        
        return {
            ppg: findStat('avgPoints'),
            oppg: findStat('avgPointsAgainst'),
            rpg: findStat('avgRebounds'),
            apg: findStat('avgAssists'),
            diff: findStat('pointDifferential'),
        };
    } catch (e) { return null; }
}

// --- HELPER: Format Stats ---
const formatStat = (val: any) => {
    if (val === undefined || val === null || val === '') return '-';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(1);
};

// --- CORE FETCHERS (PRESERVED FOR NEXUS HUB) ---

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
  } catch(e) { return []; }
}

export async function fetchSchedule() {
    return fetchLiveScoreboard();
}

export async function fetchStandings() {
  try {
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
  } catch(e) { return { east: [], west: [] }; }
}

export async function fetchDailyLeaders() {
  const categories = [
      { key: 'pts', sort: 'offensive.avgPoints:desc' },
      { key: 'ast', sort: 'offensive.avgAssists:desc' },
      { key: 'reb', sort: 'general.avgRebounds:desc' }
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
    } catch(e) { results[cat.key] = []; }
  }
  return results;
}

export async function fetchTeamProfile(id: string) {
  try {
      const res = await fetch(`${API.TEAMS}/${id}`, { headers: HEADERS, cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      const t = data.team;

      let roster = [];
      try {
          const rosterRes = await fetch(`${API.TEAMS}/${id}/roster`, { headers: HEADERS, cache: 'no-store' });
          if (rosterRes.ok) {
               const rosterData = await rosterRes.json();
               if (rosterData.athletes) roster = rosterData.athletes;
          }
      } catch (e) { console.error("Roster Fetch Failed", e); }

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
        roster: roster.map((p: any) => ({
            id: p.id,
            name: p.displayName,
            jersey: p.jersey,
            pos: p.position?.abbreviation,
            height: p.displayHeight,
            headshot: p.headshot?.href
        })),
        links: t.links?.map((l:any) => ({ text: l.text, href: l.href }))
      };
  } catch(e) { return null; }
}

export async function fetchPlayerProfile(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return null;
        
        const data = await res.json();
        const ath = data.athlete;

        const getDraftInfo = () => {
            if (ath.draft) return `${ath.draft.year} • Rd ${ath.draft.round} • Pk ${ath.draft.selection}`;
            if (ath.displayDraft) return ath.displayDraft;
            return 'Undrafted';
        };

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
    } catch (e) { return null; }
}

export async function fetchPlayerGameLog(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}/gamelog`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        
        let events = [];
        if (data.events && data.events.length > 0) events = data.events;
        else if (data.seasonTypes) {
            const season = data.seasonTypes.find((s: any) => s.id === '2' || s.name === 'Regular Season') || data.seasonTypes[0];
            if (season && season.categories) events = season.categories.flatMap((c: any) => c.events || []);
            else if (season && season.events) events = season.events;
        }

        return events.slice(0, 5).map((e: any) => {
             const stats = e.stats || [];
             let dateStr = '-';
             if (e.gameDate) {
                 const d = new Date(e.gameDate);
                 if (!isNaN(d.getTime())) dateStr = d.toLocaleDateString('en-US', {month:'numeric', day:'numeric'});
             }

             let opponent = 'OPP';
             if (e.opponent) opponent = e.opponent.abbreviation || e.opponent.displayName || 'OPP';
             if ((!opponent || opponent === 'OPP') && e.game?.opponent) opponent = e.game.opponent.abbreviation || 'OPP';

             return {
                 date: dateStr,
                 opponent: opponent,
                 result: e.gameResult || (e.game ? e.game.result : '-'),
                 pts: stats.length > 10 ? stats[stats.length - 1] : (stats[13] || '-'),
                 reb: stats.length > 7 ? stats[7] : '-',
                 ast: stats.length > 8 ? stats[8] : '-',
                 blk: stats.length > 9 ? stats[9] : '-',
                 stl: stats.length > 10 ? stats[10] : '-',
             };
        });
    } catch (e) { return []; }
}

// --- ADVANCED GAME ANALYSIS (Used by Breakdown) ---

export async function fetchGameAnalysis(gameId: string) {
    if (!gameId) return null;

    try {
        const res = await fetch(`${API.SUMMARY}?event=${gameId}`, { headers: HEADERS, cache: 'no-store' });
        let summaryData = null;
        if (res.ok) summaryData = await res.json();
        
        const header = summaryData?.header || summaryData?.gamepackageJSON?.header;
        
        // Fallback: Use Scoreboard if Summary fails
        if (!header) {
             const scoreboard = await fetchLiveScoreboard();
             const fallbackGame = scoreboard.find((g:any) => g.id === gameId);
             if (!fallbackGame) return null;
             
             // Minimal Return
             return {
                 game: { id: fallbackGame.id, status: 'pre', statusDetail: fallbackGame.status, clock: '0:00', period: 1 },
                 home: { id: '0', name: fallbackGame.home.code, abbr: fallbackGame.home.code, score: fallbackGame.home.score, logo: fallbackGame.home.logo, record: '0-0' },
                 away: { id: '0', name: fallbackGame.away.code, abbr: fallbackGame.away.code, score: fallbackGame.away.score, logo: fallbackGame.away.logo, record: '0-0' },
                 analysis: { probability: { home: '50.0', away: '50.0' }, odds: { spread: '-', overUnder: '-' }, homeForm: [], awayForm: [], insights: [] },
                 leaders: { label: 'Key Players', home: [], away: [] },
                 comparison: []
             };
        }

        const competition = header.competitions?.[0];
        let homeComp = competition.competitors?.find((c: any) => c.homeAway === 'home') || competition.competitors[0];
        let awayComp = competition.competitors?.find((c: any) => c.homeAway === 'away') || competition.competitors[1];

        let gameState = header.status?.type?.state || 'pre'; 
        if (header.status?.type?.completed === true) gameState = 'post';

        // --- FETCH PROPRIETARY DATA ---
        const [homeForm, awayForm, homeStats, awayStats] = await Promise.all([
            fetchTeamLastFive(homeComp.id),
            fetchTeamLastFive(awayComp.id),
            getTeamSeasonStats(homeComp.id),
            getTeamSeasonStats(awayComp.id)
        ]);

        // --- WIN PROBABILITY ---
        let homeWinPct = '50.0';
        // 1. Try ESPN
        if (summaryData.predictor?.homeTeam?.gameProjection) {
            homeWinPct = summaryData.predictor.homeTeam.gameProjection;
        } else if (summaryData.winprobability?.length > 0) {
            homeWinPct = (summaryData.winprobability[summaryData.winprobability.length - 1].homeWinPercentage * 100).toFixed(1);
        } else {
            // 2. Use Oracle
            homeWinPct = calculateNBAWinProbability(
                homeComp.score, awayComp.score, header.status?.period, header.status?.displayClock, gameState
            );
        }
        
        // --- ODDS ---
        let oddsData: any = { spread: 'EVEN', overUnder: '-', moneyLine: null };
        if (summaryData.pickcenter?.[0]) {
            const pc = summaryData.pickcenter[0];
            oddsData = { spread: pc.spread, overUnder: pc.overUnder, moneyLine: pc.moneyLine };
        } else if (gameState === 'pre' && homeStats && awayStats) {
             // Synthetic Spread
             const diff = (homeStats.diff - awayStats.diff) + 2.5; // +2.5 Home Court
             oddsData.spread = `${homeComp.team.abbreviation} ${diff < 0 ? '+' : ''}${(diff * -1).toFixed(1)} (Est)`;
        }

        // --- INSIGHTS ENGINE ---
        const insights = [];
        const hWins = homeForm.filter((x:string) => x==='W').length;
        if (hWins >= 4) insights.push(`${homeComp.team.name} are on fire, winning ${hWins} of their last 5 games.`);
        if (homeStats && awayStats) {
            if (homeStats.ppg > 118 && awayStats.ppg > 118) insights.push("Expect fireworks: Both teams average over 118 PPG.");
            if (parseFloat(homeWinPct) > 70) insights.push("Model Favoritism: Strong edge detected for the home team.");
        }

        // --- COMPARISON (Tale of the Tape) ---
        const comparison = [];
        if (homeStats && awayStats) {
            comparison.push({ label: 'PPG', home: homeStats.ppg.toFixed(1), away: awayStats.ppg.toFixed(1), better: homeStats.ppg > awayStats.ppg ? 'home' : 'away' });
            comparison.push({ label: 'OPP PPG', home: homeStats.oppg.toFixed(1), away: awayStats.oppg.toFixed(1), better: homeStats.oppg < awayStats.oppg ? 'home' : 'away' });
            comparison.push({ label: 'RPG', home: homeStats.rpg.toFixed(1), away: awayStats.rpg.toFixed(1), better: homeStats.rpg > awayStats.rpg ? 'home' : 'away' });
            comparison.push({ label: 'APG', home: homeStats.apg.toFixed(1), away: awayStats.apg.toFixed(1), better: homeStats.apg > awayStats.apg ? 'home' : 'away' });
            comparison.push({ label: 'DIFF', home: homeStats.diff.toFixed(1), away: awayStats.diff.toFixed(1), better: homeStats.diff > awayStats.diff ? 'home' : 'away' });
        }

        // --- LEADERS ---
        let homeLeaders = [];
        let awayLeaders = [];
        let leadersLabel = 'Game Leaders';

        if (gameState === 'pre') {
             leadersLabel = 'Key Players';
             // Try to get season leaders if available, else standard
             // For brevity, we stick to what summary provides or empty
        } else {
             const getGameLeaders = (teamId: string) => summaryData.leaders?.find((l:any) => String(l.team?.id) === String(teamId))?.leaders || [];
             homeLeaders = getGameLeaders(homeComp.id);
             awayLeaders = getGameLeaders(awayComp.id);
        }

        return {
            game: {
                id: header.id,
                date: competition.date,
                venue: competition.venue?.fullName || 'Unknown Venue',
                status: gameState,
                statusDetail: header.status?.type?.shortDetail || '-',
                clock: header.status?.displayClock || '0:00',
                period: header.status?.period || 1
            },
            home: {
                id: homeComp.id,
                name: homeComp.team.displayName,
                abbr: homeComp.team.abbreviation,
                logo: homeComp.team.logos?.[0]?.href,
                score: homeComp.score || '0',
                record: homeComp.record?.[0]?.summary || '0-0',
                color: homeComp.team.color || '000000',
            },
            away: {
                id: awayComp.id,
                name: awayComp.team.displayName,
                abbr: awayComp.team.abbreviation,
                logo: awayComp.team.logos?.[0]?.href,
                score: awayComp.score || '0',
                record: awayComp.record?.[0]?.summary || '0-0',
                color: awayComp.team.color || 'ffffff',
            },
            analysis: {
                probability: { home: homeWinPct, away: (100 - parseFloat(homeWinPct)).toFixed(1) },
                odds: oddsData,
                homeForm,
                awayForm,
                insights
            },
            comparison, // Added this field
            leaders: {
                label: leadersLabel,
                home: homeLeaders || [],
                away: awayLeaders || []
            }
        };
    } catch (e) {
        console.error("Critical Analysis Fetch Error", e);
        return null;
    }
}