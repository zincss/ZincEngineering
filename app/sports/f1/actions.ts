'use server'

// --- CONSTANTS: IMAGE FALLBACK DATABASE ---
// This ensures search results have images even if the external API fails.
const DRIVER_IMAGE_MAP: Record<string, string> = {
    // --- 2024/2025 GRID (Transparent Cutouts) ---
    'max_verstappen': 'https://media.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png',
    'sergio_perez': 'https://media.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/2col/image.png',
    'lewis_hamilton': 'https://media.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png',
    'george_russell': 'https://media.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/2col/image.png',
    'charles_leclerc': 'https://media.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col/image.png',
    'carlos_sainz': 'https://media.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col/image.png',
    'lando_norris': 'https://media.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col/image.png',
    'oscar_piastri': 'https://media.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col/image.png',
    'fernando_alonso': 'https://media.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col/image.png',
    'lance_stroll': 'https://media.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/2col/image.png',
    'pierre_gasly': 'https://media.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/2col/image.png',
    'esteban_ocon': 'https://media.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/2col/image.png',
    'alexander_albon': 'https://media.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/2col/image.png',
    'yuki_tsunoda': 'https://media.formula1.com/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/2col/image.png',
    'daniel_ricciardo': 'https://media.formula1.com/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png.transform/2col/image.png',
    'valtteri_bottas': 'https://media.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/2col/image.png',
    'guanyu_zhou': 'https://media.formula1.com/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png.transform/2col/image.png',
    'nico_hulkenberg': 'https://media.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/2col/image.png',
    'kevin_magnussen': 'https://media.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/2col/image.png',
    'liam_lawson': 'https://media.formula1.com/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/2col/image.png',
    'franco_colapinto': 'https://media.formula1.com/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/2col/image.png',
    'oliver_bearman': 'https://media.formula1.com/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/2col/image.png',
    'jack_doohan': 'https://media.formula1.com/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png.transform/2col/image.png',
    'kimi_antonelli': 'https://media.formula1.com/content/dam/fom-website/drivers/K/KIMANT01_Kimi_Antonelli/kimant01.png.transform/2col/image.png',
    
    // --- LEGENDS & NOTABLE OTHERS ---
    'michael_schumacher': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Michael_Schumacher_2010_Malaysia_qualify.jpg/576px-Michael_Schumacher_2010_Malaysia_qualify.jpg',
    'mick_schumacher': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Mick_Schumacher_-_2019_Formula_2_Austria_-_Red_Bull_Ring_%28cropped%29.jpg/500px-Mick_Schumacher_-_2019_Formula_2_Austria_-_Red_Bull_Ring_%28cropped%29.jpg',
    'sebastian_vettel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sebastian_Vettel_2015_Malaysia_podium_2.jpg/500px-Sebastian_Vettel_2015_Malaysia_podium_2.jpg',
    'ayrton_senna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ayrton_Senna_1989_Test_Rio_02.jpg/560px-Ayrton_Senna_1989_Test_Rio_02.jpg',
    'alain_prost': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Prost_Goodwood_2011_2.jpg/640px-Prost_Goodwood_2011_2.jpg',
    'niki_lauda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Niki_Lauda_2011.jpg/480px-Niki_Lauda_2011.jpg',
    'kimi_raikkonen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kimi_Raikkonen_2018.jpg/480px-Kimi_Raikkonen_2018.jpg',
};

// --- ACTION 1: SEARCH (IMPROVED - USES ESPN API + LOCAL FALLBACK) ---
export async function searchF1Drivers(query: string) {
    if (!query || query.length < 2) return [];
    
    try {
        const res = await fetch(`https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&query=${encodeURIComponent(query)}&limit=10&mode=prefix&type=player&sport=racing&league=f1`, { cache: 'no-store' });
        const data = await res.json();

        return (data.items || []).map((item: any) => {
            const rawName = item.displayName || '';
            const slug = rawName.toLowerCase().replace(/[.\s]+/g, '_'); // e.g. "Michael Schumacher" -> "michael_schumacher"

            // Fallback Image Logic: API -> Local Map -> Null
            let imageUrl = item.images?.[0]?.url || null;
            if (!imageUrl) {
                imageUrl = DRIVER_IMAGE_MAP[slug] || null;
            }

            return {
                id: item.id,
                driverId: item.id,
                name: item.displayName,
                givenName: item.displayName.split(' ')[0], 
                familyName: item.displayName.split(' ').slice(1).join(' '),
                team: item.team?.abbreviation || 'F1 Archive',
                image: imageUrl,
                flag: item.country?.flag?.href || null,
                url: `/sports/f1/driver/${slug}`
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
        const parts = cleanId.split('_'); 
        
        let candidates = [
            cleanId,
            parts[parts.length - 1],
            `${parts[0]}_${parts[parts.length - 1]}`,
            parts[0]
        ];

        let driverInfo = null;
        let validId = null;

        for (const id of candidates) {
            if (!id || id.length < 2) continue;
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

        if (!validId || !driverInfo) return null;

        let stats = { wins: 0, podiums: 0, points: 0, races: 0 };
        let races: any[] = [];
        let highlights = { firstRace: '-', lastRace: '-', milestone: 'Data Unavailable', bestTrack: 'N/A', poles: 0 };

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

        // Wiki Data Fetch
        let wikiData = null;
        try {
            const wikiTitle = driverInfo.url ? driverInfo.url.split('/').pop() : rawId;
            const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`, { cache: 'no-store' });
            wikiData = await wikiRes.json();
        } catch(e) {}

        // Enhanced Image Resolver for Profile
        const slug = `${driverInfo.givenName}_${driverInfo.familyName}`.toLowerCase().replace(/[.\s]+/g, '_');
        const finalImage = DRIVER_IMAGE_MAP[slug] || wikiData?.thumbnail?.source || null;

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
            driverImage: finalImage,
            bio: wikiData?.extract || "Biographical data currently unavailable."
        };

    } catch (e) {
        return null;
    }
}

// --- ACTION 3: DASHBOARD ---
export async function getF1DashboardData() {
    try {
        const [scheduleRes, standingsRes, teamRes, tracksRes, lastRaceRes] = await Promise.all([
            fetch('https://api.jolpi.ca/ergast/f1/current.json', { next: { revalidate: 3600 } }), 
            fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json', { next: { revalidate: 3600 } }),
            fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json', { next: { revalidate: 3600 } }),
            fetch('https://api.jolpi.ca/ergast/f1/circuits.json?limit=100', { next: { revalidate: 86400 } }),
            fetch('https://api.jolpi.ca/ergast/f1/current/last/results.json', { next: { revalidate: 3600 } })
        ]);

        const scheduleData = await scheduleRes.json();
        const standingsData = await standingsRes.json();
        const teamData = await teamRes.json();
        const tracksData = await tracksRes.json();
        
        const lastRaceData = await lastRaceRes.json();
        const lastRace = lastRaceData.MRData.RaceTable.Races[0];
        const lastRaceName = lastRace ? lastRace.raceName : 'Season Start';
        
        const latestResultsMap: Record<string, string> = {};
        if (lastRace) {
            lastRace.Results.forEach((r: any) => {
                latestResultsMap[r.Driver.driverId] = r.positionText === 'R' ? 'DNF' : `P${r.position}`;
            });
        }

        // Sort Tracks
        const allTracks = tracksData.MRData.CircuitTable.Circuits;
        const calendarRaces = scheduleData.MRData.RaceTable.Races;
        const calendarMap = new Map();
        calendarRaces.forEach((race: any, index: number) => {
            calendarMap.set(race.Circuit.circuitId, index);
        });

        const sortedTracks = allTracks.sort((a: any, b: any) => {
            const indexA = calendarMap.has(a.circuitId) ? calendarMap.get(a.circuitId) : 999;
            const indexB = calendarMap.has(b.circuitId) ? calendarMap.get(b.circuitId) : 999;
            if (indexA === 999 && indexB === 999) return a.circuitName.localeCompare(b.circuitName);
            return indexA - indexB;
        });

        return { 
            drivers: standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings.map((ds: any) => ({
                ...ds.Driver, 
                points: ds.points, 
                teamName: ds.Constructors[0]?.name,
                constructors: ds.Constructors,
                stats: { 
                    best: ds.wins > 0 ? 1 : '-', 
                    latest: { 
                        pos: latestResultsMap[ds.Driver.driverId] || '-', 
                        race: lastRaceName 
                    } 
                }
            })) || [],
            teams: teamData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings.map((cs: any) => ({
                ...cs.Constructor, points: cs.points, wins: cs.wins
            })) || [],
            tracks: sortedTracks, 
            season: scheduleData.MRData.RaceTable.season 
        };
    } catch (e) { return null; }
}