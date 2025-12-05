import React from 'react';
import { ArrowLeft, Brain, Hash } from 'lucide-react';
import BackButton from '../../components/BackButton';
import TriviaGame from './components/TriviaGame';

export const metadata = {
  title: 'Trivia Protocol // Zinc',
  description: 'Randomized knowledge assessment generator.',
};

export default function TriviaPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#DFFF00] selection:text-black">
      
      {/* GLOBAL BACK BUTTON */}
      <BackButton href="/collections" label="ARCHIVES" />

      {/* F1-STYLE HEADER */}
      <div className="pt-32 pb-8 px-6 max-w-[1600px] mx-auto border-b border-zinc-800 mb-12 relative">
        
        {/* DECORATIVE ELEMENTS */}
        <div className="absolute top-0 right-0 p-6 opacity-20">
            <Brain size={120} strokeWidth={0.5} />
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-[10px] font-black tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
                <span className="bg-[#DFFF00]/10 border border-[#DFFF00]/20 px-2 py-1 rounded">SYS.TRIVIA.V1</span>
                <span className="text-zinc-600">/</span>
                <span>GENERATOR_READY</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-2">
                Trivia <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-800 text-stroke-white">Matrix</span>
            </h1>
            
            <div className="flex items-center gap-6 text-zinc-400 font-mono text-xs uppercase tracking-widest max-w-2xl">
                <p>
                    <Hash size={12} className="inline mr-1 text-[#DFFF00]" />
                    Procedural Generation
                </p>
                <p>
                    <Brain size={12} className="inline mr-1 text-[#DFFF00]" />
                    Multi-Category Support
                </p>
            </div>
        </div>
      </div>

      {/* GAME CONTAINER */}
      <div className="max-w-[1600px] mx-auto px-6 pb-20">
        <TriviaGame />
      </div>
    </div>
  );
}