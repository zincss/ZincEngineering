import React from 'react';
import { getPlayerProfile } from '../../actions';
import { Users, Ruler, User } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NFLPlayerPage({ params }: { params: { id: string } }) {
    const player = await getPlayerProfile(params.id);

    if (!player) return <div className="p-12 text-center font-mono text-zinc-500">PLAYER_NOT_FOUND</div>;

    return (
        <main className="min-h-screen bg-zinc-950 text-white pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                 <Link href="/sports/nfl" className="text-[10px] font-mono text-zinc-500 hover:text-[#DFFF00] uppercase mb-8 block">&larr; Return to Nexus</Link>
                 
                 <div className="flex flex-col md:flex-row gap-12 items-start">
                     {/* Card */}
                     <div className="w-full md:w-1/3 bg-zinc-900 border border-zinc-800 p-6 text-center relative overflow-hidden group">
                         <div className="absolute top-0 left-0 w-full h-1 bg-[#DFFF00]"></div>
                         <img src={player.headshot} className="w-48 h-48 mx-auto object-cover rounded-full bg-zinc-800 mb-6 border-4 border-zinc-950 shadow-2xl" />
                         <h1 className="text-3xl font-black uppercase text-white leading-none mb-2">{player.name}</h1>
                         <div className="font-mono text-[#DFFF00] font-bold text-lg mb-6">#{player.number} • {player.pos}</div>
                         
                         <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
                             <div className="text-left">
                                 <div className="text-[10px] text-zinc-500 uppercase font-mono flex items-center gap-1"><Ruler size={10}/> Height</div>
                                 <div className="font-bold text-white">{player.height}</div>
                             </div>
                             <div className="text-left">
                                 <div className="text-[10px] text-zinc-500 uppercase font-mono flex items-center gap-1"><User size={10}/> Weight</div>
                                 <div className="font-bold text-white">{player.weight}</div>
                             </div>
                             <div className="text-left">
                                 <div className="text-[10px] text-zinc-500 uppercase font-mono flex items-center gap-1"><Users size={10}/> College</div>
                                 <div className="font-bold text-white truncate">{player.college}</div>
                             </div>
                             <div className="text-left">
                                 <div className="text-[10px] text-zinc-500 uppercase font-mono">Experience</div>
                                 <div className="font-bold text-white">{player.exp} Yrs</div>
                             </div>
                         </div>
                     </div>

                     {/* Stats */}
                     <div className="flex-1">
                         <h2 className="text-xl font-black uppercase text-white mb-6 border-b border-zinc-800 pb-2">Season Metrics</h2>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                             {player.stats.map((stat: any, i: number) => (
                                 <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4">
                                     <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 truncate">{stat.name}</div>
                                     <div className="text-2xl font-black text-white">{stat.value}</div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
            </div>
        </main>
    )
}