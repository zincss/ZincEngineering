'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Loader2, ChevronRight } from 'lucide-react';
import { getTeamData } from '../actions';
import { NBA_TEAMS } from '../data';

export default function RosterExplorer() {
    const [selectedTeam, setSelectedTeam] = useState(NBA_TEAMS[0].espnId);
    const [roster, setRoster] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getTeamData(selectedTeam).then((data) => {
            if (data) setRoster(data.roster);
            setLoading(false);
        });
    }, [selectedTeam]);

    return (
        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 text-black dark:text-white mb-6">
                <Users size={18} />
                <h3 className="text-xl font-black uppercase tracking-tighter">Roster Explorer</h3>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                {NBA_TEAMS.map(team => (
                    <button
                        key={team.id}
                        onClick={() => setSelectedTeam(team.espnId)}
                        className={`flex-shrink-0 w-12 h-12 rounded-full p-2 border-2 transition-all ${
                            selectedTeam === team.espnId 
                            ? 'border-acid bg-black' 
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 opacity-60 hover:opacity-100'
                        }`}
                    >
                        <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <Loader2 className="animate-spin text-zinc-400" size={20}/>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {roster.map((player: any) => (
                        <Link 
                            href={`/sports/nba/player/${player.id}`} 
                            key={player.id}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-500 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                                <img src={player.image} alt={player.name} className="w-full h-full object-cover scale-125 pt-2" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs uppercase text-black dark:text-white truncate">{player.name}</div>
                                <div className="text-[10px] font-mono text-zinc-500">
                                    #{player.number} • {player.pos} • {player.height}
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-zinc-300 group-hover:text-acid" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}