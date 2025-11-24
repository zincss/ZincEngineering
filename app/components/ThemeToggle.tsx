'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Zap } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="flex flex-col items-end gap-1">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400">VISUAL SENSORS</span>
        <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative w-16 h-8 border-2 border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 flex items-center transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_#ffffff]"
        >
            <div className={`absolute left-1 top-1 bottom-1 w-6 bg-black dark:bg-acid transition-all duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}`}>
                {theme === 'dark' ? <Moon size={12} className="text-black"/> : <Sun size={12} className="text-white"/>}
            </div>
            
            {/* Background Icons */}
            <div className="flex justify-between w-full px-2 opacity-20">
                <Sun size={10} className="text-black dark:text-white" />
                <Moon size={10} className="text-black dark:text-white" />
            </div>
        </button>
    </div>
  );
}