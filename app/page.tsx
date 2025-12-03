import GlobalTicker from './components/GlobalTicker';
import PersonalLogs from './components/PersonalLogs';
import Link from 'next/link';
import { ArrowRight, Trophy, BookOpen, Database } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black pb-20">
      
      {/* HERO SECTION */}
      <section className="relative h-[50vh] min-h-[500px] flex items-center overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 z-0">
           {/* GRADIENT OVERLAY (Keeps text readable) */}
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10" />
           
           {/* VIDEO BACKGROUND */}
           <video 
             autoPlay 
             loop 
             muted 
             playsInline
             poster="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop"
             className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
           >
             <source src="/rocket.mp4" type="video/mp4" />
           </video>
        </div>
        
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-6">
          
          {/* BADGE MOVED TO RIGHT SIDE */}
          <div className="absolute top-0 right-4 md:right-6 animate-in fade-in slide-in-from-right-4 duration-1000">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-full text-[10px] font-mono text-[#DFFF00] tracking-widest uppercase">
                <span className="w-2 h-2 bg-[#DFFF00] rounded-full animate-pulse" />
                System Operational v2.4
             </div>
          </div>

          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
              Zinc <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-800 text-stroke-white">Engineering</span>
            </h1>
            
            <p className="max-w-xl text-zinc-400 font-mono text-sm md:text-base leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <span className="text-[#DFFF00] mr-2">///</span>
              Advanced analytics and data archiving for high-performance athletics and digital entertainment protocols.
            </p>
          </div>
        </div>
      </section>

      <GlobalTicker />

      {/* QUICK ACCESS MODULES */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/sports" className="group relative h-64 md:h-80 overflow-hidden border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-all duration-500">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex items-center justify-between mb-2">
                <Trophy size={32} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors" />
                <ArrowRight size={24} className="text-zinc-500 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
              </div>
              <h2 className="text-3xl font-black uppercase text-white mb-2">Sports Archive</h2>
              <p className="text-zinc-500 font-mono text-xs max-w-sm group-hover:text-zinc-400 transition-colors">
                NBA, NRL, F1 & Golf metrics. Real-time tracking and historical data analysis.
              </p>
            </div>
          </Link>

          <Link href="/collections" className="group relative h-64 md:h-80 overflow-hidden border border-zinc-800 bg-zinc-900/20 hover:border-[#DFFF00] transition-all duration-500">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-10 grayscale transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex items-center justify-between mb-2">
                <BookOpen size={32} className="text-zinc-500 group-hover:text-[#DFFF00] transition-colors" />
                <ArrowRight size={24} className="text-zinc-500 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
              </div>
              <h2 className="text-3xl font-black uppercase text-white mb-2">Collections/Codex</h2>
              <p className="text-zinc-500 font-mono text-xs max-w-sm group-hover:text-zinc-400 transition-colors">
                Digital archives, item catalogs, and comprehensive knowledge bases for entertainment protocols.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* PERSONAL LOGS SECTION */}
      <PersonalLogs />

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-zinc-800 text-center mt-12">
        <div className="flex items-center justify-center gap-2 text-zinc-600 font-mono text-[10px] uppercase tracking-widest mb-4">
           <Database size={12} />
           <span>Secure Connection Est. 2024</span>
        </div>
        <p className="text-zinc-800 font-black text-sm uppercase">Zinc Engineering © 2025</p>
      </footer>
    </main>
  );
}