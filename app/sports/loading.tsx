import React from 'react';
import { Loader2, Terminal, Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center relative overflow-hidden bg-black/50">
      
      {/* 1. Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(223,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(223,255,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* 2. Main Loader Icon */}
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-[#DFFF00] blur-2xl opacity-20 animate-pulse"></div>
           
           {/* Rotating Outer Ring */}
           <div className="w-16 h-16 border-2 border-zinc-800 border-t-[#DFFF00] rounded-full animate-spin relative z-10"></div>
           
           {/* Inner Icon */}
           <div className="absolute inset-0 flex items-center justify-center z-10">
               <Activity size={24} className="text-[#DFFF00]" />
           </div>
        </div>

        {/* 3. Text Status */}
        <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 text-[#DFFF00] font-mono text-sm font-black tracking-[0.2em] uppercase">
                <Terminal size={14} />
                <span>ESTABLISHING UPLINK</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
                <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-widest animate-pulse">
                    DECRYPTING SECURE ARCHIVES...
                </span>
                <span className="text-zinc-600 font-mono text-[9px] tracking-widest">
                    SYNCING TELEMETRY DATA
                </span>
            </div>
        </div>

        {/* 4. Progress Bar */}
        <div className="w-48 h-0.5 bg-zinc-900 mt-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-[#DFFF00] animate-[progress_1.5s_ease-in-out_infinite] origin-left w-full -translate-x-full"></div>
        </div>

      </div>
    </div>
  );
}