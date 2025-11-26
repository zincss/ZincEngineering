// app/sports/nba/data.ts

// --- 1. VERIFIED WIKIMEDIA LOGOS (SVG) ---
export const NBA_TEAMS = [
    { id: 'hawks', name: 'Atlanta Hawks', city: 'Atlanta', color: 'bg-red-600', logo: 'https://upload.wikimedia.org/wikipedia/en/2/24/Atlanta_Hawks_logo.svg' },
    { id: 'celtics', name: 'Boston Celtics', city: 'Boston', color: 'bg-green-700', logo: 'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg' },
    { id: 'nets', name: 'Brooklyn Nets', city: 'Brooklyn', color: 'bg-black', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Brooklyn_Nets_newlogo.svg' },
    { id: 'hornets', name: 'Charlotte Hornets', city: 'Charlotte', color: 'bg-teal-500', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Charlotte_Hornets_%282014%29.svg' },
    { id: 'bulls', name: 'Chicago Bulls', city: 'Chicago', color: 'bg-red-700', logo: 'https://upload.wikimedia.org/wikipedia/en/6/67/Chicago_Bulls_logo.svg' },
    { id: 'cavaliers', name: 'Cleveland Cavaliers', city: 'Cleveland', color: 'bg-red-900', logo: 'https://upload.wikimedia.org/wikipedia/en/4/4b/Cleveland_Cavaliers_logo.svg' },
    { id: 'mavericks', name: 'Dallas Mavericks', city: 'Dallas', color: 'bg-blue-800', logo: 'https://upload.wikimedia.org/wikipedia/en/9/97/Dallas_Mavericks_logo.svg' },
    { id: 'nuggets', name: 'Denver Nuggets', city: 'Denver', color: 'bg-blue-900', logo: 'https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg' },
    { id: 'pistons', name: 'Detroit Pistons', city: 'Detroit', color: 'bg-red-700', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Detroit_Pistons_logo.svg' },
    { id: 'warriors', name: 'Golden State Warriors', city: 'San Francisco', color: 'bg-blue-600', logo: 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg' },
    { id: 'rockets', name: 'Houston Rockets', city: 'Houston', color: 'bg-red-600', logo: 'https://upload.wikimedia.org/wikipedia/en/2/28/Houston_Rockets.svg' },
    { id: 'pacers', name: 'Indiana Pacers', city: 'Indianapolis', color: 'bg-yellow-600', logo: 'https://upload.wikimedia.org/wikipedia/en/1/1b/Indiana_Pacers.svg' },
    { id: 'clippers', name: 'LA Clippers', city: 'Los Angeles', color: 'bg-blue-500', logo: 'https://upload.wikimedia.org/wikipedia/en/b/bb/Los_Angeles_Clippers_logo.svg' },
    { id: 'lakers', name: 'Los Angeles Lakers', city: 'Los Angeles', color: 'bg-purple-700', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg' },
    { id: 'grizzlies', name: 'Memphis Grizzlies', city: 'Memphis', color: 'bg-blue-900', logo: 'https://upload.wikimedia.org/wikipedia/en/f/f1/Memphis_Grizzlies.svg' },
    { id: 'heat', name: 'Miami Heat', city: 'Miami', color: 'bg-red-600', logo: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg' },
    { id: 'bucks', name: 'Milwaukee Bucks', city: 'Milwaukee', color: 'bg-green-800', logo: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Milwaukee_Bucks_logo.svg' },
    { id: 'timberwolves', name: 'Minnesota Timberwolves', city: 'Minneapolis', color: 'bg-blue-900', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c2/Minnesota_Timberwolves_logo.svg' },
    { id: 'pelicans', name: 'New Orleans Pelicans', city: 'New Orleans', color: 'bg-blue-900', logo: 'https://upload.wikimedia.org/wikipedia/en/0/0d/New_Orleans_Pelicans_logo.svg' },
    { id: 'knicks', name: 'New York Knicks', city: 'New York', color: 'bg-orange-500', logo: 'https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg' },
    { id: 'thunder', name: 'OKC Thunder', city: 'Oklahoma City', color: 'bg-blue-500', logo: 'https://upload.wikimedia.org/wikipedia/en/5/5d/Oklahoma_City_Thunder.svg' },
    { id: 'magic', name: 'Orlando Magic', city: 'Orlando', color: 'bg-blue-600', logo: 'https://upload.wikimedia.org/wikipedia/en/1/10/Orlando_Magic_logo.svg' },
    { id: 'sixers', name: 'Philadelphia 76ers', city: 'Philadelphia', color: 'bg-blue-700', logo: 'https://upload.wikimedia.org/wikipedia/en/0/0e/Philadelphia_76ers_logo.svg' },
    { id: 'suns', name: 'Phoenix Suns', city: 'Phoenix', color: 'bg-orange-600', logo: 'https://upload.wikimedia.org/wikipedia/en/d/dc/Phoenix_Suns_logo.svg' },
    { id: 'blazers', name: 'Portland Trail Blazers', city: 'Portland', color: 'bg-red-700', logo: 'https://upload.wikimedia.org/wikipedia/en/2/21/Portland_Trail_Blazers_logo.svg' },
    { id: 'kings', name: 'Sacramento Kings', city: 'Sacramento', color: 'bg-purple-600', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c7/SacramentoKings.svg' },
    { id: 'spurs', name: 'San Antonio Spurs', city: 'San Antonio', color: 'bg-zinc-500', logo: 'https://upload.wikimedia.org/wikipedia/en/a/a2/San_Antonio_Spurs.svg' },
    { id: 'raptors', name: 'Toronto Raptors', city: 'Toronto', color: 'bg-red-700', logo: 'https://upload.wikimedia.org/wikipedia/en/3/36/Toronto_Raptors_logo.svg' },
    { id: 'jazz', name: 'Utah Jazz', city: 'Salt Lake City', color: 'bg-yellow-500', logo: 'https://upload.wikimedia.org/wikipedia/en/0/04/Utah_Jazz_logo_%282016%29.svg' },
    { id: 'wizards', name: 'Washington Wizards', city: 'Washington', color: 'bg-blue-800', logo: 'https://upload.wikimedia.org/wikipedia/en/0/02/Washington_Wizards_logo.svg' },
];

// --- 2. FEATURED PLAYERS (2024 Stats) ---
// These load instantly without hitting the API limit
export const NBA_PLAYER_DB = [
    { id: 'nikola_jokic', name: 'Nikola Jokic', team: 'nuggets', pos: 'Center', ppg: 26.4, rpg: 12.4, apg: 9.0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Nikola_Jokic_free_throw_%28cropped%29.jpg/440px-Nikola_Jokic_free_throw_%28cropped%29.jpg', height: '6\'11"', weight: '284 lbs' },
    { id: 'luka_doncic', name: 'Luka Doncic', team: 'mavericks', pos: 'Guard', ppg: 33.9, rpg: 9.2, apg: 9.8, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Luka_Doncic_dribbling.jpg/440px-Luka_Doncic_dribbling.jpg', height: '6\'7"', weight: '230 lbs' },
    { id: 'shai_gilgeous-alexander', name: 'Shai Gilgeous-Alexander', team: 'thunder', pos: 'Guard', ppg: 30.1, rpg: 5.5, apg: 6.2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Shai_Gilgeous-Alexander_2018.jpg/440px-Shai_Gilgeous-Alexander_2018.jpg', height: '6\'6"', weight: '195 lbs' },
    { id: 'giannis_antetokounmpo', name: 'Giannis Antetokounmpo', team: 'bucks', pos: 'Forward', ppg: 30.4, rpg: 11.5, apg: 6.5, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Giannis_Antetokounmpo_dribbling_2019.jpg/440px-Giannis_Antetokounmpo_dribbling_2019.jpg', height: '6\'11"', weight: '243 lbs' },
    { id: 'jayson_tatum', name: 'Jayson Tatum', team: 'celtics', pos: 'Forward', ppg: 26.9, rpg: 8.1, apg: 4.9, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Jayson_Tatum_2022.jpg/440px-Jayson_Tatum_2022.jpg', height: '6\'8"', weight: '210 lbs' },
    { id: 'anthony_edwards', name: 'Anthony Edwards', team: 'timberwolves', pos: 'Guard', ppg: 25.9, rpg: 5.4, apg: 5.1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Anthony_Edwards_%2851907624519%29_%28cropped%29.jpg/440px-Anthony_Edwards_%2851907624519%29_%28cropped%29.jpg', height: '6\'4"', weight: '225 lbs' },
    { id: 'lebron_james', name: 'LeBron James', team: 'lakers', pos: 'Forward', ppg: 25.7, rpg: 7.3, apg: 8.3, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/LeBron_James_Lakers.jpg/440px-LeBron_James_Lakers.jpg', height: '6\'9"', weight: '250 lbs' },
    { id: 'stephen_curry', name: 'Stephen Curry', team: 'warriors', pos: 'Guard', ppg: 26.4, rpg: 4.5, apg: 5.1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Stephen_Curry_dribbling_2016.jpg/440px-Stephen_Curry_dribbling_2016.jpg', height: '6\'2"', weight: '185 lbs' },
    { id: 'kevin_durant', name: 'Kevin Durant', team: 'suns', pos: 'Forward', ppg: 27.1, rpg: 6.6, apg: 5.0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Kevin_Durant_2021.jpg/440px-Kevin_Durant_2021.jpg', height: '6\'11"', weight: '240 lbs' },
    { id: 'joel_embiid', name: 'Joel Embiid', team: 'sixers', pos: 'Center', ppg: 34.7, rpg: 11.0, apg: 5.6, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Joel_Embiid_free_throw_2019.jpg/440px-Joel_Embiid_free_throw_2019.jpg', height: '7\'0"', weight: '280 lbs' },
    { id: 'victor_wembanyama', name: 'Victor Wembanyama', team: 'spurs', pos: 'Center', ppg: 21.4, rpg: 10.6, apg: 3.9, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Victor_Wembanyama_Metropolitans_92_2022.jpg/440px-Victor_Wembanyama_Metropolitans_92_2022.jpg', height: '7\'4"', weight: '210 lbs' },
    { id: 'jalen_brunson', name: 'Jalen Brunson', team: 'knicks', pos: 'Guard', ppg: 28.7, rpg: 3.6, apg: 6.7, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Jalen_Brunson.jpg/440px-Jalen_Brunson.jpg', height: '6\'2"', weight: '190 lbs' },
];