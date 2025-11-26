// app/sports/nba/data.ts

export interface NbaTeam {
    id: string;
    espnId: string; // The ID used by ESPN API
    name: string;
    city: string;
    color: string;
    logo: string;
}

// ESPN IDs are crucial for the API connection
export const NBA_TEAMS: NbaTeam[] = [
    { id: 'hawks', espnId: '1', name: 'Atlanta Hawks', city: 'Atlanta', color: 'bg-[#C8102E]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png' },
    { id: 'celtics', espnId: '2', name: 'Boston Celtics', city: 'Boston', color: 'bg-[#007A33]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png' },
    { id: 'pelicans', espnId: '3', name: 'New Orleans Pelicans', city: 'New Orleans', color: 'bg-[#0C2340]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/no.png' },
    { id: 'bulls', espnId: '4', name: 'Chicago Bulls', city: 'Chicago', color: 'bg-[#CE1141]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
    { id: 'cavaliers', espnId: '5', name: 'Cleveland Cavaliers', city: 'Cleveland', color: 'bg-[#860038]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png' },
    { id: 'mavericks', espnId: '6', name: 'Dallas Mavericks', city: 'Dallas', color: 'bg-[#00538C]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png' },
    { id: 'nuggets', espnId: '7', name: 'Denver Nuggets', city: 'Denver', color: 'bg-[#0E2240]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png' },
    { id: 'pistons', espnId: '8', name: 'Detroit Pistons', city: 'Detroit', color: 'bg-[#C8102E]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/det.png' },
    { id: 'warriors', espnId: '9', name: 'Golden State Warriors', city: 'San Francisco', color: 'bg-[#1D428A]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png' },
    { id: 'rockets', espnId: '10', name: 'Houston Rockets', city: 'Houston', color: 'bg-[#CE1141]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png' },
    { id: 'pacers', espnId: '11', name: 'Indiana Pacers', city: 'Indianapolis', color: 'bg-[#002D62]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png' },
    { id: 'clippers', espnId: '12', name: 'LA Clippers', city: 'Los Angeles', color: 'bg-[#C8102E]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png' },
    { id: 'lakers', espnId: '13', name: 'Los Angeles Lakers', city: 'Los Angeles', color: 'bg-[#552583]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' },
    { id: 'heat', espnId: '14', name: 'Miami Heat', city: 'Miami', color: 'bg-[#98002E]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png' },
    { id: 'bucks', espnId: '15', name: 'Milwaukee Bucks', city: 'Milwaukee', color: 'bg-[#00471B]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png' },
    { id: 'timberwolves', espnId: '16', name: 'Minnesota Timberwolves', city: 'Minneapolis', color: 'bg-[#0C2340]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png' },
    { id: 'nets', espnId: '17', name: 'Brooklyn Nets', city: 'Brooklyn', color: 'bg-[#000000]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png' },
    { id: 'knicks', espnId: '18', name: 'New York Knicks', city: 'New York', color: 'bg-[#006BB6]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png' },
    { id: 'magic', espnId: '19', name: 'Orlando Magic', city: 'Orlando', color: 'bg-[#0077C0]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png' },
    { id: 'sixers', espnId: '20', name: 'Philadelphia 76ers', city: 'Philadelphia', color: 'bg-[#006BB6]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png' },
    { id: 'suns', espnId: '21', name: 'Phoenix Suns', city: 'Phoenix', color: 'bg-[#1D1160]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png' },
    { id: 'blazers', espnId: '22', name: 'Portland Trail Blazers', city: 'Portland', color: 'bg-[#E03A3E]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png' },
    { id: 'kings', espnId: '23', name: 'Sacramento Kings', city: 'Sacramento', color: 'bg-[#5A2D81]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png' },
    { id: 'spurs', espnId: '24', name: 'San Antonio Spurs', city: 'San Antonio', color: 'bg-[#C4CED4]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sas.png' },
    { id: 'thunder', espnId: '25', name: 'Oklahoma City Thunder', city: 'Oklahoma City', color: 'bg-[#007AC1]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png' },
    { id: 'jazz', espnId: '26', name: 'Utah Jazz', city: 'Salt Lake City', color: 'bg-[#002B5C]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png' },
    { id: 'wizards', espnId: '27', name: 'Washington Wizards', city: 'Washington', color: 'bg-[#002B5C]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/was.png' },
    { id: 'raptors', espnId: '28', name: 'Toronto Raptors', city: 'Toronto', color: 'bg-[#CE1141]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png' },
    { id: 'grizzlies', espnId: '29', name: 'Memphis Grizzlies', city: 'Memphis', color: 'bg-[#5D76A9]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png' },
    { id: 'hornets', espnId: '30', name: 'Charlotte Hornets', city: 'Charlotte', color: 'bg-[#1D1160]', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png' },
];

export const NBA_LOGOS: Record<string, string> = NBA_TEAMS.reduce((acc: any, team) => {
    acc[team.id] = team.logo;
    return acc;
}, {});