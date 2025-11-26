// app/sports/nrl/data.ts

// OFFICIAL NRL.COM LOGOS (Stable & Transparent)
export const TEAM_LOGOS: Record<string, string> = {
    'broncos': 'https://www.nrl.com/client/dist/logos/broncos-badge.svg',
    'raiders': 'https://www.nrl.com/client/dist/logos/raiders-badge.svg',
    'bulldogs': 'https://www.nrl.com/client/dist/logos/bulldogs-badge.svg',
    'sharks': 'https://www.nrl.com/client/dist/logos/sharks-badge.svg',
    'dolphins': 'https://www.nrl.com/client/dist/logos/dolphins-badge.svg',
    'titans': 'https://www.nrl.com/client/dist/logos/titans-badge.svg',
    'sea-eagles': 'https://www.nrl.com/client/dist/logos/sea-eagles-badge.svg',
    'storm': 'https://www.nrl.com/client/dist/logos/storm-badge.svg',
    'knights': 'https://www.nrl.com/client/dist/logos/knights-badge.svg',
    'cowboys': 'https://www.nrl.com/client/dist/logos/cowboys-badge.svg',
    'eels': 'https://www.nrl.com/client/dist/logos/eels-badge.svg',
    'panthers': 'https://www.nrl.com/client/dist/logos/panthers-badge.svg',
    'rabbitohs': 'https://www.nrl.com/client/dist/logos/rabbitohs-badge.svg',
    'dragons': 'https://www.nrl.com/client/dist/logos/dragons-badge.svg',
    'roosters': 'https://www.nrl.com/client/dist/logos/roosters-badge.svg',
    'warriors': 'https://www.nrl.com/client/dist/logos/warriors-badge.svg',
    'tigers': 'https://www.nrl.com/client/dist/logos/wests-tigers-badge.svg',
};

export const NRL_TEAMS = [
    { id: 'broncos', name: 'Brisbane Broncos', city: 'Brisbane', color: 'bg-red-900' },
    { id: 'raiders', name: 'Canberra Raiders', city: 'Canberra', color: 'bg-green-700' },
    { id: 'bulldogs', name: 'Canterbury Bulldogs', city: 'Sydney', color: 'bg-blue-700' },
    { id: 'sharks', name: 'Cronulla Sharks', city: 'Sydney', color: 'bg-cyan-500' },
    { id: 'dolphins', name: 'The Dolphins', city: 'Redcliffe', color: 'bg-red-500' },
    { id: 'titans', name: 'Gold Coast Titans', city: 'Gold Coast', color: 'bg-yellow-500' },
    { id: 'sea-eagles', name: 'Manly Sea Eagles', city: 'Sydney', color: 'bg-red-800' },
    { id: 'storm', name: 'Melbourne Storm', city: 'Melbourne', color: 'bg-purple-800' },
    { id: 'knights', name: 'Newcastle Knights', city: 'Newcastle', color: 'bg-blue-800' },
    { id: 'cowboys', name: 'North Qld Cowboys', city: 'Townsville', color: 'bg-yellow-600' },
    { id: 'eels', name: 'Parramatta Eels', city: 'Sydney', color: 'bg-blue-600' },
    { id: 'panthers', name: 'Penrith Panthers', city: 'Penrith', color: 'bg-zinc-900' },
    { id: 'rabbitohs', name: 'South Sydney Rabbitohs', city: 'Sydney', color: 'bg-red-700' },
    { id: 'dragons', name: 'St. George Illawarra', city: 'Sydney', color: 'bg-red-600' },
    { id: 'roosters', name: 'Sydney Roosters', city: 'Sydney', color: 'bg-blue-900' },
    { id: 'warriors', name: 'NZ Warriors', city: 'Auckland', color: 'bg-zinc-600' },
    { id: 'tigers', name: 'Wests Tigers', city: 'Sydney', color: 'bg-orange-500' },
];

// The "Featured" List (Always visible, always perfect)
export const PLAYER_DB = [
    { 
        id: 'Reece_Walsh', 
        name: 'Reece Walsh', 
        team: 'broncos', 
        pos: 'Fullback', 
        image: 'https://www.thesportsdb.com/images/media/player/thumb/0c061a1644849932.jpg',
        desc: 'One of the most electric fullbacks in the game, known for his blistering speed and ability to create tries from nothing.',
        stats: { apps: 56, tries: 24, goals: 0, points: 96, winRate: '62%' },
        bio: { height: '177 cm', weight: '88 kg', born: '10/07/2002', debut: '2021' }
    },
    { 
        id: 'Nathan_Cleary', 
        name: 'Nathan Cleary', 
        team: 'panthers', 
        pos: 'Halfback', 
        image: 'https://www.thesportsdb.com/images/media/player/thumb/r1082a1612823932.jpg',
        desc: 'The premier playmaker of his generation. A three-time Premiership winner with the Penrith Panthers.',
        stats: { apps: 158, tries: 54, goals: 580, points: 1376, winRate: '81%' },
        bio: { height: '182 cm', weight: '92 kg', born: '14/11/1997', debut: '2016' }
    },
    { 
        id: 'Kalyn_Ponga', 
        name: 'Kalyn Ponga', 
        team: 'knights', 
        pos: 'Fullback', 
        image: 'https://www.thesportsdb.com/images/media/player/thumb/ywrwut1464715476.jpg',
        desc: 'Dally M Medalist and captain of the Newcastle Knights. Renowned for his devastating step.',
        stats: { apps: 118, tries: 48, goals: 140, points: 472, winRate: '48%' },
        bio: { height: '184 cm', weight: '90 kg', born: '30/03/1998', debut: '2016' }
    },
    { 
        id: 'Latrell_Mitchell', 
        name: 'Latrell Mitchell', 
        team: 'rabbitohs', 
        pos: 'Fullback', 
        image: 'https://www.thesportsdb.com/images/media/player/thumb/x0f09e1520759417.jpg',
        desc: 'A powerhouse fullback with unmatched strength and fend. A dual premiership winner.',
        stats: { apps: 168, tries: 102, goals: 340, points: 1088, winRate: '68%' },
        bio: { height: '193 cm', weight: '102 kg', born: '16/06/1997', debut: '2016' }
    },
    { 
        id: 'Nicho_Hynes', 
        name: 'Nicho Hynes', 
        team: 'sharks', 
        pos: 'Halfback', 
        image: 'https://www.thesportsdb.com/images/media/player/thumb/z9g2o61615546670.jpg',
        desc: '2022 Dally M Medalist. A crafty and composed playmaker.',
        stats: { apps: 85, tries: 28, goals: 180, points: 472, winRate: '65%' },
        bio: { height: '188 cm', weight: '90 kg', born: '18/06/1996', debut: '2019' }
    },
    { 
        id: 'James_Tedesco', 
        name: 'James Tedesco', 
        team: 'roosters', 
        pos: 'Fullback', 
        image: 'https://www.thesportsdb.com/images/media/player/thumb/trppvv1425425039.jpg',
        desc: 'Australian and NSW Captain. Known as "Teddy", his work rate is legendary.',
        stats: { apps: 228, tries: 125, goals: 0, points: 500, winRate: '70%' },
        bio: { height: '184 cm', weight: '96 kg', born: '08/01/1993', debut: '2012' }
    }
];