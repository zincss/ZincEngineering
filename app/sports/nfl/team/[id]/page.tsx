import React from 'react';
import { getTeamSnapshot } from '../../actions';
import { MapPin, Trophy, Shield } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NFLTeamPage({ params }: { params: { id: string } }) {
    const team = await getTeamSnapshot(params.id);

    if (!team) return <div className="p-12 text-center font-mono text-zinc-500">TEAM_NOT_FOUND</div>;

    return (
        <main className="min-h-screen bg-zinc-950 text-white pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/sports/nfl" className="text-[10px] font-mono text-zinc-500 hover:text-[#DFFF00] uppercase mb-8 block">&larr; Return to Nexus</Link>
                
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 border-b border-zinc-800 pb-12 mb-12">
                   <img src={team.logo} className="w-32 h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                   <div className="text-center md:text-left">
                       <h1 className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter leading-none mb-2">{team.name}</h1>
                       <div className="flex flex-col md:flex-row items-center gap-4 text-zinc-400 font-mono text-xs uppercase">
                           <span className="flex items-center gap-2"><MapPin size={12}/> {team.location}</span>
                           <span className="hidden md:inline text-zinc-700">|</span>
                           <span>{team.stadium}</span>
                       </div>
                   </div>
                   <div className="ml-auto flex gap-4">
                       <div className="text-center border border-zinc-800 p-4 min-w-[100px] bg-zinc-900/30">
                           <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Record</div>
                           <div className="text-3xl font-black text-[#DFFF00]">{team.record}</div>
                       </div>
                   </div>
                </div>

                {/* Team Standing */}
                <div className="bg-zinc-900/20 border border-zinc-800 p-6 mb-8">
                     <h3 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
                        <Shield size={14} className="text-[#DFFF00]" /> Divisional Status
                     </h3>
                     <p className="text-xl font-mono uppercase text-zinc-300">{team.standing}</p>
                </div>
            </div>
        </main>
    )
}