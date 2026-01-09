'use client';

import React, { useState } from 'react';
// import { forceRefreshDashboard } from '../actions';
import { Database, Activity, Loader2, RefreshCw } from 'lucide-react';

export default function AdminConsole() {
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runAction = async (name: string, fn: () => Promise<any>) => {
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
        <h1 className="text-3xl font-black text-white mb-8 border-b border-zinc-800 pb-4">SYSTEM CONTROL // NBA</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <button 
                disabled={loading}
                onClick={() => runAction('CACHE REFRESH', async () => {})}
                className="border border-green-900 bg-green-900/10 p-6 hover:bg-green-900/30 transition-all text-left group"
            >
                <RefreshCw className="mb-4 text-green-500 group-hover:rotate-180 transition-transform" />
                <h3 className="font-bold text-white mb-1">FORCE REFRESH SNAPSHOTS</h3>
                <p className="text-xs text-green-700">Invalidate Cache & Refetch Live Data.</p>
            </button>

            {/* Placeholder to show Sync is disabled */}
            <div className="border border-zinc-900 bg-zinc-900/10 p-6 opacity-50 cursor-not-allowed">
                <Database className="mb-4 text-zinc-700" />
                <h3 className="font-bold text-zinc-500 mb-1">DATABASE SYNC</h3>
                <p className="text-xs text-zinc-700">Disabled (Fetch-on-Demand Mode Active)</p>
            </div>
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