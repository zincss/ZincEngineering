// app/sports/nfl/lib/espn.ts
import { notFound } from "next/navigation";

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

// --- ENDPOINTS ---
const API = {
  SCOREBOARD: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  STANDINGS: 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings',
  TEAMS: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
  ATHLETES: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete',
  PLAYER_BASE: 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes',
  SUMMARY: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary',
};

// --- PROPRIETARY ALGORITHMS ---

function calculateNFLWinProbability(homeScoreStr: string, awayScoreStr: string, period: number, clockStr: string, statusState: string) {
    const homeScore = parseInt(homeScoreStr || '0');
    const awayScore = parseInt(awayScoreStr || '0');

    if (statusState === 'post' || statusState.includes('Final')) {
        return homeScore > awayScore ? '100.0' : homeScore < awayScore ? '0.0' : '50.0';
    }
    if (statusState === 'pre') return '50.0';

    let minutesLeftInPeriod = 15.0;
    if (clockStr && clockStr.includes(':')) {
        const parts = clockStr.split(':');
        minutesLeftInPeriod = parseInt(parts[0]) + (parseInt(parts[1]) / 60);
    }

    let totalMinutesRemaining = 0;
    if (period <= 4) {
        totalMinutesRemaining = ((4 - period) * 15) + minutesLeftInPeriod;
    } else {
        totalMinutesRemaining = minutesLeftInPeriod;
    }

    const T = Math.max(totalMinutesRemaining / 60, 0.02);
    const stdDev = 16.0 * Math.sqrt(T);
    const diff = homeScore - awayScore;
    const z = diff / stdDev;
    const p = 1 / (1 + Math.exp(-1.7 * z));

    return (p * 100).toFixed(1);
}

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

async function getTeamSeasonStats(teamId: string) {
    try {
        const res = await fetch(`${API.TEAMS}/${teamId}`, { headers: HEADERS, cache: 'no-store' });
        const data = await res.json();
        const record = data.team?.record?.items?.[0];
        const stats = record?.stats;
        const findStat = (name: string) => stats?.find((s:any) => s.name === name)?.value || 0;
        return {
            pf: findStat('pointsFor'),
            pa: findStat('pointsAgainst'),
            diff: findStat('pointDifferential')
        };
    } catch (e) { return null; }
}

// --- CORE FETCHERS (PRESERVED) ---

const formatStat = (val: any) => (val === undefined || val === null || val === '') ? '-' : val.toString();

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

export async function fetchSchedule() { return fetchLiveScoreboard(); }

export async function fetchStandings() {
  try {
    const res = await fetch(`${API.STANDINGS}?level=3`, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error("Standings fetch failed");
    const data = await res.json();
    const processConference = (targetConf: string) => {
        const conf = data.children?.find((c: any) => (c.name || '').toUpperCase().includes(targetConf) || (c.abbreviation || '').toUpperCase() === targetConf);
        if(!conf || !conf.children) return [];
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
        return allTeams.sort((a: any, b: any) => a.rank - b.rank);
    };
    return { afc: processConference('AFC'), nfc: processConference('NFC') };
  } catch (e) { return { afc: [], nfc: [] }; }
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
      const params = new URLSearchParams({ region: 'us', lang: 'en', contentorigin: 'espn', isqualified: 'false', page: '1', limit: '5', sort: cat.sort });
      const res = await fetch(`${API.ATHLETES}?${params}`, { headers: HEADERS, cache: 'no-store' });
      const data = await res.json();
      results[cat.key] = data.athletes?.map((a: any) => {
          let val = a.displayValue;
          if (!val && a.statistics && a.statistics.length > 0) {
              val = a.statistics[0].displayValue;
          }
          return {
            id: a.athlete.id,
            name: a.athlete.displayName,
            team: a.athlete.team?.abbreviation,
            headshot: a.athlete.headshot?.href,
            value: formatStat(val)
          };
      }) || [];
    } catch (e) { results[cat.key] = []; }
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
        const getDraftInfo = () => ath.draft ? `${ath.draft.year} • Rd ${ath.draft.round} • Pk ${ath.draft.selection}` : (ath.displayDraft || 'Undrafted');
        
        let experience = 'R';
        if (ath.experience && ath.experience.years !== undefined) {
            experience = ath.experience.years === 0 ? 'R' : ath.experience.years.toString();
        }

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
            experience: experience,
            age: ath.age || '-',
            college: ath.college?.name || ath.displayCollege || 'None',
            draft: getDraftInfo(),
            status: ath.status?.name || 'Active',
            stats: ath.statsSummary?.statistics?.map((s: any) => ({ name: s.displayName, displayValue: s.displayValue })) || []
        };
    } catch (e) { return null; }
}

export async function fetchPlayerGameLog(id: string) {
    try {
        const res = await fetch(`${API.PLAYER_BASE}/${id}/gamelog`, { headers: HEADERS, cache: 'no-store' });
        if (!res.ok) return []; 
        const data = await res.json();
        let events = [];
        if (data.events) events = data.events;
        else if (data.seasonTypes) {
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
             
             // Enhanced Stats Extraction
             let stats = [];
             if (e.stats) {
                 stats = e.stats.map((s:any) => {
                     if (typeof s === 'object' && s !== null) return s.displayValue || s.value || '-';
                     return s;
                 });
             }

             return {
                 date: dateStr,
                 opponent: opponent,
                 result: e.gameResult || (e.game ? e.game.result : '-'),
                 stats: stats
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
        if(res.ok) summaryData = await res.json();
        
        const header = summaryData?.header || summaryData?.gamepackageJSON?.header;
        
        // Fallback
        if (!header) {
             const scoreboard = await fetchLiveScoreboard();
             const fallbackGame = scoreboard.find((g:any) => g.id === gameId);
             if (!fallbackGame) return null;
             return {
                 game: { id: fallbackGame.id, status: 'pre', statusDetail: fallbackGame.status, clock: '0:00', period: 1 },
                 home: { id: '0', name: fallbackGame.home.code, abbr: fallbackGame.home.code, score: fallbackGame.home.score, logo: fallbackGame.home.logo, record: '0-0' },
                 away: { id: '0', name: fallbackGame.away.code, abbr: fallbackGame.away.code, score: fallbackGame.away.score, logo: fallbackGame.away.logo, record: '0-0' },
                 analysis: { probability: { home: '50.0', away: '50.0' }, odds: { spread: '-', overUnder: '-' }, homeForm: [], awayForm: [], insights: [] },
                 leaders: { label: 'Game Leaders', passing: [], rushing: [], receiving: [] },
                 comparison: []
             };
        }

        const competition = header.competitions?.[0];
        let homeComp = competition.competitors?.find((c: any) => c.homeAway === 'home') || competition.competitors[0];
        let awayComp = competition.competitors?.find((c: any) => c.homeAway === 'away') || competition.competitors[1];

        let gameState = header.status?.type?.state || 'pre';
        if (header.status?.type?.completed === true) gameState = 'post';

        // --- FETCH EXTRAS ---
        const [homeStats, awayStats, homeForm, awayForm] = await Promise.all([
            getTeamSeasonStats(homeComp.id),
            getTeamSeasonStats(awayComp.id),
            fetchTeamLastFive(homeComp.id),
            fetchTeamLastFive(awayComp.id)
        ]);

        // --- WIN PROBABILITY ---
        let homeWinPct = '50.0';
        if (summaryData.predictor?.homeTeam?.gameProjection) {
            homeWinPct = summaryData.predictor.homeTeam.gameProjection;
        } else if (summaryData.winprobability?.length > 0) {
            homeWinPct = (summaryData.winprobability[summaryData.winprobability.length - 1].homeWinPercentage * 100).toFixed(1);
        } else {
             homeWinPct = calculateNFLWinProbability(homeComp.score, awayComp.score, header.status?.period, header.status?.displayClock, gameState);
        }

        // --- ODDS ---
        let oddsData: any = { spread: 'EVEN', overUnder: '-', moneyLine: null };
        if(summaryData.pickcenter?.[0]) {
            const pc = summaryData.pickcenter[0];
            oddsData = { spread: pc.spread, overUnder: pc.overUnder, moneyLine: pc.moneyLine };
        }

        // --- INSIGHTS ---
        const insights = [];
        if (homeStats && awayStats) {
             if (homeStats.diff > 100) insights.push(`${homeComp.team.displayName} have a massive point differential (+${homeStats.diff}).`);
             if (awayStats.pf > 400) insights.push(`High Octane: ${awayComp.team.displayName} have one of the league's best offenses.`);
        }

        // --- COMPARISON ---
        const comparison = [];
        if (homeStats && awayStats) {
            comparison.push({ label: 'Points For', home: homeStats.pf, away: awayStats.pf, better: homeStats.pf > awayStats.pf ? 'home' : 'away' });
            comparison.push({ label: 'Points Agst', home: homeStats.pa, away: awayStats.pa, better: homeStats.pa < awayStats.pa ? 'home' : 'away' });
        }

        // --- LEADERS ---
        let leadersData: any = {
            passing: summaryData.leaders?.find((l:any) => l.name === 'passingLeader')?.leaders || [],
            rushing: summaryData.leaders?.find((l:any) => l.name === 'rushingLeader')?.leaders || [],
            receiving: summaryData.leaders?.find((l:any) => l.name === 'receivingLeader')?.leaders || []
        };

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
            comparison, // Added
            leaders: {
                label: 'Game Leaders',
                ...leadersData
            }
        };
    } catch (e) {
        return null;
    }
}