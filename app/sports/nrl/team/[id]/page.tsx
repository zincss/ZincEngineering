'use client';

import React from 'react';
import { ArrowLeft, Shield, MapPin, Users, Trophy, Star, Activity, History, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- LOGOS (Updated) ---
const TEAM_LOGOS: Record<string, string> = {
    'broncos': 'https://en.wikipedia.org/wiki/Special:FilePath/Brisbane_Broncos_logo.svg',
    'raiders': 'https://en.wikipedia.org/wiki/Special:FilePath/Canberra_Raiders_logo.svg',
    'bulldogs': 'https://en.wikipedia.org/wiki/Special:FilePath/Canterbury_Bankstown_Bulldogs_logo.svg',
    'sharks': 'https://en.wikipedia.org/wiki/Special:FilePath/Cronulla_Sharks_logo.svg',
    'dolphins': 'https://en.wikipedia.org/wiki/Special:FilePath/Dolphins_NRL_logo.svg',
    'titans': 'https://en.wikipedia.org/wiki/Special:FilePath/Gold_Coast_Titans_logo.svg',
    'sea-eagles': 'https://en.wikipedia.org/wiki/Special:FilePath/Manly_Sea_Eagles_logo.svg',
    'storm': 'https://en.wikipedia.org/wiki/Special:FilePath/Melbourne_Storm_logo.svg',
    'knights': 'https://en.wikipedia.org/wiki/Special:FilePath/Newcastle_Knights_logo.svg',
    'cowboys': 'https://en.wikipedia.org/wiki/Special:FilePath/North_Queensland_Cowboys_logo.svg',
    'eels': 'https://en.wikipedia.org/wiki/Special:FilePath/Parramatta_Eels_logo.svg',
    'panthers': 'https://en.wikipedia.org/wiki/Special:FilePath/Penrith_Panthers_logo.svg',
    'rabbitohs': 'https://en.wikipedia.org/wiki/Special:FilePath/South_Sydney_Rabbitohs_logo.svg',
    'dragons': 'https://en.wikipedia.org/wiki/Special:FilePath/St_George_Illawarra_Dragons_logo.svg',
    'roosters': 'https://en.wikipedia.org/wiki/Special:FilePath/Sydney_Roosters_logo.svg',
    'warriors': 'https://en.wikipedia.org/wiki/Special:FilePath/New_Zealand_Warriors_logo.svg',
    'tigers': 'https://en.wikipedia.org/wiki/Special:FilePath/Wests_Tigers_logo.svg',
};

const NRL_TEAMS_DATA: Record<string, any> = {
    'broncos': { 
        name: 'Brisbane Broncos', 
        city: 'Brisbane', 
        color: 'bg-red-900', 
        est: 1988,
        premierships: 6,
        home: 'Suncorp Stadium',
        coach: 'Kevin Walters',
        legends: ['Darren Lockyer', 'Allan Langer', 'Wally Lewis'],
        stars: ['Reece Walsh', 'Adam Reynolds', 'Payne Haas'],
        stats: { wins: 14, losses: 10, winRate: 58, completion: 78 }
    },
    'raiders': { 
        name: 'Canberra Raiders', 
        city: 'Canberra', 
        color: 'bg-green-700', 
        est: 1982,
        premierships: 3,
        home: 'GIO Stadium',
        coach: 'Ricky Stuart',
        legends: ['Mal Meninga', 'Laurie Daley', 'Bradley Clyde'],
        stars: ['Joseph Tapine', 'Jack Wighton', 'Josh Papalii'],
        stats: { wins: 13, losses: 11, winRate: 54, completion: 76 }
    },
    'bulldogs': { 
        name: 'Canterbury-Bankstown Bulldogs', 
        city: 'Sydney', 
        color: 'bg-blue-700', 
        est: 1935,
        premierships: 8,
        home: 'Accor Stadium',
        coach: 'Cameron Ciraldo',
        legends: ['Steve Mortimer', 'Terry Lamb', 'Hazem El Masri'],
        stars: ['Matt Burton', 'Stephen Crichton', 'Viliame Kikau'],
        stats: { wins: 12, losses: 12, winRate: 50, completion: 75 }
    },
    'sharks': { 
        name: 'Cronulla-Sutherland Sharks', 
        city: 'Sydney', 
        color: 'bg-cyan-600', 
        est: 1967,
        premierships: 1,
        home: 'PointsBet Stadium',
        coach: 'Craig Fitzgibbon',
        legends: ['Andrew Ettingshausen', 'Paul Gallen', 'Steve Rogers'],
        stars: ['Nicho Hynes', 'Ronaldo Mulitalo', 'Briton Nikora'],
        stats: { wins: 15, losses: 9, winRate: 62, completion: 80 }
    },
    'dolphins': { 
        name: 'The Dolphins', 
        city: 'Redcliffe', 
        color: 'bg-red-500', 
        est: 2023,
        premierships: 0,
        home: 'Kayo Stadium',
        coach: 'Wayne Bennett',
        legends: ['Arthur Beetson'],
        stars: ['Hamiso Tabuai-Fidow', 'Herbie Farnworth', 'Tom Gilbert'],
        stats: { wins: 11, losses: 13, winRate: 45, completion: 77 }
    },
    'titans': { 
        name: 'Gold Coast Titans', 
        city: 'Gold Coast', 
        color: 'bg-yellow-500', 
        est: 2007,
        premierships: 0,
        home: 'Cbus Super Stadium',
        coach: 'Des Hasler',
        legends: ['Scott Prince', 'Preston Campbell', 'Greg Bird'],
        stars: ['Tino Fa\'asuamaleaui', 'David Fifita', 'AJ Brimson'],
        stats: { wins: 9, losses: 15, winRate: 37, completion: 75 }
    },
    'sea-eagles': { 
        name: 'Manly Warringah Sea Eagles', 
        city: 'Sydney', 
        color: 'bg-red-800', 
        est: 1947,
        premierships: 8,
        home: '4 Pines Park',
        coach: 'Anthony Seibold',
        legends: ['Bob Fulton', 'Brett Stewart', 'Steve Menzies'],
        stars: ['Daly Cherry-Evans', 'Tom Trbojevic', 'Haumole Olakau\'atu'],
        stats: { wins: 13, losses: 10, winRate: 56, completion: 78 }
    },
    'storm': { 
        name: 'Melbourne Storm', 
        city: 'Melbourne', 
        color: 'bg-purple-800', 
        est: 1998,
        premierships: 4,
        home: 'AAMI Park',
        coach: 'Craig Bellamy',
        legends: ['Cameron Smith', 'Billy Slater', 'Cooper Cronk'],
        stars: ['Cameron Munster', 'Harry Grant', 'Ryan Papenhuyzen'],
        stats: { wins: 18, losses: 6, winRate: 75, completion: 81 }
    },
    'knights': { 
        name: 'Newcastle Knights', 
        city: 'Newcastle', 
        color: 'bg-blue-800', 
        est: 1988,
        premierships: 2,
        home: 'McDonald Jones Stadium',
        coach: 'Adam O\'Brien',
        legends: ['Andrew Johns', 'Danny Buderus', 'Paul Harragon'],
        stars: ['Kalyn Ponga', 'Bradman Best', 'Dane Gagai'],
        stats: { wins: 12, losses: 11, winRate: 52, completion: 77 }
    },
    'cowboys': { 
        name: 'North Queensland Cowboys', 
        city: 'Townsville', 
        color: 'bg-yellow-600', 
        est: 1995,
        premierships: 1,
        home: 'Queensland Country Bank Stadium',
        coach: 'Todd Payten',
        legends: ['Johnathan Thurston', 'Matt Bowen', 'Matt Scott'],
        stars: ['Scott Drinkwater', 'Valentine Holmes', 'Tom Dearden'],
        stats: { wins: 14, losses: 10, winRate: 58, completion: 79 }
    },
    'eels': { 
        name: 'Parramatta Eels', 
        city: 'Sydney', 
        color: 'bg-blue-600', 
        est: 1947,
        premierships: 4,
        home: 'CommBank Stadium',
        coach: 'Brad Arthur',
        legends: ['Peter Sterling', 'Brett Kenny', 'Ray Price'],
        stars: ['Clint Gutherson', 'Mitchell Moses', 'Dylan Brown'],
        stats: { wins: 11, losses: 13, winRate: 45, completion: 76 }
    },
    'panthers': { 
        name: 'Penrith Panthers', 
        city: 'Penrith', 
        color: 'bg-zinc-900', 
        est: 1967,
        premierships: 5,
        home: 'BlueBet Stadium',
        coach: 'Ivan Cleary',
        legends: ['Greg Alexander', 'Royce Simmons', 'Ryan Girdler'],
        stars: ['Nathan Cleary', 'Isaah Yeo', 'Dylan Edwards'],
        stats: { wins: 20, losses: 4, winRate: 83, completion: 82 }
    },
    'rabbitohs': { 
        name: 'South Sydney Rabbitohs', 
        city: 'Sydney', 
        color: 'bg-red-700', 
        est: 1908,
        premierships: 21,
        home: 'Accor Stadium',
        coach: 'Jason Demetriou',
        legends: ['Clive Churchill', 'John Sattler', 'Greg Inglis'],
        stars: ['Latrell Mitchell', 'Cody Walker', 'Cameron Murray'],
        stats: { wins: 12, losses: 12, winRate: 50, completion: 74 }
    },
    'dragons': { 
        name: 'St George Illawarra Dragons', 
        city: 'Sydney', 
        color: 'bg-red-600', 
        est: 1999,
        premierships: 1,
        home: 'Netstrata Jubilee Stadium',
        coach: 'Shane Flanagan',
        legends: ['Ben Hornby', 'Mark Gasnier', 'Matt Cooper'],
        stars: ['Ben Hunt', 'Zac Lomax', 'Jack de Belin'],
        stats: { wins: 10, losses: 14, winRate: 41, completion: 75 }
    },
    'roosters': { 
        name: 'Sydney Roosters', 
        city: 'Sydney', 
        color: 'bg-blue-900', 
        est: 1908,
        premierships: 15,
        home: 'Allianz Stadium',
        coach: 'Trent Robinson',
        legends: ['Arthur Beetson', 'Brad Fittler', 'Anthony Minichiello'],
        stars: ['James Tedesco', 'Joey Manu', 'Lindsay Collins'],
        stats: { wins: 16, losses: 8, winRate: 66, completion: 79 }
    },
    'warriors': { 
        name: 'New Zealand Warriors', 
        city: 'Auckland', 
        color: 'bg-zinc-600', 
        est: 1995,
        premierships: 0,
        home: 'Go Media Stadium',
        coach: 'Andrew Webster',
        legends: ['Stacey Jones', 'Simon Mannering', 'Manu Vatuvei'],
        stars: ['Shaun Johnson', 'Addin Fonua-Blake', 'Charnze Nicoll-Klokstad'],
        stats: { wins: 12, losses: 12, winRate: 50, completion: 78 }
    },
    'tigers': { 
        name: 'Wests Tigers', 
        city: 'Sydney', 
        color: 'bg-orange-500', 
        est: 2000,
        premierships: 1,
        home: 'Leichhardt Oval',
        coach: 'Benji Marshall',
        legends: ['Benji Marshall', 'Robbie Farah', 'Chris Lawrence'],
        stars: ['Api Koroisau', 'Jahream Bula', 'Stefano Utoikamanu'],
        stats: { wins: 6, losses: 18, winRate: 25, completion: 72 }
    },
};

const DEFAULT_TEAM = {
    name: 'Generic Club',
    city: 'Australia',
    color: 'bg-zinc-500',
    est: 1908,
    premierships: 0,
    home: 'Local Stadium',
    coach: 'Head Coach',
    legends: ['Club Legend 1', 'Club Legend 2'],
    stars: ['Star Player 1', 'Star Player 2'],
    stats: { wins: 10, losses: 14, winRate: 41, completion: 70 }
};

export default function TeamPage() {
    const { id } = useParams();
    // @ts-ignore
    const teamData = NRL_TEAMS_DATA[id] || { ...DEFAULT_TEAM, id };
    const logo = TEAM_LOGOS[id as string];

    // Simulate loading
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center gap-2 text-zinc-400 font-mono text-xs">
            <Loader2 className="animate-spin" /> ACCESSING ARCHIVES...
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-40 px-4 md:px-0 pt-12">
            <Link href="/sports/nrl" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent"><ArrowLeft size={16} /> RETURN TO LEAGUE</Link>

            {/* HERO HEADER */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-lg mb-12 relative overflow-hidden">
                <div className={`h-40 ${teamData.color} w-full flex items-center justify-center relative overflow-hidden`}>
                     <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                </div>
                
                <div className="p-8 relative">
                    {/* Floating Logo */}
                    <div className="absolute -top-16 left-8 w-32 h-32 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 flex items-center justify-center shadow-md p-4">
                        {logo ? (
                            <img src={logo} className="w-full h-full object-contain" alt={teamData.name} />
                        ) : (
                            <Shield size={64} className="text-black dark:text-white" />
                        )}
                    </div>
                    
                    <div className="mt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black dark:text-white leading-none mb-2">{teamData.name}</h1>
                            <div className="flex flex-wrap gap-4 text-xs font-mono font-bold text-zinc-500">
                                <span className="flex items-center gap-1"><MapPin size={12}/> {teamData.city.toUpperCase()}</span>
                                <span className="flex items-center gap-1"><Users size={12}/> EST. {teamData.est}</span>
                                <span className="flex items-center gap-1"><Trophy size={12}/> {teamData.premierships} PREMIERSHIPS</span>
                            </div>
                        </div>
                        
                        {/* Win Rate Badge */}
                        <div className="bg-black text-white p-4 text-center min-w-[120px]">
                            <span className="text-[10px] font-bold tracking-widest block mb-1 text-zinc-400">WIN RATE</span>
                            <span className="text-3xl font-black">{teamData.stats.winRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* COL 1: SEASON STATS */}
                <div className="md:col-span-1 space-y-8">
                    <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
                        <div className="flex items-center gap-2 mb-6 border-b-2 border-zinc-100 dark:border-zinc-800 pb-2">
                            <Activity size={16} className="text-black dark:text-white" />
                            <span className="text-xs font-black tracking-widest uppercase">SEASON METRICS</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-zinc-500">WINS</span>
                                <span className="font-black text-xl">{teamData.stats.wins}</span>
                            </div>
                            <div className="w-full bg-zinc-100 h-2"><div className="bg-green-500 h-full" style={{width: `${(teamData.stats.wins / 24) * 100}%`}}></div></div>
                            
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-bold text-zinc-500">LOSSES</span>
                                <span className="font-black text-xl">{teamData.stats.losses}</span>
                            </div>
                            <div className="w-full bg-zinc-100 h-2"><div className="bg-red-500 h-full" style={{width: `${(teamData.stats.losses / 24) * 100}%`}}></div></div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-bold text-zinc-500">COMPLETION RATE</span>
                                <span className="font-black text-xl">{teamData.stats.completion}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 h-2"><div className="bg-blue-500 h-full" style={{width: `${teamData.stats.completion}%`}}></div></div>
                        </div>
                    </div>

                    <div className="border-2 border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={16} />
                            <span className="text-xs font-black tracking-widest uppercase">HEAD COACH</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase">{teamData.coach}</h3>
                    </div>
                </div>

                {/* COL 2 & 3: PLAYERS & HISTORY */}
                <div className="md:col-span-2 space-y-8">
                    
                    {/* STAR PLAYERS */}
                    <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8">
                        <div className="flex items-center gap-2 mb-6 border-b-2 border-zinc-100 dark:border-zinc-800 pb-2">
                            <Star size={16} className="text-yellow-500" />
                            <span className="text-xs font-black tracking-widest uppercase">KEY SQUAD MEMBERS</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {teamData.stars.map((player: string) => (
                                <div key={player} className="bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-400 font-bold">
                                        {player.charAt(0)}
                                    </div>
                                    <span className="font-bold text-sm uppercase">{player}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CLUB LEGENDS */}
                    <div className="border-2 border-black dark:border-zinc-700 bg-zinc-900 text-white p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <History size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6 border-b-2 border-zinc-700 pb-2">
                                <Trophy size={16} className="text-yellow-500" />
                                <span className="text-xs font-black tracking-widest uppercase">HALL OF FAME // LEGENDS</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {teamData.legends.map((player: string) => (
                                    <div key={player} className="flex items-center gap-3">
                                        <Star size={12} className="text-zinc-500" />
                                        <span className="font-mono font-bold text-sm uppercase tracking-wide text-zinc-300">{player}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}