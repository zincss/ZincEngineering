'use client';

import React, { useState } from 'react';
import { syncTeams, syncRosters, syncPlayerStats } from '../sync';
import { Database, Users, Activity, Loader2, CheckCircle } from 'lucide-react';

export default function AdminConsole() {
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runSync = async (name: string, fn: () => Promise<any>) => {
    setLoading(true);
    setLog(prev => [...prev, `> INITIALIZING ${name}...`]);
    try {
        const res = await fn();
        setLog(prev => [...prev, `> ${name} COMPLETE: ${JSON.stringify(res)}`]);
    } catch (e) {
        setLog(prev => [...prev, `> ${name} FAILED.`]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-12">
        <h1 className="text-3xl font-black text-white mb-8 border-b border-zinc-800 pb-4">DATABASE CONTROL // NBA</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <button 
                disabled={loading}
                onClick={() => runSync('TEAM SYNC', syncTeams)}
                className="border border-green-900 bg-green-900/10 p-6 hover:bg-green-900/30 transition-all text-left group"
            >
                <Database className="mb-4 text-green-500 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-white mb-1">SYNC STANDINGS</h3>
                <p className="text-xs text-green-700">Fetch Teams & Records from NBA CDN.</p>
            </button>

            <button 
                disabled={loading}
                onClick={() => runSync('ROSTER SYNC', syncRosters)}
                className="border border-green-900 bg-green-900/10 p-6 hover:bg-green-900/30 transition-all text-left group"
            >
                <Users className="mb-4 text-green-500 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-white mb-1">SYNC ROSTERS</h3>
                <p className="text-xs text-green-700">Update Player Lists from ESPN.</p>
            </button>

            <button 
                disabled={loading}
                onClick={() => runSync('STATS SYNC', syncPlayerStats)}
                className="border border-green-900 bg-green-900/10 p-6 hover:bg-green-900/30 transition-all text-left group"
            >
                <Activity className="mb-4 text-green-500 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-white mb-1">SYNC LEADERS</h3>
                <p className="text-xs text-green-700">Pull Top 50 Stats per Category.</p>
            </button>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-4 h-64 overflow-y-auto font-mono text-xs">
            {log.length === 0 && <span className="text-zinc-600">WAITING FOR COMMAND...</span>}
            {log.map((l, i) => (
                <div key={i} className="mb-1">{l}</div>
            ))}
            {loading && <div className="flex items-center gap-2 mt-2 text-[#DFFF00]"><Loader2 size={12} className="animate-spin"/> PROCESSING...</div>}
        </div>
    </div>
  );
}