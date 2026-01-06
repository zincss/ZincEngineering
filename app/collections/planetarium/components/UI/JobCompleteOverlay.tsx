'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useSimulation } from '../../context';

export function JobCompleteOverlay({ onExit }: { onExit: () => void }) {
    const { lastCompletedJob, clearCompletedJob } = useSimulation();

    useEffect(() => {
        if (lastCompletedJob) {
            const timer = setTimeout(() => {
                clearCompletedJob();
                onExit();
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [lastCompletedJob, clearCompletedJob, onExit]);

    return (
        <AnimatePresence>
            {lastCompletedJob && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className="bg-black/80 backdrop-blur-xl border-y-2 border-[#DFFF00] w-full max-w-3xl py-12 px-8 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DFFF00]/10 to-transparent w-[200%] translate-x-[-50%] animate-[shine_3s_infinite_linear]" />

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-20 h-20 bg-[#DFFF00] rounded-full flex items-center justify-center mb-6 text-black shadow-[0_0_50px_rgba(223,255,0,0.5)]"
                        >
                            <CheckCircle size={40} strokeWidth={3} />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-2"
                        >
                            Contract <span className="text-[#DFFF00]">Fulfilled</span>
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-zinc-400 font-mono uppercase tracking-[0.2em] text-sm mb-8"
                        >
                            Payment Transferred Successfully
                        </motion.div>

                        <div className="grid grid-cols-2 gap-12 w-full max-w-lg">
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-right border-r border-white/20 pr-12"
                            >
                                <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Cargo Delivered</div>
                                <div className="text-white font-bold text-xl">{lastCompletedJob.cargo}</div>
                            </motion.div>
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="text-left"
                            >
                                <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Credit Reward</div>
                                <div className="text-[#DFFF00] font-black text-3xl flex items-center gap-1">
                                    + {lastCompletedJob.reward.toLocaleString()} <span className="text-sm">CR</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
