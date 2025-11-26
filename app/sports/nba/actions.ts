'use server'

// API CONFIGURATION
const ESPN_CORE_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const NBA_CDN_BASE = 'https://cdn.nba.com/static/json/liveData';

// Headers to mimic a mobile device (less likely to be blocked)
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    'Accept': 'application/json'
};

// --- 1. SEARCH PLAYERS (Resilient) ---
export async function searchPlayers(query: string) {
  if (!query || query.length < 2) return [];
  
  try {
    // Use ESPN Core Search
    const res = await fetch(`${ESPN_CORE_BASE}/teams/1/roster`, { next: { revalidate: 86400 } }); // Pre-fetch a roster to warm up if needed, but search is separate
    
    // Actual Search Endpoint
    const searchRes = await fetch(`https://site.api.espn.com/apis/common/v3/search?sport=basketball&league=nba&query=${encodeURIComponent(query)}&limit=5`, {
      headers: HEADERS,
      next: { revalidate: 60 }
    });
    
    if (!searchRes.ok) return [];
    const data = await searchRes.json();
    
    // Map Results
    return (data.results || [])
      .filter((item: any) => item.type === 'player')
      .map((p: any) => ({
        id: p.id,
        name: p.displayName,
        team: p.subtitle || 'NBA',
        image: p.images?.[0]?.url || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png&w=350&h=254`,
      }));
  } catch (e) {
    console.error('Search Error:', e);
    return [];
  }
}

// --- 2. GET PLAYER PROFILE (Core API) ---
export async function getPlayerProfile(id: string) {
  try {
    const espnId = id.replace(/[^0-9]/g, '');
    if (!espnId) return null;

    // Fetch Core Summary
    const res = await fetch(`${ESPN_CORE_BASE}/athletes/${espnId}`, { headers: HEADERS, next: { revalidate: 60 } });
    
    if (!res.ok) return null;
    const data = await res.json();
    const bio = data.athlete;

    // Safe access to nested stats (API structure varies)
    const statsSummary = bio.statsSummary?.statistics || [];
    const getStat = (name: string) => statsSummary.find((s: any) => s.name === name)?.displayValue || '-';

    // If statsSummary is empty, we fetch gamelog for manual calc (Fallback)
    let ppg = getStat('ppg');
    if (ppg === '-') {
        const logRes = await fetch(`${ESPN_CORE_BASE}/athletes/${espnId}/gamelog`, { headers: HEADERS });
        if (logRes.ok) {
            const logData = await logRes.json();
            // Basic heuristic if summary missing
            ppg = logData.seasonTypes?.[0]?.categories?.[0]?.events?.[0]?.stats?.[13] || '-'; // Often points
        }
    }

    return {
        id: bio.id,
        name: bio.displayName,
        team: bio.team?.displayName || 'Free Agent',
        teamId: bio.team?.id,
        pos: bio.position?.displayName || 'Athlete',
        jersey: bio.jersey,
        headshot: bio.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${bio.id}.png&w=350&h=254`,
        height: bio.displayHeight,
        weight: bio.displayWeight,
        dob: bio.displayDOB,
        exp: bio.experience?.years,
        stats: {
            ppg: ppg !== '-' ? ppg : '0.0', // Default to 0 if unavailable
            rpg: getStat('rpg') !== '-' ? getStat('rpg') : '0.0',
            apg: getStat('apg') !== '-' ? getStat('apg') : '0.0',
            per: getStat('per')
        },
        news: (bio.news || []).slice(0, 3).map((a: any) => ({
            headline: a.headline,
            description: a.description,
            link: a.links?.web?.href,
            published: a.published
        }))
    };
  } catch (e) {
    console.error('Profile Fetch Error:', e);
    return null;
  }
}

// --- 3. GET TEAM DASHBOARD (Robust) ---
export async function getTeamData(teamId: string) {
    try {
        // Fetch Roster
        const rosterRes = await fetch(`${ESPN_CORE_BASE}/teams/${teamId}/roster`, { headers: HEADERS, next: { revalidate: 3600 } });
        const rosterData = await rosterRes.json();

        // Fetch Team Info
        const teamRes = await fetch(`${ESPN_CORE_BASE}/teams/${teamId}`, { headers: HEADERS, next: { revalidate: 3600 } });
        const teamData = await teamRes.json();
        const t = teamData.team;

        // Process Roster
        const roster = (rosterData.athletes || []).map((p: any) => ({
            id: p.id,
            name: p.displayName,
            pos: p.position?.abbreviation,
            jersey: p.jersey,
            height: p.displayHeight,
            weight: p.displayWeight,
            headshot: p.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${p.id}.png&w=350&h=254`
        }));

        // Process Schedule (From Team Info usually)
        const events = (t.nextEvent || []).map((e: any) => ({
            id: e.id,
            date: e.date,
            opponent: e.name,
            score: 'VS',
            result: null,
            status: 'pre'
        }));

        return {
            id: t.id,
            name: t.displayName,
            logo: t.logos?.[0]?.href,
            color: t.color ? `#${t.color}` : '#000000',
            record: t.record?.items?.[0]?.summary || 'Active',
            standing: t.standingSummary || 'NBA',
            roster,
            schedule: events
        };

    } catch (e) {
        console.error('Team Error:', e);
        return null;
    }
}

// --- 4. GET LIVE SCORES (NBA OFFICIAL CDN) ---
// Using NBA.com's static JSON for this is MUCH faster and reliable than ESPN
export async function getLiveScores() {
    try {
        const res = await fetch(`${NBA_CDN_BASE}/scoreboard/todaysScoreboard_00.json`, { next: { revalidate: 30 } });
        if (!res.ok) return [];
        
        const data = await res.json();
        
        return (data.scoreboard?.games || []).map((g: any) => ({
            id: g.gameId,
            clock: g.gameStatusText,
            isLive: g.gameStatus === 2, // 2 = In Progress
            home: {
                name: g.homeTeam.teamTricode,
                score: g.homeTeam.score,
                logo: `https://cdn.nba.com/logos/nba/${g.homeTeam.teamId}/primary/L/logo.svg`
            },
            away: {
                name: g.awayTeam.teamTricode,
                score: g.awayTeam.score,
                logo: `https://cdn.nba.com/logos/nba/${g.awayTeam.teamId}/primary/L/logo.svg`
            }
        }));
    } catch (e) {
        console.error('NBA CDN Error:', e);
        return [];
    }
}