export interface NrlTeam {
    id: string;
    name: string;
    city: string;
    stadium: string;
    color: string;
    logo: string;
}

// Official NRL Branding Colors & Assets
export const NRL_TEAMS: NrlTeam[] = [
    { id: 'broncos', name: 'Brisbane Broncos', city: 'Brisbane', stadium: 'Suncorp Stadium', color: 'bg-[#620035]', logo: 'https://www.nrl.com/client/dist/logos/broncos-badge.svg' },
    { id: 'raiders', name: 'Canberra Raiders', city: 'Canberra', stadium: 'GIO Stadium', color: 'bg-[#9DC458]', logo: 'https://www.nrl.com/client/dist/logos/raiders-badge.svg' },
    { id: 'bulldogs', name: 'Canterbury-Bankstown Bulldogs', city: 'Sydney', stadium: 'Accor Stadium', color: 'bg-[#0038A6]', logo: 'https://www.nrl.com/client/dist/logos/bulldogs-badge.svg' },
    { id: 'sharks', name: 'Cronulla-Sutherland Sharks', city: 'Sydney', stadium: 'PointsBet Stadium', color: 'bg-[#0097C9]', logo: 'https://www.nrl.com/client/dist/logos/sharks-badge.svg' },
    { id: 'dolphins', name: 'The Dolphins', city: 'Redcliffe', stadium: 'Kayo Stadium', color: 'bg-[#DA291C]', logo: 'https://www.nrl.com/client/dist/logos/dolphins-badge.svg' },
    { id: 'titans', name: 'Gold Coast Titans', city: 'Gold Coast', stadium: 'Cbus Super Stadium', color: 'bg-[#003D7E]', logo: 'https://www.nrl.com/client/dist/logos/titans-badge.svg' },
    { id: 'sea-eagles', name: 'Manly Warringah Sea Eagles', city: 'Sydney', stadium: '4 Pines Park', color: 'bg-[#6F163D]', logo: 'https://www.nrl.com/client/dist/logos/sea-eagles-badge.svg' },
    { id: 'storm', name: 'Melbourne Storm', city: 'Melbourne', stadium: 'AAMI Park', color: 'bg-[#3D105F]', logo: 'https://www.nrl.com/client/dist/logos/storm-badge.svg' },
    { id: 'knights', name: 'Newcastle Knights', city: 'Newcastle', stadium: 'McDonald Jones Stadium', color: 'bg-[#004890]', logo: 'https://www.nrl.com/client/dist/logos/knights-badge.svg' },
    { id: 'cowboys', name: 'North Queensland Cowboys', city: 'Townsville', stadium: 'QLD Country Bank Stadium', color: 'bg-[#002B5C]', logo: 'https://www.nrl.com/client/dist/logos/cowboys-badge.svg' },
    { id: 'eels', name: 'Parramatta Eels', city: 'Sydney', stadium: 'CommBank Stadium', color: 'bg-[#004A8F]', logo: 'https://www.nrl.com/client/dist/logos/eels-badge.svg' },
    { id: 'panthers', name: 'Penrith Panthers', city: 'Penrith', stadium: 'BlueBet Stadium', color: 'bg-[#231F20]', logo: 'https://www.nrl.com/client/dist/logos/panthers-badge.svg' },
    { id: 'rabbitohs', name: 'South Sydney Rabbitohs', city: 'Sydney', stadium: 'Accor Stadium', color: 'bg-[#0D3F2A]', logo: 'https://www.nrl.com/client/dist/logos/rabbitohs-badge.svg' },
    { id: 'dragons', name: 'St George Illawarra Dragons', city: 'Sydney', stadium: 'Netstrata Jubilee', color: 'bg-[#D61A21]', logo: 'https://www.nrl.com/client/dist/logos/dragons-badge.svg' },
    { id: 'roosters', name: 'Sydney Roosters', city: 'Sydney', stadium: 'Allianz Stadium', color: 'bg-[#002A5C]', logo: 'https://www.nrl.com/client/dist/logos/roosters-badge.svg' },
    { id: 'warriors', name: 'New Zealand Warriors', city: 'Auckland', stadium: 'Go Media Stadium', color: 'bg-[#9FA1A4]', logo: 'https://www.nrl.com/client/dist/logos/warriors-badge.svg' },
    { id: 'tigers', name: 'Wests Tigers', city: 'Sydney', stadium: 'Leichhardt Oval', color: 'bg-[#F58220]', logo: 'https://www.nrl.com/client/dist/logos/wests-tigers-badge.svg' },
];

export const TEAM_LOGOS: Record<string, string> = NRL_TEAMS.reduce((acc: any, team) => {
    acc[team.id] = team.logo;
    return acc;
}, {});