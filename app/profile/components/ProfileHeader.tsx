'use client';

import React from 'react';
import { User, Calendar, Coins } from 'lucide-react';

interface ProfileHeaderProps {
    profile: any;
    inventoryCount: number;
}

export const ProfileHeader = ({ profile, inventoryCount }: ProfileHeaderProps) => {
    return (
        <div className="pt-24 pb-8 px-6 max-w-[1600px] mx-auto border-b border-zinc-800">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* User Avatar */}
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 border-2 border-zinc-800 rounded-full flex items-center justify-center relative overflow-hidden group">
                        {profile?.avatar_image ? (
                             // If you have a system for avatar images, render it here. 
                             // Otherwise default to Icon:
                             <User size={40} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                        ) : (
                            <User size={40} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
                        )}
                    </div>
                    
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
                            {profile?.username || 'Unknown Operator'}
                        </h1>
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs font-mono text-zinc-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={12} /> JOINED: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[#DFFF00]">
                                <Coins size={12} /> BALANCE: {profile?.credits.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Stats */}
                <div className="hidden md:flex flex-1 justify-end items-center gap-12">
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Assets</div>
                        <div className="text-2xl font-black text-white">{inventoryCount}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Clearance</div>
                        <div className="text-2xl font-black text-blue-500">
                            {profile?.role === 'admin' ? 'LVL 5' : 'LVL 1'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};