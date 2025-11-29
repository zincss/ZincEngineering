'use server'

// --- ACTION 1: SEARCH (WIKIPEDIA ENGINE) ---
export async function searchF1Archive(query: string) {
    if (query.length < 3) return [];
    
    try {
        // Search Wikipedia for "Name + F1" to find the person, not the game
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " Formula One driver")}&format=json&origin=*`);
        const data = await res.json();

        if (!data.query?.search) return [];

        return data.query.search
            .filter((result: any) => {
                const title = result.title.toLowerCase();
                // STRICT JUNK FILTER
                if (title.includes("video game")) return false;
                if (title.includes("grand prix")) return false; // Filter races
                if (title.includes("championship")) return false; // Filter seasons
                if (title.includes("list of")) return false;
                if (title.includes("film")) return false;
                return true;
            })
            .map((result: any) => {
                const title = result.title.replace(/ \(racing driver\)/i, '').replace(/ \(Formula One\)/i, '');
                // We use the Wiki Title as a robust ID
                const wikiId = title.replace(/\s+/g, '_');
                
                return {
                    driverId: wikiId, 
                    givenName: title.split(' ')[0],
                    familyName: title.split(' ').slice(1).join(' '),
                    nationality: 'F1 History',
                    url: `/sports/f1/driver/${wikiId}`
                };
            })
            .slice(0, 5);
    } catch (e) {
        return [];
    }
}

// --- ACTION 2: FETCH PROFILE (WIKI -> ERGAST RESOLVER) ---
export async function fetchDriverFullProfile(rawId: string) {
    try {
        // 1. Try to resolve Wiki ID to Ergast ID
        const cleanId = rawId.toLowerCase().trim();
        const parts = cleanId.split(/[_\s-]+/);
        
        const candidates = [
            parts[parts.length - 1], // Lastname (e.g. 'hamilton')
            cleanId, // Full (e.g. 'senna')
            `${parts[0]}_${parts[parts.length - 1]}`, // First_Last
        ];

        let driverInfo = null;
        let validId = null;

        // Try to find the driver in the Stats Database
        for (const id of candidates) {
            try {
                const res = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${id}.json`);
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

        // 2. Fetch Stats (If found in Ergast)
        let stats = { wins: 0, podiums: 0, points: 0, races: 0 };
        let races = [];
        let highlights = { firstRace: '-', lastRace: '-', milestone: 'Data Unavailable' };

        if (validId) {
            // Fetch stats...
            const res = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${validId}/results.json?limit=1000`); // Get all results
            const data = await res.json();
            const allRaces = data.MRData.RaceTable.Races;
            
            // Calculate Career Stats
            races = allRaces.reverse();
            stats.races = allRaces.length;
            allRaces.forEach((r: any) => {
                const res = r.Results[0];
                if (res.position === '1') stats.wins++;
                if (parseInt(res.position) <= 3) stats.podiums++;
                stats.points += parseFloat(res.points);
            });
            
            highlights.firstRace = allRaces[0]?.season;
            highlights.lastRace = allRaces[allRaces.length - 1]?.season;
            if (stats.wins > 0) highlights.milestone = `${stats.wins} CAREER VICTORIES`;
            else highlights.milestone = `HIGHEST FINISH: P${allRaces.reduce((min:number, r:any) => Math.min(min, parseInt(r.Results[0].position) || 99), 99)}`;
        }

        // 3. Fetch Bio/Image from Wikipedia (Always works)
        let wikiData = null;
        try {
            const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${rawId}`);
            wikiData = await wikiRes.json();
        } catch(e) {}

        // 4. Construct Composite Profile
        return {
            profile: {
                driverId: validId || rawId,
                givenName: driverInfo?.givenName || rawId.split('_')[0],
                familyName: driverInfo?.familyName || rawId.split('_')[1] || '',
                nationality: driverInfo?.nationality || 'Global',
                team: 'F1 Legend',
                code: driverInfo?.code || 'LEG'
            },
            stats: stats,
            highlights: highlights,
            careerRaces: races,
            driverImage: wikiData?.thumbnail?.source || null,
            bio: wikiData?.extract || "Biographical data currently unavailable from secure archives."
        };

    } catch (e) {
        return null;
    }
}

// --- ACTION 3: DASHBOARD (Unchanged) ---
export async function getF1DashboardData() {
    // (Keep your existing Dashboard fetcher here)
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

        const races = scheduleData.MRData.RaceTable.Races;
        const season = scheduleData.MRData.RaceTable.season;

        const drivers = standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings.map((ds: any) => ({
            ...ds.Driver,
            points: ds.points,
            teamCode: ds.Constructors[0]?.constructorId,
            teamName: ds.Constructors[0]?.name,
            nationality: ds.Driver.nationality,
            stats: { best: ds.wins > 0 ? 1 : '-', latest: { pos: '-', race: 'Active' } }
        })) || [];

        const teams = teamData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings.map((cs: any) => ({
            ...cs.Constructor,
            points: cs.points,
            wins: cs.wins,
            drivers: [] 
        })) || [];

        const tracks = tracksData.MRData.CircuitTable.Circuits;
        return { drivers, teams, tracks, season };
    } catch (e) { return null; }
}