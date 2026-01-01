'use client';

import React from 'react';
import Link from 'next/link';
import { User, Calendar, Coins, ShieldCheck, Home } from 'lucide-react';

interface ProfileHeaderProps {
    profile: any;
    inventoryCount: number;
}

export const ProfileHeader = ({ profile, inventoryCount }: ProfileHeaderProps) => {
    return (
        <div className="pt-24 pb-8 px-4 md:px-6 max-w-[1600px] mx-auto border-b border-zinc-800">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                
                {/* LEFT: AVATAR & IDENTITY */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                    {/* User Avatar */}
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 border-2 border-zinc-800 rounded-full flex items-center justify-center relative overflow-hidden group shrink-0">
                        {profile?.avatar_image ? (
                             // If you have a system for avatar images, render it here. 
                             <User size={40} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                        ) : (
                            <User size={40} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                        )}
                    </div>
                    
                    <div className="text-center md:text-left flex flex-col items-center md:items-start">
                        
                        {/* NAME + HOME BUTTON ROW */}
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight break-all">
                                {profile?.username || 'Unknown Operator'}
                            </h1>
                            
                            {/* Residence Shortcut Button */}
                            <Link 
                                href="/residence"
                                className="group/btn relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] transition-all hover:scale-105"
                                title="Access Primary Residence"
                            >
                                <Home 
                                    size={16} 
                                    className="text-zinc-500 group-hover/btn:text-[#DFFF00] transition-colors" 
                                />
                                <span className="absolute -top-8 scale-0 group-hover/btn:scale-100 transition-all bg-[#DFFF00] text-black text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap shadow-lg pointer-events-none">
                                    Go Home
                                </span>
                            </Link>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-xs font-mono text-zinc-500">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <Calendar size={12} /> 
                                <span>JOINED: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#DFFF00] whitespace-nowrap">
                                <Coins size={12} /> 
                                <span>{profile?.credits.toLocaleString()} CR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: STATS (Stacked on Mobile) */}
                <div className="flex w-full md:flex-1 justify-center md:justify-end items-center gap-4 md:gap-12 mt-4 md:mt-0 border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0">
                    <div className="text-center md:text-right px-4">
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Total Assets</div>
                        <div className="text-xl md:text-2xl font-black text-white">{inventoryCount}</div>
                    </div>
                    <div className="w-px h-8 bg-zinc-800 md:hidden" /> {/* Mobile Divider */}
                    <div className="text-center md:text-right px-4">
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Clearance</div>
                        <div className="flex items-center justify-center md:justify-end gap-1 text-xl md:text-2xl font-black text-blue-500">
                            {profile?.role === 'admin' ? <><ShieldCheck size={18} /> LVL 5</> : 'LVL 1'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};