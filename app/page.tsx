import GlobalTicker from './components/GlobalTicker';
import PersonalLogs from './components/PersonalLogs';
import Link from 'next/link';
import { 
  ArrowRight, Trophy, Database, Gamepad2, Package, 
  Activity, Zap, CloudHail, Crown, Terminal 
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20 relative overflow-x-hidden">
      
      {/* BACKGROUND: Deep Space (Starfield) */}
      <div className="bg-starfield" />

      {/* --- HERO SECTION: SCALED BRANDING --- */}
      <section className="relative h-[85vh] flex flex-col items-center justify-center border-b border-zinc-800/50 overflow-hidden">
        
        {/* CINEMATIC BACKGROUND */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30 z-10" />
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/80 to-zinc-950 z-10" />
           <video 
             autoPlay loop muted playsInline
             poster="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop"
             className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-overlay"
           >
             <source src="/rocket.mp4" type="video/mp4" />
           </video>
        </div>
        
        <div className="relative z-20 w-full max-w-[1800px] mx-auto px-6 flex flex-col items-center text-center">
          
          {/* STATUS PILL */}
          <div className="mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
             <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl rounded-full shadow-2xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DFFF00]"></span>
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-300 tracking-[0.2em] uppercase">
                  System Online v2.6
                </span>
             </div>
          </div>

          {/* MASSIVE BRANDING (HEADER LOGO SCALED UP) */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 animate-in fade-in zoom-in-95 duration-1000 delay-100 select-none">
             
             {/* THE "Z" BOX */}
             <div className="bg-[#DFFF00] w-32 h-32 md:w-48 md:h-48 flex items-center justify-center font-black text-[80px] md:text-[120px] text-black shadow-[0_0_60px_rgba(223,255,0,0.2)] rounded-lg md:rounded-xl">
                Z
             </div>

             {/* THE TEXT STACK */}
             <div className="flex flex-col items-center md:items-start justify-center">
                <span className="font-black text-6xl md:text-9xl leading-none text-white tracking-tighter">
                   ZINC
                </span>
                <span className="font-mono text-lg md:text-2xl text-zinc-500 tracking-[0.35em] uppercase mt-2 md:mt-4">
                   Engineering
                </span>
             </div>

          </div>
          
          {/* SUBTITLE */}
          <div className="mt-16 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
             <p className="text-zinc-400 font-mono text-sm md:text-base leading-relaxed">
               <span className="text-[#DFFF00] font-black mr-2">///</span>
               Advanced telemetry, digital archives, and high-performance tactical modules.
             </p>
          </div>

        </div>

        {/* SCROLL INDICATOR (Fixed Centering) */}
        <div className="absolute bottom-8 md:bottom-12 left-0 w-full flex flex-col items-center justify-center gap-2 animate-bounce opacity-50 z-30 pointer-events-none">
           <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Access Modules</span>
           <ArrowRight className="rotate-90 text-zinc-500" size={16} />
        </div>
      </section>

      <GlobalTicker />

      {/* --- CONTROL CENTER (SQUARE ROUNDED MODULES) --- */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-20">
        
        {/* SECTION HEADER: MODULES */}
        <div className="flex items-center gap-4 mb-10 px-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-md">
                 <Activity size={16} className="text-[#DFFF00]" />
                 <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Command Center</span>
            </div>
            <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* THE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr mb-24">
          
          {/* 1. BLACK MARKET (Wide Featured) */}
          <Link href="/play/market" className="group md:col-span-8 relative min-h-[320px] rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614726365723-49cfae9f0294?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-20 grayscale transition-all duration-700 group-hover:scale-105" />
             <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
             
             {/* Floating Icon */}
             <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 group-hover:border-[#DFFF00] transition-colors">
                <Package className="text-[#DFFF00]" size={24} />
             </div>

             <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#DFFF00] text-black text-[10px] font-black uppercase tracking-widest">
                     New Arrival
                  </span>
                  <span className="text-zinc-500 font-mono text-xs font-bold uppercase tracking-widest">Economy Update</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-4 italic tracking-tight">Black Market</h2>
                <p className="text-zinc-400 font-mono text-sm md:text-base leading-relaxed max-w-xl group-hover:text-zinc-200 transition-colors">
                   Acquire serialized assets, trade commodities, and manage your inventory in the new secure exchange protocol.
                </p>
             </div>
          </Link>

          {/* 2. ARCADE (Tall Square) */}
          <Link href="/play" className="group md:col-span-4 md:row-span-2 relative min-h-[320px] rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
            
            <div className="absolute top-8 right-8">
               <ArrowRight size={24} className="text-zinc-600 -rotate-45 group-hover:text-[#DFFF00] group-hover:rotate-0 transition-all duration-500" />
            </div>

            <div className="absolute bottom-0 left-0 p-10 w-full">
               <Gamepad2 size={48} className="text-zinc-700 group-hover:text-[#DFFF00] mb-6 transition-colors duration-500" />
               <h2 className="text-4xl font-black uppercase text-white mb-2">Arcade</h2>
               <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6 group-hover:text-zinc-300 transition-colors">
                 Simulations &<br/>Games
               </p>
               
               <div className="space-y-2">
                  {['Blackjack', 'Trivia', 'Stock Market'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-mono text-zinc-400 border-l-2 border-zinc-800 pl-3 group-hover:border-[#DFFF00] transition-colors" style={{ transitionDelay: `${i * 100}ms`}}>
                       {item}
                    </div>
                  ))}
               </div>
            </div>
          </Link>

          {/* 3. SPORTS (Square Rounded) */}
          <Link href="/sports" className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504285514631-152cb5ee488d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-zinc-950/30" />
            
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
               <Trophy size={32} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
               <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Live Data</span>
               </div>
            </div>
            
            <div className="absolute bottom-0 left-0 p-8 w-full">
               <h2 className="text-3xl font-black uppercase text-white mb-2 leading-none">Sports<br/>Archive</h2>
               <p className="text-zinc-500 font-mono text-xs mt-2 group-hover:text-white transition-colors">
                  F1 Telemetry, NBA Stats & Golf Tracking.
               </p>
            </div>
          </Link>

          {/* 4. WEATHER & COLLECTIONS (Square Rounded) */}
          <Link href="/collections" className="group md:col-span-4 relative h-80 rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-[#DFFF00]/50 transition-all duration-500">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 to-transparent" />
            
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
               <Database size={32} className="text-zinc-600 group-hover:text-[#DFFF00] transition-colors" />
               <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">V2.0</span>
               </div>
            </div>

            <div className="absolute bottom-0 left-0 p-8 w-full">
               <h2 className="text-3xl font-black uppercase text-white mb-2 leading-none">Global<br/>Collections</h2>
               <div className="flex items-center gap-4 mt-4">
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-500 uppercase group-hover:text-[#DFFF00] transition-colors">
                     <CloudHail size={12} /> Weather
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-500 uppercase group-hover:text-[#DFFF00] transition-colors">
                     <Crown size={12} /> Warframe
                  </span>
               </div>
            </div>
          </Link>

        </div>

        {/* SECTION HEADER: PERSONAL LOGS */}
        <div className="flex items-center gap-4 mb-10 px-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-md">
                 <Terminal size={16} className="text-[#DFFF00]" />
                 <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">System Logs</span>
            </div>
            <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* PERSONAL LOGS COMPONENT */}
        <div className="mb-12">
           <PersonalLogs />
        </div>

      </section>

      {/* FOOTER AREA */}
      <footer className="relative z-10 py-12 px-6 text-center border-t border-zinc-800/50">
        <div className="inline-flex items-center gap-2 text-zinc-700 font-mono text-[10px] uppercase tracking-widest mb-4">
           <Zap size={12} className="fill-zinc-800" />
           <span>Secure Connection Est. 2024</span>
        </div>
        <p className="text-zinc-800 font-black text-sm uppercase">Zinc Engineering © 2025</p>
      </footer>
    </main>
  );
}