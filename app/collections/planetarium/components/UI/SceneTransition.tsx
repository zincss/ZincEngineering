'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SceneTransition({ active, text = "Initializing Link" }: { active: boolean, text?: string }) {
    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[200] bg-[#050505] origin-center flex items-center justify-center overflow-hidden pointer-events-none"
                >
                    {/* Background Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(223,255,0,0.2)_0%,transparent_70%)]" />
                    
                    {/* Scanning Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-20 opacity-20 pointer-events-none">
                        {[...Array(10)].map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, ease: "linear", delay: i * 0.5 }}
                                className="h-[1px] w-full bg-[#DFFF00]"
                            />
                        ))}
                    </div>

                    {/* Central Elements */}
                    <div className="flex flex-col items-center gap-6 z-10">
                        <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="w-64 h-[1px] bg-gradient-to-r from-transparent via-[#DFFF00] to-transparent" 
                        />
                        
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.9, letterSpacing: "0.5em" }}
                            animate={{ opacity: 1, scale: 1, letterSpacing: "1.2em" }}
                            transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                            className="text-[11px] font-mono text-[#DFFF00] uppercase font-black pl-[1.2em] drop-shadow-[0_0_10px_rgba(223,255,0,0.5)]"
                        >
                            {text}
                        </motion.span>

                        <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="w-64 h-[1px] bg-gradient-to-r from-transparent via-[#DFFF00] to-transparent" 
                        />
                    </div>

                    {/* Corner Brackets */}
                    <div className="absolute inset-10 border border-white/5 pointer-events-none">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#DFFF00]/40" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#DFFF00]/40" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#DFFF00]/40" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#DFFF00]/40" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
