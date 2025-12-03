// app/collections/golf/actions.ts
'use server';

// We reuse the constants from your existing sports library to avoid duplication
// but we fetch specific course data here.
const LEADERBOARD_API = 'https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga';

export async function fetchLiveTourCourse() {
    try {
        const res = await fetch(LEADERBOARD_API, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        // Navigate the ESPN JSON structure to find course data
        const event = data.events?.[0];
        const competition = event?.competitions?.[0];
        const courseInfo = competition?.venue;
        
        // ESPN often hides hole-by-hole par data in the 'courses' array of the competition
        const courseData = competition?.courses?.[0];

        if (!courseData || !courseData.holes) {
            return { success: false, message: "LIVE COURSE DATA UNAVAILABLE" };
        }

        // Extract pars (ESPN usually provides holes array)
        const holes = courseData.holes.map((h: any) => h.par);
        const parTotal = courseData.par ? courseData.par : holes.reduce((a: number, b: number) => a + b, 0);

        return {
            success: true,
            data: {
                id: `live-${event.id}`,
                name: courseInfo?.fullName || event.name,
                location: `${courseInfo?.address?.city || 'Unknown'}, ${courseInfo?.address?.state || ''}`,
                parTotal: parTotal,
                holes: holes // This should be an array of 18 integers
            }
        };

    } catch (error) {
        console.error("Error fetching live course:", error);
        return { success: false, message: "CONNECTION FAILED" };
    }
}