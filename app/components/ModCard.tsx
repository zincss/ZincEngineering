import React from 'react';
import { Zap, Shield, Sword, Hexagon } from 'lucide-react';

interface ModCardProps {
  name: string;
  cost: number;
  polarity: 'madurai' | 'vazarin' | 'naramon' | 'zenurik' | 'universal';
  rank: number;
  maxRank: number;
  stats: string;
  isPrime?: boolean;
}

const ModCard: React.FC<ModCardProps> = ({
  name,
  cost,
  polarity,
  rank,
  maxRank,
  stats,
  isPrime = false,
}) => {

  const getPolarityDetails = (pol: string) => {
    switch (pol) {
      case 'madurai': return { color: 'text-red-400', icon: <Sword size={14} /> };
      case 'vazarin': return { color: 'text-blue-400', icon: <Shield size={14} /> };
      case 'naramon': return { color: 'text-green-400', icon: <Zap size={14} /> };
      default: return { color: 'text-orokin-400', icon: <Hexagon size={14} /> };
    }
  };

  const polDetails = getPolarityDetails(polarity);

  return (
    <div className={`
      relative w-48 h-64 rounded-2xl p-4 flex flex-col justify-between
      transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl
      border border-white/5
      ${isPrime 
        ? 'bg-gradient-to-b from-orokin-800 to-orokin-900 ring-1 ring-orokin-gold/30' 
        : 'bg-orokin-800/60 backdrop-blur-md'}
    `}>
      <div className="flex justify-between items-center mb-2">
        <div className={`flex items-center gap-1 ${polDetails.color} bg-white/5 px-2 py-1 rounded-full`}>
           {polDetails.icon}
           <span className="text-xs font-bold tracking-wider">{cost}</span>
        </div>
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col h-full justify-center text-center">
        <h3 className={`text-lg font-bold mb-2 tracking-tight ${isPrime ? 'text-orokin-gold' : 'text-white'}`}>
          {name.toUpperCase()}
        </h3>
        <p className="text-orokin-400 text-sm font-medium leading-relaxed">
          {stats}
        </p>
      </div>

      {/* Footer: Ranks */}
      <div className="flex justify-center gap-1 mt-4">
        {Array.from({ length: maxRank + 1 }).map((_, i) => (
          <div 
            key={i}
            className={`
              h-1.5 w-1.5 rounded-full 
              ${i <= rank 
                ? (isPrime ? 'bg-orokin-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]') 
                : 'bg-orokin-700'}
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default ModCard;