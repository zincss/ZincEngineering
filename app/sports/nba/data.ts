// app/sports/nba/data.ts

export interface NbaTeam {
    id: string;
    espnId: string;
    name: string;
    city: string;
    color: string;
    logo: string;
}

export const NBA_TEAMS: NbaTeam[] = [
    { id: 'hawks', espnId: '1', name: 'Atlanta Hawks', city: 'Atlanta', color: 'bg-red-600', logo: 'https://upload.wikimedia.org/wikipedia/en/2/24/Atlanta_Hawks_logo.svg' },
    { id: 'celtics', espnId: '2', name: 'Boston Celtics', city: 'Boston', color: 'bg-green-700', logo: 'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg' },
    { id: 'pelicans', espnId: '3', name: 'New Orleans Pelicans', city: 'New Orleans', color: 'bg-blue-900', logo: 'https://upload.wikimedia.org/wikipedia/en/0/0d/New_Orleans_Pelicans_logo.svg' },
    { id: 'bulls', espnId: '4', name: 'Chicago Bulls', city: 'Chicago', color: 'bg-red-700', logo: 'https://upload.wikimedia.org/wikipedia/en/6/67/Chicago_Bulls_logo.svg' },
    { id: 'cavaliers', espnId: '5', name: 'Cleveland Cavaliers', city: 'Cleveland', color: 'bg-red-900', logo: 'https://upload.wikimedia.org/wikipedia/en/4/4b/Cleveland_Cavaliers_logo.svg' },
    { id: 'mavericks', espnId: '6', name: 'Dallas Mavericks', city: 'Dallas', color: 'bg-blue-800', logo: 'https://upload.wikimedia.org/wikipedia/en/9/97/Dallas_Mavericks_logo.svg' },
    { id: 'nuggets', espnId: '7', name: 'Denver Nuggets', city: 'Denver', color: 'bg-blue-900', logo: 'https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg' },
    { id: 'pistons', espnId: '8', name: 'Detroit Pistons', city: 'Detroit', color: 'bg-red-700', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Detroit_Pistons_logo.svg' },
    { id: 'warriors', espnId: '9', name: 'Golden State Warriors', city: 'San Francisco', color: 'bg-blue-600', logo: 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg' },
    { id: 'rockets', espnId: '10', name: 'Houston Rockets', city: 'Houston', color: 'bg-red-600', logo: 'https://upload.wikimedia.org/wikipedia/en/2/28/Houston_Rockets.svg' },
    { id: 'pacers', espnId: '11', name: 'Indiana Pacers', city: 'Indianapolis', color: 'bg-yellow-600', logo: 'https://upload.wikimedia.org/wikipedia/en/1/1b/Indiana_Pacers.svg' },
    { id: 'clippers', espnId: '12', name: 'LA Clippers', city: 'Los Angeles', color: 'bg-blue-500', logo: 'https://upload.wikimedia.org/wikipedia/en/b/bb/Los_Angeles_Clippers_logo.svg' },
    { id: 'lakers', espnId: '13', name: 'Los Angeles Lakers', city: 'Los Angeles', color: 'bg-purple-700', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg' },
    { id: 'heat', espnId: '14', name: 'Miami Heat', city: 'Miami', color: 'bg-red-600', logo: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg' },
    { id: 'bucks', espnId: '15', name: 'Milwaukee Bucks', city: 'Milwaukee', color: 'bg-green-800', logo: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Milwaukee_Bucks_logo.svg' },
    { id: 'timberwolves', espnId: '16', name: 'Minnesota Timberwolves', city: 'Minneapolis', color: 'bg-blue-900', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c2/Minnesota_Timberwolves_logo.svg' },
    { id: 'nets', espnId: '17', name: 'Brooklyn Nets', city: 'Brooklyn', color: 'bg-black', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Brooklyn_Nets_newlogo.svg' },
    { id: 'knicks', espnId: '18', name: 'New York Knicks', city: 'New York', color: 'bg-orange-500', logo: 'https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg' },
    { id: 'magic', espnId: '19', name: 'Orlando Magic', city: 'Orlando', color: 'bg-blue-600', logo: 'https://upload.wikimedia.org/wikipedia/en/1/10/Orlando_Magic_logo.svg' },
    { id: 'sixers', espnId: '20', name: 'Philadelphia 76ers', city: 'Philadelphia', color: 'bg-blue-700', logo: 'https://upload.wikimedia.org/wikipedia/en/0/0e/Philadelphia_76ers_logo.svg' },
    { id: 'suns', espnId: '21', name: 'Phoenix Suns', city: 'Phoenix', color: 'bg-orange-600', logo: 'https://upload.wikimedia.org/wikipedia/en/d/dc/Phoenix_Suns_logo.svg' },
    { id: 'blazers', espnId: '22', name: 'Portland Trail Blazers', city: 'Portland', color: 'bg-red-700', logo: 'https://upload.wikimedia.org/wikipedia/en/2/21/Portland_Trail_Blazers_logo.svg' },
    { id: 'kings', espnId: '23', name: 'Sacramento Kings', city: 'Sacramento', color: 'bg-purple-600', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c7/SacramentoKings.svg' },
    { id: 'spurs', espnId: '24', name: 'San Antonio Spurs', city: 'San Antonio', color: 'bg-zinc-500', logo: 'https://upload.wikimedia.org/wikipedia/en/a/a2/San_Antonio_Spurs.svg' },
    { id: 'thunder', espnId: '25', name: 'OKC Thunder', city: 'Oklahoma City', color: 'bg-blue-500', logo: 'https://upload.wikimedia.org/wikipedia/en/5/5d/Oklahoma_City_Thunder.svg' },
    { id: 'jazz', espnId: '26', name: 'Utah Jazz', city: 'Salt Lake City', color: 'bg-yellow-500', logo: 'https://upload.wikimedia.org/wikipedia/en/0/04/Utah_Jazz_logo_%282016%29.svg' },
    { id: 'wizards', espnId: '27', name: 'Washington Wizards', city: 'Washington', color: 'bg-blue-800', logo: 'https://upload.wikimedia.org/wikipedia/en/0/02/Washington_Wizards_logo.svg' },
    { id: 'raptors', espnId: '28', name: 'Toronto Raptors', city: 'Toronto', color: 'bg-red-700', logo: 'https://upload.wikimedia.org/wikipedia/en/3/36/Toronto_Raptors_logo.svg' },
    { id: 'grizzlies', espnId: '29', name: 'Memphis Grizzlies', city: 'Memphis', color: 'bg-blue-900', logo: 'https://upload.wikimedia.org/wikipedia/en/f/f1/Memphis_Grizzlies.svg' },
    { id: 'hornets', espnId: '30', name: 'Charlotte Hornets', city: 'Charlotte', color: 'bg-teal-500', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Charlotte_Hornets_%282014%29.svg' },
];

export const NBA_PLAYER_DB = [
    { id: '3136193', name: 'Nikola Jokic', team: 'nuggets', pos: 'Center', ppg: '26.4', rpg: '12.4', apg: '9.0', image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3136193.png&w=350&h=254', height: '6\'11"', weight: '284 lbs' },
    { id: '3945274', name: 'Luka Doncic', team: 'mavericks', pos: 'Guard', ppg: '33.9', rpg: '9.2', apg: '9.8', image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3945274.png&w=350&h=254', height: '6\'7"', weight: '230 lbs' },
    { id: '1966', name: 'LeBron James', team: 'lakers', pos: 'Forward', ppg: '25.7', rpg: '7.3', apg: '8.3', image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/1966.png&w=350&h=254', height: '6\'9"', weight: '250 lbs' },
    { id: '3975', name: 'Stephen Curry', team: 'warriors', pos: 'Guard', ppg: '26.4', rpg: '4.5', apg: '5.1', image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3975.png&w=350&h=254', height: '6\'2"', weight: '185 lbs' },
];

export const NBA_LOGOS: Record<string, string> = NBA_TEAMS.reduce((acc: any, team) => {
    acc[team.id] = team.logo;
    return acc;
}, {});