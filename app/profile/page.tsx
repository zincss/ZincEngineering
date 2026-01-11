'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { ProfileHeader } from './components/ProfileHeader';
import { PortfolioView } from './components/PortfolioView';
import { WalletView } from './components/WalletView';
import InventoryView from './components/InventoryView'; 
import { MaterialsView } from './components/MaterialsView';
import { BaseCampView } from './components/BaseCampView';
import { PreferencesView } from './components/PreferencesView';
import { 
  Package, LineChart, Wallet, Hammer, Tent, X, Trophy, Settings,
  ChevronRight, Shield, Activity, Fingerprint, Command, Gem
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'PORTFOLIO' | 'WALLET' | 'MATERIALS' | 'PREFERENCES'>('INVENTORY');
  const [showBaseCamp, setShowBaseCamp] = useState(false);
  const [inventoryCount, setInventoryCount] = useState(0);

  const TABS = [
    { id: 'INVENTORY', label: 'Vault', icon: Package, description: 'Digital Assets' },
    { id: 'PORTFOLIO', label: 'Stocks', icon: LineChart, description: 'Market Holdings' },
    { id: 'WALLET', label: 'Wallet', icon: Wallet, description: 'Credit Registry' },
    { id: 'MATERIALS', label: 'Parts', icon: Hammer, description: 'Salvaged Components' },
    { id: 'PREFERENCES', label: 'Setup', icon: Settings, description: 'Node Configuration' },
  ];

  useEffect(() => {
    if (user) {
        const fetchCount = async () => {
            const supabase = createClient();
            const { count } = await supabase.from('user_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
            setInventoryCount(count || 0);
        };
        fetchCount();
    }
  }, [user]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center font-mono text-[#DFFF00]">
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-[#DFFF00] border-t-transparent rounded-full mb-4" 
        />
        <div className="tracking-[0.3em] uppercase animate-pulse">Establishing Secure Uplink...</div>
    </div>
  );

  if (!user) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono">
        <Shield size={48} className="mb-4 opacity-20" />
        <div className="tracking-widest uppercase">Access Denied // Unauthorized Node</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col lg:flex-row overflow-hidden selection:bg-[#DFFF00] selection:text-black">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[#DFFF00]/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* --- MOBILE NAVIGATION (TOP) --- */}
      <div className="lg:hidden sticky top-0 z-[40] bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#DFFF00] rounded flex items-center justify-center text-black">
                      <Gem size={16} />
                  </div>
                  <span className="font-black text-lg italic tracking-tighter uppercase">Operator<span className="text-[#DFFF00]">Node</span></span>
              </div>
              <button 
                onClick={() => setShowBaseCamp(true)}
                className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-orange-500"
              >
                  <Tent size={18} />
              </button>
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
              {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${isActive ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800'}`}
                      >
                          {tab.label}
                      </button>
                  );
              })}
          </div>
      </div>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex w-[320px] bg-zinc-950 border-r border-zinc-800 flex-col z-20 relative shrink-0">
          {/* Header Identity */}
          <div className="p-8 pt-28 pb-8 border-b border-zinc-800">
              <div className="flex flex-col items-start gap-6">
                  <div className="relative group">
                      <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center overflow-hidden group-hover:border-[#DFFF00] transition-colors duration-500 shadow-2xl rotate-3 group-hover:rotate-0 transform transition-transform">
                          <Fingerprint size={48} className="text-zinc-700 group-hover:text-[#DFFF00] transition-colors" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#DFFF00] rounded-lg flex items-center justify-center text-black shadow-lg">
                          <Shield size={16} />
                      </div>
                  </div>
                  
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Operator // ID</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none mb-4 truncate w-[240px]">
                          {profile?.username || 'GUEST_USER'}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                          <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-400">LVL 1</div>
                          <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-400">ZONE_09</div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Navigation Grid */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
              {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            w-full group flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden
                            ${isActive ? 'bg-[#DFFF00] text-black shadow-[0_10px_20px_rgba(223,255,0,0.15)]' : 'hover:bg-zinc-900 text-zinc-500'}
                        `}
                      >
                          <tab.icon size={20} className={`${isActive ? 'text-black' : 'group-hover:text-white transition-colors'}`} />
                          <div className="flex flex-col items-start leading-none">
                              <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                              <span className={`text-[9px] font-mono mt-1 ${isActive ? 'text-black/60' : 'text-zinc-600'}`}>{tab.description}</span>
                          </div>
                          {isActive && <motion.div layoutId="active-nav" className="absolute right-4"><ChevronRight size={16} /></motion.div>}
                      </button>
                  );
              })}
          </nav>

          {/* Base Camp Quick Access */}
          <div className="p-4 border-t border-zinc-800 mt-auto">
              <button 
                onClick={() => setShowBaseCamp(true)}
                className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-[#DFFF00] transition-colors"
              >
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-black rounded-lg text-orange-500 group-hover:scale-110 transition-transform">
                          <Tent size={18} />
                      </div>
                      <div className="text-left">
                          <div className="text-[10px] font-black uppercase text-white leading-none">Base Camp</div>
                          <div className="text-[8px] font-mono text-zinc-500 uppercase mt-1 tracking-tighter">Enter Social Quarters</div>
                      </div>
                  </div>
                  <Activity size={14} className="text-zinc-700 group-hover:text-orange-500 transition-colors" />
              </button>
          </div>
      </aside>

      {/* --- MAIN VIEWPORT --- */}
      <main className="flex-1 overflow-y-auto scrollbar-hide relative z-10">
          
          {/* Top Integrated Header (Shared) */}
          <div className="sticky top-0 lg:top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-[#DFFF00]">
                      <Command size={18} />
                  </div>
                  <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] italic text-zinc-400">
                      Sector <span className="text-white">Profile</span> // {activeTab}
                  </h2>
              </div>
              
              <div className="flex items-center gap-4 md:gap-6">
                  <div className="hidden md:flex flex-col items-end">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Vault_Volume</span>
                      <span className="text-lg font-black text-white leading-none">{inventoryCount} <span className="text-[10px] text-zinc-600 font-mono">U</span></span>
                  </div>
                  <div className="h-8 w-px bg-zinc-800 hidden md:block" />
                  <div className="flex flex-col items-end">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Network_Credits</span>
                      <span className="text-base md:text-lg font-black text-[#DFFF00] leading-none">{profile?.credits?.toLocaleString() || 0} <span className="text-[9px] text-[#DFFF00]/40 font-mono italic">CR</span></span>
                  </div>
              </div>
          </div>

          {/* Content Wrapper */}
          <div className="p-6 md:p-12 max-w-[1400px] mx-auto min-h-[calc(100vh-80px)]">
              <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                      {activeTab === 'INVENTORY' && <InventoryView user={user} />}
                      {activeTab === 'PORTFOLIO' && <PortfolioView userId={user.id} />}
                      {activeTab === 'WALLET' && <WalletView profile={profile} onRefresh={refreshProfile} />}
                      {activeTab === 'MATERIALS' && <MaterialsView materials={[]} />}
                      {activeTab === 'PREFERENCES' && <PreferencesView profile={profile} />}
                  </motion.div>
              </AnimatePresence>
          </div>

      </main>

      {/* BASE CAMP OVERLAY */}
      <AnimatePresence>
          {showBaseCamp && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col"
              >
                  {/* MODAL HEADER */}
                  <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-950/50">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                            <Tent size={24} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black uppercase text-white tracking-tight italic leading-none">Base Camp</h2>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Personal Quarters // Zone Registry</p>
                          </div>
                      </div>
                      <button onClick={() => setShowBaseCamp(false)} className="p-3 bg-zinc-900 rounded-full hover:bg-white hover:text-black transition-all border border-zinc-800">
                          <X size={20} />
                      </button>
                  </div>
                  
                  {/* MODAL CONTENT */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(223,255,0,0.03)_0%,transparent_70%)] pointer-events-none" />
                      <div className="max-w-7xl mx-auto relative z-10">
                        <BaseCampView materials={[]} onTrade={() => {}} />
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
}