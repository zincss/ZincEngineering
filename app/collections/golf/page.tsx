'use client';

import React, { useState, useEffect } from 'react';
import { Target, BrainCircuit, Activity, LayoutGrid, FileDigit, Crosshair } from 'lucide-react';
import GolfScorecard from './components/GolfScorecard';
import CoachInterface from './coach/components/CoachInterface';
import TheArmory from './components/TheArmory';
import { getUserProfile, GolfProfile } from './actions';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

type Tab = 'SCORECARD' | 'CADDIE' | 'ARMORY';

export default function GolfPage() {
  const [activeTab, setActiveTab] = useState<Tab>('SCORECARD');
  const [profile, setProfile] = useState<GolfProfile | null>(null);

  useEffect(() => {
    const loadData = async () => {
        const { data } = await getUserProfile();
        if (data) setProfile(data);
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* HEADER */}
      <div className="relative border-b border-zinc-800 bg-zinc-900/50 pt-32 pb-6 px-6">
        <div className="max-w-[1800px] mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center gap-1"><Activity size={12} className="text-[#DFFF00]" /> System Online</span>
                    <span>//</span>
                    <span>Field Operations</span>
                    <span>//</span>
                    <span>Golf Protocol V2.1</span>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                     <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2">
                        <span>PAR: 72</span>
                     </div>
                     <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2">
                        <span>HCP: +15</span>
                     </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row justify-between items-end gap-8">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-2">
                        Golf <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600">Operations</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest max-w-xl">
                        Advanced telemetry tracking and biomechanical analysis suite.
                    </p>
                </div>

                {/* TABS */}
                <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-full xl:w-auto overflow-x-auto">
                    {[
                        { id: 'SCORECARD', icon: FileDigit, label: 'Scorecard' },
                        { id: 'CADDIE', icon: BrainCircuit, label: 'Virtual Caddie' },
                        { id: 'ARMORY', icon: Crosshair, label: 'The Armory' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={cn(
                                "flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-lg text-sm font-black uppercase tracking-wider transition-all duration-300 min-w-[160px]",
                                activeTab === tab.id 
                                    ? "bg-[#DFFF00] text-black shadow-[0_0_20px_rgba(223,255,0,0.3)]" 
                                    : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                            )}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full">
          <div className={cn(
              "w-full transition-opacity duration-500 px-6 py-12",
              activeTab === 'SCORECARD' ? "opacity-100 block" : "opacity-0 hidden h-0 overflow-hidden"
          )}>
               <div className="max-w-[1600px] mx-auto">
                   <div className="mb-8 flex items-center gap-2 text-zinc-600 font-mono text-xs uppercase tracking-widest border-l-2 border-[#DFFF00] pl-3">
                       <LayoutGrid size={14} /> Active Module: Scoring Database
                   </div>
                   <GolfScorecard profile={profile} />
               </div>
          </div>

          <div className={cn(
              "w-full transition-opacity duration-500 px-6 py-12",
              activeTab === 'CADDIE' ? "opacity-100 block" : "opacity-0 hidden h-0 overflow-hidden"
          )}>
               <div className="max-w-[1600px] mx-auto">
                    <div className="mb-8 flex items-center gap-2 text-zinc-600 font-mono text-xs uppercase tracking-widest border-l-2 border-[#DFFF00] pl-3">
                       <Target size={14} /> Active Module: AI Diagnostics
                   </div>
                   <CoachInterface />
               </div>
          </div>

          <div className={cn(
              "w-full transition-opacity duration-500",
              activeTab === 'ARMORY' ? "opacity-100 block" : "opacity-0 hidden h-0 overflow-hidden"
          )}>
               {profile && (
                   <TheArmory 
                        initialProfile={profile} 
                        onUpdate={(newProfile) => setProfile(newProfile)} 
                   />
               )}
          </div>
      </div>
    </div>
  );
}