import React from 'react';
import { Activity, Database } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-[#DFFF00] font-mono text-xs uppercase tracking-widest">
       <div className="flex items-center gap-3 animate-pulse">
           <Activity size={16} /> 
           <span>Retrieving Franchise Data...</span>
       </div>
       <div className="text-zinc-600 flex items-center gap-2">
            <Database size={12} /> Accessing Archive
       </div>
    </div>
  );
}