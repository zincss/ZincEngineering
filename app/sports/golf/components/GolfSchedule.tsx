'use client';
import { Calendar, ArrowRight } from 'lucide-react';

export default function GolfSchedule({ events }: { events: any[] }) {
    return (
        <div className="bg-black border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800">
                <Calendar size={16} className="text-[#DFFF00]" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Tour Schedule</h3>
            </div>
            <div className="space-y-4">
                {events.map((e) => (
                    <div key={e.id} className="group flex justify-between items-center py-2 hover:bg-zinc-900 px-2 transition-colors -mx-2">
                        <div>
                            {/* Use pre-formatted string from server */}
                            <div className="text-[10px] font-mono text-[#DFFF00] uppercase mb-1">
                                {e.dates}
                            </div>
                            <div className="text-sm font-black text-white uppercase mb-1 group-hover:translate-x-1 transition-transform">{e.name}</div>
                            <div className="text-[10px] text-zinc-500 uppercase">{e.venue}</div>
                        </div>
                        <ArrowRight size={14} className="text-zinc-700 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                ))}
            </div>
        </div>
    )
}