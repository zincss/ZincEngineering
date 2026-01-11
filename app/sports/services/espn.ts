// app/sports/services/espn.ts
import * as cheerio from 'cheerio';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

const BASE_API = 'https://site.api.espn.com/apis/site/v2/sports';
const COMMON_API = 'https://site.web.api.espn.com/apis/common/v3/sports';

type League = 'nfl' | 'nba' | 'golf';

const ENDPOINTS = {
  nfl: {
    scoreboard: `${BASE_API}/football/nfl/scoreboard`,
    standings: `https://site.api.espn.com/apis/v2/sports/football/nfl/standings`,
    teams: `${BASE_API}/football/nfl/teams`,
    athletes: `${COMMON_API}/football/nfl/athletes`,
    leaders: `${COMMON_API}/football/nfl/statistics/byathlete`,
    web_player: (id: string) => `https://www.espn.com/nfl/player/_/id/${id}`
  },
  nba: {
    scoreboard: `${BASE_API}/basketball/nba/scoreboard`,
    standings: `https://site.api.espn.com/apis/v2/sports/basketball/nba/standings`,
    teams: `${BASE_API}/basketball/nba/teams`,
    athletes: `${COMMON_API}/basketball/nba/athletes`,
    leaders: `${COMMON_API}/basketball/nba/statistics/byathlete`,
    web_player: (id: string) => `https://www.espn.com/nba/player/_/id/${id}`
  },
  golf: {
    scoreboard: `${BASE_API}/golf/pga/scoreboard`,
    standings: `${BASE_API}/golf/pga/rankings`,
    athletes: `${COMMON_API}/golf/pga/athletes`,
    leaders: `https://site.web.api.espn.com/apis/common/v3/sports/golf/pga/statistics/byathlete`,
    web_player: (id: string) => `https://www.espn.com/pga/player/_/id/${id}`
  }
};

// --- DATA NORMALIZERS ---

const formatExperience = (exp: any) => {
    if (!exp) return 'Rookie';
    if (typeof exp === 'object' && exp.years !== undefined) {
        return exp.years === 0 ? 'Rookie' : `${exp.years} Yrs`;
    }
    if (exp === 0 || exp === '0') return 'Rookie';
    return `${exp} Yrs`;
};

const formatStatValue = (val: any) => {
    if (val === undefined || val === null || val === '') return '-';
    return val.toString();
};

// --- API FETCHERS ---

export const getScoreboard = async (league: League, date?: string) => {
    try {
        let url = ENDPOINTS[league].scoreboard;
        if (date) {
            url += `?dates=${date.replace(/-/g, '')}`;
        }
        
        const res = await fetch(url, { headers: HEADERS, next: { revalidate: 30 } });
        if (!res.ok) return [];
        const data = await res.json();
        
        return data.events?.map((e: any) => {
            const c = e.competitions[0];
            return {
                id: e.id,
                date: c.date,
                name: e.name,
                status: e.status.type.state === 'in' ? 'LIVE' : e.status.type.shortDetail,
                clock: e.status.displayClock,
                period: e.status.period,
                isLive: e.status.type.state === 'in',
                venue: c.venue?.fullName || 'Unknown Venue',
                home: {
                    id: c.competitors[0].id || c.competitors[0].team.id,
                    code: c.competitors[0].team.abbreviation,
                    name: c.competitors[0].team.displayName,
                    logo: c.competitors[0].team.logo,
                    score: c.competitors[0].score,
                    record: c.competitors[0].records?.[0]?.summary || '0-0'
                },
                away: {
                    id: c.competitors[1].id || c.competitors[1].team.id,
                    code: c.competitors[1].team.abbreviation,
                    name: c.competitors[1].team.displayName,
                    logo: c.competitors[1].team.logo,
                    score: c.competitors[1].score,
                    record: c.competitors[1].records?.[0]?.summary || '0-0'
                }
            };
        }) || [];
    } catch (e) { return []; }
};

export const getStandings = async (league: League) => {
    try {
        const res = await fetch(`${ENDPOINTS[league].standings}?level=3`, { headers: HEADERS, next: { revalidate: 3600 } });
        const data = await res.json();
        
        const processGroup = (groupName: string) => {
            const group = data.children?.find((c: any) => 
                (c.name || '').toUpperCase().includes(groupName) || (c.abbreviation || '').toUpperCase() === groupName
            );
            if (!group) return [];

            let entries = group.standings?.entries;
            if (!entries && group.children) {
                entries = group.children.flatMap((div: any) => div.standings?.entries || []);
            }

            return entries?.map((e: any) => {
                const stats = e.stats || [];
                const getStat = (n: string) => stats.find((s:any) => s.name === n)?.displayValue || '-';
                return {
                    id: e.team.id,
                    rank: e.seed || 0,
                    name: e.team.displayName,
                    abbr: e.team.abbreviation,
                    logo: e.team.logos?.[0]?.href,
                    stats: {
                        w: getStat('wins'),
                        l: getStat('losses'),
                        t: getStat('ties'),
                        pct: getStat('winPercent'),
                        gb: getStat('gamesBehind'),
                        streak: getStat('streak'),
                        diff: getStat('pointDifferential')
                    }
                };
            }).sort((a: any, b: any) => a.rank - b.rank) || [];
        };

        if (league === 'nfl') {
            return { groupA: processGroup('AFC'), groupB: processGroup('NFC'), labels: ['AFC', 'NFC'] };
        } else {
            return { groupA: processGroup('EASTERN CONFERENCE'), groupB: processGroup('WESTERN CONFERENCE'), labels: ['EAST', 'WEST'] };
        }
    } catch (e) { return { groupA: [], groupB: [], labels: [] }; }
};

export const getLeaders = async (league: League) => {
    const cats = league === 'nfl' 
        ? [
            { key: 'pass', sort: 'passing.passingYards:desc', label: 'Passing' },
            { key: 'rush', sort: 'rushing.rushingYards:desc', label: 'Rushing' },
            { key: 'rec', sort: 'receiving.receivingYards:desc', label: 'Receiving' },
            { key: 'def', sort: 'defensive.sacks:desc', label: 'Sacks' },
            { key: 'int', sort: 'defensiveinterceptions.interceptions:desc', label: 'Interceptions' },
            { key: 'tackles', sort: 'defensive.totalTackles:desc', label: 'Tackles' },
            { key: 'qbr', sort: 'passing.adjQBR:desc', label: 'Total QBR' }
          ]
        : league === 'nba'
        ? [
            { key: 'pts', sort: 'offensive.avgPoints:desc', label: 'Points' },
            { key: 'ast', sort: 'offensive.avgAssists:desc', label: 'Assists' },
            { key: 'reb', sort: 'general.avgRebounds:desc', label: 'Rebounds' },
            { key: 'stl', sort: 'defensive.avgSteals:desc', label: 'Steals' },
            { key: 'blk', sort: 'defensive.avgBlocks:desc', label: 'Blocks' },
            { key: 'pm', sort: 'general.plusMinus:desc', label: 'Plus/Minus' }
          ]
        : [
            { key: 'fedex', sort: 'cupPoints:desc', label: 'FedEx Cup' },
            { key: 'scoring', sort: 'scoringAverage:asc', label: 'Scoring Avg' },
            { key: 'drive_dist', sort: 'drivingDistance:desc', label: 'Driving Dist' },
            { key: 'drive_acc', sort: 'drivingAccuracy:desc', label: 'Driving Acc' },
            { key: 'gir', sort: 'greensInRegulation:desc', label: 'GIR %' },
            { key: 'putt', sort: 'puttingAverage:asc', label: 'Putting Avg' }
          ];

    const data: any = {};
    for (const cat of cats) {
        try {
            const params = new URLSearchParams({
                region: 'us', lang: 'en', contentorigin: 'espn', isqualified: 'false', 
                page: '1', limit: '5', sort: cat.sort
            });
            const res = await fetch(`${ENDPOINTS[league].leaders}?${params}`, { headers: HEADERS, next: { revalidate: 3600 } });
            const json = await res.json();
            
            if (league === 'golf') {
                data[cat.key] = json.athletes?.map((a: any) => ({
                    id: a.athlete.id,
                    name: a.athlete.displayName,
                    team: a.athlete.flag?.caption || 'PGA',
                    headshot: a.athlete.headshot?.href,
                    value: formatStatValue(a.displayValue),
                    label: cat.label
                })) || [];
                continue;
            }

            const sortKey = cat.sort.split(':')[0]; 
            const [catName, statName] = sortKey.split('.');
            
            const categoryMeta = json.categories?.find((c: any) => c.name === catName);
            const statIndex = categoryMeta?.names?.indexOf(statName);

            data[cat.key] = json.athletes?.map((a: any) => {
                let displayValue = a.displayValue;
                
                if (!displayValue && statIndex !== undefined && statIndex !== -1 && a.categories) {
                    const athleteCat = a.categories.find((c: any) => c.name === catName);
                    if (athleteCat && athleteCat.totals) {
                        displayValue = athleteCat.totals[statIndex];
                    } else if (athleteCat && athleteCat.values) {
                        displayValue = athleteCat.values[statIndex];
                    }
                }
                
                if (!displayValue && a.statistics && a.statistics.length > 0) {
                    displayValue = a.statistics[0].displayValue;
                }
                
                if (!displayValue) displayValue = a.value;

                return {
                    id: a.athlete.id,
                    name: a.athlete.displayName,
                    team: a.athlete.teamShortName || a.athlete.team?.abbreviation,
                    headshot: a.athlete.headshot?.href,
                    value: formatStatValue(displayValue),
                    label: cat.label
                };
            }) || [];
        } catch (e) { data[cat.key] = []; }
    }
    return data;
};

export const getTeam = async (league: League, id: string) => {
    try {
        const sport = league === 'nfl' ? 'football/nfl' : 'basketball/nba';
        const [teamRes, rosterRes, scheduleRes] = await Promise.all([
            fetch(`${BASE_API}/${sport}/teams/${id}`, { headers: HEADERS, next: { revalidate: 3600 } }),
            fetch(`${BASE_API}/${sport}/teams/${id}/roster`, { headers: HEADERS, next: { revalidate: 3600 } }),
            fetch(`${BASE_API}/${sport}/teams/${id}/schedule?seasontype=2`, { headers: HEADERS, next: { revalidate: 300 } })
        ]);

        if (!teamRes.ok) return null;
        const teamData = await teamRes.json();
        const t = teamData.team;

        let roster = [];
        if (rosterRes.ok) {
            const rData = await rosterRes.json();
            if (Array.isArray(rData.athletes)) {
                if (rData.athletes[0]?.items) {
                    roster = rData.athletes.flatMap((grp: any) => grp.items || []);
                } else {
                    roster = rData.athletes;
                }
            }
        }

        let schedule = [];
        if (scheduleRes.ok) {
            const sData = await scheduleRes.json();
            const events = sData.events?.filter((e: any) => e.competitions?.[0]?.status?.type?.completed) || [];
            schedule = events.slice(-5).reverse().map((e: any) => {
                const c = e.competitions[0];
                const competitor = c.competitors?.find((Comp:any) => Comp.team?.id === id);
                const opponent = c.competitors?.find((Comp:any) => Comp.team?.id !== id);
                const isWin = competitor?.winner === true;
                
                return {
                    id: e.id,
                    date: new Date(c.date).toLocaleDateString('en-US', {month:'short', day:'numeric'}),
                    opponent: opponent?.team?.abbreviation || 'OPP',
                    opponentLogo: opponent?.team?.logos?.[0]?.href,
                    score: `${competitor?.score?.value}-${opponent?.score?.value}`,
                    result: isWin ? 'W' : 'L'
                };
            });
        }

        return {
            id: t.id,
            location: t.location,
            name: t.name,
            nickname: t.nickname,
            abbr: t.abbreviation,
            color: t.color || '000000',
            logo: t.logos?.[0]?.href,
            record: t.record?.items?.[0]?.summary || '0-0',
            standing: t.standingSummary,
            stadium: t.franchise?.venue?.fullName,
            roster: roster.map((p: any) => ({
                id: p.id,
                name: p.displayName,
                jersey: p.jersey,
                pos: p.position?.abbreviation,
                headshot: p.headshot?.href
            })),
            recentGames: schedule
        };

    } catch (e) { return null; }
};

export const getPlayer = async (league: League, id: string) => {
    try {
        const sport = league === 'nfl' ? 'football/nfl' : league === 'nba' ? 'basketball/nba' : 'golf/pga';
        const res = await fetch(`${ENDPOINTS[league].athletes}/${id}`, { headers: HEADERS, next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const json = await res.json();
        const ath = json.athlete;

        return {
            id: ath.id,
            name: ath.displayName,
            headshot: ath.headshot?.href,
            team: ath.team?.displayName || (league === 'golf' ? ath.flag?.caption : 'Free Agent'),
            teamId: ath.team?.id,
            teamColor: ath.team?.color || '000000',
            pos: ath.position?.displayName,
            status: ath.status?.name || 'Active',
            stats: ath.statsSummary?.statistics?.map((s: any) => ({ name: s.displayName, displayValue: s.displayValue })) || []
        };
    } catch (e) { return null; }
};

export const getPlayerLogs = async (league: League, id: string) => {
    try {
        const sport = league === 'nfl' ? 'football/nfl' : league === 'nba' ? 'basketball/nba' : 'golf/pga';
        const res = await fetch(`${ENDPOINTS[league].athletes}/${id}/gamelog`, { headers: HEADERS, next: { revalidate: 3600 } });
        const json = await res.json();
        
        const rootLabels = json.labels || [];
        const gameMap = json.events || {};
        let statsEvents: any[] = [];

        if (json.seasonTypes) {
            json.seasonTypes.forEach((st: any) => {
                if (st.categories) {
                    st.categories.forEach((cat: any) => {
                        if (cat.events) statsEvents.push(...cat.events);
                    });
                } else if (st.events) {
                    statsEvents.push(...st.events);
                }
            });
        }
        
        return statsEvents.slice(0, 5).map((e: any) => {
            const game = gameMap[e.eventId];
            const stats = e.stats || [];
            
            const cleanStats = Array.isArray(stats) ? stats.map((s:any) => {
                if (typeof s === 'object' && s !== null) return s.displayValue || s.value || '-';
                return s;
            }) : [];

            if (!game) {
                return { date: '-', opponent: 'OPP', result: '-', stats: cleanStats, labels: rootLabels };
            }

            const date = new Date(game.gameDate).toLocaleDateString('en-US', {month:'numeric', day:'numeric'});
            const opponent = game.opponent?.abbreviation || game.opponent?.displayName || 'OPP';
            const result = game.gameResult || '-';

            return {
                date,
                opponent,
                result,
                stats: cleanStats,
                labels: rootLabels
            };
        });
    } catch (e) { return []; }
};

export const searchAthletes = async (league: League, query: string) => {
    if (!query || query.length < 2) return [];
    try {
        const sport = league === 'nfl' ? 'football' : league === 'nba' ? 'basketball' : 'golf';
        const res = await fetch(`https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&query=${encodeURIComponent(query)}&limit=5&mode=prefix&type=player&sport=${sport}&league=${league}`);
        const data = await res.json();
        return (data.items || []).map((item: any) => ({
            id: item.id,
            name: item.displayName,
            team: item.team?.abbreviation || (league === 'golf' ? 'PGA' : 'FA'),
            url: `/sports/${league}/player/${item.id}`,
            image: item.images?.[0]?.url || null
        }));
    } catch (e) { return []; }
};

export const getLiveBoxScore = async (league: League, gameId: string) => {
    try {
        const sport = league === 'nfl' ? 'football' : 'basketball';
        const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?event=${gameId}`;
        const res = await fetch(url, { headers: HEADERS, next: { revalidate: 30 } });
        if (!res.ok) return null;
        const data = await res.json();
        
        const playerStats: Record<string, any> = {};
        
        data.boxscore?.players?.forEach((team: any) => {
            team.statistics?.forEach((cat: any) => {
                const labels = cat.labels;
                cat.athletes?.forEach((ath: any) => {
                    const stats: Record<string, string> = {};
                    ath.stats?.forEach((val: string, idx: number) => {
                        stats[labels[idx]] = val;
                    });
                    
                    if (!playerStats[ath.athlete.displayName]) {
                        playerStats[ath.athlete.displayName] = {};
                    }
                    Object.assign(playerStats[ath.athlete.displayName], stats);
                });
            });
        });

        return playerStats;
    } catch (e) { return null; }
};

export const getGameResult = async (league: League, gameId: string) => {
    try {
        const sport = league === 'nfl' ? 'football' : 'basketball';
        const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?event=${gameId}`;
        const res = await fetch(url, { headers: HEADERS, next: { revalidate: 30 } });
        if (!res.ok) return null;
        const data = await res.json();
        const header = data.header;

        if (!header) return null;

        const c = header.competitions?.[0];
        if (!c) return null;

        const home = c.competitors.find((comp: any) => comp.homeAway === 'home');
        const away = c.competitors.find((comp: any) => comp.homeAway === 'away');

        return {
            completed: header.competitions[0].status.type.completed,
            home: {
                id: home.id || home.team.id,
                score: parseInt(home.score),
                winner: home.winner
            },
            away: {
                id: away.id || away.team.id,
                score: parseInt(away.score),
                winner: away.winner
            }
        };
    } catch (e) { return null; }
};

export const getLiveMatches = async () => {
    const leagues: ('nba' | 'nfl')[] = ['nba', 'nfl'];
    const results = await Promise.all(leagues.map(async (l) => {
        const matches = await getScoreboard(l);
        return matches.map((m: any) => ({ ...m, league: l }));
    }));
    
    // Flatten and filter for LIVE or recently finished
    return results.flat().filter(m => m.isLive || m.status.includes('Final'));
};

export const getLiveGolf = async () => {
    try {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga', { headers: HEADERS, next: { revalidate: 60 } });
        const data = await res.json();
        const event = data.events?.[0];
        if (!event) return null;

        const comp = event.competitions?.[0];
        const isLive = event.status?.type?.state === 'in';

        return {
            id: event.id,
            name: event.name,
            league: 'golf',
            status: isLive ? 'LIVE' : event.status?.type?.shortDetail,
            isLive,
            venue: comp?.venue?.fullName,
            leaders: comp?.competitors?.slice(0, 5).map((c: any) => ({
                name: c.athlete.displayName,
                score: c.statistics?.find((s:any) => s.name === 'score')?.displayValue || 'E',
                pos: c.status?.positionDisplayName
            }))
        };
    } catch (e) { return null; }
};