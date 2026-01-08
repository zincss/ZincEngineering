'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { X, CloudRain, Activity, Globe, Info, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- RAIN VIEWER DATA ENGINE ---
const RadarLayer = ({ opacity = 0.8 }: { opacity?: number }) => {
    const [layerData, setLayerData] = useState<{ path: string; time: number } | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
                const data = await res.json();
                if (data.radar && data.radar.past) {
                    const latest = data.radar.past[data.radar.past.length - 1];
                    setLayerData({ path: data.host + latest.path, time: latest.time });
                }
            } catch (e) {
                console.error(`Radar fetch failed`, e);
            }
        };
        fetchData();
        timerRef.current = setInterval(fetchData, 300000); 
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    if (!layerData) return null;

    return (
        <TileLayer
            url={`${layerData.path}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={opacity}
            zIndex={200}
        />
    );
};

// --- ATMOSPHERIC MONTAGE (Lively Overlays) ---
const AtmosphericOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-[500] overflow-hidden opacity-30">
        {/* Drifting Clouds on Map */}
        {[...Array(5)].map((_, i) => (
            <div 
                key={i}
                className="absolute bg-white/20 rounded-full blur-[60px] animate-cloud"
                style={{
                    width: `${300 + i * 100}px`,
                    height: `${150 + i * 50}px`,
                    top: `${Math.random() * 80}%`,
                    left: '-20%',
                    animationDuration: `${40 + i * 10}s`,
                    animationDelay: `${i * -5}s`,
                }}
            />
        ))}
        {/* Soft Solar Glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/[0.05] blur-[100px] rounded-full animate-pulse-slow" />
    </div>
);

interface LiveMapProps {
    isOpen: boolean;
    onClose: () => void;
    initialPos?: [number, number];
}

export default function WeatherLiveMap({ isOpen, onClose, initialPos = [20, 0] }: LiveMapProps) {
    const [isRadarActive, setIsRadarActive] = useState(true);

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 md:p-8"
        >
            <motion.div 
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative w-full h-full max-w-7xl bg-[#050505] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col"
            >
                
                {/* CLEAN HEADER */}
                <div className="absolute top-0 left-0 right-0 z-[1100] p-6 md:p-10 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                    <div className="pointer-events-auto">
                        <div className="flex items-center gap-3 text-white/40 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
                            <Globe size={14} />
                            <span>Global Network</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">
                            Live <span className="text-zinc-800">Visualizer</span>
                        </h2>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="pointer-events-auto p-4 bg-white/5 hover:bg-white border border-white/10 text-white hover:text-black rounded-full transition-all group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                </div>

                {/* MINIMALIST MODE SELECTOR */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1100] bg-white/5 backdrop-blur-3xl border border-white/10 p-1.5 rounded-full shadow-2xl flex gap-1">
                    <button 
                        onClick={() => setIsRadarActive(true)}
                        className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isRadarActive ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <CloudRain size={14} /> Storm Radar
                    </button>
                    <button 
                        onClick={() => setIsRadarActive(false)}
                        className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!isRadarActive ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <Globe size={14} /> Standard View
                    </button>
                </div>

                {/* MAP CONTAINER */}
                <div className="flex-1 relative">
                    <MapContainer 
                        center={initialPos} 
                        zoom={4} 
                        style={{ height: '100%', width: '100%', background: '#020204' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; CARTO'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <AnimatePresence>
                            {isRadarActive && <RadarLayer opacity={0.8} />}
                        </AnimatePresence>
                    </MapContainer>

                    {/* atmospheric montage */}
                    <AtmosphericOverlay />

                    {/* BREADCRUMB / LOCATION INFO */}
                    <div className="absolute top-28 left-6 md:top-32 md:left-10 z-[1100] pointer-events-none">
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-4 md:p-6 rounded-[2rem] shadow-2xl flex flex-col gap-1 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin size={12} className="text-zinc-500" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Focus</span>
                            </div>
                            <span className="text-sm font-bold text-zinc-400 tabular-nums">
                                {initialPos[0].toFixed(4)}N, {initialPos[1].toFixed(4)}E
                            </span>
                        </div>
                    </div>
                </div>

                {/* VIGNETTE EFFECT */}
                <div className="absolute inset-0 pointer-events-none z-[1200] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
            </motion.div>
        </motion.div>
    );
}
