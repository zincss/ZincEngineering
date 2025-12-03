// app/collections/golf/data.ts

export interface CourseData {
    id: string;
    name: string;
    location: string;
    parTotal: number;
    holes: number[]; // Array of 18 numbers representing Par for each hole
}

// A starting list of famous courses to make the tool feel populated
export const COURSES: CourseData[] = [
    {
        id: 'zinc-training-grounds',
        name: 'Zinc Training Grounds',
        location: 'CLASSIFIED_SECTOR_01',
        parTotal: 72,
        holes: [4, 4, 3, 4, 5, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4]
    },
    {
        id: 'augusta-national',
        name: 'Augusta National',
        location: 'Augusta, GA',
        parTotal: 72,
        holes: [4, 5, 4, 3, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 5, 3, 4, 4]
    },
    {
        id: 'pebble-beach',
        name: 'Pebble Beach',
        location: 'Pebble Beach, CA',
        parTotal: 72,
        holes: [4, 5, 4, 4, 3, 5, 3, 4, 4, 4, 4, 3, 4, 5, 4, 4, 3, 5]
    },
    {
        id: 'old-course-standrews',
        name: 'The Old Course',
        location: 'St Andrews, Scotland',
        parTotal: 72,
        holes: [4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 4, 4, 4]
    },
    {
        id: 'tpc-sawgrass',
        name: 'TPC Sawgrass',
        location: 'Ponte Vedra, FL',
        parTotal: 72,
        holes: [4, 5, 3, 4, 4, 4, 4, 3, 5, 4, 5, 4, 3, 4, 4, 5, 3, 4]
    }
];

// Mock operatives for quick-add
export const MOCK_OPERATIVES = [
    { id: 'op_1', name: 'GHOST', handicap: 0 },
    { id: 'op_2', name: 'SOAP', handicap: 12 },
    { id: 'op_3', name: 'PRICE', handicap: 5 },
];