'use server'

// --- ACTION 1: SEARCH (IMPROVED - USES ESPN API) ---
export async function searchF1Drivers(query: string) {
    if (!query || query.length < 2) return [];
    
    try {
        // Use ESPN Search API (Same technique as NBA)
        const res = await fetch(`https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&query=${encodeURIComponent(query)}&limit=10&mode=prefix&type=player&sport=racing&league=f1`, { cache: 'no-store' });
        const data = await res.json();

        return (data.items || []).map((item: any) => {
            // Construct a URL-friendly ID for our Ergast resolver
            // e.g. "Max Verstappen" -> "max_verstappen"
            const rawName = item.displayName || '';
            const slug = rawName.toLowerCase().replace(/[.\s]+/g, '_');

            return {
                id: item.id,
                driverId: item.id, // Ensure this exists for compatibility
                name: item.displayName,
                givenName: item.displayName.split(' ')[0], 
                familyName: item.displayName.split(' ').slice(1).join(' '),
                team: item.team?.abbreviation || 'F1 Archive',
                image: item.images?.[0]?.url || null,
                flag: item.country?.flag?.href || null,
                url: `/sports/f1/driver/${slug}` // This slug is passed to fetchDriverFullProfile
            };
        });

    } catch (e) {
        console.error("F1 Search Error:", e);
        return [];
    }
}

// --- HELPER: RECURSIVE FETCH ---
async function fetchAllRaceResults(driverId: string) {
    let allRaces: any[] = [];
    let offset = 0;
    let limit = 100;
    let total = 0;
    let hasMore = true;

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
            hasMore = false;
        }
    }
    return allRaces;
}

// --- ACTION 2: FETCH PROFILE (ROBUST ID RESOLVER) ---
export async function fetchDriverFullProfile(rawId: string) {
    try {
        const cleanId = rawId.toLowerCase().trim();
        const parts = cleanId.split('_'); // Assumes we passed "max_verstappen" or similar
        
        // Ergast IDs are inconsistent (e.g., 'max_verstappen', 'perez', 'zhou')
        // We try multiple candidates to find the driver
        let candidates = [
            cleanId,                                   // 1. exact match (max_verstappen)
            parts[parts.length - 1],                   // 2. lastname only (perez, zhou)
            `${parts[0]}_${parts[parts.length - 1]}`,  // 3. first_last standard
            parts[0]                                   // 4. firstname (rare, but possible)
        ];

        let driverInfo = null;
        let validId = null;

        // 1. Resolve ID against Ergast
        for (const id of candidates) {
            if (!id || id.length < 2) continue;
            try {
                const res = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${id}.json`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.MRData.DriverTable.Drivers.length > 0) {
                        driverInfo = data.MRData.DriverTable.Drivers[0];
                        validId = id; // Store the ID that actually worked
                        break;
                    }
                }
            } catch (e) {}
        }

        if (!validId || !driverInfo) return null;

        // 2. Fetch Stats & History
        let stats = { wins: 0, podiums: 0, points: 0, races: 0 };
        let races: any[] = [];
        let highlights = { firstRace: '-', lastRace: '-', milestone: 'Data Unavailable', bestTrack: 'N/A', poles: 0 };

        // Fetch ALL Results
        const allRaces = await fetchAllRaceResults(validId);
        
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
        
        if (races.length > 0) {
            highlights.firstRace = races[races.length - 1]?.season;
            highlights.lastRace = races[0]?.season;
            highlights.bestTrack = Object.keys(trackMap).reduce((a, b) => trackMap[a] > trackMap[b] ? a : b, 'Unknown');

            if (stats.wins > 0) highlights.milestone = `${stats.wins} CAREER VICTORIES`;
            else highlights.milestone = `HIGHEST FINISH: P${races.reduce((min:number, r:any) => Math.min(min, parseInt(r.Results[0].position) || 99), 99)}`;
        }

        // 3. Fetch Bio/Image from Wiki (Keep this as fallback/supplement)
        let wikiData = null;
        try {
            // Use the wiki URL provided by Ergast if available for better accuracy
            const wikiTitle = driverInfo.url ? driverInfo.url.split('/').pop() : rawId;
            const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`, { cache: 'no-store' });
            wikiData = await wikiRes.json();
        } catch(e) {}

        return {
            profile: {
                driverId: validId,
                givenName: driverInfo.givenName,
                familyName: driverInfo.familyName,
                nationality: driverInfo.nationality,
                team: 'F1 History',
                code: driverInfo.code || driverInfo.familyName.substring(0,3).toUpperCase(),
                permanentNumber: driverInfo.permanentNumber || null
            },
            stats,
            highlights,
            careerRaces: races,
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