'use client';

import React, { useState, useEffect } from 'react';
import { getSportsNews } from '@/app/sports/actions';
import { ExternalLink, Newspaper } from 'lucide-react';

export default function NewsTicker() {
    const [news, setNews] = useState<any[]>([]);

    useEffect(() => {
        getSportsNews().then(setNews);
    }, []);

    if (news.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2 px-2">
                <Newspaper size={14} className="text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">The Feed</h3>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory scrollbar-hide">
                {news.map((item, i) => (
                    <a 
                        key={i} 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="snap-center shrink-0 w-[280px] bg-slate-900/50 border border-white/5 rounded-2xl p-4 hover:bg-slate-800/50 hover:border-blue-500/20 transition-all group flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{item.league}</span>
                                <ExternalLink size={10} className="text-slate-600 group-hover:text-blue-400" />
                            </div>
                            <h4 className="text-sm font-bold text-white leading-tight line-clamp-3 mb-2 group-hover:text-blue-200 transition-colors">{item.headline}</h4>
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">{new Date(item.published).toLocaleDateString()}</div>
                    </a>
                ))}
            </div>
        </div>
    );
}
