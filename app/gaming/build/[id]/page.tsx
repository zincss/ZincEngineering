'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { ArrowLeft, Cpu, Shield, Flame, Skull, Zap, BoxSelect, Sword, Crosshair, Hexagon, MapPin, ShoppingCart, ExternalLink, Loader2, Image as ImageIcon, GraduationCap, Activity, CircleDashed, Layers, ChevronDown, Terminal, Target, FileText, AlertTriangle, CheckCircle2, XCircle, BarChart3, Gauge, RotateCcw, BookOpen, BrainCircuit, ScanLine, Info, Youtube, PlayCircle, Globe, Radio, MonitorPlay, Search } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const CDN_BASE = "https://cdn.warframestat.us/img/";

// --- HELPER: CLEAN WARFRAME MARKUP ---
const cleanDescription = (text: string) => {
  if (!text) return "";
  let clean = text.replace(/<[^>]+>/g, ''); 
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
};

// --- 1. STRATEGY DATABASE ---
const STRATEGY_DB: Record<string, { role: string; missions: string; tips: string[] }> = {
  'Saryn': { 
    role: "Bio-Nuke / Zone Control", 
    missions: "Sanctuary Onslaught, Defense", 
    tips: ["Spore spread is priority (Range > Strength).", "Toxic Lash ensures Spores burst on hit.", "Miasma stuns enemies and accelerates viral ticks."] 
  },
  'Revenant': { 
    role: "Immortal Tank", 
    missions: "Index, Archon Hunts, Steel Path", 
    tips: ["Mesmer Skin (2) makes you literally unkillable.", "Reave (3) one-shots enthralled enemies.", "Danse Macabre adapts to enemy weakness."] 
  },
};

// --- HELPER: SAFE STAT EXTRACTION ---
const getStat = (data: any, keys: string[]): number => {
    if (!data) return 0;
    for (const key of keys) {
        if (data[key] !== undefined && data[key] !== null) {
            return Number(data[key]);
        }
    }
    return 0;
};

// --- 2. DEEP ANALYSIS ENGINE ---
const analyzeCombatData = (item: any, apiData: any) => {
  const manual = STRATEGY_DB[item.name] || STRATEGY_DB[item.name.replace(' Prime', '')];
  const source = apiData || item || {};

  const intel = {
    role: manual ? manual.role : "Calculating...",
    missions: manual ? manual.missions : "General Purpose",
    strengths: [] as string[],
    weaknesses: [] as string[],
    tips: manual ? [...manual.tips] : [] as string[],
    synergy: [] as string[]
  };

  const armor = getStat(source, ['armor']);
  const shield = getStat(source, ['shield', 'shields']);
  const energy = getStat(source, ['power', 'energy']);
  const health = getStat(source, ['health']);
  
  const cc = getStat(source, ['criticalChance', 'crit_chance']);
  const sc = getStat(source, ['procChance', 'proc_chance', 'status_chance']);
  const fr = getStat(source, ['fireRate', 'fire_rate']);
  const reload = getStat(source, ['reloadTime', 'reload']);
  const mag = getStat(source, ['magazineSize', 'magazine']);

  if (item.category === 'Warframes') {
    if (!manual) {
        if (armor >= 350) intel.role = "Heavy Armor Tank";
        else if (shield >= 400) intel.role = "Shield Vanguard";
        else if (energy >= 200) intel.role = "Tactical Caster";
        else intel.role = "Versatile Skirmisher";
    }

    if (armor >= 300) intel.strengths.push(`High Armor (${armor})`);
    if (shield >= 350) intel.strengths.push(`High Shields (${shield})`);
    if (health >= 350) intel.strengths.push(`High Health Pool (${health})`);
    
    if (armor > 300) intel.tips.push("High Armor detected: 'Steel Fiber' + 'Adaptation' provides massive EHP.");
    if (shield > 400 && armor < 300) intel.tips.push("Shield Heavy: Consider 'Redirection' or Shield Gating strategies.");
    if (energy > 200) intel.tips.push("Deep Energy: 'Flow' or 'Quick Thinking' recommended.");
  } 
  else {
    if (!manual) {
        if (cc >= 0.25 && sc >= 0.25) intel.role = "Hybrid Hyper-Carry";
        else if (cc >= 0.25) intel.role = "Crit Precision";
        else if (sc >= 0.25) intel.role = "Status Primer/DPS";
        else intel.role = "Raw Damage / Crowd Control";
    }

    if (cc >= 0.20) intel.strengths.push(`Crit Viable (${(cc*100).toFixed(0)}%)`);
    if (sc >= 0.20) intel.strengths.push(`Status Potent (${(sc*100).toFixed(0)}%)`);
    
    if (reload > 2.5) {
        intel.weaknesses.push(`Slow Reload (${reload}s)`);
        intel.tips.push("DETECTED: Sluggish Reload. Modding for Reload Speed recommended.");
    }
    if (mag < 10 && !item.type?.includes('Bow') && !item.category?.includes('Melee')) {
        intel.weaknesses.push(`Small Mag (${mag})`);
    }

    if (cc >= 0.20) intel.tips.push("CRIT BUILD: Prioritize Crit Chance & Crit Damage mods.");
    if (sc >= 0.20) intel.tips.push("STATUS BUILD: Use 60/60 Elemental mods to boost Status.");
    if (fr > 12) intel.tips.push("AMMO WARNING: High fire rate. Ammo Mutation mod advised.");
  }

  if (intel.tips.length === 0) intel.tips.push("Standard configuration recommended.");
  return intel;
};

// --- NEW COMPONENT: WEAPON BALLISTICS (ENHANCED) ---
const WeaponBallistics = ({ apiData }: { apiData: any }) => {
  if (!apiData) return null;

  // 1. DATA DICTIONARIES
  const DAMAGE_TYPES: Record<string, string> = {
    '0': 'Impact', '1': 'Puncture', '2': 'Slash', '3': 'Heat', '4': 'Cold', 
    '5': 'Electricity', '6': 'Toxin', '7': 'Blast', '8': 'Radiation', 
    '9': 'Gas', '10': 'Magnetic', '11': 'Viral', '12': 'Corrosive', 
    '13': 'Void', '14': 'Tau',
    'impact': 'Impact', 'puncture': 'Puncture', 'slash': 'Slash',
    'heat': 'Heat', 'cold': 'Cold', 'electricity': 'Electricity', 'toxin': 'Toxin',
    'blast': 'Blast', 'radiation': 'Radiation', 'gas': 'Gas', 'magnetic': 'Magnetic', 
    'viral': 'Viral', 'corrosive': 'Corrosive', 'void': 'Void'
  };

  const STATUS_INTEL: Record<string, string> = {
    'Impact': 'Staggers enemies & opens Mercy Kills.',
    'Puncture': 'Reduces enemy damage output (Weakens).',
    'Slash': 'Bleed DoT bypasses armor (True Dmg).',
    'Heat': 'Strips 50% armor & deals fire DoT.',
    'Cold': 'Slows enemy movement & attack speed.',
    'Electricity': 'Chains lightning damage to nearby foes.',
    'Toxin': 'Bypasses Shields causing direct Health dmg.',
    'Blast': 'Reduces enemy accuracy.',
    'Corrosive': 'Permanently strips enemy armor.',
    'Gas': 'Creates lingering AoE toxin clouds.',
    'Magnetic': 'Disrupts Shields & prevents regen.',
    'Radiation': 'Confuses enemies to attack allies.',
    'Viral': 'Amplifies damage to Health (up to 325%).',
    'Void': 'Creates bullet attractor bubbles.',
  };

  // 2. EXTRACTION LOGIC
  const damageSource = apiData.damagePerShot || apiData.totalDamage || {};
  
  let entries = Object.entries(damageSource)
    .filter(([key, val]) => typeof val === 'number' && val > 0 && key !== 'total')
    .map(([key, val]) => {
        const lookupKey = key.toLowerCase();
        const label = DAMAGE_TYPES[lookupKey] || key.charAt(0).toUpperCase() + key.slice(1);
        return [label, val] as [string, number];
    });

  entries = entries.sort(([, a], [, b]) => b - a);
  const totalDamage = entries.reduce((acc, [, val]) => acc + val, 0);

  // 3. DPS CALCULATION
  const fireRate = apiData.fireRate || 1;
  const reload = apiData.reloadTime || 1;
  const mag = apiData.magazineSize || 1;
  
  const burstDPS = totalDamage * fireRate;
  const sustainedDPS = (totalDamage * mag) / ((mag / fireRate) + reload);

  return (
    <div className="bg-white p-6 flex flex-col h-full border-t-2 md:border-t-0 md:border-l-0 lg:border-t-2 lg:border-l-0 border-black min-h-[300px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-zinc-100">
            <div className="flex items-center gap-2">
                 <Crosshair size={14} className="text-black"/> 
                 <span className="text-xs font-black tracking-widest uppercase">COMBAT PERFORMANCE</span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-zinc-100 text-zinc-500 px-2 py-1">RAW OUTPUT</span>
        </div>

        {/* DPS METRICS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-50 border border-zinc-200 p-3">
                <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">BURST DPS</span>
                <span className="block text-xl font-black text-black">{burstDPS.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="bg-black border border-black p-3 text-white">
                <span className="block text-[9px] font-black text-acid uppercase tracking-widest mb-1">SUSTAINED DPS</span>
                <span className="block text-xl font-black text-white">{sustainedDPS.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
        </div>
        
        {/* SPLIT VIEW: BREAKDOWN & INTEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            
            {/* Left: Visual Bars */}
            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-100 pb-1 mb-2">DAMAGE COMPOSITION</span>
                {entries.length > 0 ? (
                    entries.map(([type, value]) => {
                        const percent = totalDamage > 0 ? (value / totalDamage) * 100 : 0;
                        return (
                            <div key={type} className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="font-bold text-[10px] uppercase text-black">{type}</span>
                                    <span className="font-mono text-[9px] text-zinc-500">{value.toFixed(1)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-zinc-800 group-hover:bg-acid transition-all duration-500" 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-[10px] text-zinc-400 italic">No damage data.</div>
                )}
            </div>

            {/* Right: Status Intel */}
            <div className="bg-zinc-50 p-3 border border-zinc-100 text-[10px] leading-relaxed font-mono">
                 <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-200 pb-1 mb-2 flex items-center gap-1"><Info size={10}/> TACTICAL NOTES</span>
                 {entries.slice(0, 3).map(([type]) => (
                     STATUS_INTEL[type] ? (
                        <div key={type} className="mb-2 last:mb-0">
                            <span className="font-bold text-black uppercase">{type}:</span> <span className="text-zinc-600">{STATUS_INTEL[type]}</span>
                        </div>
                     ) : null
                 ))}
                 {entries.length === 0 && <span className="text-zinc-400 italic">Awaiting combat data...</span>}
            </div>
        </div>
        
        {/* Decorative Footer */}
        <div className="mt-6 pt-2 border-t border-zinc-100 flex justify-between items-center opacity-50">
           <div className="flex gap-1">
              {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 bg-black rounded-full"></div>)}
           </div>
           <span className="text-[8px] font-mono tracking-widest">VER.3.0.4</span>
        </div>
    </div>
  );
};

// --- SYSTEM DISCLAIMER ---
const SystemDisclaimer = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hasAck = localStorage.getItem('zinc_disclaimer_ack');
        if (!hasAck) {
            const timer = setTimeout(() => setShow(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAck = () => {
        localStorage.setItem('zinc_disclaimer_ack', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white border-4 border-black p-1 max-w-lg w-full mx-4 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative">
                <div className="absolute top-0 left-0 w-4 h-4 bg-black"></div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-black"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-black"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-black"></div>

                <div className="border-2 border-black bg-white p-6 md:p-8 flex flex-col items-center text-center">
                    <div className="mb-6 text-acid bg-black p-3 rounded-full">
                        <AlertTriangle size={32} />
                    </div>
                    
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">SYSTEM NOTICE // BETA PROTOCOL</h2>
                    
                    <div className="space-y-4 font-mono text-xs md:text-sm text-zinc-600 mb-8 leading-relaxed">
                        <p>
                            <span className="font-bold text-black">SMART MOD SYSTEM:</span> The build generation engine utilized on this terminal is currently in active <span className="bg-acid px-1 text-black font-bold">BETA</span> development. Tactical recommendations are algorithmically generated and may contain inefficiencies. Operator discretion is advised.
                        </p>
                        <hr className="border-zinc-200" />
                        <p>
                            <span className="font-bold text-black">PASSION PROJECT:</span> This database is an independent engineering effort created by fans, for fans.
                        </p>
                        <p className="text-[10px] text-zinc-400">
                            LEGAL: We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with Digital Extremes Ltd. Warframe and all associated logos are trademarks of Digital Extremes.
                        </p>
                    </div>

                    <button 
                        onClick={handleAck}
                        className="w-full bg-black text-white hover:bg-acid hover:text-black uppercase font-black tracking-widest py-4 text-sm transition-all border-2 border-transparent hover:border-black hover:shadow-lg flex items-center justify-center gap-2 group"
                    >
                        <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform"/>
                        ACKNOWLEDGE PROTOCOL
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- TECH SPECS VISUALIZER ---
const TechSpecs = ({ item, apiData }: { item: any, apiData: any }) => {
    const source = apiData || item || {};
    const isWarframe = item.category === 'Warframes';
    const isMelee = item.category === 'Melee' || item.category === 'Melee Weapons';

    const armor = getStat(source, ['armor']);
    const shield = getStat(source, ['shield', 'shields']);
    const health = getStat(source, ['health']);
    const energy = getStat(source, ['power', 'energy']);
    const sprint = getStat(source, ['sprintSpeed', 'sprint']);
    
    const cc = getStat(source, ['criticalChance', 'crit_chance']);
    const cm = getStat(source, ['criticalMultiplier', 'crit_mult']);
    const sc = getStat(source, ['procChance', 'proc_chance', 'status_chance']);
    const fr = getStat(source, ['fireRate', 'fire_rate', 'attack_speed']);
    const mag = getStat(source, ['magazineSize', 'magazine']);
    const reload = getStat(source, ['reloadTime', 'reload']);

    const StatRow = ({ label, value, max = 100 }: { label: string, value: any, max?: number }) => (
        <div className="flex flex-col gap-1 mb-2">
            <div className="flex justify-between items-end">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">{label}</span>
                <span className="text-[10px] font-mono font-bold text-black">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-200">
                <div 
                    className="h-full bg-black transition-all duration-1000" 
                    style={{ width: typeof value === 'number' ? `${Math.min((value / max) * 100, 100)}%` : typeof value === 'string' && value.includes('%') ? value : '0%' }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="h-full">
            {isWarframe ? (
                <>
                    <StatRow label="Armor" value={armor} max={500} />
                    <StatRow label="Shields" value={shield} max={450} />
                    <StatRow label="Health" value={health} max={450} />
                    <StatRow label="Energy" value={energy} max={300} />
                    <StatRow label="Sprint" value={sprint.toFixed(2)} max={1.5} />
                </>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <StatRow label="Crit Chance" value={`${(cc * 100).toFixed(0)}%`} max={100} />
                        <StatRow label="Crit Multi" value={`${cm.toFixed(1)}x`} max={5} />
                        <StatRow label="Status" value={`${(sc * 100).toFixed(0)}%`} max={100} />
                    </div>
                    <div>
                        <StatRow label={isMelee ? "Atk Speed" : "Fire Rate"} value={fr.toFixed(2)} max={15} />
                        {!isMelee && <StatRow label="Magazine" value={mag} max={100} />}
                        {!isMelee && <StatRow label="Reload" value={`${reload.toFixed(1)}s`} max={4} />}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- NEW COMPONENT: COMMUNITY UPLINK ---
const CommunityUplink = ({ item }: { item: any }) => {
    
    // SMART SEARCH: Forces YouTube to prioritize "Guide" and "2025" content
    const smartQuery = encodeURIComponent(`Warframe ${item.name} Build Guide 2025 Steel Path`);
    const ytLink = `https://www.youtube.com/results?search_query=${smartQuery}`;
    
    // ROBUST OVERFRAME: Uses Google Search to find the exact Overframe page
    // This bypasses Overframe's internal search which can fail on specific naming.
    const overframeLink = `https://www.google.com/search?q=site:overframe.gg+${encodeURIComponent(item.name)}+Builds`;

    // Image Thumbnail for "Video Player" feel
    const thumbUrl = `${CDN_BASE}${item.image_name}`;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="bg-black text-acid px-4 py-3 flex items-center justify-between mb-0 border-2 border-black border-b-0">
                <span className="font-mono font-bold text-[10px] uppercase flex items-center gap-2">
                    <Globe size={14}/> COMMUNITY UPLINK ESTABLISHED
                </span>
                <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-acid animate-pulse"></span>
                    <span className="w-2 h-2 rounded-full bg-acid animate-pulse delay-75"></span>
                    <span className="w-2 h-2 rounded-full bg-acid animate-pulse delay-150"></span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                
                {/* COL 1: VIDEO TERMINAL (The "Choice") */}
                <div className="md:col-span-2 border-b-2 md:border-b-0 md:border-r-2 border-black p-6 bg-zinc-900 relative overflow-hidden group">
                    {/* Background Image (Blurred) */}
                    <div className="absolute inset-0 opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700">
                        <img src={thumbUrl} className="w-full h-full object-cover"/>
                    </div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.4))]"></div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-red-600 text-white px-2 py-1">
                                <Youtube size={12}/> LIVE FEED
                            </div>
                            <span className="font-mono text-[10px] text-zinc-500">SRC: YOUTUBE.COM</span>
                        </div>

                        <div className="flex flex-col items-center text-center gap-4">
                            <a 
                                href={ytLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="transform transition-transform duration-300 group-hover:scale-110"
                            >
                                <PlayCircle size={64} className="text-white fill-black/50"/>
                            </a>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase leading-none mb-2">
                                    WATCH TACTICAL GUIDE
                                </h3>
                                <p className="text-zinc-400 text-xs font-mono">
                                    Auto-selecting top rated community build for {item.name}.
                                </p>
                            </div>
                        </div>

                        {/* Fake Progress Bar */}
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-4">
                            <div className="h-full bg-red-600 w-2/3"></div>
                        </div>
                    </div>
                </div>

                {/* COL 2: DATABASE LINKS */}
                <div className="bg-zinc-50 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-black mb-2">
                        <BrainCircuit size={16}/>
                        <span className="font-black text-xs uppercase tracking-widest">EXTERNAL ARCHIVES</span>
                    </div>

                    {/* Overframe Button */}
                    <a 
                        href={overframeLink}
                        target="_blank" 
                        rel="noreferrer"
                        className="group flex-1 border-2 border-black bg-white p-4 hover:bg-acid transition-all relative overflow-hidden flex flex-col justify-center"
                    >
                        <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Globe size={40}/>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-black">DATABASE</span>
                        <span className="text-xl font-black uppercase leading-none group-hover:translate-x-1 transition-transform">OVERFRAME.GG</span>
                    </a>

                    {/* Wiki Button */}
                    <a 
                        href={`https://warframe.fandom.com/wiki/${item.name.replace(/ /g, '_')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="group flex-1 border-2 border-black bg-zinc-900 text-white p-4 hover:bg-black transition-all relative overflow-hidden flex flex-col justify-center"
                    >
                        <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen size={40}/>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">WIKI</span>
                        <span className="text-xl font-black uppercase leading-none group-hover:translate-x-1 transition-transform">OFFICIAL DATA</span>
                    </a>
                </div>
            </div>

            <div className="mt-3 text-center flex justify-center items-center gap-2 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                <Radio size={12} className="animate-pulse text-red-500"/>
                <span>WARNING: YOU ARE LEAVING THE SECURE NETWORK. EXTERNAL DATA NOT VERIFIED.</span>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: ACQUISITION DATA (UPDATED) ---
const AcquisitionIntel = ({ item, apiData }: { item: any, apiData: any }) => {
    if (!apiData) return null;

    let source = "Classified / Wiki Check Required";
    const name = item.name || "";

    // 1. HARDCODED SPECIAL CASES (API often misses these)
    if (name.includes('Prime')) {
        source = "Void Relics / Trading";
    } else if (name.includes('Tenet')) {
        // Tenet Melee (Glast) vs Tenet Guns (Sisters)
        source = item.category === 'Melee' ? "Ergo Glast (Relays) - Holokeys" : "Sisters of Parvos (Lich System)";
    } else if (name.includes('Kuva')) {
        source = "Kuva Liches (Lich System)";
    } else if (name.includes('Wraith') || name.includes('Vandal')) {
        source = "Invasions / Baro Ki'Teer / ESO";
    } else {
        // 2. DYNAMIC DISCOVERY (Drops & Components)
        const locs = new Set<string>();

        // Check main item drops
        if (apiData.drops && apiData.drops.length > 0) {
            apiData.drops.forEach((d: any) => locs.add(d.location));
        }

        // Check component drops (CRITICAL for Warframes!)
        if (apiData.components && apiData.components.length > 0) {
            apiData.components.forEach((comp: any) => {
                if (comp.drops) {
                    comp.drops.forEach((d: any) => locs.add(d.location));
                }
            });
        }

        if (locs.size > 0) {
            // Filter out "garbage" locations if necessary, but usually top 3 are fine.
            source = Array.from(locs).slice(0, 3).join(", ");
            if (locs.size > 3) source += " (+ more)";
        } else {
            // 3. FALLBACKS based on metadata
            if (apiData.description?.toLowerCase().includes('dojo')) {
                source = "Clan Dojo Research";
            } else if (apiData.buildPrice || apiData.price) {
                source = "Market (Credits/Platinum) / Dojo";
            }
        }
    }

    return (
        <div className="mt-4 border-2 border-black bg-zinc-100 p-3 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <MapPin size={10} /> ACQUISITION SIGNAL
            </div>
            <div className="font-mono text-xs font-bold text-black leading-tight uppercase break-words">
                {source}
            </div>
        </div>
    );
};

// --- 6. MAIN PAGE ---
export default function BuildPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullApiData, setFullApiData] = useState<any>(null);
  const [intel, setIntel] = useState<any>(null);
  const [showBuild, setShowBuild] = useState(false);
  const buildGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchItem = async () => {
      const { data } = await supabase.from('items').select('*').eq('id', id).single();
      setItem(data);
      setLoading(false);
      
      if (data) {
        try {
          const res = await fetch(`https://api.warframestat.us/items/search/${data.name.toLowerCase()}`);
          const apiRes = await res.json();
          let match = apiRes.find((d: any) => d.name === data.name);
          if (!match && data.name.includes('Prime')) {
             const baseName = data.name.replace(' Prime', '');
             match = apiRes.find((d: any) => d.name === baseName);
          }
          match = match || apiRes[0];
          setFullApiData(match);
          setIntel(analyzeCombatData(data, match));
        } catch(e) { console.error(e); }
      }
    };
    fetchItem();
  }, [id]);

  const handleInitiateBuild = () => {
    setShowBuild(true);
    setTimeout(() => buildGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  if (loading) return <div className="text-black font-mono p-12">SYSTEM PROCESSING...</div>;
  if (!item) return <div className="text-black font-mono p-12">ERROR: ITEM_NOT_FOUND</div>;

  const isPrime = item.name.includes('Prime');

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-40 px-4 md:px-0">
      
      <SystemDisclaimer />

      {/* --- BREADCRUMB --- */}
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black hover:bg-acid px-3 py-1 mb-6 group transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-transparent hover:border-black"><ArrowLeft size={16} /> RETURN TO INDEX</Link>

      {/* --- TACTICAL BRIEFING (GRID LAYOUT) --- */}
      <div className="bg-white border-2 border-black shadow-lg mb-12 relative overflow-hidden">
        
        {/* TOP BAR */}
        <div className="bg-black text-acid text-[10px] font-mono font-bold px-4 py-2 uppercase flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b-2 border-zinc-800">
           <div className="flex items-center gap-2"><Terminal size={12} /> TACTICAL BRIEFING // {item.name}</div>
           <div className="flex gap-4 text-zinc-400">
             <span className="flex items-center gap-1"><GraduationCap size={12}/> MR {item.stats.mastery || 0}</span>
             <span className="text-zinc-600">|</span>
             <span className="flex items-center gap-1"><ScanLine size={12}/> ID: {item.id}</span>
           </div>
        </div>

        {/* --- MAIN BENTO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-black">
          
          {/* COL 1: IMAGE & IDENTITY (Spans 4/12 columns on desktop) */}
          <div className="lg:col-span-4 bg-zinc-50 p-6 flex flex-col gap-6 border-b-2 lg:border-b-0 lg:border-r-2 border-black relative">
              
              {/* Header Info */}
              <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold font-mono uppercase">{item.category}</span>
                     {isPrime && <span className="text-black text-[9px] font-bold uppercase bg-acid px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">PRIME</span>}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase leading-[0.9] break-words">{item.name}</h1>
              </div>

              {/* Image Container */}
              <div className="aspect-square border-2 border-black bg-white relative flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
                 {/* Blueprint Grid Background */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                 <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:10px_10px] opacity-50"></div>
                 
                 {/* Weapon Image */}
                 <img 
                    src={`${CDN_BASE}${item.image_name}`} 
                    alt={item.name} 
                    className="relative z-10 w-[80%] h-[80%] object-contain mix-blend-multiply group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500 ease-out" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                 />
                 
                 {/* Decorative Corners */}
                 <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-black"></div>
                 <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-black"></div>
              </div>

              {/* ACQUISITION INTEL (Updated Location) */}
              <AcquisitionIntel item={item} apiData={fullApiData} />

              {/* Tech Specs Block */}
              <div className="flex-1 mt-6">
                 <div className="flex items-center gap-2 mb-3 pb-1 border-b-2 border-black">
                    <BarChart3 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">TECHNICAL SPECS</span>
                 </div>
                 <TechSpecs item={item} apiData={fullApiData} />
              </div>
          </div>

          {/* COL 2: INTEL & ABILITIES (Spans 8/12 columns on desktop) */}
          <div className="lg:col-span-8 grid grid-rows-[auto_1fr] border-l-2 border-black">
              
              {/* ROW 1: ASSESSMENT LOG (Fixed Height) */}
              <div className="bg-zinc-900 text-zinc-300 p-6 border-b-2 border-black flex flex-col h-[320px]">
                  <div className="flex items-center gap-2 text-acid mb-4 pb-2 border-b border-zinc-800">
                    <Activity size={14} />
                    <span className="font-bold tracking-widest font-mono text-xs">ZINC ENGINEERING LOG</span>
                  </div>
                  
                  <div className="flex-1 font-mono text-[11px] space-y-4 overflow-y-auto custom-scrollbar pr-2">
                     {intel ? (
                      <>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-950 p-3 border border-zinc-800">
                                <span className="text-acid font-bold block mb-1 text-[9px] uppercase tracking-wider">COMBAT ROLE</span>
                                <span className="text-white uppercase font-bold text-sm">{intel.role}</span>
                            </div>
                            <div className="bg-zinc-950 p-3 border border-zinc-800">
                                <span className="text-acid font-bold block mb-1 text-[9px] uppercase tracking-wider">OPTIMAL MISSION</span>
                                <span className="text-zinc-400">{intel.missions}</span>
                            </div>
                         </div>
                         
                         <div className="space-y-2 pt-2">
                             <span className="text-zinc-500 font-bold block text-[9px] uppercase tracking-wider">ANALYSIS OUTPUT:</span>
                             <ul className="space-y-2">
                                {intel.strengths?.map((s:string, i:number) => (
                                    <li key={i} className="flex gap-2 text-green-400 bg-green-900/10 p-1.5 border-l-2 border-green-500">
                                        <CheckCircle2 size={12} className="mt-0.5 shrink-0"/>{s}
                                    </li>
                                ))}
                                {intel.weaknesses?.map((w:string, i:number) => (
                                    <li key={i} className="flex gap-2 text-red-300 bg-red-900/10 p-1.5 border-l-2 border-red-500">
                                        <XCircle size={12} className="mt-0.5 shrink-0"/>{w}
                                    </li>
                                ))}
                             </ul>
                         </div>

                         <div className="bg-zinc-800/50 p-3 border border-zinc-700">
                            <span className="text-acid font-bold block mb-2 flex items-center gap-2"><BrainCircuit size={12}/> TACTICAL TIPS:</span>
                            <ul className="list-none space-y-2">
                                {intel.tips?.map((tip: string, i: number) => (
                                    <li key={i} className="flex gap-2 text-zinc-300 leading-relaxed">
                                        <span className="text-acid">›</span>{tip}
                                    </li>
                                ))}
                            </ul>
                         </div>
                      </>
                     ) : <div className="flex items-center gap-2 text-acid animate-pulse"><Loader2 size={14} className="animate-spin"/> <span>RUNNING_DIAGNOSTICS...</span></div>}
                  </div>
              </div>

              {/* ROW 2: CONDITIONAL CONTENT (Abilities OR Ballistics) */}
              {fullApiData?.abilities ? (
                // --- WARFRAME LAYOUT: ABILITIES ---
                <div className="bg-white p-6 flex flex-col h-full min-h-[300px]">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-zinc-100">
                        <div className="flex items-center gap-2">
                             <Zap size={14} className="text-black"/> 
                             <span className="text-xs font-black tracking-widest uppercase">ABILITY SCHEMATICS</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-zinc-100 px-2 py-1 text-zinc-500">SCROLL TO VIEW</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
                        {fullApiData.abilities.slice(0,4).map((ability: any, i: number) => ( 
                          <div key={i} className="group relative border-2 border-zinc-100 bg-white p-4 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                              <div className="flex justify-between items-start mb-2">
                                  <span className="font-black text-sm uppercase pr-2">{ability.name}</span>
                                  <span className="font-mono text-[9px] text-zinc-400 group-hover:text-acid font-bold bg-zinc-50 group-hover:bg-black px-1.5 py-0.5 border border-zinc-200 group-hover:border-black transition-colors">KEY.{i+1}</span>
                              </div>
                              <div className="text-zinc-600 text-[10px] leading-relaxed font-mono">
                                  {cleanDescription(ability.description)}
                              </div>
                          </div> 
                        ))}
                    </div>
                </div>
              ) : (
                // --- WEAPON LAYOUT: BALLISTICS ---
                <WeaponBallistics apiData={fullApiData} />
              )}

          </div>
        </div>
      </div>
      
      {!showBuild && ( 
          <div className="flex justify-center mb-20 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
              <button onClick={handleInitiateBuild} className="group relative bg-black text-white px-8 md:px-12 py-6 font-black uppercase text-xl md:text-2xl tracking-widest border-4 border-black hover:bg-acid hover:text-black transition-all hover:shadow-lg hover:-translate-y-1 active:translate-y-0 w-full md:w-auto">
                  <span className="flex items-center justify-center gap-4">
                      INITIATE BUILD SEQUENCE 
                      <ChevronDown className="group-hover:translate-y-1 transition-transform animate-bounce"/>
                  </span>
              </button>
          </div> 
      )}

      {/* --- COMMUNITY BUILD UPLINK (Replaces Old Mod Grid) --- */}
      <div ref={buildGridRef} className={`transition-all duration-700 scroll-mt-32 ${showBuild ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none h-0 overflow-hidden'}`}>
         <CommunityUplink item={item} />
      </div>
    </div>
  );
}