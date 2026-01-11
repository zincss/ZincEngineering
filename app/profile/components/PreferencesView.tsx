'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, AlertCircle, BellRing, Settings, ShieldCheck } from 'lucide-react';
import { updateWeeklyDigestPreference } from '../actions';

interface PreferencesViewProps {
    profile: any;
}

export const PreferencesView = ({ profile }: PreferencesViewProps) => {
    const [optIn, setOptIn] = useState(profile?.weekly_digest_opt_in || false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleToggle = async () => {
        setLoading(true);
        const newVal = !optIn;
        const res = await updateWeeklyDigestPreference(newVal);
        
        if (res.success) {
            setOptIn(newVal);
            setMsg({ type: 'success', text: res.message! });
        } else {
            setMsg({ type: 'error', text: res.error! });
        }
        setLoading(false);
        setTimeout(() => setMsg(null), 3000);
    };

    return (
        <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="grid grid-cols-1 gap-8">
                
                {/* WEEKLY DIGEST CARD */}
                <div className={`
                    group relative bg-zinc-950 border transition-all duration-500 rounded-[2.5rem] p-8 md:p-12 overflow-hidden
                    ${optIn ? 'border-[#DFFF00]/30 shadow-[0_0_50px_rgba(223,255,0,0.05)]' : 'border-zinc-800'}
                `}>
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#DFFF00]/5 blur-[120px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2 group-hover:bg-[#DFFF00]/10 transition-colors" />
                    
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-500 group-hover:text-[#DFFF00] transition-colors shadow-lg shadow-black/50">
                                    <Mail size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">Weekly Digest</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${optIn ? 'bg-[#DFFF00] animate-pulse shadow-[0_0_10px_#DFFF00]' : 'bg-zinc-800'}`} />
                                        <span className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-widest">
                                            {optIn ? 'SUBSCRIPTION_ACTIVE' : 'SUBSCRIPTION_OFFLINE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl">
                                Join our executive intelligence network. Every Sunday, receive a comprehensive analysis of your 
                                <span className="text-white font-black italic"> Portfolio Growth</span>, 
                                <span className="text-white font-black"> Player Performance Matrix</span>, 
                                and newly unearthed <span className="text-[#DFFF00] font-black underline decoration-[#DFFF00]/30 decoration-2 underline-offset-4">Hidden Gems</span>.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sunday Delivery</div>
                                <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest">Full Portfolio Audit</div>
                                <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest">PGA / NFL / NBA Intel</div>
                            </div>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col items-center lg:items-end gap-6 shrink-0">
                            <button 
                                onClick={handleToggle}
                                disabled={loading}
                                className={`
                                    relative w-full lg:w-64 px-10 py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all duration-300
                                    ${optIn 
                                        ? 'bg-[#DFFF00] text-black shadow-[0_15px_40px_rgba(223,255,0,0.3)]' 
                                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-white'
                                    }
                                    ${loading ? 'opacity-50 scale-95 cursor-wait' : 'hover:scale-105 active:scale-95'}
                                `}
                            >
                                {loading ? 'UPDATING...' : optIn ? 'OPTED IN' : 'OPT IN'}
                            </button>
                            
                            {optIn && (
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[9px] font-mono text-zinc-600 uppercase text-center lg:text-right max-w-[200px]"
                                >
                                    Transmission sent to your registered credit terminal email.
                                </motion.p>
                            )}
                        </div>
                    </div>

                    {msg && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-10 p-5 rounded-2xl flex items-center gap-4 border shadow-2xl ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                        >
                            {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <span className="text-xs font-black uppercase tracking-wider">{msg.text}</span>
                        </motion.div>
                    )}
                </div>

                {/* NOTIFICATIONS PLACEHOLDER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-40 grayscale group">
                    <div className="bg-zinc-900/30 border-2 border-zinc-800 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center">
                        <BellRing size={40} className="text-zinc-700 mb-4" />
                        <h4 className="text-sm font-black uppercase text-zinc-500 tracking-widest mb-2">Real-time Node Alerts</h4>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">In Development //</p>
                    </div>
                    <div className="bg-zinc-900/30 border-2 border-zinc-800 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center">
                        <ShieldCheck size={40} className="text-zinc-700 mb-4" />
                        <h4 className="text-sm font-black uppercase text-zinc-500 tracking-widest mb-2">Login Security 2FA</h4>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">In Development //</p>
                    </div>
                </div>

            </div>
        </div>
    );
};
