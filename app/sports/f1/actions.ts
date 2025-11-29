'use server'

// --- ACTION 1: SEARCH (STRICT) ---
export async function searchF1Archive(query: string) {
    if (query.length < 2) return [];
    
    const cleanQuery = query.toLowerCase().trim();

    try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " Formula One driver")}&format=json&origin=*`, { cache: 'no-store' });
        const data = await res.json();

        if (!data.query?.search) return [];

        const hits = data.query.search
            .filter((result: any) => {
                const title = result.title.toLowerCase();
                if (title.includes("video game") || title.includes("grand prix") || title.includes("list of") || title.includes("film") || title.includes("team")) return false;
                return title.includes(cleanQuery);
            })
            .map((result: any) => {
                const title = result.title.replace(/ \(racing driver\)/i, '').replace(/ \(Formula One\)/i, '');
                const wikiId = title.replace(/\s+/g, '_');
                
                return {
                    driverId: wikiId, 
                    givenName: title.split(' ')[0],
                    familyName: title.split(' ').slice(1).join(' '),
                    nationality: 'F1 History',
                    url: `/sports/f1/driver/${wikiId}`
                };
            });
        
        return hits.sort((a: any, b: any) => {
            const nameA = `${a.givenName} ${a.familyName}`.toLowerCase();
            const nameB = `${b.givenName} ${b.familyName}`.toLowerCase();
            if (nameA.startsWith(cleanQuery) && !nameB.startsWith(cleanQuery)) return -1;
            if (nameB.startsWith(cleanQuery) && !nameA.startsWith(cleanQuery)) return 1;
            return 0;
        }).slice(0, 5);

    } catch (e) {
        return [];
    }
}

// --- HELPER: RECURSIVE FETCH (THE FIX) ---
// Fetches ALL pages because the API caps at 100 results
async function fetchAllRaceResults(driverId: string) {
    let allRaces: any[] = [];
    let offset = 0;
    let limit = 100; // API Max Limit
    let total = 0;
    let hasMore = true;

    // Safety Loop (stops at 1000 to prevent infinite loops)
    while (hasMore && offset < 1000) {
        try {
            const res = await fetch(
                `https://api.jolpi.ca/ergast/f1/drivers/${driverId}/results.json?limit=${limit}&offset=${offset}`, 
                { cache: 'no-store' }
            );
            
            if (!res.ok) break;
            
            const data = await res.json();
            const races = data.MRData.RaceTable.Races || [];
            total = parseInt(data.MRData.total || '0');
            
            if (races.length === 0) break;

            allRaces = [...allRaces, ...races];
            offset += limit;
            
            if (allRaces.length >= total) hasMore = false;
            
        } catch (e) {
            console.error("Pagination Error:", e);
            hasMore = false;
        }
    }
    return allRaces;
}

// --- ACTION 2: FETCH PROFILE ---
export async function fetchDriverFullProfile(rawId: string) {
    try {
        const cleanId = rawId.toLowerCase().trim();
        const parts = cleanId.split(/[_\s-]+/);
        
        let candidates = [];
        if (parts.length >= 2) {
             candidates.push(`${parts[0]}_${parts[parts.length - 1]}`); // Priority: max_verstappen
             candidates.push(cleanId); 
        } else {
             candidates.push(cleanId);
        }

        let driverInfo = null;
        let validId = null;

        // 1. Resolve ID
        for (const id of candidates) {
            try {
                const res = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${id}.json`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.MRData.DriverTable.Drivers.length > 0) {
                        driverInfo = data.MRData.DriverTable.Drivers[0];
                        validId = id;
                        break;
                    }
                }
            } catch (e) {}
        }

        let stats = { wins: 0, podiums: 0, points: 0, races: 0 };
        let races: any[] = [];
        let highlights = { firstRace: '-', lastRace: '-', milestone: 'Data Unavailable', bestTrack: 'N/A', poles: 0 };

        if (validId) {
            // 2. Fetch ALL Results (using new helper)
            const allRaces = await fetchAllRaceResults(validId);
            
            // Sort Newest -> Oldest
            races = allRaces.sort((a: any, b: any) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`).getTime();
                const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`).getTime();
                return dateB - dateA;
            });

            stats.races = races.length;
            
            const trackMap: Record<string, number> = {};

            races.forEach((r: any) => {
                const res = r.Results[0];
                const pos = parseInt(res.position);
                const pts = parseFloat(res.points) || 0;
                const track = r.Circuit.circuitName;

                if (pos === 1) stats.wins++;
                if (pos <= 3) stats.podiums++;
                stats.points += pts;
                if (res.grid === "1") highlights.poles++;

                let trackScore = pts;
                if (pos === 1) trackScore += 10;
                trackMap[track] = (trackMap[track] || 0) + trackScore;
            });
            
            // Stats Logic
            if (races.length > 0) {
                highlights.firstRace = races[races.length - 1]?.season;
                highlights.lastRace = races[0]?.season;
                highlights.bestTrack = Object.keys(trackMap).reduce((a, b) => trackMap[a] > trackMap[b] ? a : b, 'Unknown');

                if (stats.wins > 0) highlights.milestone = `${stats.wins} CAREER VICTORIES`;
                else highlights.milestone = `HIGHEST FINISH: P${races.reduce((min:number, r:any) => Math.min(min, parseInt(r.Results[0].position) || 99), 99)}`;
            }
        }

        let wikiData = null;
        try {
            const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${rawId}`, { cache: 'no-store' });
            wikiData = await wikiRes.json();
        } catch(e) {}

        return {
            profile: {
                driverId: validId || rawId,
                givenName: driverInfo?.givenName || rawId.split('_')[0],
                familyName: driverInfo?.familyName || rawId.split('_')[1] || '',
                nationality: driverInfo?.nationality || 'Global',
                team: 'F1 Legend',
                code: driverInfo?.code || 'LEG',
                permanentNumber: driverInfo?.permanentNumber || null
            },
            stats,
            highlights,
            careerRaces: races, // Now contains full history
            driverImage: wikiData?.thumbnail?.source || null,
            bio: wikiData?.extract || "Biographical data currently unavailable."
        };

    } catch (e) {
        return null;
    }
}

// --- ACTION 3: DASHBOARD ---
export async function getF1DashboardData() {
    try {
        const [scheduleRes, standingsRes, teamRes, tracksRes] = await Promise.all([
            fetch('https://api.jolpi.ca/ergast/f1/current.json', { next: { revalidate: 3600 } }), 
            fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json', { next: { revalidate: 3600 } }),
            fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json', { next: { revalidate: 3600 } }),
            fetch('https://api.jolpi.ca/ergast/f1/circuits.json?limit=100', { next: { revalidate: 86400 } }) 
        ]);

        const scheduleData = await scheduleRes.json();
        const standingsData = await standingsRes.json();
        const teamData = await teamRes.json();
        const tracksData = await tracksRes.json();

        return { 
            drivers: standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings.map((ds: any) => ({
                ...ds.Driver, points: ds.points, teamName: ds.Constructors[0]?.name,
                stats: { best: ds.wins > 0 ? 1 : '-', latest: { pos: '-', race: 'Active' } }
            })) || [],
            teams: teamData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings.map((cs: any) => ({
                ...cs.Constructor, points: cs.points, wins: cs.wins
            })) || [],
            tracks: tracksData.MRData.CircuitTable.Circuits, 
            season: scheduleData.MRData.RaceTable.season 
        };
    } catch (e) { return null; }
}